declare global {
  interface IUser {
    // yclients data
    id: string
    name: string
    login: string
    user_token: string
  }
}

export { IUser }