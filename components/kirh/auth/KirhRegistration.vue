<template>
  <div class="">
    <!-- Сообщение об успешной регистрации или ошибке -->
    <div v-if="message" class="mb-4 p-4 rounded" :class="messageClass">
      {{ message }}
    </div>

    <!-- Ошибки валидации -->
    <div v-if="Object.keys(errors).length > 0" class="mb-4 p-4 bg-red-100 text-red-700 rounded">
      <ul>
        <li v-for="(errorMessages, field) in errors" :key="field">
          <strong>{{ field }}:</strong>
          <span v-for="(error, index) in errorMessages" :key="index">{{ error }}</span>
        </li>
      </ul>
    </div>

    <form @submit.prevent="submitForm">
      <!-- Поле для имени пользователя -->
      <div class="mb-4">
        <label for="username" class="block text-sm font-medium text-gray-700">Имя пользователя</label>
        <input
            type="text"
            id="username"
            v-model="username"
            class="mt-1 block w-full px-3 py-2 border border-gray-600 text-gray-900 bg-gray-50 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Введите имя пользователя"
            required
        />
      </div>

      <!-- Поле для email -->
      <div class="mb-4">
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input
            type="email"
            id="email"
            v-model="email"
            class="mt-1 block w-full px-3 py-2 border border-gray-600 text-gray-900 bg-gray-50 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Введите email"
            required
        />
      </div>

      <!-- Поле для пароля -->
      <div class="mb-4">
        <label for="password" class="block text-sm font-medium text-gray-700">Пароль</label>
        <input
            type="password"
            id="password"
            v-model="password"
            class="mt-1 block w-full px-3 py-2 border border-gray-600 text-gray-900 bg-gray-50 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Введите пароль"
            required
        />
      </div>

      <!-- Поле для подтверждения пароля -->
      <div class="mb-4">
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Повторите пароль</label>
        <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            class="mt-1 block w-full px-3 py-2 border border-gray-600 text-gray-900 bg-gray-50 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Повторите пароль"
            required
        />
      </div>

      <!-- Капча -->
      <div v-if="!captchaQuestion" class="mb-6 text-gray-500">
        Загрузка капчи...
      </div>
      <div v-else class="mb-6">
        <label class="block text-sm font-medium text-gray-700">Капча: {{ captchaQuestion }}</label>
        <input
            type="text"
            v-model="captchaAnswer"
            class="mt-1 block w-full px-3 py-2 border border-gray-600 text-gray-900 bg-gray-50 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Введите ответ"
            required
        />
      </div>

      <!-- Кнопка регистрации -->
      <button
          type="submit"
          class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Зарегистрироваться
      </button>
    </form>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';

// Реактивные переменные
const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const captchaQuestion = ref('');
const captchaAnswer = ref('');
const captchaCorrectAnswer = ref('');
const message = ref('');
const messageClass = ref('');
const errors = ref({});

// Загрузка капчи при монтировании компонента
onMounted(async () => {
  await loadCaptcha();
});

// Загрузка капчи с сервера
const loadCaptcha = async () => {
  try {
    const config = useRuntimeConfig();

    const response = await fetch(`${config.public.API_URL}/api/captcha`);

    if (!response.ok) {
      throw new Error(`Ошибка загрузки капчи: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.question || !data.answer) {
      throw new Error('Некорректные данные капчи');
    }

    captchaQuestion.value = data.question;
    captchaCorrectAnswer.value = data.answer;
    captchaAnswer.value = ''; // Сброс ответа капчи
  } catch (error) {
    console.error('Ошибка загрузки капчи:', error);
    message.value = 'Ошибка загрузки капчи. Пожалуйста, попробуйте снова.';
    messageClass.value = 'bg-red-100 text-red-700';
  }
};

// Отправка формы регистрации
const submitForm = async () => {
  // Сброс ошибок и сообщений
  errors.value = {};
  message.value = '';
  messageClass.value = '';

  // Проверка совпадения паролей
  if (password.value !== confirmPassword.value) {
    message.value = 'Пароли не совпадают';
    messageClass.value = 'bg-red-100 text-red-700';
    return;
  }

  // Проверка капчи
  if (!captchaCorrectAnswer.value || captchaAnswer.value !== captchaCorrectAnswer.value.toString()) {
    message.value = 'Неверный ответ на капчу';
    messageClass.value = 'bg-red-100 text-red-700';
    return;
  }

  // Отправка данных на сервер
  try {
    const config = useRuntimeConfig();
    const response = await fetch(`${config.public.API_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name: username.value,
        email: email.value,
        password: password.value,
        password_confirmation: confirmPassword.value,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();

      // Обработка ошибок валидации
      if (errorData.errors) {
        errors.value = errorData.errors;
      } else {
        throw new Error(errorData.message || 'Ошибка регистрации');
      }
      return;
    }

    // Успешная регистрация
    const data = await response.json();
    message.value = 'Регистрация успешна. Проверьте вашу почту для подтверждения email.';
    messageClass.value = 'bg-green-100 text-green-700';

    // Сброс формы
    username.value = '';
    email.value = '';
    password.value = '';
    confirmPassword.value = '';
    captchaAnswer.value = '';
    await loadCaptcha(); // Загрузка новой капчи
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    message.value = 'Ошибка регистрации: ' + error.message;
    messageClass.value = 'bg-red-100 text-red-700';
  }
};
</script>