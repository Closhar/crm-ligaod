<template>
  <div class="relative">
    <!-- Отображаемое значение в ячейке -->
    <div
      @click="openModal"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      :class="[
        options.cellClass,
        'cursor-pointer min-h-[2rem] flex items-center transition-colors',
        displayValue
          ? 'bg-blue-800 text-gray-50 hover:text-gray-200'
          : 'bg-red-100 text-gray-950 hover:text-gray-800'
      ]"
    >
      {{ displayValue || 'нет' }}
      <!-- Тултип с использованием KirhNote -->
      <Teleport to="body">
        <div
          v-if="showTooltip && tooltipData"
          :style="{
            position: 'fixed',
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            zIndex: 9999
          }"
        >
          <KirhNote
            :message="tooltipData"
            type="success"
            :duration="0"
          />
        </div>
      </Teleport>
    </div>

    <!-- Модальное окно -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <!-- Заголовок -->
        <div class="p-4 border-b sticky top-0 bg-white z-10">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">Выбор параметра для: <span class="font-normal">{{ row.title_short || 'таблицы' }}</span></h3>
            <button 
              class="text-gray-500 hover:text-gray-700"
              @click="closeModal"
            >
              <Icon name="ph:x" size="20"/>
            </button>
          </div>
        </div>
        
        <!-- Основной контент с прокруткой -->
        <div class="flex-1 overflow-y-auto p-4">
          <!-- Сообщение об ошибке -->
          <div 
            v-if="showError"
            class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ errorMessage }}</p>
              </div>
              <div class="ml-auto pl-3">
                <div class="-mx-1.5 -my-1.5">
                  <button
                    @click="showError = false"
                    class="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                  >
                    <span class="sr-only">Закрыть</span>
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Сообщение об успехе/ошибке -->
          <div 
            v-if="showMessage"
            :class="[
              'mb-4 p-4 rounded-lg',
              messageType === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            ]"
          >
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg 
                  v-if="messageType === 'success'"
                  class="h-5 w-5 text-green-400" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <svg 
                  v-else
                  class="h-5 w-5 text-red-400" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p :class="[
                  'text-sm',
                  messageType === 'success' ? 'text-green-700' : 'text-red-700'
                ]">{{ message }}</p>
              </div>
              <div class="ml-auto pl-3">
                <div class="-mx-1.5 -my-1.5">
                  <button
                    @click="showMessage = false"
                    :class="[
                      'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                      messageType === 'success' ? 'text-green-500 hover:bg-green-100 focus:ring-green-600' : 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                    ]"
                  >
                    <span class="sr-only">Закрыть</span>
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Поле поиска -->
          <div class="relative mb-4">
            <input
              type="text"
              v-model="searchQuery"
              :placeholder="options.hint || 'Введите название таблицы'"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              @input="handleSearch"
            />
            
            <!-- Список подсказок -->
            <div 
              v-if="showSuggestions && suggestions.length > 0"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
            >
              <div
                v-for="suggestion in suggestions"
                :key="suggestion.id"
                class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                @click="selectSuggestion(suggestion)"
              >
                {{ suggestion[options.displayField || 'title'] }}
              </div>
            </div>
          </div>

          <!-- Кнопки управления -->
          <div class="flex justify-end gap-2 mb-4">
            <button
              class="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2 text-lg"
              @click="closeModal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Отмена
            </button>
            <button
              v-if="selectedValue"
              class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-2 text-lg"
              @click="removeTableBinding"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Удалить привязку
            </button>
            <button
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2 text-lg"
              @click="saveValue"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Сохранить
            </button>
          </div>

          <!-- Предпросмотр таблицы -->
          <div v-if="selectedValue" class="mb-4">
            <!-- Информация о таблице -->
            <div class="mb-4 p-4 bg-gray-50 rounded-lg">
              <!-- Строка с URL и номером таблицы -->
              <div class="grid grid-cols-[1fr,auto] gap-4 items-end">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">URL</label>
                  <input 
                    type="text" 
                    v-model="selectedValue.url"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Введите URL"
                  />
                </div>
                <div class="w-32">
                  <label class="block text-sm font-medium text-gray-700 mb-1">№ таблицы</label>
                  <input 
                    type="text" 
                    v-model="selectedValue.table_no"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="№"
                  />
                </div>
              </div>

              <!-- Нижняя строка с информацией и кнопками -->
              <div class="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <!-- Левая секция: ID и редактирование -->
                <div class="flex items-center gap-4 text-base">
                  <span class="font-medium text-gray-700">ID таблицы:</span>
                  <span class="text-blue-600 font-semibold">{{ selectedValue.id || 'Нет данных' }}</span>
                  <button
                    @click="editTable"
                    class="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg flex items-center gap-2"
                    title="Редактировать таблицу"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6v-2a2 2 0 012-2h2a2 2 0 012 2v2h6" />
                    </svg>
                  </button>
                  <button
                    v-if="selectedValue.url"
                    @click="openTableUrl"
                    class="px-2 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-lg flex items-center gap-2"
                    title="Открыть таблицу"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>
                <!-- Правая секция: дата парсинга и репарсинг -->
                <div class="flex items-center gap-4 text-base">
                  <span class="font-medium text-gray-700">Последний парсинг:</span>
                  <span class="text-red-600 font-semibold">{{ formatDate(selectedValue?.last_parse_data) }}</span>
                  <button
                    @click="reparseTable"
                    :disabled="isReparsing"
                    class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg"
                    title="Репарсить таблицу"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v2a2 2 0 002 2h2m4 0h2a2 2 0 002-2V4m-6 4v12m0 0l-3-3m3 3l3-3" />
                    </svg>
                    <svg v-if="isReparsing" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ isReparsing ? 'Обновление...' : 'Репарсинг' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="overflow-x-auto">
              <div class="inline-block min-w-full align-middle">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50 sticky top-0">
                    <tr>
                      <th v-if="selectedValue.field1" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {{ selectedValue.field1 }}
                      </th>
                      <th v-if="selectedValue.field2" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {{ selectedValue.field2 }}
                      </th>
                      <th v-if="selectedValue.field3" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {{ selectedValue.field3 }}
                      </th>
                      <th v-if="selectedValue.field4" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {{ selectedValue.field4 }}
                      </th>
                      <th v-if="selectedValue.field5" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {{ selectedValue.field5 }}
                      </th>
                      <th v-if="selectedValue.field6" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {{ selectedValue.field6 }}
                      </th>
                      <th v-if="selectedValue.field7" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {{ selectedValue.field7 }}
                      </th>
                      <th v-if="selectedValue.field8" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {{ selectedValue.field8 }}
                      </th>
                      <th v-if="selectedValue.field9" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {{ selectedValue.field9 }}
                      </th>
                      <th v-if="selectedValue.field10" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {{ selectedValue.field10 }}
                      </th>
                      <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <!-- Пустой заголовок для столбца действий -->
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="content in tableContents" :key="content.id">
                      <td v-if="selectedValue.field1" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap text-left">
                        {{ content.field1 }}
                      </td>
                      <td v-if="selectedValue.field2" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap text-left">
                        {{ content.field2 }}
                      </td>
                      <td v-if="selectedValue.field3" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap text-left">
                        {{ content.field3 }}
                      </td>
                      <td v-if="selectedValue.field4" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap text-left">
                        {{ content.field4 }}
                      </td>
                      <td v-if="selectedValue.field5" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap text-left">
                        {{ content.field5 }}
                      </td>
                      <td v-if="selectedValue.field6" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap text-left">
                        {{ content.field6 }}
                      </td>
                      <td v-if="selectedValue.field7" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap text-left">
                        {{ content.field7 }}
                      </td>
                      <td v-if="selectedValue.field8" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap text-left">
                        {{ content.field8 }}
                      </td>
                      <td v-if="selectedValue.field9" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap text-left">
                        {{ content.field9 }}
                      </td>
                      <td v-if="selectedValue.field10" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap text-left">
                        {{ content.field10 }}
                      </td>
                      <td class="px-3 sm:px-6 py-4 text-sm text-gray-500 whitespace-nowrap text-left">
                        <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <button
                            @click="editContent(content)"
                            class="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                            title="Редактировать"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            @click="deleteContent(content)"
                            class="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                            title="Удалить"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Форма создания новой таблицы -->
          <div v-else class="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Или добавьте и спарсите новую таблицу</h4>
            <div class="space-y-4">
              <div class="grid grid-cols-[1fr,auto] gap-4 items-end">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">URL таблицы</label>
                  <input 
                    type="text" 
                    v-model="newTableForm.url"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Введите URL таблицы"
                  />
                </div>
                <div class="w-32">
                  <label class="block text-sm font-medium text-gray-700 mb-1">№ таблицы</label>
                  <input 
                    type="number" 
                    v-model="newTableForm.table_no"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="№"
                    min="1"
                  />
                </div>
              </div>
              <div class="flex justify-end">
                <button
                  @click="createAndParseTable"
                  :disabled="isCreating"
                  class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg"
                >
                  <svg v-if="isCreating" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {{ isCreating ? 'Создание...' : 'Создать и спарсить' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопки -->
        <div class="p-4 border-t sticky bottom-0 bg-white z-10 flex justify-end gap-2">
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования содержимого -->
    <div v-if="showEditContentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-2xl">
        <div class="p-4 border-b">
          <h3 class="text-lg font-semibold">{{ editingContent ? 'Редактировать строку' : 'Добавить строку' }}</h3>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div v-if="selectedValue?.field1" class="grid grid-cols-1 gap-2">
              <label class="block text-sm font-medium text-gray-700">{{ selectedValue.field1 }}</label>
              <input
                v-model="contentForm.field1"
                type="text"
                class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
              />
            </div>
            <div v-if="selectedValue?.field2" class="grid grid-cols-1 gap-2">
              <label class="block text-sm font-medium text-gray-700">{{ selectedValue.field2 }}</label>
              <input
                v-model="contentForm.field2"
                type="text"
                class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
              />
            </div>
            <div v-if="selectedValue?.field3" class="grid grid-cols-1 gap-2">
              <label class="block text-sm font-medium text-gray-700">{{ selectedValue.field3 }}</label>
              <input
                v-model="contentForm.field3"
                type="text"
                class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
              />
            </div>
            <div v-if="selectedValue?.field4" class="grid grid-cols-1 gap-2">
              <label class="block text-sm font-medium text-gray-700">{{ selectedValue.field4 }}</label>
              <input
                v-model="contentForm.field4"
                type="text"
                class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
              />
            </div>
            <div v-if="selectedValue?.field5" class="grid grid-cols-1 gap-2">
              <label class="block text-sm font-medium text-gray-700">{{ selectedValue.field5 }}</label>
              <input
                v-model="contentForm.field5"
                type="text"
                class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
              />
            </div>
            <div v-if="selectedValue?.field6" class="grid grid-cols-1 gap-2">
              <label class="block text-sm font-medium text-gray-700">{{ selectedValue.field6 }}</label>
              <input
                v-model="contentForm.field6"
                type="text"
                class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
              />
            </div>
            <div v-if="selectedValue?.field7" class="grid grid-cols-1 gap-2">
              <label class="block text-sm font-medium text-gray-700">{{ selectedValue.field7 }}</label>
              <input
                v-model="contentForm.field7"
                type="text"
                class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
              />
            </div>
            <div v-if="selectedValue?.field8" class="grid grid-cols-1 gap-2">
              <label class="block text-sm font-medium text-gray-700">{{ selectedValue.field8 }}</label>
              <input
                v-model="contentForm.field8"
                type="text"
                class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
              />
            </div>
            <div v-if="selectedValue?.field9" class="grid grid-cols-1 gap-2">
              <label class="block text-sm font-medium text-gray-700">{{ selectedValue.field9 }}</label>
              <input
                v-model="contentForm.field9"
                type="text"
                class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
              />
            </div>
            <div v-if="selectedValue?.field10" class="grid grid-cols-1 gap-2">
              <label class="block text-sm font-medium text-gray-700">{{ selectedValue.field10 }}</label>
              <input
                v-model="contentForm.field10"
                type="text"
                class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
              />
            </div>
          </div>
        </div>
        <div class="p-4 border-t flex justify-end space-x-3">
          <button
            @click="showEditContentModal = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            @click="saveContent"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования таблицы -->
    <div v-if="showEditTableModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] flex flex-col">
        <!-- Заголовок -->
        <div class="p-4 border-b sticky top-0 bg-white z-10">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">Редактировать таблицу</h3>
            <button 
              class="text-gray-500 hover:text-gray-700"
              @click="showEditTableModal = false"
            >
              <Icon name="ph:x" size="20"/>
            </button>
          </div>
        </div>

        <!-- Основной контент с прокруткой -->
        <div class="flex-1 overflow-y-auto p-4">
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Название таблицы</label>
              <input
                v-model="tableForm.title"
                type="text"
                class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
                placeholder="Введите название таблицы"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Описание</label>
              <textarea
                v-model="tableForm.description"
                rows="2"
                class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
                placeholder="Введите описание таблицы"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Заголовки полей</label>
              <div class="grid grid-cols-5 gap-2">
                <input v-for="i in 20" :key="i" :placeholder="`Поле ${i}`" v-model="tableForm[`field${i}`]" type="text"
                  class="rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm" />
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопки -->
        <div class="p-4 border-t sticky bottom-0 bg-white z-10 flex justify-end gap-2">
          <button
            @click="showEditTableModal = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            @click="saveTable"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import debounce from 'lodash/debounce'
import { withDefaults } from 'vue'
import KirhNote from '~/components/kirh/fields/KirhNote.vue'

// Добавляем типы для suggestion
interface Suggestion {
  id: number
  title: string
  url?: string
  table_no?: string
  last_parse_data?: string
  [key: string]: any
}

const props = withDefaults(defineProps<{
  value: string | number | null
  error: string | null
  options: {
    readonly?: boolean
    cellClass?: string
    hint?: string
    apiUrl?: string
    searchField?: string
    valueField?: string
    displayField?: string
    displayValueField?: string
    displayTitleField?: string
    saveValueField?: string
    tableName?: string
    apiEndpoint?: string
    title?: string
  }
  row?: Record<string, any>
}>(), {
  row: () => ({}),
  value: null,
  error: null
})

// Добавляем типы для данных таблицы
interface TableField {
  id: number
  field1?: string
  field2?: string
  field3?: string
  field4?: string
  field5?: string
  field6?: string
  field7?: string
  field8?: string
  field9?: string
  field10?: string
  [key: string]: any
}

interface TableContent {
  id: number
  table_id: number
  field1?: string
  field2?: string
  field3?: string
  field4?: string
  field5?: string
  field6?: string
  field7?: string
  field8?: string
  field9?: string
  field10?: string
  [key: string]: any
}

const emit = defineEmits(['update:value', 'update:row', 'refresh'])

// Состояния
const showModal = ref(false)
const searchQuery = ref('')
const suggestions = ref<TableField[]>([])
const showSuggestions = ref(false)
const selectedValue = ref<TableField | null>(null)
const displayValue = ref('')
const tableContents = ref<TableContent[]>([])
const showTooltip = ref(false)
const tooltipPosition = ref({ top: 0, left: 0 })
const tooltipData = ref('')

// Состояния для сообщений
const message = ref('')
const showMessage = ref(false)
const messageType = ref<'success' | 'error'>('success')

// Обновляем обработчик наведения мыши
const handleMouseEnter = async (event: MouseEvent) => {
  if (!displayValue.value) return
  
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  tooltipPosition.value = {
    top: rect.top + window.scrollY,
    left: rect.right + window.scrollX + 8
  }

  // Если у нас есть ID, загружаем данные для тултипа
  if (props.value && props.options.apiEndpoint) {
    try {
      const response = await fetch(`${api}${props.options.apiEndpoint}/${props.value}`)
      const data = await response.json()
      if (data && data.title) {
        tooltipData.value = `${data.title} - Дата парсинга: ${data.last_parse_data ? formatDate(data.last_parse_data) : 'нет'}`
        showTooltip.value = true
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных для тултипа:', error)
    }
  }
}

const handleMouseLeave = () => {
  showTooltip.value = false
  tooltipData.value = ''
}

// Получаем конфигурацию
const config = useRuntimeConfig()
const api = config.public.API_URL

// Добавляем состояние для данных тултипа
const isReparsing = ref(false)

// Добавляем состояние для сообщений об ошибках
const errorMessage = ref('')
const showError = ref(false)

// Добавляем состояния для редактирования содержимого
const showEditContentModal = ref(false)
const editingContent = ref<TableContent | null>(null)
const contentForm = ref<{
  table_id: number
  field1: string
  field2: string
  field3: string
  field4: string
  field5: string
  field6: string
  field7: string
  field8: string
  field9: string
  field10: string
}>({
  table_id: 0,
  field1: '',
  field2: '',
  field3: '',
  field4: '',
  field5: '',
  field6: '',
  field7: '',
  field8: '',
  field9: '',
  field10: ''
})

// Добавляем состояния для редактирования таблицы
const showEditTableModal = ref(false)
const tableForm = ref({
  title: '',
  description: '',
  field1: '',
  field2: '',
  field3: '',
  field4: '',
  field5: '',
  field6: '',
  field7: '',
  field8: '',
  field9: '',
  field10: '',
  field11: '',
  field12: '',
  field13: '',
  field14: '',
  field15: '',
  field16: '',
  field17: '',
  field18: '',
  field19: '',
  field20: ''
})

// Добавляем новые состояния после существующих ref
const newTableForm = ref({
  url: '',
  table_no: ''
})
const isCreating = ref(false)

// Функция для получения значения из вложенного поля
const getNestedValue = (obj: any, path: string) => {
  if (!path) return null
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

// Загрузка содержимого таблицы
const fetchTableContents = async (tableId: number) => {
  try {
    console.log('Fetching table contents for ID:', tableId)
    const response = await fetch(`${api}/api/parse-table-contents?table_id=${tableId}&per_page=1000`)
    if (!response.ok) throw new Error('Ошибка при загрузке содержимого')
    const data = await response.json()
    console.log('Received table contents:', data)
    
    if (data && Array.isArray(data.data)) {
      tableContents.value = data.data.map((item: any) => ({
        id: item.id,
        table_id: item.table_id,
        field1: item.field1 || '',
        field2: item.field2 || '',
        field3: item.field3 || '',
        field4: item.field4 || '',
        field5: item.field5 || '',
        field6: item.field6 || '',
        field7: item.field7 || '',
        field8: item.field8 || '',
        field9: item.field9 || '',
        field10: item.field10 || ''
      }))
      console.log('Processed table contents:', tableContents.value)
    } else {
      console.error('Invalid data format received:', data)
      tableContents.value = []
      showErrorMessage('Получен некорректный формат данных')
    }
  } catch (error) {
    console.error('Ошибка при загрузке содержимого:', error)
    tableContents.value = []
    showErrorMessage('Ошибка при загрузке содержимого таблицы')
  }
}

// Инициализация при монтировании
onMounted(async () => {
  console.log('Component mounted with value:', props.value)
  console.log('Row data:', props.row)
  console.log('Row data details:', {
    id: props.row?.id,
    title: props.row?.title,
    title_short: props.row?.title_short,
    all_fields: props.row
  })
  console.log('DisplayValueField:', props.options.displayValueField)
  
  // Если есть значение в row, используем его
  if (props.row && props.options.displayValueField) {
    const fieldValue = props.row[props.options.displayValueField]
    console.log('Using row field value:', fieldValue)
    displayValue.value = fieldValue || ''
  }
  // Если нет значения в row, но есть value, загружаем данные
  else if (props.value && props.options.apiEndpoint) {
    try {
      const response = await fetch(`${api}${props.options.apiEndpoint}/${props.value}`)
      const data = await response.json()
      console.log('Initial data load:', data)
      
      if (data && data.id) {
        displayValue.value = data.id
        console.log('Set initial display value:', displayValue.value)
      }
    } catch (error) {
      console.error('Error loading initial value:', error)
    }
  }
})

// Открытие модального окна
const openModal = () => {
  console.log('Opening modal with value:', props.value)
  console.log('API endpoint:', props.options.apiEndpoint)
  console.log('Display field:', props.options.displayField)
  
  showModal.value = true
  if (props.value) {
    // Загружаем данные по ID
    const url = `${api}${props.options.apiEndpoint}/${props.value}`
    console.log('Fetching data from:', url)
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log('API response:', data)
        if (data && data.title) {
          const displayValue = data[props.options.displayField || 'title']
          console.log('Setting search query to:', displayValue)
          searchQuery.value = displayValue
          selectedValue.value = {
            ...data,
            url: data.url || '',
            table_no: data.table_no || '',
            last_parse_data: data.last_parse_data || null
          }
          // Загружаем содержимое таблицы
          fetchTableContents(data.id)
        } else {
          console.error('Invalid data format:', data)
          searchQuery.value = ''
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error)
        searchQuery.value = ''
      })
  } else {
    console.log('No value provided, clearing search')
    searchQuery.value = ''
    selectedValue.value = null
    tableContents.value = []
  }
}

// Обработчик поиска с debounce
const handleSearch = debounce(async () => {
  if (searchQuery.value.length < 2) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }

  try {
    const url = `${api}${props.options.apiEndpoint}?q=${encodeURIComponent(searchQuery.value)}`
    console.log('Searching with URL:', url)
    
    const response = await fetch(url)
    const data = await response.json()
    console.log('Search results:', data)
    
    // Проверяем наличие данных в пагинированном ответе
    if (data && Array.isArray(data.data)) {
      suggestions.value = data.data
      showSuggestions.value = true
    } else {
      suggestions.value = []
      showSuggestions.value = false
    }
  } catch (error) {
    console.error('Ошибка при поиске:', error)
    suggestions.value = []
    showSuggestions.value = false
  }
}, 300)

// Выбор значения из подсказок
const selectSuggestion = async (suggestion: Suggestion) => {
  console.log('Selected suggestion:', suggestion)
  
  try {
    // Загружаем полные данные таблицы по ID
    const response = await fetch(`${api}${props.options.apiEndpoint}/${suggestion.id}`)
    if (!response.ok) throw new Error('Ошибка при загрузке данных таблицы')
    
    const tableData = await response.json()
    console.log('Loaded table data:', tableData)
    
  selectedValue.value = {
      ...tableData,
      url: tableData.url || '',
      table_no: tableData.table_no || '',
      last_parse_data: tableData.last_parse_data || null
  }
    
    const displayValue = tableData[props.options.displayField || 'title']
  console.log('Setting search query to:', displayValue)
  searchQuery.value = displayValue
  showSuggestions.value = false
    
  // Загружаем содержимое таблицы
    await fetchTableContents(suggestion.id)
  } catch (error) {
    console.error('Ошибка при загрузке данных таблицы:', error)
    showStatusMessage('Ошибка при загрузке данных таблицы', 'error')
  }
}

// Закрытие модального окна
const closeModal = () => {
  showModal.value = false
  showSuggestions.value = false
  searchQuery.value = ''
  selectedValue.value = null
  tableContents.value = []
}

// Сохранение значения
const saveValue = async () => {
  if (!selectedValue.value) {
    showStatusMessage('Пожалуйста, выберите таблицу из списка', 'error')
    return
  }

  try {
    console.log('Saving selected value:', selectedValue.value)
    
    // Получаем ID для сохранения
    const valueToSave = selectedValue.value[props.options.valueField || 'id']
    const displayValueField = props.options.displayValueField || ''
    
    console.log('Value to save:', valueToSave)
    
    // Обновляем значение в базе данных
    const response = await fetch(`${api}/api/competitions/${props.row.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        [displayValueField]: valueToSave
      })
    })

    if (!response.ok) {
      throw new Error('Ошибка при сохранении в базу данных')
    }

    // Эмитим событие с ID для сохранения
    emit('update:value', valueToSave)
    
    // Обновляем строку в таблице
    const updatedRow = { 
      ...props.row, 
      [displayValueField]: valueToSave,
      // Добавляем все поля из selectedValue для обновления данных в родительской таблице
      ...selectedValue.value
    }
    emit('update:row', updatedRow)
    
    // Эмитим событие для обновления всей таблицы
    emit('refresh')
    
    // Обновляем отображаемое значение - используем ID
    displayValue.value = valueToSave || ''
    
    console.log('Value saved successfully')
    showStatusMessage('Значение успешно сохранено', 'success')
    closeModal()
  } catch (error) {
    console.error('Ошибка при сохранении:', error)
    showStatusMessage(error instanceof Error ? error.message : 'Произошла ошибка при сохранении значения', 'error')
  }
}

// Следим за изменением значения
watch(() => props.value, async (newValue) => {
  console.log('Value changed:', newValue)
  if (props.options.displayValueField) {
    const fieldValue = props.row[props.options.displayValueField]
    console.log('Field value on change:', fieldValue)
    displayValue.value = fieldValue || ''
  } else {
    displayValue.value = ''
  }
})

// Следим за изменением строки
watch(() => props.row, (newRow) => {
  console.log('Row changed:', newRow)
  if (props.options.displayValueField) {
    const fieldValue = newRow[props.options.displayValueField]
    console.log('Field value on row change:', fieldValue)
    displayValue.value = fieldValue || ''
  }
}, { deep: true })

// Функция для отображения ошибки
const showErrorMessage = (message: string) => {
  errorMessage.value = message
  showError.value = true
  setTimeout(() => {
    showError.value = false
  }, 5000)
}

// Функция для репарсинга таблицы
const reparseTable = async () => {
  if (!selectedValue.value?.id) {
    showStatusMessage('Не выбрана таблица для репарсинга', 'error')
    return
  }
  
  try {
    isReparsing.value = true
    
    const response = await fetch(`${api}/api/parse-tables/reparse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        parse_table_id: selectedValue.value.id,
        url: selectedValue.value.url,
        table_no: selectedValue.value.table_no
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Ошибка при репарсинге таблицы')
    }

    if (!data.success) {
      throw new Error(data.message || 'Ошибка при репарсинге таблицы')
    }

    // Ждем немного, чтобы дать серверу время на обработку
    await new Promise(resolve => setTimeout(resolve, 1000))

    // После успешного репарсинга обновляем содержимое таблицы
    await fetchTableContents(selectedValue.value.id)
    
    // Обновляем данные таблицы, включая last_parse_date
    const updatedTableResponse = await fetch(`${api}${props.options.apiEndpoint}/${selectedValue.value.id}`)
    if (!updatedTableResponse.ok) {
      throw new Error('Ошибка при обновлении данных таблицы')
    }
    const updatedTableData = await updatedTableResponse.json()
    selectedValue.value = updatedTableData

    // Обновляем данные в родительской таблице
    const updatedRow = { 
      ...props.row, 
      [props.options.displayValueField]: selectedValue.value.id,
      ...selectedValue.value
    }
    emit('update:row', updatedRow)
    
    // Эмитим событие для обновления всей таблицы
    emit('refresh')
    
    showStatusMessage('Таблица успешно обновлена', 'success')
  } catch (error) {
    console.error('Ошибка при репарсинге:', error)
    showStatusMessage(error instanceof Error ? error.message : 'Произошла ошибка при обновлении таблицы', 'error')
  } finally {
    isReparsing.value = false
  }
}

// Функция для форматирования даты
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Нет данных'
  const date = new Date(dateString)
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(',', '')
}

// Функция для отображения сообщения
const showStatusMessage = (text: string, type: 'success' | 'error') => {
  message.value = text
  messageType.value = type
  showMessage.value = true
  setTimeout(() => {
    showMessage.value = false
  }, 5000)
}

// Функция редактирования содержимого
const editContent = (content: TableContent) => {
  editingContent.value = content
  contentForm.value = {
    table_id: content.table_id,
    field1: content.field1 || '',
    field2: content.field2 || '',
    field3: content.field3 || '',
    field4: content.field4 || '',
    field5: content.field5 || '',
    field6: content.field6 || '',
    field7: content.field7 || '',
    field8: content.field8 || '',
    field9: content.field9 || '',
    field10: content.field10 || ''
  }
  showEditContentModal.value = true
}

// Функция удаления содержимого
const deleteContent = async (content: TableContent) => {
  if (!confirm('Вы уверены, что хотите удалить эту строку?')) return

  try {
    const response = await fetch(`${api}/api/parse-table-contents/${content.id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })

    if (!response.ok) throw new Error('Ошибка при удалении строки')
    
    if (selectedValue.value) {
      await fetchTableContents(selectedValue.value.id)
    }
    showStatusMessage('Строка успешно удалена', 'success')
  } catch (error) {
    console.error('Ошибка при удалении строки:', error)
    showStatusMessage(error instanceof Error ? error.message : 'Не удалось удалить строку', 'error')
  }
}

// Функция сохранения содержимого
const saveContent = async () => {
  if (!selectedValue.value) return

  try {
    contentForm.value.table_id = selectedValue.value.id
    
    const url = editingContent.value
      ? `${api}/api/parse-table-contents/${editingContent.value.id}`
      : `${api}/api/parse-table-contents`
    
    const method = editingContent.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(contentForm.value)
    })

    if (!response.ok) throw new Error('Ошибка при сохранении строки')
    
    if (selectedValue.value) {
      await fetchTableContents(selectedValue.value.id)
    }
    showEditContentModal.value = false
    editingContent.value = null
    contentForm.value = {
      table_id: 0,
      field1: '',
      field2: '',
      field3: '',
      field4: '',
      field5: '',
      field6: '',
      field7: '',
      field8: '',
      field9: '',
      field10: ''
    }
    showStatusMessage('Строка успешно сохранена', 'success')
  } catch (error) {
    console.error('Ошибка при сохранении строки:', error)
    showStatusMessage(error instanceof Error ? error.message : 'Не удалось сохранить строку', 'error')
  }
}

// Функция редактирования таблицы
const editTable = () => {
  if (!selectedValue.value) return
  tableForm.value = {
    title: selectedValue.value.title || '',
    description: selectedValue.value.description || '',
    field1: selectedValue.value.field1 || '',
    field2: selectedValue.value.field2 || '',
    field3: selectedValue.value.field3 || '',
    field4: selectedValue.value.field4 || '',
    field5: selectedValue.value.field5 || '',
    field6: selectedValue.value.field6 || '',
    field7: selectedValue.value.field7 || '',
    field8: selectedValue.value.field8 || '',
    field9: selectedValue.value.field9 || '',
    field10: selectedValue.value.field10 || '',
    field11: selectedValue.value.field11 || '',
    field12: selectedValue.value.field12 || '',
    field13: selectedValue.value.field13 || '',
    field14: selectedValue.value.field14 || '',
    field15: selectedValue.value.field15 || '',
    field16: selectedValue.value.field16 || '',
    field17: selectedValue.value.field17 || '',
    field18: selectedValue.value.field18 || '',
    field19: selectedValue.value.field19 || '',
    field20: selectedValue.value.field20 || ''
  }
  showEditTableModal.value = true
}

// Функция сохранения таблицы
const saveTable = async () => {
  if (!selectedValue.value) return

  try {
    const response = await fetch(`${api}${props.options.apiEndpoint}/${selectedValue.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(tableForm.value)
    })

    if (!response.ok) throw new Error('Ошибка при сохранении таблицы')
    
    const updatedTable = await response.json()
    selectedValue.value = {
      ...selectedValue.value,
      ...updatedTable
    }

    // ДОБАВЛЕНО: повторно загружаем данные таблицы и содержимое
    const refreshed = await fetch(`${api}${props.options.apiEndpoint}/${selectedValue.value.id}`)
    if (refreshed.ok) {
      const refreshedData = await refreshed.json()
      selectedValue.value = refreshedData
      searchQuery.value = refreshedData[props.options.displayField || 'title'] || ''
      await fetchTableContents(selectedValue.value.id)
    }
    
    // Обновляем данные в родительской таблице
    const displayValueField = props.options.displayValueField || ''
    const updatedRow = { 
      ...props.row, 
      [displayValueField]: selectedValue.value.id,
      ...selectedValue.value
    }
    emit('update:row', updatedRow)
    
    // Эмитим событие для обновления всей таблицы
    emit('refresh')
    
    showEditTableModal.value = false
    showStatusMessage('Таблица успешно обновлена', 'success')
  } catch (error) {
    console.error('Ошибка при сохранении таблицы:', error)
    showStatusMessage(error instanceof Error ? error.message : 'Не удалось сохранить таблицу', 'error')
  }
}

// Добавляем функцию removeTableBinding перед функцией saveValue
const removeTableBinding = async () => {
  try {
    const displayValueField = props.options.displayValueField || ''
    
    // Обновляем значение в базе данных
    const response = await fetch(`${api}/api/competitions/${props.row.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        [displayValueField]: null
      })
    })

    if (!response.ok) {
      throw new Error('Ошибка при удалении привязки')
    }

    // Эмитим событие с null для сохранения
    emit('update:value', null)
    
    // Обновляем строку в таблице
    const updatedRow = { 
      ...props.row, 
      [displayValueField]: null
    }
    emit('update:row', updatedRow)
    
    // Эмитим событие для обновления всей таблицы
    emit('refresh')
    
    // Обновляем отображаемое значение
    displayValue.value = ''
    
    showStatusMessage('Привязка успешно удалена', 'success')
    closeModal()
  } catch (error) {
    console.error('Ошибка при удалении привязки:', error)
    showStatusMessage(error instanceof Error ? error.message : 'Произошла ошибка при удалении привязки', 'error')
  }
}

// Добавляем новую функцию перед закрывающим тегом script
const createAndParseTable = async () => {
  if (!newTableForm.value.url || !newTableForm.value.table_no) {
    showStatusMessage('Пожалуйста, заполните все поля', 'error')
    return
  }

  try {
    isCreating.value = true

    // Создаем и парсим таблицу одним запросом
    const response = await fetch(`${api}/api/parse-tables/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        url: newTableForm.value.url,
        table_no: newTableForm.value.table_no
      })
    })

    if (!response.ok) {
      throw new Error('Ошибка при создании и парсинге таблицы')
    }

    const responseData = await response.json()

    if (!responseData.success) {
      throw new Error(responseData.message || 'Ошибка при создании и парсинге таблицы')
    }

    // Получаем данные таблицы из ответа
    const tableData = responseData.data.table
    if (!tableData || !tableData.id) {
      throw new Error('Не удалось получить данные созданной таблицы')
    }

    // Устанавливаем данные таблицы
    selectedValue.value = tableData
    searchQuery.value = tableData[props.options.displayField || 'title'] || ''

    // Загружаем содержимое таблицы
    await fetchTableContents(tableData.id)

    // Обновляем данные в родительской таблице
    const displayValueField = props.options.displayValueField || ''
    const updatedRow = { 
      ...props.row, 
      [displayValueField]: tableData.id,
      ...tableData
    }
    emit('update:row', updatedRow)
    
    // Эмитим событие для обновления всей таблицы
    emit('refresh')

    showStatusMessage('Таблица успешно создана и спарсена', 'success')
  } catch (error) {
    console.error('Ошибка при создании и парсинге таблицы:', error)
    showStatusMessage(error instanceof Error ? error.message : 'Произошла ошибка при создании таблицы', 'error')
  } finally {
    isCreating.value = false
  }
}

// Функция для открытия ссылки на таблицу
const openTableUrl = () => {
  if (selectedValue.value?.url) {
    window.open(selectedValue.value.url, '_blank')
  }
}
</script>

<style scoped>
/* Стили для тултипа */
:deep(.kirh-note) {
  background-color: white !important;
  color: #1f2937 !important;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  white-space: pre-wrap !important;
  max-width: 300px;
  word-break: break-word;
}

:deep(.kirh-note .font-semibold) {
  color: #1e40af;
  margin-bottom: 0.25rem;
}

:deep(.kirh-note .text-gray-600) {
  color: #4b5563;
}

:deep(.kirh-note.success) {
  background-color: #10B981 !important;
  color: white !important;
}

:deep(.kirh-note.success *) {
  color: white !important;
}
</style> 