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
const api_addr = api + '/api/sport_properties'

// Используем useSeoMeta с данными из хранилища
useSeoMeta({
  title: ((params.value as any).adminka_name || 'Админка') + ' - Свойства видов спорта',
  description: 'Свойства видов спорта',
});

const p_icon = "i-carbon:list-boxes";
const p_description = 'Свойства видов спорта';
const breadcrumbs: Array<{id: number, title: string, icon: string, slug: string}> = [

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
      name: 'icon',
      label: 'иконка',
      type: 'icon',
      width: '150px',
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
      name: 'title',
      label: 'тип вида спорта',
      type: 'text',
      min_width: '200px',
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      }
    },
    {
      name: 'annotation',
      label: '',
      title_icon: 'tabler:file-description',
      type: 'textarea',
      width: '50px',
      uploadEnabled: true,
      sortable: false,
      options: {
        hint: 'описание типа вида спорта',
        editorEnabled: true,
        icon: 'icon-park-outline:text',
        title: 'Редактирование описания',
        readonly: false,
        placeholder: 'Введите описание...',
        uploadUrl: api + '/api/upload-image',
        imageMaxWidth: 1200,
        imageQuality: 0.8,
        check_empty: true,
        empty_class: 'bg-red-100',
      }
    },
  ],
  // Колонка Действия
  editable: true, // редактирование записи
  editrow: false, // кнопка редактирования записи
  deleteable: true, // кнопка удаления записи
  sortable: true, // сортировка полей
  searchable: true, // Строка текстового поиска - параметр q= (настраивается на бэкенде)
  showIdFilter: true,
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
  formTitle: 'Добавление свойства вида спорта',
  hideButtons: false,
  hideCancelButton: false,
  cancelButtonText: 'Сбросить',
  hideSubmitButton: false,
  submitButtonText: 'Добавить',
  columns: [
    {
      name: 'title',
      label: 'Тип вида спорта',
      required: true,
      type: 'text',
      sortable: true,
      width: '250px',
      options: {
        readonly: false,
        placeholder: 'название',
        hint: 'название типа вида спорта',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    },
    {
      name: 'icon',
      label: 'иконка',
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
    {
      name: 'annotation',
      label: 'описание',
      type: 'editor',
      required: true,
      sortable: true,
      //width: '250px',
      options: {
        editorEnabled: true,
        readonly: false,
        placeholder: 'Введите описание типа вида спорта...',
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
const extraFields = ref([

]);

// Поля, видимые по умолчанию в доп.таблице
const defaultVisibleFields: string[] = [];

// Фильтры-селкты и фильтры-переключатели (type: 'toggle')
const additionalFilters = ref([
  {
    name: 'id',
    label: 'ID',
    type: 'number',
    options: {
      value: null,
      placeholder: 'ID',
      inputClass: 'w-20 p-1 h-8 border border-gray-300 rounded text-md'
    }
  }
]);

</script>

<style scoped>

</style> 