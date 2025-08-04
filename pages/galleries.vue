<template>
  <header class="bg-gray-50 shadow-sm border-b border-gray-300">
    <div class="px-6 pt-4">
      <div class="flex items-start justify-between">
        <Head :breadcrumbs="breadcrumbs" :icon="p_icon" :title="p_description" show_breadcrumbs="true"/>
      </div>
    </div>
  </header>

  <div v-if="isAuthenticated" class="min-h-full text-gray-900">
    <div class="flex h-screen">
      <!-- Левая панель - список галерей -->
      <div class="w-1/3 border-r border-gray-300 bg-gray-50">
        <div class="p-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-800">Галереи</h2>
            <button 
              @click="showAddGalleryForm = true"
              class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              + Добавить галерею
            </button>
          </div>

          <!-- Строка поиска галерей -->
          <div class="mb-4">
            <div class="relative">
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="Поиск по названию галереи..."
                class="w-full p-2 pl-8 pr-8 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Icon name="mynaui:search" size="1.2em" class="text-gray-400" />
              </div>
              <button 
                v-if="searchQuery"
                @click="clearSearch"
                class="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                title="Очистить поиск"
              >
                <Icon name="mynaui:x" size="1.2em" />
              </button>
            </div>
            <div v-if="searchQuery" class="mt-1 text-xs text-gray-500">
              Найдено: {{ filteredAndSortedGalleries.length }} из {{ galleries.length }}
            </div>
          </div>

          <!-- Форма добавления галереи -->
          <div v-if="showAddGalleryForm" class="mb-4 p-3 bg-white rounded border">
            <div class="flex items-center gap-2 mb-2">
              <input 
                v-model="newGalleryTitle"
                placeholder="Название галереи"
                class="flex-1 p-2 border border-gray-300 rounded text-sm"
                @keyup.enter="addGallery"
              />
              <button 
                @click="addGallery"
                :disabled="addingGallery"
                class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                {{ addingGallery ? 'Сохранение...' : 'Сохранить' }}
              </button>
              <button 
                @click="showAddGalleryForm = false"
                class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>

          <!-- Индикатор загрузки галерей -->
          <div v-if="loadingGalleries" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>

          <!-- Список галерей -->
          <div v-else class="space-y-2">
            <div 
              v-for="gallery in paginatedGalleries" 
              :key="gallery.id"
              @click="selectGallery(gallery)"
              :class="[
                'p-3 rounded cursor-pointer transition-colors group',
                selectedGallery?.id === gallery.id 
                  ? 'bg-blue-100 border-blue-300 border' 
                  : 'bg-white hover:bg-gray-100 border border-gray-200'
              ]"
            >
              <div class="flex justify-between items-center">
                <div class="flex-1 min-w-0">
                  <span class="font-medium text-gray-800 truncate">{{ gallery.title }}</span>
                </div>
                <button 
                  @click.stop="deleteGallery(gallery.id)"
                  :disabled="deletingGallery === gallery.id"
                  class="text-red-500 hover:text-red-700 disabled:text-gray-400 text-sm ml-2"
                >
                  <span v-if="deletingGallery === gallery.id">Удаление...</span>
                  <Icon v-else name="mynaui:trash" size="1.5em" />
                </button>
              </div>
            </div>
            
            <!-- Сообщение если галерей нет -->
            <div v-if="filteredAndSortedGalleries.length === 0" class="text-center py-8 text-gray-500">
              <span class="i-mdi:image-multiple text-2xl mb-2 block"></span>
              <p v-if="searchQuery">По запросу "{{ searchQuery }}" галереи не найдены</p>
              <p v-else>Галереи не найдены</p>
            </div>
          </div>

          <!-- Пагинация -->
          <div v-if="filteredAndSortedGalleries.length > itemsPerPage" class="mt-4 flex justify-center">
            <div class="flex items-center gap-2">
              <button 
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ←
              </button>
              
              <span class="text-sm text-gray-600">
                {{ currentPage }} из {{ totalPages }}
              </span>
              
              <button 
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Правая панель - изображения галереи -->
      <div class="w-2/3 bg-white">
        <div v-if="selectedGallery" class="p-6">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-3">
              <div v-if="editingGalleryId === selectedGallery.id" class="flex items-center gap-2">
                <input 
                  v-model="editingGalleryTitle"
                  @keyup.enter="saveGalleryEdit"
                  @keyup.esc="cancelGalleryEdit"
                  class="text-xl text-gray-800 p-2 border border-blue-300 rounded min-w-[300px]"
                  ref="galleryTitleInput"
                />
                <button 
                  @click="saveGalleryEdit"
                  class="text-green-600 hover:text-green-800 text-sm"
                >
                  ✓
                </button>
                <button 
                  @click="cancelGalleryEdit"
                  class="text-red-600 hover:text-red-800 text-sm"
                >
                  ✕
                </button>
              </div>
              <div v-else class="flex items-center gap-2">
                <h3 class="text-xl font-semibold text-gray-800">
                  Изображения галереи: {{ selectedGallery.title }}
                </h3>
                <button 
                  @click="startGalleryEdit(selectedGallery)"
                  class="text-blue-500 hover:text-blue-700 text-sm"
                  title="Редактировать название галереи"
                >
                  <Icon name="line-md:edit" size="1.5em" />
                </button>
              </div>
            </div>
            <div class="flex gap-2">
              <button 
                @click="showUploadForm = true"
                class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
              >
                + Загрузить изображения
              </button>
            </div>
          </div>

          <!-- Панель управления изображениями -->
          <div v-if="galleryImages.length > 0" class="mb-4 p-3 bg-gray-50 rounded border">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    :checked="allImagesSelected"
                    @change="toggleSelectAll"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span class="text-sm font-medium text-gray-700">
                    {{ allImagesSelected ? 'Снять выделение' : 'Выбрать все' }}
                  </span>
                </label>
                <span v-if="selectedImages.length > 0" class="text-sm text-gray-600">
                  Выбрано: {{ selectedImages.length }} из {{ galleryImages.length }}
                </span>
              </div>
            </div>
          </div>

          <!-- Панель действий с выбранными изображениями -->
          <div v-if="selectedImages.length > 0" class="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-blue-800">
                  Действия с выбранными ({{ selectedImages.length }}):
                </span>
              </div>
              <div class="flex gap-2">
                <button 
                  @click="showBulkRenameForm = true"
                  class="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Переименовать
                </button>
                <button 
                  @click="downloadSelectedImages"
                  :disabled="downloadingSelectedImages"
                  class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  {{ downloadingSelectedImages ? 'Скачивание...' : 'Скачать' }}
                </button>
                <button 
                  @click="deleteSelectedImages"
                  :disabled="deletingSelectedImages"
                  class="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  {{ deletingSelectedImages ? 'Удаление...' : 'Удалить' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Форма группового переименования -->
          <div v-if="showBulkRenameForm" class="mb-4 p-4 bg-yellow-50 rounded border border-yellow-200">
            <h4 class="text-md font-medium mb-3 text-yellow-800">Групповое переименование изображений</h4>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Шаблон названия:</label>
                <div class="flex gap-2 mb-2">
                  <button 
                    @click="insertTemplateVariable('{date}')"
                    type="button"
                    class="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded border border-blue-300 transition-colors"
                  >
                    Вставить {date}
                  </button>
                  <button 
                    @click="insertTemplateVariable('{number}')"
                    type="button"
                    class="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs rounded border border-green-300 transition-colors"
                  >
                    Вставить {number}
                  </button>
                </div>
                <input 
                  v-model="bulkRenameTemplate"
                  type="text"
                  placeholder="Например: Изображение {number} или Фото {date}_{number}"
                  class="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  ref="bulkRenameInput"
                />
                <div class="mt-1 text-xs text-gray-500">
                  Доступные переменные: {number} - порядковый номер, {date} - текущая дата
                </div>
              </div>
              <div class="flex gap-2">
                <button 
                  @click="bulkRenameImages"
                  :disabled="bulkRenaming"
                  class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  {{ bulkRenaming ? 'Переименование...' : 'Переименовать' }}
                </button>
                <button 
                  @click="showBulkRenameForm = false; bulkRenameTemplate = ''"
                  :disabled="bulkRenaming"
                  class="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>

          <!-- Форма загрузки изображений -->
          <div v-if="showUploadForm" class="bg-white p-4 rounded-lg shadow mb-4">
            <h3 class="text-lg font-semibold mb-4">Загрузка изображений</h3>
            
            <!-- Настройки логотипа -->
            <div class="mb-4 p-3 bg-gray-50 rounded border">
              <h4 class="text-md font-medium mb-3">Настройки логотипа</h4>
              
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
            <div class="mt-4 flex gap-2">
              <button 
                @click="uploadImages" 
                :disabled="!selectedFiles.length || uploading" 
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
                @click="showUploadForm = false; selectedFiles = []; resetLogoSettings()" 
                :disabled="uploading"
                class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Отмена
              </button>
            </div>
          </div>

          <!-- Индикатор загрузки изображений -->
          <div v-if="loadingImages" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>

          <!-- Сетка изображений -->
          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div 
              v-for="(image, index) in sortedGalleryImages" 
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
              
              <!-- Чекбокс для выбора изображения -->
              <div class="absolute top-2 left-2 z-10">
                <input 
                  type="checkbox" 
                  :value="image.id"
                  v-model="selectedImages"
                  class="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 shadow-sm"
                />
              </div>
              
              <div class="aspect-square bg-gray-100 rounded overflow-hidden border">
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
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                  <button 
                    @click="editImage(image)"
                    class="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded shadow-lg transition-colors"
                    title="Редактировать"
                  >
                    <Icon name="line-md:edit" size="1.5em" />
                  </button>
                  <button 
                    @click="deleteImage(image.id)"
                    :disabled="deletingImage === image.id"
                    class="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white p-2 rounded shadow-lg transition-colors"
                    title="Удалить"
                  >
                    <Icon name="mynaui:trash" size="1.5em" />
                  </button>
                </div>
              </div>
              <div class="mt-2 text-sm text-gray-600 truncate">
                {{ image.title || 'Без названия' }}
              </div>
            </div>
            
            <!-- Сообщение если изображений нет -->
            <div v-if="galleryImages.length === 0" class="col-span-full text-center py-8 text-gray-500">
              <span class="i-mdi:image text-2xl mb-2 block"></span>
              <p>В этой галерее пока нет изображений</p>
            </div>
          </div>
        </div>

        <div v-else class="flex items-center justify-center h-full text-gray-500">
          <div class="text-center">
            <span class="i-mdi:image-multiple text-4xl mb-4 block"></span>
            <p>Выберите галерею для просмотра изображений</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования изображения -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">Редактировать изображение</h3>
          <button 
            @click="showEditModal = false"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            title="Закрыть"
          >
            <Icon name="ph:x" size="1.5em" />
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div class="space-y-6">
            <!-- Форма редактирования и информация -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="flex flex-col">
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Название изображения
                  </label>
                  <input 
                    v-model="editingImageTitle"
                    type="text"
                    class="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите название"
                  />
                </div>
                
                <!-- Дополнительная информация -->
                <div class="space-y-3 text-sm text-gray-600">
                  <div>
                    <span class="font-medium">ID:</span> {{ editingImage?.id }}
                  </div>
                  <div>
                    <span class="font-medium">Путь к файлу:</span> 
                    <div class="mt-1 p-2 bg-gray-50 rounded text-xs break-all">
                      {{ editingImage?.gallery_image_path || editingImage?.image || 'Не указан' }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Кнопки действий -->
              <div class="flex items-end gap-2">
                <button 
                  @click="saveImageEdit"
                  class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                >
                  Сохранить
                </button>
              </div>
            </div>
            
            <!-- Изображение -->
            <div class="flex flex-col">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Изображение
              </label>
              <div class="bg-gray-100 rounded overflow-hidden flex justify-center">
                <img 
                  :src="editingImage ? getFullImageUrl(editingImage) : ''" 
                  :alt="editingImage?.title || 'Изображение'"
                  class="max-w-full max-h-[70vh] object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useGlobalsStore } from '~/stores/globals';
import { storeToRefs } from 'pinia';
import Head from "~/components/parts/Head.vue";

const globalsStore = useGlobalsStore();
const { params, images } = storeToRefs(globalsStore);

// Загружаем данные на сервере при каждой загрузке страницы
const { data } = await useAsyncData('galleries-globals', async () => {
  await globalsStore.fetchData();
  return { params: globalsStore.params, images: globalsStore.images };
});

const config = useRuntimeConfig();
const api = config.public.API_URL;
const site = config.public.SITE_URL;

// SEO
useSeoMeta({
  title: ((params.value as any)?.adminka_name || 'Админка') + ' - Галереи',
  description: 'Управление галереями и изображениями',
});

const p_icon = "i-mdi:image-multiple";
const p_description = 'Галереи';
const breadcrumbs: Array<{id?: number, title?: string, icon?: string, slug?: string}> = [];

const { isAuthenticated, user, logout, checkAuth } = useAuth();

// Состояние компонента
interface Gallery {
  id: number;
  title: string;
  image?: string | null;
  image_id?: number | null;
  gallery_image_path?: string | null;
  main_image?: {
    id: number;
    title: string | null;
    image: string;
    thumbnail: string;
    gallery_image_path: string;
  };
  images?: GalleryImage[];
  created_at?: string;
  updated_at?: string;
}

interface GalleryImage {
  id: number;
  title: string | null;
  image: string;
  thumbnail: string;
  gallery_image_path: string;
  position?: number;
  loaded?: boolean;
  error?: boolean;
}

const galleries = ref<Gallery[]>([]);
const selectedGallery = ref<Gallery | null>(null);
const galleryImages = ref<GalleryImage[]>([]);
const showAddGalleryForm = ref(false);
const showUploadForm = ref(false);
const newGalleryTitle = ref('');
const selectedFiles = ref<File[]>([]);
const uploading = ref(false);
const showEditModal = ref(false);
const editingImage = ref<GalleryImage | null>(null);
const editingImageTitle = ref('');
const addingGallery = ref(false);
const deletingGallery = ref<number | null>(null);
const loadingGalleries = ref(false);
const loadingImages = ref(false);
const deletingImage = ref<number | null>(null);
const selectedImages = ref<number[]>([]);
const deletingSelectedImages = ref(false);

// Новые переменные для редактирования галереи
const editingGalleryId = ref<number | null>(null);
const editingGalleryTitle = ref('');
const galleryTitleInput = ref<HTMLInputElement | null>(null);

// Переменные для drag-and-drop
const draggedImage = ref<GalleryImage | null>(null);
const dragOverIndex = ref<number | null>(null);
const isDragging = ref(false);

// Переменные для пагинации
const currentPage = ref(1);
const itemsPerPage = 10;

// Переменные для поиска галерей
const searchQuery = ref('');

// Переменные для настроек логотипа
const logoSettings = ref({
  enabled: false,
  source: 'default', // 'default' или 'custom'
  customLogo: null as File | null,
  position: 'bottom-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  size: 15, // размер в процентах от изображения
  opacity: 0.8 // прозрачность от 0.1 до 1
});

// Computed свойство для определения, выбраны ли все изображения
const allImagesSelected = computed(() => {
  return galleryImages.value.length > 0 && selectedImages.value.length === galleryImages.value.length;
});

// Computed свойство для сортировки галерей по ID (от последнего к первому)
const sortedGalleries = computed(() => {
  return [...galleries.value].sort((a, b) => b.id - a.id);
});

// Computed свойство для фильтрации и сортировки галерей
const filteredAndSortedGalleries = computed(() => {
  const filtered = galleries.value.filter(gallery =>
    gallery.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
  return filtered.sort((a, b) => b.id - a.id);
});

// Computed свойство для пагинации
const totalPages = computed(() => {
  return Math.ceil(filteredAndSortedGalleries.value.length / itemsPerPage);
});

const paginatedGalleries = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredAndSortedGalleries.value.slice(start, end);
});

// Computed свойство для сортировки изображений по position
const sortedGalleryImages = computed(() => {
  return [...galleryImages.value].sort((a, b) => {
    const posA = a.position || 0;
    const posB = b.position || 0;
    return posA - posB;
  });
});

// Состояние прогресса загрузки
const uploadProgress = ref({
  current: 0,
  total: 0,
  percentage: 0,
  currentFileName: '',
  isUploading: false,
  canCancel: false
});

// Флаг для отмены загрузки
const cancelUploadFlag = ref(false);

// Загрузка списка галерей
const loadGalleries = async () => {
  try {
    loadingGalleries.value = true;
    const response = await $fetch<any>(`${api}/api/v1/galleries`);
    
    // Проверяем структуру ответа
    if (Array.isArray(response)) {
      galleries.value = response;
    } else if (response.data && Array.isArray(response.data)) {
      galleries.value = response.data;
    } else {
      galleries.value = [];
    }
  } catch (error: any) {
    galleries.value = [];
  } finally {
    loadingGalleries.value = false;
  }
};

// Добавление новой галереи
const addGallery = async () => {
  if (!newGalleryTitle.value.trim()) return;
  
  try {
    addingGallery.value = true;
    const response = await $fetch(`${api}/api/v1/galleries`, {
      method: 'POST',
      body: {
        title: newGalleryTitle.value
      }
    });
    
    newGalleryTitle.value = '';
    showAddGalleryForm.value = false;
    await loadGalleries();
    
    // Сбрасываем пагинацию на первую страницу
    currentPage.value = 1;
  } catch (error: any) {
    alert('Ошибка создания галереи: ' + (error.message || 'Неизвестная ошибка'));
  } finally {
    addingGallery.value = false;
  }
};

// Функции для редактирования галереи
const startGalleryEdit = (gallery: Gallery) => {
  editingGalleryId.value = gallery.id;
  editingGalleryTitle.value = gallery.title;
  
  // Фокусируемся на поле ввода после рендера
  nextTick(() => {
    setTimeout(() => {
      if (galleryTitleInput.value && galleryTitleInput.value instanceof HTMLInputElement) {
        galleryTitleInput.value.focus();
        galleryTitleInput.value.select();
      }
    }, 50); // Небольшая задержка для гарантии рендера
  });
};

const saveGalleryEdit = async () => {
  if (!editingGalleryId.value || !editingGalleryTitle.value.trim()) return;
  
  try {
    await $fetch(`${api}/api/v1/galleries`, {
      method: 'POST',
      body: {
        action: 'update',
        id: editingGalleryId.value,
        title: editingGalleryTitle.value
      }
    });
    
    // Обновляем галерею в списке
    const galleryIndex = galleries.value.findIndex(g => g.id === editingGalleryId.value);
    if (galleryIndex !== -1) {
      galleries.value[galleryIndex].title = editingGalleryTitle.value;
    }
    
    // Обновляем выбранную галерею если она редактируется
    if (selectedGallery.value?.id === editingGalleryId.value) {
      selectedGallery.value.title = editingGalleryTitle.value;
    }
    
    editingGalleryId.value = null;
    editingGalleryTitle.value = '';
  } catch (error: any) {
    alert('Ошибка обновления галереи: ' + (error.message || 'Неизвестная ошибка'));
  }
};

const cancelGalleryEdit = () => {
  editingGalleryId.value = null;
  editingGalleryTitle.value = '';
};

// Выбор галереи
const selectGallery = async (gallery: Gallery) => {
  selectedGallery.value = gallery;
  selectedImages.value = []; // Сбрасываем выбранные изображения при переключении галереи
  await loadGalleryImages(gallery.id);
  
  // Проверяем доступные маршруты для этой галереи
  checkAvailableRoutes(gallery.id);
};

// Функция для обработки ошибок загрузки изображений
const handleImageError = (event: Event, image: GalleryImage) => {
  // Добавляем флаги для отслеживания состояния изображения
  image.error = true;
  image.loaded = false;
};

// Функция для обработки успешной загрузки изображений
const handleImageLoad = (event: Event, image: GalleryImage) => {
  image.loaded = true;
  image.error = false;
};

// Функция для получения корректного URL изображения
const getImageUrl = (image: GalleryImage) => {
  // Приоритет: thumbnail -> gallery_image_path -> image
  if (image.thumbnail && typeof image.thumbnail === 'string' && image.thumbnail.startsWith('http')) {
    return image.thumbnail;
  }
  if (image.gallery_image_path && typeof image.gallery_image_path === 'string' && image.gallery_image_path.startsWith('http')) {
    return image.gallery_image_path;
  }
  if (image.image && typeof image.image === 'string' && image.image.startsWith('http')) {
    return image.image;
  }
  
  // Если URL относительные, добавляем базовый URL
  if (image.thumbnail) {
    return `${api}/storage/${image.thumbnail}`;
  }
  if (image.gallery_image_path) {
    return `${api}/storage/${image.gallery_image_path}`;
  }
  if (image.image) {
    return `${api}/storage/${image.image}`;
  }
  
  return '';
};

// Функция для получения основного изображения (для модального окна)
const getFullImageUrl = (image: GalleryImage) => {
  // Приоритет: gallery_image_path -> image -> thumbnail
  if (image.gallery_image_path && typeof image.gallery_image_path === 'string' && image.gallery_image_path.startsWith('http')) {
    return image.gallery_image_path;
  }
  if (image.image && typeof image.image === 'string' && image.image.startsWith('http')) {
    return image.image;
  }
  if (image.thumbnail && typeof image.thumbnail === 'string' && image.thumbnail.startsWith('http')) {
    return image.thumbnail;
  }
  
  // Если URL относительные, добавляем базовый URL
  if (image.gallery_image_path) {
    return `${api}/storage/${image.gallery_image_path}`;
  }
  if (image.image) {
    return `${api}/storage/${image.image}`;
  }
  if (image.thumbnail) {
    return `${api}/storage/${image.thumbnail}`;
  }
  
  return '';
};

// Функция для загрузки изображений галереи
const loadGalleryImages = async (galleryId: number) => {
  try {
    loadingImages.value = true;
    const response = await $fetch<any>(`${api}/api/v1/galleries/${galleryId}`);
    
    // Обрабатываем структуру ответа
    if (Array.isArray(response) && response.length > 0) {
      // Если ответ - массив, берем первый элемент
      const gallery = response[0];
      
      if (gallery.images && Array.isArray(gallery.images)) {
        galleryImages.value = gallery.images;
      } else {
        galleryImages.value = [];
      }
    } else if (response && response.images && Array.isArray(response.images)) {
      // Если ответ - объект с полем images
      galleryImages.value = response.images;
    } else {
      galleryImages.value = [];
    }
  } catch (error: any) {
    galleryImages.value = [];
  } finally {
    loadingImages.value = false;
  }
};

// Функция для удаления галереи
const deleteGallery = async (galleryId: number) => {
  if (!confirm('Вы уверены, что хотите удалить эту галерею?')) return;
  
  try {
    deletingGallery.value = galleryId;
    await $fetch(`${api}/api/v1/galleries/${galleryId}`, {
      method: 'DELETE'
    });
    
    if (selectedGallery.value?.id === galleryId) {
      selectedGallery.value = null;
      galleryImages.value = [];
    }
    await loadGalleries();
    
    // Проверяем, нужно ли перейти на предыдущую страницу
    if (paginatedGalleries.value.length === 0 && currentPage.value > 1) {
      currentPage.value = Math.max(1, currentPage.value - 1);
    }
  } catch (error: any) {
    alert('Ошибка удаления галереи: ' + (error.message || 'Неизвестная ошибка'));
  } finally {
    deletingGallery.value = null;
  }
};

// Функция для удаления изображений
const deleteSelectedImages = async () => {
  if (!selectedGallery.value || selectedImages.value.length === 0) return;
  
  if (!confirm(`Вы уверены, что хотите удалить ${selectedImages.value.length} выбранных изображений?`)) return;
  
  try {
    deletingSelectedImages.value = true;
    await $fetch(`${api}/api/v1/galleries/${selectedGallery.value.id}/delete-multiple-images`, {
      method: 'POST',
      body: {
        image_ids: selectedImages.value
      }
    });
    
    await loadGalleryImages(selectedGallery.value.id);
    await loadGalleries(); // Обновляем список галерей
    selectedImages.value = [];
  } catch (error: any) {
    alert('Ошибка удаления выбранных изображений: ' + (error.message || 'Неизвестная ошибка'));
  } finally {
    deletingSelectedImages.value = false;
  }
};

// Функция для редактирования изображения
const editImage = (image: GalleryImage) => {
  editingImage.value = image;
  editingImageTitle.value = image.title || '';
  showEditModal.value = true;
};

// Функция для сохранения изменений в изображении
const saveImageEdit = async () => {
  if (!editingImage.value || !selectedGallery.value) return;
  
  try {
    // Используем правильный endpoint для обновления изображения
    await $fetch(`${api}/api/v1/galleries/${selectedGallery.value.id}/image`, {
      method: 'POST',
      body: {
        image_id: editingImage.value.id,
        title: editingImageTitle.value
      }
    });
    
    await loadGalleryImages(selectedGallery.value.id);
    showEditModal.value = false;
    editingImage.value = null;
    editingImageTitle.value = '';
  } catch (error: any) {
    alert('Ошибка обновления изображения: ' + (error.message || 'Неизвестная ошибка'));
  }
};

// Функция для отмены редактирования изображения
const cancelImageEdit = () => {
  editingImage.value = null;
  editingImageTitle.value = '';
};

// Функция для выбора всех изображений
const toggleSelectAll = () => {
  selectedImages.value = allImagesSelected.value ? [] : galleryImages.value.map(i => i.id);
};

// Функция для проверки доступных маршрутов
const checkAvailableRoutes = async (galleryId: number) => {
  const routes = [
    { url: `${api}/api/v1/galleries/${galleryId}/upload-image`, method: 'POST' },
    { url: `${api}/api/v1/galleries/${galleryId}/delete-image`, method: 'POST' },
    { url: `${api}/api/v1/galleries/${galleryId}/image`, method: 'POST' },
    { url: `${api}/api/v1/galleries/${galleryId}`, method: 'GET' },
    { url: `${api}/api/v1/galleries/${galleryId}`, method: 'PUT' },
    { url: `${api}/api/v1/galleries/${galleryId}`, method: 'PATCH' },
    { url: `${api}/api/v1/galleries/${galleryId}`, method: 'DELETE' },
    { url: `${api}/api/v1/galleries`, method: 'GET' },
    { url: `${api}/api/v1/galleries`, method: 'POST' }
  ];
  
  for (const route of routes) {
    try {
      const response = await $fetch(route.url, { method: 'OPTIONS' });
    } catch (error) {
    }
  }
};

// Обработка выбора файлов
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    selectedFiles.value = Array.from(target.files);
  }
};

// Загрузка изображений
const uploadImages = async () => {
  if (!selectedFiles.value.length || !selectedGallery.value) return;
  
  uploading.value = true;
  cancelUploadFlag.value = false; // Сбрасываем флаг отмены
  uploadProgress.value = {
    current: 0,
    total: selectedFiles.value.length,
    percentage: 0,
    currentFileName: '',
    isUploading: true,
    canCancel: true
  };
  
  try {
    const totalFiles = selectedFiles.value.length;
    let uploadedCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Загружаем файлы по одному
    for (let i = 0; i < selectedFiles.value.length; i++) {
      // Проверяем флаг отмены
      if (cancelUploadFlag.value) {
        break;
      }
      
      const file = selectedFiles.value[i];
      
      // Обновляем прогресс
      uploadProgress.value.current = i + 1;
      uploadProgress.value.percentage = Math.round(((i + 1) / totalFiles) * 100);
      uploadProgress.value.currentFileName = file.name;
      
      try {
        // Создаем FormData для одного файла
        const formData = new FormData();
        formData.append('image', file);
        
        // Добавляем настройки логотипа если он включен
        if (logoSettings.value.enabled) {
          formData.append('logo_enabled', 'true');
          formData.append('logo_position', logoSettings.value.position);
          formData.append('logo_size', logoSettings.value.size.toString());
          formData.append('logo_opacity', logoSettings.value.opacity.toString());
          
          if (logoSettings.value.source === 'custom' && logoSettings.value.customLogo) {
            formData.append('custom_logo', logoSettings.value.customLogo);
          } else if (logoSettings.value.source === 'default') {
            // Загружаем логотип по умолчанию как файл
            const defaultLogoFile = await getDefaultLogoAsFile();
            if (defaultLogoFile) {
              formData.append('custom_logo', defaultLogoFile);
            } else {
              const defaultLogoUrl = getDefaultLogoUrl();
              if (defaultLogoUrl) {
                formData.append('default_logo_url', defaultLogoUrl);
              }
            }
          }
        }
        
        // Отправляем файл
        const response = await $fetch(`${api}/api/v1/galleries/${selectedGallery.value.id}/upload-image`, {
          method: 'POST',
          body: formData
        }) as any;
        
        if (response.success) {
          uploadedCount++;
        } else {
          errorCount++;
          errors.push({
            file: file.name,
            error: response.message || 'Неизвестная ошибка'
          });
        }
        
      } catch (error: any) {
        errorCount++;
        const errorMessage = error.message || 'Неизвестная ошибка';
        errors.push({
          file: file.name,
          error: errorMessage
        });
      }
      
      // Небольшая пауза между запросами
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Формируем итоговое сообщение
    let message = '';
    if (uploadedCount === totalFiles) {
      message = `✅ Успешно загружено все ${uploadedCount} файлов!`;
    } else if (uploadedCount > 0) {
      message = `✅ Загружено ${uploadedCount} из ${totalFiles} файлов. Ошибок: ${errorCount}`;
    } else {
      message = `❌ Не удалось загрузить ни одного файла. Ошибок: ${errorCount}`;
    }
    
    alert(message);
    
    // Обновляем список изображений
    await loadGalleryImages(selectedGallery.value.id);
    selectedFiles.value = [];
    showUploadForm.value = false;
    resetLogoSettings(); // Сбрасываем настройки логотипа
    
  } catch (error: any) {
    alert('Критическая ошибка загрузки: ' + (error.message || 'Неизвестная ошибка'));
  } finally {
    uploading.value = false;
    uploadProgress.value.isUploading = false;
  }
};

// Функция отмены загрузки
const cancelUpload = () => {
  cancelUploadFlag.value = true;
  uploadProgress.value.isUploading = false;
  uploading.value = false;
  selectedFiles.value = [];
  showUploadForm.value = false;
  resetLogoSettings(); // Сбрасываем настройки логотипа
};

// Удаление изображения
const deleteImage = async (imageId: number) => {
  if (!confirm('Вы уверены, что хотите удалить это изображение?') || !selectedGallery.value) return;
  
  try {
    deletingImage.value = imageId;
    await $fetch(`${api}/api/v1/galleries/${selectedGallery.value.id}/delete-image`, {
      method: 'POST',
      body: {
        image_id: imageId
      }
    });
    
    await loadGalleryImages(selectedGallery.value.id);
    await loadGalleries(); // Обновляем список галерей
  } catch (error: any) {
    alert('Ошибка удаления изображения: ' + (error.message || 'Неизвестная ошибка'));
  } finally {
    deletingImage.value = null;
  }
};

// Загрузка данных при монтировании
onMounted(() => {
  loadGalleries();
  // Проверяем доступные маршруты для первой галереи (если есть)
  if (galleries.value.length > 0) {
    checkAvailableRoutes(galleries.value[0].id);
  }
});

// Watcher для сброса пагинации при изменении поискового запроса
watch(searchQuery, () => {
  currentPage.value = 1;
});

// Функции для drag-and-drop
const handleDragStart = (event: DragEvent, image: GalleryImage, index: number) => {
  if (!event.dataTransfer) return;
  
  draggedImage.value = image;
  isDragging.value = true;
  dragOverIndex.value = null;
  
  // Устанавливаем данные для перетаскивания
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', image.id.toString());
  
  // Добавляем класс для визуального эффекта
  if (event.target) {
    (event.target as HTMLElement).style.opacity = '0.5';
  }
};

const handleDrop = async (event: DragEvent, targetImage: GalleryImage, targetIndex: number) => {
  event.preventDefault();
  
  if (!draggedImage.value || !selectedGallery.value) return;
  
  const draggedIndex = sortedGalleryImages.value.findIndex(img => img.id === draggedImage.value?.id);
  
  if (draggedIndex === -1 || draggedIndex === targetIndex) {
    handleDragEnd();
    return;
  }
  
  try {
    // Обновляем позиции изображений
    const images = [...sortedGalleryImages.value];
    const [draggedItem] = images.splice(draggedIndex, 1);
    images.splice(targetIndex, 0, draggedItem);
    
    // Обновляем позиции в базе данных
    await updateImagePositions(images);
    
    // Перезагружаем изображения
    await loadGalleryImages(selectedGallery.value.id);
    
  } catch (error: any) {
    alert('Ошибка обновления порядка изображений: ' + (error.message || 'Неизвестная ошибка'));
  } finally {
    handleDragEnd();
  }
};

const handleDragEnter = (event: DragEvent, index: number) => {
  if (!draggedImage.value) return;
  
  dragOverIndex.value = index;
  
  // Добавляем класс для визуального эффекта
  const targetElement = event.target as HTMLElement;
  if (targetElement) {
    targetElement.classList.add('dragging');
  }
};

const handleDragLeave = (event: DragEvent) => {
  // Убираем индикатор места вставки при выходе из элемента
  if (!event.relatedTarget || !(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) {
    dragOverIndex.value = null;
  }
  
  // Убираем визуальные эффекты
  document.querySelectorAll('.dragging').forEach(el => {
    (el as HTMLElement).style.opacity = '1';
    el.classList.remove('dragging');
  });
};

const handleDragEnd = () => {
  draggedImage.value = null;
  dragOverIndex.value = null;
  isDragging.value = false;
  
  // Убираем визуальные эффекты
  document.querySelectorAll('.dragging').forEach(el => {
    (el as HTMLElement).style.opacity = '1';
    el.classList.remove('dragging');
  });
};

// Функция для обновления позиций изображений
const updateImagePositions = async (images: GalleryImage[]) => {
  if (!selectedGallery.value) return;
  
  const positionUpdates = images.map((image, index) => ({
    image_id: image.id,
    position: index + 1
  }));
  
  await $fetch(`${api}/api/v1/galleries/${selectedGallery.value.id}/update-positions`, {
    method: 'POST',
    body: {
      positions: positionUpdates
    }
  });
};

// Функция для очистки поиска
const clearSearch = () => {
  searchQuery.value = '';
};

// Обработка выбора файла логотипа
const handleLogoFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    logoSettings.value.customLogo = target.files[0];
  }
};

// Функция для сброса настроек логотипа
const resetLogoSettings = () => {
  logoSettings.value = {
    enabled: false,
    source: 'default',
    customLogo: null,
    position: 'bottom-right',
    size: 15,
    opacity: 0.8
  };
};

// Функция для получения URL логотипа по умолчанию
const getDefaultLogoUrl = () => {
  if (images.value && (images.value as any).photo_image) {
    const url = (images.value as any).photo_image;
    return url;
  }
  return null;
};

// Функция для загрузки логотипа по умолчанию как файла
const getDefaultLogoAsFile = async () => {
  const url = getDefaultLogoUrl();
  if (!url) return null;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    
    const blob = await response.blob();
    const file = new File([blob], 'default_logo.png', { type: blob.type });
    return file;
  } catch (error) {
    return null;
  }
};

const downloadingSelectedImages = ref(false);

const downloadSelectedImages = async () => {
  if (!selectedGallery.value || selectedImages.value.length === 0) return;
  downloadingSelectedImages.value = true;
  try {
    const response = await fetch(`${api}/api/v1/galleries/${selectedGallery.value.id}/download-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/zip',
      },
      body: JSON.stringify({ image_ids: selectedImages.value })
    });
    if (!response.ok) {
      throw new Error('Ошибка скачивания архива');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gallery_images_${selectedGallery.value.id}.zip`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
  } catch (error: any) {
    alert('Ошибка скачивания: ' + (error.message || 'Неизвестная ошибка'));
  } finally {
    downloadingSelectedImages.value = false;
  }
};

const showBulkRenameForm = ref(false);
const bulkRenameTemplate = ref('');
const bulkRenaming = ref(false);
const bulkRenameInput = ref<HTMLInputElement | null>(null);

const bulkRenameImages = async () => {
  if (!selectedGallery.value || selectedImages.value.length === 0 || !bulkRenameTemplate.value.trim()) return;
  
  bulkRenaming.value = true;
  try {
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const selectedImageObjects = galleryImages.value.filter(img => selectedImages.value.includes(img.id));
    const galleryId = selectedGallery.value.id;
    
    const renamePromises = selectedImageObjects.map(async (image, index) => {
      const newTitle = bulkRenameTemplate.value
        .replace(/{number}/g, (index + 1).toString().padStart(2, '0'))
        .replace(/{date}/g, currentDate);
      
      return $fetch(`${api}/api/v1/galleries/${galleryId}/image`, {
        method: 'POST',
        body: {
          image_id: image.id,
          title: newTitle
        }
      });
    });
    
    await Promise.all(renamePromises);
    
    // Перезагружаем изображения
    await loadGalleryImages(galleryId);
    
    // Закрываем форму
    showBulkRenameForm.value = false;
    bulkRenameTemplate.value = '';
    
    alert(`Успешно переименовано ${selectedImageObjects.length} изображений!`);
    
  } catch (error: any) {
    alert('Ошибка переименования: ' + (error.message || 'Неизвестная ошибка'));
  } finally {
    bulkRenaming.value = false;
  }
};

const insertTemplateVariable = (variable: string) => {
  const input = bulkRenameInput.value;
  if (!input) return;
  
  const start = input.selectionStart || 0;
  const end = input.selectionEnd || 0;
  const currentValue = bulkRenameTemplate.value;
  
  // Вставляем переменную в позицию курсора
  const newValue = currentValue.substring(0, start) + variable + currentValue.substring(end);
  bulkRenameTemplate.value = newValue;
  
  // Устанавливаем курсор после вставленной переменной
  nextTick(() => {
    if (input) {
      input.focus();
      input.setSelectionRange(start + variable.length, start + variable.length);
    }
  });
};
</script>

<style scoped>
/* Дополнительные стили если нужны */

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