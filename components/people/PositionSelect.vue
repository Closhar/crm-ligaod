<template>
  <div class="position-select">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
    <div class="relative">
      <input
        v-model="search"
        :placeholder="placeholder"
        class="form-input w-full position-input"
        @input="onSearch"
        @focus="showDropdown = true"
        @blur="onBlur"
        :required="required"
      />
      <ul v-if="showDropdown && (filteredPositions.length || (search.length >= 2 && !hasExactMatch))" class="absolute z-10 bg-white border border-gray-200 w-full mt-1 rounded shadow max-h-48 overflow-auto">
        <li v-if="search.length >= 2 && !hasExactMatch" class="px-3 py-2 text-gray-500 cursor-pointer hover:bg-green-100" @mousedown.prevent="createPosition">
          Создать новую должность: <span class="font-semibold">{{ search }}</span>
        </li>
        <li
          v-for="position in filteredPositions"
          :key="position.id"
          @mousedown.prevent="selectPosition(position)"
          class="px-3 py-2 cursor-pointer hover:bg-blue-100"
        >
          {{ position.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useApi } from '@/composables/useApi'
import { computed, onMounted, ref, watch } from 'vue'
let debounceTimeout = null

const props = defineProps({
  modelValue: { type: [String, Number, Object], default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Выберите или введите должность' },
  required: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: true },
})
const emit = defineEmits(['update:modelValue'])

const { apiRequest } = useApi()
const positions = ref([])
const search = ref('')
const showDropdown = ref(false)
const loading = ref(false)

const filteredPositions = ref([])

const hasExactMatch = computed(() => {
  if (!search.value || !filteredPositions.value.length) return false
  return filteredPositions.value.some(a => a.name.trim().toLowerCase() === search.value.trim().toLowerCase())
})

const fetchPositions = async (query = '') => {
  loading.value = true
  let url = '/positions'
  if (query && query.length >= 2) {
    url += `?search=${encodeURIComponent(query)}`
  }
  const response = await apiRequest(url)
  if (response && response.success && Array.isArray(response.data)) {
    positions.value = response.data
  } else if (Array.isArray(response)) {
    positions.value = response
  } else {
    positions.value = []
  }
  filterPositions()
  loading.value = false
}

const filterPositions = () => {
  if (!search.value) {
    filteredPositions.value = positions.value
    return
  }
  const s = search.value.toLowerCase()
  filteredPositions.value = positions.value.filter(a => a.name.toLowerCase().includes(s))
}

const selectPosition = (position) => {
  emit('update:modelValue', position.id)
  search.value = position.name
  showDropdown.value = false
}

const createPosition = async () => {
  if (!search.value.trim()) return
  loading.value = true
  const response = await apiRequest('/positions', {
    method: 'POST',
    body: { name: search.value.trim() }
  })
  let newPosition = null
  if (response && response.success && response.data) {
    newPosition = response.data
  } else if (response && response.id) {
    newPosition = response
  }
  if (newPosition) {
    positions.value.push(newPosition)
    emit('update:modelValue', newPosition.id)
    search.value = newPosition.name
    showDropdown.value = false
    filterPositions()
  }
  loading.value = false
}

const onSearch = () => {
  showDropdown.value = true
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(async () => {
    await fetchPositions(search.value)
  }, 400)
}

const onBlur = () => {
  setTimeout(() => { showDropdown.value = false }, 150)
}

watch(() => props.modelValue, (val) => {
  if (!val) {
    search.value = ''
    return
  }
  // Если modelValue — id, ищем имя
  const found = positions.value.find(a => a.id === val)
  if (found) {
    search.value = found.name
  } else if (typeof val === 'string' || typeof val === 'number') {
    search.value = String(val)
  } else if (val && val.name) {
    search.value = val.name
  }
})

onMounted(async () => {
  await fetchPositions('')
  if (props.modelValue) {
    const found = positions.value.find(a => a.id === props.modelValue)
    if (found) {
      search.value = found.name
    } else if (typeof props.modelValue === 'string' || typeof props.modelValue === 'number') {
      search.value = String(props.modelValue)
    } else if (props.modelValue && props.modelValue.name) {
      search.value = props.modelValue.name
    }
  }
})
</script>

<style scoped>
.position-select {
  width: 100%;
}
.position-input {
  min-height: 48px;
  padding-top: 12px;
  padding-bottom: 12px;
  font-size: 1.1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-sizing: border-box;
  padding-left: 1rem;
  padding-right: 1rem;
}
</style> 