import { ChatInput } from "#components";
import { toast } from "vue3-toastify";
import ChatApi from "~/api/ChatApi";

export function useChat() {
  let messages = useState<IMessage[]>(() => []);
  let chatStatus = useState<"ready" | "ai-thinking">("ready");
  let hints = useState<string[]>(() => []);
  // Создаем ref для отслеживания состояния загрузки.
  // Это полезно, чтобы показывать пользователю спиннер или лоадер.
  const isLoadingHistory = ref(false);

  const fetchHistory = async () => {
    console.log("Запускаем загрузку истории сообщений...");

    // Получаем необходимые ID из других composables.
    // .value нужен, чтобы получить само значение из ref-переменной.

    // Ставим флаг загрузки в true. В этот момент на UI можно показать лоадер.
    isLoadingHistory.value = true;
    try {
      const history = await ChatApi.getHistory();
      console.log(history);

      // Для ref используем .value
      messages.value = history || []; // Обрабатываем undefined
    } catch (error) {
      console.error("Ошибка загрузки истории:", error);
      messages.value = [];
    } finally {
      isLoadingHistory.value = false;
    }
  };

  async function sendMessage(question: string) {
    if (question.length == 0) return;

    const { user } = useUser();
    const { companyId } = useCompany();

    if (!companyId.value) throw new Error("Не выбрана компания!");

    let messageOnClient = new Message(
      "user",
      question,
      {},
      false,
      user.value?.id
    );
    messages.value.push(messageOnClient);

    try {
      chatStatus.value = "ai-thinking";
      let data = await ChatApi.askAi(messageOnClient, companyId.value);
      await setAiMessage(data.output, {});
      hints.value = data.hints;
      return data;
    } catch (error: any) {
      chatStatus.value = "ready";
      return toast(error.message, {
        type: "error",
      });
    }
  }

  async function setAiMessage(answer: string, payload: Record<string, any>) {
    let messageFromAI = new Message("assistant", answer, payload, true, -1);
    //?
    messages.value.push(messageFromAI); // insert a new message
    chatStatus.value = "ready";
  }
  return {
    // variables
    messages,
    hints,
    chatStatus,
    isLoadingHistory,
    // functions
    sendMessage,
    setAiMessage,
    fetchHistory,
  };
}
