<template>

  <header class="bg-white shadow-sm border-b border-gray-300">
    <div class="px-6 pt-4">
      <div class="flex items-start justify-between">

        <Head :icon="p_icon" :title="p_description" show_breadcrumbs="false"/>

      </div>
    </div>
  </header>

  <div v-if="isAuthenticated" class="account-page">
    <div class="account-page__intro">
      <span>Личный кабинет</span>
      <h1>{{ user?.name || 'Профиль пользователя' }}</h1>
      <p>Управление личными данными, аватаром и паролем для доступа в административную панель.</p>
    </div>

    <div class="account-page__grid">
      <section class="account-section">
        <div class="account-section__head">
          <Icon name="heroicons:user-circle" />
          <div>
            <h2>Личные данные</h2>
            <p>Имя и изображение профиля</p>
          </div>
        </div>
        <KirhPersonal :avatar="accountAvatar"/>
      </section>

      <section class="account-section">
        <div class="account-section__head">
          <Icon name="heroicons:lock-closed" />
          <div>
            <h2>Смена пароля</h2>
            <p>Обновление пароля учетной записи</p>
          </div>
        </div>
        <div class="account-section__body">
          <KirhChangePass/>
        </div>
      </section>
    </div>
  </div>

</template>

<script setup>
// КОНСТАНТЫ ДЛЯ аутентификации
const registration = false //Наличие регистрации для незарегистрированного пользователя
const googleAuthEnable = false //Наличие авторизации через Google

import {computed} from 'vue';
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
const p_description = pageData.value?.description || 'Аккаунт';
const p_icon = pageData.value?.icon;
const breadcrumbs = pageData.value?.breadcrumbs;

const {isAuthenticated, user, logout, checkAuth} = useAuth();
const accountAvatar = computed(() =>
  images.value?.adminka_logo ||
  images.value?.site_logo ||
  images.value?.logo ||
  '/images/logo.png'
);

</script>

<style scoped>
.account-page {
  min-height: 100%;
  background:
    radial-gradient(circle at 10% 0%, rgba(37, 99, 235, 0.10), transparent 32%),
    linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  padding: 28px;
  color: #111827;
}

.account-page__intro {
  margin-bottom: 22px;
  max-width: 820px;
}

.account-page__intro span {
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.account-page__intro h1 {
  margin-top: 5px;
  font-size: 32px;
  font-weight: 900;
  line-height: 1.1;
}

.account-page__intro p {
  margin-top: 8px;
  color: #64748b;
}

.account-page__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 22px;
}

.account-section {
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid #dbe4f0;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 40px rgb(15 23 42 / 0.08);
}

.account-section__head {
  display: flex;
  align-items: center;
  gap: 14px;
  border-bottom: 1px solid #e2e8f0;
  background: #0f172a;
  color: #fff;
  padding: 18px 22px;
}

.account-section__head > span,
.account-section__head :deep(svg) {
  width: 28px;
  height: 28px;
  color: #f59e0b;
}

.account-section__head h2 {
  font-size: 18px;
  font-weight: 900;
}

.account-section__head p {
  color: #cbd5e1;
  font-size: 13px;
}

.account-section__body {
  padding: 24px;
}

@media (max-width: 1024px) {
  .account-page__grid {
    grid-template-columns: 1fr;
  }
}

</style>
