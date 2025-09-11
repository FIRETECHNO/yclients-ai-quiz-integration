import { useRedis } from "../../utils/redis";

// Максимальное количество сообщений в истории (20 пар вопрос-ответ)
const MAX_HISTORY_LENGTH = 40;
export default defineEventHandler(async (event) => {
  // 1. Изменяем входящие параметры
  const { companyId, userId, message } = await readBody<{
    companyId: string;
    userId: string;
    message: IMessage;
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
  // 5. Сохраняем новый диалог (вопрос и ответ) в Redis
  await Promise.all([
    redis.rPush(
      chatKey,
      JSON.stringify(
        message
        // new Message(
        //   userMessage.role,
        //   userMessage.content,
        //   {},
        //   false,
        //   Number(userId)
        // )
      )
    ),
    // redis.rPush(
    //   chatKey,
    //   JSON.stringify(
    //     new Message(
    //       aiResponse.role,
    //       aiResponse.content,
    //       { recommended_services: services },
    //       true,
    //       Number(userId)
    //     )
    //   )
    // ),
  ]);

  // 6. Обрезаем историю, если она стала слишком длинной
  await redis.lTrim(chatKey, -MAX_HISTORY_LENGTH, -1);
});
