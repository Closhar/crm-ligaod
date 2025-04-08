<template>

  <NuxtLayout>
    <KirhLoading :isLoading="isLoading"/>
    <NuxtPage v-if="!isLoading"/>
  </NuxtLayout>

</template>

<script lang="ts" setup>
import {useGlobalsStore} from '~/stores/globals';
import {storeToRefs} from 'pinia';
import KirhLoading from "~/components/kirh/parts/KirhLoading.vue";

const globalsStore = useGlobalsStore();
const {params, images} = storeToRefs(globalsStore);

// Загружаем данные на сервере при каждой загрузке страницы
const {data} = await useAsyncData('globals', async () => {
  await globalsStore.fetchData(); // Вызываем метод fetchData из хранилища
  return {params: globalsStore.params, images: globalsStore.images};
});

const {checkAuth} = useAuth();
const isLoading = ref(true);
const ym_counter_id = params.value.ym_counter_id
const ga_tracking_id = params.value.ga_tracking_id

onMounted(() => {
  checkAuth();
  // Симуляция загрузки данных
  setTimeout(() => {
    isLoading.value = false;
  }, 2000); // Загрузка данных занимает 3 секунды
});
</script>