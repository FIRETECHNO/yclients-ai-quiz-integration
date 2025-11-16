<script setup lang="ts">
import { toRaw } from "vue";
import ServiceCard from "./ServiceCard.vue";
import type { IMessageDB } from "~~/server/types/IMessage.interface";
import type { IMessage } from "~/types/message.interface";
import type { IShortService } from "~~/server/types/IShortService.interface";

const props = defineProps<{ message: IMessageDB | IMessage }>();
const chatStore = useChat();
const serviceStore = useServices()

let servicesToShow = computed<IShortService[]>(() => {
  let res: IShortService[] = []
  if (!props.message.payload?.services) {
    return []
  }
  for (let id of props.message.payload?.services) {
    let found = serviceStore.getServiceById(id);
    if (found) {
      res.push(found)
    }
  }

  return res
})
</script>

<template>
  <div class="d-flex justify-md-start">
    <v-card class="text-card" color="#212121" rounded="lg">
      <!-- Текст от AI -->
      <v-card-text style="overflow-wrap: anywhere" class="msg-text">
        <p class="ai-response" v-html="message.content"></p>
      </v-card-text>

      <!-- Карточки услуг -->
      <div v-for="service in servicesToShow" :key="service.id" class="px-4 pb-2">
        <ChatServiceCard :service="service" />
      </div>
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

.msg-text {
  font-size: clamp(0.9375rem, 0.7884rem + 0.4261vw, 1.125rem);
}

.ai-response :deep(a) {
  color: #e53935;
  text-decoration: none;
  font-weight: 600;
  border-bottom: 1px dashed #e53935;
}

.ai-response :deep(a:hover) {
  opacity: 0.8;
}
</style>
