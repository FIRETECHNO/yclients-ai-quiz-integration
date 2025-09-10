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

  async getHints(
    userId: number,
    companyId: number
  ): Promise<{ hints: string[] }> {
    let toSend = {
      userId,
      companyId,
    };

    // let data = await $fetch<{ output: string; hints: string[] }>(
    //   "/api/gigachat/agent-hints",
    //   {
    //     method: "POST",
    //     body: toSend,
    //   }
    // );

    // return data;
    return {
      hints: [
        "Записаться на мужскую стрижку",
        "Какая прическа подойдет мне?",
        "Побрить бороду",
      ],
    };
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
      const history = await $fetch<IMessage[]>("/api/gigachat/history", {
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
