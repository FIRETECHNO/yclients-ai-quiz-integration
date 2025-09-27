declare global {
  interface IStaff {
    id: number;
    imageUrl: string;
    name: string;
  }

  interface IService {
    serviceName: string;
    CompanyId: number;
    isChain: boolean;
    id: number;
    title: string;
    categoryId: number;
    priceMin: number;
    priceMax: number;
    discount: number;
    comment: string;
    prepaid: string;
    isMulti: boolean;
    staff: IStaff[];
    duration: number;
    imagePath: string;

    toJSON(): Record<string, any>;
    toString(): string;
  }
}
export { IService, IStaff };
