declare global {
  interface IMessage {
    role: string;
    _id?: string;
    content: string;
    payload: IPayload;
    author?: number | -1;
    isIncoming: boolean;

    toJSON(): Record<string, any>;
    toString(): string;
  }

  interface IPayload {
    recommended_services: number[];
    services: any[];
  }
}

export { IMessage, IPayload };
