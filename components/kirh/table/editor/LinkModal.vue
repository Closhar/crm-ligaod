<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Добавить ссылку</h3>
        <button class="text-gray-500 hover:text-gray-700" @click="$emit('close')">
          <Icon name="ph:x"/>
        </button>
      </div>

      <div class="space-y-4">
        <!-- Выбор типа ссылки -->
        <div>
          <label class="block text-sm font-medium mb-1">Тип ссылки</label>
          <select
              v-model="linkType"
              class="w-full border rounded px-3 py-2"
          >
            <option value="url">Внешняя ссылка</option>
            <option value="email">Email</option>
            <option value="tel">Телефон</option>
          </select>
        </div>

        <!-- URL -->
        <div v-if="linkType === 'url'">
          <label class="block text-sm font-medium mb-1">URL ссылки</label>
          <input
              v-model="href"
              class="w-full border rounded px-3 py-2"
              placeholder="https://example.com"
              type="url"
          >
        </div>

        <!-- Email -->
        <div v-if="linkType === 'email'">
          <label class="block text-sm font-medium mb-1">Email адрес</label>
          <input
              v-model="email"
              class="w-full border rounded px-3 py-2"
              placeholder="user@example.com"
              type="email"
          >
        </div>

        <!-- Телефон -->
        <div v-if="linkType === 'tel'">
          <label class="block text-sm font-medium mb-1">Номер телефона</label>
          <input
              v-model="phone"
              class="w-full border rounded px-3 py-2"
              placeholder="+79991234567"
              type="tel"
          >
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Текст ссылки</label>
          <input
              v-model="text"
              class="w-full border rounded px-3 py-2"
              placeholder="Текст ссылки"
              type="text"
          >
        </div>

        <div class="flex items-center">
          <input
              id="open-new-tab"
              v-model="openInNewTab"
              class="mr-2"
              type="checkbox"
          >
          <label class="text-sm" for="open-new-tab">Открывать в новой вкладке</label>
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
            :disabled="!isValidLink"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            @click="insert"
        >
          Вставить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed} from 'vue'

const props = defineProps({
  initialValues: {
    type: Object,
    default: () => ({
      href: '',
      text: '',
      openInNewTab: false
    })
  }
})

const emit = defineEmits(['insert', 'close'])

const linkType = ref('url')
const href = ref(props.initialValues.href)
const email = ref('')
const phone = ref('')
const text = ref(props.initialValues.text)
const openInNewTab = ref(props.initialValues.openInNewTab)

const isValidLink = computed(() => {
  if (linkType.value === 'url') return href.value.trim() !== ''
  if (linkType.value === 'email') return email.value.trim() !== ''
  if (linkType.value === 'tel') return phone.value.trim() !== ''
  return false
})

const insert = () => {
  let finalHref = href.value
  if (linkType.value === 'email') finalHref = `mailto:${email.value}`
  if (linkType.value === 'tel') finalHref = `tel:${phone.value}`

  emit('insert', {
    href: finalHref,
    text: text.value,
    openInNewTab: openInNewTab.value
  })
  emit('close')
}
</script>