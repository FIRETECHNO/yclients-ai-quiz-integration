<script setup lang="ts">
definePageMeta({
  layout: "chat-layout"
})

const chatStore = useChat();
let { messages } = chatStore;


async function processSubmit(question: string) {
  await chatStore.sendMessage(question);
}
</script>
<template>
  <v-container>
    <v-row class="d-flex justify-center">
      <v-col cols="12" md="8" xl="6" class="chat-container">
        <v-row>
          <v-col v-for="(msg, index) of messages" :key="index" cols="12">
            <!-- входящее сообщение -->
            <ChatMessageIncoming :message="msg" v-if="msg.isIncoming" />
            <!-- входящее сообщение -->

            <!-- исходящее сообщение -->
            <ChatMessageOutgoing :message="msg" v-else />
            <!-- исходящее сообщение -->
          </v-col>
          <v-col cols="12">
            <ChatInput @send-message="processSubmit" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
<style scoped lang="scss">
.chat-container {
  display: flex;
}
</style>