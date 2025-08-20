declare global {
  interface IMessage {
    _id?: string
    stringContent: string
    payload: Record<string, any>
    author?: string | "ai-agent"
    isIncoming: boolean

    toJSON(): Record<string, any>
    toString(): string
  }
}

export { IMessage }