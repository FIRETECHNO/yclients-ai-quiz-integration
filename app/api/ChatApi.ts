import type { IMessage } from "~~/server/types/IMessage.interface";

export default {
  async askAi(
    message: IMessage,
    companyId: number
  ): Promise<{ output: { message: string; services: string[]; suggestions?: string[] } }> {
    if (!message.author) throw new Error("No author of message");

    const toSend = {
      message: message.content,
      userId: message.author,
      companyId,
    };
    console.log("--- Send message: ", toSend);

    const data = await $fetch<{ output: any }>("/api/agent", {
      method: "POST",
      body: toSend,
    });

    if (!data.output || typeof data.output !== "object") {
      console.warn("Ожидался объект в output, но получен:", data.output);
      return {
        output: {
          message: String(data.output ?? "AI не вернул текст"),
          services: [],
          suggestions: [],
        },
      };
    }

    const output = {
      message: String(data.output.message ?? "AI не вернул текст"),
      services: data.output.services ?? [],
      suggestions: data.output.suggestions ?? [],
    };

    return { output };
  },
  async saveMessage(
    message: IMessage,
    companyId: number,
    userId: number
  ): Promise<boolean> {
    let toSend = {
      message,
      userId,
      companyId,
    };
    console.log("--- Send message: ", toSend);

    try {
      await $fetch("/api/redis/save-message", {
        method: "POST",
        body: toSend,
      });
      return true;
    } catch (error) {
      console.log("error at save message", error);

      return false;
    }
  },
  async getIdServices(
    userId: number,
    companyId: number
  ): Promise<{ recommended_services: number[] } | null> {
    let toSend = {
      userId,
      companyId,
    };

    let data = await $fetch<{ recommended_services: number[] }>(
      "/api/gigachat/agent-recommended-services",
      {
        method: "POST",
        body: toSend,
      }
    );

    return data;
  },
  async getServicesById(recommended_services: number[]): Promise<any[]> {
    const promises = recommended_services.map((element) => {
      const toSend = {
        serviceId: element,
      };
      return $fetch<any>("/api/redis/get-service", {
        method: "POST",
        body: toSend,
      });
    });

    const results = await Promise.all(promises);
    return results;
  },
  async getServiceById(recommended_service: number): Promise<any[]> {
    const toSend = {
      serviceId: recommended_service,
    };
    const result = await $fetch<any>("/api/redis/get-service", {
      method: "POST",
      body: toSend,
    });
    return result;
  },
  async getHints(
    userId: number,
    companyId: number
  ): Promise<{ hints: string[] }> {
    let toSend = {
      userId,
      companyId,
    };

    let data = await $fetch<{ output: string; hints: string[] }>(
      "/api/gigachat/agent-hints",
      {
        method: "POST",
        body: toSend,
      }
    );

    return data;
  },
  async getHistory() {
    const { companyId } = useCompany();
    const { user } = useUser();

    if (!companyId.value || !user.value.id) {
      console.warn(
        "Недостаточно данных для запроса истории (companyId или userId)."
      );
      return;
    }
    try {
      const history = await $fetch<IMessage[]>("/api/redis/history", {
        method: "GET",
        query: {
          companyId: companyId.value,
          userId: user.value.id,
        },
      });
      console.log(`История успешно загружена. Сообщений: ${history.length}`);
      return history;
    } catch (error) {
      console.error("Ошибка при загрузке истории сообщений:", error);
      return [];
    }
  },
};
