<template>
  <div class="min-h-screen bg-gray-200 text-gray-900 text-center w-full">
    <div class="bg-gray-200 flex flex-col items-center justify-center pt-20 lg:pt-2">
      <div class="bg-gray-200 text-gray-900 p-4 text-center">
        <h1 class="font-mytitle text-4xl uppercase">СБРОС ПАРОЛЯ</h1>
      </div>

      <!-- Уведомления об ошибках -->
      <KirhNote v-if="message" :message="message" :type="messageType" />

      <!-- Форма сброса пароля -->
      <form v-if="!isPasswordReset" @submit.prevent="submitForm">
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
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700" for="password">Новый пароль</label>
          <input
              id="password"
              v-model="password"
              class="mt-1 block w-full px-3 py-2 border border-gray-600 text-gray-900 bg-gray-50 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Введите новый пароль"
              required
              type="password"
          />
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700" for="password_confirmation">Повторите пароль</label>
          <input
              id="password_confirmation"
              v-model="passwordConfirmation"
              class="mt-1 block w-full px-3 py-2 border border-gray-600 text-gray-900 bg-gray-50 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Повторите пароль"
              required
              type="password"
          />
        </div>
        <input v-model="token" type="hidden" />
        <button
            class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            type="submit"
        >
          Сбросить пароль
        </button>
      </form>

      <!-- Сообщение об успехе -->
      <div v-if="isPasswordReset" class="text-center">
        <p class="text-gray-600 mt-2">Вы будете перенаправлены на главную страницу через 5 секунд...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import KirhNote from "~/components/kirh/fields/KirhNote.vue";

const route = useRoute();
const router = useRouter();

const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const token = ref('');
const message = ref('');
const messageType = ref('');
const isPasswordReset = ref(false); // Состояние для скрытия формы

const config = useRuntimeConfig(); // Используем useRuntimeConfig()
const api = config.public.API_URL;

// Получаем токен из URL
onMounted(() => {
  token.value = String(route.query.token);
  email.value = String(route.query.email);
});

// Отправка формы сброса пароля
const submitForm = async () => {
  message.value = ''; // Сбрасываем сообщение перед запросом
  messageType.value = ''; // Сбрасываем тип сообщения

  try {
    const response = await fetch(api + '/api/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token.value,
        email: email.value,
        password: password.value,
        password_confirmation: passwordConfirmation.value,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      messageType.value = 'success';
      message.value = 'Пароль успешно изменен. Теперь вы можете авторизоваться с новым паролем.';
      isPasswordReset.value = true; // Скрываем форму

      // Переадресация через 5 секунд
      setTimeout(() => {
        router.push('/'); // Переход на главную страницу
      }, 5000);
    } else {
      messageType.value = 'error';
      message.value = data.message || 'Произошла ошибка при сбросе пароля.';
    }
  } catch (err) {
    messageType.value = 'error';
    message.value = 'Произошла ошибка при сбросе пароля.';
    console.error('Ошибка:', err);
  }
};
</script>

<style scoped>
/* Стили для уведомлений */
.success {
  color: green;
}

.error {
  color: red;
}
</style>