import { ChatOpenAI } from "@langchain/openai";

export class ProxyAPIChatModel extends ChatOpenAI {
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    super({
      openAIApiKey: apiKey,
      modelName: "gpt-4o-mini-2024-07-18", // или gpt-4o-mini
      temperature: 0.5,
      maxTokens: 512,
      configuration: {
        baseURL: "https://api.proxyapi.ru/openai/v1",
      },
      modelKwargs: {
        response_format: { type: "json_object" }
      }
    });
  }
}