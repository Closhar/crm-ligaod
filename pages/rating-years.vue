<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Icon name="mdi:calendar-star" class="w-7 h-7 text-green-600" />
        Годы рейтинга SRRR
      </h1>
      <p class="text-gray-600 mt-2">Управление годами для расчета рейтинга регионов</p>
    </div>



    <!-- Кнопка добавления -->
    <div class="mb-6">
      <button
        @click="showModal = true"
        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <Icon name="heroicons:plus" class="w-5 h-5" />
        Добавить год
      </button>
    </div>

    <!-- Таблица годов -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Год
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Название
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Достижений
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="year in years" :key="year.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ year.year }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ year.title }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    year.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ year.is_active ? 'Активный' : 'Неактивный' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ year.achievements_count || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center gap-2">
                  <button
                    @click="editYear(year)"
                    class="text-indigo-600 hover:text-indigo-900 flex items-center"
                    aria-label="Редактировать"
                  >
                    <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteYear(year.id)"
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
    </div>

    <!-- Модальное окно добавления/редактирования -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-3/4 max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingYear ? 'Редактировать год' : 'Добавить год' }}
          </h3>
          
          <form @submit.prevent="saveYear">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Год *</label>
                <input
                  v-model.number="form.year"
                  type="number"
                  min="2020"
                  max="2030"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2024"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Название *</label>
                <input
                  v-model="form.title"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2024 год"
                />
              </div>

              <div>
                <label class="flex items-center">
                  <input
                    v-model="form.is_active"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span class="ml-2 text-sm text-gray-700">Активный год</span>
                </label>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Отмена
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
              >
                {{ editingYear ? 'Сохранить' : 'Добавить' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const { apiRequest } = useApi()

// Состояние
const years = ref([])
const showModal = ref(false)
const editingYear = ref(null)
const form = ref({
  year: new Date().getFullYear(),
  title: '',
  is_active: true
})

// Загрузка данных
const loadYears = async () => {
  try {
    const response = await apiRequest('/v1/rating/years')
    years.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки годов:', error)
  }
}

// Действия
const editYear = (year) => {
  editingYear.value = year
  form.value = {
    year: year.year,
    title: year.title,
    is_active: year.is_active
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingYear.value = null
  form.value = {
    year: new Date().getFullYear(),
    title: '',
    is_active: true
  }
}

const saveYear = async () => {
  try {
    if (editingYear.value) {
      await apiRequest(`/v1/rating/years/${editingYear.value.id}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      await apiRequest('/v1/rating/years', {
        method: 'POST',
        body: form.value
      })
    }
    
    await loadYears()
    closeModal()
  } catch (error) {
    console.error('Ошибка сохранения года:', error)
  }
}

const deleteYear = async (id) => {
  if (!confirm('Вы уверены, что хотите удалить этот год? Это может повлиять на рейтинги.')) return
  
  try {
    await apiRequest(`/v1/rating/years/${id}`, {
      method: 'DELETE'
    })
    await loadYears()
  } catch (error) {
    console.error('Ошибка удаления года:', error)
  }
}

// Инициализация
onMounted(() => {
  loadYears()
})
</script> 