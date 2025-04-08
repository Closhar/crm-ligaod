<script setup lang="ts">
import {ref} from "vue";
import {useAuth} from '~/composables/useAuth'; // Предположим, что у вас есть хук useAuth

const props = defineProps({
  button_class: {
    type: String,
    default: "w-full flex items-center justify-center bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
  },
  button_image: {
    type: String,
    default: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg",
  },
  button_image_class: {
    type: String,
    default: "h-5 w-5 mr-2",
  },
  button_image_text: {
    type: String,
    default: "Войти через Google",
  },
});

const emit = defineEmits(['auth-error']); // Определяем событие

const config = useRuntimeConfig(); // Используем useRuntimeConfig()
const api = config.public.API_URL;
const error = ref('');
let type = 'error';

const {checkAuth} = useAuth(); // Используем хук useAuth

// Авторизация через Google
const signInWithGoogle = async () => {
  try {
    window.location.href = `${api}/auth/google/redirect`;
  } catch (err) {
    type = 'error';
    error.value = 'Произошла ошибка при авторизации через Google';
    emit('auth-error', {type, error: error.value}); // Вызываем событие и передаем данные
  }
};

// Проверка авторизации после перенаправления
onMounted(async () => {
  if (window.location.pathname === '/account') {
    await checkAuth();
  }
});
</script>

<template>
  <button
      @click="signInWithGoogle"
      :class="button_class"
  >
    <img
        :src="button_image"
        alt="Google"
        :class="button_image_class"
    />
    {{ button_image_text }}
  </button>
</template>

<style scoped>

</style>