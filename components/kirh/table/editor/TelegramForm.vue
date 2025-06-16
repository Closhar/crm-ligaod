<template>
  <div class="mt-6 border-t pt-4">
    <h3 class="text-md font-medium mb-4">Отправка в Telegram</h3>
    
    <!-- Выбор канала/группы -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Выберите канал или группу
      </label>
      <select 
        v-model="selectedChannel"
        class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Выберите...</option>
        <option v-for="channel in telegramChannels" 
                :key="channel.id" 
                :value="channel.id">
          {{ channel.title }}
        </option>
      </select>
    </div>

    <!-- Настройки публикации -->
    <div class="mb-4">
      <label class="flex items-center">
        <input 
          type="checkbox" 
          v-model="publishSettings.pinMessage"
          class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        >
        <span class="ml-2 text-sm text-gray-600">Закрепить сообщение</span>
      </label>
    </div>

    <!-- Кнопка предпросмотра -->
    <button 
      @click="showPreview"
      :disabled="!selectedChannel"
      class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Предпросмотр и отправка
    </button>
  </div>

  <!-- Модальное окно предпросмотра -->
  <div v-if="showPreviewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
      <!-- Заголовок -->
      <div class="p-4 border-b flex justify-between items-center flex-shrink-0">
        <h3 class="text-lg font-semibold">Предпросмотр сообщения</h3>
        <button @click="showPreviewModal = false" class="text-gray-500 hover:text-gray-700">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Контент предпросмотра -->
      <div class="p-4 overflow-y-auto flex-grow">
        <div class="bg-[#17212B] rounded-lg p-4 text-white">
          <!-- Информация о канале -->
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <svg class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              </svg>
            </div>
            <div class="ml-3">
              <div class="font-medium">{{ selectedChannelTitle }}</div>
              <div class="text-sm text-gray-400">Канал</div>
            </div>
          </div>

          <!-- Изображение -->
          <div v-if="selectedImagePreview" class="mb-4">
            <img :src="selectedImagePreview" class="w-full rounded-lg" />
          </div>

          <!-- Текст сообщения -->
          <div class="whitespace-pre-wrap">{{ telegramPreviewContent }}</div>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="p-4 border-t flex justify-end space-x-3 flex-shrink-0">
        <button
          @click="showPreviewModal = false"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Отмена
        </button>
        <button
          @click="sendToTelegram"
          :disabled="isSending"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <span v-if="isSending" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Отправка...
          </span>
          <span v-else>Отправить</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

const config = useRuntimeConfig();
const api = config.public.API_URL;

// Интерфейс для канала/группы телеграм
interface TelegramChannel {
  id: number;
  title: string;
  type: 'channel' | 'group';
  username: string | null;
  description: string | null;
  is_active: boolean;
  chat_id: string;
}

// Props
const props = defineProps<{
  editorContent: string;
  selectedImage: {
    type: 'url' | 'file';
    url?: string;
    file?: File;
    name: string;
  } | null;
  selectedImagePreview: string;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:editorContent', value: string): void;
  (e: 'update:selectedImage', value: null): void;
  (e: 'update:selectedImagePreview', value: string): void;
}>();

// Состояние для отправки в телеграм
const selectedChannel = ref('');
const isSending = ref(false);
const publishSettings = ref({
  pinMessage: false
});

// Список каналов/групп
const telegramChannels = ref<TelegramChannel[]>([]);

// Загрузка списка каналов
const fetchChannels = async () => {
  try {
    const response = await fetch(`${api}/api/telegram/channels`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    telegramChannels.value = Array.isArray(result.data) ? result.data : [];
    
    // Устанавливаем первый канал по умолчанию, если есть каналы
    if (telegramChannels.value.length > 0) {
      selectedChannel.value = telegramChannels.value[0].id.toString();
    }
  } catch (error) {
    console.error('Ошибка при загрузке каналов:', error);
    telegramChannels.value = [];
  }
};

// Получаем название выбранного канала
const selectedChannelTitle = computed(() => {
  const channel = telegramChannels.value.find(c => c.id === Number(selectedChannel.value));
  return channel ? channel.title : '';
});

// Состояние для модального окна
const showPreviewModal = ref(false);
const telegramPreviewContent = ref('');

// Функция форматирования HTML в Markdown для телеграм
const formatForTelegram = (html: string): string => {
  // Заменяем HTML-теги на Markdown
  let markdown = html
    // Заголовки
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '*$1*\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '*$1*\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '*$1*\n\n')
    // Жирный текст
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '*$1*')
    // Курсив
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '_$1_')
    // Ссылки
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // Параграфы
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    // Переносы строк
    .replace(/<br\s*\/?>/gi, '\n')
    // Удаляем оставшиеся HTML-теги
    .replace(/<[^>]*>/g, '')
    // Декодируем HTML-сущности
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Убираем лишние переносы строк, но сохраняем разделители
  markdown = markdown
    .replace(/\n{3,}/g, '\n\n')  // Заменяем 3 и более переноса на 2
    .replace(/([^\n])\n➖➖➖➖➖➖➖➖➖➖/g, '$1\n\n➖➖➖➖➖➖➖➖➖➖')  // Добавляем перенос перед разделителем
    .replace(/➖➖➖➖➖➖➖➖➖➖\n([^\n])/g, '➖➖➖➖➖➖➖➖➖➖\n\n$1')  // Добавляем перенос после разделителя
    .trim();

  return markdown;
};

// Показать предпросмотр
const showPreview = () => {
  telegramPreviewContent.value = formatForTelegram(props.editorContent);
  showPreviewModal.value = true;
};

// Функция отправки в телеграм
const sendToTelegram = async () => {
  if (!selectedChannel.value) return;

  try {
    isSending.value = true;

    const fullContent = formatForTelegram(props.editorContent);
    const MAX_MESSAGE_LENGTH_TEXT = 4000;
    const MAX_MESSAGE_LENGTH_PHOTO = 1024;
    const eventSeparator = '➖➖➖➖➖➖➖➖➖➖\n\n';

    // Разбиваем контент на домашние и выездные события
    const [homeContent, awayContent] = fullContent.split('*НАШИ НА ВЫЕЗДЕ').map((part, index) => 
      index === 0 ? part : '*НАШИ НА ВЫЕЗДЕ' + part
    );

    const parts: string[] = [];
    let isFirstPart = true;

    // Обрабатываем домашние события
    if (homeContent) {
      const events = homeContent.split(eventSeparator).filter(event => event.trim().length > 0);
      let currentPart = '';
      const currentLimit = isFirstPart && props.selectedImage !== null ? MAX_MESSAGE_LENGTH_PHOTO : MAX_MESSAGE_LENGTH_TEXT;

      for (const event of events) {
        const eventWithSeparator = event + (event !== events[events.length - 1] ? eventSeparator : '');
        if ((currentPart + eventWithSeparator).length <= currentLimit) {
          currentPart += eventWithSeparator;
        } else {
          if (currentPart) {
            parts.push(currentPart);
            isFirstPart = false;
          }
          currentPart = eventWithSeparator;
        }
      }
      if (currentPart) {
        parts.push(currentPart);
        isFirstPart = false;
      }
    }

    // Обрабатываем выездные события
    if (awayContent) {
      const events = awayContent.split(eventSeparator).filter(event => event.trim().length > 0);
      let currentPart = '';
      const currentLimit = isFirstPart && props.selectedImage !== null ? MAX_MESSAGE_LENGTH_PHOTO : MAX_MESSAGE_LENGTH_TEXT;

      for (const event of events) {
        const eventWithSeparator = event + (event !== events[events.length - 1] ? eventSeparator : '');
        if ((currentPart + eventWithSeparator).length <= currentLimit) {
          currentPart += eventWithSeparator;
        } else {
          if (currentPart) {
            parts.push(currentPart);
            isFirstPart = false;
          }
          currentPart = eventWithSeparator;
        }
      }
      if (currentPart) {
        parts.push(currentPart);
      }
    }

    // Если нет частей, но есть контент, добавляем его как одну часть
    if (parts.length === 0 && fullContent.length > 0) {
      parts.push(fullContent);
    }

    // Если контент пустой, добавляем пустую часть
    if (parts.length === 0) {
      parts.push('');
    }

    // Отправляем каждую часть как отдельное сообщение
    for (let i = 0; i < parts.length; i++) {
      const partContent = parts[i];
      const sendImageWithThisPart = (i === 0 && props.selectedImage !== null);

      const settingsArray = Object.values(publishSettings.value);

      try {
        console.log(`Отправка части ${i + 1} (длина: ${partContent.length})${sendImageWithThisPart ? ' с изображением' : ''}...`);
        console.log(`Содержимое части ${i + 1} (первые 200 символов):`, partContent.substring(0, 200) + (partContent.length > 200 ? '...' : ''));

        let response;
        if (sendImageWithThisPart) {
          if (props.selectedImage?.type === 'url') {
            response = await fetch(`${api}/api/telegram/send`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
              },
              body: JSON.stringify({
                channel_id: selectedChannel.value,
                content: partContent,
                settings: settingsArray,
                image_url: props.selectedImage.url,
                disable_web_page_preview: true
              })
            });
          } else if (props.selectedImage?.type === 'file') {
            const formData = new FormData();
            formData.append('channel_id', selectedChannel.value);
            formData.append('content', partContent);
            formData.append('settings', JSON.stringify(settingsArray));
            formData.append('image', props.selectedImage.file!, props.selectedImage.name);
            formData.append('disable_web_page_preview', 'true');

            response = await fetch(`${api}/api/telegram/send`, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
              },
              body: formData
            });
          } else {
            throw new Error('Неизвестный тип изображения при отправке части с изображением');
          }
        } else {
          response = await fetch(`${api}/api/telegram/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
              channel_id: selectedChannel.value,
              content: partContent,
              settings: settingsArray,
              disable_web_page_preview: true
            })
          });
        }

        if (!response || !response.ok) {
          const errorText = response ? await response.text() : 'Нет ответа от сервера';
          console.error(`Полный ответ сервера при HTTP ошибке ${response?.status || 'unknown'}:`, errorText);
          throw new Error(`HTTP ошибка при отправке части ${i + 1}: ${response?.status || 'unknown'}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          console.error(`Полный ответ API при ошибке success:false для части ${i + 1}:`, result);
          throw new Error(result.message || `Ошибка API при отправке части ${i + 1}`);
        }
        console.log(`Часть ${i + 1} успешно отправлена.`);

        if (parts.length > 1 && i < parts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Ошибка при отправке части ${i + 1}:`, error);
        alert(`Не удалось отправить часть ${i + 1} сообщения. Проверьте консоль для деталей.`);
        throw error;
      }
    }

    showPreviewModal.value = false;
    alert(`Статья успешно отправлена в Telegram (${parts.length} части(ей)).`);

    emit('update:editorContent', '');
    emit('update:selectedImage', null);
    emit('update:selectedImagePreview', '');
    selectedChannel.value = telegramChannels.value[0]?.id.toString() || '';
    
  } catch (error) {
    console.error('Ошибка при отправке в Telegram:', error);
    alert(`Произошла ошибка при отправке в Telegram: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  } finally {
    isSending.value = false;
  }
};

// Загружаем каналы при монтировании компонента
onMounted(() => {
  fetchChannels();
});
</script> 