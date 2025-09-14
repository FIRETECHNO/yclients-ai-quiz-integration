import { DynamicTool } from "@langchain/core/tools";
import { getModel } from "../aiAgent"

async function fetchYClientsServices(companyId: string): Promise<any[]> {
  console.log(`[Tool] Запрашиваю услуги для компании #${companyId} у YClients...`);
  return [
    { name: "Мужская стрижка", price: "2000 руб." },
    { name: "Стрижка бороды", price: "1500 руб." },
  ];
}

export const serviceRecommendationTool = (companyId: string) => {
  return new DynamicTool({
    name: "get_and_recommend_services",
    description: "Используй эту функцию, когда пользователь просит посоветовать услугу, спрашивает, что ему подойдет, или хочет получить рекомендацию. Не используй для простых вопросов о цене или наличии услуг.",
    func: async (input: string) => {
      const services = await fetchYClientsServices(companyId);

      if (!services || services.length === 0) {
        return "К сожалению, не удалось загрузить список услуг.";
      }

      const servicesText = services.map((s) => `- ${s.name} (${s.price})`).join("\n");
      const finalPrompt = `Ты — эксперт-консультант салона.
Пользователь спрашивает: "${input}".
Основываясь на доступном списке услуг, дай ему развернутую и полезную рекомендацию.

Доступные услуги:
${servicesText}

Твой ответ должен быть дружелюбным и экспертным.`;

      const llm = await getModel();
      const result = await llm.invoke(finalPrompt);

      return result.content as string;
    },
  });
};