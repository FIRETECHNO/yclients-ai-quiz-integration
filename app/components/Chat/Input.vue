<script setup lang="ts">
let question = ref<string>("");
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
        :color="accent"
        class="flex-shrink-0"
        @click="$emit('Submit', question.value)"
        height="60"
        width="40"
      >
        <v-icon style="font-size: 40px; width: 100%; height: 100%">
          mdi-arrow-up-circle-outline
        </v-icon></v-btn
      >
    </div>
  </v-form>
</template>
