<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Информация о персоне</h2>
        <button @click="$emit('close')" class="modal-close">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="person-header">
          <div class="person-photo">
            <img
              v-if="person.main_image && person.main_image[0]"
              :src="person.main_image[0].image_url"
              :alt="person.full_name"
              class="w-24 h-24 rounded-full object-cover"
            />
            <div v-else class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              <svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
          <div class="person-info">
            <h3 class="person-name">{{ person.full_name }}</h3>
            <p class="person-age">{{ person.age }} лет</p>
            <div v-if="person.active_position_memberships && person.active_position_memberships.length > 0" class="position-badges">
              <span 
                v-for="membership in person.active_position_memberships" 
                :key="membership.id"
                class="badge-warning"
              >
                {{ membership.position?.name || 'Неизвестная должность' }}
              </span>
            </div>
            <div v-if="person.active_amplua_memberships && person.active_amplua_memberships.length > 0" class="amplua-badges">
              <span 
                v-for="membership in person.active_amplua_memberships" 
                :key="membership.id"
                class="badge-success"
              >
                {{ membership.amplua?.name || 'Неизвестное амплуа' }}
              </span>
            </div>
            <span v-if="(!person.active_position_memberships || !person.active_position_memberships.length) && 
                       (!person.active_amplua_memberships || !person.active_amplua_memberships.length)" 
                  class="text-gray-400">
              Должности и амплуа не указаны
            </span>
          </div>
        </div>

        <div class="content-grid">
          <!-- Основная информация -->
          <div class="info-section">
            <h4 class="section-title">Основная информация</h4>
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">Имя:</span>
                <span class="info-value">{{ person.first_name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Фамилия:</span>
                <span class="info-value">{{ person.last_name }}</span>
              </div>
              <div class="info-item" v-if="person.middle_name">
                <span class="info-label">Отчество:</span>
                <span class="info-value">{{ person.middle_name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Дата рождения:</span>
                <span class="info-value">{{ formatDate(person.birth_date) }}</span>
              </div>
              <div class="info-item" v-if="person.address">
                <span class="info-label">Адрес:</span>
                <span class="info-value">{{ person.address }}</span>
              </div>
            </div>
          </div>

          <!-- Должности -->
          <div class="info-section">
            <h4 class="section-title">Должности</h4>
            <div v-if="person.position_memberships && person.position_memberships.length" class="memberships-list">
              <div v-for="membership in person.position_memberships" :key="membership.id" class="membership-item">
                <div class="membership-header">
                  <span class="position-name">{{ membership.position?.name || 'Неизвестная должность' }}</span>
                  <span :class="membership.ended_at ? 'status-inactive' : 'status-active'">
                    {{ membership.ended_at ? 'Завершено' : 'Активно' }}
                  </span>
                </div>
                <div class="membership-details">
                  <span>Начал: {{ formatDate(membership.started_at) }}</span>
                  <span v-if="membership.ended_at">Завершил: {{ formatDate(membership.ended_at) }}</span>
                </div>
                <div v-if="membership.notes" class="membership-notes">
                  {{ membership.notes }}
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>Нет данных о должностях</p>
            </div>
          </div>

          <!-- Амплуа -->
          <div class="info-section">
            <h4 class="section-title">Амплуа</h4>
            <div v-if="person.amplua_memberships && person.amplua_memberships.length" class="memberships-list">
              <div v-for="membership in person.amplua_memberships" :key="membership.id" class="membership-item">
                <div class="membership-header">
                  <span class="amplua-name">{{ membership.amplua?.name || 'Неизвестное амплуа' }}</span>
                  <span :class="membership.ended_at ? 'status-inactive' : 'status-active'">
                    {{ membership.ended_at ? 'Завершено' : 'Активно' }}
                  </span>
                </div>
                <div class="membership-details">
                  <span>Начал: {{ formatDate(membership.started_at) }}</span>
                  <span v-if="membership.ended_at">Завершил: {{ formatDate(membership.ended_at) }}</span>
                </div>
                <div v-if="membership.notes" class="membership-notes">
                  {{ membership.notes }}
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>Нет данных об амплуа</p>
            </div>
          </div>

          <!-- Паспортные данные -->
          <div class="info-section" v-if="person.passport_series || person.passport_number">
            <h4 class="section-title">Паспортные данные</h4>
            <div class="info-list">
              <div class="info-item" v-if="person.passport_series">
                <span class="info-label">Серия:</span>
                <span class="info-value">{{ person.passport_series }}</span>
              </div>
              <div class="info-item" v-if="person.passport_number">
                <span class="info-label">Номер:</span>
                <span class="info-value">{{ person.passport_number }}</span>
              </div>
            </div>
          </div>

          <!-- Команды -->
          <div class="info-section">
            <h4 class="section-title">Команды</h4>
            <div v-if="person.club_memberships && person.club_memberships.length" class="memberships-list">
              <div v-for="membership in person.club_memberships" :key="membership.id" class="membership-item">
                <div class="membership-header">
                  <span class="club-name">{{ membership.club?.name || 'Неизвестная команда' }}</span>
                  <span :class="membership.left_at ? 'status-inactive' : 'status-active'">
                    {{ membership.left_at ? 'Завершено' : 'Активно' }}
                  </span>
                </div>
                <div class="membership-details">
                  <span>Присоединился: {{ formatDate(membership.joined_at) }}</span>
                  <span v-if="membership.left_at">Покинул: {{ formatDate(membership.left_at) }}</span>
                  <span v-if="membership.position">Должность: {{ membership.position }}</span>
                </div>
                <div v-if="membership.notes" class="membership-notes">
                  {{ membership.notes }}
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>Нет данных о членстве в командах</p>
            </div>
          </div>

          <!-- Виды спорта -->
          <div class="info-section">
            <h4 class="section-title">Виды спорта</h4>
            <div v-if="person.sport_memberships && person.sport_memberships.length" class="memberships-list">
              <div v-for="membership in person.sport_memberships" :key="membership.id" class="membership-item">
                <div class="membership-header">
                  <span class="sport-name">{{ membership.sport?.name || 'Неизвестный вид спорта' }}</span>
                  <span :class="membership.ended_at ? 'status-inactive' : 'status-active'">
                    {{ membership.ended_at ? 'Завершено' : 'Активно' }}
                  </span>
                </div>
                <div class="membership-details">
                  <span>Начал: {{ formatDate(membership.started_at) }}</span>
                  <span v-if="membership.ended_at">Завершил: {{ formatDate(membership.ended_at) }}</span>
                  <span v-if="membership.level">Уровень: {{ membership.level }}</span>
                </div>
                <div v-if="membership.achievements" class="membership-notes">
                  {{ membership.achievements }}
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>Нет данных о видах спорта</p>
            </div>
          </div>

          <!-- Смены фамилий -->
          <div class="info-section" v-if="person.surname_changes && person.surname_changes.length">
            <h4 class="section-title">Смены фамилий</h4>
            <div class="surname-changes-list">
              <div v-for="change in person.surname_changes" :key="change.id" class="surname-change-item">
                <div class="surname-change-header">
                  <span class="old-surname">{{ change.old_surname }}</span>
                  <span class="change-arrow">→</span>
                  <span class="current-surname">{{ person.last_name }}</span>
                </div>
                <div class="surname-change-details">
                  <span v-if="change.valid_until">Действовала до: {{ formatDate(change.valid_until) }}</span>
                  <span v-else>Действует по настоящее время</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Изображения -->
          <div class="info-section" v-if="person.images && person.images.length">
            <h4 class="section-title">Изображения</h4>
            <div class="images-grid">
              <div v-for="image in person.images" :key="image.id" class="image-item">
                <img :src="image.image_url" :alt="image.alt_text || person.full_name" class="person-image" />
                <div v-if="image.alt_text" class="image-caption">{{ image.alt_text }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="$emit('edit')" class="btn-primary">
            Редактировать
          </button>
          <button @click="$emit('close')" class="btn-secondary">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

// Props
const props = defineProps({
  person: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['close', 'edit'])

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ru-RU')
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto;
}

.modal-header {
  @apply flex justify-between items-center p-6 border-b border-gray-200;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900;
}

.modal-close {
  @apply text-gray-400 hover:text-gray-600 transition-colors;
}

.modal-body {
  @apply p-6;
}

.person-header {
  @apply flex items-center gap-6 mb-8 pb-6 border-b border-gray-200;
}

.person-info {
  @apply flex flex-col gap-2;
}

.person-name {
  @apply text-2xl font-bold text-gray-900;
}

.person-age {
  @apply text-lg text-gray-600;
}

.badge-success {
  @apply inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800;
}

.badge-warning {
  @apply inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800;
}

.position-badges,
.amplua-badges {
  @apply flex flex-wrap gap-2;
}

.content-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

.info-section {
  @apply space-y-4;
}

.section-title {
  @apply text-lg font-medium text-gray-900 border-b border-gray-200 pb-2;
}

.info-list {
  @apply space-y-3;
}

.info-item {
  @apply flex justify-between items-start;
}

.info-label {
  @apply text-sm font-medium text-gray-700 min-w-[120px];
}

.info-value {
  @apply text-sm text-gray-900 flex-1;
}

.memberships-list {
  @apply space-y-4;
}

.membership-item {
  @apply bg-gray-50 rounded-lg p-4;
}

.membership-header {
  @apply flex justify-between items-center mb-2;
}

.club-name,
.sport-name,
.position-name,
.amplua-name {
  @apply font-medium text-gray-900;
}

.status-active {
  @apply text-sm text-green-600 font-medium;
}

.status-inactive {
  @apply text-sm text-gray-500 font-medium;
}

.membership-details {
  @apply flex flex-wrap gap-4 text-sm text-gray-600 mb-2;
}

.membership-notes {
  @apply text-sm text-gray-700 bg-white rounded p-2;
}

.surname-changes-list {
  @apply space-y-3;
}

.surname-change-item {
  @apply bg-gray-50 rounded-lg p-3;
}

.surname-change-header {
  @apply flex items-center gap-2 mb-1;
}

.old-surname {
  @apply font-medium text-gray-700;
}

.change-arrow {
  @apply text-gray-400;
}

.current-surname {
  @apply font-medium text-gray-900;
}

.surname-change-details {
  @apply text-sm text-gray-600;
}

.images-grid {
  @apply grid grid-cols-2 md:grid-cols-3 gap-4;
}

.image-item {
  @apply flex flex-col;
}

.person-image {
  @apply w-full h-32 object-cover rounded-lg;
}

.image-caption {
  @apply text-sm text-gray-600 mt-1;
}

.empty-state {
  @apply text-center py-8 text-gray-500;
}

.modal-footer {
  @apply flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6;
}

.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md;
}

.btn-secondary {
  @apply bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md;
}
</style> 