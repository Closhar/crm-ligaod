<template>
  <div class="roles-management">
    <!-- Заголовок страницы -->
    <div class="page-header">
      <h1 class="text-2xl font-bold text-gray-900">Управление ролями</h1>
      <button
        @click="showCreateModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Добавить роль
      </button>
    </div>

    <!-- Статистика -->
    <div class="stats-grid mb-6">
      <div class="stat-card">
        <div class="stat-number">{{ statistics.total || 0 }}</div>
        <div class="stat-label">Всего ролей</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ statistics.sportsman || 0 }}</div>
        <div class="stat-label">Амплуа</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ statistics.non_sportsman || 0 }}</div>
        <div class="stat-label">Должности</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ statistics.active || 0 }}</div>
        <div class="stat-label">Активные</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ statistics.with_people || 0 }}</div>
        <div class="stat-label">С персонами</div>
      </div>
    </div>

    <!-- Фильтры -->
    <div class="filters-section mb-6">
      <div class="filters-grid">
        <div class="filter-group">
          <label class="filter-label">Поиск</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Поиск по названию..."
            class="filter-input"
            @input="debouncedSearch"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">Тип роли</label>
          <select v-model="filters.type" class="filter-select" @change="loadRoles">
            <option value="">Все типы</option>
            <option value="sportsman">Амплуа</option>
            <option value="non_sportsman">Должность</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Статус</label>
          <select v-model="filters.is_active" class="filter-select" @change="loadRoles">
            <option value="">Все</option>
            <option :value="true">Активные</option>
            <option :value="false">Неактивные</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Таблица ролей -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Тип</th>
            <th>Описание</th>
            <th>Статус</th>
            <th>Персон</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="role in roles" :key="role.id" class="table-row">
            <td>
              <div class="role-name">{{ role.name }}</div>
            </td>
            <td>
              <span :class="role.type === 'sportsman' ? 'badge-success' : 'badge-warning'">
                {{ role.type === 'sportsman' ? 'Амплуа' : 'Должность' }}
              </span>
            </td>
            <td>
              <div class="role-description">
                {{ role.description || 'Описание отсутствует' }}
              </div>
            </td>
            <td>
              <span :class="role.is_active ? 'badge-success' : 'badge-danger'">
                {{ role.is_active ? 'Активна' : 'Неактивна' }}
              </span>
            </td>
            <td>
              <div class="people-count">
                {{ role.active_memberships_count || 0 }} персон
              </div>
            </td>
            <td>
              <div class="actions">
                <button
                  @click="editRole(role)"
                  class="action-btn action-edit"
                  title="Редактировать"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button
                  @click="deleteRole(role)"
                  class="action-btn action-delete"
                  title="Удалить"
                  :disabled="role.active_memberships_count > 0"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно создания/редактирования роли -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ showCreateModal ? 'Создать роль' : 'Редактировать роль' }}</h3>
          <button @click="closeModal" class="modal-close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="saveRole" class="modal-body">
          <div class="form-group">
            <label class="form-label">Название *</label>
            <input
              v-model="editingRole.name"
              type="text"
              class="form-input"
              placeholder="Введите название роли"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Тип *</label>
            <select v-model="editingRole.type" class="form-select" required>
              <option value="sportsman">Амплуа (для спортсменов)</option>
              <option value="non_sportsman">Должность (для не спортсменов)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Описание</label>
            <textarea
              v-model="editingRole.description"
              class="form-textarea"
              placeholder="Введите описание роли"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-checkbox">
              <input
                v-model="editingRole.is_active"
                type="checkbox"
                class="form-checkbox-input"
              />
              <span class="form-checkbox-text">Активна</span>
            </label>
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn-secondary">
              Отмена
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'Сохранение...' : (showCreateModal ? 'Создать' : 'Сохранить') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'

// Конфигурация API
const config = useRuntimeConfig()
const appConfig = useAppConfig()
const api = config.public.API_URL || appConfig.apiUrl || 'http://127.0.0.1:8000'

// Состояние
const roles = ref([])
const statistics = ref({})
const loading = ref(false)
const saving = ref(false)

// Модальные окна
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingRole = ref({
  name: '',
  type: 'sportsman',
  description: '',
  is_active: true
})

// Фильтры
const filters = reactive({
  search: '',
  type: '',
  is_active: '',
  page: 1,
  per_page: 15
})

// Функция для API запросов
const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('auth_token')
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return await $fetch(`${api}${url}`, {
    ...options,
    headers
  })
}

// Загрузка данных
const loadRoles = async () => {
  loading.value = true
  try {
    const params = { ...filters }
    const response = await apiRequest('/roles', { params })
    
    if (response.success && response.data) {
      roles.value = response.data
    } else {
      console.error('Неверная структура ответа API:', response)
      roles.value = []
    }
  } catch (error) {
    console.error('Ошибка загрузки ролей:', error)
    roles.value = []
  } finally {
    loading.value = false
  }
}

const loadStatistics = async () => {
  try {
    const response = await apiRequest('/roles/statistics')
    
    if (response.success && response.data) {
      statistics.value = response.data
    } else {
      console.error('Неверная структура ответа статистики:', response)
      statistics.value = {}
    }
  } catch (error) {
    console.error('Ошибка загрузки статистики:', error)
    statistics.value = {}
  }
}

// Действия
const editRole = (role) => {
  editingRole.value = { ...role }
  showEditModal.value = true
}

const deleteRole = async (role) => {
  if (role.active_memberships_count > 0) {
    alert('Нельзя удалить роль, к которой привязаны активные персоны')
    return
  }

  if (!confirm(`Вы уверены, что хотите удалить роль "${role.name}"?`)) {
    return
  }

  try {
    const response = await apiRequest(`/roles/${role.id}`, { method: 'DELETE' })
    
    if (response.success) {
      await loadRoles()
      await loadStatistics()
    } else {
      console.error('Ошибка удаления роли:', response.message)
    }
  } catch (error) {
    console.error('Ошибка удаления роли:', error)
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingRole.value = {
    name: '',
    type: 'sportsman',
    description: '',
    is_active: true
  }
}

const saveRole = async () => {
  saving.value = true
  try {
    const url = showCreateModal.value ? '/roles' : `/roles/${editingRole.value.id}`
    const method = showCreateModal.value ? 'POST' : 'PUT'
    
    const response = await apiRequest(url, {
      method,
      body: editingRole.value
    })
    
    if (response.success) {
      closeModal()
      await loadRoles()
      await loadStatistics()
    } else {
      console.error('Ошибка сохранения роли:', response.message)
    }
  } catch (error) {
    console.error('Ошибка сохранения роли:', error)
  } finally {
    saving.value = false
  }
}

// Поиск с задержкой
let searchTimeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.page = 1
    loadRoles()
  }, 300)
}

// Инициализация
onMounted(async () => {
  await Promise.all([
    loadRoles(),
    loadStatistics()
  ])
})
</script>

<style scoped>
.roles-management {
  @apply p-6;
}

.page-header {
  @apply flex justify-between items-center mb-6;
}

.stats-grid {
  @apply grid grid-cols-1 md:grid-cols-5 gap-4;
}

.stat-card {
  @apply bg-white rounded-lg shadow p-4 text-center;
}

.stat-number {
  @apply text-2xl font-bold text-blue-600;
}

.stat-label {
  @apply text-sm text-gray-600 mt-1;
}

.filters-section {
  @apply bg-white rounded-lg shadow p-4;
}

.filters-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4;
}

.filter-group {
  @apply flex flex-col;
}

.filter-label {
  @apply text-sm font-medium text-gray-700 mb-1;
}

.filter-input,
.filter-select {
  @apply border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.table-container {
  @apply bg-white rounded-lg shadow overflow-hidden;
}

.data-table {
  @apply w-full;
}

.data-table th {
  @apply bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}

.table-row {
  @apply border-t border-gray-200 hover:bg-gray-50;
}

.table-row td {
  @apply px-6 py-4 whitespace-nowrap;
}

.role-name {
  @apply text-sm font-medium text-gray-900;
}

.role-description {
  @apply text-sm text-gray-500 max-w-xs truncate;
}

.badge-success {
  @apply inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800;
}

.badge-warning {
  @apply inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800;
}

.badge-danger {
  @apply inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800;
}

.people-count {
  @apply text-sm text-gray-600;
}

.actions {
  @apply flex gap-2;
}

.action-btn {
  @apply p-1 rounded hover:bg-gray-100 transition-colors;
}

.action-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.action-edit {
  @apply text-green-600 hover:text-green-800;
}

.action-delete {
  @apply text-red-600 hover:text-red-800;
}

/* Модальное окно */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-md w-full mx-4;
}

.modal-header {
  @apply flex justify-between items-center p-6 border-b border-gray-200;
}

.modal-title {
  @apply text-lg font-medium text-gray-900;
}

.modal-close {
  @apply text-gray-400 hover:text-gray-600;
}

.modal-body {
  @apply p-6;
}

.form-group {
  @apply mb-4;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.form-input,
.form-select,
.form-textarea {
  @apply w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.form-textarea {
  @apply resize-y;
}

.form-checkbox {
  @apply flex items-center;
}

.form-checkbox-input {
  @apply h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded;
}

.form-checkbox-text {
  @apply ml-2 text-sm text-gray-700;
}

.modal-footer {
  @apply flex justify-end gap-3 pt-4 border-t border-gray-200;
}

.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50;
}

.btn-secondary {
  @apply bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md;
}
</style> 