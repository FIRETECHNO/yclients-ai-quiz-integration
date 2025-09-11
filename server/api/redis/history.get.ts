import { GigaChatChatModel } from "../../utils/gigachatLLM";
import { getGigaToken } from "../../utils/gigachatAccessToken";
import { useRedis } from "../../utils/redis";
import { IMessage } from "~/types/message.interface.d";
import { Message } from "~/utils/message";

export default defineEventHandler(async (event): Promise<IMessage[]> => {
  const { companyId, userId } = getQuery(event);

  if (!companyId || !userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ошибка: ID компании и ID пользователя обязательны",
    });
  }
  const redis = await useRedis.getRedisClient();
  const redisKey = `chat:${companyId}:${userId}`;

  try {
    const messageStrings = (await redis.lRange(redisKey, 0, -1)) as string[];

    // Если в чате еще нет сообщений, Redis вернет пустой массив.
    // Сразу вернем его, чтобы не выполнять лишний код.
    if (!messageStrings || messageStrings.length === 0) {
      return [];
    }

    // --- ВОТ ИСПРАВЛЕНИЕ ---
    // Мы говорим TypeScript: "Я обещаю, что результат JSON.parse(msgString)
    // можно считать объектом типа IMessage".
    // Мы используем `as IMessage`
    const messages: IMessage[] = messageStrings
      .map((msgString) => {
        // Лучше парсить внутри блока try-catch на случай, если в Redis
        // окажется невалидный JSON. Это делает код более надежным.
        try {
          return JSON.parse(msgString) as IMessage;
        } catch (e) {
          console.error(
            `Не удалось распарсить сообщение из Redis: ${msgString}`,
            e
          );
          return null; // Возвращаем null, если JSON "битый"
        }
      })
      .filter(Boolean) as IMessage[]; // .filter(Boolean) убирает все null из массива
    // const result = messages.map((msg) => {
    //   return new Message(msg.stringContent,);
    // });
    const result: IMessage[] = messages.map((msg) => {
      return new Message(
        msg.role,
        msg.content,
        msg.payload,
        msg.isIncoming,
        msg.author,
        msg._id
      );
    });
    return result;
  } catch (error) {
    console.error(
      `[API /messages] Не удалось получить историю из Redis! Ключ: ${redisKey}`,
      error
    );

    throw createError({
      statusCode: 500,
      statusMessage: "Внутренняя ошибка сервера при чтении истории чата",
    });
  }
});
