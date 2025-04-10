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

    <RichTextEditor
        v-if="showModal"
        v-model="localValue"
        :editorEnabled="options.editorEnabled"
        :placeholder="options.placeholder"
        :show-source="false"
        :title="options.title"
        :upload-options="{
        url: options.uploadUrl || '/api/upload-image',
        maxWidth: options.imageMaxWidth || 1200,
        quality: options.imageQuality || 0.8
      }"
        @close="closeModal"
        @save="saveChanges"
    />
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
  emit('blur')
}

const saveChanges = (html) => {
  emit('input', html)
  closeModal()
}
</script>