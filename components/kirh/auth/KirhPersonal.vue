<script lang="ts" setup>
import {onMounted, ref, watch} from "vue";
import {useAuth} from "~/composables/useAuth";
import KirhNote from "~/components/kirh/fields/KirhNote.vue";

const props = defineProps({
  avatar: {
    type: String,
    default: '/default_avatar',
  },
});

const {isAuthenticated, user, checkAuth} = useAuth();

const avatarFile = ref(null);
const avatarPathPreview = ref(user.value?.avatar_path || '');
const avatarPreview = ref(user.value?.avatar || '');
const isAvatarLoading = ref(false);

const successMessage = ref('');
const errorMessage = ref('');
const config = useRuntimeConfig(); // Используем useRuntimeConfig()
const api = config.public.API_URL;

// Функция для отображения успешного сообщения
const showSuccessMessage = (message) => {
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = ''; // Сбрасываем сообщение через 5 секунд
  }, 5000);
};

// Функция для отображения сообщения об ошибке
const showErrorMessage = (message) => {
  errorMessage.value = message;
  setTimeout(() => {
    errorMessage.value = ''; // Сбрасываем сообщение через 5 секунд
  }, 5000);
};

// Сбрасываем сообщения при монтировании компонента
onMounted(() => {
  successMessage.value = '';
  errorMessage.value = '';

  if (isAuthenticated.value) {
    checkAuth(); // Обновляем данные пользователя
  } else {
    navigateTo('/account'); // Перенаправляем на страницу авторизации, если пользователь не авторизован
  }
});

// Отслеживаем изменения avatar_path пользователя
watch(
    () => user.value?.avatar_path,
    (newAvatarPath) => {
      if (newAvatarPath) {
        avatarPathPreview.value = newAvatarPath;
        avatarPreview.value = newAvatarPath;
      } else {
        avatarPathPreview.value = props.avatar;
        avatarPreview.value = props.avatar;
      }
    },
    {immediate: true}
);

// Словарь для перевода имен полей
const fieldLabels = {
  old_password: 'Старый пароль',
  new_password: 'Новый пароль',
  new_password_confirmation: 'Подтверждение нового пароля',
  name: 'Имя',
  avatar: 'Аватар',
};

// Обработка изменения аватара
const handleAvatarChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    isAvatarLoading.value = true;
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.value = e.target.result; // Обновляем preview
      avatarPathPreview.value = e.target.result; // Обновляем путь для отображения
      isAvatarLoading.value = false;
    };
    reader.readAsDataURL(file);
    avatarFile.value = file;
  }
};

// Удаление аватара
const deleteAvatar = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  try {
    // Отправляем запрос на удаление аватара
    const response = await $fetch(api + '/api/user/avatar', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    // Обновляем состояние
    avatarPreview.value = props.avatar;
    avatarPathPreview.value = props.avatar;
    avatarFile.value = null;
    user.value.avatar_path = null;

    // Показываем успешное сообщение
    showSuccessMessage('Аватар успешно удален!');
  } catch (err) {
    handleError(err);
  }
};

// Обновление профиля
const updateProfile = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  const formData = new FormData();
  formData.append('name', user.value.name);

  if (avatarFile.value) {
    formData.append('avatar', avatarFile.value);
  }

  try {
    const updatedUser = await $fetch(api + '/api/user', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    // Обновляем глобальное состояние
    user.value = updatedUser;
    avatarPathPreview.value = updatedUser.avatar_path;
    avatarPreview.value = updatedUser.avatar_path;

    // Показываем успешное сообщение
    showSuccessMessage('Данные профиля успешно обновлены!');
  } catch (err) {
    handleError(err);
  }
};


// Обработка ошибок
const handleError = (err) => {
  if (err.data?.errors) {
    const errors = err.data.errors;
    let message = '';

    // Формируем сообщение об ошибке
    for (const key in errors) {
      if (errors[key]) {
        const fieldName = fieldLabels[key] || key;
        message += `${fieldName}: ${errors[key].join(', ')}\n`;
      }
    }

    // Показываем сообщение об ошибке
    showErrorMessage(message.trim());
  } else {
    showErrorMessage(err.data?.message || err.message);
  }
};
</script>

<template>
  <div class="p-4">
    <!-- Уведомления -->
    <KirhNote :message="successMessage" type="success"/>
    <KirhNote :message="errorMessage" type="error"/>
    <form class="mb-8" @submit.prevent="updateProfile">
      <!-- E-mail -->
      <div class="my-4">
        <label class="block text-sm font-medium text-gray-800" for="email">Электронная почта</label>
        <input id="email" v-model="user.email" class="mt-1 w-full px-3 py-2 border border-gray-400 text-gray-500 font-bold bg-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" disabled
               type="text"/>
      </div>

      <!-- Имя пользователя -->
      <div class="my-4">
        <label class="block text-sm font-medium text-gray-800" for="name">Имя</label>
        <input id="name" v-model="user.name" class="mt-1 block w-full px-3 py-2 border border-gray-600 text-gray-900 bg-gray-50 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
               type="text"/>
      </div>

      <!-- Поле для аватара -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-800">Аватар</label>
        <div class="mt-1 items-center relative">
          <div class="relative w-40 h-40 rounded-full overflow-hidden border-2 border-gray-300 mx-auto">
            <img :src="avatarPathPreview || avatar" alt="Аватар"
                 class="w-full h-full object-cover"/>
            <div v-if="isAvatarLoading"
                 class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"
                   xmlns="http://www.w3.org/2000/svg">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                        stroke-width="4"></circle>
                <path class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      fill="currentColor"></path>
              </svg>
            </div>
          </div>

          <div class="absolute top-0 right-10">
            <button v-if="avatarPreview && avatarPreview !== avatar" class="px-2 pt-2 bg-red-600 text-white rounded-3xl hover:bg-red-700 "
                    @click="deleteAvatar">
              <Icon class="" name="mi:delete" size="1.5em"/>
            </button>
          </div>

          <input id="avatar" accept="image/*" class="cursor-pointer mt-1 block w-full px-3 py-2 border border-gray-600 text-gray-900 bg-gray-50 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" type="file"
                 @change="handleAvatarChange"/>
        </div>
      </div>

      <button class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              type="submit">
        Обновить данные
      </button>
    </form>
  </div>
</template>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>