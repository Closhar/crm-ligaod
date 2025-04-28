<template>

  <header class="bg-white shadow-sm border-b border-gray-300">
    <div class="px-6 pt-4">
      <div class="flex items-start justify-between">

        <Head :icon="p_icon" :title="p_description" show_breadcrumbs="false"/>

      </div>
    </div>
  </header>



</template>

<script setup>

import {ref, onMounted, watch} from 'vue';
import {useAuth} from '~/composables/useAuth';
import {useGlobalsStore} from '~/stores/globals';
import {storeToRefs} from 'pinia';
import Head from "~/components/parts/Head.vue"

const globalsStore = useGlobalsStore();
const {params, images} = storeToRefs(globalsStore);

// Загружаем данные на сервере при каждой загрузке страницы
const {data} = await useAsyncData('globals', async () => {
  await globalsStore.fetchData(); // Вызываем метод fetchData из хранилища
  return {params: globalsStore.params, images: globalsStore.images};
});

const config = useRuntimeConfig(); // Используем useRuntimeConfig()
const api = config.public.API_URL;

// Используем useSeoMeta с данными из хранилища
const route = useRoute();
const {data: pageData} = await useFetch(api + `/api/v1/apage/1`);

useSeoMeta({
  title: params.value.adminka_name + ' - ' + pageData.value.title,
  description: pageData.value.description,
});

const p_title = pageData.value?.title;
const p_icon = pageData.value?.icon;
const p_description = pageData.value?.description;
const breadcrumbs = pageData.value?.breadcrumbs;

const {isAuthenticated, user, logout, checkAuth} = useAuth();

</script>

<style scoped>

</style>