<template>
  <header class="bg-gray-50shadow-sm border-b border-gray-300">
    <div class="px-6 pt-4">
      <div class="flex items-start justify-between">
        <Head :breadcrumbs="breadcrumbs" :icon="p_icon" :title="p_description" show_breadcrumbs="true"/>
      </div>
    </div>
  </header>

  <div v-if="isAuthenticated" class="min-h-full text-gray-900">
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
</template>

<script lang="ts" setup>
import {ref, onMounted} from 'vue';
import {useAuth} from '~/composables/useAuth';
import {useGlobalsStore} from '~/stores/globals';
import {storeToRefs} from 'pinia';
import Head from "~/components/parts/Head.vue"
import KirhTable from "~/components/kirh/table/KirhTable.vue";

const globalsStore = useGlobalsStore();
const {params, images} = storeToRefs(globalsStore);

const {data} = await useAsyncData('globals', async () => {
  await globalsStore.fetchData();
  return {params: globalsStore.params, images: globalsStore.images};
});

const config = useRuntimeConfig();
const api = config.public.API_URL;
const site = config.public.SITE_URL;
const api_addr = api + '/api/telegram/channels';

useSeoMeta({
  title: ((params.value as any).adminka_name || 'Админка') + ' - Telegram-каналы',
  description: 'Каналы и группы Telegram',
});

const p_icon = "stash:telegram";
const p_description = 'Каналы и группы Telegram';
const breadcrumbs: Array<{id: number, title: string, icon: string, slug: string}> = [];

const {isAuthenticated, user, logout, checkAuth} = useAuth();

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
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      }
    },
    {
      name: 'type',
      label: 'Тип',
      type: 'text',
      width: '120px',
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      }
    },
    {
      name: 'chat_id',
      label: 'ID чата',
      type: 'text',
      width: '180px',
      sortable: false,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      }
    },
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      width: '180px',
      sortable: false,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      }
    },
    {
      name: 'is_active',
      label: 'Активен',
      type: 'toggle',
      width: '100px',
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      }
    },
    {
      name: 'description',
      label: 'Описание',
      type: 'textarea',
      width: '200px',
      sortable: false,
      options: {
        readonly: false,
        cellClass: 'text-xs rounded h-8 text-gray-700 border px-1 w-full cursor-pointer',
      }
    }
  ],
  editable: true,
  editrow: false,
  deleteable: true,
  sortable: true,
  searchable: true,
  separateFields: false,
  showIdFilter: true,
  defaultSortField: 'id',
  defaultSortDirection: 'desc',
  pagination: true,
  main_field: 'title',
  pageSize: 30,
  enableResetFilters: true,
  resetFiltersLabel: 'Очистить',
  resetFiltersClass: 'text-xs bg-red-500 hover:bg-red-400 text-gray-50 px-3 py-1 mb-1 rounded-md transition-colors shadow-sm ' +
      'disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
});

const formOptions = ref({
  showForm: true,
  keepFormAfterSubmit: false,
  autoOpen: true,
  containerClass: 'bg-gray-50',
  formTitle: 'Добавление канала Telegram',
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
      width: '250px',
      options: {
        readonly: false,
        placeholder: 'Название канала/группы',
        hint: 'Название канала или группы в Telegram',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    },
    {
      name: 'type',
      label: 'Тип',
      required: true,
      type: 'simple_select',
      width: '150px',
      options: {
        readonly: false,
        options: [
          { value: 'channel', label: 'Канал' },
          { value: 'group', label: 'Группа' }
        ],
        empty_option: 'Выберите тип',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border w-full',
        inputClass: 'w-full h-10 border border-gray-300 rounded text-md cursor-pointer'
      }
    },
    {
      name: 'chat_id',
      label: 'ID чата',
      required: true,
      type: 'text',
      width: '200px',
      options: {
        readonly: false,
        placeholder: '-1001234567890',
        hint: 'ID чата в Telegram (например: -1001234567890)',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    },
    {
      name: 'username',
      label: 'Username',
      required: false,
      type: 'text',
      width: '200px',
      options: {
        readonly: false,
        placeholder: 'channel_name',
        hint: 'Username канала/группы без @',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
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
    {
      name: 'description',
      label: 'Описание',
      required: false,
      type: 'textarea',
      options: {
        readonly: false,
        placeholder: 'Описание канала/группы',
        hint: 'Краткое описание канала или группы',
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
        inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
      }
    }
  ]
});

const extraFields = ref([]);
const defaultVisibleFields: string[] = [];
const additionalFilters = ref([]);
</script>

<style scoped>
</style> 