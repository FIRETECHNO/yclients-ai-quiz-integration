<script setup lang="ts">
definePageMeta({
  layout: "chat-layout",
});

import { useScroll } from "@vueuse/core";

const chatStore = useChat();
let { messages, hints, isLoadingHistory } = chatStore;
const messagesContainer = ref<HTMLElement | null>(null);

let { y } = useScroll(messagesContainer);

async function processSubmit(question: string) {
  await chatStore.sendMessage(question);
  //await chatStore.setHints();
}
async function scrollToBottom() {
  if (messagesContainer.value) {
    y.value = messagesContainer.value.scrollHeight;
  }
}

onMounted(async () => {
  await chatStore.fetchHistory();
  // await chatStore.setHints();
  scrollToBottom();
});

function onHintClick(index: number) {
  processSubmit(hints.value[index]!);
}
watch(messages, scrollToBottom, { deep: true });
</script>
<template>
  <v-container fluid class="fill-height">
    <v-row class="d-flex justify-center align-center fill-height">
      <v-col cols="12" md="8" xl="6" class="d-flex flex-column fill-height">
        <v-sheet class="d-flex flex-column justify-center fill-height rounded-lg elevation-0" color="#121212">
          <!-- Сообщения -->
          <v-card-text v-if="messages.length > 0" class="flex-grow-1" style="overflow: hidden; padding: 0"
            position="absolute">
            <div ref="messagesContainer" class="h-100 overflow-y-auto" style="padding: 16px">
              <div v-if="isLoadingHistory" class="text-center">
                Загрузка истории...
              </div>
              <div v-else>
                <div v-for="msg of messages" :key="msg._id" class="mb-2">
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
