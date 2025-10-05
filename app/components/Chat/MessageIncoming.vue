<script setup lang="ts">
import { Service } from "~/utils/service";

defineProps<{ message: IMessage }>();
const chatStore = useChat();
const focusService = ref<IService[]>([
  new Service(
    "Стрижка",
    123,
    false,
    2323,
    "Strishka",
    324324,
    0,
    2000,
    0,
    "element.comment",
    "false",
    false,
    [],
    3600,
    "https://assets.yclients.com/main_service_image/basic/5/56/568e4d6379dcf69_20240723100743.png"
  ),
  new Service(
    "Стрижка",
    123,
    false,
    2323,
    "Strishka",
    324324,
    0,
    2000,
    0,
    "element.comment",
    "false",
    false,
    [],
    3600,
    "https://assets.yclients.com/main_service_image/basic/5/56/568e4d6379dcf69_20240723100743.png"
  ),
  new Service(
    "Стрижка",
    123,
    false,
    2323,
    "Strishka",
    324324,
    0,
    2000,
    0,
    "element.comment",
    "false",
    false,
    [],
    3600,
    "https://assets.yclients.com/main_service_image/basic/5/56/568e4d6379dcf69_20240723100743.png"
  ),
  new Service(
    "Стрижка",
    123,
    false,
    2323,
    "Strishka",
    324324,
    0,
    2000,
    0,
    "element.comment",
    "false",
    false,
    [],
    3600,
    "https://assets.yclients.com/main_service_image/basic/5/56/568e4d6379dcf69_20240723100743.png"
  ),
  new Service(
    "Стрижка",
    123,
    false,
    2323,
    "Strishka",
    324324,
    0,
    2000,
    0,
    "element.comment",
    "false",
    false,
    [],
    3600,
    "https://assets.yclients.com/main_service_image/basic/5/56/568e4d6379dcf69_20240723100743.png"
  ),
]);
function onHintClick(message: IMessage, index: number) {
  console.log(message.payload.recommended_services[index]);
  //focusService.value = message.payload.recommended_services[index];
}
function onFocusServiceClick() {}
function bookService(service: IService) {
  // Ваш метод для записи на сервис
  console.log("Запись на сервис:", service);
  // Например: this.$router.push('/booking') или вызов API
}
</script>

<template>
  <div class="d-flex justify-md-start">
    <v-card class="text-card" color="#212121" rounded="lg">
      <v-card-text style="overflow-wrap: anywhere">
        {{ message.content }}
      </v-card-text>
      <v-card class="text-card" color="#212121" rounded="lg">
        <v-chip
          v-for="(service, index) of message.payload.services"
          :key="index"
          size="x-large"
          @click="onHintClick(message, index)"
          class="mr-2 mb-2"
          color="green"
          outlined
          small
          clickable
        >
          {{ service.serviceName }}
        </v-chip>
      </v-card>
      <v-card
        v-if="focusService.length > 0"
        class="focus-service"
        color="gray"
        variant="outlined"
      >
        <div class="scroll-container">
          <v-row class="flex-nowrap">
            <v-col
              v-for="service in focusService"
              :key="service.id"
              class="flex-shrink-0 service-item-col"
            >
              <v-card class="service-card" variant="outlined">
                <v-card-title class="service-title">
                  {{ service.serviceName }}
                </v-card-title>
                <v-card-text class="service-content d-flex align-stretch">
                  <div class="image-container">
                    <v-img
                      v-if="service.imagePath"
                      :src="service.imagePath"
                      alt="service"
                      cover
                      class="service-image"
                    />
                  </div>
                  <div class="service-info d-flex flex-column">
                    <div class="service-duration">
                      {{ Math.round(service.duration / 60) }} минут
                    </div>
                    <div class="service-comment">{{ service.priceMax }}</div>
                    <div class="flex-grow-1"></div>
                    <v-btn
                      class="book-btn mt-2"
                      @click.stop="bookService(service)"
                      size="small"
                    >
                      Запись
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card>
    </v-card>
  </div>
</template>

<style scoped>
.text-card {
  max-width: 75%;
  max-height: 600px;
  width: fit-content;
  height: fit-content;
  overflow: auto;
  border-radius: 20px;
}

.focus-service {
  margin: 20px;
  border: 3px solid #ffffff;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  max-width: 400px;
  max-height: 400px;
}

.scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  padding: 8px;
}

.service-item-col {
  width: 90%;
  min-width: 60%;
  padding: 8px;
}

.service-card {
  border: 2px solid #4b4848;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgb(74, 69, 69);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.service-card:hover {
  border-color: #000000;
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.2);
}

.service-title {
  font-size: 1rem;
  font-weight: 600;
  padding: 12px 12px 8px 12px;
  border-bottom: 1px solid #333232;
  white-space: normal;
  word-break: break-word;
  flex-shrink: 0;
}

.service-content {
  padding: 12px;
  gap: 12px;
  flex: 1;
  display: flex;
  align-items: stretch;
  min-height: 120px;
}

.image-container {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.service-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  object-position: center;
  border-radius: 4px;
  border: 1px solid #313131;
}

.service-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-top: 10px;
}

.service-comment {
  white-space: normal;
  word-break: break-word;
  line-height: 1.4;
  margin-top: 8px;
  color: #c6c6c6;
}

.service-duration {
  font-weight: 500;
  color: #c6c6c6;
  margin-top: 8px;
}

.book-btn {
  width: 100%;
  border-radius: 6px;
  font-weight: 600;
  text-transform: none;
  flex-shrink: 0;
}

.flex-grow-1 {
  flex-grow: 1;
}

/* Стили для скроллбара */
.scroll-container::-webkit-scrollbar {
  height: 8px;
}

.scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.scroll-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.flex-nowrap {
  flex-wrap: nowrap !important;
}
</style>
