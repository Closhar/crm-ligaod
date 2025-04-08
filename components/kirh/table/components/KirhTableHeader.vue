<template>
  <div class="kirh-header flex mb-px text-xs font-medium cursor-pointer border-b">
    <div
        v-for="column in columns"
        :key="'header-'+column.name"
        :style="getColumnStyle(column)"
        class="kirh-header-cell p-2 flex items-center justify-between group relative bg-gray-100"
    >
      <div class="flex items-center mx-1">
        <span class="truncate">{{ column.label }}</span>
        <div v-if="column.options?.hint" class="ml-1 relative">
          <svg class="h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path clip-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                  fill-rule="evenodd"></path>
          </svg>
          <div
              class="absolute z-20 bottom-full left-0 mb-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-normal w-48 shadow-lg">
            {{ column.options.hint }}
          </div>
        </div>
      </div>
      <button
          v-if="sortable && column.sortable !== false"
          class="kirh-sort-btn ml-0.5 text-gray-500 hover:text-gray-700 transition-colors text-xs"
          @click="sort(column.name)"
      >
        {{ sortField === column.name ? (sortDirection === 'asc' ? '↑' : '↓') : '↕' }}
      </button>
    </div>
    <div
        v-if="editable"
        class="kirh-header-cell p-1.5 hover:bg-gray-50"
        style="flex: 0 0 80px;"
    >
      <span class="text-xs">Действия</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KirhTableHeader',
  props: {
    columns: Array,
    sortField: String,
    sortDirection: String,
    editable: Boolean,
    sortable: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    getColumnStyle(column) {
      const width = column.width || column.options?.width;
      if (!width) return {flex: '1 1 0%'};

      if (typeof width === 'number') return {flex: `0 0 ${width}px`};
      if (typeof width === 'string') {
        if (width.endsWith('%')) return {flex: `0 0 ${width}`, maxWidth: width};
        if (width.endsWith('px')) return {flex: `0 0 ${width}`};
        return {flex: `0 0 ${width}px`};
      }

      return {flex: '1 1 0%'};
    },
    sort(field) {
      this.$emit('sort', field);
    }
  }
};
</script>

<style scoped>
.kirh-header {
  display: flex;
  width: 100%;
}

.kirh-header-cell {
  flex-grow: 0;
  flex-shrink: 0;
  min-width: 0;
}
</style>