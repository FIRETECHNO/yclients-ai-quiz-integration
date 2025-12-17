import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { IShortService } from "../types/IShortService.interface";


const isCoreService = (name: string): boolean => {
  const coreKeywords = [
    'стрижка', 'борода', 'машинкой', 'окантовка', 'бре', 'брит', 'укладка',
    'комплекс', 'моделирование', 'оформление', 'брить', 'детская', 'первая',
    'спа-моделирование', 'спа моделирование', 'укладка'
  ];
  const lower = name.toLowerCase();
  return coreKeywords.some(kw => lower.includes(kw));
};


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
          // .optional()
          .default([]),
        message: z
          .string()
          .min(10, "Сообщение слишком короткое")
          .max(200, "Сообщение не должно превышать 200 символов")
          .describe("Короткое, дружелюбное и продающее сообщение"),
      }),

      func: async ({ service_ids, message }) => {
        const validIds = service_ids.filter(id => serviceIdSet.has(id));

        // --- НОВОЕ: добавляем одну extra-услугу, если её нет ---
        const extraServices = availableServices.filter(s => !isCoreService(s.name));
        const hasExtra = validIds.some(id => extraServices.some(s => s.id === id));

        let resultIds = validIds;
        if (!hasExtra && extraServices.length > 0) {
          const randomExtra = extraServices[Math.floor(Math.random() * extraServices.length)];
          // Добавляем, но не более 3 услуг всего
          resultIds = [...validIds.slice(0, 2), randomExtra.id];
        }

        // Убираем возможные дубли и ограничиваем до 3
        const uniqueIds = Array.from(new Set(resultIds)).slice(0, 3);
        // ---

        return JSON.stringify({
          services: uniqueIds,
          message: message.trim(),
        });
      },
    }),
  ];
};