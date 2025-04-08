<template>
  <div class="kirh-pagination flex items-center gap-2 text-xs mt-2 justify-end">
    <span class="text-gray-500">Всего: {{ totalItems }}</span>
    <button
        :disabled="currentPage === 1 || loading"
        class="kirh-pagination-btn px-1.5 py-0.5 border border-gray-300 rounded-sm disabled:opacity-50 hover:bg-gray-50"
        @click="$emit('prev-page')"
    >
      ←
    </button>
    <span class="kirh-page-info mx-1">{{ currentPage }}/{{ totalPages }}</span>
    <button
        :disabled="currentPage === totalPages || loading"
        class="kirh-pagination-btn px-1.5 py-0.5 border border-gray-300 rounded-sm disabled:opacity-50 hover:bg-gray-50"
        @click="$emit('next-page')"
    >
      →
    </button>
  </div>
</template>

<script>
export default {
  name: 'KirhTablePagination',
  props: {
    currentPage: Number,
    totalPages: Number,
    totalItems: Number,
    loading: Boolean
  },
  emits: ['prev-page', 'next-page']
};
</script>