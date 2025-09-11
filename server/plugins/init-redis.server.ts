// server/plugins/init-redis.server.ts

// Импортируем наши хелперы для работы с Redis
import { useRedis } from "../utils/redis";
import { useServices } from "../utils/services";
import services from "../utils/seeds/services";
// defineNitroPlugin - это специальная обертка, которая говорит Nuxt,
// что это серверный плагин.
export default defineNitroPlugin(async (nitroApp) => {
  // Этот код выполнится ровно один раз, когда сервер Nitro (сердце Nuxt) будет запущен.
  console.log("🚀 Серверный плагин запущен! Начинаем инициализацию данных...");
  //const { array } = useServices.extractData(services);
  //useRedis.saveItemsToHash("services", array);
  try {
    // Здесь может быть любая другая логика:
    // - Подключение к другим базам данных
    // - "Прогрев" кэша с данными о компаниях из MongoDB
    // - Запуск фоновых задач
  } catch (error) {
    console.error(
      "❌ Ошибка во время выполнения серверного плагина инициализации:",
      error
    );
  }
});
