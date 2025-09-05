import { GoogleAIChatModel } from "../../utils/googleAIChatLLM"; // 1. Импортируем модель для Google
import { useRedis } from "../../utils/redis";

// Тип для сообщений, используемый для сборки контекста
type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

/**
 * Генерирует системный промпт на основе данных о компании.
 */
function createSystemPrompt(company: any): string {
  const services = company.services.map((s: any) => `- ${s.name} (${s.price})`).join("\n");
  return `Ты — ИИ-ассистент компании "${company.name}". Твоя задача — помогать пользователю.
ИНФОРМАЦИЯ О КОМПАНИИ:
- Название: ${company.name}
- Адрес: ${company.address}
- Услуги:\n${services}`;
}

/**
 * Генерирует пользовательский промпт для запроса подсказок.
 */
function createUserPrompt(): string {
  return `На основе информации о компании и истории диалога, сгенерируй 3 коротких и полезных вопроса-подсказки, которые пользователь мог бы задать следующими.
Если история пустая, предложи общие вопросы об услугах или ценах.

Твой ответ ДОЛЖЕН БЫТЬ только в формате JSON. Не пиши ничего, кроме JSON.
Структура:
{
  "suggestions": [
    "Первая подсказка...",
    "Вторая подсказка...",
    "Третья подсказка..."
  ]
}`;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const { companyId, userId } = await readBody<{
    companyId: string;
    userId: string;
  }>(event);

  if (!companyId || !userId) {
    throw createError({ statusCode: 400, message: "companyId и userId обязательны" });
  }

  const redis = await useRedis();
  const companyKey = `company:${companyId}`;
  const chatKey = `chat:${companyId}:${userId}`;

  // 1. Получаем данные о компании и историю чата из Redis
  const [companyDataString, chatHistoryStrings] = await Promise.all([
    redis.get(companyKey),
    redis.lRange(chatKey, 0, -1),
  ]);

  if (!companyDataString) {
    throw createError({ statusCode: 404, message: `Компания с ID "${companyId}" не найдена` });
  }

  // 2. Собираем полный контекст для LLM
  const companyData = JSON.parse(companyDataString);
  const systemPrompt = createSystemPrompt(companyData);
  const userPrompt = createUserPrompt();

  // --- ИСПРАВЛЕНО ---
  // Явно парсим каждое сообщение и берем только нужные поля.
  // Это делает код надежнее, если в Redis хранятся объекты с доп. полями.
  const chatHistory: ChatMessage[] = chatHistoryStrings.map((jsonString: string) => {
    const storedMessage: { role: 'user' | 'assistant', content: string } = JSON.parse(jsonString);
    return {
      role: storedMessage.role,
      content: storedMessage.content,
    };
  });
  // --- КОНЕЦ ИСПРАВЛЕНИЯ ---

  const messagesForLlm: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...chatHistory,
    { role: "user", content: userPrompt },
  ];

  // 3. Вызываем Google AI Model
  if (!config.googleApiKey) {
    throw createError({ statusCode: 500, message: "API-ключ для Google AI не настроен" });
  }

  const llm = new GoogleAIChatModel({
    apiKey: config.googleApiKey,
    modelName: "gemini-1.5-flash-latest",
    temperature: 0.1, // Низкая температура для лучшего следования формату JSON
  });

  const result = await llm.invoke(messagesForLlm as any);
  const resultContent = result.content as string;

  // 4. Парсим ответ
  let suggestions: string[] = [];
  try {
    const parsedResult = JSON.parse(resultContent);
    if (Array.isArray(parsedResult.suggestions)) {
      suggestions = parsedResult.suggestions;
    }
  } catch (e) {
    console.warn("Google AI вернул не-JSON ответ:", resultContent);
    // В случае ошибки возвращаем пустой массив
  }

  return { hints: suggestions };
});