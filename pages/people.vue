<template>
  <div class="people-management">
    <!-- Заголовок страницы -->
    <div class="page-header">
      <h1 class="text-2xl font-bold text-gray-900">Управление персонами</h1>
      <!-- Кнопки перенесены ниже -->
    </div>

    <!-- Статистика -->
    <div class="stats-grid mb-6">
      <div class="stat-card">
        <div class="stat-number">{{ statistics.total || 0 }}</div>
        <div class="stat-label">Всего персон</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ statistics.sportsmen || 0 }}</div>
        <div class="stat-label">Спортсмены</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ statistics.non_sportsmen || 0 }}</div>
        <div class="stat-label">Не спортсмены</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ statistics.with_active_role || 0 }}</div>
        <div class="stat-label">С активными ролями</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ statistics.with_clubs || 0 }}</div>
        <div class="stat-label">В командах</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ statistics.with_positions || 0 }}</div>
        <div class="stat-label">С должностями</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ statistics.with_ampluas || 0 }}</div>
        <div class="stat-label">С амплуа</div>
      </div>
    </div>
    <!-- Кнопки и экспорт/импорт в одной строке -->
    <div class="flex items-center justify-between gap-2 mb-6">
      <div class="flex gap-2">
        <button
          @click="showCreateModal = true"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Icon icon="ri:user-add-fill" class="w-5 h-5" />
          Добавить персону
        </button>
        <button
          @click="refreshPeopleTable"
          :disabled="loading"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          title="Обновить таблицу персон"
        >
          <Icon icon="ri:refresh-line" class="w-5 h-5" />
          Обновить
        </button>
      </div>
      <PeopleImportExport
        :players="people"
        @imported="refreshPeopleTable"
      />
    </div>

    <!-- Фильтры -->
    <div class="filters-section mb-6">
      <div class="filters-grid">
        <div class="filter-group">
          <label class="filter-label">Поиск</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Поиск по имени..."
            class="filter-input"
            @input="debouncedSearch"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">Тип персоны</label>
          <select v-model="filters.person_type" class="filter-select" @change="loadPeople">
            <option value="">Все типы</option>
            <option value="sportsman">Спортсмены</option>
            <option value="non_sportsman">Не спортсмены</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Должность</label>
          <KirhSelectField
            v-model="filters.position_id"
            api-url="/api/people/positions"
            :api-params="{ type: 'async', limit: 10 }"
            key-field="id"
            label-field="name"
            :enable-search="true"
            :limit="10"
            placeholder="Выберите должность"
            :emptyable="true"
            :empty-option="{ value: '', label: 'Все должности' }"
            sel-class="text-gray-900"
            @update:model-value="loadPeople"
          />

        </div>
        <div class="filter-group">
          <label class="filter-label">Амплуа</label>
          <KirhSelectField
            v-model="filters.amplua_id"
            api-url="/api/people/ampluas"
            :api-params="{ type: 'async', limit: 10 }"
            key-field="id"
            label-field="name"
            :enable-search="true"
            :limit="10"
            placeholder="Выберите амплуа"
            :emptyable="true"
            :empty-option="{ value: '', label: 'Все амплуа' }"
            sel-class="text-gray-900"
            @update:model-value="loadPeople"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">Команда</label>
          <KirhSelectField
            v-model="filters.club_id"
            api-url="/api/people/clubs"
            :api-params="{ type: 'async', limit: 10 }"
            key-field="id"
            label-field="name"
            image-field="logo_url"
            :enable-search="true"
            :limit="10"
            placeholder="Выберите команду"
            :emptyable="true"
            :empty-option="{ value: '', label: 'Все команды' }"
            sel-class="text-gray-900"
            @update:model-value="loadPeople"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">Вид спорта</label>
          <KirhSelectField
            v-model="filters.sport_id"
            api-url="/api/people/sports"
            :api-params="{ type: 'async', limit: 10 }"
            key-field="id"
            label-field="name"
            icon-field="icon_name"
            :enable-search="true"
            :limit="10"
            placeholder="Выберите вид спорта"
            :emptyable="true"
            :empty-option="{ value: '', label: 'Все виды спорта' }"
            sel-class="text-gray-900"
            @update:model-value="loadPeople"
          />
        </div>
      </div>
    </div>

    <!-- Таблица персон -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Фото</th>
            <th>Имя</th>
            <th>Должности</th>
            <th>Амплуа</th>
            <th>Команды</th>
            <th>Виды спорта</th>
            <th>О себе</th>
            <th>Активен</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="person in people" :key="person.id" class="table-row">
            <td>
              <span class="person-id">{{ person.id }}</span>
            </td>
            <td>
              <div class="person-photo clickable-field" @click="editImages(person)" @click.stop>
                <img
                  v-if="person.main_image && person.main_image[0]"
                  :src="getImageUrl(person.main_image[0])"
                  :alt="person.full_name"
                  class="w-10 h-10 rounded-full object-cover"
                />
                <div v-else class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </td>
            <td>
              <div class="person-info">
                <div class="person-name">{{ person.last_name }} {{ person.first_name }} {{ person.middle_name || '' }}</div>
                <div class="person-details">{{ person.birth_date ? formatDate(person.birth_date) : 'Не указана' }}</div>
              </div>
            </td>
            <td>
              <div class="person-positions clickable-field" @click="editPositions(person)">
                <div v-if="person.active_position_memberships && person.active_position_memberships.length > 0" class="positions-list">
                  <span 
                    v-for="membership in person.active_position_memberships" 
                    :key="membership.id"
                    :class="['badge-warning', { 'badge-error': !membership.position?.name }]"
                  >
                    {{ membership.position?.name || `Должность ID: ${membership.position_id} (не найдена)` }}
                  </span>
                </div>
                <span v-else class="text-gray-400">Должности не указаны</span>
              </div>
            </td>
            <td>
              <div class="person-ampluas clickable-field" @click="editAmpluas(person)">
                <div v-if="person.active_amplua_memberships && person.active_amplua_memberships.length > 0" class="ampluas-list">
                  <span 
                    v-for="membership in person.active_amplua_memberships" 
                    :key="membership.id"
                    :class="['badge-success', { 'badge-error': !membership.amplua?.name }]"
                  >
                    {{ membership.amplua?.name || `Амплуа ID: ${membership.amplua_id} (не найдено)` }}
                  </span>
                </div>
                <span v-else class="text-gray-400">Амплуа не указаны</span>
              </div>
            </td>
            <td>
              <div class="clubs-list clickable-field" @click="editClubs(person)">
                <div 
                  v-for="membership in person.active_club_memberships" 
                  :key="membership.id" 
                  :class="['club-logo-container', { 'club-logo-error': !membership.club?.name }]"
                  :title="membership.club?.full_info || `Команда ID: ${membership.club_id} (не найдена)`"
                >
                  <img
                    v-if="membership.club?.logo_url"
                    :src="getClubLogoUrl(membership.club)"
                    :alt="membership.club?.name || 'Логотип команды'"
                    class="club-logo"
                  />
                  <div v-else class="club-logo-placeholder">
                    <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </div>
                <span v-if="!person.active_club_memberships || !person.active_club_memberships.length" class="text-gray-400">Нет команд</span>
              </div>
            </td>
            <td>
              <div class="sports-list clickable-field" @click="editSports(person)">
                <div 
                  v-for="membership in person.active_sport_memberships" 
                  :key="membership.id" 
                  :class="['sport-item', { 'sport-item-error': !membership.sport?.name }]"
                >
                  <Icon
                    v-if="membership.sport?.icon"
                    :icon="membership.sport.icon"
                    class="sport-icon"
                  />
                  <span class="sport-name">{{ membership.sport?.name || `Вид спорта ID: ${membership.sport_id} (не найден)` }}</span>
                </div>
                <span v-if="!person.active_sport_memberships || !person.active_sport_memberships.length" class="text-gray-400">Нет</span>
              </div>
            </td>
            <td>
              <button class="action-btn" @click="openAboutModal(person)" title="Редактировать 'О себе'">
                <Icon icon="mdi:information-outline" class="w-5 h-5 text-blue-600 hover:text-blue-800" />
              </button>
            </td>
            <td>
              <KirhToggleField
                :model-value="!!person.is_active"
                @update:model-value="val => updateIsActive(person, val === 1 || val === true)"
              />
            </td>
            <td>
              <div class="actions">
                <button
                  @click="viewPerson(person)"
                  class="action-btn action-view"
                  title="Просмотр"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
                <button
                  @click="editPerson(person)"
                  class="action-btn action-edit"
                  title="Редактировать"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button
                  @click="deletePerson(person)"
                  class="action-btn action-delete"
                  title="Удалить"
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

    <!-- Пагинация -->
    <div class="pagination-container" v-if="pagination.last_page > 1">
      <div class="pagination">
        <button
          @click="changePage(pagination.current_page - 1)"
          :disabled="pagination.current_page === 1"
          class="pagination-btn"
        >
          Назад
        </button>
        <span class="pagination-info">
          Страница {{ pagination.current_page }} из {{ pagination.last_page }}
        </span>
        <button
          @click="changePage(pagination.current_page + 1)"
          :disabled="pagination.current_page === pagination.last_page"
          class="pagination-btn"
        >
          Вперед
        </button>
      </div>
    </div>

    <!-- Модальное окно создания/редактирования персоны -->
    <PersonModal
      v-if="showCreateModal || showEditModal"
      :person="editingPerson"
      :mode="showCreateModal ? 'create' : 'edit'"
      context="people"
      @close="closeModal"
      @saved="onPersonSaved"
    />

    <!-- Модальное окно просмотра персоны -->
    <PersonViewModal
      v-if="showViewModal"
      :person="viewingPerson"
      @close="showViewModal = false"
      @edit="editPerson(viewingPerson)"
    />

    <!-- Модальное окно редактирования должностей -->
    <PersonPositionsModal
      v-if="showPositionsModal"
      :person="editingRelationsPerson"
      @close="showPositionsModal = false"
      @saved="onPersonSaved"
      @deleted="onPersonSaved"
    />

    <!-- Модальное окно редактирования амплуа -->
    <PersonAmpluasModal
      v-if="showAmpluasModal"
      :person="editingRelationsPerson"
      @close="showAmpluasModal = false"
      @saved="onPersonSaved"
      @deleted="onPersonSaved"
    />

    <!-- Модальное окно редактирования клубов -->
    <PersonClubsModal
      v-if="showClubsModal"
      :person="editingRelationsPerson"
      @close="showClubsModal = false"
      @saved="onPersonSaved"
      @deleted="onPersonSaved"
    />

    <!-- Модальное окно редактирования видов спорта -->
    <PersonSportsModal
      v-if="showSportsModal"
      :person="editingRelationsPerson"
      @close="showSportsModal = false"
      @saved="onPersonSaved"
      @deleted="onPersonSaved"
    />

    <!-- Модальное окно редактирования изображений -->
    <PersonImagesModal
      :is-visible="showImagesModal"
      :person="editingRelationsPerson"
      @close="showImagesModal = false"
      @saved="onPersonSaved"
    />

    <!-- Модалка подтверждения -->
    <div v-if="confirmationModal.show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <div class="flex items-center mb-4">
          <div class="flex-shrink-0">
            <Icon name="mdi:alert-circle" class="w-6 h-6 text-yellow-500" />
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

    <!-- Модалка для about (О себе) -->
    <template v-if="showAboutModal">
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg w-full max-w-2xl p-6 flex flex-col max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-semibold mb-4">Редактировать "О себе"</h3>
          <RichTextEditor v-model="aboutContent" :editor-enabled="true" />
          <div class="flex justify-end gap-3 mt-6">
            <button type="button" @click="closeAboutModal" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Отмена</button>
            <button type="button" @click="saveAbout" :disabled="aboutSaving" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              {{ aboutSaving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import RichTextEditor from '~/components/kirh/table/editor/RichTextEditor.vue'
import KirhSelectField from '~/components/kirh/table/fields/KirhSelectField.vue'
import KirhToggleField from '~/components/kirh/table/fields/KirhToggleField.vue'
import PersonAmpluasModal from '~/components/people/PersonAmpluasModal.vue'
import PersonClubsModal from '~/components/people/PersonClubsModal.vue'
import PersonImagesModal from '~/components/people/PersonImagesModal.vue'
import PersonModal from '~/components/people/PersonModal.vue'
import PersonPositionsModal from '~/components/people/PersonPositionsModal.vue'
import PersonSportsModal from '~/components/people/PersonSportsModal.vue'
import PersonViewModal from '~/components/people/PersonViewModal.vue'
import PeopleImportExport from '../components/people/PeopleImportExport.vue'

// Используем composable для API
const { api, apiRequest } = useApi()

// Состояние
const people = ref([])
const statistics = ref({})
const pagination = ref({})
const loading = ref(false)

// Модальные окна
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const showPositionsModal = ref(false)
const showAmpluasModal = ref(false)
const showClubsModal = ref(false)
const showSportsModal = ref(false)
const showImagesModal = ref(false)
const editingPerson = ref(null)
const viewingPerson = ref(null)
const editingRelationsPerson = ref(null)

// Модалка подтверждения
const confirmationModal = ref({
  show: false,
  title: '',
  message: '',
  onConfirm: null
})

// Модалка для about
const showAboutModal = ref(false)
const aboutPerson = ref(null)
const aboutContent = ref('')
const aboutSaving = ref(false)

// Фильтры
const filters = reactive({
  search: '',
  person_type: '',
  position_id: '',
  amplua_id: '',
  club_id: '',
  sport_id: '',
  page: 1,
  per_page: 15
})

// Загрузка данных
const loadPeople = async () => {
  loading.value = true
  try {
    const params = { ...filters }
    const response = await apiRequest('/people', { params })
    
    // Проверяем структуру ответа от Laravel API
    if (response.success && response.data) {
      people.value = response.data
      pagination.value = response.pagination || {}
    } else {
      console.error('Неверная структура ответа API:', response)
      people.value = []
      pagination.value = {}
    }
  } catch (error) {
    console.error('Ошибка загрузки персон:', error)
    people.value = []
    pagination.value = {}
  } finally {
    loading.value = false
  }
}

const loadStatistics = async () => {
  try {
    const response = await apiRequest('/people/statistics')
    
    // Проверяем структуру ответа от Laravel API
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

// Функция для получения корректного URL изображения
const getImageUrl = (image) => {
  if (!image) return ''
  
  if (image.image_url && typeof image.image_url === 'string' && image.image_url.startsWith('http')) {
    return image.image_url
  }
  if (image.image && typeof image.image === 'string' && image.image.startsWith('http')) {
    return image.image
  }
  
  if (image.image_url) {
    return `${api}/storage/${image.image_url}`
  }
  if (image.image) {
    return `${api}/storage/${image.image}`
  }
  
  return ''
}

// Функция для получения корректного URL логотипа клуба
const getClubLogoUrl = (club) => {
  if (!club) return ''
  
  if (club.logo_url && typeof club.logo_url === 'string' && club.logo_url.startsWith('http')) {
    return club.logo_url
  }
  
  if (club.logo_url) {
    return `${api}/storage/${club.logo_url}`
  }
  
  return ''
}

// Действия
const viewPerson = (person) => {
  viewingPerson.value = person
  showViewModal.value = true
}

const editPerson = (person) => {
  editingPerson.value = person
  showEditModal.value = true
}

const editPositions = (person) => {
  editingRelationsPerson.value = person
  showPositionsModal.value = true
}

const editAmpluas = (person) => {
  editingRelationsPerson.value = person
  showAmpluasModal.value = true
}

const editClubs = (person) => {
  editingRelationsPerson.value = person
  showClubsModal.value = true
}

const editSports = (person) => {
  editingRelationsPerson.value = person
  showSportsModal.value = true
}

const editImages = (person) => {
  editingRelationsPerson.value = person
  showImagesModal.value = true
}

const deletePerson = async (person) => {
  // Показываем модалку подтверждения
  confirmationModal.value = {
    show: true,
    title: 'Подтверждение удаления',
    message: `Вы уверены, что хотите удалить персону "${person.full_name}"?`,
    onConfirm: async () => {
      try {
        const response = await apiRequest(`/people/${person.id}`, { method: 'DELETE' })
        
        if (response.success) {
          await loadPeople()
          await loadStatistics()
        } else {
          console.error('Ошибка удаления персоны:', response.message)
        }
      } catch (error) {
        console.error('Ошибка удаления персоны:', error)
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

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingPerson.value = null
}

const onPersonSaved = async () => {
  closeModal()
  await loadPeople()
  await loadStatistics()
}

const changePage = (page) => {
  filters.page = page
  loadPeople()
}

// Функция форматирования даты
const formatDate = (dateString) => {
  if (!dateString) return 'Не указана'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    return 'Неверная дата'
  }
}

// Поиск с задержкой
let searchTimeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.page = 1
    loadPeople()
  }, 300)
}

// Обработчик клавиатуры для модалки подтверждения
const handleKeydown = (event) => {
  if (event.key === 'Escape' && confirmationModal.value.show) {
    closeConfirmationModal()
  }
}

// Добавляем функцию для обновления таблицы
const refreshPeopleTable = async () => {
  await loadPeople()
  await loadStatistics()
}

// Инициализация
onMounted(async () => {
  await Promise.all([
    loadPeople(),
    loadStatistics()
  ])
  
  // Добавляем обработчик клавиатуры
  document.addEventListener('keydown', handleKeydown)
})

// Очистка при размонтировании
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

const openAboutModal = (person) => {
  aboutPerson.value = person
  aboutContent.value = person.about || ''
  showAboutModal.value = true
}
const closeAboutModal = () => {
  showAboutModal.value = false
  aboutPerson.value = null
  aboutContent.value = ''
}
const saveAbout = async () => {
  if (!aboutPerson.value) return
  aboutSaving.value = true
  try {
    await apiRequest(`/people/${aboutPerson.value.id}`, {
      method: 'PUT',
      body: { about: aboutContent.value }
    })
    aboutPerson.value.about = aboutContent.value
    // Обновляем people в списке
    const idx = people.value.findIndex(p => p.id === aboutPerson.value.id)
    if (idx !== -1) people.value[idx].about = aboutContent.value
    closeAboutModal()
  } catch (e) {
    alert('Ошибка при сохранении поля "О себе"')
  } finally {
    aboutSaving.value = false
  }
}

const updateIsActive = async (person, val) => {
  try {
    await apiRequest(`/people/${person.id}`, {
      method: 'PUT',
      body: { is_active: val }
    })
    person.is_active = val
  } catch (e) {
    alert('Ошибка при обновлении активности')
  }
}
</script>

<style scoped>
.people-management {
  @apply p-6;
}

.page-header {
  @apply flex justify-between items-center mb-6;
}

.stats-grid {
  @apply grid grid-cols-1 md:grid-cols-7 gap-4;
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
  @apply grid grid-cols-1 md:grid-cols-6 gap-4;
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

.person-photo {
  @apply flex items-center;
}

.person-info {
  @apply flex flex-col;
}

.person-name {
  @apply text-sm font-medium text-gray-900;
}

.person-details {
  @apply text-sm text-gray-500;
}

.person-positions,
.person-ampluas {
  @apply flex flex-col;
}

.clickable-field {
  @apply cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors;
}

.positions-list,
.ampluas-list {
  @apply flex flex-wrap gap-1;
}

.badge-success {
  @apply inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800;
}

.badge-warning {
  @apply inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800;
}

.badge-error {
  @apply inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800;
}

.clubs-list,
.sports-list {
  @apply flex flex-wrap gap-2;
}

.club-logo-container {
  @apply relative;
}

.club-logo {
  @apply w-8 h-8 rounded-full object-cover border border-gray-200;
}

.club-logo-placeholder {
  @apply w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center;
}

.club-logo-error {
  @apply opacity-50;
}

.sport-item {
  @apply inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full;
}

.sport-icon {
  @apply w-4 h-4;
}

.sport-name {
  @apply text-xs;
}

.sport-item-error {
  @apply bg-red-100 text-red-800;
}

.actions {
  @apply flex gap-2;
}

.action-btn {
  @apply p-1 rounded hover:bg-gray-100 transition-colors;
}

.action-view {
  @apply text-blue-600 hover:text-blue-800;
}

.action-edit {
  @apply text-green-600 hover:text-green-800;
}

.action-delete {
  @apply text-red-600 hover:text-red-800;
}

.pagination-container {
  @apply flex justify-center mt-6;
}

.pagination {
  @apply flex items-center gap-4;
}

.pagination-btn {
  @apply px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed;
}

.pagination-info {
  @apply text-sm text-gray-600;
}

.person-id {
  font-size: 1.25rem; /* text-xl */
  font-weight: bold;
  color: #991b1b; /* dark red-800 */
  display: block;
  text-align: center;
}
</style> 