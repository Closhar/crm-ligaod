<template>

  <header class="bg-gray-50shadow-sm border-b border-gray-300">
    <div class="px-6 pt-4">
      <div class="flex items-start justify-between">

        <Head :breadcrumbs="breadcrumbs || []" :icon="p_icon || null" :title="p_description || null" :show_breadcrumbs="'true'"/>

      </div>
    </div>
  </header>

  <div v-if="isAuthenticated" class="">

    <div class="min-h-full text-gray-900">

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
import {Icon} from '@iconify/vue';

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
const api_addr = api + '/api/events'

// Используем useSeoMeta с данными из хранилища
// const route = useRoute();
// const {data: pageData} = await useFetch(api + `/api/v1/apage/1`);

useSeoMeta({
  title: ((params.value as any).adminka_name || 'Админка') + ' - Матчи и события',
  description: 'Матчи и события',
});

const p_icon = "i-guidance:calendar";
const p_description = 'Матчи и события';
const breadcrumbs: Array<{id: number, title: string, icon: string, slug: string}> = [

];

const {isAuthenticated, user, logout, checkAuth} = useAuth();



// Параметры таблицы
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
        // Поля для отображения в статическом режиме
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
      width: '40px',
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
      width: '40px',
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
      name: 'competition_id',
      label: 'Соревнование',
      type: 'select',
      min_width: '140px',
      sortable: false,
      options: {
        apiUrl: api + '/api/v1/competitions?type=async',
        keyField: 'id',
        emptyable: false,
        labelField: 'title_short',
        enableSearch: true,
        sel_class: "",
        options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
        list_item: null,

        // Поля для отображения в статическом режиме
        displayLabelField: 'competition.title_short', // Вложенное поле
        //displayImageField: 'club_info.logo', // Вложенное поле
        //displayIconField: 'icon' // Плоское поле
      },
    },
    {
      name: 'club1_id',
      label: 'Команда (хоз)',
      type: 'select',
      min_width: '150px',
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
        // Поля для отображения в статическом режиме
        displayLabelField: 'club1.club_info', // Вложенное поле
        displayImageField: 'club1.image', // Вложенное поле
//displayIconField: 'icon' // Плоское поле
      },
    },
    {
      name: 'club2_id',
      label: 'Команда (гос)',
      type: 'select',
      min_width: '150px',
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
        // Поля для отображения в статическом режиме
        displayLabelField: 'club2.club_info', // Вложенное поле
        displayImageField: 'club2.image', // Вложенное поле
//displayIconField: 'icon' // Плоское поле
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
      name: 'result',
      label: 'Результат',
      type: 'text',
      width: '90px',
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
      width: '100px',
      sortable: false,
      checkFreshness: true,
      options: {
        readonly: false,
        cellClass: 'text-xs font-bold rounded h-8 text-gray-700 border px-1 w-full text-center cursor-pointer',
      }
    },
    {
      name: 'series_id',
      label: 'серия',
      title_icon: 'i-fluent-mdl2:chart-series',
      type: 'select',
      width: '110px',
      sortable: false,
      options: {
        apiUrl: api + '/api/series?type=async',
        keyField: 'id',
        emptyable: true,
        labelField: 'title_short',
        enableSearch: true,
        options_list: "bg-gray-100 font-xs font-bold max-h-[200px] border border-gray-300 text-red-800 rounded-md",
        sel_class: "text-xs text-red-800 font-bold",
        list_item: null,
        // Поля для отображения в статическом режиме
        displayLabelField: 'series.title_short', // Вложенное поле
        //displayImageField: 'club_info.logo', // Вложенное поле
        //displayIconField: 'icon' // Плоское поле
      },
      emptyOption: {
        value: null,
        label: '-',
      },
      filter_button: {
        enabled: true,
        icon: 'iconamoon:arrow-right-6-circle-fill',
        tooltip: 'Фильтровать по серии',
        class: 'ml-1 p-1 text-red-600 rounded hover:text-red-500 transition-colors',
        param_name: 'series_id',
        icon_size: '1.4em'
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
    }
  ],
  // Основные параметры
  editable: true, // редактирование
  editrow: false, // редактирование строки
  deleteable: true, // удаление
  sortable: true, // сортировка
  defaultSortField: 'date_from', // Поле для сортировки по умолчанию
  defaultSortDirection: 'asc', // Направление сортировки по умолчанию (asc или desc)
  separateFields: true, // разделять поля в форме
  showIdFilter: true, // отображать фильтр по ID
  link: 'id',
  link_prefix: site + '/events',
  pagination: true,
  main_field: 'event_name',
  pageSize: 30,
  searchable: true,
  enableResetFilters: true,
  resetFiltersLabel: 'Очистить',
  resetFiltersClass: 'text-xs bg-red-500 hover:bg-red-400 text-gray-50 px-3 py-1 rounded-md transition-colors shadow-sm ' +
      'disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed',

});

// Поля формы
const formOptions = ref({
  showForm: true,
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
        // Поля для отображения в статическом режиме
        displayLabelField: 'region.title_short', // Вложенное поле
        //displayImageField: 'club_info.logo', // Вложенное поле
        //displayIconField: 'icon' // Плоское поле
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

        // Поля для отображения в статическом режиме
        displayLabelField: 'competition.title_short', // Вложенное поле
        //displayImageField: 'club_info.logo', // Вложенное поле
        //displayIconField: 'icon' // Плоское поле
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
        emptyable: false,
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
        // Поля для отображения в статическом режиме
        displayLabelField: 'club1.club_info', // Вложенное поле
        displayImageField: 'club1.image', // Вложенное поле
//displayIconField: 'icon' // Плоское поле
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
        // Поля для отображения в статическом режиме
        displayLabelField: 'club2.club_info', // Вложенное поле
        displayImageField: 'club2.image', // Вложенное поле
//displayIconField: 'icon' // Плоское поле
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
        // Поля для отображения в статическом режиме
        displayLabelField: 'series.title_short', // Вложенное поле
        //displayImageField: 'club_info.logo', // Вложенное поле
        //displayIconField: 'icon' // Плоское поле
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
  quickAdd: [
    {
      label: 'Серия', // Текст кнопки
      icon: 'i-fluent-mdl2:chart-series', // Опциональная иконка (имя иконки из библиотеки)
      title: 'Добавление серии', // Заголовок модального окна
      instruction: 'Заполните данные для создания серии.', // Инструкция (необязательно)
      apiUrl: '/api/series', // URL для отправки данных
      forceLocalApi: false, // Не добавлять префикс API_URL (по умолчанию false)
      successMessage: 'Серия успешно добавлена', // Сообщение при успешном добавлении
      fillField: 'series_id', // Поле в основной форме, которое нужно заполнить после добавления
      valueField: 'id', // Поле в ответе API, значение которого нужно взять (по умолчанию 'id')
      labelField: 'title', // Поле в ответе API для отображения (по умолчанию 'name')
      emitRefresh: false, // Вызывать событие refresh при успешном добавлении (по умолчанию false)
      fields: [ // Массив полей формы
        {
          name: 'title', // Имя поля (ключ при отправке на сервер)
          label: 'Название серии', // Отображаемая метка поля
          type: 'text', // Тип поля: text, textarea, select, toggle, datetime, email, number
          required: true, // Обязательное поле
          placeholder: 'Введите название серии', // Подсказка в поле
          defaultValue: '' // Значение по умолчанию
        },
        {
          name: 'title_short',
          label: 'Краткое название',
          type: 'text',
          required: true,
          placeholder: 'Введите краткое название серии',
          defaultValue: ''
        },
        {
          name: 'description',
          label: 'Описание',
          type: 'textarea',
          required: true,
          placeholder: 'Введите описание серии',
          defaultValue: ''
        }
      ]
    },
    {
      label: 'Команда', // Текст кнопки
      icon: 'i-bxl:microsoft-teams', // Опциональная иконка (имя иконки из библиотеки)
      title: 'Добавление команды', // Заголовок модального окна
      instruction: 'Заполните данные для создания команды. Не забудьте позже в разделе Команды добавить логотип и изображение команды.', // Инструкция (необязательно)
      apiUrl: '/api/clubs', // URL для отправки данных
      forceLocalApi: false, // Не добавлять префикс API_URL (по умолчанию false)
      successMessage: 'Команда успешно добавлена', // Сообщение при успешном добавлении
      fillField: false, // Поле в основной форме, которое нужно заполнить после добавления
      valueField: 'id', // Поле в ответе API, значение которого нужно взять (по умолчанию 'id')
      labelField: 'title', // Поле в ответе API для отображения (по умолчанию 'name')
      emitRefresh: false, // Вызывать событие refresh при успешном добавлении (по умолчанию false)
      fields: [ // Массив полей формы
        {
          name: 'region_id',
          label: 'Регион',
          type: 'select',
          required: true,
          defaultValue: null,
          options: {
            apiUrl: api + '/api/regions?type=async',
            keyField: 'id',
            labelField: 'title',
            iconField: 'icon',
            enableSearch: true,
            emptyable: false,
            sel_class: "text-xs border min-w-48 border-gray-300 bg-gray-100 text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
            options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100 text-gray-600 rounded-md",
            list_item: null,
            displayLabelField: 'title'
          }
        },
        {
          name: 'title', // Имя поля (ключ при отправке на сервер)
          label: 'Название команды', // Отображаемая метка поля
          type: 'text', // Тип поля: text, textarea, select, toggle, datetime, email, number
          required: true, // Обязательное поле
          placeholder: 'Введите название команды', // Подсказка в поле
          defaultValue: '', // Значение по умолчанию
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
          name: 'title_short',
          label: 'Краткое название',
          type: 'text',
          required: true,
          placeholder: 'Введите краткое название команды',
          defaultValue: '',
          options: {
            half_str: true
          }
        },
        {
          name: 'slug',
          label: 'Слаг',
          type: 'text',
          required: true,
          options: {
            readonly: false,
            half_str: true,
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
          label: 'Пол',
          type: 'select',
          required: true,
          defaultValue: null,
          options: {
            apiUrl: api + '/api/v1/genders?type=async',
            keyField: 'id',
            labelField: 'title',
            iconField: 'icon',
            half_str: true,
            enableSearch: true,
            emptyable: false,
            sel_class: "text-xs border min-w-48 border-gray-300 bg-gray-100 text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
            options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100 text-gray-600 rounded-md",
            list_item: null,
            displayLabelField: 'title'
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
        half_str: true,
        enableSearch: true,
        emptyable: false,
        cellClass: 'bg-gray-100 rounded border px-1 w-64',
        options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
        list_item: null,
        displayLabelField: 'sport.title',
      }
    },
      ]
    },
    {
      label: 'Спортсооружение', // Текст кнопки
      icon: 'i-material-symbols-light:stadium-outline', // Опциональная иконка (имя иконки из библиотеки)
      title: 'Добавление спортсооружения', // Заголовок модального окна
      instruction: 'Заполните данные для создания спортсооружения.', // Инструкция (необязательно)
      apiUrl: '/api/arenas', // URL для отправки данных
      forceLocalApi: false, // Не добавлять префикс API_URL (по умолчанию false)
      successMessage: 'Спортсооружение успешно добавлено', // Сообщение при успешном добавлении
      fillField: false, // Поле в основной форме, которое нужно заполнить после добавления
      valueField: 'id', // Поле в ответе API, значение которого нужно взять (по умолчанию 'id')
      labelField: 'title', // Поле в ответе API для отображения (по умолчанию 'name')
      emitRefresh: false, // Вызывать событие refresh при успешном добавлении (по умолчанию false)
      fields: [ // Массив полей форм
        {
          name: 'region_id',
          label: 'Регион',
          type: 'select',
          required: true,
          defaultValue: null,
          options: {
            apiUrl: api + '/api/regions?type=async',
            keyField: 'id',
            labelField: 'title',
            iconField: 'icon',
            enableSearch: true,
            emptyable: false,
            sel_class: "text-xs border min-w-48 border-gray-300 bg-gray-100 text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
            options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100 text-gray-600 rounded-md",
            list_item: null,
            displayLabelField: 'title'
          }
        },
        {
          name: 'title', // Имя поля (ключ при отправке на сервер)
          label: 'Название спортсооружения', // Отображаемая метка поля
          type: 'text', // Тип поля: text, textarea, select, toggle, datetime, email, number
          required: true, // Обязательное поле
          placeholder: 'Введите название спортсооружения', // Подсказка в поле
          defaultValue: '', // Значение по умолчанию
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
      ]
    },
     {
      label: 'Соревнование', // Текст кнопки
      icon: 'i-game-icons:trophy-cup', // Опциональная иконка (имя иконки из библиотеки)
      title: 'Добавление соревнования', // Заголовок модального окна
      instruction: 'Заполните данные для создания соревнования.', // Инструкция (необязательно)
      apiUrl: '/api/competitions', // URL для отправки данных
      forceLocalApi: false, // Не добавлять префикс API_URL (по умолчанию false)
      successMessage: 'Соревнование успешно добавлено', // Сообщение при успешном добавлении
      fillField: 'competition_id', // Поле в основной форме, которое нужно заполнить после добавления
      valueField: 'id', // Поле в ответе API, значение которого нужно взять (по умолчанию 'id')
      labelField: 'title', // Поле в ответе API для отображения (по умолчанию 'name')
      emitRefresh: false, // Вызывать событие refresh при успешном добавлении (по умолчанию false)
      fields: [ // Массив полей формы
        
    {
      name: 'title',
      label: 'Название соревнования',
      required: true,
      type: 'text',
        placeholder: 'Введите название соревнования',
      options: {
        autoSuggest: {
          apiUrl: '/api/competitions',
          field_name: 'title',
          minLength: 2,
          debounce: 300,
          clickable: true,
          labelField: 'title',
          valueField: 'id',
        showCount: true,
      }
      }
    },
        {
          name: 'title_short',
          label: 'Обозначение для crm',
          type: 'text',
          required: true,
          placeholder: 'Введите обозначение соревнования для системы',
          defaultValue: ''
        },
        {
          name: 'slug',
          label: 'Слаг',
          type: 'text',
          required: true,
          placeholder: 'Введите слаг соревнования',
          defaultValue: '',
      options: {
        readonly: false,
        transliterateFrom: 'title',
        autoSuggest: {
          apiUrl: '/api/competitions',
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
          name: 'gender_id',
          label: 'Пол',
          type: 'select',
          required: true,
          defaultValue: null,
          options: {
            apiUrl: api + '/api/v1/genders?type=async',
            keyField: 'id',
            labelField: 'title',
            iconField: 'icon',
            enableSearch: true,
            emptyable: false,
            sel_class: "text-xs border min-w-48 border-gray-300 bg-gray-100 text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
            options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100 text-gray-600 rounded-md",
            list_item: null,
            displayLabelField: 'title',
            half_str: true
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
        half_str: true
      }
    },
        {
          name: 'date_from',
          label: 'Дата начала соревнования',
          type: 'date',
          required: true,
          placeholder: 'Введите дату начала соревнования',
          defaultValue: '',
          options: {
            half_str: true
          }
        },
        {
          name: 'date_to',
          label: 'Дата окончания соревнования',
          type: 'date',
          required: true,
          placeholder: 'Введите дату окончания соревнования',
          defaultValue: '',
          options: {
            half_str: true
          }
        },
      ],
    }
  ]
});

// Дополнитнльные поля в секции редактирования отдельных полей
const extraFields = ref([
    {
      name: 'date_from',
      label: 'Дата и время',
      type: 'datetime',
      width: '160px',
      options: {
        readonly: false,
        cellClass: 'text-xs font-bold bg-blue-100 rounded h-8 text-gray-800 border px-1 w-full',
      }
    },
    {
      name: 'arena_id',
      label: 'Арена',
      type: 'select',
      min_width: '150px',
      sortable: false,
      options: {
        apiUrl: api + '/api/v1/arenas?type=async',
        keyField: 'id',
        emptyable: false,
        labelField: 'title',
        enableSearch: true,
        sel_class: "",
        options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
        list_item: null,
        displayLabelField: 'arena.title'
      },
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
        image_path: 'event_image_path', // поле для текущего изображения
        thumbnailWidth: 46,
        thumbnailHeight: 31,
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
        icon: 'icon-park-outline:text',
        title: 'Редактирование описания',
        readonly: false,
        hint: 'информация о событии',
        placeholder: 'Введите описание...',
        uploadUrl: api + '/api/upload-image',
        imageMaxWidth: 1200,
        imageQuality: 0.8,
        check_empty: true,
        empty_class: 'bg-red-400 hover:bg-red-300',
      }
    },
    {
          name: 'streams_count', // Используем имя поля счетчика (Laravel автоматически добавляет это поле через withCount)
          label: '',
          displayLabel: 'Видеотрансляции',
          title_icon: 'solar:stream-linear',
          type: 'hasmany', // Указываем новый тип поля
          sortable: false,
          width: '60px',
          options: {
            // Информация о родительской модели
            parentModel: 'events',
            parentLabelField: 'title', // Поле для отображения в заголовке модального окна
            // Заголовок модального окна
            modalTitle: 'Стримы для события: ',
            modalTitleAddField: 'event_name',
            hint: 'ссылки на видеотрансляции',

  //           defaultValueField: 'date_from',      // Поле в родительской записи
  // defaultValueTargetField: 'date',  // Поле в форме добавления

  defaultValues: [
    { sourceField: 'date_from', targetField: 'date' },
    { sourceField: 'event_name', targetField: 'title' },
  ],

            // Стили для отображения
            noDataIconClass: 'text-gray-900',
            noDataClass: 'bg-red-500 text-gray-100 hover:bg-red-600',
            hasDataIconClass: 'text-red-600',
            hasDataClass: 'bg-green-100 text-red-600 font-bold text-xs hover:bg-green-200',
            iconName: 'hugeicons:live-streaming-01',
            headerIconName: 'solar:play-stream-bold-duotone',
            iconSize: '1.6em',
            
            // Информация о связи
            relationship: 'streams', // Название связи
            relationshipLabel: 'Стримы', // Читаемое название для отображения
            countField: 'streams_count', // Поле, содержащее количество записей
            foreignKey: 'event_id', // Поле внешнего ключа
            
            // API эндпоинты (можно опустить, если используются стандартные пути)
            apiUrl: '/api/events/{id}/streams', // Будет автоматически заменено на id текущей записи
            createApiUrl: '/api/events/{id}/streams',
            updateApiUrl: '/api/streams/{id}',
            deleteApiUrl: '/api/streams/{id}',
            
            // Поля для связанных записей (streams)
            fields: [
              {
                name: 'date',
                label: 'Дата',
                type: 'datetime',
                options: {
                  formColumnClass: 'col-span-4'
                }
              },
              {
                name: 'link',
                label: 'Ссылка на стрим',
                type: 'text',
                options: {
                  formColumnClass: 'col-span-8'
                }
              },
              {
                name: 'title',
                label: 'Название',
                type: 'text',
                options: {
                  formColumnClass: 'col-span-12'
                }
              },
            ],
          }
        },
  {
    name: 'event_name',
    label: 'Название события',
    type: 'text',
    min_width: '200px',
    options: {
      readonly: true,
      cellClass: 'text-xs bg-gray-50 rounded text-gray-60 border px-1 pt-2 w-full min-h-8 text-left cursor-default'
    }
  },
]);

// Поля, видимые по умолчанию в доп.таблице
const defaultVisibleFields = ['event_name'];

// Поля, которые не будут отображаться в дополнительной таблице
const excludedFields = ['date_from', 'is_active', 'gender_icon', 'sport_icon', 'club1_id', 'club2_id'];

// Фильтры-селкты и фильтры-переключатели (type: 'toggle')
const additionalFilters = ref([
  {
    field: 'empty_result',
    type: 'toggle',
    label: '',
    initialLabel: 'пустые результаты',
    initialClass: 'text-sm text-gray-500 bg-gray-300 hover:bg-gray-400', // Класс для начальной кнопки
    options: [
      {
        value: 'true',
        label: 'пустые результаты',
        activeClass: 'text-sm text-gray-50 bg-red-600 hover-red-700' // Индивидуальный класс для этого варианта
      }
    ]
  },
  {
    field: 'empty_time',
    type: 'toggle',
    label: '',
    initialLabel: 'без времени',
    initialClass: 'text-sm text-gray-500 bg-gray-300 hover:bg-gray-400', // Класс для начальной кнопки
    options: [
      {
        value: 'true',
        label: 'без времени',
        activeClass: 'text-sm text-gray-50 bg-red-600 hover-red-700' // Индивидуальный класс для этого варианта
      }
    ]
  },
  {
    field: 'with_team',
    type: 'toggle',
    label: '',
    initialLabel: 'есть ли команды',
    initialClass: 'text-sm text-gray-500 bg-gray-300 hover:bg-gray-400', // Класс для начальной кнопки
    options: [
      {
        value: 1,
        label: 'с командой',
        activeClass: 'text-sm text-gray-50 bg-red-600 hover-red-700' // Индивидуальный класс для этого варианта
      },
      {
        value: 2,
        label: 'без команды',
        activeClass: 'text-sm text-gray-50 bg-red-600 hover-red-700' // Индивидуальный класс для этого варианта
      }
    ]
  },
  {
    field: 'is_active',
    type: 'toggle',
    label: '',
    initialLabel: 'активность',
    initialClass: 'text-sm text-gray-500 bg-gray-300 hover:bg-gray-400', // Класс для начальной кнопки
    options: [
      {
        value: true,
        label: 'активные',
        activeClass: 'text-sm text-gray-50 bg-green-600 hover:bg-green-700' // Индивидуальный класс для этого варианта
      },
      {
        value: false,
        label: 'неактивные',
        activeClass: 'text-sm text-gray-50 bg-red-600 hover:bg-red-700' // Индивидуальный класс для этого варианта
      },
    ]
  },
  {
    field: 'show',
    type: 'toggle',
    label: '',
    initialLabel: 'когда',
    initialClass: 'text-sm text-gray-500 bg-gray-300 hover:bg-gray-400', // Класс для начальной кнопки
    options: [
      {
        value: 3,
        label: 'сегодня',
        activeClass: 'text-sm text-gray-50 bg-red-600 hover-red-700' // Индивидуальный класс для этого варианта
      },
      {
        value: 1,
        label: 'запланировано',
        activeClass: 'text-sm text-gray-50 bg-red-600 hover-red-700' // Индивидуальный класс для этого варианта
      },
      {
        value: 2,
        label: 'прошедшие',
        activeClass: 'text-sm text-gray-50 bg-red-600 hover-red-700' // Индивидуальный класс для этого варианта
      }
    ]
  },
  {
    field: 'sport_id',
    label: 'Вид спорта',
    apiUrl: api + '/api/v1/sports',
    keyField: 'id',
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
    sel_class: "text-xs border min-w-48 border-gray-300 bg-gray-100 text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
    options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
    list_item: null,
    empty_option: {value: '', label: 'Все'}
  }, {
    field: 'club_id',
    label: 'Команда',
    apiUrl: api + '/api/v1/clubs?type=async',
    keyField: 'id',
    options: {
      enableSearch: true,
    },
    limit: 20,
    labelField: 'club_info',
    imageField: 'full_image_path',
    defaultValue: null,
    sel_class: "text-xs border min-w-48 border-gray-300 bg-gray-100 text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
    options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
    list_item: null,
    empty_option: {value: '', label: 'Все команды'}
  }, {
    field: 'competition_id',
    label: 'Соревнование',
    apiUrl: api + '/api/v1/competitions?type=async',
    keyField: 'id',
    options: {
      enableSearch: true,
      emptyable: true,
    },
    labelField: 'title_short',
    sel_class: "text-xs border min-w-48 border-gray-300 bg-gray-100 text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
    options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
    list_item: null,
    empty_option: {value: '', label: 'Все соревнования'}
  }, {
    field: 'arena_id',
    label: 'Спортсооружение',
    apiUrl: api + '/api/v1/arenas?type=async',
    keyField: 'id',
    options: {
      enableSearch: true,
    },
    labelField: 'title',
    enableSearch: true,
    sel_class: "text-xs border min-w-48 border-gray-300 bg-gray-100 text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
    options_list: "bg-gray-100 text-gray-50 max-h-[200px] border border-gray-300 bg-gray-100  text-gray-600 rounded-md",
    list_item: null,
    empty_option: {value: '', label: 'Все спортсооружения'}
  }
]);

</script>

<style scoped>
.bg-gray-50shadow-sm {
  background-color: #f9fafb;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style>