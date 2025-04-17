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

import {ref, onMounted, watch} from 'vue';
import {useAuth} from '~/composables/useAuth';
import {useGlobalsStore} from '~/stores/globals';
import {storeToRefs} from 'pinia';
import Head from "~/components/parts/Head.vue"
import KirhTable from "~/components/kirh/table/KirhTable.vue";

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
const api_addr = api + '/api/streams'

// Используем useSeoMeta с данными из хранилища
// const route = useRoute();
// const {data: pageData} = await useFetch(api + `/api/v1/apage/1`);

useSeoMeta({
  title: params.value.adminka_name + ' - Трансляции',
  description: 'Трансляции',
});

const p_icon = "solar:stream-broken";
const p_description = 'Трансляции';
const breadcrumbs = [

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
      name: 'date',
      label: 'Дата',
      type: 'date',
      width: '110px',
      options: {
        readonly: false,
        cellClass: 'text-xs font-bold bg-blue-100 rounded h-8 text-gray-800 border px-1 w-full',
      }
    },
    {
      name: 'date',
      label: 'Время',
      type: 'time',
      width: '100px',
      sortable: false,
      options: {
        cellClass: 'text-xs font-bold bg-blue-200 rounded h-8 text-gray-800 border px-1 w-full',
        ev: [{
          warn_ev: "00:00",
          class_warn_ev: "text-xs font-bold bg-red-200 rounded h-8 text-gray-800 border px-1 w-full"
        }],
      }
    },
    {
      name: 'title',
      label: 'заголовок трансляции',
      type: 'text',
      min_width: '200px',
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      }
    },
    {
      name: 'link',
      label: 'ссылка на трансляцию',
      type: 'text',
      min_width: '200px',
      sortable: false,
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
  formTitle: 'Добавление трансляции',
  hideButtons: false,
  hideCancelButton: false,
  cancelButtonText: 'Сбросить',
  hideSubmitButton: false,
  submitButtonText: 'Добавить',
  columns: [{
      name: 'date',
      required: true,
      label: 'Дата',
      type: 'datetime',
      width: '180px',
      options: {
        readonly: false,
        placeholder: '',
        hint: 'дата и время события',
        cellClass: 'text-xs font-bold bg-blue-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    },
    {
      name: 'title',
      label: 'заголовок трансляции',
      required: true,
      type: 'text',
      sortable: true,
      width: '350px',
      options: {
        readonly: false,
        placeholder: 'название',
        hint: 'название трансляции',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    },
    {
      name: 'link',
      label: 'ссылка на трансляцию',
      required: true,
      type: 'text',
      sortable: true,
      width: '350px',
      options: {
        readonly: false,
        placeholder: 'ссылка на трансляцию',
        //hint: '',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    },
  ]
});

// Дополнитнльные поля в секции редактирования отдельных полей
const extraFields = ref([

]);

// Поля, видимые по умолчанию в доп.таблице
const defaultVisibleFields: string[] = [];

// Фильтры-селкты и фильтры-переключатели (type: 'toggle')
const additionalFilters = ref([

]);

</script>

<style scoped>

</style>