import { createClient } from "redis";

// Данные для разных компаний
const companyData = [
  {
    id: 125616,
    data: {
      name: "Денди",
      address: "г. Москва, ул. Тверская, 15",
      services: [{ name: "Мужская стрижка", price: "2000 руб." }, { name: "Стрижка бороды", price: "1500 руб." }, { name: "Королевское бритье", price: "2500 руб." }],
      specialOffers: "Скидка 20% на первое посещение по промокоду 'ПЕРВЫЙРАЗ'.",
      workingHours: "Ежедневно с 10:00 до 22:00",
    }
  },
  {
    id: 812727,
    data: {
      name: "Афродита",
      address: "г. Санкт-Петербург, Невский пр., 30",
      services: [{ name: "Маникюр", price: "1800 руб." }, { name: "Укладка волос", price: "2200 руб." }, { name: "Окрашивание", price: "от 4000 руб." }],
      specialOffers: "При окрашивании укладка в подарок.",
      workingHours: "Пн-Сб с 09:00 до 21:00",
    }
  }
];

async function seed() {
  const client = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
  await client.connect();

  for (const company of companyData) {
    // Ключ будет вида "company:barbershop-dandy"
    await client.set(`company:${company.id}`, JSON.stringify(company.data));
    console.log(`Данные для компании "${company.data.name}" загружены.`);
  }

  await client.disconnect();
}

seed();