declare global {
  interface IMessage {
    _id?: string
    stringContent: string
    payload: Record<string, any>
    author?: number | -1
    isIncoming: boolean

    toJSON(): Record<string, any>
    toString(): string
  }
}

export { IMessage }