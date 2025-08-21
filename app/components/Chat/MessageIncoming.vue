<script setup lang="ts">
defineProps<{ message: IMessage }>()
</script>
<template>
  <div>
    {{ message }}
  </div>
</template>