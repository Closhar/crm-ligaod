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
                  <input
                      v-model="formData[column.name]"
                      type="text"
                      :required="column.required"
                      :readonly="column.options?.readonly || formOptions.readonly"
                      :class="['w-full rounded-md shadow-sm', column.options?.inputClass]"
                      :placeholder="column.options?.placeholder"
                      @input="handleAutoSuggest(column.name, column.options?.autoSuggest); handleFieldInput(column.name)"
                      @focus="isActiveSuggestion[column.name] = true"
                  />
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
                <input
                    v-else-if="column.type === 'text'"
                    v-model="formData[column.name]"
                    type="text"
                    :required="column.required"
                    :readonly="column.options?.readonly || formOptions.readonly"
                    :class="['w-full rounded-md shadow-sm', column.options?.inputClass]"
                    :placeholder="column.options?.placeholder"
                    @input="handleFieldInput(column.name)"
                />

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
                    :empty-option="column.options?.empty_option"
                    :list-item="column.options?.list_item"
                    :options-list="column.options?.options_list"
                    :sel_class="column.options?.sel_class || null"
                    :error="!!validationErrors?.[column.name]"
                />

                <!-- Переключатель -->
                <label v-else-if="column.type === 'toggle'" class="inline-flex items-center mt-2">
                  <input
                      type="checkbox"
                      v-model="formData[column.name]"
                      :disabled="column.options?.readonly || formOptions.readonly"
                      class="sr-only peer"
                  >
                  <div
                      class="relative w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                      :class="[
                        column.options?.inputClass,
                        formData[column.name] ?
                          (column.options?.activeClass || 'bg-blue-500') :
                          (column.options?.inactiveClass || 'bg-gray-200'),
                        validationErrors?.[column.name] ? 'border-red-500' : 'border-gray-300'
                      ]"
                  ></div>
                  <span class="ml-2 text-sm text-gray-600" v-if="column.options?.toggleLabel">
                    {{ formData[column.name] ? column.options.toggleLabel.on : column.options.toggleLabel.off }}
                  </span>
                </label>
              </div>

              <!-- Вывод ошибки для поля -->
              <p v-if="validationErrors?.[column.name]" class="mt-1 text-sm text-red-600">
                {{ validationErrors[column.name].join(', ') }}
              </p>
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
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue';
import KirhSelectField from './../fields/KirhSelectField.vue';
import RichTextEditor from "~/components/kirh/table/editor/RichTextEditor.vue";
import { useRuntimeConfig } from '#app';
import { transliterate } from '~/utils/transliterate';

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
      forceLocalApi: false
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
        // Для селектов устанавливаем null
        formData.value[column.name] = null;
        break;
      case 'toggle':
        // Для переключателя устанавливаем false
        formData.value[column.name] = column.options?.defaultChecked === true ? true : false;
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
  
  // Инициализация формы - установка дефолтных значений
  if (props.formOptions.initialData) {
    // Если есть initialData, используем его
    Object.entries(props.formOptions.initialData).forEach(([key, value]) => {
      formData.value[key] = value;
    });
  }
  
  // Если есть редактируемая строка, заполняем форму её данными
  if (props.editingRow) {
    // При редактировании заполняем данными строки
    Object.keys(props.editingRow).forEach(key => {
      formData.value[key] = props.editingRow[key];
    });
    
    // Конвертация datetime полей для отображения в форме
    props.formOptions.columns.forEach(column => {
      if (column.type === 'datetime' && formData.value[column.name]) {
        formData.value[column.name] = convertToDatetimeLocal(formData.value[column.name]);
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

// Регистрация и удаление обработчика события клика
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
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

// Инициализация при монтировании
initForm();
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