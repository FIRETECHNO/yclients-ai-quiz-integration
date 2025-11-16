<script setup lang="ts">
useHead({
  title: 'Location 21 - Чат',
})
</script>

<template>
  <v-responsive>
    <v-app>

      <!-- GLOBAL BACKGROUND -->
      <ClientOnly>
        <FlickeringGrid class="pointer-events-none fixed inset-0 z-0 opacity-60
                 [mask-image:radial-gradient(900px_circle_at_center,white,transparent)]" :square-size="4"
          :grid-gap="10" color="#60A5FA" :max-opacity="0.3" :flicker-chance="0.1" :width="2000" :height="2000" />
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
</style>
