<script setup lang="ts">
definePageMeta({
  layout: "chat-layout",
  middleware: ["have-access-to-chat"]
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
  <v-container fluid class="fill-height chat-page-ios">
    <v-row class="d-flex justify-center align-center fill-height">
      <v-col cols="12" md="8" xl="6" class="d-flex flex-column fill-height px-3 px-md-4">
        <v-sheet
          class="chat-glass-column d-flex flex-column justify-center fill-height rounded-[28px] elevation-0 overflow-hidden ios-glass-panel"
          color="transparent"
        >

          <!-- Сообщения -->
          <v-card-text v-if="messages.length > 0" class="flex-grow-1 chat-messages-area" style="overflow: hidden; padding: 0"
            position="absolute">
            <div ref="messagesContainer" class="h-100 overflow-y-auto chat-messages-scroll">
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
          <div v-else class="relative flex min-h-[420px] flex-1 w-full items-center justify-center overflow-hidden flex-column px-6 py-12">
            <span class="pointer-events-none z-10 text-center text-3xl font-semibold leading-tight tracking-tight text-white/95 drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]">
              Добро пожаловать
            </span>
            <span class="mt-4 pointer-events-none z-10 text-center text-lg font-medium leading-snug text-white/65 max-w-md">
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
          <div class="position-relative chat-input-stack flex-shrink-0">
            <!-- Подсказки поверх поля ввода -->
            <div v-if="hints.length > 0" class="hints-floating">
              <v-chip
                v-for="(quest, index) of hints"
                :key="index"
                size="large"
                class="mr-2 mb-2 ios-glass-chip"
                variant="flat"
                clickable
                @click="onHintClick(index)"
              >
                {{ quest }}
              </v-chip>
            </div>

            <!-- Поле ввода -->
            <v-card-actions class="chat-input-dock ios-glass-dock pa-3 pa-md-4">
              <ChatInput @send-message="processSubmit" class="w-100" />
            </v-card-actions>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped lang="scss">
.chat-page-ios :deep(.v-container) {
  max-width: 100%;
}

.chat-glass-column {
  min-height: 0;
}

.chat-messages-area {
  padding-bottom: 0 !important;
}

.chat-messages-scroll {
  padding: 20px 18px 12px;
}

.chat-input-dock {
  border-radius: 22px 22px 0 0;
  border-bottom: none;
}

.chat-input-stack {
  margin-top: auto;
}

.hints-floating {
  position: absolute;
  bottom: 100%;
  right: 8px;
  left: 8px;
  z-index: 1000;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  padding: 8px 8px 12px;
  overflow-y: auto;
  gap: 4px;
}
</style>
