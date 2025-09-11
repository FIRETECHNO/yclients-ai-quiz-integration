<script setup lang="ts">
defineProps<{ message: IMessage }>();
const chatStore = useChat();
function onHintClick(message: IMessage, index: number) {
  console.log(message.payload.recommended_services[index]);
}
</script>

<template>
  <div class="d-flex justify-md-start">
    <v-card class="text-card" color="#212121" rounded="lg">
      <v-card-text style="overflow-wrap: anywhere">
        {{ message.content }}
      </v-card-text>
      <v-chip
        v-for="(service, index) of message.payload.services"
        :key="index"
        size="x-large"
        @click="onHintClick(message, index)"
        class="mr-2 mb-2"
        color="green"
        outlined
        small
        clickable
      >
        {{ service.serviceName }}
      </v-chip>
    </v-card>
  </div>
</template>
<style>
.text-card {
  max-width: 75%;
  max-height: 600px;
  width: fit-content;
  height: fit-content;
  overflow: auto;
  border-radius: 20px;
}
</style>
