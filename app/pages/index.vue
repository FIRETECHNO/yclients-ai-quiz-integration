<script setup lang="ts">
</script>
<template>
  <v-container class="d-flex justify-center align-center">
    <v-row class="d-flex justify-center align-center">
      <v-col cols="12" class="d-flex justify-center" style="margin-top: 30vh;">
        <img src="~/assets/images/Location_White_Color_Logo.png" alt="" class="logo">
      </v-col>
      <v-col cols="12" class="mt-3 d-flex justify-center flex-column align-center">
        <NuxtLink to="https://n962263.yclients.com/company/894109/personal/menu?o=">
          <GradientButton :bg-color="'#000'" :borderRadius="16" :border-width="1.8" :blur="30"
            :colors="['#D9D9D9', '#FF7878', '#FC5B5B', '#FFFFFF']" style="font-weight: 600;">
            Записаться
          </GradientButton>
        </NuxtLink>

        <NuxtLink to="/ai" class="mt-4">
          <GradientButton :bg-color="'#000'" :borderRadius="16" :border-width="1.8" :blur="30"
            :colors="['#D9D9D9', '#FFFFFF', '#FFFFFF', '#FFFFFF']" style="font-weight: 600;">
            Спросить ИИ
          </GradientButton>
        </NuxtLink>
      </v-col>
    </v-row>
  </v-container>
</template>
<style lang="scss" scoped>
.logo {
  width: 50%;
}
</style>