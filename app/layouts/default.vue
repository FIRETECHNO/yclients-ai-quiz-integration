<script setup lang="ts">
useHead({
  title: 'Location 21 - Запись',
})
</script>

<template>
  <v-responsive>
    <v-app class="ios-landing-app">
      <div
        class="pointer-events-none fixed inset-0 z-0 ios-glass-bg"
        aria-hidden="true"
      />

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

      <v-main class="landing-main relative z-10">
        <slot />
      </v-main>
    </v-app>
  </v-responsive>
</template>

<style scoped lang="scss">
.landing-main {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  padding-top: env(safe-area-inset-top, 0);
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.ios-landing-app :deep(.v-application) {
  background: transparent !important;
}

.ios-landing-app :deep(.v-application__wrap) {
  min-height: 100vh;
}
</style>
