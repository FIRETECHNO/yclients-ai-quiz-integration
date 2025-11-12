import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { IShortService } from "../types/IShortService.interface";

export const createBarberTools = (availableServices: IShortService[]) => {
  // Создаём Set числовых ID для быстрой проверки
  const serviceIdSet = new Set<number>(
    availableServices.map(s => s.id) // s.id — number
  );

  // Опционально: для описания в schema делаем строковое представление
  const serviceIdList = Array.from(serviceIdSet).join(", ");

  return [
    new DynamicStructuredTool({
      name: "get_available_services",
      description: "Возвращает полный список доступных услуг с названиями и описаниями. Используй, если нужно понять, какие услуги предлагает барбершоп.",
      schema: z.object({}),
      func: async () => {
        // Форматируем услуги в читаемый текст для LLM
        const servicesText = availableServices
          .map(s => `ID: ${s.id}, Название: "${s.name}"${s.description ? `, Описание: ${s.description}` : ''}`)
          .join("\n");
        return servicesText;
      },
    }),
    new DynamicStructuredTool({
      name: "recommend_services",
      description: `Рекомендует услуги барбершопа. Доступные ID: ${serviceIdList}`,

      schema: z.object({
        service_ids: z
          .array(z.number().int()) // ← строго целые числа
          .describe(`Массив ID услуг. Доступные: [${serviceIdList}]`)
          .optional()
          .default([]),
        message: z
          .string()
          .min(10, "Сообщение слишком короткое")
          .max(200, "Сообщение не должно превышать 200 символов")
          .describe("Короткое, дружелюбное и продающее сообщение"),
      }),

      func: async ({ service_ids, message }) => {
        // Фильтруем только валидные числовые ID
        const validIds = service_ids.filter(id => serviceIdSet.has(id));

        // 🔥 Если нужно — здесь можно получить полные данные об услугах:
        // const validServices = availableServices.filter(s => validIds.includes(s.id));

        return JSON.stringify({
          services: validIds, // ← остаётся массивом чисел [123, 456]
          message: message.trim(),
        });
      },
    }),
  ];
};