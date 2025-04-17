<template>
  <KirhTable
    :api-url="apiUrl"
    :table-options="processedTableOptions"
    :form-options="formOptions"
    :additional-filters="additionalFilters"
    :extra-editable-fields="processedExtraFields"
    :default-visible-fields="defaultVisibleFields"
    :excluded-fields="processedExcludedFields"
    :container-class="containerClass"
    :container-style="containerStyle"
    @update="handleUpdate"
  />
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import KirhTable from '~/components/kirh/table/KirhTable.vue';

interface Column {
  name: string;
  label: string;
  type: string;
  width?: string;
  min_width?: string;
  sortable?: boolean;
  options: Record<string, any>;
  displayLabel?: string;
  title_icon?: string;
  uploadEnabled?: boolean;
  [key: string]: any;
}

interface TableOptions {
  columns: Column[];
  editable?: boolean;
  editrow?: boolean;
  deleteable?: boolean;
  sortable?: boolean;
  separateFields?: boolean;
  link?: string;
  link_prefix?: string;
  pagination?: boolean;
  main_field?: string;
  pageSize?: number;
  searchable?: boolean;
  enableResetFilters?: boolean;
  resetFiltersLabel?: string;
  resetFiltersClass?: string;
  [key: string]: any;
}

const props = defineProps({
  apiUrl: {
    type: String,
    required: true
  },
  tableOptions: {
    type: Object as () => TableOptions,
    required: true
  },
  formOptions: {
    type: Object,
    required: true
  },
  additionalFilters: {
    type: Array,
    default: () => []
  },
  extraEditableFields: {
    type: Array as () => Column[],
    default: () => []
  },
  defaultVisibleFields: {
    type: Array as () => string[],
    default: () => []
  },
  excludedFields: {
    type: Array as () => string[],
    default: () => []
  },
  containerClass: {
    type: String,
    default: ''
  },
  containerStyle: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update']);

// Добавляем уникальные идентификаторы для каждого поля
const processedTableOptions = computed(() => {
  const columnsWithIds = props.tableOptions.columns.map((column: Column, index: number) => {
    // Создаем уникальный id, основываясь на имени и типе поля
    const uniqueId = `${column.name}_${column.type}_${index}`;
    
    return {
      ...column,
      // Добавляем уникальный ID для внутренней идентификации
      _uniqueId: uniqueId
    };
  });
  
  return {
    ...props.tableOptions,
    columns: columnsWithIds
  };
});

// Обрабатываем дополнительные поля, чтобы избежать конфликтов
const processedExtraFields = computed(() => {
  return props.extraEditableFields.map((field: Column, index: number) => {
    // Для поля date_from в extraFields используем уникальное внутреннее имя
    if (field.name === 'date_from' && field.type === 'datetime') {
      return {
        ...field,
        // Используем внутреннее уникальное имя для избежания конфликтов
        _internalName: `${field.name}_${field.type}_${index}`
      };
    }
    return field;
  });
});

// Модифицируем excludedFields, чтобы работать только с конкретными типами date_from
const processedExcludedFields = computed(() => {
  // Начинаем с базового списка исключений
  const excludeList = [...props.excludedFields];
  
  // Если в списке исключений есть date_from, обрабатываем особым образом
  if (excludeList.includes('date_from')) {
    // Удаляем date_from из списка
    const index = excludeList.indexOf('date_from');
    excludeList.splice(index, 1);
    
    // Добавляем date_from с типами date и time, но не datetime
    // Это позволит показать date_from типа datetime в доп. таблице
    props.tableOptions.columns.forEach((column: Column) => {
      if (column.name === 'date_from' && (column.type === 'date' || column.type === 'time')) {
        excludeList.push(`${column.name}_${column.type}`);
      }
    });
  }
  
  return excludeList;
});

// Хук для обработки обновлений
const handleUpdate = (data: any) => {
  emit('update', data);
};

// Наблюдаем за изменениями пропсов, которые требуют обработки
watch(() => props.tableOptions, () => {
  // Обновляем processedTableOptions при изменении tableOptions
}, { deep: true });

</script> 