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
const api_addr = api + '/api/series';

// Используем useSeoMeta с данными из хранилища
useSeoMeta({
  title: ((params.value as any).adminka_name || 'Админка') + ' - Серии',
  description: 'Управление сериями',
});

const p_icon = "fluent:document-queue-24-filled";
const p_description = 'Серии';
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
      min_width: '300px',
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      }
    },
    {
      name: 'match_info',
      label: 'Инфо о матче',
      type: 'text',
      width: '250px',
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
      },
    },
    {
      name: 'series_type_id',
      label: 'Тип серии',
      type: 'select',
      width: '170px',
      sortable: false,
      options: {
        apiUrl: api + '/api/series-types?type=async',
        keyField: 'id',
        emptyable: false,
        labelField: 'title',
        enableSearch: true,
        options_list: "bg-gray-100 font-xs font-bold max-h-[200px] border border-gray-300 text-blue-800 rounded-md",
        sel_class: "text-xs text-blue-800 font-bold",
        list_item: null,
        displayLabelField: 'series_type.title',
      },
    },
    {
      name: 'description',
      label: '',
      title_icon: 'healthicons:info-outline',
      type: 'textarea',
      width: '50px',
      sortable: false,
      options: {
        editorEnabled: false,
        hint: 'Описание серии',
        icon: 'icon-park-outline:text',
        title: 'Редактирование описания серии',
        readonly: false,
        sel_class: "text-gray-900 hover:text-blue-800",
        placeholder: 'Введите описание серии...',
        empty_class: 'bg-red-400 hover:bg-red-300',
        check_empty: true,
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
  formTitle: 'Добавление серии',
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
      width: '300px',
      options: {
        readonly: false,
        placeholder: 'Название серии',
        hint: 'Полное название серии',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md',
      }
    },
    {
      name: 'match_info',
      label: 'Инфо о матче',
      required: false,
      type: 'text',
      sortable: true,
      width: '300px',
      options: {
        readonly: false,
        hint: 'Информация об отдельном матче (Название/этап в таблице для конструктора серии)',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    },
    {
      name: 'title_short',
      label: 'Сокращение',
      required: true,
      type: 'text',
      sortable: true,
      width: '150px',
      options: {
        readonly: false,
        placeholder: 'Сокращение',
        hint: 'Сокращенное название серии для вывода в таблице',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md',
      autoSuggest: {
          apiUrl: '/api/series',
          field_name: 'title_short',
          minLength: 2,
          debounce: 300,
          clickable: false,
          labelField: 'title_short',
          valueField: 'id',
        showCount: true,
      }
      },
    },
    {
      name: 'series_type_id',
      required: true,
      label: 'Тип серии',
      type: 'select',
      options: {
        apiUrl: api + '/api/series-types?type=async',
        keyField: 'id',
        labelField: 'title',
        enableSearch: false,
        emptyable: false,
        sel_class: "text-xs border min-w-48 w-52 border-gray-300 bg-gray-100 text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
        options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
        list_item: null,

        // Поля для отображения в статическом режиме
        displayLabelField: 'series_type.title', // Вложенное поле
        //displayImageField: 'club_info.logo', // Вложенное поле
        //displayIconField: 'icon' // Плоское поле
      }
    },
    {
      name: 'description',
      label: 'описание серии',
      type: 'textarea',
      required: false,
      //width: '250px',
      options: {
        editorEnabled: false,
        readonly: false,
        placeholder: 'Введите описание серии...',
        uploadUrl: api + '/api/upload-image',
        imageMaxWidth: 1200,
        imageQuality: 0.8,
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