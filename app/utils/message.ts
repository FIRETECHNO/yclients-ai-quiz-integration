class Message implements IMessage {
  _id?: string
  stringContent: string
  payload: Record<string, any>
  author?: number | -1
  isIncoming: boolean

  constructor(
    stringContent: string,
    payload: Record<string, any> = {},
    isIncoming: boolean,
    author?: number | -1,
    _id?: string,
  ) {
    this._id = _id
    this.stringContent = stringContent
    this.payload = payload
    this.author = author
    this.isIncoming = isIncoming
  }

  toString(): string {
    return JSON.stringify(this);
  }

  toJSON() {
    return {
      id: this._id,
      content: this.stringContent,
      payload: this.payload,
      author: this.author,
      isIncoming: this.isIncoming,
    }
  }
}

export { Message }