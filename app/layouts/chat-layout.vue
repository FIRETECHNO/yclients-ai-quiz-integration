<script setup lang="ts">
useHead({
  title: 'Location 21 - Чат',
})
</script>

<template>
  <v-responsive>
    <v-app class="ios-chat-app">
      <!-- Atmospheric base (iOS-style depth) -->
      <div
        class="pointer-events-none fixed inset-0 z-0 ios-glass-bg"
        aria-hidden="true"
      />

      <!-- GLOBAL BACKGROUND -->
      <ClientOnly>
        <FlickeringGrid
          class="pointer-events-none fixed inset-0 z-[1] opacity-40 [mask-image:radial-gradient(900px_circle_at_center,white,transparent)]"
          :square-size="8"
          :grid-gap="14"
          color="#7DD3FC"
          :max-opacity="0.2"
          :flicker-chance="0.04"
        />
      </ClientOnly>

      <!-- APP CONTENT -->
      <v-main class="chat-container relative z-10">
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

.ios-chat-app :deep(.v-application__wrap) {
  min-height: 100vh;
}

.ios-chat-app :deep(.v-application) {
  background: transparent !important;
}
</style>
