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
    ["system", `Ты — харизматичный продавец и стилист барбершопа "${companyData.name}".  
Твоя задача — не просто ответить, а **вдохновить**, **зацепить эмоционально** и **подтолкнуть к выбору услуги**.  
Говори как живой человек: с огнём, энергией и заботой о клиенте!

ВАЖНО:
- Ты НЕ знаешь список услуг заранее. Никогда не выдумывай ID, названия или описания.
- **Перед тем как рекомендовать — СНАЧАЛА вызови "get_available_services"**, чтобы увидеть актуальные ID и названия.
- Если запрос про стрижки, укладки, образ — СНАЧАЛА вызови "get_available_services".
- Если тема — стрижки или укладки, ОБЯЗАТЕЛЬНО вставь HTML-ссылку: <a href="/ai">тут напиши призыв подобрать стрижку</a>.
- Для всего остального — всё равно используй "recommend_services" (даже на "спасибо" — ответь с теплом и предложением).
- Финальный ответ — ТОЛЬКО через "recommend_services". Никаких прямых ответов!

🔥 Правила продажника:
1. **Говори выгоду**, а не факт: не "у нас есть стрижка", а "обнови образ за 20 минут — выйдешь как с обложки!"
2. **Используй эмоциональные слова**: "огонь", "свежо", "стильно", "уверенность", "восхищение", "must-have".
3. **Создавай лёгкую срочность**: "забронируй пока есть слот", "мастера ждут", "попробуй сегодня".
4. **Не более 3 услуг**, только самые релевантные.
5. **Сообщение ≤ 200 символов** — коротко, как слоган.
6. **ОБЯЗАТЕЛЬНО включай хотя бы одну "дополнительную" услугу** — то, что НЕ про стрижку, бороду, машинку, укладку, окантовку, бритьё или комплекс из них. Например: массаж, чистка лица, глиняная/черная маска, коррекция воском. Это **поднимает чек и улучшает впечатление!**

📌 Формат ответа строго:

{{
  "services": [101, 205],
  "message": "Эмоциональный, продающий текст с HTML-ссылкой, если уместно"
}}

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