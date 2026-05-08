<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue'
import {useAuth} from '~/composables/useAuth'

const props = defineProps({
  avatar: {
    type: String,
    default: '/images/logo.png',
  },
})

const {isAuthenticated, user, checkAuth} = useAuth()
const config = useRuntimeConfig()
const api = config.public.API_URL

const fileInput = ref<HTMLInputElement | null>(null)
const avatarFile = ref<File | null>(null)
const avatarPreview = ref('')
const isSaving = ref(false)
const isAvatarLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const currentUser = computed<any>(() => user.value || {})
const avatarSrc = computed(() => avatarPreview.value || currentUser.value?.avatar_path || props.avatar)
const hasCustomAvatar = computed(() => Boolean(currentUser.value?.avatar_path || avatarFile.value))

const showMessage = (target: typeof successMessage, message: string) => {
  target.value = message
  setTimeout(() => {
    target.value = ''
  }, 5000)
}

onMounted(() => {
  if (isAuthenticated.value) {
    checkAuth()
  } else {
    navigateTo('/account')
  }
})

watch(
  () => currentUser.value?.avatar_path,
  (newAvatarPath) => {
    if (!avatarFile.value) {
      avatarPreview.value = newAvatarPath || ''
    }
  },
  {immediate: true},
)

const openFileDialog = () => {
  fileInput.value?.click()
}

const handleAvatarChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  avatarFile.value = file
  isAvatarLoading.value = true

  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = String(e.target?.result || '')
    isAvatarLoading.value = false
  }
  reader.readAsDataURL(file)
}

const updateProfile = async () => {
  if (!user.value) {
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  isSaving.value = true

  const formData = new FormData()
  formData.append('name', currentUser.value.name || '')

  if (avatarFile.value) {
    formData.append('avatar', avatarFile.value)
  }

  try {
    const updatedUser = await $fetch<any>(api + '/api/user', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    })

    user.value = updatedUser
    avatarFile.value = null
    avatarPreview.value = updatedUser.avatar_path || ''
    showMessage(successMessage, 'Профиль обновлен')
  } catch (err: any) {
    handleError(err)
  } finally {
    isSaving.value = false
  }
}

const deleteAvatar = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  isSaving.value = true

  try {
    const response = await $fetch<any>(api + '/api/user/avatar', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    })

    user.value = response.user
    avatarFile.value = null
    avatarPreview.value = ''
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    showMessage(successMessage, 'Аватар удален')
  } catch (err: any) {
    handleError(err)
  } finally {
    isSaving.value = false
  }
}

const handleError = (err: any) => {
  if (err?.data?.errors) {
    const message = Object.values(err.data.errors)
      .flat()
      .join('\n')
    showMessage(errorMessage, message || 'Не удалось сохранить профиль')
    return
  }

  showMessage(errorMessage, err?.data?.message || err?.message || 'Не удалось сохранить профиль')
}
</script>

<template>
  <form class="profile-card" @submit.prevent="updateProfile">
    <div v-if="successMessage" class="profile-note profile-note--success">{{ successMessage }}</div>
    <div v-if="errorMessage" class="profile-note profile-note--error">{{ errorMessage }}</div>

    <div class="profile-card__hero">
      <div class="profile-card__avatar">
        <img :src="avatarSrc" alt="Аватар пользователя">
        <div v-if="isAvatarLoading" class="profile-card__avatar-loading">
          <Icon name="svg-spinners:180-ring" />
        </div>
      </div>

      <div class="profile-card__identity">
        <span>Профиль пользователя</span>
        <strong>{{ currentUser.name || 'Пользователь' }}</strong>
        <small>{{ currentUser.email }}</small>
      </div>
    </div>

    <input
      ref="fileInput"
      accept="image/*"
      class="sr-only"
      type="file"
      @change="handleAvatarChange"
    >

    <div class="profile-card__actions">
      <button class="profile-card__button profile-card__button--secondary" type="button" @click="openFileDialog">
        <Icon name="heroicons:photo" />
        Выбрать аватар
      </button>
      <button
        v-if="hasCustomAvatar"
        class="profile-card__button profile-card__button--danger"
        type="button"
        :disabled="isSaving"
        @click="deleteAvatar"
      >
        <Icon name="heroicons:trash" />
        Удалить
      </button>
    </div>

    <label class="profile-card__field">
      <span>Электронная почта</span>
      <input :value="currentUser.email" disabled type="text">
    </label>

    <label class="profile-card__field">
      <span>Имя</span>
      <input v-model="currentUser.name" type="text">
    </label>

    <button class="profile-card__button profile-card__button--primary" :disabled="isSaving" type="submit">
      <Icon name="heroicons:check" />
      {{ isSaving ? 'Сохранение...' : 'Сохранить изменения' }}
    </button>
  </form>
</template>

<style scoped>
.profile-card {
  display: grid;
  gap: 18px;
  padding: 24px;
  color: #111827;
}

.profile-card__hero {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 18px;
  align-items: center;
  border-radius: 12px;
  border: 1px solid #dbe4f0;
  background: linear-gradient(135deg, #f8fafc 0%, #eef6ff 100%);
  padding: 18px;
}

.profile-card__avatar {
  position: relative;
  width: 112px;
  height: 112px;
  overflow: hidden;
  border-radius: 999px;
  border: 4px solid #fff;
  background: #fff;
  box-shadow: 0 12px 28px rgb(15 23 42 / 0.18);
}

.profile-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-card__avatar-loading {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(15 23 42 / 0.62);
  color: #fff;
  font-size: 30px;
}

.profile-card__identity {
  display: grid;
  gap: 4px;
  text-align: left;
}

.profile-card__identity span {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
}

.profile-card__identity strong {
  font-size: 24px;
  line-height: 1.15;
}

.profile-card__identity small {
  color: #64748b;
}

.profile-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.profile-card__field {
  display: grid;
  gap: 7px;
  text-align: left;
}

.profile-card__field span {
  font-size: 13px;
  font-weight: 800;
  color: #475569;
}

.profile-card__field input {
  width: 100%;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #fff;
  padding: 12px 14px;
  outline: none;
}

.profile-card__field input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgb(37 99 235 / 0.12);
}

.profile-card__field input:disabled {
  background: #f1f5f9;
  color: #64748b;
}

.profile-card__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 10px;
  padding: 11px 16px;
  font-weight: 800;
  transition: 0.2s ease;
}

.profile-card__button--primary {
  background: #1d4ed8;
  color: #fff;
}

.profile-card__button--primary:hover {
  background: #1e40af;
}

.profile-card__button--secondary {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #1e293b;
}

.profile-card__button--secondary:hover {
  background: #f8fafc;
}

.profile-card__button--danger {
  border: 1px solid #fecaca;
  background: #fff1f2;
  color: #be123c;
}

.profile-card__button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.profile-note {
  border-radius: 10px;
  padding: 12px 14px;
  text-align: left;
  font-size: 14px;
  font-weight: 700;
}

.profile-note--success {
  background: #dcfce7;
  color: #166534;
}

.profile-note--error {
  white-space: pre-line;
  background: #fee2e2;
  color: #991b1b;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

@media (max-width: 640px) {
  .profile-card__hero {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }

  .profile-card__identity {
    text-align: center;
  }

  .profile-card__button {
    width: 100%;
  }
}
</style>
