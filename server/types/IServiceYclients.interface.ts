// Минимальный интерфейс изображения
export interface IYclientsImage {
  path: string;
}

// Группа изображений (только id и basic-картинка)
export interface IYclientsImageGroup {
  id: number;
  images: {
    basic: IYclientsImage;
  };
}

// Минимальный мастер
export interface IYclientsStaff {
  id: number;
  name: string;
  image_url: string;
}

// Основной интерфейс услуги — только нужное
export interface IYclientsService {
  id: number;
  title: string;
  booking_title: string;
  category_id: number;
  price_min: number;
  price_max: number;
  discount: number;
  comment: string;
  duration: number;           // в секундах
  prepaid: string;           // "forbidden" | "required" | ...
  is_online: boolean;        // можно ли записаться онлайн
  active: number;            // 1 = активна
  staff: IYclientsStaff[];
  image_group: IYclientsImageGroup | null;
}