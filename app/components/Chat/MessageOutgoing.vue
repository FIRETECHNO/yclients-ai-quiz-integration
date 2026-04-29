<script setup lang="ts">
import type { IMessage, IMessageDB } from '~/types/message.interface';

defineProps<{ message: IMessageDB | IMessage }>();
</script>

<template>
  <div class="d-flex justify-md-end">
    <v-card class="text-card ios-glass-bubble-out" flat color="transparent" rounded="lg">
      <v-card-text style="overflow-wrap: anywhere" class="msg-text">
        {{ message.content }}
      </v-card-text>
    </v-card>
  </div>
</template>
<style scoped>
.text-card {
  max-width: 75%;
  max-height: 600px;
  width: fit-content;
  height: fit-content;
  overflow: auto;
  border-radius: 20px;
}

.msg-text {
  font-size: clamp(0.9375rem, 0.7884rem + 0.4261vw, 1.125rem);
  color: rgba(255, 255, 255, 0.95);
}
</style>
