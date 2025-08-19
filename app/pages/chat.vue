<script setup lang="ts">
definePageMeta({
  layout: "chat-layout"
})
</script>
<template>
  <v-container>
    <v-row class="d-flex justify-center">
      <v-col cols="12" md="8" xl="6" class="chat-container">
        <ChatInput />
      </v-col>
    </v-row>
  </v-container>
</template>
<style scoped lang="scss">
.chat-container {
  // background-color: ;
  display: flex;
  height: 140dvh;
}
</style>