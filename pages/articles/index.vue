<template>

  <header class="bg-gray-50shadow-sm border-b border-gray-300">
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
import { useGlobalsStore } from '~/stores/globals';

const globalsStore = useGlobalsStore();
const {params, images} = storeToRefs(globalsStore);

// Загружаем данные на сервере при каждой загрузке страницы
const {data} = await useAsyncData('globals', async () => {
  await globalsStore.fetchData(); // Вызываем метод fetchData из хранилища
  return {params: globalsStore.params, images: globalsStore.images};
});

const config = useRuntimeConfig(); // Используем useRuntimeConfig()
const api = config.public.API_URL;
const site = config.public.SITE_URL;
const api_addr = api + '/api/articles'

// Используем useSeoMeta с данными из хранилища
useSeoMeta({
  title: ((params.value as any)?.adminka_name || 'Админка') + ' - Новости',
  description: 'Новости',
});

const p_icon = "i-mdi:newspaper-variant-outline";
const p_description = 'Новости';
const breadcrumbs: Array<{id?: number, title?: string, icon?: string, slug?: string}> = [

];

const {isAuthenticated, user, logout, checkAuth} = useAuth();

// Параметры таблицы и поля
const tableOptions = ref({
  columns: [
    {
      name: 'id',
      label: 'ID',
      type: 'text',
      width: '70px',
      options: {
        readonly: true,
        cellClass: 'text-xs font-bold bg-yellow-50 rounded h-8 text-gray-60 border px-1 pt-2 w-full text-center cursor-default'
      }
    },
    {
      name: 'region_id',
      label: '',
      displayLabel: 'Регион',
      title_icon: 'i-ph:map-pin-area',
      type: 'select',
      width: '70px',
      sortable: false,
      options: {
        apiUrl: api + '/api/regions?type=async',
        keyField: 'id',
        emptyable: true,
        hint: 'Регион',
        labelField: 'title_short',
        enableSearch: true,
        options_list: "bg-gray-100 font-xs font-bold max-h-[200px] border border-gray-300 text-blue-800 rounded-md",
        sel_class: "text-xs text-blue-800 font-bold",
        list_item: null,
        displayLabelField: 'region.title_short',
      },
      emptyOption: {
        value: null,
        label: '-',
      },
    },
    {
      name: 'image',
      label: '',
      displayLabel: 'Изображение',
      title_icon: 'ep:picture-rounded',
      type: 'image',
      width: '70px',
      sortable: false,
      options: {
        image_path: 'article_image_path',
        hint: 'Изображение для новости',
        thumbnailWidth: 80,
        thumbnailHeight: 46,
        previewMaxHeight: '500px',
        modalTitle: 'Изображение новости:',
        modalTitleAddField: 'title',
        cellClass: 'w-full mx-auto',
        info: 'Загрузите изображение в формате JPG|PNG. Изображение приведется к размеру 800x500px',
        resize: {
          enabled: true,
          width: 800,
          height: 500,
          crop: true,
          quality: 0.8,
          maxSizeMB: 1,
          mimeType: 'image/jpeg'
        }
      },
    },
    {
      name: 'data',
      label: 'Дата',
      type: 'datetime',
      width: '150px',
      options: {
        readonly: false,
        cellClass: 'text-xs font-bold bg-blue-100 rounded h-8 text-gray-800 border px-1 w-full',
      }
    },
    {
      name: 'title',
      label: 'Заголовок',
      type: 'text',
      min_width: '360px',
      sortable: true,
      options: {
        readonly: false,
        placeholder: 'заголовок',
        cellClass: 'text-xs font-bold h-8 bg-gray-100 rounded text-blue-800 border px-1 w-full',
        input_class: 'text-red-500'
      }
    },
    {
      name: 'slug',
      label: 'слаг',
      type: 'text',
      min_width: '380px',
      sortable: false,
      options: {
        readonly: false,
        placeholder: 'slug',
        cellClass: 'text-xs h-8 bg-gray-100 rounded text-gray-800 border px-1 w-full',
        input_class: 'text-red-500'
      }
    },
    {
      name: 'published',
      label: '',
      displayLabel: 'Опубликовано',
      title_icon: 'si:fact-check-line',
      type: 'toggle',
      width: '60px',
      sortable: false,
      options: {
        display: 'switch', // или 'switch' для классического вида
        items: [
          {value: true, label: 'Вкл'},
          {value: false, label: 'Выкл'}
        ],
        activeClass: 'bg-green-500 text-white',
        inactiveClass: 'bg-red-100 text-red-800',
        readonly: false,
        hint: 'Опубликована ли статья',
        trueValue: 1,
        falseValue: 0,
        trueLabel: 'Да',
        falseLabel: 'Нет'
      }
    },
  ],
  editable: true,
  editrow: true,
  deleteable: true,
  sortable: true,
  separateFields: true,
  defaultSortField: 'data',
  defaultSortDirection: 'desc',
  link: 'slug',
  link_prefix: site + '/news',
  editrow_link_prefix: '/articles',
  pagination: true,
  main_field: 'title',
  pageSize: 30,
  searchable: true,
  enableResetFilters: true,
  showIdFilter: true,
  resetFiltersLabel: 'Очистить',
  resetFiltersClass: 'text-xs bg-red-500 hover:bg-red-400 text-gray-50 px-3 py-1 mb-1 rounded-md transition-colors shadow-sm ' +
      'disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
});

// Поля формы
const formOptions = ref({
  showForm: true,
  autoOpen: true,
  keepFormAfterSubmit: false,
  containerClass: 'bg-gray-50',
  formTitle: 'Добавление новости',
  hideButtons: false,
  hideCancelButton: false,
  cancelButtonText: 'Сбросить',
  hideSubmitButton: false,
  submitButtonText: 'Добавить',
  gridClass: 'grid-cols-1',
  columns: [
    {
      name: 'region_id',
      label: 'Регион',
      type: 'select',
      width: '100px',
      sortable: false,
      options: {
        apiUrl: api + '/api/regions?type=async',
        keyField: 'id',
        emptyable: true,
        labelField: 'title_short',
        enableSearch: true,
        options_list: "bg-gray-100 font-xs max-h-[200px] border border-gray-300 text-gray-800 rounded-md",
        sel_class: "text-xs text-gray-800",
        list_item: null,
        displayLabelField: 'region.title_short',
      },
    },
    {
      name: 'title',
      label: 'Заголовок новости',
      type: 'text',
      required: true,
      options: {
        readonly: false,
        placeholder: 'заголовок',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-64',
        inputClass: 'p-1 h-10 border border-gray-300 rounded text-md',
      }
    },
    {
      name: 'data',
      required: true,
      label: 'Дата',
      type: 'datetime',
      width: '180px',
      options: {
        readonly: false,
        cellClass: 'text-xs font-bold bg-blue-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    },
    {
      name: 'slug',
      label: 'Слаг',
      type: 'text',
      required: true,
      options: {
        readonly: false,
        placeholder: 'slug',
        transliterateFrom: 'title',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-64',
        inputClass: 'p-1 h-10 border border-gray-300 rounded text-md',
        autoSuggest: {
          apiUrl: '/api/articles',
          minLength: 2,
          debounce: 300,
          clickable: false,
          labelField: 'slug',
          valueField: 'id',
          showCount: false,
        }
      },
      validation: {
        required: true,
        minLength: 2
      }
    },
    {
      name: 'description',
      label: 'Описание',
      type: 'textarea',
      required: true,
      options: {
        readonly: false,
        editorEnabled: true,
        placeholder: 'краткое описание',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'p-1 h-20 border border-gray-300 rounded text-md',
      },
      validation: {
        required: true,
        minLength: 10
      }
    },
  ]
});

// Дополнительные поля в секции редактирования отдельных полей
const extraFields = ref([
    {
      name: 'article_info',
      label: 'Новость',
      type: 'text',
      min_width: '160px',
      options: {
        readonly: true,
        cellClass: 'text-xs bg-gray-50 rounded text-gray-60 font-bold border px-1 pt-2 w-full min-h-8 text-left cursor-default'
      }
    },
]);

// Поля, видимые по умолчанию в доп.таблице
const defaultVisibleFields = ['article_info'];

// Фильтры-селкты и фильтры-переключатели
const additionalFilters = ref([
  {
    field: 'region_id',
    label: 'Регион',
    apiUrl: api + '/api/regions?type=async',
    keyField: 'id',
    labelField: 'title_short',
    enableSearch: true,
    sel_class: "text-xs border min-w-48 border-gray-300 bg-gray-100 text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
    options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
    
    empty_option: {value: '', label: 'Все регионы'}
  },
  {
    field: 'published',
    label: 'Опубликовано',
    type: 'toggle',
    options: [
      { value: 1, label: 'Да' },
      { value: 0, label: 'Нет' }
    ],
    sel_class: "text-xs border min-w-48 border-gray-300 bg-gray-100 text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
    empty_option: {value: '', label: 'Все'}
  }
]);

</script>

<style scoped>

</style> 