<script setup lang="ts">
defineProps<{ service: IService }>();
const emit = defineEmits<{
  book: [service: IService];
}>();

function bookService(service: IService) {
  emit("book", service);
}
</script>
<template>
  <v-card class="service-card" variant="outlined">
    <v-card-title class="service-title">
      {{ service.serviceName }}
    </v-card-title>
    <v-card-text class="service-content d-flex">
      <div class="image-container">
        <v-img
          v-if="service.imagePath"
          :src="service.imagePath"
          alt="service"
          cover
          class="service-image"
        />
      </div>
      <div class="right-content d-flex flex-column">
        <div class="service-info">
          <div class="service-duration">
            {{ Math.round(service.duration / 60) }} минут
          </div>
          <div class="service-comment">{{ service.priceMax }} ₽</div>
        </div>
        <v-btn class="book-btn" @click.stop="bookService(service)" size="small">
          Запись
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>
<style scoped>
.service-card {
  border: 2px solid #4b4848;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgb(74, 69, 69);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.service-card:hover {
  border-color: #000000;
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.2);
}

.service-title {
  font-size: 1rem;
  font-weight: 600;
  padding: 12px 12px 8px 12px;
  border-bottom: 1px solid #333232;
  word-break: break-word;
  flex-shrink: 0;
  white-space: nowrap;
}

.service-content {
  padding: 12px;
  gap: 12px;
  flex: 1;
  display: flex;
  align-items: stretch;
  min-height: 120px;
}

.image-container {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
}

.service-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  object-position: center;
  border-radius: 4px;
  border: 1px solid #313131;
}

.right-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 80px; /* Такая же высота как у фото */
}

.service-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.service-comment {
  white-space: normal;
  word-break: break-word;
  line-height: 1.4;
  color: #c6c6c6;
  margin: 0;
}

.service-duration {
  font-weight: 500;
  color: #c6c6c6;
  margin: 0;
  margin-bottom: 4px;
}

.book-btn {
  width: 100%;
  border-radius: 6px;
  font-weight: 600;
  text-transform: none;
  margin: 0;
  margin-top: auto;
  flex-shrink: 0;
}
</style>
