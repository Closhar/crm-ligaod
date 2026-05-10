<template>
  <div class="article-documents-field">
    <button class="document-count-btn" type="button" @click="openModal">
      <Icon name="mdi:file-document-multiple-outline" class="h-4 w-4" />
      <span>{{ documentsCount }}</span>
    </button>

    <Teleport to="body">
      <div v-if="isOpen" class="document-modal" @click.self="closeModal">
        <div class="document-modal__panel">
          <div class="document-modal__head">
            <div>
              <h3>Документы новости</h3>
              <p>{{ rowData?.title || `Новость #${rowData?.id}` }}</p>
            </div>
            <button class="document-modal__close" type="button" @click="closeModal">
              <Icon name="mdi:close" class="h-5 w-5" />
            </button>
          </div>

          <div class="document-modal__selected">
            <span v-if="!selectedDocuments.length" class="document-modal__empty">Документы не привязаны</span>
            <button
              v-for="document in selectedDocuments"
              :key="document.id"
              class="document-chip"
              type="button"
              @click="removeDocument(document.id)"
            >
              {{ document.title }}
              <Icon name="mdi:close" class="h-4 w-4" />
            </button>
          </div>

          <div class="document-modal__search">
            <Icon name="mdi:magnify" class="h-5 w-5" />
            <input v-model="searchQuery" type="search" placeholder="Найти документ..." @input="searchDocuments" />
          </div>

          <div class="document-modal__list">
            <button
              v-for="document in availableToAdd"
              :key="document.id"
              class="document-option"
              type="button"
              @click="addDocument(document)"
            >
              <Icon name="mdi:file-document-outline" class="h-5 w-5" />
              <span>{{ document.title }}</span>
              <small>{{ document.original_name || document.file_path || 'Файл' }}</small>
            </button>
            <div v-if="!loading && !availableToAdd.length" class="document-modal__empty">
              Документы не найдены
            </div>
          </div>

          <div class="document-modal__actions">
            <button class="document-cancel" type="button" @click="closeModal">Отмена</button>
            <button class="document-save" type="button" :disabled="saving" @click="saveRelations">
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: 0,
  },
  rowData: {
    type: Object,
    default: () => ({}),
  },
  apiUrl: {
    type: String,
    required: true,
  },
})

const isOpen = ref(false)
const loading = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const availableDocuments = ref([])
const selectedDocuments = ref([])
let searchTimer = null

const documentsCount = computed(() => {
  return Number(props.rowData?.documents_count ?? props.modelValue ?? selectedDocuments.value.length) || 0
})

const apiBase = computed(() => props.apiUrl.replace(/\/api\/articles.*$/, ''))

const availableToAdd = computed(() => {
  const selectedIds = new Set(selectedDocuments.value.map((document) => document.id))
  return availableDocuments.value.filter((document) => !selectedIds.has(document.id))
})

const normalizeList = (response) => {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  return []
}

const loadArticleDocuments = async () => {
  const response = await fetch(`${props.apiUrl}/${props.rowData.id}`)
  if (!response.ok) throw new Error('Не удалось загрузить новость')
  const article = await response.json()
  selectedDocuments.value = Array.isArray(article?.documents) ? article.documents : []
}

const loadAvailableDocuments = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      type: 'async',
      limit: '500',
      ...(searchQuery.value.trim() ? { q: searchQuery.value.trim() } : {}),
    })
    const response = await fetch(`${apiBase.value}/api/documents?${params.toString()}`)
    if (!response.ok) throw new Error('Не удалось загрузить документы')
    availableDocuments.value = normalizeList(await response.json())
  } finally {
    loading.value = false
  }
}

const searchDocuments = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(loadAvailableDocuments, 250)
}

const openModal = async () => {
  isOpen.value = true
  searchQuery.value = ''
  try {
    await Promise.all([loadArticleDocuments(), loadAvailableDocuments()])
  } catch (error) {
    console.error(error)
  }
}

const closeModal = () => {
  isOpen.value = false
}

const addDocument = (document) => {
  if (!selectedDocuments.value.some((item) => item.id === document.id)) {
    selectedDocuments.value.push(document)
  }
}

const removeDocument = (documentId) => {
  selectedDocuments.value = selectedDocuments.value.filter((document) => document.id !== documentId)
}

const saveRelations = async () => {
  saving.value = true
  try {
    const response = await fetch(`${props.apiUrl}/${props.rowData.id}/relations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        relation_type: 'documents',
        relation_ids: selectedDocuments.value.map((document) => document.id),
      }),
    })
    if (!response.ok) throw new Error('Не удалось сохранить документы')

    props.rowData.documents_count = selectedDocuments.value.length
    closeModal()
  } catch (error) {
    alert(error?.message || 'Ошибка сохранения документов')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.document-count-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 54px;
  border-radius: 999px;
  padding: 6px 10px;
  background: #ecfdf5;
  color: #047857;
  font-weight: 800;
}

.document-modal {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.58);
}

.document-modal__panel {
  width: min(100%, 720px);
  max-height: 86vh;
  overflow: hidden;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.32);
}

.document-modal__head,
.document-modal__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.document-modal__head h3 {
  margin: 0;
  color: #111827;
  font-size: 20px;
  font-weight: 900;
}

.document-modal__head p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 13px;
}

.document-modal__close {
  border-radius: 10px;
  padding: 8px;
  color: #64748b;
}

.document-modal__selected {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px 20px;
  background: #f8fafc;
}

.document-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 7px 10px;
  background: #047857;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
}

.document-modal__search {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 20px 0;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  padding: 10px 12px;
  color: #047857;
}

.document-modal__search input {
  width: 100%;
  border: 0;
  outline: none;
  color: #111827;
}

.document-modal__list {
  display: grid;
  gap: 8px;
  max-height: 340px;
  overflow-y: auto;
  padding: 16px 20px;
}

.document-option {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) minmax(140px, 0.45fr);
  align-items: center;
  gap: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px 12px;
  color: #111827;
  text-align: left;
  transition: background 0.2s, border-color 0.2s;
}

.document-option:hover {
  border-color: #86efac;
  background: #ecfdf5;
}

.document-option span,
.document-option small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-option small,
.document-modal__empty {
  color: #64748b;
  font-weight: 700;
}

.document-modal__actions {
  border-top: 1px solid #e5e7eb;
  border-bottom: 0;
}

.document-cancel,
.document-save {
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 800;
}

.document-cancel {
  background: #e5e7eb;
  color: #374151;
}

.document-save {
  background: #047857;
  color: #ffffff;
}
</style>
