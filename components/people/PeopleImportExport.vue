<template>
  <div>
    <button class="btn btn-primary mr-2" @click="showImportModal = true">
      <Icon icon="ri:file-upload-line" class="w-5 h-5 mr-1 align-middle" /> Импорт
    </button>
    <button class="btn btn-secondary" @click="showExportModal = true">
      <Icon icon="ri:file-download-line" class="w-5 h-5 mr-1 align-middle" /> Экспорт
    </button>

    <!-- Модалка импорта -->
    <div v-if="showImportModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Импорт персон</h2>
        <template v-if="importStep === 1">
          <div class="mb-4">
            <label class="block mb-2 font-semibold">Загрузите файл (Excel, CSV, TXT):</label>
            <input type="file" accept=".csv,.xlsx,.xls,.txt" @change="onFileChange" />
          </div>
          <div class="mb-4">
            <label class="block mb-2 font-semibold">или укажите ссылку на Google Sheets:</label>
            <input type="text" v-model="googleSheetUrl" placeholder="https://docs.google.com/..." class="w-full border rounded px-2 py-1" />
          </div>
          <div class="mb-4">
            <label class="inline-flex items-center">
              <input type="checkbox" v-model="hasHeader" class="mr-2" />
              В файле есть заголовки столбцов
            </label>
          </div>
          <div class="mb-4">
            <label class="block mb-2 font-semibold">Пол для новых персон:</label>
            <select v-model="gender" class="w-full border rounded px-2 py-1">
              <option value="m">Мужской</option>
              <option value="f">Женский</option>
            </select>
            <div class="text-xs text-gray-500 mt-1">Если в строке не указан пол, будет использовано выбранное здесь значение</div>
          </div>
          <div class="mb-4">
            <label class="block mb-2 font-semibold">Амплуа по умолчанию:</label>
            <AmpluaSelect v-model="defaultAmplua" :placeholder="'Выберите или введите амплуа'" :label="''" />
            <div class="text-xs text-gray-500 mt-1">Если в строке не указано амплуа, будет использовано выбранное здесь значение</div>
          </div>
          <div class="mb-4">
            <label class="block mb-2 font-semibold">Должность по умолчанию:</label>
            <PositionSelect v-model="defaultPosition" :placeholder="'Выберите или введите должность'" :label="''" />
            <div class="text-xs text-gray-500 mt-1">Если в строке не указана должность, будет использовано выбранное здесь значение</div>
          </div>
          <div class="flex gap-2 mt-4">
            <button class="btn btn-primary" @click="onImportUpload">Загрузить</button>
            <button class="btn btn-secondary" @click="showImportModal = false">Отмена</button>
          </div>
        </template>
        <template v-else-if="importStep === 2">
          <div class="mb-2 font-semibold">Сопоставьте поля файла с полями системы:</div>
          <div class="overflow-x-auto mb-2">
            <table class="w-full border mb-2">
              <thead>
                <tr>
                  <th v-for="(col, idx) in importPreviewColumns" :key="'head-'+idx" class="border px-2 py-1">
                    <select v-model="fieldMapping[idx]" class="border rounded px-1 py-0.5">
                      <option value="">Не импортировать</option>
                      <option v-for="field in importFields" :key="field.value" :value="field.value">{{ field.label }}</option>
                    </select>
                  </th>
                </tr>
                <tr>
                  <th v-for="(col, idx) in importPreviewColumns" :key="'col-'+idx" class="border px-2 py-1">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rIdx) in importPreviewRows" :key="'row-'+rIdx">
                  <td v-for="(cell, cIdx) in row" :key="'cell-'+cIdx" class="border px-2 py-1">{{ cell }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="importStep === 2 && isFullNameAndOtherFieldsSelected" class="mb-2 text-red-600 text-sm">
            Внимание: если выбран столбец "ФИО", не выбирайте одновременно отдельные поля "Имя", "Фамилия", "Отчество" — иначе данные будут некорректны!
          </div>
          <div class="flex gap-2 mt-4">
            <button class="btn btn-primary" @click="onImportNext">Далее</button>
            <button class="btn btn-secondary" @click="importStep = 1">Назад</button>
          </div>
        </template>
        <template v-else-if="importStep === 3">
          <div class="mb-2 font-semibold">Отчёт по импорту:</div>
          <ul class="mb-2">
            <li>Импортировано: {{ mockReport.imported }}</li>
            <li>Обновлено: {{ mockReport.updated }}</li>
            <li>Не импортировано: {{ mockReport.failed.length }}</li>
          </ul>
          <div v-if="mockReport.failed.length" class="mb-2">
            <div class="font-semibold">Причины ошибок:</div>
            <ul class="text-sm text-red-600">
              <li v-for="(fail, idx) in mockReport.failed" :key="'fail-'+idx">
                Строка {{ fail.row }}: {{ fail.reason }}
              </li>
            </ul>
          </div>
          <div class="flex gap-2 mt-4">
            <button class="btn btn-secondary" @click="onImportClose">Закрыть</button>
            <button class="btn btn-primary" v-if="mockReport.failed.length" @click="importStep = 2">Назад</button>
          </div>
        </template>
      </div>
    </div>

    <!-- Модалка экспорта -->
    <div v-if="showExportModal" class="modal-overlay">
      <div class="modal-content export-modal">
        <h2 class="flex items-center gap-2 text-xl font-bold mb-2">
          <Icon icon="ri:file-download-line" class="w-6 h-6 text-blue-600" /> Экспорт персон
        </h2>
        <p class="mb-3 text-gray-600">Выберите поля для экспорта и формат файла.</p>
        <div class="export-fields-grid mb-3">
          <label v-for="field in exportFields" :key="field.value" class="export-switch-label">
            <input type="checkbox" v-model="selectedExportFields" :value="field.value" class="export-switch-input" />
            <span class="export-switch-slider"></span>
            <span class="export-switch-text">{{ field.label }}</span>
          </label>
        </div>
        <div class="mt-2">
          <label class="block mb-2 font-semibold">Экспортировать:</label>
          <div class="relative export-select-wrapper mb-2">
            <Icon icon="ri-group-line" class="export-select-icon" />
            <select v-model="exportGroup" class="export-select">
              <option value="all">Всех</option>
              <option value="players">Только спортсменов</option>
              <option value="staff">Только сотрудников</option>
            </select>
          </div>
          <label class="block mb-2 font-semibold">Формат:</label>
          <div class="relative export-select-wrapper">
            <Icon icon="ri-file-list-3-line" class="export-select-icon" />
            <select v-model="exportFormat" class="export-select">
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
              <option value="txt">TXT</option>
            </select>
          </div>
        </div>
        <div class="flex gap-2 mt-6">
          <button class="btn btn-primary flex items-center gap-2" @click="downloadExport">
            <Icon icon="ri-download-2-line" class="w-5 h-5" /> Скачать
          </button>
          <button class="btn btn-secondary flex items-center gap-2" @click="showExportModal = false">
            <Icon icon="ri-close-circle-line" class="w-5 h-5" /> Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import * as XLSX from 'xlsx'
// @ts-ignore
import { Icon } from '@iconify/vue'
import { useApi } from '../../composables/useApi'
import AmpluaSelect from './AmpluaSelect.vue'
import PositionSelect from './PositionSelect.vue'
// Простая функция для парсинга CSV
function parseCSV(csv: string): string[][] {
  const lines = csv.split('\n').filter(line => line.trim())
  return lines.map(line => {
    const result = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  })
}
const ampluasList = ref<any[]>([])
const positionsList = ref<any[]>([])
const { apiRequest } = useApi()

const emit = defineEmits(['imported'])
const showImportModal = ref(false)
const showExportModal = ref(false)

// Импорт
const googleSheetUrl = ref('')
const importFile = ref<File|null>(null)
function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    importFile.value = files[0]
  }
}
const importStep = ref(1)
const hasHeader = ref(true)
const gender = ref<string>('m')
const defaultAmplua = ref('')
const defaultPosition = ref('')

// Мок-данные для предпросмотра
const importPreviewColumns = ref<string[]>([])
const importPreviewRows = ref<string[][]>([])
const allImportRows = ref<string[][]>([])
const fieldMapping = reactive<{[key:number]: string}>({})
const importFields = [
  { value: 'surname', label: 'Фамилия' },
  { value: 'name', label: 'Имя' },
  { value: 'patronymic', label: 'Отчество' },
  { value: 'birth_date', label: 'Дата рождения' },
  { value: 'amplua', label: 'Амплуа' },
  { value: 'position', label: 'Должность' },
  { value: 'gender', label: 'Пол' },
  { value: 'player_number', label: 'Номер' }, // Новое поле
  { value: 'full_name', label: 'ФИО' },
  { value: 'about', label: 'О себе' }, // Новое поле
]

const isFullNameAndOtherFieldsSelected = computed(() => {
  const selected = Object.values(fieldMapping)
  return selected.includes('full_name') && (selected.includes('name') || selected.includes('surname') || selected.includes('patronymic'))
})

async function fetchAmpluasList() {
  try {
    const response = await apiRequest('/ampluas')
    if (Array.isArray(response)) {
      ampluasList.value = response
    } else if (response && response.data && Array.isArray(response.data)) {
      ampluasList.value = response.data
    } else {
      ampluasList.value = []
    }
  } catch (e) {
    ampluasList.value = []
  }
}

async function fetchPositionsList() {
  try {
    const response = await apiRequest('/positions')
    if (Array.isArray(response)) {
      positionsList.value = response
    } else if (response && response.data && Array.isArray(response.data)) {
      positionsList.value = response.data
    } else {
      positionsList.value = []
    }
  } catch (e) {
    positionsList.value = []
  }
}

// Загружаем списки при открытии модалки импорта
watch(showImportModal, (val) => { if (val) { fetchAmpluasList(); fetchPositionsList(); } })

function parseGender(value: string, fallback: string): string {
  if (!value) return fallback
  const v = value.trim().toLowerCase()
  if ([
    'м', 'муж', 'мужчина', 'мужской', 'мужчины', 'male', 'man', 'm', 'm.'
  ].includes(v)) return 'm'
  if ([
    'ж', 'жен', 'женщина', 'женский', 'женщины', 'female', 'woman', 'f', 'f.'
  ].includes(v)) return 'f'
  return fallback
}

function normalizeBirthDate(date: string): string | null {
  if (!date) return null
  // Если уже ISO-формат
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
  // Если дд.мм.гггг
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
    const [d, m, y] = date.split('.')
    return `${y}-${m}-${d}`
  }
  // Если мм/дд/гггг
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    const [m, d, y] = date.split('/')
    return `${y}-${m}-${d}`
  }
  // Попробовать Date.parse
  const parsed = new Date(date)
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10)
  }
  return null
}

function onImportUpload() {
  if (!importFile.value && !googleSheetUrl.value) {
    alert('Пожалуйста, выберите файл или введите ссылку на Google Sheets')
    return
  }
  if (importFile.value) {
    const file = importFile.value
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target?.result
      if (!data) return
      // Excel
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 })
        fillImportPreview(json)
      } else if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        // CSV/TXT
        const parsed = parseCSV(data as string)
        fillImportPreview(parsed)
      } else {
        alert('Неподдерживаемый формат файла')
      }
    }
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.readAsBinaryString(file)
    } else {
      reader.readAsText(file, 'utf-8')
    }
  } else if (googleSheetUrl.value) {
    // Google Sheets: пробуем получить CSV-экспорт
    const match = googleSheetUrl.value.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    if (match) {
      const sheetId = match[1]
      // Формируем ссылку на CSV первого листа
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`
      fetch(csvUrl)
        .then(r => r.text())
        .then(csv => {
          const parsed = parseCSV(csv)
          fillImportPreview(parsed)
        })
        .catch(() => alert('Не удалось загрузить Google Sheets как CSV. Проверьте публичность документа.'))
    } else {
      alert('Некорректная ссылка на Google Sheets')
    }
  }
}
function fillImportPreview(data: any) {
  if (!data || !data.length) {
    alert('Файл пуст или не распознан')
    return
  }
  // Приводим к массиву массивов строк
  const arr: any[][] = Array.isArray(data) ? data.map((row: any) => Array.isArray(row) ? row : Object.values(row)) : []
  let columns: string[] = []
  let rows: any[][] = []
  if (hasHeader.value) {
    columns = arr[0].map((col: any, idx: number) => typeof col === 'string' && col.trim() ? col : `Столбец ${idx+1}`)
    rows = arr.slice(1, 6)
    allImportRows.value = arr.slice(1)
  } else {
    columns = arr[0].map((_: any, idx: number) => `Столбец ${idx+1}`)
    rows = arr.slice(0, 5)
    allImportRows.value = arr
  }
  importPreviewColumns.value = columns
  importPreviewRows.value = rows
  for (let i = 0; i < importPreviewColumns.value.length; i++) fieldMapping[i] = ''
  importStep.value = 2
}
const mockReport = reactive({
  imported: 3,
  updated: 1,
  failed: [
    { row: 2, reason: 'Не указано имя' },
    { row: 5, reason: 'Дубликат (ФИО + дата рождения)' },
  ]
})
const props = defineProps({
  sportId: { type: [String, Number], default: '' },
  clubId: { type: [String, Number], default: '' },
  players: { type: Array, default: undefined }, // спортсмены
  staff: { type: Array, default: undefined }    // сотрудники
})

async function onImportNext() {
  const mappedRows = allImportRows.value.map((row, rowIdx) => {
    const obj: any = {}
    let fullNameIdx = null
    for (let i = 0; i < row.length; i++) {
      if (fieldMapping[i] === 'full_name') fullNameIdx = i
    }
    if (fullNameIdx !== null) {
      const parts = (row[fullNameIdx] || '').toString().split(' ')
      obj.surname = parts[0] || ''
      obj.name = parts[1] || ''
      obj.patronymic = parts[2] || ''
      for (let i = 0; i < row.length; i++) {
        const field = fieldMapping[i]
        if (!field || field === 'full_name' || field === 'surname' || field === 'name' || field === 'patronymic') continue
        obj[field] = row[i] || ''
      }
    } else {
      for (let i = 0; i < row.length; i++) {
        const field = fieldMapping[i]
        if (!field) continue
        obj[field] = row[i] || ''
      }
    }
    obj._row = rowIdx + (hasHeader.value ? 2 : 1)
    // Приводим player_number к строке (или числу, если нужно)
    if (obj.player_number !== undefined) {
      obj.player_number = obj.player_number ? String(obj.player_number).trim() : ''
    }
    return obj
  })
  // Формируем массив для отправки на бэкенд
  const importPayload = mappedRows.map(obj => {
    let ampluaName = '';
    // Если в файле указано название амплуа (не id)
    if (typeof obj.amplua === 'string' && isNaN(Number(obj.amplua))) {
      ampluaName = obj.amplua;
    } else if (typeof obj.amplua === 'string' && obj.amplua.match(/^[0-9]+$/)) {
      // Если в файле указан id — ищем название среди загруженных амплуа
      const found = ampluasList.value.find((a: any) => String(a.id) === obj.amplua);
      ampluaName = found ? found.name : obj.amplua;
    } else if (defaultAmplua.value) {
      // Если выбрано амплуа по умолчанию — ищем его название среди загруженных амплуа
      const found = ampluasList.value.find((a: any) => String(a.id) === String(defaultAmplua.value));
      ampluaName = found ? found.name : defaultAmplua.value;
    }

    let positionName = '';
    if (typeof obj.position === 'string' && isNaN(Number(obj.position))) {
      positionName = obj.position;
    } else if (typeof obj.position === 'string' && obj.position.match(/^[0-9]+$/)) {
      const found = positionsList.value.find((p: any) => String(p.id) === obj.position);
      positionName = found ? found.name : obj.position;
    } else if (defaultPosition.value) {
      const found = positionsList.value.find((p: any) => String(p.id) === String(defaultPosition.value));
      positionName = found ? found.name : defaultPosition.value;
    }

    return {
      surname: obj.surname || '',
      name: obj.name || '',
      patronymic: obj.patronymic || '',
      birth_date: normalizeBirthDate(obj.birth_date) || '',
      gender: parseGender(obj.gender, gender.value),
      amplua: ampluaName,
      position: positionName,
      about: obj.about || '', // Новое поле
      player_number: obj.player_number || '', // <--- добавлено
      _row: String(obj._row)
    }
  })
  try {
    // Отправляем массив на новый endpoint массового импорта
    const response: any = await apiRequest('/people/import', {
      method: 'POST',
      body: JSON.stringify({
        people: importPayload,
        sport_id: props.sportId || undefined,
        club_id: props.clubId || undefined
      })
    })
    // Ожидаем, что бэкенд вернёт отчёт в формате { imported, updated, failed: [{row, reason}], ... }
    mockReport.imported = response.imported || 0
    mockReport.updated = response.updated || 0
    mockReport.failed = Array.isArray(response.failed) ? response.failed : []
    importStep.value = 3
  } catch (e: any) {
    mockReport.imported = 0
    mockReport.updated = 0
    mockReport.failed = [{ row: 0, reason: e?.message || 'Ошибка API' }]
    importStep.value = 3
  }
}
function onImportClose() {
  importStep.value = 1
  showImportModal.value = false
  emit('imported')
  // Здесь будет обновление таблицы, alert убираем
  // alert('Таблица будет обновлена')
}

// Удаляю функции checkPersonExists, checkSportMembershipExists, checkClubMembershipExists и всю связанную с ними логику

const exportFields = [
  { value: 'surname', label: 'Фамилия' },
  { value: 'name', label: 'Имя' },
  { value: 'patronymic', label: 'Отчество' },
  { value: 'birth_date', label: 'Дата рождения' },
  { value: 'amplua', label: 'Амплуа' },
  { value: 'position', label: 'Должность' },
  { value: 'player_number', label: 'Номер' }, // Новое поле
  { value: 'full_name', label: 'ФИО' },
  { value: 'club', label: 'Команда' }, // Новое поле
  { value: 'sport', label: 'Вид спорта' }, // Новое поле
  { value: 'about', label: 'О себе' }, // Новое поле
]
const selectedExportFields = ref(exportFields.map(f => f.value))
const exportFormat = ref('excel')
const exportGroup = ref('all') // all | players | staff

function downloadExport() {
  exportPeopleData()
}

async function exportPeopleData() {
  try {
    let people: any[] = []
    // Если переданы players/staff — используем их
    if ((props.players && Array.isArray(props.players)) || (props.staff && Array.isArray(props.staff))) {
      if (exportGroup.value === 'players') {
        people = props.players || []
      } else if (exportGroup.value === 'staff') {
        people = props.staff || []
      } else {
        // all
        people = [
          ...(props.players || []),
          ...(props.staff || [])
        ]
      }
    } else {
      // Старое поведение: запрос на сервер
      const params: any = { per_page: 10000 }
      if (props.sportId) params.sport_id = props.sportId
      if (props.clubId) params.club_id = props.clubId
      const response: any = await apiRequest('/people', { params })
      people = response.data || response
      if (!Array.isArray(people)) {
        alert('Не удалось получить список персон для экспорта')
        return
      }
    }
    // Оставляем только выбранные поля
    const exportRows = people.map((person: any) => {
      const row: Record<string, string> = {}
      selectedExportFields.value.forEach((field: string) => {
        if (field === 'full_name') {
          row['ФИО'] = (person.last_name || person.surname || '') + ' ' + (person.first_name || person.name || '') + (person.middle_name || person.patronymic ? ' ' + (person.middle_name || person.patronymic) : '')
        } else if (field === 'surname' || field === 'name' || field === 'patronymic') {
          const map: Record<string, string[]> = { surname: ['surname', 'last_name'], name: ['name', 'first_name'], patronymic: ['patronymic', 'middle_name'] }
          row[importFields.find(f => f.value === field)?.label || field] = map[field].map(k => person[k]).find(Boolean) || ''
        } else if (field === 'player_number') {
          row['Номер'] = person.player_number !== undefined ? String(person.player_number) : ''
        } else if (field === 'amplua') {
          // Все амплуа через запятую
          let ampluas = ''
          if (Array.isArray(person.active_amplua_memberships) && person.active_amplua_memberships.length > 0) {
            ampluas = person.active_amplua_memberships.map((a: any) => a.amplua?.name || '').filter(Boolean).join(', ')
          }
          row['Амплуа'] = ampluas
        } else if (field === 'position') {
          // Все должности через запятую
          let positions = ''
          if (Array.isArray(person.active_position_memberships) && person.active_position_memberships.length > 0) {
            positions = person.active_position_memberships.map((p: any) => p.position?.name || '').filter(Boolean).join(', ')
          }
          row['Должность'] = positions
        } else if (field === 'birth_date') {
          // Форматируем дату рождения
          const raw = person.birth_date
          let formatted = ''
          if (raw) {
            const d = new Date(raw)
            if (!isNaN(d.getTime())) {
              formatted = d.toLocaleDateString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' })
            } else {
              formatted = raw
            }
          }
          row[importFields.find(f => f.value === field)?.label || field] = formatted
        } else if (field === 'club') {
          // Все команды через запятую, используем full_info если есть, иначе name
          let clubs = ''
          if (Array.isArray(person.active_club_memberships) && person.active_club_memberships.length > 0) {
            clubs = person.active_club_memberships.map((m: any) => m.club?.full_info || m.club?.name || '').filter(Boolean).join(', ')
          }
          row['Команда'] = clubs
        } else if (field === 'sport') {
          // Все виды спорта через запятую
          let sports = ''
          if (Array.isArray(person.active_sport_memberships) && person.active_sport_memberships.length > 0) {
            sports = person.active_sport_memberships.map((m: any) => m.sport?.name || '').filter(Boolean).join(', ')
          }
          row['Вид спорта'] = sports
        } else if (field === 'about') {
          row['О себе'] = person.about || ''
        } else {
          row[importFields.find(f => f.value === field)?.label || field] = person[field] || ''
        }
      })
      return row
    })
    // Генерируем файл
    if (exportFormat.value === 'excel') {
      const ws = XLSX.utils.json_to_sheet(exportRows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Персоны')
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      saveAsFile(wbout, 'people_export.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    } else if (exportFormat.value === 'csv' || exportFormat.value === 'txt') {
      const csv = exportRows.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      ).join('\n')
      const mime = exportFormat.value === 'csv' ? 'text/csv' : 'text/plain'
      const ext = exportFormat.value === 'csv' ? 'csv' : 'txt'
      saveAsFile(csv, `people_export.${ext}`, mime)
    }
  } catch (e: any) {
    alert('Ошибка экспорта: ' + (e?.message || e))
  }
}

function saveAsFile(data: any, filename: string, mime: string) {
  let blob
  if (data instanceof ArrayBuffer) {
    blob = new Blob([data], { type: mime })
  } else {
    blob = new Blob([data], { type: mime + ';charset=utf-8' })
  }
  if ((window.navigator as any).msSaveOrOpenBlob) {
    (window.navigator as any).msSaveOrOpenBlob(blob, filename)
  } else {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    }, 100)
  }
}
</script>

<style scoped>
.btn {
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  min-width: 120px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-primary {
  background: #2563eb;
  color: #fff;
  border: none;
}
.btn-secondary {
  background: #e5e7eb;
  color: #111;
  border: none;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 10px;
  min-width: 350px;
  max-width: 90vw;
}
.export-modal {
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  border: 1px solid #e5e7eb;
  max-width: 480px;
}
.export-fields-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem 1.2rem;
}
@media (max-width: 600px) {
  .export-fields-grid {
    grid-template-columns: 1fr;
  }
}
.export-switch-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  margin-bottom: 0.2rem;
  position: relative;
}
.export-switch-input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}
.export-switch-slider {
  width: 32px;
  height: 18px;
  background: #e5e7eb;
  border-radius: 10px;
  position: relative;
  transition: background 0.2s;
  margin-right: 0.3rem;
}
.export-switch-input:checked + .export-switch-slider {
  background: #2563eb;
}
.export-switch-slider::after {
  content: '';
  position: absolute;
  left: 2px;
  top: 2px;
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  transition: left 0.2s;
}
.export-switch-input:checked + .export-switch-slider::after {
  left: 16px;
}
.export-switch-text {
  font-size: 0.98rem;
  color: #222;
}
.export-select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.export-select-icon {
  position: absolute;
  left: 10px;
  z-index: 2;
  pointer-events: none;
  width: 1.2em;
  height: 1.2em;
}
.export-select {
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 2.2rem;
  border-radius: 8px;
  border: none;
  background: #f0f6ff;
  color: #222;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  appearance: none;
}
.export-select:focus {
  outline: 2px solid #2563eb;
}
</style> 