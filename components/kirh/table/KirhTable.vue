<template>
  <div class="bg-white rounded-lg shadow-md p-4">
    <!-- Панель управления -->
    <div class="flex justify-between items-center mb-4">
      <button
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          @click="addNewRow"
      >
        Добавить запись
      </button>

      <div v-if="loading" class="text-gray-500 italic">
        Загрузка данных...
      </div>

      <div v-if="tableOptions.pagination" class="flex items-center gap-4">
        <button
            :disabled="currentPage === 1 || loading"
            class="px-3 py-1 border rounded disabled:opacity-50"
            @click="currentPage--"
        >
          Назад
        </button>
        <div class="page-info">
          <span>Страница </span>
          <span class="current-page">{{ currentPage }}</span>
          <span> из </span>
          <span class="total-pages">{{ totalPages }}</span>
        </div>
        <button
            :disabled="currentPage === totalPages || loading"
            class="px-3 py-1 border rounded disabled:opacity-50"
            @click="currentPage++"
        >
          Вперед
        </button>
      </div>
    </div>

    <!-- Заголовки -->
    <div
        :class="[
        'grid gap-2 mb-2',
        tableOptions.editable ? 'grid-cols-[repeat(auto-fill,minmax(0,1fr))_80px]' : 'grid-cols-[repeat(auto-fill,minmax(0,1fr))]'
      ]"
    >
      <div
          v-for="(column, index) in tableOptions.columns"
          :key="'header-'+index"
          class="bg-gray-100 p-3 font-semibold rounded flex items-center justify-between"
      >
        <span>{{ column.label }}</span>
        <button
            v-if="tableOptions.sortable && column.sortable !== false"
            class="ml-2"
            @click="sortBy(column.name)"
        >
          {{ sortField === column.name ? (sortDirection === 'asc' ? '↑' : '↓') : '↕' }}
        </button>
      </div>
      <div v-if="tableOptions.editable" class="bg-gray-100 p-3 font-semibold rounded">
        Действия
      </div>
    </div>

    <!-- Тело таблицы -->
    <div>
      <div
          v-for="(row, rowIndex) in tableData"
          :key="row.id || rowIndex"
          :class="[
          'grid gap-2 mb-2 p-2 hover:bg-gray-50 rounded',
          tableOptions.editable ? 'grid-cols-[repeat(auto-fill,minmax(0,1fr))_80px]' : 'grid-cols-[repeat(auto-fill,minmax(0,1fr))]'
        ]"
      >
        <div
            v-for="(column, colIndex) in tableOptions.columns"
            :key="'cell-'+rowIndex+'-'+colIndex"
            class="p-3 border rounded"
        >
          <div>
            <div>
              <component
                  :is="getFieldComponent(column.type)"
                  :options="column.options || {}"
                  :readonly="!tableOptions.editable || column.readonly"
                  :value="row[column.name]"
                  @input="updateValue(row, column.name, $event)"
              />
            </div>
          </div>
        </div>

        <div v-if="tableOptions.editable" class="p-3 border rounded flex gap-2">
          <button
              class="text-blue-600 hover:text-blue-800"
              @click="editRow(row)"
          >
            ✏️
          </button>
          <button
              class="text-red-600 hover:text-red-800"
              @click="deleteRow(row)"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Форма добавления/редактирования -->
    <div
        v-if="showForm"
        class="mt-6 p-6 border border-gray-200 rounded-lg bg-gray-50"
    >
      <h3 class="text-xl font-bold mb-4">
        {{ editingRow ? 'Редактировать запись' : 'Добавить запись' }}
      </h3>

      <div class="grid gap-4">
        <div
            v-for="(column, index) in formOptions.fields"
            :key="'form-field-'+index"
        >
          <label class="block mb-2 font-medium">
            {{ column.label }}
          </label>
          <component
              :is="getFieldComponent(column.type)"
              v-model="formData[column.name]"
              :options="column.options || {}"
              class="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div class="mt-6 flex gap-3">
        <button
            :disabled="formLoading"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
            @click="submitForm"
        >
          {{ formLoading ? 'Сохранение...' : 'Сохранить' }}
        </button>
        <button
            :disabled="formLoading"
            class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
            @click="cancelForm"
        >
          Отмена
        </button>
      </div>
    </div>

    <!-- Отображение ошибок -->
    <div
        v-if="error"
        class="mt-4 p-3 bg-red-100 text-red-700 rounded border border-red-200"
    >
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import {ref, watch, onMounted} from 'vue';

const props = defineProps({
  apiUrl: {
    type: String,
    required: true,
    validator: value => {
      console.log('API URL:', value);
      return !!value;
    }
  },
  tableOptions: {
    type: Object,
    default: () => ({
      columns: [],
      editable: true,
      sortable: true,
      pagination: true,
      pageSize: 10
    })
  },
  formOptions: {
    type: Object,
    default: () => ({
      fields: [],
      inline: false
    })
  },
  additionalParams: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update-success', 'update-error']);

// Состояние компонента
const tableData = ref([]);
const loading = ref(false);
const formLoading = ref(false);
const showForm = ref(false);
const formData = ref({});
const editingRow = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const sortField = ref(null);
const sortDirection = ref('asc');
const error = ref(null);

// Настройки CORS
const corsConfig = ref({
  mode: 'cors',
  credentials: 'include',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Универсальный метод запроса
const makeRequest = async (url, method = 'GET', body = null) => {
  const token = localStorage.getItem('sanctum_token');
  const headers = {...corsConfig.value.headers};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    mode: corsConfig.value.mode,
    credentials: corsConfig.value.credentials
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    console.log(`Sending ${method} request to:`, url);
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Request failed:', err);
    handleApiError(err);
    throw err;
  }
};

// Обработка ошибок API
const handleApiError = (err) => {
  if (err.message.includes('CORS') || err.message.includes('Failed to fetch')) {
    error.value = 'Ошибка соединения с сервером';
  } else if (err.message.includes('401')) {
    error.value = 'Требуется авторизация';
  } else {
    error.value = err.message;
  }
};

// Загрузка данных
const fetchData = async () => {
  try {
    loading.value = true;
    error.value = null;

    const params = new URLSearchParams({
      page: currentPage.value,
      per_page: props.tableOptions.pageSize,
      ...(sortField.value && {sort: `${sortField.value},${sortDirection.value}`}),
      ...props.additionalParams
    });

    const url = `${props.apiUrl}?${params.toString()}`;
    const data = await makeRequest(url);

    tableData.value = data.data || data;
    totalPages.value = data.meta?.last_page || data.last_page || 1;
    emit('update-success', data);
  } catch (err) {
    emit('update-error', err);
  } finally {
    loading.value = false;
  }
};

// CRUD операции
const createItem = async () => {
  try {
    formLoading.value = true;
    const data = await makeRequest(props.apiUrl, 'POST', formData.value);
    await fetchData();
    cancelForm();
    emit('update-success', {action: 'create', data});
  } catch (err) {
    emit('update-error', err);
  } finally {
    formLoading.value = false;
  }
};

const updateItem = async () => {
  try {
    formLoading.value = true;
    const url = `${props.apiUrl}/${editingRow.value.id}`;
    const data = await makeRequest(url, 'PUT', formData.value);
    await fetchData();
    cancelForm();
    emit('update-success', {action: 'update', data});
  } catch (err) {
    emit('update-error', err);
  } finally {
    formLoading.value = false;
  }
};

const deleteItem = async (id) => {
  if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;

  try {
    loading.value = true;
    const url = `${props.apiUrl}/${id}`;
    await makeRequest(url, 'DELETE');
    await fetchData();
    emit('update-success', {action: 'delete', id});
  } catch (err) {
    emit('update-error', err);
  } finally {
    loading.value = false;
  }
};

// Инициализация
onMounted(() => {
  console.log('Initializing table component with CORS support');
  fetchData();
});

watch([currentPage], fetchData);
</script>