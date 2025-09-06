import { SerializedChatModel } from "@langchain/core/language_models/chat_models";
type Staff = {
  id: number;
  imageUrl: string;
  name: string;
};
type Service = {
  serviceName: string;
  CompanyId: number;
  isChain: boolean;
  id: number;
  salonServiceId: number;
  title: string;
  categoryId: number;
  priceMin: number;
  priceMax: number;
  discount: number;
  comment: string;
  prepaid: string;
  isMulti: boolean;
  staff: Staff[];
  duration: number;
};

function extractData(data: any[]) {
  const result: Service[] = [];
  data.forEach((element) => {
    let staff: Staff[] = [];
    element.staff.forEach((el: any) => {
      staff.push({
        id: el.id,
        imageUrl: el.image_url,
        name: el.name,
      } as Staff);
    });
    const elem: Service = {
      serviceName: element.booking_title,
      CompanyId: element.salon_service_id,
      isChain: element.is_chain,
      id: element.id,
      salonServiceId: element.salon_service_id,
      title: element.title,
      categoryId: element.category_id,
      priceMin: element.price_min,
      priceMax: element.price_max,
      discount: element.discount,
      comment: element.comment,
      prepaid: element.prepaid,
      isMulti: element.is_multi,
      staff: staff,
      duration: element.duration,
    };
    result.push(elem);
  });
  return result;
}

export const useServices = { extractData };
