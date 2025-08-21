import { useUser } from "./useUser";
import ChatApi from "~/api/ChatApi";
export function useChat() {
  let messages = useState<IMessage[]>(() => []);
  let chatStatus = useState<"ready" | "ai-thinking">("ready");

  async function sendMessage(question: string) {
    const { user } = useUser();
    let messageOnClient = new Message(question, {}, false, user.value?.id);

    try {
      const success = await ChatApi.serverSendMessage(messageOnClient);
      return success.success;
    } catch (error) {
      console.error("Failed to send message to the server", error);
      return false;
    }

    messages.value.push(messageOnClient); // insert a new message
    chatStatus.value = "ai-thinking";
  }

  return {
    // variables
    messages,
    chatStatus,
    // functions
    sendMessage,
  };
}
