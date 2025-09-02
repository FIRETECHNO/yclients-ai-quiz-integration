export interface Company {
  managerUser: IUser
  id: number // YClients id of company
  applicationId: number // app id in marketplace
  services: any[] | number[] // array of objects (services) or array of service _ids
}