<template>
  <div class="p-6">
    <!-- Уведомления -->
    <Notification 
      :message="notificationMessage" 
      :type="notificationType" 
      @close="notificationMessage = ''"
    />
    
    <!-- Модальное окно подтверждения -->
    <ConfirmModal
      :is-open="showConfirmModal"
      :title="confirmModalTitle"
      :message="confirmModalMessage"
      :type="confirmModalType"
      :confirm-text="confirmModalConfirmText"
      @confirm="handleConfirmAction"
      @cancel="showConfirmModal = false"
    />
    
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Icon icon="heroicons:trophy" class="w-8 h-8 text-yellow-500" />
        Достижения клубов SRRR
      </h1>
      <p class="text-gray-600 mt-2">Управление достижениями клубов для расчета рейтинга регионов</p>
    </div>

    <!-- Фильтры -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex flex-wrap items-end gap-4 mb-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Команда</label>
            <KirhSelectField
              v-model="filters.club_id"
              api-url="v1/clubs"
              :api-params="{ limit: 10, type: 'async' }"
              key-field="id"
              label-field="club_info"
              image-field="full_image_path"
              :enable-search="true"
              :limit="10"
              placeholder="Выберите команду"
              :emptyable="true"
              :empty-option="{ value: '', label: 'Все команды' }"
              sel-class="text-gray-900"
              @update:model-value="onFilterChange"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Турнир</label>
            <KirhSelectField
              v-model="filters.tournament_type_id"
              api-url="v1/tournament-types"
              :api-params="{ limit: 10 }"
              key-field="id"
              label-field="name"
              :enable-search="true"
              :limit="10"
              placeholder="Выберите турнир"
              :emptyable="true"
              :empty-option="{ value: '', label: 'Все турниры' }"
              sel-class="text-gray-900"
              @update:model-value="onFilterChange"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Год</label>
            <KirhSelectField
              v-model="filters.year"
              api-url="v1/rating/years"
              :api-params="{ limit: 10 }"
              key-field="year"
              label-field="title"
              :enable-search="false"
              :limit="10"
              placeholder="Выберите год"
              :emptyable="true"
              :empty-option="{ value: '', label: 'Все годы' }"
              sel-class="text-gray-900"
              @update:model-value="onFilterChange"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Регион</label>
            <KirhSelectField
              v-model="filters.region_id"
              api-url="v1/rating/regions"
              :api-params="{ limit: 10 }"
              key-field="id"
              label-field="name"
              :enable-search="true"
              :limit="10"
              placeholder="Выберите регион"
              :emptyable="true"
              :empty-option="{ value: '', label: 'Все регионы' }"
              sel-class="text-gray-900"
              @update:model-value="onFilterChange"
            />
          </div>
        </div>
        <button
          class="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!isAnyFilterActive"
          @click="clearFilters"
        >Очистить фильтры</button>
      </div>
    </div>

    <!-- Кнопка добавления -->
    <div class="mb-6 flex gap-4 items-center">
      <button
        @click="openAddModal"
        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <Icon icon="heroicons:plus" class="w-5 h-5" />
        Добавить достижение
      </button>
      <div class="flex items-center gap-4 flex-1">
        <template v-if="ratingNeedsRecalc">
          <button @click="recalculateRating" :disabled="recalcLoading" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Icon icon="heroicons:calculator" class="w-5 h-5" />
            <span v-if="!recalcLoading">Пересчитать рейтинг</span>
            <span v-else>Пересчёт...</span>
          </button>
        </template>
        <template v-else>
          <span class="text-green-700 font-semibold flex items-center gap-2"><Icon icon="heroicons:check-circle" class="w-5 h-5" />Рейтинг актуален</span>
        </template>
        <!-- Кнопка пересчёта клубных очков справа -->
        <div class="ml-auto">
          <button @click="recalculateClubPoints" :disabled="clubPointsLoading" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Icon icon="heroicons:arrow-path" class="w-5 h-5" />
            <span v-if="!clubPointsLoading">Пересчёт клубных очков</span>
            <span v-else>Пересчёт...</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Таблица достижений -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Команда
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Регион
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Турнир
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Год
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Место
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Команд
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Кэф-фарм
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Бонус повышение
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Очки
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="achievement in achievements" :key="achievement.id" 
                :class="[
                  'hover:bg-gray-50',
                  achievement.zeroed_by_limit ? 'bg-yellow-100 border-l-4 border-yellow-400' : ''
                ]"
                :title="achievement.zeroed_by_limit ? 'Очки обнулены из-за лимита участников от региона' : ''"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img 
                      v-if="achievement.club?.club_image_path" 
                      :src="achievement.club.club_image_path" 
                      :alt="achievement.club?.full_info || achievement.club?.title"
                      class="h-10 w-10 rounded-full object-cover"
                    />
                    <div v-else class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <Icon icon="heroicons:building-office" class="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ achievement.club?.full_info || achievement.club?.title || 'Неизвестный клуб' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ achievement.club?.rating_region?.name 
                  || (achievement.club?.rating_region_id && regionsMap[achievement.club.rating_region_id]) 
                  || 'Не указан' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    achievement.tournament_type?.color_class || 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ achievement.tournament_type?.name || achievement.tournament_type || 'Неизвестно' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ achievement.year }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                  {{ achievement.position }}
                </span>
                <span v-if="achievement.base_points !== undefined" class="ml-2 text-xs text-gray-500">
                  ({{ achievement.base_points }} очк.)
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ achievement.teams_count }}
                <span v-if="achievement.teams_multiplier !== null" class="ml-1 text-xs text-gray-400">
                  (×{{ achievement.teams_multiplier }})
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ achievement.coefficient }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span v-if="achievement.promoted" class="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {{ achievement.tournament_type?.promotion_bonus || 30 }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                <span v-if="achievement.zeroed_by_limit" class="inline-flex items-center gap-1 text-yellow-700">
                  <Icon icon="heroicons:exclamation-triangle" class="w-4 h-4" />
                  0
                  <span class="text-xs" title="Очки обнулены из-за лимита участников от региона">(лимит)</span>
                </span>
                <span v-else>
                  {{ achievement.points_earned }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center gap-2">
                  <button
                    @click="editAchievement(achievement)"
                    class="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition-colors duration-200"
                    title="Редактировать"
                  >
                    <Icon icon="heroicons:pencil-square" class="w-5 h-5" />
                  </button>
                  <button
                    @click="deleteAchievement(achievement.id)"
                    class="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors duration-200"
                    title="Удалить"
                  >
                    <Icon icon="heroicons:trash" class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Пагинация -->
      <div v-if="lastPage > 1" class="flex justify-center items-center gap-2 py-4 flex-wrap">
        <button
          class="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >Назад</button>
        <button
          v-for="page in visiblePages"
          :key="page"
          class="px-3 py-1 rounded border"
          :class="page === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 hover:bg-gray-200'"
          @click="changePage(page)"
          :disabled="page === currentPage"
        >{{ page }}</button>
        <button
          class="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200"
          :disabled="currentPage === lastPage"
          @click="changePage(currentPage + 1)"
        >Вперёд</button>
      </div>
    </div>

    <!-- Модальное окно добавления/редактирования -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-3/4 max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingAchievement ? 'Редактировать достижение' : 'Добавить достижение' }}
          </h3>
          
          <!-- Сообщения об ошибках -->
          <div v-if="Object.keys(errors).length > 0" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div class="flex">
              <div class="flex-shrink-0">
                <Icon icon="heroicons:exclamation-triangle" class="h-5 w-5 text-red-400" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Ошибки валидации:</h3>
                <div class="mt-2 text-sm text-red-700">
                  <ul class="list-disc pl-5 space-y-1">
                    <li v-for="(fieldErrors, field) in errors" :key="field">
                      <span v-if="field !== 'general'" class="font-medium">{{ getFieldLabel(field) }}:</span>
                      <span v-for="error in fieldErrors" :key="error">{{ error }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Сообщение об успехе -->
          <div v-if="successMessage" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div class="flex">
              <div class="flex-shrink-0">
                <Icon icon="heroicons:check-circle" class="h-5 w-5 text-green-400" />
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-green-800">{{ successMessage }}</p>
              </div>
            </div>
          </div>
          
          <form @submit.prevent="saveAchievement">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Команда *</label>
                <template v-if="editingAchievement">
                  <div class="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-200">
                    <img v-if="selectedClubData && selectedClubData.logo_url" :src="selectedClubData.logo_url" alt="logo" class="w-10 h-10 rounded-full object-cover" />
                    <div class="font-semibold text-gray-900">{{ selectedClubData?.full_info || '—' }}</div>
                  </div>
                </template>
                                 <template v-else>
                   <KirhSelectField
                     v-model="form.club_id"
                     api-url="v1/clubs"
                     :api-params="{ limit: 10, type: 'async' }"
                     key-field="id"
                     label-field="club_info"
                     image-field="full_image_path"
                     :enable-search="true"
                     :limit="10"
                     placeholder="Выберите команду"
                     :emptyable="false"
                     :class="errors.club_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''"
                     sel-class="text-gray-900"
                     required
                     @update:model-value="onSelectClub"
                   />
                 </template>
                <p v-if="errors.club_id" class="mt-1 text-sm text-red-600">{{ errors.club_id[0] }}</p>
                
                <!-- Предупреждение о отсутствии региона у клуба -->
                <div v-if="selectedClubData && !selectedClubData.rating_region_id" class="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 text-yellow-400" />
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-yellow-800">Внимание!</h3>
                      <div class="mt-1 text-sm text-yellow-700">
                        <p>У выбранной команды не указан регион рейтинга. Для добавления достижения необходимо сначала добавить регион к команде.</p>
                        <button
                          @click="showAddRegionModal"
                          class="mt-2 text-yellow-800 underline hover:text-yellow-900"
                        >
                          Добавить регион к команде →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                             <div>
                 <label class="block text-sm font-medium text-gray-700 mb-2">Год *</label>
                 <KirhSelectField
                   v-model="form.year"
                   api-url="v1/rating/years"
                   :api-params="{ limit: 10 }"
                   key-field="year"
                   label-field="title"
                   :enable-search="false"
                   :limit="10"
                   placeholder="Выберите год"
                   :emptyable="false"
                   :class="errors.year ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''"
                   sel-class="text-gray-900"
                   required
                 />
                 <p v-if="errors.year" class="mt-1 text-sm text-red-600">{{ errors.year[0] }}</p>
               </div>

               <div>
                 <label class="block text-sm font-medium text-gray-700 mb-2">Тип турнира *</label>
                 <KirhSelectField
                   v-model="form.tournament_type_id"
                   api-url="v1/tournament-types"
                   :api-params="{ limit: 10 }"
                   key-field="id"
                   label-field="name"
                   :enable-search="true"
                   :limit="10"
                   placeholder="Выберите тип турнира"
                   :emptyable="false"
                   :class="errors.tournament_type_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''"
                   sel-class="text-gray-900"
                   required
                 />
                 <p v-if="errors.tournament_type_id" class="mt-1 text-sm text-red-600">{{ errors.tournament_type_id[0] }}</p>
               </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Место *</label>
                <input
                  v-model.number="form.position"
                  type="number"
                  min="1"
                  required
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    errors.position 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  ]"
                  placeholder="1"
                />
                <p v-if="errors.position" class="mt-1 text-sm text-red-600">{{ errors.position[0] }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Количество команд *</label>
                <input
                  v-model.number="form.teams_count"
                  type="number"
                  min="1"
                  required
                  :class="[
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                    errors.teams_count 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  ]"
                  placeholder="16"
                />
                <p v-if="errors.teams_count" class="mt-1 text-sm text-red-600">{{ errors.teams_count[0] }}</p>
              </div>
            </div>

            <div class="mt-4">
              <label class="flex items-center">
                <input
                  v-model="form.promoted"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-700">Вышел в высшую лигу</span>
              </label>
            </div>

            <!-- Новый чекбокс для фарм-клуба -->
            <div class="mt-2">
              <label class="flex items-center">
                <input
                  v-model="form.is_farm"
                  type="checkbox"
                  class="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-700">Фарм-клуб</span>
              </label>
              <p class="text-xs text-gray-500 ml-6">Если отмечено — будет применён специальный коэффициент для фарм-клубов из настроек турнира</p>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Отмена
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
              >
                {{ editingAchievement ? 'Сохранить' : 'Добавить' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Модальное окно добавления региона к клубу -->
    <div v-if="showRegionModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-1/2 max-w-lg shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center mb-4">
            <div class="flex-shrink-0">
              <Icon icon="heroicons:exclamation-triangle" class="h-6 w-6 text-yellow-400" />
            </div>
            <div class="ml-3">
              <h3 class="text-lg font-medium text-gray-900">Добавить регион к команде</h3>
            </div>
          </div>
          
          <!-- Информация о клубе -->
          <div v-if="clubForRegion" class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <img 
                v-if="clubForRegion.logo" 
                :src="clubForRegion.logo" 
                :alt="clubForRegion.full_info"
                class="w-12 h-12 rounded-full object-cover mr-3"
              />
              <div v-else class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <Icon icon="heroicons:building-office" class="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h4 class="font-medium text-gray-900">{{ clubForRegion.full_info || clubForRegion.name }}</h4>
                <p class="text-sm text-gray-500">ID: {{ clubForRegion.id }}</p>
              </div>
            </div>
          </div>
          
          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-4">
              У команды не указан регион рейтинга. Для добавления достижения необходимо сначала добавить регион к команде.
            </p>
            
                         <!-- Поле выбора региона -->
             <div>
               <label class="block text-sm font-medium text-gray-700 mb-2">Выберите регион *</label>
               <KirhSelectField
                 v-model="selectedRegionId"
                 api-url="v1/rating/regions"
                 :api-params="{ limit: 20 }"
                 key-field="id"
                 label-field="name"
                 :enable-search="true"
                 :limit="20"
                 placeholder="Выберите регион"
                 :emptyable="false"
                 sel-class="text-gray-900"
                 required
               />
             </div>
          </div>

          <div class="flex justify-end gap-3">
            <button
              @click="closeRegionModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Отмена
            </button>
            <button
              @click="addRegionToClub"
              :disabled="!selectedRegionId"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Добавить регион к команде
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import KirhSelectField from '~/components/kirh/table/fields/KirhSelectField.vue'

const clubApiParams = ref({ limit: 10, type: 'async' })

const { apiRequest } = useApi()

// Состояние
const achievements = ref([])
const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)
const showModal = ref(false)
const editingAchievement = ref(null)
const form = ref({
  club_id: '',
  year: '',
  tournament_type_id: '',
  position: 1,
  teams_count: 16,
  promoted: false,
  is_farm: false
})

const filters = ref({
  club_id: '',
  tournament_type_id: '',
  year: '',
  region_id: ''
})

// Состояние для ошибок
const errors = ref({})
const successMessage = ref('')
const selectedClubData = ref(null)
const showRegionModal = ref(false)
const clubForRegion = ref(null)
const selectedRegionId = ref(null)

// Состояние для модального окна подтверждения
const showConfirmModal = ref(false)
const confirmModalTitle = ref('')
const confirmModalMessage = ref('')
const confirmModalType = ref('danger')
const confirmModalConfirmText = ref('Подтвердить')
const pendingDeleteId = ref(null)

// Состояние для уведомлений
const notificationMessage = ref('')
const notificationType = ref('success')

// Состояние для индикатора актуальности рейтинга
const ratingNeedsRecalc = ref(false)
const recalcLoading = ref(false)
const clubPointsLoading = ref(false)

let isRecalculating = false

// Получить статус актуальности рейтинга с бэкенда (глобально)
const fetchRatingActuality = async () => {
  try {
    const res = await apiRequest('/v1/rating/actuality-status')
    ratingNeedsRecalc.value = !res.is_actual
  } catch (e) {
    ratingNeedsRecalc.value = false // fallback: считаем актуальным
  }
}

// Загрузка данных
const loadAchievements = async (page = null) => {
  try {
    const params = {}
    if (filters.value.club_id) params.club_id = filters.value.club_id
    if (filters.value.tournament_type_id) params.tournament_type_id = filters.value.tournament_type_id
    if (filters.value.year) params.year = filters.value.year
    if (filters.value.region_id) params.region_id = filters.value.region_id
    params.page = page || currentPage.value

    const response = await apiRequest('/v1/achievements/club', { params })
    if (response.data && response.data.data) {
      achievements.value = response.data.data
      currentPage.value = response.data.current_page
      lastPage.value = response.data.last_page
      total.value = response.data.total
    } else {
      achievements.value = response.data || []
      currentPage.value = 1
      lastPage.value = 1
      total.value = achievements.value.length
    }
    
    // (debug info removed)
  } catch (error) {
    console.error('Ошибка загрузки достижений:', error)
    showNotification('Ошибка при загрузке достижений', 'error')
  }
}

// Действия
const checkClubRegion = async (clubId) => {
  if (!clubId) {
    selectedClubData.value = null
    return
  }
  try {
    const response = await apiRequest(`/clubs/${clubId}`)
    selectedClubData.value = response.data || response
  } catch (error) {
    console.error('Ошибка загрузки данных клуба:', error)
    selectedClubData.value = null
  }
}

// Функция для загрузки списка клубов (без фильтрации по id)
const fetchClubsList = async () => {
  // Теперь используется динамическая загрузка через KirhSelectField
  // Эта функция оставлена для совместимости, но не используется
}

const editAchievement = async (achievement) => {
  editingAchievement.value = achievement
  form.value = {
    club_id: String(achievement.club_id),
    year: achievement.year,
    tournament_type_id: achievement.tournament_type_id,
    position: achievement.position,
    teams_count: achievement.teams_count,
    promoted: achievement.promoted,
    is_farm: achievement.is_farm || false
  }
  await checkClubRegion(achievement.club_id)
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingAchievement.value = null
  errors.value = {}
  successMessage.value = ''
  notificationMessage.value = ''
  selectedClubData.value = null
  form.value = {
    club_id: '',
    year: '',
    tournament_type_id: '',
    position: 1,
    teams_count: 16,
    promoted: false,
    is_farm: false
  }
  clubApiParams.value = { limit: 10, type: 'async' }
}

const closeRegionModal = () => {
  showRegionModal.value = false
  clubForRegion.value = null
  selectedRegionId.value = null
}

const showAddRegionModal = async () => {
  if (selectedClubData.value) {
    try {
      // Загружаем полную информацию о клубе
      const response = await apiRequest(`/clubs/${selectedClubData.value.id}`)
      if (!response.error && response.data) {
        clubForRegion.value = {
          id: response.data.id,
          name: response.data.title,
          full_info: response.data.full_info || response.data.title,
          logo: response.data.club_image_path
        }
        showRegionModal.value = true
      } else {
        // Fallback к базовой информации
        clubForRegion.value = {
          id: selectedClubData.value.id,
          name: selectedClubData.value.title || selectedClubData.value.name,
          full_info: selectedClubData.value.full_info || selectedClubData.value.title || selectedClubData.value.name
        }
        showRegionModal.value = true
      }
    } catch (error) {
      console.error('Ошибка загрузки данных клуба:', error)
      // Fallback к базовой информации
      clubForRegion.value = {
        id: selectedClubData.value.id,
        name: selectedClubData.value.title || selectedClubData.value.name,
        full_info: selectedClubData.value.full_info || selectedClubData.value.title || selectedClubData.value.name
      }
      showRegionModal.value = true
    }
  }
}

const addRegionToClub = async () => {
  if (!selectedRegionId.value || !clubForRegion.value) return

  try {
    // Сохраняем ID выбранной команды
    const selectedClubId = form.value.club_id
    
    const response = await apiRequest(`/v1/clubs/${clubForRegion.value.id}/regions`, {
      method: 'POST',
      body: { region_id: selectedRegionId.value }
    })
    
    if (response.error) {
      console.error('Ошибка добавления региона:', response.data?.message || 'Неизвестная ошибка')
      return
    }
    
    // Обновляем данные клуба
    await checkClubRegion(clubForRegion.value.id)
    
    // Закрываем модалку
    closeRegionModal()
    
    // Восстанавливаем выбранную команду в форме
    if (selectedClubId) {
      form.value.club_id = selectedClubId
      await checkClubRegion(selectedClubId)
    }
    
    // Показываем сообщение об успехе
    showNotification('Регион успешно добавлен к команде', 'success')
  } catch (error) {
    console.error('Ошибка добавления региона к клубу:', error)
    showNotification('Ошибка при добавлении региона к команде', 'error')
  }
}

const saveAchievement = async () => {
  try {
    // Очищаем предыдущие ошибки
    errors.value = {}
    successMessage.value = ''
    
    // Проверяем, есть ли у клуба регион
    if (selectedClubData.value && !selectedClubData.value.rating_region_id) {
      errors.value = { 
        general: [
          'У выбранной команды не указан регион рейтинга. Пожалуйста, сначала добавьте регион к команде в разделе "Клубы".'
        ] 
      }
      return
    }
    
    let response;
    if (editingAchievement.value) {
      response = await apiRequest(`/v1/achievements/${editingAchievement.value.id}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      response = await apiRequest('/v1/achievements', {
        method: 'POST',
        body: form.value
      })
    }
    
    // Проверяем, есть ли ошибка в ответе
    if (response.error) {
      // Обрабатываем специальный код CLUB_NO_REGION
      if (response.data?.code === 'CLUB_NO_REGION') {
        clubForRegion.value = {
          id: response.data.club_id,
          name: response.data.club_name
        }
        showRegionModal.value = true
        return
      }
      
      // Обрабатываем обычные ошибки валидации
      if (response.data?.errors) {
        errors.value = response.data.errors
      } else if (response.data?.message) {
        errors.value = { general: [response.data.message] }
      } else {
        errors.value = { general: ['Произошла ошибка при сохранении'] }
      }
      return
    }
    
    // Успешный ответ
    if (editingAchievement.value) {
      showNotification('Достижение успешно обновлено', 'success')
      await loadAchievements()
      await fetchRatingActuality()
      closeModal()
              } else {
       // Для добавления нового достижения показываем сообщение в модалке и не закрываем её
       successMessage.value = 'Достижение успешно добавлено!'
       
       // Обновляем данные в таблице
       await loadAchievements()
       await fetchRatingActuality()
       
       // Сохраняем все поля формы как есть, ничего не сбрасываем
       // Не очищаем selectedClubData, чтобы сохранить информацию о клубе
       
       // Автоматически скрываем сообщение об успехе через 3 секунды
       setTimeout(() => {
         successMessage.value = ''
       }, 3000)
     }
  } catch (error) {
    console.error('Ошибка сохранения достижения:', error)
    errors.value = { general: ['Произошла ошибка при сохранении'] }
  }
}

const deleteAchievement = (id) => {
  pendingDeleteId.value = id
  confirmModalTitle.value = 'Удаление достижения'
  confirmModalMessage.value = 'Вы уверены, что хотите удалить это достижение? Это действие нельзя отменить.'
  confirmModalType.value = 'danger'
  confirmModalConfirmText.value = 'Удалить'
  showConfirmModal.value = true
}

const handleConfirmAction = async () => {
  if (pendingDeleteId.value) {
    try {
      await apiRequest(`/v1/achievements/${pendingDeleteId.value}`, {
        method: 'DELETE'
      })
      await recalculateClubPoints()
      showNotification('Достижение успешно удалено', 'success')
    } catch (error) {
      console.error('Ошибка удаления достижения:', error)
      showNotification('Ошибка при удалении достижения', 'error')
    }
    pendingDeleteId.value = null
  }
  showConfirmModal.value = false
}

const showNotification = (message, type = 'success') => {
  notificationMessage.value = message
  notificationType.value = type
}

// Утилиты
const getFieldLabel = (field) => {
  const labels = {
    club_id: 'Команда',
    year: 'Год',
    tournament_type_id: 'Тип турнира',
    position: 'Место',
    teams_count: 'Количество команд',
    promoted: 'Повышение в лиге'
  }
  return labels[field] || field
}

// Пересчёт рейтинга
const recalculateRating = async () => {
  recalcLoading.value = true
  isRecalculating = true
  try {
    await apiRequest('/v1/rating/calculate-yearly', { method: 'POST' })
    setTimeout(async () => {
      await fetchRatingActuality()
      showNotification('Рейтинг успешно пересчитан', 'success')
      recalcLoading.value = false
      isRecalculating = false
    }, 1000) // увеличено с 300 до 1000
  } catch (e) {
    showNotification('Ошибка при пересчёте рейтинга', 'error')
    recalcLoading.value = false
    isRecalculating = false
  }
}

const recalculateClubPoints = async () => {
  clubPointsLoading.value = true
  try {
    const response = await apiRequest('/v1/achievements/recalculate-points', { method: 'POST' })
    if (response.success) {
      showNotification(response.message || 'Клубные очки успешно пересчитаны', 'success')
      await loadAchievements()
      await fetchRatingActuality() // теперь индикатор обновится
    } else {
      showNotification(response.message || 'Ошибка при пересчёте клубных очков', 'error')
    }
  } catch (e) {
    showNotification('Ошибка при пересчёте клубных очков', 'error')
  } finally {
    clubPointsLoading.value = false
  }
}

const changePage = (page) => {
  if (page < 1 || page > lastPage.value) return
  loadAchievements(page)
}

// Исправляю фильтры: при изменении любого фильтра сбрасываем страницу на первую
const onFilterChange = () => {
  currentPage.value = 1
  loadAchievements(1)
}

const isAnyFilterActive = computed(() => {
  return !!(filters.value.club_id || filters.value.tournament_type_id || filters.value.year || filters.value.region_id)
})

const clearFilters = () => {
  filters.value = {
    club_id: '',
    tournament_type_id: '',
    year: '',
    region_id: ''
  }
  currentPage.value = 1
  loadAchievements(1)
}

// Опции для селекта клубов теперь загружаются динамически через API

const onSelectClub = async (clubId) => {
  form.value.club_id = String(clubId)
  await checkClubRegion(clubId)
}

// Watcher удален, так как теперь используется динамическая загрузка

// Функция для открытия модалки добавления достижения
const openAddModal = async () => {
  editingAchievement.value = null
  successMessage.value = '' // Очищаем сообщение об успехе при открытии
  showModal.value = true
}

const regionsMap = ref({})

const fetchRegions = async () => {
  try {
    const res = await apiRequest('/v1/rating/regions', { params: { limit: 1000 } })
    if (Array.isArray(res)) {
      regionsMap.value = Object.fromEntries(res.map(r => [String(r.id), r.name]))
    } else if (res.data && Array.isArray(res.data)) {
      regionsMap.value = Object.fromEntries(res.data.map(r => [String(r.id), r.name]))
    }
  } catch (e) {
    regionsMap.value = {}
  }
}

// Инициализация
onMounted(() => {
  loadAchievements()
  fetchRegions()
  // fetchRatingActuality() // временно убрано для устранения двойного запроса
})

const visiblePages = computed(() => {
  const pages = []
  for (let i = 1; i <= lastPage.value; i++) {
    pages.push(i)
  }
  return pages
})
</script> 