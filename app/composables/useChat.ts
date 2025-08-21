export function useChat() {
  let messages = useState<IMessage[]>(() => [])

  async function sendMessage(question: string) {
    const { user } = useUser();
    let messageOnClient = new Message(question, {}, false, user.value?.id)

    messages.value.push(messageOnClient); // insert a new message
  }

  return {
    // variables
    messages,
    // functions
    sendMessage,
  }
}