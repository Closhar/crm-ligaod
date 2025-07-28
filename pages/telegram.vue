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
              <TodayEventsTemplate
                :region_title="region_title"
                :site="site"
                :hashtags="hashtags"
                @update:content="editorContent = $event"
              />
              <DayResultsTemplate
                :region_title="region_title"
                :hashtags="hashtags"
                @update:content="editorContent = $event"
              />
              <AIGenerationTemplate
                @update:content="editorContent = $event"
              />
              <TelegramParseTemplate
                @update:content="editorContent = $event"
              />
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
          
          <!-- Автоматические дополнения к посту -->
          <div class="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-lg font-semibold mb-3">Автоматические дополнения</h3>
            <div class="space-y-3">

              <div>
                <label class="flex items-center">
                  <input type="checkbox" v-model="addTelegramChannelLink" class="mr-2" />
                  <span class="text-sm">Добавить призыв подписаться на канал</span>
                </label>
                <div class="text-xs text-gray-500 ml-6 mt-1">
                  Добавит призыв подписаться на @spbsportrep в конец поста
                </div>
              </div>
            </div>
          </div>

          <!-- Форма отправки в телеграм -->
          <TelegramForm
            v-model:editorContent="editorContent"
            v-model:selectedImage="selectedImage"
            v-model:selectedImagePreview="selectedImagePreview"
            :addTelegramChannelLink="addTelegramChannelLink"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import AIGenerationTemplate from "~/components/kirh/table/editor/AIGenerationTemplate.vue";
import DayResultsTemplate from "~/components/kirh/table/editor/DayResultsTemplate.vue";
import RichTextEditor from "~/components/kirh/table/editor/RichTextEditor.vue";
import TelegramForm from "~/components/kirh/table/editor/TelegramForm.vue";
import TelegramParseTemplate from "~/components/kirh/table/editor/TelegramParseTemplate.vue";
import TodayEventsTemplate from "~/components/kirh/table/editor/TodayEventsTemplate.vue";
import Head from "~/components/parts/Head.vue";
import { useAuth } from '~/composables/useAuth';
import { useGlobals } from '~/composables/useGlobals';
import { useGlobalsStore } from '~/stores/globals';

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
const { loadGlobals } = useGlobals()

const config = useRuntimeConfig();
const api = config.public.API_URL;
const site = config.public.SITE_URL;

useSeoMeta({
  title: ((params.value as any).adminka_name || 'Админка') + ' - Тексты',
  description: 'Работа с телеграм',
});

const p_icon = "stash:telegram";
const p_description = 'Работа с текстами и парсер телеграм';
const breadcrumbs: Array<{id: number, title: string, icon: string, slug: string}> = [];

const {isAuthenticated, user, logout, checkAuth} = useAuth();

// Состояние для статей и пагинации
const articles = ref<Article[]>([]);
const currentPage = ref(1);
const perPage = ref(30);
const hasNextPage = ref(false);
const editorContent = ref('');

// Состояние для изображения
const selectedImage = ref<ImageData | null>(null);
const selectedImagePreview = ref<string>('');
const imageInput = ref<HTMLInputElement | null>(null);
const selectedArticle = ref<Article | null>(null);

// Переключатели автоматических дополнений
const addTelegramChannelLink = ref(true);

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
    
    // Устанавливаем URL изображения для превью
    selectedImagePreview.value = imageUrl;
    
    // Создаем объект с URL изображения
    selectedImage.value = {
      type: 'url',
      url: imageUrl,
      name: imageUrl.split('/').pop() || 'article-image.jpg'
    };
  } catch (error) {
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

// Загружаем статьи при монтировании компонента
onMounted(() => {
  fetchArticles();
});
</script>

<style scoped>
.bg-gray-50shadow-sm {
  background-color: #f9fafb;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style>