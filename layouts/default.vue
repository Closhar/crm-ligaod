<template>
  <KirhLoading :isLoading="isLoading" :logo="site_logo"/>

  <div v-if="isAuthenticated" class="flex h-screen">

    <!-- Mobile overlay (for closing menu when clicking outside) -->
    <div
        v-if="!isMenuCollapsed"
        class="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
        @click="isMenuCollapsed = true"
    ></div>

    <!-- Mobile header (fixed at top) -->
    <header
        class="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-800 text-white p-3 flex items-center justify-between border-b border-gray-700">

      <MobileParts :logo="site_logo" :site_name="adminka_name"/>

      <!-- Гамбургер прижат к правому краю -->
      <button
          class="p-2 rounded-md hover:bg-gray-700"
          @click="toggleMenu"
      >
        <Icon :name="isMenuCollapsed ? 'heroicons:bars-3' : 'heroicons:x-mark'" class="w-5 h-5"/>
      </button>
    </header>
    
    <!-- Sidebar -->
    <div class="relative">
      <aside
          :class="[
          'fixed md:static z-40 h-full bg-gray-800 text-white transition-all duration-300',
          'mt-16 md:mt-0',
          isMenuCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'translate-x-0 w-64'
        ]"
      >
        <div class="flex flex-col h-full">

          <!-- Desktop Logo/Site Name -->
          <div class="hidden md:block">
            <LogoSiteName :is-menu-collapsed="isMenuCollapsed" :logo="site_logo" :site_name="adminka_name"/>
          </div>

          <!-- Navigation -->
          <Navigation
              :is-menu-collapsed="isMenuCollapsed"
              @toggle-menu="toggleMenu"
          />
        </div>

      </aside>

      <!-- Desktop toggle button -->
      <button
          class="hidden md:flex absolute -right-3 top-5 z-50 items-center justify-center
             w-8 h-8 rounded-full bg-gray-50 border border-gray-800 shadow-md
             text-gray-800 hover:bg-gray-200 transition-all duration-300"
          @click="toggleMenu"
      >
        <div class="relative w-5 h-5">
          <Icon
              :class="{
              'opacity-100 scale-100': !isMenuCollapsed,
              'opacity-0 scale-0': isMenuCollapsed
            }"
              class="absolute w-5 h-5 transition-all duration-300 right-0"
              name="heroicons:chevron-left"
          />
          <Icon
              :class="{
              'opacity-100 scale-100': isMenuCollapsed,
              'opacity-0 scale-0': !isMenuCollapsed
            }"
              class="absolute w-5 h-5 transition-all duration-300 right-0"
              name="heroicons:chevron-right"
          />
        </div>
      </button>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden py-16 md:py-0">

      <!-- Content -->
      <main class="flex-1 overflow-y-auto bg-gray-50">
        <NuxtPage />
      </main>

      <!-- Desktop Footer -->
      <Footer :copy_link="copy_link" :copyrights="copyrights" class="hidden md:block"/>
    </div>

  </div>

  <div v-else>
    <KirhUnauthenticatedUserBlock :google-auth-enable="googleAuthEnable"
                                  v-if="showAuthShell"
                                  :logo="site_logo"
                                  :registration="registration"
                                  :show-logo=true
                                  restore-pass="Восстановить пароль"
                                  :title="adminka_name"
    />
    <NuxtPage v-else />
  </div>
</template>

<script setup>
import {computed, ref, onMounted, watch} from "vue";
import {useAuth} from "~/composables/useAuth.js";
import {useGlobalsStore} from "~/stores/globals.js";
import {storeToRefs} from "pinia";
import LogoSiteName from "~/components/parts/LogoSiteName.vue";
import Navigation from "~/components/parts/Navigation.vue";
import Footer from "~/components/parts/Footer.vue";
import MobileParts from "~/components/parts/MobileParts.vue";
import KirhUnauthenticatedUserBlock from "~/components/kirh/auth/KirhUnauthenticatedUserBlock.vue";
import KirhLoading from "~/components/kirh/parts/KirhLoading.vue";
import {normalizeMediaUrl} from "~/utils/mediaUrl";

const {isAuthenticated, user, logout, checkAuth} = useAuth();

const config = useRuntimeConfig() // Используем useRuntimeConfig()
const api = config.public.API_URL
const route = useRoute()

const globalsStore = useGlobalsStore();
const {params, images} = storeToRefs(globalsStore);

const {data: layoutGlobals} = await useAsyncData('layout-globals', async () => {
  if (!Object.keys(globalsStore.params || {}).length && !Object.keys(globalsStore.images || {}).length) {
    await globalsStore.fetchData();
  }

  return {
    params: globalsStore.params,
    images: globalsStore.images,
  };
});

if (layoutGlobals.value) {
  globalsStore.$patch({
    params: layoutGlobals.value.params || {},
    images: layoutGlobals.value.images || {},
  });
}

const safeParams = computed(() => params.value || {});
const safeImages = computed(() => images.value || {});
const publicMediaUrl = computed(() => String(config.public.PUBLIC_FILESYSTEM_URL || ''));

const adminka_name = computed(() => safeParams.value.adminka_name || 'Админка')
const site_logo = computed(() => normalizeMediaUrl(
    safeImages.value.adminka_logo ||
    safeImages.value.site_logo ||
    safeImages.value.logo ||
    safeParams.value.adminka_logo ||
    safeParams.value.site_logo ||
    safeParams.value.logo,
    api,
    publicMediaUrl.value
  ) || '/images/logo.png')
const copyrights = computed(() => safeParams.value.adminka_copyrights || '© 2024 Все права защищены')
const copy_link = computed(() => safeParams.value.adminka_copy_link || '#')
const registration = computed(() => safeParams.value.admin_reg === "true"); //Наличие регистрации для незарегистрированного пользователя
const googleAuthEnable = computed(() => safeParams.value.adminka_google_auth === "true"); //Наличие авторизации через Google
const isMC = computed(() => safeParams.value.adminka_menu_collapsed === "true"); // свернут ли блок меню
const isMenuCollapsed = ref(isMC.value);

const toggleMenu = () => {
  isMenuCollapsed.value = !isMenuCollapsed.value;
};

const isLoading = ref(true);
const ym_counter_id = computed(() => safeParams.value.ym_counter_id)
const ga_tracking_id = computed(() => safeParams.value.ga_tracking_id)
const publicUnauthRoutes = ['/auth/google/callback', '/auth/reset-password', '/verify-email']
const showAuthShell = computed(() => !publicUnauthRoutes.includes(route.path))

// Отслеживаем изменения состояния меню
watch(isMC, (newValue) => {
  isMenuCollapsed.value = newValue;
});

onMounted(async () => {
  checkAuth();
  
  // Загружаем данные из store
  await globalsStore.fetchData();
  
  // Симуляция загрузки данных
  setTimeout(() => {
    isLoading.value = false;
  }, 2000); // Загрузка данных занимает 2 секунды
});
</script>

<style>
/* Smooth transitions for NuxtLink */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
