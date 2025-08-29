import { toast } from "vue3-toastify";
import ChatApi from "~/api/ChatApi";

export function useChat() {
  let messages = useState<IMessage[]>(() => []);
  let chatStatus = useState<"ready" | "ai-thinking">("ready");
  // Создаем ref для отслеживания состояния загрузки.
  // Это полезно, чтобы показывать пользователю спиннер или лоадер.
  const isLoadingHistory = ref(false);

  const fetchHistory = async () => {
    console.log("Запускаем загрузку истории сообщений...");

    // Получаем необходимые ID из других composables.
    // .value нужен, чтобы получить само значение из ref-переменной.
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

    // Ставим флаг загрузки в true. В этот момент на UI можно показать лоадер.
    isLoadingHistory.value = true;

    try {
      // Это встроенный в Nuxt 3 способ делать запросы к API. Он очень удобный.
      // Мы делаем GET-запрос на /api/messages и передаем параметры в поле `query`.
      const history = await $fetch<IMessage[]>("/api/messages", {
        method: "GET",
        query: {
          companyId: companyId.value,
          userId: user,
        },
      });

      // Если запрос прошел успешно, мы полностью заменяем наш массив `messages`
      // теми данными, что пришли с сервера.
      messages.value = history;
      console.log(`История успешно загружена. Сообщений: ${history.length}`);
    } catch (error) {
      // Если произошла ошибка (например, сервер недоступен), мы выводим ее в консоль.
      // В реальном приложении здесь можно было бы показать пользователю уведомление об ошибке.
      console.error("Ошибка при загрузке истории сообщений:", error);
    } finally {
      // Этот блок выполнится в любом случае: и при успехе, и при ошибке.
      // Мы убираем флаг загрузки. Лоадер на UI можно скрывать.
      isLoadingHistory.value = false;
    }
  };

  async function sendMessage(question: string) {
    if (question.length == 0) return;

    const { user } = useUser();
    const { companyId } = useCompany();

    if (!companyId.value) throw new Error("Не выбрана компания!");

    let messageOnClient = new Message(question, {}, false, user.value?.id);
    messages.value.push(messageOnClient);

    try {
      chatStatus.value = "ai-thinking";
      let data = await ChatApi.askAi(messageOnClient, companyId.value);
      await setAiMessage(data.output, {});

      return data;
    } catch (error: any) {
      chatStatus.value = "ready";
      return toast(error.message, {
        type: "error",
      });
    }
  }

  async function setAiMessage(answer: string, payload: Record<string, any>) {
    let messageFromAI = new Message(answer, payload, true, -1);
    //?
    messages.value.push(messageFromAI); // insert a new message
    chatStatus.value = "ready";
  }
  return {
    // variables
    messages,
    chatStatus,
    isLoadingHistory,
    // functions
    sendMessage,
    setAiMessage,
    fetchHistory,
  };
}
