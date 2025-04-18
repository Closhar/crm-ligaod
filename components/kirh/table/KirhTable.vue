<template>
  <div class="kirh-table-wrapper flex flex-col h-full">

    <!-- Форма -->
    <div class="kirh-table-wrapper flex flex-col h-full">

      <!-- Форма добавления/редактирования -->
      <KirhTableForm
          v-if="tableOptions.editable"
          :api-url="apiUrl"
          :form-options="formOptions"
          :show-form="showForm"
          :editing-row="editingRow"
          @update:showForm="showForm = $event"
          @refresh="fetchData"
          @cancel="cancelForm"
      />

    </div>

    <!-- Таблица -->
    <div class="flex flex-1 min-h-0">

      <!-- Панель выбора полей дополнительного редактирования -->
      <div
          v-if="showFieldSelector"
          class="kirh-field-selector w-56 bg-gray-50 border-r border-gray-200 p-2 overflow-y-auto flex-shrink-0"
      >
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs font-medium text-gray-500">Выберите поля для редактирования</span>
          
          <!-- Кнопка сброса полей к исходным значениям -->
          <button
               :disabled="isResetFieldsDisabled"
               :class="{
                 'bg-red-500 hover:bg-red-600 text-white': !isResetFieldsDisabled,
                 'bg-gray-300 text-gray-500 cursor-not-allowed': isResetFieldsDisabled
               }"
               class="text-xs px-2 py-1 rounded-md transition-colors flex items-center"
               @click="resetFieldSelector"
               title="Вернуть стандартный вид"
           >
             <Icon name="material-symbols:restore" size="1.2em" class="mr-1" />
             Сброс полей
           </button>
        </div>
        
        <div class="flex flex-col gap-1">
          <button
              v-for="field in allFields"
              :key="field.name"
              :class="{
              'bg-blue-500 text-white': selectedFields.includes(field.name),
              'bg-gray-200 text-gray-700 hover:bg-gray-300': !selectedFields.includes(field.name),
            }"
              class="text-xs px-2 py-1 rounded-md transition-colors text-left"
              @click="toggleFieldSelection(field.name)"
          >
            {{ field.displayLabel || field.label || field.name }}
          </button>
        </div>
      </div>

      <!-- Основной контейнер таблицы -->
      <div
          :class="containerClass"
          :style="containerStyle"
          class="kirh-table-container bg-white rounded-sm shadow-xs p-1 relative border border-gray-100 flex-1 "
      >

        <!-- Прелоадер -->
        <div v-if="loading" class="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div class="loader animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>

        <!-- Панель управления с пагинацией, обновление/сброс, toggle-фильтры, текстовый поиск -->
        <div class="kirh-controls flex justify-between items-center mb-1 p-2 bg-blue-50">

          <div class="kirh-pagination flex items-center gap-2 text-xs">

            <!-- Пагинация -->
            <span v-if="tableOptions.pagination" class="text-gray-500">Всего: {{ totalItems }}</span>
            <button
                v-if="tableOptions.pagination"
                :disabled="currentPage === 1 || loading"
                class="kirh-pagination-btn px-1.5 py-0.5 rounded-sm disabled:opacity-50 hover:bg-gray-50"
                @click="prevPage"
            >
              <Icon name="emojione-v1:left-arrow" size="2em" />
            </button>
            <span v-if="tableOptions.pagination" class="kirh-page-info mx-1">{{ currentPage }}/{{ totalPages }}</span>
            <button
                v-if="tableOptions.pagination"
                :disabled="currentPage === totalPages || loading"
                class="kirh-pagination-btn px-1.5 py-0.5 rounded-sm disabled:opacity-50 hover:bg-gray-50"
                @click="nextPage"
            >
              <Icon name="emojione-v1:right-arrow" size="2em" />
            </button>

            <!-- Кнопка обновления таблицы -->
            <button
                :disabled="loading"
                class="refresh-btn text-xs bg-blue-500 hover:bg-blue-400 text-gray-50 px-3 py-1 mb-1 rounded-md flex items-center gap-1 transition-colors shadow-sm"
                title="Обновить данные"
                @click="fetchData"
            >
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                   xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2"/>
              </svg>
              Обновить
            </button>

            <!-- Кнопка сброса фильтров -->
            <button
                v-if="tableOptions.enableResetFilters"
                :class="tableOptions.resetFiltersClass || 'text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 mb-1 rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'"
                :disabled="isResetDisabled"
                @click="resetAllFilters"
            >
              <svg class="h-3.5 w-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2"/>
              </svg>
              {{ tableOptions.resetFiltersLabel || 'Сбросить' }}
            </button>

          </div>

          <div class="kirh-pagination flex items-center gap-2 text-xs">

            <!-- Дополнительные фильтры -->
            <div v-for="(filter, index) in additionalFilters" :key="index" class="flex items-center">

              <ToggleFilter
                  v-if="filter.type === 'toggle'"
                  v-model="selectedFilters[filter.field]"
                  :active-class="filter.activeClass || 'bg-blue-500 text-white'"
                  :filter="filter"
                  :disabled="!!idFilter"
                  @update:modelValue="applyFilters"
              />

            </div>

            <!-- Строковый фильтр -->
            <div class="relative">
              <input
                  v-if="tableOptions.searchable"
                  v-model="searchQuery"
                  class="text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Поиск..."
                  type="text"
                  :disabled="!!idFilter"
                  @input="debouncedSearch"
              >
              <button
                  v-if="searchQuery"
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  @click="clearSearch"
              >
                <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path clip-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        fill-rule="evenodd"/>
                </svg>
              </button>
            </div>

            <!-- Информация об отключении редактирования -->
            <div class="bg-red-600 text-gray-50 px-2" v-if="!tableOptions.editable">
            Ред.выкл
            </div>

          </div>

        </div>

        <!-- Кнопка управления панелью выбора полей и фильтры -->
        <div class="flex mb-1 justify-between items-center">

          <!-- Блок выбора полей -->
          <div class="flex items-center gap-2" v-if="tableOptions.separateFields">

            <!-- Кнопка управления панелью выбора полей -->
            <button
                class="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-2.5 rounded-md flex items-center gap-1 transition-colors shadow-sm"
                @click="toggleFieldSelector"
            >
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                   xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
              </svg>
              {{ showFieldSelector ? 'Закрыть панель' : 'Панель редактора отдельных полей' }}
            </button>

          </div>

          <!-- Блок Фильтры -->
          <div class="flex items-center gap-2">

            <!-- Селект фильтры -->
            <div v-for="(filter, index) in additionalFilters" :key="index" class="flex items-center">
              <KirhSelectField
                  v-if="filter.type !== 'toggle'"
                  v-model="selectedFilters[filter.field]"
                  :api-params="filter.apiParams"
                  :api-url="filter.apiUrl"
                  :empty-option="filter.empty_option"
                  :emptyable="filter.options?.emptyable"
                  :enableSearch="filter.options?.enableSearch"
                  :label="filter.label"
                  :icon-field="filter.iconField"
                  :image-field="filter.imageField"
                  :key-field="filter.keyField || 'id'"
                  :label-field="filter.labelField || 'name'"
                  :limit="filter.limit || null"
                  :list_item="filter.list_item || null"
                  :options="filter.options"
                  :options_list="filter.options_list || null"
                  :placeholder="filter.placeholder || filter.label"
                  :sel_class="filter.sel_class || null"
                  :disabled="!!idFilter"
                  @update:modelValue="applyFilters"
              />

            </div>

          </div>

        </div>

        <!-- Таблица -->
        <div class="kirh-table w-full">

          <!-- Заголовки -->
          <div class="kirh-header flex mb-px text-xs font-medium cursor-pointer border-b">
            <!-- ID фильтр заголовок (отображается только если включен showIdFilter) -->
            <div 
                v-if="tableOptions.showIdFilter"
                class="kirh-header-cell flex items-center justify-center group relative bg-gray-100 px-2 py-2 border border-gray-200 rounded"
                style="flex: 0 0 60px;"
            >
              <Icon name="mdi:filter-outline" size="1.5em" class="text-gray-500"/>
            </div>
            
            <div
                v-for="(column, colIndex) in visibleColumns"
                :key="`header-${column.name}-${colIndex}`"
                :style="getColumnStyle(column)"
                class="kirh-header-cell flex items-center justify-between group relative bg-gray-100 px-2 py-2 w-full border border-gray-200 rounded"
            >
              <div class="flex items-center text-center mx-1">
                <!-- Иконка (если есть title_icon, показываем только иконку) -->
                <Icon 
                    v-if="column.title_icon" 
                    :name="column.title_icon" 
                    size="1.5em" 
                    class="flex-shrink-0"
                    :title="column.displayLabel || column.label || ''"
                />
                
                <!-- Текст заголовка (показываем только если label не пустой) -->
                <span 
                    v-if="!column.title_icon && column.label && column.label !== ''" 
                    class="truncate"
                >
                  {{ column.label }}
                </span>
                
                <!-- Индикатор активного фильтра для колонки -->
                <div 
                  v-if="column.filter_button && isColumnFilterActive(column)"
                  class="ml-1 flex items-center"
                >
                  <div class="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    <Icon name="material-symbols:filter-alt" size="0.7em" />
                  </div>
                  <button 
                    class="ml-1 text-xs text-red-500 hover:text-red-700" 
                    title="Сбросить фильтр"
                    @click="clearColumnFilter(column)"
                  >
                    <Icon name="material-symbols:close" size="0.8em" />
                  </button>
                </div>
                
                <!-- Ссылка в заголовке -->
                <a 
                    v-if="column.options?.link_in_title" 
                    :href="column.options?.link_in_title" 
                    class="text-blue-600 hover:text-blue-500" 
                    target="_blank"
                >
                  <Icon 
                      name="lucide:external-link" 
                      size="1.2em" 
                      class="ml-1" 
                      :title="column.options?.hint_in_link || ''"
                  />
                </a>
                
                <!-- Подсказка -->
                <div v-if="column.options?.hint" class="relative">
                  <svg 
                      class="h-3 w-3 text-gray-400" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                        clip-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                        fill-rule="evenodd"
                    ></path>
                  </svg>
                  <div
                      class="absolute z-20 bottom-full -left-20 mb-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-normal w-48 shadow-lg"
                  >
                    {{ column.options.hint }}
                  </div>
                </div>
              </div>
              <button
                  v-if="tableOptions.sortable && column.sortable !== false"
                  class="kirh-sort-btn ml-0.5 text-gray-500 hover:text-gray-800 transition-colors text-xs"
                  @click="sortBy(column.name)"
              >
                {{ sortField === column.name ? (sortDirection === 'asc' ? '↑' : '↓') : '↕' }}
              </button>
            </div>
            <div
                v-if="tableOptions.deleteable || tableOptions.editrow || tableOptions.link"
                class="kirh-header-cell flex items-center justify-between group relative bg-gray-100 px-2 py-2 w-full border border-gray-200 rounded"
                style="flex: 0 0 80px;"
            >
              <span class="text-xs">Действия</span>
            </div>
          </div>

          <!-- Тело таблицы -->
          <div class="kirh-body">
            <div
                v-for="(row, rowIndex) in displayedData"
                :key="row.id || `row-${rowIndex}`"
                :class="{'bg-gray-50': rowIndex % 2 === 0}"
                class="kirh-row flex hover:bg-gray-50 text-xs"
            >
              <!-- ID фильтр ячейка (отображается только если включен showIdFilter) -->
              <div 
                  v-if="tableOptions.showIdFilter"
                  class="kirh-cell border-b border-gray-100 flex items-center justify-center"
                  style="flex: 0 0 60px;"
              >
                <button 
                    class="text-xs px-2 py-1 transition-colors"
                    @click="toggleIdFilter(row.id)"
                    :title="idFilter === row.id ? 'Отменить фильтр по ID: ' + row.id : 'Фильтровать по ID: ' + row.id"
                >
                  <Icon 
                    :name="idFilter === row.id ? 'mdi:filter-remove' : 'mdi:filter'" 
                    :class="idFilter === row.id ? 'text-red-600' : 'text-blue-600'"
                    size="1.5em"
                  />
                  <span class="sr-only">{{ row.id }}</span>
                </button>
              </div>
              
              <div
                  v-for="(column, colIndex) in visibleColumns"
                  :key="`cell-${rowIndex}-${column.name}-${colIndex}`"
                  :style="getColumnStyle(column)"
                  class="kirh-cell border-b border-gray-100 text-center"
              >
                <!-- Select-поле -->
                <template v-if="column.type === 'select'">
                  <!-- Локальный селект -->
                  <KirhSelectField
                      v-if="column.options?.options"
                      v-model="row[column.name]"
                      :icon-field="column.options.iconField"
                      :image-field="column.options.imageField"
                      :label="column.label"
                      :key-field="column.options.keyField || 'id'"
                      :label-field="column.options.labelField || 'name'"
                      :limit="column.options.limit || null"
                      :options="column.options.options"
                      :emptyable="column.options?.emptyable"
                      :enablSearch="column.options?.enableSearch"
                      @update:modelValue="(val) => handleSelectChange(row, column.name, val)"
                  />

                  <!-- API селект -->
                  <div v-else class="border border-gray-200 h-8 rounded">
                    <!-- Статическое отображение -->
                    <div
                        v-if="!isActiveSelect(row.id, column.name)"
                        class="flex items-center justify-between cursor-pointer hover:bg-gray-200 rounded h-8 p-1"
                        @click="openInlineSelect(row, column)"
                    >
                      <div class="flex items-center min-w-0">
                        <!-- Изображение -->
                        <img
                            v-if="getSelectImage(row, column)"
                            :src="getSelectImage(row, column)"
                            class="h-5 w-5 rounded-full mr-2 object-cover flex-shrink-0"
                        />
                        <!-- Иконка -->
                        <Icon
                            v-else-if="getSelectIcon(row, column)"
                            :name="getSelectIcon(row, column)"
                            class="h-5 w-5 mr-2 text-gray-600 flex-shrink-0"
                        />
                        <!-- Текст -->
                        <span class="truncate">
                          {{ getSelectLabel(row, column) || 'Не выбрано' }}
                        </span>
                      </div>
                      <div class="flex items-center">
                        <!-- Кнопка фильтрации (если настроена) -->
                        <button 
                          v-if="column.filter_button && column.filter_button.enabled && row[column.name]"
                          class="mr-1"
                          :class="column.filter_button.class || 'text-blue-500 hover:text-blue-700'"
                          :title="isColumnFiltered(column, row[column.name]) 
                            ? `Отменить фильтр по ${column.label}` 
                            : `Фильтровать по ${column.label}`"
                          @click.stop="filterByColumnValue(column, row[column.name])"
                        >
                          <Icon 
                            :name="isColumnFiltered(column, row[column.name]) 
                              ? (column.filter_button.active_icon || 'material-symbols:filter-alt-off') 
                              : (column.filter_button.icon || 'material-symbols:filter-alt')" 
                            :class="isColumnFiltered(column, row[column.name]) 
                              ? 'text-red-500' 
                              : ''"
                            :size="column.filter_button.icon_size || '1.2em'"
                          />
                        </button>
                        <Icon class="text-gray-400" name="mingcute:pencil-fill" size="16"/>
                      </div>
                    </div>

                    <!-- Редактируемый селект -->
                    <KirhSelectField
                        v-else
                        ref="inlineSelectRef"
                        v-model="selectValues[row.id][column.name]"
                        :api-params="getSelectApiParams(column, row)"
                        :api-url="column.options.apiUrl"
                        :class="column.options.sel_class || 'w-full'"
                        :icon-field="column.options.iconField"
                        :image-field="column.options.imageField"
                        :key-field="column.options.keyField || 'id'"
                        :label="column.label"
                        :label-field="column.options.labelField || 'name'"
                        :limit="column.options.limit || null"
                        :list_item="column.options.list_item || null"
                        :options="column.options.options"
                        :enableSearch="column.options?.enableSearch"
                        :emptyable="column.options?.emptyable"
                        :options_list="column.options.options_list || null"
                        :placeholder="column.options.placeholder || column.label"
                        :sel_class="column.options.sel_class || null"
                        auto-focus
                        @blur="handleSelectBlur(row, column)"
                        @update:modelValue="(val) => handleSelectChange(row, column.name, val)"
                    />
                  </div>
                </template>

                <template v-else-if="column.type === 'image'">
                  <KirhImageField
                      :value="row[column.name]"
                      :options="column.options"
                      @click="() => openInlineSelect(row, column)"
                      :row-data="row"
                      :error="imageErrors[`${row.id}-${column.name}`]"
                      @update:modelValue="(val) => handleImageChange(row, column.name, val)"
                      @change="(val) => handleImageChange(row, column.name, val)"
                      @clear-error="clearImageError(row.id, column.name)"
                  />
                </template>

                <!-- Другие типы полей -->
                <template v-else>
                  <component
                      :is="getFieldComponent(column.type)"
                      :error="error"
                      :options="column.options"
                      :readonly="column.options.readonly"
                      :type="column.type"
                      :value="row[column.name]"
                      :modelValue="row[column.name]"
                      :row-data="row"
                      @blur="handleBlur(row, column.name)"
                      @update:modelValue="updateValue(row, column.name, $event)"
                      @keyup.enter="handleBlur(row, column.name)"
                  />
                </template>
              </div>

              <div v-if="tableOptions.deleteable || tableOptions.editrow || tableOptions.link"
                   class="kirh-actions-cell border-b border-gray-100 flex gap-1 items-center justify-center"
                   style="flex: 0 0 80px;"
              >
                <button v-if="tableOptions.editrow && tableOptions.editable"
                        class="kirh-edit-btn text-blue-500 hover:text-blue-700 transition-colors p-0.5"
                        title="Редактировать"
                        @click="editRow(row)"
                >
                  <Icon name="akar-icons:edit" size="1.5em"/>
                </button>
                <button v-if="tableOptions.deleteable"
                        class="kirh-delete-btn text-red-500 hover:text-red-700 transition-colors p-0.5"
                        title="Удалить"
                        @click="confirmDelete(row)"
                >
                  <Icon name="mynaui:trash" size="1.5em"/>
                </button>

                <!-- Модальное окно подтверждения удаления -->
                <div v-if="showDeleteModal"
                     class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Подтверждение удаления</h3>
                    <p class="text-sm text-gray-600 mb-2">
                      Вы собираетесь удалить запись:<br/><span class="font-medium">{{ deleteItemName }}</span>
                    </p>
                    <p class="text-sm text-gray-600 mb-6">
                      Запись невозможно будет восстановить. Подтвердите свои намерения.
                    </p>
                    <div class="flex justify-end gap-3">
                      <button
                          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          @click="showDeleteModal = false"
                      >
                        Отмена
                      </button>
                      <button
                          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          @click="executeDelete"
                      >
                        Подтверждаю, УДАЛИТЬ
                      </button>
                    </div>
                  </div>
                </div>
                <a
                    v-if="tableOptions.link"
                    :href="link_to_site(row)"
                    class="kirh-delete-btn text-green-500 hover:text-green-700 transition-colors p-0.5"
                    target="_blank"
                    title="в новом окне"
                >
                  <Icon name="iconamoon:link-external-fill" size="1.5em"/>
                </a>
              </div>

            </div>
          </div>

        </div>

        <!-- Ошибки -->
        <div
            v-if="error"
            class="kirh-error mt-1 p-1.5 bg-red-50 text-red-600 rounded-sm border border-red-100 text-xs"
        >
          {{ error }}
        </div>

      </div>

    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { debounce } from 'lodash-es';
import KirhTextField from './fields/KirhTextField.vue';
import KirhSelectField from './fields/KirhSelectField.vue';
import KirhToggleField from './fields/KirhToggleField.vue';
import ToggleFilter from "./filters/ToggleFilter.vue";
import KirhImageField from './fields/KirhImageField.vue';
import KirhTextareaField from "./fields/KirhTextareaField.vue";
import KirhHasManyField from './fields/KirhHasManyField.vue';
import KirhTableForm from './components/KirhTableForm.vue';

export default {
  name: 'KirhTable',
  components: {
    ToggleFilter,
    KirhTextField,
    KirhSelectField,
    KirhToggleField,
    KirhImageField,
    KirhTextareaField,
    KirhHasManyField,
    KirhTableForm
  },
  props: {
    apiUrl: {
      type: String,
      required: true
    },
    tableOptions: {
      type: Object,
      default: () => ({
        columns: [],
        editable: true,
        editrow: true,
        sortable: true,
        pagination: true,
        pageSize: 10,
        link: false,
        link_prefix: '',
        enableResetFilters: true,
        resetFiltersLabel: 'Сбросить',
        resetFiltersClass: 'text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
        showIdFilter: true,
        defaultSortField: null,
        defaultSortDirection: 'asc'
      })
    },
    formOptions: {
      type: Object,
      default: () => ({
        fields: [],
        showForm: true,
        inline: false
      })
    },
    additionalParams: {
      type: Object,
      default: () => ({})
    },
    additionalFilters: {
      type: Array,
      default: () => []
    },
    containerClass: {
      type: String,
      default: 'w-full'
    },
    containerStyle: {
      type: Object,
      default: () => ({})
    },
    extraEditableFields: {
      type: Array,
      default: () => []
    },
    defaultVisibleFields: {
      type: Array,
      default: () => []
    },
    excludedFields: {
      type: Array,
      default: () => []
    },
  },
  setup(props) {
    // Реактивные переменные
    const tableData = ref([]);
    const loading = ref(false);
    const showForm = ref(props.formOptions.showForm);
    const editingRow = ref(null);
    const currentPage = ref(1);
    const totalPages = ref(1);
    const totalItems = ref(0);
    const sortField = ref(props.tableOptions.defaultSortField);
    const sortDirection = ref(props.tableOptions.defaultSortDirection);
    const error = ref(null);
    const showFieldSelector = ref(false);
    const searchQuery = ref('');
    const selectedFilters = ref({});
    const activeSelect = ref(null);
    const inlineSelectRef = ref(null);
    const selectValues = ref({});
    const imageErrors = ref({});
    const showDeleteModal = ref(false);
    const deleteItem = ref(null);
    const selectedFields = ref([...props.defaultVisibleFields]);
    const clickOutsideHandler = ref(null);
    const idFilter = ref(null);

    // Методы
    const getFieldComponent = (type) => {
      const componentMap = {
        text: KirhTextField,
        textarea: KirhTextareaField,
        date: KirhTextField,
        time: KirhTextField,
        datetime: KirhTextField,
        select: KirhSelectField,
        toggle: KirhToggleField,
        image: KirhImageField,
        hasmany: KirhHasManyField
      };
      return componentMap[type] || KirhTextField;
    };

    // Вычисляемые свойства
    const deleteItemName = computed(() => {
      if (!deleteItem.value) return '---';
      if (props.tableOptions.main_field && deleteItem.value[props.tableOptions.main_field]) {
        return deleteItem.value[props.tableOptions.main_field];
      }
      return deleteItem.value.id || '---';
    });

    // Безопасный обработчик кликов вне селекта
    const handleClickOutside = (event) => {
      const selectEl = getSelectElement()
      if (!selectEl) return

      // Современный способ проверки клика
      const clickedInside = event.composedPath().includes(selectEl)
      if (!clickedInside) {
        closeInlineSelect()
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeSelect.value) {
        closeInlineSelect();
      }
    };

    // Обработчик blur для select
    const handleSelectBlur = () => {
      // Если клик в процессе - не закрываем
      if (clickInProgress.value) {
        clickInProgress.value = false;
        return;
      }
      closeInlineSelect();
    };

    // Инициализация обработчика
    const setupClickOutsideListener = () => {
      // Сначала удаляем старый обработчик
      if (clickOutsideHandler.value) {
        document.removeEventListener('mousedown', clickOutsideHandler.value)
      }

      // Добавляем новый
      document.addEventListener('mousedown', handleClickOutside)
      clickOutsideHandler.value = handleClickOutside
    }

    const openInlineSelect = async (row, column) => {
      // Не открываем, если уже активен
      if (isActiveSelect(row.id, column.name)) return

      // Закрываем предыдущий селект
      if (activeSelect.value) {
        closeInlineSelect()
        await nextTick()
      }

      // Инициализируем значение
      if (!selectValues.value[row.id]) {
        selectValues.value[row.id] = {}
      }

      selectValues.value[row.id][column.name] = {
        [column.options.keyField || 'id']: row[column.name],
        [column.options.labelField || 'name']: getSelectLabel(row, column)
      }

      // Открываем новый селект
      activeSelect.value = {rowId: row.id, field: column.name}
      setupClickOutsideListener()

      await nextTick()

      // Фокусируемся безопасно
      try {
        const selectEl = getSelectElement()
        if (selectEl?.focus) selectEl.focus()
      } catch (e) {
        console.error('Focus error:', e)
      }
    }

    // Функция закрытия inline select
    const closeInlineSelect = () => {
      if (clickOutsideHandler.value) {
        document.removeEventListener('mousedown', clickOutsideHandler.value)
        clickOutsideHandler.value = null
      }
      activeSelect.value = null
    }

    // Проверка активности селекта
    const isActiveSelect = (rowId, fieldName) => {
      return activeSelect.value?.rowId === rowId &&
          activeSelect.value?.field === fieldName;
    };

    // Обновление значения поля
    const updateValue = (row, fieldName, value) => {
      if (!props.tableOptions.editable || !isFieldEditable(fieldName)) return;

      const actualValue = typeof value === 'object' && value !== null && 'target' in value
          ? value.target.value
          : value;

      // Для всех полей обновляем локальное значение
      row[fieldName] = actualValue;

      // Для НЕ текстовых полей (select, toggle и т.д.) сохраняем сразу
      // Проверяем тип поля
      let column = allFields.value.find(col => col.name === fieldName);
      
      // Если колонка не найдена, но это известное поле для селектов
      if (!column && (fieldName === 'club1_id' || fieldName === 'club2_id')) {
        column = {
          name: fieldName,
          type: 'select',
          options: {
            keyField: 'id'
          }
        };
      }
      
      // Если не найдена колонка, но значение явно булево или 0/1, считаем это toggle
      if (!column && (actualValue === 0 || actualValue === 1 || typeof actualValue === 'boolean')) {
        column = {
          name: fieldName,
          type: 'toggle'
        };
      }

      // Если это toggle или другой НЕ текстовый тип, сохраняем сразу
      if (column?.type === 'toggle' || (column?.type && column?.type !== 'text')) {
        handleSelectChange(row, fieldName, actualValue);
      }
    };

    // Обработка изменения в inline-селекте
    const handleInlineSelectChange = async (row, fieldName, value) => {
      await handleSelectChange(row, fieldName, value);
      closeInlineSelect();
    };

    // Обработчик изменения select
    const handleSelectChange = async (row, fieldName, value) => {
      try {
        if (!props.tableOptions.editable || !isFieldEditable(fieldName)) return;

        // Выполняем поиск колонки с заданным именем
        let column = allFields.value.find(col => col.name === fieldName);
        
        // Если колонка не найдена, но это известное поле 
        // (club1_id или club2_id, о которых мы точно знаем)
        if (!column && (fieldName === 'club1_id' || fieldName === 'club2_id')) {
          // Создаем временную колонку с известными параметрами
          column = {
            name: fieldName,
            type: 'select',
            options: {
              keyField: 'id'
            }
          };
        } else if (!column) {
          // Если колонка не найдена, но значение передаётся, создаем временную колонку
          column = {
            name: fieldName,
            type: typeof value === 'number' || value === 0 || value === 1 ? 'toggle' : 'text'
          };
        }

        // Подготовка значения для отправки
        let valueToSave = value;

        // Если селект работает с объектами (например, {id: 1, name: "Value"})
        if (column.options?.saveOnlyId) {
          valueToSave = value?.id ?? null;
        }

        // Временно обновляем значение в локальных данных
        const oldValue = row[fieldName];
        row[fieldName] = valueToSave;
        closeInlineSelect();

        // Отправка на сервер
        const response = await fetch(`${props.apiUrl}/${row.id}`, {
          method: 'PATCH',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({[fieldName]: valueToSave})
        });

        if (!response.ok) {
          // Если ошибка - возвращаем старое значение
          row[fieldName] = oldValue;
          throw new Error(await response.text());
        }

        // Полностью обновляем данные из сервера после успешного сохранения
        await fetchData();

      } catch (err) {
        console.error('Ошибка при обновлении:', err);
        error.value = err.message;
      }
    };

    // Проверка доступности поля для редактирования
    const isFieldEditable = (fieldName) => {
      // Если редактирование вообще отключено на уровне таблицы
      if (!props.tableOptions.editable) return false;
      
      // Проверяем, есть ли поле в основных колонках таблицы
      const isTableColumn = props.tableOptions.columns.some(col => col.name === fieldName);
      
      // Если это поле из основных колонок таблицы, всегда разрешаем редактировать
      if (isTableColumn) return true;
      
      // Для полей из панели редактирования
      if (!showFieldSelector.value) return props.tableOptions.editable;
      
      return selectedFields.value.includes(fieldName);
    };

    // Обработчик события blur
    const handleBlur = async (row, fieldName) => {
      try {
        const column = allFields.value.find(col => col.name === fieldName);

        if (column?.validate) {
          const validationResult = column.validate(row[fieldName]);
          if (typeof validationResult === 'string') {
            throw new Error(validationResult);
          }
          if (validationResult === false) {
            throw new Error('Недопустимое значение');
          }
        }

        const response = await fetch(`${props.apiUrl}/${row.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({[fieldName]: row[fieldName]})
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        await fetchData();
      } catch (err) {
        error.value = err.message;
        console.error('Ошибка при сохранении:', err);
      }
    };

    const allFields = computed(() => {
      // Отфильтровываем исключенные поля только из основной таблицы
      const tableFields = props.tableOptions.columns
        .filter(col => !props.excludedFields.includes(col.name))
        .map(col => ({
          name: col.name,
          label: col.label || col.name,
          type: col.type || 'text',
          width: col.width || null,
          min_width: col.min_width || null,
          title_icon: col.title_icon || null,
          displayLabel: col.displayLabel || col.label || col.name,
          options: col.options || {},
          sortable: col.sortable,
          // Добавляем флаг для определения источника
          source: 'table'
        }));

      // Поля extraEditableFields всегда включаются
      const extraFields = props.extraEditableFields.map(field => ({
        name: field.name,
        label: field.label || field.name,
        type: field.type || 'text',
        width: field.width || null,
        min_width: field.min_width || null,
        title_icon: field.title_icon || null,
        displayLabel: field.displayLabel || field.label || field.name,
        options: field.options || {},
        sortable: field.sortable,
        // Добавляем флаг для определения источника
        source: 'extra'
      }));

      // Объединяем поля, обрабатывая дублирующиеся имена
      // Это позволит сохранить уникальные параметры для каждого поля
      return [...tableFields, ...extraFields].reduce((acc, field) => {
        // Проверяем, есть ли уже поле с таким именем и источником
        const existingIndex = acc.findIndex(f => 
          f.name === field.name && f.source === field.source
        );
        
        if (existingIndex === -1) {
          acc.push(field);
        } else {
          // Обновляем существующее поле, сохраняя его уникальные параметры
          acc[existingIndex] = { ...acc[existingIndex], ...field };
        }
        
        return acc;
      }, []);
    });

    const visibleColumns = computed(() => {
      if (!showFieldSelector.value) {
        return props.tableOptions.columns;
      }

      // Получаем все выбранные поля с их уникальными свойствами
      const selected = selectedFields.value.map(fieldName => {
        // Ищем среди всех доступных полей
        const field = allFields.value.find(f => f.name === fieldName);
        if (!field) {
          // Если поле не найдено, создаем базовое представление
          return {
            name: fieldName,
            label: fieldName,
            type: 'text',
            options: {}
          };
        }
        
        // Возвращаем найденное поле с его полными свойствами
        return field;
      }).filter(Boolean);

      // Сохраняем поля с уникальными именами, сохраняя при этом
      // все специфичные свойства каждого поля
      const result = [];
      selected.forEach(field => {
        // Проверяем, есть ли уже поле с таким именем в результате
        const existingIndex = result.findIndex(f => f.name === field.name);
        
        if (existingIndex === -1) {
          // Если нет, добавляем новое поле
          result.push(field);
        } else if (field.source === 'extra') {
          // Если поле из extraEditableFields, оно имеет приоритет
          result[existingIndex] = field;
        }
        // Если поле из обычной таблицы и уже есть такое поле, оставляем существующее
      });
      
      return result;
    });

    const displayedData = computed(() => {
      if (!props.tableOptions.sortable || !sortField.value) {
        return tableData.value;
      }

      return [...tableData.value].sort((a, b) => {
        const valA = a[sortField.value];
        const valB = b[sortField.value];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        return sortDirection.value === 'asc'
            ? valA > valB ? 1 : -1
            : valA < valB ? 1 : -1;
      });
    });

    const isResetDisabled = computed(() => {
      if (idFilter.value) return false;
      if (searchQuery.value) return false;
      return !Object.values(selectedFilters.value).some(
          value => value !== undefined && value !== '' && value !== null
      );
    });

    // Проверяем, можно ли сбросить поля к исходным значениям
    const isResetFieldsDisabled = computed(() => {
      // Если выбранных полей столько же, сколько и в defaultVisibleFields
      if (selectedFields.value.length !== props.defaultVisibleFields.length) {
        return false;
      }
      
      // Проверяем, что все выбранные поля есть в defaultVisibleFields и наоборот
      return selectedFields.value.every(field => props.defaultVisibleFields.includes(field)) &&
             props.defaultVisibleFields.every(field => selectedFields.value.includes(field));
    });

    const fetchData = async () => {
      try {
        loading.value = true;
        error.value = null;

        const filterParams = {};
        if (searchQuery.value) {
          filterParams.q = searchQuery.value;
        }

        // Добавляем фильтр по ID, если он активен
        if (idFilter.value) {
          filterParams.id = idFilter.value;
        } else {
          // Добавляем остальные фильтры только если нет фильтра по ID
          props.additionalFilters.forEach(filter => {
            if (selectedFilters.value[filter.field] !== undefined && selectedFilters.value[filter.field] !== '') {
              filterParams[filter.field] = selectedFilters.value[filter.field];
            }
          });
        }

        const params = new URLSearchParams({
          page: currentPage.value,
          per_page: props.tableOptions.pageSize,
          ...(sortField.value && {sort_field: sortField.value}),
          ...(sortDirection.value && {sort_direction: sortDirection.value}),
          ...props.additionalParams,
          ...filterParams
        });

        const response = await fetch(`${props.apiUrl}?${params.toString()}`);
        const data = await response.json();

        closeInlineSelect();

        tableData.value = data.data.map((item, index) => {
          if (!item.id) {
            item.uniqueKey = `row-${index}-${Date.now()}` // Добавляем уникальный ключ
          }
          return item
        })

        if (!response.ok) {
          throw new Error(data.message || 'Ошибка загрузки данных');
        }

        tableData.value = data.data || data;
        totalPages.value = data.last_page || data.meta?.last_page || 1;
        totalItems.value = data.total || data.meta?.total || tableData.value.length;
      } catch (err) {
        error.value = err.message;
        console.error('Ошибка при загрузке данных:', err);
      } finally {
        loading.value = false;
      }
    };

    const debouncedSearch = debounce(() => {
      fetchData();
    }, 500);

    const clearSearch = () => {
      searchQuery.value = '';
      fetchData();
    };

    const applyFilters = () => {
      currentPage.value = 1;
      fetchData();
    };

    const resetAllFilters = () => {
      searchQuery.value = '';
      Object.keys(selectedFilters.value).forEach(key => {
        selectedFilters.value[key] = '';
      });
      sortField.value = props.tableOptions.defaultSortField;
      sortDirection.value = props.tableOptions.defaultSortDirection;
      currentPage.value = 1;
      idFilter.value = null; // Сбрасываем фильтр по ID
      fetchData();
    };

    const toggleFieldSelector = () => {
      showFieldSelector.value = !showFieldSelector.value;
      if (showFieldSelector.value && selectedFields.value.length === 0) {
        // Инициализируем выбранные поля из defaultVisibleFields,
        // которые указаны при создании компонента
        selectedFields.value = [...props.defaultVisibleFields];
      }
    };

    const toggleFieldSelection = (fieldName) => {

      if (selectedFields.value.includes(fieldName)) {
        selectedFields.value = selectedFields.value.filter(f => f !== fieldName);
      } else {
        selectedFields.value = [...selectedFields.value, fieldName];
      }
    };

    // Метод для сброса панели выбора полей к исходному состоянию
    const resetFieldSelector = () => {
      // Устанавливаем начальные поля из tableOptions.columns
      selectedFields.value = [...props.defaultVisibleFields];
    };

    const getColumnStyle = (column) => {
      const width = column.width || column.options?.width;
      const minWidth = column.min_width || column.options?.min_width;

      // Базовый стиль
      const style = { flex: '1 1 0%' };

      // Добавляем min-width если он задан
      if (minWidth) {
        style.minWidth = typeof minWidth === 'number' ? `${minWidth}px` : minWidth;
      }

      // Обрабатываем width только если min-width не переопределил его
      if (width && !minWidth) {
        if (typeof width === 'number') {
          style.flex = `0 0 ${width}px`;
        } else if (typeof width === 'string') {
          if (width.endsWith('%')) {
            style.flex = `0 0 ${width}`;
            style.maxWidth = width;
          } else if (width.endsWith('px')) {
            style.flex = `0 0 ${width}`;
          } else {
            style.flex = `0 0 ${width}px`;
          }
        }
      }

      return style;
    };

    const sortBy = (field) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortField.value = field;
        sortDirection.value = 'asc';
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) currentPage.value--;
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++;
    };

    const addNewRow = () => {
      showForm.value = true;
      editingRow.value = null;
    };

    const editRow = (row) => {
      editingRow.value = row;
      showForm.value = true;
    };

    const cancelForm = () => {
      showForm.value = false;
      editingRow.value = null;
    };

    const confirmDelete = (row) => {
      deleteItem.value = row;
      showDeleteModal.value = true;
    };

    const executeDelete = async () => {
      if (!deleteItem.value) return;

      try {
        loading.value = true;
        const response = await fetch(`${props.apiUrl}/${deleteItem.value.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        await fetchData();
        showDeleteModal.value = false;
        deleteItem.value = null;
      } catch (err) {
        error.value = err.message;
        console.error('Ошибка при удалении:', err);
      } finally {
        loading.value = false;
      }
    };

    const link_to_site = (row) => {
      const prefix = props.tableOptions.link_prefix || '';
      const fieldName = props.tableOptions.link;
      const fieldValue = row[fieldName] || '';
      return `${prefix}/${fieldValue}`;
    };

    // Методы для работы с select-полями
    const getNestedValue = (obj, path) => {
      if (!path || !obj) return null;
      if (!path.includes('.')) return obj[path] ?? null;
      return path.split('.').reduce((acc, part) => {
        if (acc === null || acc === undefined) return null;
        return acc[part] ?? null;
      }, obj);
    };

    const getSelectLabel = (row, column) => {
      if (column.options?.displayLabelField) {
        return getNestedValue(row, column.options.displayLabelField);
      }
      const labelField = column.options?.labelField || 'name';
      if (row[labelField]) return row[labelField];
      if (row[column.name] && typeof row[column.name] === 'object') {
        return row[column.name][labelField];
      }
      return row[column.name]?.toString() || null;
    };

    const getSelectImage = (row, column) => {
      if (!column.options?.displayImageField) return null;
      return getNestedValue(row, column.options.displayImageField);
    };

    const getSelectIcon = (row, column) => {
      if (!column.options?.displayIconField) return null;
      return getNestedValue(row, column.options.displayIconField);
    };

    const getSelectApiParams = (column, row) => {
      const params = {...column.options?.apiParams};
      if (column.options?.polymorphic) {
        const {idField, typeField} = column.options.polymorphic;
        params[typeField] = row[typeField];
        params[idField] = row[idField];
      }
      return params;
    };

    // Методы для работы с изображениями
    const handleImageChange = async (row, fieldName, file) => {
      const errorKey = `${row.id}-${fieldName}`;
      imageErrors.value = {...imageErrors.value, [errorKey]: ''};

      try {
        if (file instanceof File) {
          await handleImageUpload(row, fieldName, file);
        } else if (file === null || file === '') {
          await deleteImage(row, fieldName);
        } else if (typeof file === 'string') {
          // Если это строка (уже загруженное изображение), просто обновляем значение
          row[fieldName] = file;
        }
      } catch (err) {
        imageErrors.value = {
          ...imageErrors.value,
          [errorKey]: err.message || 'Ошибка загрузки изображения'
        };
      }
    };

    const clearImageError = (rowId, fieldName) => {
      const errorKey = `${rowId}-${fieldName}`;
      imageErrors.value = {...imageErrors.value, [errorKey]: ''};
    };

    const handleImageUpload = async (row, fieldName, file) => {
      const errorKey = `${row.id}-${fieldName}`;

      try {
        loading.value = true;
        const formData = new FormData();
        formData.append('image', file);
        formData.append('field', fieldName);

        const response = await fetch(`${props.apiUrl}/${row.id}/upload-image`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (!response.ok) {
          let errorMessage = data.message || 'Ошибка загрузки изображения';
          if (data.errors) {
            errorMessage = Object.values(data.errors).flat().join(', ');
          }
          throw new Error(errorMessage);
        }

        if (!data.success) {
          throw new Error(data.message || 'Неизвестная ошибка');
        }

        row[fieldName] = data.image_path;
        const column = allFields.value.find(col => col.name === fieldName);
        if (column?.options?.image_path) {
          row[column.options.image_path] = data.full_path;
        }

        await fetchData();
      } catch (err) {
        imageErrors.value = {...imageErrors.value, [errorKey]: err.message};
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const deleteImage = async (row, fieldName) => {
      const errorKey = `${row.id}-${fieldName}`;

      try {
        loading.value = true;
        imageErrors.value = {...imageErrors.value, [errorKey]: ''};

        const response = await fetch(`${props.apiUrl}/${row.id}/delete-image`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({field: fieldName})
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Ошибка удаления изображения');
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || 'Неизвестная ошибка');
        }

        row[fieldName] = '';
        const column = allFields.value.find(col => col.name === fieldName);
        if (column?.options?.image_path) {
          row[column.options.image_path] = '';
        }

        await fetchData();
      } catch (err) {
        imageErrors.value = {...imageErrors.value, [errorKey]: err.message};
      } finally {
        loading.value = false;
      }
    };

    // Надежное получение DOM-элемента селекта
    const getSelectElement = () => {
      if (!inlineSelectRef.value) return null

      // Для компонента Vue 3
      if (inlineSelectRef.value.$el) return inlineSelectRef.value.$el

      // Для обычного DOM-элемента
      if (inlineSelectRef.value instanceof HTMLElement) return inlineSelectRef.value

      return null
    }

    // Очистка
    onUnmounted(closeInlineSelect)

    // Инициализация
    onMounted(() => {
      setupClickOutsideListener();
      window.addEventListener('keydown', handleKeyDown);
      fetchData();
    });

    onUnmounted(() => {
      if (clickOutsideHandler.value) {
        document.removeEventListener('mousedown', clickOutsideHandler.value);
      }
      window.removeEventListener('keydown', handleKeyDown);
    });

    watch([currentPage, sortField, sortDirection], fetchData);

    // Инициализация
    onMounted(() => {
      props.additionalFilters.forEach(filter => {
        selectedFilters.value[filter.field] = filter.defaultValue || '';
      });
      fetchData();
    });

    watch([currentPage, sortField, sortDirection], fetchData);

    // Переключение фильтра по ID
    const toggleIdFilter = (id) => {
      if (idFilter.value === id) {
        // Отключаем фильтр при повторном клике
        idFilter.value = null;
        fetchData();
      } else {
        // Включаем фильтр
        idFilter.value = id;
        // Отправляем запрос с параметром id
        currentPage.value = 1;
        fetchData();
      }
    };

    const filterByColumnValue = (column, value) => {
      // Получаем имя параметра для фильтрации
      const paramName = column.filter_button?.param_name || column.name;
      
      // Сбрасываем фильтр по ID, если он активен
      if (idFilter.value) {
        idFilter.value = null;
      }
      
      // Проверяем, активен ли уже этот фильтр
      if (selectedFilters.value[paramName] === value) {
        // Если да, сбрасываем фильтр
        selectedFilters.value[paramName] = '';
      } else {
        // Иначе устанавливаем новое значение
        selectedFilters.value[paramName] = value;
      }
      
      // Сбрасываем на первую страницу
      currentPage.value = 1;
      
      // Загружаем данные с новым фильтром
      fetchData();
    };

    const isColumnFiltered = (column, value) => {
      if (!column.filter_button || !column.filter_button.enabled) return false;
      return selectedFilters.value[column.filter_button.param_name || column.name] === value;
    };

    const isColumnFilterActive = (column) => {
      if (!column.filter_button) return false;
      const paramName = column.filter_button.param_name || column.name;
      return selectedFilters.value[paramName] !== undefined && 
             selectedFilters.value[paramName] !== null && 
             selectedFilters.value[paramName] !== '';
    };
    
    const clearColumnFilter = (column) => {
      if (!column.filter_button) return;
      const paramName = column.filter_button.param_name || column.name;
      selectedFilters.value[paramName] = '';
      currentPage.value = 1;
      fetchData();
    };

    return {
      tableData,
      loading,
      showForm,
      editingRow,
      currentPage,
      totalPages,
      totalItems,
      sortField,
      sortDirection,
      error,
      showFieldSelector,
      selectedFields,
      searchQuery,
      selectedFilters,
      activeSelect,
      inlineSelectRef,
      selectValues,
      imageErrors,
      showDeleteModal,
      deleteItem,
      deleteItemName,
      allFields,
      visibleColumns,
      displayedData,
      isResetDisabled,
      idFilter,
      toggleIdFilter,
      fetchData,
      toggleFieldSelector,
      toggleFieldSelection,
      getColumnStyle,
      sortBy,
      prevPage,
      nextPage,
      getFieldComponent,
      addNewRow,
      editRow,
      cancelForm,
      confirmDelete,
      executeDelete,
      debouncedSearch,
      clearSearch,
      applyFilters,
      resetAllFilters,
      getNestedValue,
      getSelectLabel,
      getSelectImage,
      getSelectIcon,
      getSelectApiParams,
      handleImageChange,
      clearImageError,
      link_to_site,
      isActiveSelect,
      updateValue,
      isFieldEditable,
      handleBlur,
      handleSelectChange,
      openInlineSelect,
      handleClickOutside,
      getSelectElement,
      handleSelectBlur,
      closeInlineSelect,
      handleKeyDown,
      handleInlineSelectChange,
      resetFieldSelector,
      isResetFieldsDisabled,
      filterByColumnValue,
      isColumnFiltered,
      isColumnFilterActive,
      clearColumnFilter
    };
  }
};
</script>

<style scoped>
.kirh-table-wrapper {
  height: 100%;
}

.kirh-field-selector {
  height: 100%;
  min-width: 14rem;
  max-height: calc(100vh - 200px);
}

.kirh-table-container {
  font-size: 0.8125rem;
  line-height: 1.2;
  min-width: 0;
}

.kirh-header {
  display: flex;
  width: 100%;
}

.kirh-row {
  display: flex;
  width: 100%;
}

.kirh-header-cell, .kirh-cell, .kirh-actions-cell {
  flex-grow: 0;
  flex-shrink: 0;
  min-width: 0;
}

.kirh-row:nth-child(even) {
  background-color: #f8fafc;
}

.kirh-row:hover {
  background-color: #d6d6d6;
}

.loader {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.kirh-edit-btn,
.kirh-delete-btn {
  padding: 0.125rem;
}

.kirh-edit-btn svg,
.kirh-delete-btn svg {
  display: block;
}

/* Стили для KirhSelectField внутри таблицы */
.kirh-cell :deep(.custom-select) {
  width: 100%;
}

.kirh-cell :deep(.selected-option) {
  padding: 2px 4px;
  min-height: 24px;
}

.kirh-cell :deep(.options-list) {
  font-size: 0.8125rem;
}

.kirh-cell :deep(.option) {
  padding: 4px 8px;
}

.static-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-radius: 0.25rem;
  padding: 0.25rem;
}

.static-select:hover {
  background-color: #f9fafb;
}

/* Стили для inline-селекта */
.inline-select {
  width: 100%;
}

/* Стиль для кнопки обновления */
.refresh-btn {
  transition: transform 0.3s ease;
}

.refresh-btn:active {
  transform: rotate(360deg);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>