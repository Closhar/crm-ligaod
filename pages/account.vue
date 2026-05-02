<template>

  <header class="bg-white shadow-sm border-b border-gray-300">
    <div class="px-6 pt-4">
      <div class="flex items-start justify-between">

        <Head :icon="p_icon" :title="p_description" show_breadcrumbs="false"/>

      </div>
    </div>
  </header>

  <div v-if="isAuthenticated" class="">

    <!-- Авторизация -->
    <div class="min-h-full bg-gray-200 text-gray-900 text-center">

      <div class="grid grid-cols-1 md:grid-cols-2">

        <!-- Форма обновления данных пользователя -->
        <div class="p-4">
          <div class="bg-gray-300 rounded-lg">
            <div class="bg-gray-800 text-gray-50 p-2 rounded-t-lg text-center">
              ЛИЧНЫЕ ДАННЫЕ
            </div>
            <KirhPersonal :avatar="images.default_user"/>
          </div>
        </div>

        <!-- Форма смены пароля -->
        <div class="p-4">
          <div class="bg-gray-300 rounded-lg">
            <div class="bg-gray-800 text-gray-50 p-2 rounded-t-lg text-center">
              СМЕНА ПАРОЛЯ
            </div>
            <KirhChangePass/>
          </div>
        </div>

      </div>
    </div>

  </div>

</template>

<script setup>
// КОНСТАНТЫ ДЛЯ аутентификации
const registration = false //Наличие регистрации для незарегистрированного пользователя
const googleAuthEnable = false //Наличие авторизации через Google

import {ref, onMounted, watch} from 'vue';
import {useAuth} from '~/composables/useAuth';
import {useGlobalsStore} from '~/stores/globals';
import {storeToRefs} from 'pinia';
import KirhChangePass from "~/components/kirh/auth/KirhChangePass.vue";
import KirhPersonal from "~/components/kirh/auth/KirhPersonal.vue";
import Head from "~/components/parts/Head.vue"

const globalsStore = useGlobalsStore();
const {params, images} = storeToRefs(globalsStore);

// Загружаем данные на сервере при каждой загрузке страницы
const {data} = await useAsyncData('account-globals', async () => {
  await globalsStore.fetchData(); // Вызываем метод fetchData из хранилища
  return {params: globalsStore.params, images: globalsStore.images};
});

const config = useRuntimeConfig(); // Используем useRuntimeConfig()
const api = config.public.API_URL;

// Используем useSeoMeta с данными из хранилища
const route = useRoute();
const {data: pageData} = await useFetch(api + `/api/v1/apage/2`);

useSeoMeta({
  title: params.value.adminka_name + ' - ' + pageData.value.title,
  description: pageData.value.description,
});

const p_title = pageData.value?.title;
const p_description = pageData.value?.description;
const p_icon = pageData.value?.icon;
const breadcrumbs = pageData.value?.breadcrumbs;

const {isAuthenticated, user, logout, checkAuth} = useAuth();

</script>

<style scoped>

</style>
