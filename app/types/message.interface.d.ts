declare global {
  interface IMessage {
    role: string;
    _id?: string;
    content: string;
    payload: Record<string, any>;
    author?: number | -1;
    isIncoming: boolean;

    toJSON(): Record<string, any>;
    toString(): string;
  }
}

export { IMessage };
