<script setup lang="ts">
definePageMeta({
  layout: "ai"
})

const {
  recommendedServices,
  getRecommendedServices
} = useYclients();

await getRecommendedServices()

// fetchCategories(1444767);

// // Обработчик выбора категории
// async function onCategorySelect() {
//   // Загружаем услуги для выбранной компании и категории
//   await fetchServices(1434780, 0);
// }
onMounted(() => {
  window.addEventListener('message', (event) => {

    // 1. ALWAYS verify the origin for security
    if (event.origin !== 'https://n1595189.yclients.com') {
      console.warn("Message from untrusted origin:", event.origin);
      return;
    }

    if (!event.data || !event.data.type) {
      return;
    }

    switch (event.data.type) {
      case 'record_created':
        const iframeUrl = event.data.url;
        console.log('SUCCESS: Received record id from iframe:', event.data.data.record.id);
        break;

      default:
        // Handle unknown message types
        console.log('Received unknown message type:', event.data.type);
        break;
    }
  });
})
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title class="text-h5 font-weight-bold">
        Выбор услуг
      </v-card-title>
      <v-card-text>
        <iframe height="545px" width="320px" frameborder="0" allowtransparency="true" id="ms_booking_iframe"
          src="https://n1595189.yclients.com"></iframe>

        {{ recommendedServices }}
        <!-- <v-select v-model="selectedCompanyId" :items="companies" item-title="title" item-value="id"
          label="Выберите компанию" variant="outlined" @update:modelValue="onCompanySelect" class="mb-4" />

        <v-select v-model="selectedCategoryId" :items="categories" item-title="title" item-value="id"
          label="Выберите категорию" variant="outlined" :disabled="!categories.length"
          @update:modelValue="onCategorySelect" no-data-text="Сначала выберите компанию" />

        <v-divider class="my-4"></v-divider>

        <h3 class="text-h6 font-weight-medium mb-2">Услуги</h3>

        <v-list lines="two" v-if="services.length > 0">
          <v-list-item v-for="s in services" :key="s.id" :title="s.title">
            <template v-slot:subtitle>
              {{ s.price }} ₽ / {{ s.duration }} мин
            </template>
</v-list-item>
</v-list>

<div v-else class="text-center text-grey pa-4">
  <p v-if="!selectedCategoryId">Выберите категорию, чтобы увидеть услуги</p>
  <p v-else>Услуги в данной категории не найдены</p>
</div> -->

      </v-card-text>
    </v-card>
  </v-container>
</template>