<script setup lang="ts">
const question = ref<string>("");
</script>
<template>
  <v-form class="w-100">
    <div class="d-flex align-center justify-center w-100">
      <v-text-field
        class="flex-grow-1 mr-2"
        placeholder="Вопрос"
        v-model="question"
        variant="outlined"
        hide-details
      />
      <v-btn
        class="flex-shrink-0"
        @click="$emit('Submit', question.valueOf())"
        height="60"
        width="40"
      >
        <v-icon size="40"> mdi-arrow-up-circle-outline </v-icon></v-btn
      >
    </div>
  </v-form>
</template>
