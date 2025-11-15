<script setup lang="ts">
import { toast } from 'vue3-toastify';

const router = useRouter()
const userStore = useUser();

let login = ref<string>("")
let password = ref<string>("")

async function auth() {
  let res = await $fetch<{ success: boolean, data: any, meta: any }>("/api/yclients/auth/login", {
    body: {
      login: login.value,
      password: password.value
    },
    method: "POST"
  })

  if (res.success) {
    userStore.setUser({ id: res.data.id, name: res.data.name, login: res.data.login, user_token: res.data.user_token })

    toast("Успешно!", {
      type: "success",
      autoClose: 700,
      onClose: () => {
        router.push("/chat")
      }
    })
  } else {
    // 2FA (201 статус) и 404 обработать
  }
}
</script>
<template>
  <v-container class="d-flex justify-center align-center">
    <v-row class="d-flex justify-center align-center">
      <v-col cols="12" md="8" lg="6" xl="4">
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="login" label="Телефон, email"></v-text-field>
            <v-text-field v-model="password" label="Пароль" type="password"></v-text-field>
          </v-col>
          <v-col cols="12">
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="d-flex justify-center align-center">
            <p class="text-h4 font-weight-bold">Перейти в чат</p>
            <v-btn class="ml-3" append-icon="mdi-arrow-left-bottom" @click="auth">enter</v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
<style lang="scss" scoped></style>