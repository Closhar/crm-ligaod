<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <Icon name="heroicons-trophy" class="w-8 h-8 text-blue-600" />
        <h1 class="text-2xl font-bold text-gray-900">Рейтинги регионов SRRR</h1>
      </div>
      <div class="flex gap-3 items-center">
        <!-- Индикатор актуальности рейтинга -->
        <div class="flex items-center gap-4">
          <template v-if="ratingNeedsRecalc">
            <button @click="calculateRating" :disabled="calculating" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Icon name="heroicons-calculator" class="w-5 h-5" />
              <span v-if="!calculating">Пересчитать рейтинг</span>
              <span v-else>Пересчёт...</span>
            </button>
          </template>
          <template v-else>
            <span class="text-green-700 font-semibold flex items-center gap-2"><Icon name="heroicons-check-circle" class="w-5 h-5" />Рейтинг актуален</span>
          </template>
        </div>
        <button @click="showDynamicsModal = true" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Icon name="heroicons-chart-bar" class="w-5 h-5" /> Динамика рейтинга
        </button>
      </div>
    </div>

    <div class="mb-4 flex gap-4">
      <button :class="['px-4 py-2 rounded flex items-center gap-2 transition', tab === 'details' ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300']" @click="tab = 'details'">
        <Icon name="heroicons-document-text" class="w-5 h-5" /> Детальный рейтинг
      </button>
      <button :class="['px-4 py-2 rounded flex items-center gap-2 transition', tab === 'history' ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300']" @click="tab = 'history'">
        <Icon name="heroicons-clock" class="w-5 h-5" /> История рейтингов
      </button>
    </div>

    <div v-if="tab === 'details'">
      <div class="flex items-center gap-6 mb-4">
        <KirhSelectField
          v-model="selectedYear"
          api-url="/api/v1/rating/years"
          key-field="year"
          label-field="title"
          :enable-search="false"
          :limit="10"
          placeholder="Выберите год"
          :emptyable="false"
          sel-class="text-gray-900"
          class="w-40"
        />
      </div>
      <div class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider" style="width:60px;">Место</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Регион</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Итоговый рейтинг (4 года)</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Команды (очки в году)</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">За {{ selectedYear }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ selectedYear - 1 }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ selectedYear - 2 }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ selectedYear - 3 }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(row, idx) in sortedDetailsTable" :key="row.region_id" class="hover:bg-gray-50">
              <td class="px-4 py-4 whitespace-nowrap text-sm font-extrabold text-gray-900 bg-yellow-50" style="width:60px;">{{ idx + 1 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ row.region }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-700 bg-blue-50">{{ row.rating }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <ul>
                  <li v-for="team in row.teams" :key="team.club_id" class="flex items-center gap-2">
                    <img v-if="team.logo_url" :src="team.logo_url" :alt="`Логотип ${team.club_name}`" class="w-6 h-6 object-contain rounded-full border" />
                    <span>
                      {{ team.club_name }}
                      <span class="font-bold text-red-600"> ({{ team.points }} очк.)</span>
                      <template v-if="team.tournament_type || team.position">
                        <span class="ml-1 text-xs font-bold text-gray-700">
                          <template v-if="team.tournament_type">{{ team.tournament_type }}</template>
                          <template v-if="team.tournament_type && team.position">/</template>
                          <template v-if="team.position">{{ team.position }} место</template>
                        </span>
                      </template>
                    </span>
                  </li>
                </ul>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold bg-red-50">
                <span class="text-red-600">{{ row.yearly_rating ?? 0 }}</span> <span class="text-blue-700">/ {{ row.rating ?? 0 }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold bg-green-50">
                <span class="text-red-600">{{ row.prev_years[0]?.yearly_rating ?? 0 }}</span> <span class="text-blue-700">/ {{ row.prev_years[0]?.rating ?? 0 }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold bg-yellow-50">
                <span class="text-red-600">{{ row.prev_years[1]?.yearly_rating ?? 0 }}</span> <span class="text-blue-700">/ {{ row.prev_years[1]?.rating ?? 0 }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold bg-gray-50">
                <span class="text-red-600">{{ row.prev_years[2]?.yearly_rating ?? 0 }}</span> <span class="text-blue-700">/ {{ row.prev_years[2]?.rating ?? 0 }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-6 mb-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h2 class="text-lg font-bold mb-2">Как считается рейтинг?</h2>
        <ul class="text-sm text-gray-700 mb-2 list-disc pl-5">
          <li> <span class="font-bold text-blue-700">Синий</span> — кумулятивный рейтинг региона за 4 года (сумма годовых рейтингов за текущий и три предыдущих года).</li>
          <li> <span class="font-bold text-red-600">Красный</span> — годовой рейтинг региона (очки, набранные только за выбранный год).</li>
          <li> <span class="font-bold">Жирный</span> — значения рейтингов по годам.</li>
          <li> Цвет фона ячейки:
            <ul class="list-disc pl-5">
              <li class="bg-blue-50 inline-block px-2 rounded">Светло-синий</li>
              <li class="bg-green-50 inline-block px-2 rounded">Светло-зелёный</li>
              <li class="bg-yellow-50 inline-block px-2 rounded">Светло-жёлтый</li>
              <li class="bg-gray-50 inline-block px-2 rounded">Светло-серый</li>
            </ul>
          </li>
        </ul>
        <div class="text-xs text-gray-500">Кумулятивный рейтинг — это сумма годовых рейтингов за 4 года. Годовой рейтинг — это очки, набранные только за выбранный год.</div>
      </div>
    </div>
    <div v-else-if="tab === 'history'">
      <div class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider" style="width:60px;">Место</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Регион</th>
              <th v-for="(year, idx) in last4Years" :key="year" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ year }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="sortedHistoryTable.length === 0">
              <td :colspan="2 + last4Years.length">Нет данных для отображения</td>
            </tr>
            <tr v-for="(row, idx) in sortedHistoryTable" :key="row.region_id">
              <td class="px-4 py-4 whitespace-nowrap text-sm font-extrabold text-gray-900 bg-yellow-50" style="width:60px;">{{ idx + 1 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ row.region }}</td>
              <td v-for="(year, idx2) in last4Years" :key="year"
                :class="[
                  'px-6 py-4 whitespace-nowrap text-sm font-bold',
                  idx2 === 0 ? 'bg-red-50' : idx2 === 1 ? 'bg-green-50' : idx2 === 2 ? 'bg-yellow-50' : 'bg-gray-50'
                ]"
              >
                {{ row.ratings.find(r => Number(r.year) === Number(year))?.rating ?? 0 }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-6 mb-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h2 class="text-lg font-bold mb-2">Как считается рейтинг?</h2>
        <ul class="text-sm text-gray-700 mb-2 list-disc pl-5">
          <li> <span class="font-bold text-blue-700">Синий</span> — кумулятивный рейтинг региона за 4 года (сумма годовых рейтингов за текущий и три предыдущих года).</li>
          <li> <span class="font-bold text-red-600">Красный</span> — годовой рейтинг региона (очки, набранные только за выбранный год).</li>
          <li> <span class="font-bold">Жирный</span> — значения рейтингов по годам.</li>
          <li> Цвет фона ячейки:
            <ul class="list-disc pl-5">
              <li class="bg-blue-50 inline-block px-2 rounded">Светло-синий</li>
              <li class="bg-green-50 inline-block px-2 rounded">Светло-зелёный</li>
              <li class="bg-yellow-50 inline-block px-2 rounded">Светло-жёлтый</li>
              <li class="bg-gray-50 inline-block px-2 rounded">Светло-серый</li>
            </ul>
          </li>
        </ul>
        <div class="text-xs text-gray-500">Кумулятивный рейтинг — это сумма годовых рейтингов за 4 года. Годовой рейтинг — это очки, набранные только за выбранный год.</div>
      </div>
    </div>

    <!-- Модальное окно расчета рейтинга -->
    <div v-if="showCalculationModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Пересчитать рейтинги регионов</h3>
          <p class="mb-6 text-gray-700 text-sm">Будет произведён полный пересчёт рейтинга для всех регионов и всех лет. Это действие может занять некоторое время.</p>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="showCalculationModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Отмена
            </button>
            <button
              @click="calculateRating"
              :disabled="calculating"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {{ calculating ? 'Рассчитывается...' : 'Рассчитать' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно динамики рейтинга -->
    <div v-if="showDynamicsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-3/4 max-w-4xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Динамика рейтинга</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Регион</label>
              <KirhSelectField
                v-model="dynamicsForm.region_id"
                api-url="/api/v1/rating/regions"
                :api-params="{ limit: 10 }"
                key-field="id"
                label-field="name"
                :enable-search="true"
                :limit="10"
                placeholder="Выберите регион"
                :emptyable="false"
                sel-class="text-gray-900"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Вид спорта</label>
              <KirhSelectField
                v-model="dynamicsForm.sport_id"
                api-url="/api/v1/rating/sports"
                :api-params="{ limit: 10 }"
                key-field="id"
                label-field="title"
                icon-field="icon_name"
                :enable-search="true"
                :limit="10"
                placeholder="Выберите вид спорта"
                :emptyable="false"
                sel-class="text-gray-900"
                required
              />
            </div>
            
            <div class="flex items-end">
              <button
                @click="loadDynamics"
                class="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
              >
                Загрузить динамику
              </button>
            </div>
          </div>

          <!-- График динамики -->
          <div v-if="dynamics.length > 0" class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-md font-medium text-gray-900 mb-4">График динамики</h4>
            <div class="h-64 flex items-end justify-between gap-2">
              <div
                v-for="(item, index) in dynamics"
                :key="index"
                class="flex-1 bg-blue-500 rounded-t"
                :style="{ height: `${(item.points / maxPoints) * 100}%` }"
                :title="`${item.year}: ${item.points} очков`"
              ></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-2">
              <span v-for="item in dynamics" :key="item.year">{{ item.year }}</span>
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <button
              @click="showDynamicsModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно деталей расчета -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-3/4 max-w-4xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Детали расчета рейтинга</h3>
          
          <div v-if="selectedRating" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-sm font-medium text-gray-700">Регион:</span>
                <span class="ml-2">{{ selectedRating.region?.name }}</span>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-700">Вид спорта:</span>
                <span class="ml-2">{{ selectedRating.sport?.title }}</span>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-700">Год:</span>
                <span class="ml-2">{{ selectedRating.year }}</span>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-700">Общие очки:</span>
                <span class="ml-2 font-bold">{{ selectedRating.total_points }}</span>
              </div>
            </div>

            <div v-if="selectedRating.details && selectedRating.details.length > 0">
              <h4 class="text-md font-medium text-gray-900 mb-2">Достижения клубов:</h4>
              <div class="bg-gray-50 rounded-lg p-4">
                <div v-for="(detail, index) in selectedRating.details" :key="index" class="mb-2 p-2 bg-white rounded border">
                  <div class="grid grid-cols-3 gap-2 text-sm">
                    <span><strong>Клуб:</strong> {{ detail.club_name }}</span>
                    <span><strong>Турнир:</strong> {{ detail.tournament_type }}</span>
                    <span><strong>Место:</strong> {{ detail.position }}</span>
                    <span><strong>Команд:</strong> {{ detail.teams_count }}</span>
                    <span><strong>Коэффициент:</strong> {{ detail.coefficient }}</span>
                    <span><strong>Очки:</strong> {{ detail.final_points }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <button
              @click="showDetailsModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Уведомления -->
    <Notification 
      :message="notificationMessage" 
      :type="notificationType" 
      @close="notificationMessage = ''"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import KirhSelectField from '~/components/kirh/table/fields/KirhSelectField.vue'
import Notification from '~/components/Notification.vue'
const { apiRequest } = useApi()

const tab = ref('details')
const selectedYear = ref('')
const last4Years = ref([])
const detailsTable = ref([])
const historyTable = ref([])
const showCalculationModal = ref(false)
const showDynamicsModal = ref(false)
const showDetailsModal = ref(false)
const selectedRating = ref(null)

const filters = ref({
  sport_id: '',
  year: '',
  region_id: ''
})

const calculationForm = ref({
  year: '',
  sport_id: ''
})

const dynamicsForm = ref({
  region_id: '',
  sport_id: ''
})

// Вычисляемые свойства
const maxPoints = ref(1) // Initialize with 1 to avoid division by zero
const dynamics = ref([])
const calculating = ref(false)

const notificationMessage = ref('')
const notificationType = ref('success')
const ratingNeedsRecalc = ref(false)

const loadHistoryTable = async () => {
  const res = await apiRequest('/v1/rating/region-year-total-ratings-history')
  historyTable.value = Array.isArray(res) ? res : []
  if (Array.isArray(res) && res.length > 0) {
    last4Years.value = res[0].ratings.map(r => Number(r.year))
  } else {
    last4Years.value = []
  }
}

const loadDetailsTable = async () => {
  const res = await apiRequest(`/v1/rating/region-year-total-ratings?year=${selectedYear.value}`)
  detailsTable.value = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : [])
}

watch(selectedYear, () => {
  loadDetailsTable()
})

const fetchRatingActuality = async () => {
  try {
    const res = await apiRequest('/v1/rating/actuality-status')
    ratingNeedsRecalc.value = !res.is_actual
  } catch (e) {
    ratingNeedsRecalc.value = false // fallback: считаем актуальным
  }
}

const showNotification = (message, type = 'success') => {
  notificationMessage.value = message
  notificationType.value = type
}

const calculateRating = async () => {
  calculating.value = true
  try {
    await apiRequest('/v1/rating/calculate-yearly', { method: 'POST' })
    await fetchRatingActuality()
    await loadDetailsTable() // Reload details table after calculation
    showCalculationModal.value = false
    showNotification('Рейтинг успешно пересчитан', 'success')
  } catch (e) {
    showNotification('Ошибка при пересчёте рейтинга', 'error')
  } finally {
    calculating.value = false
  }
}

const recalculateRating = async (rating) => {
  try {
    await apiRequest('/v1/rating/calculate-yearly', {
      method: 'POST',
      body: {
        year: rating.year,
        sport_id: rating.sport_id
      }
    })
    await loadDetailsTable()
  } catch (error) {
    console.error('Ошибка пересчета рейтинга:', error)
  }
}

const showDetails = (rating) => {
  selectedRating.value = rating
  showDetailsModal.value = true
}

// Сортировка для детальной таблицы
const sortedDetailsTable = computed(() => {
  return [...detailsTable.value].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
})
// Сортировка для истории (по рейтингу текущего года)
const sortedHistoryTable = computed(() => {
  if (!historyTable.value.length || !last4Years.value.length) return []
  const year = last4Years.value[0]
  return [...historyTable.value].sort((a, b) => {
    const ra = a.ratings.find(r => Number(r.year) === Number(year))?.rating ?? 0
    const rb = b.ratings.find(r => Number(r.year) === Number(year))?.rating ?? 0
    return rb - ra
  })
})

// Обновляю загрузку рейтингов
// onMounted(() => {
//   loadRatings()
// })

onMounted(async () => {
  await fetchRatingActuality()
  await loadHistoryTable()
  // По умолчанию выбираем максимальный год
  if (!selectedYear.value && last4Years.value.length > 0) {
    selectedYear.value = Math.max(...last4Years.value)
  }
  await loadDetailsTable()
})
</script> 