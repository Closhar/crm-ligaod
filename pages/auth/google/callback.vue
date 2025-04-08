<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <p class="text-lg">Авторизация через Google...</p>
  </div>
</template>

<script setup>
import {onMounted} from 'vue';
import {useRouter} from 'vue-router';

const router = useRouter();

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (token) {
    // Сохраняем токен в localStorage
    localStorage.setItem('auth_token', token);

    // Перенаправляем пользователя на защищенную страницу
    router.push('/account');
  } else {
    // Если токен не получен, перенаправляем на страницу авторизации
    router.push('/account');
  }
});
</script>