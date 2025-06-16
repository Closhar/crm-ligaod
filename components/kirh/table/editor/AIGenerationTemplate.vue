<template>
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

  <!-- Модальное окно AI генерации -->
  <div v-if="showAIModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
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

        <!-- Параметры форматирования -->
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
                      :disabled="(parsedTelegramContent && tab.id === 'events') || (isFilePrepared && tab.id === 'telegram')"
                      :class="[
                        activeTab === tab.id
                          ? 'bg-white text-purple-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50',
                        'px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200',
                        ((parsedTelegramContent && tab.id === 'events') || (isFilePrepared && tab.id === 'telegram')) ? 'opacity-50 cursor-not-allowed' : ''
                      ]"
                    >
                      {{ tab.name }}
                    </button>
                  </nav>
                </div>

                <div class="mt-4">
                  <!-- Таб События -->
                  <div v-if="activeTab === 'events'" class="space-y-4">
                    <div v-if="parsedTelegramContent" class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p class="text-sm text-gray-600">
                        Для работы с событиями необходимо сбросить результаты парсинга Telegram
                      </p>
                    </div>
                    <div v-else>
                      <!-- Форма выбора даты -->
                      <div v-if="!isFilePrepared">
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
                            <span v-else>Сформировать список событий</span>
                          </button>
                        </div>
                      </div>

                      <!-- Кнопки после формирования файла -->
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
                            @click="resetEvents"
                            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                          >
                            Сброс
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

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
                          v-if="activeTab === 'telegram'"
                          @parsed="handleTelegramParsed"
                          @reset="handleTelegramReset"
                          @update:content="handleContentUpdate"
                          @update:modelValue="handleContentUpdate"
                          @input="handleContentUpdate"
                          ref="telegramParser"
                          v-model="parsedTelegramContent"
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

                  <!-- Таб Инструкция -->
                  <div v-if="activeTab === 'help'" class="space-y-4">
                    <div class="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 class="text-lg font-medium text-gray-900 mb-4">Инструкция по использованию</h3>
                      
                      <div class="space-y-6">
                        <!-- Общая информация -->
                        <div>
                          <h4 class="text-sm font-medium text-gray-900 mb-2">Общая информация</h4>
                          <p class="text-sm text-gray-600">
                            Этот инструмент позволяет генерировать контент с помощью AI на основе различных источников данных. 
                            Вы можете использовать готовые шаблоны или создавать собственные запросы.
                          </p>
                        </div>

                        <!-- Работа с событиями -->
                        <div>
                          <h4 class="text-sm font-medium text-gray-900 mb-2">Работа с событиями</h4>
                          <ol class="list-decimal list-inside text-sm text-gray-600 space-y-2">
                            <li>Выберите дату для получения списка событий</li>
                            <li>Нажмите "Сформировать список событий"</li>
                            <li>После создания файла с событиями, выберите подходящий шаблон из верхнего блока</li>
                            <li>При необходимости отредактируйте промпт</li>
                            <li>Нажмите "Сгенерировать" для создания контента</li>
                          </ol>
                        </div>

                        <!-- Работа с Telegram -->
                        <div>
                          <h4 class="text-sm font-medium text-gray-900 mb-2">Работа с Telegram</h4>
                          <ol class="list-decimal list-inside text-sm text-gray-600 space-y-2">
                            <li>Перед началом работы убедитесь, что нужный канал добавлен в таблицу "Каналы для парсинга" в административной панели</li>
                            <li>Введите название канала в поле поиска</li>
                            <li>Выберите канал из результатов поиска</li>
                            <li>Укажите дату начала парсинга и количество сообщений</li>
                            <li>Нажмите "Начать парсинг"</li>
                            <li>После парсинга вы можете:
                              <ul class="list-disc list-inside ml-4 mt-1 space-y-1">
                                <li>Перенести контент в редактор</li>
                                <li>Отправить запрос на обработку AI</li>
                              </ul>
                            </li>
                          </ol>
                        </div>

                        <!-- Советы по промптам -->
                        <div>
                          <h4 class="text-sm font-medium text-gray-900 mb-2">Советы по промптам</h4>
                          <ul class="list-disc list-inside text-sm text-gray-600 space-y-2">
                            <li>Используйте готовые шаблоны как основу для своих промптов</li>
                            <li>Указывайте конкретные требования к формату и стилю</li>
                            <li>Добавляйте примеры желаемого результата</li>
                            <li>Не превышайте лимит в 4000 символов</li>
                          </ul>
                        </div>

                        <!-- Настройки -->
                        <div>
                          <h4 class="text-sm font-medium text-gray-900 mb-2">Настройки</h4>
                          <ul class="list-disc list-inside text-sm text-gray-600 space-y-2">
                            <li>Выберите модель AI в зависимости от задачи:
                              <ul class="list-disc list-inside ml-4 mt-1">
                                <li>GPT-3.5 Turbo - для коротких текстов и анонсов</li>
                                <li>GPT-4 Turbo - для длинных статей и аналитики</li>
                              </ul>
                            </li>
                            <li>Используйте кэширование для экономии ресурсов</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Таб Шаблоны промптов -->
            <div v-if="activeMainTab === 'templates'" class="rounded-lg p-4">
              <div class="bg-gray-100 rounded-lg p-1 mb-2 border border-gray-300">
                <nav class="flex space-x-1" aria-label="Tabs">
                  <button
                    v-for="tab in promptTabs"
                    :key="tab.id"
                    @click="activePromptTab = tab.id"
                    :class="[
                      activePromptTab === tab.id
                        ? 'bg-white text-purple-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50',
                      'px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200'
                    ]"
                  >
                    {{ tab.name }}
                  </button>
                </nav>
              </div>
              <div class="max-h-[200px] overflow-y-auto pr-2">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <!-- Шаблоны для событий -->
                  <template v-if="activePromptTab === 'events'">
                    <button
                      v-for="(template, index) in eventTemplates"
                      :key="index"
                      @click="insertTemplate(template.prompt, template.type)"
                      class="text-left p-3 border border-gray-200 rounded-md hover:bg-purple-50 hover:border-purple-200 transition-colors"
                    >
                      <div class="font-medium text-purple-700 mb-1">{{ template.title }}</div>
                      <div class="text-sm text-gray-600 line-clamp-2">{{ template.prompt }}</div>
                    </button>
                  </template>

                  <!-- Шаблоны для Telegram -->
                  <template v-if="activePromptTab === 'telegram'">
                    <button
                      v-for="(template, index) in telegramTemplates"
                      :key="index"
                      @click="insertTemplate(template.prompt, template.type)"
                      class="text-left p-3 border border-gray-200 rounded-md hover:bg-purple-50 hover:border-purple-200 transition-colors"
                    >
                      <div class="font-medium text-blue-600 mb-1">{{ template.title }}</div>
                      <div class="text-sm text-gray-600 line-clamp-2">{{ template.prompt }}</div>
                    </button>
                  </template>

                  <!-- Шаблоны для внешних статей -->
                  <template v-if="activePromptTab === 'external'">
                    <button
                      v-for="(template, index) in externalTemplates"
                      :key="index"
                      @click="insertTemplate(template.prompt, template.type)"
                      class="text-left p-3 border border-gray-200 rounded-md hover:bg-purple-50 hover:border-purple-200 transition-colors"
                    >
                      <div class="font-medium text-purple-700 mb-1">{{ template.title }}</div>
                      <div class="text-sm text-gray-600 line-clamp-2">{{ template.prompt }}</div>
                    </button>
                  </template>
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
        <div v-if="lastGenerationInfo && lastGenerationInfo.usage" class="mb-4 p-3 bg-gray-50 rounded-md">
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

  <!-- Модальное окно парсинга Telegram -->
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
            class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
            class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import TelegramParserGlobal from './TelegramParserGlobal.vue';

const emit = defineEmits(['update:content']);
const config = useRuntimeConfig();
const api = config.public.API_URL;

// Интерфейс для шаблона
interface PromptTemplate {
  title: string;
  prompt: string;
  type: 'telegram' | 'events' | 'other' | 'external';
}

// Шаблоны промптов
const promptTemplates: PromptTemplate[] = [
  {
    title: 'Парсинг Telegram',
    prompt: 'На основе информации из приложенного файла с сообщениями Telegram канала составь краткую сводку. Отформатируй текст для публикации в Telegram с использованием эмодзи и разделителей. Используй эмодзи для обозначения важных моментов и разделения блоков.',
    type: 'telegram'
  },
  {
    title: 'Анализ матча',
    prompt: 'Собери всю информацию о матче [НАЗВАНИЕ МАТЧА] из приложенного файла. Выдели ключевые моменты, статистику и важные события, интервью игроков и тренеров. Составь структурированный отчет с использованием эмодзи для выделения важных моментов. Включи информацию о счете, голевых моментах и тактических особенностях. Пиши художественным языком, чтобы вызывать интерес у читателя. Не пиши ничего лишнего, что не касается отчетного матча.',
    type: 'telegram'
  },
  {
    title: 'Обзор турнира',
    prompt: 'На основе сообщений из приложенного файла составь обзор турнира [НАЗВАНИЕ ТУРНИРА]. Включи информацию о текущем положении команд, ключевых матчах и интересных фактах. Используй эмодзи для выделения важной информации и разделения блоков. Добавь статистику и прогнозы на следующие игры.',
    type: 'telegram'
  },
  {
    title: 'Интервью с игроком',
    prompt: 'Найди в приложенном файле информацию об интервью с [ИМЯ ИГРОКА]. Составь структурированный текст, выделив основные темы, цитаты и интересные моменты. Используй эмодзи для выделения ключевых фраз и эмоциональных моментов. Добавь контекст и предысторию, если они есть в сообщениях.',
    type: 'telegram'
  },
  {
    title: 'Трансферные новости',
    prompt: 'Проанализируй сообщения о трансферах [ИМЯ ИГРОКА/КОМАНДЫ] из приложенного файла. Собери всю доступную информацию о возможных переходах, переговорах и условиях. Структурируй текст, выделив подтвержденную информацию и слухи. Используй эмодзи для обозначения статуса трансфера и важных деталей.',
    type: 'telegram'
  },
  {
    title: 'Травмы и составы',
    prompt: 'Найди в приложенном файле информацию о травмах и составах команд для [НАЗВАНИЕ МАТЧА/ТУРНИРА]. Составь сводку по доступным игрокам, травмированным и дисквалифицированным. Используй эмодзи для обозначения статуса игроков. Добавь комментарии тренеров о составе, если они есть.',
    type: 'telegram'
  },
  {
    title: 'Пресс-конференция',
    prompt: 'На основе сообщений из приложенного файла составь отчет о пресс-конференции [ИМЯ ТРЕНЕРА/КОМАНДЫ]. Выдели основные темы, важные заявления и интересные моменты. Используй эмодзи для обозначения ключевых цитат и эмоциональных моментов. Добавь контекст и реакцию на вопросы журналистов.',
    type: 'telegram'
  },
  {
    title: 'Статистика игрока',
    prompt: 'Собери и проанализируй статистику [ИМЯ ИГРОКА] из приложенного файла. Включи информацию о голах, передачах, минутах на поле и других важных показателях. Составь структурированный отчет с использованием эмодзи для выделения достижений. Добавь сравнение с предыдущими сезонами, если такая информация есть.',
    type: 'telegram'
  },
  {
    title: 'Обзор недели',
    prompt: 'На основе сообщений из приложенного файла составь обзор спортивных событий за неделю. Включи информацию о матчах, турнирах, трансферах и других важных новостях. Структурируй текст по категориям, используя эмодзи для разделения блоков. Выдели самые значимые события и интересные факты.',
    type: 'telegram'
  },
  {
    title: 'Прогноз на матч',
    prompt: 'Проанализируй информацию о предстоящем матче [НАЗВАНИЕ МАТЧА] из приложенного файла. Учти статистику команд, травмы, составы и предыдущие встречи. Составь детальный прогноз с использованием эмодзи для выделения ключевых факторов. Включи возможные тактические схемы и ключевых игроков.',
    type: 'telegram'
  },
  {
    title: 'Перечисление событий',
    prompt: 'На основе информации из приложенного файла составь краткую сводку спортивных событий дня в формате списка. Для каждого события укажи: название, результат и место проведения. Отформатируй текст для публикации в Telegram с использованием эмодзи и разделителей. Используй эмодзи для обозначения видов спорта, результатов и мест проведения.',
    type: 'events'
  },
  {
    title: 'Комплексная статья',
    prompt: 'На основе информации из приложенного файла напиши аналитическую статью о всех спортивных событиях дня. Опиши ключевые моменты, интересные факты и общую картину спортивной жизни города. Отформатируй текст для публикации в Telegram с использованием эмодзи, разделителей и выделения важных моментов. Используй эмодзи для обозначения видов спорта, результатов и эмоциональных моментов.',
    type: 'events'
  },
  {
    title: 'Детальное описание',
    prompt: 'На основе информации из приложенного файла подготовь подробный отчет о каждом спортивном событии. Включи детали матчей, важные моменты и статистику. Отформатируй текст для публикации в Telegram с использованием эмодзи, разделителей и структурированных блоков. Используй эмодзи для обозначения видов спорта, статистики и ключевых событий.',
    type: 'events'
  },
  {
    title: 'Ироничный репортаж',
    prompt: 'На основе информации из приложенного файла напиши ироничный репортаж о спортивных событиях дня. Используй юмор, но сохраняй точность в передаче результатов. Отформатируй текст для публикации в Telegram с использованием эмодзи, разделителей и выделения шуток. Используй эмодзи для усиления юмористического эффекта.',
    type: 'events'
  },
  {
    title: 'Краткая сводка',
    prompt: 'На основе информации из приложенного файла составь краткую сводку спортивных событий. Укажи только самое важное: результаты и ключевые моменты. Отформатируй текст для публикации в Telegram с использованием эмодзи и разделителей. Используй эмодзи для обозначения результатов и важных событий.',
    type: 'events'
  },
  {
    title: 'Аналитический обзор',
    prompt: 'На основе информации из приложенного файла подготовь аналитический обзор спортивных событий. Проанализируй результаты, выдели тренды и сделай прогнозы. Отформатируй текст для публикации в Telegram с использованием эмодзи, разделителей и структурированных блоков. Используй эмодзи для обозначения трендов, прогнозов и статистики.',
    type: 'events'
  },
  {
    title: 'Тематический обзор',
    prompt: 'На основе информации из приложенного файла напиши статью о самых зрелищных матчах дня. Сфокусируйся на эмоциональных моментах и ярких событиях. Отформатируй текст для публикации в Telegram с использованием эмодзи, разделителей и выделения эмоциональных моментов. Используй эмодзи для усиления эмоционального воздействия.',
    type: 'events'
  },
  {
    title: 'Статистический отчет',
    prompt: 'На основе информации из приложенного файла составь статистический отчет по всем спортивным событиям. Включи цифры, рекорды и интересные факты. Отформатируй текст для публикации в Telegram с использованием эмодзи, разделителей и структурированных блоков. Используй эмодзи для обозначения статистики, рекордов и интересных фактов.',
    type: 'events'
  },
  {
    title: 'Переработка новости',
    prompt: 'Перепиши статью из приложенного файла своими словами, сохраняя основной смысл и ключевые факты. Используй более простой и понятный язык, избегай сложных терминов. Добавь подзаголовки для лучшей структуры. Сделай текст более живым и интересным для читателя. Сохрани все важные цифры, даты и имена.',
    type: 'external'
  },
  {
    title: 'Адаптация для соцсетей',
    prompt: 'Переработай статью из приложенного файла в формат, подходящий для социальных сетей. Разбей текст на короткие абзацы, добавь эмодзи для выделения важных моментов. Сделай акцент на самом интересном и важном. Используй более разговорный стиль, но сохрани профессионализм. Добавь призыв к действию в конце.',
    type: 'external'
  },
  {
    title: 'Расширенный анализ',
    prompt: 'На основе статьи из приложенного файла создай подробный аналитический материал. Добавь свой анализ ситуации, возможные последствия и прогнозы. Используй цитаты из оригинальной статьи, но перефразируй их. Структурируй текст с помощью подзаголовков и маркированных списков. Сохрани все факты, но представь их в более глубоком контексте.',
    type: 'external'
  },
  {
    title: 'Краткая версия',
    prompt: 'Создай краткую версию статьи из приложенного файла, сохранив только самое важное. Используй простой и понятный язык. Выдели главную мысль в начале. Опусти второстепенные детали, но сохрани все ключевые факты, цифры и имена. Сделай текст более динамичным и легким для чтения.',
    type: 'external'
  },
  {
    title: 'Профессиональный обзор',
    prompt: 'Переработай статью из приложенного файла в профессиональный обзор. Используй специальную терминологию, но объясняй сложные понятия. Добавь технические детали и профессиональный анализ. Сохрани все факты, но представь их с точки зрения эксперта. Структурируй текст по разделам с четкими подзаголовками.',
    type: 'external'
  }
];

// Состояния для парсинга Telegram
const showParseModal = ref(false);
const parseChannelId = ref('');
const parseStartDate = ref(new Date().toISOString().split('T')[0]);
const parseMessageCount = ref(20);
const isParsing = ref(false);
const searchQuery = ref('');
const searchResults = ref<ParseChannel[]>([]);
const isSearching = ref(false);
const selectedParseChannel = ref<ParseChannel | null>(null);
const activeTemplateType = ref<'telegram' | 'events' | 'other' | 'external' | null>(null);

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

// Функция вставки шаблона
const insertTemplate = (template: string, type: string) => {
  aiPrompt.value = template;
  activeTemplateType.value = type as 'telegram' | 'events' | 'other' | 'external';
};

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

// Добавляем состояние для хранения распарсенного контента
const parsedTelegramContent = ref<string>('');

// Функция для использования распарсенного контента в редакторе
const useParsedContent = () => {
  if (parsedTelegramContent.value) {
    emit('update:content', parsedTelegramContent.value);
    showAIModal.value = false;
    resetActiveTemplate();
  }
};

// Функция для использования распарсенного контента для AI
const useParsedContentForAI = async () => {
  if (parsedTelegramContent.value) {
    // Создаем файл с сообщениями
    const file = createPromptFile(parsedTelegramContent.value);
    promptFile.value = file;
    
    try {
      // Загружаем файл и получаем его ID
      uploadedFileId.value = await uploadFile(file);
    } catch (error) {
      console.error('Ошибка при подготовке файла для AI:', error);
      alert('Произошла ошибка при подготовке файла для AI');
    }
  }
};

// Функция для загрузки файла
const uploadFile = async (file: File): Promise<string> => {
  const config = useRuntimeConfig();
  const api = config.public.API_URL;

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

// Модифицируем функцию парсинга канала
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

    // Сохраняем распарсенный контент
    parsedTelegramContent.value = formattedContent;

    try {
      // Создаем файл с распарсеным контентом
      const file = createPromptFile(formattedContent);
      if (!file) {
        throw new Error('Не удалось создать файл');
      }
      promptFile.value = file;
      
      // Загружаем файл и получаем его ID
      uploadedFileId.value = await uploadFile(file);
      
      // Устанавливаем флаг готовности файла
      isFilePrepared.value = true;
    } catch (fileError) {
      console.error('Ошибка при работе с файлом:', fileError);
      throw new Error(`Ошибка при подготовке файла: ${fileError instanceof Error ? fileError.message : 'Неизвестная ошибка'}`);
    }

  } catch (error) {
    console.error('Ошибка при парсинге сообщений:', error);
    alert(`Произошла ошибка при парсинге сообщений: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    // Сбрасываем состояние при ошибке
    parsedTelegramContent.value = '';
    promptFile.value = null;
    uploadedFileId.value = null;
    isFilePrepared.value = false;
  } finally {
    isParsing.value = false;
  }
};

// Состояния для AI генерации
const showAIModal = ref(false);
const aiPrompt = ref('');
const isGenerating = ref(false);
const selectedModel = ref('gpt-3.5-turbo');
const useCache = ref(true);
const aiUrl = ref('');
const aiSelectedDate = ref('');
const promptFile = ref<File | null>(null);
const lastGenerationInfo = ref<GenerationInfo | null>(null);
const uploadedFileId = ref<string | null>(null);
const isFilePrepared = ref(false);
const format = ref('markdown');
const maxContentLength = ref(3000);

// Интерфейс для информации о генерации
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

// Интерфейс для события
interface SportEvent {
  club1?: any;
  club2?: any;
  competition?: {
    title_short: string;
  };
  event_name: string;
  arena?: {
    title: string;
  };
  tickets?: string;
  series_count?: string;
  series?: {
    description: string;
  };
  report?: string;
}

// Функция для создания текстового файла
const createPromptFile = (content: string): File => {
  const blob = new Blob([content], { type: 'text/plain' });
  return new File([blob], 'prompt.txt', { type: 'text/plain' });
};

// Функция подготовки отчета
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

    const data = await response.json();
    const allEvents = data.data as SportEvent[];

    if (allEvents.length === 0) {
      alert('Нет событий за выбранную дату');
      return;
    }

    // Формируем текст для файла
    let fileContent = '';
    allEvents.forEach((event: SportEvent) => {
      if (event.club1 && event.club2) {
        fileContent += `${event.competition?.title_short}\n`;
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
        const formattedReport = event.report
          .replace(/<[^>]*>/g, '')
          .split('\n')
          .filter((line: string) => line.trim().length > 0)
          .join('\n');
        fileContent += `${formattedReport}\n`;
      }
      fileContent += '\n';
    });

    // Создаем файл с информацией о событиях
    const file = createPromptFile(fileContent);
    promptFile.value = file;
    
    // Загружаем файл и получаем его ID
    uploadedFileId.value = await uploadFile(file);
    
    // Устанавливаем флаг готовности файла
    isFilePrepared.value = true;

  } catch (error) {
    console.error('Ошибка при формировании отчета:', error);
    alert(`Произошла ошибка при формировании отчета: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    promptFile.value = null;
    uploadedFileId.value = null;
    isFilePrepared.value = false;
  } finally {
    isGenerating.value = false;
  }
};

// Функция генерации контента
const generateContent = async () => {
  if (!aiPrompt.value.trim()) {
    alert('Пожалуйста, введите запрос для генерации');
    return;
  }

  if (aiPrompt.value.length > 4000) {
    alert('Превышен лимит длины промпта (4000 символов)');
    return;
  }

  try {
    isGenerating.value = true;

    const config = useRuntimeConfig();
    const api = config.public.API_URL;

    // Формируем тело запроса
    const requestBody: any = {
      prompt: aiPrompt.value,
      model: selectedModel.value,
      use_cache: useCache.value,
      format: format.value,
      max_content_length: maxContentLength.value,
      url: aiUrl.value.trim() || '',
      file_id: uploadedFileId.value || ''
    };

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
      if (result.limits) {
        throw new Error(`${result.message}\nТекущая длина: ${result.limits.current_prompt_length} символов`);
      }
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }
    
    if (!result.success) {
      throw new Error(result.message || 'Ошибка при генерации контента');
    }

    // Сохраняем информацию о генерации
    lastGenerationInfo.value = {
      source: result.source,
      usage: result.usage,
      limits: result.limits
    };

    // Отправляем сгенерированный контент в родительский компонент
    emit('update:content', result.data);
    
    // Закрываем модальное окно и очищаем состояние
    showAIModal.value = false;
    resetActiveTemplate();

  } catch (error) {
    console.error('Ошибка при генерации контента:', error);
    alert(`Произошла ошибка при генерации контента: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  } finally {
    isGenerating.value = false;
  }
};

// Модифицируем функцию сброса активного шаблона
const resetActiveTemplate = () => {
  activeTemplateType.value = null;
  aiPrompt.value = '';
  uploadedFileId.value = null;
  promptFile.value = null;
  isFilePrepared.value = false;
  parsedTelegramContent.value = '';
};

// Добавляем состояние для активного таба
const activeTab = ref('events');

// Определяем табы
const tabs = [
  { id: 'events', name: 'События' },
  { id: 'telegram', name: 'Telegram' },
  { id: 'help', name: 'Инструкция' }
];

// Добавляем состояние для активного таба шаблонов
const activePromptTab = ref('events');

// Определяем табы для шаблонов
const promptTabs = [
  { id: 'events', name: 'Для событий' },
  { id: 'telegram', name: 'Для Telegram' },
  { id: 'external', name: 'Для внешней статьи' }
];

// Фильтруем шаблоны для событий
const eventTemplates = computed(() => {
  return promptTemplates.filter(template => template.type === 'events');
});

// Фильтруем шаблоны для Telegram
const telegramTemplates = computed(() => {
  return promptTemplates.filter(template => template.type === 'telegram');
});

// Фильтруем шаблоны для внешних статей
const externalTemplates = computed(() => {
  return promptTemplates.filter(template => template.type === 'external');
});

// Добавляем состояние для основных табов
const activeMainTab = ref('functionality');

// Определяем основные табы
const mainTabs = [
  { id: 'functionality', name: 'Функционал' },
  { id: 'templates', name: 'Шаблоны промптов' }
];

// Добавляем функцию сброса парсинга Telegram
const resetTelegramParsing = () => {
  if (telegramParser.value) {
    telegramParser.value.reset();
  }
  handleTelegramReset();
};

// Добавляем функцию сброса для событий
const resetEvents = () => {
  isFilePrepared.value = false;
  uploadedFileId.value = null;
  promptFile.value = null;
  aiSelectedDate.value = '';
};

// Обработчик обновления контента
const handleContentUpdate = (content: string) => {
  parsedTelegramContent.value = content;
  emit('update:content', content);
};

// Обработчик результата парсинга Telegram
const handleTelegramParsed = (result: { content: string; fileId: string }) => {
  parsedTelegramContent.value = result.content;
  uploadedFileId.value = result.fileId;
  isFilePrepared.value = true;
  emit('update:content', result.content);
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
</script> 