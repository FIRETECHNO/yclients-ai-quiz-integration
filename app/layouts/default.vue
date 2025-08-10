<script setup lang="ts">
useHead({
  title: 'Location 21 - Запись',
})
</script>
<template>
  <div class="lamp-background">
    <slot></slot>
  </div>
</template>
<style scoped lang="scss">
.lamp-background {
  height: 100dvh;
  width: 100dvw;
  background-image: url('~/assets/images/lamp-background.jpg');
  background-size: cover;
}
</style>