<template>
  <header class="bg-white shadow-sm border-b border-gray-300">
    <div class="px-6 pt-4">
      <div class="flex items-start justify-between">
        <Head :breadcrumbs="breadcrumbs" :icon="p_icon" :title="p_description" show_breadcrumbs="true"/>
      </div>
    </div>
  </header>

  <div v-if="isAuthenticated" class="min-h-full bg-gray-50 p-6 text-gray-900">
    <div class="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h1 class="text-xl font-bold text-gray-900">Пользователи</h1>
      <p class="text-sm text-gray-500">Просмотр данных, блокировка, подтверждение почты, смена пароля и назначение ролей.</p>
    </div>

    <div class="mb-4 grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_180px_180px_auto]">
      <input
          v-model="search"
          class="form-input"
          placeholder="Поиск по имени или email"
          type="search"
          @keyup.enter="loadUsers"
      >
      <select v-model="filters.is_blocked" class="form-input">
        <option value="">Все статусы</option>
        <option value="false">Активные</option>
        <option value="true">Заблокированные</option>
      </select>
      <select v-model="filters.is_admin" class="form-input">
        <option value="">Все типы</option>
        <option value="true">Администраторы</option>
        <option value="false">Не администраторы</option>
      </select>
      <button class="secondary-btn" type="button" @click="loadUsers">
        <Icon name="heroicons:magnifying-glass" class="h-5 w-5"/>
        Найти
      </button>
    </div>

    <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div v-if="loading" class="p-6 text-sm text-gray-500">Загрузка...</div>
      <div v-else-if="users.length === 0" class="p-6 text-sm text-gray-500">Пользователи не найдены.</div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-100 text-xs uppercase text-gray-500">
          <tr>
            <th class="px-4 py-3 text-left">Пользователь</th>
            <th class="px-4 py-3 text-left">Регистрация</th>
            <th class="px-4 py-3 text-left">Статус</th>
            <th class="px-4 py-3 text-left">Роли</th>
            <th class="px-4 py-3 text-right">Действия</th>
          </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="item in users" :key="item.id">
            <td class="px-4 py-3">
              <div class="font-semibold text-gray-900">{{ item.name }}</div>
              <div class="text-xs text-gray-500">{{ item.email }}</div>
            </td>
            <td class="px-4 py-3">
              <span class="badge-gray">{{ registrationLabels[item.registration_type] || item.registration_type }}</span>
              <div class="mt-1 text-xs text-gray-500">{{ formatDate(item.created_at) }}</div>
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-2">
                <span :class="item.email_verified ? 'badge-green' : 'badge-orange'">
                  {{ item.email_verified ? 'Email подтвержден' : 'Email не подтвержден' }}
                </span>
                <span v-if="item.is_admin" class="badge-blue">Администратор</span>
                <span v-if="item.is_blocked" class="badge-red">Заблокирован</span>
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-2">
                <span v-for="role in item.admin_roles" :key="role.id" class="page-chip">{{ role.name }}</span>
                <span v-if="!item.admin_roles?.length" class="text-xs text-gray-400">Нет ролей</span>
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-2">
                <button class="icon-btn" title="Редактировать" type="button" @click="openEditForm(item)">
                  <Icon name="heroicons:pencil-square" class="h-5 w-5"/>
                </button>
                <button class="icon-btn" title="Сменить пароль" type="button" @click="openPasswordForm(item)">
                  <Icon name="heroicons:key" class="h-5 w-5"/>
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="isUserFormOpen" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-950/50 p-4">
      <form class="mt-8 w-full max-w-3xl rounded-lg bg-white p-5 shadow-xl" @submit.prevent="saveUser">
        <div class="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-gray-900">Редактирование пользователя</h2>
            <p class="text-sm text-gray-500">{{ editingUser?.email }}</p>
          </div>
          <button class="icon-btn" type="button" @click="closeUserForm">
            <Icon name="heroicons:x-mark" class="h-5 w-5"/>
          </button>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="field">
            <span>Имя</span>
            <input v-model="userForm.name" class="form-input" required type="text">
          </label>
          <label class="field">
            <span>Email</span>
            <input v-model="userForm.email" class="form-input" required type="email">
          </label>
          <label class="toggle-row">
            <input v-model="userForm.email_verified" type="checkbox">
            <span>Email подтвержден</span>
          </label>
          <label class="toggle-row">
            <input v-model="userForm.is_admin" type="checkbox">
            <span>Администратор</span>
          </label>
          <label class="toggle-row">
            <input v-model="userForm.is_blocked" type="checkbox">
            <span>Пользователь заблокирован</span>
          </label>
        </div>

        <div class="mt-5">
          <div class="mb-3 text-sm font-semibold text-gray-700">Роли пользователя</div>
          <div class="grid gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 md:grid-cols-2">
            <label v-for="role in roles" :key="role.id" class="role-option">
              <input v-model="userForm.admin_role_ids" :value="role.id" type="checkbox">
              <span>{{ role.name }}</span>
            </label>
          </div>
          <p v-if="editingUser?.is_admin" class="mt-2 text-xs text-gray-500">
            Администратор всегда имеет полный доступ независимо от выбранных ролей.
          </p>
        </div>

        <div v-if="errorMessage" class="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{{ errorMessage }}</div>

        <div class="mt-5 flex justify-end gap-2">
          <button class="secondary-btn" type="button" @click="closeUserForm">Отмена</button>
          <button :disabled="saving" class="primary-btn" type="submit">
            <Icon name="heroicons:check" class="h-5 w-5"/>
            {{ saving ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="isPasswordFormOpen" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-950/50 p-4">
      <form class="mt-8 w-full max-w-lg rounded-lg bg-white p-5 shadow-xl" @submit.prevent="savePassword">
        <div class="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-gray-900">Смена пароля</h2>
            <p class="text-sm text-gray-500">{{ editingUser?.email }}</p>
          </div>
          <button class="icon-btn" type="button" @click="closePasswordForm">
            <Icon name="heroicons:x-mark" class="h-5 w-5"/>
          </button>
        </div>

        <div class="grid gap-4">
          <label class="field">
            <span>Новый пароль</span>
            <input v-model="passwordForm.password" class="form-input" minlength="8" required type="password">
          </label>
          <label class="field">
            <span>Повтор пароля</span>
            <input v-model="passwordForm.password_confirmation" class="form-input" minlength="8" required type="password">
          </label>
        </div>

        <div v-if="errorMessage" class="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{{ errorMessage }}</div>

        <div class="mt-5 flex justify-end gap-2">
          <button class="secondary-btn" type="button" @click="closePasswordForm">Отмена</button>
          <button :disabled="saving" class="primary-btn" type="submit">
            <Icon name="heroicons:key" class="h-5 w-5"/>
            {{ saving ? 'Сохранение...' : 'Изменить пароль' }}
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

interface AdminRoleItem {
  id: number
  name: string
  slug: string
}

interface AdminUserItem {
  id: number
  name: string
  email: string
  is_admin: boolean
  is_blocked: boolean
  email_verified: boolean
  registration_type: string
  created_at: string | null
  admin_roles: AdminRoleItem[]
  admin_role_ids: number[]
}

const globalsStore = useGlobalsStore()
const {params} = storeToRefs(globalsStore)

await useAsyncData('admin-users-globals', async () => {
  await globalsStore.fetchData()
  return {params: globalsStore.params}
})

useSeoMeta({
  title: ((params.value as any).adminka_name || 'Админка') + ' - Пользователи',
  description: 'Пользователи',
})

const p_icon = 'heroicons:users'
const p_description = 'Пользователи'
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

const registrationLabels: Record<string, string> = {
  email: 'Почта',
  google: 'Google',
  yandex: 'Яндекс',
}

const users = ref<AdminUserItem[]>([])
const roles = ref<AdminRoleItem[]>([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const filters = reactive({
  is_blocked: '',
  is_admin: '',
})
const errorMessage = ref('')
const editingUser = ref<AdminUserItem | null>(null)
const isUserFormOpen = ref(false)
const isPasswordFormOpen = ref(false)
const userForm = reactive({
  name: '',
  email: '',
  email_verified: false,
  is_admin: false,
  is_blocked: false,
  admin_role_ids: [] as number[],
})
const passwordForm = reactive({
  password: '',
  password_confirmation: '',
})

const loadUsers = async () => {
  loading.value = true
  try {
    const response: any = await apiRequest('/admin-users', {
      query: {
        q: search.value || undefined,
        is_blocked: filters.is_blocked || undefined,
        is_admin: filters.is_admin || undefined,
        per_page: 100,
      },
    })
    users.value = response.data || []
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  roles.value = await apiRequest('/admin-access-roles', {
    query: {
      type: 'async',
    },
  }) as AdminRoleItem[]
}

const openEditForm = (item: AdminUserItem) => {
  editingUser.value = item
  userForm.name = item.name
  userForm.email = item.email
  userForm.email_verified = item.email_verified
  userForm.is_admin = item.is_admin
  userForm.is_blocked = item.is_blocked
  userForm.admin_role_ids = [...(item.admin_role_ids || [])]
  errorMessage.value = ''
  isUserFormOpen.value = true
}

const closeUserForm = () => {
  isUserFormOpen.value = false
  editingUser.value = null
  errorMessage.value = ''
}

const saveUser = async () => {
  if (!editingUser.value) {
    return
  }

  saving.value = true
  errorMessage.value = ''

  try {
    await apiRequest(`/admin-users/${editingUser.value.id}`, {
      method: 'PUT',
      body: {
        name: userForm.name,
        email: userForm.email,
        email_verified: userForm.email_verified,
        is_admin: userForm.is_admin,
        is_blocked: userForm.is_blocked,
        admin_role_ids: userForm.admin_role_ids,
      },
    })

    closeUserForm()
    await loadUsers()
  } catch (error: any) {
    errorMessage.value = error?.data?.message || 'Не удалось сохранить пользователя'
  } finally {
    saving.value = false
  }
}

const openPasswordForm = (item: AdminUserItem) => {
  editingUser.value = item
  passwordForm.password = ''
  passwordForm.password_confirmation = ''
  errorMessage.value = ''
  isPasswordFormOpen.value = true
}

const closePasswordForm = () => {
  isPasswordFormOpen.value = false
  editingUser.value = null
  errorMessage.value = ''
}

const savePassword = async () => {
  if (!editingUser.value) {
    return
  }

  saving.value = true
  errorMessage.value = ''

  try {
    await apiRequest(`/admin-users/${editingUser.value.id}/password`, {
      method: 'POST',
      body: {
        password: passwordForm.password,
        password_confirmation: passwordForm.password_confirmation,
      },
    })

    closePasswordForm()
  } catch (error: any) {
    errorMessage.value = error?.data?.message || 'Не удалось изменить пароль'
  } finally {
    saving.value = false
  }
}

const formatDate = (value: string | null) => {
  if (!value) {
    return ''
  }

  return new Date(value).toLocaleDateString('ru-RU')
}

onMounted(async () => {
  if (!isAuthenticated.value) {
    return
  }

  await Promise.all([loadUsers(), loadRoles()])
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
.role-option {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.toggle-row {
  color: #334155;
  font-size: 0.875rem;
  font-weight: 700;
}

.role-option {
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  padding: 0.75rem;
}

.page-chip,
.badge-green,
.badge-orange,
.badge-red,
.badge-blue,
.badge-gray {
  border-radius: 999px;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.page-chip,
.badge-blue {
  background: #eff6ff;
  color: #1d4ed8;
}

.badge-green {
  background: #dcfce7;
  color: #166534;
}

.badge-orange {
  background: #ffedd5;
  color: #9a3412;
}

.badge-red {
  background: #fee2e2;
  color: #b91c1c;
}

.badge-gray {
  background: #f1f5f9;
  color: #64748b;
}
</style>
