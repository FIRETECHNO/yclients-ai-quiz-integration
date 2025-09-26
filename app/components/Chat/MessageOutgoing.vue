<script setup lang="ts">
defineProps<{ message: IMessage }>();
</script>

<template>
  <div class="d-flex justify-md-end">
    <v-card class="text-card" color="#4ac672" rounded="lg">
      <v-card-item
        class="d-flex justify-md-end font-weight-bold"
        style="font-size: 0.7rem"
        color="#4ac672"
        >Вы</v-card-item
      >
      <v-card-text class="font-weight-medium" style="overflow-wrap: anywhere">
        {{ message.content }}
      </v-card-text>
    </v-card>
  </div>
</template>
<style>
.text-card {
  max-width: 75%;
  max-height: 600px;
  width: fit-content;
  height: fit-content;
  overflow: auto;
}
.message-label {
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 1px;
  color: #333;
}
</style>
