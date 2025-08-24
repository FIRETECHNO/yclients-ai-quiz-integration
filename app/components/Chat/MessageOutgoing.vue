<script setup lang="ts">
defineProps<{ message: IMessage }>();
</script>

<template>
  <div class="d-flex justify-md-end">
    <v-card class="text-card" color="#212121">
      <v-card-text style="overflow-wrap: anywhere">
        {{ message.stringContent }}
      </v-card-text>
    </v-card>
  </div>
</template>
