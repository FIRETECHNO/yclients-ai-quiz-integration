<script setup lang="ts">
defineProps<{ message: IMessage }>();
</script>

<template>
  <v- class="d-flex justify-md-end font-weight-regular" color="#4ac672">Вы</v->
  <div class="d-flex justify-md-end">
    <v-card class="text-card" color="#4ac672" rounded="lg">
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
</style>
