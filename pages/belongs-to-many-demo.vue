<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Демонстрация поля belongsToMany</h1>
    
    <KirhTable
      :api-url="apiUrl"
      :table-options="tableOptions"
      :form-options="formOptions"
      :additional-params="additionalParams"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const api = 'http://localhost:8000'; // Замените на ваш API URL

// Опции таблицы
const tableOptions = ref({
  columns: [
    {
      name: 'id',
      label: 'ID',
      type: 'text',
      width: '60px',
      sortable: true,
      options: {
        readonly: true,
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1',
      }
    },
    {
      name: 'title',
      label: 'Название',
      type: 'text',
      width: '200px',
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1',
      }
    },
    {
      name: 'sports',
      label: '',
      displayLabel: 'Виды спорта',
      title_icon: 'i-mdi:run',
      type: 'belongsToMany',
      width: '50px',
      sortable: false,
      options: {
        relationField: 'sports',
        relationLabel: 'видов спорта',
        hint: 'Виды спорта для элемента',
        titleField: 'title',
        mainField: 'title',
        searchEndpoint: api + '/api/sports',
        searchField: 'title',
        valueField: 'id',
        searchParam: 'q',
        minSearchLength: 2,
        empty_class: 'bg-red-400 hover:bg-red-300 text-gray-50',
        tooltipField: 'title',
      }
    },
    {
      name: 'clubs',
      label: '',
      displayLabel: 'Команды',
      title_icon: 'mdi:microsoft-teams',
      type: 'belongsToMany',
      width: '50px',
      sortable: false,
      options: {
        relationField: 'clubs',
        relationLabel: 'команд',
        hint: 'Команды для элемента',
        titleField: 'title',
        mainField: 'title',
        searchEndpoint: api + '/api/clubs',
        searchField: 'title',
        valueField: 'id',
        searchParam: 'q',
        minSearchLength: 2,
        empty_class: 'bg-red-400 hover:bg-red-300 text-gray-50',
        tooltipField: 'title',
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
  pageSize: 10,
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
  formTitle: 'Добавление элемента',
  hideButtons: false,
  hideCancelButton: false,
  cancelButtonText: 'Сбросить',
  hideSubmitButton: false,
  submitButtonText: 'Добавить',
  gridClass: 'grid-cols-1',
  columns: [
    {
      name: 'title',
      label: 'Название',
      type: 'text',
      required: true,
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

// Дополнительные параметры
const additionalParams = ref({});

// API URL для тестирования (замените на ваш реальный API)
const apiUrl = ref(api + '/api/test-items'); // Замените на ваш реальный endpoint
</script> 