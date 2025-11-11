import { ProxyAPIChatModel } from "../../utils/proxyapiLLM";
import { useRedis } from "../../utils/redis";

const MAX_HISTORY_LENGTH = 100;

export default defineEventHandler(async (event) => {
  const { companyId, userId, message } = await readBody<{
    companyId: string;
    userId: string;
    message: string;
  }>(event);

  if (!companyId || !userId || !message) {
    throw createError({
      statusCode: 400,
      message: "companyId, userId и message обязательны",
    });
  }

  const redis = await useRedis.getRedisClient();
  const companyKey = `company:${companyId}`;
  const chatKey = `chat:${companyId}:${userId}`;

  const [companyDataString, chatHistoryStrings] = await Promise.all([
    redis.get(companyKey),
    redis.lRange(chatKey, -MAX_HISTORY_LENGTH, -1),
  ]);

  if (!companyDataString) {
    throw createError({
      statusCode: 404,
      message: `Компания с ID "${companyId}" не найдена`,
    });
  }

  const companyData = JSON.parse(companyDataString);

  const chatHistory = chatHistoryStrings.map((msg) => {
    const parsed = JSON.parse(msg);
    return {
      role: parsed.role,
      content: parsed.content,
    };
  });

  const systemPrompt = `
Ты — умный и дружелюбный ассистент компании "${companyData.name}".
Твоя цель — помогать пользователю выбирать услуги компании и давать короткие привлекательные сообщения.

Вот список доступных услуг в JSON-формате:
${JSON.stringify(companyData.services, null, 2)}

Инструкции:
1. ТЫ МОЖЕШЬ ВЫБИРАТЬ ТОЛЬКО из этих услуг. Нельзя придумывать новые ID или брать значения, которых нет.
2. Если подходящей услуги нет — верни пустой список: "services": [].
3. В ответе ВСЕГДА должен быть корректный JSON (без Markdown, без пояснений, без текста вне JSON).
4. Формат ответа строго следующий:

{
  "services": ["id_услуги_1", "id_услуги_2"],
  "message": "короткий привлекательный текст, который мотивирует пользователя обратить внимание на эти услуги"
}
Помни:
— Никаких лишних полей и текста.
— Всегда возвращай только JSON.
— Если сомневаешься, просто верни пустой массив services.
`;

  const model = new ProxyAPIChatModel();
  let finalAnswer: any = {
    services: [],
    message: "Извините, не удалось получить ответ.",
  };

  try {
    const messagesForModel = [
      { role: "system", content: systemPrompt },
      ...chatHistory,
      { role: "user", content: message },
    ];

    const response = await model.invoke(messagesForModel);

    const raw =
      typeof response?.content === "string"
        ? response.content
        : JSON.stringify(response?.content);

    console.log("AI RAW:", raw);

    try {
      finalAnswer = JSON.parse(raw);
    } catch (e) {
      console.error("Ошибка парсинга JSON:", e);
      finalAnswer = {
        services: [],
        message: raw || "Не удалось распознать ответ модели.",
      };
    }
  } catch (error: any) {
    console.error("Ошибка AI запроса:", error);
    throw createError({
      statusCode: 500,
      message: "Ошибка при обращении к ProxyAPI модели",
    });
  }

  const userMessageToSave = {
    role: "user",
    content: message,
    author: userId,
    isIncoming: false,
  };

  const aiResponseToSave = {
    role: "assistant",
    author: -1,
    isIncoming: true,
    content: finalAnswer.message,
  };

  await redis
    .multi()
    .rPush(chatKey, JSON.stringify(userMessageToSave))
    .rPush(chatKey, JSON.stringify(aiResponseToSave))
    .lTrim(chatKey, -MAX_HISTORY_LENGTH, -1)
    .exec();

  return { output: finalAnswer };
});
