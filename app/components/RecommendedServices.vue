<script setup lang="ts">
const {
  recommendedServices,
  getRecommendedServices
} = useYclients();

await getRecommendedServices()
</script>
<template>
  {{ recommendedServices }}
</template>