<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-md w-full p-6">
      <h3 class="text-lg font-semibold mb-4">Изменить амплуа</h3>
      <form @submit.prevent="saveAmplua">
        <div class="mb-4">
          <AmpluaSelect
            v-model="selectedAmpluaId"
            label="Амплуа"
            :required="true"
          />
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button type="button" @click="$emit('close')" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Отмена</button>
          <button type="submit" :disabled="!selectedAmpluaId || loading" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {{ loading ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AmpluaSelect from '@/components/people/AmpluaSelect.vue'
import { useApi } from '~/composables/useApi'

const props = defineProps({
  person: {
    type: Object,
    required: true
  },
  currentAmpluaId: {
    type: [String, Number],
    default: ''
  }
})
const emit = defineEmits(['close', 'amplua-updated'])

const { apiRequest } = useApi()

// Удаляю ampluas и загрузку ampluas, оставляю только selectedAmpluaId
const selectedAmpluaId = ref(props.currentAmpluaId || '')
const loading = ref(false)

// Удаляю onMounted(loadAmpluas)

const saveAmplua = async () => {
  if (!selectedAmpluaId.value) return
  loading.value = true
  // Находим активное membership, если есть
  let membershipId = null
  if (props.person.active_amplua_memberships && props.person.active_amplua_memberships.length) {
    membershipId = props.person.active_amplua_memberships[0].id
  }
  if (membershipId) {
    // Обновляем существующее membership
    await apiRequest(`/people/${props.person.id}/amplua-memberships/${membershipId}`, {
      method: 'PUT',
      body: { amplua_id: selectedAmpluaId.value }
    })
  } else {
    // Создаем новое membership
    await apiRequest(`/people/${props.person.id}/amplua-memberships`, {
      method: 'POST',
      body: { amplua_id: selectedAmpluaId.value }
    })
  }
  loading.value = false
  emit('amplua-updated')
  emit('close')
}
</script> 