<template>
  <div class="modal-overlay" @mousedown.self="$emit('close')">
    <div class="modal-content" @mousedown.stop>
      <div class="modal-header">
        <h2 class="modal-title">Редактирование амплуа - {{ person?.last_name }} {{ person?.first_name }} {{ person?.middle_name || '' }}</h2>
        <button @click="$emit('close')" class="modal-close">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Форма редактирования -->
        <div v-if="editingMembership" class="mb-6">
          <form @submit.prevent="saveMembership" class="space-y-4">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Амплуа</label>
                <AmpluaSelect v-model="editingMembership.amplua_id" placeholder="Выберите или введите амплуа" required />
              </div>
              
              <div class="form-group">
                <label class="form-label">Дата начала</label>
                <input v-model="editingMembership.started_at" type="date" class="form-input" />
              </div>
              
              <div class="form-group">
                <label class="form-label">Дата окончания</label>
                <input v-model="editingMembership.ended_at" type="date" class="form-input" />
              </div>
            </div>
            
            <div class="flex justify-end gap-3">
              <button type="button" @click="cancelEdit" class="btn-secondary">Отмена</button>
              <button type="submit" class="btn-primary" :disabled="saving">
                {{ saving ? 'Сохранение...' : 'Сохранить' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Список амплуа -->
        <div v-else class="mb-6">
          <h3 class="text-lg font-medium mb-4">Текущие амплуа</h3>
          <div v-if="memberships.length > 0" class="space-y-3">
            <div v-for="membership in memberships" :key="membership.id" class="membership-item">
              <div class="flex justify-between items-center">
                <div>
                  <div class="font-medium">{{ membership.amplua?.name }}</div>
                  <div class="text-sm text-gray-500">
                    {{ membership.started_at ? formatDate(membership.started_at) : 'Дата начала не указана' }}
                    <span v-if="membership.ended_at"> - {{ formatDate(membership.ended_at) }}</span>
                    <span v-else> (активно)</span>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button @click="editMembership(membership)" class="btn-secondary-small">Редактировать</button>
                  <button @click="deleteMembership(membership)" class="btn-danger-small">Удалить</button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500">Амплуа не указаны</div>
        </div>

        <!-- Форма добавления -->
        <div v-if="!editingMembership" class="border-t pt-6">
          <form @submit.prevent="addMembership" class="space-y-4">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Амплуа</label>
                <AmpluaSelect v-model="newMembership.amplua_id" placeholder="Выберите или введите амплуа" required />
              </div>
              
              <div class="form-group">
                <label class="form-label">Дата начала</label>
                <input v-model="newMembership.started_at" type="date" class="form-input" />
              </div>
              
              <div class="form-group">
                <label class="form-label">Дата окончания</label>
                <input v-model="newMembership.ended_at" type="date" class="form-input" />
              </div>
            </div>
            
            <div class="flex justify-end gap-3">
              <button type="button" @click="$emit('close')" class="btn-secondary">Отмена</button>
              <button type="submit" class="btn-primary" :disabled="saving">
                {{ saving ? 'Сохранение...' : 'Добавить' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Модалка подтверждения -->
    <div v-if="confirmationModal.show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <div class="flex items-center mb-4">
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-medium text-gray-900">{{ confirmationModal.title }}</h3>
          </div>
        </div>
        <div class="mb-6">
          <p class="text-sm text-gray-600">{{ confirmationModal.message }}</p>
        </div>
        <div class="flex justify-end space-x-3">
          <button
            @click="closeConfirmationModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Отмена
          </button>
          <button
            @click="confirmAction"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import AmpluaSelect from '~/components/people/AmpluaSelect.vue'
import { useApi } from '~/composables/useApi'

const props = defineProps({
  person: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'saved', 'deleted'])

const { apiRequest } = useApi()

const memberships = ref([])
const saving = ref(false)
const editingMembership = ref(null)

// Модалка подтверждения
const confirmationModal = ref({
  show: false,
  title: '',
  message: '',
  onConfirm: null
})

const newMembership = ref({
  amplua_id: '',
  started_at: '',
  ended_at: '',
  notes: ''
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU')
  } catch (error) {
    return dateString
  }
}

const loadMemberships = async () => {
  try {
    const response = await apiRequest(`/people/${props.person.id}/amplua-memberships`)
    if (response.success) {
      memberships.value = response.data
    }
  } catch (error) {
    console.error('Ошибка загрузки амплуа:', error)
  }
}

const addMembership = async () => {
  if (!newMembership.value.amplua_id) return
  
  saving.value = true
  try {
    const response = await apiRequest(`/people/${props.person.id}/amplua-memberships`, {
      method: 'POST',
      body: {
        amplua_id: newMembership.value.amplua_id,
        started_at: newMembership.value.started_at || null,
        ended_at: newMembership.value.ended_at || null,
        notes: newMembership.value.notes || null
      }
    })
    
    if (response.success) {
      await loadMemberships()
      newMembership.value = {
        amplua_id: '',
        started_at: '',
        ended_at: ''
      }
      emit('saved', { action: 'added' })
      // Теперь родитель решает, закрывать ли модалку
    }
  } catch (error) {
    console.error('Ошибка добавления амплуа:', error)
  } finally {
    saving.value = false
  }
}

const deleteMembership = async (membership) => {
  // Показываем модалку подтверждения
  confirmationModal.value = {
    show: true,
    title: 'Подтверждение удаления',
    message: `Вы уверены, что хотите удалить амплуа "${membership.amplua?.name}"?`,
    onConfirm: async () => {
      try {
        const response = await apiRequest(`/people/${props.person.id}/amplua-memberships/${membership.id}`, {
          method: 'DELETE'
        })
        
        if (response.success) {
          await loadMemberships() // обновляем список внутри модалки
          emit('deleted') // родителю отдельное событие для обновления
        }
      } catch (error) {
        console.error('Ошибка удаления амплуа:', error)
      }
    }
  }
}

// Функции для работы с модалкой подтверждения
const closeConfirmationModal = () => {
  confirmationModal.value.show = false
  confirmationModal.value.onConfirm = null
}

const confirmAction = async () => {
  if (confirmationModal.value.onConfirm) {
    await confirmationModal.value.onConfirm()
  }
  closeConfirmationModal()
}

const editMembership = (membership) => {
  editingMembership.value = {
    id: membership.id,
    amplua_id: membership.amplua_id,
    started_at: membership.started_at ? formatDateForInput(membership.started_at) : '',
    ended_at: membership.ended_at ? formatDateForInput(membership.ended_at) : '',
    notes: membership.notes || ''
  }
}

const cancelEdit = () => {
  editingMembership.value = null
}

const saveMembership = async () => {
  if (!editingMembership.value.amplua_id) return
  
  const requestData = {
    amplua_id: editingMembership.value.amplua_id,
    started_at: editingMembership.value.started_at || '',
    ended_at: editingMembership.value.ended_at || '',
    notes: editingMembership.value.notes || ''
  }
  
  
  
  saving.value = true
  try {
    const response = await apiRequest(`/people/${props.person.id}/amplua-memberships/${editingMembership.value.id}`, {
      method: 'PUT',
      body: requestData
    })
    
    if (response.success) {
      await loadMemberships()
      editingMembership.value = null
      emit('saved', { action: 'updated' })
      // Теперь родитель решает, закрывать ли модалку
    }
  } catch (error) {
    console.error('Ошибка обновления амплуа:', error)
  } finally {
    saving.value = false
  }
}

const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  } catch (error) {
    return dateString
  }
}

onMounted(async () => {
  await loadMemberships()
})
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto;
}

.modal-header {
  @apply flex justify-between items-center p-6 border-b border-gray-200;
}

.modal-title {
  @apply text-xl text-gray-900;
}

.modal-close {
  @apply text-gray-400 hover:text-gray-600 transition-colors;
}

.modal-body {
  @apply p-6;
}

.membership-item {
  @apply border border-gray-200 rounded-lg p-4 bg-gray-50;
}

.form-row {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4;
}

.form-group {
  @apply flex flex-col;
}

.form-label {
  @apply text-sm font-medium text-gray-700 mb-1;
}

.form-input,
.form-select {
  @apply border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50;
}

.btn-secondary {
  @apply bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md;
}

.btn-secondary-small {
  @apply bg-gray-300 hover:bg-gray-400 text-gray-700 px-2 py-1 rounded text-sm;
}

.btn-danger-small {
  @apply bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm;
}
</style> 