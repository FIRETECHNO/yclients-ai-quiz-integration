import { Message } from "@/utils/message"

export default defineNuxtPlugin(() => {
  return {
    provide: {
      Message
    }
  }
})