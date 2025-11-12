// server/api/chat.post.ts
import { defineEventHandler, createError, readBody } from "h3";
import { useRedis } from "../../utils/redis";
import { BarbershopAgent } from "../../utils/agent/barbershopAgent";
import type { IMessage } from "~~/server/types/IMessage.interface";
import type { IFinalAnswer } from "~~/server/types/IFinalAnswer.interface";

const MAX_HISTORY_LENGTH = 50;
const agentCache = new Map<string, BarbershopAgent>();

export default defineEventHandler(async (event) => {
  const { companyId, userId, message } = await readBody<{
    companyId: string;
    userId: number;
    message: string;
  }>(event);

  if (!companyId || !userId || !message?.trim()) {
    throw createError({ statusCode: 400, message: "Неверные параметры" });
  }

  const redis = await useRedis.getRedisClient();
  const companyKey = `company:${companyId}`;
  const chatKey = `chat:${companyId}:${userId}`;

  // === Загружаем компанию ===
  const companyDataString = await redis.get(companyKey);
  if (!companyDataString) {
    throw createError({ statusCode: 404, message: "Компания не найдена" });
  }
  const companyData = JSON.parse(companyDataString);

  // === Инициализация агента (один раз) ===
  let agent = agentCache.get(companyId);
  if (!agent) {
    agent = new BarbershopAgent(companyData.name, companyData.services);
    await agent.init();
    agentCache.set(companyId, agent);
  }

  // === История ===
  const historyStrings = await redis.lRange(chatKey, -MAX_HISTORY_LENGTH, -1);
  const history = historyStrings.map(m => JSON.parse(m));

  // === Запрос к агенту ===
  let finalAnswer: IFinalAnswer = {
    services: [],
    message: "Извините, что-то пошло не так.",
  };

  try {
    const result = await agent.ask(message, history);
    console.log("ответ: ", result);
    const output = typeof result.output === "string" ? result.output : JSON.stringify(result.output);

    try {
      const parsed = JSON.parse(output);
      finalAnswer = Array.isArray(parsed)
        ? { services: parsed, message: "Вот что я нашёл:" }
        : parsed;
    } catch {
      finalAnswer.message = output;
    }
  } catch (err: any) {
    console.error("Agent error:", err);
    finalAnswer.message = "Технические неполадки.";
  }

  // === Сохраняем ===
  const userMsg: IMessage = { role: "user", content: message, author: userId, isIncoming: false, payload: null };
  const aiMsg: IMessage = {
    role: "assistant",
    content: finalAnswer.message,
    author: -1,
    isIncoming: true,
    payload: { services: finalAnswer.services },
  };


  await redis
    .multi()
    .rPush(chatKey, JSON.stringify(userMsg))
    .rPush(chatKey, JSON.stringify(aiMsg))
    .lTrim(chatKey, -MAX_HISTORY_LENGTH, -1)
    .expire(chatKey, 86400 * 7)
    .exec();

  return { output: finalAnswer };
});