import { Tool } from "langchain/tools";

export class GetRelevantServicesTool extends Tool {
  name = "get_relevant_services";
  description = "Ищет услуги по запросу клиента. Принимает строку с запросом.";

  async _call(input: string): Promise<string> {
    // input — строка, например: "хочу подстричься дешево"
    console.log("Поиск услуг по:", input);

    // Здесь можно вызвать твой API или локальный поиск
    const mockResult = {
      services: [
        { id: 13634935, name: "Мужская стрижка", price: "2000₽", duration: 60 },
        { id: 19946138, name: "Знакомство с Мастером", price: "1200₽", duration: 60 },
      ],
      message: `Нашёл по запросу "${input}":`,
    };

    return JSON.stringify(mockResult);
  }
}

export class GetAvailableSlotsTool extends Tool {
  name = "get_available_slots";
  description = 'Получает свободные слоты. Принимает JSON: {"service_id": 123, "date": "2025-04-05"}';

  async _call(input: string): Promise<string> {
    let args;
    try {
      args = JSON.parse(input);
    } catch (e) {
      return JSON.stringify({ error: "Неверный формат. Ожидается JSON." });
    }

    const { service_id, date } = args;
    if (!service_id) {
      return JSON.stringify({ error: "service_id обязателен" });
    }

    // Здесь вызов YClients API
    const slots = ["10:00", "11:30", "14:00", "16:30"];

    return JSON.stringify({
      service_id,
      date: date || "сегодня",
      slots,
      message: `Свободно на ${date || "сегодня"}:`,
    });
  }
}

// Экспорт массива
export const tools = [
  new GetRelevantServicesTool(),
  new GetAvailableSlotsTool(),
];