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

const blankAddress = () => ({ title: '', address: '', latitude: '', longitude: '', is_main: false, sort_order: 500 })
const blankPhone = () => ({ title: '', phone: '', sort_order: 500 })
const blankEmail = () => ({ title: '', email: '', sort_order: 500 })
const blankSocial = () => ({ title: '', icon: 'mdi:link-variant', url: '', sort_order: 500 })

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
  if (!confirm('Удалить обращение?')) return
  await apiRequest(`/contact-messages/${message.id}`, { method: 'DELETE' })
  messages.value = messages.value.filter((item) => item.id !== message.id)
  unprocessedCount.value = messages.value.filter((item) => !item.is_processed).length
}

const formatDate = (value) => value ? new Date(value).toLocaleString('ru-RU') : ''

onMounted(loadContacts)
</script>

<template>
  <div class="contacts-admin">
    <div class="contacts-admin__head">
      <div>
        <h1>Контакты</h1>
        <p>Контактная страница сайта и обращения пользователей</p>
      </div>
      <div class="contacts-admin__badge">
        <Icon icon="mdi:email-alert-outline" />
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
          <button type="button" @click="addresses.push(blankAddress())"><Icon icon="mdi:plus" /> Добавить</button>
        </div>
        <div v-for="(address, index) in addresses" :key="index" class="repeat-row repeat-row--address">
          <input v-model="address.title" placeholder="Заголовок">
          <input v-model="address.address" placeholder="Адрес">
          <input v-model="address.latitude" placeholder="Широта">
          <input v-model="address.longitude" placeholder="Долгота">
          <input v-model.number="address.sort_order" type="number" placeholder="Сорт.">
          <label class="check-row"><input :checked="address.is_main" type="radio" name="main-address" @change="setMainAddress(index)"> Главный</label>
          <button type="button" class="danger" @click="addresses.splice(index, 1)"><Icon icon="mdi:trash-can-outline" /></button>
        </div>
      </section>

      <section class="contacts-card">
        <div class="section-head"><h2>Телефоны</h2><button type="button" @click="phones.push(blankPhone())"><Icon icon="mdi:plus" /> Добавить</button></div>
        <div v-for="(phone, index) in phones" :key="index" class="repeat-row">
          <input v-model="phone.title" placeholder="Заголовок">
          <input v-model="phone.phone" placeholder="+7...">
          <input v-model.number="phone.sort_order" type="number" placeholder="Сорт.">
          <button type="button" class="danger" @click="phones.splice(index, 1)"><Icon icon="mdi:trash-can-outline" /></button>
        </div>
      </section>

      <section class="contacts-card">
        <div class="section-head"><h2>Email</h2><button type="button" @click="emails.push(blankEmail())"><Icon icon="mdi:plus" /> Добавить</button></div>
        <div v-for="(email, index) in emails" :key="index" class="repeat-row">
          <input v-model="email.title" placeholder="Заголовок">
          <input v-model="email.email" placeholder="info@example.ru">
          <input v-model.number="email.sort_order" type="number" placeholder="Сорт.">
          <button type="button" class="danger" @click="emails.splice(index, 1)"><Icon icon="mdi:trash-can-outline" /></button>
        </div>
      </section>

      <section class="contacts-card">
        <div class="section-head"><h2>Соцсети</h2><button type="button" @click="socials.push(blankSocial())"><Icon icon="mdi:plus" /> Добавить</button></div>
        <div v-for="(social, index) in socials" :key="index" class="repeat-row">
          <input v-model="social.title" placeholder="Название">
          <input v-model="social.icon" placeholder="mdi:telegram">
          <input v-model="social.url" placeholder="https://...">
          <input v-model.number="social.sort_order" type="number" placeholder="Сорт.">
          <button type="button" class="danger" @click="socials.splice(index, 1)"><Icon icon="mdi:trash-can-outline" /></button>
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
        <Icon icon="mdi:content-save-outline" />
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
            <button type="button" class="danger" @click="deleteMessage(message)"><Icon icon="mdi:trash-can-outline" /></button>
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
  color: #e5e7eb;
}
.contacts-admin__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
h1 {
  margin: 0;
  color: #fff;
  font-size: 34px;
  font-weight: 900;
}
h2 {
  margin: 0 0 14px;
  color: #fff;
  font-size: 22px;
  font-weight: 850;
}
.contacts-admin__head p {
  color: #94a3b8;
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
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 18px;
  background: #111827;
  padding: 18px;
  box-shadow: 0 18px 42px rgba(0,0,0,.18);
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
  color: #94a3b8;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}
input,
textarea {
  width: 100%;
  border: 1px solid #374151;
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
.check-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #e5e7eb;
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
  color: #fecaca;
}
.contacts-alert {
  border-radius: 14px;
  padding: 12px 14px;
  font-weight: 850;
}
.contacts-alert--error {
  background: rgba(239, 68, 68, .18);
  color: #fecaca;
}
.contacts-alert--success {
  background: rgba(34, 197, 94, .18);
  color: #bbf7d0;
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
  background: rgba(255,255,255,.06);
  padding: 10px;
}
.messages-row--head {
  color: #94a3b8;
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
  color: #94a3b8;
}
.status-btn {
  border-radius: 999px;
  background: rgba(246, 113, 12, .2);
  color: #ffd8bd;
  padding: 7px 9px;
  font-size: 12px;
  font-weight: 900;
}
.status-btn--done {
  background: rgba(34, 197, 94, .2);
  color: #bbf7d0;
}
.empty {
  color: #94a3b8;
  padding: 20px;
  text-align: center;
}
@media (max-width: 1100px) {
  .form-grid,
  .form-grid--settings,
  .repeat-row,
  .repeat-row--address,
  .messages-row {
    grid-template-columns: 1fr;
  }
}
</style>
