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
const api_addr = api + '/api/pages';

useSeoMeta({
  title: ((params.value as any).adminka_name || 'Админка') + ' - Страницы сайта',
  description: 'Страницы сайта',
});

const p_icon = 'fluent:document-multiple-20-filled';
const p_description = 'Страницы сайта';
const breadcrumbs: Array<{ id: number; title: string; icon: string; slug: string }> = [];

const { isAuthenticated } = useAuth();

const imageOptions = (imagePath: string) => ({
  readonly: false,
  image_path: imagePath,
  thumbnailWidth: 96,
  thumbnailHeight: 58,
  maxWidth: 1600,
  maxHeight: 1000,
  quality: 0.86,
  cellClass: 'bg-gray-50 rounded border px-1 py-1 w-full',
});

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
      name: 'icon',
      label: 'Иконка',
      type: 'icon',
      width: '220px',
      sortable: false,
      options: {
        readonly: false,
        only_icon: false,
        link_in_title: 'https://icon-sets.iconify.design/',
        hint_in_link: 'Подберите код иконки на Iconify',
        cellClass: 'bg-gray-50 rounded h-8 text-gray-500 border px-1 pt-2 w-full text-left cursor-pointer',
      },
    },
    {
      name: 'title',
      label: 'Название',
      type: 'text',
      min_width: '220px',
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      },
    },
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      min_width: '160px',
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      },
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      width: '52px',
      sortable: false,
      options: {
        editorEnabled: false,
        icon: 'mdi:text-box-outline',
        title: 'Редактирование description',
        readonly: false,
        placeholder: 'SEO description страницы',
        check_empty: true,
        empty_class: 'bg-red-300 hover:bg-red-200',
      },
    },
    {
      name: 'keywords',
      label: 'Keywords',
      type: 'textarea',
      width: '52px',
      sortable: false,
      options: {
        editorEnabled: false,
        icon: 'mdi:tag-multiple-outline',
        title: 'Редактирование keywords',
        readonly: false,
        placeholder: 'Ключевые слова страницы',
      },
    },
    {
      name: 'html',
      label: 'HTML',
      type: 'textarea',
      width: '52px',
      uploadEnabled: true,
      sortable: false,
      options: {
        editorEnabled: true,
        icon: 'icon-park-outline:text',
        title: 'Редактирование HTML страницы',
        readonly: false,
        placeholder: 'Основной HTML страницы',
        uploadUrl: api + '/api/upload-image',
        imageMaxWidth: 1600,
        imageQuality: 0.86,
      },
    },
    {
      name: 'image',
      label: 'SEO image',
      type: 'image',
      width: '130px',
      sortable: false,
      options: imageOptions('page_image'),
    },
    {
      name: 'image_default',
      label: 'Image default',
      type: 'image',
      width: '130px',
      sortable: false,
      options: imageOptions('default_page_image'),
    },
    {
      name: 'in_menu',
      label: 'В меню',
      type: 'toggle',
      width: '90px',
      sortable: true,
      options: {
        readonly: false,
      },
    },
    {
      name: 'menu_sort',
      label: 'Сорт. меню',
      type: 'number',
      width: '100px',
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer text-center',
      },
    },
    {
      name: 'in_mobile_menu',
      label: 'В моб. меню',
      type: 'toggle',
      width: '110px',
      sortable: true,
      options: {
        readonly: false,
      },
    },
    {
      name: 'mobile_menu_sort',
      label: 'Сорт. моб.',
      type: 'number',
      width: '100px',
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer text-center',
      },
    },
  ],
  editable: true,
  editrow: false,
  deleteable: true,
  sortable: true,
  searchable: true,
  showIdFilter: true,
  defaultSortField: 'id',
  defaultSortDirection: 'asc',
  separateFields: false,
  pagination: true,
  main_field: 'title',
  pageSize: 30,
  enableResetFilters: true,
  resetFiltersLabel: 'Очистить',
  resetFiltersClass: 'text-xs bg-red-500 hover:bg-red-400 text-gray-50 px-3 py-1 mb-1 rounded-md transition-colors shadow-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed',
});

const formOptions = ref({
  showForm: true,
  keepFormAfterSubmit: false,
  autoOpen: false,
  containerClass: 'bg-gray-50',
  formTitle: 'Добавление страницы сайта',
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
      width: '260px',
      options: {
        placeholder: 'Название страницы',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md',
      },
    },
    {
      name: 'slug',
      label: 'Slug',
      required: true,
      type: 'text',
      width: '220px',
      options: {
        placeholder: 'about',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md',
      },
    },
    {
      name: 'icon',
      label: 'Иконка',
      required: false,
      type: 'text',
      width: '260px',
      options: {
        placeholder: 'mdi:information-outline',
        link_in_title: 'https://icon-sets.iconify.design/',
        hint_in_link: 'Подберите код иконки на Iconify',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md',
      },
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      options: {
        editorEnabled: false,
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md',
      },
    },
    {
      name: 'keywords',
      label: 'Keywords',
      type: 'textarea',
      required: false,
      options: {
        editorEnabled: false,
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md',
      },
    },
    {
      name: 'html',
      label: 'HTML',
      type: 'textarea',
      required: false,
      options: {
        editorEnabled: true,
        uploadUrl: api + '/api/upload-image',
        icon: 'icon-park-outline:text',
        title: 'Редактирование HTML страницы',
      },
    },
    {
      name: 'in_menu',
      label: 'В меню',
      type: 'toggle',
      required: false,
      options: {
        defaultValue: false,
      },
    },
    {
      name: 'menu_sort',
      label: 'Сортировка меню',
      type: 'number',
      required: false,
      options: {
        placeholder: '500',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md',
      },
    },
    {
      name: 'in_mobile_menu',
      label: 'В мобильное меню',
      type: 'toggle',
      required: false,
      options: {
        defaultValue: false,
      },
    },
    {
      name: 'mobile_menu_sort',
      label: 'Сортировка мобильного меню',
      type: 'number',
      required: false,
      options: {
        placeholder: '500',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md',
      },
    },
  ],
});

const extraFields = ref([]);
const defaultVisibleFields: string[] = ['description', 'keywords', 'html', 'image', 'image_default'];

const additionalFilters = ref([
  {
    field: 'in_menu',
    label: 'В меню',
    type: 'toggle',
    options: [
      { label: 'Да', value: true, activeClass: 'bg-green-600 text-white' },
      { label: 'Нет', value: false, activeClass: 'bg-gray-600 text-white' },
    ],
  },
  {
    field: 'in_mobile_menu',
    label: 'В мобильном меню',
    type: 'toggle',
    options: [
      { label: 'Да', value: true, activeClass: 'bg-green-600 text-white' },
      { label: 'Нет', value: false, activeClass: 'bg-gray-600 text-white' },
    ],
  },
]);
</script>

<style scoped>
</style>
