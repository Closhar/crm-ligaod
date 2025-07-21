<template>
  <div class="p-6">
    <!-- Уведомления -->
    <Notification 
      :message="notificationMessage" 
      :type="notificationType" 
      @close="notificationMessage = ''"
    />
    
    <!-- Модальное окно подтверждения -->
    <ConfirmModal
      :is-open="showConfirmModal"
      :title="confirmModalTitle"
      :message="confirmModalMessage"
      :type="confirmModalType"
      :confirm-text="confirmModalConfirmText"
      @confirm="handleConfirmAction"
      @cancel="showConfirmModal = false"
    />
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Типы турниров</h1>
      <p class="text-gray-600 mt-2">Управление типами турниров и их очками для расчета рейтинга</p>
    </div>

    <!-- Кнопка добавления -->
    <div class="mb-6">
      <button
        @click="showModal = true"
        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
      >
        <Icon icon="heroicons:plus" class="w-5 h-5" />
        Добавить тип турнира
      </button>
    </div>

    <!-- Таблица типов турниров -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Название
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Код
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Цвет
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Множитель команд
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Параметры
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Очки за места
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="tournamentType in tournamentTypes" :key="tournamentType.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ tournamentType.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <code class="bg-gray-100 px-2 py-1 rounded text-xs">{{ tournamentType.code }}</code>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    tournamentType.color_class
                  ]"
                >
                  {{ tournamentType.name }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    tournamentType.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ tournamentType.is_active ? 'Активен' : 'Неактивен' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    tournamentType.ignore_teams_multiplier 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-blue-100 text-blue-800'
                  ]"
                >
                  {{ tournamentType.ignore_teams_multiplier ? 'Не учитывается' : 'Учитывается' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>
                  <div>Участие: {{ tournamentType.participation_points }}</div>
                  <div>Бонус: {{ tournamentType.promotion_bonus }}</div>
                  <div v-if="tournamentType.coefficient !== undefined && tournamentType.coefficient !== null">
                    фарм: {{ tournamentType.coefficient }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="space-y-1">
                  <div v-for="point in tournamentType.points" :key="point.id" class="text-xs">
                    <span class="font-medium">{{ point.position }} место:</span> {{ point.points }} очков
                    <span v-if="point.min_teams || point.max_teams" class="text-gray-400">
                      ({{ point.min_teams || '∞' }}-{{ point.max_teams || '∞' }} команд)
                    </span>
                  </div>
                  <div v-if="tournamentType.max_participants_per_region > 0">
                    <span class="font-bold text-red-600 block mt-1">
                      мах: {{ tournamentType.max_participants_per_region }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center gap-2">
                  <button
                    @click="editTournamentType(tournamentType)"
                    class="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition-colors duration-200"
                    title="Редактировать"
                  >
                    <Icon icon="heroicons:pencil-square" class="w-5 h-5" />
                  </button>
                  <button
                    @click="deleteTournamentType(tournamentType.id)"
                    class="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors duration-200"
                    title="Удалить"
                  >
                    <Icon icon="heroicons:trash" class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Модальное окно добавления/редактирования -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
      <div class="relative mx-auto max-w-4xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
        <!-- Заголовок модального окна -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            {{ editingTournamentType ? 'Редактировать тип турнира' : 'Добавить тип турнира' }}
          </h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <Icon icon="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>
        
        <!-- Содержимое модального окна с прокруткой -->
        <div class="flex-1 overflow-y-auto p-6">
          
          <!-- Сообщения об ошибках валидации -->
          <div v-if="Object.keys(errors).length > 0" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div class="flex">
              <div class="flex-shrink-0">
                <Icon icon="heroicons:exclamation-triangle" class="h-5 w-5 text-red-400" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Ошибки валидации:</h3>
                <div class="mt-2 text-sm text-red-700">
                  <ul class="list-disc pl-5 space-y-1">
                    <li v-for="(fieldErrors, field) in errors" :key="field">
                      <span v-if="field !== 'general'" class="font-medium">{{ getFieldLabel(field) }}:</span>
                      <span v-for="error in fieldErrors" :key="error">{{ error }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <form @submit.prevent="saveTournamentType">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Название *</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    errors.name 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  ]"
                  placeholder="Чемпионат"
                />
                <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name[0] }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Код *</label>
                <input
                  v-model="form.code"
                  type="text"
                  required
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    errors.code 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  ]"
                  placeholder="championship"
                />
                <p v-if="errors.code" class="mt-1 text-sm text-red-600">{{ errors.code[0] }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">CSS класс для цвета</label>
                <input
                  v-model="form.color_class"
                  type="text"
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    errors.color_class 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  ]"
                  placeholder="bg-blue-100 text-blue-800"
                />
                <p v-if="errors.color_class" class="mt-1 text-sm text-red-600">{{ errors.color_class[0] }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Порядок сортировки</label>
                <input
                  v-model.number="form.sort_order"
                  type="number"
                  min="0"
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    errors.sort_order 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  ]"
                  placeholder="1"
                />
                <p v-if="errors.sort_order" class="mt-1 text-sm text-red-600">{{ errors.sort_order[0] }}</p>
              </div>

              <div class="flex items-center mt-2">
                <input
                  id="ignore_teams_multiplier"
                  v-model="form.ignore_teams_multiplier"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <label for="ignore_teams_multiplier" class="ml-2 text-sm text-gray-700 cursor-pointer">
                  Не учитывать множитель числа команд (очки не зависят от количества команд)
                </label>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Коэффициент фарм-клуба</label>
                <input
                  v-model.number="form.coefficient"
                  type="number"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    errors.coefficient 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  ]"
                  placeholder="1.0"
                />
                <p v-if="errors.coefficient" class="mt-1 text-sm text-red-600">{{ errors.coefficient[0] }}</p>
                <p class="mt-1 text-sm text-gray-500">Коэффициент для фарм-клубов (0.1 - 2.0). По умолчанию 1.0</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Очки за участие</label>
                <input
                  v-model.number="form.participation_points"
                  type="number"
                  min="0"
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    errors.participation_points 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  ]"
                  placeholder="0"
                />
                <p v-if="errors.participation_points" class="mt-1 text-sm text-red-600">{{ errors.participation_points[0] }}</p>
                <p class="mt-1 text-sm text-gray-500">Очки за места ниже максимального указанного места в турнире</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Бонус за повышение</label>
                <input
                  v-model.number="form.promotion_bonus"
                  type="number"
                  min="0"
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    errors.promotion_bonus 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  ]"
                  placeholder="0"
                />
                <p v-if="errors.promotion_bonus" class="mt-1 text-sm text-red-600">{{ errors.promotion_bonus[0] }}</p>
                <p class="mt-1 text-sm text-gray-500">Дополнительные очки за выход в высшую лигу (по умолчанию 0)</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Макс. участников из одного региона</label>
                <input
                  v-model.number="form.max_participants_per_region"
                  type="number"
                  min="0"
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    errors.max_participants_per_region 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  ]"
                  placeholder="0"
                />
                <p v-if="errors.max_participants_per_region" class="mt-1 text-sm text-red-600">{{ errors.max_participants_per_region[0] }}</p>
                <p class="mt-1 text-sm text-gray-500">0 — без ограничений</p>
              </div>
            </div>

            <div class="mb-4">
              <label class="flex items-center">
                <input
                  v-model="form.is_active"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-700">Активен</span>
              </label>
            </div>

            <!-- Очки за места -->
            <div class="mb-6">
              <h4 class="text-md font-medium text-gray-900 mb-3">Очки за места</h4>
              
              <div class="space-y-3">
                <div v-for="(point, index) in form.points" :key="index" class="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border border-gray-200 rounded-md">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Место *</label>
                    <input
                      v-model.number="point.position"
                      type="number"
                      min="1"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Очки *</label>
                    <input
                      v-model.number="point.points"
                      type="number"
                      min="0"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Мин. команд</label>
                    <input
                      v-model.number="point.min_teams"
                      type="number"
                      min="1"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="8"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Макс. команд</label>
                    <input
                      v-model.number="point.max_teams"
                      type="number"
                      min="1"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="16"
                    />
                  </div>
                  
                  <div class="flex items-end">
                    <button
                      @click="removePoint(index)"
                      type="button"
                      class="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                @click="addPoint"
                type="button"
                class="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Добавить место
              </button>
            </div>


          </form>
        </div>
        
        <!-- Футер модального окна -->
        <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
          >
            Отмена
          </button>
          <button
            @click="saveTournamentType"
            class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 transition-colors duration-200"
          >
            {{ editingTournamentType ? 'Сохранить' : 'Добавить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { onMounted, ref } from 'vue'

const { apiRequest } = useApi()

// Состояние
const tournamentTypes = ref([])
const showModal = ref(false)
const editingTournamentType = ref(null)
const form = ref({
  name: '',
  code: '',
  color_class: '',
  is_active: true,
  sort_order: 1,
  ignore_teams_multiplier: false,
  coefficient: 1.0,
  participation_points: 0,
  promotion_bonus: 0,
  max_participants_per_region: 0,
  points: []
})

// Состояние для ошибок
const errors = ref({})
const successMessage = ref('')

// Состояние для уведомлений
const notificationMessage = ref('')
const notificationType = ref('success')

// Состояние для модального окна подтверждения
const showConfirmModal = ref(false)
const confirmModalTitle = ref('')
const confirmModalMessage = ref('')
const confirmModalType = ref('danger')
const confirmModalConfirmText = ref('Подтвердить')
const pendingDeleteId = ref(null)

// Загрузка данных
const loadTournamentTypes = async () => {
  try {
    const response = await apiRequest('/v1/tournament-types')
    tournamentTypes.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки типов турниров:', error)
    showNotification('Ошибка при загрузке типов турниров', 'error')
  }
}

// Действия
const editTournamentType = (tournamentType) => {
  editingTournamentType.value = tournamentType
  form.value = {
    name: tournamentType.name,
    code: tournamentType.code,
    color_class: tournamentType.color_class,
    is_active: tournamentType.is_active,
    sort_order: tournamentType.sort_order,
    ignore_teams_multiplier: tournamentType.ignore_teams_multiplier ?? false,
    coefficient: tournamentType.coefficient ?? 1.0,
    participation_points: tournamentType.participation_points ?? 0,
    promotion_bonus: tournamentType.promotion_bonus ?? 0,
    max_participants_per_region: Number(tournamentType.max_participants_per_region) || 0,
    points: tournamentType.points ? JSON.parse(JSON.stringify(tournamentType.points)) : []
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingTournamentType.value = null
  errors.value = {}
  successMessage.value = ''
  notificationMessage.value = ''
  form.value = {
    name: '',
    code: '',
    color_class: '',
    is_active: true,
    sort_order: 1,
    ignore_teams_multiplier: false,
    coefficient: 1.0,
    participation_points: 0,
    promotion_bonus: 0,
    max_participants_per_region: 0,
    points: []
  }
}

const addPoint = () => {
  form.value.points.push({
    position: 1,
    points: 0,
    min_teams: null,
    max_teams: null,
    description: ''
  })
}

const removePoint = (index) => {
  form.value.points.splice(index, 1)
}

const saveTournamentType = async () => {
  try {
    errors.value = {}
    successMessage.value = ''
    // Явно приводим к числу, если поле пустое — 0
    form.value.max_participants_per_region = Number(form.value.max_participants_per_region) || 0;
    const payload = { ...form.value }
    
    let response
    if (editingTournamentType.value) {
      response = await apiRequest(`/v1/tournament-types/${editingTournamentType.value.id}`, {
        method: 'PUT',
        body: payload
      })
    } else {
      response = await apiRequest('/v1/tournament-types', {
        method: 'POST',
        body: payload
      })
    }
    
    if (response.error) {
      if (response.data?.errors) {
        errors.value = response.data.errors
        showNotification('Ошибки валидации', 'error')
      } else if (response.data?.message) {
        errors.value = { general: [response.data.message] }
        showNotification(response.data.message, 'error')
      } else {
        errors.value = { general: ['Произошла ошибка при сохранении'] }
        showNotification('Произошла ошибка при сохранении', 'error')
      }
      return
    }
    
    // Успешный ответ
    if (editingTournamentType.value) {
      showNotification('Тип турнира успешно обновлен', 'success')
    } else {
      showNotification('Тип турнира успешно добавлен', 'success')
    }
    
    await loadTournamentTypes()
    closeModal()
  } catch (error) {
    console.error('Ошибка сохранения типа турнира:', error)
    errors.value = { general: ['Произошла ошибка при сохранении'] }
    showNotification('Произошла ошибка при сохранении', 'error')
  }
}

const deleteTournamentType = (id) => {
  pendingDeleteId.value = id
  confirmModalTitle.value = 'Удаление типа турнира'
  confirmModalMessage.value = 'Вы уверены, что хотите удалить этот тип турнира? Это действие нельзя отменить.'
  confirmModalType.value = 'danger'
  confirmModalConfirmText.value = 'Удалить'
  showConfirmModal.value = true
}

const handleConfirmAction = async () => {
  if (pendingDeleteId.value) {
    try {
      await apiRequest(`/v1/tournament-types/${pendingDeleteId.value}`, {
        method: 'DELETE'
      })
      await loadTournamentTypes()
      showNotification('Тип турнира успешно удален', 'success')
    } catch (error) {
      console.error('Ошибка удаления типа турнира:', error)
      showNotification('Ошибка при удалении типа турнира', 'error')
    }
    pendingDeleteId.value = null
  }
  showConfirmModal.value = false
}

const showNotification = (message, type = 'success') => {
  notificationMessage.value = message
  notificationType.value = type
}

// Утилиты
const getFieldLabel = (field) => {
  const labels = {
    name: 'Название',
    code: 'Код',
    color_class: 'CSS класс',
    is_active: 'Статус',
    sort_order: 'Порядок сортировки',
    points: 'Очки за места'
  }
  return labels[field] || field
}

// Инициализация
onMounted(() => {
  loadTournamentTypes()
})
</script> 