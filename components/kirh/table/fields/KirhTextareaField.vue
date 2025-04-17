<template>
  <div>
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
          <button
              class="text-gray-500 hover:text-gray-700"
              @click="closeModal"
          >
            <Icon name="ph:x" size="20"/>
          </button>
        </div>

        <div v-if="editorEnabled" class="flex-1 overflow-auto">
          <RichTextEditor
              v-model="localValue"
              :editor-enabled="editorEnabled"
              :placeholder="options.placeholder"
              :upload-options="{
                url: options.uploadUrl || '/api/upload-image',
                maxWidth: options.imageMaxWidth || 1200,
                quality: options.imageQuality || 0.8
              }"
              @update:modelValue="localValue = $event"
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
  </div>
</template>

<script setup>
import {ref, computed} from 'vue'
import RichTextEditor from "./../editor/RichTextEditor.vue";

const props = defineProps({
  value: String,
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
      visual_type: null, // 'phone', 'email', 'site'
      instruction: null // Текст инструкции
    })
  },
  readonly: Boolean,
  type: String
})

const emit = defineEmits(['input', 'blur'])

const showModal = ref(false)
const localValue = ref(props.value)
const isFullscreen = ref(false)
const editorContainer = ref(null)

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
  return props.value || '<p></p>'
})

const dynamicClass = computed(() => {
  if (props.options.check_empty) {
    // Remove all HTML tags except iframe
    const strippedValue = (props.value || '')
      .replace(/<(?!iframe\b)[^>]*>/g, '') // Remove all tags except iframe
      .replace(/<\/iframe>/g, '') // Remove iframe closing tags
      .trim();
    
    if (!strippedValue) {
      return props.options.empty_class || 'bg-red-100';
    }
  }
  return props.options.sel_class || '';
})

const buttonTitle = computed(() => {
  if (props.options.check_empty) {
    const strippedValue = (props.value || '').replace(/<[^>]*>/g, '').trim();
    if (!strippedValue) {
      return (props.options.title || 'Редактировать') + ' (данные отсутствуют)';
    }
  }
  return props.options.title || 'Редактировать';
})

const openModal = () => {
  if (props.readonly) return
  localValue.value = props.value
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isFullscreen.value = false
  document.body.classList.remove('overflow-hidden')
  emit('blur')
}

const saveChanges = () => {
  emit('input', localValue.value)
  closeModal()
}

const toggleFullscreen = (value) => {
  isFullscreen.value = value
  if (value) {
    document.body.classList.add('overflow-hidden')
  } else {
    document.body.classList.remove('overflow-hidden')
  }
}
</script>