<template>
  <header class="bg-white shadow-sm border-b border-gray-300">
    <div class="px-6 pt-4">
      <div class="flex items-start justify-between">
        <Head :icon="p_icon" :title="p_description" show_breadcrumbs="false"/>
      </div>
    </div>
  </header>

  <div v-if="isAuthenticated" class="">
    <div class="min-h-full text-gray-900">
      <h2 class="text-xl font-semibold text-gray-800 mb-4 px-4 mt-4 flex items-center gap-2">
        <Icon name="material-symbols:calendar-today" class="text-blue-600" size="1.5em" />
        События сегодня
      </h2>
      <KirhTable
          :api-url="api_addr"
          :table-options="tableOptions"
          :form-options="formOptions"
          :additional-filters="additionalFilters"
          :extra-editable-fields="extraFields"
          :default-visible-fields="defaultVisibleFields"
          :excluded-fields="excludedFields"
          :container-class="'w-full'"
          :container-style="{}"
      />

      <h2 class="text-xl font-semibold text-gray-800 mb-4 px-4 mt-8 flex items-center gap-2">
        <Icon name="material-symbols:calendar-month" class="text-blue-600" size="1.5em" />
        События завтра
      </h2>
      <KirhTable
          :api-url="api_addr"
          :table-options="tomorrowTableOptions"
          :form-options="formOptions"
          :additional-filters="additionalFilters"
          :extra-editable-fields="extraFields"
          :default-visible-fields="defaultVisibleFields"
          :excluded-fields="excludedFields"
          :container-class="'w-full'"
          :container-style="{}"
      />

      <h2 class="text-xl font-semibold text-gray-800 mb-4 px-4 mt-8 flex items-center gap-2">
        <Icon name="material-symbols:calendar-yesterday" class="text-blue-600" size="1.5em" />
        События вчера
      </h2>
      <KirhTable
          :api-url="api_addr"
          :table-options="yesterdayTableOptions"
          :form-options="formOptions"
          :additional-filters="additionalFilters"
          :extra-editable-fields="extraFields"
          :default-visible-fields="defaultVisibleFields"
          :excluded-fields="excludedFields"
          :container-class="'w-full'"
          :container-style="{}"
      />
    </div>
  </div>
</template>

<script setup>
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
const api_addr = api + '/api/events';

// Получаем даты вчера и завтра
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

const tomorrowFormatted = tomorrow.toISOString().split('T')[0]; // Формат YYYY-MM-DD
const yesterdayFormatted = yesterday.toISOString().split('T')[0]; // Формат YYYY-MM-DD

// Используем useSeoMeta с данными из хранилища
const route = useRoute();
const {data: pageData} = await useFetch(api + `/api/v1/apage/1`);

useSeoMeta({
  title: params.value.adminka_name + ' - ' + pageData.value.title,
  description: pageData.value.description,
});

const p_title = pageData.value?.title;
const p_icon = pageData.value?.icon;
const p_description = pageData.value?.description;
const breadcrumbs = pageData.value?.breadcrumbs;

const {isAuthenticated, user, logout, checkAuth} = useAuth();

// Параметры таблицы для сегодняшних событий
const tableOptions = ref({
  columns: [
    {
      name: 'id',
      label: 'ID',
      type: 'text',
      width: '60px',
      options: {
        readonly: true,
        cellClass: 'text-xs font-bold bg-yellow-50 rounded h-8 text-gray-600 border px-1 pt-2 w-full text-center cursor-default'
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
      name: 'date_from',
      label: 'Дата',
      type: 'date',
      width: '110px',
      options: {
        readonly: false,
        cellClass: 'text-xs font-bold bg-blue-100 rounded h-8 text-gray-800 border px-1 w-full',
      }
    },
    {
      name: 'date_from',
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
      name: 'sport_icon',
      label: '',
      title_icon: 'i-ic:round-sports-kabaddi',
      type: 'icon',
      width: '35px',
      sortable: false,
      options: {
        readonly: true,
        only_icon: true,
        cellClass: 'bg-green-50 rounded h-8 text-gray-500 border px-1 pt-2 w-full text-center cursor-default'
      }
    },
    {
      name: 'gender_icon',
      label: '',
      title_icon: 'icons8:gender',
      type: 'icon',
      width: '35px',
      sortable: false,
      options: {
        readonly: true,
        only_icon: true,
        cellClass: 'bg-blue-50 rounded h-8 text-gray-500 border px-1 pt-2 w-full text-center cursor-default',
        ev: [{
          warn_ev: "fa:female",
          class_warn_ev: "bg-red-50 rounded h-8 text-gray-500 border px-1 pt-2 w-full text-center cursor-default"
        },
          {
            warn_ev: "foundation:male-female",
            class_warn_ev: "bg-green-50 rounded h-8 text-gray-500 border px-1 pt-2 w-full text-center cursor-default"
          }],
      }
    },
    {
      name: 'club1_id',
      label: 'Команда (хоз)',
      type: 'select',
      min_width: '130px',
      sortable: false,
      options: {
        apiUrl: api + '/api/clubs?type=1',
        keyField: 'id',
        labelField: 'club_info',
        imageField: 'full_image_path',
        enableSearch: true,
        emptyable: true,
        sel_class: "",
        options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
        list_item: null,
        limit: 20,
        displayLabelField: 'club1.club_info',
        displayImageField: 'club1.image',
      },
    },
    {
      name: 'swap_fields',
      label: '',
      title_icon: 'ic:outline-change-circle',
      width: '60px',
      sortable: false,
      type: 'swap',
      options: {
        hint: 'Поменять местами команды',
        field1: 'club1_id',
        field2: 'club2_id',
        icon: 'ri:exchange-box-line',
        button_text: '',
        cell_class: 'bg-yellow-100 hover:bg-yellow-200 cursor-pointer'
      }
    },
    {
      name: 'club2_id',
      label: 'Команда (гос)',
      type: 'select',
      min_width: '130px',
      sortable: true,
      options: {
        apiUrl: api + '/api/clubs?type=1',
        keyField: 'id',
        emptyable: true,
        labelField: 'club_info',
        imageField: 'full_image_path',
        enableSearch: true,
        sel_class: "",
        options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
        list_item: null,
        limit: 20,
        displayLabelField: 'club2.club_info',
        displayImageField: 'club2.image',
      },
    },
    {
      name: 'title',
      label: 'Название/этап',
      type: 'text',
      min_width: '110px',
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      }
    },
    {
      name: 'parse_table_id',
      label: '',
      displayLabel: 'таблица турнира',
      title_icon: 'fluent:table-lightning-28-regular',
      type: 'parse_table',
      width: '60px',
      options: {
        readonly: false,
        cellClass: 'text-xs font-bold bg-gray-600 rounded h-8 text-gray-50 border px-1 w-full',
        hint: 'таблица турнира',
        apiUrl: api + '/api/parse-tables',
        searchField: 'title',
        valueField: 'id',
        displayField: 'title',
        displayValueField: 'parse_table_id',
        displayTitleField: 'parse_table.title',
        saveValueField: 'id',
        tableName: 'parse_tables',
        apiEndpoint: '/api/parse-tables',
        simple_view:true
      }
    },
    {
      name: 'result',
      label: 'Результат',
      type: 'text',
      width: '80px',
      sortable: false,
      checkFreshness: true,
      options: {
        readonly: false,
        cellClass: 'text-xs font-bold bg-red-100 rounded h-8 text-gray-700 border px-1 w-full text-center cursor-pointer',
        ev: [{
          warn_ev: "",
          class_warn_ev: "text-xs font-bold bg-red-500 rounded h-8 text-gray-50 border px-1 w-full text-center cursor-pointer"
        }],
      }
    },
    {
      name: 'result_dop',
      label: 'Доп. рез-т',
      type: 'text',
      width: '80px',
      sortable: false,
      checkFreshness: true,
      options: {
        readonly: false,
        cellClass: 'text-xs font-bold rounded h-8 text-gray-700 border px-1 w-full text-center cursor-pointer',
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
        display: 'switch',
        items: [
          {value: true, label: 'Вкл'},
          {value: false, label: 'Выкл'}
        ],
        activeClass: 'bg-green-500 text-white',
        inactiveClass: 'bg-red-100 text-red-800'
      }
    },
  {
    name: 'image',
    label: '',
    displayLabel: 'Изображение',
    title_icon: 'stash:image',
    type: 'image',
    width: '50px',
    sortable: false,
    options: {
      image_path: 'event_image_path',
      thumbnailWidth: 46,
      thumbnailHeight: 31,
      previewMaxHeight: '500px',
      hint: 'изображение для события',
      modalTitle: 'Изображение для события:',
      modalTitleAddField: 'event_name',
      info: 'Загрузите изображение в формате JPG, PNG или GIF. Изображение приведется кразмеру 800x500px',
      resize: {
        enabled: true,
        width: 800,
        height: 500,
        crop: true,
        quality: 0.8,
        maxSizeMB: 1,
        mimeType: 'image/jpeg'
      }
    }
  },
  {
    name: 'tickets',
    label: '',
    displayLabel: 'Билеты',
    title_icon: 'icon-park-outline:ticket',
    type: 'textarea',
    width: '50px',
    uploadEnabled: true,
    sortable: false,
    options: {
      editorEnabled: true,
      icon: 'icon-park-outline:text',
      title: 'Редактирование описания',
      readonly: false,
      hint: 'информация о билетах',
      placeholder: 'Введите описание...',
      uploadUrl: api + '/api/upload-image',
      imageMaxWidth: 1200,
      imageQuality: 0.8,
      check_empty: true,
      empty_class: 'bg-red-400 hover:bg-red-300',
    }
  },
  {
    name: 'free_tickets',
    label: '',
    title_icon: 'tabler:free-rights',
    type: 'toggle',
    width: '60px',
    sortable: false,
    options: {
      hint: 'бесплатные билеты',
      display: 'switch',
      items: [
        {value: true, label: 'Вкл'},
        {value: false, label: 'Выкл'}
      ],
      activeClass: 'bg-green-500 text-white',
      inactiveClass: 'bg-red-100 text-red-800'
    }
  },
  {
    name: 'about',
    label: '',
    displayLabel: 'Анонс',
    title_icon: 'healthicons:info-outline',
    type: 'textarea',
    width: '50px',
    uploadEnabled: true,
    sortable: false,
    options: {
      editorEnabled: true,
      icon: 'icon-park-outline:text',
      title: 'Редактирование описания',
      readonly: false,
      hint: 'анонс события',
      placeholder: 'Введите описание...',
      uploadUrl: api + '/api/upload-image',
      imageMaxWidth: 1200,
      imageQuality: 0.8,
      check_empty: true,
      empty_class: 'bg-red-400 hover:bg-red-300',
      telegram_parse: true,
      parse_own_telegram: true,
      telegrams_field: 'telegram_parse'
    }
  },
  {
    name: 'report',
    label: '',
    displayLabel: 'Краткий отчет',
    title_icon: 'icon-park-outline:table-report',
    type: 'textarea',
    width: '50px',
    uploadEnabled: true,
    sortable: false,
    options: {
      editorEnabled: true,
      icon: 'icon-park-outline:text',
      title: 'Редактирование описания',
      readonly: false,
      hint: 'краткий отчет о событии',
      placeholder: 'Введите отчет...',
      uploadUrl: api + '/api/upload-image',
      imageMaxWidth: 1200,
      imageQuality: 0.8,
      check_empty: true,
      empty_class: 'bg-red-400 hover:bg-red-300',
      telegram_parse: true,
      parse_own_telegram: true,
      telegrams_field: 'telegram_parse'
    }
  },
  {
    name: 'streams_count',
    label: '',
    displayLabel: 'Видеотрансляции',
    title_icon: 'solar:stream-linear',
    type: 'hasmany',
    sortable: false,
    width: '60px',
    options: {
      parentModel: 'events',
      parentLabelField: 'title',
      modalTitle: 'Стримы для события: ',
      modalTitleAddField: 'event_name',
      hint: 'ссылки на видеотрансляции',
      defaultValues: [
        { sourceField: 'date_from', targetField: 'date' },
        { sourceField: 'event_name', targetField: 'title' },
      ],
      noDataIconClass: 'text-gray-900',
      noDataClass: 'bg-red-500 text-gray-100 hover:bg-red-600',
      hasDataIconClass: 'text-red-600',
      hasDataClass: 'bg-green-100 text-red-600 font-bold text-xs hover:bg-green-200',
      iconName: 'hugeicons:live-streaming-01',
      headerIconName: 'solar:play-stream-bold-duotone',
      iconSize: '1.6em',
      relationship: 'streams',
      relationshipLabel: 'Стримы',
      countField: 'streams_count',
      foreignKey: 'event_id',
      apiUrl: '/api/events/{id}/streams',
      createApiUrl: '/api/events/{id}/streams',
      updateApiUrl: '/api/streams/{id}',
      deleteApiUrl: '/api/streams/{id}',
      fields: [
        {
          name: 'date',
          label: 'Дата',
          type: 'datetime',
          options: {
            formColumnClass: 'col-span-12'
          }
        },
        {
          name: 'link',
          label: 'Ссылка',
          type: 'text',
          options: {
            formColumnClass: 'col-span-12',
            pasteFromClipboard: true,
          }
        },
        {
          name: 'title',
          label: 'Название',
          type: 'text',
          options: {
            formColumnClass: 'col-span-12',
            autoSuggest: {
              apiUrl: api + '/api/stream-hints',
              field_name: 'hint',
              minLength: 2,
              debounce: 300,
              clickable: true,
              labelField: 'hint',
              valueField: 'id',
              showCount: false,
            }
          },
        },
        {
          name: 'in_player',
          label: 'встроено',
          type: 'toggle',
          width: '20px',
          sortable: false,
          options: {
            defaultChecked: true,
            display: 'switch',
            items: [
              {value: true, label: 'Вкл'},
              {value: false, label: 'Выкл'}
            ],
            activeClass: 'bg-green-500 text-white',
            inactiveClass: 'bg-red-100 text-red-800'
          }
        },
        {
          name: 'in_profile',
          label: 'в профиле',
          type: 'toggle',
          width: '20px',
          sortable: false,
          options: {
            defaultChecked: false,
            display: 'switch',
            items: [
              {value: true, label: 'Вкл'},
              {value: false, label: 'Выкл'}
            ],
            activeClass: 'bg-green-500 text-white',
            inactiveClass: 'bg-red-100 text-red-800'
          }
        },
      ],
    }
  },
  ],
  modelName: "Event",
  editable: true,
  editrow: false,
  deleteable: true,
  sortable: true,
  defaultSortField: 'date_from',
  defaultSortDirection: 'asc',
  separateFields: false,
  showIdFilter: false,
  link: 'id',
  link_prefix: site + '/events',
  api_params: 'show=3',
  pagination: true,
  main_field: 'event_name',
  pageSize: 20,
  pageSizeOptions: [5, 10, 15, 20, 25, 30, 50, 100],
  enableBulkActions: false,
  searchable: true,
  enableResetFilters: true,
  resetFiltersLabel: 'Очистить',
  resetFiltersClass: 'text-xs bg-red-500 hover:bg-red-400 text-gray-50 px-3 py-1 rounded-md transition-colors shadow-sm ' +
      'disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed',
});

// Параметры таблицы для завтрашних событий
const tomorrowTableOptions = ref({
  ...tableOptions.value,
  api_params: `date_from=${tomorrowFormatted}`,
});

// Параметры таблицы для вчерашних событий
const yesterdayTableOptions = ref({
  ...tableOptions.value,
  api_params: `date_from=${yesterdayFormatted}`,
});

// Поля формы
const formOptions = ref({
  showForm: false,
  autoOpen: true,
  keepFormAfterSubmit: true,
  containerClass: 'bg-gray-50',
  formTitle: 'Добавление матча или события',
  hideButtons: false,
  hideCancelButton: false,
  cancelButtonText: 'Сбросить',
  hideSubmitButton: false,
  submitButtonText: 'Добавить',
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
      name: 'date_from',
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
        displayLabelField: 'competition.title_short',
      }
    },
    {
      name: 'arena_id',
      label: 'Спортсооружение',
      type: 'select',
      sortable: false,
      options: {
        apiUrl: api + '/api/v1/arenas?type=async',
        keyField: 'id',
        labelField: 'title',
        enableSearch: true,
        emptyable: true,
        sel_class: "text-xs border min-w-48 border-gray-300 bg-gray-100 text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
        options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
        list_item: null,
        displayLabelField: 'arena.title'
      }
    },
    {
      name: 'club1_id',
      label: 'Команда (хоз)',
      type: 'select',
      sortable: false,
      options: {
        apiUrl: api + '/api/clubs?type=1',
        keyField: 'id',
        labelField: 'club_info',
        imageField: 'full_image_path',
        enableSearch: true,
        emptyable: true,
        sel_class: "text-xs border min-w-48 border-gray-300 bg-gray-100 text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
        options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
        list_item: null,
        limit: 20,
        displayLabelField: 'club1.club_info',
        displayImageField: 'club1.image',
      }
    },
    {
      name: 'club2_id',
      label: 'Команда (гос)',
      type: 'select',
      sortable: false,
      options: {
        apiUrl: api + '/api/clubs?type=1',
        keyField: 'id',
        labelField: 'club_info',
        imageField: 'full_image_path',
        enableSearch: true,
        emptyable: true,
        sel_class: "text-xs border min-w-48 border-gray-300 bg-gray-100 text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
        options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
        list_item: null,
        limit: 20,
        displayLabelField: 'club2.club_info',
        displayImageField: 'club2.image',
      }
    },
    {
      name: 'title',
      label: 'Название/этап',
      type: 'text',
      sortable: true,
      width: '250px',
      options: {
        readonly: false,
        placeholder: 'название',
        hint: 'название события либо этап соревнований для матча',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    },
    {
      name: 'series_id',
      label: 'Cерия',
      type: 'select',
      width: '120px',
      sortable: false,
      options: {
        apiUrl: api + '/api/series?type=async',
        keyField: 'id',
        emptyable: true,
        labelField: 'title_short',
        enableSearch: true,
        options_list: "bg-gray-100 font-xs max-h-[200px] border border-gray-300 text-gray-800 rounded-md",
        sel_class: "text-xs text-gray-800",
        list_item: null,
        displayLabelField: 'series.title_short',
      },
    },
    {
      name: 'result',
      label: 'Результат',
      type: 'text',
      width: '120px',
      sortable: false,
      options: {
        readonly: false,
        placeholder: 'результат',
        hint: 'результат матча либо основного времени матча',
        cellClass: 'text-xs font-bold bg-red-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    },
    {
      name: 'result_dop',
      label: 'Доп. рез-т',
      type: 'text',
      width: '120px',
      sortable: false,
      options: {
        readonly: false,
        placeholder: 'доп.рез-т',
        hint: 'дополнение к результату:доп.время, буллиты, серия пенальти и т.п.',
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
    }
  ],
});

// Дополнительные поля в секции редактирования отдельных полей
const extraFields = ref([]);

// Поля, видимые по умолчанию в доп.таблице
const defaultVisibleFields = [];

// Поля, которые не будут отображаться в дополнительной таблице
const excludedFields = [];

// Фильтры
const additionalFilters = ref([]);

</script>

<style scoped>
.bg-gray-50shadow-sm {
  background-color: #f9fafb;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style>