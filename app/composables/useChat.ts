export function useChat() {
  let messages = useState<IMessage[]>(() => [])
  let chatStatus = useState<"ready" | "ai-thinking">("ready")

  async function sendMessage(question: string) {
    const { user } = useUser();
    let messageOnClient = new Message(question, {}, false, user.value?.id)

    messages.value.push(messageOnClient); // insert a new message
    chatStatus.value = "ai-thinking";
  }

  return {
    // variables
    messages, chatStatus,
    // functions
    sendMessage,
  }
}