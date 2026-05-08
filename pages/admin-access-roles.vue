<template>
  <header class="bg-white shadow-sm border-b border-gray-300">
    <div class="px-6 pt-4">
      <div class="flex items-start justify-between">
        <Head :breadcrumbs="breadcrumbs" :icon="p_icon" :title="p_description" show_breadcrumbs="true"/>
      </div>
    </div>
  </header>

  <div v-if="isAuthenticated" class="min-h-full bg-gray-50 p-6 text-gray-900">
    <div class="mb-4 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Роли доступа</h1>
        <p class="text-sm text-gray-500">Настройка доступа к страницам админки для неадминистраторов.</p>
      </div>
      <button class="primary-btn" type="button" @click="openCreateForm">
        <Icon name="heroicons:plus" class="h-5 w-5"/>
        Добавить роль
      </button>
    </div>

    <div class="mb-4 grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto]">
      <input
          v-model="search"
          class="form-input"
          placeholder="Поиск по названию, slug или описанию"
          type="search"
          @keyup.enter="loadRoles"
      >
      <button class="secondary-btn" type="button" @click="loadRoles">
        <Icon name="heroicons:magnifying-glass" class="h-5 w-5"/>
        Найти
      </button>
    </div>

    <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div v-if="loading" class="p-6 text-sm text-gray-500">Загрузка...</div>
      <div v-else-if="roles.length === 0" class="p-6 text-sm text-gray-500">Роли не найдены.</div>

      <div v-else class="divide-y divide-gray-200">
        <article v-for="role in roles" :key="role.id" class="grid gap-4 p-4 lg:grid-cols-[minmax(220px,1fr)_minmax(280px,2fr)_auto] lg:items-center">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-semibold text-gray-900">{{ role.name }}</h2>
              <span :class="role.is_active ? 'badge-green' : 'badge-gray'">
                {{ role.is_active ? 'Активна' : 'Выключена' }}
              </span>
            </div>
            <div class="mt-1 text-xs text-gray-500">{{ role.slug }}</div>
            <p v-if="role.description" class="mt-2 text-sm text-gray-600">{{ role.description }}</p>
          </div>

          <div>
            <div class="mb-2 text-xs font-semibold uppercase text-gray-400">Доступные страницы</div>
            <div class="flex flex-wrap gap-2">
              <span v-for="page in role.admin_pages" :key="page.id" class="page-chip">{{ page.title }}</span>
              <span v-if="!role.admin_pages?.length" class="text-sm text-gray-400">Нет доступа к страницам</span>
            </div>
          </div>

          <div class="flex gap-2 lg:justify-end">
            <button class="icon-btn" title="Редактировать" type="button" @click="openEditForm(role)">
              <Icon name="heroicons:pencil-square" class="h-5 w-5"/>
            </button>
            <button
                :disabled="role.slug === 'user'"
                class="icon-btn danger"
                title="Удалить"
                type="button"
                @click="deleteRole(role)"
            >
              <Icon name="heroicons:trash" class="h-5 w-5"/>
            </button>
          </div>
        </article>
      </div>
    </div>

    <div v-if="isFormOpen" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-950/50 p-4">
      <form class="mt-8 w-full max-w-4xl rounded-lg bg-white p-5 shadow-xl" @submit.prevent="saveRole">
        <div class="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-gray-900">{{ editingRole ? 'Редактирование роли' : 'Новая роль' }}</h2>
            <p class="text-sm text-gray-500">Выберите страницы, которые будут доступны пользователям этой роли.</p>
          </div>
          <button class="icon-btn" type="button" @click="closeForm">
            <Icon name="heroicons:x-mark" class="h-5 w-5"/>
          </button>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="field">
            <span>Название</span>
            <input v-model="form.name" class="form-input" required type="text">
          </label>
          <label class="field">
            <span>Slug</span>
            <input v-model="form.slug" class="form-input" placeholder="Заполнится автоматически" type="text">
          </label>
          <label class="field md:col-span-2">
            <span>Описание</span>
            <textarea v-model="form.description" class="form-input min-h-20" rows="3"/>
          </label>
          <label class="toggle-row md:col-span-2">
            <input v-model="form.is_active" type="checkbox">
            <span>Роль активна</span>
          </label>
        </div>

        <div class="mt-5">
          <div class="mb-3 text-sm font-semibold text-gray-700">Страницы админки</div>
          <div class="grid max-h-80 gap-2 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3 md:grid-cols-2">
            <label v-for="page in adminPages" :key="page.id" class="page-option">
              <input v-model="form.admin_page_ids" :value="page.id" type="checkbox">
              <span>
                <strong>{{ page.title }}</strong>
                <small>{{ page.slug }}</small>
              </span>
            </label>
          </div>
        </div>

        <div v-if="errorMessage" class="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{{ errorMessage }}</div>

        <div class="mt-5 flex justify-end gap-2">
          <button class="secondary-btn" type="button" @click="closeForm">Отмена</button>
          <button :disabled="saving" class="primary-btn" type="submit">
            <Icon name="heroicons:check" class="h-5 w-5"/>
            {{ saving ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import Head from '~/components/parts/Head.vue'
import { useAuth } from '~/composables/useAuth'
import { useGlobalsStore } from '~/stores/globals'

interface AdminPageItem {
  id: number
  title: string
  slug: string
}

interface AdminRoleItem {
  id: number
  name: string
  slug: string
  description?: string | null
  is_active: boolean
  admin_pages: AdminPageItem[]
}

const globalsStore = useGlobalsStore()
const {params} = storeToRefs(globalsStore)

await useAsyncData('admin-access-roles-globals', async () => {
  await globalsStore.fetchData()
  return {params: globalsStore.params}
})

useSeoMeta({
  title: ((params.value as any).adminka_name || 'Админка') + ' - Роли',
  description: 'Роли доступа к админке',
})

const p_icon = 'heroicons:shield-check'
const p_description = 'Роли'
const breadcrumbs = [
  {
    id: 1,
    title: 'Система',
    icon: 'fluent:window-dev-tools-20-filled',
    slug: '/system',
  },
]

const {isAuthenticated} = useAuth()
const {apiRequest} = useApi()

const roles = ref<AdminRoleItem[]>([])
const adminPages = ref<AdminPageItem[]>([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const errorMessage = ref('')
const isFormOpen = ref(false)
const editingRole = ref<AdminRoleItem | null>(null)
const form = reactive({
  name: '',
  slug: '',
  description: '',
  is_active: true,
  admin_page_ids: [] as number[],
})

const loadRoles = async () => {
  loading.value = true
  try {
    const response: any = await apiRequest('/admin-access-roles', {
      query: {
        q: search.value || undefined,
        per_page: 100,
      },
    })
    roles.value = response.data || []
  } finally {
    loading.value = false
  }
}

const loadAdminPages = async () => {
  const response: any = await apiRequest('/admin-pages', {
    query: {
      per_page: 500,
      menu: true,
      sort_field: 'sort_order',
      sort_direction: 'asc',
    },
  })
  adminPages.value = response.data || []
}

const resetForm = () => {
  editingRole.value = null
  form.name = ''
  form.slug = ''
  form.description = ''
  form.is_active = true
  form.admin_page_ids = []
  errorMessage.value = ''
}

const openCreateForm = () => {
  resetForm()
  isFormOpen.value = true
}

const openEditForm = (role: AdminRoleItem) => {
  editingRole.value = role
  form.name = role.name
  form.slug = role.slug
  form.description = role.description || ''
  form.is_active = role.is_active
  form.admin_page_ids = (role.admin_pages || []).map((page) => page.id)
  errorMessage.value = ''
  isFormOpen.value = true
}

const closeForm = () => {
  isFormOpen.value = false
  resetForm()
}

const saveRole = async () => {
  saving.value = true
  errorMessage.value = ''

  try {
    const payload = {
      name: form.name,
      slug: form.slug || null,
      description: form.description || null,
      is_active: form.is_active,
      admin_page_ids: form.admin_page_ids,
    }

    if (editingRole.value) {
      await apiRequest(`/admin-access-roles/${editingRole.value.id}`, {
        method: 'PUT',
        body: payload,
      })
    } else {
      await apiRequest('/admin-access-roles', {
        method: 'POST',
        body: payload,
      })
    }

    closeForm()
    await loadRoles()
  } catch (error: any) {
    errorMessage.value = error?.data?.message || 'Не удалось сохранить роль'
  } finally {
    saving.value = false
  }
}

const deleteRole = async (role: AdminRoleItem) => {
  if (role.slug === 'user' || !confirm(`Удалить роль "${role.name}"?`)) {
    return
  }

  await apiRequest(`/admin-access-roles/${role.id}`, {
    method: 'DELETE',
  })
  await loadRoles()
}

onMounted(async () => {
  if (!isAuthenticated.value) {
    return
  }

  await Promise.all([loadRoles(), loadAdminPages()])
})
</script>

<style scoped>
.primary-btn,
.secondary-btn,
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  transition: 0.2s ease;
}

.primary-btn {
  background: #1d4ed8;
  color: #fff;
  padding: 0.625rem 1rem;
}

.primary-btn:hover {
  background: #1e40af;
}

.secondary-btn {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
  padding: 0.625rem 1rem;
}

.secondary-btn:hover,
.icon-btn:hover {
  background: #f1f5f9;
}

.icon-btn {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
  height: 2.5rem;
  width: 2.5rem;
}

.icon-btn.danger {
  color: #dc2626;
}

.icon-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.form-input {
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid #cbd5e1;
  background: #fff;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
}

.form-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgb(37 99 235 / 0.12);
}

.field {
  display: grid;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #334155;
}

.toggle-row,
.page-option {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.toggle-row {
  color: #334155;
  font-size: 0.875rem;
  font-weight: 700;
}

.page-option {
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  padding: 0.75rem;
}

.page-option span {
  display: grid;
  gap: 0.125rem;
}

.page-option small {
  color: #64748b;
}

.page-chip,
.badge-green,
.badge-gray {
  border-radius: 999px;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.page-chip {
  background: #eff6ff;
  color: #1d4ed8;
}

.badge-green {
  background: #dcfce7;
  color: #166534;
}

.badge-gray {
  background: #f1f5f9;
  color: #64748b;
}
</style>
