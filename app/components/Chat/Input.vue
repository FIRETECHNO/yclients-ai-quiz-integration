<script setup lang="ts">
const emit = defineEmits(["send-message"])

const question = ref<string>("");
let { chatStatus } = useChat();

function submit() {
  emit("send-message", question.value)
  question.value = ""
}
</script>
<template>
  <v-form class="w-100 chat-input-form" @submit.prevent="submit">
    <div class="d-flex align-center gap-2 w-100">
      <v-text-field
        v-model="question"
        class="flex-grow-1 chat-glass-textfield"
        placeholder="Вопрос"
        variant="solo-filled"
        flat
        hide-details
        rounded="xl"
        density="comfortable"
        bg-color="transparent"
      />
      <v-btn
        class="chat-send-fab flex-shrink-0"
        height="52"
        width="52"
        min-width="52"
        rounded="xl"
        type="submit"
        :disabled="question.length == 0"
        :loading="chatStatus == 'ai-thinking'"
        icon
      >
        <v-icon size="26">mdi-arrow-up</v-icon>
      </v-btn>
    </div>
  </v-form>
</template>

<style scoped lang="scss">
.chat-input-form :deep(.chat-glass-textfield .v-field) {
  border-radius: 18px !important;
  background: rgba(255, 255, 255, 0.08) !important;
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  backdrop-filter: blur(16px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.chat-input-form :deep(.chat-glass-textfield .v-field__input) {
  color: rgba(255, 255, 255, 0.95);
  min-height: 48px;
  padding-top: 10px;
  padding-bottom: 10px;
}

.chat-input-form :deep(.chat-glass-textfield input::placeholder) {
  color: rgba(255, 255, 255, 0.38);
  opacity: 1;
}

.chat-send-fab {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.06)) !important;
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  color: rgba(255, 255, 255, 0.95) !important;
}

.chat-send-fab:disabled {
  opacity: 0.45;
}
</style>
