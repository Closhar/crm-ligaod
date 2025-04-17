<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script lang="ts" setup>
import {useGlobalsStore} from '~/stores/globals';
import {storeToRefs} from 'pinia';

const globalsStore = useGlobalsStore();
const {params, images} = storeToRefs(globalsStore);

// Загружаем данные на сервере при каждой загрузке страницы
const {data} = await useAsyncData('globals', async () => {
  await globalsStore.fetchData(); // Вызываем метод fetchData из хранилища
  return {params: globalsStore.params, images: globalsStore.images};
});
</script>