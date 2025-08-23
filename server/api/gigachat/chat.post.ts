import { GigaChatChatModel } from "../../utils/gigachatLLM";
import { getGigaToken } from "../../utils/gigachatAccessToken";

export default defineEventHandler(async (event) => {
  const { messages, model = "GigaChat-2-Max", temperature = 0.2 } =
    await readBody<{
      messages: { role: "user" | "assistant" | "system"; content: string }[];
      model?: string;
      temperature?: number;
    }>(event);

  const accessToken = await getGigaToken();

  const llm = new GigaChatChatModel({
    apiKey: accessToken,
    modelName: model,
    temperature,
  });

  const result = await llm.invoke(
    messages ?? [{ role: "user", content: "ping" }]
  );

  return { output: result.content };
});