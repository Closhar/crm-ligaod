<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          {{ customTitle ? customTitle : (mode === 'create' ? 'Создать персону' : 'Редактировать персону') }}
        </h2>
        <button @click="$emit('close')" class="modal-close">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form @submit.prevent="savePerson" class="modal-body">
        <div v-if="generalError || nonFieldErrors.length" class="mb-4 p-3 bg-red-100 text-red-700 rounded text-center font-semibold">
          <div v-if="generalError">{{ generalError }}</div>
          <div v-for="err in nonFieldErrors" :key="err">{{ err }}</div>
        </div>
        <div class="form-grid">
          <!-- Верхний блок -->
          <div class="form-section flex flex-col justify-start">
            <h3 class="section-title">Основная информация</h3>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Фамилия *</label>
                <input
                  v-model="form.last_name"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.last_name }"
                  required
                />
                <span v-if="errors.last_name" class="error-text">{{ errors.last_name[0] }}</span>
              </div>
              <div class="form-group">
                <label class="form-label">Имя *</label>
                <input
                  v-model="form.first_name"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.first_name }"
                  required
                />
                <span v-if="errors.first_name" class="error-text">{{ errors.first_name[0] }}</span>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Отчество</label>
                <input
                  v-model="form.middle_name"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.middle_name }"
                />
                <span v-if="errors.middle_name" class="error-text">{{ errors.middle_name[0] }}</span>
              </div>
              <div class="form-group">
                <label class="form-label">Дата рождения</label>
                <input
                  v-model="form.birth_date"
                  type="date"
                  class="form-input"
                  :class="{ 'error': errors.birth_date }"
                  placeholder="Необязательно"
                />
                <span v-if="errors.birth_date" class="error-text">{{ errors.birth_date[0] }}</span>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Пол *</label>
                <select v-model="form.gender" class="form-input" :class="{ 'error': errors.gender }" required>
                  <option value="m">Мужской</option>
                  <option value="f">Женский</option>
                </select>
                <span v-if="errors.gender" class="error-text">{{ errors.gender[0] }}</span>
              </div>
              <div class="form-group flex flex-col justify-end ml-4">
                <label class="form-label">Активен</label>
                <KirhToggleField v-model="form.is_active" :options="{ labels: { on: 'Да', off: '' } }" />
              </div>
            </div>
          </div>
          <!-- Справа от основной информации: блок для вывода данных об игроках -->
          <div v-if="mode === 'create'" class="form-section flex flex-col justify-start">
            <h3 class="section-title">{{ context === 'people' ? 'Проверка персоны в базе' : 'Добавить игрока из базы' }}</h3>
            <div class="player-search-block min-h-[80px] bg-gray-50 border border-gray-200 rounded p-2 text-gray-700" style="margin-bottom: 10px;">
              <div v-if="playerSearchLoading" class="text-gray-400">Поиск...</div>
              <div v-else-if="playerSearchError" class="text-red-500">{{ playerSearchError }}</div>
              <div v-else-if="playerSearchResults.length === 0">Нет данных</div>
              <ul v-else>
                <li v-for="player in playerSearchResults" :key="player.id" class="hover:bg-blue-50 cursor-pointer rounded px-2 py-1 text-green-600 font-bold text-sm"
                  @click="context === 'people' ? showPlayerInfo(player) : selectPlayerFromSearch(player)">
                  {{ player.label }}
                </li>
              </ul>
            </div>
          </div>
          <!-- Нижний блок -->
          <div class="form-section flex flex-col justify-start">
            <h3 class="section-title">Паспортные данные</h3>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Серия паспорта</label>
                <input
                  v-model="form.passport_series"
                  type="text"
                  maxlength="4"
                  class="form-input"
                  :class="{ 'error': errors.passport_series }"
                  placeholder="0000"
                />
                <span v-if="errors.passport_series" class="error-text">{{ errors.passport_series[0] }}</span>
              </div>
              <div class="form-group">
                <label class="form-label">Номер паспорта</label>
                <input
                  v-model="form.passport_number"
                  type="text"
                  maxlength="6"
                  class="form-input"
                  :class="{ 'error': errors.passport_number }"
                  placeholder="000000"
                />
                <span v-if="errors.passport_number" class="error-text">{{ errors.passport_number[0] }}</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Адрес</label>
              <textarea
                v-model="form.address"
                class="form-textarea"
                :class="{ 'error': errors.address }"
                rows="3"
                placeholder="Введите адрес..."
              ></textarea>
              <span v-if="errors.address" class="error-text">{{ errors.address[0] }}</span>
            </div>
          </div>
          <!-- Справа от паспортных данных: AmpluaSelect или PositionSelect -->
          <div v-if="mode === 'create' && showAmpluaSelect" class="form-section flex flex-col justify-start">
            <h3 class="section-title">Амплуа</h3>
            <div class="form-group">
              <AmpluaSelect
                v-model="selectedAmpluaId"
                label="Амплуа *"
                :required="true"
              />
            </div>
          </div>
          <div v-if="mode === 'create' && !showAmpluaSelect && context !== 'people'" class="form-section flex flex-col justify-start">
            <h3 class="section-title">Должность</h3>
            <div class="form-group">
              <PositionSelect
                v-model="selectedPositionId"
                label="Должность *"
                :required="true"
              />
            </div>
          </div>
        </div>
        <!-- Блок О себе на всю ширину -->
        <div class="about-block bg-gray-50 rounded-lg p-4 mt-6" style="grid-column: 1 / -1;">
          <label class="form-label mb-2 block">О себе</label>
          <RichTextEditor v-model="form.about" :editor-enabled="true" />
        </div>
        <div class="modal-footer mt-6 pb-8 pl-4 pr-4">
          <button type="button" @click="$emit('close')" class="btn-secondary">
            Отмена
          </button>
          <button type="submit" class="btn-primary" :disabled="saving || (mode === 'create' && context !== 'people' && ((showAmpluaSelect && !selectedAmpluaId) || (!showAmpluaSelect && !selectedPositionId)))">
            <span v-if="saving">Сохранение...</span>
            <span v-else>{{ mode === 'create' ? 'Создать' : 'Сохранить' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Модалка подтверждения добавления игрока в клуб -->
  <template v-if="showConfirmModal">
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 v-if="!alreadyInClub" class="text-lg font-semibold mb-4">Добавить игрока в клуб?</h3>
        <div class="mb-4">
          <div class="font-medium text-lg mb-2">{{ personToConfirm.full_name }}</div>
          <div class="text-gray-500 mb-2" v-if="personToConfirm.birth_date">Дата рождения: {{ new Date(personToConfirm.birth_date).toLocaleDateString('ru-RU') }}</div>
          <div class="text-gray-500 mb-2" v-if="personToConfirm.address">Адрес: {{ personToConfirm.address }}</div>
          <div class="text-gray-500 mb-2" v-if="personToConfirm.passport_series || personToConfirm.passport_number">
            Паспорт: {{ personToConfirm.passport_series }} {{ personToConfirm.passport_number }}
          </div>
          <div v-if="alreadyInClub" class="text-green-700 font-semibold mt-4 mb-2">Этот игрок уже является членом клуба</div>
          <div v-if="props.showAmpluaSelect ? alreadyInSportAsPlayer : alreadyInSportAsStaff" class="text-red-700 font-semibold mt-4 mb-2">
            Этот человек уже состоит в этом виде спорта в выбранной роли
          </div>
        </div>
        <div class="mb-4">
          <!-- Если уже есть нужная связь, показываем только предупреждение -->
          <div v-if="props.showAmpluaSelect && alreadyHasAmpluaInSport" class="text-red-700 font-semibold mt-4 mb-2">
            У этого человека уже есть амплуа в этом виде спорта
          </div>
          <div v-else-if="!props.showAmpluaSelect && alreadyHasPositionInSport" class="text-red-700 font-semibold mt-4 mb-2">
            У этого человека уже есть должность в этом виде спорта
          </div>
          <!-- Если нет нужной связи, показываем селект и кнопку -->
          <template v-else>
            <div v-if="props.showAmpluaSelect">
              <AmpluaSelect v-model="selectedAmpluaId" label="Амплуа *" :required="true" />
            </div>
            <div v-else>
              <PositionSelect v-model="selectedPositionId" label="Должность *" :required="true" />
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button type="button" @click="showConfirmModal = false" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Закрыть</button>
              <button
                type="button"
                @click="confirmAddPersonToClub"
                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                :disabled="confirmLoading || (props.showAmpluaSelect ? !selectedAmpluaId : !selectedPositionId)"
              >
                {{ confirmLoading ? 'Добавление...' : 'Добавить' }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </template>

  <!-- Добавить инфо-модалку (если context==='people') -->
  <template v-if="showPlayerInfoModal">
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-4">Информация о персоне</h3>
        <div class="mb-4">
          <div class="font-medium text-lg mb-2">{{ personToShow.full_name }}</div>
          <div class="text-gray-500 mb-2" v-if="personToShow.birth_date">Дата рождения: {{ new Date(personToShow.birth_date).toLocaleDateString('ru-RU') }}</div>
          <div class="text-gray-500 mb-2" v-if="personToShow.address">Адрес: {{ personToShow.address }}</div>
          <div class="text-gray-500 mb-2" v-if="personToShow.passport_series || personToShow.passport_number">
            Паспорт: {{ personToShow.passport_series }} {{ personToShow.passport_number }}
          </div>
          <div class="text-blue-700 font-semibold mt-4 mb-2">Эта персона уже существует в базе данных</div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button type="button" @click="showPlayerInfoModal = false" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Закрыть</button>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
import { useApi } from '@/composables/useApi'
import { computed, reactive, ref, watch } from 'vue'
import RichTextEditor from '~/components/kirh/table/editor/RichTextEditor.vue'
import KirhToggleField from '~/components/kirh/table/fields/KirhToggleField.vue'
import AmpluaSelect from './AmpluaSelect.vue'
import PositionSelect from './PositionSelect.vue'

// Используем composable для API
const { apiRequest } = useApi()
const playerSearchResults = ref([])
const playerSearchLoading = ref(false)
const playerSearchError = ref('')
let playerSearchTimeout = null

const showConfirmModal = ref(false)
const personToConfirm = ref(null)
const confirmLoading = ref(false)
const generalError = ref('')

const showPlayerInfoModal = ref(false)
const personToShow = ref(null)

// Props
const props = defineProps({
  person: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    required: true,
    validator: (value) => ['create', 'edit'].includes(value)
  },
  showAmpluaSelect: {
    type: Boolean,
    default: false
  },
  clubId: {
    type: [String, Number],
    default: undefined
  },
  sportId: {
    type: [String, Number],
    default: undefined
  },
  context: {
    type: String,
    default: 'club',
    validator: v => ['club', 'people'].includes(v)
  },
  customTitle: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['close', 'saved'])

// Состояние
const saving = ref(false)
const errors = reactive({})

// Форма
const form = reactive({
  first_name: '',
  last_name: '',
  middle_name: '',
  birth_date: '',
  passport_series: '',
  passport_number: '',
  address: '',
  gender: 'm',
  is_active: true,
  about: '',
})

// Удаляю ampluas и загрузку ampluas, оставляю только selectedAmpluaId
const selectedAmpluaId = ref('')
const selectedPositionId = ref('')

// Проверка: есть ли у выбранной персоны активная должность/амплуа по спорту
const hasActivePosition = computed(() => {
  if (!personToConfirm.value || !props.sportId) return false
  return Array.isArray(personToConfirm.value.position_memberships)
    ? personToConfirm.value.position_memberships.some(
        m => m.sport_id == props.sportId && !m.ended_at
      )
    : false
})
const hasActiveAmplua = computed(() => {
  if (!personToConfirm.value || !props.sportId) return false
  return Array.isArray(personToConfirm.value.amplua_memberships)
    ? personToConfirm.value.amplua_memberships.some(
        m => m.sport_id == props.sportId && !m.ended_at
      )
    : false
})

// Добавляю вычисляемые свойства для проверки роли
const alreadyInSportAsPlayer = computed(() => {
  if (!personToConfirm.value || !props.sportId) return false;
  const ampluaMemberships = personToConfirm.value.amplua_memberships || [];
  return ampluaMemberships.some(m => String(m.sport_id) === String(props.sportId) && (!m.ended_at || m.ended_at === null));
});
const alreadyInSportAsStaff = computed(() => {
  if (!personToConfirm.value || !props.sportId) return false;
  const positionMemberships = personToConfirm.value.position_memberships || [];
  return positionMemberships.some(m => String(m.sport_id) === String(props.sportId) && (!m.ended_at || m.ended_at === null));
});

// Найти вычисляемое alreadyInSport, которое определяет, есть ли у персоны активное sport-membership с этим sportId
const alreadyInSport = computed(() => {
  if (!personToConfirm.value || !props.sportId) return false;
  const memberships = personToConfirm.value.sport_memberships || [];
  return memberships.some(m => String(m.sport_id) === String(props.sportId) && (!m.ended_at || m.ended_at === null));
});

// Добавляю функцию для проверки наличия активной sport-membership
const hasActiveSportMembership = (person) => {
  if (!person || !props.sportId) return false;
  const memberships = person.sport_memberships || [];
  return memberships.some(m => String(m.sport_id) === String(props.sportId) && (!m.ended_at || m.ended_at === null));
};

// 1. Добавляю вычисляемые свойства для проверки наличия активной amplua/position по спорту
const alreadyHasAmpluaInSport = computed(() => {
  if (!personToConfirm.value || !props.sportId || !personToConfirm.value.amplua_memberships) return false;
  return personToConfirm.value.amplua_memberships.some(m => String(m.sport_id) === String(props.sportId) && (!m.ended_at || m.ended_at === null));
});
const alreadyHasPositionInSport = computed(() => {
  if (!personToConfirm.value || !props.sportId || !personToConfirm.value.position_memberships) return false;
  return personToConfirm.value.position_memberships.some(m => String(m.sport_id) === String(props.sportId) && (!m.ended_at || m.ended_at === null));
});

// Удаляю onMounted, связанный с ampluas

// Функция для форматирования даты в формат yyyy-MM-dd
const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    
    // Форматируем дату в формат yyyy-MM-dd
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch (error) {
    console.warn('Ошибка форматирования даты:', error)
    return ''
  }
}

// Умный автопоиск по трём полям ФИО
watch([
  () => form.last_name,
  () => form.first_name,
  () => form.middle_name,
  () => form.birth_date
], () => {
  if (playerSearchTimeout) clearTimeout(playerSearchTimeout)
  if (
    (form.last_name && form.last_name.length >= 2) ||
    (form.first_name && form.first_name.length >= 2) ||
    (form.middle_name && form.middle_name.length >= 2) ||
    (form.birth_date && form.birth_date.length >= 4)
  ) {
    playerSearchTimeout = setTimeout(searchPlayersByFio, 400)
  } else {
    playerSearchResults.value = []
    playerSearchError.value = ''
  }
})

const searchPlayersByFio = async () => {
  playerSearchLoading.value = true
  playerSearchError.value = ''
  let url = '/people/search?';
  if (form.last_name) url += `last_name=${encodeURIComponent(form.last_name)}&`;
  if (form.first_name) url += `first_name=${encodeURIComponent(form.first_name)}&`;
  if (form.middle_name) url += `middle_name=${encodeURIComponent(form.middle_name)}&`;
  if (form.birth_date) url += `birth_date=${encodeURIComponent(form.birth_date)}&`;
  url = url.replace(/&$/, '');
  try {
    const response = await apiRequest(url)
    let people = []
    if (Array.isArray(response)) {
      people = response
    } else if (response && response.success && Array.isArray(response.data)) {
      people = response.data
    }
    playerSearchResults.value = people.slice(0, 10)
  } catch (e) {
    playerSearchError.value = 'Ошибка поиска'
    playerSearchResults.value = []
  } finally {
    playerSearchLoading.value = false
  }
}

const selectPlayerFromSearch = async (player) => {
  // ВСЕГДА грузим свежие данные о персоне
  try {
    const response = await apiRequest(`/people/${player.id}`)
    personToConfirm.value = response && response.data ? response.data : response
  } catch (e) {
    personToConfirm.value = player // fallback
  }
  showConfirmModal.value = true
}

const showPlayerInfo = async (player) => {
  let person = player
  if (!player.first_name || !player.last_name) {
    try {
      const response = await apiRequest(`/people/${player.id}`)
      person = response && response.data ? response.data : response
    } catch (e) {
      return
    }
  }
  personToShow.value = person
  showPlayerInfoModal.value = true
}

const confirmAddPersonToClub = async () => {
  if (!personToConfirm.value) {
    alert('Не выбран игрок');
    return;
  }
  if (!props.clubId && !props.sportId) {
    alert('Не выбран клуб или вид спорта');
    return;
  }
  // Жёсткая проверка на дублирующую связь
  if ((props.showAmpluaSelect && alreadyHasAmpluaInSport.value) || (!props.showAmpluaSelect && alreadyHasPositionInSport.value)) {
    alert(props.showAmpluaSelect ? 'У этого человека уже есть амплуа в этом виде спорта' : 'У этого человека уже есть должность в этом виде спорта');
    return;
  }
  confirmLoading.value = true
  try {
    if (props.clubId) {
      // Привязка к клубу (старое поведение)
      const body = {
        person_id: personToConfirm.value.id
      };
      if (selectedAmpluaId.value) {
        body.amplua_id = selectedAmpluaId.value;
      }
      if (!props.showAmpluaSelect && selectedPositionId.value) {
        body.position_id = selectedPositionId.value;
      }
      await apiRequest(`/clubs/${props.clubId}/${props.showAmpluaSelect ? 'add-player-with-amplua' : 'add-staff-with-position'}`, {
        method: 'POST',
        body
      })
    } else if (props.sportId) {
      // Привязка к спорту (новое поведение)
      // 1. sport-membership
      const sportIdToSend = props.sportId;
      if (!sportIdToSend) {
        alert('Ошибка: sportId не определён');
        confirmLoading.value = false;
        return;
      }
      if (!hasActiveSportMembership(personToConfirm.value)) {
        await apiRequest(`/people/${personToConfirm.value.id}/sport-memberships`, {
          method: 'POST',
          body: {
            sport_id: sportIdToSend,
            started_at: new Date().toISOString().slice(0, 10)
          }
        })
      }
      // 2. amplua-membership (если выбран amplua)
      if (selectedAmpluaId.value) {
        await apiRequest(`/people/${personToConfirm.value.id}/amplua-memberships`, {
          method: 'POST',
          body: {
            amplua_id: selectedAmpluaId.value,
            sport_id: props.sportId,
            started_at: new Date().toISOString().slice(0, 10)
          }
        })
      }
      // 3. position-membership (если выбран position)
      if (selectedPositionId.value) {
        await apiRequest(`/people/${personToConfirm.value.id}/position-memberships`, {
          method: 'POST',
          body: {
            position_id: selectedPositionId.value,
            sport_id: props.sportId,
            started_at: new Date().toISOString().slice(0, 10)
          }
        })
      }
    }
    showConfirmModal.value = false
    emit('saved')
  } catch (e) {
    let msg = 'Ошибка при добавлении игрока: ';
    if (e?.data?.message) msg += e.data.message;
    else if (e?.data?.errors) msg += Object.values(e.data.errors).flat().join('; ');
    else if (e?.message) msg += e.message;
    else msg += JSON.stringify(e);
    alert(msg);
  } finally {
    confirmLoading.value = false
  }
}

// Заполнение формы при редактировании
watch(() => props.person, (person) => {
  if (person && props.mode === 'edit') {
    Object.assign(form, {
      first_name: person.first_name || '',
      last_name: person.last_name || '',
      middle_name: person.middle_name || '',
      birth_date: formatDateForInput(person.birth_date),
      passport_series: person.passport_series || '',
      passport_number: person.passport_number || '',
      address: person.address || '',
      gender: person.gender || 'm',
      is_active: typeof person.is_active === 'boolean' ? person.is_active : true,
      about: person.about || '',
    })
  } else if (props.mode === 'create') {
    // Сброс формы для создания
    Object.assign(form, {
      first_name: '',
      last_name: '',
      middle_name: '',
      birth_date: '',
      passport_series: '',
      passport_number: '',
      address: '',
      gender: 'm',
      is_active: true,
      about: '',
    })
  }
}, { immediate: true })

watch(() => props.mode, (val) => {
  if (val === 'create') {
    selectedAmpluaId.value = ''
    selectedPositionId.value = ''
  }
})

// Сохранение персоны
const savePerson = async () => {
  saving.value = true
  Object.keys(errors).forEach(key => delete errors[key])
  generalError.value = ''
  try {
    // Подготавливаем данные персоны
    const personData = {
      first_name: form.first_name,
      last_name: form.last_name,
      middle_name: form.middle_name,
      birth_date: form.birth_date,
      passport_series: form.passport_series,
      passport_number: form.passport_number,
      address: form.address,
      gender: form.gender,
      is_active: form.is_active,
      about: form.about,
    }
    let response
    let createdPerson = null
    if (props.mode === 'create') {
      // Создаем персону
      response = await apiRequest('/people', { 
        method: 'POST',
        body: personData
      })
      if (response.success && response.data) {
        createdPerson = response.data
        // Если нужно добавить в клуб с амплуа
        if (props.showAmpluaSelect && props.clubId && selectedAmpluaId.value) {
          await apiRequest(`/clubs/${props.clubId}/add-player-with-amplua`, {
            method: 'POST',
            body: {
              person_id: createdPerson.id,
              amplua_id: selectedAmpluaId.value
            }
          })
        }
        // Если создаём сотрудника с должностью для клуба
        if (!props.showAmpluaSelect && selectedPositionId.value && props.clubId) {
          try {
            await apiRequest(`/clubs/${props.clubId}/add-staff-with-position`, {
              method: 'POST',
              body: {
                person_id: createdPerson.id,
                position_id: selectedPositionId.value,
                started_at: new Date().toISOString().slice(0, 10)
              }
            })
          } catch (e) {
            // обработка ошибки add-staff-with-position
          }
        }
        // --- ДОБАВЛЕНО: Если создаём сотрудника с должностью для вида спорта ---
        if (!props.showAmpluaSelect && selectedPositionId.value && props.sportId) {
          // Сначала создаём sport-membership
          try {
            await apiRequest(`/people/${createdPerson.id}/sport-memberships`, {
              method: 'POST',
              body: {
                sport_id: props.sportId,
                started_at: new Date().toISOString().slice(0, 10)
              }
            })
          } catch (e) {
            // обработка ошибки sport-membership
          }
          // Затем создаём position-membership
          try {
            await apiRequest(`/people/${createdPerson.id}/position-memberships`, {
              method: 'POST',
              body: {
                position_id: selectedPositionId.value,
                sport_id: props.sportId,
                started_at: new Date().toISOString().slice(0, 10)
              }
            })
          } catch (e) {
            // обработка ошибки position-membership
          }
        }
      }
    } else {
      // Обновляем персону
      response = await apiRequest(`/people/${props.person.id}`, { 
        method: 'PUT',
        body: personData
      })
    }
    if (response.success) {
      if (props.mode === 'create' && createdPerson) {
        emit('saved', {
          ...createdPerson,
          amplua_id: selectedAmpluaId.value || null,
          position_id: selectedPositionId.value || null
        })
      } else {
        emit('saved')
      }
    } else if (response.errors) {
      Object.assign(errors, response.errors)
    } else if (response.message) {
      generalError.value = response.message
    }
  } catch (error) {
    const errData = error.data || error._data || error.response?.data;
    if (errData?.errors) {
      Object.assign(errors, errData.errors);
    } else if (errData?.message) {
      generalError.value = errData.message;
    } else if (typeof errData === 'object' && errData !== null) {
      generalError.value = Object.values(errData).flat().join(' ') || JSON.stringify(errData);
    } else if (typeof errData === 'string') {
      generalError.value = errData;
    } else if (error.response) {
      generalError.value = `[${error.response.status}] ${error.response.config?.url || ''}`;
    } else if (error.status) {
      generalError.value = `[${error.status}]`;
    } else {
      generalError.value = error.message || 'Произошла ошибка при сохранении персоны';
    }
  } finally {
    saving.value = false
  }
}

const formFieldKeys = ['first_name', 'last_name', 'middle_name', 'birth_date', 'passport_series', 'passport_number', 'address']
const nonFieldErrors = computed(() => {
  return Object.entries(errors)
    .filter(([key]) => !formFieldKeys.includes(key))
    .flatMap(([, val]) => Array.isArray(val) ? val : [val])
    .filter(Boolean)
})

// Проверка: состоит ли выбранный игрок уже в клубе
const alreadyInClub = computed(() => {
  if (!personToConfirm.value || !props.clubId) return false;
  // Используем snake_case, как в API
  const memberships = personToConfirm.value.active_club_memberships || [];
  return memberships.some(m => String(m.club_id) === String(props.clubId) && (!m.left_at || m.left_at === null));
});
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60];
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto;
}

.modal-header {
  @apply flex justify-between items-center p-6 border-b border-gray-200;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900;
}

.modal-close {
  @apply text-gray-400 hover:text-gray-600 transition-colors;
}

.modal-body {
  @apply p-6;
}

.form-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

.form-section {
  @apply space-y-4;
}

.section-title {
  @apply text-lg font-medium text-gray-900 border-b border-gray-200 pb-2;
  font-weight: bold;
  color: #8B0000;
}

.form-row {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.form-group {
  @apply flex flex-col;
}

.form-label {
  @apply text-sm font-medium text-gray-700 mb-1;
}

.form-input,
.form-textarea {
  @apply border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.form-input.error,
.form-textarea.error {
  @apply border-red-500 focus:ring-red-500;
}

.error-text {
  @apply text-sm text-red-600 mt-1;
}

.modal-footer {
  @apply flex justify-end gap-3 pt-6 border-t border-gray-200;
}

.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50;
}

.btn-secondary {
  @apply bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md;
}

.about-block {
  width: 100%;
}
</style> 