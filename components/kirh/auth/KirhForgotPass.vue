<script lang="ts" setup>
// Реактивные переменные для восстановления пароля
import KirhNote from "~/components/kirh/fields/KirhNote.vue";

const forgotEmail = ref('');
const forgotPasswordMessage = ref('');
const forgotPasswordMessageType = ref('');

const config = useRuntimeConfig(); // Используем useRuntimeConfig()
const api = config.public.API_URL;

// Отправка запроса на восстановление пароля
const submitForgotPasswordForm = async () => {
  forgotPasswordMessage.value = ''; // Сбрасываем сообщение перед запросом
  forgotPasswordMessageType.value = ''; // Сбрасываем тип сообщения

  try {
    const response = await fetch(api + '/api/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: forgotEmail.value,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      forgotPasswordMessageType.value = 'success';
      forgotPasswordMessage.value = 'Письмо для восстановления пароля отправлено. Проверьте вашу почту.';
    } else {
      forgotPasswordMessageType.value = 'error';
      forgotPasswordMessage.value = data.message || 'Произошла ошибка при отправке запроса.';
    }
  } catch (err) {
    forgotPasswordMessageType.value = 'error';
    forgotPasswordMessage.value = 'Произошла ошибка при отправке запроса.';
    console.error('Ошибка:', err);
  }
};
</script>

<template>
  <div class="">
    <!-- Уведомления об ошибках -->
    <KirhNote v-if="forgotPasswordMessage" :message="forgotPasswordMessage"
              :type="forgotPasswordMessageType"/>

    <!-- Форма восстановления пароля -->
    <form @submit.prevent="submitForgotPasswordForm">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700" for="forgotEmail">Email</label>
        <input
            id="forgotEmail"
            v-model="forgotEmail"
            class="mt-1 block w-full px-3 py-2 border border-gray-600 text-gray-900 bg-gray-50 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Введите email"
            required
            type="email"
        />
      </div>
      <button
          class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          type="submit"
      >
        Восстановить пароль
      </button>
    </form>
  </div>
</template>

<style scoped>

</style>