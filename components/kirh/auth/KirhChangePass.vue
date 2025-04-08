<script lang="ts" setup>
import {ref} from "vue";
import KirhNote from "~/components/kirh/fields/KirhNote.vue";

const oldPassword = ref('');
const newPassword = ref('');
const newPasswordConfirmation = ref('');
const successMessageChp = ref('');
const errorMessageChp = ref('');

const config = useRuntimeConfig(); // Используем useRuntimeConfig()
const api = config.public.API_URL;

// Сбрасываем сообщения при монтировании компонента
onMounted(() => {
  successMessageChp.value = '';
  errorMessageChp.value = '';

});


// Функция для отображения успешного сообщения
const showSuccessMessageChp = (message) => {
  successMessageChp.value = message;
  setTimeout(() => {
    successMessageChp.value = ''; // Сбрасываем сообщение через 5 секунд
  }, 5000);
};

// Функция для отображения сообщения об ошибке
const showErrorMessageChp = (message) => {
  errorMessageChp.value = message;
  setTimeout(() => {
    errorMessageChp.value = ''; // Сбрасываем сообщение через 5 секунд
  }, 5000);
};

// Смена пароля
const changePassword = async () => {
  errorMessageChp.value = '';
  successMessageChp.value = '';

  try {
    await $fetch(api + '/api/chp', {
      method: 'POST',
      body: {
        old_password: oldPassword.value,
        new_password: newPassword.value,
        new_password_confirmation: newPasswordConfirmation.value,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    // Очищаем поля паролей
    oldPassword.value = '';
    newPassword.value = '';
    newPasswordConfirmation.value = '';

    // Показываем успешное сообщение
    showSuccessMessageChp('Пароль успешно изменен!');
  } catch (err) {
    handleErrorChp(err);
  }
};

// Обработка ошибок пароль
const handleErrorChp = (err) => {
  if (err.data?.errors) {
    const errors = err.data.errors;
    let message = '';

    // Формируем сообщение об ошибке
    for (const key in errors) {
      if (errors[key]) {
        message += `${errors[key].join(', ')}\n`;
      }
    }

    // Показываем сообщение об ошибке
    showErrorMessageChp(message.trim());
  } else {
    showErrorMessageChp(err.data?.message || err.message);
  }
};
</script>

<template>
  <div class="p-4">
    <!-- Уведомления -->
    <KirhNote :message="successMessageChp" type="success"/>
    <KirhNote :message="errorMessageChp" type="error"/>
    <form class="mb-8" @submit.prevent="changePassword">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700" for="old_password">Старый пароль</label>
        <input id="old_password" v-model="oldPassword" class="mt-1 block w-full px-3 py-2 border border-gray-600 text-gray-900 bg-gray-50 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
               type="password"/>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700" for="new_password">Новый пароль</label>
        <input id="new_password" v-model="newPassword" class="mt-1 block w-full px-3 py-2 border border-gray-600 text-gray-900 bg-gray-50 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
               type="password"/>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700" for="new_password_confirmation">Подтверждение
          нового пароля</label>
        <input id="new_password_confirmation" v-model="newPasswordConfirmation" class="mt-1 block w-full px-3 py-2 border border-gray-600 text-gray-900 bg-gray-50 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
               type="password"/>
      </div>

      <button class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              type="submit">
        Сменить пароль
      </button>
    </form>
  </div>
</template>

<style scoped>

</style>