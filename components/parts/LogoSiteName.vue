<script lang="ts" setup>
const props = defineProps({
  isMenuCollapsed: {
    type: Boolean
  },
  logo: {
    type: String,
    default: '/images/logo.png'
  },
  site_name: {
    type: String,
    default: 'KirhAdm'
  },
  publicSiteName: {
    type: String,
    default: 'Основной сайт'
  },
  publicSiteUrl: {
    type: String,
    default: 'https://ligaod.ru'
  }
});
</script>

<template>
  <div class="p-4 border-b border-gray-700 min-w-0">
    <NuxtLink class="flex items-center min-w-0 flex-1" to="/">
      <img
          alt="Logo"
          class="w-10 h-10 object-contain flex-shrink-0"
          :src="logo"
      />
      <span
          v-if="!isMenuCollapsed"
          class="ml-3 text-3xl truncate font-mytitle"
      >
                {{ site_name }}
              </span>
    </NuxtLink>
    <a
        v-if="!isMenuCollapsed"
        :href="publicSiteUrl"
        target="_blank"
        rel="noopener"
        class="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-blue-100 transition hover:bg-white/10 hover:text-white"
    >
      <Icon name="lucide:external-link" class="h-4 w-4 flex-shrink-0" />
      <span class="truncate">{{ publicSiteName }}</span>
    </a>
  </div>
</template>

<style scoped>

</style>
