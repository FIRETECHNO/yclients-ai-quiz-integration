import { AgentExecutor, createStructuredChatAgent } from "langchain/agents";
import { DynamicTool } from "langchain/tools";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { getModel } from "../../utils/aiAgent";
import { useRedis } from "../../utils/redis";

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
    redis.lRange(chatKey, 0, -1),
  ]);

  if (!companyDataString) {
    throw createError({ statusCode: 404, message: `Компания с ID "${companyId}" не найдена` });
  }
  const companyData = JSON.parse(companyDataString);

  const chatHistory = chatHistoryStrings
    .map((msg) => {
      const parsed = JSON.parse(msg);
      return parsed.role === "user"
        ? `User: ${parsed.content}`
        : `Assistant: ${parsed.content}`;
    })
    .join("\n");

  const llm = await getModel();

  const tools = [
    new DynamicTool({
      name: "get_available_booking_slots",
      description:
        'Получает список свободных слотов для записи. Входные данные — строка с названием услуги, например "мужская стрижка".',
      func: async (serviceName: string) => {
        try {
          const slots: any = ["12:00 завтра"];
          if (slots.length === 0) {
            return `Свободных слотов для услуги "${serviceName}" не найдено.`;
          }
          return `Доступные слоты для "${serviceName}": ${JSON.stringify(slots)}`;
        } catch (e) {
          return "Не удалось получить слоты. Возможно, услуга указана неверно.";
        }
      },
    }),
  ];

  const toolDescriptions = tools
    .map((t) => `${t.name}: ${t.description}`)
    .join("\n");

  const promptTemplate = `Ты — дружелюбный ассистент компании "${companyData.name}".
У тебя есть доступ к инструментам:
{tools}

Имена инструментов: {tool_names}

Отвечай строго в формате JSON:
{{
  "action": "название инструмента или 'final_answer'",
  "action_input": "аргументы или итоговый ответ"
}}

Если нужен инструмент — выбери одно из имён инструментов из списка.
Если знаешь финальный ответ без инструментов — используй "action": "final_answer".

История диалога:
{chat_history}

Вопрос: {input}

{agent_scratchpad}`;

  const prompt = PromptTemplate.fromTemplate(promptTemplate);

  const agent = await createStructuredChatAgent({
    llm,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({ agent, tools });

  let result: any;
  let finalAnswer: string;

  try {
    result = await agentExecutor.invoke({
      input: message,
      chat_history: chatHistory,
      tools: toolDescriptions,
      tool_names: tools.map((t) => t.name).join(", "),
    });

    console.log(result);


    // Для Structured Chat Agent ответ приходит в result.output или напрямую в result
    finalAnswer =
      typeof result.output === "string" ? result.output : JSON.stringify(result);
  } catch (error: any) {
    console.error(error);

    if (error.constructor?.name === "OutputParserException") {
      console.warn(
        "[Agent Warning] OutputParserException caught. Using LLM's raw output."
      );
      finalAnswer = error.llmOutput;
    } else {
      throw createError({
        statusCode: 500,
        message: "Произошла ошибка при обработке вашего запроса.",
      });
    }
  }

  const userMessageToSave = {
    role: "user",
    content: message,
    author: userId,
    isIncoming: false,
  };
  const aiResponseToSave = {
    role: "assistant",
    author: -1,
    isIncoming: true,
    content:
      finalAnswer || "К сожалению, я не смог обработать ваш запрос.",
  };

  await Promise.all([
    redis.rPush(chatKey, JSON.stringify(userMessageToSave)),
    redis.rPush(chatKey, JSON.stringify(aiResponseToSave)),
  ]);
  await redis.lTrim(chatKey, -MAX_HISTORY_LENGTH, -1);

  return { output: finalAnswer };
});
