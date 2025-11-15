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
- Если запрос связан с подбором стрижек, укладок или образом (например: "что посоветуешь?", "какая стрижка мне подойдёт?", "покажи стрижки"), СНАЧАЛА вызови инструмент "get_available_services".
- Если запрос про бритьё, бороду, усы или не связан с волосами на голове — ссылку НЕ добавляй.
- После получения списка используй инструмент "recommend_services", чтобы порекомендовать до 3 услуг и сформировать ответ.
- Даже при простом "привет" или "спасибо" используй "recommend_services" с пустым списком и дружелюбным сообщением.
- Твой финальный ответ ВСЕГДА возвращается ТОЛЬКО через инструмент "recommend_services".
- Никогда не отвечай напрямую и не пиши ничего вне инструментов.

Особое правило:
→ Если тема — стрижки, укладки, подбор образа, то ОБЯЗАТЕЛЬНО включи в сообщение HTML-ссылку: <a href="/ai">подобрать идеальную стрижку</a>.
→ Вставляй её естественно, как часть фразы, например: "Попробуй <a href='/ai'>подобрать идеальную стрижку</a>!"

Формат финального ответа строго следующий:

{{
  "services": [101, 205],
  "message": "Привлекательный текст с возможной HTML-ссылкой"
}}

Помни:
— Максимум 3 услуги.
— Только числовые ID из реальных услуг.
— Если ничего не подходит — "services": [].
— Сообщение < 200 символов, живое и дружелюбное.
— На приветствие отвечай тепло.

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