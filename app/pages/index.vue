<script setup lang="ts">
definePageMeta({
  layout: "chat-layout",
});
// import {
//   PATTERN_BACKGROUND_DIRECTION,
//   PATTERN_BACKGROUND_SPEED,
//   PATTERN_BACKGROUND_VARIANT,
// } from "../../ui/pattern-background";
import { useScroll } from "@vueuse/core";

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
        <v-sheet class="d-flex flex-column justify-center fill-height rounded-lg elevation-0" color="transparent">

          <!-- Сообщения -->
          <v-card-text v-if="messages.length > 0" class="flex-grow-1" style="overflow: hidden; padding: 0"
            position="absolute">
            <div ref="messagesContainer" class="h-100 overflow-y-auto" style="padding: 16px">
              <div v-if="isLoadingHistory" class="text-center">
                Загрузка истории...
              </div>
              <div v-else>
                <div v-for="(msg, index) of messages" :key="index" class="mb-2">
                  <ChatMessageIncoming v-if="msg.isIncoming" :message="msg" />
                  <ChatMessageOutgoing v-else :message="msg" />
                </div>
              </div>
            </div>
          </v-card-text>
          <div v-else class="relative flex h-[500px] w-full items-center justify-center overflow-hidden flex-column">
            <span class="pointer-events-none z-10 bg-gradient-to-b from-white to-white/70
         bg-clip-text text-transparent text-center text-3xl font-semibold leading-none drop-shadow-md">
              Добро пожаловать
            </span>
            <span class="mt-6 pointer-events-none z-10 bg-gradient-to-b from-white to-white/70
         bg-clip-text text-transparent text-center text-2xl font-semibold leading-none drop-shadow-md">
              Новая степень комфорта и стрижки для вас
            </span>
          </div>

          <!-- <v-card-text v-if="messages.length == 0" class="d-flex align-center justify-center">
            <PatternBackground :animate="true" :direction="PATTERN_BACKGROUND_DIRECTION.TopRight"
              :variant="PATTERN_BACKGROUND_VARIANT.Dot" class="flex h-[36rem] w-full items-center justify-center"
              :speed="PATTERN_BACKGROUND_SPEED.Slow">
              <p
                class="relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 text-4xl font-bold text-transparent sm:text-5xl">
                Dot Background
              </p>
            </PatternBackground>
          </v-card-text> -->


          <!-- <p class="text-h4 font-weight-medium">Добро пожаловать</p> -->

          <!-- Элементы для взаимодействия -->
          <div class="position-relative">
            <!-- Подсказки поверх поля ввода -->
            <div v-if="hints.length > 0" class="hints-floating">
              <v-chip v-for="(quest, index) of hints" :key="index" size="x-large" @click="onHintClick(index)"
                class="mr-2 mb-2" color="green" outlined small clickable>
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
