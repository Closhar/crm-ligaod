<template>
  <header class="bg-white shadow-sm border-b border-gray-300">
    <div class="px-6 pt-4">
      <div class="flex items-start justify-between">
        <Head :breadcrumbs="breadcrumbs" :icon="p_icon" :title="p_description" show_breadcrumbs="true" />
      </div>
    </div>
  </header>

  <div v-if="isAuthenticated" class="params-page">
    <section class="params-toolbar">
      <div>
        <h1>Параметры сайта</h1>
        <p>Управление таблицей params: строки редактируются сразу, HTML-тексты открываются в редакторе.</p>
      </div>
      <button type="button" class="params-add" @click="createParam">
        <Icon icon="material-symbols:add-circle-outline-rounded" />
        Добавить параметр
      </button>
    </section>

    <section class="params-create">
      <input v-model="newParam.title" placeholder="Название параметра" />
      <input v-model="newParam.name" placeholder="Ключ параметра" />
      <select v-model="newParam.type">
        <option value="string">Строка</option>
        <option value="text">Текст</option>
      </select>
      <input v-if="newParam.type === 'string'" v-model="newParam.value" placeholder="Значение" />
      <button v-else type="button" class="params-open-editor" @click="openTextEditor(newParam)">
        <Icon icon="mdi:file-document-edit-outline" />
        Текст
      </button>
    </section>

    <section class="params-table-card">
      <div class="params-search">
        <Icon icon="material-symbols:search-rounded" />
        <input v-model="search" placeholder="Поиск по названию, ключу или значению" @input="debouncedLoad" />
      </div>

      <div v-if="loading" class="params-state">Загрузка параметров...</div>
      <div v-else-if="!paramsList.length" class="params-state">Параметры не найдены</div>

      <table v-else class="params-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Ключ</th>
            <th>Тип</th>
            <th>Значение</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="param in paramsList" :key="param.id">
            <td>{{ param.id }}</td>
            <td>
              <input v-model="param.title" class="params-inline" @blur="saveParam(param, 'title')" @keyup.enter="$event.target.blur()" />
            </td>
            <td>
              <input v-model="param.name" class="params-inline params-inline--code" @blur="saveParam(param, 'name')" @keyup.enter="$event.target.blur()" />
            </td>
            <td>
              <select v-model="param.type" class="params-inline" @change="saveParam(param, 'type')">
                <option value="string">Строка</option>
                <option value="text">Текст</option>
              </select>
            </td>
            <td>
              <input
                v-if="param.type !== 'text'"
                v-model="param.value"
                class="params-inline"
                @blur="saveParam(param, 'value')"
                @keyup.enter="$event.target.blur()"
              />
              <button v-else type="button" class="params-open-editor" @click="openTextEditor(param)">
                <Icon icon="mdi:file-document-edit-outline" />
                Редактировать текст
              </button>
            </td>
            <td>
              <span v-if="savingId === param.id" class="params-saving">Сохранение...</span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <div v-if="textEditor.visible" class="params-modal">
      <div class="params-modal__panel">
        <div class="params-modal__head">
          <div>
            <h2>{{ textEditor.param?.title || 'Текст параметра' }}</h2>
            <p>{{ textEditor.param?.name }}</p>
          </div>
          <button type="button" @click="closeTextEditor">
            <Icon icon="material-symbols:close-rounded" />
          </button>
        </div>
        <RichTextEditor v-model="textEditor.value" :editor-enabled="true" />
        <div class="params-modal__actions">
          <button type="button" class="params-cancel" @click="closeTextEditor">Отмена</button>
          <button type="button" class="params-save" :disabled="textEditor.saving" @click="saveTextParam">
            {{ textEditor.saving ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Head from '~/components/parts/Head.vue'
import RichTextEditor from '~/components/kirh/table/editor/RichTextEditor.vue'
import { useAuth } from '~/composables/useAuth'
import { useGlobalsStore } from '~/stores/globals'
import { storeToRefs } from 'pinia'

const globalsStore = useGlobalsStore()
const { params } = storeToRefs(globalsStore)

await useAsyncData('params-globals', async () => {
  await globalsStore.fetchData()
  return { params: globalsStore.params, images: globalsStore.images }
})

const { apiRequest } = useApi()
const { isAuthenticated } = useAuth()

useSeoMeta({
  title: `${params.value?.adminka_name || 'Админка'} - Система - Параметры`,
  description: 'Параметры',
})

const p_icon = 'ep:tools'
const p_description = 'Параметры'
const breadcrumbs = [{ id: 1, title: 'Система', icon: 'fluent:window-dev-tools-20-filled', slug: '/system' }]

const paramsList = ref<any[]>([])
const loading = ref(false)
const savingId = ref<number | null>(null)
const search = ref('')
const newParam = reactive({ title: '', name: '', value: '', type: 'string' })
const textEditor = reactive<any>({
  visible: false,
  saving: false,
  param: null,
  value: '',
})

let searchTimer: ReturnType<typeof setTimeout> | null = null

const loadParams = async () => {
  loading.value = true
  try {
    const response: any = await apiRequest('/params', { params: { q: search.value, per_page: 100 } })
    paramsList.value = response.data || []
  } finally {
    loading.value = false
  }
}

const debouncedLoad = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(loadParams, 250)
}

const createParam = async () => {
  if (!newParam.title || !newParam.name) return

  const response: any = await apiRequest('/params', {
    method: 'POST',
    body: { ...newParam },
  })

  paramsList.value.unshift(response)
  newParam.title = ''
  newParam.name = ''
  newParam.value = ''
  newParam.type = 'string'
}

const saveParam = async (param: any, field: string) => {
  savingId.value = param.id
  try {
    const response: any = await apiRequest(`/params/${param.id}`, {
      method: 'PUT',
      body: { [field]: param[field] },
    })
    Object.assign(param, response.data || {})
  } finally {
    savingId.value = null
  }
}

const openTextEditor = (param: any) => {
  textEditor.param = param
  textEditor.value = param.value || ''
  textEditor.visible = true
}

const closeTextEditor = () => {
  textEditor.visible = false
  textEditor.param = null
  textEditor.value = ''
}

const saveTextParam = async () => {
  if (!textEditor.param) return

  if (!textEditor.param.id) {
    textEditor.param.value = textEditor.value
    textEditor.param.type = 'text'
    closeTextEditor()
    return
  }

  textEditor.saving = true
  try {
    const response: any = await apiRequest(`/params/${textEditor.param.id}`, {
      method: 'PUT',
      body: { value: textEditor.value, type: 'text' },
    })
    Object.assign(textEditor.param, response.data || {})
    closeTextEditor()
  } finally {
    textEditor.saving = false
  }
}

onMounted(loadParams)
</script>

<style scoped>
.params-page {
  @apply min-h-screen bg-gray-100 p-6 text-gray-900;
}

.params-toolbar {
  @apply mb-5 flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between;
}

.params-toolbar h1 {
  @apply text-2xl font-bold;
}

.params-toolbar p {
  @apply mt-1 text-sm text-gray-500;
}

.params-add,
.params-save {
  @apply inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60;
}

.params-create {
  @apply mb-5 grid grid-cols-1 gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-[1.2fr_1fr_160px_1.5fr];
}

.params-create input,
.params-create select,
.params-search input,
.params-inline {
  @apply w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100;
}

.params-table-card {
  @apply overflow-hidden rounded-xl bg-white p-4 shadow-sm;
}

.params-search {
  @apply mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500;
}

.params-search input {
  @apply border-0 bg-transparent p-0 focus:ring-0;
}

.params-table {
  @apply w-full table-auto;
}

.params-table th {
  @apply bg-gray-50 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500;
}

.params-table td {
  @apply border-t border-gray-100 px-3 py-3 align-middle;
}

.params-table td:first-child {
  @apply w-16 text-sm font-bold text-gray-400;
}

.params-inline--code {
  @apply font-mono;
}

.params-open-editor {
  @apply inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100;
}

.params-saving,
.params-state {
  @apply text-sm text-gray-500;
}

.params-modal {
  @apply fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4;
}

.params-modal__panel {
  @apply flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl;
}

.params-modal__head {
  @apply flex items-start justify-between border-b border-gray-200 p-5;
}

.params-modal__head h2 {
  @apply text-xl font-bold text-gray-900;
}

.params-modal__head p {
  @apply mt-1 font-mono text-xs text-gray-500;
}

.params-modal__head button {
  @apply rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900;
}

.params-modal__actions {
  @apply flex justify-end gap-3 border-t border-gray-200 p-4;
}

.params-cancel {
  @apply rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200;
}
</style>
