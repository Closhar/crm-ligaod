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
import { ref, computed, watch } from 'vue';
import { useGlobalsStore } from '~/stores/globals';
import { storeToRefs } from 'pinia';

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

// Функция конвертации HTML в MarkdownV2 для Telegram
const convertToTelegramText = (html: string): string => {
  let text = html;
  
  // Обрабатываем ссылки
  text = text.replace(/<a\s+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi, '[$2]($1)');
  
  // Обрабатываем жирный текст
  text = text.replace(/<(strong|b)>([^<]+)<\/(strong|b)>/gi, '*$2*');
  
  // Обрабатываем заголовки
  text = text.replace(/<h[1-6]>([^<]+)<\/h[1-6]>/gi, '*$1*');
  
  // Обрабатываем списки
  text = text.replace(/<ul>\s*<li>([^<]+)<\/li>\s*<\/ul>/gi, '• $1');
  text = text.replace(/<li>([^<]+)<\/li>/gi, '• $1');
  
  // Обрабатываем горизонтальные линии
  text = text.replace(/<hr[^>]*>/gi, '\n➖➖➖➖➖➖➖➖➖➖\n');
  
  // Обрабатываем переносы строк
  text = text.replace(/<p[^>]*>([^<]*)<\/p>/gi, '$1\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  
  // Удаляем остальные HTML-теги
  text = text.replace(/<[^>]*>/g, '');
  
  // Декодируем HTML-сущности
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '-')
    .replace(/&ndash;/g, '-')
    .replace(/&hellip;/g, '...');
  
  // Убираем проблемные символы
  text = text
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/[…]/g, '...');
  
  // Заменяем проблемные эмодзи на проверенные
  text = text
    .replace(/\*️⃣/g, '')  // Удаляем эмодзи со звездочкой
    .replace(/📣/g, '📢')
    .replace(/🥇/g, '🏆')
    .replace(/🎊/g, '🎉')
    .replace(/🎵/g, '🎶')
    .replace(/✨/g, '⭐')
    .replace(/🙌/g, '👍');
  
  // Убираем лишние пробелы и переносы
  text = text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ ]{2,}/g, ' ')
    .trim();

  return text;
};

// Функция для предпросмотра текста в формате Telegram
const getTelegramPreview = (html: string): string => {
  const result = convertToTelegramText(html);
  return result;
};

// Показать предпросмотр
const showPreview = () => {
  telegramPreviewContent.value = getTelegramPreview(props.editorContent);
  showPreviewModal.value = true;
};

// Функция отправки в телеграм
const sendToTelegram = async () => {
  if (!selectedChannel.value) return;

  try {
    isSending.value = true;

    // Конвертируем HTML в MarkdownV2
    const fullContent = convertToTelegramText(props.editorContent);
    
    const MAX_MESSAGE_LENGTH_TEXT = 4000; // Уменьшаем максимальную длину для безопасности
    const MAX_MESSAGE_LENGTH_PHOTO = 1000; // Уменьшаем для сообщений с фото

    // Разбиваем контент на части по длине
    const parts = splitHomeAndAwayEvents(props.editorContent, fullContent, MAX_MESSAGE_LENGTH_TEXT);

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
        // Используем MarkdownV2 для форматирования
        let finalContent = partContent;
        let parseMode = 'MarkdownV2';
        
        // Проверяем на критические проблемы с Markdown
        const criticalIssues = partContent.includes('**') && !partContent.includes('**') ||
                              partContent.includes('[') && !partContent.includes(']') ||
                              partContent.includes('(') && !partContent.includes(')');
        
        if (criticalIssues) {
          parseMode = '';
          // Убираем все символы разметки для обычного текста
          finalContent = partContent.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        }

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
                content: finalContent,
                settings: settingsArray,
                image_url: props.selectedImage.url,
                disable_web_page_preview: true,
                parse_mode: parseMode
              })
            });
          } else if (props.selectedImage?.type === 'file') {
            const formData = new FormData();
            formData.append('channel_id', selectedChannel.value);
            formData.append('content', finalContent);
            formData.append('settings', JSON.stringify(settingsArray));
            formData.append('image', props.selectedImage.file!, props.selectedImage.name);
            formData.append('disable_web_page_preview', 'true');
            formData.append('parse_mode', parseMode);

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
              content: finalContent,
              settings: settingsArray,
              disable_web_page_preview: true,
              parse_mode: parseMode
            })
          });
        }

        if (!response || !response.ok) {
          const errorText = response ? await response.text() : 'Нет ответа от сервера';
          
          // Попробуем распарсить JSON для получения детальной информации об ошибке
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.response && errorJson.response.description) {
              throw new Error(`Ошибка Telegram: ${errorJson.response.description}`);
            }
          } catch (parseError) {
            // Если не удалось распарсить JSON, используем обычный текст
          }
          
          throw new Error(`HTTP ошибка при отправке части ${i + 1}: ${response?.status || 'unknown'}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || `Ошибка API при отправке части ${i + 1}`);
        }

        if (parts.length > 1 && i < parts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
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
    alert(`Произошла ошибка при отправке в Telegram: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  } finally {
    isSending.value = false;
  }
};

// Загружаем каналы при монтировании компонента
onMounted(() => {
  fetchChannels();
});

// Функция разбивки сообщений по разделителям
const splitHtmlMessage = (text: string, maxLength: number): string[] => {
  const parts: string[] = [];
  const separator = '➖➖➖➖➖➖➖➖➖➖';
  
  // Если текст короче максимальной длины, возвращаем как есть
  if (text.length <= maxLength) {
    return [text];
  }
  
  // Разбиваем по разделителям
  const sections = text.split(separator);
  let currentPart = '';
  
  for (const section of sections) {
    const sectionWithSeparator = section + (section !== sections[sections.length - 1] ? '\n' + separator + '\n' : '');
    
    // Если добавление секции превысит лимит, сохраняем текущую часть и начинаем новую
    if (currentPart.length + sectionWithSeparator.length > maxLength && currentPart.length > 0) {
      parts.push(currentPart.trim());
      currentPart = sectionWithSeparator;
    } else {
      currentPart += sectionWithSeparator;
    }
  }
  
  // Добавляем последнюю часть, если она не пустая
  if (currentPart.trim()) {
    parts.push(currentPart.trim());
  }
  
  // Если все еще есть части длиннее лимита, разбиваем их принудительно
  const finalParts: string[] = [];
  for (const part of parts) {
    if (part.length <= maxLength) {
      finalParts.push(part);
    } else {
      // Разбиваем по словам
      const words = part.split(' ');
      let currentChunk = '';
      
      for (const word of words) {
        if (currentChunk.length + word.length + 1 <= maxLength) {
          currentChunk += (currentChunk ? ' ' : '') + word;
        } else {
          if (currentChunk) {
            finalParts.push(currentChunk);
            currentChunk = word;
          } else {
            // Если слово само по себе длиннее лимита, разбиваем его
            finalParts.push(word.substring(0, maxLength));
            currentChunk = word.substring(maxLength);
          }
        }
      }
      
      if (currentChunk) {
        finalParts.push(currentChunk);
      }
    }
  }
  
  return finalParts;
};

// Функция разбивки сообщений для отдельной отправки домашних и выездных событий
const splitHomeAndAwayEvents = (htmlContent: string, convertedContent: string, maxLength: number): string[] => {
  const parts: string[] = [];
  
  // Ищем разделитель между домашними и выездными событиями в исходном HTML
  const awayEventsSeparator = '<hr style="border: 2px solid #e5e7eb; margin: 30px 0;">';
  const separatorIndex = htmlContent.indexOf(awayEventsSeparator);
  
  if (separatorIndex === -1) {
    // Если разделителя нет, отправляем как одно сообщение
    return splitHtmlMessage(convertedContent, maxLength);
  }
  
  // Разделяем на домашние и выездные события в исходном HTML
  const homeEventsHtml = htmlContent.substring(0, separatorIndex).trim();
  const awayEventsHtml = htmlContent.substring(separatorIndex + awayEventsSeparator.length).trim();
  
  // Конвертируем каждую часть отдельно
  if (homeEventsHtml) {
    const homeEventsConverted = convertToTelegramText(homeEventsHtml);
    const homeParts = splitHtmlMessage(homeEventsConverted, maxLength);
    parts.push(...homeParts);
  }
  
  if (awayEventsHtml) {
    const awayEventsConverted = convertToTelegramText(awayEventsHtml);
    const awayParts = splitHtmlMessage(awayEventsConverted, maxLength);
    parts.push(...awayParts);
  }
  
  return parts;
};
</script> 