<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-md w-full p-6">
      <h3 class="text-lg font-semibold mb-4">Создать нового игрока</h3>
      <form @submit.prevent="createPlayer">
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
          <input v-model="form.last_name" type="text" class="w-full p-2 border border-gray-300 rounded" required />
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">Имя</label>
          <input v-model="form.first_name" type="text" class="w-full p-2 border border-gray-300 rounded" required />
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">Отчество</label>
          <input v-model="form.middle_name" type="text" class="w-full p-2 border border-gray-300 rounded" />
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">Дата рождения</label>
          <input v-model="form.birth_date" type="date" class="w-full p-2 border border-gray-300 rounded" required />
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">Амплуа</label>
          <select v-model="selectedAmpluaId" class="w-full p-2 border border-gray-300 rounded" required>
            <option value="">Выберите амплуа</option>
            <option v-for="amplua in ampluas" :key="amplua.id" :value="amplua.id">{{ amplua.name }}</option>
          </select>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button type="button" @click="$emit('close')" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Отмена</button>
          <button type="submit" :disabled="loading || !selectedAmpluaId" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {{ loading ? 'Создание...' : 'Создать и добавить' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

const props = defineProps({
  clubId: {
    type: [String, Number],
    required: true
  }
})
const emit = defineEmits(['close', 'player-created'])

const { apiRequest } = useApi()

const form = ref({
  last_name: '',
  first_name: '',
  middle_name: '',
  birth_date: ''
})
const ampluas = ref([])
const selectedAmpluaId = ref('')
const loading = ref(false)

const loadAmpluas = async () => {
  const response = await apiRequest('/people/ampluas')
  if (response && response.success && Array.isArray(response.data)) {
    ampluas.value = response.data
  } else if (Array.isArray(response)) {
    ampluas.value = response
  } else {
    ampluas.value = []
  }
}

const createPlayer = async () => {
  if (!form.value.last_name || !form.value.first_name || !form.value.birth_date || !selectedAmpluaId.value) return
  loading.value = true
  // 1. Создать персону
  const response = await apiRequest('/people', {
    method: 'POST',
    body: {
      ...form.value
    }
  })
  let person = null
  if (response && response.success && response.data) {
    person = response.data
    // 2. Добавить в команду с амплуа
    await apiRequest(`/clubs/${props.clubId}/add-player-with-amplua`, {
      method: 'POST',
      body: {
        person_id: person.id,
        amplua_id: selectedAmpluaId.value
      }
    })
    // Для автозаполнения поиска
    person.label = `${person.last_name} ${person.first_name} ${person.middle_name || ''}`.trim() + (person.birth_date ? ` (${person.birth_date})` : '')
    emit('player-created', person)
    emit('close')
  }
  loading.value = false
}

onMounted(loadAmpluas)
</script>