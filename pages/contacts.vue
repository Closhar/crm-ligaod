<script setup>
const { apiRequest } = useApi()

const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const page = reactive({
  title: 'Контакты',
  description: '',
  notify_email_enabled: false,
  notify_email_to: '',
  notify_telegram_enabled: false,
  notify_telegram_bot_token: '',
  notify_telegram_chat_id: '',
})
const addresses = ref([])
const phones = ref([])
const emails = ref([])
const socials = ref([])
const messages = ref([])
const unprocessedCount = ref(0)
const deleteConfirmOpen = ref(false)
const deleteConfirmLoading = ref(false)
const pendingDelete = ref(null)

const blankAddress = () => ({ title: '', address: '', latitude: '', longitude: '', is_main: false, sort_order: 500 })
const blankPhone = () => ({ title: '', phone: '', sort_order: 500 })
const blankEmail = () => ({ title: '', email: '', sort_order: 500 })
const blankSocial = () => ({ title: '', icon: 'mdi:link-variant', url: '', sort_order: 500 })

const contactCollections = {
  address: addresses,
  phone: phones,
  email: emails,
  social: socials,
}

const deleteTitles = {
  address: 'Удаление адреса',
  phone: 'Удаление телефона',
  email: 'Удаление email',
  social: 'Удаление соцсети',
  message: 'Удаление обращения',
}

const deleteNames = {
  address: 'адрес',
  phone: 'телефон',
  email: 'email',
  social: 'соцсеть',
  message: 'обращение',
}

const loadContacts = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await apiRequest('/contacts/admin')
    const data = response?.data || {}
    Object.assign(page, data.page || {})
    addresses.value = data.addresses?.length ? data.addresses : [blankAddress()]
    phones.value = data.phones || []
    emails.value = data.emails || []
    socials.value = data.socials || []
    messages.value = data.messages || []
    unprocessedCount.value = data.unprocessed_count || 0
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Не удалось загрузить контакты'
  } finally {
    loading.value = false
  }
}

const setMainAddress = (index) => {
  addresses.value = addresses.value.map((item, itemIndex) => ({ ...item, is_main: itemIndex === index }))
}

const saveContacts = async () => {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const response = await apiRequest('/contacts/admin', {
      method: 'PUT',
      body: { page, addresses: addresses.value, phones: phones.value, emails: emails.value, socials: socials.value },
    })
    const data = response?.data || {}
    Object.assign(page, data.page || {})
    addresses.value = data.addresses || []
    phones.value = data.phones || []
    emails.value = data.emails || []
    socials.value = data.socials || []
    messages.value = data.messages || []
    unprocessedCount.value = data.unprocessed_count || 0
    successMessage.value = 'Контакты сохранены'
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Не удалось сохранить контакты'
  } finally {
    saving.value = false
  }
}

const toggleProcessed = async (message) => {
  const response = await apiRequest(`/contact-messages/${message.id}`, {
    method: 'PATCH',
    body: { is_processed: !message.is_processed },
  })
  const updated = response?.data
  messages.value = messages.value.map((item) => item.id === updated.id ? updated : item)
  unprocessedCount.value = messages.value.filter((item) => !item.is_processed).length
}

const deleteMessage = async (message) => {
  await apiRequest(`/contact-messages/${message.id}`, { method: 'DELETE' })
  messages.value = messages.value.filter((item) => item.id !== message.id)
  unprocessedCount.value = messages.value.filter((item) => !item.is_processed).length
}

const getDeleteTargetTitle = (item) => {
  return item?.title || item?.address || item?.phone || item?.email || item?.url || item?.subject || ''
}

const openDeleteConfirm = (type, index, item) => {
  const targetTitle = getDeleteTargetTitle(item)
  pendingDelete.value = { type, index, item }
  deleteConfirmOpen.value = true
  successMessage.value = ''
  errorMessage.value = ''
  pendingDelete.value.message = targetTitle
    ? `Удалить ${deleteNames[type]} "${targetTitle}"? Это действие применится после сохранения контактов.`
    : `Удалить ${deleteNames[type]}? Это действие применится после сохранения контактов.`

  if (type === 'message') {
    pendingDelete.value.message = targetTitle
      ? `Удалить обращение "${targetTitle}"? Это действие нельзя отменить.`
      : 'Удалить обращение? Это действие нельзя отменить.'
  }
}

const closeDeleteConfirm = () => {
  if (deleteConfirmLoading.value) return
  deleteConfirmOpen.value = false
  pendingDelete.value = null
}

const confirmDelete = async () => {
  if (!pendingDelete.value) return

  deleteConfirmLoading.value = true
  try {
    const { type, index, item } = pendingDelete.value

    if (type === 'message') {
      await deleteMessage(item)
    } else {
      const collection = contactCollections[type]
      collection?.value?.splice(index, 1)

      if (type === 'address' && addresses.value.length && !addresses.value.some((address) => address.is_main)) {
        addresses.value[0].is_main = true
      }
    }

    deleteConfirmOpen.value = false
    pendingDelete.value = null
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Не удалось удалить запись'
  } finally {
    deleteConfirmLoading.value = false
  }
}

const formatDate = (value) => value ? new Date(value).toLocaleString('ru-RU') : ''

onMounted(loadContacts)
</script>

<template>
  <div class="contacts-admin">
    <ConfirmModal
      :is-open="deleteConfirmOpen"
      :title="pendingDelete ? deleteTitles[pendingDelete.type] : 'Удаление'"
      :message="pendingDelete?.message || 'Удалить запись?'"
      type="danger"
      :confirm-text="deleteConfirmLoading ? 'Удаление...' : 'Удалить'"
      cancel-text="Отмена"
      @confirm="confirmDelete"
      @cancel="closeDeleteConfirm"
    />

    <div class="contacts-admin__head">
      <div>
        <h1>Контакты</h1>
        <p>Контактная страница сайта и обращения пользователей</p>
      </div>
      <div class="contacts-admin__badge">
        <Icon name="mdi:email-alert-outline" />
        {{ unprocessedCount }} необработанных
      </div>
    </div>

    <div v-if="loading" class="contacts-card">Загрузка...</div>
    <template v-else>
      <div v-if="errorMessage" class="contacts-alert contacts-alert--error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="contacts-alert contacts-alert--success">{{ successMessage }}</div>

      <section class="contacts-card">
        <h2>Страница</h2>
        <div class="form-grid">
          <label><span>Заголовок</span><input v-model="page.title" type="text"></label>
          <label><span>Описание</span><textarea v-model="page.description" rows="3"></textarea></label>
        </div>
      </section>

      <section class="contacts-card">
        <div class="section-head">
          <h2>Адреса</h2>
          <button type="button" @click="addresses.push(blankAddress())"><Icon name="mdi:plus" /> Добавить</button>
        </div>
        <div v-for="(address, index) in addresses" :key="index" class="repeat-row repeat-row--address">
          <input v-model="address.title" placeholder="Заголовок">
          <input v-model="address.address" placeholder="Адрес">
          <input v-model="address.latitude" placeholder="Широта">
          <input v-model="address.longitude" placeholder="Долгота">
          <input v-model.number="address.sort_order" type="number" placeholder="Сорт.">
          <label class="check-row"><input :checked="address.is_main" type="radio" name="main-address" @change="setMainAddress(index)"> Главный</label>
          <button type="button" class="danger" @click="openDeleteConfirm('address', index, address)"><Icon name="mdi:trash-can-outline" /></button>
        </div>
      </section>

      <section class="contacts-card">
        <div class="section-head"><h2>Телефоны</h2><button type="button" @click="phones.push(blankPhone())"><Icon name="mdi:plus" /> Добавить</button></div>
        <div v-for="(phone, index) in phones" :key="index" class="repeat-row">
          <input v-model="phone.title" placeholder="Заголовок">
          <input v-model="phone.phone" placeholder="+7...">
          <input v-model.number="phone.sort_order" type="number" placeholder="Сорт.">
          <button type="button" class="danger" @click="openDeleteConfirm('phone', index, phone)"><Icon name="mdi:trash-can-outline" /></button>
        </div>
      </section>

      <section class="contacts-card">
        <div class="section-head"><h2>Email</h2><button type="button" @click="emails.push(blankEmail())"><Icon name="mdi:plus" /> Добавить</button></div>
        <div v-for="(email, index) in emails" :key="index" class="repeat-row">
          <input v-model="email.title" placeholder="Заголовок">
          <input v-model="email.email" placeholder="info@example.ru">
          <input v-model.number="email.sort_order" type="number" placeholder="Сорт.">
          <button type="button" class="danger" @click="openDeleteConfirm('email', index, email)"><Icon name="mdi:trash-can-outline" /></button>
        </div>
      </section>

      <section class="contacts-card">
        <div class="section-head"><h2>Соцсети</h2><button type="button" @click="socials.push(blankSocial())"><Icon name="mdi:plus" /> Добавить</button></div>
        <div v-for="(social, index) in socials" :key="index" class="repeat-row repeat-row--social">
          <input v-model="social.title" placeholder="Название">
          <input v-model="social.icon" placeholder="mdi:telegram">
          <input v-model="social.url" placeholder="https://...">
          <input v-model.number="social.sort_order" type="number" placeholder="Сорт.">
          <button type="button" class="danger" @click="openDeleteConfirm('social', index, social)"><Icon name="mdi:trash-can-outline" /></button>
        </div>
      </section>

      <section class="contacts-card">
        <h2>Уведомления</h2>
        <div class="form-grid form-grid--settings">
          <label class="check-row"><input v-model="page.notify_email_enabled" type="checkbox"> Уведомлять по email</label>
          <label><span>Email получателя</span><input v-model="page.notify_email_to" type="email"></label>
          <label class="check-row"><input v-model="page.notify_telegram_enabled" type="checkbox"> Уведомлять в Telegram</label>
          <label><span>Telegram bot token</span><input v-model="page.notify_telegram_bot_token" type="password"></label>
          <label><span>Telegram chat id</span><input v-model="page.notify_telegram_chat_id" type="text"></label>
        </div>
      </section>

      <button class="save-btn" type="button" :disabled="saving" @click="saveContacts">
        <Icon name="mdi:content-save-outline" />
        {{ saving ? 'Сохранение...' : 'Сохранить контакты' }}
      </button>

      <section class="contacts-card">
        <h2>Обращения</h2>
        <div class="messages-table">
          <div class="messages-row messages-row--head">
            <span>Статус</span><span>Контакт</span><span>Тема</span><span>Дата</span><span></span>
          </div>
          <div v-for="message in messages" :key="message.id" class="messages-row">
            <button type="button" class="status-btn" :class="{ 'status-btn--done': message.is_processed }" @click="toggleProcessed(message)">
              {{ message.is_processed ? 'Обработано' : 'Новое' }}
            </button>
            <span><strong>{{ message.name }}</strong><small>{{ message.email || message.phone }}</small></span>
            <span><strong>{{ message.subject }}</strong><small>{{ message.message }}</small></span>
            <span>{{ formatDate(message.created_at) }}</span>
            <button type="button" class="danger" @click="openDeleteConfirm('message', null, message)"><Icon name="mdi:trash-can-outline" /></button>
          </div>
          <div v-if="!messages.length" class="empty">Обращений пока нет</div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.contacts-admin {
  display: grid;
  gap: 18px;
  padding: 24px;
  color: #111827;
}
.contacts-admin__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
h1 {
  margin: 0;
  color: #111827;
  font-size: 34px;
  font-weight: 900;
}
h2 {
  margin: 0 0 14px;
  color: #111827;
  font-size: 22px;
  font-weight: 850;
}
.contacts-admin__head p {
  color: #475569;
}
.contacts-admin__badge,
.save-btn,
.section-head button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  background: #f6710c;
  color: #111827;
  padding: 10px 14px;
  font-weight: 900;
}
.contacts-card {
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #fff;
  padding: 18px;
  color: #111827;
  box-shadow: 0 18px 42px rgba(15, 23, 42, .08);
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 14px;
}
.form-grid--settings {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
label {
  display: grid;
  gap: 7px;
}
label span {
  color: #475569;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}
input,
textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  color: #111827;
  padding: 10px 12px;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.repeat-row {
  display: grid;
  grid-template-columns: 1fr 1.5fr 100px 44px;
  gap: 10px;
  align-items: center;
  margin-top: 10px;
}
.repeat-row--address {
  grid-template-columns: 1fr 2fr 120px 120px 90px 110px 44px;
}
.repeat-row--social {
  grid-template-columns: minmax(150px, 1fr) minmax(150px, 1fr) minmax(320px, 2.5fr) 120px 44px;
}
.check-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #111827;
}
.check-row input {
  width: auto;
}
.danger {
  display: grid;
  min-height: 42px;
  place-items: center;
  border-radius: 10px;
  background: rgba(239, 68, 68, .14);
  color: #b91c1c;
}
.contacts-alert {
  border-radius: 14px;
  padding: 12px 14px;
  font-weight: 850;
}
.contacts-alert--error {
  background: #fef2f2;
  color: #b91c1c;
}
.contacts-alert--success {
  background: #f0fdf4;
  color: #166534;
}
.messages-table {
  display: grid;
  gap: 8px;
}
.messages-row {
  display: grid;
  grid-template-columns: 110px 1fr 1.6fr 150px 44px;
  gap: 10px;
  align-items: start;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  padding: 10px;
}
.messages-row--head {
  border-color: transparent;
  background: #fff7ed;
  color: #7c2d12;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}
.messages-row strong,
.messages-row small {
  display: block;
}
.messages-row small {
  max-height: 42px;
  overflow: hidden;
  color: #64748b;
}
.status-btn {
  border-radius: 999px;
  background: #ffedd5;
  color: #9a3412;
  padding: 7px 9px;
  font-size: 12px;
  font-weight: 900;
}
.status-btn--done {
  background: #dcfce7;
  color: #166534;
}
.empty {
  color: #64748b;
  padding: 20px;
  text-align: center;
}
@media (max-width: 1100px) {
  .form-grid,
  .form-grid--settings,
  .repeat-row,
  .repeat-row--address,
  .repeat-row--social,
  .messages-row {
    grid-template-columns: 1fr;
  }
}
</style>
