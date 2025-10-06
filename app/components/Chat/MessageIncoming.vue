<script setup lang="ts">
import { Service } from "~/utils/service";
import ServiceCard from "./ServiceCard.vue";

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
    "Стрижкаффффффффффффффффффффффффффффффффффффффффффффффффффффф",
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
    "https://assets.yclients.com/main_service_image/basic/d/d2/d2399c814d86af5_20240723100059.png"
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
    "https://assets.yclients.com/main_service_image/basic/d/d2/d2399c814d86af5_20240723100059.png"
  ),
]);
function onHintClick(message: IMessage, index: number) {
  console.log(message.payload.recommended_services[index]);
  //focusService.value = message.payload.recommended_services[index];
}
function onFocusServiceClick() {}
function bookService(service: IService) {
  console.log("Запись на сервис:", service);
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
              <ServiceCard :service="service" @book="bookService" />
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
</style>
