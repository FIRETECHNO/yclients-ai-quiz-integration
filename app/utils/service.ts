class Service implements IService {
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

  constructor(
    serviceName: string,
    CompanyId: number,
    isChain: boolean,
    id: number,
    title: string,
    categoryId: number,
    priceMin: number,
    priceMax: number,
    discount: number,
    comment: string,
    prepaid: string,
    isMulti: boolean,
    staff: IStaff[],
    duration: number,
    imagePath: string
  ) {
    this.serviceName = serviceName;
    this.CompanyId = CompanyId;
    this.isChain = isChain;
    this.id = id;
    this.title = title;
    this.categoryId = categoryId;
    this.priceMin = priceMin;
    this.priceMax = priceMax;
    this.discount = discount;
    this.comment = comment;
    this.prepaid = prepaid;
    this.isMulti = isMulti;
    this.staff = staff;
    this.duration = duration;
    this.imagePath = imagePath;
  }

  toString(): string {
    return JSON.stringify(this);
  }

  toJSON() {
    return {
      serviceName: this.serviceName,
      CompanyId: this.CompanyId,
      isChain: this.isChain,
      id: this.id,
      title: this.title,
      categoryId: this.categoryId,
      priceMin: this.priceMin,
      priceMax: this.priceMax,
      discount: this.discount,
      comment: this.comment,
      prepaid: this.prepaid,
      isMulti: this.isMulti,
      staff: this.staff,
      duration: this.duration,
      imagePath: this.imagePath,
    };
  }
}
class Staff implements IStaff {
  id: number;
  imageUrl: string;
  name: string;

  constructor(id: number, imageUrl: string, name: string) {
    this.id = id;
    this.imageUrl = imageUrl;
    this.name = name;
  }

  toJSON() {
    return {
      id: this.id,
      imageUrl: this.imageUrl,
      name: this.name,
    };
  }
}
export { Service, Staff };
