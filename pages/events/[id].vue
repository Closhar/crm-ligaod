<template>
  <div class="p-6">
    <!-- Новый верхний блок -->
    <Head :breadcrumbs="breadcrumbs || []" show_breadcrumbs="true" />
    <div class="flex items-center gap-3 my-6">
      <Icon icon="cuida:edit-outline" class="w-7 h-7  mr-2" />
      <h1 class="text-2xl font-bold">Редактирование события</h1>
    </div>
    <div class="flex flex-wrap items-center gap-4 text-gray-700 text-base my-2">
      <div v-if="eventData && eventData.date_formatted" class="flex items-center gap-1">
        
        <span class="text-gray-800 font-bold text-xl">{{ new Date(eventData.date_formatted).toLocaleDateString('ru-RU') }}</span>
      </div>
      <div v-if="eventData && eventData.competition && eventData.competition.sport" class="flex items-center gap-1">
        
        <span class="text-blue-800 font-bold">{{ eventData.competition.sport.title }}</span>
      </div>
      <div v-if="eventData && eventData.competition && eventData.competition.gender" class="flex items-center gap-1">
        
        <span class="text-blue-800 font-bold">{{ eventData.competition.gender.title }}</span>
      </div>
      <div v-if="eventData && eventData.competition && eventData.competition.title" class="flex items-center gap-1">
        
        <span class="text-green-800 font-bold text-md">{{ eventData.competition.title }}</span>
      </div>
      <div v-if="eventData && eventData.arena" class="flex items-center gap-1">
        
        <span>{{ eventData.arena.title }}</span>
      </div>
    </div>
    <div class="flex flex-col md:flex-row items-center justify-between bg-gray-50 rounded-lg p-4 mb-8 gap-4  border-t-2 border-b-2 bg-yellow-50">
      <div class="flex items-center w-full justify-between">
        <div class="flex items-center gap-6">
          <template v-if="eventData && eventData.club1">
            <img :src="eventData.club1.club_image_path" alt="Эмблема клуба 1" class="w-10 h-10 object-contain rounded-full border mr-2" />
            <div class="font-bold text-base mr-4">
              {{ eventData.club1.title }}<span v-if="eventData.club1.city?.title"> ({{ eventData.club1.city.title }})</span>
            </div>
          </template>
          <template v-if="eventData && eventData.club2">
            <img :src="eventData.club2.club_image_path" alt="Эмблема клуба 2" class="w-10 h-10 object-contain rounded-full border mr-2" />
            <div class="font-bold text-base">
              {{ eventData.club2.title }}<span v-if="eventData.club2.city?.title"> ({{ eventData.club2.city.title }})</span>
            </div>
          </template>
        </div>
        <div class="flex flex-col items-end ml-auto">
          <div class="text-2xl font-extrabold text-gray-800">
            {{ eventData?.result || '— : —' }}
          </div>
          <div v-if="eventData?.result_dop" class="text-base font-semibold text-gray-500 mt-1">{{ eventData.result_dop }}</div>
        </div>
      </div>
    </div>

    <!-- ТАБЫ -->
    <div>

      <div class="flex gap-2">
        <button
          :class="[
            'tab-btn',
            activeMainTab === 0 ? 'tab-active-players' : 'tab-inactive-players'
          ]"
          @click="activeMainTab = 0"
        >
          <Icon icon="ph:user-list-bold" class="w-6 h-6 mr-2" />
          <span>СОСТАВЫ И СОБЫТИЯ</span>
        </button>
        <button
          :class="[
            'tab-btn',
            activeMainTab === 1 ? 'tab-active-staff' : 'tab-inactive-staff'
          ]"
          @click="activeMainTab = 1"
        >
          <Icon icon="icon-park:editor" class="w-6 h-6 mr-2" />
          <span>РЕДАКТОР</span>
        </button>
      </div>

      <div v-show="activeMainTab === 0" class="bg-blue-50 p-6 rounded-b-lg tab-active-players border-b-2 border-l-2 border-r-2">
        <!-- Весь основной контент страницы (грид с составами и событиями) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Левая колонка: Составы -->
          <div>
            <h2 class="text-xl font-semibold mb-4">Составы команд</h2>
            <div class="flex border-b">
              <template v-for="(club, idx) in clubs" :key="club.id">
                <button
                  :class="[
                    'flex items-center gap-2 px-6 py-3 text-base font-semibold transition-all',
                    idx === activeLineupTab ? 'border-b-4 border-blue-600 bg-white text-blue-700' : 'text-gray-400 bg-gray-50',
                    idx !== 0 ? 'ml-2' : ''
                  ]"
                  @click="activeLineupTab = idx"
                  style="border-radius: 12px 12px 0 0;"
                >
                  <img
                    :src="club.club_image_path"
                    alt="Эмблема"
                    class="w-10 h-10 object-contain rounded-full border"
                    :style="idx === activeLineupTab ? '' : 'filter: grayscale(1) opacity(0.5);'"
                  />
                  <span class="flex flex-col items-start">
                    <span
                      class="block leading-tight"
                      :class="[
                        idx === 1 && activeLineupTab === 1 ? 'text-red-400' : '',
                        idx === 1 && activeLineupTab !== 1 ? 'text-gray-400' : ''
                      ]"
                    >{{ club.title }}</span>
                    <span v-if="club.city?.title" class="block text-xs text-gray-400 leading-tight mt-0.5">{{ club.city.title }}</span>
                  </span>
                </button>
              </template>
            </div>
            <div class="bg-white rounded-b-lg shadow p-4">
              <template v-for="(club, idx) in clubs" :key="'tab-body-'+club.id">
                <div v-show="activeLineupTab === idx">
                  <!-- Весь функционал блока состава для клуба club -->
                  
                  <div v-if="displayLineupsMode === 'column'">
                    <div class="mb-6 border rounded p-4">
                      <!-- Одна линия: сортировка, индикатор номеров, добавление состава -->
                      <div class="flex items-center gap-3 mb-2">
                        <template v-if="lineupsByClub[club.id] && lineupsByClub[club.id].length > 0">
                          <button
                            v-if="getShowNumbers(club)"
                            class="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-base font-mono"
                            @click="() => sortLineupByNumber(club.id)"
                            title="Сортировать по номерам"
                          >
                            <Icon icon="fa-solid:sort-numeric-down" class="w-5 h-5" />
                            <span>#</span>
                          </button>
                          <label class="flex items-center cursor-pointer select-none gap-1">
                            <span class="font-mono font-bold text-base text-gray-700">#</span>
                            <span class="toggle-switch">
                              <input type="checkbox"
                                :checked="getShowNumbers(club)"
                                @change="toggleShowNumbers(club)"
                              />
                              <span class="slider"></span>
                            </span>
                          </label>
                        </template>
                        <div class="flex items-center gap-2 ml-auto">
                          <button class="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center" @click="openAddPlayerModal(club)" title="Добавить игрока">
                            <Icon icon="fluent:people-team-add-24-filled" class="w-6 h-6 mr-1" />
                            <span class="font-semibold text-xs tracking-wide">ОСНОВА</span>
                          </button>
                          <button
                            class="p-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center"
                            @click="loadData"
                            title="Обновить состав"
                          >
                            <Icon icon="fa:refresh" class="w-5 h-5 text-white" />
                          </button>
                        </div>
                      </div>
                      <!-- Состав команды -->
                      <div class="flex items-center gap-3 mb-2">

                      </div>
                      <template v-if="lineupsByClub[club.id] && lineupsByClub[club.id].length > 0">
                        <Draggable
                          :list="lineupsByClub[club.id]"
                          item-key="id"
                          @end="evt => onLineupSortEnd(evt, club.id)"
                          class="space-y-2"
                        >
                          <template #item="{ element: player }">
                            <div class="mb-2 flex flex-col gap-1 bg-gray-100 rounded p-1">
                              <div class="flex items-center gap-2">
                                <Icon
                                  icon="si:copyright-fill"
                                  class="captain-icon"
                                  :class="{'captain-active': player.is_captain}"
                                  @click="toggleCaptain(player)"
                                  title="Капитан"
                                  width="28"
                                  height="28"
                                  :style="{ minWidth: '28px', minHeight: '28px' }"
                                  viewBox="0 0 28 28"
                                />
                                <input v-if="getShowNumbers(club)" v-model="player.number" type="number" class="w-14 p-1 border rounded text-center" @change="updatePlayerNumber(player)" placeholder="#" />
                                <span :class="['text-sm', 'font-bold', getPlayerColor(club)]">{{ player.person ? player.person.full_name : player.player_name }}</span>
                                <div class="flex items-center gap-2 ml-auto">
                                  <template v-if="canShowSubButton(player, club.id)">
                                    <button @click="openSubForm(player)" class="px-2 py-1 bg-green-200 text-green-800 rounded text-xs hover:bg-green-300" title="Добавить замену">
                                      <Icon icon="tabler:refresh" class="w-4 h-4" />
                                    </button>
                                  </template>
                                  <template v-if="!isLineupPlayerReplaced(player, club.id)">
                                    <button @click="askRemovePlayer(player)" class="text-red-500 hover:text-red-700 p-1" title="Удалить игрока">
                                      <Icon icon="iconamoon:trash" class="w-5 h-5" />
                                    </button>
                                  </template>
                                </div>
                              </div>
                              <!-- Список замен -->
                              <div v-if="player.substitutions && player.substitutions.length" class="mt-1">
                                <div v-for="sub in player.substitutions" :key="sub.id">
                                  <div class="flex items-center gap-2 text-xs bg-gray-50 rounded p-1 mb-1">
                                    <Icon
                                      icon="si:copyright-fill"
                                      class="captain-icon"
                                      :class="{'captain-active': sub.is_captain}"
                                      @click="toggleCaptain(sub)"
                                      title="Капитан"
                                      width="28"
                                      height="28"
                                      :style="{ minWidth: '28px', minHeight: '28px' }"
                                      viewBox="0 0 28 28"
                                    />
                                    <Icon icon="ion:arrow-redo-outline" class="w-4 h-4 text-green-500" />
                                    <input v-if="getShowNumbers(club)" v-model="sub.number" type="number" class="w-10 p-1 border rounded text-center" @change="updatePlayerNumber(sub)" placeholder="#" />
                                    <span>{{ sub.person ? sub.person.full_name : sub.player_name }}</span>
                                    <input v-model="sub.minute_in" type="number" min="0" class="w-7 p-1 border rounded text-center bg-yellow-100" placeholder="мин." @change="updateSubMinuteIn(sub)" style="width:50px; background-color: #FEF9C3;" />
                                    <div class="flex items-center gap-2 ml-auto">
                                      <template v-if="canShowSubButton(sub, club.id)">
                                        <button @click="openSubForm(sub)" class="px-2 py-1 bg-green-200 text-green-800 rounded text-xs hover:bg-green-300" title="Добавить замену">
                                          <Icon icon="tabler:refresh" class="w-4 h-4" />
                                        </button>
                                      </template>
                                      <template v-if="!isLineupPlayerReplaced(sub, club.id)">
                                        <button @click="askRemovePlayer(sub)" class="text-red-400 hover:text-red-700 p-1" title="Удалить замену">
                                          <Icon icon="iconamoon:trash" class="w-4 h-4" />
                                        </button>
                                      </template>
                                    </div>
                                  </div>
                                  <!-- Форма добавления замены для sub теперь отдельным блоком под строкой -->
                                  <div v-if="showSubFormFor === sub.id" class="mt-2 bg-white border rounded p-2 flex flex-col gap-2">
                                    <label class="text-xs">Игрок-замена</label>
                                    <KirhSelect
                                      :options="getAvailableSubPlayers(sub.club_id)"
                                      v-model="subPersonId"
                                      :keyField="'id'"
                                      :labelField="'label'"
                                      :imageField="'main_image'"
                                      :enableSearch="true"
                                      :placeholder="'Выберите игрока'"
                                    />
                                    <input v-model="subPlayerName" type="text" class="w-full p-1 border rounded" placeholder="ФИО (если вручную)" />
                                    <div class="flex gap-2">
                                      <input v-model="subMinuteIn" type="number" class="w-20 p-1 border rounded" placeholder="Минута входа" />
                                    </div>
                                    <div class="flex gap-2 justify-end">
                                      <button @click="closeSubForm" class="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs">Отмена</button>
                                      <button @click="addSubstitution(sub)" class="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs">Добавить</button>
                                    </div>
                                    <div v-if="subError" class="text-red-500 text-xs mb-2">{{ subError }}</div>
                                  </div>
                                  <!-- Рекурсия: если у sub есть свои замены -->
                                  <div v-if="sub.substitutions && sub.substitutions.length" class="mt-1">
                                    <div v-for="subsub in sub.substitutions" :key="subsub.id">
                                      <div class="flex items-center gap-2 text-xs bg-gray-50 rounded p-1 mb-1">
                                        <Icon
                                          icon="si:copyright-fill"
                                          class="captain-icon"
                                          :class="{'captain-active': subsub.is_captain}"
                                          @click="toggleCaptain(subsub)"
                                          title="Капитан"
                                          width="28"
                                          height="28"
                                          :style="{ minWidth: '28px', minHeight: '28px' }"
                                          viewBox="0 0 28 28"
                                        />
                                        <Icon icon="ion:arrow-redo-outline" class="w-4 h-4 text-green-500" />
                                        <input v-if="getShowNumbers(club)" v-model="subsub.number" type="number" class="w-10 p-1 border rounded text-center" @change="updatePlayerNumber(subsub)" placeholder="#" />
                                        <span>{{ subsub.person ? subsub.person.full_name : subsub.player_name }}</span>
                                        <input v-model="subsub.minute_in" type="number" min="0" class="w-7 p-1 border rounded text-center bg-yellow-100" placeholder="мин." @change="updateSubMinuteIn(subsub)" style="width:50px; background-color: #FEF9C3;" />
                                        <div class="flex items-center gap-2 ml-auto">
                                          <template v-if="canShowSubButton(subsub, club.id)">
                                            <button @click="openSubForm(subsub)" class="px-2 py-1 bg-green-200 text-green-800 rounded text-xs hover:bg-green-300" title="Добавить замену">
                                              <Icon icon="tabler:refresh" class="w-4 h-4" />
                                            </button>
                                          </template>
                                          <template v-if="!isLineupPlayerReplaced(subsub, club.id)">
                                            <button @click="askRemovePlayer(subsub)" class="text-red-400 hover:text-red-700 p-1" title="Удалить замену">
                                              <Icon icon="iconamoon:trash" class="w-4 h-4" />
                                            </button>
                                          </template>
                                        </div>
                                      </div>
                                      <div v-if="showSubFormFor === subsub.id" class="mt-2 bg-white border rounded p-2 flex flex-col gap-2">
                                        <label class="text-xs">Игрок-замена</label>
                                        <KirhSelect
                                          :options="getAvailableSubPlayers(subsub.club_id)"
                                          v-model="subPersonId"
                                          :keyField="'id'"
                                          :labelField="'label'"
                                          :imageField="'main_image'"
                                          :enableSearch="true"
                                          :placeholder="'Выберите игрока'"
                                        />
                                        <input v-model="subPlayerName" type="text" class="w-full p-1 border rounded" placeholder="ФИО (если вручную)" />
                                        <div class="flex gap-2">
                                          <input v-model="subMinuteIn" type="number" class="w-20 p-1 border rounded" placeholder="Минута входа" />
                                        </div>
                                        <div class="flex gap-2 justify-end">
                                          <button @click="closeSubForm" class="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs">Отмена</button>
                                          <button @click="addSubstitution(subsub)" class="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs">Добавить</button>
                                        </div>
                                        <div v-if="subError" class="text-red-500 text-xs mb-2">{{ subError }}</div>
                                      </div>
                                      <!-- Рекурсия: если у subsub есть свои замены -->
                                      <div v-if="subsub.substitutions && subsub.substitutions.length" class="mt-1">
                                        <!-- Здесь повторяется тот же блок, что и выше, для subsub.substitutions -->
                                        <div v-for="subsubsub in subsub.substitutions" :key="subsubsub.id">
                                          <div class="flex items-center gap-2 text-xs bg-gray-50 rounded p-1 mb-1">
                                            <Icon
                                              icon="si:copyright-fill"
                                              class="captain-icon"
                                              :class="{'captain-active': subsubsub.is_captain}"
                                              @click="toggleCaptain(subsubsub)"
                                              title="Капитан"
                                              width="28"
                                              height="28"
                                              :style="{ minWidth: '28px', minHeight: '28px' }"
                                              viewBox="0 0 28 28"
                                            />
                                            <Icon icon="ion:arrow-redo-outline" class="w-4 h-4 text-green-500" />
                                            <input v-if="getShowNumbers(club)" v-model="subsubsub.number" type="number" class="w-10 p-1 border rounded text-center" @change="updatePlayerNumber(subsubsub)" placeholder="#" />
                                            <span>{{ subsubsub.person ? subsubsub.person.full_name : subsubsub.player_name }}</span>
                                            <input v-model="subsubsub.minute_in" type="number" min="0" class="w-7 p-1 border rounded text-center bg-yellow-100" placeholder="мин." @change="updateSubMinuteIn(subsubsub)" style="width:50px; background-color: #FEF9C3;" />
                                            <div class="flex items-center gap-2 ml-auto">
                                              <template v-if="canShowSubButton(subsubsub, club.id)">
                                                <button @click="openSubForm(subsubsub)" class="px-2 py-1 bg-green-200 text-green-800 rounded text-xs hover:bg-green-300" title="Добавить замену">
                                                  <Icon icon="tabler:refresh" class="w-4 h-4" />
                                                </button>
                                              </template>
                                              <template v-if="!isLineupPlayerReplaced(subsubsub, club.id)">
                                                <button @click="askRemovePlayer(subsubsub)" class="text-red-400 hover:text-red-700 p-1" title="Удалить замену">
                                                  <Icon icon="iconamoon:trash" class="w-4 h-4" />
                                                </button>
                                              </template>
                                            </div>
                                          </div>
                                          <div v-if="showSubFormFor === subsubsub.id" class="mt-2 bg-white border rounded p-2 flex flex-col gap-2">
                                            <label class="text-xs">Игрок-замена</label>
                                            <KirhSelect
                                              :options="getAvailableSubPlayers(subsubsub.club_id)"
                                              v-model="subPersonId"
                                              :keyField="'id'"
                                              :labelField="'label'"
                                              :imageField="'main_image'"
                                              :enableSearch="true"
                                              :placeholder="'Выберите игрока'"
                                            />
                                            <input v-model="subPlayerName" type="text" class="w-full p-1 border rounded" placeholder="ФИО (если вручную)" />
                                            <div class="flex gap-2">
                                              <input v-model="subMinuteIn" type="number" class="w-20 p-1 border rounded" placeholder="Минута входа" />
                                            </div>
                                            <div class="flex gap-2 justify-end">
                                              <button @click="closeSubForm" class="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs">Отмена</button>
                                              <button @click="addSubstitution(subsubsub)" class="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs">Добавить</button>
                                            </div>
                                            <div v-if="subError" class="text-red-500 text-xs mb-2">{{ subError }}</div>
                                          </div>
                                          <!-- Можно продолжить рекурсию дальше, если потребуется -->
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <!-- Форма добавления замены для основного игрока -->
                              <div v-if="showSubFormFor === player.id" class="ml-8 mt-2 bg-white border rounded p-2 flex flex-col gap-2">
                                <label class="text-xs">Игрок-замена</label>
                                <KirhSelect
                                  :options="getAvailableSubPlayers(player.club_id)"
                                  v-model="subPersonId"
                                  :keyField="'id'"
                                  :labelField="'label'"
                                  :imageField="'main_image'"
                                  :enableSearch="true"
                                  :placeholder="'Выберите игрока'"
                                />
                                <input v-model="subPlayerName" type="text" class="w-full p-1 border rounded" placeholder="ФИО (если вручную)" />
                                <div class="flex gap-2">
                                  <input v-model="subMinuteIn" type="number" class="w-20 p-1 border rounded" placeholder="Минута входа" />
                                </div>
                                <div class="flex gap-2 justify-end">
                                  <button @click="closeSubForm" class="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs">Отмена</button>
                                  <button @click="addSubstitution(player)" class="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs">Добавить</button>
                                </div>
                                <div v-if="subError" class="text-red-500 text-xs mb-2">{{ subError }}</div>
                              </div>
                            </div>
                          </template>
                        </Draggable>
                        <div class="mt-1 text-xs italic text-gray-500">Поддерживается сортировка перетаскиванием</div>
                      </template>
                      <template v-else>
                        <div class="mb-6 border rounded p-4 flex flex-col items-center justify-center py-8 text-green-600 bg-green-50">
                          <Icon icon="fluent:people-community-16-filled" class="w-12 h-12 mb-2" />
                          <div class="text-base font-medium">Игроки в составе отсутствуют</div>
                          <div class="text-xs mt-1">Добавьте событие для команды, чтобы оно появилось в списке</div>
                        </div>
                      </template>
                    </div>
                  </div>
                  <div v-else-if="displayLineupsMode === 'comma'">
                    <div class="mb-6 border rounded p-4">
                      <div class="flex items-center gap-2 mb-2">
                        <div class="flex items-center gap-2 flex-1">
                          <template v-if="lineupsByClub[club.id] && lineupsByClub[club.id].length > 0">
                            <button
                              v-if="getShowNumbers(club)"
                              class="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-base font-mono"
                              @click="() => sortLineupByNumber(club.id)"
                              title="Сортировать по номерам"
                            >
                              <Icon icon="fa-solid:sort-numeric-down" class="w-5 h-5" />
                              <span>#</span>
                            </button>
                            <label class="flex items-center cursor-pointer select-none gap-1">
                              <span class="font-mono font-bold text-base text-gray-700">#</span>
                              <span class="toggle-switch">
                                <input type="checkbox"
                                  :checked="getShowNumbers(club)"
                                  @change="toggleShowNumbers(club)"
                                />
                                <span class="slider"></span>
                              </span>
                            </label>
                          </template>
                        </div>
                        <button class="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center" @click="openAddPlayerModal(club)" title="Добавить игрока">
                          <Icon icon="fluent:people-team-add-24-filled" class="w-6 h-6 mr-1" />
                          <span class="font-semibold text-xs tracking-wide">ОСНОВА</span>
                        </button>
                        <button
                          class="p-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center"
                          @click="loadData"
                          title="Обновить состав"
                        >
                          <Icon icon="fa:refresh" class="w-5 h-5 text-white" />
                        </button>
                      </div>
                      <div class="text-sm">
                        <span v-for="(player, idx) in getLineupByClub(club.id)" :key="player.id">
                          <template v-if="getShowNumbers(club) && player.number !== null && player.number !== undefined">
                            {{ player.number }}. {{ player.person ? player.person.full_name : player.player_name }}<span v-if="player.is_captain"> (к)</span>
                          </template>
                          <template v-else>
                            {{ player.person ? player.person.full_name : player.player_name }}<span v-if="player.is_captain"> (к)</span>
                          </template>
                          <!-- Замены -->
                          <template v-if="player.substitutions && player.substitutions.length">
                            (
                            <span v-for="(sub, subIdx) in player.substitutions" :key="sub.id">
                              <template v-if="getShowNumbers(club) && sub.number !== null && sub.number !== undefined">
                                {{ sub.number }}. {{ sub.person ? sub.person.full_name : sub.player_name }}<span v-if="sub.is_captain"> (к)</span>
                              </template>
                              <template v-else>
                                {{ sub.person ? sub.person.full_name : sub.player_name }}<span v-if="sub.is_captain"> (к)</span>
                              </template>
                              <template v-if="sub.minute_in">, {{ sub.minute_in }}'</template>
                              <span v-if="subIdx < player.substitutions.length - 1">, </span>
                            </span>
                            )
                          </template>
                          <span v-if="idx < getLineupByClub(club.id).length - 1">, </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
            <!-- Тип отображения -->
            <div class="mb-6 mt-6 flex items-center gap-4">
              <label class="text-sm font-medium">Тип отображения:</label>
              <div class="flex gap-4">
                <label class="inline-flex items-center cursor-pointer">
                  <input type="radio" class="form-radio accent-blue-600" value="column" v-model="displayLineupsMode" @change="updateDisplayLineupsMode">
                  <Icon icon="fluent:text-column-wide-24-filled" class="w-5 h-5 ml-2 text-gray-500" />
                  <span class="ml-2 text-sm font-bold text-gray-600">В столбцы</span>
                </label>
                <label class="inline-flex items-center cursor-pointer">
                  <input type="radio" class="form-radio accent-blue-600" value="comma" v-model="displayLineupsMode" @change="updateDisplayLineupsMode">
                  <Icon icon="fluent:table-insert-row-20-filled" class="w-5 h-5 ml-2 text-gray-500" />
                  <span class="ml-2 text-sm font-bold text-gray-600">Через запятую</span>
                </label>
              </div>
            </div>
          </div>
          <!-- Правая колонка: События -->
          <div class="w-full">
            <div class="flex items-center mb-4">
              <h2 class="text-xl font-semibold flex-1">События матча</h2>
              <button class="ml-2 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-2 text-sm font-semibold" @click="showActionTypesModal = true">
                <Icon icon="fluent:settings-20-filled" class="w-5 h-5" />
                Типы: ИГРОКИ
              </button>
              <button class="ml-2 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-2 text-sm font-semibold" @click="showTeamActionTypesModal = true">
                <Icon icon="fluent:settings-20-filled" class="w-5 h-5" style="color: #059669;" />
                Типы: КОМАНДЫ
              </button>
            </div>
            <!-- Табы для событий -->
            <div class="flex border-b">
              <button
                :class="[
                  'flex items-center gap-2 px-6 py-3 text-base font-semibold transition-all',
                  activeEventTab === 0 ? 'border-b-4 border-blue-900 bg-white text-blue-900' : 'text-gray-400 bg-gray-50',
                  'rounded-t-lg',
                  activeEventTab !== 0 ? 'ml-2' : ''
                ]"
                @click="activeEventTab = 0"
                style="border-radius: 12px 12px 0 0;"
              >
                <Icon icon="fa-solid:people-arrows" class="w-6 h-6" style="color: #1e3a8a;" />
                <span>Игроки</span>
              </button>
              <button
                :class="[
                  'flex items-center gap-2 px-6 py-3 text-base font-semibold transition-all',
                  activeEventTab === 1 ? 'border-b-4 border-green-900 bg-white text-green-900' : 'text-gray-400 bg-gray-50',
                  'rounded-t-lg',
                  'ml-2'
                ]"
                @click="activeEventTab = 1"
                style="border-radius: 12px 12px 0 0;"
              >
                <Icon icon="fluent:people-community-16-filled" class="w-6 h-6" style="color: #065f46;" />
                <span>Команды</span>
              </button>
            </div>
            <div class="bg-white rounded-b-lg shadow p-4">
              <div v-show="activeEventTab === 0">
                <!-- Существующий функционал событий для игроков -->
                <div class="grid grid-cols-2 gap-8 mb-6">
                  <div class="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                    <img :src="clubs[0]?.club_image_path" alt="Эмблема" class="w-16 h-16 object-contain rounded-full border" />
                    <div class="flex flex-col flex-1 min-w-0">
                      <div class="font-bold text-lg text-blue-600 truncate">{{ clubs[0]?.title }}</div>
                      <div class="text-gray-500 text-sm truncate">{{ clubs[0]?.city?.title }}</div>
                    </div>
                    <button class="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-2 font-semibold whitespace-nowrap" @click="openAddActionModalForClub(clubs[0])">
                      <Icon icon="fluent-mdl2:user-event" class="w-5 h-5" />
                      <span>СОБЫТИЕ</span>
                    </button>
                  </div>
                  <div class="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                    <img :src="clubs[1]?.club_image_path" alt="Эмблема" class="w-16 h-16 object-contain rounded-full border" />
                    <div class="flex flex-col flex-1 min-w-0">
                      <div class="font-bold text-lg text-red-500 truncate">{{ clubs[1]?.title }}</div>
                      <div class="text-gray-500 text-sm truncate">{{ clubs[1]?.city?.title }}</div>
                    </div>
                    <button class="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 flex items-center gap-2 font-semibold whitespace-nowrap" @click="openAddActionModalForClub(clubs[1])">
                      <Icon icon="fluent-mdl2:user-event" class="w-5 h-5" />
                      <span>СОБЫТИЕ</span>
                    </button>
                  </div>
                </div>
                <!-- Кнопка сортировки по минутам -->
                <div v-if="actions.length > 0" class="flex items-center justify-end mb-2 gap-2">
                  <button
                    class="flex items-center gap-2 px-4 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-semibold text-sm"
                    @click="sortActionsByMinute"
                  >
                    <Icon icon="mingcute:stopwatch-fill" class="w-5 h-5 text-white" />
                    Сорт по минутам
                  </button>
                  <button
                    class="flex items-center gap-2 px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm"
                    @click="calculateAndSaveScores"
                  >
                    <Icon icon="ic:round-scoreboard" class="w-5 h-5 text-white" />
                    СЧЕТ
                  </button>
                  <button
                    class="flex items-center justify-center px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white"
                    @click="loadData"
                    title="Обновить"
                  >
                    <Icon icon="fa:refresh" class="w-5 h-5 text-white" />
                  </button>
                </div>
                <!-- Блок событий -->
                <div class="w-full flex flex-col gap-2" v-if="clubs.length">
                  <div class="mb-6 border rounded p-4">
                    <template v-if="actions.length > 0">
                      <Draggable
                        :list="actions"
                        item-key="id"
                        @end="onActionsSortEnd"
                        class="flex flex-col gap-2"
                      >
                        <template #item="{ element: action }">
                          <div
                            :class="[
                              'flex items-center rounded-lg px-4 py-2 w-full',
                              action.club_id === clubs[0]?.id ? 'bg-blue-50 self-start justify-start' : 'bg-red-50 self-end justify-end'
                            ]"
                          >
                            <span class="text-gray-400 mr-2 cursor-pointer" v-if="editingMinuteId !== action.id" @click="startEditMinute(action)">
                              {{ action.minute !== null && action.minute !== undefined && action.minute !== '' ? action.minute + "'" : '—' }}
                            </span>
                            <input v-else
                              type="text"
                              class="w-14 p-1 border rounded text-center mr-2"
                              v-model="editingMinuteValue"
                              @blur="saveEditMinute(action)"
                              @keyup.enter="saveEditMinute(action)"
                              @keyup.esc="cancelEditMinute"
                              ref="minuteInputRef"
                              style="width: 60px;"
                            />
                            <span class="font-semibold mr-2 flex items-center gap-1">
                              <Icon
                                v-if="getActionTypeObj(action.action_type_id)?.icon"
                                :icon="getActionTypeObj(action.action_type_id).icon"
                                :class="getActionTypeObj(action.action_type_id)?.color || ''"
                                class="w-5 h-5"
                              />
                              <span>
                                {{ getActionTypeObj(action.action_type_id)?.short_name || '' }}
                              </span>
                              <span v-if="getActionTypeObj(action.action_type_id)?.group == 1 && action.score" class="ml-2 text-base font-mono text-red-600 font-bold">({{ action.score }})</span>
                            </span>
                            <span v-if="action.person" class="mr-2">{{ action.person.full_name }}</span>
                            <span v-else class="mr-2">{{ action.player_name }}</span>
                            <span v-if="action.value" class="mr-2">({{ action.value }})</span>
                            <button @click="askRemoveAction(action)" class="ml-2 text-red-400 hover:text-red-700" title="Удалить">
                              <Icon icon="iconamoon:trash" class="w-5 h-5" />
                            </button>
                          </div>
                        </template>
                      </Draggable>
                    </template>
                    <template v-else>
                      <div class="flex flex-col items-center justify-center py-8 text-gray-400 bg-blue-50">
                        <Icon icon="mdi:calendar-remove-outline" class="w-12 h-12 mb-2 text-blue-600" />
                        <div class="text-base font-medium text-blue-600">События для игроков отсутствуют</div>
                        <div class="text-xs mt-1 text-blue-600">Добавьте события для игроков, чтобы они появились в списке</div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
              <div v-show="activeEventTab === 1">
                <div class="mb-6 flex flex-col md:flex-row gap-4 items-end">
                  <div class="flex-1">
                    <label class="block text-sm font-medium mb-1">Тип события</label>
                    <KirhSelect
                      :options="teamActionTypeOptions"
                      v-model="newTeamAction.team_action_type_id"
                      :keyField="'id'"
                      :labelField="'name'"
                      :iconField="'icon'"
                      :enableSearch="true"
                      :placeholder="'Выберите тип события'"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">Значение 1</label>
                    <input v-model="newTeamAction.value_home" type="number" class="w-24 p-2 border rounded" placeholder="0" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">Значение 2</label>
                    <input v-model="newTeamAction.value_away" type="number" class="w-24 p-2 border rounded" placeholder="0" />
                  </div>
                  <button @click="addTeamAction" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Добавить</button>
                </div>
                <div v-if="loadingTeamActions" class="text-center text-gray-400 py-8">Загрузка...</div>
                <div v-else>
                  <template v-if="teamActions.length > 0">
                    <div class="flex flex-col gap-4">
                      <div v-for="action in teamActions" :key="action.id" class="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row items-center gap-4">
                        <div class="flex-1 flex flex-col gap-2">
                          <div class="flex items-center justify-center gap-2">
                            <Icon v-if="action.team_action_type?.icon" :icon="action.team_action_type.icon" class="w-6 h-6" />
                            <span class="font-semibold text-base text-center w-full">{{ action.team_action_type?.name || '' }}</span>
                          </div>
                          <!-- Индикатор соотношения -->
                          <div class="flex items-center gap-2 mt-2">
                            <span class="font-mono font-bold text-blue-700" style="min-width: 36px;">
                              <input type="number" :value="action.value_home" @change="e => updateTeamActionValue(action, 'value_home', e.target.value)" class="w-14 p-1 border rounded text-center" style="width: 50px;" />
                            </span>
                            <div class="flex-1 relative h-6 rounded overflow-hidden mx-2" style="min-width: 120px; background: linear-gradient(90deg, #2563eb 0%, #059669 100%);">
                              <div v-if="action.value_home + action.value_away > 0" :style="{ width: ((action.value_home / (action.value_home + action.value_away)) * 100) + '%', background: '#2563eb', height: '100%', position: 'absolute', left: 0, top: 0 }"></div>
                              <div v-if="action.value_home + action.value_away > 0" :style="{ width: ((action.value_away / (action.value_home + action.value_away)) * 100) + '%', background: '#059669', height: '100%', position: 'absolute', left: ((action.value_home / (action.value_home + action.value_away)) * 100) + '%' }"></div>
                              <div v-if="action.value_home + action.value_away === 0" class="absolute inset-0 flex items-center justify-center text-xs text-gray-400">0%</div>
                            </div>
                            <span class="font-mono font-bold text-green-700" style="min-width: 36px;">
                              <input type="number" :value="action.value_away" @change="e => updateTeamActionValue(action, 'value_away', e.target.value)" class="w-14 p-1 border rounded text-center" style="width: 50px;" />
                            </span>
                            <button @click="askRemoveTeamAction(action)" class="ml-2 text-red-400 hover:text-red-700" title="Удалить">
                              <Icon icon="iconamoon:trash" class="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="mb-6 border rounded p-4 flex flex-col items-center justify-center py-8 text-gray-400 bg-blue-50">
                      <Icon icon="mdi:calendar-remove-outline" class="w-12 h-12 mb-2 text-blue-600" />
                      <div class="text-base font-medium text-blue-600">События для команд отсутствуют</div>
                      <div class="text-xs mt-1 text-blue-600">Добавьте события для команд, чтобы они появилось в списке</div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeMainTab === 1" class="bg-yellow-50 p-6 rounded-b-lg tab-content tab-content-staff border-b-2 border-l-2 border-r-2">
        <EventAdvancedEditor
          :event-data="enrichedEventData"
          :team-actions="teamActions"
          :team-action-type-options="teamActionTypeOptions"
          @update:event-data="updateEventData"
        />
      </div>

    </div>

    <!-- Модалка добавления игрока (теперь: модалка выбора состава) -->
    <template v-if="showAddPlayerModal">
      <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
          <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700" @click="closeAddPlayerModal">✕</button>
          <h3 class="text-lg font-semibold mb-4">Выберите игроков основы для {{ addPlayerClub?.title }}</h3>
          <div class="mb-3">
            <div class="flex items-center mb-2">
              <span class="text-sm font-medium">Состав клуба (отметьте игроков):</span>
              <span class="ml-auto text-xs text-gray-600">Выбрано: <span class="font-bold text-blue-600 text-base align-middle">{{ selectedPlayers.length + manualPlayers.length }}</span></span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-80 overflow-y-auto border rounded p-2 bg-gray-50">
              <div v-for="player in sortedClubPlayers" :key="player.id"
                :class="['flex items-center gap-2 p-1 rounded',
                  isPlayerLocked(player) ? 'border border-red-400 bg-gray-100 opacity-60 cursor-not-allowed' : 'hover:bg-blue-50']">
                <label class="flex items-center gap-2 cursor-pointer w-full">
                  <span class="custom-switch">
                    <input type="checkbox"
                      :id="'player-'+player.id"
                      :value="player.id"
                      v-model="selectedPlayers"
                      class="hidden"
                      :disabled="isPlayerLocked(player)"
                    />
                    <span class="slider-green"></span>
                  </span>
                  <img v-if="player.main_image" :src="player.main_image" alt="" class="w-8 h-8 rounded-full border" />
                  <span class="flex-1 text-sm">{{ player.label }}<span v-if="player.person?.player_number"> ({{ player.person.player_number }})</span></span>
                </label>
              </div>
              <!-- Вручную добавленные -->
              <div v-for="(mp, idx) in manualPlayers" :key="'manual-'+idx" class="flex items-center gap-2 p-1 rounded bg-yellow-50">
                <span class="flex-1 text-sm">{{ mp.label }}<span v-if="mp.number !== null && mp.number !== undefined"> ({{ mp.number }})</span></span>
                <button @click="openEditManualPlayer(idx)" class="text-blue-500 hover:text-blue-700 ml-2" title="Редактировать">
                  <Icon icon="uil:edit" class="w-5 h-5" />
                </button>
                <button @click="removeManualPlayer(idx)" class="text-red-400 hover:text-red-700 ml-2">✕</button>
              </div>
            </div>
            <div class="mt-2 text-xs text-gray-500 italic">
              Выбор игрока блокируется, если он заменен, вышел на замену или имеет событие матча, связанное с ним.
            </div>
          </div>
          <div class="flex justify-between gap-3 mt-6 items-center">
            <button @click="openAddManualModal" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center text-xs">
              <Icon icon="icon-park-twotone:hand-down" class="w-5 h-5 mr-1" />
              Добавить в ручную
            </button>
            <div class="flex gap-3">
              <button @click="closeAddPlayerModal" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center">
                <Icon icon="ic:round-close" class="w-5 h-5 mr-1" />
                Отмена
              </button>
              <button @click="addSelectedPlayersToLineup" :disabled="selectedPlayers.length + manualPlayers.length === 0" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center">
                <Icon icon="mdi:list-box" class="w-5 h-5 mr-1" />
                Сформировать состав основы
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Модалка добавления события -->
    <template v-if="showActionModal">
      <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
          <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700" @click="closeActionModal">✕</button>
          <h3 class="text-lg font-semibold mb-4">Добавить событие для {{ actionForm.club?.title }}</h3>
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Выберите игрока</label>
            <KirhSelect
              :options="actionClubPlayers"
              v-model="actionSelectedPersonId"
              :keyField="'id'"
              :labelField="'label'"
              :imageField="'main_image'"
              :enableSearch="true"
              :placeholder="'Выберите игрока'"
            />
            <div class="text-xs text-gray-400 mt-1">или введите вручную:</div>
            <input v-model="actionForm.player_name" type="text" class="w-full p-2 border rounded mb-2 mt-1" placeholder="ФИО игрока" />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Тип события</label>
            <div class="flex gap-3 mb-2">
              <label class="inline-flex items-center">
                <input type="radio" class="form-radio accent-blue-600" value="all" v-model="selectedActionGroup" />
                <span class="ml-1 text-xs">Все</span>
              </label>
              <label class="inline-flex items-center">
                <input type="radio" class="form-radio accent-blue-600" value="1" v-model="selectedActionGroup" />
                <span class="ml-1 text-xs">Голы</span>
              </label>
              <label class="inline-flex items-center">
                <input type="radio" class="form-radio accent-blue-600" value="2" v-model="selectedActionGroup" />
                <span class="ml-1 text-xs">Очки</span>
              </label>
              <label class="inline-flex items-center">
                <input type="radio" class="form-radio accent-blue-600" value="3" v-model="selectedActionGroup" />
                <span class="ml-1 text-xs">Фолы</span>
              </label>
              <label class="inline-flex items-center">
                <input type="radio" class="form-radio accent-blue-600" value="4" v-model="selectedActionGroup" />
                <span class="ml-1 text-xs">Прочее</span>
              </label>
            </div>
            <KirhSelect
              :options="filteredActionTypeOptions"
              v-model="actionForm.action_type_id"
              :keyField="'id'"
              :labelField="'name'"
              :iconField="'icon'"
              :enableSearch="true"
              :placeholder="'Выберите тип события'"
            />
          </div>
          <div class="mb-3 flex gap-3">
            <div class="flex-1">
              <label class="block text-sm font-medium mb-1">Минута</label>
              <input v-model="actionForm.minute" type="text" class="w-full p-2 border rounded" placeholder="Минута (можно оставить пустым)" />
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium mb-1">Значение</label>
              <input v-model="actionForm.value" type="number" class="w-full p-2 border rounded" placeholder="Значение (например, голы)" />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="closeActionModal" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Отмена</button>
            <button @click="saveAction" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Добавить</button>
          </div>
        </div>
      </div>
    </template>

    <!-- Модалка подтверждения удаления игрока -->
    <ConfirmModal
      :isOpen="showRemovePlayerModal"
      title="Удалить игрока из состава?"
      message="Вы уверены, что хотите удалить этого игрока из состава? Это действие нельзя отменить."
      type="danger"
      confirmText="Удалить"
      cancelText="Отмена"
      @confirm="confirmRemovePlayer"
      @cancel="cancelRemovePlayer"
    />

    <!-- Модалка редактирования вручную добавленного игрока -->
    <template v-if="showEditManualModal">
      <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-sm relative max-h-[90vh] overflow-y-auto">
          <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700" @click="closeEditManualModal">✕</button>
          <h3 class="text-lg font-semibold mb-4">Редактировать игрока</h3>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">ФИО игрока</label>
            <input v-model="editManualName" type="text" class="w-full p-2 border rounded" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Номер (необязательно)</label>
            <input v-model="editManualNumber" type="number" class="w-full p-2 border rounded" />
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="closeEditManualModal" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Отмена</button>
            <button @click="saveEditManualPlayer" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Сохранить</button>
          </div>
        </div>
      </div>
    </template>

    <!-- Модалка добавления вручную -->
    <template v-if="showAddManualModal">
      <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-sm relative max-h-[90vh] overflow-y-auto">
          <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700" @click="closeAddManualModal">✕</button>
          <h3 class="text-lg font-semibold mb-4">Добавить игрока вручную</h3>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">ФИО игрока</label>
            <input v-model="manualPlayerName" type="text" class="w-full p-2 border rounded" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Номер (необязательно)</label>
            <input v-model="manualPlayerNumber" type="number" class="w-full p-2 border rounded" />
          </div>
          <div v-if="manualPlayerError" class="text-red-500 text-xs mb-2">{{ manualPlayerError }}</div>
          <div v-if="addManualSuccess" class="mb-2 p-2 bg-green-100 text-green-700 rounded text-center font-semibold text-sm">{{ addManualSuccess }}</div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="closeAddManualModal" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Отмена</button>
            <button @click="addManualPlayer" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Добавить</button>
          </div>
        </div>
      </div>
    </template>

    <!-- Модалка управления типами событий -->
    <template v-if="showActionTypesModal">
      <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-5xl relative max-h-[90vh] overflow-y-auto">
          <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700" @click="showActionTypesModal = false">✕</button>
          <h3 class="text-lg font-semibold mb-4">Типы событий</h3>
          <!-- Форма добавления типа события -->
          <form @submit.prevent="addActionType" class="flex flex-wrap gap-3 mb-6 items-end">
            <div class="flex flex-col">
              <label class="text-xs font-semibold mb-1">Название типа</label>
              <input v-model="newActionType.name" type="text" class="border rounded px-2 py-1 w-40" required />
            </div>
            <div class="flex flex-col">
              <label class="text-xs font-semibold mb-1">
                <span class="flex items-center gap-1">
                  Иконка (iconify)
                  <a href="https://icon-sets.iconify.design/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800" title="Открыть Iconify">
                    <Icon icon="streamline-sharp:link-share-2-remix" class="w-4 h-4 align-middle" />
                  </a>
                </span>
              </label>
              <input v-model="newActionType.icon" type="text" class="border rounded px-2 py-1 w-40" placeholder="mdi:star" />
            </div>
            <div class="flex flex-col">
              <label class="text-xs font-semibold mb-1">Цвет (tailwind)</label>
              <input v-model="newActionType.color" type="text" class="border rounded px-2 py-1 w-32" placeholder="text-blue-500" />
            </div>
            <div class="flex flex-col">
              <label class="text-xs font-semibold mb-1">Группа</label>
              <select v-model="newActionType.group" class="border rounded px-2 py-1 w-28">
                <option :value="1">Голы</option>
                <option :value="2">Очки</option>
                <option :value="3">Фолы</option>
                <option :value="4">Прочее</option>
              </select>
            </div>
            <div class="flex flex-col">
              <label class="text-xs font-semibold mb-1">Краткое название</label>
              <input v-model="newActionType.short_name" type="text" class="border rounded px-2 py-1 w-24" placeholder="Гол" />
            </div>
            <div class="flex flex-col">
              <label class="text-xs font-semibold mb-1">Очки</label>
              <input v-model="newActionType.points" type="number" class="border rounded px-2 py-1 w-20" placeholder="0" />
            </div>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Добавить</button>
          </form>
          <!-- Таблица типов событий -->
          <div class="mb-4 flex items-center gap-2">
            <input v-model="actionTypesSearch" type="text" class="border rounded px-2 py-1 w-64" placeholder="Поиск по названию типа..." />
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full border text-sm">
              <thead>
                <tr class="bg-gray-100">
                  <th class="p-2 border">ID</th>
                  <th class="p-2 border">Название</th>
                  <th class="p-2 border">Кратко</th>
                  <th class="p-2 border">Иконка</th>
                  <th class="p-2 border">Цвет</th>
                  <th class="p-2 border">Группа</th>
                  <th class="p-2 border">Очки</th>
                  <th class="p-2 border">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="type in paginatedActionTypesFiltered" :key="type.id">
                  <td class="p-2 border text-center">{{ type.id }}</td>
                  <td class="p-2 border">
                    <input v-model="type.name" @change="updateActionType(type)" class="border rounded px-1 py-0.5 w-32" />
                  </td>
                  <td class="p-2 border">
                    <input v-model="type.short_name" @change="updateActionType(type)" class="border rounded px-1 py-0.5 w-16" />
                  </td>
                  <td class="p-2 border">
                    <input v-model="type.icon" @change="updateActionType(type)" class="border rounded px-1 py-0.5 w-24" />
                  </td>
                  <td class="p-2 border">
                    <input v-model="type.color" @change="updateActionType(type)" class="border rounded px-1 py-0.5 w-20" />
                  </td>
                  <td class="p-2 border">
                    <select v-model="type.group" @change="updateActionType(type)" class="border rounded px-1 py-0.5 w-16">
                      <option :value="1">Голы</option>
                      <option :value="2">Очки</option>
                      <option :value="3">Фолы</option>
                      <option :value="4">Прочее</option>
                    </select>
                  </td>
                  <td class="p-2 border">
                    <input v-model="type.points" @change="updateActionType(type)" type="number" class="border rounded px-1 py-0.5 w-14" />
                  </td>
                  <td class="p-2 border text-center">
                    <button @click="askRemoveActionType(type)" class="text-red-500 hover:text-red-700" title="Удалить тип события">
                      <Icon icon="iconamoon:trash" class="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <!-- Пагинация -->
            <div class="flex justify-end items-center gap-2 mt-2">
              <button @click="prevActionTypesPage" :disabled="actionTypesPage === 1" class="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50">Назад</button>
              <span>Стр. {{ actionTypesPage }} / {{ actionTypesTotalPages }}</span>
              <button @click="nextActionTypesPage" :disabled="actionTypesPage === actionTypesTotalPages" class="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50">Вперёд</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Модалка подтверждения удаления события -->
    <ConfirmModal
      :isOpen="showRemoveActionModal"
      title="Удалить событие?"
      message="Вы уверены, что хотите удалить это событие? Это действие нельзя отменить."
      type="danger"
      confirmText="Удалить"
      cancelText="Отмена"
      @confirm="confirmRemoveAction"
      @cancel="cancelRemoveAction"
    />

    <!-- Модалка подтверждения удаления типа события -->
    <ConfirmModal
      :isOpen="showRemoveActionTypeModal"
      :title="removeActionTypeError ? 'Удалить невозможно' : 'Удалить тип события?'"
      :message="removeActionTypeError ? removeActionTypeError : 'Вы уверены, что хотите удалить этот тип события? Это действие нельзя отменить.'"
      type="danger"
      confirmText="Удалить"
      cancelText="Отмена"
      :showConfirmButton="!removeActionTypeError"
      @confirm="confirmRemoveActionType"
      @cancel="cancelRemoveActionType"
    />

    <!-- Модалка управления типами событий КОМАНДЫ -->
    <template v-if="showTeamActionTypesModal">
      <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-5xl relative max-h-[90vh] overflow-y-auto">
          <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700" @click="showTeamActionTypesModal = false">✕</button>
          <h3 class="text-lg font-semibold mb-4">Типы событий для команд</h3>
          <!-- Форма добавления типа события -->
          <form @submit.prevent="addTeamActionType" class="flex flex-wrap gap-3 mb-6 items-end">
            <div class="flex flex-col">
              <label class="text-xs font-semibold mb-1">Название типа</label>
              <input v-model="newTeamActionType.name" type="text" class="border rounded px-2 py-1 w-40" required />
            </div>
            <div class="flex flex-col">
              <label class="text-xs font-semibold mb-1">
                <span class="flex items-center gap-1">
                  Иконка (iconify)
                  <a href="https://icon-sets.iconify.design/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800" title="Открыть Iconify">
                    <Icon icon="streamline-sharp:link-share-2-remix" class="w-4 h-4 align-middle" />
                  </a>
                </span>
              </label>
              <input v-model="newTeamActionType.icon" type="text" class="border rounded px-2 py-1 w-40" placeholder="mdi:star" />
            </div>
            <div class="flex flex-col">
              <label class="text-xs font-semibold mb-1">Краткое название</label>
              <input v-model="newTeamActionType.short_name" type="text" class="border rounded px-2 py-1 w-24" placeholder="Гол" />
            </div>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Добавить</button>
          </form>
          <!-- Таблица типов событий -->
          <div class="mb-4 flex items-center gap-2">
            <input v-model="teamActionTypesSearch" type="text" class="border rounded px-2 py-1 w-64" placeholder="Поиск по названию типа..." />
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full border text-sm">
              <thead>
                <tr class="bg-gray-100">
                  <th class="p-2 border">ID</th>
                  <th class="p-2 border">Название</th>
                  <th class="p-2 border">Кратко</th>
                  <th class="p-2 border">Иконка</th>
                  <th class="p-2 border">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="type in paginatedTeamActionTypesFiltered" :key="type.id">
                  <td class="p-2 border text-center">{{ type.id }}</td>
                  <td class="p-2 border">
                    <input v-model="type.name" @change="updateTeamActionType(type)" class="border rounded px-1 py-0.5 w-32" />
                  </td>
                  <td class="p-2 border">
                    <input v-model="type.short_name" @change="updateTeamActionType(type)" class="border rounded px-1 py-0.5 w-16" />
                  </td>
                  <td class="p-2 border">
                    <input v-model="type.icon" @change="updateTeamActionType(type)" class="border rounded px-1 py-0.5 w-24" />
                  </td>
                  <td class="p-2 border text-center">
                    <button @click="askRemoveTeamActionType(type)" class="text-red-500 hover:text-red-700" title="Удалить тип события">
                      <Icon icon="iconamoon:trash" class="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <!-- Пагинация -->
            <div class="flex justify-end items-center gap-2 mt-2">
              <button @click="prevTeamActionTypesPage" :disabled="teamActionTypesPage === 1" class="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50">Назад</button>
              <span>Стр. {{ teamActionTypesPage }} / {{ teamActionTypesTotalPages }}</span>
              <button @click="nextTeamActionTypesPage" :disabled="teamActionTypesPage === teamActionTypesTotalPages" class="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50">Вперёд</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Модалка подтверждения удаления события команды -->
    <ConfirmModal
      :isOpen="showRemoveTeamActionModal"
      title="Удалить событие команды?"
      message="Вы уверены, что хотите удалить это событие команды? Это действие нельзя отменить."
      type="danger"
      confirmText="Удалить"
      cancelText="Отмена"
      @confirm="confirmRemoveTeamAction"
      @cancel="cancelRemoveTeamAction"
    />

    <!-- Модалка подтверждения удаления типа события команды -->
    <ConfirmModal
      :isOpen="showRemoveTeamActionTypeModal"
      :title="removeTeamActionTypeError ? 'Удалить невозможно' : 'Удалить тип события команды?'"
      :message="removeTeamActionTypeError ? removeTeamActionTypeError : 'Вы уверены, что хотите удалить этот тип события команды? Это действие нельзя отменить.'"
      type="danger"
      confirmText="Удалить"
      cancelText="Отмена"
      :showConfirmButton="!removeTeamActionTypeError"
      @confirm="confirmRemoveTeamActionType"
      @cancel="cancelRemoveTeamActionType"
    />
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Draggable from 'vuedraggable'
import ConfirmModal from '~/components/ConfirmModal.vue'
import EventAdvancedEditor from '~/components/events/EventAdvancedEditor.vue'
import KirhSelect from '~/components/kirh/table/fields/KirhSelectField.vue'
import Head from '~/components/parts/Head.vue'
import { useApi } from '~/composables/useApi'

const route = useRoute()
const eventId = route.params.id
const eventData = ref(null)
const lineups = ref([])
const lineupsByClub = ref({})
const actions = ref([])
const actionTypes = ref([])

const showAddPlayerModal = ref(false)
const addPlayerClub = ref(null)
const manualPlayerName = ref('')
const manualPlayerNumber = ref('')

const showActionModal = ref(false)
const actionForm = ref({
  club: null,
  player_name: '',
  action_type_id: '',
  minute: '',
  value: ''
})

const clubs = computed(() => {
  if (eventData.value && eventData.value.club1 && eventData.value.club2) {
    return [eventData.value.club1, eventData.value.club2]
  }
  return []
})

// Обогащенные данные события для передачи в EventAdvancedEditor
const enrichedEventData = computed(() => {
  if (!eventData.value) return null;
  
  return {
    ...eventData.value,
    lineupsByClub: lineupsByClub.value,
    display_lineups_mode: displayLineupsMode.value,
    show_numbers_club1: eventData.value.show_numbers_club1,
    show_numbers_club2: eventData.value.show_numbers_club2,
    actions: actions.value,
    actionTypes: actionTypes.value
  };
})

// Функция для обновления данных события из EventAdvancedEditor
const updateEventData = (newEventData) => {
  eventData.value = newEventData;
};

const getLineupByClub = (clubId) => {
  return lineupsByClub.value[clubId] || []
}
const getActionsByClub = (clubId) => {
  return actions.value.filter(a => a.club_id === clubId)
}
const getActionTypeName = (typeId) => {
  const type = actionTypes.value.find(t => t.id === typeId)
  return type ? type.name : '—'
}

const openAddPlayerModal = (club) => {
  addPlayerClub.value = club
  manualPlayerName.value = ''
  manualPlayerNumber.value = ''
  showAddPlayerModal.value = true
}
const closeAddPlayerModal = () => {
  showAddPlayerModal.value = false
}
const addPlayerToLineup = async () => {
  if (!addPlayerClub.value) return
  // Найти выбранного игрока
  let selectedPlayer = null
  if (selectedPersonId.value) {
    selectedPlayer = clubPlayers.value.find(p => p.person_id === selectedPersonId.value || p.id === selectedPersonId.value)
  }
  // Определить номер: приоритет — ручной ввод, затем player_number из person
  let number = manualPlayerNumber.value || (selectedPlayer?.person?.player_number ?? null)
  let payload = {
    event_id: eventId,
    club_id: addPlayerClub.value.id,
    number,
    player_name: manualPlayerName.value,
    person_id: selectedPersonId.value || null
  }
  await apiRequest(`/events/${eventId}/lineups`, {
    method: 'POST',
    body: payload
  })
  await loadData()
  closeAddPlayerModal()
}
const updatePlayerNumber = async (player) => {
  await apiRequest(`/event-lineups/${player.id}`, {
    method: 'PUT',
    body: { number: player.number }
  })
}
const removePlayerFromLineup = async (player) => {
  await apiRequest(`/event-lineups/${player.id}`, { method: 'DELETE' })
  await loadData()
}

const openAddActionModalForClub = (club) => {
  actionForm.value = {
    club,
    player_name: '',
    action_type_id: '',
    minute: '',
    value: ''
  }
  showActionModal.value = true
}
const closeActionModal = () => {
  showActionModal.value = false
}
const saveAction = async () => {
  let minute = actionForm.value.minute
  if (minute === '' || minute === undefined || minute === null || isNaN(Number(minute))) minute = null
  let payload = {
    event_id: eventId,
    club_id: actionForm.value.club.id,
    player_name: actionForm.value.player_name,
    person_id: actionSelectedPersonId.value || null,
    action_type_id: actionForm.value.action_type_id,
    minute,
    value: actionForm.value.value || null
  }
  await apiRequest(`/events/${eventId}/actions`, {
    method: 'POST',
    body: payload
  })
  await loadData()
  closeActionModal()
}
const removeAction = async (action) => {
  await apiRequest(`/event-actions/${action.id}`, { method: 'DELETE' })
  await loadData()
}

const loadData = async () => {
  const eventRes = await apiRequest(`/events/${eventId}`)
  eventData.value = eventRes || null
  const lineupsRes = await apiRequest(`/events/${eventId}/lineups`)
  lineups.value = Array.isArray(lineupsRes) ? lineupsRes : (lineupsRes?.data || [])
  // После получения lineups в loadData добавляю построение дерева substitutions
  // Рекурсивно строит дерево substitutions для lineups
  function buildLineupTree(lineups) {
    const byId = Object.fromEntries(lineups.map(l => [l.id, { ...l }]));
    // Сначала очищаем substitutions
    Object.values(byId).forEach(l => { l.substitutions = []; });
    // Распределяем по parent_lineup_id
    Object.values(byId).forEach(l => {
      if (l.parent_lineup_id && byId[l.parent_lineup_id]) {
        byId[l.parent_lineup_id].substitutions.push(l);
      }
    });
    // Возвращаем только корневые (без parent_lineup_id)
    return Object.values(byId).filter(l => !l.parent_lineup_id);
  }
  // Синхронизируем lineupsByClub с деревом substitutions
  const byClub = {}
  for (const club of clubs.value) {
    const clubLineups = lineups.value.filter(l => l.club_id === club.id);
    byClub[club.id] = buildLineupTree(clubLineups).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }
  lineupsByClub.value = byClub
  const actionsRes = await apiRequest(`/events/${eventId}/actions`)
  actions.value = Array.isArray(actionsRes) ? actionsRes : (actionsRes?.data || [])
  // Сортируем по sort_order (и только по нему)
  actions.value.sort((a, b) => {
    if (a.sort_order == null && b.sort_order == null) return a.id - b.id
    if (a.sort_order == null) return 1
    if (b.sort_order == null) return -1
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
    return a.id - b.id
  })
  const typesRes = await apiRequest('/action-types')
  actionTypes.value = Array.isArray(typesRes) ? typesRes : (typesRes?.data || [])
}

const clubPlayers = ref([])
const actionClubPlayers = ref([])
const selectedPersonId = ref(null)
const actionSelectedPersonId = ref(null)

const displayLineupsMode = ref('column')

watch(eventData, (val) => {
  if (val && val.display_lineups_mode) {
    displayLineupsMode.value = val.display_lineups_mode
  }
})

const updateDisplayLineupsMode = async () => {
  if (!eventData.value) return
  await apiRequest(`/events/${eventId}`, {
    method: 'PATCH',
    body: { display_lineups_mode: displayLineupsMode.value }
  })
  eventData.value.display_lineups_mode = displayLineupsMode.value
}

// Drag-and-drop сортировка состава
const onLineupSortEnd = async (evt, clubId) => {
  // evt содержит { oldIndex, newIndex }
  // Новый порядок уже в lineupsByClub.value[clubId]
  const newLineup = lineupsByClub.value[clubId]
  for (let i = 0; i < newLineup.length; i++) {
    const player = newLineup[i]
    await apiRequest(`/event-lineups/${player.id}`, {
      method: 'PUT',
      body: { sort_order: i }
    })
  }
  // Не вызываем loadData, чтобы не сбрасывать локальный порядок
}

// Сортировка состава по номерам
const sortLineupByNumber = async (clubId) => {
  const arr = [...(lineupsByClub.value[clubId] || [])]
  arr.sort((a, b) => {
    if (a.number == null && b.number == null) return 0
    if (a.number == null) return 1
    if (b.number == null) return -1
    return a.number - b.number
  })
  // Сохраняем новый порядок
  for (let i = 0; i < arr.length; i++) {
    const player = arr[i]
    await apiRequest(`/event-lineups/${player.id}`, {
      method: 'PUT',
      body: { sort_order: i }
    })
  }
  // Обновляем локальный массив
  lineupsByClub.value[clubId] = arr
}

// Загрузка игроков клуба для модалки состава
const preparePlayerLabel = (arr) => {
  return arr.map(item => ({
    ...item,
    label: item.person?.short_name || item.player_name || ''
  }))
}
const loadClubPlayers = async (clubId) => {
  clubPlayers.value = []
  selectedPersonId.value = null
  if (!clubId) return
  try {
    const res = await apiRequest(`/clubs/${clubId}/players`)
    clubPlayers.value = preparePlayerLabel(Array.isArray(res) ? res : (res?.data || []))
  } catch (e) { clubPlayers.value = [] }
}
// Загрузка игроков клуба для модалки события
const loadActionClubPlayers = async (clubId) => {
  actionClubPlayers.value = []
  actionSelectedPersonId.value = null
  if (!clubId) return
  try {
    const res = await apiRequest(`/clubs/${clubId}/players`)
    actionClubPlayers.value = preparePlayerLabel(Array.isArray(res) ? res : (res?.data || []))
  } catch (e) { actionClubPlayers.value = [] }
}

// Следим за открытием модалки состава
watch([showAddPlayerModal, addPlayerClub], async ([show, club]) => {
  if (show && club?.id) {
    await loadClubPlayers(club.id)
    // После загрузки игроков клуба отмечаем тех, кто уже в составе
    const currentLineup = lineupsByClub.value[club.id] || []
    selectedPlayers.value = currentLineup
      .filter(p => p.person_id) // только реальные игроки
      .map(p => p.person_id)
    // Восстанавливаем вручную добавленных игроков
    manualPlayers.value = currentLineup
      .filter(p => !p.person_id)
      .map(p => ({ label: p.player_name, number: p.number }))
  }
})
// Следим за открытием модалки события
watch(() => actionForm.value.club, (club) => {
  if (showActionModal.value && club?.id) loadActionClubPlayers(club.id)
})

// Для формы замены
const showSubFormFor = ref(null)
const subPersonId = ref(null)
const subPlayerName = ref('')
const subMinuteIn = ref('')
const subMinuteOut = ref('')
const subError = ref('')

const openSubForm = (playerOrSub) => {
  showSubFormFor.value = playerOrSub.id
  subPersonId.value = null
  subPlayerName.value = ''
  subMinuteIn.value = ''
  subMinuteOut.value = ''
  // Загружаем игроков клуба для выбора
  loadClubPlayers(playerOrSub.club_id)
}
const closeSubForm = () => {
  showSubFormFor.value = null
}
const addSubstitution = async (parentPlayer) => {
  let selectedPlayer = null
  if (subPersonId.value) {
    selectedPlayer = clubPlayers.value.find(p => p.person_id === subPersonId.value || p.id === subPersonId.value)
  }
  const clubLineup = lineupsByClub.value[parentPlayer.club_id] || [];
  let isAlreadyInLineup = false;
  if (selectedPlayer && selectedPlayer.person_id) {
    // Проверка только по id для игроков из списка
    isAlreadyInLineup = clubLineup.some(p =>
      (p.person_id && p.person_id === selectedPlayer.person_id) ||
      (Array.isArray(p.substitutions) && p.substitutions.some(sub => sub.person_id && sub.person_id === selectedPlayer.person_id))
    );
  } else if (!selectedPlayer || !selectedPlayer.person) {
    // Ручной ввод — сравниваем только по имени и номеру среди ручных
    isAlreadyInLineup = clubLineup.some(p =>
      (!p.person_id && p.player_name === subPlayerName.value && Number(p.number || null) === Number(subPlayerNumber.value || null)) ||
      (Array.isArray(p.substitutions) && p.substitutions.some(sub => !sub.person_id && sub.player_name === subPlayerName.value && Number(sub.number || null) === Number(subPlayerNumber.value || null)))
    );
  }
  if ((selectedPlayer && selectedPlayer.person_id && isAlreadyInLineup) || ((!selectedPlayer || !selectedPlayer.person) && isAlreadyInLineup)) {
    subError.value = 'Этот игрок уже есть в составе или среди замен!';
    return;
  }
  subError.value = '';
  let number = selectedPlayer?.person?.player_number ?? null
  let payload = {
    event_id: eventId,
    club_id: parentPlayer.club_id,
    person_id: subPersonId.value || null,
    number,
    parent_lineup_id: parentPlayer.id,
    minute_in: subMinuteIn.value || null
  }
  if (!selectedPlayer || !selectedPlayer.person) {
    payload.player_name = subPlayerName.value
  }
  await apiRequest(`/events/${eventId}/lineups`, {
    method: 'POST',
    body: payload
  })
  await loadData()
  closeSubForm()
}

const updateSubMinuteIn = async (sub) => {
  await apiRequest(`/event-lineups/${sub.id}`, {
    method: 'PUT',
    body: { minute_in: sub.minute_in }
  })
}

const getAvailableSubPlayers = (clubId) => {
  const clubLineup = lineupsByClub.value[clubId] || [];
  const usedPersonIds = new Set();
  clubLineup.forEach(p => {
    if (p.person_id) usedPersonIds.add(p.person_id);
    if (Array.isArray(p.substitutions)) {
      p.substitutions.forEach(sub => {
        if (sub.person_id) usedPersonIds.add(sub.person_id);
      });
    }
  });
  return clubPlayers.value
    .filter(p => !usedPersonIds.has(p.person_id))
    .sort((a, b) => (a.label || '').localeCompare(b.label || '', 'ru'));
}

// canShowSubButton теперь использует isLineupPlayerReplaced
function canShowSubButton(player, clubId) {
  return !isLineupPlayerReplaced(player, clubId)
}

const getPlayerColor = (club) => {
  // Первый клуб — хозяева (синий), второй — гости (красный)
  if (!clubs.value.length) return '';
  if (club.id === clubs.value[0]?.id) return 'text-blue-400';
  if (club.id === clubs.value[1]?.id) return 'text-red-400';
  return '';
};

const getShowNumbers = (club) => {
  if (!eventData.value) return true;
  if (club.id === eventData.value.club1?.id) return eventData.value.show_numbers_club1 !== false;
  if (club.id === eventData.value.club2?.id) return eventData.value.show_numbers_club2 !== false;
  return true;
};

const toggleShowNumbers = async (club) => {
  if (!eventData.value) return;
  let field = null;
  if (club.id === eventData.value.club1?.id) field = 'show_numbers_club1';
  if (club.id === eventData.value.club2?.id) field = 'show_numbers_club2';
  if (!field) return;
  const newValue = !(eventData.value[field] !== false);
  await apiRequest(`/events/${eventId}`, {
    method: 'PATCH',
    body: { [field]: !!newValue }
  });
  eventData.value[field] = newValue;
};

// --- Модалка подтверждения удаления игрока ---
const showRemovePlayerModal = ref(false)
const playerToRemove = ref(null)
const askRemovePlayer = (player) => {
  playerToRemove.value = player
  showRemovePlayerModal.value = true
}
const confirmRemovePlayer = async () => {
  if (playerToRemove.value) {
    await removePlayerFromLineup(playerToRemove.value)
    playerToRemove.value = null
    showRemovePlayerModal.value = false
  }
}
const cancelRemovePlayer = () => {
  playerToRemove.value = null
  showRemovePlayerModal.value = false
}

// --- Для модалки выбора состава ---
const selectedPlayers = ref([]) // id выбранных игроков
const manualPlayers = ref([]) // вручную добавленные [{label, number}]
const manualPlayerError = ref('')
const addManualSuccess = ref('')

const addManualPlayer = () => {
  if (!manualPlayerName.value) {
    manualPlayerError.value = 'Введите ФИО игрока';
    return;
  }
  // Проверка уникальности по номеру среди person_id == null
  const clubId = addPlayerClub.value?.id
  if (clubId && lineupsByClub.value[clubId]) {
    const allLineups = flattenLineups(lineupsByClub.value[clubId])
    if (manualPlayerNumber.value) {
      const duplicate = allLineups.some(l => !l.person_id && Number(l.number || null) === Number(manualPlayerNumber.value))
      if (duplicate) {
        manualPlayerError.value = 'Игрок с таким номером уже добавлен вручную!';
        return;
      }
    }
  }
  // Проверка локальной уникальности в manualPlayers
  const duplicateLocal = manualPlayers.value.some(mp => mp.label === manualPlayerName.value && Number(mp.number || null) === Number(manualPlayerNumber.value || null))
  if (duplicateLocal) {
    manualPlayerError.value = 'Такой игрок уже добавлен в список!';
    return;
  }
  manualPlayers.value.push({
    label: manualPlayerName.value,
    number: manualPlayerNumber.value ? Number(manualPlayerNumber.value) : null
  })
  addManualSuccess.value = `В состав добавлен: ${manualPlayerName.value}${manualPlayerNumber.value ? ' (' + manualPlayerNumber.value + ')' : ''}`
  manualPlayerName.value = ''
  manualPlayerNumber.value = ''
  manualPlayerError.value = ''
}
const removeManualPlayer = (idx) => {
  manualPlayers.value.splice(idx, 1)
}

// --- state для редактирования вручную добавленного игрока ---
const showEditManualModal = ref(false)
const editManualIdx = ref(null)
const editManualName = ref('')
const editManualNumber = ref('')

function openEditManualPlayer(idx) {
  editManualIdx.value = idx
  editManualName.value = manualPlayers.value[idx].label
  editManualNumber.value = manualPlayers.value[idx].number
  showEditManualModal.value = true
}
function closeEditManualModal() {
  showEditManualModal.value = false
  editManualIdx.value = null
  editManualName.value = ''
  editManualNumber.value = ''
}
function saveEditManualPlayer() {
  if (editManualIdx.value !== null) {
    manualPlayers.value[editManualIdx.value].label = editManualName.value
    manualPlayers.value[editManualIdx.value].number = editManualNumber.value
  }
  closeEditManualModal()
}

const showAddManualModal = ref(false)
function openAddManualModal() {
  showAddManualModal.value = true
}
function closeAddManualModal() {
  showAddManualModal.value = false
  manualPlayerName.value = ''
  manualPlayerNumber.value = ''
  manualPlayerError.value = ''
  addManualSuccess.value = ''
}

const addSelectedPlayersToLineup = async () => {
  if (!addPlayerClub.value) return
  // 1. Добавить выбранных из списка (только уникальные person_id)
  const uniquePersonIds = Array.from(new Set(selectedPlayers.value))
  // Получаем уже существующие person_id в составе клуба
  const currentLineup = lineupsByClub.value[addPlayerClub.value.id] || []
  const existingPersonIds = new Set(currentLineup.map(p => p.person_id).filter(Boolean))
  // Оставляем только тех, кого ещё нет в составе
  const toAdd = uniquePersonIds.filter(pid => !existingPersonIds.has(pid))
  for (const personId of toAdd) {
    const player = clubPlayers.value.find(p => p.id === personId || p.person_id === personId)
    // Если у игрока есть person_id — это реальный игрок
    if (player && player.person_id) {
      let number = player.person?.player_number ?? null
      await apiRequest(`/events/${eventId}/lineups`, {
        method: 'POST',
        body: {
          event_id: eventId,
          club_id: addPlayerClub.value.id,
          number,
          person_id: player.person_id
        }
      })
    }
  }
  // 1.1. Удалить тех, кто был, но снят (есть в составе, но нет в selectedPlayers)
  const toRemove = currentLineup
    .filter(p => p.person_id && !uniquePersonIds.includes(p.person_id))
    .map(p => p.id)
  for (const lineupId of toRemove) {
    await apiRequest(`/event-lineups/${lineupId}`, { method: 'DELETE' })
  }
  // 1.2. Удалить вручную добавленных, которых нет в manualPlayers
  const manualToRemove = currentLineup
    .filter(p => !p.person_id)
    .filter(p => !manualPlayers.value.some(mp => mp.label === p.player_name && Number(mp.number || null) === Number(p.number || null)))
    .map(p => p.id)
  for (const lineupId of manualToRemove) {
    await apiRequest(`/event-lineups/${lineupId}`, { method: 'DELETE' })
  }
  // 2. Добавить вручную введённых
  for (const mp of manualPlayers.value) {
    const alreadyExists = currentLineup.some(p => !p.person_id && p.player_name === mp.label && Number(p.number || null) === Number(mp.number || null))
    if (alreadyExists) continue
    await apiRequest(`/events/${eventId}/lineups`, {
      method: 'POST',
      body: {
        event_id: eventId,
        club_id: addPlayerClub.value.id,
        number: mp.number,
        player_name: mp.label,
        person_id: null
      }
    })
  }
  await loadData()
  closeAddPlayerModal()
  selectedPlayers.value = []
  manualPlayers.value = []
}

onMounted(loadData)

// Сортировка игроков по алфавиту
const sortedClubPlayers = computed(() => {
  return [...clubPlayers.value].sort((a, b) => (a.label || '').localeCompare(b.label || '', 'ru'))
})

// --- функция для получения плоского массива всех строк состава (включая substitutions) ---
function flattenLineups(lineups) {
  const result = []
  function walk(arr) {
    for (const l of arr) {
      result.push(l)
      if (Array.isArray(l.substitutions) && l.substitutions.length) {
        walk(l.substitutions)
      }
    }
  }
  walk(lineups)
  return result
}
// --- функция для блокировки строки игрока в модалке ---
function isPlayerLocked(player) {
  // 1. Заменён: ищем строку состава по person_id среди всех строк, затем ищем среди всех строк строку с parent_lineup_id равной id этой строки
  const clubId = addPlayerClub.value?.id
  let replaced = false
  if (clubId && lineupsByClub.value[clubId]) {
    const allLineups = flattenLineups(lineupsByClub.value[clubId])
    const playerLineup = allLineups.find(l => l.person_id === player.person_id)
    // Если игрок сам вышел на замену (есть parent_lineup_id) — блокируем
    if (playerLineup && playerLineup.parent_lineup_id) return true
    if (playerLineup) {
      replaced = allLineups.some(l => l.parent_lineup_id === playerLineup.id)
    }
  }
  // 2. Есть событие: actions.value содержит action с person_id === player.person_id
  const hasEvent = !!actions.value.find(a => a.person_id && player.person_id && a.person_id === player.person_id)
  return replaced || hasEvent
}

// --- функция для проверки, заменён ли игрок в составе (для строки состава) ---
function isLineupPlayerReplaced(player, clubId) {
  if (!player || !player.id || !clubId || !lineupsByClub.value[clubId]) return false
  const allLineups = flattenLineups(lineupsByClub.value[clubId])
  return allLineups.some(l => l.parent_lineup_id === player.id)
}

// --- state для табов состава ---
const activeLineupTab = ref(0) // 0 — первая команда, 1 — вторая

const toggleCaptain = async (player) => {
  if (!player || !player.id) return;
  const newValue = !player.is_captain;
  await apiRequest(`/event-lineups/${player.id}`, {
    method: 'PUT',
    body: { is_captain: newValue }
  });
  player.is_captain = newValue;
};

const showActionTypesModal = ref(false)

// --- State для типов событий ---
const newActionType = ref({ name: '', icon: '', color: '', group: 1, short_name: '', points: 0 })
const actionTypesList = ref([])
const actionTypesPage = ref(1)
const ACTION_TYPES_PER_PAGE = 10
const actionTypesTotalPages = computed(() => Math.max(1, Math.ceil(actionTypesList.value.length / ACTION_TYPES_PER_PAGE)))
const filteredActionTypes = computed(() => {
  if (!actionTypesSearch.value) return actionTypesList.value;
  return actionTypesList.value.filter(type =>
    (type.name || '').toLowerCase().includes(actionTypesSearch.value.toLowerCase())
  );
});
const paginatedActionTypesFiltered = computed(() => {
  const start = (actionTypesPage.value - 1) * ACTION_TYPES_PER_PAGE;
  return filteredActionTypes.value.slice(start, start + ACTION_TYPES_PER_PAGE);
});

const { apiRequest } = useApi()

async function loadActionTypes() {
  const res = await apiRequest('/action-types')
  actionTypesList.value = Array.isArray(res) ? res : (res?.data || [])
  actionTypesPage.value = 1
}

watch(showActionTypesModal, (val) => {
  if (val) loadActionTypes()
})

async function addActionType() {
  if (!newActionType.value.name) return
  const payload = { ...newActionType.value }
  payload.group = String(payload.group)
  const res = await apiRequest('/action-types', { method: 'POST', body: payload })
  if (res && res.id) {
    actionTypesList.value.unshift(res)
    // Сброс формы
    newActionType.value = { name: '', icon: '', color: '', group: 1, short_name: '', points: 0 }
    actionTypesPage.value = 1
  }
}

async function updateActionType(type) {
  if (!type.id) return
  const payload = { ...type }
  payload.group = String(payload.group)
  const res = await apiRequest(`/action-types/${type.id}`, { method: 'PUT', body: payload })
  if (res && res.id) {
    // Обновляем локально
    const idx = actionTypesList.value.findIndex(t => t.id === res.id)
    if (idx !== -1) actionTypesList.value[idx] = { ...res }
  }
}

async function deleteActionType(type) {
  if (!type.id) return
  await apiRequest(`/action-types/${type.id}`, { method: 'DELETE' })
  actionTypesList.value = actionTypesList.value.filter(t => t.id !== type.id)
  // Корректируем страницу, если удалили последнюю запись на странице
  if ((actionTypesPage.value - 1) * ACTION_TYPES_PER_PAGE >= filteredActionTypes.value.length && actionTypesPage.value > 1) {
    actionTypesPage.value--
  }
}

function prevActionTypesPage() {
  if (actionTypesPage.value > 1) actionTypesPage.value--
}
function nextActionTypesPage() {
  if (actionTypesPage.value < actionTypesTotalPages.value) actionTypesPage.value++
}

const actionTypesSearch = ref("");

const actionTypeOptions = computed(() => {
  return actionTypes.value.map(type => ({
    id: type.id,
    name: type.name,
    group: type.group,
    icon: type.icon // добавлено поле для отображения иконки
  }))
})

const selectedActionGroup = ref('all')

const filteredActionTypeOptions = computed(() => {
  if (selectedActionGroup.value === 'all') {
    return actionTypeOptions.value
  }
  return actionTypeOptions.value.filter(type => String(type.group) === String(selectedActionGroup.value))
})

// --- Редактирование минуты события ---
const editingMinuteId = ref(null)
const editingMinuteValue = ref('')
const minuteInputRef = ref(null)

function startEditMinute(action) {
  editingMinuteId.value = action.id
  editingMinuteValue.value = action.minute
  nextTick(() => {
    if (minuteInputRef.value) {
      if (Array.isArray(minuteInputRef.value)) minuteInputRef.value[0]?.focus()
      else minuteInputRef.value.focus()
    }
  })
}
async function saveEditMinute(action) {
  if (editingMinuteId.value !== action.id) return
  let newMinute = editingMinuteValue.value
  if (newMinute === '' || newMinute === undefined || newMinute === null || isNaN(Number(newMinute))) newMinute = null
  if (String(newMinute) !== String(action.minute)) {
    await apiRequest(`/event-actions/${action.id}`, {
      method: 'PUT',
      body: { minute: newMinute }
    })
    await loadData()
  }
  editingMinuteId.value = null
  editingMinuteValue.value = ''
}
function cancelEditMinute() {
  editingMinuteId.value = null
  editingMinuteValue.value = ''
}

// Получить объект типа события по id
function getActionTypeObj(typeId) {
  return actionTypes.value.find(t => t.id === typeId)
}

// --- Расчет и сохранение счета по голам ---
async function calculateAndSaveScores() {
  // Получаем id типа события "Гол" (group === 1)
  const goalTypeIds = actionTypes.value.filter(t => String(t.group) === '1').map(t => t.id)
  // Копируем и сортируем события-голы по sort_order (и только по нему)
  const goalActions = [...actions.value]
    .filter(a => goalTypeIds.includes(a.action_type_id))
    .sort((a, b) => {
      if (a.sort_order == null && b.sort_order == null) return a.id - b.id
      if (a.sort_order == null) return 1
      if (b.sort_order == null) return -1
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
      return a.id - b.id
    })
  let club1 = 0, club2 = 0
  for (const action of goalActions) {
    if (action.club_id === clubs.value[0]?.id) club1++
    else if (action.club_id === clubs.value[1]?.id) club2++
    const scoreStr = `${club1}:${club2}`
    // Обновляем поле score на сервере
    await apiRequest(`/event-actions/${action.id}`, {
      method: 'PUT',
      body: { score: scoreStr }
    })
  }
  // После обновления перезагружаем события
  await loadData()
}

// Drag-and-drop сортировка событий
const onActionsSortEnd = async (evt) => {
  // Новый порядок уже в actions.value
  for (let i = 0; i < actions.value.length; i++) {
    const action = actions.value[i]
    await apiRequest(`/event-actions/${action.id}`, {
      method: 'PUT',
      body: { sort_order: i }
    })
  }
  await loadData()
}

// Сортировка событий по минутам с обновлением sort_order
async function sortActionsByMinute() {
  const sorted = [...actions.value].sort((a, b) => {
    if (a.minute == null && b.minute == null) return a.id - b.id
    if (a.minute == null) return 1
    if (b.minute == null) return -1
    if (a.minute !== b.minute) return a.minute - b.minute
    return a.id - b.id
  })
  for (let i = 0; i < sorted.length; i++) {
    const action = sorted[i]
    await apiRequest(`/event-actions/${action.id}`, {
      method: 'PUT',
      body: { sort_order: i }
    })
  }
  await loadData()
}

// --- state для подтверждения удаления события ---
const showRemoveActionModal = ref(false)
const actionToRemove = ref(null)

// --- функция для открытия модалки подтверждения удаления события ---
function askRemoveAction(action) {
  actionToRemove.value = action
  showRemoveActionModal.value = true
}
async function confirmRemoveAction() {
  if (actionToRemove.value) {
    await removeAction(actionToRemove.value)
    actionToRemove.value = null
    showRemoveActionModal.value = false
  }
}
function cancelRemoveAction() {
  actionToRemove.value = null
  showRemoveActionModal.value = false
}

const showRemoveActionTypeModal = ref(false)
const actionTypeToRemove = ref(null)
const removeActionTypeError = ref('')

function askRemoveActionType(type) {
  actionTypeToRemove.value = type
  removeActionTypeError.value = ''
  // Проверяем, используется ли тип в actions
  if (actions.value.some(a => a.action_type_id === type.id)) {
    removeActionTypeError.value = 'Нельзя удалить: тип используется в событиях матча.'
  }
  showRemoveActionTypeModal.value = true
}
async function confirmRemoveActionType() {
  if (!actionTypeToRemove.value || removeActionTypeError.value) {
    showRemoveActionTypeModal.value = false
    actionTypeToRemove.value = null
    return
  }
  await deleteActionType(actionTypeToRemove.value)
  showRemoveActionTypeModal.value = false
  actionTypeToRemove.value = null
}
function cancelRemoveActionType() {
  showRemoveActionTypeModal.value = false
  actionTypeToRemove.value = null
  removeActionTypeError.value = ''
}

const activeEventTab = ref(0)

// --- События команд ---
const teamActionTypes = ref([])
const teamActions = ref([])
const teamActionTypeOptions = computed(() => teamActionTypes.value.map(t => ({
  id: t.id,
  name: t.name,
  icon: t.icon,
  short_name: t.short_name
})))
const newTeamAction = ref({
  team_action_type_id: '',
  value_home: '',
  value_away: ''
})
const loadingTeamActions = ref(false)
const loadingTeamActionTypes = ref(false)

async function loadTeamActionTypes() {
  loadingTeamActionTypes.value = true
  try {
    const res = await apiRequest('/team-action-types')
    teamActionTypes.value = Array.isArray(res) ? res : (res?.data || [])
  } finally {
    loadingTeamActionTypes.value = false
  }
}
async function loadTeamActions() {
  loadingTeamActions.value = true
  try {
    const res = await apiRequest(`/event-team-actions?event_id=${eventId}`)
    teamActions.value = Array.isArray(res) ? res : (res?.data || [])
  } finally {
    loadingTeamActions.value = false
  }
}
async function addTeamAction() {
  if (!newTeamAction.value.team_action_type_id) return
  await apiRequest('/event-team-actions', {
    method: 'POST',
    body: {
      event_id: eventId,
      team_action_type_id: newTeamAction.value.team_action_type_id,
      value_home: Number(newTeamAction.value.value_home) || 0,
      value_away: Number(newTeamAction.value.value_away) || 0
    }
  })
  newTeamAction.value = { team_action_type_id: '', value_home: '', value_away: '' }
  await loadTeamActions()
}
async function updateTeamActionValue(action, field, value) {
  await apiRequest(`/event-team-actions/${action.id}`, {
    method: 'PUT',
    body: { [field]: Number(value) || 0 }
  })
  await loadTeamActions()
}
async function deleteTeamAction(action) {
  await apiRequest(`/event-team-actions/${action.id}`, { method: 'DELETE' })
  await loadTeamActions()
}

onMounted(() => {
  loadTeamActionTypes()
  loadTeamActions()
})

const showTeamActionTypesModal = ref(false)
const newTeamActionType = ref({ name: '', icon: '', short_name: '' })
const teamActionTypesList = ref([])
const teamActionTypesPage = ref(1)
const TEAM_ACTION_TYPES_PER_PAGE = 10
const teamActionTypesSearch = ref('')
const teamActionTypesTotalPages = computed(() => Math.max(1, Math.ceil(filteredTeamActionTypes.value.length / TEAM_ACTION_TYPES_PER_PAGE)))
const filteredTeamActionTypes = computed(() => {
  if (!teamActionTypesSearch.value) return teamActionTypesList.value
  return teamActionTypesList.value.filter(type => (type.name || '').toLowerCase().includes(teamActionTypesSearch.value.toLowerCase()))
})
const paginatedTeamActionTypesFiltered = computed(() => {
  const start = (teamActionTypesPage.value - 1) * TEAM_ACTION_TYPES_PER_PAGE
  return filteredTeamActionTypes.value.slice(start, start + TEAM_ACTION_TYPES_PER_PAGE)
})
async function loadTeamActionTypesForModal() {
  const res = await apiRequest('/team-action-types')
  teamActionTypesList.value = Array.isArray(res) ? res : (res?.data || [])
  teamActionTypesPage.value = 1
}
watch(showTeamActionTypesModal, (val) => { if (val) loadTeamActionTypesForModal() })
async function addTeamActionType() {
  if (!newTeamActionType.value.name) return
  const payload = { ...newTeamActionType.value }
  const res = await apiRequest('/team-action-types', { method: 'POST', body: payload })
  if (res && res.id) {
    teamActionTypesList.value.unshift(res)
    newTeamActionType.value = { name: '', icon: '', short_name: '' }
    teamActionTypesPage.value = 1
    await loadTeamActionTypes() // обновляем селект
  }
}
async function updateTeamActionType(type) {
  if (!type.id) return
  const payload = { ...type }
  const res = await apiRequest(`/team-action-types/${type.id}`, { method: 'PUT', body: payload })
  if (res && res.id) {
    const idx = teamActionTypesList.value.findIndex(t => t.id === res.id)
    if (idx !== -1) teamActionTypesList.value[idx] = { ...res }
  }
}
async function deleteTeamActionType(type) {
  if (!type.id) return
  await apiRequest(`/team-action-types/${type.id}`, { method: 'DELETE' })
  teamActionTypesList.value = teamActionTypesList.value.filter(t => t.id !== type.id)
  if ((teamActionTypesPage.value - 1) * TEAM_ACTION_TYPES_PER_PAGE >= filteredTeamActionTypes.value.length && teamActionTypesPage.value > 1) {
    teamActionTypesPage.value--
  }
}
function prevTeamActionTypesPage() { if (teamActionTypesPage.value > 1) teamActionTypesPage.value-- }
function nextTeamActionTypesPage() { if (teamActionTypesPage.value < teamActionTypesTotalPages.value) teamActionTypesPage.value++ }

// --- state для подтверждения удаления события команды ---
const showRemoveTeamActionModal = ref(false)
const teamActionToRemove = ref(null)
function askRemoveTeamAction(action) {
  teamActionToRemove.value = action
  showRemoveTeamActionModal.value = true
}
async function confirmRemoveTeamAction() {
  if (teamActionToRemove.value) {
    await deleteTeamAction(teamActionToRemove.value)
    teamActionToRemove.value = null
    showRemoveTeamActionModal.value = false
  }
}
function cancelRemoveTeamAction() {
  teamActionToRemove.value = null
  showRemoveTeamActionModal.value = false
}
// --- state для подтверждения удаления типа события команды ---
const showRemoveTeamActionTypeModal = ref(false)
const teamActionTypeToRemove = ref(null)
const removeTeamActionTypeError = ref('')
function askRemoveTeamActionType(type) {
  teamActionTypeToRemove.value = type
  removeTeamActionTypeError.value = ''
  // Проверяем, используется ли тип в событиях команд
  if (teamActions.value.some(a => a.team_action_type_id === type.id)) {
    removeTeamActionTypeError.value = 'Нельзя удалить: тип используется в событиях команд.'
  }
  showRemoveTeamActionTypeModal.value = true
}
async function confirmRemoveTeamActionType() {
  if (!teamActionTypeToRemove.value || removeTeamActionTypeError.value) {
    showRemoveTeamActionTypeModal.value = false
    teamActionTypeToRemove.value = null
    return
  }
  await deleteTeamActionType(teamActionTypeToRemove.value)
  showRemoveTeamActionTypeModal.value = false
  teamActionTypeToRemove.value = null
}
function cancelRemoveTeamActionType() {
  showRemoveTeamActionTypeModal.value = false
  teamActionTypeToRemove.value = null
  removeTeamActionTypeError.value = ''
}

// --- breadcrumbs аналогично clubs/[id].vue ---
const breadcrumbs = computed(() => [
  { id: 1, title: 'События', slug: 'events', icon: 'mdi:calendar' },
].filter(Boolean))

const activeMainTab = ref(0)

</script>

<style scoped>
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
}
.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: .3s;
  border-radius: 9999px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.toggle-switch input:checked + .slider {
  background-color: #2563eb;
}
.toggle-switch input:checked + .slider:before {
  transform: translateX(16px);
}

/* Кастомный зеленый тумблер */
.custom-switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
}
.slider-green {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1fae5;
  transition: .3s;
  border-radius: 9999px;
}
.custom-switch input:checked + .slider-green {
  background-color: #22c55e;
}
.slider-green:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.custom-switch input:checked + .slider-green:before {
  transform: translateX(16px);
}
.captain-icon {
  font-weight: bold;
  color: #d1d5db;
  margin-right: 4px;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;
  font-size: 1.5em;
  width: 1.5em;
  height: 1.5em;
  min-width: 1.5em;
  min-height: 1.5em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.captain-icon.captain-active {
  color: #ef4444;
}
.tab-btn {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem 1rem 0 0;
  font-size: 1.125rem;
  font-weight: bold;
  border: 2px solid transparent;
  border-bottom-width: 0;
  min-width: 200px;
  transition: all 0.2s;
  cursor: pointer;
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

.tab-content-staff {
  background: #fffbe6;
  border-color: #facc15;
}
</style>
