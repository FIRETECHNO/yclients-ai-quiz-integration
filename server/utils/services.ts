import { IShortService, IShortImage, IShortStaff } from '~~/server/types/IShortService.interface'
import { IYclientsService } from '../types/IServiceYclients.interface';


function simplifyService(raw: IYclientsService): IShortService {
  // 0. id услуги
  const id = raw.id;

  // 1. Название
  const name = raw.booking_title || raw.title || 'Без названия';

  // 2. Описание
  const description = raw.comment?.trim() || 'Описание отсутствует';

  // 3. Длительность в минутах
  const durationMinutes = Math.round((raw.duration || 0) / 60);

  // 4. Цена
  const min = raw.price_min ?? 0;
  const max = raw.price_max ?? 0;
  const price = min === max
    ? `${min} ₽`
    : `${min} – ${max} ₽`;

  // 5. Фотографии (берём basic, если есть)
  const photos: IShortImage[] = [];
  if (raw.image_group?.images?.basic?.path) {
    photos.push({ path: raw.image_group.images.basic.path });
  }
  // Если вдруг есть другие версии — можно добавить
  // (пока только basic)

  // 6. Персонал
  const staff: IShortStaff[] = (raw.staff || []).map((s: any) => ({
    id: s.id,
    name: s.name || 'Без имени',
    photo: s.image_url || '',
  }));

  return {
    id,
    name,
    description,
    durationMinutes,
    price,
    photos,
    staff,
  };
}
// Если нужно обработать массив услуг:

function simplifyServicesList(rawList: any[]): IShortService[] {
  return rawList
    .filter(service => service.active === 1 && service.is_online !== false)
    .map(simplifyService);
}

function createServicesPrompt(services: IShortService[]): string {
  const shortList = services.map(s => ({
    id: s.id,
    name: s.name,
    price: s.price,
    durationMinutes: s.durationMinutes,
    staff: s.staff.map(st => st.name).join('|') || 'любой',
  }));

  const jsonCompact = JSON.stringify(shortList);
  return jsonCompact
}

export const useServices = {
  simplifyServicesList, createServicesPrompt
}