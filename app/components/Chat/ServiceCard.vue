<!-- components/ServiceCard.vue -->
<script setup lang="ts">
import type { IShortService } from "~~/server/types/IShortService.interface";

let props = defineProps<{
  service: IShortService;
}>();

const service = props.service;
const router = useRouter()
const { BOOKING_URL } = useYclients()

// 18691150

function toBooking() {
  let serviceUrl = new URL(`company/894109/personal/select-services?o=s${service.id}`, BOOKING_URL).toString()
  router.push(`/booking?url-to-open=${serviceUrl}`)
}
</script>

<template>
  <div class="service-card" @click="toBooking">
    <!-- Фото слева -->
    <div class="service-image" v-if="service.photos && service.photos[0]">
      <img :src="service.photos[0].path" alt="" loading="lazy" />
    </div>

    <!-- Контент справа -->
    <div class="service-content">
      <h3 class="service-title">{{ service.name }}</h3>
      <p v-if="service.description" class="service-desc">{{ service.description }}</p>
      <div class="service-price">{{ service.price }}</div>
    </div>
  </div>
</template>

<style scoped>
.service-card {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #2d2d2d;
  border-radius: 14px;
  max-width: 100%;
  margin-top: 12px;
  border: 1px solid #3c3c3c;
  cursor: pointer;
}

.service-image {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  background: #444;
}

.service-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.service-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.service-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.service-desc {
  font-size: 13px;
  color: #aaa;
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.service-price {
  font-size: 16px;
  font-weight: 700;
  color: #4caf50;
  margin-top: auto;
}
</style>