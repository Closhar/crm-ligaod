<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-2xl w-full p-6">
      <h3 class="text-lg font-semibold mb-4">Добавить игрока в команду</h3>
      <form @submit.prevent="addPlayer">
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 rounded text-center font-semibold">
          {{ errorMessage }}
        </div>
        <!-- Верхний блок -->
        <div class="flex flex-col md:flex-row gap-6 mb-6">
          <!-- Левая часть: ФИО и дата рождения -->
          <div class="flex-1 space-y-3 relative">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
              <input v-model="lastName" type="text" class="w-full p-2 border border-gray-300 rounded" autocomplete="off" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Имя</label>
              <input v-model="firstName" type="text" class="w-full p-2 border border-gray-300 rounded" autocomplete="off" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Отчество</label>
              <input v-model="middleName" type="text" class="w-full p-2 border border-gray-300 rounded" autocomplete="off" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Дата рождения</label>
              <input v-model="birthDate" type="date" class="w-full p-2 border border-gray-300 rounded" />
            </div>
            <!-- Дропдаун результатов поиска -->
            <div v-if="showDropdown && filteredPeople.length" class="absolute z-10 w-full bg-white border border-gray-300 rounded shadow mt-1 max-h-48 overflow-y-auto">
              <div
                v-for="person in filteredPeople"
                :key="person.id"
                class="p-2 hover:bg-blue-50 cursor-pointer text-sm"
                @mousedown.prevent="confirmAddPerson(person)"
              >
                {{ person.last_name }} {{ person.first_name }} {{ person.middle_name }} <span v-if="person.birth_date">({{ formatDate(person.birth_date) }})</span>
              </div>
            </div>
          </div>
          <!-- Правая часть: Поиск по фамилии -->
          <div class="flex-1 relative">
            <label class="block text-sm font-medium text-gray-700 mb-1">Поиск по фамилии</label>
            <input
              v-model="searchQuery"
              @input="onInput"
              type="text"
              placeholder="Введите фамилию..."
              class="w-full p-2 border border-blue-400 rounded"
              autocomplete="off"
              @focus="showDropdown = true"
              @blur="onBlur"
            />
            <div v-if="showDropdown && filteredPeople.length" class="absolute z-10 w-full bg-white border border-gray-300 rounded shadow mt-1 max-h-48 overflow-y-auto">
              <div
                v-for="person in filteredPeople"
                :key="person.id"
                class="p-2 hover:bg-blue-50 cursor-pointer text-sm"
                @mousedown.prevent="confirmAddPerson(person)"
              >
                {{ person.last_name }} {{ person.first_name }} {{ person.middle_name }} <span v-if="person.birth_date">({{ formatDate(person.birth_date) }})</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Нижний блок -->
        <div class="flex flex-col md:flex-row gap-6 mb-6">
          <!-- Левая часть: пустая или для будущих полей -->
          <div class="flex-1"></div>
          <!-- Правая часть: Паспортные данные + AmpluaSelect -->
          <div class="flex-1 space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Серия паспорта</label>
              <input v-model="passportSeries" type="text" maxlength="4" class="w-full p-2 border border-gray-300 rounded" placeholder="0000" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Номер паспорта</label>
              <input v-model="passportNumber" type="text" maxlength="6" class="w-full p-2 border border-gray-300 rounded" placeholder="000000" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
              <textarea v-model="address" class="w-full p-2 border border-gray-300 rounded" rows="2" placeholder="Введите адрес..."></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Амплуа</label>
              <AmpluaSelect v-model="selectedAmpluaId" :required="true" />
            </div>
          </div>
        </div>
        <div class="flex justify-between gap-3 mt-6">
          <button type="button" @click="$emit('close')" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Отмена</button>
          <button type="button" @click="openCreateModal" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Добавить нового игрока</button>
          <button type="submit" :disabled="!selectedAmpluaId || loading" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {{ loading ? 'Добавление...' : 'Добавить' }}
          </button>
        </div>
      </form>
      <CreateAndAddPlayerModal
        v-if="showCreateModal"
        :club-id="clubId"
        @close="showCreateModal = false"
        @player-created="onPlayerCreated"
      />
      <ConfirmAddPersonModal
        v-if="showConfirmModal"
        :person="personToConfirm"
        @close="showConfirmModal = false"
        @confirm="addExistingPersonToClub"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useApi } from '~/composables/useApi'
import CreateAndAddPlayerModal from '~/components/clubs/CreateAndAddPlayerModal.vue'
import AmpluaSelect from '~/components/people/AmpluaSelect.vue'

const props = defineProps({
  clubId: {
    type: [String, Number],
    required: true
  }
})
const emit = defineEmits(['close', 'player-added'])

const { apiRequest } = useApi()

// Основные поля
const lastName = ref('')
const firstName = ref('')
const middleName = ref('')
const birthDate = ref('')
const passportSeries = ref('')
const passportNumber = ref('')
const address = ref('')
const selectedAmpluaId = ref('')

// Поиск по фамилии
const filteredPeople = ref([])
const showDropdown = ref(false)
const loading = ref(false)
let searchTimeout = null

// Модалка создания и подтверждения
const showCreateModal = ref(false)
const showConfirmModal = ref(false)
const personToConfirm = ref(null)

const errorMessage = ref('')

// Умный поиск по трём отдельным полям ФИО
watch([lastName, firstName, middleName], () => {
  clearTimeout(searchTimeout)
  if (
    (lastName.value && lastName.value.length >= 2) ||
    (firstName.value && firstName.value.length >= 2) ||
    (middleName.value && middleName.value.length >= 2)
  ) {
    searchTimeout = setTimeout(searchPeople, 300)
  } else {
    filteredPeople.value = []
    showDropdown.value = false
  }
})

const searchPeople = async () => {
  let url = '/people/search?';
  if (lastName.value) url += `last_name=${encodeURIComponent(lastName.value)}&`;
  if (firstName.value) url += `first_name=${encodeURIComponent(firstName.value)}&`;
  if (middleName.value) url += `middle_name=${encodeURIComponent(middleName.value)}&`;
  url = url.replace(/&$/, '');

  if (!lastName.value && !firstName.value && !middleName.value) {
    filteredPeople.value = [];
    showDropdown.value = false;
    return;
  }
  showDropdown.value = true;
  const response = await apiRequest(url);
  let people = [];
  if (Array.isArray(response)) {
    people = response;
  } else if (response && response.success && Array.isArray(response.data)) {
    people = response.data;
  }
  filteredPeople.value = people.slice(0, 10);
}

const onBlur = () => {
  setTimeout(() => { showDropdown.value = false }, 150)
}

const confirmAddPerson = (person) => {
  personToConfirm.value = person
  showConfirmModal.value = true
}

const addExistingPersonToClub = async () => {
  if (!personToConfirm.value || !selectedAmpluaId.value) return
  loading.value = true
  errorMessage.value = ''
  try {
    await apiRequest(`/clubs/${props.clubId}/add-player-with-amplua`, {
      method: 'POST',
      body: {
        person_id: personToConfirm.value.id,
        amplua_id: selectedAmpluaId.value
      }
    })
    loading.value = false
    showConfirmModal.value = false
    emit('player-added')
    emit('close')
  } catch (error) {
    loading.value = false
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = error.message || 'Произошла ошибка при добавлении игрока'
    }
  }
}

const openCreateModal = () => {
  showCreateModal.value = true
}

const onPlayerCreated = (person) => {
  // После создания нового игрока из модалки — сразу выбираем его и закрываем модалку
  lastName.value = person.last_name
  firstName.value = person.first_name
  middleName.value = person.middle_name
  birthDate.value = person.birth_date
  showCreateModal.value = false
}

const addPlayer = async () => {
  if (!lastName.value || !firstName.value || !selectedAmpluaId.value) return
  loading.value = true
  errorMessage.value = ''
  try {
    await apiRequest(`/clubs/${props.clubId}/add-player-with-amplua`, {
      method: 'POST',
      body: {
        last_name: lastName.value,
        first_name: firstName.value,
        middle_name: middleName.value,
        birth_date: birthDate.value,
        passport_series: passportSeries.value,
        passport_number: passportNumber.value,
        address: address.value,
        amplua_id: selectedAmpluaId.value
      }
    })
    loading.value = false
    emit('player-added')
    emit('close')
  } catch (error) {
    loading.value = false
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = error.message || 'Произошла ошибка при добавлении игрока'
    }
  }
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU')
}
</script>

<!-- Модалка подтверждения -->
<template #ConfirmAddPersonModal="{ person, close, confirm }">
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-md w-full p-6">
      <h3 class="text-lg font-semibold mb-4">Добавить игрока?</h3>
      <div class="mb-4">
        <div class="font-medium text-lg mb-2">{{ person.last_name }} {{ person.first_name }} {{ person.middle_name }}</div>
        <div class="text-gray-500 mb-2">Дата рождения: {{ formatDate(person.birth_date) }}</div>
      </div>
      <div v-if="person.active_club_memberships && person.active_club_memberships.some(m => m.club_id == clubId)" class="text-green-700 font-bold mb-4 text-center">
        Этот игрок уже является членом клуба
      </div>
      <div class="flex justify-end gap-3 mt-6">
        <button type="button" @click="close" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Закрыть</button>
        <button v-if="!(person.active_club_memberships && person.active_club_memberships.some(m => m.club_id == clubId))" type="button" @click="confirm" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Добавить</button>
      </div>
    </div>
  </div>
</template> 