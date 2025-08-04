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
const {data} = await useAsyncData('competition-seasons-globals', async () => {
  await globalsStore.fetchData();
  return {params: globalsStore.params, images: globalsStore.images};
});

const config = useRuntimeConfig();
const api = config.public.API_URL;
const site = config.public.SITE_URL;
const api_addr = api + '/api/competition-seasons'

useSeoMeta({
  title: ((params.value as any)?.adminka_name || 'Админка') + ' - Сезоны соревнований',
  description: 'Сезоны соревнований',
});

const p_icon = "i-mdi:calendar-multiple";
const p_description = 'Сезоны соревнований';
const breadcrumbs: Array<{id?: number, title?: string, icon?: string, slug?: string}> = [];

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
      name: 'competition_id',
      label: 'Соревнование',
      type: 'select',
      width: '250px',
      sortable: false,
      options: {
        apiUrl: api + '/api/competitions',
        keyField: 'id',
        labelField: 'title_short',
        enableSearch: true,
        emptyable: false,
        sel_class: "font-bold text-gray-700 bg-gray-50 hover:bg-gray-200",
        options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-green-600 rounded-md",
        list_item: null,
        displayLabelField: 'competition.title_short',
      }
    },
    {
      name: 'season_id',
      label: 'Сезон',
      type: 'select',
      width: '200px',
      sortable: false,
      options: {
        apiUrl: api + '/api/seasons',
        keyField: 'id',
        labelField: 'title',
        enableSearch: true,
        emptyable: true,
        sel_class: "font-bold text-blue-700 bg-blue-50 hover:bg-blue-200",
        options_list: "bg-white text-gray-900 max-h-[200px] border border-gray-300 bg-white text-gray-900 rounded-md shadow-lg",
        list_item: "text-gray-900 hover:bg-blue-100 px-3 py-2 cursor-pointer",
        displayLabelField: 'season.title',
      }
    },
    {
      name: 'title',
      label: 'Название сезона',
      type: 'text',
      min_width: '150px',
      sortable: true,
      options: {
        readonly: false,
        placeholder: '2024/2025',
        cellClass: 'text-xs font-bold h-8 bg-blue-100 rounded text-blue-800 border px-1 w-full',
        input_class: 'text-red-500'
      }
    },
    {
      name: 'date_from',
      label: 'Дата начала',
      type: 'date',
      width: '120px',
      options: {
        readonly: false,
        cellClass: 'text-xs font-bold bg-green-100 rounded h-8 text-gray-800 border px-1 w-full',
      }
    },
    {
      name: 'date_to',
      label: 'Дата окончания',
      type: 'date',
      width: '120px',
      options: {
        readonly: false,
        cellClass: 'text-xs font-bold bg-red-100 rounded h-8 text-gray-800 border px-1 w-full',
      }
    },
    {
      name: 'is_active',
      label: '',
      title_icon: 'fontisto:checkbox-active',
      type: 'toggle',
      width: '60px',
      sortable: false,
      options: {
        hint: 'Активно ли событие',
        display: 'switch', // или 'switch' для классического вида
        items: [
          {value: true, label: 'Вкл'},
          {value: false, label: 'Выкл'}
        ],
        activeClass: 'bg-green-500 text-white',
        inactiveClass: 'bg-red-100 text-red-800'
      }
    },
    {
      name: 'duration_days',
      label: 'Дней',
      type: 'text',
      width: '80px',
      sortable: false,
      options: {
        readonly: true,
        cellClass: 'text-xs font-bold bg-purple-100 rounded h-8 text-purple-800 border px-1 w-full text-center cursor-default'
      }
    },
  ],
  editable: true,
  editrow: false,
  deleteable: true,
  sortable: true,
  separateFields: true,
  defaultSortField: 'id',
  defaultSortDirection: 'desc',
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
  formTitle: 'Добавление сезона соревнования',
  hideButtons: false,
  hideCancelButton: false,
  cancelButtonText: 'Сбросить',
  hideSubmitButton: false,
  submitButtonText: 'Добавить',
  gridClass: 'grid-cols-1',
  columns: [
    {
      name: 'competition_id',
      required: true,
      label: 'Соревнование',
      type: 'select',
      sortable: false,
      options: {
        apiUrl: api + '/api/v1/competitions?type=async',
        keyField: 'id',
        labelField: 'title_short',
        enableSearch: true,
        emptyable: false,
        sel_class: "text-xs border min-w-48 w-52 border-gray-300 bg-gray-100 text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
        options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
        list_item: null,

        // Поля для отображения в статическом режиме
        displayLabelField: 'competition.title_short', // Вложенное поле
        //displayImageField: 'club_info.logo', // Вложенное поле
        //displayIconField: 'icon' // Плоское поле
      }
    },
    {
      name: 'season_id',
      label: 'Сезон',
      type: 'select',
      required: false,
      width: '400px',
      options: {
        apiUrl: api + '/api/seasons',
        keyField: 'id',
        labelField: 'title',
        enableSearch: true,
        emptyable: true,
        sel_class: "text-xs border min-w-48 w-52 border-gray-300 bg-blue-100 text-blue-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
        options_list: "bg-white text-gray-900 max-h-[200px] border border-gray-300 bg-white text-gray-900 rounded-md shadow-lg",
        list_item: "text-gray-900 hover:bg-blue-100 px-3 py-2 cursor-pointer",
        displayLabelField: 'season.title',
      }
    },
    {
      name: 'title',
      label: 'Название сезона',
      type: 'text',
      required: true,
      width: '400px',
      options: {
        readonly: false,
        placeholder: '2024/2025',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-64',
        inputClass: 'p-1 h-10 border border-gray-300 rounded text-md',
      },
      validation: {
        required: true,
        minLength: 2
      }
    },
    {
      name: 'date_from',
      required: false,
      label: 'Дата начала',
      type: 'date',
      width: '180px',
      options: {
        readonly: false,
        placeholder: '',
        hint: 'дата начала сезона',
        cellClass: 'text-xs font-bold bg-green-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    },
    {
      name: 'date_to',
      required: false,
      label: 'Дата окончания',
      type: 'date',
      width: '180px',
      options: {
        readonly: false,
        placeholder: '',
        hint: 'дата окончания сезона',
        cellClass: 'text-xs font-bold bg-red-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    },
    {
      name: 'is_active',
      label: 'акт.',
      type: 'toggle',
      width: '60px',
      sortable: false,
      options: {
        defaultChecked: true,
        display: 'switch',
        activeClass: 'bg-green-500 text-white',
        inactiveClass: 'bg-red-400 text-red-800'
      }
    },
  ],
  quickAdd: [
    {
      label: 'Соревнование',
      icon: 'i-mdi:trophy',
      title: 'Добавление нового соревнования',
      instruction: 'Заполните данные для создания нового соревнования.',
      apiUrl: '/api/competitions',
      forceLocalApi: false,
      successMessage: 'Соревнование успешно добавлено',
      fillField: 'competition_id',
      valueField: 'id',
      labelField: 'title',
      emitRefresh: false,
      fields: [
        {
          name: 'title',
          label: 'Название соревнования',
          required: true,
          type: 'text',
          placeholder: 'Введите название соревнования',
          options: {
            readonly: false,
            autoSuggest: {
              apiUrl: '/api/competitions',
              field_name: 'title',
              minLength: 2,
              debounce: 300,
              clickable: false,
              labelField: 'title',
              valueField: 'id',
              showCount: true,
            }
          }
        },
        {
          name: 'title_short',
          label: 'Краткое название',
          type: 'text',
          required: true,
          placeholder: 'Введите краткое название соревнования',
          defaultValue: ''
        },
        {
          name: 'slug',
          label: 'Слаг',
          type: 'text',
          required: true,
          placeholder: 'Введите слаг соревнования',
          defaultValue: ''
        },
        {
          name: 'sport_id',
          label: 'Вид спорта',
          type: 'select',
          required: true,
          options: {
            apiUrl: api + '/api/v1/sports?type=async',
            keyField: 'id',
            labelField: 'title',
            enableSearch: true,
            emptyable: false,
          }
        },
        {
          name: 'gender_id',
          label: 'Пол',
          type: 'select',
          required: true,
          options: {
            apiUrl: api + '/api/v1/genders?type=async',
            keyField: 'id',
            labelField: 'title',
            enableSearch: false,
            emptyable: false,
          }
        }
      ],
    },
    {
      label: 'Сезон',
      icon: 'i-mdi:calendar',
      title: 'Добавление нового сезона',
      instruction: 'Заполните данные для создания нового сезона.',
      apiUrl: '/api/seasons',
      forceLocalApi: false,
      successMessage: 'Сезон успешно добавлен',
      fillField: 'season_id',
      valueField: 'id',
      labelField: 'title',
      emitRefresh: false,
      fields: [
        {
          name: 'title',
          label: 'Название сезона',
          required: true,
          type: 'text',
          placeholder: 'Введите название сезона (например, 2024/2025)',
          options: {
            readonly: false,
          }
        }
      ],
    }
  ]
});

// Дополнительные поля в секции редактирования отдельных полей
const extraFields = ref([
  {
    name: 'description',
    label: '',
    displayLabel: 'Описание',
    title_icon: 'i-mdi:text',
    type: 'textarea',
    width: '50px',
    uploadEnabled: false,
    sortable: false,
    options: {
      editorEnabled: true,
      hint: 'Описание сезона',
      icon: 'i-mdi:text',
      title: 'Редактирование описания',
      readonly: false,
      sel_class: "text-gray-900 hover:text-blue-800",
      placeholder: 'Введите описание сезона...',
      uploadUrl: api + '/api/upload-image',
      imageMaxWidth: 1200,
      imageQuality: 0.8,
      check_empty: true,
      empty_class: 'bg-red-400 hover:bg-red-300',
    }
  },
]);

// Поля, видимые по умолчанию в доп.таблице
const defaultVisibleFields = ['description'];

// Фильтры
const additionalFilters = ref([
  {
    field: 'competition_id',
    label: 'Соревнование',
    apiUrl: api + '/api/competitions',
    keyField: 'id',
    limit: 10,
    labelField: 'title',
    options: {
      enableSearch: true,
    },
    sel_class: "text-xs border min-w-48 border-gray-300 bg-gray-100 text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
    options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100 text-gray-600 rounded-md",
    list_item: null,
    empty_option: {value: '', label: 'Все соревнования'}
  },
  {
    field: 'season_id',
    label: 'Сезон',
    apiUrl: api + '/api/seasons',
    keyField: 'id',
    limit: 10,
    labelField: 'title',
    options: {
      enableSearch: true,
    },
    sel_class: "text-xs border min-w-48 border-gray-300 bg-blue-100 text-blue-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
    options_list: "bg-white text-gray-900 max-h-[200px] border border-gray-300 bg-white text-gray-900 rounded-md shadow-lg",
    list_item: "text-gray-900 hover:bg-blue-100 px-3 py-2 cursor-pointer",
    empty_option: {value: '', label: 'Все сезоны'}
  },
  {
    field: 'is_active',
    label: 'Статус',
    type: 'select',
    options: [
      {value: '1', label: 'Активные'},
      {value: '0', label: 'Неактивные'},
    ],
    sel_class: "text-xs border min-w-48 border-gray-300 bg-gray-100 text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
    empty_option: {value: '', label: 'Все'}
  }
]);
</script>

<style scoped>
</style> 