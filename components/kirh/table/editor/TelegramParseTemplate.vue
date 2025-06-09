<template>
  <button
    @click="showParseModal = true"
    :disabled="isParsing"
    class="px-4 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
  >
    <span v-if="isParsing" class="flex items-center">
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-orange-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Парсинг...
    </span>
    <span v-else>Парсинг Телеграм</span>
  </button>

  <!-- Модальное окно парсинга телеграм -->
  <div v-if="showParseModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg w-full max-w-md mx-4">
      <div class="p-4 border-b flex justify-between items-center">
        <h3 class="text-lg font-semibold">Парсинг сообщений из Telegram</h3>
        <button @click="showParseModal = false" class="text-gray-500 hover:text-gray-700">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="p-4">
        <!-- Поиск канала -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Поиск канала
          </label>
          <div class="relative">
            <input
              type="text"
              v-model="searchQuery"
              @input="handleSearchInput"
              placeholder="Введите название канала..."
              class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <!-- Индикатор загрузки -->
            <div v-if="isSearching" class="absolute right-3 top-2.5">
              <svg class="animate-spin h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <!-- Результаты поиска -->
            <div v-if="searchResults.length > 0" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              <div
                v-for="channel in searchResults"
                :key="channel.id"
                @click="handleChannelSelect(channel)"
                class="px-4 py-2 hover:bg-orange-50 cursor-pointer"
              >
                <div class="font-medium">{{ channel.title }}</div>
                <div class="text-sm text-gray-500">{{ channel.username }}</div>
              </div>
            </div>
          </div>
          <p class="mt-1 text-sm text-gray-500">
            Введите название канала для поиска
          </p>
        </div>

        <!-- Выбор даты -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Дата начала парсинга
          </label>
          <input
            type="date"
            v-model="parseStartDate"
            class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <p class="mt-1 text-sm text-gray-500">
            Укажите дату, с которой начать парсинг сообщений
          </p>
        </div>

        <!-- Количество сообщений -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Количество сообщений
          </label>
          <input
            type="number"
            v-model="parseMessageCount"
            min="1"
            max="100"
            class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <p class="mt-1 text-sm text-gray-500">
            Максимум 100 сообщений за один запрос
          </p>
        </div>
      </div>
      <div class="p-4 border-t flex justify-end space-x-3">
        <button
          @click="showParseModal = false"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Отмена
        </button>
        <button
          @click="parseTelegramChannel"
          :disabled="isParsing || !parseChannelId || !parseStartDate"
          class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <span v-if="isParsing" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Парсинг...
          </span>
          <span v-else>Начать парсинг</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

const config = useRuntimeConfig();
const api = config.public.API_URL;

// Состояния для парсинга
const showParseModal = ref(false);
const parseChannelId = ref('');
const parseStartDate = ref(new Date().toISOString().split('T')[0]);
const parseMessageCount = ref(20);
const isParsing = ref(false);
const searchQuery = ref('');
const searchResults = ref<ParseChannel[]>([]);
const isSearching = ref(false);
const selectedParseChannel = ref<ParseChannel | null>(null);

// Интерфейс для канала парсинга
interface ParseChannel {
  id: number;
  title: string;
  username: string;
  is_active: boolean;
  channel_id: string;
}

// Функция поиска каналов
const searchChannels = async (query: string) => {
  if (!query.trim()) {
    searchResults.value = [];
    return;
  }

  try {
    isSearching.value = true;
    const response = await fetch(`${api}/api/telegram-parse-channels?q=${encodeURIComponent(query)}`);
    const result = await response.json();
    if (result.success) {
      searchResults.value = result.data.filter((channel: ParseChannel) => channel.is_active);
    }
  } catch (error) {
    console.error('Ошибка при поиске каналов:', error);
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
};

// Обработчик изменения поискового запроса
const handleSearchInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  searchQuery.value = input.value;
  searchChannels(input.value);
};

// Обработчик выбора канала
const handleChannelSelect = (channel: ParseChannel) => {
  selectedParseChannel.value = channel;
  parseChannelId.value = channel.id.toString();
  searchQuery.value = channel.title;
  searchResults.value = [];
};

// Функция парсинга канала
const parseTelegramChannel = async () => {
  if (!parseChannelId.value) {
    alert('Пожалуйста, выберите канал для парсинга');
    return;
  }

  if (!parseStartDate.value) {
    alert('Пожалуйста, выберите дату начала парсинга');
    return;
  }

  if (!parseMessageCount.value) {
    alert('Пожалуйста, введите количество сообщений для парсинга');
    return;
  }

  try {
    isParsing.value = true;

    const response = await fetch(`${api}/api/telegram/messages/fetch?channel_id=${parseChannelId.value}&date_from=${parseStartDate.value}&limit=${parseMessageCount.value}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Ошибка при парсинге сообщений');
    }

    // Форматируем полученные сообщения
    let formattedContent = '';
    if (result.data && result.data.messages) {
      if (result.data.messages.length === 0) {
        alert('За указанный период сообщений не найдено');
        return;
      }
      
      result.data.messages.forEach((message: any, index: number) => {
        if (index > 0) {
          formattedContent += '\n\n'; // Добавляем пустую строку между сообщениями
        }
        if (message.message) {
          // Сохраняем форматирование, но заменяем некоторые символы для лучшей читаемости
          let text = message.message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Жирный текст
            .replace(/\*(.*?)\*/g, '<em>$1</em>')           // Курсив
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>') // Ссылки
            .replace(/`(.*?)`/g, '<code>$1</code>')         // Код
            .replace(/```(.*?)```/g, '<pre>$1</pre>')       // Блоки кода
            .replace(/~~(.*?)~~/g, '<del>$1</del>')         // Зачеркнутый текст
            .replace(/__(.*?)__/g, '<u>$1</u>');            // Подчеркнутый текст
          
          formattedContent += text;
        }
      });
    }

    // Эмитим событие с отформатированным контентом
    emit('update:content', formattedContent);

    // Закрываем модальное окно и очищаем состояние
    showParseModal.value = false;
    parseChannelId.value = '';
    parseStartDate.value = new Date().toISOString().split('T')[0];
    parseMessageCount.value = 20;

  } catch (error) {
    console.error('Ошибка при парсинге сообщений:', error);
    alert(`Произошла ошибка при парсинге сообщений: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  } finally {
    isParsing.value = false;
  }
};

// Определяем emit
const emit = defineEmits(['update:content']);
</script> 