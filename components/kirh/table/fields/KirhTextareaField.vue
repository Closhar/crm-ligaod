<template>
  <div title="">
    <button
        v-if="!readonly"
        :title="buttonTitle"
        class="h-8 w-full border rounded"
        :class="dynamicClass"
        @click="openModal"
    >
      <Icon :name="options.icon || 'ph:note-pencil'" class="mx-auto mt-1" size="1.6em"/>
    </button>

    <div v-if="readonly" class="prose max-w-none" :class="dynamicClass" v-html="displayValue"></div>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
          ref="editorContainer"
          :class="{
            'max-w-4xl w-full': !isFullscreen,
            'fixed inset-0 h-screen w-screen': isFullscreen,
            'h-[90vh] border rounded-lg': !isFullscreen,
            'max-h-[500px]': !editorEnabled && !isFullscreen
          }"
          class="bg-white shadow-xl flex flex-col transition-all"
      >
        <div class="p-4 border-b flex justify-between items-center">
          <h3 class="text-lg font-semibold">
            {{ options.title || 'Редактор текста' }}
          </h3>
          <div class="flex items-center gap-2">
            <button
                v-if="options.telegram_parse"
                title="AI Генерация"
                class="flex items-center gap-2 px-3 py-1.5 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                @click="openTelegramParser"
            >
              <Icon name="ph:robot" size="18"/>
              <span class="text-sm font-medium">AI Генерация</span>
            </button>
            <button
                class="text-gray-500 hover:text-gray-700"
                @click="closeModal"
            >
              <Icon name="ph:x" size="20"/>
            </button>
          </div>
        </div>

        <div v-if="editorEnabled" class="flex-1 overflow-auto">
          <RichTextEditor
              :model-value="localValue"
              :editor-enabled="editorEnabled"
              :placeholder="options.placeholder"
              :upload-options="{
                url: options.uploadUrl || '/api/upload-image',
                maxWidth: options.imageMaxWidth || 1200,
                quality: options.imageQuality || 0.8
              }"
              @update:model-value="handleValueUpdate"
              @toggle-fullscreen="toggleFullscreen"
          />
        </div>
        <div v-else class="flex-1 overflow-auto p-4">
          <div v-if="options.instruction" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            <p class="font-medium mb-1">{{ getInstructionTitle }}</p>
            <p v-html="options.instruction"></p>
          </div>
          
          <div class="flex gap-4">
            <div class="flex-1">
              <textarea
                  v-model="localValue"
                  :placeholder="options.placeholder"
                  class="w-full h-[120px] p-2 border rounded font-mono text-sm outline-none resize-none text-left whitespace-pre-wrap leading-normal"
                  rows="5"
              ></textarea>
            </div>
            
            <div v-if="options.visual_type" class="flex-1 border rounded bg-gray-50 p-4">
              <h4 class="text-sm font-medium mb-2">Визуализация:</h4>
              <div class="space-y-2">
                <template v-for="(item, index) in parsedItems" :key="index">
                  <div class="flex items-center gap-2">
                    <a
                        v-if="item.href"
                        :href="item.href"
                        class="text-blue-500 hover:text-blue-700 hover:underline"
                        target="_blank"
                    >
                      {{ item.text }}
                    </a>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t flex justify-end space-x-2">
          <button
              class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              @click="closeModal"
          >
            Отмена
          </button>
          <button
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              @click="saveChanges"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>

    <TelegramParser
      :show-modal="showTelegramParser"
      @close="showTelegramParser = false"
      @apply="handleTelegramResult"
      :options="{
        ...options,
        telegrams: telegramsValue
      }"
      :rowData="rowData"
    />
  </div>
</template>

<script setup>
import {ref, computed, watch} from 'vue'
import RichTextEditor from "./../editor/RichTextEditor.vue";
import TelegramParser from "./TelegramParser.vue";

const props = defineProps({
  modelValue: {
    type: [String, Object],
    default: '',
    validator: (value) => {
      if (typeof value === 'object' && value !== null) {
        return value.target !== undefined;
      }
      return typeof value === 'string';
    }
  },
  error: [String, Boolean],
  options: {
    type: Object,
    default: () => ({
      buttonTitle: 'Редактировать',
      icon: 'ph:note-pencil',
      readonly: false,
      uploadUrl: '/api/upload-image',
      imageMaxWidth: 1200,
      imageQuality: 0.8,
      sel_class: "text-blue-500 hover:text-blue-700",
      visual_type: null,
      instruction: null,
      editorEnabled: true,
      parse_own_telegram: false,
      telegrams_field: '',
      telegram_parse: false
    })
  },
  readonly: Boolean,
  type: String,
  rowData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'blur'])

const showModal = ref(false)
const localValue = ref('')
const isFullscreen = ref(false)
const editorContainer = ref(null)
const isSaving = ref(false)
const hasChanges = ref(false)
const showTelegramParser = ref(false)

const editorEnabled = computed(() => props.options.editorEnabled !== false)

const getInstructionTitle = computed(() => {
  switch (props.options.visual_type) {
    case 'phone':
      return 'Формат ввода телефонов:'
    case 'email':
      return 'Формат ввода email:'
    case 'site':
      return 'Формат ввода сайтов:'
    default:
      return 'Инструкция по вводу:'
  }
})

const parsedItems = computed(() => {
  if (!props.options.visual_type || !localValue.value) return []
  
  // Разбиваем по запятым и переносам строк, затем убираем пустые значения
  const items = localValue.value
    .split(/[,\n]/) // Разбиваем по запятым и переносам строк
    .map(item => item.trim())
    .filter(item => item)
  
  return items.map(item => {
    const [value, description] = item.split('|').map(v => v.trim())
    if (!value) return null

    let href = ''
    let text = description || value

    switch (props.options.visual_type) {
      case 'phone':
        href = `tel:${value}`
        break
      case 'email':
        href = `mailto:${value}`
        break
      case 'site':
        href = value.startsWith('http') ? value : `https://${value}`
        break
      default:
        return null
    }

    return { href, text }
  }).filter(Boolean)
})

const displayValue = computed(() => {
  if (typeof props.modelValue === 'object' && props.modelValue !== null) {
    return props.modelValue.target?.value || '<p></p>';
  }
  return props.modelValue || '<p></p>';
})

const telegramsValue = computed(() => {
  // Получаем значение из API
  const apiValue = props.rowData?.about?.match(/telegram_parse:\s*([^\n]+)/)?.[1]?.trim();
  
  if (apiValue) {
    // Сохраняем значение в rowData
    props.rowData.telegram_parse = apiValue;
  }
  
  // Используем значение из rowData или из API
  return props.rowData?.telegram_parse || apiValue || '';
});

const dynamicClass = computed(() => {
  if (props.options.check_empty) {
    let valueToCheck = props.modelValue;
    
    if (typeof props.modelValue === 'object' && props.modelValue !== null) {
      valueToCheck = props.modelValue.target?.value || '';
    }
    
    // Remove all HTML tags except iframe
    const strippedValue = (valueToCheck || '')
      .replace(/<(?!iframe\b)[^>]*>/g, '')
      .replace(/<\/iframe>/g, '')
      .trim();
    
    if (!strippedValue) {
      return props.options.empty_class || 'bg-red-100';
    }
  }
  return props.options.sel_class || '';
})

const buttonTitle = computed(() => {
  if (props.options.check_empty) {
    let valueToCheck = props.modelValue;
    
    if (typeof props.modelValue === 'object' && props.modelValue !== null) {
      valueToCheck = props.modelValue.target?.value || '';
    }
    
    const strippedValue = (valueToCheck || '').replace(/<[^>]*>/g, '').trim();
    if (!strippedValue) {
      return (props.options.title || 'Редактировать') + ' (данные отсутствуют)';
    }
  }
  return props.options.title || 'Редактировать';
})

const openModal = () => {
  if (props.readonly) return;
  
  // Нормализуем значение перед открытием модального окна
  const normalizedValue = getNormalizedValue(props.modelValue);
  localValue.value = normalizedValue;
  
  isSaving.value = false;
  hasChanges.value = false;
  showModal.value = true;
}

const closeModal = () => {
  showModal.value = false;
  isFullscreen.value = false;
  document.body.classList.remove('overflow-hidden');
  emit('blur');
}

const getNormalizedValue = (value) => {
  if (typeof value === 'object' && value !== null) {
    if (value.target) {
      return value.target.value;
    }
    if (value.data) {
      return value.data;
    }
    return '';
  }
  return value || '';
}

const handleValueUpdate = (newValue) => {
  localValue.value = getNormalizedValue(newValue);
}

const saveChanges = () => {
  if (isSaving.value) return;
  if (localValue.value === getNormalizedValue(props.modelValue)) {
    closeModal();
    return;
  }
  
  isSaving.value = true;
  emit('update:modelValue', localValue.value);
  isSaving.value = false;
  closeModal();
}

// Добавляем computed для нормализованного значения
const normalizedModelValue = computed(() => {
  return getNormalizedValue(props.modelValue);
})

// Обновляем watcher
watch(normalizedModelValue, (newValue) => {
  if (!showModal.value) {
    localValue.value = newValue;
  }
}, { immediate: true });

const toggleFullscreen = (value) => {
  isFullscreen.value = value
  if (value) {
    document.body.classList.add('overflow-hidden')
  } else {
    document.body.classList.remove('overflow-hidden')
  }
}

const openTelegramParser = () => {
  showTelegramParser.value = true;
}

const handleTelegramResult = (result) => {
  // Если результат - объект, берем content
  if (typeof result === 'object' && result !== null) {
    if (result.content) {
      localValue.value = result.content;
      emit('update:modelValue', result.content);
    }
  } else {
    // Если результат - строка, используем как есть
    localValue.value = result;
    emit('update:modelValue', result);
  }
  
  // Закрываем только модальное окно парсера
  showTelegramParser.value = false;
}
</script>