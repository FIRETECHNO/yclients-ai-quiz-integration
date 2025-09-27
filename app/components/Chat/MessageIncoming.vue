<script setup lang="ts">
import { Service } from '~/utils/service';

defineProps<{ message: IMessage }>();
const chatStore = useChat();
const focusService = ref<IService>(new Service("Стрижка",
      123,
      false,
      2323,
      "Strishka",
      324324,
      0,
      2000,
      0,
      "element.comment",
      "false",
      false,
      [],
      3600,
      "https://assets.yclients.com/main_service_image/basic/5/56/568e4d6379dcf69_20240723100743.png"));
function onHintClick(message: IMessage, index: number) {
  console.log(message.payload.recommended_services[index]);
  //focusService.value = message.payload.recommended_services[index];
}
function onFocusServiceClick(){
  
}
</script>

<template>
  <div class="d-flex justify-md-start">
    <v-card class="text-card" color="#212121" rounded="lg">
      <v-card-text style="overflow-wrap: anywhere">
        {{ message.content }}
      </v-card-text>
      <v-card class="text-card" color="#212121" rounded="lg">
        <v-chip
          v-for="(service, index) of message.payload.services"
          :key="index"
          size="x-large"
          @click="onHintClick(message, index)"
          class="mr-2 mb-2"
          color="green"
          outlined
          small
          clickable
        >
          {{ service.serviceName }}
        </v-chip>
      </v-card>
      <v-card v-if = "focusService != undefined"class="focus-service" @click="onFocusServiceClick()" color = "gray"> 
        <H1>Процедура: {{ focusService.serviceName}}</H1>
        <h2>Описание: {{  focusService.comment}}</h2>
        <h3>Длительность: {{  focusService.duration / 60}} минут</h3>
        <img :src="focusService.imagePath" alt = "service"></img>
      </v-card>
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
  border-radius: 20px;
}
.focus-service{
  margin: 20px;
}
</style>
