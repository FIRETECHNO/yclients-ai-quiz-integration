import { GigaChatChatModel } from "../../utils/gigachatLLM";
import { getModel } from "../../utils/aiAgent";
import { getGigaToken } from "../../utils/gigachatAccessToken";
import { useRedis } from "../../utils/redis";
import { useServices } from "../../utils/services";
import array from "../../utils/seeds/services";
import { BaseMessage } from "@langchain/core/messages";
import type { AIMessageChunk, MessageContent } from "@langchain/core/messages";
import { Message } from "~/utils/message";

// Максимальное количество сообщений в истории (20 пар вопрос-ответ)
const MAX_HISTORY_LENGTH = 40;

// Функция для генерации "личности" агента на основе данных о компании
function createSystemPrompt(company: any): string {
  const { prompt } = useServices.extractData(array);

  return `Ты — вежливый и полезный ИИ-ассистент компании "${company.name}".
Твоя задача — консультировать клиентов, помогать с выбором услуг. Ты не можешь никого никуда записать — только подсказать, какие услуги релевантны.
Никогда не выдумывай услуги, цены или акции. Используй только информацию ниже.

ИНФОРМАЦИЯ О КОМПАНИИ:
- Название: ${company.name}
- Адрес: ${company.address}
- Часы работы: ${company.workingHours}
- Специальные предложения: ${company.specialOffers}

НАШИ УСЛУГИ:
${prompt}

ВАЖНО:
1. Отвечай **только в формате JSON**. Ни одного слова больше.
2. Формат JSON должен строго соответствовать следующей структуре:

{
  "services": [
    "сюда вставляются id услуг, которые подходят пользователю"
  ]
}

3. Если не можешь подобрать ни одной услуги, верни пустой массив:
{
  "services": []
}

4. Не добавляй приветствий, объяснений, смайликов или лишнего текста.
5. Если твой ответ не является корректным JSON — повтори его заново, только в формате JSON.`;
}


// Определяем типы для удобства
type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export default defineEventHandler(async (event) => {
  // 1. Изменяем входящие параметры
  const { companyId, userId } = await readBody<{
    companyId: string;
    userId: string;
  }>(event);

  if (!companyId || !userId) {
    throw createError({
      statusCode: 400,
      message: "companyId, userId, и message обязательны",
    });
  }

  const redis = await useRedis.getRedisClient();
  const companyKey = `company:${companyId}`;
  const chatKey = `chat:${companyId}:${userId}`;

  // 2. Получаем данные о компании и историю чата из Redis
  const [companyDataString, chatHistoryStrings] = await Promise.all([
    redis.get(companyKey),
    redis.lRange(chatKey, 0, -1),
  ]);

  if (!companyDataString) {
    throw createError({
      statusCode: 404,
      message: `Компания с ID "${companyId}" не найдена`,
    });
  }
  const countServices: number = 50;
  const companyData = JSON.parse(companyDataString);
  const userMessage: ChatMessage = {
    role: "user",
    content:
      "Выйдай несколько услуг для пользователя не больше " + countServices,
  };

  // 3. Собираем полный контекст для LLM
  const systemPrompt = createSystemPrompt(companyData);
  const chatHistory: ChatMessage[] = chatHistoryStrings.map((msg) => {
    const message = JSON.parse(msg) as IMessage;
    return { role: message.role, content: message.content } as ChatMessage;
  });
  //console.log(chatHistory);
  const messagesForLlm: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...chatHistory,
    userMessage,
  ];

  // 1️⃣ Логируем всё, что реально пойдёт в модель
  console.log("=== RAW MESSAGES SENT TO LLM ===");
  console.log(JSON.stringify(messagesForLlm, null, 2));

  // 2️⃣ Нормализуем формат сообщений (чтобы роли были правильными)
  function normalizeMessages(messages: any[]) {
    return messages.map((m) => {
      if (m._getType) return m; // уже LangChain message
      const role = (m.role || m.type || "").toLowerCase();
      const content = m.content ?? m.message ?? m.text ?? "";
      if (role === "system" || role === "assistant" || role === "user") {
        return { role, content };
      }
      return { role: "user", content };
    });
  }

  const normalizedMessages = normalizeMessages(messagesForLlm);

  console.log("=== NORMALIZED MESSAGES ===");
  console.log(JSON.stringify(normalizedMessages, null, 2));

  // 4. Вызываем GigaChat (ваша логика остается почти такой же)
  const llm = await getModel();
  // as any для упрощения, т.к. llm ожидает BaseMessage
  let result: AIMessageChunk | null = null;
  let resultContent = `{
  "services": [
    19946138,
    18947154,
    18951218
  ]
}`;
  try {
    //result = await llm.invoke(messagesForLlm as any);
  } catch (error) {
    if (error instanceof Error) {
      // Проверяем сообщение об ошибке
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized") ||
        error.message.includes("Token has expired")
      ) {
        console.log("Token has been updated");
        const token = await updateToken();
        llm.apiKey = token;
        result = await llm.invoke(messagesForLlm as any);
      } else {
        console.log(error.message);
      }
    } else if (typeof error === "object" && error !== null) {
      // Проверяем объект ошибки на наличие статуса
      if ("status" in error && error.status === 401) {
        console.log("Token has been updated");
        const token = await updateToken();
        llm.apiKey = token;
        result = await llm.invoke(messagesForLlm as any);
      } else {
        console.log(error);
      }
    }
  }
  if (result) resultContent = result!.content as string;
  else
    console.error(
      "Something went wrong with the AI's response (services request)"
    );
  let answer = "";
  let services: string[] = [];
  try {
    // Пытаемся распарсить ответ как JSON
    const parsedResult = JSON.parse(resultContent);
    answer = parsedResult.answer;
    console.log(parsedResult.services);
    services = parsedResult.services;
  } catch (e) {
    // Если нейросеть вернула не JSON, а простой текст (такое бывает),
    // мы используем его как основной ответ, а подсказки оставляем пустыми.
    console.warn(
      "GigaChat вернул не-JSON ответ. Используем как простой текст."
    );

    //Нужно нормально обработать
    answer = resultContent;
  }
  return { recommended_services: services };
});
