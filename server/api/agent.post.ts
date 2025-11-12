import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getModel } from "../utils/aiAgent";
import { useRedis } from "../utils/redis";
import { createBarberTools } from "../utils/barberTools";
import { ICompany } from "../types/ICompany.interface";

const MAX_HISTORY_LENGTH = 4;

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

  const companyData: ICompany = JSON.parse(companyDataString);
  const chatHistory = chatHistoryStrings.map(msg => JSON.parse(msg));

  const tools = createBarberTools(companyData.services || []);

  const llm = await getModel();

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `Ты — умный и дружелюбный ассистент компании "${companyData.name}".
Твоя цель — помогать пользователю выбирать услуги компании и давать короткие привлекательные сообщения.

ВАЖНО:
- Ты НЕ знаешь список услуг заранее. Никогда не выдумывай ID, названия или описания услуг.
- Если запрос связан с подбором услуг (например: "что есть?", "покажи стрижки", "есть ли бритьё бороды?"), СНАЧАЛА вызови инструмент "get_available_services", чтобы получить актуальный список.
- После этого используй инструмент "recommend_services", чтобы порекомендовать подходящие услуги и сформировать ответ.
- Если запрос НЕ связан с услугами (например: "спасибо", "привет", "пока", "адрес"), всё равно используй "recommend_services" с пустым списком услуг и дружелюбным сообщением.
- Твой финальный ответ ВСЕГДА должен возвращаться ТОЛЬКО через инструмент "recommend_services".
- Никогда не отвечай напрямую. Не пиши пояснений, мыслей или текста вне инструментов.

Формат финального ответа строго следующий:

{{
  "services": [101, 205],
  "message": "короткий привлекательный текст, который мотивирует пользователя"
}}

Помни:
— В массиве "services" должны быть только числовые ID из реальных услуг.
— Если ничего не подходит — верни "services": [].
— Сообщение должно быть живым, дружелюбным и не длиннее 200 символов.
— На приветствие всегда отвечай дружелюбно.
— Не выдавай больше 3 услуг

❗ВАЖНО: твой ответ должен быть в формате JSON.`],
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
    content: msg.content.length > 100 ? msg.content.slice(0, 100) : msg.content,
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
  const userMsg = { role: "user", content: message, author: userId, payload: null, isIncoming: false };
  const aiMsg = { role: "assistant", content: finalAnswer.message, payload: { services: finalAnswer.services }, author: -1, isIncoming: true };

  await redis
    .multi()
    .rPush(chatKey, JSON.stringify(userMsg))
    .rPush(chatKey, JSON.stringify(aiMsg))
    .lTrim(chatKey, -MAX_HISTORY_LENGTH, -1)
    .exec();

  return { output: finalAnswer };
});