import { useRedis } from "../../utils/redis";

// Максимальное количество сообщений в истории (20 пар вопрос-ответ)
const MAX_HISTORY_LENGTH = 100;
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
  const chatKey = `chat:${companyId}:${userId}`;


  await redis.rPush(chatKey, JSON.stringify(message))

  await redis.lTrim(chatKey, -MAX_HISTORY_LENGTH, -1);

  return { statusCode: 200, message: "Сообщение сохранено" }
});
