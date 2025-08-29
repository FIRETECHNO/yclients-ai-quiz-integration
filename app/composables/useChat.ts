import ChatApi from "~/api/ChatApi";

export function useChat() {
  let messages = useState<IMessage[]>(() => []);
  let chatStatus = useState<"ready" | "ai-thinking">("ready");

  async function sendMessage(question: string) {
    const { user } = useUser();
    let messageOnClient = new Message(question, {}, false, user.value?.id);

    try {
      // const success = await ChatApi.sendMessage(messageOnClient);
    } catch (error) {
      console.error("Failed to send message to the server", error);
    }

    messages.value.push(messageOnClient); // insert a new message
    chatStatus.value = "ai-thinking";
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
