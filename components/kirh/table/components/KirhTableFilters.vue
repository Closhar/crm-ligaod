<template>
  <div class="flex items-center gap-2">
    <div class="relative">
      <input
          :value="searchQuery"
          class="text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Поиск..."
          type="text"
          @input="$emit('search', $event.target.value)"
      >
      <button
          v-if="searchQuery"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          @click="$emit('clear-search')"
      >
        <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path clip-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                fill-rule="evenodd"/>
        </svg>
      </button>
    </div>

    <div v-for="(filter, index) in additionalFilters" :key="index" class="flex items-center">
      <KirhSelectField
          v-model="selectedFilters[filter.field]"
          :api-params="filter.apiParams"
          :api-url="filter.apiUrl"
          :empty-option="filter.empty_option"
          :enable-search="filter.enableSearch"
          :icon-field="filter.iconField"
          :image-field="filter.imageField"
          :key-field="filter.keyField || 'id'"
          :label-field="filter.labelField || 'name'"
          :list_item="filter.list_item || null"
          :options="filter.options"
          :options_list="filter.options_list || null"
          :placeholder="filter.placeholder || filter.label"
          :sel_class="filter.sel_class || null"
          @update:modelValue="$emit('filter-change')"
      />
    </div>
  </div>
</template>

<script>
import KirhSelectField from '../fields/KirhSelectField.vue';
import {ref} from 'vue';

export default {
  name: 'KirhTableFilters',
  components: {KirhSelectField},
  props: {
    additionalFilters: Array,
    searchQuery: String
  },
  emits: ['search', 'clear-search', 'filter-change'],
  setup(props) {
    const selectedFilters = ref({});

    // Инициализация выбранных фильтров
    props.additionalFilters.forEach(filter => {
      selectedFilters.value[filter.field] = filter.defaultValue || '';
    });

    return {
      selectedFilters
    };
  }
};
</script>