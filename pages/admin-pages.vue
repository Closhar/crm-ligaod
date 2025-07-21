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
const api_addr = api + '/api/admin-pages';

// Используем useSeoMeta с данными из хранилища
useSeoMeta({
  title: ((params.value as any).adminka_name || 'Админка') + ' - Страницы админки',
  description: 'Страницы админки',
});

const p_icon = "iconoir:multiple-pages";
const p_description = 'Страницы админки';
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
      name: 'slug',
      label: 'Слаг',
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
      label: 'Иконка страницы',
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
      name: 'menu_section_id',
      label: 'Раздел меню',
      type: 'select',
      width: '200px',
      sortable: false,
      options: {
        apiUrl: api + '/api/menu-sections?type=async',
        keyField: 'id',
        emptyable: true,
        hint: 'Раздел меню',
        labelField: 'title',
        enableSearch: true,
        options_list: "bg-gray-100 font-xs font-bold max-h-[200px] border border-gray-300 text-blue-800 rounded-md",
        sel_class: "text-xs text-blue-800 font-bold",
        list_item: null,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
        displayLabelField: 'menu_section.name'
      },
      emptyOption: {
        value: null,
        label: 'Без раздела',
      },
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
        clickable: true,
      }
    },
    {
      name: 'menu',
      label: 'В меню',
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
  editable: true, // редактирование записи
  editrow: false, // кнопка редактирования записи
  deleteable: true, // кнопка удаления записи
  sortable: true, // сортировка полей
  searchable: true, // Строка текстового поиска - параметр q= (настраивается на бэкенде)
  defaultSortField: 'sort_order', // Поле для сортировки по умолчанию
  defaultSortDirection: 'asc', // Направление сортировки по умолчанию (asc или desc)
  separateFields: true, // редактирование отдельных полей
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
  formTitle: 'Добавление страницы админки',
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
        placeholder: 'Название страницы',
        hint: 'Название страницы админки',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md',
      }
    },
    {
      name: 'slug',
      label: 'Слаг',
      required: true,
      type: 'text',
      sortable: true,
      width: '200px',
      options: {
        readonly: false,
        placeholder: 'slug',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    },
    {
      name: 'icon',
      label: 'Иконка страницы',
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
        placeholder: 'Описание страницы',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    },
    {
      name: 'menu_section_id',
      label: 'Раздел меню',
      type: 'select',
      required: false,
      width: '250px',
      options: {
        apiUrl: api + '/api/menu-sections?type=async',
        keyField: 'id',
        emptyable: true,
        hint: 'Раздел меню',
        labelField: 'title',
        enableSearch: true,
        options_list: "bg-gray-100 font-xs font-bold max-h-[200px] border border-gray-300 text-blue-800 rounded-md",
        sel_class: "text-xs text-blue-800 font-bold",
        list_item: null,
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      },
      emptyOption: {
        value: null,
        label: 'Без раздела',
      },
    },
    {
      name: 'sort_order',
      label: 'Порядок сортировки',
      required: false,
      type: 'text',
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
      name: 'menu',
      label: 'Отображать в меню',
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

// Дополнитнльные поля в секции редактирования отдельных полей
const extraFields = ref([]);

// Поля, видимые по умолчанию в доп.таблице
const defaultVisibleFields: string[] = [];

// Фильтры-селкты и фильтры-переключатели (type: 'toggle')
const additionalFilters = ref([
  {
    field: 'menu',
    label: 'В меню',
    type: 'toggle',
    options: [
      { label: 'Все', value: null },
      { label: 'Да', value: true },
      { label: 'Нет', value: false }
    ]
  },
  {
    field: 'menu_section_id',
    label: 'Раздел меню',
    type: 'select',
    options: {
      apiUrl: api + '/api/menu-sections?type=async',
      keyField: 'id',
      emptyable: true,
      hint: 'Раздел меню',
      labelField: 'title',
      enableSearch: true,
      options_list: "bg-gray-100 font-xs font-bold max-h-[200px] border border-gray-300 text-blue-800 rounded-md",
      sel_class: "text-xs text-blue-800 font-bold",
      list_item: null,
    },
    emptyOption: {
      value: null,
      label: 'Все разделы',
    },
  }
]);

</script>

<style scoped>

</style>