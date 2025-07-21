<template>
  <div v-if="isVisible && person" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">

    <div class="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
      <!-- Заголовок -->
      <div class="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 class="text-lg font-semibold">Управление изображениями: {{ personFullName }}</h3>
          <p class="text-sm text-gray-600 mt-1">
            Размер изображений: <span class="font-mono text-blue-600">{{ targetImageWidth }} × {{ targetImageHeight }}</span> пикселей
          </p>
        </div>
        <button 
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition-colors"
          title="Закрыть"
        >
          <Icon name="ph:x" size="1.5em" />
        </button>
      </div>

      <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        <!-- Форма загрузки изображений -->
        <div class="mb-6 p-4 bg-gray-50 rounded border">
          <h4 class="text-md font-medium mb-4">Загрузка изображений</h4>
          
          <!-- Настройки логотипа -->
          <div class="mb-4 p-3 bg-white rounded border">
            <h5 class="text-sm font-medium mb-3">Настройки логотипа</h5>
            
            <!-- Включение/выключение логотипа -->
            <div class="mb-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="logoSettings.enabled"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="text-sm font-medium text-gray-700">Добавить логотип на изображения</span>
              </label>
            </div>
            
            <!-- Настройки логотипа (показываются только если включен) -->
            <div v-if="logoSettings.enabled" class="space-y-3">
              <!-- Выбор источника логотипа -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Источник логотипа:</label>
                <div class="flex gap-3">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      v-model="logoSettings.source" 
                      value="default"
                      class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <span class="text-sm text-gray-700">Логотип по умолчанию</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      v-model="logoSettings.source" 
                      value="custom"
                      class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <span class="text-sm text-gray-700">Загрузить свой логотип</span>
                  </label>
                </div>
                
                <!-- Предварительный просмотр логотипа по умолчанию -->
                <div v-if="logoSettings.source === 'default' && getDefaultLogoUrl()" class="mt-2">
                  <div class="text-xs text-gray-600 mb-1">Предварительный просмотр:</div>
                  <img 
                    :src="getDefaultLogoUrl()" 
                    alt="Логотип по умолчанию"
                    class="w-16 h-16 object-contain border border-gray-300 rounded"
                  />
                </div>
                <div v-else-if="logoSettings.source === 'default'" class="mt-2 text-xs text-gray-500">
                  Логотип по умолчанию не найден
                </div>
              </div>
              
              <!-- Загрузка кастомного логотипа -->
              <div v-if="logoSettings.source === 'custom'">
                <label class="block text-sm font-medium text-gray-700 mb-2">Загрузить логотип:</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  @change="handleLogoFileSelect" 
                  class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <div v-if="logoSettings.customLogo" class="mt-2 text-sm text-gray-600">
                  Выбран: {{ logoSettings.customLogo.name }}
                </div>
              </div>
              
              <!-- Позиция логотипа -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Позиция логотипа:</label>
                <div class="grid grid-cols-2 gap-2">
                  <label class="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-gray-50">
                    <input 
                      type="radio" 
                      v-model="logoSettings.position" 
                      value="top-left"
                      class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <span class="text-sm text-gray-700">Лево верх</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-gray-50">
                    <input 
                      type="radio" 
                      v-model="logoSettings.position" 
                      value="top-right"
                      class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <span class="text-sm text-gray-700">Право верх</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-gray-50">
                    <input 
                      type="radio" 
                      v-model="logoSettings.position" 
                      value="bottom-left"
                      class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <span class="text-sm text-gray-700">Лево низ</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-gray-50">
                    <input 
                      type="radio" 
                      v-model="logoSettings.position" 
                      value="bottom-right"
                      class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <span class="text-sm text-gray-700">Право низ</span>
                  </label>
                </div>
              </div>
              
              <!-- Размер логотипа -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Размер логотипа (% от изображения):</label>
                <input 
                  type="range" 
                  v-model="logoSettings.size" 
                  min="5" 
                  max="30" 
                  step="1"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5%</span>
                  <span>{{ logoSettings.size }}%</span>
                  <span>30%</span>
                </div>
              </div>
              
              <!-- Прозрачность логотипа -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Прозрачность логотипа:</label>
                <input 
                  type="range" 
                  v-model="logoSettings.opacity" 
                  min="0.1" 
                  max="1" 
                  step="0.1"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10%</span>
                  <span>{{ Math.round(logoSettings.opacity * 100) }}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Индикатор прогресса -->
          <div v-if="uploadProgress.isUploading" class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium">Прогресс загрузки</span>
              <span class="text-sm text-gray-600">{{ uploadProgress.current }} / {{ uploadProgress.total }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                :style="{ width: uploadProgress.percentage + '%' }"
              ></div>
            </div>
            <div class="mt-2 text-sm text-gray-600">
              Загружается: {{ uploadProgress.currentFileName }}
            </div>
          </div>

          <!-- Вкладки для выбора способа загрузки -->
          <div class="mb-4">
            <div class="flex border-b border-gray-200">
              <button 
                @click="uploadMethod = 'file'"
                :class="[
                  'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                  uploadMethod === 'file' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                ]"
              >
                Загрузка файлов
              </button>
              <button 
                @click="uploadMethod = 'url'"
                :class="[
                  'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                  uploadMethod === 'url' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                ]"
              >
                Загрузка из URL
              </button>
            </div>
          </div>

          <!-- Загрузка файлов -->
          <div v-if="uploadMethod === 'file'">
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              @change="handleFileSelect" 
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div class="mt-2 text-sm text-gray-600">
              Выбрано файлов: {{ selectedFiles.length }}
            </div>
            <div class="mt-1 text-xs text-blue-600">
              Максимальный размер файла: 20MB
            </div>
            <!-- ПРЕДПРОСМОТР ВЫБРАННЫХ ФАЙЛОВ -->
            <div v-if="previewSelectedFiles.length" class="mt-3">
              <div class="text-xs text-gray-500 mb-1">Предпросмотр выбранных файлов:</div>
              <div class="flex flex-wrap gap-2">
                <div v-for="(file, idx) in previewSelectedFiles" :key="file.url" class="relative w-20 h-20 rounded overflow-hidden border bg-gray-100 flex items-center justify-center group">
                  <img :src="file.url" class="object-cover w-full h-full" />
                  <button @click="removePreviewFile(idx)" type="button" class="absolute top-1 right-1 bg-white bg-opacity-80 hover:bg-opacity-100 text-red-600 rounded-full p-1 shadow group-hover:opacity-100 opacity-80 transition" title="Удалить">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Загрузка из URL -->
          <div v-if="uploadMethod === 'url'">
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">URL изображения:</label>
                <input 
                  v-model="imageUrl"
                  type="url" 
                  placeholder="https://example.com/image.jpg"
                  class="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div class="flex gap-2">
                <button 
                  @click="addUrlToList"
                  :disabled="!imageUrl.trim()"
                  class="px-3 py-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded text-sm transition-colors"
                >
                  Добавить в список
                </button>
                <button 
                  @click="clearUrlList"
                  :disabled="!urlList.length"
                  class="px-3 py-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded text-sm transition-colors"
                >
                  Очистить список
                </button>
              </div>
              <div v-if="urlList.length > 0" class="mt-3">
                <div class="text-sm font-medium text-gray-700 mb-2">Список URL для загрузки:</div>
                <div class="space-y-2 max-h-32 overflow-y-auto">
                  <div 
                    v-for="(url, index) in urlList" 
                    :key="index"
                    class="flex items-center justify-between p-2 bg-white border rounded"
                  >
                    <span class="text-sm text-gray-600 truncate flex-1">{{ url }}</span>
                    <button 
                      @click="removeUrlFromList(index)"
                      class="ml-2 text-red-500 hover:text-red-700"
                    >
                      <Icon name="mynaui:trash" size="1.2em" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Кнопки загрузки -->
          <div class="mt-4 flex gap-2">
            <button 
              @click="uploadImages" 
              :disabled="!canUpload || uploading" 
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ uploading ? 'Загрузка...' : 'Загрузить' }}
            </button>
            <button 
              v-if="uploadProgress.isUploading"
              @click="cancelUpload" 
              class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Отменить загрузку
            </button>
            <button 
              @click="resetUploadForm" 
              :disabled="uploading"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Сбросить
            </button>
          </div>
        </div>

        <!-- Список изображений -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div 
            v-for="(image, index) in sortedImages" 
            :key="image.id"
            class="relative group"
            draggable="true"
            @dragstart="handleDragStart($event, image, index)"
            @dragover.prevent
            @drop="handleDrop($event, image, index)"
            @dragenter="handleDragEnter($event, index)"
            @dragleave="handleDragLeave($event)"
            @dragend="handleDragEnd"
          >
            <!-- Индикатор перетаскивания -->
            <div 
              v-if="draggedImage && draggedImage.id === image.id"
              class="absolute inset-0 bg-blue-200 bg-opacity-50 border-2 border-blue-500 rounded z-20"
            ></div>
            
            <!-- Индикатор места вставки -->
            <div 
              v-if="dragOverIndex === index && draggedImage && draggedImage.id !== image.id"
              class="absolute inset-0 bg-green-200 bg-opacity-50 border-2 border-green-500 rounded z-10"
            ></div>

            <!-- Индикатор главного изображения -->
            <div v-if="image.is_main" class="absolute top-2 right-2 z-10">
              <div class="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Главное
              </div>
            </div>

            <div class="aspect-[2/3] bg-gray-100 rounded overflow-hidden border">
              <img 
                :src="getImageUrl(image)" 
                :alt="image.title || 'Изображение'"
                class="w-full h-full object-cover"
                @error="handleImageError($event, image)"
                @load="handleImageLoad($event, image)"
              />
              <!-- Fallback для изображений, которые не загрузились -->
              <div v-if="!image.loaded && image.error" class="w-full h-full flex items-center justify-center bg-gray-200">
                <span class="i-mdi:image-off text-4xl text-gray-400"></span>
              </div>
            </div>

            <!-- Оверлей с действиями -->
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
              <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                <button 
                  @click="viewImageFullscreen(image)"
                  class="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded shadow-lg transition-colors"
                  title="Просмотр в полном размере"
                >
                  <Icon name="mdi:eye" size="1.2em" />
                </button>
                <button 
                  v-if="!image.is_main"
                  @click="setMainImage(image.id)"
                  :disabled="settingMainImage === image.id"
                  class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white p-2 rounded shadow-lg transition-colors"
                  title="Сделать главным"
                >
                  <Icon name="mynaui:star" size="1.2em" />
                </button>
                <button 
                  v-if="image.is_main"
                  @click="unsetMainImage(image.id)"
                  :disabled="unsettingMainImage === image.id"
                  class="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white p-2 rounded shadow-lg transition-colors"
                  title="Отменить главность"
                >
                  <Icon name="mdi:star-off" size="1.2em" />
                </button>
                <button 
                  @click="deleteImage(image.id)"
                  :disabled="deletingImage === image.id"
                  class="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white p-2 rounded shadow-lg transition-colors"
                  title="Удалить"
                >
                  <Icon name="mynaui:trash" size="1.2em" />
                </button>
              </div>
            </div>
          </div>
          
          <!-- Сообщение если изображений нет -->
          <div v-if="images.length === 0" class="col-span-full text-center py-8 text-gray-500">
            <span class="i-mdi:image text-2xl mb-2 block"></span>
            <p>У этого пользователя пока нет изображений</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка уведомлений -->
    <div v-if="notificationModal.show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div class="bg-white rounded-lg max-w-md w-full shadow-xl">
        <!-- Заголовок -->
        <div class="flex items-center gap-3 p-6 border-b border-gray-200">
          <div class="flex-shrink-0">
            <Icon 
              :name="getNotificationIcon(notificationModal.type)" 
              size="1.5em" 
              :class="getNotificationIconClass(notificationModal.type)"
            />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold" :class="getNotificationTitleClass(notificationModal.type)">
              {{ notificationModal.title }}
            </h3>
          </div>
          <button 
            @click="closeNotificationModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="ph:x" size="1.2em" />
          </button>
        </div>

        <!-- Содержимое -->
        <div class="p-6">
          <p class="text-gray-700 mb-4">{{ notificationModal.message }}</p>
          
          <!-- Детали ошибок (если есть) -->
          <div v-if="notificationModal.details && notificationModal.details.length > 0" class="mt-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Детали ошибок:</h4>
            <div class="max-h-32 overflow-y-auto space-y-2">
              <div 
                v-for="(error, index) in notificationModal.details" 
                :key="index"
                class="text-xs bg-red-50 border border-red-200 rounded p-2"
              >
                <div class="font-medium text-red-800">{{ error.file }}</div>
                <div class="text-red-600">{{ error.error }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопки -->
        <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button 
            v-if="notificationModal.type === 'warning'"
            @click="confirmAction(false)"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            Отмена
          </button>
          <button 
            v-if="notificationModal.type === 'warning'"
            @click="confirmAction(true)"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Подтвердить
          </button>
          <button 
            v-else
            @click="closeNotificationModal"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>

    <!-- Модалка просмотра изображения -->
    <div v-if="imageViewerModal.show" class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[70] p-4" @click="closeImageViewer">
      <div class="relative w-full h-full flex items-center justify-center" @click.stop>
        <!-- Кнопка закрытия -->
        <button 
          @click="closeImageViewer"
          class="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
          title="Закрыть (Esc)"
        >
          <Icon name="ph:x" size="1.5em" />
        </button>

        <!-- Кнопка предыдущего изображения -->
        <button 
          v-if="imageViewerModal.currentIndex > 0"
          @click="previousImage"
          class="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-colors"
          title="Предыдущее изображение (←)"
        >
          <Icon name="mdi:chevron-left" size="1.5em" />
        </button>

        <!-- Кнопка следующего изображения -->
        <button 
          v-if="imageViewerModal.currentIndex < sortedImages.length - 1"
          @click="nextImage"
          class="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-colors"
          title="Следующее изображение (→)"
        >
          <Icon name="mdi:chevron-right" size="1.5em" />
        </button>

        <!-- Информация об изображении -->
        <div class="absolute bottom-4 left-4 right-4 z-10 bg-black bg-opacity-50 text-white p-4 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold">{{ getCurrentImageTitle() }}</h3>
              <p class="text-sm text-gray-300">
                {{ imageViewerModal.currentIndex + 1 }} из {{ sortedImages.length }}
                <span v-if="getCurrentImage()?.is_main" class="ml-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                  Главное
                </span>
              </p>
            </div>
            <div class="flex gap-2">
              <button 
                v-if="!getCurrentImage()?.is_main"
                @click="setMainImageFromViewer"
                class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                title="Сделать главным"
              >
                <Icon name="mynaui:star" size="1em" class="mr-1" />
                Главное
              </button>
              <button 
                @click="downloadImage"
                class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                title="Скачать изображение"
              >
                <Icon name="mdi:download" size="1em" class="mr-1" />
                Скачать
              </button>
            </div>
          </div>
        </div>

        <!-- Изображение -->
        <img 
          :src="imageViewerModal.image" 
          :alt="getCurrentImageTitle()"
          class="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch } from 'vue';
import { useGlobalsStore } from '../../stores/globals';

const config = useRuntimeConfig()
const api = config.public.API_URL

// Props
const props = defineProps({
  person: {
    type: Object,
    required: false,
    default: null
  },
  isVisible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'saved'])

// Состояние
const images = ref([])
const loading = ref(false)
const selectedFiles = ref([])
const uploading = ref(false)
const selectedImages = ref([])
const deletingImage = ref(null)
const deletingSelectedImages = ref(false)
const settingMainImage = ref(null)
const unsettingMainImage = ref(null)

// Переменные для drag-and-drop
const draggedImage = ref(null)
const dragOverIndex = ref(null)
const isDragging = ref(false)

// Состояние прогресса загрузки
const uploadProgress = ref({
  current: 0,
  total: 0,
  percentage: 0,
  currentFileName: '',
  isUploading: false,
  canCancel: false
})

// Флаг для отмены загрузки
const cancelUploadFlag = ref(false)

// Флаг для выбора метода загрузки
const uploadMethod = ref('file')

// Флаг для настроек логотипа
const logoSettings = ref({
  enabled: false,
  source: 'default',
  customLogo: null,
  position: 'bottom-left',
  size: 20,
  opacity: 0.8
})

// Флаг для URL
const imageUrl = ref('')
const urlList = ref([])

// Состояния для модалок уведомлений
const notificationModal = ref({
  show: false,
  type: 'success', // success, error, warning, info
  title: '',
  message: '',
  details: null,
  onConfirm: null // Функция для выполнения при подтверждении
})

// Переменная для ожидания подтверждения
const pendingConfirmation = ref(null)

// Состояние для модалки просмотра изображения
const imageViewerModal = ref({
  show: false,
  image: null,
  currentIndex: 0
})

// Computed свойства
const allImagesSelected = computed(() => {
  return images.value.length > 0 && selectedImages.value.length === images.value.length
})

const sortedImages = computed(() => {
  return [...images.value].sort((a, b) => {
    // Сортировка только по позиции
    const posA = a.position || 0
    const posB = b.position || 0
    return posA - posB
  })
})

// Computed свойство для полного имени пользователя
const personFullName = computed(() => {
  if (!props.person) return 'Пользователь'
  
  const { last_name, first_name, middle_name } = props.person
  const parts = [last_name, first_name, middle_name].filter(Boolean)
  
  return parts.length > 0 ? parts.join(' ') : 'Пользователь'
})

// Computed свойство для проверки возможности загрузки
const canUpload = computed(() => {
  if (uploadMethod.value === 'file') {
    return selectedFiles.value.length > 0
  } else if (uploadMethod.value === 'url') {
    return urlList.value.length > 0
  }
  return false
})

// Computed свойства для размеров изображения
const targetImageWidth = computed(() => {
  return globalsStore.params.person_img_width || 500
})

const targetImageHeight = computed(() => {
  return globalsStore.params.person_img_height || 750
})

// --- ПРАВИЛЬНОЕ ОПРЕДЕЛЕНИЕ ПРЕДПРОСМОТРА ВЫБРАННЫХ ФАЙЛОВ ---
const previewSelectedFiles = computed(() => {
  if (!selectedFiles.value || !Array.isArray(selectedFiles.value) || !selectedFiles.value.length) return [];
  return selectedFiles.value.map(file => ({
    name: file.name,
    url: URL.createObjectURL(file)
  }));
});

// --- УДАЛЕНИЕ ФАЙЛА ИЗ ПРЕДПРОСМОТРА ---
function removePreviewFile(idx) {
  const file = selectedFiles.value[idx];
  if (file && file._previewUrl) {
    URL.revokeObjectURL(file._previewUrl);
  }
  selectedFiles.value.splice(idx, 1);
}

// Загрузка изображений пользователя
const loadImages = async () => {
  if (!props.person?.id) return
  
  try {
    loading.value = true
    const response = await $fetch(`${api}/api/people/${props.person.id}/images`)
    
    if (response.success && response.data) {
      images.value = response.data
    } else {
      images.value = []
    }
  } catch (error) {
    console.error('Ошибка загрузки изображений:', error)
    images.value = []
  } finally {
    loading.value = false
  }
}

// Обработка выбора файлов
const handleFileSelect = (event) => {
  const target = event.target
  if (target.files) {
    selectedFiles.value = Array.from(target.files)
  }
}

// Загрузка изображений
const uploadImages = async () => {
  if (!canUpload.value || !props.person?.id) return
  
  uploading.value = true
  cancelUploadFlag.value = false
  
  // Определяем общее количество файлов для загрузки
  let totalItems = 0
  if (uploadMethod.value === 'file') {
    totalItems = selectedFiles.value.length
  } else if (uploadMethod.value === 'url') {
    totalItems = urlList.value.length
  }
  
  uploadProgress.value = {
    current: 0,
    total: totalItems,
    percentage: 0,
    currentFileName: '',
    isUploading: true,
    canCancel: true
  }
  
  try {
    let uploadedCount = 0
    let errorCount = 0
    const errors = []
    
    if (uploadMethod.value === 'file') {
      // Загружаем файлы по одному
      for (let i = 0; i < selectedFiles.value.length; i++) {
        if (cancelUploadFlag.value) break
        
        const file = selectedFiles.value[i]
        
        // Обновляем прогресс
        uploadProgress.value.current = i + 1
        uploadProgress.value.percentage = Math.round(((i + 1) / totalItems) * 100)
        uploadProgress.value.currentFileName = file.name
        
        try {
          const formData = new FormData()
          formData.append('image', file)
          
          // Добавляем настройки логотипа если он включен
          if (logoSettings.value.enabled) {
            console.log('Logo settings:', logoSettings.value)
            formData.append('logo_enabled', '1')
            formData.append('logo_position', logoSettings.value.position)
            formData.append('logo_size', logoSettings.value.size.toString())
            formData.append('logo_opacity', logoSettings.value.opacity.toString())
            
            if (logoSettings.value.source === 'custom' && logoSettings.value.customLogo) {
              console.log('Using custom logo:', logoSettings.value.customLogo.name)
              formData.append('custom_logo', logoSettings.value.customLogo)
            } else if (logoSettings.value.source === 'default') {
              // Передаем URL логотипа на бэкенд для загрузки
              const defaultLogoUrl = getDefaultLogoUrl()
              if (defaultLogoUrl) {
                console.log('Using default logo URL:', defaultLogoUrl)
                formData.append('default_logo_url', defaultLogoUrl)
              }
            }
          } else {
            console.log('Logo disabled')
          }
          
          // Добавляем параметры размера изображения из globalStore
          const targetWidth = globalsStore.params.person_img_width || 500
          const targetHeight = globalsStore.params.person_img_height || 750
          formData.append('target_width', targetWidth.toString())
          formData.append('target_height', targetHeight.toString())
          
          const response = await $fetch(`${api}/api/people/${props.person.id}/images`, {
            method: 'POST',
            body: formData
          })
          
          if (response.success) {
            uploadedCount++
          } else {
            errorCount++
            errors.push({
              file: file.name,
              error: response.message || 'Неизвестная ошибка'
            })
          }
        } catch (error) {
          errorCount++
          const errorMessage = error.message || 'Неизвестная ошибка'
          errors.push({
            file: file.name,
            error: errorMessage
          })
        }
        
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } else if (uploadMethod.value === 'url') {
      // Загружаем изображения из URL по одному
      for (let i = 0; i < urlList.value.length; i++) {
        if (cancelUploadFlag.value) break
        
        const url = urlList.value[i]
        
        // Обновляем прогресс
        uploadProgress.value.current = i + 1
        uploadProgress.value.percentage = Math.round(((i + 1) / totalItems) * 100)
        uploadProgress.value.currentFileName = url
        
        try {
          const formData = new FormData()
          formData.append('image_url', url)
          
          // Добавляем настройки логотипа если он включен
          if (logoSettings.value.enabled) {
            console.log('Logo settings:', logoSettings.value)
            formData.append('logo_enabled', '1')
            formData.append('logo_position', logoSettings.value.position)
            formData.append('logo_size', logoSettings.value.size.toString())
            formData.append('logo_opacity', logoSettings.value.opacity.toString())
            
            if (logoSettings.value.source === 'custom' && logoSettings.value.customLogo) {
              console.log('Using custom logo:', logoSettings.value.customLogo.name)
              formData.append('custom_logo', logoSettings.value.customLogo)
            } else if (logoSettings.value.source === 'default') {
              // Передаем URL логотипа на бэкенд для загрузки
              const defaultLogoUrl = getDefaultLogoUrl()
              if (defaultLogoUrl) {
                console.log('Using default logo URL:', defaultLogoUrl)
                formData.append('default_logo_url', defaultLogoUrl)
              }
            }
          } else {
            console.log('Logo disabled')
          }
          
          // Добавляем параметры размера изображения из globalStore
          const targetWidth = globalsStore.params.person_img_width || 500
          const targetHeight = globalsStore.params.person_img_height || 750
          formData.append('target_width', targetWidth.toString())
          formData.append('target_height', targetHeight.toString())
          
          const response = await $fetch(`${api}/api/people/${props.person.id}/images`, {
            method: 'POST',
            body: formData
          })
          
          if (response.success) {
            uploadedCount++
          } else {
            errorCount++
            errors.push({
              file: url,
              error: response.message || 'Неизвестная ошибка'
            })
          }
        } catch (error) {
          errorCount++
          const errorMessage = error.message || 'Неизвестная ошибка'
          errors.push({
            file: url,
            error: errorMessage
          })
        }
        
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    // Формируем итоговое сообщение
    if (uploadedCount === totalItems) {
      showNotification(
        'success',
        'Загрузка завершена',
        `Успешно загружено все ${uploadedCount} изображений!`,
        null
      )
    } else if (uploadedCount > 0) {
      showNotification(
        'warning',
        'Загрузка завершена частично',
        `Загружено ${uploadedCount} из ${totalItems} изображений. Ошибок: ${errorCount}`,
        errors
      )
    } else {
      showNotification(
        'error',
        'Ошибка загрузки',
        `Не удалось загрузить ни одного изображения. Ошибок: ${errorCount}`,
        errors
      )
    }
    
    // Обновляем список изображений
    await loadImages()
    resetUploadForm()
    
    // Уведомляем родительский компонент об изменении
    emit('saved')
  } catch (error) {
    showNotification(
      'error',
      'Критическая ошибка',
      'Критическая ошибка загрузки: ' + (error.message || 'Неизвестная ошибка'),
      null
    )
  } finally {
    uploading.value = false
    uploadProgress.value.isUploading = false
  }
}

// Функция отмены загрузки
const cancelUpload = () => {
  cancelUploadFlag.value = true
  uploadProgress.value.isUploading = false
  uploading.value = false
  selectedFiles.value = []
  resetLogoSettings()
}

// Удаление изображения
const deleteImage = async (imageId) => {
  if (!props.person?.id) return
  
  const confirmed = await showConfirmation(
    'Подтверждение удаления',
    'Вы уверены, что хотите удалить это изображение?'
  )
  
  if (!confirmed) return
  
  try {
    deletingImage.value = imageId
    await $fetch(`${api}/api/people/${props.person.id}/images/${imageId}`, {
      method: 'DELETE'
    })
    
    await loadImages()
    showNotification(
      'success',
      'Изображение удалено',
      'Изображение успешно удалено',
      null
    )
    // Уведомляем родительский компонент об изменении
    emit('saved')
  } catch (error) {
    showNotification(
      'error',
      'Ошибка удаления',
      'Ошибка удаления изображения: ' + (error.message || 'Неизвестная ошибка'),
      null
    )
  } finally {
    deletingImage.value = null
  }
}

// Удаление выбранных изображений
const deleteSelectedImages = async () => {
  if (!props.person?.id || selectedImages.value.length === 0) return
  
  const confirmed = await showConfirmation(
    'Подтверждение удаления',
    `Вы уверены, что хотите удалить ${selectedImages.value.length} выбранных изображений?`
  )
  
  if (!confirmed) return
  
  try {
    deletingSelectedImages.value = true
    await $fetch(`${api}/api/people/${props.person.id}/images/delete-multiple`, {
      method: 'POST',
      body: {
        image_ids: selectedImages.value
      }
    })
    
    await loadImages()
    selectedImages.value = []
    showNotification(
      'success',
      'Изображения удалены',
      `${selectedImages.value.length} изображений успешно удалены`,
      null
    )
    // Уведомляем родительский компонент об изменении
    emit('saved')
  } catch (error) {
    showNotification(
      'error',
      'Ошибка удаления',
      'Ошибка удаления выбранных изображений: ' + (error.message || 'Неизвестная ошибка'),
      null
    )
  } finally {
    deletingSelectedImages.value = false
  }
}

// Установка главного изображения
const setMainImage = async (imageId) => {
  if (!props.person?.id) return
  
  try {
    settingMainImage.value = imageId
    await $fetch(`${api}/api/people/${props.person.id}/images/${imageId}/set-main`, {
      method: 'POST'
    })
    
    await loadImages()
    showNotification(
      'success',
      'Главное изображение установлено',
      'Изображение успешно установлено как главное',
      null
    )
    // Уведомляем родительский компонент об изменении
    emit('saved')
  } catch (error) {
    showNotification(
      'error',
      'Ошибка установки',
      'Ошибка установки главного изображения: ' + (error.message || 'Неизвестная ошибка'),
      null
    )
  } finally {
    settingMainImage.value = null
  }
}

// Отмена главности изображения
const unsetMainImage = async (imageId) => {
  if (!props.person?.id) return
  
  try {
    unsettingMainImage.value = imageId
    await $fetch(`${api}/api/people/${props.person.id}/images/${imageId}/unset-main`, {
      method: 'POST'
    })
    
    await loadImages()
    showNotification(
      'success',
      'Главность отменена',
      'Главность изображения успешно отменена',
      null
    )
    // Уведомляем родительский компонент об изменении
    emit('saved')
  } catch (error) {
    showNotification(
      'error',
      'Ошибка отмены',
      'Ошибка отмены главности изображения: ' + (error.message || 'Неизвестная ошибка'),
      null
    )
  } finally {
    unsettingMainImage.value = null
  }
}

// Функция для выбора всех изображений
const toggleSelectAll = () => {
  selectedImages.value = allImagesSelected.value ? [] : images.value.map(i => i.id)
}

// Функции для обработки ошибок и загрузки изображений
const handleImageError = (event, image) => {
  image.error = true
  image.loaded = false
}

const handleImageLoad = (event, image) => {
  image.loaded = true
  image.error = false
}

// Функция для получения корректного URL изображения
const getImageUrl = (image) => {
  if (image.image_url && typeof image.image_url === 'string' && image.image_url.startsWith('http')) {
    return image.image_url
  }
  if (image.image && typeof image.image === 'string' && image.image.startsWith('http')) {
    return image.image
  }
  
  if (image.image_url) {
    return `${api}/storage/${image.image_url}`
  }
  if (image.image) {
    return `${api}/storage/${image.image}`
  }
  
  return ''
}

// Функции для drag-and-drop
const handleDragStart = (event, image, index) => {
  if (!event.dataTransfer) return
  
  draggedImage.value = image
  isDragging.value = true
  dragOverIndex.value = null
  
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', image.id.toString())
  
  if (event.target) {
    event.target.style.opacity = '0.5'
  }
}

const handleDrop = async (event, targetImage, targetIndex) => {
  event.preventDefault()
  
  if (!draggedImage.value || !props.person?.id) return
  
  const draggedIndex = sortedImages.value.findIndex(img => img.id === draggedImage.value?.id)
  
  if (draggedIndex === -1 || draggedIndex === targetIndex) {
    handleDragEnd()
    return
  }
  
  try {
    const images = [...sortedImages.value]
    const [draggedItem] = images.splice(draggedIndex, 1)
    images.splice(targetIndex, 0, draggedItem)
    
    await updateImagePositions(images)
    await loadImages()
    
    // Уведомляем родительский компонент об изменении
    emit('saved')
  } catch (error) {
    showNotification(
      'error',
      'Ошибка обновления',
      'Ошибка обновления порядка изображений: ' + (error.message || 'Неизвестная ошибка'),
      null
    )
  } finally {
    handleDragEnd()
  }
}

const handleDragEnter = (event, index) => {
  if (!draggedImage.value) return
  
  dragOverIndex.value = index
  
  const targetElement = event.target
  if (targetElement) {
    targetElement.classList.add('dragging')
  }
}

const handleDragLeave = (event) => {
  if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget)) {
    dragOverIndex.value = null
  }
  
  document.querySelectorAll('.dragging').forEach(el => {
    el.style.opacity = '1'
    el.classList.remove('dragging')
  })
}

const handleDragEnd = () => {
  draggedImage.value = null
  dragOverIndex.value = null
  isDragging.value = false
  
  document.querySelectorAll('.dragging').forEach(el => {
    el.style.opacity = '1'
    el.classList.remove('dragging')
  })
}

// Функция для обновления позиций изображений
const updateImagePositions = async (images) => {
  if (!props.person?.id) return
  
  const positionUpdates = images.map((image, index) => ({
    image_id: image.id,
    position: index + 1
  }))
  
  await $fetch(`${api}/api/people/${props.person.id}/images/update-positions`, {
    method: 'POST',
    body: {
      positions: positionUpdates
    }
  })
}

// Функции для работы с URL
const addUrlToList = () => {
  if (imageUrl.value.trim() && !urlList.value.includes(imageUrl.value.trim())) {
    urlList.value.push(imageUrl.value.trim())
    imageUrl.value = ''
  }
}

const removeUrlFromList = (index) => {
  urlList.value.splice(index, 1)
}

const clearUrlList = () => {
  urlList.value = []
}

// Функции для работы с логотипом
const handleLogoFileSelect = (event) => {
  const target = event.target
  if (target.files && target.files.length > 0) {
    logoSettings.value.customLogo = target.files[0]
  }
}

const globalsStore = useGlobalsStore();
const { images: globalImages } = storeToRefs(globalsStore);

const getDefaultLogoUrl = () => {
  console.log('getDefaultLogoUrl called, globalImages:', globalImages.value)
  
  // Приоритет 1: person_logo (основной параметр для логотипа персон)
  if (globalImages.value && globalImages.value.person_logo) {
    console.log('Found person_logo:', globalImages.value.person_logo)
    return globalImages.value.person_logo;
  }
  
  // Приоритет 2: photo_image (fallback)
  if (globalImages.value && globalImages.value.photo_image) {
    console.log('Found photo_image:', globalImages.value.photo_image)
    return globalImages.value.photo_image;
  }
  
  console.log('Логотип не найден')
  return null;
};

const resetLogoSettings = () => {
  logoSettings.value = {
    enabled: false,
    source: 'default',
    customLogo: null,
    position: 'bottom-left',
    size: 20,
    opacity: 0.8
  }
}

const resetUploadForm = () => {
  // Очищаем blob-URL при сбросе
  if (selectedFiles.value && selectedFiles.value.length) {
    selectedFiles.value.forEach(file => {
      if (file && file._previewUrl) {
        URL.revokeObjectURL(file._previewUrl);
      }
    });
  }
  selectedFiles.value = []
  urlList.value = []
  imageUrl.value = ''
  uploadMethod.value = 'file'
  resetLogoSettings()
}

// Функция для закрытия модального окна
const closeModal = () => {
  emit('close')
}

// Функции для работы с модалками уведомлений
const showNotification = (type, title, message, details = null, onConfirm = null) => {
  notificationModal.value = {
    show: true,
    type,
    title,
    message,
    details,
    onConfirm
  }
}

const closeNotificationModal = () => {
  notificationModal.value.show = false
  if (pendingConfirmation.value) {
    pendingConfirmation.value(false)
    pendingConfirmation.value = null
  }
}

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success': return 'mdi:check-circle'
    case 'error': return 'mdi:alert-circle'
    case 'warning': return 'mdi:alert'
    case 'info': return 'mdi:information'
    default: return 'mdi:information'
  }
}

const getNotificationIconClass = (type) => {
  switch (type) {
    case 'success': return 'text-green-500'
    case 'error': return 'text-red-500'
    case 'warning': return 'text-yellow-500'
    case 'info': return 'text-blue-500'
    default: return 'text-blue-500'
  }
}

const getNotificationTitleClass = (type) => {
  switch (type) {
    case 'success': return 'text-green-800'
    case 'error': return 'text-red-800'
    case 'warning': return 'text-yellow-800'
    case 'info': return 'text-blue-800'
    default: return 'text-gray-800'
  }
}

// Инициализация
onMounted(async () => {
  // Загружаем глобальные параметры если они еще не загружены
  if (Object.keys(globalsStore.params).length === 0) {
    await globalsStore.fetchData()
  }
  loadImages()
})

// Следим за изменением видимости модалки
watch(() => props.isVisible, async (newValue) => {
  if (newValue && props.person) {
    // Загружаем глобальные параметры если они еще не загружены
    if (Object.keys(globalsStore.params).length === 0) {
      await globalsStore.fetchData()
    }
    loadImages()
  }
})

// Функция подтверждения действия
const confirmAction = async (confirmed) => {
  if (pendingConfirmation.value) {
    pendingConfirmation.value(confirmed)
    pendingConfirmation.value = null
  }
  closeNotificationModal()
}

// Функция для показа модалки подтверждения
const showConfirmation = (title, message) => {
  return new Promise((resolve) => {
    pendingConfirmation.value = resolve
    showNotification('warning', title, message, null, null)
  })
}

// Функция закрытия модалки просмотра изображения
const closeImageViewer = () => {
  imageViewerModal.value.show = false
  // Удаляем обработчик клавиатуры
  document.removeEventListener('keydown', handleImageViewerKeydown)
}

// Функция для просмотра изображения в полном разрешении
const viewImageFullscreen = (image) => {
  const index = sortedImages.value.findIndex(img => img.id === image.id)
  imageViewerModal.value = {
    show: true,
    image: getImageUrl(image),
    currentIndex: index >= 0 ? index : 0
  }
  
  // Добавляем обработчик клавиатуры
  document.addEventListener('keydown', handleImageViewerKeydown)
}

// Обработчик клавиатуры для модалки просмотра
const handleImageViewerKeydown = (event) => {
  if (!imageViewerModal.value.show) return
  
  switch (event.key) {
    case 'Escape':
      closeImageViewer()
      break
    case 'ArrowLeft':
      if (imageViewerModal.value.currentIndex > 0) {
        previousImage()
      }
      break
    case 'ArrowRight':
      if (imageViewerModal.value.currentIndex < sortedImages.value.length - 1) {
        nextImage()
      }
      break
  }
}

// Функция для получения текущего изображения
const getCurrentImage = () => {
  if (imageViewerModal.value.currentIndex >= 0 && imageViewerModal.value.currentIndex < sortedImages.value.length) {
    return sortedImages.value[imageViewerModal.value.currentIndex]
  }
  return null
}

// Функция для получения заголовка текущего изображения
const getCurrentImageTitle = () => {
  const image = getCurrentImage()
  return image?.title || 'Без названия'
}

// Функция для установки главного изображения из модалки просмотра
const setMainImageFromViewer = async () => {
  const image = getCurrentImage()
  if (image) {
    await setMainImage(image.id)
  }
}

// Функция для скачивания изображения
const downloadImage = () => {
  const image = getCurrentImage()
  if (image && image.image_url) {
    window.open(getImageUrl(image), '_blank')
  }
}

// Функция для получения предыдущего изображения
const previousImage = () => {
  if (imageViewerModal.value.currentIndex > 0) {
    imageViewerModal.value.currentIndex--
    const image = sortedImages.value[imageViewerModal.value.currentIndex]
    if (image) {
      imageViewerModal.value.image = getImageUrl(image)
    }
  }
}

// Функция для получения следующего изображения
const nextImage = () => {
  if (imageViewerModal.value.currentIndex < sortedImages.value.length - 1) {
    imageViewerModal.value.currentIndex++
    const image = sortedImages.value[imageViewerModal.value.currentIndex]
    if (image) {
      imageViewerModal.value.image = getImageUrl(image)
    }
  }
}
</script>

<style scoped>
/* Стили для drag-and-drop */
.dragging {
  opacity: 0.5;
  transform: scale(0.95);
  transition: all 0.2s ease;
}

/* Стили для индикаторов перетаскивания */
.drag-indicator {
  transition: all 0.2s ease;
}

/* Стили для элементов, которые можно перетаскивать */
[draggable="true"] {
  cursor: grab;
}

[draggable="true"]:active {
  cursor: grabbing;
}
</style>