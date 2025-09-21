import { ChatInput } from "#components";
import { toast } from "vue3-toastify";
import ChatApi from "~/api/ChatApi";

export function useChat() {
  let messages = useState<IMessage[]>(() => []);
  let chatStatus = useState<"ready" | "ai-thinking">("ready");
  let hints = useState<string[]>(() => []);

  const isLoadingHistory = ref(false);

  async function fetchHistory() {
    console.log("Запускаем загрузку истории сообщений...");
    isLoadingHistory.value = true;
    try {
      let initialHistory = await ChatApi.getHistory();
      if (!initialHistory || initialHistory.length === 0) {
        console.log("История пуста, обновлять нечего.");
        messages.value = [];
        return;
      }

      console.log(
        `Получена история из ${initialHistory.length} сообщений. Обогащаем данными...`
      );

      // const enrichedHistoryPromises = initialHistory.map(async (message) => {
      //   if (message.payload && message.payload?.recommended_services?.length > 0) {
      //     const services = await ChatApi.getServicesById(
      //       message.payload.recommended_services
      //     );

      //     return new Message(
      //       message.role,
      //       message.content,
      //       {
      //         recommended_services: message.payload.recommended_services,
      //         services: services,
      //       },
      //       message.isIncoming,
      //       message.author,
      //       message._id
      //     );
      //   }

      //   return message;
      // });

      // const finalHistory = await Promise.all(enrichedHistoryPromises);
      // console.log(finalHistory);

      const finalHistory = initialHistory;

      messages.value = finalHistory;
    } catch (error) {
      console.error("Ошибка загрузки истории:", error);
      messages.value = [];
    } finally {
      isLoadingHistory.value = false;
    }
  }

  async function sendMessage(question: string) {
    if (question.length == 0) return;

    const { user } = useUser();
    const { companyId } = useCompany();

    if (!companyId.value) throw new Error("Не выбрана компания!");

    let messageOnClient = new Message(
      "user",
      question,
      { services: [], recommended_services: [] },
      false,
      user.value?.id
    );

    messages.value.push(messageOnClient);

    try {
      chatStatus.value = "ai-thinking";
      let data = await ChatApi.askAi(messageOnClient, companyId.value);
      console.log("askAi result: ", data);
      setAiMessage(data.output.answer);
      hints.value = data.output.suggestions;
      chatStatus.value = "ready";

      return data;
    } catch (error: any) {
      chatStatus.value = "ready";
      return toast(error.message, {
        type: "error",
      });
    }
  }

  async function setHints() {
    const { user } = useUser();
    const { companyId } = useCompany();
    if (!companyId.value) throw new Error("Не выбрана компания!");
    try {
      chatStatus.value = "ai-thinking";
      // companyId.value! возможно неправильно
      let data = await ChatApi.getHints(user.value.id, companyId.value!);
      hints.value = data.hints;

      chatStatus.value = "ready";
    } catch (error: any) {
      chatStatus.value = "ready";
      return toast(error.message, {
        type: "error",
      });
    }
  }
  async function getService(serviceId: number): Promise<any> {
    return await ChatApi.getServiceById(serviceId);
  }
  async function setAiMessage(answer: string, payload?: any) {
    let messageFromAI = new Message("assistant", answer, payload, true, -1);
    messages.value.push(messageFromAI);
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
    setHints,
    getService,
  };
}
