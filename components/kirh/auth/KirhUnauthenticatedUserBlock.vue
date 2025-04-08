<template>
  <div
      class="min-h-screen flex flex-col items-center pt-20 lg:pt-2 text-gray-900 text-center w-full">


    <img v-if="showLogo" class="w-52 mx-auto my-4" src="/ldr.png">

    <div class="text-gray-900 p-4 text-center">
      <h1 class="font-mytitle text-4xl uppercase">{{ title }}</h1>
    </div>

    <!-- Кнопки вкладок -->
    <div class="flex mb-2">
      <button
          :class="{
            'bg-blue-500 text-gray-50': activeTab === 'login',
            'text-gray-700': activeTab !== 'login',
          }"
          class="flex-1 py-2 px-4 transition-colors duration-200"
          @click="activeTab = 'login'"
      >
        {{ enter }}
      </button>
      <button
          v-if="registration"
          :class="{
            'bg-blue-500 text-gray-50': activeTab === 'register',
            'text-gray-700': activeTab !== 'register'
          }"
          class="flex-1 py-2 px-4 transition-colors duration-200"
          @click="activeTab = 'register'"
      >
        {{ reg }}
      </button>
      <button
          :class="{
            'bg-blue-500 text-gray-50': activeTab === 'forgot',
            'text-gray-700': activeTab !== 'forgot',
          }"
          class="flex-1 py-2 px-4 transition-colors duration-200"
          @click="activeTab = 'forgot'"
      >
        {{ restorePass }}
      </button>
    </div>

    <!-- Контент вкладок -->
    <div class="mt-6">

      <!-- Вкладка "Вход" --><!-- Авторизация -->
      <div v-if="activeTab === 'login'" class="space-y-4">
        <div class="bg-gray-50 p-8 rounded-lg shadow-lg w-full sm:w-96 relative">
          <KirhAuth :google-auth-enable="googleAuthEnable"/>
        </div>
      </div>

      <!-- Вкладка "Регистрация" -->
      <div v-if="activeTab === 'register' && registration" class="space-y-4">
        <div class="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96 relative">
          <KirhRegistration/>
        </div>
      </div>

      <!-- Вкладка "Восстановление пароля" -->
      <div v-if="activeTab === 'forgot'" class="space-y-4">
        <div class="bg-gray-50 p-8 rounded-lg shadow-lg w-full sm:w-96 relative">
          <KirhForgotPass/>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import KirhForgotPass from "~/components/kirh/auth/KirhForgotPass.vue";
import KirhRegistration from "~/components/kirh/auth/KirhRegistration.vue";
import KirhAuth from "~/components/kirh/auth/KirhAuth.vue";

const props = defineProps({
  registration: {
    type: Boolean,
    default: true,
  },
  googleAuthEnable: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: 'Аутентификация/Регистрация'
  },
  enter: {
    type: String,
    default: 'Вход'
  },
  reg: {
    type: String,
    default: 'Регистрация'
  },
  restorePass: {
    type: String,
    default: 'Восстановить'
  },
  showLogo: {
    type: Boolean,
    default: false
  }
})

const config = useRuntimeConfig(); // Используем useRuntimeConfig()
const api = config.public.API_URL;

const activeTab = ref('login');

</script>

<style scoped>
.tabs-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.tabs-buttons {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.tabs-buttons button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: #e0e0e0;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.tabs-buttons button.active {
  background-color: #007bff;
  color: white;
}

.tabs-buttons button:hover {
  background-color: #0056b3;
  color: white;
}

.tab-content {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.tab-content h2 {
  margin-top: 0;
}
</style>