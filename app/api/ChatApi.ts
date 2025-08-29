export default {
  // sendMessage(message: IMessage): Promise<{ success: boolean }> {
  //   const { $apiFetch } = useNuxtApp();
  //   return $apiFetch<{ success: boolean }>("/teacher/update-teacher-summary", {
  //     method: "POST",
  //     body: { message },
  //   });
  // },
  async askAi(message: IMessage, companyId: number): Promise<{ output: string }> {
    if (!message.author) throw new Error("No author of message")

    let toSend = {
      message: message.stringContent,
      userId: message.author,
      companyId
    }
    console.log("--- Send message: ", toSend);

    let data = await $fetch<{ output: string }>("/api/gigachat/agent", {
      method: "POST",
      body: toSend,
    });

    return data;
  },

  // другие функции через запятую
};
