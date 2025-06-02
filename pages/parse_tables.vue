<template>
  <header class="bg-gray-50shadow-sm border-b border-gray-300">
    <div class="px-6 pt-4">
      <div class="flex items-start justify-between">
        <Head :breadcrumbs="breadcrumbs || []" :icon="p_icon || null" :title="p_description || null" :show_breadcrumbs="'true'"/>
      </div>
    </div>
  </header>

  <div v-if="isAuthenticated" class="p-2 sm:p-6">
    <div class="bg-white rounded-lg shadow">
      <div class="p-4">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-4">
          <h2 class="text-lg font-semibold">Спортивные таблицы</h2>
          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              @click="showParseModal = true"
              class="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Парсинг таблицы
            </button>
            <button
              @click="showAddTableModal = true"
              class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Добавить таблицу
            </button>
          </div>
        </div>

        <div class="overflow-x-auto -mx-4 sm:mx-0">
          <div class="inline-block min-w-full align-middle">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                  <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
                  <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="table in tables" :key="table.id">
                  <td class="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ table.id }}</td>
                  <td class="px-3 sm:px-6 py-4 text-sm text-gray-900">{{ table.title }}</td>
                  <td class="px-3 sm:px-6 py-4 text-sm text-gray-500">{{ table.description }}</td>
                  <td class="px-3 sm:px-6 py-4 text-sm text-gray-500">
                    <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        @click="editTable(table)"
                        class="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                        title="Редактировать"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        @click="openTableContents(table)"
                        class="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                        title="Содержимое"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                        </svg>
                      </button>
                      <button
                        @click="deleteTable(table)"
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
    </div>
  </div>

  <!-- Модальное окно добавления/редактирования таблицы -->
  <div v-if="showAddTableModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div class="bg-white rounded-lg w-full max-w-2xl mx-4 my-8">
      <div class="p-4 border-b sticky top-0 bg-white z-10">
        <h3 class="text-lg font-semibold">{{ editingTable ? 'Редактировать таблицу' : 'Добавить таблицу' }}</h3>
      </div>
      <div class="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Название таблицы
            </label>
            <input
              v-model="tableForm.title"
              type="text"
              class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              v-model="tableForm.description"
              rows="3"
              class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Заголовки полей
            </label>
            <div class="grid grid-cols-4 gap-4">
              <div>
                <input
                  v-model="tableForm.field1"
                  type="text"
                  placeholder="Поле 1"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  v-model="tableForm.field2"
                  type="text"
                  placeholder="Поле 2"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  v-model="tableForm.field3"
                  type="text"
                  placeholder="Поле 3"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  v-model="tableForm.field4"
                  type="text"
                  placeholder="Поле 4"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  v-model="tableForm.field5"
                  type="text"
                  placeholder="Поле 5"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  v-model="tableForm.field6"
                  type="text"
                  placeholder="Поле 6"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  v-model="tableForm.field7"
                  type="text"
                  placeholder="Поле 7"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  v-model="tableForm.field8"
                  type="text"
                  placeholder="Поле 8"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  v-model="tableForm.field9"
                  type="text"
                  placeholder="Поле 9"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  v-model="tableForm.field10"
                  type="text"
                  placeholder="Поле 10"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  v-model="tableForm.field11"
                  type="text"
                  placeholder="Поле 11"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  v-model="tableForm.field12"
                  type="text"
                  placeholder="Поле 12"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  v-model="tableForm.field13"
                  type="text"
                  placeholder="Поле 13"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  v-model="tableForm.field14"
                  type="text"
                  placeholder="Поле 14"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  v-model="tableForm.field15"
                  type="text"
                  placeholder="Поле 15"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  v-model="tableForm.field16"
                  type="text"
                  placeholder="Поле 16"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  v-model="tableForm.field17"
                  type="text"
                  placeholder="Поле 17"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  v-model="tableForm.field18"
                  type="text"
                  placeholder="Поле 18"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  v-model="tableForm.field19"
                  type="text"
                  placeholder="Поле 19"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  v-model="tableForm.field20"
                  type="text"
                  placeholder="Поле 20"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="p-4 border-t sticky bottom-0 bg-white z-10 flex justify-end space-x-3">
        <button
          @click="showAddTableModal = false"
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

  <!-- Модальное окно содержимого таблицы -->
  <div v-if="showTableContentsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
    <div class="bg-white rounded-lg w-full max-w-4xl mx-auto my-4 sm:my-8">
      <div class="p-4 border-b bg-white">
        <h3 class="text-lg font-semibold">Содержимое таблицы: {{ selectedTable?.title }}</h3>
      </div>
      <div class="p-4 max-h-[calc(100vh-200px)] overflow-y-auto pb-20">
        <div class="mb-4">
          <button
            @click="showAddContentModal = true"
            class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Добавить строку
          </button>
        </div>
        <div class="overflow-x-auto">
          <div class="inline-block min-w-full align-middle">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th v-if="selectedTable?.field1" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ selectedTable.field1 }}
                  </th>
                  <th v-if="selectedTable?.field2" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ selectedTable.field2 }}
                  </th>
                  <th v-if="selectedTable?.field3" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ selectedTable.field3 }}
                  </th>
                  <th v-if="selectedTable?.field4" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ selectedTable.field4 }}
                  </th>
                  <th v-if="selectedTable?.field5" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ selectedTable.field5 }}
                  </th>
                  <th v-if="selectedTable?.field6" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ selectedTable.field6 }}
                  </th>
                  <th v-if="selectedTable?.field7" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ selectedTable.field7 }}
                  </th>
                  <th v-if="selectedTable?.field8" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ selectedTable.field8 }}
                  </th>
                  <th v-if="selectedTable?.field9" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ selectedTable.field9 }}
                  </th>
                  <th v-if="selectedTable?.field10" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ selectedTable.field10 }}
                  </th>
                  <th v-if="selectedTable?.field11" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ selectedTable.field11 }}
                  </th>
                  <th v-if="selectedTable?.field12" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ selectedTable.field12 }}
                  </th>
                  <th v-if="selectedTable?.field13" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ selectedTable.field13 }}
                  </th>
                  <th v-if="selectedTable?.field14" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ selectedTable.field14 }}
                  </th>
                  <th v-if="selectedTable?.field15" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ selectedTable.field15 }}
                  </th>
                  <th v-if="selectedTable?.field16" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ selectedTable.field16 }}
                  </th>
                  <th v-if="selectedTable?.field17" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ selectedTable.field17 }}
                  </th>
                  <th v-if="selectedTable?.field18" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ selectedTable.field18 }}
                  </th>
                  <th v-if="selectedTable?.field19" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ selectedTable.field19 }}
                  </th>
                  <th v-if="selectedTable?.field20" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ selectedTable.field20 }}
                  </th>
                  <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="content in tableContents" :key="content.id">
                  <td v-if="selectedTable?.field1" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {{ content.field1 }}
                  </td>
                  <td v-if="selectedTable?.field2" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {{ content.field2 }}
                  </td>
                  <td v-if="selectedTable?.field3" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {{ content.field3 }}
                  </td>
                  <td v-if="selectedTable?.field4" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {{ content.field4 }}
                  </td>
                  <td v-if="selectedTable?.field5" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {{ content.field5 }}
                  </td>
                  <td v-if="selectedTable?.field6" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {{ content.field6 }}
                  </td>
                  <td v-if="selectedTable?.field7" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {{ content.field7 }}
                  </td>
                  <td v-if="selectedTable?.field8" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {{ content.field8 }}
                  </td>
                  <td v-if="selectedTable?.field9" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {{ content.field9 }}
                  </td>
                  <td v-if="selectedTable?.field10" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {{ content.field10 }}
                  </td>
                  <td v-if="selectedTable?.field11" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {{ content.field11 }}
                  </td>
                  <td v-if="selectedTable?.field12" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {{ content.field12 }}
                  </td>
                  <td v-if="selectedTable?.field13" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {{ content.field13 }}
                  </td>
                  <td v-if="selectedTable?.field14" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {{ content.field14 }}
                  </td>
                  <td v-if="selectedTable?.field15" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {{ content.field15 }}
                  </td>
                  <td v-if="selectedTable?.field16" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {{ content.field16 }}
                  </td>
                  <td v-if="selectedTable?.field17" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {{ content.field17 }}
                  </td>
                  <td v-if="selectedTable?.field18" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {{ content.field18 }}
                  </td>
                  <td v-if="selectedTable?.field19" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {{ content.field19 }}
                  </td>
                  <td v-if="selectedTable?.field20" class="px-3 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {{ content.field20 }}
                  </td>
                  <td class="px-3 sm:px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
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
      <div class="p-4 border-t bg-white">
        <button
          @click="showTableContentsModal = false"
          class="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Закрыть
        </button>
      </div>
    </div>
  </div>

  <!-- Модальное окно добавления/редактирования содержимого -->
  <div v-if="showAddContentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
    <div class="bg-white rounded-lg w-full max-w-2xl mx-auto my-4 sm:my-8">
      <div class="p-4 border-b sticky top-0 bg-white z-10">
        <h3 class="text-lg font-semibold">{{ editingContent ? 'Редактировать строку' : 'Добавить строку' }}</h3>
      </div>
      <div class="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        <div class="space-y-4">
          <div v-if="selectedTable?.field1" class="grid grid-cols-1 gap-2">
            <label class="block text-sm font-medium text-gray-700">{{ selectedTable.field1 }}</label>
            <input
              v-model="contentForm.field1"
              type="text"
              class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
            />
          </div>
          <div v-if="selectedTable?.field2" class="grid grid-cols-1 gap-2">
            <label class="block text-sm font-medium text-gray-700">{{ selectedTable.field2 }}</label>
            <input
              v-model="contentForm.field2"
              type="text"
              class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
            />
          </div>
          <div v-if="selectedTable?.field3" class="grid grid-cols-1 gap-2">
            <label class="block text-sm font-medium text-gray-700">{{ selectedTable.field3 }}</label>
            <input
              v-model="contentForm.field3"
              type="text"
              class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
            />
          </div>
          <div v-if="selectedTable?.field4" class="grid grid-cols-1 gap-2">
            <label class="block text-sm font-medium text-gray-700">{{ selectedTable.field4 }}</label>
            <input
              v-model="contentForm.field4"
              type="text"
              class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
            />
          </div>
          <div v-if="selectedTable?.field5" class="grid grid-cols-1 gap-2">
            <label class="block text-sm font-medium text-gray-700">{{ selectedTable.field5 }}</label>
            <input
              v-model="contentForm.field5"
              type="text"
              class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
            />
          </div>
          <div v-if="selectedTable?.field6" class="grid grid-cols-1 gap-2">
            <label class="block text-sm font-medium text-gray-700">{{ selectedTable.field6 }}</label>
            <input
              v-model="contentForm.field6"
              type="text"
              class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
            />
          </div>
          <div v-if="selectedTable?.field7" class="grid grid-cols-1 gap-2">
            <label class="block text-sm font-medium text-gray-700">{{ selectedTable.field7 }}</label>
            <input
              v-model="contentForm.field7"
              type="text"
              class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
            />
          </div>
          <div v-if="selectedTable?.field8" class="grid grid-cols-1 gap-2">
            <label class="block text-sm font-medium text-gray-700">{{ selectedTable.field8 }}</label>
            <input
              v-model="contentForm.field8"
              type="text"
              class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
            />
          </div>
          <div v-if="selectedTable?.field9" class="grid grid-cols-1 gap-2">
            <label class="block text-sm font-medium text-gray-700">{{ selectedTable.field9 }}</label>
            <input
              v-model="contentForm.field9"
              type="text"
              class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
            />
          </div>
          <div v-if="selectedTable?.field10" class="grid grid-cols-1 gap-2">
            <label class="block text-sm font-medium text-gray-700">{{ selectedTable.field10 }}</label>
            <input
              v-model="contentForm.field10"
              type="text"
              class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
            />
          </div>
          <div v-if="selectedTable?.field11" class="grid grid-cols-1 gap-2">
            <label class="block text-sm font-medium text-gray-700">{{ selectedTable.field11 }}</label>
            <input
              v-model="contentForm.field11"
              type="text"
              class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
            />
          </div>
          <div v-if="selectedTable?.field12" class="grid grid-cols-1 gap-2">
            <label class="block text-sm font-medium text-gray-700">{{ selectedTable.field12 }}</label>
            <input
              v-model="contentForm.field12"
              type="text"
              class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
            />
          </div>
          <div v-if="selectedTable?.field13" class="grid grid-cols-1 gap-2">
            <label class="block text-sm font-medium text-gray-700">{{ selectedTable.field13 }}</label>
            <input
              v-model="contentForm.field13"
              type="text"
              class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
            />
          </div>
          <div v-if="selectedTable?.field14" class="grid grid-cols-1 gap-2">
            <label class="block text-sm font-medium text-gray-700">{{ selectedTable.field14 }}</label>
            <input
              v-model="contentForm.field14"
              type="text"
              class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
            />
          </div>
          <div v-if="selectedTable?.field15" class="grid grid-cols-1 gap-2">
            <label class="block text-sm font-medium text-gray-700">{{ selectedTable.field15 }}</label>
            <input
              v-model="contentForm.field15"
              type="text"
              class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
            />
          </div>
          <div v-if="selectedTable?.field16" class="grid grid-cols-1 gap-2">
            <label class="block text-sm font-medium text-gray-700">{{ selectedTable.field16 }}</label>
            <input
              v-model="contentForm.field16"
              type="text"
              class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
            />
          </div>
          <div v-if="selectedTable?.field17" class="grid grid-cols-1 gap-2">
            <label class="block text-sm font-medium text-gray-700">{{ selectedTable.field17 }}</label>
            <input
              v-model="contentForm.field17"
              type="text"
              class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
            />
          </div>
          <div v-if="selectedTable?.field18" class="grid grid-cols-1 gap-2">
            <label class="block text-sm font-medium text-gray-700">{{ selectedTable.field18 }}</label>
            <input
              v-model="contentForm.field18"
              type="text"
              class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
            />
          </div>
          <div v-if="selectedTable?.field19" class="grid grid-cols-1 gap-2">
            <label class="block text-sm font-medium text-gray-700">{{ selectedTable.field19 }}</label>
            <input
              v-model="contentForm.field19"
              type="text"
              class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
            />
          </div>
          <div v-if="selectedTable?.field20" class="grid grid-cols-1 gap-2">
            <label class="block text-sm font-medium text-gray-700">{{ selectedTable.field20 }}</label>
            <input
              v-model="contentForm.field20"
              type="text"
              class="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm"
            />
          </div>
        </div>
      </div>
      <div class="p-4 border-t sticky bottom-0 bg-white z-10 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
        <button
          @click="showAddContentModal = false"
          class="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Отмена
        </button>
        <button
          @click="saveContent"
          class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Сохранить
        </button>
      </div>
    </div>
  </div>

  <!-- Модальное окно парсинга таблицы -->
  <div v-if="showParseModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg w-full max-w-2xl mx-4">
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold">Парсинг таблицы</h3>
      </div>
      <div class="p-4">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            URL страницы с таблицей
          </label>
          <input
            v-model="parseUrl"
            type="url"
            placeholder="https://example.com/table"
            class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Поисковая фраза для идентификации таблицы
          </label>
          <input
            v-model="parseSearchText"
            type="text"
            placeholder="Например: Турнирная таблица, Статистика матчей"
            class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <p class="mt-1 text-sm text-gray-500">
            Укажите фразу, которая содержится в заголовке нужной таблицы. Это поможет выбрать правильную таблицу, если на странице их несколько.
          </p>
        </div>
        <div class="mb-4 p-4 bg-gray-50 rounded-md">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Инструкция по парсингу:</h4>
          <ol class="list-decimal list-inside text-sm text-gray-600 space-y-2">
            <li>Введите URL страницы, содержащей таблицу</li>
            <li>Укажите поисковую фразу, которая содержится в заголовке нужной таблицы</li>
            <li>Система найдет все таблицы на странице и выберет ту, в заголовке которой есть указанная фраза</li>
            <li>Если на странице несколько таблиц с похожими заголовками, укажите более точную фразу</li>
            <li>Если фраза не указана, будет выбрана первая найденная таблица</li>
          </ol>
        </div>
        <div v-if="isParsing" class="mb-4">
          <div class="flex items-center justify-center space-x-2">
            <svg class="animate-spin h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm text-gray-600">Парсинг таблицы...</span>
          </div>
        </div>
        <div v-if="parseError" class="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {{ parseError }}
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
          @click="parseTable"
          :disabled="isParsing || !parseUrl"
          class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Начать парсинг
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useGlobalsStore } from '~/stores/globals';
import { storeToRefs } from 'pinia';
import Head from "~/components/parts/Head.vue"

const globalsStore = useGlobalsStore();
const { params } = storeToRefs(globalsStore);

const config = useRuntimeConfig();
const api = config.public.API_URL;

useSeoMeta({
  title: ((params.value as any).adminka_name || 'Админка') + ' - Таблицы',
  description: 'Работа с таблицами',
});

const p_icon = "stash:table";
const p_description = 'Работа с таблицами';
const breadcrumbs: Array<{id: number, title: string, icon: string, slug: string}> = [];

const { isAuthenticated } = useAuth();

// Добавляем тип для динамического доступа к полям
type TableFields = {
  [key: `field${number}`]: string | null;
};

type TableContentFields = {
  [key: `field${number}`]: string | null;
};

// Обновляем интерфейсы
interface Table extends TableFields {
  id: number;
  title: string;
  description: string | null;
}

interface TableContent extends TableContentFields {
  id: number;
  table_id: number;
  field1: string | null;
  field2: string | null;
  field3: string | null;
  field4: string | null;
  field5: string | null;
  field6: string | null;
  field7: string | null;
  field8: string | null;
  field9: string | null;
  field10: string | null;
  field11: string | null;
  field12: string | null;
  field13: string | null;
  field14: string | null;
  field15: string | null;
  field16: string | null;
  field17: string | null;
  field18: string | null;
  field19: string | null;
  field20: string | null;
  created_at: string;
  updated_at: string;
}

const tables = ref<Table[]>([]);
const tableContents = ref<TableContent[]>([]);
const selectedTable = ref<Table | null>(null);
const editingTable = ref<Table | null>(null);
const editingContent = ref<TableContent | null>(null);

// Модальные окна
const showAddTableModal = ref(false);
const showTableContentsModal = ref(false);
const showAddContentModal = ref(false);
const showParseModal = ref(false);
const parseUrl = ref('');
const parseSearchText = ref('');
const isParsing = ref(false);
const parseError = ref('');

// Формы
const tableForm = ref<{
  title: string;
  description: string;
  field1: string;
  field2: string;
  field3: string;
  field4: string;
  field5: string;
  field6: string;
  field7: string;
  field8: string;
  field9: string;
  field10: string;
  field11: string;
  field12: string;
  field13: string;
  field14: string;
  field15: string;
  field16: string;
  field17: string;
  field18: string;
  field19: string;
  field20: string;
}>({
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
});

const contentForm = ref<{
  table_id: number;
  field1: string;
  field2: string;
  field3: string;
  field4: string;
  field5: string;
  field6: string;
  field7: string;
  field8: string;
  field9: string;
  field10: string;
  field11: string;
  field12: string;
  field13: string;
  field14: string;
  field15: string;
  field16: string;
  field17: string;
  field18: string;
  field19: string;
  field20: string;
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
});

// Загрузка таблиц
const fetchTables = async () => {
  try {
    const response = await fetch(`${api}/api/parse-tables?sort=id&order=desc`);
    if (!response.ok) throw new Error('Ошибка при загрузке таблиц');
    const data = await response.json();
    tables.value = data.data;
  } catch (error) {
    console.error('Ошибка при загрузке таблиц:', error);
    alert('Не удалось загрузить таблицы');
  }
};

// Загрузка содержимого таблицы
const fetchTableContents = async (tableId: number) => {
  try {
    const response = await fetch(`${api}/api/parse-table-contents?table_id=${tableId}&per_page=1000`);
    if (!response.ok) throw new Error('Ошибка при загрузке содержимого');
    const data = await response.json();
    tableContents.value = data.data.map((item: any) => ({
      ...item,
      field1: item.field1 || '',
      field2: item.field2 || '',
      field3: item.field3 || '',
      field4: item.field4 || '',
      field5: item.field5 || '',
      field6: item.field6 || '',
      field7: item.field7 || '',
      field8: item.field8 || '',
      field9: item.field9 || '',
      field10: item.field10 || '',
      field11: item.field11 || '',
      field12: item.field12 || '',
      field13: item.field13 || '',
      field14: item.field14 || '',
      field15: item.field15 || '',
      field16: item.field16 || '',
      field17: item.field17 || '',
      field18: item.field18 || '',
      field19: item.field19 || '',
      field20: item.field20 || ''
    }));
  } catch (error) {
    console.error('Ошибка при загрузке содержимого:', error);
    alert('Не удалось загрузить содержимое таблицы');
  }
};

// Открытие модального окна содержимого
const openTableContents = (table: Table) => {
  selectedTable.value = table;
  showTableContentsModal.value = true;
  fetchTableContents(table.id);
};

// Редактирование таблицы
const editTable = (table: Table) => {
  editingTable.value = table;
  tableForm.value = {
    title: table.title,
    description: table.description || '',
    field1: table.field1 || '',
    field2: table.field2 || '',
    field3: table.field3 || '',
    field4: table.field4 || '',
    field5: table.field5 || '',
    field6: table.field6 || '',
    field7: table.field7 || '',
    field8: table.field8 || '',
    field9: table.field9 || '',
    field10: table.field10 || '',
    field11: table.field11 || '',
    field12: table.field12 || '',
    field13: table.field13 || '',
    field14: table.field14 || '',
    field15: table.field15 || '',
    field16: table.field16 || '',
    field17: table.field17 || '',
    field18: table.field18 || '',
    field19: table.field19 || '',
    field20: table.field20 || ''
  };
  showAddTableModal.value = true;
};

// Удаление таблицы
const deleteTable = async (table: Table) => {
  if (!confirm('Вы уверены, что хотите удалить эту таблицу?')) return;

  try {
    const response = await fetch(`${api}/api/parse-tables/${table.id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) throw new Error('Ошибка при удалении таблицы');
    
    await fetchTables();
    alert('Таблица успешно удалена');
  } catch (error) {
    console.error('Ошибка при удалении таблицы:', error);
    alert('Не удалось удалить таблицу');
  }
};

// Сохранение таблицы
const saveTable = async () => {
  try {
    const url = editingTable.value
      ? `${api}/api/parse-tables/${editingTable.value.id}`
      : `${api}/api/parse-tables`;
    
    const method = editingTable.value ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(tableForm.value)
    });

    if (!response.ok) throw new Error('Ошибка при сохранении таблицы');
    
    await fetchTables();
    showAddTableModal.value = false;
    editingTable.value = null;
    tableForm.value = {
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
    };
    alert('Таблица успешно сохранена');
  } catch (error) {
    console.error('Ошибка при сохранении таблицы:', error);
    alert('Не удалось сохранить таблицу');
  }
};

// Редактирование содержимого
const editContent = (content: TableContent) => {
  editingContent.value = content;
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
    field10: content.field10 || '',
    field11: content.field11 || '',
    field12: content.field12 || '',
    field13: content.field13 || '',
    field14: content.field14 || '',
    field15: content.field15 || '',
    field16: content.field16 || '',
    field17: content.field17 || '',
    field18: content.field18 || '',
    field19: content.field19 || '',
    field20: content.field20 || ''
  };
  showAddContentModal.value = true;
};

// Удаление содержимого
const deleteContent = async (content: TableContent) => {
  if (!confirm('Вы уверены, что хотите удалить эту строку?')) return;

  try {
    const response = await fetch(`${api}/api/parse-table-contents/${content.id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) throw new Error('Ошибка при удалении строки');
    
    if (selectedTable.value) {
      await fetchTableContents(selectedTable.value.id);
    }
    alert('Строка успешно удалена');
  } catch (error) {
    console.error('Ошибка при удалении строки:', error);
    alert('Не удалось удалить строку');
  }
};

// Сохранение содержимого
const saveContent = async () => {
  if (!selectedTable.value) return;

  try {
    contentForm.value.table_id = selectedTable.value.id;
    
    const url = editingContent.value
      ? `${api}/api/parse-table-contents/${editingContent.value.id}`
      : `${api}/api/parse-table-contents`;
    
    const method = editingContent.value ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(contentForm.value)
    });

    if (!response.ok) throw new Error('Ошибка при сохранении строки');
    
    if (selectedTable.value) {
      await fetchTableContents(selectedTable.value.id);
    }
    showAddContentModal.value = false;
    editingContent.value = null;
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
    };
    alert('Строка успешно сохранена');
  } catch (error) {
    console.error('Ошибка при сохранении строки:', error);
    alert('Не удалось сохранить строку');
  }
};

// Функция парсинга таблицы
const parseTable = async () => {
  if (!parseUrl.value) return;
  
  try {
    isParsing.value = true;
    parseError.value = '';
    
    const response = await fetch(`${api}/api/parse-tables/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        url: parseUrl.value,
        search_text: parseSearchText.value
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка при парсинге таблицы');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Ошибка при парсинге таблицы');
    }

    // Обновляем список таблиц
    await fetchTables();
    
    // Закрываем модальное окно и очищаем форму
    showParseModal.value = false;
    parseUrl.value = '';
    parseSearchText.value = '';
    
    alert('Таблица успешно спарсена и сохранена');
    
  } catch (error) {
    console.error('Ошибка при парсинге таблицы:', error);
    parseError.value = error instanceof Error ? error.message : 'Произошла неизвестная ошибка';
  } finally {
    isParsing.value = false;
  }
};

// Загружаем таблицы при монтировании компонента
onMounted(() => {
  fetchTables();
});
</script>

<style scoped>
.bg-gray-50shadow-sm {
  background-color: #f9fafb;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style> 