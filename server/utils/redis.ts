import { createClient } from "redis";

let redisClient: ReturnType<typeof createClient>;

async function getRedisClient() {
  if (!redisClient) {
    const client = createClient({
      url: process.env.REDIS_URL,
    });
    client.on("error", (err) => console.error("Redis Client Error", err));
    await client.connect();
    redisClient = client;
    console.log("Успешное подключение к Redis.");
  }
  return redisClient;
}
// server/utils/redisHelpers.ts

/**
 * Сохраняет массив объектов в Хэш Redis.
 * Каждый объект сохраняется под своим ID.
 * @param hashKey - Ключ хэша, например, 'services'
 * @param items - Массив объектов, у каждого должен быть `id`
 */
export const saveItemsToHash = async (hashKey: string, items: any[]) => {
  if (!items || items.length === 0) {
    console.log(`Массив для ключа '${hashKey}' пуст. Ничего не сохраняем.`);
    return;
  }
  const redis = await getRedisClient();
  console.log(`Сохраняем ${items.length} элементов в хэш '${hashKey}'...`);

  // Мы можем отправить команды в Redis пачкой для эффективности,
  // но для наглядности сделаем в цикле.
  for (const item of items) {
    // ID объекта будет полем в хэше.
    const field = item.id.toString();
    // Сам объект превращаем в JSON-строку.
    const value = JSON.stringify(item);

    // Команда HSET: "В хэше `hashKey` установи полю `field` значение `value`"

    await redis.hSet(hashKey, field, value);
  }

  console.log(`Сохранение в хэш '${hashKey}' завершено.`);
};

/**
 * Получает один объект по ID из Хэша Redis.
 * @param hashKey - Ключ хэша, например, 'services'
 * @param itemId - ID объекта, который нужно найти
 * @returns - Найденный объект или null, если не найден
 */
export const getItemFromHashById = async (
  hashKey: string,
  itemId: string | number
): Promise<any | null> => {
  console.log(`Ищем элемент с ID '${itemId}' в хэше '${hashKey}'...`);
  const redis = await getRedisClient();
  // Команда HGET: "Из хэша `hashKey` возьми значение поля `itemId`"
  const itemJson = await redis.hGet(hashKey, itemId.toString());

  if (!itemJson) {
    //console.log(`Элемент с ID '${itemId}' в хэше '${hashKey}' не найден.`);
    return null;
  }

  // Если нашли, это JSON-строка. Превращаем ее обратно в объект.
  // Оборачиваем в try-catch на случай, если в Redis "битый" JSON.
  try {
    const item = JSON.parse(itemJson as string);
    //console.log(`Элемент с ID '${itemId}' найден.`);
    return item;
  } catch (e) {
    console.error(
      `Ошибка парсинга JSON для элемента ID '${itemId}' из хэша '${hashKey}'`,
      e
    );
    return null;
  }
};
export const useRedis = {
  getRedisClient,
  getItemFromHashById,
  saveItemsToHash,
};
