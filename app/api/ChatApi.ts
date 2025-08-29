export default {
  sendMessage(message: IMessage): Promise<{ success: boolean }> {
    const { $apiFetch } = useNuxtApp();
    return $apiFetch<{ success: boolean }>("/teacher/update-teacher-summary", {
      method: "POST",
      body: { message },
    });
  },

  // другие функции через запятую
};
