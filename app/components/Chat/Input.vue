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
  <v-form class="w-100" @submit.prevent="submit">
    <div class="d-flex align-center justify-center w-100">
      <v-text-field class="flex-grow-1 mr-2" placeholder="Вопрос" v-model="question" variant="outlined" hide-details
        rounded="lg" />
      <v-btn class="flex-shrink-0" height="60" width="40" type="submit" :disabled="question.length == 0"
        :loading="chatStatus == 'ai-thinking'">
        <v-icon size="35"> mdi-arrow-up-circle-outline </v-icon></v-btn>
    </div>
  </v-form>
</template>
