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
const api_addr = api + '/api/clubs'

// Используем useSeoMeta с данными из хранилища
// const route = useRoute();
// const {data: pageData} = await useFetch(api + `/api/v1/apage/1`);

useSeoMeta({
  title: ((params.value as any)?.adminka_name || 'Админка') + ' - Команды',
  description: 'Команды',
});

const p_icon = "i-bxl:microsoft-teams";
const p_description = 'Команды';
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
        // Поля для отображения в статическом режиме
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
      displayLabel: 'Логотип',
      title_icon: 'ep:picture-rounded',
      type: 'image',
      width: '48px',
      sortable: false,
      options: {
        image_path: 'full_image_path', // поле для текущего изображения
        hint: 'Логотип команды',
        thumbnailWidth: 46,
        thumbnailHeight: 46,
        previewMaxHeight: '500px',
        modalTitle: 'Логотип клуба:',
        modalTitleAddField: 'club_info', // добавление значения поля к заголовку модалки
        cellClass: 'w-full mx-auto',
        info: 'Загрузите изображение в формате PNG. Изображение приведется кразмеру 512x512px',
        resize: {
          enabled: true,       // Включить обработку изображений
          width: 512,          // Ширина (px)
          height: 512,         // Высота (px)
          crop: true,          // Обрезать до точных размеров
          quality: 1,         // Качество (0-1)
          maxSizeMB: 1,         // Максимальный размер (MB)
          mimeType: 'image/png' // Тип выходного файла
        }
      },
    },
    {
      name: 'image_bg',
      label: '',
      displayLabel: 'Изображение в шапке',
      title_icon: 'stash:image',
      type: 'image',
      width: '82px',
      sortable: false,
      options: {
        hint: 'изображение в шапке раздела команды',
        image_path: 'bg_club_image_path', // поле для текущего изображения
        thumbnailWidth: 80,
        thumbnailHeight: 46,
        previewMaxHeight: '500px',
        modalTitle: 'Изображение для команды:',
        modalTitleAddField: 'club_info', // добавление значения поля к заголовку модалки
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
    {
      name: 'gender_id',
      label: 'Пол',
      displayLabel: 'Пол',
      type: 'select',
      width: '80px',
      sortable: false,
      options: {
        apiUrl: api + '/api/v1/genders',
        emptyable: false,
        keyField: 'id',
        labelField: 'title_short',
        iconField: 'icon',
        enableSearch: false,
        sel_class: "font-bold text-gray-700 bg-gray-50 hover:bg-gray-200",
        options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-green-600 rounded-md",
        list_item: null,

        // Поля для отображения в статическом режиме - значение из базы
        displayLabelField: 'gender.title_short', // Вложенное поле
        //displayImageField: 'club_info.logo', // Вложенное поле
        displayIconField: 'gender.icon', // Плоское поле
        ev: [{
          warn_ev: 1,
          class_warn_ev: "bg-blue-100 rounded h-8 text-blue-600 border w-full text-center cursor-default"
        },
          {
            warn_ev: 2,
            class_warn_ev: "bg-pink-200 rounded h-8 text-pink-800 border w-full text-center cursor-default"
          }],
      }
    },
    {
      name: 'title_short',
      label: '',
      title_icon: 'simple-icons:shortcut',
      displayLabel: 'Краткое обозначение',
      type: 'text',
      width: '60px',
      sortable: false,
      options: {
        readonly: false,
      hint: 'Краткое обозначение команды',
        placeholder: 'кратко',
        cellClass: 'text-xs font-bold h-8 bg-gray-100 rounded text-blue-800 border px-1 w-full',
        input_class: 'text-red-500'
      }
    },
    {
      name: 'slug',
      label: 'слаг',
      type: 'text',
      width: '200px',
      sortable: false,
      options: {
        readonly: false,
        placeholder: 'slug',
        cellClass: 'text-xs h-8 bg-gray-100 rounded text-gray-800 border px-1 w-full',
        input_class: 'text-red-500'
      }
    },
    {
      name: 'city_id',
      label: 'Город',
      type: 'select',
      width: '150px',
      sortable: false,
      options: {
        apiUrl: api + '/api/v1/cities',
        emptyable: false,
        keyField: 'id',
        labelField: 'title',
        enableSearch: true,
        sel_class: "",
        options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
        list_item: null,
        limit: 10,
        // Поля для отображения в статическом режиме
        displayLabelField: 'city.title', 
      }

    },
    {
      name: 'sport_id',
      label: 'вид спорта',
      type: 'select',
      width: '150px',
      sortable: false,
      options: {
        apiUrl: api + '/api/v1/sports',
        keyField: 'id',
        enableSearch: true,
        emptyable: false,
        labelField: 'title',
        iconField: 'icon',
        sel_class: "",
        options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
        list_item: null,
        limit: 10,
        // Поля для отображения в статическом режиме
        displayLabelField: 'sport.title', // Вложенное поле
        //displayImageField: 'club2.image', // Вложенное поле
        displayIconField: 'sport.icon' // Плоское поле
      }

    },
    {
      name: 'telegrams',
      label: '',
      displayLabel: 'Каналы Telegram',
      title_icon: 'line-md:telegram',
      type: 'textarea',
      width: '50px',
      uploadEnabled: false,
      sortable: false,
      options: {
        editorEnabled: false,
        visual_type: 'site',
        instruction: 'Введите адреса Telegram в формате: <b class="text-red-600">https://t.me/channel1|описание</b>. Каждый адрес через запятую или с новой строчки.',
        hint: 'Каналы Telegram команды',
        icon: 'jam:telegram',
        title: 'Редактирование каналов Telegram',
        readonly: false,
        sel_class: "text-blue-400 hover:text-blue-500",
        placeholder: 'Введите адреса каналов Telegram через запятую по шаблону: https://t.me/channel1|описание канала...',
        uploadUrl: api + '/api/upload-image',
        imageMaxWidth: 1200,
        imageQuality: 0.8,
        check_empty: true,
        empty_class: 'bg-red-400 hover:bg-red-300',
      }
    },
    {
      name: 'about',
      label: '',
      displayLabel: 'Информация',
      title_icon: 'healthicons:info-outline',
      type: 'textarea',
      width: '50px',
      uploadEnabled: true,
      sortable: false,
      options: {
        editorEnabled: true,
        hint: 'Информация о команде',
        icon: 'icon-park-outline:text',
        title: 'Редактирование описания',
        readonly: false,
        sel_class: "text-gray-900 hover:text-blue-800",
        placeholder: 'Введите описание...',
        uploadUrl: api + '/api/upload-image',
        imageMaxWidth: 1200,
        imageQuality: 0.8,
        check_empty: true, // !!!!!!
        empty_class: 'bg-red-400 hover:bg-red-300',
      }
    },
    {
      name: 'address',
      label: '',
      displayLabel: 'Адрес',
      title_icon: 'bx:map',
      type: 'textarea',
      width: '50px',
      uploadEnabled: true,
      sortable: false,
      options: {
        editorEnabled: true,
        hint: 'Адрес команды',
        icon: 'mdi:map-marker',
        title: 'Редактирование адреса',
        readonly: false,
        sel_class: "text-red-900 hover:text-red-800",
        placeholder: 'Введите адрес...',
        uploadUrl: api + '/api/upload-image',
        imageMaxWidth: 1200,
        imageQuality: 0.8,
        check_empty: true,
        empty_class: 'bg-red-400 hover:bg-red-300',
      }
    },
    {
      name: 'map',
      label: '',
      displayLabel: 'Карта',
      title_icon: 'pepicons-pop:map',
      type: 'textarea',
      width: '50px',
      uploadEnabled: false,
      sortable: false,
      options: {
        editorEnabled: true,
        hint: 'Карта расположения офиса команды',
        icon: 'lets-icons:map',
        title: 'Редактирование карты',
        readonly: false,
        sel_class: "text-green-800 hover:text-green-700",
        placeholder: 'Перейдите в режим источника и вставьте код карты...',
        uploadUrl: api + '/api/upload-image',
        imageMaxWidth: 1200,
        imageQuality: 0.8,
        check_empty: true,
        empty_class: 'bg-red-400 hover:bg-red-300',
      }
    },
    {
      name: 'emails',
      label: '',
      displayLabel: 'Электронные почты',
      title_icon: 'cib:mail-ru',
      type: 'textarea',
      width: '50px',
      uploadEnabled: false,
      sortable: false,
      options: {
        editorEnabled: false,
        visual_type: 'email',
        instruction: 'Введите электронные почты в формате: yourmail@mail.yes|описание. Каждый e-mail через запятую или с новой строчки.',
        hint: 'Электронные почты команды',
        icon: 'fluent:mail-copy-20-filled',
        title: 'Редактирование электронных почт',
        readonly: false,
        sel_class: "text-yellow-700 hover:text-yellow-600",
        placeholder: 'Введите адреса электронных почт через запятую по шаблону: email1@example.com|описание...',
        uploadUrl: api + '/api/upload-image',
        imageMaxWidth: 1200,
        imageQuality: 0.8,
        check_empty: true,
        empty_class: 'bg-red-400 hover:bg-red-300',
      }
    },
    {
      name: 'phones',
      label: '',
      displayLabel: 'Телефоны',
      title_icon: 'mingcute:phone-call-fill',
      type: 'textarea',
      width: '50px',
      uploadEnabled: false,
      sortable: false,
      options: {
        editorEnabled: false,
        hint: 'Телефоны команды',
        visual_type: 'phone',
        instruction: 'Введите номера телефонов в формате: <b class="text-red-600">+79991234567|описание</b>. Каждый телефон через запятую или с новой строчки.',
        icon: 'majesticons:phone-retro',
        title: 'Редактирование телефонов',
        readonly: false,
        sel_class: "text-fuchsia-700 hover:text-fuchsia-600",
        placeholder: 'Введите адреса телефонов через запятую по шаблону: +79991234567|описание...',
        uploadUrl: api + '/api/upload-image',
        imageMaxWidth: 1200,
        imageQuality: 0.8,
        check_empty: true,
        empty_class: 'bg-red-400 hover:bg-red-300',
      }
    },
    {
      name: 'sites',
      label: '',
      displayLabel: 'Сайты',
      title_icon: 'fa6-brands:internet-explorer',
      type: 'textarea',
      width: '50px',
      uploadEnabled: false,
      sortable: false,
      options: {
        editorEnabled: false,
        visual_type: 'site',
        instruction: 'Введите сайты в формате: <b class="text-red-600">https://site.yes|описание</b>. Каждый сайт через запятую или с новой строчки.',
        hint: 'Интернет-сайты команды',
        icon: 'material-symbols:captive-portal-rounded',
        title: 'Редактирование сайтов',
        readonly: false,
        sel_class: "text-cyan-700 hover:text-cyan-600",
        placeholder: 'Введите адреса сайтов через запятую по шаблону: https://адрес сайта|описание сайта...',
        uploadUrl: api + '/api/upload-image',
        imageMaxWidth: 1200,
        imageQuality: 0.8,
        check_empty: true,
        empty_class: 'bg-red-400 hover:bg-red-300',
      }
    },
  ],
  // Колонка Действия
  editable: true, // редактирование записи
  editrow: false, // кнопка редактирования записи
  deleteable: true, // кнопка удаления записи
  sortable: true, // сортировка полей
  separateFields: true, // редактирование отдельных полей
  defaultSortField: 'id', // Поле для сортировки по умолчанию
  defaultSortDirection: 'desc', // Направление сортировки по умолчанию (asc или desc)
  link: 'slug', // поле, значение которого передается во внешнюю ссылку в таблице (если null - ссылка не выводится)
  link_prefix: site + '/clubs', // префикс ссылки
  pagination: true, // пагинация
  main_field: 'title', // Главное поле. выводится при удалении строки с предупреждением
  pageSize: 30, // записей на страницу
  searchable: true, // Строка текстового поиска - параметр q= (настраивается на бэкенде)
  enableResetFilters: true, // Кнопка очистки фильтров
  showIdFilter: true,
  resetFiltersLabel: 'Очистить', // Подпись для кнопки Очистить
  resetFiltersClass: 'text-xs bg-red-500 hover:bg-red-400 text-gray-50 px-3 py-1 mb-1 rounded-md transition-colors shadow-sm ' +
      'disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed' // Дополнительные классы
});

// Поля формы
const formOptions = ref({
  showForm: true,
  autoOpen: true,
  keepFormAfterSubmit: false,
  containerClass: 'bg-gray-50',
  formTitle: 'Добавление команды',
  hideButtons: false,
  hideCancelButton: false,
  cancelButtonText: 'Сбросить',
  hideSubmitButton: false,
  submitButtonText: 'Добавить',
  gridClass: 'grid-cols-1', // Общая сетка формы
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
        // Поля для отображения в статическом режиме
        displayLabelField: 'region.title_short', // Вложенное поле
        //displayImageField: 'club_info.logo', // Вложенное поле
        //displayIconField: 'icon' // Плоское поле
      },
    },
    {
      name: 'title',
      label: 'Название команды',
      type: 'text',
      required: true,
      width: '250px',
      options: {
        readonly: false,
      placeholder: 'команда',
      cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-64',
      inputClass: 'p-1 h-10 border border-gray-300 rounded text-md',
    },
      validation: {
        required: true,
        minLength: 2
      }
    },
    {
      name: 'title_short',
      label: 'Кратко',
      type: 'text',
      required: true,
      width: '100px',
      options: {
        readonly: false,
        placeholder: 'сокр.',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-24',
      inputClass: 'p-1 h-10 border border-gray-300 rounded text-md',
    },
    validation: {
        required: true,
        minLength: 1
      }
    },
    {
      name: 'city_title',
      label: 'Город',
      required: true,
      type: 'text',
      width: '250px',
      options: {
        readonly: false,
        placeholder: 'название города',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md',
        autoSuggest: {
          apiUrl: '/api/cities',
      field_name: 'title',
          minLength: 2,
          debounce: 300,
          clickable: true,
          labelField: 'title',
          valueField: 'id',
        showCount: false,
      }
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
          apiUrl: '/api/clubs',
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
      name: 'gender_id',
      required: true,
      label: 'Пол',
      type: 'select',
      sortable: false,
      options: {
        apiUrl: api + '/api/v1/genders?type=async',
        keyField: 'id',
        labelField: 'title',
        iconField: 'icon',
        enableSearch: false,
        emptyable: false,
        cellClass: 'bg-gray-100 rounded border px-1 w-64',
        options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
        list_item: null,
        displayLabelField: 'gender.title',
      }
    },
    {
      name: 'sport_id',
      required: true,
      label: 'Вид спорта',
      type: 'select',
      sortable: false,
      options: {
        apiUrl: api + '/api/v1/sports?type=async',
        keyField: 'id',
        labelField: 'title',
        iconField: 'icon',
        enableSearch: true,
        emptyable: false,
        cellClass: 'bg-gray-100 rounded border px-1 w-64',
        options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
        list_item: null,
        displayLabelField: 'sport.title',
      }
    },
  ],
  quickAdd: [
    {
      label: 'Вид спорта', // Текст кнопки
      icon: 'i-ic:round-sports-kabaddi', // Опциональная иконка (имя иконки из библиотеки)
      title: 'Добавление нового вида спорта', // Заголовок модального окна
      instruction: 'Заполните данные для создания нового вида спорта. Не забудьте позже в разделе Виды спорта добавить описание и изображение для вида спорта.', // Инструкция (необязательно)
      apiUrl: '/api/sports', // URL для отправки данных
      forceLocalApi: false, // Не добавлять префикс API_URL (по умолчанию false)
      successMessage: 'Вид спорта успешно добавлен', // Сообщение при успешном добавлении
      fillField: 'sport_id', // Поле в основной форме, которое нужно заполнить после добавления
      valueField: 'id', // Поле в ответе API, значение которого нужно взять (по умолчанию 'id')
      labelField: 'title', // Поле в ответе API для отображения (по умолчанию 'name')
      emitRefresh: false, // Вызывать событие refresh при успешном добавлении (по умолчанию false)
      fields: [ // Массив полей формы
        
    {
      name: 'title',
      label: 'Вид спорта',
      required: true,
      type: 'text',
        placeholder: 'Введите название вида спорта',
      options: {
        readonly: false,
        autoSuggest: {
          apiUrl: '/api/sports',
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
          name: 'slug',
          label: 'Слаг',
          type: 'text',
          required: true,
          placeholder: 'Введите слаг вида спорта',
          defaultValue: '',
      options: {
        readonly: false,
        autoSuggest: {
          apiUrl: '/api/sports',
          field_name: 'slug',
          minLength: 2,
          debounce: 300,
          clickable: false,
          labelField: 'slug',
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
          placeholder: 'Введите краткое название вида спорта',
          defaultValue: ''
        },
        {
          name: 'icon',
          label: 'Иконка',
          type: 'text',
          required: true,
          placeholder: 'Введите иконку вида спорта',
          defaultValue: '',
          options: {
            link_in_title: 'https://icon-sets.iconify.design/',
            hint_in_link: 'возьми код иконки на iconify по ссылке',
              }
        }
      ],
    }
  ]
});

// Дополнитнльные поля в секции редактирования отдельных полей
const extraFields = ref([
    {
      name: 'vks',
      label: '',
      displayLabel: 'Страницы ВКонтакте',
      title_icon: 'entypo-social:vk',
      type: 'textarea',
      width: '50px',
      uploadEnabled: false,
      sortable: false,
      options: {
        editorEnabled: false,
        visual_type: 'site',
        instruction: 'Введите адреса ВКонтакте в формате: <b class="text-red-600">https://vk.com/id1234567890|описание</b>. Каждый адрес через запятую или с новой строчки.',
        hint: 'Страницы ВКонтакте команды',
        icon: 'fa6-brands:vk',
        title: 'Редактирование страниц ВКонтакте',
        readonly: false,
        sel_class: "text-blue-500 hover:text-blue-700",
        placeholder: 'Введите адреса страниц ВКонтакте через запятую по шаблону: https://vk.com/id1234567890|описание страницы...',
        uploadUrl: api + '/api/upload-image',
        imageMaxWidth: 1200,
        imageQuality: 0.8,
        check_empty: true,
        empty_class: 'bg-red-400 hover:bg-red-300',
      }
    },
    {
      name: 'youtubes',
      label: '',
      displayLabel: 'Каналы YouTube',
      title_icon: 'ri:youtube-line',
      type: 'textarea',
      width: '50px',
      uploadEnabled: false,
      sortable: false,
      options: {
        editorEnabled: false,
        visual_type: 'site',
        instruction: 'Введите адреса YouTube в формате: <b class="text-red-600">https://www.youtube.com/channel/UC1234567890|описание</b>. Каждый адрес через запятую или с новой строчки.',
        hint: 'Каналы YouTube команды',
        icon: 'tdesign:logo-youtube-filled',
        title: 'Редактирование каналов YouTube',
        readonly: false,
        sel_class: "text-red-500 hover:text-red-400",
        placeholder: 'Введите адреса каналов YouTube через запятую по шаблону: https://www.youtube.com/channel/UC1234567890|описание канала...',
        uploadUrl: api + '/api/upload-image',
        imageMaxWidth: 1200,
        imageQuality: 0.8,
        check_empty: true,
        empty_class: 'bg-red-400 hover:bg-red-300',
      }
    },
    {
      name: 'instagrams',
      label: '',
      displayLabel: 'Страницы Instagram',
      title_icon: 'ri:instagram-line',
      type: 'textarea',
      width: '50px',
      uploadEnabled: false,
      sortable: false,
      options: {
        editorEnabled: false,
        visual_type: 'site',
        instruction: 'Введите адреса Instagram в формате: <b class="text-red-600">https://www.instagram.com/channel1|описание</b>. Каждый адрес через запятую или с новой строчки.',
        hint: 'Страницы Instagram команды',
        icon: 'teenyicons:instagram-solid',
        title: 'Редактирование страниц Instagram',
        readonly: false,
        sel_class: "text-pink-500 hover:text-pink-400",
        placeholder: 'Введите адреса страниц Instagram через запятую по шаблону: https://www.instagram.com/channel1|описание страницы...',
        uploadUrl: api + '/api/upload-image',
        imageMaxWidth: 1200,
        imageQuality: 0.8,
        check_empty: true,
        empty_class: 'bg-red-400 hover:bg-red-300',
      }
    },
    {
      name: 'facebooks',
      label: '',
      displayLabel: 'Страницы Facebook',
      title_icon: 'icon-park-outline:facebook-one',
      type: 'textarea',
      width: '50px',
      uploadEnabled: false,
      sortable: false,
      options: {
        editorEnabled: false,
        visual_type: 'site',
        instruction: 'Введите адреса Facebook в формате: <b class="text-red-600">https://www.facebook.com/channel1|описание</b>. Каждый адрес через запятую или с новой строчки.',
        hint: 'Страницы Facebook команды',
        icon: 'qlementine-icons:facebook-fill-24',
        title: 'Редактирование страниц Facebook',
        readonly: false,
        sel_class: "text-blue-800 hover:text-blue-700",
        placeholder: 'Введите адреса страниц Facebook через запятую по шаблону: https://www.facebook.com/channel1|описание страницы...',
        uploadUrl: api + '/api/upload-image',
        imageMaxWidth: 1200,
        imageQuality: 0.8,
        check_empty: true,
        empty_class: 'bg-red-400 hover:bg-red-300',
      }
    },
    {
      name: 'xs',
      label: '',
      displayLabel: 'Страницы X',
      title_icon: 'bi:twitter-x',
      type: 'textarea',
      width: '50px',
      uploadEnabled: false,
      sortable: false,
      options: {
        editorEnabled: false,
        visual_type: 'site',
        instruction: 'Введите адреса X в формате: <b class="text-red-600">https://www.x.com/channel1|описание</b>. Каждый адрес через запятую или с новой строчки.',
        hint: 'Страницы X команды',
        icon: 'fa6-brands:square-x-twitter',
        title: 'Редактирование страниц X',
        readonly: false,
        sel_class: "text-gray-600 hover:text-gray-500",
        placeholder: 'Введите адреса страниц X через запятую по шаблону: https://www.x.com/channel1|описание страницы...',
        uploadUrl: api + '/api/upload-image',
        imageMaxWidth: 1200,
        imageQuality: 0.8,
        check_empty: true,
        empty_class: 'bg-red-400 hover:bg-red-300',
      }
    },
  {
    name: 'club_info',
    label: 'Команда',
    type: 'text',
    min_width: '160px',
    options: {
      readonly: true,
      cellClass: 'text-xs bg-gray-50 rounded text-gray-60 font-bold border px-1 pt-2 w-full min-h-8 text-left cursor-default'
    }
  },
]);

// Поля, видимые по умолчанию в доп.таблице
const defaultVisibleFields = ['club_info'];

// Фильтры-селкты и фильтры-переключатели (type: 'toggle')
const additionalFilters = ref([

  {
    field: 'sport_id',
    label: 'Вид спорта',
    apiUrl: api + '/api/v1/sports',
    keyField: 'id',
    limit: 10,
    labelField: 'title',
    iconField: 'icon',
    options: {
      enableSearch: true,
    },
    sel_class: "text-xs border min-w-48 border-gray-300 bg-gray-100 text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
    options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
    list_item: null,
    empty_option: {value: '', label: 'Все виды спорта'}
  },
  {
    field: 'gender_id',
    label: 'Пол',
    apiUrl: api + '/api/v1/genders',
    keyField: 'id',
    labelField: 'title',
    iconField: 'icon',
    options: {
      enableSearch: false,
    },
    sel_class: "text-xs border min-w-48 border-gray-300 bg-gray-100 text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
    options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
    list_item: null,
    empty_option: {value: '', label: 'Все'}
  }, 
  {
    field: 'city_id',
    label: 'Город',
    apiUrl: api + '/api/cities?type=async',
    keyField: 'id',
    limit: 10,
    labelField: 'title',
    options: {
      enableSearch: true,
    },
    defaultValue: null,
    sel_class: "text-xs border min-w-48 border-gray-300 bg-gray-100 text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
    options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
    list_item: null,
    empty_option: {value: '', label: 'Все города'}
  }, 
  {
    field: 'region_id',
    label: 'Регион',
    apiUrl: api + '/api/regions?type=async',
    keyField: 'id',
    labelField: 'title_short',
    enableSearch: true,
    sel_class: "text-xs border min-w-48 border-gray-300 bg-gray-100 text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
    options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
    list_item: null,
    empty_option: {value: '', label: 'Все регионы'}
  }
]);

</script>

<style scoped>

</style>