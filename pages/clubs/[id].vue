<template>
  <div class="min-h-full text-gray-900">
    <header class="bg-gray-50 shadow-sm border-b border-gray-300">
      <div class="px-6 pt-4">
        <div class="flex items-start justify-between">
          <Head :breadcrumbs="breadcrumbs || []" show_breadcrumbs="true" />
        </div>
        <!-- Заголовок с эмблемой и названием команды -->
        <div class="flex items-center gap-4 mt-4">
          <img v-if="club && club.image" :src="getClubLogoUrl(club)" class="w-14 h-14 rounded-full object-cover border border-gray-200" />
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ club && club.title }}<span v-if="club && club.city"> ({{ club.city.title }})</span>
            </h1>
          </div>
        </div>
      </div>
    </header>
    <div class="p-6">
      <div class="flex items-center gap-4 justify-between">
        <div class="flex gap-4">
          <button
            :class="[
              'tab-btn',
              activeTab === 'players' ? 'tab-active-players' : 'tab-inactive-players'
            ]"
            @click="activeTab = 'players'"
          >
            <Icon name="ri:team-fill" class="w-6 h-6 mr-2" />
            Игроки
          </button>
          <button
            :class="[
              'tab-btn',
              activeTab === 'staff' ? 'tab-active-staff' : 'tab-inactive-staff'
            ]"
            @click="activeTab = 'staff'"
          >
            <Icon name="ri:briefcase-4-fill" class="w-6 h-6 mr-2" />
            Сотрудники
          </button>
        </div>
        <div class="flex gap-2">
          <PeopleImportExport
            :clubId="club && club.id ? club.id : ''"
            :players="players.map((p: any) => p.person)"
            :staff="staffList.map((s: any) => s.person)"
            @imported="loadClub"
          />
        </div>
      </div>

      <!-- GalleryEditModal теперь доступен для обоих табов -->
      <GalleryEditModal
        v-if="showGalleryModal"
        :is-visible="showGalleryModal"
        :entity="galleryPerson"
        entity-type="person"
        @close="showGalleryModal = false"
        @saved="onGallerySaved"
      />
      <div :class="['tab-content', activeTab === 'players' ? 'tab-content-players' : 'tab-content-staff']" style="margin-top:0;">
        <!-- Игроки -->
        <div v-if="activeTab === 'players'">
          <div class="page-header flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Игроки команды</h2>
            <div class="flex gap-2">
              <button
                v-if="!loadingClub && club && club.id"
                @click="openCreatePlayerModal"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Icon name="ri:user-add-fill" class="w-5 h-5" />
                Добавить игрока в команду
              </button>
              <button
                @click="loadClub"
                :disabled="loadingClub"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                title="Обновить таблицу игроков"
              >
                <Icon name="ri:refresh-line" class="w-5 h-5" />
                Обновить
              </button>
            </div>
          </div>
          <div class="table-container rounded-lg shadow overflow-hidden">
            <table class="data-table w-full">
              <thead>
                <tr>
                  <th class="bg-blue-200 px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Номер</th>
                  <th class="bg-blue-200 px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Фото</th>
                  <th class="bg-blue-200 px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">ФИО</th>
                  <th class="bg-blue-200 px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Амплуа</th>
                  <th class="bg-blue-200 px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">О себе</th>
                  <th class="bg-blue-200 px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Активен</th>
                  <th class="bg-blue-200 px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="player in players" :key="player.id" class="table-row border-t border-gray-200 hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div v-if="editingNumberId === player.person.id">
                      <input type="number" min="0" v-model="editingNumberValue"
                        class="form-input w-16 text-center font-bold text-lg border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                        @blur="handleNumberInputBlur(player)"
                        @keyup="handleNumberInputKeyup($event, player)"
                        style="height: 2.5rem;"
                        autofocus
                      />
                    </div>
                    <div v-else @click="startEditNumber(player)" class="cursor-pointer text-center w-16 font-bold text-lg">
                      {{ player.person.player_number ?? '—' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="person-photo flex items-center cursor-pointer group" @click="openGalleryModal(player.person)">
                      <img v-if="player.person?.main_image && player.person.main_image[0]" :src="getImageUrl(player.person.main_image[0].image_url || player.person.main_image[0])" :alt="player.person.full_name" class="w-10 h-10 rounded-full object-cover border border-gray-200" />
                      <div v-else class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="person-info flex flex-col">
                      <div class="person-name text-sm font-medium text-gray-900">{{ player.person?.full_name }}</div>
                      <div class="person-details text-sm text-gray-500">{{ player.person?.birth_date ? new Date(player.person.birth_date).toLocaleDateString('ru-RU') : 'Не указана' }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="person-amplua inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 cursor-pointer hover:bg-green-200 transition" @click="openAmpluaModal(player)">
                      {{
                        (player.person?.active_amplua_memberships && player.person.active_amplua_memberships.length)
                          ? player.person.active_amplua_memberships.filter((a: any) => !a.ended_at).map((a: any) => a.amplua?.name).join(', ')
                          : '—'
                      }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <button @click="openAboutModal(player.person)" class="action-btn action-edit text-blue-600 hover:text-blue-800 p-1 rounded" title="Редактировать 'О себе'">
                      <Icon name="mdi:information-outline" class="w-5 h-5" />
                    </button>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <KirhToggleField
                      :model-value="!!player.person.is_active"
                      @update:model-value="(val: boolean|number) => updateIsActive(player.person, val === 1 || val === true)"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <button @click="openEditPlayerModal(player)" class="action-btn action-edit text-green-600 hover:text-green-800 p-1 rounded" title="Редактировать">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button
                      v-if="!player.left_at && !player.person?.active_club_memberships?.some((m: any) => m.left_at)"
                      @click="openLeaveClubModal(player)"
                      class="action-btn action-leave text-red-600 hover:text-red-800 p-1 rounded ml-2"
                      title="Покинул команду"
                    >
                      <Icon name="ri:user-minus-fill" class="w-5 h-5" />
                    </button>
                  </td>
                </tr>
                <tr v-if="players && players.length === 0">
                  <td colspan="4" class="text-center text-gray-500 py-4">Нет игроков в команде</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Модалка изменения амплуа -->
          <EditAmpluaModal
            v-if="showAmpluaModal"
            :person="selectedPlayer?.person"
            :current-amplua-id="selectedPlayer?.amplua?.id"
            @close="showAmpluaModal = false"
            @amplua-updated="onAmpluaUpdated"
          />

          <PersonModal
            v-if="editingPlayer"
            :person="editingPlayer"
            mode="edit"
            @close="editingPlayer = undefined"
            @saved="onPlayerSaved"
          />
          <PersonModal
            v-if="showCreatePlayerModal"
            :person="{}"
            mode="create"
            :showAmpluaSelect="true"
            :clubId="club?.id"
            customTitle="Добавить игрока в клуб"
            @close="showCreatePlayerModal = false"
            @saved="onPlayerSaved"
          />
        </div>
        <!-- Сотрудники -->
        <div v-if="activeTab === 'staff'">
          <div class="page-header flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Сотрудники команды</h2>
            <div class="flex gap-2">
              <button
                v-if="!loadingClub && club && club.id"
                @click="openCreateStaffModal"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Icon name="ri:user-add-fill" class="w-5 h-5" />
                Добавить сотрудника в команду
              </button>
              <button
                @click="loadClub"
                :disabled="loadingClub"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                title="Обновить таблицу сотрудников"
              >
                <Icon name="ri:refresh-line" class="w-5 h-5" />
                Обновить
              </button>
            </div>
          </div>
          <div class="table-container rounded-lg shadow overflow-hidden">
            <table class="data-table w-full">
              <thead>
                <tr>
                  <th class="bg-yellow-200 px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Фото</th>
                  <th class="bg-yellow-200 px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">ФИО</th>
                  <th class="bg-yellow-200 px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Должность</th>
                  <th class="bg-yellow-200 px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">О себе</th>
                  <th class="bg-yellow-200 px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Активен</th>
                  <th class="bg-yellow-200 px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="staff in staffList" :key="staff.person.id" class="table-row border-t border-gray-200 hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="person-photo flex items-center cursor-pointer group" @click="openGalleryModal(staff.person)">
                      <img v-if="staff.person?.main_image && staff.person.main_image[0]" :src="getImageUrl(staff.person.main_image[0].image_url || staff.person.main_image[0])" :alt="staff.person.full_name" class="w-10 h-10 rounded-full object-cover border border-gray-200" />
                      <div v-else class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="person-info flex flex-col">
                      <div class="person-name text-sm font-medium text-gray-900">{{ staff.person?.full_name }}</div>
                      <div class="person-details text-sm text-gray-500">{{ staff.person?.birth_date ? new Date(staff.person.birth_date).toLocaleDateString('ru-RU') : 'Не указана' }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="person-positions inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 transition" @click="openPositionsModal(staff.person)">
                      {{ getActivePositions(staff.person).join(', ') || '—' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <button @click="openAboutModal(staff.person)" class="action-btn action-edit text-blue-600 hover:text-blue-800 p-1 rounded" title="Редактировать 'О себе'">
                      <Icon name="mdi:information-outline" class="w-5 h-5" />
                    </button>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <KirhToggleField
                      :model-value="!!staff.person.is_active"
                      @update:model-value="(val: boolean|number) => updateIsActive(staff.person, val === 1 || val === true)"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <button @click="openEditStaffModal(staff)" class="action-btn action-edit text-green-600 hover:text-green-800 p-1 rounded" title="Редактировать">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button
                      v-if="!staff.left_at && !staff.person?.active_club_memberships?.some((m: any) => m.left_at)"
                      @click="openLeaveClubModal(staff)"
                      class="action-btn action-leave text-red-600 hover:text-red-800 p-1 rounded ml-2"
                      title="Покинул команду"
                    >
                      <Icon name="ri:user-minus-fill" class="w-5 h-5" />
                    </button>
                  </td>
                </tr>
                <tr v-if="staffList && staffList.length === 0">
                  <td colspan="4" class="text-center text-gray-500 py-4">Нет сотрудников в клубе</td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Модалка управления должностями -->
          <PersonPositionsModal
            v-if="showPositionsModal"
            :person="positionsPerson"
            @close="showPositionsModal = false"
            @saved="onPositionsSaved"
          />
          <PersonModal
            v-if="editingStaff"
            :person="editingStaff.person"
            mode="edit"
            @close="editingStaff = undefined"
            @saved="onStaffSaved"
          />
          <PersonModal
            v-if="showCreateStaffModal"
            :person="{}"
            mode="create"
            :clubId="club?.id"
            customTitle="Добавить сотрудника в команду"
            @close="showCreateStaffModal = false"
            @saved="onStaffSaved"
          />
        </div>
      </div>
    </div>
    <div v-if="showLeaveClubModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-4">Покинул команду</h3>
        <div class="mb-4">
          <div class="font-medium text-lg mb-2">{{ playerToLeave?.person?.full_name }}</div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Дата ухода из клуба</label>
          <input type="date" v-model="leaveDate" class="form-input w-full border border-gray-300 rounded px-3 py-2 font-bold" />
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button type="button" @click="closeLeaveClubModal" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Отмена</button>
          <button type="button" @click="confirmLeaveClub" :disabled="!leaveDate" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Подтвердить</button>
        </div>
      </div>
    </div>
    <!-- Модалка для about (О себе) -->
    <template v-if="showAboutModal">
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg w-full max-w-2xl p-6 flex flex-col max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-semibold mb-4">Редактировать "О себе"</h3>
          <RichTextEditor v-model="aboutContent" :editor-enabled="true" />
          <div class="flex justify-end gap-3 mt-6">
            <button type="button" @click="closeAboutModal" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Отмена</button>
            <button type="button" @click="saveAbout" :disabled="aboutSaving" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              {{ aboutSaving ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import RichTextEditor from '~/components/kirh/table/editor/RichTextEditor.vue'
import KirhToggleField from '~/components/kirh/table/fields/KirhToggleField.vue'
import EditAmpluaModal from '../../components/clubs/EditAmpluaModal.vue'
import GalleryEditModal from '../../components/gallery/GalleryEditModal.vue'
import Head from '../../components/parts/Head.vue'
import PeopleImportExport from '../../components/people/PeopleImportExport.vue'
import PersonModal from '../../components/people/PersonModal.vue'
import PersonPositionsModal from '../../components/people/PersonPositionsModal.vue'
import { useApi } from '../../composables/useApi'

const { api, apiRequest } = useApi()
const route = useRoute()
const club = ref<Record<string, any> | undefined>(undefined)
const loadingClub = ref(true)
// Игроки теперь вычисляются из club.value.active_memberships
const players = computed(() => {
  if (!club.value?.active_memberships) return []
  // Только те, у кого есть хотя бы одно активное амплуа
  return club.value.active_memberships.filter((m: any) => {
    return m.person?.active_amplua_memberships && m.person.active_amplua_memberships.length > 0
  })
})
const loadingPlayers = ref(true)
const showAddModal = ref(false)
const showCreatePlayerModal = ref(false)
const showAmpluaModal = ref(false)
const showGalleryModal = ref(false)
const galleryPerson = ref<any>(null)
const editingPlayer = ref<Record<string, any> | undefined>(undefined)
const selectedPlayer = ref<any>(null)
const showLeaveClubModal = ref(false)
const playerToLeave = ref<any>(null)
const leaveDate = ref<string>('')
const activeTab = ref<'players' | 'staff'>('players')

// Сотрудники: фильтрация по активным должностям
const staffList = computed(() => {
  if (!club.value?.active_memberships) return []
  return club.value.active_memberships.filter((m: any) => {
    if (m.person?.position_memberships) {
      return m.person.position_memberships.some((pos: any) => pos.ended_at === null || pos.ended_at === undefined || pos.ended_at === '')
    }
    return false
  })
})

const getActivePositions = (person: any) => {
  if (!person?.position_memberships) return []
  return person.position_memberships
    .filter((pos: any) => pos.ended_at === null)
    .map((pos: any) => pos.position?.name || '—')
}

const showPositionsModal = ref(false)
const positionsPerson = ref<any>(null)
const openPositionsModal = (person: any) => {
  positionsPerson.value = person
  showPositionsModal.value = true
}
const onPositionsSaved = async () => {
  showPositionsModal.value = false
  await loadClub()
}

const editingStaff = ref<any>(undefined)
const openEditStaffModal = (staff: any) => {
  editingStaff.value = staff
}
const showCreateStaffModal = ref(false)
const openCreateStaffModal = () => {
  editingStaff.value = undefined
  showCreateStaffModal.value = true
}
const onStaffSaved = async () => {
  editingStaff.value = undefined
  showCreateStaffModal.value = false
  await loadClub()
}

// Заглушка для breadcrumbs, чтобы не было ошибки
const breadcrumbs = computed(() => [
  { id: 1, title: 'Клубы', slug: 'clubs', icon: 'mdi:account-group' }
])

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) return imagePath
  return `${api}/storage/${imagePath}`
}

const getClubLogoUrl = (club: any) => {
  if (!club || !club.image) return ''
  if (club.image.startsWith('http')) return club.image
  return `${api}/storage/${club.image}`
}

const loadClub = async () => {
  loadingClub.value = true
  try {
    const response = await apiRequest(`/clubs/${route.params.id}`)
    club.value = (response as any).data ? (response as any).data : response
  } catch (error) {
    console.error('Ошибка загрузки клуба:', error)
  } finally {
    loadingClub.value = false
  }
}

const openAmpluaModal = (player: any) => {
  selectedPlayer.value = player
  showAmpluaModal.value = true
}

const onAmpluaUpdated = async () => {
  showAmpluaModal.value = false
  await loadClub()
}

const onPlayerAdded = async () => {
  showAddModal.value = false
  showCreatePlayerModal.value = false
  await loadClub()
}

const openGalleryModal = (person: any) => {
  galleryPerson.value = person
  showGalleryModal.value = true
}
const onGallerySaved = async () => {
  await loadClub()
}

const openEditPlayerModal = (player: any) => {
  editingPlayer.value = player.person
}
const openCreatePlayerModal = () => {
  editingPlayer.value = undefined
  showCreatePlayerModal.value = true
}
const onPlayerSaved = async () => {
  editingPlayer.value = undefined
  showCreatePlayerModal.value = false
  await loadClub()
}

const openLeaveClubModal = (player: any) => {
  playerToLeave.value = player
  // Устанавливаем сегодняшнюю дату по умолчанию
  const today = new Date()
  leaveDate.value = today.toISOString().slice(0, 10)
  showLeaveClubModal.value = true
}

const closeLeaveClubModal = () => {
  showLeaveClubModal.value = false
  playerToLeave.value = null
  leaveDate.value = ''
}

const confirmLeaveClub = async () => {
  if (!playerToLeave.value || !leaveDate.value) return
  try {
    await apiRequest(`/people/${playerToLeave.value.person_id}/club-memberships/${playerToLeave.value.id}`, {
      method: 'PUT',
      body: { left_at: leaveDate.value }
    })
    closeLeaveClubModal()
    await loadClub()
  } catch (e: any) {
    let msg = ''
    if (typeof e === 'object' && e !== null) {
      msg = (e.message || (e.data && e.data.message) || '')
    }
    alert('Ошибка при обновлении даты ухода: ' + msg)
  }
}

const removePlayer = async (player: any) => {
  if (!player.id) return null
  await apiRequest(`/people/${player.person_id}/club-memberships/${player.id}`, { method: 'DELETE' })
  await loadClub()
}

const editingNumberId = ref<number|null>(null)
const editingNumberValue = ref<string>('')
const savingNumber = ref(false)

const startEditNumber = (player: any) => {
  editingNumberId.value = player.person.id
  editingNumberValue.value = player.person.player_number !== null && player.person.player_number !== undefined ? String(player.person.player_number) : ''
}

const savePlayerNumber = async (player: any) => {
  if (savingNumber.value || editingNumberId.value !== player.person.id) return
  savingNumber.value = true
  const strValue = String(editingNumberValue.value)
  const newValue = strValue.trim() === '' ? null : Number(strValue)
  try {
    await apiRequest(`/people/${player.person.id}`, {
      method: 'PUT',
      body: { player_number: newValue }
    })
    await loadClub()
  } catch (e: any) {
    alert('Ошибка при обновлении номера игрока: ' + (e?.message || ''))
  } finally {
    savingNumber.value = false
    editingNumberId.value = null
    editingNumberValue.value = ''
  }
}

const handleNumberInputBlur = (player: any) => {
  savePlayerNumber(player)
}
const handleNumberInputKeyup = (event: KeyboardEvent, player: any) => {
  if (event.key === 'Enter') {
    savePlayerNumber(player)
  }
}

const showAboutModal = ref(false)
const aboutPerson = ref<any>(null)
const aboutContent = ref('')
const aboutSaving = ref(false)
const openAboutModal = (person: any) => {
  aboutPerson.value = person
  aboutContent.value = person.about || ''
  showAboutModal.value = true
}
const closeAboutModal = () => {
  showAboutModal.value = false
  aboutPerson.value = null
  aboutContent.value = ''
}
const saveAbout = async () => {
  if (!aboutPerson.value) return
  aboutSaving.value = true
  try {
    await apiRequest(`/people/${aboutPerson.value.id}`, {
      method: 'PUT',
      body: { about: aboutContent.value }
    })
    aboutPerson.value.about = aboutContent.value
    // Обновляем в списке
    const update = (arr: any[]) => {
      const idx = arr.findIndex(p => p.person?.id === aboutPerson.value.id)
      if (idx !== -1) arr[idx].person.about = aboutContent.value
    }
    update(players.value)
    update(staffList.value)
    closeAboutModal()
  } catch (e) {
    alert('Ошибка при сохранении поля "О себе"')
  } finally {
    aboutSaving.value = false
  }
}
const updateIsActive = async (person: any, val: boolean) => {
  try {
    await apiRequest(`/people/${person.id}`, {
      method: 'PUT',
      body: { is_active: val }
    })
    person.is_active = val
  } catch (e) {
    alert('Ошибка при обновлении активности')
  }
}

onMounted(async () => {
  await loadClub()
})

watch(club, (val) => {
  // console.log('club changed', val)
})
</script>

<style scoped>
.loader-image {
  width: 4rem;
  height: 4rem;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0% { transform: scale(0.95); }
  50% { transform: scale(1.05); }
  100% { transform: scale(0.95); }
}
.tab-btn {
  @apply flex items-center px-6 py-3 rounded-t-xl text-lg font-bold border-2 transition-all duration-200;
  border-bottom-width: 0;
  min-width: 170px;
}
.tab-active-players {
  background: #e6f0fa;
  border-color: #60a5fa;
  color: #2563eb;
  z-index: 2;
}
.tab-inactive-players {
  background: #f3f6fa;
  border-color: #cbd5e1;
  color: #64748b;
  z-index: 1;
}
.tab-active-staff {
  background: #fffbe6;
  border-color: #facc15;
  color: #b45309;
  z-index: 2;
}
.tab-inactive-staff {
  background: #fdf6e3;
  border-color: #fde68a;
  color: #a16207;
  z-index: 1;
}
.tab-content {
  @apply rounded-b-xl border-2 transition-all duration-200;
  border-top-width: 0;
  padding: 1.5rem 1.5rem 1.5rem 1.5rem;
}
.tab-content-players {
  background: #e6f0fa;
  border-color: #60a5fa;
}
.tab-content-staff {
  background: #fffbe6;
  border-color: #facc15;
}
.data-table tbody {
  background: transparent !important;
}
</style>
