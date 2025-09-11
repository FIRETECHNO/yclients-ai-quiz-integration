import { GigaChatChatModel } from "../../utils/gigachatLLM";
import { getGigaToken } from "../../utils/gigachatAccessToken";
import { useRedis } from "../../utils/redis";

export default defineEventHandler(async (event): Promise<any> => {
  const { serviceId } = await readBody<{
    serviceId: string | number;
  }>(event);

  if (!serviceId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ошибка: ID сервиса обязательно",
    });
  }
  try {
    const result = await useRedis.getItemFromHashById("services", serviceId);
    return result;
  } catch (error) {
    console.error(`[API /messages] Не удалось получить сервис из redis`, error);

    throw createError({
      statusCode: 500,
      statusMessage: "Внутренняя ошибка сервера при чтении истории чата",
    });
  }
});
