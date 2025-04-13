<template>
  <div>
    <button
        v-if="!readonly"
        :title="options.title || 'Редактировать'"
        class="text-blue-500 hover:text-blue-700 h-8 w-full border rounded"
        @click="openModal"
    >
      <Icon :name="options.icon || 'ph:note-pencil'" class="mx-auto mt-1" size="1.6em"/>
    </button>

    <div v-if="readonly" class="prose max-w-none" v-html="displayValue"></div>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
          ref="editorContainer"
          :class="{
            'max-w-4xl w-full': !isFullscreen,
            'fixed inset-0 h-screen w-screen': isFullscreen,
            'h-[90vh] border rounded-lg': !isFullscreen
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
      imageQuality: 0.8
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

const displayValue = computed(() => {
  return props.value || '<p></p>'
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