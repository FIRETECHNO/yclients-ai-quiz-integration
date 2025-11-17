<script setup lang="ts">
import { toast } from 'vue3-toastify';

const router = useRouter();
const userStore = useUser();

const rawLogin = ref<string>(""); // то, что видит пользователь
const password = ref<string>("");

// Получаем чистый номер (только цифры) из rawLogin
const cleanLogin = computed(() => {
  return rawLogin.value.replace(/\D/g, "");
});

// Обновляем rawLogin, но сохраняем только цифры внутри при отправке
async function auth() {
  const phone = cleanLogin.value;
  if (!phone) {
    toast("Введите номер телефона", { type: "error" });
    return;
  }

  // Mock-ответ (без fetch)
  const res = {
    success: true,
    data: {
      id: Number(phone),
      name: "",
      login: phone, // Только цифры!
      user_token: "mock_token_123"
    }
  };

  if (res.success) {
    userStore.setUser(res.data);
    toast("Успешно!", {
      type: "success",
      autoClose: 50,
      onClose: () => router.push("/chat")
    });
  } else {
    toast("Ошибка авторизации", { type: "error" });
  }
}

// Очистка при потере фокуса (опционально)
function onBlur() {
  rawLogin.value = cleanLogin.value;
}
</script>

<template>
  <v-container class="d-flex justify-center align-center">
    <v-row class="d-flex justify-center align-center">
      <v-col cols="12" md="8" lg="6" xl="4">
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="rawLogin" @blur="onBlur" label="Телефон" placeholder="79123456789" type="tel"
              variant="outlined" maxlength="15"></v-text-field>
            <!-- <v-text-field v-model="password" label="Пароль" type="password"></v-text-field> -->
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