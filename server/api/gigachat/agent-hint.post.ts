import { GigaChatChatModel } from "../../utils/gigachatLLM";
import { getGigaToken } from "../../utils/gigachatAccessToken";
import { useRedis } from "../../utils/redis";
import { BaseMessage } from "@langchain/core/messages";
import type { MessageContent } from "@langchain/core/messages";
import { Message } from "~/utils/message";

// Максимальное количество сообщений в истории (20 пар вопрос-ответ)
const MAX_HISTORY_LENGTH = 40;

// Функция для генерации "личности" агента на основе данных о компании
function createSystemPrompt(company: any): string {
  const services = company.services
    .map((s: any) => `- ${s.name} (${s.price})`)
    .join("\n");

  return `Ты — вежливый и полезный ИИ-ассистент компании "${company.name}".
Твоя задача — консультировать клиентов, помогать с выбором услуг. Ты не можешь никого никуда записать - только подсказать, какие услуги релевантны.
Никогда не выдумывай услуги, цены или акции. Используй только информацию ниже.

ИНФОРМАЦИЯ О КОМПАНИИ:
- Название: ${company.name}
- Адрес: ${company.address}
- Часы работы: ${company.workingHours}
- Специальные предложения: ${company.specialOffers}

НАШИ УСЛУГИ:
${services}

Всегда отвечай дружелюбно и по делу, основываясь на этой информации. Только об услугах говори.`;
}

// Определяем типы для удобства
type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export default defineEventHandler(async (event) => {
  //1. Изменяем входящие параметры
  const { companyId, userId } = await readBody<{
    companyId: string;
    userId: string;
  }>(event);

  //console.log(companyId, userId);
  if (!companyId || !userId) {
    throw createError({
      statusCode: 400,
      message: "companyId, userId, и message обязательны",
    });
  }

  const redis = await useRedis();
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

  // 3. Собираем полный контекст для LLM
  const systemPrompt = createSystemPrompt(companyData);
  const chatHistory: ChatMessage[] = chatHistoryStrings.map((msg) => {
    const message = JSON.parse(msg) as IMessage;
    return { role: message.role, content: message.content } as ChatMessage;
  });

  const systemPromptTemplate = `
    Всегда генерируй 3 коротких и полезных вопроса-подсказки, которые пользователь мог бы задать следующими.

    Твой ответ ДОЛЖЕН БЫТЬ в формате JSON. Не пиши ничего, кроме JSON.

    Структура JSON должна быть следующей:
    {
    "suggestions": [
        "здесь первая подсказка",
        "здесь вторая подсказка",
        "здесь третья подсказка"
    ]
    }

    История диалога у тебя есть
  `;
  const promptMessage: ChatMessage = {
    role: "user",
    content: systemPromptTemplate,
  };
  console.log(chatHistory);
  const messagesForLlm: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...chatHistory,
    promptMessage,
  ];
  // 4. Вызываем GigaChat (ваша логика остается почти такой же)
  const accessToken = await getGigaToken();
  const llm = new GigaChatChatModel({
    apiKey: accessToken,
    modelName: "GigaChat-Pro",
    temperature: 0.3,
  });

  const result = await llm.invoke(messagesForLlm as any); // as any для упрощения, т.к. llm ожидает BaseMessage
  let suggestions: string[] = [];

  try {
    // Пытаемся распарсить ответ как JSON
    const parsedResult = JSON.parse(result.content as string);
    suggestions = parsedResult.suggestions;
  } catch (e) {
    // Если нейросеть вернула не JSON, а простой текст (такое бывает),
    // мы используем его как основной ответ, а подсказки оставляем пустыми.
    console.warn(
      "GigaChat вернул не-JSON ответ. Используем как простой текст."
    );
  }
  console.log(suggestions);
  return { output: suggestions };
});
