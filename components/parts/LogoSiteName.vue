<script lang="ts" setup>
const props = defineProps({
  isMenuCollapsed: {
    type: Boolean
  },
  logo: {
    type: String,
    default: '/ldr.png'
  },
  site_name: {
    type: String,
    default: 'KirhAdm'
  }
});
</script>

<template>
  <div class="p-4 border-b border-gray-700 flex items-center min-w-0">
    <NuxtLink class="flex items-center min-w-0 flex-1" to="/">
      <img
          alt="Logo"
          class="w-10 h-10 object-contain flex-shrink-0"
          src="/ldr.png"
      />
      <span
          v-if="!isMenuCollapsed"
          class="ml-3 text-3xl truncate font-mytitle"
      >
                {{ site_name }}
              </span>
    </NuxtLink>
  </div>
</template>

<style scoped>

</style>