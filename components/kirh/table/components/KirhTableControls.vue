<template>
  <div class="flex mb-1 justify-between items-center">
    <div class="flex items-center gap-2">
      <button
          class="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors shadow-sm"
          @click="$emit('toggle-field-selector')"
      >
        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
             xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
        </svg>
        {{ showFieldSelector ? 'Закрыть панель' : 'Редактировать поля' }}
      </button>

      <button
          :disabled="loading"
          class="refresh-btn text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors shadow-sm"
          title="Обновить данные"
          @click="$emit('refresh')"
      >
        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
             xmlns="http://www.w3.org/2000/svg">
          <path
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
        </svg>
        Обновить
      </button>
    </div>

    <slot name="filters"></slot>
  </div>
</template>

<script>
export default {
  name: 'KirhTableControls',
  props: {
    loading: Boolean,
    showFieldSelector: Boolean
  },
  emits: ['toggle-field-selector', 'refresh']
};
</script>

<style scoped>
.refresh-btn {
  transition: transform 0.3s ease;
}

.refresh-btn:active {
  transform: rotate(360deg);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>