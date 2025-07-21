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
import { useGlobals } from '~/composables/useGlobals';
import { useGlobalsStore } from '~/stores/globals';

const globalsStore = useGlobalsStore();
const {params, images} = storeToRefs(globalsStore);

// Загружаем данные на сервере при каждой загрузке страницы
const { data } = useGlobals()

const config = useRuntimeConfig(); // Используем useRuntimeConfig()
const api = config.public.API_URL;
const site = config.public.SITE_URL;
const api_addr = api + '/api/sports'

// Используем useSeoMeta с данными из хранилища
// const route = useRoute();
// const {data: pageData} = await useFetch(api + `/api/v1/apage/1`);

useSeoMeta({
  title: ((params.value as any).adminka_name || 'Админка') + ' - Виды спорта',
  description: 'Виды спорта',
});

const p_icon = "i-ic:round-sports-kabaddi";
const p_description = 'Виды спорта';
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
      label: 'иконка вида спорта',
      type: 'icon',
      width: '220px',
      sortable: false,
      options: {
        //hint: '123',
        readonly: false,
        only_icon: false,
        link_in_title: 'https://icon-sets.iconify.design/',
        hint_in_link: 'возьми код иконки на iconify по ссылке',
        cellClass: 'bg-gray-50 rounded h-8 text-gray-500 border px-1 pt-2 w-full text-left cursor-default'
      }
    },
    {
      name: 'title',
      label: 'вид спорта',
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
      label: 'слаг',
      type: 'text',
      width: '180px',
      sortable: false,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      }
    },
    {
      name: 'title_short',
      label: '',
      title_icon: 'simple-icons:shortcut',
      type: 'text',
      width: '80px',
      sortable: false,
      options: {
        readonly: false,
        hint: 'сокращенное наименование вида спорта',
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      }
    },
    {
      name: 'image',
      label: '',
      title_icon: 'stash:image',
      type: 'image',
      width: '50px',
      sortable: false,
      options: {
        hint: 'изображение в шапке раздела вида спорта',
        image_path: 'full_image_path', // поле для текущего изображения
        thumbnailWidth: 46,
        thumbnailHeight: 31,
        previewMaxHeight: '500px',
        modalTitle: 'Изображение для вида спорта:',
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
      name: 'sport_properties',
      label: '',
      displayLabel: 'Свойства спорта',
      title_icon: 'solar:pin-list-linear',
      type: 'belongsToMany',
      width: '50px',
      sortable: false,
      options: {
        relationField: 'sport_properties',
        relationLabel: 'свойств спорта',
        hint: 'Свойства вида спорта',
        titleField: 'title',
        mainField: 'title',
        searchEndpoint: api + '/api/sport_properties',
        searchField: 'title',
        valueField: 'id',
        searchParam: 'q',
        minSearchLength: 2,
        empty_class: 'bg-red-400 hover:bg-red-300 text-gray-50',
        tooltipField: 'title',
      }
    },
    {
      name: 'arenas',
      label: '',
      displayLabel: 'Спортсооружения',
      title_icon: 'i-mdi:stadium',
      type: 'morphToMany',
      width: '50px',
      sortable: false,
      options: {
        relationField: 'arenas',
        relationLabel: 'спортсооружений',
        hint: 'Спортсооружения для вида спорта',
        titleField: 'title',
        mainField: 'title',
        searchEndpoint: api + '/api/arenas',
        searchField: 'title',
        valueField: 'id',
        searchParam: 'q',
        minSearchLength: 2,
        empty_class: 'bg-red-400 hover:bg-red-300 text-gray-50',
        tooltipField: 'title',
      }
    },
    {
      name: 'competitions',
      label: '',
      displayLabel: 'Соревнования',
      title_icon: 'i-mdi:trophy',
      type: 'has-many-select',
      width: '50px',
      sortable: false,
      options: {
        relationField: 'competitions',
        relationLabel: 'соревнований',
        hint: 'Соревнования по данному виду спорта',
        titleField: 'title_short',
        mainField: 'title',
        searchEndpoint: api + '/api/v1/competitions',
        searchField: 'title_short',
        valueField: 'id',
        searchParam: 'q',
        minSearchLength: 2,
        empty_class: 'bg-red-400 hover:bg-red-300 text-gray-50',
        tooltipField: 'title_short',
      }
    },
    {
      name: 'annotation',
      label: '',
      title_icon: 'healthicons:info-outline',
      type: 'textarea',
      width: '50px',
      uploadEnabled: true,
      sortable: false,
      options: {
        hint: 'описание вида спорта',
        editorEnabled: true,
        icon: 'icon-park-outline:text',
        title: 'Редактирование описания',
        readonly: false,
        placeholder: 'Введите описание...',
        uploadUrl: api + '/api/upload-image',
        imageMaxWidth: 1200,
        imageQuality: 0.8,
        empty_class: 'bg-red-400 hover:bg-red-300',
        check_empty: true,
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
      hint: 'Интернет-сайты соревнования',
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
      hint: 'Страницы ВКонтакте соревнования',
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
      hint: 'Каналы YouTube соревнования',
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
      hint: 'Каналы Telegram соревнования',
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
      hint: 'Страницы Instagram соревнования',
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
      hint: 'Страницы Facebook соревнования',
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
      hint: 'Страницы X соревнования',
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
  ],
  // Колонка Действия
  editable: true, // редактирование записи
  editrow: true, // кнопка редактирования записи
  deleteable: true, // кнопка удаления записи
  sortable: true, // сортировка полей
  searchable: true, // Строка текстового поиска - параметр q= (настраивается на бэкенде)
  separateFields: false, // редактирование отдельных полей
  showIdFilter: true,
  defaultSortField: 'id', // Поле для сортировки по умолчанию
  defaultSortDirection: 'desc', // Направление сортировки по умолчанию (asc или desc)
  link: 'slug', // поле, значение которого передается во внешнюю ссылку в таблице (если null - ссылка не выводится)
  link_prefix: site + '/sports', // префикс ссылки
  editrow_link_prefix: '/sports',
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
  formTitle: 'Добавление вида спорта',
  hideButtons: false,
  hideCancelButton: false,
  cancelButtonText: 'Сбросить',
  hideSubmitButton: false,
  submitButtonText: 'Добавить',
  columns: [
    {
      name: 'title',
      label: 'Вид спорта',
      required: true,
      type: 'text',
      sortable: true,
      width: '250px',
      options: {
        readonly: false,
        placeholder: 'название',
        hint: 'название вида спорта',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md',
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
      name: 'title_short',
      label: 'Сокращение',
      required: true,
      type: 'text',
      sortable: true,
      width: '150px',
      options: {
        readonly: false,
        placeholder: 'сокращение',
        //hint: '',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    },
    {
      name: 'icon',
      label: 'иконка вида спорта',
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
      name: 'slug',
      label: 'слаг',
      type: 'text',
      required: true,
      sortable: true,
      width: '250px',
      options: {
        readonly: false,
        placeholder: 'слаг',
        transliterateFrom: 'title',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md',
        autoSuggest: {
          apiUrl: '/api/sports',
          field_name: 'slug',
          minLength: 2,
          debounce: 300,
          clickable: false,
          labelField: 'slug',
          valueField: 'id',
        showCount: false,
      }
      }
    },
    {
      name: 'annotation',
      label: 'описание вида спорта',
      type: 'editor',
      required: false,
      //width: '250px',
      options: {
        editorEnabled: true,
        readonly: false,
        placeholder: 'Введите описание вида спорта...',
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

]);

</script>

<style scoped>

</style>