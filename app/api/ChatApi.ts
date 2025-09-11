export default {
  // sendMessage(message: IMessage): Promise<{ success: boolean }> {
  //   const { $apiFetch } = useNuxtApp();
  //   return $apiFetch<{ success: boolean }>("/teacher/update-teacher-summary", {
  //     method: "POST",
  //     body: { message },
  //   });
  // },
  async askAi(
    message: IMessage,
    companyId: number
  ): Promise<{ output: string; recommended_services: number[] }> {
    if (!message.author) throw new Error("No author of message");

    let toSend = {
      message: message.content,
      userId: message.author,
      companyId,
    };
    console.log("--- Send message: ", toSend);

    let data = await $fetch<{ output: string; recommended_services: number[] }>(
      "/api/gigachat/agent",
      {
        method: "POST",
        body: toSend,
      }
    );
    return data;
  },
  async saveMessage(message: IMessage, companyId: number, userId: number) {
    let toSend = {
      message,
      userId,
      companyId,
    };
    console.log("--- Send message: ", toSend);

    await $fetch("/api/redis/save-message", {
      method: "POST",
      body: toSend,
    });
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
    // 1. Создаем массив ПРОМИСОВ.
    // .map() идеально подходит, потому что он создает новый массив.
    // Каждый вызов $fetch - это обещание (промис), что данные когда-нибудь придут.
    const promises = recommended_services.map((element) => {
      const toSend = {
        serviceId: element,
      };
      // Мы не используем await здесь, мы просто возвращаем сам промис
      return $fetch<any>("/api/redis/get-service", {
        method: "POST",
        body: toSend,
      });
    });

    // 2. Ждем, пока ВСЕ промисы в массиве не выполнятся.
    // Promise.all - это специальная команда, которая говорит:
    // "Дождись выполнения всех этих обещаний и верни мне массив с результатами".
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
    const { user } = useUser(); // Предположим, что useUser возвращает ID пользователя

    // Проверяем, есть ли у нас все данные для запроса.
    // Если нет, то и запрашивать нечего.
    if (!companyId.value || !user.value.id) {
      console.warn(
        "Недостаточно данных для запроса истории (companyId или userId)."
      );
      return;
    }
    try {
      // Это встроенный в Nuxt 3 способ делать запросы к API. Он очень удобный.
      // Мы делаем GET-запрос на /api/messages и передаем параметры в поле `query`.
      const history = await $fetch<IMessage[]>("/api/redis/history", {
        method: "GET",
        query: {
          companyId: companyId.value,
          userId: user.value.id,
        },
      });

      // Если запрос прошел успешно, мы полностью заменяем наш массив `messages`
      // теми данными, что пришли с сервера.
      console.log(`История успешно загружена. Сообщений: ${history.length}`);
      return history;
    } catch (error) {
      // Если произошла ошибка (например, сервер недоступен), мы выводим ее в консоль.
      // В реальном приложении здесь можно было бы показать пользователю уведомление об ошибке.

      console.error("Ошибка при загрузке истории сообщений:", error);
      return [];
    }
  },
  // другие функции через запятую
};
