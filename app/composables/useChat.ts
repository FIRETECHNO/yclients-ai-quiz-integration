import { toast } from "vue3-toastify";
import ChatApi from "~/api/ChatApi";

export function useChat() {
  let messages = useState<IMessage[]>(() => []);
  let chatStatus = useState<"ready" | "ai-thinking">("ready");

  async function sendMessage(question: string) {
    if (question.length == 0) return;

    const { user } = useUser();
    const { companyId } = useCompany();

    if (!companyId.value) throw new Error("Не выбрана компания!")

    let messageOnClient = new Message(question, {}, false, user.value?.id);
    messages.value.push(messageOnClient)

    try {
      chatStatus.value = "ai-thinking";
      let data = await ChatApi.askAi(messageOnClient, companyId.value);
      await setAiMessage(data.output, {})

      return data;
    } catch (error: any) {
      chatStatus.value = "ready";
      return toast(error.message, {
        type: "error"
      })
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
    // functions
    sendMessage,
    setAiMessage,
  };
}
