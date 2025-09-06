import { GigaChatChatModel } from "../../utils/gigachatLLM";
import { getModel } from "../../utils/aiAgent";
import { getGigaToken } from "../../utils/gigachatAccessToken";
import { useRedis } from "../../utils/redis";
import { BaseMessage } from "@langchain/core/messages";
import type { AIMessageChunk, MessageContent } from "@langchain/core/messages";
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
${services}`;
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
  try {
    result = await llm.invoke(messagesForLlm as any);
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
  if (!result) console.error("Something went wrong with the AI's response");
  const resultContent = result!.content as string;
  // let answerText: string;
  // let suggestions: string[] = [];

  // try {
  //   // Пытаемся распарсить ответ как JSON
  //   const parsedResult = JSON.parse(resultContent);
  //   answerText = parsedResult.answer;
  //   suggestions = parsedResult.suggestions;
  // } catch (e) {
  //   // Если нейросеть вернула не JSON, а простой текст (такое бывает),
  //   // мы используем его как основной ответ, а подсказки оставляем пустыми.
  //   console.warn(
  //     "GigaChat вернул не-JSON ответ. Используем как простой текст."
  //   );
  //   answerText = resultContent.split("{")[0];
  // }
  const aiResponse: ChatMessage = {
    role: "assistant",
    content: resultContent,
  };
  // 5. Сохраняем новый диалог (вопрос и ответ) в Redis
  await Promise.all([
    redis.rPush(
      chatKey,
      JSON.stringify(
        new Message(
          userMessage.role,
          userMessage.content,
          {},
          false,
          Number(userId)
        )
      )
    ),
    redis.rPush(
      chatKey,
      JSON.stringify(
        new Message(
          aiResponse.role,
          aiResponse.content,
          {},
          true,
          Number(userId)
        )
      )
    ),
  ]);

  // 6. Обрезаем историю, если она стала слишком длинной
  await redis.lTrim(chatKey, -MAX_HISTORY_LENGTH, -1);

  return { output: aiResponse.content };
});
