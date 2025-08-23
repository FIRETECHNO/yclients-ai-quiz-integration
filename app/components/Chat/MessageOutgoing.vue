<script setup lang="ts">
defineProps<{ message: IMessage }>();
</script>

<template>
  <div class="d-flex justify-md-end">
    <v-card class="text-card">
      <v-card-text>
        <slot>{{ message.stringContent }}</slot>
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
  text-align: left;
}
</style>
