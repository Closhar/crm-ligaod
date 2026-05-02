<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script lang="ts" setup>
import {useGlobalsStore} from '~/stores/globals';
import {storeToRefs} from 'pinia';
import {computed} from 'vue';

const globalsStore = useGlobalsStore();
const {params, images} = storeToRefs(globalsStore);
const config = useRuntimeConfig();

// Загружаем данные на сервере при каждой загрузке страницы
const {data} = await useAsyncData('app-globals', async () => {
  await globalsStore.fetchData(); // Вызываем метод fetchData из хранилища
  return {params: globalsStore.params, images: globalsStore.images};
});

const apiBase = computed(() => String(config.public.API_URL || '').replace(/\/+$/, '').replace(/\/api$/, ''));
const normalizeMediaUrl = (value?: string) => {
  if (!value) return '';

  const path = String(value).trim();
  if (!path) return '';

  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }

  if (path.startsWith('/api/storage/')) {
    return `${apiBase.value}${path.replace(/^\/api/, '')}`;
  }

  if (path.startsWith('/storage/')) {
    return `${apiBase.value}${path}`;
  }

  if (path.startsWith('storage/')) {
    return `${apiBase.value}/${path}`;
  }

  return `${apiBase.value}/storage/${path.replace(/^\/+/, '')}`;
};

const appIcon = computed(() => normalizeMediaUrl(
  images.value?.adminka_logo ||
  images.value?.site_logo ||
  images.value?.logo
) || '/favicon.svg');

useHead(() => ({
  link: [
    { rel: 'icon', type: 'image/png', href: appIcon.value },
    { rel: 'shortcut icon', href: appIcon.value },
  ],
}));
</script>
