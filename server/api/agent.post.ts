import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getModel } from "../utils/aiAgent";
import { useRedis } from "../utils/redis";
import { createBarberTools } from "../utils/barberTools";

const MAX_HISTORY_LENGTH = 100;

export default defineEventHandler(async (event) => {
  const { companyId, userId, message } = await readBody<{
    companyId: string;
    userId: string;
    message: string;
  }>(event);

  if (!companyId || !userId || !message) {
    throw createError({ statusCode: 400, message: "companyId, userId и message обязательны" });
  }

  const redis = await useRedis.getRedisClient();
  const companyKey = `company:${companyId}`;
  const chatKey = `chat:${companyId}:${userId}`;

  const [companyDataString, chatHistoryStrings] = await Promise.all([
    redis.get(companyKey),
    redis.lRange(chatKey, -MAX_HISTORY_LENGTH, -1),
  ]);

  if (!companyDataString) {
    throw createError({ statusCode: 404, message: `Компания не найдена` });
  }

  const companyData = JSON.parse(companyDataString);
  const chatHistory = chatHistoryStrings.map(msg => JSON.parse(msg));

  const tools = createBarberTools(companyData.services || []);

  const llm = await getModel();

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `Ты — умный и дружелюбный ассистент компании "${companyData.name}".
Твоя цель — помогать пользователю выбирать услуги компании и давать короткие привлекательные сообщения.

Инструкции:
1. Ты знаешь список доступных услуг компании, но не выводишь его. Ты МОЖЕШЬ ВЫБИРАТЬ ТОЛЬКО из существующих услуг — нельзя придумывать новые ID.
2. Если подходящей услуги нет — верни пустой список: "services": [].
3. В ответе ВСЕГДА должен быть корректный JSON (без Markdown, без пояснений, без текста вне JSON).
4. Формат ответа строго следующий:

{{
  "services": ["id_услуги_1", "id_услуги_2"],
  "message": "короткий привлекательный текст, который мотивирует пользователя обратить внимание на эти услуги"
}}

Помни:
— Никаких лишних полей и текста.
— Всегда возвращай только JSON.
— Если сомневаешься, просто верни пустой массив services.
— Общайся как живой человек, на приветствие всегда отвечай.

ВАЖНО: твой ответ должен быть в формате JSON.`],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);

  const agent = createToolCallingAgent({
    llm,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
  });

  const langchainHistory = chatHistory.map(msg => ({
    type: msg.role === "user" ? "human" : "ai",
    content: msg.content,
  }));

  let finalAnswer = { services: [], message: "Извините, не удалось обработать запрос." };

  try {
    const result = await agentExecutor.invoke({
      input: message,
      chat_history: langchainHistory,
    });

    try {
      finalAnswer = JSON.parse(result.output);
    } catch (e) {
      console.warn("Не удалось распарсить output как JSON:", result.output);
      finalAnswer = { services: [], message: result.output || "Не удалось сформировать ответ." };
    }
  } catch (error) {
    console.error("Ошибка агента:", error);
    throw createError({ statusCode: 500, message: "Ошибка агента" });
  }

  // Сохраняем в Redis
  const userMsg = { role: "user", content: message, author: userId, isIncoming: false };
  const aiMsg = { role: "assistant", content: finalAnswer.message, author: -1, isIncoming: true };

  await redis
    .multi()
    .rPush(chatKey, JSON.stringify(userMsg))
    .rPush(chatKey, JSON.stringify(aiMsg))
    .lTrim(chatKey, -MAX_HISTORY_LENGTH, -1)
    .exec();

  return { output: finalAnswer };
});