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

export const useRedis = getRedisClient;