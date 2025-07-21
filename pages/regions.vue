<template>

  <header class="bg-white shadow-sm border-b border-gray-300">
    <div class="px-6 pt-4">
      <div class="flex items-start justify-between">

        <Head :breadcrumbs="breadcrumbs" :icon="p_icon" :title="p_description" show_breadcrumbs="true"/>

      </div>
    </div>
  </header>

  <div v-if="isAuthenticated" class="">

    <div class="min-h-full text-gray-900">

      <KirhTable
          :additional-filters="additionalFilters"
          :api-url="api_addr"
          :defaultVisibleFields="defaultVisibleFields"
          :enable-field-selector="true"
          :extra-editable-fields="extraFields"
          :form-options="formOptions"
          :searchable="true"
          :table-options="tableOptions"
      />

    </div>

  </div>

</template>

<script lang="ts" setup>

import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import KirhTable from "~/components/kirh/table/KirhTable.vue";
import Head from "~/components/parts/Head.vue";
import { useAuth } from '~/composables/useAuth';
import { useGlobals } from '~/composables/useGlobals';
import { useGlobalsStore } from '~/stores/globals';

const globalsStore = useGlobalsStore();
const {params, images} = storeToRefs(globalsStore);

// Загружаем данные на сервере при каждой загрузке страницы
const { data } = useGlobals()

const config = useRuntimeConfig(); // Используем useRuntimeConfig()
const api = config.public.API_URL;
const site = config.public.SITE_URL;
const api_addr = api + '/api/regions';

// Используем useSeoMeta с данными из хранилища
useSeoMeta({
  title: ((params.value as any).adminka_name || 'Админка') + ' - Регионы',
  description: 'Управление регионами',
});

const p_icon = "carbon:location-filled";
const p_description = 'Регионы';
const breadcrumbs = [
  {
    id: 1,
    title: 'Система',
    icon: 'fluent:window-dev-tools-20-filled',
    slug: '/system'
  },
];

const {isAuthenticated, user, logout, checkAuth} = useAuth();

// Параметры таблицы и поля
const tableOptions = ref({
  columns: [
    {
      name: 'id',
      label: 'ID',
      type: 'text',
      width: '60px',
      options: {
        readonly: true,
        cellClass: 'text-xs font-bold bg-yellow-50 rounded h-8 text-gray-60 border px-1 pt-2 w-full text-center cursor-default'
      }
    },
    {
      name: 'title',
      label: 'Название',
      type: 'text',
      min_width: '200px',
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      }
    },
    {
      name: 'title_short',
      label: 'Сокращение',
      type: 'text',
      min_width: '150px',
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      }
    },
    {
      name: 'subdomain',
      label: 'Поддомен',
      type: 'text',
      min_width: '150px',
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      }
    },
  ],
  // Колонка Действия
  editable: true, // редактирование записи
  editrow: false, // кнопка редактирования записи
  deleteable: true, // кнопка удаления записи
  sortable: true, // сортировка полей
  searchable: true, // Строка текстового поиска - параметр q= (настраивается на бэкенде)
  defaultSortField: 'id', // Поле для сортировки по умолчанию
  defaultSortDirection: 'desc', // Направление сортировки по умолчанию (asc или desc)
  separateFields: false, // редактирование отдельных полей
  pagination: true, // пагинация
  main_field: 'title', // Главное поле. выводится при удалении строки с предупреждением
  pageSize: 30, // записей на страницу
  enableResetFilters: true, // Кнопка очистки фильтров
  resetFiltersLabel: 'Очистить', // Подпись для кнопки Очистить
  resetFiltersClass: 'text-xs bg-red-500 hover:bg-red-400 text-gray-50 px-3 py-1 mb-1 rounded-md transition-colors shadow-sm ' +
      'disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed' // Дополнительные классы
});

// Поля формы
const formOptions = ref({
  showForm: true,
  keepFormAfterSubmit: false, // не обнулять форму после отправки данных
  autoOpen: true,
  containerClass: 'bg-gray-50',
  formTitle: 'Добавление региона',
  hideButtons: false,
  hideCancelButton: false,
  cancelButtonText: 'Сбросить',
  hideSubmitButton: false,
  submitButtonText: 'Добавить',
  columns: [
    {
      name: 'title',
      label: 'Название',
      required: true,
      type: 'text',
      sortable: true,
      width: '400px',
      options: {
        readonly: false,
        placeholder: 'Название региона',
        hint: 'Полное название региона',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md',
      }
    },
    {
      name: 'title_short',
      label: 'Сокращение',
      required: true,
      type: 'text',
      sortable: true,
      width: '200px',
      options: {
        readonly: false,
        placeholder: 'Сокращенное название',
        hint: 'Сокращенное название региона',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    },
    {
      name: 'subdomain',
      label: 'Поддомен',
      required: false,
      type: 'text',
      sortable: true,
      width: '200px',
      options: {
        readonly: false,
        placeholder: 'Поддомен',
        hint: 'Поддомен для региона',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    },
  ]
});

// Дополнитнльные поля в секции редактирования отдельных полей
const extraFields = ref([]);

// Поля, видимые по умолчанию в доп.таблице
const defaultVisibleFields: string[] = [];

// Фильтры-селекты
const additionalFilters = ref([]);

</script>

<style scoped>

</style> 