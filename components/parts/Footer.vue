<script lang="ts" setup>
const props = defineProps({
  copyrights: {
    default: 'Мой сайт.Все права защищены.'
  },
  copy_link: {
    default: null
  }
});
</script>

<template>
  <footer class="bg-white border-t border-gray-200 py-4 px-6">
    <p v-if="copy_link" class="text-center"><a :href="copy_link"
                                               class="text-center text-gray-600 text-sm hover:text-blue-900"
                                               target="_blank">
      © {{ new Date().getFullYear() }} {{ copyrights }}
    </a></p>
    <p v-else class="text-center text-gray-600 text-sm">
      © {{ new Date().getFullYear() }} {{ copyrights }}
    </p>
  </footer>
</template>

<style scoped>

</style>