<template>
  <div>
    <!-- Модальное окно AI генерации -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <!-- Уведомления -->
        <div v-if="errorMessage" class="p-4 bg-red-100 border-b border-red-200">
          <p class="text-red-700">{{ errorMessage }}</p>
        </div>
        <div v-if="successMessage" class="p-4 bg-green-100 border-b border-green-200">
          <p class="text-green-700">{{ successMessage }}</p>
        </div>

        <div class="p-4 border-b flex justify-between items-center flex-shrink-0">
          <h3 class="text-lg font-semibold">AI Генерация контента</h3>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">Модель:</span>
            <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
              {{ selectedModel === 'gpt-3.5-turbo' ? 'GPT-3.5 Turbo' : 'GPT-4 Turbo' }}
            </span>
          </div>
        </div>

        <div class="p-4 overflow-y-auto flex-grow">
          <!-- Выбор модели -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Модель AI
            </label>
            <select
              v-model="selectedModel"
              class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (быстрее, дешевле)</option>
              <option value="gpt-4-turbo-preview">GPT-4 Turbo (качественнее)</option>
            </select>
            <p class="mt-1 text-sm text-gray-500">
              {{ selectedModel === 'gpt-3.5-turbo' ? 'Оптимально для коротких текстов и анонсов' : 'Оптимально для длинных статей и аналитики' }}
            </p>
          </div>

          <!-- URL для переработки -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              URL статьи для переработки (опционально)
            </label>
            <input
              type="url"
              v-model="aiUrl"
              placeholder="https://example.com/article"
              class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <p class="mt-1 text-sm text-gray-500">
              Укажите URL статьи, которую нужно переработать. Система извлечет контент и использует его как источник информации.
            </p>
          </div>

          <!-- Формат и максимальная длина -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Формат вывода
              </label>
              <select
                v-model="format"
                class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="markdown">Markdown</option>
                <option value="html">HTML</option>
                <option value="plain">Текст</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Максимальная длина контента
              </label>
              <input
                type="number"
                v-model="maxContentLength"
                min="500"
                max="10000"
                step="500"
                class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <!-- Основные табы -->
          <div class="mb-4 bg-white rounded-lg border border-gray-300 shadow-sm">
            <div class="bg-gray-100 rounded-t-lg p-1 border-b border-gray-300">
              <nav class="flex space-x-1" aria-label="Tabs">
                <button
                  v-for="tab in mainTabs"
                  :key="tab.id"
                  @click="activeMainTab = tab.id"
                  :class="[
                    activeMainTab === tab.id
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50',
                    'px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200'
                  ]"
                >
                  {{ tab.name }}
                </button>
              </nav>
            </div>

            <div class="p-4" :class="{
              'bg-green-50': activeMainTab === 'functionality',
              'bg-yellow-50': activeMainTab === 'templates'
            }">
              <!-- Таб Функционал -->
              <div v-if="activeMainTab === 'functionality'" class="rounded-lg p-4">
                <!-- Нижние быстрые шаблоны в табах -->
                <div class="mb-4">
                  <div class="bg-gray-100 rounded-lg p-1 mb-4 border border-gray-300">
                    <nav class="flex space-x-1" aria-label="Tabs">
                      <button
                        v-for="tab in tabs"
                        :key="tab.id"
                        @click="activeTab = tab.id"
                        :class="[
                          activeTab === tab.id
                            ? 'bg-white text-purple-700 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50',
                          'px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200'
                        ]"
                      >
                        {{ tab.name }}
                      </button>
                    </nav>
                  </div>

                  <div class="mt-4">
                    <!-- Таб Telegram -->
                    <div v-if="activeTab === 'telegram'" class="space-y-4">
                      
                      <!-- Форма парсинга -->
                      <div v-if="!parsedTelegramContent">
                        <div v-if="isFilePrepared" class="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                          <p class="text-sm text-gray-600">
                            Для работы с Telegram необходимо сбросить результаты работы с событиями
                          </p>
                        </div>
                        
                        <div v-else>
                          <TelegramParserGlobal
                            @parsed="handleTelegramParsed"
                            @reset="handleTelegramReset"
                            @apply="handleApply"
                            @update:content="handleContentUpdate"
                            @update:modelValue="handleContentUpdate"
                            @input="handleContentUpdate"
                            ref="telegramParser"
                            v-model="parsedTelegramContent"
                            :parse_own_telegram="options.parse_own_telegram"
                            :telegrams="telegramsValue"
                            :telegrams_field="options.telegrams_field"
                          />
                        </div>
                      </div>

                      <!-- Кнопки после парсинга -->
                      <div v-else class="space-y-3">
                        <div class="flex flex-wrap gap-3">
                          <button
                            @click="useParsedContent"
                            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          >
                            Перенести в редактор
                          </button>
                          <div class="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md">
                            <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Файл создан, создайте промт и отправьте запрос
                          </div>
                          <button
                            @click="resetTelegramParsing"
                            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                          >
                            Сброс
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              <!-- Таб Шаблоны -->
              <div v-if="activeMainTab === 'templates'" class="rounded-lg p-4">
                <!-- Кнопка добавления шаблона -->
                <div class="mb-4 flex justify-end">
                  <button
                    @click="showTemplateModal = true"
                    class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    Добавить шаблон
                  </button>
                </div>

                <!-- Список шаблонов -->
                <div class="h-[250px] overflow-y-auto pr-2">
                  <div class="grid grid-cols-2 gap-4">
                    <div
                      v-for="template in templates"
                      :key="template.id"
                      class="p-4 border border-gray-200 rounded-lg hover:border-purple-500 transition-colors"
                      :class="{'border-purple-500 bg-purple-50': selectedTemplate?.id === template.id}"
                    >
                      <div class="flex justify-between items-start mb-2">
                        <h4 class="font-medium text-gray-900">{{ template.name }}</h4>
                        <div class="flex space-x-2">
                          <button
                            @click="editTemplate(template)"
                            class="text-gray-500 hover:text-purple-600"
                          >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            @click="deleteTemplate(template)"
                            class="text-gray-500 hover:text-red-600"
                          >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p class="text-sm text-gray-500">{{ template.description }}</p>
                      <button
                        @click="selectTemplate(template)"
                        class="mt-3 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      >
                        Использовать
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Запрос для генерации -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Запрос для генерации
              <span class="text-sm text-gray-500 ml-2">
                {{ aiPrompt.length }}/4000 символов
              </span>
            </label>
            <textarea
              v-model="aiPrompt"
              rows="4"
              class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              :class="{'border-red-500': aiPrompt.length > 4000}"
              placeholder="Опишите, какой контент нужно сгенерировать..."
            ></textarea>
            <p v-if="aiPrompt.length > 4000" class="mt-1 text-sm text-red-600">
              Превышен лимит символов (4000)
            </p>
            <p class="mt-1 text-sm text-gray-500">
              Максимальная длина ответа: {{ selectedModel === 'gpt-3.5-turbo' ? '2000' : '4000' }} токенов
            </p>
          </div>

          <!-- Настройки кэширования -->
          <div class="mb-4">
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="useCache"
                class="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
              >
              <span class="ml-2 text-sm text-gray-600">Использовать кэширование (результаты сохраняются на 1 час)</span>
            </label>
          </div>

          <!-- Информация о последней генерации -->
          <div v-if="lastGenerationInfo" class="mb-4 p-3 bg-gray-50 rounded-md">
            <div class="text-sm text-gray-600">
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium">Результат генерации</span>
                <span 
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="{
                    'bg-green-100 text-green-700': lastGenerationInfo.source === 'api',
                    'bg-blue-100 text-blue-700': lastGenerationInfo.source === 'cache'
                  }"
                >
                  {{ lastGenerationInfo.source === 'api' ? 'Новая генерация' : 'Из кэша' }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="mb-1">
                    <span class="font-medium">Использовано токенов:</span>
                  </p>
                  <div class="text-xs text-gray-500">
                    <p>Входные: {{ lastGenerationInfo.usage?.input_tokens || 0 }}</p>
                    <p>Выходные: {{ lastGenerationInfo.usage?.output_tokens || 0 }}</p>
                  </div>
                </div>
                <div>
                  <p class="mb-1">
                    <span class="font-medium">Стоимость:</span>
                  </p>
                  <div class="text-xs text-gray-500">
                    <p>Общая: ${{ lastGenerationInfo.usage?.estimated_cost?.toFixed(4) || '0.0000' }}</p>
                    <p>Вход: ${{ lastGenerationInfo.usage?.cost_breakdown?.input_cost?.toFixed(6) || '0.000000' }}</p>
                    <p>Выход: ${{ lastGenerationInfo.usage?.cost_breakdown?.output_cost?.toFixed(6) || '0.000000' }}</p>
                  </div>
                </div>
              </div>
              <div class="mt-2 pt-2 border-t border-gray-200">
                <p class="text-xs text-gray-500">
                  <span class="font-medium">Параметры:</span>
                  Модель: {{ lastGenerationInfo.limits?.model }}, 
                  Температура: {{ lastGenerationInfo.limits?.temperature }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t flex justify-end space-x-3 flex-shrink-0">
          <button
            @click="closeModal"
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

    <!-- Модальное окно редактирования шаблона -->
    <div v-if="showTemplateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-2xl mx-4">
        <div class="p-4 border-b">
          <h3 class="text-lg font-semibold">
            {{ editingTemplate ? 'Редактирование шаблона' : 'Новый шаблон' }}
          </h3>
        </div>

        <div class="p-4">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Название
              </label>
              <input
                v-model="templateForm.name"
                type="text"
                class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <input
                v-model="templateForm.description"
                type="text"
                class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Шаблон промпта
              </label>
              <textarea
                v-model="templateForm.prompt"
                rows="4"
                class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="p-4 border-t flex justify-end space-x-3">
          <button
            @click="closeTemplateModal"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            @click="saveTemplate"
            class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed, onMounted } from 'vue'
import TelegramParserGlobal from '../editor/TelegramParserGlobal.vue'

const config = useRuntimeConfig()
const api = config.public.API_URL

interface GenerationInfo {
  source: 'api' | 'cache';
  usage: {
    input_tokens: number;
    output_tokens: number;
    estimated_cost: number;
    cost_breakdown: {
      input_cost: number;
      output_cost: number;
    };
  };
  limits: {
    max_prompt_length: number;
    max_tokens: number;
    model: string;
    temperature: number;
  };
}

interface Template {
  id: string;
  name: string;
  description: string;
  prompt: string;
  is_active?: boolean;
}

interface Channel {
  id: number;
  title: string;
  username: string;
}

const props = defineProps({
  value: {
    type: [String, Object],
    default: null
  },
  showModal: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: String,
    default: ''
  },
  options: {
    type: Object,
    default: () => ({})
  },
  rowData: {
    type: Object,
    default: () => ({})
  }
})

// Добавляем вычисляемое свойство для получения значения telegrams
const telegramsValue = computed(() => {
  if (props.options.telegrams_field && props.rowData) {
    const value = props.rowData[props.options.telegrams_field] || '';
    return value;
  }
  return '';
});

const emit = defineEmits(['close', 'input', 'update:content', 'update:modelValue', 'apply', 'parsed', 'reset'])

// Состояние
const isGenerating = ref(false)
const selectedModel = ref('gpt-3.5-turbo')
const aiPrompt = ref('')
const aiUrl = ref('')
const useCache = ref(true)
const format = ref('markdown')
const maxContentLength = ref(3000)
const lastGenerationInfo = ref<GenerationInfo | null>(null)
const errorMessage = ref('')
const successMessage = ref('')

// Новые состояния из AIGenerationTemplate
const activeMainTab = ref('functionality')
const activeTab = ref('telegram')
const parsedTelegramContent = ref<string | null>(null)
const searchQuery = ref('')
const isSearching = ref(false)
const searchResults = ref<Channel[]>([])
const parseStartDate = ref('')
const parseMessageCount = ref(10)
const parseChannelId = ref<number | null>(null)
const isParsing = ref(false)
const selectedTemplate = ref<Template | null>(null)
const isFilePrepared = ref(false)
const uploadedFileId = ref<string | null>(null)
const promptFile = ref<File | null>(null)

// Табы
const mainTabs = [
  { id: 'functionality', name: 'Функционал' },
  { id: 'templates', name: 'Шаблоны' }
]

const tabs = [
  { id: 'telegram', name: 'Telegram' }
]

// Состояние для шаблонов
const templates = ref<Template[]>([])
const showTemplateModal = ref(false)
const editingTemplate = ref<Template | null>(null)
const templateForm = ref({
  name: '',
  description: '',
  prompt: ''
})

// Добавляем кэширование для шаблонов
const templatesCache = ref<{
  data: Template[] | null;
  timestamp: number;
  loading: boolean;
}>({
  data: null,
  timestamp: 0,
  loading: false
})

// Время жизни кэша в миллисекундах (5 минут)
const CACHE_DURATION = 5 * 60 * 1000

// Глобальное кэширование шаблонов для всех экземпляров компонента
const globalTemplatesCache = {
  data: null as Template[] | null,
  timestamp: 0,
  loading: false,
  promise: null as Promise<Template[]> | null
}

// Методы
const closeModal = () => {
  emit('close')
}

const showError = (message: string) => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 3000)
}

const showSuccess = (message: string) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

const handleSearchInput = async () => {
  if (searchQuery.value.length < 3) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  try {
    const response = await fetch(`${api}/api/telegram/search?query=${encodeURIComponent(searchQuery.value)}`)
    if (!response.ok) throw new Error('Ошибка поиска каналов')
    const data = await response.json()
    searchResults.value = data.channels || []
  } catch (error) {
    showError('Ошибка при поиске каналов')
    console.error(error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

const handleChannelSelect = (channel: Channel) => {
  parseChannelId.value = channel.id
  searchQuery.value = channel.title
  searchResults.value = []
}

const parseTelegramChannel = async () => {
  if (!parseChannelId.value || !parseStartDate.value) {
    showError('Выберите канал и дату начала')
    return
  }

  isParsing.value = true
  try {
    const response = await fetch(`${api}/api/telegram/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel_id: parseChannelId.value,
        start_date: parseStartDate.value,
        message_count: parseMessageCount.value
      })
    })

    if (!response.ok) throw new Error('Ошибка при парсинге канала')
    
    const data = await response.json()
    if (!data.messages || !Array.isArray(data.messages)) {
      throw new Error('Неверный формат данных от сервера')
    }

    // Форматируем полученные сообщения
    let formattedContent = '';
    data.messages.forEach((message: { message: string }, index: number) => {
      if (index > 0) {
        formattedContent += '\n\n';
      }
      if (message.message) {
        formattedContent += message.message;
      }
    });

    if (!formattedContent.trim()) {
      throw new Error('Не удалось получить контент из сообщений');
    }

    // Сохраняем распарсенный контент
    parsedTelegramContent.value = formattedContent;
    showSuccess('Парсинг успешно завершен');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Ошибка при парсинге канала'
    showError(errorMessage)
    console.error(error)
  } finally {
    isParsing.value = false
  }
}

const useParsedContent = () => {
  if (parsedTelegramContent.value) {
    const content = parsedTelegramContent.value;
    emit('apply', content);
    closeModal();
  }
}

const selectTemplate = (template: Template) => {
  selectedTemplate.value = template
  aiPrompt.value = template.prompt
}

const getTemplatePrompt = (templateId: string): string => {
  const prompts: Record<string, string> = {
    news: 'Напиши новостную статью на тему: [ТЕМА]. Статья должна содержать:\n1. Цепляющий заголовок\n2. Краткий лид (2-3 предложения)\n3. Основной текст с подзаголовками\n4. Заключение\n\nИспользуй факты и цитаты из предоставленного контента.',
    analytics: 'Напиши аналитическую статью на тему: [ТЕМА]. Статья должна содержать:\n1. Введение с постановкой проблемы\n2. Анализ текущей ситуации\n3. Тренды и прогнозы\n4. Выводы и рекомендации\n\nИспользуй данные и примеры из предоставленного контента.',
    review: 'Напиши обзор на тему: [ТЕМА]. Обзор должен содержать:\n1. Введение и описание предмета обзора\n2. Основные характеристики\n3. Плюсы и минусы\n4. Сравнение с аналогами\n5. Заключение и рекомендации\n\nИспользуй конкретные примеры из предоставленного контента.',
    interview: 'Напиши интервью на тему: [ТЕМА]. Интервью должно содержать:\n1. Введение с представлением собеседника\n2. 5-7 ключевых вопросов и ответов\n3. Заключение с основными выводами\n\nИспользуй информацию из предоставленного контента для формирования вопросов.'
  }
  return prompts[templateId] || ''
}

// Добавляем новую функцию для загрузки файла
const uploadFile = async (content: string): Promise<string | null> => {
  try {
    const formData = new FormData()
    const blob = new Blob([content], { type: 'text/plain' })
    formData.append('file', blob, 'content.txt')
    
    const response = await fetch(`${api}/api/ai/upload-file`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Ошибка при загрузке файла: ${response.status} ${errorData}`)
    }

    const data = await response.json()
    
    if (!data.data?.file_id) {
      throw new Error('В ответе сервера отсутствует file_id')
    }
    
    return data.data.file_id
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Ошибка при загрузке файла')
    return null
  }
}

// Модифицируем функцию generateContent
const generateContent = async () => {
  if (aiPrompt.value.length > 4000) {
    showError('Превышен лимит символов в промпте (4000)')
    return
  }

  isGenerating.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    let fileId = null

    if (parsedTelegramContent.value) {
      fileId = await uploadFile(parsedTelegramContent.value)
      if (!fileId) {
        throw new Error('Не удалось загрузить файл с контентом')
      }
    }

    const response = await fetch(`${api}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: aiPrompt.value,
        model: selectedModel.value,
        url: aiUrl.value,
        use_cache: useCache.value,
        file_id: fileId,
        format: format.value,
        max_content_length: maxContentLength.value
      })
    })

    if (!response.ok) {
      throw new Error('Ошибка при генерации контента')
    }

    const data = await response.json()
    
    lastGenerationInfo.value = {
      source: data.source,
      usage: data.usage,
      limits: data.limits
    }

    if (!data.success) {
      throw new Error('Ошибка генерации: ' + (data.error || 'Неизвестная ошибка'))
    }

    if (!data.data) {
      throw new Error('В ответе отсутствуют данные')
    }

    emit('input', data.data)
    emit('update:modelValue', data.data)
    emit('update:content', data.data)
    emit('apply', data.data)
    
    closeModal()
    
    showSuccess('Контент успешно сгенерирован')
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при генерации контента'
    showError(errorMessage)
  } finally {
    isGenerating.value = false
  }
}

// Обработчик результата парсинга Telegram
const handleTelegramParsed = (result: { content: string; fileId: string; useInEditor?: boolean }) => {
  parsedTelegramContent.value = result.content;
  uploadedFileId.value = result.fileId;
  isFilePrepared.value = true;
  
  // Если это запрос на использование в редакторе, отправляем контент
  if (result.useInEditor) {
    emit('apply', result.content);
  }
};

// Обработчик применения контента
const handleApply = (content: string) => {
  if (content) {
    emit('apply', content);
    closeModal();
  }
};

// Обработчик использования в редакторе
const handleUseInEditor = () => {
  if (parsedTelegramContent.value) {
    emit('apply', parsedTelegramContent.value);
  }
};

// Обработчик сброса парсинга Telegram
const handleTelegramReset = () => {
  parsedTelegramContent.value = '';
  uploadedFileId.value = null;
  promptFile.value = null;
  isFilePrepared.value = false;
};

// Ссылка на компонент парсера
const telegramParser = ref<InstanceType<typeof TelegramParserGlobal> | null>(null);

// Модифицируем функцию сброса парсинга Telegram
const resetTelegramParsing = () => {
  if (telegramParser.value) {
    telegramParser.value.reset();
  }
  handleTelegramReset();
};

// Обработчик обновления контента
const handleContentUpdate = (content: string) => {
  parsedTelegramContent.value = content;
  emit('update:content', content);
};

// Сбрасываем состояние при закрытии модального окна
watch(() => props.showModal, (newValue) => {
  if (!newValue) {
    aiPrompt.value = ''
    aiUrl.value = ''
    lastGenerationInfo.value = null
    errorMessage.value = ''
    successMessage.value = ''
    activeMainTab.value = 'functionality'
    activeTab.value = 'telegram'
    parsedTelegramContent.value = null
    searchQuery.value = ''
    searchResults.value = []
    parseStartDate.value = ''
    parseMessageCount.value = 10
    parseChannelId.value = null
    selectedTemplate.value = null
    isFilePrepared.value = false
    uploadedFileId.value = null
    promptFile.value = null
  }
})

// Загрузка шаблонов с кэшированием
const loadTemplates = async () => {
  const now = Date.now()
  
  // Проверяем глобальный кэш
  if (globalTemplatesCache.data && 
      (now - globalTemplatesCache.timestamp) < CACHE_DURATION) {
    templates.value = globalTemplatesCache.data
    return
  }
  
  // Если уже идет загрузка, ждем завершения
  if (globalTemplatesCache.loading && globalTemplatesCache.promise) {
    try {
      const data = await globalTemplatesCache.promise
      templates.value = data
      return
    } catch (error) {
      // Если глобальный запрос завершился с ошибкой, делаем локальный
      console.warn('Глобальный запрос шаблонов завершился с ошибкой, делаем локальный запрос')
    }
  }
  
  // Проверяем локальный кэш
  if (templatesCache.value.data && 
      (now - templatesCache.value.timestamp) < CACHE_DURATION) {
    templates.value = templatesCache.value.data
    return
  }
  
  // Если уже идет локальная загрузка, не делаем повторный запрос
  if (templatesCache.value.loading) {
    return
  }
  
  templatesCache.value.loading = true
  globalTemplatesCache.loading = true
  
  // Создаем промис для глобального кэша
  const fetchPromise = (async () => {
    try {
      const response = await fetch(`${api}/api/prompt-templates`)
      if (!response.ok) throw new Error('Ошибка загрузки шаблонов')
      const data = await response.json()
      
      // Обновляем глобальный кэш
      globalTemplatesCache.data = data.data
      globalTemplatesCache.timestamp = now
      
      return data.data
    } catch (error) {
      throw error
    } finally {
      globalTemplatesCache.loading = false
      globalTemplatesCache.promise = null
    }
  })()
  
  globalTemplatesCache.promise = fetchPromise
  
  try {
    const data = await fetchPromise
    
    // Обновляем локальный кэш
    templatesCache.value.data = data
    templatesCache.value.timestamp = now
    templates.value = data
  } catch (error) {
    showError('Ошибка при загрузке шаблонов')
    console.error(error)
  } finally {
    templatesCache.value.loading = false
  }
}

// Открытие модального окна для редактирования
const editTemplate = (template: Template) => {
  editingTemplate.value = template
  templateForm.value = { ...template }
  showTemplateModal.value = true
}

// Закрытие модального окна
const closeTemplateModal = () => {
  showTemplateModal.value = false
  editingTemplate.value = null
  templateForm.value = {
    name: '',
    description: '',
    prompt: ''
  }
}

// Сохранение шаблона
const saveTemplate = async () => {
  try {
    const url = editingTemplate.value
      ? `${api}/api/prompt-templates/${editingTemplate.value.id}`
      : `${api}/api/prompt-templates`
    
    const method = editingTemplate.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(templateForm.value)
    })

    if (!response.ok) throw new Error('Ошибка сохранения шаблона')
    
    // Инвалидируем кэши и перезагружаем шаблоны
    templatesCache.value.data = null
    templatesCache.value.timestamp = 0
    globalTemplatesCache.data = null
    globalTemplatesCache.timestamp = 0
    await loadTemplates()
    closeTemplateModal()
    showSuccess('Шаблон успешно сохранен')
  } catch (error) {
    showError('Ошибка при сохранении шаблона')
    console.error(error)
  }
}

// Удаление шаблона
const deleteTemplate = async (template: Template) => {
  if (!confirm('Вы уверены, что хотите удалить этот шаблон?')) return

  try {
    const response = await fetch(`${api}/api/prompt-templates/${template.id}`, {
      method: 'DELETE'
    })

    if (!response.ok) throw new Error('Ошибка удаления шаблона')
    
    // Инвалидируем кэши и перезагружаем шаблоны
    templatesCache.value.data = null
    templatesCache.value.timestamp = 0
    globalTemplatesCache.data = null
    globalTemplatesCache.timestamp = 0
    await loadTemplates()
    showSuccess('Шаблон успешно удален')
  } catch (error) {
    showError('Ошибка при удалении шаблона')
    console.error(error)
  }
}

// Загружаем шаблоны при монтировании компонента только если модальное окно открыто
onMounted(() => {
  // Не загружаем шаблоны автоматически при монтировании
  // Они будут загружены только при открытии модального окна или переходе на вкладку шаблонов
})

// Добавляем наблюдатель за открытием модального окна
watch(() => props.showModal, (newValue) => {
  if (newValue) {
    // Загружаем шаблоны только при открытии модального окна
    loadTemplates()
  }
})

// Добавляем наблюдатель за переключением на вкладку шаблонов
watch(() => activeMainTab.value, (newValue) => {
  if (newValue === 'templates') {
    // Загружаем шаблоны только при переходе на вкладку шаблонов
    loadTemplates()
  }
})
</script> 