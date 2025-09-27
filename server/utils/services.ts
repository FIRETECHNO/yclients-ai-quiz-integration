import { SerializedChatModel } from "@langchain/core/language_models/chat_models";
import { Service, Staff } from "~/utils/service";
function extractData(data: any[]) {
  const resultServices: Service[] = [];
  let resultString: string = "Услуги :\n";
  data.forEach((element) => {
    let staff: Staff[] = [];
    let staffString: string = "Мастера:\n ";
    element.staff.forEach((el: any) => {
      staff.push({
        id: el.id,
        imageUrl: el.image_url,
        name: el.name,
      } as Staff);
      staffString += `${el.name}, `;
    });
    staffString += "\n";
    const elem = new Service(
      element.booking_title,
      element.salon_service_id,
      element.is_chain,
      element.id,
      element.title,
      element.category_id,
      element.price_min,
      element.price_max,
      element.discount,
      element.comment,
      element.prepaid,
      element.is_multi,
      staff,
      element.duration,
      element.image_group.image.basic
    );

    resultString += `Услуга* ${elem.serviceName}
    Id услуги: ${elem.id}
    Максимальная цена: ${elem.priceMax}
    Комментарий к услуге: ${elem.comment}
    Длительность услуги: ${elem.duration} секунд
    ${staffString}*`;
    resultServices.push(elem);
  });

  return { array: resultServices, prompt: resultString };
}

export const useServices = { extractData };
