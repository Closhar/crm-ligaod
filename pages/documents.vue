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
      <table class="documents-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Файл</th>
            <th>О лиге</th>
            <th>Сортировка</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="document in documents" :key="document.id">
            <td>{{ document.id }}</td>
            <td class="title-cell">{{ document.title }}</td>
            <td>
              <a v-if="document.url" :href="document.url" target="_blank" rel="noopener" class="file-link">
                <Icon icon="mdi:file-document-outline" class="w-5 h-5" />
                {{ document.original_name || document.file_path }}
              </a>
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
          <tr v-if="!loading && !documents.length">
            <td colspan="6" class="empty-cell">Документы пока не добавлены</td>
          </tr>
        </tbody>
      </table>
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

        <label class="form-group">
          <span>{{ editingDocument ? 'Заменить файл' : 'Файл *' }}</span>
          <input type="file" :required="!editingDocument" @change="onFileChange" />
        </label>

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
const editingDocument = ref<any | null>(null)
const selectedFile = ref<File | null>(null)
const errorMessage = ref('')

const form = reactive({
  title: '',
  sort_order: 500,
  in_about: false,
})

const loadDocuments = async () => {
  loading.value = true
  try {
    const response: any = await apiRequest('/documents?per_page=100')
    documents.value = response?.data || []
  } finally {
    loading.value = false
  }
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
  errorMessage.value = ''
}

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] || null
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

onMounted(loadDocuments)
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
