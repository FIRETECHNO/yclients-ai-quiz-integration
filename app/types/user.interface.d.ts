declare global {
  interface IUser {
    // yclients data
    id: number
    name: string
    login: string
    user_token: string
  }
}

export { IUser }