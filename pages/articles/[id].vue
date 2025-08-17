<template>
  <div v-if="isAuthenticated" class="min-h-full text-gray-900">
    <header class="bg-gray-50 shadow-sm border-b border-gray-300">
      <div class="px-6 pt-4">
        <div class="flex items-start justify-between">
          <Head :breadcrumbs="breadcrumbs" :icon="p_icon" :title="p_description" show_breadcrumbs="true"/>
        </div>
      </div>
    </header>

    <div class="p-6">
      <div v-if="loading" class="flex items-center justify-center py-8">
        <img src="/ldr.png" class="loader-image" alt="Loading...">
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Ошибка загрузки</h3>
            <div class="mt-2 text-sm text-red-700">{{ error }}</div>
          </div>
        </div>
      </div>

      <div v-else-if="article" class="w-full mx-auto">
        <form @submit.prevent="saveArticle" class="space-y-6">
          <!-- Основная информация -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-xl font-semibold text-gray-900">Редактирование статьи</h1>
                <p class="text-sm text-gray-600 mt-1">
                  ID: {{ article?.id || route.params.id }}
                  <span v-if="article?.slug" class="ml-2">
                    | 
                    <a 
                      :href="site + '/news/' + article.slug" 
                      target="_blank" 
                      class="text-blue-600 hover:text-blue-800 underline"
                    >
                      Посмотреть на сайте
                    </a>
                  </span>
                </p>
              </div>
              <div class="flex space-x-3">
                <NuxtLink 
                  to="/articles" 
                  class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Отмена
                </NuxtLink>
                <button 
                  @click="saveArticle" 
                  :disabled="saving"
                  class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {{ saving ? 'Сохранение...' : 'Сохранить' }}
                </button>
              </div>
            </div>
          </div>

            <div class="p-6">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Левая колонка - Основные поля (2/3) -->
                <div class="lg:col-span-2 space-y-6">
                  <!-- Первая строка: Дата, Регион, Активность -->
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- Дата -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Дата *</label>
                      <input 
                        v-model="formData.data" 
                        type="datetime-local" 
                        required
                        class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

            <!-- Регион -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Регион</label>
                      <KirhSelectField
                v-model="formData.region_id" 
                        :api-url="`${api}/api/regions?type=async`"
                        :key-field="'id'"
                        :label-field="'title_short'"
                        :placeholder="'Выберите регион'"
                        :enable-search="true"
                        :limit="50"
                        :emptyable="true"
                        :empty-option="emptyRegionOption"
                        :default-value="formData.region_id"
                        sel-class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 !text-gray-900"
                        options-list="option-list-default"
                        list-item="option"
                      />
                    </div>

                    <!-- Индикатор активности -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                      <div class="flex items-center h-12">
                        <label class="flex items-center">
                          <input 
                            v-model="formData.published" 
                            type="checkbox" 
                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span class="ml-2 text-sm text-gray-700">Опубликовано</span>
                        </label>
                      </div>
                    </div>
            </div>

            <!-- Заголовок -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Заголовок *</label>
              <input 
                v-model="formData.title" 
                type="text" 
                required
                class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                placeholder="Введите заголовок статьи"
              />
            </div>

            <!-- Слаг -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Слаг *</label>
              <input 
                v-model="formData.slug" 
                type="text" 
                required
                class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите слаг"
              />
            </div>

                  <!-- Описание с RichTextEditor -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Описание *</label>
                    <div class="border border-gray-300 rounded-md overflow-hidden">
                      <RichTextEditor
                v-model="formData.description" 
                        :placeholder="'Введите краткое описание статьи...'"
                        :upload-options="{
                          url: `${api}/api/articles/${route.params.id}/upload-image`,
                          maxWidth: 1200,
                          quality: 0.8
                        }"
                      />
                    </div>
            </div>

                  <!-- Содержание с RichTextEditor -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Содержание статьи *</label>
                    <div class="border border-gray-300 rounded-md overflow-hidden">
                      <RichTextEditor
                        v-model="formData.content" 
                        :placeholder="'Введите содержание статьи...'"
                        :upload-options="{
                          url: `${api}/api/articles/${route.params.id}/upload-image`,
                          maxWidth: 1200,
                          quality: 0.8
                        }"
                      />
                    </div>
                  </div>

                  <!-- Фотоинфо -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Информация о фото:</label>
                    <div class="border border-gray-300 rounded-md overflow-hidden">
                      <RichTextEditor
                        v-model="formData.photo_info" 
                        :placeholder="'Введите информацию о фото...'"
                      />
                    </div>
                  </div>

                </div>

                <!-- Правая колонка - Отношения (1/3) -->
                <div class="lg:col-span-1 space-y-6">
                  <!-- Изображение статьи -->
                  <div class="bg-gray-50 rounded-lg p-4">
                    <h3 class="text-lg font-medium text-gray-900 mb-3">Изображение статьи</h3>
                    
                    <!-- Текущее изображение -->
                    <div v-if="article?.article_image_path" class="mb-4">
                      <img 
                        :src="article.article_image_path" 
                        alt="Изображение статьи"
                        class="w-full h-80 object-cover rounded-lg border border-gray-300"
                      />
                      <div class="mt-2 flex gap-2">
                        <button
                          @click="() => { imageInputReplace?.click() }"
                          type="button"
                          class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          Заменить изображение
                        </button>
                        <button
                          @click="showUrlInput = true"
                          type="button"
                          class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          Вставить URL
                        </button>
                        <button
                          @click="deleteArticleImage"
                          type="button"
                          class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                        >
                          Удалить изображение
                        </button>
                      </div>
                    </div>
                    
                    <!-- Поле загрузки -->
                    <div v-if="!article?.article_image_path" class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <div class="mb-4">
                        <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </div>
                      <div class="text-sm text-gray-600 mb-4">
                        <label for="article-image" class="cursor-pointer">
                          <span class="font-medium text-blue-600 hover:text-blue-500">
                            Нажмите для загрузки
                          </span>
                          или перетащите изображение
                        </label>
                        <input
                          id="article-image"
                          ref="imageInput"
                          type="file"
                          accept="image/*"
                          class="hidden"
                          @change="handleImageUpload"
                        />
                      </div>
                      <div class="flex gap-2 justify-center">
                        <button
                          @click="showUrlInput = true"
                          type="button"
                          class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          Вставить URL
                        </button>
                      </div>
                      <p class="text-xs text-gray-500 mt-2">
                        PNG, JPG, GIF до 10MB (автоматически оптимизируется до 800x500px, макс. 2MB)
                      </p>
                    </div>
                    
                    <!-- Скрытый input для замены изображения -->
                    <input
                      id="article-image-replace"
                      ref="imageInputReplace"
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="handleImageUpload"
                    />
                    
                    <!-- Индикатор загрузки -->
                    <div v-if="imageUploading" class="text-center py-4">
                      <div class="inline-flex items-center">
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Загрузка изображения...
                      </div>
                    </div>
                  </div>

                  <!-- Виды спорта -->
                  <div class="bg-gray-50 rounded-lg p-4">
                    <h3 class="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Icon name="i-mdi:run" class="w-5 h-5 mr-2 text-blue-600" />
                      Виды спорта
                    </h3>
                    
                    <!-- Поле добавления -->
                    <div class="mb-3 relative">
                      <input
                        v-model="sportSearch"
                        type="text"
                        placeholder="Начните вводить название вида спорта..."
                        class="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @input="searchSports"
                        @focus="showSportDropdown = true"
                      />
                      
                      <!-- Выпадающий список результатов поиска -->
                      <div v-if="showSportDropdown && filteredSports.length > 0" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        <div
                          v-for="sport in filteredSports"
                          :key="sport.id"
                          class="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                          @click="addSport(sport)"
                        >
                          {{ sport.title }}
                        </div>
                      </div>
                    </div>
                    
                    <!-- Список выбранных видов спорта -->
                    <div class="space-y-2 max-h-40 overflow-y-auto">
                      <div v-for="sportId in formData.sports" :key="sportId" class="flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-200">
                        <span class="text-sm text-gray-700">
                          {{ getSportTitle(sportId) }}
                        </span>
                        <button
                          @click="removeSport(sportId)"
                          class="text-red-500 hover:text-red-700 text-sm"
                        >
                          <Icon name="heroicons:x-mark" class="w-4 h-4" />
                        </button>
                      </div>
                      <div v-if="formData.sports.length === 0" class="text-sm text-gray-500 text-center py-2">
                        Виды спорта не выбраны
                      </div>
                    </div>
                  </div>

                  <!-- Команды -->
                  <div class="bg-gray-50 rounded-lg p-4">
                    <h3 class="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Icon name="i-mdi:account-group" class="w-5 h-5 mr-2 text-green-600" />
                      Команды
                    </h3>
                    
                    <!-- Поле добавления -->
                    <div class="mb-3 relative">
                      <input
                        v-model="clubSearch"
                        type="text"
                        placeholder="Начните вводить название команды..."
                        class="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @input="searchClubs"
                        @focus="showClubDropdown = true"
                      />
                      
                      <!-- Выпадающий список результатов поиска -->
                      <div v-if="showClubDropdown && filteredClubs.length > 0" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        <div
                          v-for="club in filteredClubs"
                          :key="club.id"
                          class="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                          @click="addClub(club)"
                        >
                          {{ club.full_info }}
                        </div>
                      </div>
                    </div>
                    
                    <!-- Список выбранных команд -->
                    <div class="space-y-2 max-h-40 overflow-y-auto">
                      <div v-for="clubId in formData.clubs" :key="clubId" class="flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-200">
                        <span class="text-sm text-gray-700">
                          {{ getClubTitle(clubId) }}
                        </span>
                        <button
                          @click="removeClub(clubId)"
                          class="text-red-500 hover:text-red-700 text-sm"
                        >
                          <Icon name="heroicons:x-mark" class="w-4 h-4" />
                        </button>
                      </div>
                      <div v-if="formData.clubs.length === 0" class="text-sm text-gray-500 text-center py-2">
                        Команды не выбраны
                      </div>
                    </div>
                  </div>

                  <!-- Персоны -->
                  <div class="bg-gray-50 rounded-lg p-4">
                    <h3 class="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Icon name="i-mdi:account" class="w-5 h-5 mr-2 text-indigo-600" />
                      Персоны
                    </h3>
                    
                    <!-- Поле добавления -->
                    <div class="mb-3 relative">
                      <input
                        v-model="peopleSearch"
                        type="text"
                        placeholder="Начните вводить ФИО или дату рождения..."
                        class="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @input="searchPeople"
                        @focus="showPeopleDropdown = true"
                      />
                      
                      <!-- Выпадающий список результатов поиска -->
                      <div v-if="showPeopleDropdown && filteredPeople.length > 0" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        <div
                          v-for="person in filteredPeople"
                          :key="person.id"
                          class="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                          @click="addPerson(person)"
                        >
                          {{ person.title }}
                        </div>
                      </div>
                    </div>
                    
                    <!-- Список выбранных персон -->
                    <div class="space-y-2 max-h-40 overflow-y-auto">
                      <div v-for="personId in formData.people" :key="personId" class="flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-200">
                        <span class="text-sm text-gray-700">
                          {{ getPersonTitle(personId) }}
                        </span>
                        <button
                          @click="removePerson(personId)"
                          class="text-red-500 hover:text-red-700 text-sm"
                        >
                          <Icon name="heroicons:x-mark" class="w-4 h-4" />
                        </button>
                      </div>
                      <div v-if="formData.people.length === 0" class="text-sm text-gray-500 text-center py-2">
                        Персоны не выбраны
                      </div>
                    </div>
                  </div>

                  <!-- Спортсооружения -->
                  <div class="bg-gray-50 rounded-lg p-4">
                    <h3 class="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Icon name="i-mdi:stadium" class="w-5 h-5 mr-2 text-purple-600" />
                      Спортсооружения
                    </h3>
                    
                    <!-- Поле добавления -->
                    <div class="mb-3 relative">
                      <input
                        v-model="arenaSearch"
                        type="text"
                        placeholder="Начните вводить название спортсооружения..."
                        class="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @input="searchArenas"
                        @focus="showArenaDropdown = true"
                      />
                      
                      <!-- Выпадающий список результатов поиска -->
                      <div v-if="showArenaDropdown && filteredArenas.length > 0" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        <div
                          v-for="arena in filteredArenas"
                          :key="arena.id"
                          class="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                          @click="addArena(arena)"
                        >
                          {{ arena.title }}
                        </div>
                      </div>
                    </div>
                    
                    <!-- Список выбранных спортсооружений -->
                    <div class="space-y-2 max-h-40 overflow-y-auto">
                      <div v-for="arenaId in formData.arenas" :key="arenaId" class="flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-200">
                        <span class="text-sm text-gray-700">
                          {{ getArenaTitle(arenaId) }}
                        </span>
                        <button
                          @click="removeArena(arenaId)"
                          class="text-red-500 hover:text-red-700 text-sm"
                        >
                          <Icon name="heroicons:x-mark" class="w-4 h-4" />
                        </button>
                      </div>
                      <div v-if="formData.arenas.length === 0" class="text-sm text-gray-500 text-center py-2">
                        Спортсооружения не выбраны
                      </div>
                    </div>
                  </div>

                  <!-- Соревнования -->
                  <div class="bg-gray-50 rounded-lg p-4">
                    <h3 class="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Icon name="i-mdi:trophy" class="w-5 h-5 mr-2 text-yellow-600" />
                      Соревнования
                    </h3>
                    
                    <!-- Поле добавления -->
                    <div class="mb-3 relative">
                      <input
                        v-model="competitionSearch"
                        type="text"
                        placeholder="Начните вводить название соревнования..."
                        class="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @input="searchCompetitions"
                        @focus="showCompetitionDropdown = true"
                      />
                      
                      <!-- Выпадающий список результатов поиска -->
                      <div v-if="showCompetitionDropdown && filteredCompetitions.length > 0" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        <div
                          v-for="competition in filteredCompetitions"
                          :key="competition.id"
                          class="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                          @click="addCompetition(competition)"
                        >
                          {{ competition.title_short || competition.title }}
                        </div>
                      </div>
                    </div>
                    
                    <!-- Список выбранных соревнований -->
                    <div class="space-y-2 max-h-40 overflow-y-auto">
                      <div v-for="competitionId in formData.competitions" :key="competitionId" class="flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-200">
                        <span class="text-sm text-gray-700">
                          {{ getCompetitionTitle(competitionId) }}
                        </span>
                        <button
                          @click="removeCompetition(competitionId)"
                          class="text-red-500 hover:text-red-700 text-sm"
                        >
                          <Icon name="heroicons:x-mark" class="w-4 h-4" />
                        </button>
                      </div>
                      <div v-if="formData.competitions.length === 0" class="text-sm text-gray-500 text-center py-2">
                        Соревнования не выбраны
                      </div>
                    </div>
                  </div>

                  <!-- События -->
                  <div class="bg-gray-50 rounded-lg p-4">
                    <h3 class="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Icon name="i-mdi:calendar" class="w-5 h-5 mr-2 text-red-600" />
                      События
                    </h3>
                    
                    <!-- Поле добавления -->
                    <div class="mb-3 relative">
                      <input
                        v-model="eventSearch"
                        type="text"
                        placeholder="Начните вводить название события..."
                        class="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @input="searchEvents"
                        @focus="showEventDropdown = true"
                      />
                      
                      <!-- Выпадающий список результатов поиска -->
                      <div v-if="showEventDropdown && filteredEvents.length > 0" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        <div
                          v-for="event in filteredEvents"
                          :key="event.id"
                          class="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                          @click="addEvent(event)"
                        >
                          {{ event.event_name }}
                        </div>
                      </div>
                    </div>
                    
                    <!-- Список выбранных событий -->
                    <div class="space-y-2 max-h-40 overflow-y-auto">
                      <div v-for="eventId in formData.events" :key="eventId" class="flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-200">
                        <span class="text-sm text-gray-700">
                          {{ getEventTitle(eventId) }}
                        </span>
                        <button
                          @click="removeEvent(eventId)"
                          class="text-red-500 hover:text-red-700 text-sm"
                        >
                          <Icon name="heroicons:x-mark" class="w-4 h-4" />
                        </button>
                      </div>
                      <div v-if="formData.events.length === 0" class="text-sm text-gray-500 text-center py-2">
                        События не выбраны
                      </div>
                    </div>
                  </div>

                  <!-- Галереи -->
                  <div class="bg-gray-50 rounded-lg p-4">
                    <h3 class="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Icon name="i-mdi:image-multiple" class="w-5 h-5 mr-2 text-indigo-600" />
                      Галереи
                    </h3>
                    
                    <!-- Поле добавления -->
                    <div class="mb-3 relative">
                      <input
                        v-model="gallerySearch"
                        type="text"
                        placeholder="Начните вводить название галереи..."
                        class="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @input="searchGalleries"
                        @focus="() => { showGalleryDropdown = true; searchGalleries(); }"
                      />
                      
                      <!-- Выпадающий список результатов поиска -->
                      <div v-if="showGalleryDropdown && filteredGalleries.length > 0" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        <div
                          v-for="gallery in filteredGalleries"
                          :key="gallery.id"
                          class="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                          @click="addGallery(gallery)"
                        >
                          {{ gallery.title }}
                        </div>
                      </div>
            </div>

                    <!-- Список выбранных галерей -->
                    <div class="space-y-2 max-h-40 overflow-y-auto">
                      <div v-for="galleryId in formData.galleries" :key="galleryId" class="flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-200">
                        <span class="text-sm text-gray-700">
                          {{ getGalleryTitle(galleryId) }}
                        </span>
                        <button
                          @click="removeGallery(galleryId)"
                          class="text-red-500 hover:text-red-700 text-sm"
                        >
                          <Icon name="heroicons:x-mark" class="w-4 h-4" />
                        </button>
                      </div>
                      <div v-if="formData.galleries.length === 0" class="text-sm text-gray-500 text-center py-2">
                        Галереи не выбраны
                      </div>
                    </div>
                  </div>

                  <!-- Видео -->
                  <div class="bg-gray-50 rounded-lg p-4">
                    <h3 class="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Icon name="i-mdi:video" class="w-5 h-5 mr-2 text-pink-600" />
                      Видео
                    </h3>
                    
                    <!-- Поле добавления -->
                    <div class="mb-3 relative">
                <input 
                        v-model="videoSearch"
                        type="text"
                        placeholder="Начните вводить название видео..."
                        class="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @input="searchVideos"
                        @focus="showVideoDropdown = true"
                      />
                      
                      <!-- Выпадающий список результатов поиска -->
                      <div v-if="showVideoDropdown && filteredVideos.length > 0" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        <div
                          v-for="video in filteredVideos"
                          :key="video.id"
                          class="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                          @click="addVideo(video)"
                        >
                          {{ video.title }}
                        </div>
                      </div>
                    </div>
                    
                    <!-- Список выбранных видео -->
                    <div class="space-y-2 max-h-40 overflow-y-auto">
                      <div v-for="videoId in formData.videos" :key="videoId" class="flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-200">
                        <span class="text-sm text-gray-700">
                          {{ getVideoTitle(videoId) }}
                        </span>
                        <button
                          @click="removeVideo(videoId)"
                          class="text-red-500 hover:text-red-700 text-sm"
                        >
                          <Icon name="heroicons:x-mark" class="w-4 h-4" />
                        </button>
                      </div>
                      <div v-if="formData.videos.length === 0" class="text-sm text-gray-500 text-center py-2">
                        Видео не выбраны
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>

            <!-- Кнопки -->
          <div class="flex justify-end space-x-3 pt-6">
              <NuxtLink 
                to="/articles" 
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Отмена
              </NuxtLink>
              <button 
                type="submit" 
                :disabled="saving"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {{ saving ? 'Сохранение...' : 'Сохранить' }}
              </button>
            </div>
          </form>
      </div>
    </div>
  </div>

  <!-- URL Input Modal -->
  <div v-if="showUrlInput" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
      <h4 class="text-lg font-medium text-gray-900 mb-4">Вставьте URL изображения</h4>
      <p class="text-sm text-gray-600 mb-4">Изображение будет автоматически оптимизировано до 800x500px и сжато до 2MB</p>
      <p class="text-sm text-gray-600 mb-4">Поддерживаются: изображения, превью YouTube, VK и Rutube видео</p>
      <input
        v-model="urlInput"
        type="text"
        placeholder="https://..."
        class="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        @keyup.enter="handleUrlSubmit"
      />
      <div class="flex gap-3 justify-end">
        <button
          @click="handleUrlSubmit"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Вставить
        </button>
        <button
          @click="showUrlInput = false"
          class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  </div>

  <!-- Success Modal -->
  <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
      <h4 class="text-lg font-medium text-gray-900 mb-4">Статус сохранения</h4>
      <p class="text-sm text-gray-600 mb-6">Ваша статья успешно сохранена.</p>
      <div class="space-y-3">
        <button
          @click="goToList"
          class="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Icon name="i-mdi:format-list-bulleted" class="w-5 h-5 mr-2" />
          Перейти к списку статей
        </button>
        <button
          @click="stayEditing"
          class="w-full px-4 py-3 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors flex items-center justify-center"
        >
          <Icon name="i-mdi:pencil" class="w-5 h-5 mr-2" />
          Продолжить редактирование
        </button>
        <button
          @click="viewOnSite"
          class="w-full px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center"
        >
          <Icon name="i-mdi:eye" class="w-5 h-5 mr-2" />
          Просмотреть на сайте
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useGlobalsStore } from '~/stores/globals';
import { storeToRefs } from 'pinia';
import Head from "~/components/parts/Head.vue";
import RichTextEditor from "~/components/kirh/table/editor/RichTextEditor.vue";
import KirhSelectField from "~/components/kirh/table/fields/KirhSelectField.vue";

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const api = config.public.API_URL;
const site = config.public.SITE_URL;

const globalsStore = useGlobalsStore();
const { params } = storeToRefs(globalsStore);

// Загружаем данные на сервере
const { data } = await useAsyncData('article-globals', async () => {
  await globalsStore.fetchData();
  return { params: globalsStore.params };
});

const { isAuthenticated } = useAuth();

interface Article {
  id: number;
  region_id?: number;
  title: string;
  data: string | number;
  slug: string;
  description: string;
  content: string;
  published: number | boolean;
  article_image_path?: string;
  photo_info?: string;
  sports?: any[];
  clubs?: any[];
  arenas?: any[];
  competitions?: any[];
  events?: any[];
  galleries?: any[];
  videos?: any[];
  people?: any[];
}

interface Region {
  id: number;
  title_short: string;
}

interface RelationItem {
  id: number;
  title: string;
  title_short?: string;
  event_name?: string;
}

interface ClubItem {
  id: number;
  title: string;
  full_info: string;
}

const article = ref<Article | null>(null);
const loading = ref(true);
const saving = ref(false);
const error = ref('');
const imageUploading = ref(false);
const imageInput = ref<HTMLInputElement | null>(null);
const imageInputReplace = ref<HTMLInputElement | null>(null);
const showUrlInput = ref(false);
const urlInput = ref('');
const showSuccessModal = ref(false);

// Доступные элементы для отношений
const availableSports = ref<RelationItem[]>([]);
const availableClubs = ref<ClubItem[]>([]);
const availableArenas = ref<RelationItem[]>([]);
const availableCompetitions = ref<RelationItem[]>([]);
const availableEvents = ref<RelationItem[]>([]);
const availableGalleries = ref<RelationItem[]>([]);
const availableVideos = ref<RelationItem[]>([]);
const availablePeople = ref<RelationItem[]>([]);

// Переменные для поиска и автокомплита
const sportSearch = ref('');
const clubSearch = ref('');
const arenaSearch = ref('');
const competitionSearch = ref('');
const eventSearch = ref('');
const gallerySearch = ref('');
const videoSearch = ref('');
const peopleSearch = ref('');

// Состояния выпадающих списков
const showSportDropdown = ref(false);
const showClubDropdown = ref(false);
const showArenaDropdown = ref(false);
const showCompetitionDropdown = ref(false);
const showEventDropdown = ref(false);
const showGalleryDropdown = ref(false);
const showVideoDropdown = ref(false);
const showPeopleDropdown = ref(false);

// Отфильтрованные результаты поиска
const filteredSports = ref<RelationItem[]>([]);
const filteredClubs = ref<ClubItem[]>([]);
const filteredArenas = ref<RelationItem[]>([]);
const filteredCompetitions = ref<RelationItem[]>([]);
const filteredEvents = ref<RelationItem[]>([]);
const filteredGalleries = ref<RelationItem[]>([]);
const filteredVideos = ref<RelationItem[]>([]);
const filteredPeople = ref<RelationItem[]>([]);

const emptyRegionOption = {
  value: '',
  label: 'Не выбран'
};

const formData = ref({
  region_id: '' as string | number,
  title: '',
  data: '',
  slug: '',
  description: '',
  content: '',
  published: false,
  article_image_path: '',
  photo_info: '',
  sports: [] as number[],
  clubs: [] as number[],
  arenas: [] as number[],
  competitions: [] as number[],
  events: [] as number[],
  galleries: [] as number[],
  videos: [] as number[],
  people: [] as number[]
});

// SEO
useSeoMeta({
  title: ((params.value as any)?.adminka_name || 'Админка') + ' - Редактирование статьи',
  description: 'Редактирование статьи',
});

const p_icon = "i-mdi:newspaper-variant-outline";
const p_description = 'Редактирование статьи';
const breadcrumbs = [
  { title: 'Новости', slug: 'articles', icon: 'i-mdi:newspaper-variant-outline' },
  { title: 'Редактирование', slug: `articles/${route.params.id}`, icon: 'i-mdi:pencil' }
];

// Функция для нормализации пути изображения
const normalizeImagePath = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  
  // Если путь уже полный URL, возвращаем как есть
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Если путь относительный, добавляем базовый URL
  let normalizedPath = `${api}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  
  // Если это путь к изображению статьи и не содержит /storage/, добавляем его
  if (imagePath.includes('articles/') && !imagePath.includes('storage/')) {
    // Заменяем /articles/ на /storage/articles/
    normalizedPath = normalizedPath.replace('/articles/', '/storage/articles/');
  }
  
  return normalizedPath;
};

// Загрузка статьи
const loadArticle = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const response = await fetch(`${api}/api/articles/${route.params.id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Статья не найдена');
      } else {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
    }
    
    const data = await response.json();
    if (!data || typeof data !== 'object') {
      throw new Error('Неверный формат данных');
    }
    
    article.value = data;
    
    // Нормализуем путь изображения
    if (article.value && article.value.article_image_path) {
      article.value.article_image_path = normalizeImagePath(article.value.article_image_path);
    }
    
    // Заполняем форму данными
    if (article.value) {
      formData.value = {
        region_id: article.value.region_id ? Number(article.value.region_id) : '',
        title: article.value.title || '',
        data: article.value.data ? new Date(String(article.value.data)).toISOString().slice(0, 16) : '',
        slug: article.value.slug || '',
        description: article.value.description || '',
        content: article.value.content || '',
        published: article.value.published === 1 || article.value.published === true,
        article_image_path: article.value.article_image_path || '',
        photo_info: article.value.photo_info || '',
        sports: article.value.sports?.map(s => s.id) || [],
        clubs: article.value.clubs?.map(c => c.id) || [],
        arenas: article.value.arenas?.map(a => a.id) || [],
        competitions: article.value.competitions?.map(c => c.id) || [],
        events: article.value.events?.map(e => e.id) || [],
        galleries: article.value.galleries?.map(g => g.id) || [],
        videos: article.value.videos?.map(v => v.id) || [],
        people: article.value.people?.map(p => p.id) || []
      };
    }
    
    // После загрузки статьи загружаем доступные отношения
    // чтобы связанные персоны из статьи добавились в availablePeople
    await loadAvailableRelations();
    
  } catch (err) {
    error.value = (err as Error).message || 'Ошибка загрузки статьи';
    article.value = null;
    console.error('Ошибка загрузки статьи:', err);
  } finally {
    loading.value = false;
  }
};

// Загрузка доступных элементов для отношений
const loadAvailableRelations = async () => {
  try {
    const promises = [
      fetch(`${api}/api/v1/sports?type=async`).then(r => r.ok ? r.json() : []),
      fetch(`${api}/api/clubs?type=1`).then(r => r.ok ? r.json() : []),
      fetch(`${api}/api/v1/arenas?type=async`).then(r => r.ok ? r.json() : []),
      fetch(`${api}/api/v1/competitions?type=async`).then(r => r.ok ? r.json() : []),
      fetch(`${api}/api/events?type=async`).then(r => r.ok ? r.json() : []),
      fetch(`${api}/api/galleries?type=async`).then(r => r.ok ? r.json() : []),
      fetch(`${api}/api/videos`).then(r => r.ok ? r.json() : []),
      fetch(`${api}/api/people?type=async`).then(r => r.ok ? r.json() : [])
    ];

    const [sports, clubs, arenas, competitions, events, galleries, videos, people] = await Promise.all(promises);

    availableSports.value = Array.isArray(sports) ? sports : [];
    availableClubs.value = Array.isArray(clubs) ? clubs.map(club => ({
      ...club,
      full_info: club.full_info ? decodeURIComponent(JSON.parse('"' + club.full_info.replace(/\"/g, '\\"') + '"')) : club.title
    })) : [];
    availableArenas.value = Array.isArray(arenas) ? arenas : [];
    availableCompetitions.value = Array.isArray(competitions) ? competitions : [];
    availableEvents.value = Array.isArray(events) ? events : [];
    availableGalleries.value = Array.isArray(galleries) ? galleries : [];
    availableVideos.value = Array.isArray(videos) ? videos : (videos && videos.data ? videos.data : []);
    availablePeople.value = Array.isArray(people) ? people : [];

    // Добавляем связанные персоны из статьи в availablePeople, если они есть
    if (article.value && article.value.people) {
      article.value.people.forEach(person => {
        if (!availablePeople.value.find(p => p.id === person.id)) {
          // Формируем title для персоны в том же формате, что и в API
          const fullName = (person.last_name + ' ' + person.first_name + ' ' + (person.middle_name || '')).trim();
          const birthDate = person.birth_date ? new Date(person.birth_date).toLocaleDateString('ru-RU') : '';
          const personWithTitle = {
            ...person,
            title: fullName + (birthDate ? ` (${birthDate})` : '')
          };
          availablePeople.value.push(personWithTitle);
        }
      });
    }

    // Инициализируем отфильтрованные списки
    filteredSports.value = availableSports.value.slice(0, 10);
    filteredClubs.value = availableClubs.value.slice(0, 10);
    filteredArenas.value = availableArenas.value.slice(0, 10);
    filteredCompetitions.value = availableCompetitions.value.slice(0, 10);
    filteredEvents.value = availableEvents.value.slice(0, 10);
    filteredGalleries.value = availableGalleries.value.slice(0, 10);
    filteredVideos.value = availableVideos.value.slice(0, 10);
    filteredPeople.value = availablePeople.value.slice(0, 10);
  } catch (err) {
    console.error('Ошибка загрузки отношений:', err);
    error.value = (err as Error).message || 'Ошибка загрузки отношений';
  }
};

// Сохранение статьи
const saveArticle = async () => {
  try {
    saving.value = true;
    error.value = '';
    
    // Преобразуем дату в правильный формат для Laravel
    let formattedData = '';
    if (formData.value.data) {
      const date = new Date(formData.value.data);
      formattedData = date.toISOString().slice(0, 19).replace('T', ' ');
    }
    
    const response = await fetch(`${api}/api/articles/${route.params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData.value,
        data: formattedData,
        published: formData.value.published ? 1 : 0
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка сохранения');
    }
    
    // Показываем модальное окно успеха
    showSuccessModal.value = true;
  } catch (err) {
    error.value = (err as Error).message || 'Ошибка сохранения статьи';
  } finally {
    saving.value = false;
  }
};

// Функции для модального окна
const goToList = () => {
  router.push('/articles');
};

const stayEditing = () => {
  showSuccessModal.value = false;
};

const viewOnSite = () => {
  if (article.value?.slug) {
    window.open(site + '/news/' + article.value.slug, '_blank');
  }
  showSuccessModal.value = false;
};

// Функция для сохранения отношений morphedByMany
const saveRelations = async (relationType: string, relationIds: number[]) => {
  try {
    const response = await fetch(`${api}/api/articles/${route.params.id}/relations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        relation_type: relationType,
        relation_ids: relationIds
      })
    });
    
    if (!response.ok) {
      console.error(`Ошибка сохранения отношений ${relationType}:`, response.status);
    }
  } catch (err) {
    console.error(`Ошибка сохранения отношений ${relationType}:`, err);
  }
};

// Обработка загрузки изображения статьи
const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  // Проверка типа файла
  if (!file.type.match('image.*')) {
    error.value = 'Пожалуйста, выберите файл изображения';
    return;
  }
  
  // Проверка размера файла (не более 10MB)
  if (file.size > 10 * 1024 * 1024) {
    error.value = 'Размер файла не должен превышать 10MB';
    return;
  }
  
  try {
    imageUploading.value = true;
    error.value = '';
    
    // Обрабатываем изображение перед загрузкой
    const processedFile = await processImage(file);
    
    const formData = new FormData();
    formData.append('image', processedFile);
    
    const response = await fetch(`${api}/api/articles/${route.params.id}/upload-image`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка загрузки изображения');
    }
    
    const data = await response.json();
    
    // Обновляем данные статьи
    if (article.value) {
      const imagePath = data.image_path || data.url;
      article.value.article_image_path = normalizeImagePath(imagePath);
    }
    
    // Очищаем поле ввода
    if (imageInput.value) {
      imageInput.value.value = '';
    }
    if (imageInputReplace.value) {
      imageInputReplace.value.value = '';
    }
    
  } catch (err) {
    error.value = (err as Error).message || 'Ошибка загрузки изображения';
  } finally {
    imageUploading.value = false;
  }
};

// Обработка изображения
const processImage = (file: File) => {
  return new Promise<File>((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Не удалось получить контекст canvas'));
          return;
        }

        // Параметры обработки
        const targetWidth = 800;
        const targetHeight = 500;
        const maxSizeKB = 2048;
        const quality = 0.8;
        const mimeType = 'image/jpeg';

        // Вычисляем новые размеры с сохранением пропорций
        const aspectRatio = img.width / img.height;
        let width = targetWidth;
        let height = targetHeight;

        if (aspectRatio > targetWidth / targetHeight) {
          // Изображение шире, подгоняем по ширине
          height = targetWidth / aspectRatio;
        } else {
          // Изображение выше, подгоняем по высоте
          width = targetHeight * aspectRatio;
        }

        canvas.width = width;
        canvas.height = height;

        // Рисуем изображение
        ctx.drawImage(img, 0, 0, width, height);

        // Конвертируем в blob с заданным качеством
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Ошибка создания изображения'));
              return;
            }

            // Проверяем размер файла
            const sizeKB = blob.size / 1024;
            if (sizeKB > maxSizeKB) {
              // Если размер превышает максимальный, уменьшаем качество
              reduceQuality(canvas, maxSizeKB, mimeType, quality)
                .then(resolve)
                .catch(reject);
            } else {
              resolve(new File([blob], file.name, {
                type: mimeType,
                lastModified: Date.now()
              }));
            }
          },
          mimeType,
          quality
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error('Ошибка загрузки изображения'));
    };

    reader.readAsDataURL(file);
  });
};

// Рекурсивное уменьшение качества для достижения нужного размера
const reduceQuality = (canvas: HTMLCanvasElement, maxSizeKB: number, mimeType: string, initialQuality: number) => {
  return new Promise<File>((resolve, reject) => {
    let quality = initialQuality;
    let attempts = 0;
    const maxAttempts = 5;

    const tryCompress = () => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Ошибка создания изображения'));
            return;
          }

          const sizeKB = blob.size / 1024;

          if (sizeKB <= maxSizeKB || attempts >= maxAttempts) {
            resolve(new File([blob], 'compressed.jpg', {
              type: mimeType,
              lastModified: Date.now()
            }));
          } else {
            // Уменьшаем качество на 10% каждый раз
            quality = Math.max(0.1, quality - 0.1);
            attempts++;
            setTimeout(tryCompress, 0);
          }
        },
        mimeType,
        quality
      );
    };

    tryCompress();
  });
};

onMounted(() => {
  loadArticle();
  // Загружаем доступные отношения после загрузки статьи
  // чтобы можно было добавить связанные персоны из статьи в availablePeople
  
  // Обработчик клика вне выпадающих списков
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      showSportDropdown.value = false;
      showClubDropdown.value = false;
      showArenaDropdown.value = false;
      showCompetitionDropdown.value = false;
      showEventDropdown.value = false;
      showGalleryDropdown.value = false;
      showVideoDropdown.value = false;
      showPeopleDropdown.value = false;
    }
  });
});

// Добавляем watch для отслеживания изменений region_id в форме
watch(() => formData.value.region_id, (newValue, oldValue) => {
  // Обработка изменений region_id
}, { immediate: true });

// Debounce функция
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Функции поиска с debounce
const searchSports = debounce(async () => {
  const query = sportSearch.value.toLowerCase().trim();
  if (query.length >= 2) {
    try {
      const response = await fetch(`${api}/api/v1/sports?type=async&q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const sports = await response.json();
        filteredSports.value = Array.isArray(sports) ? sports.filter(sport => 
          !formData.value.sports.includes(sport.id)
        ) : [];
      }
    } catch (err) {
      console.error('Ошибка поиска спортов:', err);
    }
  } else {
    filteredSports.value = availableSports.value.filter(sport => 
      !formData.value.sports.includes(sport.id)
    ).slice(0, 10);
  }
}, 300);

const searchClubs = debounce(async () => {
  const query = clubSearch.value.toLowerCase().trim();
  console.log('Поиск команд:', query);
  
  if (query.length >= 2) {
    try {
      const response = await fetch(`${api}/api/clubs?type=1&q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const clubs = await response.json();
        console.log('Получены команды:', clubs);
        
        // Обрабатываем HTML-сущности в full_info
        const processedClubs = Array.isArray(clubs) ? clubs.map(club => ({
          ...club,
          full_info: club.full_info ? decodeURIComponent(JSON.parse('"' + club.full_info.replace(/\"/g, '\\"') + '"')) : club.title
        })) : [];
        
        filteredClubs.value = processedClubs.filter(club => 
          !formData.value.clubs.includes(club.id)
        );
        console.log('Отфильтрованные команды:', filteredClubs.value);
      }
    } catch (err) {
      console.error('Ошибка поиска команд:', err);
    }
  } else {
    filteredClubs.value = availableClubs.value.filter(club => 
      !formData.value.clubs.includes(club.id)
    ).slice(0, 10);
    console.log('Показаны первые 10 команд:', filteredClubs.value);
  }
}, 300);

const searchArenas = debounce(async () => {
  const query = arenaSearch.value.toLowerCase().trim();
  if (query.length >= 2) {
    try {
      const response = await fetch(`${api}/api/v1/arenas?type=async&q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const arenas = await response.json();
        filteredArenas.value = Array.isArray(arenas) ? arenas.filter(arena => 
          !formData.value.arenas.includes(arena.id)
        ) : [];
      }
    } catch (err) {
      console.error('Ошибка поиска арен:', err);
    }
  } else {
    filteredArenas.value = availableArenas.value.filter(arena => 
      !formData.value.arenas.includes(arena.id)
    ).slice(0, 10);
  }
}, 300);

const searchCompetitions = debounce(async () => {
  const query = competitionSearch.value.toLowerCase().trim();
  if (query.length >= 2) {
    try {
      const response = await fetch(`${api}/api/v1/competitions?type=async&q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const competitions = await response.json();
        filteredCompetitions.value = Array.isArray(competitions) ? competitions.filter(competition => 
          !formData.value.competitions.includes(competition.id)
        ) : [];
      }
    } catch (err) {
      console.error('Ошибка поиска соревнований:', err);
    }
  } else {
    filteredCompetitions.value = availableCompetitions.value.filter(competition => 
      !formData.value.competitions.includes(competition.id)
    ).slice(0, 10);
  }
}, 300);

const searchEvents = debounce(async () => {
  const query = eventSearch.value.toLowerCase().trim();
  if (query.length >= 2) {
    try {
      const response = await fetch(`${api}/api/events?type=async&q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const events = await response.json();
        filteredEvents.value = Array.isArray(events) ? events.filter(event => 
          !formData.value.events.includes(event.id)
        ) : [];
      }
    } catch (err) {
      console.error('Ошибка поиска событий:', err);
    }
  } else {
    filteredEvents.value = availableEvents.value.filter(event => 
      !formData.value.events.includes(event.id)
    ).slice(0, 10);
  }
}, 300);

const searchGalleries = debounce(async () => {
  const query = gallerySearch.value.toLowerCase().trim();
  
  if (query.length >= 2) {
    try {
      const response = await fetch(`${api}/api/galleries?type=async&q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const galleriesResponse = await response.json();
        
        // Обрабатываем ответ - может быть массив или объект с data
        const galleries = Array.isArray(galleriesResponse) ? galleriesResponse : (galleriesResponse && galleriesResponse.data ? galleriesResponse.data : []);
        
        filteredGalleries.value = galleries.filter((gallery: any) => 
          !formData.value.galleries.includes(gallery.id)
        );
      }
    } catch (err) {
      console.error('Ошибка поиска галерей:', err);
    }
  } else {
    // Показываем первые 10 галерей при пустом поле или коротком запросе
    filteredGalleries.value = availableGalleries.value.filter(gallery => 
      !formData.value.galleries.includes(gallery.id)
    ).slice(0, 10);
  }
}, 300);

const searchVideos = debounce(async () => {
  const query = videoSearch.value.toLowerCase().trim();
  if (query.length >= 2) {
    try {
      const response = await fetch(`${api}/api/videos?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const videosResponse = await response.json();
        // Извлекаем данные из пагинированного ответа
        const videos = Array.isArray(videosResponse) ? videosResponse : (videosResponse && videosResponse.data ? videosResponse.data : []);
        filteredVideos.value = videos.filter((video: any) => 
          !formData.value.videos.includes(video.id)
        );
      }
    } catch (err) {
      console.error('Ошибка поиска видео:', err);
    }
  } else {
    filteredVideos.value = availableVideos.value.filter(video => 
      !formData.value.videos.includes(video.id)
    ).slice(0, 10);
  }
}, 300);

const searchPeople = debounce(async () => {
  const query = peopleSearch.value.toLowerCase().trim();
  if (query.length >= 2) {
    try {
      const response = await fetch(`${api}/api/people?type=async&q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const people = await response.json();
        filteredPeople.value = Array.isArray(people) ? people.filter(person => 
          !formData.value.people.includes(person.id)
        ) : [];
      }
    } catch (err) {
      console.error('Ошибка поиска персон:', err);
    }
  } else {
    filteredPeople.value = availablePeople.value.filter(person => 
      !formData.value.people.includes(person.id)
    ).slice(0, 10);
  }
}, 300);

// Функции добавления
const addSport = async (sport: RelationItem) => {
  if (!formData.value.sports.includes(sport.id)) {
    formData.value.sports.push(sport.id);
    
    // Добавляем спорт в availableSports, если его там нет
    if (!availableSports.value.find(s => s.id === sport.id)) {
      availableSports.value.push(sport);
    }
    
    // Сразу сохраняем отношения
    await saveRelations('sports', formData.value.sports);
  }
  sportSearch.value = '';
  showSportDropdown.value = false;
  searchSports(); // Обновляем отфильтрованный список
};

const addClub = async (club: ClubItem) => {
  if (!formData.value.clubs.includes(club.id)) {
    formData.value.clubs.push(club.id);
    
    // Добавляем клуб в availableClubs, если его там нет
    if (!availableClubs.value.find(c => c.id === club.id)) {
      availableClubs.value.push(club);
    }
    
    // Сразу сохраняем отношения
    await saveRelations('clubs', formData.value.clubs);
  }
  clubSearch.value = '';
  showClubDropdown.value = false;
  searchClubs(); // Обновляем отфильтрованный список
};

const addArena = async (arena: RelationItem) => {
  if (!formData.value.arenas.includes(arena.id)) {
    formData.value.arenas.push(arena.id);
    
    // Добавляем арену в availableArenas, если её там нет
    if (!availableArenas.value.find(a => a.id === arena.id)) {
      availableArenas.value.push(arena);
    }
    
    // Сразу сохраняем отношения
    await saveRelations('arenas', formData.value.arenas);
  }
  arenaSearch.value = '';
  showArenaDropdown.value = false;
  searchArenas(); // Обновляем отфильтрованный список
};

const addCompetition = async (competition: RelationItem) => {
  if (!formData.value.competitions.includes(competition.id)) {
    formData.value.competitions.push(competition.id);
    
    // Добавляем соревнование в availableCompetitions, если его там нет
    if (!availableCompetitions.value.find(c => c.id === competition.id)) {
      availableCompetitions.value.push(competition);
    }
    
    // Сразу сохраняем отношения
    await saveRelations('competitions', formData.value.competitions);
  }
  competitionSearch.value = '';
  showCompetitionDropdown.value = false;
  searchCompetitions(); // Обновляем отфильтрованный список
};

const addEvent = async (event: RelationItem) => {
  if (!formData.value.events.includes(event.id)) {
    formData.value.events.push(event.id);
    
    // Добавляем событие в availableEvents, если его там нет
    if (!availableEvents.value.find(e => e.id === event.id)) {
      availableEvents.value.push(event);
    }
    
    // Сразу сохраняем отношения
    await saveRelations('events', formData.value.events);
  }
  eventSearch.value = '';
  showEventDropdown.value = false;
  searchEvents(); // Обновляем отфильтрованный список
};

const addGallery = async (gallery: RelationItem) => {
  if (!formData.value.galleries.includes(gallery.id)) {
    formData.value.galleries.push(gallery.id);
    
    // Добавляем галерею в availableGalleries, если её там нет
    if (!availableGalleries.value.find(g => g.id === gallery.id)) {
      availableGalleries.value.push(gallery);
    }
    
    // Сразу сохраняем отношения
    await saveRelations('galleries', formData.value.galleries);
  }
  gallerySearch.value = '';
  showGalleryDropdown.value = false;
  searchGalleries(); // Обновляем отфильтрованный список
};

const addVideo = async (video: RelationItem) => {
  if (!formData.value.videos.includes(video.id)) {
    formData.value.videos.push(video.id);
    
    // Добавляем видео в availableVideos, если его там нет
    if (!availableVideos.value.find(v => v.id === video.id)) {
      availableVideos.value.push(video);
    }
    
    // Сразу сохраняем отношения
    await saveRelations('videos', formData.value.videos);
  }
  videoSearch.value = '';
  showVideoDropdown.value = false;
  searchVideos(); // Обновляем отфильтрованный список
};

const addPerson = async (person: RelationItem) => {
  if (!formData.value.people.includes(person.id)) {
    formData.value.people.push(person.id);
    
    // Добавляем персону в availablePeople, если её там нет
    if (!availablePeople.value.find(p => p.id === person.id)) {
      availablePeople.value.push(person);
    }
    
    // Сразу сохраняем отношения
    await saveRelations('people', formData.value.people);
  }
  peopleSearch.value = '';
  showPeopleDropdown.value = false;
  searchPeople(); // Обновляем отфильтрованный список
};

// Функции удаления
const removeSport = async (sportId: number) => {
  formData.value.sports = formData.value.sports.filter(id => id !== sportId);
  // Сразу сохраняем отношения
  await saveRelations('sports', formData.value.sports);
  searchSports(); // Обновляем отфильтрованный список
};

const removeClub = async (clubId: number) => {
  formData.value.clubs = formData.value.clubs.filter(id => id !== clubId);
  // Сразу сохраняем отношения
  await saveRelations('clubs', formData.value.clubs);
  searchClubs(); // Обновляем отфильтрованный список
};

const removeArena = async (arenaId: number) => {
  formData.value.arenas = formData.value.arenas.filter(id => id !== arenaId);
  // Сразу сохраняем отношения
  await saveRelations('arenas', formData.value.arenas);
  searchArenas(); // Обновляем отфильтрованный список
};

const removeCompetition = async (competitionId: number) => {
  formData.value.competitions = formData.value.competitions.filter(id => id !== competitionId);
  // Сразу сохраняем отношения
  await saveRelations('competitions', formData.value.competitions);
  searchCompetitions(); // Обновляем отфильтрованный список
};

const removeEvent = async (eventId: number) => {
  formData.value.events = formData.value.events.filter(id => id !== eventId);
  // Сразу сохраняем отношения
  await saveRelations('events', formData.value.events);
  searchEvents(); // Обновляем отфильтрованный список
};

const removeGallery = async (galleryId: number) => {
  formData.value.galleries = formData.value.galleries.filter(id => id !== galleryId);
  // Сразу сохраняем отношения
  await saveRelations('galleries', formData.value.galleries);
  searchGalleries(); // Обновляем отфильтрованный список
};

const removeVideo = async (videoId: number) => {
  formData.value.videos = formData.value.videos.filter(id => id !== videoId);
  // Сразу сохраняем отношения
  await saveRelations('videos', formData.value.videos);
  searchVideos(); // Обновляем отфильтрованный список
};

const removePerson = async (personId: number) => {
  formData.value.people = formData.value.people.filter(id => id !== personId);
  // Сразу сохраняем отношения
  await saveRelations('people', formData.value.people);
  searchPeople(); // Обновляем отфильтрованный список
};

// Функции получения названий по ID
const getSportTitle = (sportId: number) => {
  const sport = availableSports.value.find(s => s.id === sportId);
  return sport ? sport.title : `Спорт #${sportId}`;
};

const getClubTitle = (clubId: number) => {
  // Сначала ищем в availableClubs
  const club = availableClubs.value.find(c => c.id === clubId);
  if (club) {
    return club.full_info;
  }
  
  // Если не найдено в availableClubs, ищем в данных статьи
  if (article.value && article.value.clubs) {
    const articleClub = article.value.clubs.find(c => c.id === clubId);
    if (articleClub) {
      return articleClub.full_info || articleClub.title || `Команда #${clubId}`;
    }
  }
  
  return `Команда #${clubId}`;
};

const getArenaTitle = (arenaId: number) => {
  // Сначала ищем в availableArenas
  const arena = availableArenas.value.find(a => a.id === arenaId);
  if (arena) {
    return arena.title;
  }
  
  // Если не найдено в availableArenas, ищем в данных статьи
  if (article.value && article.value.arenas) {
    const articleArena = article.value.arenas.find(a => a.id === arenaId);
    if (articleArena) {
      return articleArena.title || `Спортсооружение #${arenaId}`;
    }
  }
  
  return `Спортсооружение #${arenaId}`;
};

const getCompetitionTitle = (competitionId: number) => {
  // Сначала ищем в availableCompetitions
  const competition = availableCompetitions.value.find(c => c.id === competitionId);
  if (competition) {
    return competition.title_short || competition.title;
  }
  
  // Если не найдено в availableCompetitions, ищем в данных статьи
  if (article.value && article.value.competitions) {
    const articleCompetition = article.value.competitions.find(c => c.id === competitionId);
    if (articleCompetition) {
      return articleCompetition.title_short || articleCompetition.title || `Соревнование #${competitionId}`;
    }
  }
  
  return `Соревнование #${competitionId}`;
};

const getEventTitle = (eventId: number) => {
  // Сначала ищем в availableEvents
  const event = availableEvents.value.find(e => e.id === eventId);
  if (event) {
    return event.event_name || event.title;
  }
  
  // Если не найдено в availableEvents, ищем в данных статьи
  if (article.value && article.value.events) {
    const articleEvent = article.value.events.find(e => e.id === eventId);
    if (articleEvent) {
      return articleEvent.event_name || articleEvent.title || `Событие #${eventId}`;
    }
  }
  
  return `Событие #${eventId}`;
};

const getGalleryTitle = (galleryId: number) => {
  // Сначала ищем в availableGalleries
  const gallery = availableGalleries.value.find(g => g.id === galleryId);
  if (gallery) {
    return gallery.title;
  }
  
  // Если не найдено в availableGalleries, ищем в данных статьи
  if (article.value && article.value.galleries) {
    const articleGallery = article.value.galleries.find(g => g.id === galleryId);
    if (articleGallery) {
      return articleGallery.title || `Галерея #${galleryId}`;
    }
  }
  
  return `Галерея #${galleryId}`;
};

const getVideoTitle = (videoId: number) => {
  // Сначала ищем в availableVideos
  const video = availableVideos.value.find(v => v.id === videoId);
  if (video) {
    return video.title;
  }
  
  // Если не найдено в availableVideos, ищем в данных статьи
  if (article.value && article.value.videos) {
    const articleVideo = article.value.videos.find(v => v.id === videoId);
    if (articleVideo) {
      return articleVideo.title || `Видео #${videoId}`;
    }
  }
  
  return `Видео #${videoId}`;
};

const getPersonTitle = (personId: number) => {
  // Сначала ищем в availablePeople
  const person = availablePeople.value.find(p => p.id === personId);
  if (person) {
    return person.title;
  }
  
  // Если не найдено в availablePeople, ищем в данных статьи
  if (article.value && article.value.people) {
    const articlePerson = article.value.people.find(p => p.id === personId);
    if (articlePerson) {
      // Формируем title для персоны из данных статьи
      const fullName = (articlePerson.last_name + ' ' + articlePerson.first_name + ' ' + (articlePerson.middle_name || '')).trim();
      const birthDate = articlePerson.birth_date ? new Date(articlePerson.birth_date).toLocaleDateString('ru-RU') : '';
      return fullName + (birthDate ? ` (${birthDate})` : '');
    }
  }
  
  return `Персона #${personId}`;
};

// Удаление изображения статьи
const deleteArticleImage = async () => {
  if (!article.value?.article_image_path) return;
  
  try {
    const response = await fetch(`${api}/api/articles/${route.params.id}/delete-image`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка удаления изображения');
    }
    
    // Очищаем изображение в данных статьи
    if (article.value) {
      article.value.article_image_path = '';
    }
    
  } catch (err) {
    error.value = (err as Error).message || 'Ошибка удаления изображения';
  }
};

const handleUrlSubmit = async () => {
  if (!urlInput.value) {
    error.value = 'Введите URL';
    return;
  }

  try {
    imageUploading.value = true;
    error.value = '';

    let imageUrl = urlInput.value;

    // Обработка URL видео
    if (
      urlInput.value.includes('vk.com') ||
      urlInput.value.includes('vk.ru') ||
      urlInput.value.includes('vkvideo.ru')
    ) {
      imageUrl = await getVkVideoPreview(urlInput.value);
    } else if (urlInput.value.includes('rutube.ru')) {
      imageUrl = await getRutubeVideoPreview(urlInput.value);
    } else if (urlInput.value.includes('youtube.com') || urlInput.value.includes('youtu.be')) {
      imageUrl = await getYoutubeVideoPreview(urlInput.value);
    }

    // Если это обычная картинка, используем прокси для обхода CORS
    if (
      !urlInput.value.includes('vk.com') &&
      !urlInput.value.includes('vk.ru') &&
      !urlInput.value.includes('vkvideo.ru') &&
      !urlInput.value.includes('rutube.ru') &&
      !urlInput.value.includes('youtube.com') &&
      !urlInput.value.includes('youtu.be')
    ) {
      // Отправляем запрос через бэкенд
      const response = await fetch(`${api}/api/image-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          url: urlInput.value
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки изображения');
      }

      const blob = await response.blob();
      const file = new File([blob], 'downloaded-image.jpg', {
        type: blob.type,
        lastModified: Date.now()
      });

      // Обрабатываем изображение
      const processedFile = await processImage(file);

      // Загружаем обработанное изображение
      const uploadFormData = new FormData();
      uploadFormData.append('image', processedFile);

      const uploadResponse = await fetch(`${api}/api/articles/${route.params.id}/upload-image`, {
        method: 'POST',
        body: uploadFormData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'Ошибка загрузки изображения');
      }

      const data = await uploadResponse.json();

      // Обновляем данные статьи
      if (article.value) {
        article.value.article_image_path = normalizeImagePath(data.image_path || data.url);
      }

      urlInput.value = '';
      showUrlInput.value = false;
      return;
    }

    // Скачивание изображения
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Ошибка загрузки изображения');
    }
    const blob = await response.blob();
    const file = new File([blob], 'downloaded-image.jpg', {
      type: blob.type,
      lastModified: Date.now()
    });

    // Обрабатываем изображение
    const processedFile = await processImage(file);

    // Загружаем обработанное изображение
    const uploadFormData = new FormData();
    uploadFormData.append('image', processedFile);

    const uploadResponse = await fetch(`${api}/api/articles/${route.params.id}/upload-image`, {
      method: 'POST',
      body: uploadFormData
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.message || 'Ошибка загрузки изображения');
    }

    const data = await uploadResponse.json();

    // Обновляем данные статьи
    if (article.value) {
      article.value.article_image_path = normalizeImagePath(data.image_path || data.url);
    }

    urlInput.value = '';
    showUrlInput.value = false;

  } catch (err) {
    error.value = (err as Error).message || 'Ошибка загрузки изображения';
  } finally {
    imageUploading.value = false;
  }
};

// Получение превью видео VK
const getVkVideoPreview = async (url: string) => {
  try {
    let vkToken = config.public.VK_TOKEN;
    if (!vkToken) {
      throw new Error(
        'Для работы с видео ВКонтакте необходим токен API. ' +
        'Добавьте VK_TOKEN в .env или vkToken в options компонента.'
      );
    }

    let ownerId, videoId;
    const videoMatch = url.match(/video(-?\d+)_(\d+)/);
    if (videoMatch) {
      ownerId = videoMatch[1];
      videoId = videoMatch[2];
    } else {
      const urlMatch = url.match(/vk\.com\/video(-?\d+)_(\d+)/);
      if (urlMatch) {
        ownerId = urlMatch[1];
        videoId = urlMatch[2];
      } else {
        throw new Error('Неверный формат URL VK видео');
      }
    }

    // Отправляем запрос через бэкенд
    const response = await fetch(`${api}/api/vk/video-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        ownerId,
        videoId,
        vkToken
      })
    });

    if (!response.ok) {
      throw new Error(`Ошибка получения данных от VK API: ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`Ошибка VK API: ${data.error.error_msg || 'Неизвестная ошибка'}`);
    }

    if (!data.response?.items?.[0]) {
      throw new Error('Видео не найдено');
    }

    const video = data.response.items[0];
    if (!video.image) {
      throw new Error('Превью видео не найдено');
    }
    
    const imageUrl = video.image;
    let previewUrl;
    if (Array.isArray(imageUrl)) {
      previewUrl = imageUrl[imageUrl.length - 1].url || imageUrl[imageUrl.length - 1];
    } else if (typeof imageUrl === 'object' && imageUrl.url) {
      previewUrl = imageUrl.url;
    } else {
      previewUrl = imageUrl;
    }
    return previewUrl;
  } catch (err) {
    throw new Error(`Ошибка получения превью VK видео: ${(err as Error).message}`);
  }
};

// Получение превью видео Rutube
const getRutubeVideoPreview = async (url: string) => {
  try {
    const videoIdMatch = url.match(/rutube\.ru\/video\/([a-zA-Z0-9]+)/);
    if (!videoIdMatch) {
      throw new Error('Неверный формат URL Rutube видео');
    }

    const videoId = videoIdMatch[1];

    const response = await fetch(`${api}/api/rutube/video-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        videoId
      })
    });

    if (!response.ok) {
      throw new Error(`Ошибка получения данных от Rutube API: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.root && data.root.thumbnail_url) {
      return data.root.thumbnail_url;
    }

    const thumbnailUrl = data.thumbnail_url || 
                       data.thumbnail || 
                       data.preview_url || 
                       data.preview ||
                       (data.video && data.video.thumbnail_url) ||
                       (data.video && data.video.thumbnail);

    if (!thumbnailUrl) {
      throw new Error('Превью видео не найдено');
    }

    return thumbnailUrl;
  } catch (err) {
    throw new Error(`Ошибка получения превью Rutube видео: ${(err as Error).message}`);
  }
};

// Получение превью видео YouTube
const getYoutubeVideoPreview = async (url: string) => {
  const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
  if (!videoId) throw new Error('Неверный формат URL YouTube');
  
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};
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

/* Стили для селекта регионов */
:deep(.selected-option) {
  color: #111827 !important; /* text-gray-900 */
}

:deep(.selected-option span) {
  color: #111827 !important; /* text-gray-900 */
}
</style>