<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Добавить iframe</h3>
        <button class="text-gray-500 hover:text-gray-700" @click="$emit('close')">
          <Icon name="ph:x"/>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">URL iframe</label>
          <input
              v-model="src"
              class="w-full border rounded px-3 py-2"
              placeholder="https://example.com"
              required
              type="url"
          >
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Ширина</label>
            <input
                v-model="width"
                class="w-full border rounded px-3 py-2"
                placeholder="100%"
                type="text"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Высота</label>
            <input
                v-model="height"
                class="w-full border rounded px-3 py-2"
                placeholder="400"
                type="text"
            >
          </div>
        </div>

        <div class="flex items-center mt-2">
          <input
              id="allow-fullscreen"
              v-model="allowfullscreen"
              class="mr-2"
              type="checkbox"
          >
          <label class="text-sm" for="allow-fullscreen">Разрешить полноэкранный режим</label>
        </div>
      </div>

      <div class="flex justify-end space-x-2 mt-6">
        <button
            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            @click="$emit('close')"
        >
          Отмена
        </button>
        <button
            :disabled="!src"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            @click="insert"
        >
          Вставить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'

const src = ref('')
const width = ref('100%')
const height = ref('400')
const allowfullscreen = ref(true)
const frameborder = ref('0')

const emit = defineEmits(['insert', 'close'])

const insert = () => {
  emit('insert', {
    src: src.value,
    width: width.value,
    height: height.value,
    frameborder: frameborder.value,
    allowfullscreen: allowfullscreen.value ? 'true' : 'false'
  })
  src.value = ''
  emit('close')
}
</script>