<template>
  <header class="bg-gray-50shadow-sm border-b border-gray-300">
    <div class="px-6 pt-4">
      <div class="flex items-start justify-between">
        <Head :breadcrumbs="breadcrumbs || []" :icon="p_icon || null" :title="p_description || null" :show_breadcrumbs="'true'"/>
      </div>
    </div>
  </header>

  <div v-if="isAuthenticated" class="p-6">
    <div class="grid grid-cols-2 gap-6">
      <!-- Левая часть - таблица статей -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-4">
          <h2 class="text-lg font-semibold mb-4">Список статей</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Заголовок</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="article in articles" :key="article.id" 
                    @click="selectArticle(article)"
                    class="hover:bg-gray-50 cursor-pointer">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(article.data) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    {{ article.title }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Пагинация -->
          <div class="mt-4 flex justify-between items-center">
            <button 
              @click="prevPage" 
              :disabled="currentPage === 1"
              class="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Назад
            </button>
            <span class="text-sm text-gray-600">Страница {{ currentPage }}</span>
            <button 
              @click="nextPage" 
              :disabled="!hasNextPage"
              class="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Вперед
            </button>
          </div>
        </div>
      </div>

      <!-- Правая часть - редактор -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-4">
          <h2 class="text-lg font-semibold mb-4">Редактор</h2>
          
          <!-- Блок с шаблонами -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Шаблоны
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                @click="loadTodayEvents"
                :disabled="isLoadingEvents"
                class="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <span v-if="isLoadingEvents" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Загрузка...
                </span>
                <span v-else>События сегодня</span>
              </button>
              <button
                @click="showDatePicker = true"
                :disabled="isLoadingEvents"
                class="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <span v-if="isLoadingEvents" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Загрузка...
                </span>
                <span v-else>События отчет</span>
              </button>
              <button
                @click="showAIModal = true"
                :disabled="isGenerating"
                class="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <span v-if="isGenerating" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Генерация...
                </span>
                <span v-else>AI Генерация</span>
              </button>
            </div>
          </div>
          
          <RichTextEditor
            v-model="editorContent"
            :placeholder="'Выберите статью для редактирования...'"
            @update:modelValue="handleEditorUpdate"
          />
          
          <!-- Поле для хэштегов -->
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Хэштеги
            </label>
            <input
              type="text"
              v-model="hashtags"
              class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Введите хэштеги через пробел"
            />
          </div>
          
          <!-- Загрузка изображения -->
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Изображение для поста
            </label>
            <div class="flex items-center space-x-4">
              <input
                type="file"
                ref="imageInput"
                accept="image/*"
                @change="handleImageUpload"
                class="hidden"
              />
              <button
                @click="() => imageInput?.click()"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Выбрать изображение
              </button>
              <button
                v-if="selectedArticle?.article_image_path"
                @click="loadArticleImage"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Загрузить из статьи
              </button>
              <div v-if="selectedImage" class="flex items-center space-x-2">
                <img :src="selectedImagePreview || ''" class="h-10 w-10 object-cover rounded" />
                <button
                  @click="removeImage"
                  class="text-red-600 hover:text-red-800"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Форма отправки в телеграм -->
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
        </div>
      </div>
    </div>
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

  <!-- Модальное окно выбора даты -->
  <div v-if="showDatePicker" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg w-full max-w-md mx-4">
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold">Выберите дату</h3>
      </div>
      <div class="p-4">
        <input
          type="date"
          v-model="selectedDate"
          class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div class="p-4 border-t flex justify-end space-x-3">
        <button
          @click="showDatePicker = false"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Отмена
        </button>
        <button
          @click="loadEventsByDate"
          :disabled="isLoadingEvents"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Загрузить
        </button>
      </div>
    </div>
  </div>

  <!-- Модальное окно AI генерации -->
  <div v-if="showAIModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg w-full max-w-2xl mx-4">
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold">AI Генерация контента</h3>
      </div>
      <div class="p-4">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Запрос для генерации
            <span class="text-sm text-gray-500 ml-2">
              {{ aiPrompt.length }}/1000 символов
            </span>
          </label>
          <textarea
            v-model="aiPrompt"
            rows="4"
            class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            :class="{'border-red-500': aiPrompt.length > 1000}"
            placeholder="Опишите, какой контент нужно сгенерировать..."
          ></textarea>
          <p v-if="aiPrompt.length > 1000" class="mt-1 text-sm text-red-600">
            Превышен лимит символов. Текст будет автоматически разбит на части при генерации.
          </p>
        </div>
        <!-- Добавляем кнопку и выбор даты -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Быстрые шаблоны
          </label>
          <div class="flex items-center space-x-4">
            <input
              type="date"
              v-model="aiSelectedDate"
              class="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              @click="prepareDayReport"
              :disabled="isGenerating || !aiSelectedDate"
              class="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <span v-if="isGenerating" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Загрузка...
              </span>
              <span v-else>Текст по итогам дня</span>
            </button>
          </div>
        </div>
      </div>
      <div class="p-4 border-t flex justify-end space-x-3">
        <button
          @click="showAIModal = false"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Отмена
        </button>
        <button
          @click="generateContent"
          :disabled="isGenerating || !aiPrompt.trim()"
          class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <span v-if="isGenerating" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Генерация...
          </span>
          <span v-else>Сгенерировать</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, onMounted, watch, nextTick, computed} from 'vue';
import {useAuth} from '~/composables/useAuth';
import {useGlobalsStore} from '~/stores/globals';
import {storeToRefs} from 'pinia';
import Head from "~/components/parts/Head.vue"
import RichTextEditor from "~/components/kirh/table/editor/RichTextEditor.vue"

// Добавляем интерфейс для статьи
interface Article {
  id: number;
  title: string;
  description: string;
  content: string;
  data: string;
  article_image_path: string;
}

// Добавляем типы для изображения
type ImageUrl = {
  type: 'url';
  url: string;
  name: string;
};

type ImageFile = {
  type: 'file';
  file: File;
  name: string;
};

type ImageData = ImageUrl | ImageFile;

const globalsStore = useGlobalsStore();
const {params, images} = storeToRefs(globalsStore);

const region_title = "Санкт-Петербург и Ленинградская область"
const hashtags = ref("#спорт #события #СанктПетербург #sportrep")

// Загружаем данные на сервере при каждой загрузке страницы
const {data} = await useAsyncData('globals', async () => {
  await globalsStore.fetchData();
  return {params: globalsStore.params, images: globalsStore.images};
});

const config = useRuntimeConfig();
const api = config.public.API_URL;
const site = config.public.SITE_URL;

useSeoMeta({
  title: ((params.value as any).adminka_name || 'Админка') + ' - Телеграм',
  description: 'Работа с телеграм',
});

const p_icon = "stash:telegram";
const p_description = 'Работа с телеграм';
const breadcrumbs: Array<{id: number, title: string, icon: string, slug: string}> = [];

const {isAuthenticated, user, logout, checkAuth} = useAuth();

// Состояние для статей и пагинации
const articles = ref<Article[]>([]);
const currentPage = ref(1);
const perPage = ref(30);
const hasNextPage = ref(false);
const editorContent = ref('');

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

// Функция загрузки статей
const fetchArticles = async () => {
  try {
    const response = await fetch(`${api}/api/articles?page=${currentPage.value}&per_page=${perPage.value}&sort_field=data&sort_direction=desc`);
    const data = await response.json();
    articles.value = data.data;
    hasNextPage.value = data.next_page_url !== null;
  } catch (error) {
    console.error('Ошибка при загрузке статей:', error);
  }
};

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

// Состояние для изображения
const selectedImage = ref<ImageData | null>(null);
const selectedImagePreview = ref<string>('');
const imageInput = ref<HTMLInputElement | null>(null);
const selectedArticle = ref<Article | null>(null);

// Функция выбора статьи
const selectArticle = (article: Article) => {
  selectedArticle.value = article;
  // Формируем HTML-контент для редактора
  const htmlContent = `
    <h1>${article.title || ''}</h1>
    <div class="mb-4">
      <p class="text-gray-600">${article.description || ''}</p>
    </div>
    ${article.content || ''}
  `;
  
  // Устанавливаем контент в редактор
  editorContent.value = htmlContent;
};

// Функция загрузки изображения из статьи
const loadArticleImage = async () => {
  if (!selectedArticle.value?.article_image_path) {
    alert('У выбранной статьи нет изображения');
    return;
  }

  try {
    const imageUrl = selectedArticle.value.article_image_path.replace(/^@/, '');
    console.log('Загрузка изображения по URL:', imageUrl);
    
    // Устанавливаем URL изображения для превью
    selectedImagePreview.value = imageUrl;
    
    // Создаем объект с URL изображения
    selectedImage.value = {
      type: 'url',
      url: imageUrl,
      name: imageUrl.split('/').pop() || 'article-image.jpg'
    };
    
    console.log('Изображение успешно добавлено');
  } catch (error) {
    console.error('Ошибка при добавлении изображения:', error);
    alert(`Не удалось добавить изображение: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  }
};

// Функции пагинации
const nextPage = () => {
  if (hasNextPage.value) {
    currentPage.value++;
    fetchArticles();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchArticles();
  }
};

// Форматирование даты
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Обработчик обновления редактора
const handleEditorUpdate = (newContent: string) => {
  editorContent.value = newContent;
};

// Функция получения отформатированного контента для телеграм
const getTelegramContent = (): string => {
  return formatForTelegram(editorContent.value);
};

// Состояние для модального окна
const showPreviewModal = ref(false);
const telegramPreviewContent = ref('');

// Получаем название выбранного канала
const selectedChannelTitle = computed(() => {
  const channel = telegramChannels.value.find(c => c.id === Number(selectedChannel.value));
  return channel ? channel.title : '';
});

// Обработчик загрузки изображения
const handleImageUpload = (event: any) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    selectedImage.value = {
      type: 'file',
      file: file,
      name: file.name
    };
    const reader = new FileReader();
    reader.onload = (e) => {
      selectedImagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

// Удаление изображения
const removeImage = () => {
  selectedImage.value = null;
  selectedImagePreview.value = '';
  if (imageInput.value) {
    imageInput.value.value = '';
  }
};

// Показать предпросмотр
const showPreview = () => {
  telegramPreviewContent.value = getTelegramContent();
  showPreviewModal.value = true;
};

// Обновляем функцию отправки в телеграм
const sendToTelegram = async () => {
  if (!selectedChannel.value) return;

  try {
    isSending.value = true;

    const fullContent = getTelegramContent();
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
      const currentLimit = isFirstPart && selectedImage.value !== null ? MAX_MESSAGE_LENGTH_PHOTO : MAX_MESSAGE_LENGTH_TEXT;

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
      const currentLimit = isFirstPart && selectedImage.value !== null ? MAX_MESSAGE_LENGTH_PHOTO : MAX_MESSAGE_LENGTH_TEXT;

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
      const sendImageWithThisPart = (i === 0 && selectedImage.value !== null);

      const settingsArray = Object.values(publishSettings.value);

      try {
        console.log(`Отправка части ${i + 1} (длина: ${partContent.length})${sendImageWithThisPart ? ' с изображением' : ''}...`);
        console.log(`Содержимое части ${i + 1} (первые 200 символов):`, partContent.substring(0, 200) + (partContent.length > 200 ? '...' : ''));

        let response;
        if (sendImageWithThisPart) {
          if (selectedImage.value?.type === 'url') {
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
                image_url: selectedImage.value.url,
                disable_web_page_preview: true
              })
            });
          } else if (selectedImage.value?.type === 'file') {
            const formData = new FormData();
            formData.append('channel_id', selectedChannel.value);
            formData.append('content', partContent);
            formData.append('settings', JSON.stringify(settingsArray));
            formData.append('image', selectedImage.value.file, selectedImage.value.name);
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

    editorContent.value = '';
    selectedImage.value = null;
    selectedImagePreview.value = '';
    selectedChannel.value = telegramChannels.value[0]?.id.toString() || '';
    
  } catch (error) {
    console.error('Ошибка при отправке в Telegram:', error);
    alert(`Произошла ошибка при отправке в Telegram: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  } finally {
    isSending.value = false;
  }
};

// Загружаем статьи и каналы при монтировании компонента
onMounted(() => {
  fetchArticles();
  fetchChannels();
});

// Добавляем интерфейсы для событий
interface Stream {
  id: number;
  title: string;
  link: string;
  in_player: number;
  in_profile: number;
}

interface City {
  id: number;
  title: string;
}

interface Arena {
  id: number;
  title: string;
  address: string;
  city: City;
  phones: string;
  map?: string;
}

interface Sport {
  id: number;
  title: string;
  title_short: string;
  icon: string;
  event_name: string;
}

interface Gender {
  id: number;
  title: string;
  title_short: string;
  icon: string;
}

interface Competition {
  id: number;
  title: string;
  title_short: string;
  sport: Sport;
  gender: Gender;
}

interface Event {
  id: number;
  title: string;
  date_from: string;
  time: string;
  about: string;
  event_name: string;
  event_name_top?: string;
  competition: Competition;
  arena: Arena | null;
  streams: Stream[];
  tickets?: string;
  free_tickets?: boolean;
  club1?: string;
  club2?: string;
  series_count?: number;
  series?: {
    description: string;
  };
  report?: string;
}

interface EventsResponse {
  current_page: number;
  data: Event[];
}

// Функция форматирования даты
const formatDateForTemplate = (date: Date): string => {
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Функция форматирования даты события
const formatEventDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Функция форматирования телефона
const formatPhone = (phone: string): string => {
  // Убираем все кроме цифр
  const numbers = phone.replace(/\D/g, '');
  // Проверяем, что это российский номер
  if (numbers.length === 11 && numbers.startsWith('7')) {
    return `+7(${numbers.slice(1, 4)})${numbers.slice(4, 7)}-${numbers.slice(7, 9)}-${numbers.slice(9)}`;
  }
  return phone;
};

// Добавляем состояние загрузки
const isLoadingEvents = ref(false);

// Добавляем новые состояния
const showDatePicker = ref(false);
const selectedDate = ref('');

// Функция загрузки событий на сегодня
const loadTodayEvents = async () => {
  try {
    isLoadingEvents.value = true;
    const response = await fetch('https://p.sportrep.ru/api/events?page=1&per_page=15&sort_field=date_from&sort_direction=asc&show=3');
    if (!response.ok) {
      throw new Error('Ошибка при загрузке событий');
    }

    const data: EventsResponse = await response.json();

    // Разделяем события на домашние и выездные
    const homeEvents = data.data.filter(event => event.arena !== null);
    const awayEvents = data.data.filter(event => event.arena === null);

    // Формируем шаблон для домашних событий
    const today = new Date();
    let finalTemplate = '';

    // Добавляем домашние события только если они есть
    if (homeEvents.length > 0) {
      let homeTemplate = `*${region_title}\nСПОРТИВНЫЕ СОБЫТИЯ ${formatDateForTemplate(today)}*\n\n`;
      homeEvents.forEach((event, index) => {
        if (index > 0) {
          homeTemplate += '➖➖➖➖➖➖➖➖➖➖\n\n';
        }
        if (event.club1 && event.club2) {
          homeTemplate += `*${event.competition.title_short}*\n`;
          homeTemplate += `*${event.event_name_top}*\n`;
          if (event.title && event.title !== event.competition.title_short) {
            homeTemplate += `*${event.title}*\n\n`;
          } else {
            homeTemplate += '\n';
          }
        } else {
          homeTemplate += `*${event.event_name}*\n\n`;
        }
        if (event.arena) {
          homeTemplate += `📍 ${event.arena.title}\n`;
          if (event.arena.map) {
            const mapUrl = event.arena.map.match(/src="([^"]+)"/)?.[1];
            if (mapUrl) {
              homeTemplate += `🗺 [Открыть на карте](${mapUrl})\n`;
            }
          }
          let address = event.arena.address.replace(/<br\s*\/?>/g, '').trimEnd();
          homeTemplate += `🏟 ${address}`;
          if (event.arena.phones) {
            const phones = event.arena.phones.split(',')
              .map((phone: string) => phone.split('|')[0].trim())
              .map(formatPhone)
              .join(', ');
            homeTemplate += `\n📞 ${phones}`;
          }
          homeTemplate += '\n\n';
          
          // Добавляем информацию о билетах только для домашних матчей
          if (event.free_tickets) {
            homeTemplate += `🆓 Вход свободный\n\n`;
          } else if (event.tickets) {
            const cleanTickets = event.tickets
              .replace(/<[^>]*>/g, '')
              .replace(/\n\s*\n/g, '\n')
              .trim();
            homeTemplate += `💳 ${cleanTickets}\n\n`;
          }
        }
        
        homeTemplate += `📅 ${formatEventDate(event.date_from)}\n⏰ Время начала: *${event.time}*\n\n`;
        if (event.about) {
          const cleanAbout = formatForTelegram(event.about)
            .split('\n')
            .filter(line => line.trim().length > 0)
            .join('\n');
          homeTemplate += `${cleanAbout}\n\n`;
        }
        if (event.series_count) {
          homeTemplate += `Счет в серии: ${event.series_count}\n`;
          if (event.series?.description) {
            homeTemplate += `${event.series.description}\n\n`;
          }
        }
        if (event.streams && event.streams.length > 0) {
          const filteredStreams = event.streams.filter(stream => stream.in_player === 0 && stream.in_profile === 0);
          if (filteredStreams.length > 0) {
            homeTemplate += '*📺 Трансляции события:*\n';
            filteredStreams.forEach(stream => {
              homeTemplate += `• [${stream.title}](${stream.link})\n`;
            });
            homeTemplate += '\n';
          } else {
            homeTemplate += '*📺 Ссылок на трансляцию пока нет*\n\n';
          }
        } else {
          homeTemplate += '*📺 Ссылок на трансляцию пока нет*\n\n';
        }
        homeTemplate += `🔗 [Подробнее](${`${site}/events/${event.id}`})\n`;
      });
      homeTemplate += '\n' + hashtags.value;
      finalTemplate += homeTemplate;
    }

    // Добавляем выездные события только если они есть
    if (awayEvents.length > 0) {
      let awayTemplate = '';
      // Добавляем разделитель только если есть домашние события
      if (homeEvents.length > 0) {
        awayTemplate = '\n\n';
      }
      awayTemplate += `*НАШИ НА ВЫЕЗДЕ ${formatDateForTemplate(today)}*\n\n`;
      awayEvents.forEach((event, index) => {
        if (index > 0) {
          awayTemplate += '\n\n➖➖➖➖➖➖➖➖➖➖\n\n';
        }
        if (event.club1 && event.club2) {
          awayTemplate += `*${event.competition.title_short}*\n`;
          awayTemplate += `*${event.event_name_top}*\n`;
          if (event.title && event.title !== event.competition.title_short) {
            awayTemplate += `*${event.title}*\n\n`;
          } else {
            awayTemplate += '\n';
          }
        } else {
          awayTemplate += `*${event.event_name}*\n`;
        }
        awayTemplate += `\n\n📅 ${formatEventDate(event.date_from)}\n⏰ Время начала: *${event.time}*\n\n`;
        if (event.about) {
          const cleanAbout = formatForTelegram(event.about)
            .split('\n')
            .filter(line => line.trim().length > 0)
            .join('\n');
          awayTemplate += `${cleanAbout}\n\n`;
        }
        if (event.series_count) {
          awayTemplate += `Счет в серии: ${event.series_count}\n`;
          if (event.series?.description) {
            awayTemplate += `${event.series.description}\n\n`;
          }
        }
        if (event.streams && event.streams.length > 0) {
          const filteredStreams = event.streams.filter(stream => stream.in_player === 0 && stream.in_profile === 0);
          if (filteredStreams.length > 0) {
            awayTemplate += '*📺 Трансляции события:*\n';
            filteredStreams.forEach(stream => {
              awayTemplate += `• [${stream.title}](${stream.link})\n`;
            });
            awayTemplate += '\n';
          } else {
            awayTemplate += '*📺 Ссылок на трансляцию пока нет*\n\n';
          }
        } else {
          awayTemplate += '*📺 Ссылок на трансляцию пока нет*\n\n';
        }
        awayTemplate += `🔗 [Подробнее](${`${site}/events/${event.id}`})\n`;
      });
      awayTemplate += '\n' + hashtags.value;
      finalTemplate += awayTemplate;
    }

    // Вставляем шаблоны в редактор
    editorContent.value = finalTemplate;

  } catch (error) {
    console.error('Ошибка при загрузке событий:', error);
    alert('Не удалось загрузить события');
  } finally {
    isLoadingEvents.value = false;
  }
};

// Функция загрузки событий по дате
const loadEventsByDate = async () => {
  if (!selectedDate.value) return;
  
  try {
    isLoadingEvents.value = true;
    const response = await fetch(`https://p.sportrep.ru/api/events?per_page=100&is_active=1&region_id=1&show_native=1&sort=date_from_asc&date_from=${selectedDate.value}`);
    if (!response.ok) {
      throw new Error('Ошибка при загрузке событий');
    }

    const data: EventsResponse = await response.json();

    // Объединяем все события в один массив
    const allEvents = data.data;
    
    if (allEvents.length === 0) {
      alert('Нет событий за выбранную дату');
      return;
    }

    // Формируем шаблон для всех событий
    let template = `*${region_title}\nИтоги дня ${formatDateForTemplate(new Date(selectedDate.value))}*\n\n`;
    
    allEvents.forEach((event, index) => {
      if (index > 0) {
        template += '➖➖➖➖➖➖➖➖➖➖\n\n';
      }
      if (event.club1 && event.club2) {
        template += `*${event.competition.title_short}*\n`;
        template += `*${event.event_name}*\n\n`;
      } else {
        template += `*${event.event_name}*\n\n`;
      }
      if (event.arena) {
        template += `📍 ${event.arena.title}\n\n`;
      }
      if (event.tickets) {
        const cleanTickets = event.tickets
          .replace(/<[^>]*>/g, '')
          .replace(/\n\s*\n/g, '\n')
          .trim();
        template += `🎫 ${cleanTickets}\n\n`;
      }
      if (event.series_count) {
        template += `Счет в серии: ${event.series_count}\n`;
        if (event.series?.description) {
          template += `${event.series.description}\n\n`;
        }
      }
      if (event.report) {
        const formattedReport = formatForTelegram(event.report)
          .split('\n')
          .filter(line => line.trim().length > 0)
          .join('\n');
        template += `📝 ${formattedReport}\n\n`;
      }
      if (event.streams && event.streams.length > 0) {
        const filteredStreams = event.streams.filter(stream => stream.in_player === 1);
        if (filteredStreams.length > 0) {
          template += '*📺 Видео:*\n';
          filteredStreams.forEach(stream => {
            template += `• [${stream.title}](${stream.link})\n`;
          });
          template += '\n';
        }
      }
      template += `🔗 [Подробнее](${`${site}/events/${event.id}`})\n`;
    });
    template += '\n' + hashtags.value;

    // Вставляем шаблон в редактор
    editorContent.value = template;
    showDatePicker.value = false;

  } catch (error) {
    console.error('Ошибка при загрузке событий:', error);
    alert('Не удалось загрузить события');
  } finally {
    isLoadingEvents.value = false;
  }
};

// Добавляем новые состояния
const showAIModal = ref(false);
const aiPrompt = ref('');
const isGenerating = ref(false);
const aiSelectedDate = ref('');
const promptFile = ref<File | null>(null);

// Функция для создания текстового файла
const createPromptFile = (content: string): File => {
  const blob = new Blob([content], { type: 'text/plain' });
  return new File([blob], 'prompt.txt', { type: 'text/plain' });
};

// Модифицируем функцию подготовки отчета
const prepareDayReport = async () => {
  if (!aiSelectedDate.value) {
    alert('Пожалуйста, выберите дату');
    return;
  }
  
  try {
    isGenerating.value = true;
    const response = await fetch(`https://p.sportrep.ru/api/events?per_page=100&is_active=1&region_id=1&show_native=1&sort=date_from_asc&date_from=${aiSelectedDate.value}`);
    if (!response.ok) {
      throw new Error('Ошибка при загрузке событий');
    }

    const data: EventsResponse = await response.json();
    const allEvents = data.data;

    if (allEvents.length === 0) {
      alert('Нет событий за выбранную дату');
      return;
    }

    // Формируем текст для файла
    let fileContent = '';
    allEvents.forEach((event) => {
      if (event.club1 && event.club2) {
        fileContent += `${event.competition.title_short}\n`;
        fileContent += `${event.event_name}\n`;
      } else {
        fileContent += `${event.event_name}\n`;
      }
      if (event.arena) {
        fileContent += `${event.arena.title}\n`;
      }
      if (event.tickets) {
        const cleanTickets = event.tickets
          .replace(/<[^>]*>/g, '')
          .replace(/\n\s*\n/g, '\n')
          .trim();
        fileContent += `${cleanTickets}\n`;
      }
      if (event.series_count) {
        fileContent += `Счет в серии: ${event.series_count}\n`;
        if (event.series?.description) {
          fileContent += `${event.series.description}\n`;
        }
      }
      if (event.report) {
        const formattedReport = formatForTelegram(event.report)
          .split('\n')
          .filter(line => line.trim().length > 0)
          .join('\n');
        fileContent += `${formattedReport}\n`;
      }
      fileContent += '\n';
    });

    // Создаем файл с информацией о событиях
    promptFile.value = createPromptFile(fileContent);
    
    // Устанавливаем фиксированный промт
    aiPrompt.value = "Напиши статью в ироничном, но профессиональном стиле для интернет-портала о спортивных событиях Санкт-Петербурга, кратко описывающую события отчетного дня на основе информации в приложенном файле";

  } catch (error) {
    console.error('Ошибка при формировании отчета:', error);
    alert(`Произошла ошибка при формировании отчета: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    promptFile.value = null;
    aiPrompt.value = '';
  } finally {
    isGenerating.value = false;
  }
};

// Модифицируем функцию генерации контента
const generateContent = async () => {
  if (!aiPrompt.value.trim()) {
    alert('Пожалуйста, введите запрос для генерации');
    return;
  }

  try {
    isGenerating.value = true;

    let fileId = null;

    // Если есть файл, загружаем его
    if (promptFile.value) {
      const fileFormData = new FormData();
      fileFormData.append('file', promptFile.value);

      const fileResponse = await fetch(`${api}/api/ai/upload-file`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: fileFormData
      });

      const fileResult = await fileResponse.json();

      if (!fileResponse.ok) {
        throw new Error(fileResult.message || `HTTP error! status: ${fileResponse.status}`);
      }
      
      if (!fileResult.success) {
        throw new Error(fileResult.message || 'Ошибка при загрузке файла');
      }

      fileId = fileResult.data.file_id;
    }

    // Формируем тело запроса
    const requestBody: any = {
      prompt: aiPrompt.value
    };

    // Добавляем file_id только если он есть
    if (fileId) {
      requestBody.file_id = fileId;
    }

    // Отправляем запрос на генерацию
    const response = await fetch(`${api}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }
    
    if (!result.success) {
      throw new Error(result.message || 'Ошибка при генерации контента');
    }

    editorContent.value = result.data;
    
    // Закрываем модальное окно и очищаем состояние
    showAIModal.value = false;
    aiPrompt.value = '';
    promptFile.value = null;
    aiSelectedDate.value = '';

  } catch (error) {
    console.error('Ошибка при генерации контента:', error);
    alert(`Произошла ошибка при генерации контента: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  } finally {
    isGenerating.value = false;
  }
};
</script><style scoped>
.bg-gray-50shadow-sm {
  background-color: #f9fafb;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style>

