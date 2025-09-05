import {
  SimpleChatModel,
  type BaseChatModelParams,
} from "@langchain/core/language_models/chat_models";
import { BaseMessage } from "@langchain/core/messages";

// 1. Конвертер ролей адаптирован под Google Gemini API
function convertRole(message: BaseMessage): "user" | "model" {
  const type = message._getType();
  if (type === "human") return "user";
  if (type === "ai") return "model";
  // Gemini не имеет прямой роли "system" в истории, она выносится отдельно.
  // В качестве фоллбэка считаем системные сообщения пользовательскими, если они попадут в историю.
  return "user";
}

// 2. Интерфейс для параметров, адаптированный под Google Gemini
export interface GoogleAIChatModelInput extends BaseChatModelParams {
  modelName?: string; // e.g., "gemini-1.5-flash-latest"
  apiKey: string;
  temperature?: number;
  maxOutputTokens?: number; // Аналог max_tokens
  candidateCount?: number; // Аналог n
}

export class GoogleAIChatModel extends SimpleChatModel {
  modelName = "gemini-1.5-flash-latest"; // Рекомендуемая быстрая модель
  apiKey: string;
  temperature = 0.3; // Немного повысим для большей креативности
  maxOutputTokens: number | undefined;
  candidateCount: number | undefined;

  constructor(fields: GoogleAIChatModelInput) {
    super(fields);
    this.modelName = fields.modelName ?? this.modelName;
    this.apiKey = fields.apiKey;
    this.temperature = fields.temperature ?? this.temperature;
    this.maxOutputTokens = fields.maxOutputTokens;
    this.candidateCount = fields.candidateCount;
  }

  _llmType() {
    return "google_ai_chat";
  }

  async _call(
    messages: BaseMessage[],
    options: this["ParsedCallOptions"]
  ): Promise<string> {
    // 3. Отделяем системный промпт от остальной истории
    let systemInstruction: string | undefined;
    let conversationMessages = [...messages];

    if (messages[0]?._getType() === "system") {
      systemInstruction = messages[0].content as string;
      conversationMessages = messages.slice(1);
    }

    // 4. Форматируем историю чата под формат `contents`
    const contents = conversationMessages.map((msg) => ({
      role: convertRole(msg),
      parts: [{ text: msg.content as string }],
    }));

    // 5. Собираем тело запроса, включая generationConfig и systemInstruction
    const body: Record<string, any> = {
      contents,
      generationConfig: {
        temperature: this.temperature,
        maxOutputTokens: this.maxOutputTokens,
        candidateCount: this.candidateCount,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    // 6. Формируем URL с моделью и API-ключом
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

    // 7. Делаем запрос с помощью $fetch
    const data = await $fetch<{
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    }>(url, {
      method: "POST",
      body,
      signal: options.signal,
    }).catch((error) => {
      const apiError = error.data?.error || { message: error.message };
      console.error("Google AI API Error Response:", apiError);
      throw new Error(`Google AI API request failed: ${apiError.message || 'Unknown error'}`);
    });

    // 8. Парсим ответ из другой структуры
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (responseText === undefined) {
      console.warn("Google AI API returned an unexpected response structure:", data);
      throw new Error("Received no valid candidates from Google AI API.");
    }

    return responseText;
  }
}