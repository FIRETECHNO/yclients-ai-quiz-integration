<script setup lang="ts">
import { toast } from 'vue3-toastify';

const router = useRouter();
const userStore = useUser();

const PHONE_STORAGE_KEY = "yclients-ai-quiz:home-phone";

const rawLogin = ref<string>("");

const cleanLogin = computed(() => {
  return rawLogin.value.replace(/\D/g, "");
});

function persistPhone(value: string) {
  if (!import.meta.client) return;
  try {
    if (value.trim() === "") {
      localStorage.removeItem(PHONE_STORAGE_KEY);
    } else {
      localStorage.setItem(PHONE_STORAGE_KEY, value);
    }
  } catch {
    /* ignore quota / private mode */
  }
}

onMounted(() => {
  if (!import.meta.client) return;
  try {
    const saved = localStorage.getItem(PHONE_STORAGE_KEY);
    if (saved != null && saved !== "") {
      rawLogin.value = saved;
    }
  } catch {
    /* ignore */
  }
});

watch(rawLogin, (v) => {
  persistPhone(v);
});

async function auth() {
  const phone = cleanLogin.value;
  if (!phone) {
    toast("Введите номер телефона", { type: "error" });
    return;
  }

  const res = {
    success: true,
    data: {
      id: Number(phone),
      name: "",
      login: phone,
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

function onBlur() {
  rawLogin.value = cleanLogin.value;
}
</script>

<template>
  <v-container fluid class="home-root px-4 px-md-6">
    <v-row justify="center" align="center" class="min-h-0 flex-grow-1">
      <v-col cols="12" sm="11" md="9" lg="7" xl="5" class="py-6 py-md-10">
        <!-- Приветствие -->
        <section
          class="home-welcome ios-glass-panel rounded-3xl pa-6 pa-md-8 mb-5 mb-md-6"
          aria-labelledby="home-welcome-title"
        >
          <p
            id="home-welcome-title"
            class="text-overline text-white/50 letter-spacing-sm mb-2"
          >
            Location 21
          </p>
          <h1 class="text-h4 font-weight-semibold text-white mb-4">
            Помощник для записи
          </h1>
          <p class="text-body-1 text-white/80 mb-0 leading-relaxed">
            Это ваш помощник: он поможет с записью в барбершоп и покажет то, что вы, возможно,
            ещё не знали — и о стрижке, и о вашем любимом барбершопе.
          </p>
        </section>

        <!-- Форма входа -->
        <section
          class="home-auth ios-glass-panel rounded-3xl pa-6 pa-md-8"
          aria-label="Вход по номеру телефона"
        >
          <p class="text-subtitle-2 text-white/70 mb-4">
            Введите телефон, чтобы перейти в чат
          </p>
          <v-form @submit.prevent="auth">
            <v-text-field
              v-model="rawLogin"
              class="home-glass-field mb-5"
              label="Телефон"
              placeholder="79123456789"
              type="tel"
              variant="solo-filled"
              flat
              hide-details
              maxlength="15"
              rounded="xl"
              density="comfortable"
              bg-color="transparent"
              autocomplete="tel"
              @blur="onBlur"
            />
            <v-btn
              block
              size="large"
              rounded="xl"
              height="52"
              type="submit"
              class="home-enter-btn text-none font-weight-semibold"
              append-icon="mdi-arrow-right"
            >
              Перейти в чат
            </v-btn>
          </v-form>
        </section>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped lang="scss">
.home-root {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.letter-spacing-sm {
  letter-spacing: 0.12em;
}

.home-enter-btn {
  background: linear-gradient(
    180deg,
    rgba(10, 132, 255, 0.55),
    rgba(10, 132, 255, 0.22)
  ) !important;
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.22) !important;
  box-shadow: 0 6px 24px rgba(0, 80, 180, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.98) !important;
}

:deep(.home-glass-field .v-field) {
  border-radius: 18px !important;
  background: rgba(255, 255, 255, 0.08) !important;
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  backdrop-filter: blur(16px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

:deep(.home-glass-field .v-field__input) {
  color: rgba(255, 255, 255, 0.95);
}

:deep(.home-glass-field .v-label) {
  color: rgba(255, 255, 255, 0.55);
}

:deep(.home-glass-field input::placeholder) {
  color: rgba(255, 255, 255, 0.35);
  opacity: 1;
}
</style>
