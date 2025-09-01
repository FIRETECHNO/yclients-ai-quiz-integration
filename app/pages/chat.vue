<script setup lang="ts">
definePageMeta({
  layout: "chat-layout",
});

import { useScroll } from '@vueuse/core';


const chatStore = useChat();
let { messages, isLoadingHistory, fetchHistory } = chatStore;
const messagesContainer = ref<HTMLElement | null>(null);

let { y } = useScroll(messagesContainer);

async function processSubmit(question: string) {
  await chatStore.sendMessage(question);
}
async function scrollToBottom() {
  if (messagesContainer.value) {
    y.value = messagesContainer.value.scrollHeight;
  }
};


onMounted(async () => {
  await fetchHistory();
  scrollToBottom();
})

watch(messages, scrollToBottom, { deep: true });
</script>
<template>
  <v-container fluid class="fill-height">
    <v-row class="d-flex justify-center align-center fill-height">
      <v-col cols="12" md="8" xl="6" class=" d-flex flex-column fill-height">
        <v-sheet class="d-flex flex-column justify-center fill-height rounded-lg elevation-0" color="#121212">
          <!-- Сообщения -->
          <v-card-text v-if="messages.length > 0" class="flex-grow-1" style="overflow: hidden; padding: 0;">
            <div ref="messagesContainer" class="h-100 overflow-y-auto" style="padding: 16px;">
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
          <!-- Поле ввода -->
          <v-card-actions>
            <ChatInput @send-message="processSubmit" class="w-100" />
          </v-card-actions>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
<style scoped lang="scss"></style>
