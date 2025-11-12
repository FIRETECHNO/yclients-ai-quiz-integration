<script setup lang="ts">
import { toRaw } from "vue";
import { Service } from "~/utils/service";
import ServiceCard from "./ServiceCard.vue";

const props = defineProps<{ message: IMessage }>();
const chatStore = useChat();

const focusService = ref<string | IService | null>(null);

function onServiceClick(service: string | IService) {
  console.log("Clicked service raw:", toRaw(service));
  focusService.value = service;
}

function onFocusServiceClick() {
  if (focusService.value) {
    console.log("Clicked service details:", focusService.value);
  }
}
</script>

<template>
  <div class="d-flex justify-md-start">
    <v-card class="text-card" color="#212121" rounded="lg">
      <!-- Текст от AI -->
      <v-card-text style="overflow-wrap: anywhere">
        {{ message.content }}
      </v-card-text>

      <!-- Список услуг -->
      <v-card v-if="message.payload?.services?.length" class="text-card mt-2" color="#212121" rounded="lg">
        <v-chip v-for="(service, index) in message.payload.services" :key="index" size="x-large"
          @click="onServiceClick(service)" class="mr-2 mb-2" color="green" outlined small clickable>
          {{ service }}
        </v-chip>
      </v-card>

      <!-- Детали выбранной услуги -->
      <v-card v-if="focusService?.length > 0" class="focus-service" @click="onFocusServiceClick" color="gray"
        variant="outlined">
        <v-card-title>
          Процедура:
          {{ focusService }}
        </v-card-title>

        <v-card-text v-if="typeof focusService !== 'string'">
          <div v-if="focusService?.comment">
            <strong>Описание:</strong> {{ focusService.comment }}
          </div>
          <div v-if="focusService?.duration">
            <strong>Длительность:</strong>
            {{ Math.round(focusService.duration / 60) }} минут
          </div>
          <v-img v-if="focusService?.imagePath" :src="focusService.imagePath" alt="service" cover />
        </v-card-text>
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
  <<<<<<< HEAD border: 3px solid #ffffff;
  =======border: 2px solid #4caf50;
  >>>>>>>gleb border-radius: 12px;
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
