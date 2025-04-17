<script lang="ts" setup>
import {ref} from "vue";
import {useRouter} from "vue-router";
import {useAuth} from "~/composables/useAuth"
import KirhNote from "~/components/kirh/fields/KirhNote.vue";
import KirhGoogleAuth from "~/components/kirh/auth/KirhGoogleAuth.vue";

const router = useRouter();
const {isAuthenticated, user, logout, checkAuth} = useAuth();
const showEmailNotVerified = ref(false); // Состояние для отображения сообщения о неподтвержденном email
let type = ref('error');
const error = ref('');

const email = ref('');
const password = ref('');

const config = useRuntimeConfig(); // Используем useRuntimeConfig()
const api = config.public.API_URL;

const props = defineProps({
  googleAuthEnable: {
    type: Boolean,
    default: true
  }
})

// Типизация параметра payload
interface AuthErrorPayload {
  type: string;
  error: string;
}

// Авторизация через email и пароль
const submitForm = async () => {
  error.value = ''; // Сбрасываем ошибку перед запросом
  showEmailNotVerified.value = false; // Сбрасываем состояние неподтвержденного email

  try {
    const response = await fetch(api + '/api/adminlogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Сохраняем токен
      localStorage.setItem('auth_token', data.token);

      // Обновляем данные пользователя
      await checkAuth(); // Этот метод должен обновить данные пользователя, включая аватар

      // Перенаправляем пользователя
      await router.push('/');
    } else {
      if (data.message === 'Email not verified') {
        // Если email не подтвержден, показываем сообщение
        showEmailNotVerified.value = true;
      } else {
        type = 'error';
        error.value = data.message || 'Неверный логин или пароль';
      }
    }
  } catch (err) {
    type = 'error';
    error.value = 'Произошла ошибка при авторизации';
    console.error('Ошибка:', err);
  }
};

// Обработчик ошибки авторизации
const handleAuthError = (payload: AuthErrorPayload) => {
  type.value = payload.type;
  error.value = payload.error;
  // Здесь можно добавить логику для обработки ошибки
};


// Отправка повторного письма для подтверждения email
const resendVerificationEmail = async () => {
  try {
    const response = await fetch(api + '/api/resend-verification-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      type = 'success';
      // Показываем сообщение об успешной отправке
      error.value = 'Письмо для подтверждения email отправлено. Проверьте вашу почту.';
      showEmailNotVerified.value = false; // Скрываем сообщение о неподтвержденном email
    } else {
      type = 'error';
      error.value = data.message || 'Произошла ошибка при отправке письма.';
    }
  } catch (err) {
    type = 'error';
    error.value = 'Произошла ошибка при отправке письма.';
    console.error('Ошибка:', err);
  }
};
</script>

<template>
  <div class="">
    <!-- Уведомления об ошибках -->
    <KirhNote v-if="error" :message="error" :type="type"/>

    <!-- Сообщение о неподтвержденном email -->
    <div
        v-if="showEmailNotVerified"
        class="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded"
    >
      <p>Ваш email не подтвержден. Пожалуйста, проверьте вашу почту.</p>
      <button class="mt-2 text-blue-600 hover:underline" @click="resendVerificationEmail">
        Отправить письмо повторно
      </button>
    </div>

    <!-- Форма авторизации -->
    <form @submit.prevent="submitForm">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700" for="email">Email</label>
        <input
            id="email"
            v-model="email"
            class="mt-1 block w-full px-3 py-2 border border-gray-600 text-gray-900 bg-gray-50 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Введите email"
            required
            type="email"
        />
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700" for="password">Пароль</label>
        <input
            id="password"
            v-model="password"
            class="mt-1 block w-full px-3 py-2 border border-gray-600 text-gray-900 bg-gray-50 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Введите пароль"
            required
            type="password"
        />
      </div>
      <button
          class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          type="submit"
      >
        Войти
      </button>
    </form>

    <!-- Кнопка авторизации через Google -->
    <div v-if="googleAuthEnable" class="mt-6">
      <KirhGoogleAuth @auth-error="handleAuthError"/>
    </div>

  </div>
</template>

<style scoped>

</style>