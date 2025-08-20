export function useChat() {
  let messages = useState<IMessage[]>()

  async function sendMessage(msg: IMessage) {
    console.log(msg.toJSON());
  }

  return {
    // variables
    messages,
    // functions
    sendMessage,
  }
}