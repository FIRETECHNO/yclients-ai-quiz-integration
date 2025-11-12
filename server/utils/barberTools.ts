import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const createBarberTools = (availableServices: { id: string; name: string; description?: string }[]) => {
  const serviceIds = availableServices.map(s => s.id);

  return [
    new DynamicStructuredTool({
      name: "recommend_services",
      description: `Рекомендует услуги барбершопа на основе запроса пользователя. Доступные ID: ${serviceIds.join(", ")}`,
      schema: z.object({
        service_ids: z.array(z.string()).describe(`Массив ID услуг из доступных: [${serviceIds.map(id => `"${id}"`).join(", ")}]`),
        message: z.string().describe("Короткое, дружелюбное, продающее сообщение для клиента"),
      }),
      func: async ({ service_ids, message }) => {
        // Валидация на стороне инструмента
        const validIds = service_ids.filter(id => serviceIds.includes(id));
        return JSON.stringify({
          services: validIds,
          message: message.trim()
        });
      },
    }),
  ];
};