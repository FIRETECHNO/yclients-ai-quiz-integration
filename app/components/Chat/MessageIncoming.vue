<script setup lang="ts">
import { toRaw } from "vue";
import ServiceCard from "./ServiceCard.vue";
import type { IMessageDB } from "~~/server/types/IMessage.interface";
import type { IService } from "~/types/service.interface";
import type { IMessage } from "~/types/message.interface";

const props = defineProps<{ message: IMessageDB | IMessage }>();
const chatStore = useChat();

const focusService = ref<string | null>(null);

function onServiceClick(service: string) {
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
      <div v-if="message?.payload">
        <v-card v-if="message.payload?.services?.length" class="text-card mt-2" color="#212121" rounded="lg">
          <v-chip v-for="(service, index) in message.payload.services" :key="index" size="x-large"
            @click="onServiceClick(service)" class="mr-2 mb-2" color="green" outlined small clickable>
            {{ service }}
          </v-chip>
        </v-card>
      </div>

      <!-- Детали выбранной услуги -->
      <v-card v-if="focusService" class="focus-service" @click="onFocusServiceClick" color="gray" variant="outlined">
        <v-card-title>
          Процедура:
          {{ focusService }}
        </v-card-title>
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
  border: 2px solid #4caf50;
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
