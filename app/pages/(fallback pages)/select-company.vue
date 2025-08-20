<script setup lang="ts">
const router = useRouter();
const companyStore = useCompany()


// this function sets Location21 as company
function setCompany() {
  companyStore.companyId.value = 894109;
  router.push("/")
}
</script>
<template>
  <v-container>
    <v-row class="d-flex justify-center">
      <v-col cols="12" md="8" xl="6" class="chat-container">
        <p class="text-h1">Выберите компанию!</p>
        <v-btn @click="setCompany">установить компанию!</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>