<script setup lang="ts">
definePageMeta({
  layout: "chat-layout",
});

const chatStore = useChat();
let { messages } = chatStore;

async function processSubmit(question: string) {
  await chatStore.sendMessage(question);
  await chatStore.setAiMessage(question, {}); //For test
}

async function testReq() {
  const { output } = await $fetch<any>("/api/gigachat/chat", {
    method: "POST",
    body: {
      messages: [{ role: "user", content: "Привет! Что можешь?" }],
    },
  });

  console.log(output);
}
</script>
<template>
  <v-container fluid class="fill-height">
    <v-row class="d-flex justify-center align-center fill-height">
      <v-col cols="12" md="8" xl="6" class="fill-height">
        <v-sheet class="d-flex flex-column fill-height rounded-lg elevation-2" color="#121212">
          <!-- Сообщения -->
          <v-card-text class="flex-grow-1 overflow-y-auto">
            <div v-for="(msg, index) of messages" :key="index" class="mb-2">
              <ChatMessageIncoming v-if="msg.isIncoming" :message="msg" />
              <ChatMessageOutgoing v-else :message="msg" />
            </div>
          </v-card-text>

          <!-- Поле ввода -->
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn @click="testReq">test req</v-btn>
            <ChatInput @send-message="processSubmit" class="w-100" />
          </v-card-actions>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
<style scoped lang="scss"></style>
