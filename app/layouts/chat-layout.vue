<script setup lang="ts">
useHead({
  title: 'Location 21 - Чат',
})
</script>
<template>
  <v-responsive>
    <v-app>
      <v-main class="chat-container">
        <slot></slot>
      </v-main>
    </v-app>
  </v-responsive>
</template>
<style scoped lang="scss">
.chat-container {
  height: 100vh;
  overflow-y: hidden;
}
</style>