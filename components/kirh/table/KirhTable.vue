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

      <!-- Кнопка управления панелью -->
      <button
          v-if="showFieldSelector"
          class="kirh-field-selector-toggle fixed left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-r-lg shadow-sm hover:bg-gray-50 transition-all duration-200 p-1.5"
          @click="toggleFieldSelectorCollapse"
          :title="isFieldSelectorCollapsed ? 'Развернуть панель' : 'Свернуть панель'"
      >
        <Icon 
            :name="isFieldSelectorCollapsed ? 'material-symbols:chevron-right' : 'material-symbols:chevron-left'" 
            size="1.2em" 
            class="text-gray-600"
        />
      </button>

      <!-- Панель выбора полей дополнительного редактирования -->
      <div
          v-if="showFieldSelector"
          :class="{'kirh-field-selector-collapsed': isFieldSelectorCollapsed}"
          class="kirh-field-selector w-56 bg-gray-50 border-r border-gray-200 p-2 overflow-y-auto flex-shrink-0 transition-all duration-300 relative"
      >
        <!-- Кнопка управления панелью для мобильной версии -->
        <button
            class="md:hidden text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md flex items-center gap-1 transition-colors shadow-sm mb-2 w-full justify-center"
            @click="toggleFieldSelectorCollapse"
        >
          <Icon 
              :name="isFieldSelectorCollapsed ? 'material-symbols:chevron-right' : 'material-symbols:chevron-left'" 
              size="1.2em" 
          />
          {{ isFieldSelectorCollapsed ? 'Показать панель полей' : 'Убрать панель полей' }}
        </button>

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
          class="kirh-table-container bg-white rounded-sm shadow-xs p-1 relative border border-gray-100 flex-1 flex flex-col"
      >
        <!-- Прелоадер -->
        <div v-if="loading" class="fixed inset-0 flex items-center justify-center z-50">
          <img src="/ldr.png" class="loader-image" alt="Loading...">
        </div>

        <!-- Панель управления с пагинацией, обновление/сброс, toggle-фильтры, текстовый поиск -->
        <div class="kirh-controls flex flex-wrap gap-1 items-center mb-1 p-1.5 bg-blue-50 w-full">
          <!-- Мобильные toggle-фильтры -->
          <div class="md:hidden flex flex-col w-full gap-1 mb-2">
            <div v-for="(filter, index) in additionalFilters" :key="index" class="flex items-center w-full">
              <ToggleFilter
                  v-if="filter.type === 'toggle'"
                  v-model="selectedFilters[filter.field]"
                  :active-class="filter.activeClass || 'bg-blue-500 text-white'"
                  :filter="filter"
                  :disabled="!!idFilter"
                  class="w-full"
                  @update:modelValue="applyFilters"
              />
            </div>
          </div>

          <div class="kirh-pagination flex items-left gap-1 text-xs">
            <!-- Пагинация -->
            <span v-if="tableOptions.pagination" class="text-gray-500 text-xs">Всего: {{ totalItems }}</span>
            <button
                v-if="tableOptions.pagination"
                :disabled="currentPage === 1 || loading"
                class="kirh-pagination-btn px-1 py-0.5 rounded-sm disabled:opacity-50 hover:bg-gray-50"
                @click="prevPage"
            >
              <Icon name="emojione-v1:left-arrow" size="1.5em" />
            </button>
            <span v-if="tableOptions.pagination" class="kirh-page-info mx-0.5 text-xs">{{ currentPage }}/{{ totalPages }}</span>
            <button
                v-if="tableOptions.pagination"
                :disabled="currentPage === totalPages || loading"
                class="kirh-pagination-btn px-1 py-0.5 rounded-sm disabled:opacity-50 hover:bg-gray-50"
                @click="nextPage"
            >
              <Icon name="emojione-v1:right-arrow" size="1.5em" />
            </button>

            <!-- Селект количества записей на странице -->
            <div v-if="tableOptions.pagination && tableOptions.pageSizeOptions" class="flex items-center gap-1">
              <span class="text-gray-500">Записей:</span>
              <select
                  v-model.number="currentPageSize"
                  @change="handlePageSizeChange($event.target.value)"
                  class="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                <option
                    v-for="size in tableOptions.pageSizeOptions"
                    :key="size"
                    :value="parseInt(size, 10)"
                >
                  {{ size }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex flex-row gap-1">
            <!-- Кнопка обновления таблицы -->
            <button
                :disabled="loading"
                class="refresh-btn text-xs bg-blue-500 hover:bg-blue-400 text-gray-50 px-3 py-1 rounded-md flex items-left gap-1 transition-colors shadow-sm"
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
                :class="tableOptions.resetFiltersClass || 'text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'"
                :disabled="isResetDisabled"
                @click="resetAllFilters"
            >
              {{ tableOptions.resetFiltersLabel || 'Сбросить' }}
            </button>
          </div>

          <div class="kirh-pagination flex items-center gap-2 text-xs">
            <!-- Дополнительные фильтры для десктопной версии -->
            <div class="hidden md:flex items-center gap-2">
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
            </div>

            <!-- Информация об отключении редактирования -->
            <div class="bg-red-600 text-gray-50 px-2" v-if="!tableOptions.editable">
              Ред.выкл
            </div>
          </div>
        </div>

        <!-- Кнопка управления панелью выбора полей и фильтры -->
        <div class="flex flex-wrap gap-2 mb-1 justify-between items-center w-full">
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

            <!-- Кнопка массовых действий -->
            <button
                v-if="tableOptions.enableBulkActions"
                class="hidden md:flex text-xs bg-gray-800 hover:bg-gray-900 text-white px-3 py-2.5 rounded-md flex items-center gap-1 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!hasSelectedRows"
                @click="openBulkActionsModal"
            >
              <Icon name="material-symbols:playlist-add-check" size="1.2em" />
              Действия ({{ selectedRows.size }})
            </button>
          </div>

          <!-- Блок Фильтры -->
          <div class="flex items-center gap-2">
            <!-- Кнопка мобильного меню фильтров -->
            <button
                class="md:hidden text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-2.5 rounded-md flex items-center gap-1 transition-colors shadow-sm"
                @click="showMobileFilters = !showMobileFilters"
            >
              <Icon name="material-symbols:filter-list" size="1.2em" />
              Фильтры
            </button>

            <!-- Десктопные фильтры -->
            <div class="hidden md:flex flex-wrap items-center gap-2">
              <!-- Селект фильтры -->
              <div v-for="(filter, index) in additionalFilters" :key="index" class="flex items-center">
                <KirhSelectField
                    v-if="filter.type !== 'toggle'"
                    v-model="selectedFilters[filter.field]"
                    :api-params="filter.apiParams"
                    :api-url="filter.apiUrl"
                    :emptyOption="filter.emptyOption"
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
                    class="w-48"
                    @update:modelValue="applyFilters"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Мобильное меню фильтров -->
        <div v-if="showMobileFilters" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 md:hidden">
          <div class="bg-white rounded-lg shadow-xl p-4 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Фильтры</h3>
              <button
                  class="text-gray-500 hover:text-gray-700"
                  @click="showMobileFilters = false"
              >
                <Icon name="material-symbols:close" size="1.5em" />
              </button>
            </div>
            
            <div class="flex flex-col gap-4">
              <!-- Мобильные фильтры -->
              <div v-for="(filter, index) in additionalFilters" :key="index" class="flex flex-col gap-2">
                <label v-if="filter.type !== 'toggle'" class="text-sm font-medium text-gray-700">{{ filter.label }}</label>
                <KirhSelectField
                    v-if="filter.type !== 'toggle'"
                    v-model="selectedFilters[filter.field]"
                    :api-params="filter.apiParams"
                    :api-url="filter.apiUrl"
                    :emptyOption="filter.emptyOption"
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
                    class="w-full"
                    @update:modelValue="applyFilters"
                />
              </div>
              
              <div class="flex justify-end gap-2 mt-4">
                <button
                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    @click="showMobileFilters = false"
                >
                  Закрыть
                </button>
                <button
                    class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    @click="applyFilters"
                >
                  Применить
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Контейнер с горизонтальной прокруткой для таблицы -->
        <div class="kirh-table-scroll-container overflow-x-auto overflow-y-auto" style="max-height: 70vh;" ref="tableScrollRef">
          <!-- Таблица -->
          <div class="kirh-table w-full min-w-max">

            <!-- Заголовки -->
            <div class="kirh-header flex mb-px text-xs font-medium cursor-pointer border-b sticky top-0 z-20 bg-gray-100 shadow-sm">
              <!-- Колонка с чекбоксами -->
              <div 
                  v-if="tableOptions.enableBulkActions"
                  class="kirh-header-cell flex items-center justify-center group relative bg-gray-100 px-2 py-2 border border-gray-200 rounded hidden md:block"
                  style="flex: 0 0 40px;"
              >
                <div class="flex items-center justify-center w-full">
                  <input
                      type="checkbox"
                      class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      :checked="selectedRows.size === tableData.length"
                      @change="selectedRows.size === tableData.length ? clearSelectedRows() : tableData.forEach(row => selectedRows.add(row.id))"
                  />
                </div>
              </div>

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
                  
                  <Icon 
                      v-if="column.title_icon" 
                      :name="column.title_icon" 
                      size="1.5em" 
                      class="flex-shrink-0 mr-1"
                  />
                  
                  <!-- Текст заголовка (показываем только если label не пустой) -->
                  <span 
                      v-if="column.label && column.label !== ''" 
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
                      <Icon name="material-symbols:close" size="1em" />
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
                        class="absolute z-20 hidden group-hover:block bg-white text-gray-700 text-xs rounded px-2 py-1 whitespace-normal w-48 shadow-lg border border-gray-200"
                        style="transform: translate(-50%, 10px); left: 50%;"
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
              <Icon name="fluent:table-edit-20-regular" size="1.5em" class="text-green-600 mx-auto" />
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
                <!-- Колонка с чекбоксом -->
                <div 
                    v-if="tableOptions.enableBulkActions"
                    class="kirh-cell border-b border-gray-100 flex items-center justify-center hidden md:block"
                    style="flex: 0 0 40px;"
                >
                  <div class="flex items-center justify-center w-full">
                    <input
                        type="checkbox"
                        class="w-4 h-4 mt-2 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        :checked="isRowSelected(row)"
                        @change="toggleRowSelection(row)"
                    />
                  </div>
                </div>

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
                    :title="getCellTitle(row, column)"
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
                        :emptyOption="column.emptyOption"
                        :limit="column.options.limit || null"
                        :options="column.options.options"
                        :emptyable="column.options?.emptyable"
                        :enablSearch="column.options?.enableSearch"
                        :class="getSelectCellClass(row, column)"
                        @update:modelValue="(val) => handleSelectChange(row, column.name, val)"
                    />

                    <!-- API селект -->
                    <div v-else class="border border-gray-200 rounded" :class="getSelectCellClass(row, column)">
                      <!-- Статическое отображение -->
                      <div
                          v-if="!isActiveSelect(row.id, column.name)"
                          class="flex items-center justify-between cursor-pointer hover:bg-gray-200 rounded min-h-8 p-1"
                          @click="openInlineSelect(row, column)"
                      >
                        <div class="flex items-center min-w-0">
                          <!-- Изображение -->
                          <img
                              v-if="getSelectImage(row, column)"
                              :src="getSelectImage(row, column)"
                              class="mr-2 rounded object-cover flex-shrink-0"
                              :class="column.options?.img_size || 'w-6 h-6'"
                          />
                          <!-- Иконка -->
                          <Icon
                              v-else-if="getSelectIcon(row, column)"
                              :name="getSelectIcon(row, column)"
                              class="h-5 w-5 mr-2 text-gray-600 flex-shrink-0"
                          />
                          <!-- Текст -->
                          <span class="truncate">
                            {{ getSelectLabel(row, column) || column.emptyOption?.label || 'Не выбрано' }}
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
                          :options="column.options"
                          :enableSearch="column.options?.enableSearch"
                          :emptyable="column.options?.emptyable"
                          :emptyOption="column.emptyOption"
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
                  <template v-else-if="column.type === 'rel_value'">
                    <div
                        :class="[
                          'rel-value-cell',
                          column.options?.cellClass || '',
                          !row[column.name] && column.options?.check_null ? 'opacity-50' : ''
                        ]"
                        @click="openRelValueModal(row, column)"
                    >
                      {{ row[column.name] }}
                    </div>
                  </template>

                  <template v-else-if="column.type === 'parse_table'">
                    <div class="w-full">
                      <ParseTableField
                        :value="row[column.name]"
                        :error="null"
                        :options="column.options"
                        :row="row"
                        @refresh="fetchData"
                      />
                    </div>
                  </template>

                  <template v-else-if="column.type === 'hidden'">
                    <!-- Hidden поля не отображаются в таблице, но сохраняются в rowData -->
                    <input 
                      type="hidden" 
                      :value="row[column.name]"
                      @input="(e) => handleHiddenChange(row, column.name, e.target.value)"
                    />
                  </template>

                  <template v-else>
                    <component
                        :is="getFieldComponent(column.type)"
                        :error="error"
                        :options="column.options"
                        :column="column"
                        :readonly="column.options.readonly"
                        :type="column.type"
                        :model-value="row[column.name]"
                        :row-data="row"
                        :row="row"
                        :api-url="apiUrl"
                        @update:model-value="column.type === 'morphedByMany' || column.type === 'belongsToMany' || column.type === 'morphToMany' ? null : updateValue(row, column.name, $event)"
                        @blur="column.type === 'aigen' ? handleAigenBlur(row, column.name, $event) : (column.type === 'morphedByMany' || column.type === 'belongsToMany' || column.type === 'morphToMany' ? null : handleBlur(row, column.name))"
                        @input="column.type === 'aigen' || column.type === 'morphedByMany' || column.type === 'belongsToMany' || column.type === 'morphToMany' ? null : updateValue(row, column.name, $event)"
                        @change="column.type === 'aigen' || column.type === 'morphedByMany' || column.type === 'belongsToMany' || column.type === 'morphToMany' ? null : updateValue(row, column.name, $event)"
                        @keyup.enter="column.type === 'aigen' ? null : (column.type === 'morphedByMany' || column.type === 'belongsToMany' || column.type === 'morphToMany' ? null : handleBlur(row, column.name))"
                        @click="handleCellClick(row, column)"
                    />
                  </template>

                  <!-- Всплывающая подсказка с полным значением -->
                  <div v-if="row[column.name] && column.type !== 'image'" 
                       class="absolute z-20 hidden group-hover:block bg-white text-gray-700 text-xs rounded px-2 py-1 whitespace-normal w-48 shadow-lg border border-gray-200"
                       style="transform: translate(-50%, 10px); left: 50%;">
                    {{ row[column.name] }}
                  </div>
                </div>

                <div v-if="tableOptions.deleteable || tableOptions.editrow || tableOptions.link"
                     class="kirh-actions-cell border-b border-gray-100 flex gap-1 items-center justify-center"
                     style="flex: 0 0 80px;"
                >
                  <NuxtLink v-if="tableOptions.editrow && tableOptions.editable"
                          :to="`${tableOptions.editrow_link_prefix || '/articles'}/${row.id}`"
                          class="kirh-edit-btn text-blue-500 hover:text-blue-700 transition-colors p-0.5"
                          title="Редактировать"
                  >
                    <Icon name="akar-icons:edit" size="1.5em"/>
                  </NuxtLink>
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
        </div>

        <!-- Ошибки -->
        <div
            v-if="error"
            class="kirh-error mt-1 p-1.5 bg-red-50 text-red-600 rounded-sm border border-red-100 text-xs"
        >
          {{ error }}
        </div>

        <!-- Модальное окно для проверки свежести значения -->
        <div v-if="showFreshnessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Значение устарело</h3>
            <p class="text-sm text-gray-600 mb-2">
              Текущее значение на сервере: <span class="font-medium">{{ serverValue }}</span>
            </p>
            <p class="text-sm text-gray-600 mb-6">
              Дата последнего обновления: <span class="font-medium">{{ updatedAt }}</span>
            </p>
            <div class="flex justify-end">
              <button
                  class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  @click="updateCellValue"
              >
                Обновить значение
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Модальное окно для редактирования rel_value -->
    <div v-if="showRelValueModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
          ref="relValueEditorContainer"
          class="bg-white shadow-xl flex flex-col transition-all max-w-4xl w-full h-[90vh] border rounded-lg"
      >
        <div class="p-4 border-b flex justify-between items-center">
          <h3 class="text-lg font-semibold">
            {{ currentRelValueColumn?.options?.modalTitle || 'Редактор' }}
          </h3>
          <button
              class="text-gray-500 hover:text-gray-700"
              @click="closeRelValueModal"
          >
            <Icon name="ph:x" size="20"/>
          </button>
        </div>

        <div class="flex-1 overflow-auto p-4">
          <div v-if="currentRelValueColumn?.options?.editorEnabled" class="h-full">
            <RichTextEditor
                :model-value="relValueEditorContent"
                :editor-enabled="true"
                :placeholder="currentRelValueColumn?.options?.placeholder"
                :upload-options="{
                  url: currentRelValueColumn?.options?.uploadUrl || '/api/upload-image',
                  maxWidth: currentRelValueColumn?.options?.imageMaxWidth || 1200,
                  quality: currentRelValueColumn?.options?.imageQuality || 0.8
                }"
                @update:model-value="handleRelValueUpdate"
            />
          </div>
          <div v-else class="h-full">
            <textarea
                v-model="relValueEditorContent"
                :placeholder="currentRelValueColumn?.options?.placeholder"
                class="w-full h-full p-2 border rounded font-mono text-sm outline-none resize-none text-left whitespace-pre-wrap leading-normal"
            ></textarea>
          </div>
        </div>

        <div class="p-4 border-t flex justify-end space-x-2">
          <button
              class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              @click="closeRelValueModal"
          >
            Отмена
          </button>
          <button
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              @click="saveRelValueChanges"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно для массовых действий -->
    <div v-if="showBulkActionsModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Массовые действия</h3>
        <p class="text-sm text-gray-600 mb-4">
          Выбрано записей: {{ selectedRows.size }}
        </p>
        <div class="flex flex-col gap-2">
          <button
              v-for="action in tableOptions.bulkActions"
              :key="action.name"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2',
                action.name === 'delete' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
              ]"
              @click="executeBulkAction(action)"
          >
            <Icon :name="action.icon" size="1.2em" />
            {{ action.label }}
          </button>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              @click="closeBulkActionsModal"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно для подтверждения удаления -->
    <div v-if="showDeleteConfirmationModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Подтверждение удаления</h3>
        <p class="text-sm text-gray-600 mb-4">
          Вы уверены, что хотите удалить выбранные записи ({{ selectedRows.size }})?
        </p>
        <div class="flex justify-end gap-2 mt-4">
          <button
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              @click="closeDeleteConfirmationModal"
          >
            Отмена
          </button>
          <button
              class="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600"
              @click="confirmBulkDelete"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { debounce } from 'lodash-es';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import KirhMultiFieldModal from './KirhMultiFieldModal.vue';
import KirhTableForm from './components/KirhTableForm.vue';
import RichTextEditor from "./editor/RichTextEditor.vue";
import AIGenField from './fields/AIGenField.vue';
import KirhBelongsToManyField from './fields/KirhBelongsToManyField.vue';
import KirhDateTimeField from './fields/KirhDateTimeField.vue';
import KirhHasManyField from './fields/KirhHasManyField.vue';
import KirhHasManySelectField from './fields/KirhHasManySelectField.vue';
import KirhImageField from './fields/KirhImageField.vue';
import KirhMorphToManyField from './fields/KirhMorphToManyField.vue';
import KirhMorphedByManyField from './fields/KirhMorphedByManyField.vue';
import KirhSelectField from './fields/KirhSelectField.vue';
import KirhSwapField from './fields/KirhSwapField.vue';
import KirhTextField from './fields/KirhTextField.vue';
import KirhTextareaField from "./fields/KirhTextareaField.vue";
import KirhToggleField from './fields/KirhToggleField.vue';
import ParseTableField from './fields/ParseTableField.vue';
import ParseTableLockField from './fields/ParseTableLockField.vue';
import ToggleFilter from "./filters/ToggleFilter.vue";

export default {
  name: 'KirhTable',
  components: {
    ToggleFilter,
    KirhTextField,
    KirhSelectField,
    KirhToggleField,
    KirhDateTimeField,
    KirhImageField,
    KirhTextareaField,
    KirhHasManyField,
    KirhMorphedByManyField,
    KirhBelongsToManyField,
    KirhMorphToManyField,
    KirhTableForm,
    KirhSwapField,
    RichTextEditor,
    ParseTableField,
    ParseTableLockField,
    AIGenField,
    KirhHasManySelectField,
    KirhMultiFieldModal,
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
        pageSizeOptions: [5, 10, 25, 50, 100],
        link: false,
        link_prefix: '',
        enableResetFilters: true,
        resetFiltersLabel: 'Сбросить',
        resetFiltersClass: 'text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
        showIdFilter: true,
        defaultSortField: null,
        defaultSortDirection: 'asc',
        enableBulkActions: false, // Включает функционал множественного выбора и массовых действий
        bulkActions: [ // Массив доступных массовых действий
          {
            name: 'delete',
            label: 'Удалить',
            icon: 'mynaui:trash',
            color: 'red',
            confirm: true,
            confirmTitle: 'Подтверждение удаления',
            confirmMessage: 'Вы уверены, что хотите удалить выбранные записи?'
          }
        ]
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
    const currentPageSize = ref(props.tableOptions.pageSize || 30);
    const sortField = ref(props.tableOptions.defaultSortField || 'id');
    const sortDirection = ref(props.tableOptions.defaultSortDirection || 'desc');
    const error = ref(null);
    const showFieldSelector = ref(props.tableOptions.enableFieldSelector || false);
    const searchQuery = ref('');
    const selectedFilters = ref({});
    const activeSelect = ref(null);
    const inlineSelectRef = ref(null);
    const selectValues = ref({});
    const imageErrors = ref({});
    const showDeleteModal = ref(false);
    const deleteItem = ref(null);
    const selectedFields = ref([]);
    const clickOutsideHandler = ref(null);
    const idFilter = ref(null);
    const showMobileFilters = ref(false);
    const isFieldSelectorCollapsed = ref(false);
    const showFreshnessModal = ref(false);
    const serverValue = ref('');
    const updatedAt = ref('');
    const currentCell = ref(null);
    const isFreshnessChecked = ref(false);

    // Новые реактивные переменные для rel_value
    const showRelValueModal = ref(false);
    const currentRelValueRow = ref(null);
    const currentRelValueColumn = ref(null);
    const relValueEditorContent = ref('');
    const relValueEditorContainer = ref(null);

    // Новые реактивные переменные для массовых действий
    const selectedRows = ref(new Set());
    const showBulkActionsModal = ref(false);
    const selectedBulkAction = ref(null);

    // Новые реактивные переменные для подтверждения удаления
    const showDeleteConfirmationModal = ref(false);
    const pendingBulkAction = ref(null);

    // Методы
    const getFieldComponent = (type) => {
      const componentMap = {
        text: KirhTextField,
        date: KirhDateTimeField,
        time: KirhDateTimeField,
        datetime: KirhDateTimeField,
        textarea: KirhTextareaField,
        select: KirhSelectField,
        toggle: KirhToggleField,
        image: KirhImageField,
        hasmany: KirhHasManyField,
        morphedByMany: KirhMorphedByManyField,
        belongsToMany: KirhBelongsToManyField,
        morphToMany: KirhMorphToManyField,
        swap: KirhSwapField,
        rel_value: KirhTextField,
        parse_table: ParseTableField,
        parse_table_lock: ParseTableLockField,
        hidden: KirhTextField, // Добавляем поддержку hidden полей
        aigen: AIGenField, // Добавляем поддержку AI генерации
        'has-many-select': KirhHasManySelectField,
        multi_field_modal: KirhMultiFieldModal, // Новый тип поля
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

      // Получаем актуальное значение из события или напрямую
      const actualValue = value?.target?.value ?? value;

      // Для всех полей обновляем локальное значение
      row[fieldName] = actualValue;

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

      // Обрабатываем разные типы полей по-разному
      if (column) {
        switch (column.type) {
          case 'select':
          case 'toggle':
            handleSelectChange(row, fieldName, actualValue);
            break;
          case 'date':
          case 'time':
          case 'datetime':
            // Для полей даты/времени отправляем изменения на сервер
            handleDateTimeChange(row, fieldName, actualValue);
            break;
          case 'text':
          case 'textarea':
            // Для текстовых полей отправляем изменения напрямую
            handleTextChange(row, fieldName, actualValue);
            break;
          default:
            // Для остальных типов полей используем handleSelectChange
            handleSelectChange(row, fieldName, actualValue);
        }
      } else {
        // Если тип поля не определен, используем handleTextChange
        handleTextChange(row, fieldName, actualValue);
      }
    };

    // Новый метод для обработки изменений полей даты/времени
    const handleDateTimeChange = async (row, fieldName, value) => {
      try {
        // Обновляем локальное значение
        row[fieldName] = value;

        // Отправляем изменения на сервер
        const response = await fetch(`${props.apiUrl}/${row.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            [fieldName]: value
          })
        });

        const data = await response.json();

        if (response.ok) {
          // Обновляем значение в таблице
          row[fieldName] = data[fieldName];
          // Обновляем все данные таблицы
          await fetchData();
        } else {
          // В случае ошибки возвращаем старое значение
          row[fieldName] = value;
          // Устанавливаем сообщение об ошибке
          error.value = data.message || 'Ошибка при обновлении значения';
        }
      } catch (error) {
        console.error('Error updating datetime value:', error);
        // В случае ошибки возвращаем старое значение
        row[fieldName] = value;
        // Устанавливаем сообщение об ошибке
        error.value = 'Ошибка при обновлении значения';
      }
    };

    // Новый метод для обработки изменений текстовых полей
    const handleTextChange = (row, fieldName, value) => {
      // Просто обновляем локальное значение
      row[fieldName] = value;
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

        // Проверяем, нужно ли проверять свежесть значения и не была ли уже проверка
        if (column?.checkFreshness && !isFreshnessChecked.value) {
          // Сохраняем текущую ячейку
          currentCell.value = { row, column };
          
          const response = await fetch(`${props.apiUrl}/${row.id}/check-freshness?field=${fieldName}&value=${encodeURIComponent(row[fieldName] || '')}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();

          if (!data.is_fresh) {
            // Показываем модальное окно с выбором действия
            serverValue.value = data.server_value;
            updatedAt.value = data.updated_at;
            showFreshnessModal.value = true;
            return;
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
        isFreshnessChecked.value = false; // Сбрасываем флаг после успешного сохранения
      } catch (err) {
        error.value = err.message;
        console.error('Ошибка при сохранении:', err);
      }
    };

    // Обработчик события blur для полей типа aigen
    const handleAigenBlur = async (row, fieldName, event) => {
      try {
        // Получаем значение из события blur
        const value = event || row[fieldName];
        
        const column = allFields.value.find(col => col.name === fieldName);

        if (column?.validate) {
          const validationResult = column.validate(value);
          if (typeof validationResult === 'string') {
            throw new Error(validationResult);
          }
          if (validationResult === false) {
            throw new Error('Недопустимое значение');
          }
        }

        // Проверяем, нужно ли проверять свежесть значения и не была ли уже проверка
        if (column?.checkFreshness && !isFreshnessChecked.value) {
          // Сохраняем текущую ячейку
          currentCell.value = { row, column };
          
          const response = await fetch(`${props.apiUrl}/${row.id}/check-freshness?field=${fieldName}&value=${encodeURIComponent(value || '')}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();

          if (!data.is_fresh) {
            // Показываем модальное окно с выбором действия
            serverValue.value = data.server_value;
            updatedAt.value = data.updated_at;
            showFreshnessModal.value = true;
            return;
          }
        }

        const response = await fetch(`${props.apiUrl}/${row.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({[fieldName]: value})
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        // Обновляем значение в row
        row[fieldName] = value;
        
        await fetchData();
        isFreshnessChecked.value = false; // Сбрасываем флаг после успешного сохранения
      } catch (err) {
        error.value = err.message;
        console.error('Ошибка при сохранении AI поля:', err);
      }
    };

    const allFields = computed(() => {
      // Отфильтровываем исключенные поля только из основной таблицы
      const tableFields = props.tableOptions.columns
        .filter(col => !props.excludedFields.includes(col.name))
        .map(col => ({
          name: col.name,
          label: col.label,
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
        label: field.label,
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
            if (selectedFilters.value[filter.field] !== undefined && 
                selectedFilters.value[filter.field] !== '' && 
                selectedFilters.value[filter.field] !== null) {
              filterParams[filter.field] = selectedFilters.value[filter.field];
            }
          });
          
          // Добавляем фильтры из кнопок в колонках
          Object.entries(selectedFilters.value).forEach(([key, value]) => {
            if (value !== undefined && value !== '' && value !== null) {
              filterParams[key] = value;
            }
          });
        }

        const queryParams = new URLSearchParams({
          page: currentPage.value,
          per_page: parseInt(currentPageSize.value, 10), // Преобразуем в число
          ...(sortField.value && {sort_field: sortField.value}),
          ...(sortDirection.value && {sort_direction: sortDirection.value}),
          ...props.additionalParams,
          ...filterParams
        });

        // Добавляем api_params из tableOptions, если они есть
        if (props.tableOptions.api_params) {
          const apiParams = new URLSearchParams(props.tableOptions.api_params);
          for (const [key, value] of apiParams.entries()) {
            queryParams.set(key, value);
          }
        }

        const response = await fetch(`${props.apiUrl}?${queryParams.toString()}`);
        const data = await response.json();

        closeInlineSelect();

        if (!response.ok) {
          throw new Error(data.message || 'Ошибка загрузки данных');
        }

        const processedData = data.data || data;
        tableData.value = processedData.map((item, index) => {
          if (!item.id) {
            item.uniqueKey = `row-${index}-${Date.now()}` // Добавляем уникальный ключ
          }
          return item;
        });

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
      if (column.options?.apiParams) {
        Object.entries(column.options.apiParams).forEach(([key, fieldName]) => {
          params[key] = row[fieldName];
        });
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
      
      // Устанавливаем начальное значение для currentPageSize
      if (props.tableOptions.pageSizeOptions && props.tableOptions.pageSizeOptions.length > 0) {
        const initialSize = parseInt(props.tableOptions.pageSize, 10);
        currentPageSize.value = props.tableOptions.pageSizeOptions.includes(initialSize) 
          ? initialSize 
          : props.tableOptions.pageSizeOptions[0];
      } else {
        currentPageSize.value = parseInt(props.tableOptions.pageSize, 10) || 10;
      }
      
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
      
      // Проверяем, активен ли уже этот фильтр
      if (selectedFilters.value[paramName] === value) {
        // Если да, сбрасываем все фильтры
        searchQuery.value = '';
        Object.keys(selectedFilters.value).forEach(key => {
          selectedFilters.value[key] = '';
        });
        sortField.value = props.tableOptions.defaultSortField;
        sortDirection.value = props.tableOptions.defaultSortDirection;
        currentPage.value = 1;
        idFilter.value = null;
      } else {
        // Если нет, сбрасываем все текущие фильтры
        searchQuery.value = '';
        Object.keys(selectedFilters.value).forEach(key => {
          selectedFilters.value[key] = '';
        });
        sortField.value = props.tableOptions.defaultSortField;
        sortDirection.value = props.tableOptions.defaultSortDirection;
        currentPage.value = 1;
        idFilter.value = null;

        // Устанавливаем новое значение фильтра
        selectedFilters.value[paramName] = value;
      }
      
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

    // Метод для переключения состояния панели
    const toggleFieldSelectorCollapse = () => {
      isFieldSelectorCollapsed.value = !isFieldSelectorCollapsed.value;
    };

    // Метод для сохранения изменений текстовых полей
    const saveTextChanges = async (row, fieldName, value) => {
      try {
        // Отправляем на сервер
        const response = await fetch(`${props.apiUrl}/${row.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({[fieldName]: value})
        });

        if (!response.ok) {
          // Если ошибка - возвращаем старое значение
          const oldValue = row[fieldName];
          row[fieldName] = oldValue;
          throw new Error(await response.text());
        }

        // Полностью обновляем данные из сервера после успешного сохранения
        await fetchData();
      } catch (err) {
        error.value = err.message;
        console.error('Ошибка при сохранении:', err);
      }
    };

    const handleCellClick = async (row, column) => {
      try {
        // Проверяем, нужно ли проверять свежесть значения и не была ли уже проверка
        if (column?.checkFreshness && !isFreshnessChecked.value) {
          // Сохраняем текущую ячейку
          currentCell.value = { row, column };
          
          const response = await fetch(`${props.apiUrl}/${row.id}/check-freshness?field=${column.name}&value=${encodeURIComponent(row[column.name] || '')}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();

          if (!data.is_fresh) {
            // Показываем модальное окно с выбором действия
            serverValue.value = data.server_value;
            updatedAt.value = formatDate(data.updated_at); // Форматируем дату
            showFreshnessModal.value = true;
            return;
          }
        }
      } catch (err) {
        error.value = err.message;
        console.error('Ошибка при проверке свежести значения:', err);
      }
    };

    const updateCellValue = async () => {
      try {
        if (!currentCell.value) return;
        
        const { row, column } = currentCell.value;
        row[column.name] = serverValue.value;
        
        const response = await fetch(`${props.apiUrl}/${row.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({[column.name]: serverValue.value})
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        await fetchData();
        showFreshnessModal.value = false;
        isFreshnessChecked.value = false; // Сбрасываем флаг после обновления значения
      } catch (err) {
        error.value = err.message;
        console.error('Ошибка при обновлении значения:', err);
      }
    };

    // Добавляем метод форматирования даты
    const formatDate = (dateString) => {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };

    // Метод для получения класса ячейки select-поля
    const getSelectCellClass = (row, column) => {
      if (!column.options?.ev) return '';
      
      const value = row[column.name];
      const classConfig = column.options.ev.find(c => c.warn_ev === value);
      
      return classConfig ? classConfig.class_warn_ev : '';
    };

    // Добавляем метод для получения заголовка ячейки
    const getCellTitle = (row, column) => {
      if (!row[column.name]) return '';
      
      if (column.type === 'select') {
        return getSelectLabel(row, column) || column.emptyOption?.label || 'Не выбрано';
      }
      
      return row[column.name];
    };

    // Метод для открытия модального окна rel_value
    const openRelValueModal = async (row, column) => {
      if (column.options?.check_null && !row[column.name]) {
        return;
      }

      try {
        loading.value = true;
        const response = await fetch(`${props.apiUrl}/${row.id}/rel-value?field=${column.name}&rel_field=${column.options.rel_field}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Ошибка загрузки данных');
        }

        currentRelValueRow.value = row;
        currentRelValueColumn.value = column;
        relValueEditorContent.value = data.value || '';
        showRelValueModal.value = true;
      } catch (err) {
        error.value = err.message;
        console.error('Ошибка при загрузке данных:', err);
      } finally {
        loading.value = false;
      }
    };

    // Метод для закрытия модального окна rel_value
    const closeRelValueModal = () => {
      showRelValueModal.value = false;
      currentRelValueRow.value = null;
      currentRelValueColumn.value = null;
      relValueEditorContent.value = '';
    };

    // Метод для сохранения изменений rel_value
    const saveRelValueChanges = async () => {
      if (!currentRelValueRow.value || !currentRelValueColumn.value) return;

      try {
        loading.value = true;
        const response = await fetch(`${props.apiUrl}/${currentRelValueRow.value.id}/rel-value`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            field: currentRelValueColumn.value.options.rel_field,
            value: relValueEditorContent.value
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Ошибка сохранения данных');
        }

        await fetchData();
        closeRelValueModal();
      } catch (err) {
        error.value = err.message;
        console.error('Ошибка при сохранении данных:', err);
      } finally {
        loading.value = false;
      }
    };

    // Обработчик обновления значения в редакторе
    const handleRelValueUpdate = (newValue) => {
      relValueEditorContent.value = newValue;
    };

    const handlePageSizeChange = (size) => {
      const newSize = parseInt(size, 10);
      if (!isNaN(newSize)) {
        currentPageSize.value = newSize;
        currentPage.value = 1; // Сбрасываем на первую страницу при изменении размера
        fetchData();
      }
    };

    // Методы для работы с массовыми действиями
    const toggleRowSelection = (row) => {
      if (selectedRows.value.has(row.id)) {
        selectedRows.value.delete(row.id);
      } else {
        selectedRows.value.add(row.id);
      }
    };

    const clearSelectedRows = () => {
      selectedRows.value.clear();
    };

    const isRowSelected = (row) => {
      return selectedRows.value.has(row.id);
    };

    const hasSelectedRows = computed(() => {
      return selectedRows.value.size > 0;
    });

    const openBulkActionsModal = () => {
      showBulkActionsModal.value = true;
    };

    const closeBulkActionsModal = () => {
      showBulkActionsModal.value = false;
      selectedBulkAction.value = null;
    };

    const openDeleteConfirmationModal = (action) => {
      pendingBulkAction.value = action;
      showDeleteConfirmationModal.value = true;
    };

    const closeDeleteConfirmationModal = () => {
      showDeleteConfirmationModal.value = false;
      pendingBulkAction.value = null;
    };

    const executeBulkAction = async (action) => {
      if (!action || !hasSelectedRows.value) return;

      try {
        loading.value = true;
        
        if (action.name === 'delete') {
          // Если требуется подтверждение
          if (action.confirm) {
            openDeleteConfirmationModal(action);
            return;
          }

          const response = await fetch(`${props.apiUrl}/bulk-delete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ids: Array.from(selectedRows.value)
            })
          });

          if (!response.ok) {
            throw new Error('Ошибка при удалении записей');
          }

          // Очищаем выбранные записи и обновляем данные
          clearSelectedRows();
          await fetchData();
          closeBulkActionsModal();
        }
      } catch (err) {
        error.value = err.message;
        console.error('Ошибка при выполнении массового действия:', err);
      } finally {
        loading.value = false;
      }
    };

    const confirmBulkDelete = async () => {
      if (!pendingBulkAction.value) return;
      
      try {
        loading.value = true;
        const response = await fetch(`${props.apiUrl}/bulk-delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ids: Array.from(selectedRows.value)
          })
        });

        if (!response.ok) {
          throw new Error('Ошибка при удалении записей');
        }

        // Очищаем выбранные записи и обновляем данные
        clearSelectedRows();
        await fetchData();
        closeBulkActionsModal();
      } catch (err) {
        error.value = err.message;
        console.error('Ошибка при удалении записей:', err);
      } finally {
        loading.value = false;
        closeDeleteConfirmationModal();
      }
    };

    const handleHiddenChange = (row, fieldName, value) => {
      row[fieldName] = value;
      updateValue(row, fieldName, value);
    };

    return {
      tableData,
      loading,
      showForm,
      editingRow,
      currentPage,
      currentPageSize,
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
      handleAigenBlur,
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
      clearColumnFilter,
      showMobileFilters,
      isFieldSelectorCollapsed,
      toggleFieldSelectorCollapse,
      saveTextChanges,
      showFreshnessModal,
      serverValue,
      updatedAt,
      updateCellValue,
      handleCellClick,
      formatDate,
      getSelectCellClass,
      getCellTitle,
      showRelValueModal,
      currentRelValueRow,
      currentRelValueColumn,
      relValueEditorContent,
      relValueEditorContainer,
      openRelValueModal,
      closeRelValueModal,
      saveRelValueChanges,
      handleRelValueUpdate,
      handlePageSizeChange,
      selectedRows,
      showBulkActionsModal,
      selectedBulkAction,
      toggleRowSelection,
      clearSelectedRows,
      isRowSelected,
      hasSelectedRows,
      openBulkActionsModal,
      closeBulkActionsModal,
      executeBulkAction,
      showDeleteConfirmationModal,
      pendingBulkAction,
      openDeleteConfirmationModal,
      closeDeleteConfirmationModal,
      confirmBulkDelete,
      handleHiddenChange, // Добавляем новый метод в возвращаемый объект
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
  transition: all 0.3s ease;
}

.kirh-field-selector-collapsed {
  min-width: 0;
  width: 0;
  padding: 0;
  opacity: 0;
  pointer-events: none;
}

/* Стили для кнопки управления панелью */
.kirh-field-selector-toggle {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem 0 0 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  padding: 0.375rem;
  cursor: pointer;
}

.kirh-field-selector-toggle:hover {
  background-color: #f9fafb;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
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

/* Стили для прелоадера */
.loader-image {
  width: 4rem;
  height: 4rem;
  animation: pulse 1.5s ease-in-out infinite;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
}

/* Контейнер прелоадера */
.absolute.inset-0 {
  position: absolute;
  top: 4rem;
  left: 0;
  right: 0;
  height: 6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  z-index: 50;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(0.95);
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

/* Стили для контейнера с горизонтальной прокруткой */
.kirh-table-scroll-container {
  flex: 1;
  min-height: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 100px;
}

/* Обновленные стили для таблицы */
.kirh-table {
  min-width: max-content;
  width: 100%;
}

/* Обновленные стили для заголовков и строк */
.kirh-header {
  display: flex;
  width: 100%;
  min-width: max-content;
}

.kirh-row {
  display: flex;
  width: 100%;
  min-width: max-content;
}

/* Стили для панелей управления */
.kirh-controls {
  flex-shrink: 0;
  white-space: normal;
}

/* Стили для блока с фильтрами */
.flex.justify-between.items-center {
  flex-shrink: 0;
  white-space: normal;
}

/* Стили для элементов панели управления */
.kirh-pagination {
  flex-wrap: wrap;
  gap: 0.5rem;
}

.kirh-pagination-btn {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.kirh-pagination-btn:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.kirh-page-info {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0 0.125rem;
}

/* Стили для мобильного меню фильтров */
@media (max-width: 768px) {
  .kirh-controls {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .kirh-pagination {
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  /* Перенос кнопок и галочек на отдельные строки в мобильной версии */
  .flex.items-center.gap-2 {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .flex.items-center.gap-2 button {
    width: 100%;
    margin: 0;
  }

  /* Позиционирование мобильного меню фильтров */
  .fixed.inset-0 {
    padding-bottom: 3.125rem; /* 50px */
  }

  .bg-white.rounded-lg {
    margin-bottom: 3.125rem; /* 50px */
  }
}

/* Стили для десктопных фильтров */
@media (min-width: 768px) {
  .hidden.md\:flex {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .hidden.md\:flex .KirhSelectField {
    min-width: 200px;
    flex: 1 1 auto;
  }
}

/* Стили для модального окна фильтров */
.fixed.inset-0 {
  z-index: 50;
}

.bg-white.rounded-lg {
  max-height: 90vh;
  overflow-y: auto;
}

/* Стили для элементов фильтров в модальном окне */
.flex.flex-col.gap-4 {
  padding: 0.5rem;
}

.flex.flex-col.gap-4 .KirhSelectField,
.flex.flex-col.gap-4 .ToggleFilter {
  width: 100%;
}

/* Обновленные стили для подсказок */
.relative {
  position: relative;
}

.relative .absolute {
  position: absolute;
  z-index: 20;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
}

.relative:hover .absolute {
  opacity: 1;
  transform: translate(-50%, 10px);
}

/* Убираем старые стили для подсказок */
.relative .absolute {
  bottom: auto;
  left: auto;
  transform: none;
  opacity: 0;
  color: inherit;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  white-space: normal;
  max-width: 14rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: opacity 0.2s ease;
}

/* Обновленные стили для кнопок в мобильной версии */
@media (max-width: 768px) {
  .kirh-controls button {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }

  .kirh-controls .flex.items-center {
    flex-direction: column;
    align-items: stretch;
  }

  .kirh-controls .flex.items-center button {
    margin-bottom: 0.25rem;
  }
}

/* Стили для элементов панели управления */
.kirh-controls button,
.kirh-controls .kirh-pagination-btn,
.kirh-controls input {
  flex-shrink: 0;
}

/* Стили для блока фильтров */
.flex.items-center.gap-2 {
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Стили для селектов и других элементов фильтров */
.KirhSelectField,
.ToggleFilter {
  flex-shrink: 0;
  min-width: 150px;
}

/* Стили для мобильного меню фильтров */
@media (max-width: 768px) {
  .kirh-controls .kirh-pagination {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .kirh-controls button,
  .kirh-controls input {
    flex: 1 1 auto;
    min-width: 120px;
  }

  /* Скрываем переключатели на мобильных устройствах */
  .ToggleFilter {
    display: none;
  }
}

/* Стили для мобильной версии */
@media (max-width: 768px) {
  /* Основной контейнер панели управления */
  .kirh-controls {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  /* Верхняя строка с пагинацией и кнопками */
  .kirh-controls > div:first-child {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 0.5rem;
  }

  /* Пагинация */
  .kirh-pagination {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .kirh-pagination-btn {
    padding: 0.375rem;
    min-width: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .kirh-page-info {
    white-space: nowrap;
    font-size: 0.75rem;
    color: #6b7280;
  }

  /* Кнопки управления */
  .kirh-controls button {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    min-width: 5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  /* Строка поиска */
  .kirh-controls .relative {
    width: 100%;
  }

  .kirh-controls .relative input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  /* Стили для формы */
  .kirh-table-form .flex.items-center {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .kirh-table-form .flex.items-center button,
  .kirh-table-form .flex.items-center .flex.items-center {
    width: 100%;
    padding: 0.5rem;
  }

  .kirh-table-form .flex.items-center .flex.items-center {
    flex-direction: column;
    gap: 0.5rem;
  }

  /* Общие стили для кнопок */
  button {
    border-radius: 0.375rem;
    transition: all 0.2s ease;
  }

  button:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  /* Стили для отключенных кнопок */
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Стили для инпутов */
  input {
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
    transition: all 0.2s ease;
  }

  input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
}

/* Обновленные стили для мобильной версии */
@media (max-width: 768px) {
  /* Скрываем панель полей по умолчанию */
  .kirh-field-selector {
    display: none;
  }

  /* Показываем панель только если она не свернута */
  .kirh-field-selector:not(.kirh-field-selector-collapsed) {
    display: block;
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    z-index: 100;
    width: 80%;
    max-width: 300px;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  }

  /* Стили для кнопки управления панелью */
  .kirh-field-selector button {
    margin-bottom: 1rem;
  }

  /* Стили для toggle-фильтров */
  .kirh-controls .md\:hidden {
    margin-bottom: 1rem;
  }

  .kirh-controls .md\:hidden .ToggleFilter {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}

/* Стили для всплывающих подсказок */
.kirh-cell .absolute {
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.kirh-cell:hover .absolute {
  opacity: 1;
  transform: translate(-50%, 10px);
}

/* Улучшенные стили для подсказок */
.kirh-cell .absolute {
  max-width: 300px;
  word-wrap: break-word;
  white-space: normal;
  text-align: left;
  line-height: 1.4;
}

/* Стили для rel_value ячейки */
.rel-value-cell {
  cursor: pointer;
  transition: all 0.2s ease;
}

.rel-value-cell:hover {
  opacity: 0.8;
}

/* Добавьте стили для фиксированного заголовка */
.fixed-header {
  position: sticky;
  top: 0;
  z-index: 30;
  background: #f3f4f6;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border-bottom: 2px solid #e5e7eb;
}
</style>