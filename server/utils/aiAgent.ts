// import { GigaChatChatModel } from "./gigachatLLM";
// import { getGigaToken } from "./gigachatAccessToken";
import { ProxyAPIChatModel } from "./proxyapiLLM";

// let agent: GigaChatChatModel | null = null;
// export async function getModel(): Promise<GigaChatChatModel> {
//   if (!agent) {
//     const accessToken = await getGigaToken();
//     agent = new GigaChatChatModel({
//       apiKey: accessToken,
//       modelName: "GigaChat-2-Pro",
//       temperature: 0.1,
//     });
//     return agent;
//   }
//   return agent;
// }
// export async function updateToken() {
//   const accessToken = await getGigaToken();
//   if (!agent) {
//     const accessToken = await getGigaToken();
//     agent = new GigaChatChatModel({
//       apiKey: accessToken,
//       modelName: "GigaChat-2-Pro",
//       temperature: 0.1,
//     });
//   } else {
//     agent.apiKey = accessToken;
//   }
//   return accessToken;
// }

let cachedModel: ProxyAPIChatModel | null = null;

export async function getModel() {
  if (!cachedModel) cachedModel = new ProxyAPIChatModel();
  return cachedModel;
}

export async function updateToken() {
  return process.env.OPENAI_API_KEY
}