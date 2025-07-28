<template>
  <div class="event-advanced-editor">
    <!-- Спойлер Информация -->
    <section>
      <details ref="detailsEl">
        <summary class="flex items-center gap-2 cursor-pointer text-lg font-semibold px-4 py-2 bg-gray-200 text-gray-600 select-none border border-blue-400 border-b summary-bordered">
          <Icon icon="streamline-sharp:information-circle-solid" class="w-6 h-6 text-gray-700" />
          <span>Информация и изображение</span>
          <span class="ml-auto">
            <Icon :icon="openInfo ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="w-6 h-6 text-gray-400 transition-transform duration-200" />
          </span>
        </summary>
        <div class="border border-blue-400 rounded-b-xl overflow-hidden mb-8 border-t-0">
          <div class="p-4 bg-gray-50">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
              <!-- Анонс события -->
              <div class="bg-white rounded-lg shadow p-4 flex flex-col h-full">
                <div class="flex items-center mb-2 text-blue-700 font-semibold text-base">
                  <Icon icon="mdi:announcement" class="w-5 h-5 mr-2" />
                  Анонс события
                </div>
                <RichTextEditor v-model="aboutLocal" :placeholder="'Анонс события...'" />
                <button v-if="aboutLocal !== about" @click="saveField('about')" class="mt-2 px-4 py-1 bg-blue-600 text-white rounded flex items-center justify-center">
                  <Icon icon="mdi:content-save" class="w-5 h-5 mr-2" />Сохранить
                </button>
              </div>
              <!-- Информация по билетам -->
              <div class="bg-white rounded-lg shadow p-4 flex flex-col h-full">
                <div class="flex items-center mb-2 text-green-700 font-semibold text-base">
                  <Icon icon="mdi:ticket" class="w-5 h-5 mr-2" />
                  Информация по билетам
                </div>
                <RichTextEditor v-model="ticketsLocal" :placeholder="'Информация по билетам...'" />
                <button v-if="ticketsLocal !== tickets" @click="saveField('tickets')" class="mt-2 px-4 py-1 bg-blue-600 text-white rounded flex items-center justify-center">
                  <Icon icon="mdi:content-save" class="w-5 h-5 mr-2" />Сохранить
                </button>
              </div>
              <!-- Информация о матче -->
              <div class="bg-white rounded-lg shadow p-4 flex flex-col h-full">
                <div class="flex items-center mb-2 text-purple-700 font-semibold text-base">
                  <Icon icon="mdi:file-document" class="w-5 h-5 mr-2" />
                  Информация о матче
                </div>
                <RichTextEditor v-model="reportLocal" :placeholder="'Информация о матче...'" />
                <button v-if="reportLocal !== report" @click="saveField('report')" class="mt-2 px-4 py-1 bg-blue-600 text-white rounded flex items-center justify-center">
                  <Icon icon="mdi:content-save" class="w-5 h-5 mr-2" />Сохранить
                </button>
              </div>
              <!-- Изображение события -->
              <div class="bg-white rounded-lg shadow p-4 flex flex-col h-full">
                <div class="flex items-center mb-2 text-pink-700 font-semibold text-base">
                  <Icon icon="mdi:image" class="w-5 h-5 mr-2" />
                  Изображение события
                </div>
                <!-- Превью изображения -->
                <div v-if="mainImagePreview" class="w-full flex items-center justify-center bg-gray-100 rounded border mb-2 relative">
                  <img :src="mainImagePreview" alt="Превью" class="w-full object-contain rounded border mb-2" />
                  <button
                    v-if="props.eventData?.event_image_path && !(mainImageLocal instanceof FileClass)"
                    @click="deleteEventImage"
                    class="absolute right-2 top-2 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1 shadow"
                    title="Удалить изображение"
                  >
                    <Icon icon="mdi:delete" class="w-5 h-5 text-red-600" />
                  </button>
                </div>
                <div
                  v-else
                  class="w-full flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded mb-2 bg-gray-100 cursor-pointer"
                  @click="$refs.imageFileInputRef.click()"
                  title="Загрузить изображение с компьютера"
                >
                  <Icon icon="mdi:image" class="w-6 h-6 text-gray-300 mb-1" />
                  <span class="text-gray-400 text-xs">Нет изображения</span>
                  <span class="text-gray-400 text-[11px] mt-1">Кликните, чтобы загрузить</span>
                </div>
                <!-- Инпут для загрузки файла -->
                <label class="block w-full mb-2">
                  <div class="text-xs text-gray-500 mb-2">Изображение будет автоматически уменьшено до 800×500 пикселей перед загрузкой на сервер.</div>
                  <input type="file" accept="image/*" class="hidden" @change="handleFileUpload" ref="imageFileInputRef" />
                  <button type="button" class="w-full px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs" @click="$refs.imageFileInputRef.click()">
                    {{ (mainImagePreview || mainImageLocal instanceof FileClass) ? 'Заменить изображение' : 'Загрузить изображение' }}
                  </button>
                  
                </label>
                <!-- Кнопка вставки по URL -->
                <button type="button" class="w-full px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs mb-2" @click="showUrlInput = true">Вставить URL</button>
                <!-- Ввод URL -->
                <div v-if="showUrlInput" class="flex flex-col gap-2 mb-2">
                  <input v-model="urlInput" type="text" placeholder="https://..." class="border rounded px-2 py-1 w-full" />
                  <div class="flex gap-2">
                    <button @click="handleUrlSubmit" class="px-3 py-1 bg-blue-600 text-white rounded text-xs">Вставить</button>
                    <button @click="showUrlInput = false" class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs">Отмена</button>
                  </div>
                </div>
                <!-- Ошибка -->
                <div v-if="currentError" class="text-xs text-red-600 mb-2">{{ currentError }}</div>
                <div v-if="notifyMsg" :class="['mt-2 text-sm rounded px-4 py-1', notifyError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700']">
                  {{ notifyMsg }}
                </div>
                <button v-else-if="mainImageLocal !== mainImage" @click="saveField('mainImage')" class="mt-2 px-4 py-1 bg-blue-600 text-white rounded flex items-center justify-center">
                  <Icon icon="mdi:content-save" class="w-5 h-5 mr-2" />Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      </details>
    </section>

    <!-- Редактор дополнительных изображений события -->
    <section class="my-8">
      <EventImageAdvancedEditor
        :eventData="eventData"
        :teamActions="teamActions"
        :teamActionTypeOptions="teamActionTypeOptions"
        @image-saved="onImageSaved"
      />
    </section>

    <!-- Редактор Telegram-поста -->
    <section>
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Icon icon="mdi:telegram" class="w-6 h-6 text-white" />
          </div>
          <h2 class="text-2xl font-bold text-gray-800">Редактор Telegram-поста</h2>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Левый столбец: кнопки для контента и изображений -->
        <div class="space-y-4">
          <!-- Блок с контентом события -->
          <div class="p-4 bg-gray-50 rounded-lg">
            <h3 class="text-lg font-semibold mb-3">Контент события</h3>
            <div class="flex gap-2">
              <button @click="insertEventData('about')" class="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm">
                <Icon icon="mdi:announcement" class="w-4 h-4 mr-1" />
                Анонс
              </button>
              <button @click="insertEventData('tickets')" class="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm">
                <Icon icon="mdi:ticket" class="w-4 h-4 mr-1" />
                Билеты
              </button>
              <button @click="insertEventData('report')" class="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm">
                <Icon icon="mdi:file-document" class="w-4 h-4 mr-1" />
                Отчёт о матче
              </button>
            </div>
          </div>

          <!-- Блок с шаблонами -->
          <div class="p-4 bg-gray-50 rounded-lg">
            <h3 class="text-lg font-semibold mb-3">Шаблоны</h3>
            <div class="space-y-3">
                            <!-- Простые шаблоны -->
              <div class="flex gap-2">
                <button @click="insertTemplate('competition')" class="flex-1 px-3 py-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-sm">
                  <Icon icon="mdi:trophy" class="w-4 h-4 mr-1" />
                  Соревнование
                </button>
                <button @click="insertTemplate('title')" class="flex-1 px-3 py-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-sm">
                  <Icon icon="mdi:format-title" class="w-4 h-4 mr-1" />
                  Title
                </button>
                <button @click="insertTemplate('match')" class="flex-1 px-3 py-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-sm">
                  <Icon icon="mdi:soccer" class="w-4 h-4 mr-1" />
                  Матч
                </button>
                <button @click="insertTemplate('city_stadium')" class="flex-1 px-3 py-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-sm">
                  <Icon icon="mdi:map-marker" class="w-4 h-4 mr-1" />
                  Стадион
                </button>
        </div>
                            <!-- Составные шаблоны -->
              <div class="flex gap-2">
                <button @click="insertTemplate('match_full')" class="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm">
                  <Icon icon="mdi:format-list-bulleted" class="w-4 h-4 mr-1" />
                  МАТЧ/СОСТАВЫ
                </button>
                <button @click="insertTemplate('match_events')" class="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm">
                  <Icon icon="mdi:format-list-text" class="w-4 h-4 mr-1" />
                  МАТЧ/СОБЫТИЯ
                </button>
          </div>
            </div>
          </div>

          <!-- Блок с составами команд -->
          <div class="p-4 bg-gray-50 rounded-lg">
            <h3 class="text-lg font-semibold mb-3">Составы команд</h3>
            <div class="space-y-4">
              <div>
                <h4 class="font-medium mb-2 text-blue-700">{{ eventData?.club1?.title || 'Команда 1' }}</h4>
                <div class="flex gap-2">
                  <button @click="insertLineupData('club1', 'column')" class="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm">
                    <Icon icon="mdi:format-list-bulleted" class="w-4 h-4 mr-1" />
                    Состав (столбцы)
                  </button>
                  <button @click="insertLineupData('club1', 'comma')" class="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm">
                    <Icon icon="mdi:format-list-text" class="w-4 h-4 mr-1" />
                    Состав (запятые)
                  </button>
                </div>
              </div>
              <div>
                <h4 class="font-medium mb-2 text-red-700">{{ eventData?.club2?.title || 'Команда 2' }}</h4>
                <div class="flex gap-2">
                  <button @click="insertLineupData('club2', 'column')" class="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm">
                    <Icon icon="mdi:format-list-bulleted" class="w-4 h-4 mr-1" />
                    Состав (столбцы)
                  </button>
                  <button @click="insertLineupData('club2', 'comma')" class="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm">
                    <Icon icon="mdi:format-list-text" class="w-4 h-4 mr-1" />
                    Состав (запятые)
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Блок с событиями команд -->
          <div class="p-4 bg-gray-50 rounded-lg">
            <h3 class="text-lg font-semibold mb-3">События команд</h3>
            <div class="space-y-3">
              <div class="flex gap-2">
                <button @click="insertTeamEvents('all', 'column')" class="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm">
                  <Icon icon="mdi:format-list-bulleted" class="w-4 h-4 mr-1" />
                  События (столбцы)
                </button>
                <button @click="insertTeamEvents('all', 'comma')" class="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm">
                  <Icon icon="mdi:format-list-text" class="w-4 h-4 mr-1" />
                  События (запятые)
                </button>
              </div>
            </div>
          </div>

          <!-- Блок с изображением -->
          <div class="p-4 bg-gray-50 rounded-lg">
            <h3 class="text-lg font-semibold mb-3">Изображение для поста</h3>
            <div class="space-y-3">
              <div class="flex gap-2">
                <button @click="selectEventImage" class="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm">
                  <Icon icon="mdi:image" class="w-4 h-4 mr-1" />
                  Изображение события
                </button>
                <button @click="openGallerySelector" class="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm">
                  <Icon icon="mdi:image-multiple" class="w-4 h-4 mr-1" />
                  Из галереи
                </button>
                <button @click="uploadCustomImage" class="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm">
                  <Icon icon="mdi:upload" class="w-4 h-4 mr-1" />
                  Загрузить
                </button>
              </div>
              <button v-if="selectedTelegramImage" @click="removeTelegramImage" class="w-full px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm">
                <Icon icon="mdi:delete" class="w-4 h-4 mr-1" />
                Удалить
              </button>
            </div>
            <!-- Превью выбранного изображения -->
            <div v-if="selectedTelegramImage" class="mt-3">
              <img :src="selectedTelegramImagePreview" alt="Выбранное изображение" class="max-h-32 rounded border" />
            </div>
          </div>



        </div>

        <!-- Правый столбец: редактор и кнопки действий -->
        <div class="space-y-4">
          <!-- HTML редактор -->
          <div class="bg-white rounded-lg shadow p-4">
            <label class="block font-semibold mb-2">Текст поста (HTML)</label>
            <RichTextEditor
              v-model="telegramText"
              :placeholder="'Введите текст для Telegram-поста...'"
              class="min-h-[400px]"
            />
          </div>

          <!-- Настройки отправки -->
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="text-lg font-semibold mb-3">Настройки отправки</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">Telegram каналы:</label>
                <div class="max-h-48 overflow-y-auto border rounded p-2 bg-gray-50">
                  <div v-if="telegramChannels.length === 0" class="text-gray-500 text-sm py-2">
                    Нет доступных каналов
                  </div>
                  <div v-else class="space-y-2">
                    <label v-for="ch in telegramChannels" :key="ch.id" class="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        :value="ch.id" 
                        v-model="selectedTelegramChannels" 
                        class="rounded"
                      />
                      <div class="flex-1">
                        <div class="font-medium text-sm">{{ ch.title }}</div>
                        <div class="text-xs text-gray-500">{{ ch.username || ch.chat_id }}</div>
                      </div>
                    </label>
                  </div>
                </div>
                <button @click="loadTelegramChannels" class="mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                  Обновить список
                </button>
              </div>
              <div>
                <label class="flex items-center">
                  <input type="checkbox" v-model="telegramPinMessage" class="mr-2" />
                  <span class="text-sm">Закрепить сообщение</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Автоматические дополнения к посту -->
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="text-lg font-semibold mb-3">Автоматические дополнения</h3>
            <div class="space-y-3">
              <div>
                <label class="flex items-center">
                  <input type="checkbox" v-model="addEventLink" class="mr-2" />
                  <span class="text-sm">Добавить ссылку на матч</span>
                </label>
                <div class="text-xs text-gray-500 ml-6 mt-1">
                  Добавит ссылку на страницу события с текстом "🔗 Подробнее"
                </div>
              </div>
              <div>
                <label class="flex items-center">
                  <input type="checkbox" v-model="addTelegramChannelLink" class="mr-2" />
                  <span class="text-sm">Добавить ссылку на Telegram канал</span>
                </label>
                <div class="text-xs text-gray-500 ml-6 mt-1">
                  Добавит призыв подписаться на @spbsportrep
                </div>
              </div>
            </div>
          </div>

          <!-- Кнопки действий -->
          <div class="bg-white rounded-lg shadow p-4">
            <div class="flex flex-wrap gap-3">
              <button @click="copyTelegramText" class="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200">
                <Icon icon="mdi:content-copy" class="w-4 h-4 mr-1" />
                Скопировать
              </button>
              <button @click="clearTelegramText" class="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200">
                <Icon icon="mdi:delete" class="w-4 h-4 mr-1" />
                Очистить
              </button>
              <button
                @click="showTelegramPreview"
                :disabled="!telegramText || selectedTelegramChannels.length === 0 || sendingTelegram"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                <Icon icon="mdi:eye" class="w-4 h-4 mr-1" />
                {{ sendingTelegram ? 'Отправка...' : 'Предпросмотр и отправка' }}
              </button>
            </div>

            <!-- Результат отправки -->
            <div v-if="telegramSendResult" :class="['mt-3 px-4 py-2 rounded', telegramSendError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700']">
              {{ telegramSendResult }}
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>

    <!-- Модалка выбора изображения из галереи -->
    <div v-if="showGallerySelector" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="p-4 border-b flex justify-between items-center">
          <h3 class="text-lg font-semibold">Выберите изображение из галереи</h3>
          <button @click="showGallerySelector = false" class="text-gray-500 hover:text-gray-700">
            <Icon icon="mdi:close" class="w-6 h-6" />
          </button>
        </div>
        <div class="p-4">
          <div v-if="loadingImages" class="text-center py-8">
            <Icon icon="mdi:loading" class="w-8 h-8 animate-spin mx-auto" />
            <p class="mt-2">Загрузка изображений...</p>
          </div>
          <div v-else-if="eventImages.length === 0" class="text-center py-8 text-gray-500">
            <Icon icon="mdi:image-off" class="w-12 h-12 mx-auto mb-2" />
            <p>В галерее нет изображений</p>
          </div>
          <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              v-for="img in eventImages"
              :key="img.id"
              class="border rounded p-2 cursor-pointer hover:bg-gray-50"
              @click="selectImageFromGallery(img)"
            >
              <img :src="getImageUrl(img)" :alt="'Изображение ' + img.id" class="w-full h-24 object-cover rounded mb-2" />
              <div class="text-xs text-gray-600">
                {{ img.created_at ? new Date(img.created_at).toLocaleString('ru-RU') : '' }}
              </div>
              <div class="text-xs text-gray-500">
                {{ img.type }} / {{ img.template_id }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Модалка предпросмотра -->
  <div v-if="showTelegramPreviewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
      <div class="p-4 border-b flex justify-between items-center flex-shrink-0">
        <h3 class="text-lg font-semibold">Предпросмотр сообщения</h3>
        <button @click="showTelegramPreviewModal = false" class="text-gray-500 hover:text-gray-700">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="p-4 overflow-y-auto flex-grow">
        <div class="bg-[#17212B] rounded-lg p-4 text-white">
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <svg class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              </svg>
            </div>
            <div class="ml-3">
              <div class="font-medium">
                {{ selectedTelegramChannels.length === 1 
                   ? telegramChannels.find(c => c.id == selectedTelegramChannels[0])?.title || 'Канал'
                   : `${selectedTelegramChannels.length} каналов` }}
              </div>
              <div class="text-sm text-gray-400">
                {{ selectedTelegramChannels.length === 1 ? 'Канал' : 'Каналы' }}
              </div>
            </div>
          </div>
          <div v-if="selectedTelegramImage && selectedTelegramImagePreview" class="mb-4">
            <img :src="selectedTelegramImagePreview" class="w-full rounded-lg" />
          </div>
          <div class="whitespace-pre-wrap">{{ telegramPreviewContent }}</div>
        </div>
      </div>
      <div class="p-4 border-t flex justify-end space-x-3 flex-shrink-0">
        <button
          @click="showTelegramPreviewModal = false"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Отмена
        </button>
        <button
          @click="sendTelegramPost"
          :disabled="sendingTelegram"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <span v-if="sendingTelegram" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Отправка...
          </span>
          <span v-else>Отправить</span>
        </button>
      </div>
    </div>
  </div>

</template>

<script setup>
import { useRuntimeConfig } from '#imports';
import { Icon } from '@iconify/vue';
import { computed, nextTick, ref, watch } from 'vue';
import RichTextEditor from '~/components/kirh/table/editor/RichTextEditor.vue';
import { useApi } from '~/composables/useApi';
import EventImageAdvancedEditor from './EventImageAdvancedEditor.vue';

const route = useRoute();
const eventId = route.params.id;
const { apiRequest } = useApi();
const config = useRuntimeConfig();

// Функция для безопасного форматирования даты события
const formatEventDate = (dateString) => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    // Проверяем, что дата валидна
    if (isNaN(date.getTime())) {
      return dateString // Возвращаем исходную строку, если дата невалидна
    }
    return date.toLocaleDateString('ru-RU')
  } catch (error) {
    return dateString // Возвращаем исходную строку в случае ошибки
  }
}

const props = defineProps({
  eventData: Object,
  teamActions: {
    type: Array,
    default: () => []
  },
  teamActionTypeOptions: {
    type: Array,
    default: () => []
  }
});

// Основные поля события
const about = ref('');
const tickets = ref('');
const report = ref('');
const image = ref('');
const imageEventPath = ref('');

// Локальные значения для отслеживания изменений
const aboutLocal = ref('');
const ticketsLocal = ref('');
const reportLocal = ref('');
const imageLocal = ref(""); // может быть File или строка

// --- Форматы шаблонов ---
const templateTypes = ['horizontal', 'vertical', 'square'];
const typeLabels = { horizontal: 'Горизонтальный', vertical: 'Вертикальный', square: 'Квадратный' };
const selectedType = ref('horizontal');
const templateSettings = ref([]);
const currentSetting = computed(() => templateSettings.value.find(s => s.type === selectedType.value));

// --- Основное изображение ---
const mainImage = ref('');
const mainImageLocal = ref('');
const onMainImageChange = (val) => { mainImageLocal.value = val; };

// --- Шаблоны ---
const templates = ref([]);
const selectedTemplateId = ref(null);
const showTemplateModal = ref(false);
const filteredTemplates = computed(() => templates.value.filter(t => t.type === selectedType.value));
const selectedTemplate = computed(() => templates.value.find(t => t.id === selectedTemplateId.value));

// --- Текстовые слои ---
let layerId = 1;
const textLayers = ref([
  // Пример слоя
  // { id: 1, text: 'Текст', x: 50, y: 50, color: '#222', font: 'Arial', size: 32, align: 'center', shadow: false }
]);
const addTextLayer = () => {
  textLayers.value.push({
    id: ++layerId,
    text: 'Текст',
    x: 50,
    y: 50,
    color: '#222',
    font: 'Arial',
    size: 32,
    align: 'center',
    shadow: false
  });
};
const removeTextLayer = (idx) => {
  textLayers.value.splice(idx, 1);
};

// --- Drag&drop ---
const dragging = ref(null);
const dragOffset = ref({ x: 0, y: 0 });
const previewCanvas = ref(null);
const canvasWidth = computed(() => currentSetting.value?.width || 800);
const canvasHeight = computed(() => currentSetting.value?.height || 600);
const canvasStyle = computed(() => `width:${canvasWidth.value}px;height:${canvasHeight.value}px;min-width:300px;min-height:200px;`);

const startDrag = (idx, e) => {
  dragging.value = idx;
  dragOffset.value = {
    x: e.clientX - (textLayers.value[idx].x || 0),
    y: e.clientY - (textLayers.value[idx].y || 0)
  };
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
};
const onDrag = (e) => {
  if (dragging.value === null) return;
  const idx = dragging.value;
  textLayers.value[idx].x = e.clientX - dragOffset.value.x;
  textLayers.value[idx].y = e.clientY - dragOffset.value.y;
};
const stopDrag = () => {
  dragging.value = null;
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
};

const layerDragStyle = (layer) => ({
  left: layer.x + 'px',
  top: layer.y + 'px',
  zIndex: 10,
  pointerEvents: 'auto',
});
const layerTextStyle = (layer) => ({
  color: layer.color,
  fontFamily: layer.font,
  fontSize: layer.size + 'px',
  textAlign: layer.align,
  textShadow: layer.shadow ? '2px 2px 4px #0008' : 'none',
  background: 'rgba(255,255,255,0.0)',
  userSelect: 'none',
  cursor: 'move',
});

// --- Рендеринг на canvas ---
const renderCanvas = () => {
  const canvas = previewCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Основное изображение
  if (mainImageLocal.value) {
    const img = new window.Image();
    img.src = mainImageLocal.value;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawTemplateAndText(ctx);
    };
  } else {
    drawTemplateAndText(ctx);
  }
};
const drawTemplateAndText = (ctx) => {
  // Шаблон-маска
  if (selectedTemplate.value) {
    const mask = new window.Image();
    mask.src = selectedTemplate.value.preview_path || selectedTemplate.value.path;
    mask.onload = () => {
      ctx.drawImage(mask, 0, 0, canvasWidth.value, canvasHeight.value);
      drawTextLayers(ctx);
    };
  } else {
    drawTextLayers(ctx);
  }
};
const drawTextLayers = (ctx) => {
  for (const layer of textLayers.value) {
    ctx.save();
    ctx.font = `${layer.size || 32}px ${layer.font || 'Arial'}`;
    ctx.fillStyle = layer.color || '#222';
    ctx.textAlign = layer.align || 'center';
    ctx.textBaseline = 'top';
    if (layer.shadow) {
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }
    ctx.fillText(layer.text, layer.x, layer.y);
    ctx.restore();
  }
};

// Перерисовывать canvas при изменениях
watch([mainImageLocal, selectedTemplateId, textLayers, canvasWidth, canvasHeight], () => {
  nextTick(renderCanvas);
}, { deep: true });

// Загрузка данных события
const loadEvent = async () => {
  const res = await apiRequest(`/events/${eventId}`);
  const data = Array.isArray(res) ? res[0] : res;
  about.value = data.about || '';
  tickets.value = data.tickets || '';
  report.value = data.report || '';
  image.value = data.image || '';
  imageEventPath.value = data.event_image_path || '';
  aboutLocal.value = about.value;
  ticketsLocal.value = tickets.value;
  reportLocal.value = report.value;
  imageLocal.value = image.value;
  // Синхронизация основного изображения
  mainImage.value = data.image || '';
  mainImageLocal.value = mainImage.value;
  
  // Уведомляем родительский компонент об обновлении данных события
  emit('update:eventData', data);
};

onMounted(() => {
  loadEvent();
  loadTemplateSettings();
  loadTemplates();
  loadEventImages();
  nextTick(renderCanvas);
  if (detailsEl.value) {
    detailsEl.value.addEventListener('toggle', () => {
      openInfo.value = detailsEl.value.open;
    });
    openInfo.value = detailsEl.value.open;
  }
});

// Сохранение поля
const saveField = async (field) => {
  let payload = {};
  if (field === 'about') payload.about = aboutLocal.value;
  if (field === 'tickets') payload.tickets = ticketsLocal.value;
  if (field === 'report') payload.report = reportLocal.value;
  if (field === 'mainImage') {
    try {
      if (mainImageLocal.value instanceof File) {
        const formData = new FormData();
        formData.append('image', mainImageLocal.value);

        const res = await apiRequest(`/events/${eventId}/upload-image`, {
          method: 'POST',
          body: formData
        });

        const path = res?.data?.image || res?.image;
        if (path) {
          mainImage.value = path;
          mainImageLocal.value = path;
        }
      } else if (typeof mainImageLocal.value === 'string') {
        payload.image = mainImageLocal.value;
        await apiRequest(`/events/${eventId}`, {
          method: 'PATCH',
          body: payload
        });
      } else {
        payload.image = '';
        await apiRequest(`/events/${eventId}`, {
          method: 'PATCH',
          body: payload
        });
      }
      await loadEvent();
      // Синхронизация после загрузки события
      mainImageLocal.value = mainImage.value;
      // Сообщение об успешной загрузке
      notifyMsg.value = 'Изображение успешно загружено и доступно в Telegram-редакторе!';
      notifyError.value = false;
      setTimeout(() => notifyMsg.value = '', 3000);
    } catch (err) {
      currentError.value = err.message || 'Ошибка сохранения изображения';
    }
    return;
  }
  if (field === 'image') {
    try {
      if (imageLocal.value instanceof File) {
        const formData = new FormData();
        formData.append('image', imageLocal.value);
        // НЕ отправляем на /v1/event-images, а сразу на PATCH /v1/events/{eventId}
        const res = await apiRequest(`/events/${eventId}`, {
          method: 'PATCH',
          body: formData
        });
        // Получаем путь к изображению из ответа
        const path = res?.data?.image || res?.image;
        if (path) imageLocal.value = path;
      } else if (typeof imageLocal.value === 'string') {
        payload.image = imageLocal.value;
        await apiRequest(`/events/${eventId}`, {
          method: 'PATCH',
          body: payload
        });
      } else {
        payload.image = '';
        await apiRequest(`/events/${eventId}`, {
          method: 'PATCH',
          body: payload
        });
      }
      await loadEvent(); // обновить данные после сохранения
      // Уведомляем пользователя о том, что данные обновлены
      notifyMsg.value = 'Изображение обновлено и доступно в Telegram-редакторе!';
      notifyError.value = false;
      setTimeout(() => notifyMsg.value = '', 3000);
    } catch (err) {
      currentError.value = err.message || 'Ошибка сохранения изображения';
    }
    return;
  }
  await apiRequest(`/events/${eventId}`, {
    method: 'PATCH',
    body: payload
  });
  await loadEvent();
  
  // Уведомляем пользователя о том, что данные обновлены
  notifyMsg.value = 'Данные обновлены и доступны в Telegram-редакторе!';
  notifyError.value = false;
  setTimeout(() => notifyMsg.value = '', 3000);
};

// Обработка изменения изображения
const onImageChange = (val) => {
  imageLocal.value = val;
};

// --- Загрузка настроек и шаблонов ---
const loadTemplateSettings = async () => {
  const res = await apiRequest('/image-template-settings');
  templateSettings.value = Array.isArray(res) ? res : (res?.data || []);
};
const loadTemplates = async () => {
  const res = await apiRequest('/image-templates');
  templates.value = Array.isArray(res) ? res : (res?.data || []);
};

const selectType = (type) => {
  selectedType.value = type;
  // Сброс выбора шаблона при смене типа
  selectedTemplateId.value = null;
};

// --- История изменений ---
const history = ref([]); // стек undo
const future = ref([]);  // стек redo
const canUndo = computed(() => history.value.length > 0);
const canRedo = computed(() => future.value.length > 0);

function getEditorState() {
  return {
    mainImage: mainImageLocal.value,
    selectedTemplateId: selectedTemplateId.value,
    selectedType: selectedType.value,
    textLayers: JSON.parse(JSON.stringify(textLayers.value)),
  };
}
function setEditorState(state) {
  mainImageLocal.value = state.mainImage;
  selectedTemplateId.value = state.selectedTemplateId;
  selectedType.value = state.selectedType;
  textLayers.value = JSON.parse(JSON.stringify(state.textLayers));
}
function pushHistory() {
  history.value.push(getEditorState());
  if (history.value.length > 50) history.value.shift(); // ограничение размера истории
  future.value = [];
}
function undo() {
  if (!canUndo.value) return;
  const prev = history.value.pop();
  future.value.unshift(getEditorState());
  setEditorState(prev);
}
function redo() {
  if (!canRedo.value) return;
  const next = future.value.shift();
  history.value.push(getEditorState());
  setEditorState(next);
}
// --- Автоматическое добавление в историю ---
watch([
  mainImageLocal, selectedTemplateId, selectedType, textLayers
], () => {
  pushHistory();
}, { deep: true });

// --- Экспорт изображения ---
function exportImage(format) {
  const canvas = previewCanvas.value;
  if (!canvas) return;
  let dataUrl;
  if (format === 'jpg') {
    // Заливка белым
    const tmp = document.createElement('canvas');
    tmp.width = canvas.width;
    tmp.height = canvas.height;
    const ctx = tmp.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, tmp.width, tmp.height);
    ctx.drawImage(canvas, 0, 0);
    dataUrl = tmp.toDataURL('image/jpeg', 0.92);
  } else {
    dataUrl = canvas.toDataURL('image/png');
  }
  // Открыть в новом окне
  const win = window.open();
  win.document.write('<img src="' + dataUrl + '"/>');
}

// --- Сохранение результата через API ---
const notifyMsg = ref('');
const notifyError = ref(false);
async function saveResultImage() {
  const canvas = previewCanvas.value;
  if (!canvas) return;
  try {
    const dataUrl = canvas.toDataURL('image/png');
    // Отправляем base64 без data:image/png;base64,
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    await apiRequest('/event-images', {
      method: 'POST',
      body: {
        event_id: eventId,
        image_data: base64,
        template_id: selectedTemplateId.value,
        type: selectedType.value
      }
    });
    notifyMsg.value = 'Изображение успешно сохранено!';
    notifyError.value = false;
    setTimeout(() => notifyMsg.value = '', 3000);
  } catch (e) {
    notifyMsg.value = 'Ошибка при сохранении изображения.';
    notifyError.value = true;
    setTimeout(() => notifyMsg.value = '', 4000);
  }
}

// --- Галерея изображений события ---
const eventImages = ref([]);
const loadingImages = ref(false);
async function loadEventImages() {
  loadingImages.value = true;
  try {
    const res = await apiRequest(`/event-images?event_id=${eventId}`);
    eventImages.value = Array.isArray(res) ? res : (res?.data || []);
  } finally {
    loadingImages.value = false;
  }
}
// После успешного сохранения изображения — обновляем галерею
watch(notifyMsg, (val) => { if (val && !notifyError.value) loadEventImages(); });

// Обработчик события сохранения изображения из EventImageAdvancedEditor
const onImageSaved = () => {
  loadEventImages();
  notifyMsg.value = 'Изображение сохранено в галерею и доступно для выбора в Telegram-редакторе!';
  notifyError.value = false;
  setTimeout(() => notifyMsg.value = '', 3000);
};

// Функция открытия модалки выбора изображения из галереи
const openGallerySelector = () => {
  showGallerySelector.value = true;
  loadEventImages(); // Обновляем список изображений при открытии
};

function downloadImage(img) {
  const url = getImageUrl(img);
  const link = document.createElement('a');
  link.href = url;
  link.download = `event-image-${img.id}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
function copyImageUrl(img) {
  const url = getImageUrl(img);
  navigator.clipboard.writeText(url);
  notifyMsg.value = 'Ссылка скопирована!';
  notifyError.value = false;
  setTimeout(() => notifyMsg.value = '', 2000);
}
// --- Удаление изображения ---
const imageToDelete = ref(null);
function askDeleteImage(img) {
  imageToDelete.value = img;
  if (confirm('Удалить изображение?')) deleteImage(img);
}
async function deleteImage(img) {
  try {
    await apiRequest(`/event-images/${img.id}`, { method: 'DELETE' });
    notifyMsg.value = 'Изображение удалено.';
    notifyError.value = false;
    loadEventImages();
  } catch (e) {
    notifyMsg.value = 'Ошибка при удалении.';
    notifyError.value = true;
  }
}

// --- Галерея: выбор, предпросмотр, подстановка ---
const selectedGalleryImage = ref(null);
const previewModalImage = ref(null);
function selectGalleryImage(img) {
  selectedGalleryImage.value = img;
}
function setAsMainImage(img) {
  mainImageLocal.value = getImageUrl(img);
  notifyMsg.value = 'Изображение подставлено как основное.';
  notifyError.value = false;
  setTimeout(() => notifyMsg.value = '', 2000);
}
function openPreviewModal(img) {
  previewModalImage.value = img;
}
function closePreviewModal() {
  previewModalImage.value = null;
}

// --- Удаляем старые функции, которые больше не используются ---

// --- Telegram-пост: редактор, предпросмотр, вставка данных ---
const telegramText = ref('');
const telegramFormat = ref('markdown');

// --- Новые переменные для Telegram редактора ---
const showGallerySelector = ref(false);
const selectedTelegramImage = ref(null);
const selectedTelegramImagePreview = ref('');

// --- Функции для вставки данных события ---
const insertEventData = (field) => {
  let value = '';
  const d = props.eventData || {};
  
  if (field === 'title') value = d.title || '[Название события]';
  if (field === 'date') value = d.date_formatted ? formatEventDate(d.date_formatted) : '[Дата]';
  if (field === 'score') value = d.result || '[Счёт]';
  if (field === 'clubs') {
    const c1 = d.club1?.title || '';
    const c2 = d.club2?.title || '';
    value = c1 && c2 ? `${c1} — ${c2}` : '[Команды]';
  }
  if (field === 'arena') value = d.arena?.title || '[Арена]';
  if (field === 'sport') value = d.competition?.sport?.title || '[Вид спорта]';
  if (field === 'city') value = d.arena?.city?.title || d.club1?.city?.title || d.club2?.city?.title || '[Город]';
  if (field === 'about') value = d.about || '[Анонс]';
  if (field === 'tickets') value = d.tickets || '[Билеты]';
  if (field === 'report') value = d.report || '[Отчёт]';
  if (field === 'link') value = d.link || (d.id ? `${typeof window !== 'undefined' ? window.location.origin : ''}/events/${d.id}` : '[Ссылка]');
  
  // Вставляем в HTML редактор
  const currentText = telegramText.value;
  const newText = currentText + (currentText ? '\n' : '') + value;
  telegramText.value = newText;
};

// --- Функции для вставки шаблонов ---
const insertTemplate = async (templateType) => {
  try {
    const d = props.eventData || {};
    let templateText = '';
    
    switch (templateType) {
      case 'match_title':
        templateText = d.title || '[Название матча]';
        break;
      case 'competition':
        templateText = d.competition?.title || '[Соревнование]';
        break;
      case 'title':
        templateText = d.title || '[Title]';
        break;
      case 'match':
        templateText = d.title || d.name || d.event_name || d.full_name || '[Полное название матча]';
        break;
      case 'city_stadium':
        const city = d.arena?.city?.title || d.club1?.city?.title || d.club2?.city?.title || '[Город]';
        const stadium = d.arena?.title || '[Стадион]';
        templateText = `${city}. ${stadium}`;
        break;
      case 'match_full':
        // Матч - Город. Стадион - Составы
        const match = d.title || d.name || d.event_name || d.full_name || '[Полное название матча]';
        const cityFull = d.arena?.city?.title || d.club1?.city?.title || d.club2?.city?.title || '[Город]';
        const stadiumFull = d.arena?.title || '[Стадион]';
        
        templateText = `<p class="text-left mb-4" style="text-align: left"><strong>${match}</strong></p><p class="text-left mb-4" style="text-align: left"><em>${cityFull}. ${stadiumFull}</em></p><p class="text-left mb-4" style="text-align: left">&nbsp;</p>`;
        
        // Добавляем составы
        const club1Id = d.club1?.id;
        const club2Id = d.club2?.id;
        
                 if (club1Id || club2Id) {
           const lineups = [];
           
           if (club1Id) {
             try {
               const response1 = await apiRequest(`/events/${eventId}/lineups?club_id=${club1Id}`);
               const club1Lineups = Array.isArray(response1) ? response1 : (response1?.data || []);
               if (club1Lineups.length > 0) {
                 const club1Players = club1Lineups.map(player => {
                   const playerName = player.person ? player.person.full_name : player.player_name;
                   const number = player.number ? `${player.number}. ` : '';
                   const captain = player.is_captain ? ' (к)' : '';
                   return `${number}${playerName}${captain}`;
                 });
                 const club1Name = d.club1?.title || 'Команда 1';
                 const club1City = d.club1?.city?.title || '';
                 const club1NameWithCity = club1City ? `${club1Name} (${club1City})` : club1Name;
                 lineups.push(`<p class="text-left mb-4" style="text-align: left"><strong>${club1NameWithCity}:</strong> ${club1Players.join(', ')}</p>`);
               }
             } catch (error) {
               console.error('Ошибка загрузки состава команды 1:', error);
             }
           }
           
           if (club2Id) {
             try {
               const response2 = await apiRequest(`/events/${eventId}/lineups?club_id=${club2Id}`);
               const club2Lineups = Array.isArray(response2) ? response2 : (response2?.data || []);
               if (club2Lineups.length > 0) {
                 const club2Players = club2Lineups.map(player => {
                   const playerName = player.person ? player.person.full_name : player.player_name;
                   const number = player.number ? `${player.number}. ` : '';
                   const captain = player.is_captain ? ' (к)' : '';
                   return `${number}${playerName}${captain}`;
                 });
                 const club2Name = d.club2?.title || 'Команда 2';
                 const club2City = d.club2?.city?.title || '';
                 const club2NameWithCity = club2City ? `${club2Name} (${club2City})` : club2Name;
                 lineups.push(`<p class="text-left mb-4" style="text-align: left"><strong>${club2NameWithCity}:</strong> ${club2Players.join(', ')}</p>`);
               }
             } catch (error) {
               console.error('Ошибка загрузки состава команды 2:', error);
             }
           }
           
           if (lineups.length > 0) {
             templateText += lineups.join('');
           }
         }
        break;
      case 'match_events':
        // Матч - Город. Стадион - События
        const matchEvents = d.title || d.name || d.event_name || d.full_name || '[Полное название матча]';
        const cityEvents = d.arena?.city?.title || d.club1?.city?.title || d.club2?.city?.title || '[Город]';
        const stadiumEvents = d.arena?.title || '[Стадион]';
        
        templateText = `<p class="text-left mb-4" style="text-align: left"><strong>${matchEvents}</strong></p><p class="text-left mb-4" style="text-align: left"><em>${cityEvents}. ${stadiumEvents}</em></p><p class="text-left mb-4" style="text-align: left">&nbsp;</p>`;
        
        // Добавляем события
        const club1IdEvents = d.club1?.id;
        const club2IdEvents = d.club2?.id;
        
        if (club1IdEvents || club2IdEvents) {
          const club1Actions = [];
          const club2Actions = [];

          // Загружаем события для каждой команды отдельно
          try {
            if (club1IdEvents) {
              const response1 = await apiRequest(`/events/${eventId}/actions?club_id=${club1IdEvents}`);
              club1Actions.push(...(Array.isArray(response1) ? response1 : (response1?.data || [])));
            }
            
            if (club2IdEvents) {
              const response2 = await apiRequest(`/events/${eventId}/actions?club_id=${club2IdEvents}`);
              club2Actions.push(...(Array.isArray(response2) ? response2 : (response2?.data || [])));
            }
          } catch (error) {
            console.error('Ошибка загрузки событий:', error);
          }

          if (club1Actions.length > 0 || club2Actions.length > 0) {
            const events = [];
            
            if (club1Actions.length > 0) {
              const club1Events = club1Actions.map(action => formatEventText(action));
              events.push(club1Events.join(', '));
            }
            
            if (club2Actions.length > 0) {
              const club2Events = club2Actions.map(action => formatEventText(action));
              events.push(club2Events.join(', '));
            }
            
            if (events.length > 0) {
              templateText += `<p class="text-left mb-4" style="text-align: left">${events.join(' — ')}</p>`;
            }
          }
        }
        break;
      default:
        templateText = '[Шаблон не найден]';
    }
    
    // Вставляем в HTML редактор
    const currentText = telegramText.value;
    const newText = currentText + (currentText ? '\n\n' : '') + templateText;
    telegramText.value = newText;
  } catch (error) {
    console.error('Ошибка вставки шаблона:', error);
    alert('Ошибка вставки шаблона');
  }
};

// --- Функции для вставки составов команд ---
const insertLineupData = async (clubType, format) => {
  try {
    // Загружаем данные о составе команды
    const clubId = props.eventData?.[clubType]?.id;
    
    if (!clubId) {
      alert('Данные о команде не найдены');
      return;
    }

    const response = await apiRequest(`/events/${eventId}/lineups?club_id=${clubId}`);
    const lineups = Array.isArray(response) ? response : (response?.data || []);
    
    if (lineups.length === 0) {
      alert('Состав команды не найден');
      return;
    }

    let lineupText = '';
    const clubName = props.eventData[clubType]?.title || 'Команда';
    const clubCity = props.eventData[clubType]?.city?.title || '';
    const clubNameWithCity = clubCity ? `${clubName} (${clubCity})` : clubName;
    
    if (format === 'column') {
      lineupText = `<h3>${clubNameWithCity}</h3><ul>`;
      lineups.forEach(player => {
        const playerName = player.person ? player.person.full_name : player.player_name;
        const number = player.number ? `${player.number}. ` : '';
        const captain = player.is_captain ? ' (к)' : '';
        lineupText += `<li>${number}${playerName}${captain}</li>`;
      });
      lineupText += '</ul>';
    } else if (format === 'comma') {
      const players = lineups.map(player => {
        const playerName = player.person ? player.person.full_name : player.player_name;
        const number = player.number ? `${player.number}. ` : '';
        const captain = player.is_captain ? ' (к)' : '';
        return `${number}${playerName}${captain}`;
      });
      lineupText = `<p><strong>${clubNameWithCity}:</strong> ${players.join(', ')}</p>`;
    }

    const currentText = telegramText.value;
    const newText = currentText + (currentText ? '\n\n' : '') + lineupText;
    telegramText.value = newText;
  } catch (error) {
    console.error('Ошибка загрузки состава:', error);
    alert('Ошибка загрузки состава команды');
  }
};

// --- Функции для вставки событий команд ---
const insertTeamEvents = async (clubType, format = 'column') => {
  try {
    let eventsText = '';
    
    if (clubType === 'all') {
      // Загружаем события обеих команд
      const club1Id = props.eventData?.club1?.id;
      const club2Id = props.eventData?.club2?.id;
      
      if (!club1Id && !club2Id) {
        alert('Данные о командах не найдены');
        return;
      }

      const club1Actions = [];
      const club2Actions = [];

      // Загружаем события для каждой команды отдельно
      try {
        if (club1Id) {
          const response1 = await apiRequest(`/events/${eventId}/actions?club_id=${club1Id}`);
          club1Actions.push(...(Array.isArray(response1) ? response1 : (response1?.data || [])));
        }
        
        if (club2Id) {
          const response2 = await apiRequest(`/events/${eventId}/actions?club_id=${club2Id}`);
          club2Actions.push(...(Array.isArray(response2) ? response2 : (response2?.data || [])));
        }
      } catch (error) {
        console.error('Ошибка загрузки событий:', error);
      }

      if (club1Actions.length === 0 && club2Actions.length === 0) {
        alert('События команд не найдены');
        return;
      }

      if (format === 'column') {
        // Формат столбцами
        eventsText = '<h3>События команд</h3>';
        
        if (club1Actions.length > 0) {
          const club1Name = props.eventData?.club1?.title || 'Команда 1';
          eventsText += `<h4>${club1Name}</h4><ul>`;
          club1Actions.forEach(action => {
            eventsText += `<li>${formatEventText(action)}</li>`;
          });
          eventsText += '</ul>';
        }
        
        if (club2Actions.length > 0) {
          const club2Name = props.eventData?.club2?.title || 'Команда 2';
          eventsText += `<h4>${club2Name}</h4><ul>`;
          club2Actions.forEach(action => {
            eventsText += `<li>${formatEventText(action)}</li>`;
          });
          eventsText += '</ul>';
        }
      } else if (format === 'comma') {
        // Формат через запятую
        const club1Events = club1Actions.map(action => formatEventText(action));
        const club2Events = club2Actions.map(action => formatEventText(action));
        
        let commaText = '';
        
        if (club1Events.length > 0) {
          commaText += club1Events.join(', ');
        }
        
        if (club2Events.length > 0) {
          if (club1Events.length > 0) {
            commaText += ' — ';
          }
          commaText += club2Events.join(', ');
        }
        
        eventsText = `<p>${commaText}</p>`;
      }
    } else {
      // Старый формат для одной команды (для обратной совместимости)
      const clubId = props.eventData?.[clubType]?.id;
      if (!clubId) {
        alert('Данные о команде не найдены');
        return;
      }

      const response = await apiRequest(`/events/${eventId}/actions?club_id=${clubId}`);
      const actions = Array.isArray(response) ? response : (response?.data || []);
      
      if (actions.length === 0) {
        alert('События команды не найдены');
        return;
      }

      const clubName = props.eventData[clubType]?.title || 'Команда';
      eventsText = `<h3>События ${clubName}</h3><ul>`;
      
      actions.forEach(action => {
        eventsText += `<li>${formatEventText(action)}</li>`;
      });
      
      eventsText += '</ul>';
    }

    const currentText = telegramText.value;
    const newText = currentText + (currentText ? '\n\n' : '') + eventsText;
    telegramText.value = newText;
  } catch (error) {
    console.error('Ошибка загрузки событий:', error);
    alert('Ошибка загрузки событий команды');
  }
};

// Вспомогательная функция для форматирования текста события
const formatEventText = (action) => {
  const minute = action.minute ? `${action.minute}' ` : '';
  const playerName = action.person ? action.person.full_name : action.player_name || '';
  const actionType = action.action_type?.name || action.action_type?.title || action.type || '';
  const actionShortName = action.action_type?.short_name || '';
  const score = action.score || '';
  
  // Определяем тип события по названию или типу
  const isGoal = actionType.toLowerCase().includes('гол') || actionType.toLowerCase().includes('goal');
  const isFoul = actionType.toLowerCase().includes('фол') || actionType.toLowerCase().includes('foul') || 
                actionType.toLowerCase().includes('желтая') || actionType.toLowerCase().includes('красная') ||
                actionType.toLowerCase().includes('yellow') || actionType.toLowerCase().includes('red');
  const isPoints = actionType.toLowerCase().includes('очк') || actionType.toLowerCase().includes('point') ||
                  actionType.toLowerCase().includes('бросок') || actionType.toLowerCase().includes('shot');
  
  if (isGoal) {
    // Гол: минута' {краткое название} ({счет}) {Игрок}
    const scoreText = score ? ` (<strong>${score}</strong>)` : '';
    const actionName = actionShortName || '';
    return `${minute}${actionName}${scoreText} ${playerName}`;
  } else if (isFoul) {
    // Фол: минута' {краткое название} {Игрок}
    const actionName = actionShortName ? `<strong>${actionShortName}</strong>` : '';
    return `${minute}${actionName} ${playerName}`;
  } else if (isPoints) {
    // Очки: {Игрок} (целое значение)
    const pointsValue = action.value || 0;
    const pointsText = pointsValue ? ` (<strong>${Math.floor(pointsValue)}</strong>)` : '';
    return `${playerName}${pointsText}`;
  } else {
    // Остальные события: минута' {краткое название} {Игрок}
    const actionName = actionShortName || '';
    return `${minute}${actionName} ${playerName}`;
  }
};

// --- Функции для работы с изображениями ---
const getImageUrl = (img) => {
  let imageUrl = img.image_url || img.path;
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    const base = config.public.API_URL || '';
    if (!imageUrl.startsWith('/storage')) {
      imageUrl = '/storage/' + imageUrl.replace(/^\/+/, '');
    }
    imageUrl = base.replace(/\/$/, '') + imageUrl;
  }
  return imageUrl;
};

const selectEventImage = () => {
  if (mainImageLocal.value) {
    selectedTelegramImage.value = { type: 'url', url: mainImagePreview.value };
    selectedTelegramImagePreview.value = mainImagePreview.value;
  } else {
    alert('Изображение события не найдено');
  }
};

const selectImageFromGallery = (img) => {
  selectedTelegramImage.value = img;
  selectedTelegramImagePreview.value = getImageUrl(img);
  showGallerySelector.value = false;
};

const uploadCustomImage = () => {
  // Создаем скрытый input для загрузки файла
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      selectedTelegramImage.value = { type: 'file', file: file, name: file.name };
      selectedTelegramImagePreview.value = URL.createObjectURL(file);
    }
  };
  input.click();
};

const removeTelegramImage = () => {
  selectedTelegramImage.value = null;
  selectedTelegramImagePreview.value = '';
};

function insertEventField(field) {
  let value = '';
  const d = props.eventData || {};
  if (field === 'title') value = d.title || '[Название события]';
  if (field === 'date') value = d.date_formatted ? formatEventDate(d.date_formatted) : '[Дата]';
  if (field === 'score') value = d.result || '[Счёт]';
  if (field === 'clubs') {
    const c1 = d.club1?.title || '';
    const c2 = d.club2?.title || '';
    value = c1 && c2 ? `${c1} — ${c2}` : '[Команды]';
  }
  if (field === 'arena') value = d.arena?.title || '[Арена]';
  if (field === 'sport') value = d.competition?.sport?.title || '[Вид спорта]';
  if (field === 'city') value = d.arena?.city?.title || d.club1?.city?.title || d.club2?.city?.title || '[Город]';
  if (field === 'about') value = d.about || '[Анонс]';
  if (field === 'tickets') value = d.tickets || '[Билеты]';
  if (field === 'report') value = d.report || '[Отчёт]';
  if (field === 'link') value = d.link || (d.id ? `${typeof window !== 'undefined' ? window.location.origin : ''}/events/${d.id}` : '[Ссылка]');
  telegramText.value += (telegramText.value ? '\n' : '') + value;
}

// --- Удаляем старые функции шаблонов, так как теперь используется новый редактор ---

// --- Удаляем старые функции форматирования, так как теперь используется RichTextEditor ---
function copyTelegramText() {
  navigator.clipboard.writeText(telegramText.value);
  notifyMsg.value = 'Текст скопирован!';
  notifyError.value = false;
  setTimeout(() => notifyMsg.value = '', 2000);
}
function clearTelegramText() {
  telegramText.value = '';
}

// --- Telegram: выбор канала, предпросмотр, отправка поста ---

const telegramChannels = ref([]);
const selectedTelegramChannels = ref([]);
const sendingTelegram = ref(false);
const telegramSendResult = ref("");
const telegramSendError = ref(false);
const telegramPinMessage = ref(false);
const showTelegramPreviewModal = ref(false);
const telegramPreviewContent = ref("");

// Переключатели автоматических дополнений
const addEventLink = ref(true);
const addTelegramChannelLink = ref(true);

async function loadTelegramChannels() {
  try {
    const res = await apiRequest("/telegram/channels");
    telegramChannels.value = Array.isArray(res.data) ? res.data : (res || []);
  } catch (e) {
    telegramChannels.value = [];
  }
}
onMounted(loadTelegramChannels);



function convertToTelegramText(html) {
  if (!html) return '';
  
  let text = html;
  
  // Сохраняем переносы строк перед обработкой
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n');
  text = text.replace(/<\/div>/gi, '\n');
  text = text.replace(/<\/h[1-6]>/gi, '\n');
  text = text.replace(/<\/li>/gi, '\n');
  
  // Обрабатываем ссылки
  text = text.replace(/<a\s+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi, '[$2]($1)');
  
  // Обрабатываем жирный текст
  text = text.replace(/<(strong|b)>([^<]+)<\/(strong|b)>/gi, '*$2*');
  
  // Обрабатываем курсив
  text = text.replace(/<(em|i)>([^<]+)<\/(em|i)>/gi, '_$2_');
  
  // Обрабатываем заголовки
  text = text.replace(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi, '*$1*');
  
  // Обрабатываем списки
  text = text.replace(/<ul[^>]*>/gi, '');
  text = text.replace(/<\/ul>/gi, '');
  text = text.replace(/<ol[^>]*>/gi, '');
  text = text.replace(/<\/ol>/gi, '');
  text = text.replace(/<li[^>]*>([^<]+)<\/li>/gi, '• $1');
  
  // Обрабатываем горизонтальные линии
  text = text.replace(/<hr[^>]*>/gi, '\n➖➖➖➖➖➖➖➖➖➖\n');
  
  // Обрабатываем параграфы
  text = text.replace(/<p[^>]*>([^<]*)<\/p>/gi, '$1');
  
  // Удаляем все остальные HTML теги
  text = text.replace(/<[^>]*>/g, '');
  
  // Декодируем HTML сущности
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&copy;/g, '©')
    .replace(/&reg;/g, '®')
    .replace(/&trade;/g, '™');
  
  // Обрабатываем множественные переносы строк (сохраняем максимум 2 подряд)
  text = text.replace(/\n{3,}/g, '\n\n');
  
  // Убираем лишние пробелы в начале и конце строк
  text = text.split('\n').map(line => line.trim()).join('\n');
  
  // Убираем пустые строки в начале и конце
  text = text.replace(/^\n+/, '').replace(/\n+$/, '');
  
  // Добавляем автоматические дополнения
  const additions = [];
  
  // Ссылка на матч
  let eventUrl = '';
  if (addEventLink.value && props.eventData?.id) {
    // Используем SITE_URL из конфига
    const siteUrl = config.public.SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    eventUrl = `${siteUrl}/events/${props.eventData.id}`;
    // Используем простой URL без Markdown, Telegram автоматически сделает его кликабельным
    additions.push(`🔗 Подробнее: ${eventUrl}`);
  }
  
  // Ссылка на Telegram канал
  if (addTelegramChannelLink.value) {
    additions.push('Подпишись и будь в курсе спортивных событий Питера: @spbsportrep');
  }
  
  // Добавляем дополнения в конец текста
  if (additions.length > 0) {
    text += '\n\n' + additions.join('\n');
  }
  
  return text;
}

function showTelegramPreview() {
  const convertedText = convertToTelegramText(telegramText.value);
  telegramPreviewContent.value = convertedText;
  showTelegramPreviewModal.value = true;
}

async function sendTelegramPost() {
  if (!telegramText.value || selectedTelegramChannels.value.length === 0) return;
  sendingTelegram.value = true;
  telegramSendResult.value = "";
  telegramSendError.value = false;
  
  const results = [];
  const errors = [];
  
  try {
    for (const channelId of selectedTelegramChannels.value) {
      try {
        let payload;
        let isFile = false;
        let image = selectedTelegramImage.value;
        
        const convertedContent = convertToTelegramText(telegramText.value);
        
        if (image && image.file instanceof File) {
          isFile = true;
          payload = new FormData();
          payload.append('channel_id', channelId);
          payload.append('content', convertedContent);
          payload.append('settings', JSON.stringify({ pinMessage: telegramPinMessage.value }));
          payload.append('image', image.file, image.name || 'image.png');
          payload.append('parse_mode', 'Markdown');
        } else {
          payload = {
            channel_id: channelId,
            content: convertedContent,
            settings: { pinMessage: telegramPinMessage.value },
            image_url: image ? getImageUrl(image) : undefined,
            parse_mode: 'Markdown',
          };
        }
        
        const res = await apiRequest("/telegram/send", { method: "POST", body: payload });
        if (res && res.success !== false) {
          const channelName = telegramChannels.value.find(c => c.id == channelId)?.title || channelId;
          results.push(channelName);
        } else {
          const channelName = telegramChannels.value.find(c => c.id == channelId)?.title || channelId;
          errors.push(`${channelName}: ${res?.message || "Ошибка при отправке"}`);
        }
      } catch (e) {
        const channelName = telegramChannels.value.find(c => c.id == channelId)?.title || channelId;
        errors.push(`${channelName}: ${e?.message || "Ошибка при отправке"}`);
      }
    }
    
    if (results.length > 0) {
      telegramSendResult.value = `Пост успешно отправлен в каналы: ${results.join(', ')}`;
      telegramSendError.value = false;
      showTelegramPreviewModal.value = false;
      // Сбросить выбранное изображение после отправки
      selectedTelegramImage.value = null;
      selectedTelegramImagePreview.value = '';
      // Сбросить переключатели автоматических дополнений
      addEventLink.value = false;
      addTelegramChannelLink.value = false;
      notifyMsg.value = 'Изображение, форма и настройки сброшены после отправки.';
      notifyError.value = false;
      setTimeout(() => notifyMsg.value = '', 2000);
    }
    
    if (errors.length > 0) {
      telegramSendResult.value = (results.length > 0 ? telegramSendResult.value + '\n' : '') + 
        `Ошибки: ${errors.join('; ')}`;
      telegramSendError.value = true;
    }
    
    if (results.length === 0 && errors.length > 0) {
      telegramSendResult.value = `Ошибки при отправке: ${errors.join('; ')}`;
      telegramSendError.value = true;
    }
  } catch (e) {
    telegramSendResult.value = e?.message || "Ошибка при отправке.";
    telegramSendError.value = true;
  } finally {
    sendingTelegram.value = false;
  }
}

// --- Удаляем старые функции рендеринга, так как теперь используется RichTextEditor ---

// --- Галерея: массовые действия ---
const selectedImages = ref([]);
const allSelected = computed(() => selectedImages.value.length === eventImages.value.length && eventImages.value.length > 0);
function toggleSelectImage(id) {
  const idx = selectedImages.value.indexOf(id);
  if (idx === -1) selectedImages.value.push(id);
  else selectedImages.value.splice(idx, 1);
}
function toggleSelectAll() {
  if (allSelected.value) selectedImages.value = [];
  else selectedImages.value = eventImages.value.map(img => img.id);
}
async function massDelete() {
  if (!selectedImages.value.length) return;
  if (!confirm('Удалить выбранные изображения?')) return;
  for (const id of selectedImages.value) {
    const img = eventImages.value.find(i => i.id === id);
    if (img) await deleteImage(img);
  }
  selectedImages.value = [];
  loadEventImages();
}
function massDownload() {
  for (const id of selectedImages.value) {
    const img = eventImages.value.find(i => i.id === id);
    if (img) downloadImage(img);
  }
}
function massCopyLinks() {
  const links = selectedImages.value.map(id => {
    const img = eventImages.value.find(i => i.id === id);
    return img ? getImageUrl(img) : '';
  }).filter(Boolean);
  if (links.length) {
    navigator.clipboard.writeText(links.join('\n'));
    notifyMsg.value = 'Ссылки скопированы!';
    notifyError.value = false;
    setTimeout(() => notifyMsg.value = '', 2000);
  }
}

// --- Удаляем старые переменные и функции, которые больше не используются ---

// --- Управление шаблонами ---
const templateCrudType = ref(templateTypes[0]);
const crudTemplates = computed(() => templates.value.filter(t => t.type === templateCrudType.value));
const templateForm = ref({ name: '', width: '', height: '', file: null, preview: '' });
const editingTemplate = ref(null);
const showDeleteTemplateModal = ref(false);
const templateToDelete = ref(null);
function onTemplateFileChange(e) {
  const file = e.target.files[0];
  if (file) {
    templateForm.value.file = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
      templateForm.value.preview = ev.target.result;
    };
    reader.readAsDataURL(file);
  }
}
function editTemplate(tpl) {
  editingTemplate.value = tpl;
  templateForm.value = {
    name: tpl.name,
    width: tpl.width,
    height: tpl.height,
    file: null,
    preview: tpl.preview_path || tpl.path
  };
}
function cancelEditTemplate() {
  editingTemplate.value = null;
  templateForm.value = { name: '', width: '', height: '', file: null, preview: '' };
}
async function saveTemplateCrud() {
  const formData = new FormData();
  formData.append('name', templateForm.value.name);
  formData.append('type', templateCrudType.value);
  formData.append('width', templateForm.value.width);
  formData.append('height', templateForm.value.height);
  if (templateForm.value.file) formData.append('image', templateForm.value.file);
  if (editingTemplate.value) {
    // PUT
    await apiRequest(`/image-templates/${editingTemplate.value.id}`, { method: 'POST', body: formData });
  } else {
    // POST
    await apiRequest('/image-templates', { method: 'POST', body: formData });
  }
  await loadTemplates();
  cancelEditTemplate();
}
function askDeleteTemplate(tpl) {
  templateToDelete.value = tpl;
  showDeleteTemplateModal.value = true;
}
async function deleteTemplate() {
  if (!templateToDelete.value) return;
  await apiRequest(`/image-templates/${templateToDelete.value.id}`, { method: 'DELETE' });
  await loadTemplates();
  showDeleteTemplateModal.value = false;
  templateToDelete.value = null;
}

const openInfo = ref(false);
const detailsEl = ref(null);
onMounted(() => {
  if (detailsEl.value) {
    detailsEl.value.addEventListener('toggle', () => {
      openInfo.value = detailsEl.value.open;
    });
    openInfo.value = detailsEl.value.open;
  }
});

// --- Локальный функционал загрузки изображения (без модалки) ---
const imageFileInputRef = ref(null);
const isImageLoading = ref(false);
const currentError = ref('');
const showUrlInput = ref(false);
const urlInput = ref('');

const imagePreview = ref(''); // для превью

watch(imageLocal, (val) => {
  if (!val) {
    imagePreview.value = '';
    return;
  }
  if (typeof val === 'string') {
    imagePreview.value = val;
  } else if (val instanceof File) {
    imagePreview.value = URL.createObjectURL(val);
  } else {
    imagePreview.value = '';
  }
});

// --- Масштабирование изображения до 800x500 перед загрузкой ---
async function resizeImageTo800x500(file) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 800, 500);
      // Вычисляем пропорции для cover (заполнение с обрезкой и центрированием)
      const ratio = Math.max(800 / img.width, 500 / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;
      const offsetX = (800 - newWidth) / 2;
      const offsetY = (500 - newHeight) / 2;
      ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Ошибка масштабирования'));
        const scaledFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
        resolve(scaledFile);
      }, 'image/jpeg', 0.92);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.match('image.*')) {
    currentError.value = 'Пожалуйста, выберите файл изображения';
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    currentError.value = 'Размер файла не должен превышать 10MB';
    return;
  }
  isImageLoading.value = true;
  try {
    // Масштабируем до 800x500
    const scaledFile = await resizeImageTo800x500(file);
    mainImageLocal.value = scaledFile;
    currentError.value = '';
    forceHidePreview.value = false;
  } catch (err) {
    currentError.value = 'Ошибка масштабирования изображения';
  } finally {
    isImageLoading.value = false;
  }
}

async function handleUrlSubmit() {
  if (!urlInput.value) {
    currentError.value = 'Введите URL';
    return;
  }
  isImageLoading.value = true;
  currentError.value = '';
  try {
    let imageUrl = urlInput.value;
    // YouTube превью
    if (/youtube\.com|youtu\.be/.test(imageUrl)) {
      const videoId = imageUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
      if (!videoId) throw new Error('Неверный формат URL YouTube');
      imageUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    // VK/Rutube превью — можно добавить аналогично при необходимости
    // Прокси для CORS
    let fetchUrl = imageUrl;
    if (!/^data:/.test(imageUrl) && !imageUrl.startsWith(window.location.origin)) {
      fetchUrl = `${config.public.API_URL}/api/image-proxy`;
    }
    let response;
    if (fetchUrl === imageUrl) {
      response = await fetch(imageUrl);
    } else {
      response = await fetch(fetchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ url: imageUrl })
      });
    }
    if (!response.ok) throw new Error('Ошибка загрузки изображения');
    const blob = await response.blob();
    const file = new File([blob], 'downloaded-image.jpg', { type: blob.type, lastModified: Date.now() });
    mainImageLocal.value = file;
    isImageLoading.value = false;
    showUrlInput.value = false;
    urlInput.value = '';
    currentError.value = '';
  } catch (err) {
    currentError.value = err.message || 'Ошибка загрузки изображения';
    isImageLoading.value = false;
  }
}

async function deleteEventImage() {
  try {
    await apiRequest(`/events/${eventId}/image`, {
      method: 'DELETE'
    });
    mainImageLocal.value = '';
    mainImage.value = '';
    forceHidePreview.value = true;
    emit('update');
  } catch (err) {
    currentError.value = err.message || 'Ошибка удаления изображения';
  }
}

// УДАЛЯЮ watch на imageLocal для автосохранения изображения
// watch(imageLocal, async (val) => {
//   if (val === undefined || val === null || val === '') return;
//   try {
//     let payload;
//     let isFile = val instanceof File;
//     if (isFile) {
//       const formData = new FormData();
//       formData.append('image', val);
//       formData.append('about', aboutLocal.value);
//       formData.append('tickets', ticketsLocal.value);
//       formData.append('report', reportLocal.value);
//       await apiRequest(`/events/${eventId}`, {
//         method: 'PATCH',
//         body: formData
//       });
//     } else if (typeof val === 'string') {
//       payload = { image: val };
//       await apiRequest(`/events/${eventId}`, {
//         method: 'PATCH',
//         body: payload
//       });
//     }
//     await loadEvent();
//     currentError.value = '';
//   } catch (err) {
//     currentError.value = err.message || 'Ошибка сохранения изображения';
//   }
// });

const forceHidePreview = ref(false);

const mainImagePreview = computed(() => {
  if (forceHidePreview.value) return '';
  if (!mainImageLocal.value && props.eventData?.event_image_path) {
    return props.eventData.event_image_path;
  }
  if (typeof mainImageLocal.value === 'string') {
    if (!mainImageLocal.value) return '';
    if (/^https?:\/\//.test(mainImageLocal.value) || mainImageLocal.value.startsWith('/storage')) {
      return mainImageLocal.value;
    }
    // Исправление: если путь не начинается с /storage, добавляем его
    const base = config.public.API_URL || '';
    let path = mainImageLocal.value;
    if (!path.startsWith('/storage')) {
      path = '/storage/' + path.replace(/^\/+/, '');
    }
    return base.replace(/\/$/, '') + path;
  }
  if (mainImageLocal.value instanceof File) {
    return URL.createObjectURL(mainImageLocal.value);
  }
  return '';
});

watch(() => props.eventData, (val) => {
  if (!val?.image && !val?.event_image_path) {
    mainImageLocal.value = '';
    mainImage.value = '';
    forceHidePreview.value = false;
  }
});

watch(mainImageLocal, (val) => {
  // Логика отслеживания изменений mainImageLocal
});

const emit = defineEmits(['update', 'update:eventData']);

const FileClass = typeof window !== 'undefined' && typeof window.File !== 'undefined' ? window.File : Object;

</script>

<style scoped>
.event-advanced-editor {
  width: 100%;
}
details[open] > div > summary {
  border-bottom: 1px solid #60a5fa; /* blue-400 */
  border-radius: 0;
}
details > div > summary::-webkit-details-marker {
  display: none;
}
details > div > summary:after {
  content: '';
}
details:not([open]) > summary.summary-bordered {
  border-bottom: 1px solid #d1d5db; /* gray-300 */
}
details[open] > summary.summary-bordered {
  border-bottom: none;
}
</style> 