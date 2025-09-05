import { GigaChatChatModel } from "./gigachatLLM";
import { getGigaToken } from "./gigachatAccessToken";

let agent: GigaChatChatModel | null = null;
export async function getModel() {
  if (!agent) {
    const accessToken = await getGigaToken();
    agent = new GigaChatChatModel({
      apiKey: accessToken,
      modelName: "GigaChat-Max",
      temperature: 0.3,
    });
  }
  return agent;
}
export async function updateToken() {
  const accessToken = await getGigaToken();
  if (!agent) {
    const accessToken = await getGigaToken();
    agent = new GigaChatChatModel({
      apiKey: accessToken,
      modelName: "GigaChat-Max",
      temperature: 0.3,
    });
  } else {
    agent.apiKey = accessToken;
  }
}
