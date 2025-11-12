import { ChatInput } from "#components";
import { toast } from "vue3-toastify";
import ChatApi from "~/api/ChatApi";
import type { IMessage, IMessageDB } from "~/types/message.interface";


export function useChat() {
  // Состояния
  const messages = useState<(IMessageDB | IMessage)[]>(() => []);
  const chatStatus = useState<"ready" | "ai-thinking">("ready");
  const hints = useState<string[]>(() => []);
  const isLoadingHistory = ref(false);

  // Загрузка истории
  async function fetchHistory() {
    isLoadingHistory.value = true;
    try {
      const initialHistory = await ChatApi.getHistory();
      if (!initialHistory || initialHistory.length === 0) {
        messages.value = [];
        return;
      }
      messages.value = [...initialHistory];
    } catch (error) {
      console.error("[useChat] fetchHistory error:", error);
      messages.value = [];
    } finally {
      isLoadingHistory.value = false;
    }
  }

  // Отправка сообщения пользователем
  async function sendMessage(question: string) {
    if (!question.trim()) return;

    const { user } = useUser();
    const { companyId } = useCompany();

    if (!companyId.value) throw new Error("Не выбрана компания!");

    const messageOnClient: IMessage = {
      role: "user",
      content: question,
      isIncoming: false,
      author: user.value?.id,
      payload: null
    }


    // Добавляем локально
    messages.value.push(messageOnClient);
    messages.value = [...messages.value];

    try {
      chatStatus.value = "ai-thinking";
      const data = await ChatApi.askAi(messageOnClient, companyId.value);

      const aiAnswer = data.output?.message ?? "(AI не вернул текст)";
      await setAiMessage(aiAnswer, {
        services: data.output?.services ?? [],
      });

      hints.value = [...(data.output?.suggestions ?? [])];
      chatStatus.value = "ready";
      return data;
    } catch (error: any) {
      chatStatus.value = "ready";
      console.error("[useChat] sendMessage error:", error);
      toast(error?.message ?? "Unknown error", { type: "error" });
    }
  }

  // Получение подсказок от AI
  async function setHints() {
    const { user } = useUser();
    const { companyId } = useCompany();
    if (!companyId.value) throw new Error("Не выбрана компания!");
    try {
      chatStatus.value = "ai-thinking";
      const data = await ChatApi.getHints(user.value.id, companyId.value!);
      hints.value = [...(data.hints ?? [])];
    } catch (error: any) {
      console.error("[useChat] setHints error:", error);
      toast(error.message ?? "Unknown error", { type: "error" });
    } finally {
      chatStatus.value = "ready";
    }
  }

  // Получение информации об услуге
  async function getService(serviceId: number): Promise<any> {
    return await ChatApi.getServiceById(serviceId);
  }

  // Добавление ответа от AI
  async function setAiMessage(answer: string, payload: IMessageDB["payload"]) {
    const messageFromAI = {
      role: "assistant",
      content: answer,
      payload,
      isIncoming: true,
      author: -1
    }

    messages.value.push(messageFromAI);
    messages.value = [...messages.value];
    chatStatus.value = "ready";
  }

  return {
    // Переменные
    messages,
    hints,
    chatStatus,
    isLoadingHistory,
    // Функции
    sendMessage,
    setAiMessage,
    fetchHistory,
    setHints,
    getService,
  };
}
