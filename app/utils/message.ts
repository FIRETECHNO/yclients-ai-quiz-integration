class Message implements IMessage {
  role: string;
  _id?: string;
  content: string;
  payload: IPayload;
  author?: number | -1;
  isIncoming: boolean;

  constructor(
    role: string,
    content: string,
    payload: IPayload = { services: [], recommended_services: [] },
    isIncoming: boolean,
    author?: number | -1,
    _id?: string
  ) {
    this.role = role;
    this._id = _id;
    this.content = content;
    this.payload = payload;
    this.author = author;
    this.isIncoming = isIncoming;
  }

  toString(): string {
    return JSON.stringify(this);
  }

  toJSON() {
    return {
      role: this.role,
      id: this._id,
      content: this.content,
      payload: this.payload,
      author: this.author,
      isIncoming: this.isIncoming,
    };
  }
}

export { Message };
