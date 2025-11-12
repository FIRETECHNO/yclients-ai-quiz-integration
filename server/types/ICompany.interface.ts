import { IShortService } from "./IShortService.interface"

export interface ICompany {
  name: string
  address: string
  services: IShortService[]
}