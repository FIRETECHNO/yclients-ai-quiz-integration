import {
  SimpleChatModel,
  type BaseChatModelParams,
} from "@langchain/core/language_models/chat_models";
import { AIMessage, BaseMessage } from "@langchain/core/messages";

function convertRole(message: BaseMessage): "user" | "assistant" | "system" {
  const type = message._getType();
  if (type === "human") return "user";
  if (type === "ai") return "assistant";
  if (type === "system") return "system";
  return "user"; // Фоллбэк
}

export interface GigaChatChatModelInput extends BaseChatModelParams {
  modelName?: string;
  apiKey: string;
  temperature?: number;
  max_tokens?: number;
  n?: number;
}

export class GigaChatChatModel extends SimpleChatModel {
  modelName = "GigaChat-Lite";
  apiKey: string;
  temperature = 0.2;
  max_tokens: number | undefined;
  n: number | undefined;

  constructor(fields: GigaChatChatModelInput) {
    super(fields);
    this.modelName = fields.modelName ?? this.modelName;
    this.apiKey = fields.apiKey;
    this.temperature = fields.temperature ?? this.temperature;
    this.max_tokens = fields.max_tokens;
    this.n = fields.n;
  }

  _llmType() {
    return "giga_chat_chat";
  }

  async _call(
    messages: BaseMessage[],
    options: this["ParsedCallOptions"]
  ): Promise<string> {
    const formattedMessages = messages.map((msg) => ({
      role: convertRole(msg),
      content: msg.content,
    }));

    const body = {
      model: this.modelName,
      messages: formattedMessages,
      temperature: this.temperature,
      max_tokens: this.max_tokens,
      n: this.n,
    };

    const data = await $fetch<{
      choices: Array<{
        message?: { content?: string };
        finish_reason?: string;
      }>;
      created: number;
      model: string;
      object: string;
    }>("https://gigachat.devices.sberbank.ru/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body,
      signal: options.signal,
    }).catch((error) => {
      const apiError = error.data || { message: error.message };
      console.error("GigaChat API Error Response:", apiError);
      throw new Error(
        `GigaChat API request failed: ${apiError.message || "Unknown error"}`
      );
    });

    if (
      !data.choices ||
      data.choices.length === 0 ||
      !data.choices[0].message
    ) {
      console.warn(
        "GigaChat API returned an unexpected response structure:",
        data
      );
      throw new Error("Received no valid choices from GigaChat API.");
    }

    return data.choices[0].message.content ?? "";
  }
}
