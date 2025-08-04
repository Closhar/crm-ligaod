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
import {ref, onMounted, watch} from 'vue';
import {useAuth} from '~/composables/useAuth';
import {useGlobalsStore} from '~/stores/globals';
import {storeToRefs} from 'pinia';
import Head from "~/components/parts/Head.vue"
import KirhTable from "~/components/kirh/table/KirhTable.vue";

const globalsStore = useGlobalsStore();
const {params, images} = storeToRefs(globalsStore);

// Загружаем данные на сервере при каждой загрузке страницы
const {data} = await useAsyncData('genders-globals', async () => {
  await globalsStore.fetchData();
  return {params: globalsStore.params, images: globalsStore.images};
});

const config = useRuntimeConfig();
const api = config.public.API_URL;
const site = config.public.SITE_URL;
const api_addr = api + '/api/genders';

// Используем useSeoMeta с данными из хранилища
useSeoMeta({
  title: ((params.value as any).adminka_name || 'Админка') + ' - Пол',
  description: 'Управление полами',
});

const p_icon = "carbon:user-profile";
const p_description = 'Пол';
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
      width: '150px',
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      }
    },
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      min_width: '150px',
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
      min_width: '150px',
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      }
    },
  ],
  editable: true,
  editrow: false,
  deleteable: true,
  sortable: true,
  searchable: true,
  defaultSortField: 'id',
  defaultSortDirection: 'desc',
  separateFields: false,
  pagination: true,
  main_field: 'title',
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
  formTitle: 'Добавление пола',
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
        placeholder: 'Название пола',
        hint: 'Полное название пола',
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
        hint: 'Сокращенное название пола',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    },
    {
      name: 'slug',
      label: 'Slug',
      required: true,
      type: 'text',
      sortable: true,
      width: '200px',
      options: {
        readonly: false,
        placeholder: 'Уникальный идентификатор',
        hint: 'Уникальный идентификатор для URL',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    },
    {
      name: 'icon',
      label: 'Иконка',
      type: 'text',
      required: true,
      sortable: true,
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
  ]
});

// Дополнительные поля в секции редактирования отдельных полей
const extraFields = ref([]);

// Поля, видимые по умолчанию в доп.таблице
const defaultVisibleFields: string[] = [];

// Фильтры-селекты
const additionalFilters = ref([]);

</script>

<style scoped>
</style> 