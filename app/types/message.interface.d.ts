interface IMessage {
  role: string;
  content: string;
  author: number | -1;
  isIncoming: boolean;
  payload: PayloadType | null;
}

export interface IMessageDB extends IMessage {
  payload: PayloadType | null
  _id: string
}

type PayloadType = {
  services: number[]
}