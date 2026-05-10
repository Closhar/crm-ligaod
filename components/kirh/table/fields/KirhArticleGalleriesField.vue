<template>
  <div class="article-galleries-field">
    <button class="gallery-count-btn" type="button" @click="openModal">
      <Icon name="mdi:image-multiple-outline" class="h-4 w-4" />
      <span>{{ galleriesCount }}</span>
    </button>

    <Teleport to="body">
      <div v-if="isOpen" class="gallery-modal" @click.self="closeModal">
        <div class="gallery-modal__panel">
          <div class="gallery-modal__head">
            <div>
              <h3>Галереи новости</h3>
              <p>{{ rowData?.title || `Новость #${rowData?.id}` }}</p>
            </div>
            <button class="gallery-modal__close" type="button" @click="closeModal">
              <Icon name="mdi:close" class="h-5 w-5" />
            </button>
          </div>

          <div class="gallery-modal__selected">
            <span v-if="!selectedGalleries.length" class="gallery-modal__empty">Галереи не привязаны</span>
            <button
              v-for="gallery in selectedGalleries"
              :key="gallery.id"
              class="gallery-chip"
              type="button"
              @click="removeGallery(gallery.id)"
            >
              {{ gallery.title }}
              <Icon name="mdi:close" class="h-4 w-4" />
            </button>
          </div>

          <div class="gallery-modal__search">
            <Icon name="mdi:magnify" class="h-5 w-5" />
            <input v-model="searchQuery" type="search" placeholder="Найти галерею..." @input="searchGalleries" />
          </div>

          <div class="gallery-modal__list">
            <button
              v-for="gallery in availableToAdd"
              :key="gallery.id"
              class="gallery-option"
              type="button"
              @click="addGallery(gallery)"
            >
              <Icon name="mdi:image-album" class="h-5 w-5" />
              <span>{{ gallery.title }}</span>
              <small>{{ gallery.images_count || 0 }} фото</small>
            </button>
            <div v-if="!loading && !availableToAdd.length" class="gallery-modal__empty">
              Галереи не найдены
            </div>
          </div>

          <div class="gallery-modal__actions">
            <button class="gallery-cancel" type="button" @click="closeModal">Отмена</button>
            <button class="gallery-save" type="button" :disabled="saving" @click="saveRelations">
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
const availableGalleries = ref([])
const selectedGalleries = ref([])

const galleriesCount = computed(() => {
  return Number(props.rowData?.galleries_count ?? props.modelValue ?? selectedGalleries.value.length) || 0
})

const apiBase = computed(() => props.apiUrl.replace(/\/api\/articles.*$/, ''))

const availableToAdd = computed(() => {
  const selectedIds = new Set(selectedGalleries.value.map((gallery) => gallery.id))
  return availableGalleries.value.filter((gallery) => !selectedIds.has(gallery.id))
})

const normalizeList = (response) => {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  return []
}

const loadArticleGalleries = async () => {
  const response = await fetch(`${props.apiUrl}/${props.rowData.id}`)
  if (!response.ok) throw new Error('Не удалось загрузить новость')
  const article = await response.json()
  selectedGalleries.value = Array.isArray(article?.galleries) ? article.galleries : []
}

const loadAvailableGalleries = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      limit: '500',
      ...(searchQuery.value.trim() ? { q: searchQuery.value.trim() } : {}),
    })
    const response = await fetch(`${apiBase.value}/api/v1/galleries?${params.toString()}`)
    if (!response.ok) throw new Error('Не удалось загрузить галереи')
    availableGalleries.value = normalizeList(await response.json())
  } finally {
    loading.value = false
  }
}

let searchTimer = null
const searchGalleries = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(loadAvailableGalleries, 250)
}

const openModal = async () => {
  isOpen.value = true
  searchQuery.value = ''
  try {
    await Promise.all([loadArticleGalleries(), loadAvailableGalleries()])
  } catch (error) {
    console.error(error)
  }
}

const closeModal = () => {
  isOpen.value = false
}

const addGallery = (gallery) => {
  if (!selectedGalleries.value.some((item) => item.id === gallery.id)) {
    selectedGalleries.value.push(gallery)
  }
}

const removeGallery = (galleryId) => {
  selectedGalleries.value = selectedGalleries.value.filter((gallery) => gallery.id !== galleryId)
}

const saveRelations = async () => {
  saving.value = true
  try {
    const response = await fetch(`${props.apiUrl}/${props.rowData.id}/relations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        relation_type: 'galleries',
        relation_ids: selectedGalleries.value.map((gallery) => gallery.id),
      }),
    })
    if (!response.ok) throw new Error('Не удалось сохранить галереи')

    props.rowData.galleries_count = selectedGalleries.value.length
    closeModal()
  } catch (error) {
    alert(error?.message || 'Ошибка сохранения галерей')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.gallery-count-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 54px;
  border-radius: 999px;
  padding: 6px 10px;
  background: #eef2ff;
  color: #1d4ed8;
  font-weight: 800;
}

.gallery-modal {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.58);
}

.gallery-modal__panel {
  width: min(100%, 720px);
  max-height: 86vh;
  overflow: hidden;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.32);
}

.gallery-modal__head,
.gallery-modal__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.gallery-modal__head h3 {
  margin: 0;
  color: #111827;
  font-size: 20px;
  font-weight: 900;
}

.gallery-modal__head p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 13px;
}

.gallery-modal__close {
  border-radius: 10px;
  padding: 8px;
  color: #64748b;
}

.gallery-modal__selected {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px 20px;
  background: #f8fafc;
}

.gallery-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 7px 10px;
  background: #1d4ed8;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
}

.gallery-modal__search {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 20px 0;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  padding: 10px 12px;
  color: #2563eb;
}

.gallery-modal__search input {
  width: 100%;
  border: 0;
  outline: none;
  color: #111827;
}

.gallery-modal__list {
  display: grid;
  gap: 8px;
  max-height: 340px;
  overflow-y: auto;
  padding: 16px 20px;
}

.gallery-option {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px 12px;
  color: #111827;
  text-align: left;
  transition: background 0.2s, border-color 0.2s;
}

.gallery-option:hover {
  border-color: #93c5fd;
  background: #eff6ff;
}

.gallery-option small,
.gallery-modal__empty {
  color: #64748b;
  font-weight: 700;
}

.gallery-modal__actions {
  border-top: 1px solid #e5e7eb;
  border-bottom: 0;
}

.gallery-cancel,
.gallery-save {
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 800;
}

.gallery-cancel {
  background: #e5e7eb;
  color: #374151;
}

.gallery-save {
  background: #1d4ed8;
  color: #ffffff;
}
</style>
