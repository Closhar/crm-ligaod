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
const api_addr = api + '/api/galleries'

// Используем useSeoMeta с данными из хранилища
useSeoMeta({
  title: ((params.value as any)?.adminka_name || 'Админка') + ' - Галереи',
  description: 'Галереи',
});

const p_icon = "i-mdi:image-multiple";
const p_description = 'Галереи';
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
      name: 'image',
      label: '',
      displayLabel: 'Изображение',
      title_icon: 'stash:image',
      type: 'image',
      width: '82px',
      sortable: false,
      options: {
        image_path: 'gallery_image_path', // поле для текущего изображения
        thumbnailWidth: 80,
        thumbnailHeight: 50,
        previewMaxHeight: '500px',
        hint: 'изображение для события',
        modalTitle: 'Изображение для события:',
        modalTitleAddField: 'event_name', // добавление значения поля к заголовку модалки
        info: 'Загрузите изображение в формате JPG, PNG или GIF. Изображение приведется кразмеру 800x500px',
        resize: {
          enabled: true,       // Включить обработку изображений
          width: 800,          // Ширина (px)
          height: 500,         // Высота (px)
          crop: true,          // Обрезать до точных размеров
          quality: 0.8,         // Качество (0-1)
          maxSizeMB: 1,         // Максимальный размер (MB)
          mimeType: 'image/jpeg' // Тип выходного файла
        }
      }
    },
    {
      name: 'title',
      label: 'Название',
      type: 'text',
      min_width: '160px',
      sortable: true,
      options: {
        readonly: false,
        placeholder: 'название',
        cellClass: 'text-xs font-bold h-8 bg-gray-100 rounded text-blue-800 border px-1 w-full',
        input_class: 'text-red-500'
      }
    },
  ],
  editable: true,
  editrow: false,
  deleteable: true,
  sortable: true,
  separateFields: false,
  defaultSortField: 'id',
  defaultSortDirection: 'desc',
  link: 'id',
  link_prefix: site + '/galleries',
  pagination: true,
  main_field: 'title',
  pageSize: 30,
  searchable: true,
  enableResetFilters: true,
  showIdFilter: false,
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
  formTitle: 'Добавление галереи',
  hideButtons: false,
  hideCancelButton: false,
  cancelButtonText: 'Сбросить',
  hideSubmitButton: false,
  submitButtonText: 'Добавить',
  gridClass: 'grid-cols-1',
  columns: [
    {
      name: 'title',
      label: 'Название галереи',
      type: 'text',
      required: true,
      width: '100%',
      options: {
        readonly: false,
        placeholder: 'название',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-64',
        inputClass: 'p-1 h-10 border border-gray-300 rounded text-md',
      },
      validation: {
        required: true,
        minLength: 2
      }
    },
  ]
});

// Дополнительные поля в секции редактирования отдельных полей
const extraFields = ref([
    {
      name: 'gallery_info',
      label: 'Галерея',
      type: 'text',
      min_width: '160px',
      options: {
        readonly: true,
        cellClass: 'text-xs bg-gray-50 rounded text-gray-60 font-bold border px-1 pt-2 w-full min-h-8 text-left cursor-default'
      }
    },
]);

// Поля, видимые по умолчанию в доп.таблице
const defaultVisibleFields = ['gallery_info'];

// Фильтры-селкты и фильтры-переключатели
const additionalFilters = ref([]);

</script>

<style scoped>

</style> 