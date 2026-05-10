<template>
  <div class="documents-page">
    <div class="page-header">
      <div>
        <h1>Документы</h1>
        <p>Загрузка файлов для публичных разделов сайта</p>
      </div>
      <button class="btn-primary" @click="openCreate">
        <Icon icon="mdi:file-plus-outline" class="w-5 h-5" />
        Добавить документ
      </button>
    </div>

    <div class="table-card">
      <div class="documents-toolbar">
        <div class="documents-search">
          <Icon icon="mdi:magnify" class="w-5 h-5" />
          <input v-model="searchQuery" type="search" placeholder="Поиск по названию документа..." />
        </div>
        <span class="documents-counter">{{ filteredDocuments.length }} из {{ documents.length }}</span>
      </div>
      <table class="documents-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Файл</th>
            <th>Дата загрузки</th>
            <th>Новости</th>
            <th>О лиге</th>
            <th>Сортировка</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="document in paginatedDocuments" :key="document.id">
            <td>{{ document.id }}</td>
            <td class="title-cell">{{ document.title }}</td>
            <td>
              <a v-if="document.url" :href="document.url" target="_blank" rel="noopener" class="file-link">
                <Icon icon="mdi:file-document-outline" class="w-5 h-5" />
                {{ document.original_name || document.file_path }}
              </a>
              <span v-else class="muted-text">{{ document.original_name || document.file_path || 'Файл не загружен' }}</span>
            </td>
            <td class="date-cell">
              {{ formatDateTime(document.created_at) }}
            </td>
            <td>
              <button class="articles-count-btn" type="button" @click="openArticlesModal(document)">
                <Icon icon="mdi:newspaper-variant-multiple-outline" class="w-5 h-5" />
                {{ document.articles_count || 0 }}
              </button>
            </td>
            <td>
              <KirhToggleField
                :model-value="!!document.in_about"
                @update:model-value="val => quickUpdate(document, { in_about: val === 1 || val === true })"
              />
            </td>
            <td>
              <input
                v-model.number="document.sort_order"
                type="number"
                min="0"
                class="sort-input"
                @blur="quickUpdate(document, { sort_order: document.sort_order })"
                @keyup.enter="$event.target.blur()"
              />
            </td>
            <td>
              <div class="actions">
                <button class="icon-btn" title="Редактировать" @click="openEdit(document)">
                  <Icon icon="mdi:pencil" class="w-5 h-5" />
                </button>
                <button class="icon-btn icon-btn--danger" title="Удалить" @click="deleteDocument(document)">
                  <Icon icon="mdi:trash-can-outline" class="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && !filteredDocuments.length">
            <td colspan="8" class="empty-cell">
              {{ searchQuery ? 'Документы по запросу не найдены' : 'Документы пока не добавлены' }}
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="documentsTotalPages > 1" class="documents-pagination">
        <div class="documents-pagination__pages">
          <button
            class="documents-page-btn documents-page-btn--arrow"
            type="button"
            :disabled="documentsCurrentPage === 1"
            @click="setDocumentsPage(documentsCurrentPage - 1)"
          >
            ←
          </button>
          <button
            v-for="page in documentsPageNumbers"
            :key="`document-page-${page}`"
            class="documents-page-btn"
            :class="{ 'documents-page-btn--active': page === documentsCurrentPage }"
            type="button"
            @click="setDocumentsPage(page)"
          >
            {{ page }}
          </button>
          <button
            class="documents-page-btn documents-page-btn--arrow"
            type="button"
            :disabled="documentsCurrentPage === documentsTotalPages"
            @click="setDocumentsPage(documentsCurrentPage + 1)"
          >
            →
          </button>
        </div>
        <div class="documents-pagination__meta">
          Страница {{ documentsCurrentPage }} из {{ documentsTotalPages }}
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <form class="modal-card" @submit.prevent="saveDocument" @click.stop>
        <div class="modal-head">
          <h2>{{ editingDocument ? 'Редактировать документ' : 'Добавить документ' }}</h2>
          <button type="button" class="icon-btn" @click="closeModal">
            <Icon icon="mdi:close" class="w-5 h-5" />
          </button>
        </div>

        <label class="form-group">
          <span>Название документа *</span>
          <input v-model="form.title" type="text" required />
        </label>

        <div class="form-group">
          <span>{{ editingDocument ? 'Заменить файл' : 'Файл *' }}</span>
          <input ref="fileInput" type="file" class="visually-hidden" @change="onFileChange" />
          <button class="file-dropzone" type="button" @click="fileInput?.click()" @dragover.prevent @drop.prevent="onFileDrop">
            <Icon icon="mdi:cloud-upload-outline" class="w-8 h-8" />
            <strong>{{ selectedFile ? selectedFile.name : 'Выберите файл или перетащите сюда' }}</strong>
            <span>
              {{ selectedFile ? formatFileSize(selectedFile.size) : (editingDocument?.original_name || 'PDF, DOC, XLS и другие документы') }}
            </span>
          </button>
        </div>

        <div class="form-row">
          <label class="form-group">
            <span>Сортировка</span>
            <input v-model.number="form.sort_order" type="number" min="0" />
          </label>
          <label class="toggle-row">
            <KirhToggleField v-model="form.in_about" />
            <span>Показывать на странице О лиге</span>
          </label>
        </div>

        <div v-if="errorMessage" class="error-box">{{ errorMessage }}</div>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="closeModal">Отмена</button>
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="showArticlesModal" class="modal-overlay" @click="closeArticlesModal">
      <div class="modal-card modal-card--wide" @click.stop>
        <div class="modal-head">
          <div>
            <h2>Новости документа</h2>
            <p class="modal-subtitle">{{ articlesDocument?.title }}</p>
          </div>
          <button type="button" class="icon-btn" @click="closeArticlesModal">
            <Icon icon="mdi:close" class="w-5 h-5" />
          </button>
        </div>

        <div class="linked-list">
          <span v-if="!selectedArticles.length" class="muted-text">Статьи не привязаны</span>
          <button
            v-for="article in selectedArticles"
            :key="article.id"
            class="linked-chip"
            type="button"
            @click="removeArticle(article.id)"
          >
            {{ article.title }}
            <Icon icon="mdi:close" class="w-4 h-4" />
          </button>
        </div>

        <div class="documents-search documents-search--modal">
          <Icon icon="mdi:magnify" class="w-5 h-5" />
          <input v-model="articleSearchQuery" type="search" placeholder="Найти новость..." @input="searchArticles" />
        </div>

        <div class="article-picker-list">
          <button
            v-for="article in availableArticlesToAdd"
            :key="article.id"
            class="article-picker-item"
            type="button"
            @click="addArticle(article)"
          >
            <Icon icon="mdi:newspaper-variant-outline" class="w-5 h-5" />
            <span>{{ article.title }}</span>
            <small>{{ formatDateTime(article.data) }}</small>
          </button>
          <div v-if="!articlesLoading && !availableArticlesToAdd.length" class="empty-cell">
            Новости не найдены
          </div>
        </div>

        <div v-if="articlesError" class="error-box">{{ articlesError }}</div>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="closeArticlesModal">Отмена</button>
          <button type="button" class="btn-primary" :disabled="articlesSaving" @click="saveArticleRelations">
            {{ articlesSaving ? 'Сохранение...' : 'Сохранить связи' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import KirhToggleField from '~/components/kirh/table/fields/KirhToggleField.vue'

const { apiRequest } = useApi()

const documents = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const showArticlesModal = ref(false)
const editingDocument = ref<any | null>(null)
const articlesDocument = ref<any | null>(null)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const errorMessage = ref('')
const articlesError = ref('')
const searchQuery = ref('')
const articleSearchQuery = ref('')
const documentsCurrentPage = ref(1)
const documentsPerPage = 25
const selectedArticles = ref<any[]>([])
const availableArticles = ref<any[]>([])
const articlesLoading = ref(false)
const articlesSaving = ref(false)
let articleSearchTimer: ReturnType<typeof setTimeout> | null = null

const form = reactive({
  title: '',
  sort_order: 500,
  in_about: false,
})

const loadDocuments = async () => {
  loading.value = true
  try {
    const response: any = await apiRequest('/documents?per_page=1000')
    documents.value = response?.data || []
  } finally {
    loading.value = false
  }
}

const filteredDocuments = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return documents.value

  return documents.value.filter((document) => String(document.title || '').toLowerCase().includes(query))
})

const documentsTotalPages = computed(() => Math.max(1, Math.ceil(filteredDocuments.value.length / documentsPerPage)))

const paginatedDocuments = computed(() => {
  const start = (documentsCurrentPage.value - 1) * documentsPerPage
  return filteredDocuments.value.slice(start, start + documentsPerPage)
})

const documentsPageNumbers = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, documentsCurrentPage.value - 2)
  const end = Math.min(documentsTotalPages.value, documentsCurrentPage.value + 2)

  for (let page = start; page <= end; page++) {
    pages.push(page)
  }

  return pages
})

const availableArticlesToAdd = computed(() => {
  const selectedIds = new Set(selectedArticles.value.map((article) => article.id))
  return availableArticles.value.filter((article) => !selectedIds.has(article.id))
})

const setDocumentsPage = (page: number) => {
  documentsCurrentPage.value = Math.min(documentsTotalPages.value, Math.max(1, page))
}

const openCreate = () => {
  editingDocument.value = null
  selectedFile.value = null
  errorMessage.value = ''
  Object.assign(form, { title: '', sort_order: 500, in_about: false })
  showModal.value = true
}

const openEdit = (document: any) => {
  editingDocument.value = document
  selectedFile.value = null
  errorMessage.value = ''
  Object.assign(form, {
    title: document.title || '',
    sort_order: document.sort_order ?? 500,
    in_about: !!document.in_about,
  })
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingDocument.value = null
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  errorMessage.value = ''
}

const setSelectedFile = (file?: File | null) => {
  selectedFile.value = file || null
}

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  setSelectedFile(input.files?.[0] || null)
}

const onFileDrop = (event: DragEvent) => {
  setSelectedFile(event.dataTransfer?.files?.[0] || null)
}

const formatFileSize = (size: number) => {
  if (!size) return ''
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} КБ`
  return `${(size / 1024 / 1024).toFixed(1)} МБ`
}

const formatDateTime = (value?: string) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const buildPayload = () => {
  const payload = new FormData()
  payload.append('title', form.title)
  payload.append('sort_order', String(form.sort_order || 500))
  payload.append('in_about', form.in_about ? '1' : '0')
  if (selectedFile.value) {
    payload.append('file', selectedFile.value)
  }
  return payload
}

const saveDocument = async () => {
  saving.value = true
  errorMessage.value = ''
  if (!editingDocument.value && !selectedFile.value) {
    errorMessage.value = 'Выберите файл документа'
    saving.value = false
    return
  }

  try {
    const url = editingDocument.value ? `/documents/${editingDocument.value.id}` : '/documents'
    const response: any = await apiRequest(url, {
      method: 'POST',
      body: buildPayload(),
    })

    if (!response?.success) {
      errorMessage.value = response?.message || 'Не удалось сохранить документ'
      return
    }

    closeModal()
    await loadDocuments()
  } catch (error: any) {
    const data = error?.data || error?._data
    errorMessage.value = data?.message || Object.values(data?.errors || {}).flat().join(' ') || 'Ошибка сохранения документа'
  } finally {
    saving.value = false
  }
}

const quickUpdate = async (document: any, patch: Record<string, any>) => {
  try {
    const payload = new FormData()
    payload.append('title', document.title)
    payload.append('sort_order', String(patch.sort_order ?? document.sort_order ?? 500))
    payload.append('in_about', (patch.in_about ?? document.in_about) ? '1' : '0')
    const response: any = await apiRequest(`/documents/${document.id}`, {
      method: 'POST',
      body: payload,
    })
    Object.assign(document, response?.data || patch)
  } catch {
    alert('Ошибка при обновлении документа')
    await loadDocuments()
  }
}

const deleteDocument = async (document: any) => {
  if (!confirm(`Удалить документ "${document.title}"?`)) return
  await apiRequest(`/documents/${document.id}`, { method: 'DELETE' })
  await loadDocuments()
}

const normalizeArticlesResponse = (response: any) => {
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.data)) return response.data.data
  if (Array.isArray(response)) return response
  return []
}

const loadAvailableArticles = async () => {
  articlesLoading.value = true
  try {
    const params = new URLSearchParams({
      per_page: '50',
      sort_field: 'data',
      sort_direction: 'desc',
      ...(articleSearchQuery.value.trim() ? { q: articleSearchQuery.value.trim() } : {}),
    })
    const response = await apiRequest(`/articles?${params.toString()}`)
    availableArticles.value = normalizeArticlesResponse(response)
  } finally {
    articlesLoading.value = false
  }
}

const openArticlesModal = async (document: any) => {
  articlesDocument.value = document
  articlesError.value = ''
  articleSearchQuery.value = ''
  selectedArticles.value = []
  availableArticles.value = []
  showArticlesModal.value = true

  try {
    const response: any = await apiRequest(`/documents/${document.id}`)
    selectedArticles.value = response?.data?.articles || []
    await loadAvailableArticles()
  } catch (error: any) {
    articlesError.value = error?.data?.message || error?.message || 'Не удалось загрузить связи документа'
  }
}

const closeArticlesModal = () => {
  showArticlesModal.value = false
  articlesDocument.value = null
  selectedArticles.value = []
  availableArticles.value = []
  articlesError.value = ''
}

const searchArticles = () => {
  if (articleSearchTimer) {
    clearTimeout(articleSearchTimer)
  }
  articleSearchTimer = setTimeout(loadAvailableArticles, 250)
}

const addArticle = (article: any) => {
  if (!selectedArticles.value.some((item) => item.id === article.id)) {
    selectedArticles.value.push(article)
  }
}

const removeArticle = (articleId: number) => {
  selectedArticles.value = selectedArticles.value.filter((article) => article.id !== articleId)
}

const saveArticleRelations = async () => {
  if (!articlesDocument.value) return
  articlesSaving.value = true
  articlesError.value = ''

  try {
    const response: any = await apiRequest(`/documents/${articlesDocument.value.id}/articles`, {
      method: 'POST',
      body: {
        article_ids: selectedArticles.value.map((article) => article.id),
      },
    })
    articlesDocument.value.articles_count = response?.data?.articles_count ?? selectedArticles.value.length
    const documentIndex = documents.value.findIndex((document) => document.id === articlesDocument.value?.id)
    if (documentIndex !== -1) {
      documents.value[documentIndex].articles_count = articlesDocument.value.articles_count
    }
    closeArticlesModal()
  } catch (error: any) {
    articlesError.value = error?.data?.message || error?.message || 'Не удалось сохранить связи'
  } finally {
    articlesSaving.value = false
  }
}

onMounted(loadDocuments)

watch(searchQuery, () => {
  documentsCurrentPage.value = 1
})

watch(documentsTotalPages, (total) => {
  if (documentsCurrentPage.value > total) {
    documentsCurrentPage.value = total
  }
})
</script>

<style scoped>
.documents-page {
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  color: #111827;
  font-size: 28px;
  font-weight: 800;
}

.page-header p {
  margin: 4px 0 0;
  color: #6b7280;
}

.table-card {
  overflow: hidden;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.08);
}

.documents-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
}

.documents-search {
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(100%, 520px);
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  padding: 10px 12px;
  background: #ffffff;
  color: #2563eb;
}

.documents-search input {
  width: 100%;
  border: 0;
  outline: none;
  color: #111827;
}

.documents-counter,
.muted-text,
.date-cell {
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
}

.documents-table {
  width: 100%;
  border-collapse: collapse;
}

.documents-table th,
.documents-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  vertical-align: middle;
}

.documents-table th {
  background: #f9fafb;
  color: #6b7280;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.title-cell {
  color: #111827;
  font-weight: 700;
}

.file-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #1d4ed8;
  font-weight: 600;
}

.articles-count-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 58px;
  border-radius: 999px;
  padding: 7px 11px;
  background: #ecfdf5;
  color: #047857;
  font-weight: 800;
  transition: background 0.2s, transform 0.2s;
}

.articles-count-btn:hover {
  background: #d1fae5;
  transform: translateY(-1px);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.file-dropzone {
  display: grid;
  justify-items: center;
  gap: 8px;
  width: 100%;
  border: 2px dashed #93c5fd;
  border-radius: 14px;
  padding: 22px;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
  color: #1d4ed8;
  text-align: center;
  transition: border-color 0.2s, background 0.2s, transform 0.2s;
}

.file-dropzone:hover {
  border-color: #2563eb;
  background: #eff6ff;
  transform: translateY(-1px);
}

.file-dropzone strong {
  color: #111827;
}

.file-dropzone span {
  color: #6b7280;
  font-size: 13px;
}

.sort-input {
  width: 96px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 7px 9px;
  color: #111827;
}

.actions {
  display: flex;
  gap: 8px;
}

.icon-btn,
.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  font-weight: 700;
}

.icon-btn {
  padding: 8px;
  color: #2563eb;
}

.icon-btn--danger {
  color: #dc2626;
}

.btn-primary {
  padding: 10px 14px;
  background: #1d4ed8;
  color: #ffffff;
}

.btn-secondary {
  padding: 10px 14px;
  background: #e5e7eb;
  color: #374151;
}

.empty-cell {
  color: #6b7280;
  text-align: center !important;
}

.documents-pagination {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}

.documents-pagination__pages {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.documents-page-btn {
  min-width: 36px;
  height: 36px;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  background: #ffffff;
  color: #1f2937;
  font-size: 13px;
  font-weight: 800;
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
}

.documents-page-btn:hover:not(:disabled) {
  border-color: #2563eb;
  color: #1d4ed8;
  transform: translateY(-1px);
}

.documents-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.documents-page-btn--active {
  border-color: #1d4ed8;
  background: #1d4ed8;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.22);
}

.documents-page-btn--arrow {
  background: #ffffff;
}

.documents-pagination__meta {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.55);
}

.modal-card {
  width: min(100%, 620px);
  border-radius: 14px;
  padding: 24px;
  background: #ffffff;
  box-shadow: 0 22px 70px rgba(15, 23, 42, 0.28);
}

.modal-card--wide {
  width: min(100%, 860px);
}

.modal-head,
.modal-actions,
.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.modal-head {
  margin-bottom: 18px;
}

.modal-head h2 {
  margin: 0;
  color: #111827;
  font-size: 22px;
  font-weight: 800;
}

.modal-subtitle {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.linked-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 -24px 18px;
  padding: 14px 24px;
  background: #f8fafc;
}

.linked-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  border-radius: 999px;
  padding: 7px 10px;
  background: #047857;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
}

.documents-search--modal {
  width: 100%;
  margin-bottom: 14px;
}

.article-picker-list {
  display: grid;
  gap: 8px;
  max-height: 360px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.article-picker-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) 150px;
  align-items: center;
  gap: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px 12px;
  color: #111827;
  text-align: left;
  transition: background 0.2s, border-color 0.2s;
}

.article-picker-item:hover {
  border-color: #86efac;
  background: #ecfdf5;
}

.article-picker-item span,
.article-picker-item small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-picker-item small {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.form-group {
  display: grid;
  gap: 7px;
  margin-bottom: 16px;
  color: #374151;
  font-weight: 700;
}

.form-group input {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 12px;
  color: #111827;
}

.form-row .form-group {
  flex: 1;
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #374151;
  font-weight: 700;
}

.error-box {
  margin-bottom: 16px;
  border-radius: 8px;
  padding: 10px 12px;
  background: #fee2e2;
  color: #991b1b;
  font-weight: 700;
}
</style>
