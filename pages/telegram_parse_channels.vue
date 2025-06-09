<template>
  <header class="bg-gray-50shadow-sm border-b border-gray-300">
    <div class="px-6 pt-4">
      <div class="flex items-start justify-between">
        <Head :breadcrumbs="breadcrumbs || []" :icon="p_icon || null" :title="p_description || null" :show_breadcrumbs="'true'"/>
      </div>
    </div>
  </header>

  <div v-if="isAuthenticated" class="p-6">
    <!-- Основной контент -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-4">
        <!-- Заголовок и кнопка добавления -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Каналы для парсинга</h2>
          <button
            @click="showAddModal = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Добавить канал
          </button>
        </div>

        <!-- Таблица каналов -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID канала</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="channel in channels" :key="channel.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ channel.title }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ channel.channel_id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ channel.username || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-green-100 text-green-800': channel.is_active,
                      'bg-red-100 text-red-800': !channel.is_active
                    }"
                  >
                    {{ channel.is_active ? 'Активен' : 'Неактивен' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex space-x-2">
                    <button
                      @click="editChannel(channel)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      Редактировать
                    </button>
                    <button
                      @click="deleteChannel(channel)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Модальное окно добавления канала -->
  <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg w-full max-w-md mx-4">
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold">Добавить канал</h3>
      </div>
      <div class="p-4">
        <form @submit.prevent="addChannel">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ID канала <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              v-model="newChannel.channel_id"
              class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="-1001234567890"
              required
            />
            <p class="mt-1 text-sm text-gray-500">
              Укажите ID канала (например: -1001234567890)
              <br>
              <br>Как найти ID канала:
              <br>1. Через бота @username_to_id_bot - отправьте ему ссылку на канал
              <br>2. Через бота @getidsbot - добавьте его в канал
              <br>3. В веб-версии Telegram в URL канала
            </p>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Username канала
            </label>
            <input
              type="text"
              v-model="newChannel.username"
              class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="@channel_name"
            />
            <p class="mt-1 text-sm text-gray-500">Укажите username канала без @ (необязательно)</p>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Название канала <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              v-model="newChannel.title"
              class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Название канала в системе"
              required
            />
          </div>
        </form>
      </div>
      <div class="p-4 border-t flex justify-end space-x-3">
        <button
          @click="showAddModal = false"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Отмена
        </button>
        <button
          @click="addChannel"
          :disabled="isLoading"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Добавить
        </button>
      </div>
    </div>
  </div>

  <!-- Модальное окно редактирования канала -->
  <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg w-full max-w-md mx-4">
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold">Редактировать канал</h3>
      </div>
      <div class="p-4">
        <form @submit.prevent="updateChannel">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ID канала <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              v-model="editingChannel.channel_id"
              class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="-1001234567890"
              required
            />
            <p class="mt-1 text-sm text-gray-500">
              Укажите ID канала (например: -1001234567890)
              <br>
              <br>Как найти ID канала:
              <br>1. Через бота @username_to_id_bot - отправьте ему ссылку на канал
              <br>2. Через бота @getidsbot - добавьте его в канал
              <br>3. В веб-версии Telegram в URL канала
            </p>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Username канала
            </label>
            <input
              type="text"
              v-model="editingChannel.username"
              class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="@channel_name"
            />
            <p class="mt-1 text-sm text-gray-500">Укажите username канала без @ (необязательно)</p>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Название канала <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              v-model="editingChannel.title"
              class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Название канала в системе"
              required
            />
          </div>
          <div class="mb-4">
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="editingChannel.is_active"
                class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span class="ml-2 text-sm text-gray-600">Активен</span>
            </label>
          </div>
        </form>
      </div>
      <div class="p-4 border-t flex justify-end space-x-3">
        <button
          @click="showEditModal = false"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Отмена
        </button>
        <button
          @click="updateChannel"
          :disabled="isLoading"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Сохранить
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useGlobalsStore } from '~/stores/globals';
import { storeToRefs } from 'pinia';
import Head from "~/components/parts/Head.vue"
import KirhTable from "~/components/kirh/table/KirhTable.vue";

const globalsStore = useGlobalsStore();
const {params} = storeToRefs(globalsStore);

const config = useRuntimeConfig();
const api = config.public.API_URL;
const api_addr = api + '/api/telegram/parse-channels';

useSeoMeta({
  title: ((params.value as any).adminka_name || 'Админка') + ' - Каналы для парсинга',
  description: 'Управление каналами для парсинга',
});

const p_icon = "stash:telegram";
const p_description = 'Каналы для парсинга';
const breadcrumbs: { title: string; path?: string }[] = [];

const {isAuthenticated} = useAuth();

interface TelegramChannel {
  id: number;
  title: string;
  username: string;
  is_active: boolean;
  channel_id: string;
}

// Настройки таблицы
const defaultVisibleFields = [
  'title',
  'username',
  'chat_id',
  'is_active',
  'last_parsed_at'
];

const extraFields = [
  {
    name: 'title',
    label: 'Название',
    required: true,
    type: 'text',
    sortable: true,
    width: '250px',
    options: {
      readonly: false,
      placeholder: 'Название канала',
      hint: 'Название канала в Telegram',
      cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
      inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
    }
  },
  {
    name: 'username',
    label: 'Username',
    required: false,
    type: 'text',
    width: '150px',
    options: {
      readonly: false,
      placeholder: '@username',
      hint: 'Username канала в Telegram',
      cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
      inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
    }
  },
  {
    name: 'chat_id',
    label: 'ID чата',
    required: false,
    type: 'text',
    width: '200px',
    options: {
      readonly: false,
      placeholder: '-1001234567890',
      hint: 'ID чата в Telegram',
      cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
      inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
    }
  },
  {
    name: 'is_active',
    label: 'Активен',
    required: true,
    type: 'checkbox',
    width: '100px',
    options: {
      readonly: false,
      cellClass: 'text-center',
      inputClass: 'w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
    }
  },
  {
    name: 'description',
    label: 'Описание',
    required: false,
    type: 'textarea',
    width: '300px',
    options: {
      readonly: false,
      placeholder: 'Описание канала',
      hint: 'Описание канала',
      cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1 w-full',
      inputClass: 'w-full p-1 h-10 border border-gray-300 rounded text-md'
    }
  }
];

const formOptions = {
  title: 'Канал для парсинга',
  submitButtonText: 'Сохранить',
  cancelButtonText: 'Отмена'
};

const tableOptions = {
  perPage: 20,
  sortBy: 'title',
  sortDirection: 'asc'
};

// Состояние
const channels = ref<TelegramChannel[]>([]);
const showAddModal = ref(false);
const showEditModal = ref(false);
const isLoading = ref(false);
const editingChannel = ref<TelegramChannel>({
  id: 0,
  title: '',
  username: '',
  is_active: true,
  channel_id: ''
});

interface NewChannel {
  channel_id: string;
  username: string;
  title: string;
}

const newChannel = ref<NewChannel>({
  channel_id: '',
  username: '',
  title: ''
});

// Загрузка каналов
const fetchChannels = async () => {
  try {
    const response = await fetch(`${api}/api/telegram/parse-channels`);
    const result = await response.json();
    if (result.success) {
      channels.value = result.data;
    }
  } catch (error) {
    console.error('Ошибка при загрузке каналов:', error);
  }
};

// Добавление канала
const addChannel = async () => {
  if (!newChannel.value.channel_id || !newChannel.value.title) {
    alert('Пожалуйста, заполните обязательные поля');
    return;
  }

  // Обработка username
  let username = newChannel.value.username.trim();
  if (username && !username.startsWith('@')) {
    username = '@' + username;
  }

  try {
    isLoading.value = true;
    const response = await fetch(`${api}/api/telegram/parse-channels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        ...newChannel.value,
        username
      })
    });

    const result = await response.json();
    if (result.success) {
      showAddModal.value = false;
      await fetchChannels();
      // Сброс формы
      newChannel.value = {
        channel_id: '',
        username: '',
        title: ''
      };
    } else {
      alert(result.message || 'Ошибка при добавлении канала');
    }
  } catch (error) {
    console.error('Ошибка при добавлении канала:', error);
    alert('Произошла ошибка при добавлении канала');
  } finally {
    isLoading.value = false;
  }
};

// Редактирование канала
const editChannel = (channel: TelegramChannel) => {
  editingChannel.value = { ...channel };
  showEditModal.value = true;
};

// Обновление канала
const updateChannel = async () => {
  if (!editingChannel.value.title) {
    alert('Пожалуйста, заполните название канала');
    return;
  }

  try {
    isLoading.value = true;
    const response = await fetch(`${api}/api/telegram/parse-channels/${editingChannel.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(editingChannel.value)
    });

    const result = await response.json();
    if (result.success) {
      showEditModal.value = false;
      await fetchChannels();
    } else {
      alert(result.message || 'Ошибка при обновлении канала');
    }
  } catch (error) {
    console.error('Ошибка при обновлении канала:', error);
    alert('Произошла ошибка при обновлении канала');
  } finally {
    isLoading.value = false;
  }
};

// Удаление канала
const deleteChannel = async (channel: TelegramChannel) => {
  if (!confirm('Вы уверены, что хотите удалить этот канал?')) {
    return;
  }

  try {
    const response = await fetch(`${api}/api/telegram/parse-channels/${channel.id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    const result = await response.json();
    if (result.success) {
      await fetchChannels();
    } else {
      alert(result.message || 'Ошибка при удалении канала');
    }
  } catch (error) {
    console.error('Ошибка при удалении канала:', error);
    alert('Произошла ошибка при удалении канала');
  }
};

// Загрузка данных при монтировании
onMounted(() => {
  fetchChannels();
});
</script>

<style scoped>
.bg-gray-50shadow-sm {
  background-color: #f9fafb;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style> 