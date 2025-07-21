<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Icon name="mdi:map-marker-radius" class="w-7 h-7 text-blue-600" />
        Регионы рейтинга SRRR
      </h1>
      <p class="text-gray-600 mt-2">Управление регионами для системы рейтинга SportRep Regional Rating</p>
    </div>

    <!-- Уведомления -->
    <div v-if="message" class="mb-4 p-4 rounded-md" :class="{
      'bg-green-100 text-green-800 border border-green-200': messageType === 'success',
      'bg-red-100 text-red-800 border border-red-200': messageType === 'error'
    }">
      {{ message }}
    </div>

    <!-- Фильтры и кнопки -->
    <div class="mb-6 flex justify-between items-center">
      <div class="flex items-center gap-4">
        <label class="flex items-center">
          <input
            v-model="showOnlyActive"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span class="ml-2 text-sm text-gray-700">Только активные</span>
        </label>
      </div>
      
      <button
        @click="openAddModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <Icon name="heroicons:plus" class="w-5 h-5" />
        Добавить регион
      </button>
    </div>

    <!-- Таблица регионов -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading && regions.length === 0" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Загрузка регионов...</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Название
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Код
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Клубов
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="region in filteredRegions" :key="region.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ region.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ region.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <code class="bg-gray-100 px-2 py-1 rounded">{{ region.code }}</code>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    region.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ region.is_active ? 'Активен' : 'Неактивен' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ region.clubs_count || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center gap-2">
                  <button
                    @click="editRegion(region)"
                    class="text-indigo-600 hover:text-indigo-900 flex items-center"
                    aria-label="Редактировать"
                  >
                    <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteRegion(region.id)"
                    class="text-red-600 hover:text-red-900 flex items-center"
                    aria-label="Удалить"
                  >
                    <Icon name="heroicons:trash" class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!loading && filteredRegions.length === 0" class="p-8 text-center text-gray-500">
        {{ regions.length === 0 ? 'Регионы не найдены' : 'Нет регионов, соответствующих фильтру' }}
      </div>
    </div>

    <!-- Модальное окно добавления/редактирования -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingRegion ? 'Редактировать регион' : 'Добавить регион' }}
          </h3>
          
          <form @submit.prevent="saveRegion">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Название региона
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Например: Москва"
              />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Код региона
              </label>
              <input
                v-model="form.code"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Например: moscow"
              />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Описание региона..."
              ></textarea>
            </div>

            <div class="mb-6">
              <label class="flex items-center">
                <input
                  v-model="form.is_active"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-700">Активен</span>
              </label>
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Отмена
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ loading ? 'Сохранение...' : (editingRegion ? 'Сохранить' : 'Добавить') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const { apiRequest } = useApi()

// Состояние
const regions = ref([])
const showModal = ref(false)
const editingRegion = ref(null)
const loading = ref(false)
const message = ref('')
const messageType = ref('success')
const showOnlyActive = ref(false)
const form = ref({
  name: '',
  code: '',
  description: '',
  is_active: true
})

// Вычисляемое свойство для отфильтрованных регионов
const filteredRegions = computed(() => {
  if (showOnlyActive.value) {
    return regions.value.filter(region => region.is_active)
  }
  return regions.value
})

// Загрузка данных
const loadRegions = async () => {
  loading.value = true
  try {
    const response = await apiRequest('/v1/rating/regions')
    regions.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки регионов:', error)
    showMessage('Ошибка загрузки регионов', 'error')
  } finally {
    loading.value = false
  }
}

// Открыть модальное окно для добавления
const openAddModal = () => {
  editingRegion.value = null
  form.value = {
    name: '',
    code: '',
    description: '',
    is_active: true
  }
  showModal.value = true
}

// Открыть модальное окно для редактирования
const editRegion = (region) => {
  editingRegion.value = region
  form.value = {
    name: region.name,
    code: region.code,
    description: region.description || '',
    is_active: region.is_active
  }
  showModal.value = true
}

// Закрыть модальное окно
const closeModal = () => {
  showModal.value = false
  editingRegion.value = null
  form.value = {
    name: '',
    code: '',
    description: '',
    is_active: true
  }
}

// Сохранить регион
const saveRegion = async () => {
  loading.value = true
  try {
    if (editingRegion.value) {
      await apiRequest(`/v1/rating/regions/${editingRegion.value.id}`, {
        method: 'PUT',
        body: form.value
      })
      showMessage('Регион успешно обновлен', 'success')
    } else {
      await apiRequest('/v1/rating/regions', {
        method: 'POST',
        body: form.value
      })
      showMessage('Регион успешно создан', 'success')
    }
    
    await loadRegions()
    closeModal()
  } catch (error) {
    console.error('Ошибка сохранения региона:', error)
    const errorMessage = error?.data?.message || 'Ошибка сохранения региона'
    showMessage(errorMessage, 'error')
  } finally {
    loading.value = false
  }
}

// Удалить регион
const deleteRegion = async (id) => {
  if (!confirm('Вы уверены, что хотите удалить этот регион?')) return
  
  try {
    await apiRequest(`/v1/rating/regions/${id}`, {
      method: 'DELETE'
    })
    showMessage('Регион успешно удален', 'success')
    await loadRegions()
  } catch (error) {
    console.error('Ошибка удаления региона:', error)
    const errorMessage = error?.data?.message || 'Ошибка удаления региона'
    showMessage(errorMessage, 'error')
  }
}

// Показать сообщение
const showMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

// Загрузить данные при монтировании
onMounted(() => {
  loadRegions()
})
</script> 