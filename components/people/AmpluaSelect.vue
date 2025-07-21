<template>
  <div class="amplua-select">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
    <div class="relative">
      <input
        v-model="search"
        :placeholder="placeholder"
        class="form-input w-full amplua-input"
        @input="onSearch"
        @focus="showDropdown = true"
        @blur="onBlur"
        :required="required"
      />
      <ul v-if="showDropdown && (filteredAmpluas.length || (search.length >= 2 && !hasExactMatch))" class="absolute z-10 bg-white border border-gray-200 w-full mt-1 rounded shadow max-h-48 overflow-auto">
        <li v-if="search.length >= 2 && !hasExactMatch" class="px-3 py-2 text-gray-500 cursor-pointer hover:bg-green-100" @mousedown.prevent="createAmplua">
          Создать новое амплуа: <span class="font-semibold">{{ search }}</span>
        </li>
        <li
          v-for="amplua in filteredAmpluas"
          :key="amplua.id"
          @mousedown.prevent="selectAmplua(amplua)"
          class="px-3 py-2 cursor-pointer hover:bg-blue-100"
        >
          {{ amplua.name }}
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
  placeholder: { type: String, default: 'Выберите или введите амплуа' },
  required: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: true },
})
const emit = defineEmits(['update:modelValue'])

const { apiRequest } = useApi()
const ampluas = ref([])
const search = ref('')
const showDropdown = ref(false)
const loading = ref(false)

const filteredAmpluas = ref([])

const hasExactMatch = computed(() => {
  if (!search.value || !filteredAmpluas.value.length) return false
  return filteredAmpluas.value.some(a => a.name.trim().toLowerCase() === search.value.trim().toLowerCase())
})

const fetchAmpluas = async (query = '') => {
  loading.value = true
  let url = '/ampluas'
  if (query && query.length >= 2) {
    url += `?search=${encodeURIComponent(query)}`
  }
  const response = await apiRequest(url)
  if (response && response.success && Array.isArray(response.data)) {
    ampluas.value = response.data
  } else if (Array.isArray(response)) {
    ampluas.value = response
  } else {
    ampluas.value = []
  }
  filterAmpluas()
  loading.value = false
}

const filterAmpluas = () => {
  if (!search.value) {
    filteredAmpluas.value = ampluas.value
    return
  }
  const s = search.value.toLowerCase()
  filteredAmpluas.value = ampluas.value.filter(a => a.name.toLowerCase().includes(s))
}

const selectAmplua = (amplua) => {
  emit('update:modelValue', amplua.id)
  search.value = amplua.name
  showDropdown.value = false
}

const createAmplua = async () => {
  if (!search.value.trim()) return
  loading.value = true
  const response = await apiRequest('/ampluas', {
    method: 'POST',
    body: { name: search.value.trim() }
  })
  let newAmplua = null
  if (response && response.success && response.data) {
    newAmplua = response.data
  } else if (response && response.id) {
    newAmplua = response
  }
  if (newAmplua) {
    ampluas.value.push(newAmplua)
    emit('update:modelValue', newAmplua.id)
    search.value = newAmplua.name
    showDropdown.value = false
    filterAmpluas()
  }
  loading.value = false
}

const onSearch = () => {
  showDropdown.value = true
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(async () => {
    await fetchAmpluas(search.value)
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
  const found = ampluas.value.find(a => a.id === val)
  if (found) {
    search.value = found.name
  } else if (typeof val === 'string' || typeof val === 'number') {
    search.value = String(val)
  } else if (val && val.name) {
    search.value = val.name
  }
})

onMounted(async () => {
  await fetchAmpluas('')
  if (props.modelValue) {
    const found = ampluas.value.find(a => a.id === props.modelValue)
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
.amplua-select {
  width: 100%;
}
.amplua-input {
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