<script setup lang="ts">
definePageMeta({
  layout: "chat-layout"
})

const chatStore = useChat();


async function processSubmit(question: string) {
  await chatStore.sendMessage(new Message(question, {}, true));
}
</script>
<template>
  <v-container>
    <v-row class="d-flex justify-center">
      <v-col cols="12" md="8" xl="6" class="chat-container">
        <ChatInput @submit="processSubmit" />
      </v-col>
    </v-row>
  </v-container>
</template>
<style scoped lang="scss">
.chat-container {
  display: flex;
}
</style>