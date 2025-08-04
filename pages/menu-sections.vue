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
import {ref} from 'vue';
import {useAuth} from '~/composables/useAuth';
import {useGlobalsStore} from '~/stores/globals';
import {storeToRefs} from 'pinia';
import Head from "~/components/parts/Head.vue"
import KirhTable from "~/components/kirh/table/KirhTable.vue";

const globalsStore = useGlobalsStore();
const {params, images} = storeToRefs(globalsStore);

// Загружаем данные на сервере при каждой загрузке страницы
const {data} = await useAsyncData('menu-sections-globals', async () => {
  await globalsStore.fetchData();
  return {params: globalsStore.params, images: globalsStore.images};
});

const config = useRuntimeConfig();
const api = config.public.API_URL;
const api_addr = api + '/api/menu-sections';

// Используем useSeoMeta с данными из хранилища
useSeoMeta({
  title: ((params.value as any).adminka_name || 'Админка') + ' - Разделы меню',
  description: 'Управление разделами меню',
});

const p_icon = "fluent:folder-list-20-filled";
const p_description = 'Разделы меню';
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
      name: 'name',
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
      name: 'icon',
      label: 'Иконка',
      type: 'icon',
      width: '220px',
      sortable: false,
      options: {
        readonly: false,
        only_icon: false,
        link_in_title: 'https://icon-sets.iconify.design/',
        hint_in_link: 'возьми код иконки на iconify по ссылке',
        cellClass: 'bg-gray-50 rounded h-8 text-gray-500 border px-1 pt-2 w-full text-left cursor-default'
      }
    },
    {
      name: 'description',
      label: 'Описание',
      type: 'text',
      min_width: '250px',
      sortable: false,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      }
    },
    {
      name: 'sort_order',
      label: 'Сортировка',
      type: 'number',
      width: '100px',
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
        placeholder: 'Введите число',
        hint: 'Число для сортировки (меньше = выше)',
      }
    },
    {
      name: 'status',
      label: 'Активен',
      type: 'toggle',
      width: '80px',
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      }
    },
  ],
  // Колонка Действия
  editable: true,
  editrow: false,
  deleteable: true,
  sortable: true,
  searchable: true,
  defaultSortField: 'sort_order',
  defaultSortDirection: 'asc',
  separateFields: false,
  pagination: true,
  main_field: 'name',
  pageSize: 30,
  enableResetFilters: true,
  resetFiltersLabel: 'Очистить',
  resetFiltersClass: 'text-xs bg-red-500 hover:bg-red-400 text-gray-50 px-3 py-1 mb-1 rounded-md transition-colors shadow-sm ' +
      'disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
});

// Поля формы
const formOptions = ref({
  showForm: true,
  keepFormAfterSubmit: false,
  autoOpen: true,
  containerClass: 'bg-gray-50',
  formTitle: 'Добавление раздела меню',
  hideButtons: false,
  hideCancelButton: false,
  cancelButtonText: 'Сбросить',
  hideSubmitButton: false,
  submitButtonText: 'Добавить',
  columns: [
    {
      name: 'name',
      label: 'Название',
      required: true,
      type: 'text',
      sortable: true,
      width: '300px',
      options: {
        readonly: false,
        placeholder: 'Название раздела',
        hint: 'Название раздела меню',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md',
      }
    },
    {
      name: 'icon',
      label: 'Иконка раздела',
      type: 'text',
      required: true,
      width: '250px',
      options: {
        readonly: false,
        placeholder: 'иконка',
        link_in_title: 'https://icon-sets.iconify.design/',
        hint_in_link: 'возьми код иконки на iconify по ссылке',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    },
    {
      name: 'description',
      label: 'Описание',
      required: false,
      type: 'text',
      sortable: false,
      width: '250px',
      options: {
        readonly: false,
        placeholder: 'Описание раздела',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    },
    {
      name: 'sort_order',
      label: 'Порядок сортировки',
      required: false,
      type: 'number',
      sortable: true,
      width: '160px',
      options: {
        readonly: false,
        placeholder: '0',
        hint: 'Число для сортировки (меньше = выше)',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md',
        defaultValue: '0'
      }
    },
    {
      name: 'status',
      label: 'Активен',
      required: false,
      type: 'toggle',
      sortable: true,
      width: '160px',
      options: {
        readonly: false,
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
      }
    },
  ]
});

// Дополнительные поля в секции редактирования отдельных полей
const extraFields = ref([]);

// Поля, видимые по умолчанию в доп.таблице
const defaultVisibleFields: string[] = [];

// Фильтры-селкты и фильтры-переключатели
const additionalFilters = ref([
  {
    field: 'status',
    label: 'Статус',
    type: 'toggle',
    options: [
      { label: 'Все', value: null },
      { label: 'Активны', value: true },
      { label: 'Неактивны', value: false }
    ]
  }
]);
</script>

<style scoped>
</style> 