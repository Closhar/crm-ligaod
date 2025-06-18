<template>
  <div>
    <!-- Кнопка открытия/закрытия формы -->
    <div class="flex justify-between items-center mb-2 px-4" v-if="!formOptions.autoOpen">
      <button
          @click="toggleForm"
          class="kirh-form-toggle-btn bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
          v-if="!formOptions.autoOpen"
      >
        {{ isFormOpen ? 'Скрыть форму' : formOptions.toggleButtonText || 'Показать форму' }}
      </button>
    </div>

    <div :class="formOptions.containerClass">
      <!-- Сама форма -->
      <div v-if="isFormOpen" class="m-2 rounded-md shadow-sm border-2 border-gray-400">
        <div class="bg-gray-400 text-gray-50 font-bold rounded-t-md p-2">
          {{ formTitle }}
        </div>

        <!-- Блок ошибок валидации -->
        <div v-if="validationErrors && Object.keys(validationErrors).length" class="bg-red-50 border-l-4 border-red-500 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Ошибки валидации
              </h3>
              <div class="mt-2 text-sm text-red-700">
                <ul class="list-disc pl-5 space-y-1">
                  <li v-for="(errors, fieldName) in validationErrors" :key="fieldName">
                    {{ errors.join(', ') }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Общая ошибка -->
        <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">
                {{ error }}
              </p>
            </div>
          </div>
        </div>

        <form @submit.prevent="submitForm" class="kirh-dynamic-form">
          <!-- Динамические поля в строку -->
          <div class="flex flex-wrap gap-1 px-4 pt-4">
            <div
                v-for="(column, index) in visibleColumns"
                :key="index"
                :class="column.options?.cellClass"
                :style="{ width: column.width }"
            >
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ column.label }}
                <a v-if="column.options?.link_in_title" :href="column.options?.link_in_title" class="text-blue-600 hover:text-blue-500" target="_blank">
                  <Icon name="lucide:external-link" size="1em" class="ml-1" :title="column.options?.hint_in_link || ''"/>
                </a>
                <span v-if="column.required" class="text-red-500">*</span>
                <span v-if="column.options?.hint" class="ml-1 text-gray-400 cursor-help" :title="column.options.hint">
                  <svg class="h-4 w-4 inline" fill="currentColor" viewBox="0 0 20 20">
                    <path clip-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" fill-rule="evenodd"></path>
                  </svg>
                </span>
              </label>

              <div :class="['block w-full', validationErrors?.[column.name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500']">
                <!-- Текстовое поле с автоподсказками -->
                <div 
                  v-if="column.type === 'text' && column.options?.autoSuggest" 
                  class="relative"
                  :ref="el => { autoSuggestRefs[column.name] = el }"
                >
                  <div class="relative">
                    <input
                        v-model="formData[column.name]"
                        type="text"
                        :required="column.required"
                        :readonly="column.options?.readonly || formOptions.readonly"
                        :class="['w-full rounded-md shadow-sm pr-8', column.options?.inputClass]"
                        :placeholder="column.options?.placeholder"
                        @input="handleAutoSuggest(column.name, column.options?.autoSuggest); handleFieldInput(column.name)"
                        @focus="isActiveSuggestion[column.name] = true"
                    />
                    <!-- Кнопка вставки из буфера -->
                    <button 
                      v-if="column.options?.pasteFromClipboard" 
                      type="button" 
                      @click="pasteFromClipboard(column.name)"
                      class="absolute inset-y-0 right-0 px-2 flex items-center text-gray-500 hover:text-gray-700"
                      :title="column.options?.pasteFromClipboard?.title || 'Вставить из буфера обмена'"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </button>
                  </div>
                  <div 
                    v-if="(suggestions[column.name]?.length > 0 || suggestionsLoading[column.name]) && isActiveSuggestion[column.name]" 
                    class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                  >
                    <!-- Индикатор загрузки -->
                    <div v-if="suggestionsLoading[column.name]" class="p-2 text-center text-gray-500">
                      <div class="inline-block animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                      Загрузка...
                    </div>
                    
                    <!-- Сообщение, если нет результатов -->
                    <div v-else-if="suggestions[column.name]?.length === 0" class="p-2 text-center text-gray-500">
                      Нет результатов
                    </div>
                    
                    <!-- Список подсказок -->
                    <ul v-else class="py-1">
                      <li 
                        v-for="(suggestion, i) in suggestions[column.name]" 
                        :key="i" 
                        class="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                        :class="{'bg-blue-50 hover:bg-blue-100': column.options?.autoSuggest?.clickable}"
                        @mousedown="handleSuggestionSelect(column.name, suggestion, column.options?.autoSuggest, $event)"
                      >
                        <div class="flex items-center justify-between">
                          <div>
                            <span class="font-medium">{{ 
                              suggestion[column.options?.autoSuggest?.labelField || 'name'] || suggestion.name || suggestion.title || suggestion.label || JSON.stringify(suggestion) 
                            }}</span>
                            
                            <!-- Дополнительная информация -->
                            <span v-if="suggestion.message" class="ml-2 text-xs text-gray-500">
                              {{ suggestion.message }}
                            </span>
                            
                            <!-- Доп. данные -->
                            <div v-if="suggestion.email && suggestion.email !== suggestion[column.options?.autoSuggest?.labelField || 'name']" 
                              class="text-xs text-gray-500 mt-1">
                              {{ suggestion.email }}
                            </div>
                          </div>
                          
                          <!-- Счетчик -->
                          <span v-if="column.options?.autoSuggest?.showCount && suggestion.count" 
                                class="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                            {{ suggestion.count }}
                          </span>
                          
                          <!-- Иконка для кликабельных подсказок -->
                          <span v-if="column.options?.autoSuggest?.clickable" class="text-blue-500 ml-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              
                <!-- Обычное текстовое поле -->
                <div v-else-if="column.type === 'text'" class="relative">
                  <input
                      v-model="formData[column.name]"
                      type="text"
                      :required="column.required"
                      :readonly="column.options?.readonly || formOptions.readonly"
                      :class="['w-full rounded-md shadow-sm', column.options?.pasteFromClipboard ? 'pr-8' : '', column.options?.inputClass]"
                      :placeholder="column.options?.placeholder"
                      @input="handleFieldInput(column.name)"
                  />
                  <!-- Кнопка вставки из буфера -->
                  <button 
                    v-if="column.options?.pasteFromClipboard" 
                    type="button" 
                    @click="pasteFromClipboard(column.name)"
                    class="absolute inset-y-0 right-0 px-2 flex items-center text-gray-500 hover:text-gray-700"
                    :title="column.options?.pasteFromClipboard?.title || 'Вставить из буфера обмена'"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </button>
                </div>

                <!-- Поле datetime-local -->
                <input
                    v-else-if="column.type === 'datetime'"
                    v-model="formData[column.name]"
                    type="datetime-local"
                    :required="column.required"
                    :readonly="column.options?.readonly || formOptions.readonly"
                    :class="['w-full rounded-md shadow-sm', column.options?.inputClass]"
                    :placeholder="column.options?.placeholder"
                />

                <input
                    v-else-if="column.type === 'date'"
                    v-model="formData[column.name]"
                    type="date"
                    :required="column.required"
                    :readonly="column.options?.readonly || formOptions.readonly"
                    :class="['w-full rounded-md shadow-sm', column.options?.inputClass]"
                    :placeholder="column.options?.placeholder"
                />

                <input
                    v-else-if="column.type === 'time'"
                    v-model="formData[column.name]"
                    type="time"
                    :required="column.required"
                    :readonly="column.options?.readonly || formOptions.readonly"
                    :class="['w-full rounded-md shadow-sm', column.options?.inputClass]"
                    :placeholder="column.options?.placeholder"
                />

                <!-- Textarea поле -->
                <textarea
                    v-else-if="column.type === 'textarea'"
                    v-model="formData[column.name]"
                    :required="column.required"
                    :readonly="column.options?.readonly || formOptions.readonly"
                    :class="['w-full p-1 rounded text-sm', column.options?.inputClass]"
                    :placeholder="column.options?.placeholder"
                    :rows="column.options?.rows || 3"
                />

                <!-- Редактор поле -->
                <RichTextEditor
                    v-else-if="column.type === 'editor'"
                    v-model="formData[column.name]"
                    :required="column.required"
                    :readonly="column.options?.readonly || formOptions.readonly"
                    :class="['w-full p-1 rounded text-sm', column.options?.inputClass]"
                    :placeholder="column.options?.placeholder"
                    :show-source="false"
                    :upload-options="{
                      url: column.options.uploadUrl || '/api/upload-image',
                      maxWidth: column.options.imageMaxWidth || 1200,
                      quality: column.options.imageQuality || 0.8
                    }"
                    @format="(e) => e.preventDefault()"
                />

                <!-- AI Генерация поле -->
                <AIGenField
                    v-else-if="column.type === 'aigen'"
                    v-model="formData[column.name]"
                    :required="column.required"
                    :readonly="column.options?.readonly || formOptions.readonly"
                    :options="column.options"
                    :row-data="formData"
                    :class="['w-full', column.options?.inputClass]"
                    @update:modelValue="(val) => handleFieldInput(column.name, val)"
                />

                <!-- Select поле (компонент KirhSelectField) -->
                <KirhSelectField
                    v-else-if="column.type === 'select'"
                    v-model="formData[column.name]"
                    :key="`select-${column.name}-${forceRerenderSelects}`"
                    :options="column.options?.options"
                    :api-url="column.options?.apiUrl"
                    :api-params="column.options?.apiParams"
                    :required="column.required"
                    :readonly="column.options?.readonly || formOptions.readonly"
                    :enable-search="column.options?.enableSearch"
                    :emptyable="column.options?.emptyable"
                    :icon-field="column.options?.iconField"
                    :image-field="column.options?.imageField"
                    :key-field="column.options?.keyField || 'id'"
                    :label-field="column.options?.labelField || 'name'"
                    :label="column.label"
                    :limit="column.options?.limit"
                    :placeholder="column.options?.placeholder || column.label"
                    :class="['w-full', column.options?.inputClass]"
                    :emptyOption="column.emptyOption"
                    :list-item="column.options?.list_item"
                    :options-list="column.options?.options_list"
                    :sel_class="column.options?.sel_class || null"
                    :error="!!validationErrors?.[column.name]"
                />

                <!-- Простой селект -->
                <select
                    v-else-if="column.type === 'simple_select'"
                    v-model="formData[column.name]"
                    :required="column.required"
                    :readonly="column.options?.readonly || formOptions.readonly"
                    :class="['w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500', column.options?.inputClass]"
                >
                    <option v-if="column.options?.emptyOption" value="">
                        {{ column.options?.emptyOptionText || 'Выберите значение' }}
                    </option>
                    <option 
                        v-for="(option, index) in column.options?.options" 
                        :key="index" 
                        :value="option.value"
                    >
                        {{ option.label }}
                    </option>
                </select>

                <!-- Переключатель -->
                <label v-else-if="column.type === 'toggle'" class="inline-flex items-center mt-2">
                  <input
                      type="checkbox"
                      v-model="formData[column.name]"
                      :disabled="column.options?.readonly || formOptions.readonly"
                      class="sr-only peer"
                      :checked="column.options?.defaultChecked"
                  >
                  <div
                      class="relative cursor-pointer w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                      :class="[
                        column.options?.inputClass,
                        formData[column.name] ? 'bg-green-500' : 'bg-red-500'
                      ]"
                  ></div>
                  <span class="ml-2 text-sm text-gray-600" v-if="column.options?.toggleLabel">
                    {{ formData[column.name] ? column.options.toggleLabel.on : column.options.toggleLabel.off }}
                  </span>
                </label>

                <!-- Hidden поле -->
                <template v-else-if="column.type === 'hidden'">
                  <input 
                    type="hidden" 
                    v-model="formData[column.name]"
                    :name="column.name"
                  />
                </template>
              </div>

              <!-- Вывод ошибки для поля -->
              <p v-if="validationErrors?.[column.name]" class="mt-1 text-sm text-red-600">
                {{ validationErrors[column.name].join(', ') }}
              </p>
            </div>
          </div>

          <!-- Дополнительные поля под спойлером -->
          <div v-if="formOptions.additionalFields?.columns?.length" class="px-4">
            <div 
              class="border-t border-gray-200 pt-4 cursor-pointer" 
              @click="isAdditionalFieldsOpen = !isAdditionalFieldsOpen"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-gray-900">
                  {{ formOptions.additionalFields.title }}
                </h3>
                <button 
                  type="button" 
                  class="text-gray-400 hover:text-gray-500"
                  :class="{'rotate-180': isAdditionalFieldsOpen}"
                >
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div v-show="isAdditionalFieldsOpen" class="mt-4">
              <p v-if="formOptions.additionalFields.description" class="mb-4 text-sm text-gray-500">
                {{ formOptions.additionalFields.description }}
              </p>
              <div class="flex flex-wrap gap-1">
                <div
                    v-for="(column, index) in formOptions.additionalFields.columns"
                    :key="index"
                    :class="column.options?.cellClass"
                    :style="{ width: column.width }"
                >
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    {{ column.label }}
                    <a v-if="column.options?.link_in_title" :href="column.options?.link_in_title" class="text-blue-600 hover:text-blue-500" target="_blank">
                      <Icon name="lucide:external-link" size="1em" class="ml-1" :title="column.options?.hint_in_link || ''"/>
                    </a>
                    <span v-if="column.required" class="text-red-500">*</span>
                    <span v-if="column.options?.hint" class="ml-1 text-gray-400 cursor-help" :title="column.options.hint">
                      <svg class="h-4 w-4 inline" fill="currentColor" viewBox="0 0 20 20">
                        <path clip-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" fill-rule="evenodd"></path>
                      </svg>
                    </span>
                  </label>

                  <div :class="['block w-full', validationErrors?.[column.name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500']">
                    <!-- Текстовое поле с автоподсказками -->
                    <div 
                      v-if="column.type === 'text' && column.options?.autoSuggest" 
                      class="relative"
                      :ref="el => { autoSuggestRefs[column.name] = el }"
                    >
                      <div class="relative">
                        <input
                            v-model="formData[column.name]"
                            type="text"
                            :required="column.required"
                            :readonly="column.options?.readonly || formOptions.readonly"
                            :class="['w-full rounded-md shadow-sm pr-8', column.options?.inputClass]"
                            :placeholder="column.options?.placeholder"
                            @input="handleAutoSuggest(column.name, column.options?.autoSuggest); handleFieldInput(column.name)"
                            @focus="isActiveSuggestion[column.name] = true"
                        />
                        <!-- Кнопка вставки из буфера -->
                        <button 
                          v-if="column.options?.pasteFromClipboard" 
                          type="button" 
                          @click="pasteFromClipboard(column.name)"
                          class="absolute inset-y-0 right-0 px-2 flex items-center text-gray-500 hover:text-gray-700"
                          :title="column.options?.pasteFromClipboard?.title || 'Вставить из буфера обмена'"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </button>
                      </div>
                      <div 
                        v-if="(suggestions[column.name]?.length > 0 || suggestionsLoading[column.name]) && isActiveSuggestion[column.name]" 
                        class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                      >
                        <!-- Индикатор загрузки -->
                        <div v-if="suggestionsLoading[column.name]" class="p-2 text-center text-gray-500">
                          <div class="inline-block animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                          Загрузка...
                        </div>
                        
                        <!-- Сообщение, если нет результатов -->
                        <div v-else-if="suggestions[column.name]?.length === 0" class="p-2 text-center text-gray-500">
                          Нет результатов
                        </div>
                        
                        <!-- Список подсказок -->
                        <ul v-else class="py-1">
                          <li 
                            v-for="(suggestion, i) in suggestions[column.name]" 
                            :key="i" 
                            class="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                            :class="{'bg-blue-50 hover:bg-blue-100': column.options?.autoSuggest?.clickable}"
                            @mousedown="handleSuggestionSelect(column.name, suggestion, column.options?.autoSuggest, $event)"
                          >
                            <div class="flex items-center justify-between">
                              <div>
                                <span class="font-medium">{{ 
                                  suggestion[column.options?.autoSuggest?.labelField || 'name'] || suggestion.name || suggestion.title || suggestion.label || JSON.stringify(suggestion) 
                                }}</span>
                                
                                <!-- Дополнительная информация -->
                                <span v-if="suggestion.message" class="ml-2 text-xs text-gray-500">
                                  {{ suggestion.message }}
                                </span>
                                
                                <!-- Доп. данные -->
                                <div v-if="suggestion.email && suggestion.email !== suggestion[column.options?.autoSuggest?.labelField || 'name']" 
                                  class="text-xs text-gray-500 mt-1">
                                  {{ suggestion.email }}
                                </div>
                              </div>
                              
                              <!-- Счетчик -->
                              <span v-if="column.options?.autoSuggest?.showCount && suggestion.count" 
                                    class="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                                {{ suggestion.count }}
                              </span>
                              
                              <!-- Иконка для кликабельных подсказок -->
                              <span v-if="column.options?.autoSuggest?.clickable" class="text-blue-500 ml-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  
                    <!-- Обычное текстовое поле -->
                    <div v-else-if="column.type === 'text'" class="relative">
                      <input
                          v-model="formData[column.name]"
                          type="text"
                          :required="column.required"
                          :readonly="column.options?.readonly || formOptions.readonly"
                          :class="['w-full rounded-md shadow-sm', column.options?.pasteFromClipboard ? 'pr-8' : '', column.options?.inputClass]"
                          :placeholder="column.options?.placeholder"
                          @input="handleFieldInput(column.name)"
                      />
                      <!-- Кнопка вставки из буфера -->
                      <button 
                        v-if="column.options?.pasteFromClipboard" 
                        type="button" 
                        @click="pasteFromClipboard(column.name)"
                        class="absolute inset-y-0 right-0 px-2 flex items-center text-gray-500 hover:text-gray-700"
                        :title="column.options?.pasteFromClipboard?.title || 'Вставить из буфера обмена'"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </button>
                    </div>

                    <!-- Поле datetime-local -->
                    <input
                        v-else-if="column.type === 'datetime'"
                        v-model="formData[column.name]"
                        type="datetime-local"
                        :required="column.required"
                        :readonly="column.options?.readonly || formOptions.readonly"
                        :class="['w-full rounded-md shadow-sm', column.options?.inputClass]"
                        :placeholder="column.options?.placeholder"
                    />

                    <input
                        v-else-if="column.type === 'date'"
                        v-model="formData[column.name]"
                        type="date"
                        :required="column.required"
                        :readonly="column.options?.readonly || formOptions.readonly"
                        :class="['w-full rounded-md shadow-sm', column.options?.inputClass]"
                        :placeholder="column.options?.placeholder"
                    />

                    <input
                        v-else-if="column.type === 'time'"
                        v-model="formData[column.name]"
                        type="time"
                        :required="column.required"
                        :readonly="column.options?.readonly || formOptions.readonly"
                        :class="['w-full rounded-md shadow-sm', column.options?.inputClass]"
                        :placeholder="column.options?.placeholder"
                    />

                    <!-- Textarea поле -->
                    <textarea
                        v-else-if="column.type === 'textarea'"
                        v-model="formData[column.name]"
                        :required="column.required"
                        :readonly="column.options?.readonly || formOptions.readonly"
                        :class="['w-full p-1 rounded text-sm', column.options?.inputClass]"
                        :placeholder="column.options?.placeholder"
                        :rows="column.options?.rows || 3"
                    />

                    <!-- Редактор поле -->
                    <RichTextEditor
                        v-else-if="column.type === 'editor'"
                        v-model="formData[column.name]"
                        :required="column.required"
                        :readonly="column.options?.readonly || formOptions.readonly"
                        :class="['w-full p-1 rounded text-sm', column.options?.inputClass]"
                        :placeholder="column.options?.placeholder"
                        :show-source="false"
                        :upload-options="{
                          url: column.options.uploadUrl || '/api/upload-image',
                          maxWidth: column.options.imageMaxWidth || 1200,
                          quality: column.options.imageQuality || 0.8
                        }"
                        @format="(e) => e.preventDefault()"
                    />

                    <!-- AI Генерация поле -->
                    <AIGenField
                        v-else-if="column.type === 'aigen'"
                        v-model="formData[column.name]"
                        :required="column.required"
                        :readonly="column.options?.readonly || formOptions.readonly"
                        :options="column.options"
                        :row-data="formData"
                        :class="['w-full', column.options?.inputClass]"
                        @update:modelValue="(val) => handleFieldInput(column.name, val)"
                    />

                    <!-- Select поле (компонент KirhSelectField) -->
                    <KirhSelectField
                        v-else-if="column.type === 'select'"
                        v-model="formData[column.name]"
                        :key="`select-${column.name}-${forceRerenderSelects}`"
                        :options="column.options?.options"
                        :api-url="column.options?.apiUrl"
                        :api-params="column.options?.apiParams"
                        :required="column.required"
                        :readonly="column.options?.readonly || formOptions.readonly"
                        :enable-search="column.options?.enableSearch"
                        :emptyable="column.options?.emptyable"
                        :icon-field="column.options?.iconField"
                        :image-field="column.options?.imageField"
                        :key-field="column.options?.keyField || 'id'"
                        :label-field="column.options?.labelField || 'name'"
                        :label="column.label"
                        :limit="column.options?.limit"
                        :placeholder="column.options?.placeholder || column.label"
                        :class="['w-full', column.options?.inputClass]"
                        :emptyOption="column.emptyOption"
                        :list-item="column.options?.list_item"
                        :options-list="column.options?.options_list"
                        :sel_class="column.options?.sel_class || null"
                        :error="!!validationErrors?.[column.name]"
                    />

                    <!-- Простой селект -->
                    <select
                        v-else-if="column.type === 'simple_select'"
                        v-model="formData[column.name]"
                        :required="column.required"
                        :readonly="column.options?.readonly || formOptions.readonly"
                        :class="['w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500', column.options?.inputClass]"
                    >
                        <option v-if="column.options?.emptyOption" value="">
                            {{ column.options?.emptyOptionText || 'Выберите значение' }}
                        </option>
                        <option 
                            v-for="(option, index) in column.options?.options" 
                            :key="index" 
                            :value="option.value"
                        >
                            {{ option.label }}
                        </option>
                    </select>

                    <!-- Переключатель -->
                    <label v-else-if="column.type === 'toggle'" class="inline-flex items-center mt-2">
                      <input
                          type="checkbox"
                          v-model="formData[column.name]"
                          :disabled="column.options?.readonly || formOptions.readonly"
                          class="sr-only peer"
                          :checked="column.options?.defaultChecked"
                      >
                      <div
                          class="relative cursor-pointer w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                          :class="[
                            column.options?.inputClass,
                            formData[column.name] ? 'bg-green-500' : 'bg-red-500'
                          ]"
                      ></div>
                      <span class="ml-2 text-sm text-gray-600" v-if="column.options?.toggleLabel">
                        {{ formData[column.name] ? column.options.toggleLabel.on : column.options.toggleLabel.off }}
                      </span>
                    </label>

                    <!-- Hidden поле -->
                    <template v-else-if="column.type === 'hidden'">
                      <input 
                        type="hidden" 
                        v-model="formData[column.name]"
                        :name="column.name"
                      />
                    </template>
                  </div>

                  <!-- Вывод ошибки для поля -->
                  <p v-if="validationErrors?.[column.name]" class="mt-1 text-sm text-red-600">
                    {{ validationErrors[column.name].join(', ') }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Кнопки формы -->
          <div class="flex justify-start gap-2 mt-3 px-4 pb-4" v-if="!formOptions.hideButtons">
            <button
                type="button"
                @click="resetForm"
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
                v-if="!formOptions.hideCancelButton"
            >
              {{ formOptions.cancelButtonText || 'Сбросить' }}
            </button>
            <button
                type="submit"
                class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm"
                :disabled="loading"
                v-if="!formOptions.hideSubmitButton"
            >
              <span v-if="loading">Отправка...</span>
              <span v-else>{{ formOptions.submitButtonText || 'Сохранить' }}</span>
            </button>
            <label class="inline-flex items-center cursor-pointer mx-6">
              <input
                  type="checkbox"
                  v-model="keepFormAfterSubmit"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 cursor-pointer"
              >
              <span class="ml-2 text-sm text-gray-700">Не обнулять форму после добавления</span>
            </label>
          </div>
          
          <!-- Быстрое добавление сущностей -->
          <div v-if="formOptions.quickAdd && formOptions.quickAdd.length > 0" class="flex flex-wrap items-center gap-2 mt-3 px-4 pb-4 border-t pt-3">
            <h3 class="text-sm font-medium text-gray-700 mr-2">Быстрое добавление:</h3>
            <button
              v-for="(quickAddItem, index) in formOptions.quickAdd"
              :key="index"
              @click="openQuickAddModal(quickAddItem)"
              class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs flex items-center"
              type="button"
            >
              <Icon v-if="quickAddItem.icon" :name="quickAddItem.icon" class="mr-1" size="16" />
              {{ quickAddItem.label || 'Добавить' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  
  <!-- Модальное окно быстрого добавления -->
  <Teleport to="body">
    <div v-if="quickAddModalVisible" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <!-- Заголовок модального окна -->
        <div class="px-4 py-3 border-b flex justify-between items-center bg-gray-100 rounded-t-lg">
          <h3 class="font-medium text-lg text-gray-800">{{ currentQuickAddItem?.title || 'Быстрое добавление' }}</h3>
          <button @click="closeQuickAddModal" class="text-gray-500 hover:text-gray-700">
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Инструкция по применению (если есть) -->
        <div v-if="currentQuickAddItem?.instruction" class="px-4 py-2 bg-blue-50 border-b border-blue-100">
          <p class="text-sm text-blue-700">{{ currentQuickAddItem.instruction }}</p>
        </div>
        
        <!-- Содержимое модального окна -->
        <div class="flex-1 overflow-y-auto p-4">
          <!-- Блок ошибок валидации -->
          <div v-if="quickAddValidationErrors && Object.keys(quickAddValidationErrors).length" class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  Ошибки валидации
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  <ul class="list-disc pl-5 space-y-1">
                    <li v-for="(errors, fieldName) in quickAddValidationErrors" :key="fieldName">
                      {{ errors.join(', ') }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Общая ошибка -->
          <div v-if="quickAddError" class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">
                  {{ quickAddError }}
                </p>
              </div>
            </div>
          </div>

          <!-- Сообщение об успешном добавлении -->
          <div v-if="quickAddSuccess" class="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-green-700">{{ quickAddSuccessMessage }}</p>
              </div>
            </div>
          </div>
          
          <!-- Форма быстрого добавления -->
          <form v-if="!quickAddSuccess" @submit.prevent="submitQuickAddForm" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <template v-for="(field, fieldIndex) in currentQuickAddItem?.fields" :key="fieldIndex">
                <div :class="['space-y-1', field.options?.half_str ? '' : 'col-span-2']">
                  <label :for="`quick-add-field-${fieldIndex}`" class="block text-sm font-medium text-gray-700">
                    {{ field.label }}
                    <a v-if="field.options?.link_in_title" :href="field.options?.link_in_title" class="text-blue-600 hover:text-blue-500" target="_blank">
                      <Icon name="lucide:external-link" size="1em" class="ml-1" :title="field.options?.hint_in_link || ''"/>
                    </a>
                    <span v-if="field.required" class="text-red-500">*</span>
                  </label>
                  
                  <!-- Текстовое поле с автоподсказками -->
                  <div 
                    v-if="field.type === 'text' && field.options?.autoSuggest" 
                    class="relative"
                    :ref="el => { autoSuggestRefs[field.name] = el }"
                  >
                    <div class="relative">
                      <input
                          v-model="quickAddFormData[field.name]"
                          type="text"
                          :required="field.required"
                          :readonly="field.options?.readonly"
                          :class="['w-full p-2 border border-gray-300 rounded-md shadow-sm', field.options?.inputClass]"
                          :placeholder="field.options?.placeholder"
                          @input="handleQuickAddAutoSuggest(field.name, field.options?.autoSuggest); handleQuickAddFieldInput(field.name)"
                          @focus="isActiveSuggestion[field.name] = true"
                      />
                      <!-- Кнопка вставки из буфера -->
                      <button 
                        v-if="field.options?.pasteFromClipboard" 
                        type="button" 
                        @click="pasteFromClipboard(field.name)"
                        class="absolute inset-y-0 right-0 px-2 flex items-center text-gray-500 hover:text-gray-700"
                        :title="field.options?.pasteFromClipboard?.title || 'Вставить из буфера обмена'"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </button>
                    </div>
                    <div 
                      v-if="(suggestions[field.name]?.length > 0 || suggestionsLoading[field.name]) && isActiveSuggestion[field.name]" 
                      class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                    >
                      <!-- Индикатор загрузки -->
                      <div v-if="suggestionsLoading[field.name]" class="p-2 text-center text-gray-500">
                        <div class="inline-block animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                        Загрузка...
                      </div>
                      
                      <!-- Сообщение, если нет результатов -->
                      <div v-else-if="suggestions[field.name]?.length === 0" class="p-2 text-center text-gray-500">
                        Нет результатов
                      </div>
                      
                      <!-- Список подсказок -->
                      <ul v-else class="py-1">
                        <li 
                          v-for="(suggestion, i) in suggestions[field.name]" 
                          :key="i" 
                          class="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                          :class="{'bg-blue-50 hover:bg-blue-100': field.options?.autoSuggest?.clickable}"
                          @mousedown="handleQuickAddSuggestionSelect(field.name, suggestion, field.options?.autoSuggest, $event)"
                        >
                          <div class="flex items-center justify-between">
                            <div>
                              <span class="font-medium">{{ 
                                suggestion[field.options?.autoSuggest?.labelField || 'name'] || suggestion.name || suggestion.title || suggestion.label || JSON.stringify(suggestion) 
                              }}</span>
                              
                              <!-- Дополнительная информация -->
                              <span v-if="suggestion.message" class="ml-2 text-xs text-gray-500">
                                {{ suggestion.message }}
                              </span>
                              
                              <!-- Доп. данные -->
                              <div v-if="suggestion.email && suggestion.email !== suggestion[field.options?.autoSuggest?.labelField || 'name']" 
                                class="text-xs text-gray-500 mt-1">
                                {{ suggestion.email }}
                              </div>
                            </div>
                            
                            <!-- Счетчик -->
                            <span v-if="field.options?.autoSuggest?.showCount && suggestion.count" 
                                  class="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                              {{ suggestion.count }}
                            </span>
                            
                            <!-- Иконка для кликабельных подсказок -->
                            <span v-if="field.options?.autoSuggest?.clickable" class="text-blue-500 ml-2">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <!-- Обычное текстовое поле -->
                  <div v-else-if="field.type === 'text' || field.type === 'email' || field.type === 'number' || field.type === 'streams_count'" class="relative">
                    <input 
                      :type="field.type === 'streams_count' ? 'number' : field.type" 
                      :id="`quick-add-field-${fieldIndex}`"
                      v-model="quickAddFormData[field.name]" 
                      :required="field.required"
                      :placeholder="field.placeholder"
                      :class="['w-full p-2 border border-gray-300 rounded-md shadow-sm', field.options?.inputClass, field.options?.pasteFromClipboard ? 'pr-8' : '']"
                      @input="handleQuickAddFieldInput(field.name)"
                    />
                    <!-- Кнопка вставки из буфера -->
                    <button 
                      v-if="field.options?.pasteFromClipboard" 
                      type="button" 
                      @click="pasteFromClipboard(field.name)"
                      class="absolute inset-y-0 right-0 px-2 flex items-center text-gray-500 hover:text-gray-700"
                      :title="field.options?.pasteFromClipboard?.title || 'Вставить из буфера обмена'"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </button>
                  </div>
                  

                  <!-- Текстовая область -->
                  <textarea 
                    v-else-if="field.type === 'textarea'" 
                    :id="`quick-add-field-${fieldIndex}`"
                    v-model="quickAddFormData[field.name]" 
                    :required="field.required"
                    :placeholder="field.placeholder"
                    :rows="field.rows || 3"
                    :class="['w-full p-2 border border-gray-300 rounded-md shadow-sm', field.options?.inputClass]"
                    @input="handleQuickAddFieldInput(field.name)"
                  ></textarea>
                  
                  <!-- Селект -->
                  <KirhSelectField
                    v-else-if="field.type === 'select'"
                    v-model="quickAddFormData[field.name]"
                    :key="`quick-add-select-${field.name}-${forceRerenderSelects}`"
                    :options="field.options?.options"
                    :api-url="field.options?.apiUrl"
                    :api-params="field.options?.apiParams"
                    :required="field.required"
                    :enable-search="field.options?.enableSearch"
                    :emptyable="field.options?.emptyable"
                    :icon-field="field.options?.iconField"
                    :image-field="field.options?.imageField"
                    :key-field="field.options?.keyField || 'id'"
                    :label-field="field.options?.labelField || 'name'"
                    :label="field.label"
                    :limit="field.options?.limit"
                    :placeholder="field.options?.placeholder || field.label"
                    :class="['w-full', field.options?.inputClass]"
                    :emptyOption="field.emptyOption"
                    :list-item="field.options?.list_item"
                    :options-list="field.options?.options_list"
                    :sel_class="field.options?.sel_class || null"
                    :error="!!quickAddValidationErrors?.[field.name]"
                  />
                  
                  <!-- Переключатель -->
                  <div v-else-if="field.type === 'toggle'" class="flex items-center">
                    <label class="inline-flex items-center mt-2">
                      <input 
                        :id="`quick-add-field-${fieldIndex}`"
                        type="checkbox"
                        v-model="quickAddFormData[field.name]"
                        :disabled="field.options?.readonly"
                        class="sr-only peer"
                      >
                      <div
                        class="relative cursor-pointer w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                        :class="[
                          field.options?.inputClass,
                          quickAddFormData[field.name] || (quickAddFormData[field.name] === undefined && field.options?.defaultChecked) ?
                            (field.options?.activeClass || 'bg-blue-500') :
                            (field.options?.inactiveClass || 'bg-gray-200'),
                        ]"
                      ></div>
                      <span class="ml-2 text-sm text-gray-600" v-if="field.options?.toggleLabel">
                        {{ quickAddFormData[field.name] ? field.options.toggleLabel.on : field.options.toggleLabel.off }}
                      </span>
                    </label>
                  </div>
                  
                  <!-- Дата -->
                  <input 
                    v-else-if="field.type === 'date'" 
                    type="date" 
                    :id="`quick-add-field-${fieldIndex}`"
                    v-model="quickAddFormData[field.name]" 
                    :required="field.required"
                    :class="['w-full p-2 border border-gray-300 rounded-md shadow-sm', field.options?.inputClass]"
                  />
                  
                  <!-- Время -->
                  <input 
                    v-else-if="field.type === 'time'" 
                    type="time" 
                    :id="`quick-add-field-${fieldIndex}`"
                    v-model="quickAddFormData[field.name]" 
                    :required="field.required"
                    :class="['w-full p-2 border border-gray-300 rounded-md shadow-sm', field.options?.inputClass]"
                  />
                  
                  <!-- Дата и время -->
                  <input 
                    v-else-if="field.type === 'datetime'" 
                    type="datetime-local" 
                    :id="`quick-add-field-${fieldIndex}`"
                    v-model="quickAddFormData[field.name]" 
                    :required="field.required"
                    :class="['w-full p-2 border border-gray-300 rounded-md shadow-sm', field.options?.inputClass]"
                  />
                  
                  <!-- Сообщение об ошибке поля -->
                  <p v-if="quickAddValidationErrors?.[field.name]" class="text-sm text-red-600 mt-1">
                    {{ quickAddValidationErrors[field.name].join(', ') }}
                  </p>
                </div>
              </template>
            </div>
          </form>
        </div>
        
        <!-- Кнопки модального окна -->
        <div class="px-4 py-3 border-t flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
          <button 
            @click="closeQuickAddModal" 
            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
          >
            {{ quickAddSuccess ? 'Закрыть' : 'Отмена' }}
          </button>
          <button 
            v-if="!quickAddSuccess"
            type="button" 
            @click="submitQuickAddForm" 
            class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm"
            :disabled="quickAddLoading"
          >
            <span v-if="quickAddLoading">Сохранение...</span>
            <span v-else>Сохранить</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue';
import KirhSelectField from './../fields/KirhSelectField.vue';
import RichTextEditor from "~/components/kirh/table/editor/RichTextEditor.vue";
import { useRuntimeConfig } from '#app';
import { transliterate } from '~/utils/transliterate';
import AIGenField from '../fields/AIGenField.vue';

const props = defineProps({
  apiUrl: {
    type: String,
    required: true
  },
  formOptions: {
    type: Object,
    required: true,
    default: () => ({
      columns: [],
      formTitle: 'Форма',
      autoOpen: false,
      keepFormAfterSubmit: true,
      readonly: false,
      containerClass: '',
      initialData: null,
      hideOptions: false,
      hideButtons: false,
      hideSubmitButton: false,
      hideCancelButton: false,
      submitButtonText: 'Сохранить',
      cancelButtonText: 'Сбросить',
      toggleButtonText: 'Показать форму',
      forceLocalApi: false,
      quickAdd: [], // Конфигурация для быстрого добавления сущностей
      additionalFields: { // Новые параметры для дополнительных полей
        title: 'Дополнительные поля',
        description: 'Дополнительные параметры записи',
        columns: [] // Массив колонок с теми же параметрами, что и в columns
      }
    })
  },
  showForm: {
    type: Boolean,
    default: false
  },
  editingRow: {
    type: Object,
    default: null
  },
  defaultFieldValue: {
    type: [String, Number, Boolean, Object, Array],
    default: null
  },
  defaultFieldTarget: {
    type: String,
    default: null
  },
  forceLocalApi: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:showForm', 'refresh', 'cancel']);

const isFormOpen = ref(props.showForm);
const formData = ref({});
const keepFormAfterSubmit = ref(props.formOptions.keepFormAfterSubmit);
const loading = ref(false);
const error = ref(null);
const validationErrors = ref({});

// Для автоподсказок
const suggestions = ref({});
const isActiveSuggestion = ref({});
const suggestDebounceTimers = ref({});
const suggestionsLoading = ref({});
const autoSuggestRefs = ref({});

// Состояние для модального окна быстрого добавления
const quickAddModalVisible = ref(false);
const currentQuickAddItem = ref(null);
const quickAddFormData = ref({});
const quickAddLoading = ref(false);
const quickAddError = ref(null);
const quickAddValidationErrors = ref({});
const quickAddSuccess = ref(false);
const quickAddSuccessMessage = ref('');

// Добавляем состояние для спойлера
const isAdditionalFieldsOpen = ref(false);

// Вычисляемые свойства
const formTitle = computed(() => {
  return props.editingRow ?
      'Редактирование записи' :
      props.formOptions.formTitle || 'Добавить запись';
});

const visibleColumns = computed(() => {
  return props.formOptions.columns.filter(column =>
      !column.options?.hidden || !column.options.hidden(formData.value))
});

// Добавляем новую систему отслеживания зависимостей полей
const fieldsWithTransliterate = computed(() => {
  if (!props.formOptions?.columns) return {};
  
  // Собираем отображение полей для транслитерации
  const result = {};
  
  props.formOptions.columns.forEach(column => {
    if (column.options?.transliterateFrom) {
      // Если для поля задано значение transliterateFrom
      result[column.name] = column.options.transliterateFrom;
    }
  });
  
  return result;
});

// Обработка изменений в полях, от которых зависит транслитерация
watch(formData, (newData, oldData) => {
  // Для каждого поля с настройкой transliterateFrom
  applyTransliteration(newData, oldData);
}, { deep: true });

// Функция для применения транслитерации
const applyTransliteration = (currentData, previousData) => {
  Object.entries(fieldsWithTransliterate.value).forEach(([targetField, sourceField]) => {
    // Если изменилось значение исходного поля или previousData пустой (инициализация)
    if (!previousData || currentData[sourceField] !== previousData[sourceField]) {
      // Обновляем значение целевого поля через транслитерацию
      formData.value[targetField] = transliterate(currentData[sourceField] || '');
    }
  });
};

// Обработчик автоподсказок
const handleAutoSuggest = (fieldName, suggestOptions) => {
  if (!suggestOptions?.apiUrl) {
    return;
  }
  
  // Очищаем предыдущий таймер, если он существует
  if (suggestDebounceTimers.value[fieldName]) {
    clearTimeout(suggestDebounceTimers.value[fieldName]);
  }
  
  // Устанавливаем новый таймер для предотвращения частых запросов
  suggestDebounceTimers.value[fieldName] = setTimeout(async () => {
    const query = formData.value[fieldName];
    
    // Если запрос пустой или слишком короткий, очищаем подсказки
    if (!query || query.length < (suggestOptions.minLength || 2)) {
      suggestions.value[fieldName] = [];
      return;
    }
    
    try {
      // Устанавливаем состояние загрузки
      suggestionsLoading.value[fieldName] = true;
      
      const params = new URLSearchParams();
      params.append('q', query);
      
      // Используем field_name из опций, если указан, иначе используем имя поля формы
      const fieldForApi = suggestOptions.field_name || fieldName;
      params.append('field', fieldForApi);
      
      // Добавляем дополнительные параметры
      if (suggestOptions.apiParams) {
        Object.entries(suggestOptions.apiParams).forEach(([key, value]) => {
          params.append(key, value);
        });
      }
      
      // Получаем конфигурацию для API
      const config = useRuntimeConfig();
      const baseApiUrl = config.public.API_URL || '';
      
      // Формируем полный URL
      let fullApiUrl = suggestOptions.apiUrl;
      // Проверяем, нужно ли обрабатывать URL как локальный
      const forceLocalApi = suggestOptions.forceLocalApi === true;
      if (fullApiUrl.startsWith('/api/') && baseApiUrl && !forceLocalApi) {
        fullApiUrl = `${baseApiUrl}${suggestOptions.apiUrl}`;
      }
      
      const response = await fetch(`${fullApiUrl}?${params.toString()}`);
      if (!response.ok) throw new Error('Ошибка при получении подсказок');
      
      const data = await response.json();
      suggestions.value[fieldName] = Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error('Ошибка автоподсказок:', error);
      suggestions.value[fieldName] = [];
    } finally {
      // Сбрасываем состояние загрузки
      suggestionsLoading.value[fieldName] = false;
    }
  }, suggestOptions.debounce || 300);
};

// Обработчик выбора подсказки для события click/mousedown
const handleSuggestionSelect = (fieldName, suggestion, autoSuggestOptions, event) => {
  // Предотвращаем стандартное поведение и всплытие события
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  selectSuggestion(fieldName, suggestion, autoSuggestOptions);
};

// Выбор значения из подсказок
const selectSuggestion = (fieldName, suggestion, autoSuggestOptions) => {
  if (!suggestion) {
    return;
  }
  
  // Проверяем, разрешен ли выбор
  if (autoSuggestOptions && !autoSuggestOptions.clickable) {
    return;
  }
  
  // Находим колонку по имени
  const column = props.formOptions.columns.find(col => col.name === fieldName);
  if (!column) {
    return;
  }
  
  // Определяем поле для отображения (labelField)
  const labelField = autoSuggestOptions?.labelField || 'name';
  
  // Устанавливаем значение в поле формы
  formData.value[fieldName] = suggestion[labelField];
  
  // Если есть дополнительные поля для заполнения из подсказки
  if (autoSuggestOptions?.fillFields) {
    for (const [targetField, sourceField] of Object.entries(autoSuggestOptions.fillFields)) {
      if (suggestion[sourceField] !== undefined) {
        formData.value[targetField] = suggestion[sourceField];
      }
    }
  }
  
  // Проверяем, влияет ли это поле на поле с транслитерацией
  handleFieldInput(fieldName);
  
  // Очищаем подсказки и скрываем выпадающий список
  suggestions.value[fieldName] = [];
  isActiveSuggestion.value[fieldName] = false;
};

// Функция инициализации формы
const initForm = () => {
  // Сбрасываем значения
  formData.value = {};
  validationErrors.value = {};
  suggestions.value = {};
  isActiveSuggestion.value = {};
  suggestionsLoading.value = {};
  
  // Проходим по всем колонкам и устанавливаем правильные начальные значения
  props.formOptions.columns.forEach(column => {
    // Для разных типов полей разные значения по умолчанию
    switch (column.type) {
      case 'select':
      case 'simple_select':
        // Для селектов устанавливаем null или пустую строку
        formData.value[column.name] = column.options?.emptyOption ? '' : null;
        break;
      case 'toggle':
        // Для переключателя устанавливаем значение из defaultChecked
        formData.value[column.name] = column.options?.defaultChecked || false;
        break;
      case 'number':
        // Для числовых полей устанавливаем null
        formData.value[column.name] = column.options?.defaultValue !== undefined ? column.options.defaultValue : null;
        break;
      case 'datetime':
        // Для даты устанавливаем null
        formData.value[column.name] = null;
        break;
      default:
        // Для текстовых и прочих полей устанавливаем пустую строку или defaultValue
        formData.value[column.name] = column.options?.defaultValue !== undefined ? column.options.defaultValue : '';
        break;
    }
  });
  
  // Если есть initialData, используем его
  if (props.formOptions.initialData) {
    Object.entries(props.formOptions.initialData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.value[key] = value;
      }
    });
  }
  
  // Если есть редактируемая строка, заполняем форму её данными
  if (props.editingRow) {
    Object.keys(props.editingRow).forEach(key => {
      if (props.editingRow[key] !== undefined) {
        formData.value[key] = props.editingRow[key];
      }
    });
  }
  
  // Apply default field value if provided and target field exists
  if (props.defaultFieldValue !== null && props.defaultFieldTarget !== null) {
    formData.value[props.defaultFieldTarget] = props.defaultFieldValue;
  }
  
  // Применяем транслитерацию после инициализации всех полей
  // Используем таймаут, чтобы убедиться, что formData обновлен
  setTimeout(() => {
    applyTransliteration(formData.value, {});
  }, 0);
};

// Функция для вставки из буфера обмена
const pasteFromClipboard = async (fieldName) => {
  try {
    // Проверяем доступность API буфера обмена
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      error.value = 'API буфера обмена недоступно в вашем браузере';
      setTimeout(() => { error.value = null; }, 3000);
      return;
    }
    
    // Запрашиваем текст из буфера обмена
    const text = await navigator.clipboard.readText();
    
    // Проверяем, что получили текст
    if (!text || text.trim() === '') {
      error.value = 'Буфер обмена пуст';
      setTimeout(() => { error.value = null; }, 3000);
      return;
    }
    
    // Находим колонку для применения обработки (если есть)
    const column = props.formOptions.columns.find(col => col.name === fieldName);
    
    if (column?.options?.pasteFromClipboard?.transform) {
      // Если задана функция преобразования, применяем её
      try {
        const transformFn = new Function('text', column.options.pasteFromClipboard.transform);
        const transformedText = transformFn(text);
        formData.value[fieldName] = transformedText;
      } catch (e) {
        console.error('Ошибка при преобразовании текста из буфера:', e);
        formData.value[fieldName] = text;
      }
    } else {
      // Просто устанавливаем текст как есть
      formData.value[fieldName] = text;
    }
    
    // Вызываем обработчик изменения поля для активации зависимостей (например, транслитерации)
    handleFieldInput(fieldName);
    
    // Активируем автоподсказки, если они настроены
    if (column?.options?.autoSuggest) {
      handleAutoSuggest(fieldName, column.options.autoSuggest);
    }
  } catch (err) {
    console.error('Ошибка при вставке из буфера обмена:', err);
    error.value = 'Ошибка при вставке из буфера обмена: ' + err.message;
    setTimeout(() => { error.value = null; }, 3000);
  }
};

// Конвертация даты в формат datetime-local
const convertToDatetimeLocal = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Флаг для перерисовки селектов
const forceRerenderSelects = ref(0);

// Функция для сброса селектов с перерисовкой
const resetSelectFields = () => {
  // Перерисовываем селекты
  forceRerenderSelects.value++;
  
  // Принудительно сбрасываем селекты на следующий тик
  setTimeout(() => {
    const selectColumns = props.formOptions.columns.filter(col => col.type === 'select');
    selectColumns.forEach(column => {
      formData.value[column.name] = null;
    });
  }, 0);
};

// Сброс формы
const resetForm = () => {
  // Сначала инициализируем форму
  initForm();
  validationErrors.value = null;
  error.value = null;
  
  // Сбрасываем селекты с перерисовкой
  resetSelectFields();
  
  // Применяем транслитерацию после сброса
  applyTransliteration(formData.value, {});
};

// Переключение формы
const toggleForm = () => {
  isFormOpen.value = !isFormOpen.value;
  emit('update:showForm', isFormOpen.value);
  if (isFormOpen.value && !Object.keys(formData.value).length) {
    initForm();
  }
};

// Отправка формы
const submitForm = async () => {
  try {
    loading.value = true;
    error.value = null;
    validationErrors.value = {};

    // Конвертация datetime-local обратно в стандартный формат
    const submitData = {...formData.value};
    
    // Обрабатываем каждую колонку
    props.formOptions.columns.forEach(column => {
      // Конвертация datetime полей
      if (column.type === 'datetime' && submitData[column.name]) {
        submitData[column.name] = new Date(submitData[column.name]).toISOString();
      }
    });

    // Получаем базовый URL API из конфигурации
    const config = useRuntimeConfig();
    const baseApiUrl = config.public.API_URL || '';
    
    // Формируем полный URL
    let apiUrl = props.apiUrl;
    if (apiUrl.startsWith('/api/') && baseApiUrl && !props.forceLocalApi) {
      apiUrl = `${baseApiUrl}${props.apiUrl}`;
    }

    const url = props.editingRow ?
        `${apiUrl}/${props.editingRow.id}` :
        apiUrl;
    const method = props.editingRow ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submitData)
    });

    const responseData = await response.json();

    if (!response.ok) {
      if (response.status === 422 && responseData.errors) {
        validationErrors.value = responseData.errors;
        error.value = responseData.message || 'Ошибка валидации';
      } else {
        throw new Error(responseData.message || 'Ошибка сохранения');
      }
      return;
    }

    emit('refresh');

    // Всегда оставляем форму открытой
    isFormOpen.value = true;

    if (props.editingRow) {
      // Если редактирование - закрываем форму
      emit('update:showForm', false);
    } else if (!keepFormAfterSubmit.value) {
      // Если не редактирование и галочка не активна - сбрасываем форму
      initForm();
      
      // Сбрасываем селекты с перерисовкой
      resetSelectFields();
    }
  } catch (err) {
    error.value = err.message;
    console.error('Ошибка при сохранении:', err);
  } finally {
    loading.value = false;
  }
};

// Реакция на изменение showForm из родителя
watch(() => props.showForm, (newVal) => {
  isFormOpen.value = newVal;
  if (isFormOpen.value) {
    initForm();
  }
});

// Реакция на изменение редактируемой строки
watch(() => props.editingRow, (newVal) => {
  if (newVal) {
    formData.value = {...newVal};
    props.formOptions.columns.forEach(column => {
      if (column.type === 'datetime' && formData.value[column.name]) {
        formData.value[column.name] = convertToDatetimeLocal(formData.value[column.name]);
      }
    });
  }
}, { deep: true });

// Функция для закрытия подсказок при клике вне элемента
const handleClickOutside = (event) => {
  // Для каждого активного поля с подсказками
  Object.keys(isActiveSuggestion.value).forEach(fieldName => {
    if (isActiveSuggestion.value[fieldName]) {
      // Проверяем, был ли клик вне элемента подсказки
      const suggestElement = autoSuggestRefs.value[fieldName];
      if (suggestElement && !suggestElement.contains(event.target)) {
        isActiveSuggestion.value[fieldName] = false;
      }
    }
  });
};

// Вызываем функцию при монтировании компонента
onMounted(() => {
  // Инициализируем форму после монтирования компонента
  initForm();
  
  document.addEventListener('mousedown', handleClickOutside);
  
  // Инициализация глобального хранилища объектов
  if (typeof window !== 'undefined' && !window._selectObjects) {
    window._selectObjects = {};
  }
  
  // Загрузка данных из localStorage
  try {
    const savedSelectData = localStorage.getItem('kirhSelectObjects');
    if (savedSelectData) {
      const parsedData = JSON.parse(savedSelectData);
      
      if (parsedData && typeof parsedData === 'object') {
        window._selectObjects = { ...window._selectObjects, ...parsedData };
      }
    }
  } catch (e) {
    console.error('Ошибка при загрузке данных селектов из localStorage:', e);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  
  // Сохранение в localStorage
  try {
    if (window._selectObjects && Object.keys(window._selectObjects).length > 0) {
      localStorage.setItem('kirhSelectObjects', JSON.stringify(window._selectObjects));
    }
  } catch (e) {
    console.error('Ошибка при сохранении данных селектов в localStorage:', e);
  }
});

// Добавляем обработчик ввода текста в поля
const handleFieldInput = (fieldName) => {
  // Проверяем, влияет ли это поле на поле с транслитерацией
  Object.entries(fieldsWithTransliterate.value).forEach(([targetField, sourceField]) => {
    if (sourceField === fieldName) {
      // Если да, применяем транслитерацию немедленно
      formData.value[targetField] = transliterate(formData.value[sourceField] || '');
    }
  });
};

// Открытие модального окна быстрого добавления
const openQuickAddModal = (quickAddItem) => {
  currentQuickAddItem.value = quickAddItem;
  quickAddModalVisible.value = true;
  quickAddFormData.value = {};
  quickAddError.value = null;
  quickAddValidationErrors.value = {};
  quickAddSuccess.value = false;
  
  // Проверяем, есть ли начальные данные для формы
  if (quickAddItem.initialData) {
    quickAddFormData.value = {...quickAddItem.initialData};
  }
  
  // Инициализация значений полей по умолчанию
  if (quickAddItem.fields) {
    quickAddItem.fields.forEach(field => {
      if (field.type === 'select') {
        // Добавляем только отсутствующие параметры, не перезаписывая существующие
        if (!field.options) {
          field.options = {};
        }
        if (!field.options.apiUrl) {
          field.options.apiUrl = field.apiUrl;
        }
        if (!field.options.enableSearch) {
          field.options.enableSearch = true;
        }
        if (!field.options.apiParams) {
          field.options.apiParams = {};
        }
        if (!field.options.keyField) {
          field.options.keyField = 'id';
        }
        if (!field.options.labelField) {
          field.options.labelField = 'title';
        }
      }
      if (field.defaultValue !== undefined && quickAddFormData.value[field.name] === undefined) {
        if (field.type === 'toggle') {
          quickAddFormData.value[field.name] = !!field.defaultValue;
        } else {
          quickAddFormData.value[field.name] = field.defaultValue;
        }
      }
    });
  }
};

// Закрытие модального окна быстрого добавления
const closeQuickAddModal = () => {
  quickAddModalVisible.value = false;
  currentQuickAddItem.value = null;
};

// Отправка формы быстрого добавления
const submitQuickAddForm = async () => {
  try {
    quickAddLoading.value = true;
    quickAddError.value = null;
    quickAddValidationErrors.value = {};
    quickAddSuccess.value = false;
    
    // Подготовка данных для отправки
    const submitData = {...quickAddFormData.value};
    
    // Обработка полей даты (если они есть)
    if (currentQuickAddItem.value?.fields) {
      currentQuickAddItem.value.fields.forEach(field => {
        if (field.type === 'datetime' && submitData[field.name]) {
          submitData[field.name] = new Date(submitData[field.name]).toISOString();
        }
      });
    }
    
    // Формируем URL для API
    const config = useRuntimeConfig();
    const baseApiUrl = config.public.API_URL || '';
    
    let apiUrl = currentQuickAddItem.value.apiUrl;
    if (apiUrl.startsWith('/api/') && baseApiUrl) {
      apiUrl = `${baseApiUrl}${currentQuickAddItem.value.apiUrl}`;
    }
    
    // Отправляем запрос на создание
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submitData)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      if (response.status === 422 && responseData.errors) {
        quickAddValidationErrors.value = responseData.errors;
        quickAddError.value = responseData.message || 'Ошибка валидации';
      } else {
        throw new Error(responseData.message || 'Ошибка сохранения');
      }
      return;
    }
    
    // Получаем поле для заполнения из настроек
    const fieldToFill = currentQuickAddItem.value.fillField;
    
    // Устанавливаем сообщение об успехе
    quickAddSuccessMessage.value = currentQuickAddItem.value.successMessage || 
      `${currentQuickAddItem.value.title} успешно добавлен`;
    
    // Если есть поле для заполнения после добавления
    if (fieldToFill) {
      const resultData = responseData.data || responseData;
      
      // Получаем значение, которое нужно установить (обычно это id)
      const valueField = currentQuickAddItem.value.valueField || 'id';
      // Поле с названием/текстом элемента
      const labelField = currentQuickAddItem.value.labelField || 'name';
      
      let valueToSet = null;
      
      if (resultData[valueField] !== undefined) {
        valueToSet = resultData[valueField];
        
        // Ищем колонку в конфигурации формы
        const targetColumn = props.formOptions.columns.find(col => col.name === fieldToFill);
        
        if (targetColumn && targetColumn.type === 'select') {
          // Определяем ключевое поле и поле с меткой для селекта
          const keyField = targetColumn.options?.keyField || 'id';
          const displayField = targetColumn.options?.labelField || 'name';
          const iconField = targetColumn.options?.iconField || 'icon';
          
          // Создаем объект с правильной структурой
          const optionObject = {
            [keyField]: Number(valueToSet),
            [displayField]: resultData[labelField] || resultData.name || resultData.title || String(valueToSet)
          };
          
          // Добавляем иконку, если она есть в данных
          if (resultData.icon) {
            optionObject[iconField] = resultData.icon;
          }
          
          // Добавляем другие поля из результата, которые могут быть полезны
          Object.keys(resultData).forEach(key => {
            if (!optionObject[key] && key !== valueField && key !== labelField) {
              optionObject[key] = resultData[key];
            }
          });
          
          try {
            // 1. Сохраняем объект в глобальном хранилище
            if (!window._selectObjects) {
              window._selectObjects = {};
            }
            
            const cacheKey = `${fieldToFill}_${valueToSet}`;
            window._selectObjects[cacheKey] = optionObject;
            
            // Сохраняем данные в localStorage для персистентности
            try {
              localStorage.setItem('kirhSelectObjects', JSON.stringify(window._selectObjects));
            } catch (e) {
              console.warn('Ошибка при сохранении данных селектов в localStorage:', e);
            }
            
            // 2. Устанавливаем ID в основное поле формы
            formData.value[fieldToFill] = Number(valueToSet);
            
            // 3. Принудительно перерисовываем селект
            forceRerenderSelects.value++;
            
            // 4. Добавляем в массив опций селекта, если он существует
            if (targetColumn.options && targetColumn.options.options && Array.isArray(targetColumn.options.options)) {
              const existingOption = targetColumn.options.options.find(opt => 
                opt[keyField] == valueToSet
              );
              
              if (!existingOption) {
                targetColumn.options.options.push(optionObject);
              }
            }
            
            // 5. Находим элемент селекта на странице и обновляем его напрямую
            setTimeout(() => {
              try {
                const selectElement = document.querySelector(`[data-field="${fieldToFill}"]`);
                if (selectElement) {
                  const selectedOptionElement = selectElement.querySelector('.selected-option');
                  if (selectedOptionElement) {
                    // Поиск или создание элемента для отображения текста
                    let textElement = selectedOptionElement.querySelector('.selected-text');
                    if (!textElement) {
                      textElement = document.createElement('span');
                      textElement.className = 'selected-text';
                      selectedOptionElement.appendChild(textElement);
                    }
                    
                    // Устанавливаем текст опции
                    textElement.textContent = optionObject[displayField];
                    
                    // Если есть иконка, добавляем её
                    if (optionObject[iconField]) {
                      let iconElement = selectedOptionElement.querySelector('.option-icon');
                      if (!iconElement) {
                        iconElement = document.createElement('span');
                        iconElement.className = 'option-icon mr-2';
                        selectedOptionElement.insertBefore(iconElement, textElement);
                      }
                      
                      // Формат иконки: collection:icon-name
                      if (optionObject[iconField].includes(':')) {
                        const iconParts = optionObject[iconField].split(':');
                        const iconSrc = `https://api.iconify.design/${iconParts[0]}/${iconParts[1]}.svg`;
                        
                        let imgElement = iconElement.querySelector('img');
                        if (!imgElement) {
                          imgElement = document.createElement('img');
                          imgElement.className = 'h-5 w-5';
                          iconElement.appendChild(imgElement);
                        }
                        
                        imgElement.src = iconSrc;
                        imgElement.alt = optionObject[displayField];
                      }
                    }
                  }
                }
              } catch (e) {
                console.warn('Ошибка при прямом обновлении DOM селекта:', e);
              }
            }, 100);
            
            // 6. Если есть API URL у селекта, проверяем нужно ли обновить его данные
            if (targetColumn.options?.apiUrl) {
              // Конструируем URL для получения данных элемента
              let itemApiUrl = targetColumn.options.apiUrl;
              // Убираем параметры из URL, если они есть
              if (itemApiUrl.includes('?')) {
                itemApiUrl = itemApiUrl.split('?')[0];
              }
              // Добавляем ID элемента для прямого запроса данных
              if (!itemApiUrl.endsWith('/')) {
                itemApiUrl += '/';
              }
              itemApiUrl += valueToSet;
              
              // Если API URL начинается с /api/, добавляем базовый URL
              if (itemApiUrl.startsWith('/api/') && baseApiUrl) {
                itemApiUrl = `${baseApiUrl}${itemApiUrl}`;
              }
              
              // Загружаем данные элемента для обновления селекта
              try {
                const itemResponse = await fetch(itemApiUrl);
                if (itemResponse.ok) {
                  const itemData = await itemResponse.json();
                  if (itemData.data) {
                    // Обновляем объект в глобальном хранилище
                    const updatedObject = {
                      [keyField]: Number(valueToSet),
                      [displayField]: itemData.data[displayField] || itemData.data.name || itemData.data.title || String(valueToSet)
                    };
                    
                    // Добавляем все поля из ответа
                    Object.keys(itemData.data).forEach(key => {
                      updatedObject[key] = itemData.data[key];
                    });
                    
                    window._selectObjects[cacheKey] = updatedObject;
                    
                    // Сохраняем обновленные данные в localStorage
                    try {
                      localStorage.setItem('kirhSelectObjects', JSON.stringify(window._selectObjects));
                    } catch (e) {
                      console.warn('Ошибка при сохранении данных селектов в localStorage:', e);
                    }
                    
                    // Обновляем опцию в массиве опций, если он существует
                    if (targetColumn.options && targetColumn.options.options && Array.isArray(targetColumn.options.options)) {
                      const optionIndex = targetColumn.options.options.findIndex(opt => 
                        opt[keyField] == valueToSet
                      );
                      
                      if (optionIndex !== -1) {
                        targetColumn.options.options[optionIndex] = updatedObject;
                      } else {
                        targetColumn.options.options.push(updatedObject);
                      }
                    }
                    
                    // Еще раз принудительно перерисовываем селект
                    forceRerenderSelects.value++;
                    
                    // Обновляем DOM напрямую с новыми данными
                    setTimeout(() => {
                      try {
                        const selectElement = document.querySelector(`[data-field="${fieldToFill}"]`);
                        if (selectElement) {
                          const selectedOptionElement = selectElement.querySelector('.selected-option');
                          if (selectedOptionElement) {
                            // Поиск или создание элемента для отображения текста
                            let textElement = selectedOptionElement.querySelector('.selected-text');
                            if (textElement) {
                              textElement.textContent = updatedObject[displayField];
                            }
                          }
                        }
                      } catch (e) {
                        console.warn('Ошибка при прямом обновлении DOM селекта с API данными:', e);
                      }
                    }, 150);
                  }
                }
              } catch (e) {
                console.error('Ошибка при загрузке данных элемента для селекта:', e);
              }
            }
          } catch (e) {
            console.error('Ошибка при установке объекта селекта:', e);
            // При ошибке устанавливаем просто ID
            formData.value[fieldToFill] = Number(valueToSet);
          }
        } else {
          // Для других типов полей просто устанавливаем значение
          formData.value[fieldToFill] = valueToSet;
        }
      }
    }
    
    // Помечаем форму как успешно отправленную
    quickAddSuccess.value = true;
    
    // Сообщаем родителю об обновлении, если это требуется
    if (currentQuickAddItem.value.emitRefresh) {
      emit('refresh');
    }
    
  } catch (err) {
    quickAddError.value = err.message;
    console.error('Ошибка при быстром добавлении:', err);
  } finally {
    quickAddLoading.value = false;
  }
};

// Подписываемся на события закрытия модального окна
watch(() => quickAddModalVisible.value, (newVal) => {
  if (!newVal && currentQuickAddItem.value?.fillField) {
    // Окно закрыто, принудительно перерисовываем селекты через некоторое время
    setTimeout(() => {
      forceRerenderSelects.value++;
    }, 100);
  }
});

// Добавим наблюдатель за изменением параметров селекта
watch(() => currentQuickAddItem.value, (newVal) => {
  if (newVal && newVal.fields) {
    newVal.fields.forEach(field => {
      if (field.type === 'select') {
        // Убрал console.log
      }
    });
  }
}, { deep: true });

const handleQuickAddAutoSuggest = (fieldName, suggestOptions) => {
  if (!suggestOptions?.apiUrl) {
    return;
  }
  
  // Очищаем предыдущий таймер, если он существует
  if (suggestDebounceTimers.value[fieldName]) {
    clearTimeout(suggestDebounceTimers.value[fieldName]);
  }
  
  // Устанавливаем новый таймер для предотвращения частых запросов
  suggestDebounceTimers.value[fieldName] = setTimeout(async () => {
    const query = quickAddFormData.value[fieldName];
    
    // Если запрос пустой или слишком короткий, очищаем подсказки
    if (!query || query.length < (suggestOptions.minLength || 2)) {
      suggestions.value[fieldName] = [];
      return;
    }
    
    try {
      // Устанавливаем состояние загрузки
      suggestionsLoading.value[fieldName] = true;
      
      const params = new URLSearchParams();
      params.append('q', query);
      
      // Используем field_name из опций, если указан, иначе используем имя поля формы
      const fieldForApi = suggestOptions.field_name || fieldName;
      params.append('field', fieldForApi);
      
      // Добавляем дополнительные параметры
      if (suggestOptions.apiParams) {
        Object.entries(suggestOptions.apiParams).forEach(([key, value]) => {
          params.append(key, value);
        });
      }
      
      // Получаем конфигурацию для API
      const config = useRuntimeConfig();
      const baseApiUrl = config.public.API_URL || '';
      
      // Формируем полный URL
      let fullApiUrl = suggestOptions.apiUrl;
      // Проверяем, нужно ли обрабатывать URL как локальный
      const forceLocalApi = suggestOptions.forceLocalApi === true;
      if (fullApiUrl.startsWith('/api/') && baseApiUrl && !forceLocalApi) {
        fullApiUrl = `${baseApiUrl}${suggestOptions.apiUrl}`;
      }
      
      const response = await fetch(`${fullApiUrl}?${params.toString()}`);
      if (!response.ok) throw new Error('Ошибка при получении подсказок');
      
      const data = await response.json();
      suggestions.value[fieldName] = Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error('Ошибка автоподсказок:', error);
      suggestions.value[fieldName] = [];
    } finally {
      // Сбрасываем состояние загрузки
      suggestionsLoading.value[fieldName] = false;
    }
  }, suggestOptions.debounce || 300);
};

// Добавляем новый обработчик для модального окна
const handleQuickAddSuggestionSelect = (fieldName, suggestion, autoSuggestOptions, event) => {
  // Предотвращаем стандартное поведение и всплытие события
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  selectQuickAddSuggestion(fieldName, suggestion, autoSuggestOptions);
};

// Выбор значения из подсказок для модального окна
const selectQuickAddSuggestion = (fieldName, suggestion, autoSuggestOptions) => {
  if (!suggestion) {
    return;
  }
  
  // Проверяем, разрешен ли выбор
  if (autoSuggestOptions && !autoSuggestOptions.clickable) {
    return;
  }
  
  // Определяем поле для отображения (labelField)
  const labelField = autoSuggestOptions?.labelField || 'name';
  
  // Устанавливаем значение в поле формы модального окна
  quickAddFormData.value[fieldName] = suggestion[labelField];
  
  // Если есть дополнительные поля для заполнения из подсказки
  if (autoSuggestOptions?.fillFields) {
    for (const [targetField, sourceField] of Object.entries(autoSuggestOptions.fillFields)) {
      if (suggestion[sourceField] !== undefined) {
        quickAddFormData.value[targetField] = suggestion[sourceField];
      }
    }
  }
  
  // Очищаем подсказки и скрываем выпадающий список
  suggestions.value[fieldName] = [];
  isActiveSuggestion.value[fieldName] = false;
};

// Добавляем вычисляемое свойство для полей с транслитерацией в модальном окне
const quickAddFieldsWithTransliterate = computed(() => {
  if (!currentQuickAddItem.value?.fields) return {};
  
  // Собираем отображение полей для транслитерации
  const result = {};
  
  currentQuickAddItem.value.fields.forEach(field => {
    if (field.options?.transliterateFrom) {
      // Если для поля задано значение transliterateFrom
      result[field.name] = field.options.transliterateFrom;
    }
  });
  
  return result;
});

// Обработка изменений в полях, от которых зависит транслитерация в модальном окне
watch(quickAddFormData, (newData, oldData) => {
  // Для каждого поля с настройкой transliterateFrom
  applyQuickAddTransliteration(newData, oldData);
}, { deep: true });

// Функция для применения транслитерации в модальном окне
const applyQuickAddTransliteration = (currentData, previousData) => {
  if (!currentQuickAddItem.value?.fields) return;
  
  currentQuickAddItem.value.fields.forEach(field => {
    if (field.options?.transliterateFrom) {
      const sourceField = field.options.transliterateFrom;
      const targetField = field.name;
      
      // Если изменилось значение исходного поля или previousData пустой (инициализация)
      if (!previousData || currentData[sourceField] !== previousData[sourceField]) {
        // Обновляем значение целевого поля через транслитерацию
        quickAddFormData.value[targetField] = transliterate(currentData[sourceField] || '');
      }
    }
  });
};

// Добавляем обработчик ввода текста в поля модального окна
const handleQuickAddFieldInput = (fieldName) => {
  // Проверяем, влияет ли это поле на поле с транслитерацией
  Object.entries(quickAddFieldsWithTransliterate.value).forEach(([targetField, sourceField]) => {
    if (sourceField === fieldName) {
      // Если да, применяем транслитерацию немедленно
      quickAddFormData.value[targetField] = transliterate(quickAddFormData.value[sourceField] || '');
    }
  });
};

// Добавим обработчик изменения состояния переключателя
const handleToggleChange = (fieldName) => {
  // Обновляем значение в formData после изменения состояния
  formData.value[fieldName] = !formData.value[fieldName];
};
</script>

<!-- 
Документация по использованию autoSuggest:

В опциях для колонки типа 'text' можно добавить объект autoSuggest со следующими параметрами:

{
  apiUrl: '/api/suggestions', // URL API для получения подсказок (обязательный)
  apiParams: { table: 'users' }, // Дополнительные параметры запроса (опционально)
  minLength: 2, // Минимальная длина ввода для активации подсказок (по умолчанию 2)
  debounce: 300, // Задержка между запросами в мс (по умолчанию 300)
  labelField: 'name', // Поле для отображения в списке подсказок (по умолчанию 'name')
  valueField: 'value', // Поле для значения (по умолчанию 'value')
  clickable: true, // Можно ли выбрать значение из списка (по умолчанию false)
  showCount: false, // Показывать ли счетчик, если он есть в данных (по умолчанию false)
  forceLocalApi: false, // Не добавлять префикс API_URL для локальных запросов (по умолчанию false)
  field_name: 'db_field_name', // Имя поля для параметра field при запросе подсказок (не влияет на отправку формы)
  fillFields: { // Дополнительные поля, которые нужно заполнить при выборе значения
    email: 'email', // ключ - имя поля в форме, значение - имя поля в данных подсказки
    id: 'id'
  }
}

Пример использования в определении колонок:

columns: [
  {
    name: 'username', // Имя поля в форме и ключ для отправки данных на сервер
    label: 'Имя пользователя',
    type: 'text',
    options: {
      autoSuggest: {
        apiUrl: '/api/user-suggestions',
        field_name: 'user', // Имя поля, используемое только при запросе подсказок
        clickable: true,
        minLength: 3,
        showCount: true,
        fillFields: {
          email: 'email',
          user_id: 'id'
        }
      }
    }
  }
]

Документация по использованию pasteFromClipboard:

В опциях для колонки типа 'text' можно добавить объект pasteFromClipboard для отображения кнопки вставки из буфера обмена:

{
  title: 'Вставить из буфера', // Подсказка при наведении на кнопку (по умолчанию 'Вставить из буфера обмена')
  transform: 'return text.trim().toLowerCase();' // Код JavaScript-функции для преобразования текста из буфера
}

Функция transform получает один параметр text (содержимое буфера обмена)
и должна возвращать преобразованный текст. Это позволяет автоматически чистить, 
форматировать или извлекать нужные данные при вставке.

Пример использования в определении колонок:

columns: [
  {
    name: 'email',
    label: 'Email адрес',
    type: 'text',
    options: {
      pasteFromClipboard: {
        title: 'Вставить email',
        transform: 'return text.trim().toLowerCase().match(/[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$/i)?.[0] || text;'
      }
    }
  },
  {
    name: 'phone',
    label: 'Телефон',
    type: 'text',
    options: {
      pasteFromClipboard: {
        // Автоматически очищаем телефон от всего, кроме цифр
        transform: 'return text.replace(/[^0-9]/g, "");'
      }
    }
  }
]
-->

<style scoped>
.kirh-form-container {
  margin-bottom: 1.5rem;
}

.kirh-form-wrapper {
  transition: all 0.3s ease;
}

.kirh-form-toggle-btn {
  transition: background-color 0.2s;
}

.kirh-dynamic-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>