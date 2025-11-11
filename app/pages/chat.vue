<script setup lang="ts">
definePageMeta({
  layout: "chat-layout",
});

import { useScroll } from "@vueuse/core";
import { ref, onMounted, watch, nextTick } from "vue";

const chatStore = useChat();
const { messages, hints, isLoadingHistory } = chatStore;

const messagesContainer = ref<HTMLElement | null>(null);

async function processSubmit(question: string) {
  console.log("[ChatPage] Отправка вопроса:", question);
  try {
    await chatStore.sendMessage(question);
    console.log("[ChatPage] Сообщение отправлено, сообщений теперь:", messages.value.length);
    await nextTick();
    scrollToBottom();
  } catch (err) {
    console.error("[ChatPage] Ошибка при отправке:", err);
  }
}

function scrollToBottom() {
  try {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      console.log("[ChatPage] Скролл вниз, scrollHeight:", messagesContainer.value.scrollHeight);
    } else {
      console.warn("[ChatPage] scrollToBottom: контейнер не найден");
    }
  } catch (err) {
    console.error("[ChatPage] scrollToBottom error:", err);
  }
}

onMounted(async () => {
  console.log("[ChatPage] onMounted → загружаем историю");
  await chatStore.fetchHistory();
  console.log("[ChatPage] История загружена, сообщений:", messages.value.length);
  await nextTick();
  scrollToBottom();
});

function onHintClick(index: number) {
  const hint = hints.value[index];
  console.log("[ChatPage] Клик по подсказке:", hint);
  if (hint) processSubmit(hint);
}

// Правильный watch — следим за изменениями массива сообщений
watch(
  () => messages.value,
  (newVal, oldVal) => {
    console.log("[ChatPage] watch(messages) → новое количество сообщений:", newVal.length);
    nextTick().then(scrollToBottom);
  },
  { deep: true }
);
</script>

<template>
  <v-container fluid class="fill-height">
    <v-row class="d-flex justify-center align-center fill-height">
      <v-col cols="12" md="8" xl="6" class="d-flex flex-column fill-height">
        <v-sheet
          class="d-flex flex-column justify-center fill-height rounded-lg elevation-0"
          color="#121212"
        >
          <!-- Сообщения -->
          <v-card-text
            v-if="messages.length > 0"
            class="flex-grow-1"
            style="overflow: hidden; padding: 0"
            position="absolute"
          >
            <div
              ref="messagesContainer"
              class="h-100 overflow-y-auto"
              style="padding: 16px"
            >
              <div v-if="isLoadingHistory" class="text-center">
                Загрузка истории...
              </div>
              <div v-else>
                <div
                  v-for="msg of messages"
                  :key="msg._id"
                  class="mb-2"
                >
                  <ChatMessageIncoming v-if="msg.isIncoming" :message="msg" />
                  <ChatMessageOutgoing v-else :message="msg" />
                </div>
              </div>
            </div>
          </v-card-text>

          <!-- Элементы для взаимодействия -->
          <div class="position-relative">
            <!-- Подсказки поверх поля ввода -->
            <div v-if="hints.length > 0" class="hints-floating">
              <v-chip
                v-for="(quest, index) of hints"
                :key="index"
                size="x-large"
                @click="onHintClick(index)"
                class="mr-2 mb-2"
                color="green"
                outlined
                small
                clickable
              >
                {{ quest }}
              </v-chip>
            </div>

            <!-- Поле ввода -->
            <v-card-actions>
              <ChatInput @send-message="processSubmit" class="w-100" />
            </v-card-actions>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped lang="scss">
.hints-floating {
  position: absolute;
  bottom: 100%;
  right: 16px;
  z-index: 1000;
  display: flex;
  flex-wrap: wrap;
  padding: 8px 16px;
  overflow-y: auto;
}
</style>
