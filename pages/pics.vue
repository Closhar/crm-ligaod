<template>
  <header class="bg-gray-50 shadow-sm border-b border-gray-300">
    <div class="px-6 pt-4">
      <div class="flex items-start justify-between">
        <Head :breadcrumbs="breadcrumbs" :icon="p_icon" :title="p_description" show_breadcrumbs="true" />
      </div>
    </div>
  </header>

  <div v-if="isAuthenticated" class="min-h-full text-gray-900">
    <KirhTable
      :api-url="api_addr"
      :defaultVisibleFields="defaultVisibleFields"
      :enable-field-selector="true"
      :extra-editable-fields="extraFields"
      :form-options="formOptions"
      :searchable="true"
      :table-options="tableOptions"
    />
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import KirhTable from '~/components/kirh/table/KirhTable.vue';
import Head from '~/components/parts/Head.vue';
import { useAuth } from '~/composables/useAuth';
import { useGlobals } from '~/composables/useGlobals';
import { useGlobalsStore } from '~/stores/globals';

const globalsStore = useGlobalsStore();
const { params } = storeToRefs(globalsStore);

useGlobals();

const config = useRuntimeConfig();
const api = config.public.API_URL;
const api_addr = api + '/api/pic-params';

useSeoMeta({
  title: ((params.value as any).adminka_name || 'Админка') + ' - Картинки сайта',
  description: 'Картинки сайта',
});

const p_icon = 'stash:image-light';
const p_description = 'Картинки сайта';
const breadcrumbs = [
  {
    id: 1,
    title: 'Система',
    icon: 'fluent:window-dev-tools-20-filled',
    slug: '/system',
  },
];

const { isAuthenticated } = useAuth();

const tableOptions = ref({
  columns: [
    {
      name: 'id',
      label: 'ID',
      type: 'text',
      width: '70px',
      sortable: true,
      options: {
        readonly: true,
        cellClass: 'text-xs font-bold bg-yellow-50 rounded h-8 text-gray-600 border px-1 pt-2 w-full text-center cursor-default',
      },
    },
    {
      name: 'title',
      label: 'Название',
      type: 'text',
      min_width: '260px',
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      },
    },
    {
      name: 'name',
      label: 'Ключ',
      type: 'text',
      min_width: '220px',
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'font-mono text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      },
    },
    {
      name: 'value',
      label: 'Картинка',
      type: 'image',
      width: '150px',
      sortable: false,
      options: {
        readonly: false,
        image_path: 'full_path',
        thumbnailWidth: 104,
        thumbnailHeight: 64,
        previewMaxHeight: '520px',
        modalTitle: 'Картинка параметра сайта',
        modalTitleAddField: 'title',
        info: 'Загрузите изображение для параметра. Значение будет сохранено в pic_params.value.',
        cellClass: 'bg-gray-50 rounded border px-1 py-1 w-full',
      },
    },
  ],
  editable: true,
  editrow: false,
  deleteable: true,
  sortable: true,
  searchable: true,
  showIdFilter: true,
  defaultSortField: 'title',
  defaultSortDirection: 'asc',
  separateFields: false,
  pagination: true,
  main_field: 'title',
  pageSize: 50,
  enableResetFilters: true,
  resetFiltersLabel: 'Очистить',
  resetFiltersClass: 'text-xs bg-red-500 hover:bg-red-400 text-gray-50 px-3 py-1 mb-1 rounded-md transition-colors shadow-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed',
});

const formOptions = ref({
  showForm: true,
  keepFormAfterSubmit: false,
  autoOpen: false,
  containerClass: 'bg-gray-50',
  formTitle: 'Добавление картинки сайта',
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
      width: '280px',
      options: {
        placeholder: 'Логотип сайта',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md',
      },
    },
    {
      name: 'name',
      label: 'Ключ',
      required: true,
      type: 'text',
      width: '240px',
      options: {
        placeholder: 'site_logo',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md font-mono',
      },
    },
    {
      name: 'value',
      label: 'Путь/URL',
      required: false,
      type: 'text',
      width: '360px',
      options: {
        placeholder: 'Можно оставить пустым и загрузить картинку после создания',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md',
      },
    },
  ],
});

const defaultVisibleFields = ['title', 'name', 'value'];
const extraFields = ['full_path'];
</script>
