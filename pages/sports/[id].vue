<template>
  <div class="min-h-full text-gray-900">
    <header class="bg-gray-50 shadow-sm border-b border-gray-300">
      <div class="px-6 pt-4">
        <div class="flex items-start justify-between">
          <Head :breadcrumbs="breadcrumbs || []" show_breadcrumbs="true" />
        </div>
        <!-- Заголовок с эмблемой и названием вида спорта -->
        <div class="flex items-center gap-4 mt-4">
          <Icon
            v-if="sport && sport.icon"
            :icon="sport.icon"
            class="w-14 h-14 rounded-full object-cover border border-gray-200 bg-white flex items-center justify-center text-4xl"
          />
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ sport && sport.title }}
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
            <Icon icon="ri:team-fill" class="w-6 h-6 mr-2" />
            Спортсмены
          </button>
          <button
            :class="[
              'tab-btn',
              activeTab === 'staff' ? 'tab-active-staff' : 'tab-inactive-staff'
            ]"
            @click="activeTab = 'staff'"
          >
            <Icon icon="ri:briefcase-4-fill" class="w-6 h-6 mr-2" />
            Сотрудники
          </button>
        </div>
        <div class="flex gap-2">
          <PeopleImportExport
            :sportId="sport && sport.id ? sport.id : ''"
            :players="players.map(p => p.person)"
            :staff="staffList.map(s => s.person)"
            @imported="loadSport"
          />
        </div>
      </div>

      <!-- GalleryEditModal -->
      <GalleryEditModal
        v-if="showGalleryModal"
        :is-visible="showGalleryModal"
        :entity="galleryPerson"
        entity-type="person"
        @close="showGalleryModal = false"
        @saved="onGallerySaved"
      />
      <div :class="['tab-content', activeTab === 'players' ? 'tab-content-players' : 'tab-content-staff']" style="margin-top:0;">
        <!-- Спортсмены -->
        <div v-if="activeTab === 'players'">
          <div class="page-header flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Спортсмены</h2>
            <div class="flex gap-2">
              <button
                v-if="!loadingSport && sport && sport.id"
                @click="openCreatePlayerModal"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Icon icon="ri:user-add-fill" class="w-5 h-5" />
                Добавить спортсмена
              </button>
              <button
                @click="loadSport"
                :disabled="loadingSport"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                title="Обновить таблицу спортсменов"
              >
                <Icon icon="ri:refresh-line" class="w-5 h-5" />
                Обновить
              </button>
            </div>
          </div>
          <div class="table-container rounded-lg shadow overflow-hidden">
            <table class="data-table w-full">
              <thead>
                <tr>
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
                    <button @click="openAboutModal(player.person)" class="action-btn action-edit text-green-600 hover:text-green-800 p-1 rounded" title="Редактировать 'О себе'">
                      <Icon icon="mdi:information-outline" class="w-5 h-5" />
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
                  </td>
                </tr>
                <tr v-if="players && players.length === 0">
                  <td colspan="6" class="text-center text-gray-500 py-4">Нет спортсменов</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Модалка изменения амплуа -->
          <PersonAmpluasModal
            v-if="showAmpluaModal"
            :person="selectedPlayer?.person"
            @close="showAmpluaModal = false"
            @saved="onAmpluaUpdated"
            @deleted="onAmpluaUpdated"
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
            :sportId="sport && sport.id ? sport.id : ''"
            customTitle="Добавить спортсмена в вид спорта"
            @close="showCreatePlayerModal = false"
            @saved="onPlayerSaved"
          />
        </div>
        <!-- Сотрудники -->
        <div v-if="activeTab === 'staff'">
          <div class="page-header flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Сотрудники</h2>
            <div class="flex gap-2">
              <button
                v-if="!loadingSport && sport && sport.id"
                @click="openCreateStaffModal"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Icon icon="ri:user-add-fill" class="w-5 h-5" />
                Добавить сотрудника
              </button>
              <button
                @click="loadSport"
                :disabled="loadingSport"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                title="Обновить таблицу сотрудников"
              >
                <Icon icon="ri:refresh-line" class="w-5 h-5" />
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
                    <button @click="openAboutModal(staff.person)" class="action-btn action-edit text-green-600 hover:text-green-800 p-1 rounded" title="Редактировать 'О себе'">
                      <Icon icon="mdi:information-outline" class="w-5 h-5" />
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
                  </td>
                </tr>
                <tr v-if="staffList && staffList.length === 0">
                  <td colspan="6" class="text-center text-gray-500 py-4">Нет сотрудников</td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Модалка управления должностями -->
          <PersonPositionsModal
            v-if="showPositionsModal"
            :person="positionsPerson"
            :key="positionsPerson?.id"
            @close="showPositionsModal = false"
            @saved="onPositionsSaved"
            @deleted="onPositionsDeleted"
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
            :sportId="sport && sport.id ? sport.id : ''"
            customTitle="Добавить сотрудника в вид спорта"
            @close="showCreateStaffModal = false"
            @saved="onStaffSaved"
          />
        </div>
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
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import RichTextEditor from '~/components/kirh/table/editor/RichTextEditor.vue'
import KirhToggleField from '~/components/kirh/table/fields/KirhToggleField.vue'
import GalleryEditModal from '../../components/gallery/GalleryEditModal.vue'
import Head from '../../components/parts/Head.vue'
import PeopleImportExport from '../../components/people/PeopleImportExport.vue'
import PersonAmpluasModal from '../../components/people/PersonAmpluasModal.vue'
import PersonModal from '../../components/people/PersonModal.vue'
import PersonPositionsModal from '../../components/people/PersonPositionsModal.vue'
import { useApi } from '../../composables/useApi'

const { api, apiRequest } = useApi()
const route = useRoute()
const sport = ref<Record<string, any> | undefined>(undefined)
const loadingSport = ref(true)
const memberships = ref<any[]>([])

// Получаем всех персон, связанных с видом спорта через person_sport_memberships
const players = computed(() => {
  // Спортсмены: есть хотя бы одно активное амплуа
  return memberships.value.filter((m: any) => {
    return m.person?.active_amplua_memberships && m.person.active_amplua_memberships.length > 0
  })
})
const staffList = computed(() => {
  return memberships.value.filter((m: any) => {
    return m.person?.active_position_memberships && m.person.active_position_memberships.length > 0
  })
})

const getActivePositions = (person: any) => {
  if (!person?.active_position_memberships) return []
  return person.active_position_memberships
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
  // showPositionsModal.value = false // УБРАНО, чтобы не закрывать модалку при изменениях
  await loadSport()
}

const onPositionsDeleted = async () => {
  await loadSport()
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
const onStaffSaved = async (personData?: any) => {
  editingStaff.value = undefined
  showCreateStaffModal.value = false
  await loadSport()
}

const breadcrumbs = computed(() => [
  { id: 1, title: 'Виды спорта', slug: 'sports', icon: 'mdi:run-fast' }
])

const activeTab = ref<'players' | 'staff'>('players')

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) return imagePath
  return `${api}/storage/${imagePath}`
}

const getSportLogoUrl = (sport: any) => {
  if (!sport || !sport.image) return ''
  if (sport.image.startsWith('http')) return sport.image
  return `${api}/storage/${sport.image}`
}

const loadSport = async () => {
  loadingSport.value = true
  try {
    // Получаем сам вид спорта
    const response = await apiRequest(`/sports/${route.params.id}`)
    sport.value = (response as any).data ? (response as any).data : response
    // Получаем всех персон, связанных с этим видом спорта
    const peopleResp: any = await apiRequest(`/people?sport_id=${route.params.id}&per_page=1000`)
    memberships.value = (peopleResp.data || peopleResp).map((person: any) => ({ person }))
  } catch (error) {
    console.error('Ошибка загрузки вида спорта или персон:', error)
  } finally {
    loadingSport.value = false
  }
}

const openAmpluaModal = (player: any) => {
  selectedPlayer.value = player
  showAmpluaModal.value = true
}

const onAmpluaUpdated = async () => {
  await loadSport()
}

const onAmpluaDeleted = async () => {
  await loadSport()
}

const openGalleryModal = (person: any) => {
  galleryPerson.value = person
  showGalleryModal.value = true
}
const onGallerySaved = async () => {
  await loadSport()
}

const editingPlayer = ref<Record<string, any> | undefined>(undefined)
const openEditPlayerModal = (player: any) => {
  editingPlayer.value = player.person
}
const showCreatePlayerModal = ref(false)
const openCreatePlayerModal = () => {
  editingPlayer.value = undefined
  showCreatePlayerModal.value = true
}
const onPlayerSaved = async (personData?: any) => {
  // personData — данные новой персоны, если переданы
  editingPlayer.value = undefined
  showCreatePlayerModal.value = false

  // Если это был новый спортсмен, нужно создать person_sport_membership и person_amplua_membership
  if (personData && personData.id) {
    try {
      // Привязка к виду спорта
      await apiRequest(`/people/${personData.id}/sport-memberships`, {
        method: 'POST',
        body: {
          sport_id: sport.value?.id,
          started_at: new Date().toISOString().slice(0, 10)
        }
      })
      // Привязка к амплуа (если выбран ampluaId)
      if (personData.amplua_id) {
        await apiRequest(`/people/${personData.id}/amplua-memberships`, {
          method: 'POST',
          body: {
            amplua_id: personData.amplua_id,
            started_at: new Date().toISOString().slice(0, 10)
          }
        })
      }
    } catch (e: any) {
      alert('Ошибка при привязке спортсмена к виду спорта или амплуа: ' + (e?.message || ''))
    }
  }
  await loadSport()
}

const showAmpluaModal = ref(false)
const selectedPlayer = ref<any>(null)
const galleryPerson = ref<any>(null)
const showGalleryModal = ref(false)

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
  await loadSport()
})

watch(sport, (val) => {
  // console.log('sport changed', val)
})
</script>

<style scoped>
/* Стили скопированы из страницы клуба */
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
