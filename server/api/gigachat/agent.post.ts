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
  //const { prompt } = useServices.extractData(array);

  return `Ты — вежливый и полезный ИИ-ассистент компании "${company.name}".
Твоя задача — консультировать клиентов, помогать с выбором услуг. Ты не можешь никого никуда записать - только подсказать, какие услуги релевантны.
Никогда не выдумывай услуги, цены или акции. Используй только информацию ниже.

ИНФОРМАЦИЯ О КОМПАНИИ:
- Название: ${company.name}
- Адрес: ${company.address}
- Часы работы: ${company.workingHours}
- Специальные предложения: ${company.specialOffers}

Твой ответ ДОЛЖЕН БЫТЬ в формате JSON. Не пиши ничего, кроме JSON.

Структура JSON должна быть следующей:
{
  "answer" : "здесь ответ пользователю"
}`;
}

// Определяем типы для удобства
type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export default defineEventHandler(async (event) => {
  // 1. Изменяем входящие параметры
  const { companyId, userId, message } = await readBody<{
    companyId: string;
    userId: string;
    message: string;
  }>(event);

  if (!companyId || !userId || !message) {
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

  const companyData = JSON.parse(companyDataString);
  const userMessage: ChatMessage = { role: "user", content: message };

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

  // 4. Вызываем GigaChat (ваша логика остается почти такой же)
  const llm = await getModel();
  // as any для упрощения, т.к. llm ожидает BaseMessage
  let result: AIMessageChunk | null = null;
  let resultContent = `{
  "answer" : "здесь ответ пользователю"  
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
  else console.error("Something went wrong with the AI's response");

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
    answer = resultContent;
  }
  const aiResponse: ChatMessage = {
    role: "assistant",
    content: answer,
  };
  return { output: aiResponse.content };
});
