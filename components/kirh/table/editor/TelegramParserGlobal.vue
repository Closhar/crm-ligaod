<template>
  <div @click.stop>
    <!-- Форма парсинга -->
    <div v-if="!isFilePrepared">
      <!-- Выбор режима парсинга -->
      <div v-if="parse_own_telegram && ownChannels.length > 0" class="mb-4">
        <div class="flex space-x-4">
          <button
            @click.stop="parseMode = 'own'"
            :class="[
              'px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 text-lg font-medium',
              parseMode === 'own'
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
            ]"
          >
            Привязанные каналы
          </button>
          <button
            @click.stop="parseMode = 'search'"
            :class="[
              'px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 text-lg font-medium',
              parseMode === 'search'
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
            ]"
          >
            Поиск канала
          </button>
        </div>
      </div>

      <!-- Список привязанных каналов -->
      <div v-if="parseMode === 'own'" class="mb-4">
        <h3 class="text-lg font-medium mb-2">Привязанные каналы</h3>
        <div class="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
          <div v-for="(channel, index) in ownChannels" :key="index" class="mb-2">
            <div class="flex items-center">
              <span class="text-red-600 font-medium">@{{ channel }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Поиск канала -->
      <div v-if="parseMode === 'search'">
        <div v-if="parse_own_telegram && ownChannels.length === 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">Нет привязанных каналов</h3>
              <div class="mt-2 text-sm text-yellow-700">
                <p>Для парсинга привязанных каналов необходимо добавить их в настройках соревнования или участвующих клубов.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            @input.stop="handleSearchInput"
            @focus.stop="handleInputFocus"
            @blur.stop="handleInputBlur"
            @keydown.stop
            @keyup.stop
            @click.stop
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
          <div v-if="searchResults.length > 0 && showResults" class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            <div
              v-for="channel in searchResults"
              :key="channel.id"
              @mousedown.prevent="handleChannelSelect(channel)"
              class="px-4 py-2 hover:bg-purple-50 cursor-pointer"
            >
              <div class="font-medium">{{ channel.title }}</div>
              <div class="text-sm text-gray-500">{{ channel.username }}</div>
            </div>
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
            @input.stop
            @change.stop
            @click.stop
            @focus.stop
            @blur.stop
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
            @input.stop
            @change.stop
            @click.stop
            @focus.stop
            @blur.stop
            min="1"
            max="100"
            class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      <!-- Кнопка парсинга -->
      <div class="mt-4">
        <button
          @click="parseMode === 'own' ? parseAllOwnChannels() : parseTelegramChannel()"
          :disabled="isParsing || !parseStartDate || !parseMessageCount"
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
    </div>

    <!-- Результат парсинга -->
    <div v-else class="space-y-4">
      <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Результат парсинга</h3>
        <div class="text-sm text-gray-600 mb-4">
          Сообщения успешно получены. Выберите дальнейшее действие:
        </div>
        <div class="flex space-x-3">
          <button
            @click.stop="handleUseInEditor"
            type="button"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Перенести в редактор
          </button>
          <button
            @click.stop="reset"
            type="button"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Начать заново
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['parsed', 'reset', 'update:content', 'update:modelValue', 'input', 'apply']);

const props = defineProps({
  parse_own_telegram: {
    type: Boolean,
    default: false
  },
  telegrams: {
    type: String,
    default: ''
  },
  telegrams_field: {
    type: String,
    default: ''
  }
});

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
  channel: string;
  date: string;
  message: string;
  message_id: number;
  views: number;
  forwards: number;
}

// Интерфейс для ответа API
interface TelegramApiResponse {
  success: boolean;
  message?: string;
  data?: {
    messages: TelegramMessage[];
    errors?: string[];
  };
}

const config = useRuntimeConfig();
const api = config.public.API_URL;

// Состояния для парсинга Telegram
const parseChannelId = ref('');
const parseStartDate = ref(new Date().toISOString().split('T')[0]);
const parseMessageCount = ref(20);
const isParsing = ref(false);
const searchQuery = ref('');
const searchResults = ref<ParseChannel[]>([]);
const isSearching = ref(false);
const selectedParseChannel = ref<ParseChannel | null>(null);
const searchTimeout = ref<number | null>(null);
const showResults = ref(false);
const isFilePrepared = ref(false);
const formattedContent = ref('');
const fileId = ref('');
const ownChannels = ref<string[]>([]);
const selectedOwnChannel = ref<string>('');
const parseMode = ref<'search' | 'own'>(props.parse_own_telegram && props.telegrams ? 'own' : 'search');

// Обработчик фокуса на поле ввода
const handleInputFocus = (event: Event) => {
  event.stopPropagation();
  if (searchQuery.value.length >= 2) {
    showResults.value = true;
  }
};

// Обработчик потери фокуса
const handleInputBlur = (event: Event) => {
  event.stopPropagation();
  // Увеличиваем задержку для обработки клика по результатам
  setTimeout(() => {
    showResults.value = false;
  }, 300);
};

// Функция поиска каналов
const searchChannels = async (query: string) => {
  if (!query.trim() || query.length < 2) {
    searchResults.value = [];
    showResults.value = false;
    return;
  }

  try {
    isSearching.value = true;
    showResults.value = true;
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
  event.stopPropagation();
  const input = event.target as HTMLInputElement;
  const newValue = input.value;
  
  // Очищаем предыдущий таймаут
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  
  // Устанавливаем новый таймаут для поиска
  searchTimeout.value = window.setTimeout(() => {
    if (newValue.length >= 2) {
      searchChannels(newValue);
    } else {
      searchResults.value = [];
      showResults.value = false;
    }
  }, 300);
};

// Обработчик выбора канала
const handleChannelSelect = (channel: ParseChannel) => {
  selectedParseChannel.value = channel;
  parseChannelId.value = channel.id.toString();
  searchQuery.value = channel.title;
  searchResults.value = [];
  showResults.value = false;
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
    console.error('Ошибка при загрузке файла:', error);
    throw error;
  }
};

// Функция для извлечения каналов из строки telegrams
const extractOwnChannels = () => {
  if (!props.telegrams) return;
  
  // Сначала разбиваем по запятой
  const channelGroups = props.telegrams.split(',');
  
  const channels = channelGroups
    .map(group => {
      // Разбиваем каждую группу по |
      const parts = group.split('|');
      // Берем первую часть (адрес канала)
      const address = parts[0].trim();
      
      // Убираем экранированные слеши и @ если есть
      return address
        .replace(/\\/g, '') // убираем экранированные слеши
        .replace(/^@/, '') // убираем @ в начале
        .replace(/^https:\/\/t\.me\//, ''); // убираем https://t.me/
    })
    .filter(channel => channel); // убираем пустые значения

  ownChannels.value = channels;
};

// Вызываем извлечение каналов при монтировании компонента
onMounted(() => {
  if (props.parse_own_telegram) {
    extractOwnChannels();
  }
});

// Модифицируем функцию парсинга для поддержки привязанных каналов
const parseTelegramChannel = async () => {
  if (parseMode.value === 'own' && !selectedOwnChannel.value) {
    alert('Пожалуйста, выберите канал из списка привязанных каналов');
    return;
  }

  if (parseMode.value === 'search' && !parseChannelId.value) {
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

    const channelId = parseMode.value === 'own' ? selectedOwnChannel.value : parseChannelId.value;

    const response = await fetch(`${api}/api/telegram/messages/fetch?channel_id=${channelId}&date_from=${parseStartDate.value}&limit=${parseMessageCount.value}`, {
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

    // Проверяем наличие сообщений
    if (!result.data?.messages || result.data.messages.length === 0) {
      alert('За указанный период сообщений не найдено');
      return;
    }

    // Форматируем все сообщения
    let formattedContent = '';
    result.data.messages.forEach((message: TelegramMessage, index: number) => {
      if (index > 0) {
        formattedContent += '\n\n';
      }
      
      // Добавляем информацию о канале, дате и статистике
      let date: Date;
      if (typeof message.date === 'string') {
        date = new Date(message.date.replace(' ', 'T'));
      } else if (typeof message.date === 'number') {
        date = new Date(message.date * 1000);
      } else {
        date = new Date();
      }

      const formattedDate = date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      formattedContent += `<div class="text-gray-500 text-sm mb-1">
        @${message.channel} • ${formattedDate}
        <span class="ml-2 text-xs">
          👁 ${message.views.toLocaleString()} • 🔄 ${message.forwards}
        </span>
      </div>`;

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

    if (!formattedContent.trim()) {
      throw new Error('Не удалось получить контент из сообщений');
    }

    // Сохраняем отформатированный контент
    formattedContent = formattedContent;

    // Создаем файл с распарсеным контентом
    const file = createPromptFile(formattedContent);
    if (!file) {
      throw new Error('Не удалось создать файл');
    }
    
    // Загружаем файл и получаем его ID
    const uploadedFileId = await uploadFile(file);
    fileId.value = uploadedFileId;
    
    // Отправляем результат в родительский компонент
    const parsedData = {
      content: formattedContent,
      fileId: uploadedFileId
    };
    emit('parsed', parsedData);

    // Устанавливаем флаг, что файл подготовлен
    isFilePrepared.value = true;

  } catch (error) {
    alert(`Произошла ошибка при парсинге сообщений: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  } finally {
    isParsing.value = false;
  }
};

// Функция для парсинга всех привязанных каналов
const parseAllOwnChannels = async () => {
  if (!ownChannels.value.length) {
    alert('Нет доступных каналов для парсинга');
    return;
  }

  try {
    isParsing.value = true;
    
    // Формируем строку из названий каналов через запятую
    const channelUsernames = ownChannels.value.join(',');

    const response = await fetch(`${api}/api/telegram/messages/fetch?channel_usernames=${encodeURIComponent(channelUsernames)}&date_from=${parseStartDate.value}&limit=${parseMessageCount.value}`, {
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

    // Проверяем наличие сообщений
    if (!result.data?.messages || result.data.messages.length === 0) {
      alert('За указанный период сообщений не найдено');
      return;
    }

    // Форматируем все сообщения
    let formattedContent = '';
    result.data.messages.forEach((message: TelegramMessage, index: number) => {
      if (index > 0) {
        formattedContent += '\n\n';
      }
      
      // Добавляем информацию о канале, дате и статистике
      let date: Date;
      if (typeof message.date === 'string') {
        date = new Date(message.date.replace(' ', 'T'));
      } else if (typeof message.date === 'number') {
        date = new Date(message.date * 1000);
      } else {
        date = new Date();
      }

      const formattedDate = date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      formattedContent += `<div class="text-gray-500 text-sm mb-1">
        @${message.channel} • ${formattedDate}
        <span class="ml-2 text-xs">
          👁 ${message.views.toLocaleString()} • 🔄 ${message.forwards}
        </span>
      </div>`;

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

    if (!formattedContent.trim()) {
      throw new Error('Не удалось получить контент из сообщений');
    }

    // Создаем файл с распарсеным контентом
    const file = createPromptFile(formattedContent);
    if (!file) {
      throw new Error('Не удалось создать файл');
    }
    
    // Загружаем файл и получаем его ID
    const uploadedFileId = await uploadFile(file);
    fileId.value = uploadedFileId;
    
    // Отправляем результат в родительский компонент
    const parsedData = {
      content: formattedContent,
      fileId: uploadedFileId
    };
    emit('parsed', parsedData);

    // Устанавливаем флаг, что файл подготовлен
    isFilePrepared.value = true;

  } catch (error) {
    console.error('Ошибка при парсинге сообщений:', error);
    alert(`Произошла ошибка при парсинге сообщений: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  } finally {
    isParsing.value = false;
  }
};

// Обработчик использования в редакторе
const handleUseInEditor = () => {
  if (!formattedContent.value) {
    return;
  }
  
  // Отправляем событие parsed с флагом useInEditor
  const parsedData = {
    content: formattedContent.value,
    fileId: fileId.value,
    useInEditor: true
  };
  emit('parsed', parsedData);
  
  // Отправляем событие apply с контентом
  emit('apply', formattedContent.value);
  
  // Отправляем события обновления контента
  emit('update:content', formattedContent.value);
  emit('update:modelValue', formattedContent.value);
  emit('input', formattedContent.value);
};

// Функция сброса состояния
const reset = () => {
  searchQuery.value = '';
  parseChannelId.value = '';
  parseStartDate.value = new Date().toISOString().split('T')[0];
  parseMessageCount.value = 20;
  selectedParseChannel.value = null;
  searchResults.value = [];
  showResults.value = false;
  isFilePrepared.value = false;
  emit('reset');
};

// Экспортируем функции
defineExpose({
  reset
});

defineOptions({
  name: 'TelegramParserGlobal'
});
</script> 