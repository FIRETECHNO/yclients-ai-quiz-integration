import { ChatOpenAI } from "@langchain/openai";

export class ProxyAPIChatModel extends ChatOpenAI {
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    super({
      openAIApiKey: apiKey,
      modelName: "gpt-4o", // claude-3-haiku-20240307 не получилось подрубить
      temperature: 0.5,
      maxTokens: 1024,
      configuration: {
        baseURL: "https://api.proxyapi.ru/openai/v1",
      }
    });
  }
}