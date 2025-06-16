<template>
  <div>
    <div class="relative">
      <input
        type="text"
        v-model="searchQuery"
        @input="handleSearchInput"
        placeholder="Введите название канала..."
        class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
      />
      <!-- Индикатор загрузки -->
      <div v-if="isSearching" class="absolute right-3 top-2.5">
        <svg class="animate-spin h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
          class="px-4 py-2 hover:bg-purple-50 cursor-pointer"
        >
          <div class="font-medium">{{ channel.title }}</div>
          <div class="text-sm text-gray-500">{{ channel.username }}</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mt-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Дата начала парсинга
        </label>
        <input
          type="date"
          v-model="parseStartDate"
          class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Количество сообщений
        </label>
        <input
          type="number"
          v-model="parseMessageCount"
          min="1"
          max="100"
          class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
    </div>

    <!-- Кнопка парсинга -->
    <div class="mt-4">
      <button
        @click="parseTelegramChannel"
        :disabled="isParsing || !parseChannelId || !parseStartDate"
        class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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

    <TelegramParserGlobal
      v-if="activeTab === 'telegram'"
      @parsed="handleTelegramParsed"
      @reset="handleTelegramReset"
      @update:content="handleContentUpdate"
      @update:modelValue="handleContentUpdate"
      @input="handleContentUpdate"
      ref="telegramParser"
      v-model="parsedTelegramContent"
      :parse_own_telegram="props.options.parse_own_telegram"
      :telegrams="props.options.telegrams"
      :telegrams_field="props.options.telegrams_field"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const emit = defineEmits(['parsed', 'reset']);

const props = defineProps({
  options: {
    type: Object,
    default: () => ({})
  },
  rowData: {
    type: Object,
    default: () => ({})
  }
});

// Состояния для работы с TelegramParserGlobal
const activeTab = ref('telegram');
const parsedTelegramContent = ref('');

// Состояния для парсинга Telegram
const parseChannelId = ref('');
const parseStartDate = ref(new Date().toISOString().split('T')[0]);
const parseMessageCount = ref(20);
const isParsing = ref(false);
const searchQuery = ref('');
const searchResults = ref<ParseChannel[]>([]);
const isSearching = ref(false);
const selectedParseChannel = ref<ParseChannel | null>(null);

// Обработчики событий
const handleTelegramParsed = (result: { content: string; fileId: string }) => {
  parsedTelegramContent.value = result.content;
  emit('parsed', result);
};

const handleTelegramReset = () => {
  parsedTelegramContent.value = '';
  emit('reset');
};

const handleContentUpdate = (content: string) => {
  parsedTelegramContent.value = content;
};

// Интерфейс для канала парсинга
interface ParseChannel {
  id: number;
  title: string;
  username: string;
  is_active: boolean;
  channel_id: string;
}

// Интерфейс для сообщения Telegram
interface TelegramMessage {
  message: string;
}

// Интерфейс для ответа API
interface TelegramApiResponse {
  success: boolean;
  message?: string;
  data?: {
    messages: TelegramMessage[];
  };
}

const config = useRuntimeConfig();
const api = config.public.API_URL;

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

// Функция для создания текстового файла
const createPromptFile = (content: string): File => {
  const blob = new Blob([content], { type: 'text/plain' });
  return new File([blob], 'prompt.txt', { type: 'text/plain' });
};

// Функция для загрузки файла
const uploadFile = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error('Файл не найден');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${api}/api/ai/upload-file`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Ошибка при загрузке файла: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Ошибка при загрузке файла');
    }

    if (!result.data?.file_id) {
      throw new Error('Не получен ID загруженного файла');
    }

    return result.data.file_id;
  } catch (error) {
    throw error;
  }
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

    const result = await response.json() as TelegramApiResponse;

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
      
      result.data.messages.forEach((message: TelegramMessage, index: number) => {
        if (index > 0) {
          formattedContent += '\n\n';
        }
        if (message.message) {
          let text = message.message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/```(.*?)```/g, '<pre>$1</pre>')
            .replace(/~~(.*?)~~/g, '<del>$1</del>')
            .replace(/__(.*?)__/g, '<u>$1</u>');
          
          formattedContent += text;
        }
      });
    }

    if (!formattedContent.trim()) {
      throw new Error('Не удалось получить контент из сообщений');
    }

    // Создаем файл с распарсеным контентом
    const file = createPromptFile(formattedContent);
    if (!file) {
      throw new Error('Не удалось создать файл');
    }
    
    // Загружаем файл и получаем его ID
    const fileId = await uploadFile(file);
    
    // Отправляем результат в родительский компонент
    emit('parsed', {
      content: formattedContent,
      fileId: fileId
    });

  } catch (error) {
    alert(`Произошла ошибка при парсинге сообщений: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  } finally {
    isParsing.value = false;
  }
};

// Экспортируем функцию сброса
defineExpose({
  reset: handleTelegramReset
});

defineOptions({
  name: 'TelegramParserGlobal'
})
</script> 