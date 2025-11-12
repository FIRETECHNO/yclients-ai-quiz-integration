export interface IShortImage {
  path: string;
}

export interface IShortStaff {
  id: number;
  name: string;
  photo: string; // image_url
}

export interface IShortService {
  id: number
  name: string;           // booking_title или title
  description: string;    // comment
  durationMinutes: number;// duration / 60
  price: string;          // "2000 ₽" или "1800 – 2500 ₽"
  photos: IShortImage[];  // массив (вдруг будет несколько)
  staff: IShortStaff[];  // персонал
}