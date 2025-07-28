<template>
  <div class="event-image-advanced-editor w-full">
    <!-- Верхний блок с кнопками -->
    <div class="bg-white border-b border-gray-200 p-4 mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-semibold text-gray-800">Редактор изображений</h2>
        </div>
        
        <!-- Кнопки действий -->
        <div class="flex items-center gap-3">
          <!-- Кнопки шаблонов -->
          <div class="flex items-center gap-2">
            <button 
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium" 
              @click="showSaveTemplateModal = true"
            >
              <Icon icon="mdi:content-save" class="w-4 h-4" />
              Сохранить шаблон
            </button>
            <button 
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-medium" 
              @click="showTemplateListModal = true; loadTemplateList()"
            >
              <Icon icon="mdi:folder-open" class="w-4 h-4" />
              Загрузить шаблон
            </button>
          </div>
          
          <!-- Кнопки экспорта и галереи -->
          <div class="flex items-center gap-2">
            <button 
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium" 
              @click="exportEditorImage('jpg')"
            >
              <Icon icon="mdi:download" class="w-4 h-4" />
              Скачать JPEG
            </button>
            <button 
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50" 
              @click="saveToGallery"
              :disabled="savingToGallery"
            >
              <Icon icon="mdi:content-save-all" class="w-4 h-4" />
              {{ savingToGallery ? 'Сохранение...' : 'Сохранить в галерею' }}
            </button>
            <button 
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium" 
              @click="showGalleryModal = true; loadEventGallery()"
            >
              <Icon icon="mdi:image-multiple-outline" class="w-4 h-4" />
              Просмотр галереи
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Основной контент -->
    <div class="grid grid-cols-12 gap-4 w-full min-h-[600px]">
      <!-- Левая колонка: инструменты -->
      <aside class="col-span-3 bg-gray-50 border-r p-4 flex flex-col gap-6 min-h-[600px]">
      <!-- 0. Информация -->
      

      <!-- 2. Фоновое изображение -->
      <section>
        <h3 class="font-bold text-base mb-2">Фоновое изображение</h3>
        <div class="flex flex-col gap-2">
          <label><input type="radio" value="event" v-model="bgSource" /> Изображение события</label>
          <label><input type="radio" value="upload" v-model="bgSource" /> Загрузить</label>
          <label><input type="radio" value="none" v-model="bgSource" /> Без изображения</label>
        </div>
        
        <!-- Превью изображения -->
        <div v-if="bgPreview" class="mt-2">
          <img :src="bgPreview" class="w-full max-h-32 object-contain rounded border" />
        </div>
        
        <!-- Индикатор загрузки для изображения события -->
        <div v-if="bgSource === 'event' && isBgImageLoading" class="mt-2 flex items-center gap-2 text-xs text-blue-600">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          Загрузка изображения события...
        </div>
        
        <!-- Загрузка изображения -->
        <div v-if="bgSource === 'upload'" class="mt-2 flex flex-col gap-2">
          <!-- Скрытый инпут для файла -->
          <input 
            type="file" 
            accept="image/*" 
            @change="handleBgFileUpload" 
            ref="bgFileInputRef" 
            class="hidden" 
          />
          
          <!-- Кнопка загрузки файла -->
          <button 
            type="button" 
            class="w-full px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs" 
            @click="$refs.bgFileInputRef.click()"
          >
            {{ bgPreview ? 'Заменить изображение' : 'Загрузить изображение' }}
          </button>
          
          <!-- Кнопка вставки по URL -->
          <button 
            type="button" 
            class="w-full px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs" 
            @click="showBgUrlInput = true"
          >
            Вставить URL
          </button>
          
          <!-- Ввод URL -->
          <div v-if="showBgUrlInput" class="flex flex-col gap-2">
            <input 
              v-model="bgUrlInput" 
              type="text" 
              placeholder="https://..." 
              class="border rounded px-2 py-1 w-full text-xs" 
            />
            <div class="flex gap-2">
              <button 
                @click="handleBgUrlSubmit" 
                class="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                :disabled="isBgImageLoading"
              >
                {{ isBgImageLoading ? 'Загрузка...' : 'Вставить' }}
              </button>
              <button 
                @click="showBgUrlInput = false; bgUrlInput = ''" 
                class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs"
              >
                Отмена
              </button>
            </div>
          </div>
          
          <!-- Ошибка -->
          <div v-if="bgCurrentError" class="text-xs text-red-600">{{ bgCurrentError }}</div>
          
          <!-- Информация о масштабировании -->
          <div class="text-xs text-gray-500">
            Изображение будет автоматически обрезано под размер выбранного формата ({{ editorWidth }}×{{ editorHeight }}) с сохранением пропорций.
          </div>
        </div>
      </section>
      <!-- 3. Маска -->
      <section>
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-base">Маска</h3>
          <button class="text-xs text-blue-600 underline" @click="showMaskModal = true">Маски</button>
        </div>
        <div v-if="maskPreview" class="mt-2">
          <img :src="maskPreview" class="w-full max-h-20 object-contain rounded border" />
        </div>
        <div v-else class="text-xs text-gray-400">Без маски</div>
      </section>
      <!-- 4. Текст -->
      <section>
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-base">Текст</h3>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500">{{ textLayers.length }} слоев</span>
            <span v-if="textLayers.length > 8" class="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{{ activeTextTab + 1 }}/{{ textLayers.length }}</span>
            <button v-if="textLayers.length > 0" class="text-xs text-red-500 hover:text-red-700" @click="clearAllTextLayers" title="Очистить все">🗑️</button>
          </div>
        </div>
        <button class="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm mb-3 hover:bg-blue-200" @click="addTextLayer">+ Добавить текстовый слой</button>
        
        <!-- Сообщение если нет слоев -->
        <div v-if="textLayers.length === 0" class="text-center py-8 text-gray-400 text-sm">
          <div class="mb-2">📝</div>
          <div>Нет текстовых слоев</div>
          <div class="text-xs">Нажмите кнопку выше чтобы добавить</div>
        </div>
        
        <!-- Вкладки текстовых слоев -->
        <div v-if="textLayers.length > 0" class="border rounded-lg overflow-hidden max-h-[500px]">
          <!-- Заголовки вкладок -->
          <div class="flex flex-wrap bg-gray-50 border-b overflow-x-auto">
            <div 
              v-for="(layer, idx) in textLayers" 
              :key="layer.id"
              :class="['px-3 py-2 text-sm font-medium border-r border-gray-200 flex items-center gap-1.5 transition-colors flex-shrink-0 whitespace-nowrap cursor-pointer', 
                activeTextTab === idx 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100']"
              @click="activeTextTab = idx; selectTextLayer(idx)"
            >
              <span class="font-semibold">{{ idx + 1 }}</span>
              <button 
                class="text-xs text-gray-500 hover:text-red-600 transition-colors p-0.5 rounded" 
                @click.stop="removeTextLayer(idx)" 
                title="Удалить слой"
              >
                ✕
              </button>
              <button 
                class="text-xs text-gray-500 hover:text-gray-700 transition-colors p-0.5 rounded" 
                @click.stop="toggleLayerVisibility(idx)" 
                :title="layer.visible === false ? 'Показать слой' : 'Скрыть слой'"
              >
                {{ layer.visible === false ? '👁️‍🗨️' : '👁️' }}
              </button>
            </div>
          </div>
          
          <!-- Содержимое активной вкладки -->
          <div v-if="textLayers[activeTextTab]" class="p-3 space-y-3 max-h-[400px] overflow-y-auto">
            <div :class="[textLayers[activeTextTab].visible === false ? 'opacity-50' : '']">
              <!-- Текст -->
              <div class="space-y-1">
                <label class="text-xs text-gray-600 font-medium">Текст</label>
                <textarea 
                  v-model="textLayers[activeTextTab].text" 
                  class="w-full border rounded px-2 py-1.5 text-sm resize-y" 
                  rows="2" 
                  placeholder="Введите текст..."
                ></textarea>
              </div>
              
              <!-- Основные настройки -->
              <div class="grid grid-cols-2 gap-3 mt-3">
                <div class="space-y-1">
                  <label class="text-xs text-gray-600 font-medium">Цвет</label>
                  <input type="color" v-model="textLayers[activeTextTab].color" class="w-full h-8 rounded border" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs text-gray-600 font-medium">Размер</label>
                  <input type="number" v-model.number="textLayers[activeTextTab].size" min="8" max="120" class="w-full border rounded px-2 py-1.5 text-sm" />
                </div>
              </div>
              
              <!-- Шрифт -->
              <div class="space-y-1 mt-3">
                <label class="text-xs text-gray-600 font-medium">Шрифт</label>
                <select v-model="textLayers[activeTextTab].font" class="w-full border rounded px-2 py-1.5 text-sm">
                  <option value="Arial">Arial</option>
                  <option value="Tahoma">Tahoma</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Impact">Impact</option>
                </select>
              </div>
              
              <!-- Стили -->
              <div class="space-y-1 mt-3">
                <label class="text-xs text-gray-600 font-medium">Стили</label>
                <div class="flex gap-3 items-center flex-wrap">
                  <label class="flex items-center gap-1.5 text-sm">
                    <input type="checkbox" v-model="textLayers[activeTextTab].bold" class="w-4 h-4" />
                    <span>Жирный</span>
                  </label>
                  <label class="flex items-center gap-1.5 text-sm">
                    <input type="checkbox" v-model="textLayers[activeTextTab].italic" class="w-4 h-4" />
                    <span>Курсив</span>
                  </label>
                  <label class="flex items-center gap-1.5 text-sm">
                    <input type="checkbox" v-model="textLayers[activeTextTab].stroke" class="w-4 h-4" />
                    <span>Обводка</span>
                  </label>
                </div>
              </div>
              
              <!-- Выравнивание -->
              <div class="space-y-1 mt-3">
                <label class="text-xs text-gray-600 font-medium">Выравнивание</label>
                <div class="flex gap-1">
                  <button 
                    v-for="align in ['left', 'center', 'right']" 
                    :key="align"
                    :class="['px-2 py-1.5 rounded text-sm border transition-colors', 
                      textLayers[activeTextTab].align === align 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50']"
                    @click="textLayers[activeTextTab].align = align"
                    :title="align === 'left' ? 'По левому краю' : align === 'center' ? 'По центру' : 'По правому краю'"
                  >
                    <Icon v-if="align === 'left'" icon="material-symbols:format-align-left" class="w-4 h-4" />
                    <Icon v-else-if="align === 'center'" icon="material-symbols:format-align-center" class="w-4 h-4" />
                    <Icon v-else-if="align === 'right'" icon="material-symbols:format-align-right" class="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <!-- Обводка (если включена) -->
              <div v-if="textLayers[activeTextTab].stroke" class="space-y-1 mt-3">
                <label class="text-xs text-gray-600 font-medium">Настройки обводки</label>
                <div class="grid grid-cols-2 gap-3">
                  <div class="space-y-1">
                    <label class="text-xs text-gray-600">Цвет обводки</label>
                    <input type="color" v-model="textLayers[activeTextTab].strokeColor" class="w-full h-8 rounded border" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs text-gray-600">Толщина</label>
                    <input type="number" v-model.number="textLayers[activeTextTab].strokeWidth" min="1" max="10" class="w-full border rounded px-2 py-1.5 text-sm" />
                  </div>
                </div>
              </div>
              
              <!-- Быстрые вставки -->
              <div class="space-y-2 mt-4 pt-3 border-t border-gray-200">
                <div class="text-xs text-gray-600 font-medium">Быстрые вставки:</div>
                <div class="flex gap-1 flex-wrap">
                  <button v-for="type in ['title','date','time','score','result_dop','clubs','arena','sport','city']" :key="type" class="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200" @click="insertEventValueToLayer(activeTextTab, type)">{{ getButtonLabel(type) }}</button>
                </div>
                <div class="flex gap-1 flex-wrap">
                  <button class="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200" @click="insertEventValueToLayer(activeTextTab, 'club1_title')">Команда 1</button>
                  <button class="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200" @click="insertEventValueToLayer(activeTextTab, 'club2_title')">Команда 2</button>
                  <button class="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200" @click="insertEventValueToLayer(activeTextTab, 'club1_city')">Город 1</button>
                  <button class="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200" @click="insertEventValueToLayer(activeTextTab, 'club2_city')">Город 2</button>
                </div>
                <div class="flex gap-1 flex-wrap">
                  <button class="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200" @click="insertLineupToLayer(activeTextTab, 1)">Состав 1-й</button>
                  <button class="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200" @click="insertLineupToLayer(activeTextTab, 2)">Состав 2-й</button>
                  <button class="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200" @click="insertEventsToLayer(activeTextTab, 1)">Голы 1-й</button>
                  <button class="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200" @click="insertEventsToLayer(activeTextTab, 2)">Голы 2-й</button>
                </div>
              </div>
              
              <!-- Дополнительные действия -->
              <div class="flex gap-1 mt-3 pt-3 border-t border-gray-200">
                <button 
                  class="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors flex items-center gap-1.5" 
                  @click="duplicateTextLayer(activeTextTab)" 
                  title="Дублировать слой"
                >
                  <Icon icon="mdi:content-copy" class="w-3.5 h-3.5" />
                  Дублировать
                </button>
                <button 
                  class="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors flex items-center gap-1.5" 
                  @click="moveTextLayerUp(activeTextTab)" 
                  :disabled="activeTextTab === 0"
                  title="Переместить вверх"
                >
                  <Icon icon="mdi:arrow-up" class="w-3.5 h-3.5" />
                  Вверх
                </button>
                <button 
                  class="px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors flex items-center gap-1.5" 
                  @click="moveTextLayerDown(activeTextTab)" 
                  :disabled="activeTextTab === textLayers.length - 1"
                  title="Переместить вниз"
                >
                  <Icon icon="mdi:arrow-down" class="w-3.5 h-3.5" />
                  Вниз
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. Эмблемы и изображения -->
      <section>
        <h3 class="font-bold text-base mb-2">Эмблемы и изображения</h3>
        <div class="flex gap-2 mb-2 flex-wrap">
          <button 
            v-if="hasClub1Emblem" 
            class="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 disabled:opacity-50" 
            @click="addEmblemLayer('club1')"
            :title="props.eventData?.club1?.title"
            :disabled="isLoadingEmblem"
          >
            {{ isLoadingEmblem ? '⏳' : '' }} Эмблема 1-й
          </button>
          <button 
            v-if="hasClub2Emblem" 
            class="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 disabled:opacity-50" 
            @click="addEmblemLayer('club2')"
            :title="props.eventData?.club2?.title"
            :disabled="isLoadingEmblem"
          >
            {{ isLoadingEmblem ? '⏳' : '' }} Эмблема 2-й
          </button>
          <button 
            v-if="hasCompetitionEmblem" 
            class="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 disabled:opacity-50" 
            @click="addEmblemLayer('competition')"
            :title="props.eventData?.competition?.title"
            :disabled="isLoadingEmblem"
          >
            {{ isLoadingEmblem ? '⏳' : '' }} Соревнование
          </button>
          <button class="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200" @click="showDiagramModal = true">Вставить диаграмму</button>
        </div>
        
        <!-- Информация о недоступных эмблемах -->
        <div v-if="!hasClub1Emblem && !hasClub2Emblem && !hasCompetitionEmblem" class="text-xs text-gray-500 mb-2 italic">
          Эмблемы команд и соревнования недоступны для данного события
        </div>
        <div v-else-if="!hasClub1Emblem || !hasClub2Emblem || !hasCompetitionEmblem" class="text-xs text-gray-400 mb-2">
          <span v-if="!hasClub1Emblem">• Эмблема 1-й команды недоступна<br></span>
          <span v-if="!hasClub2Emblem">• Эмблема 2-й команды недоступна<br></span>
          <span v-if="!hasCompetitionEmblem">• Эмблема соревнования недоступна</span>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div v-for="(layer, index) in imageLayers" :key="layer.src + '-' + index" class="border rounded p-2 flex flex-col items-center">
            <img 
              :src="layer.src" 
              class="h-16 object-contain mb-2" 
              @error="handleImageLayerError(layer, index)"
              :alt="getImageLayerAlt(layer)"
            />
            <div class="text-xs mb-1 text-center">
              <div class="font-medium">{{ getImageLayerDisplayName(layer) }}</div>
              <div class="text-gray-500">
                {{ Math.round(layer.width) }}×{{ Math.round(layer.height) }}
                <span v-if="['club1', 'club2', 'competition'].includes(layer.type)" class="text-purple-600" title="Пропорциональное изменение размера">⤧</span>
              </div>
            </div>
            <button class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200" @click="removeImageLayer(index)">Удалить</button>
          </div>
        </div>
        
        <!-- Сообщение если нет слоев изображений -->
        <div v-if="imageLayers.length === 0" class="text-center py-4 text-gray-400 text-sm">
          <div class="mb-2">🖼️</div>
          <div>Нет изображений</div>
          <div class="text-xs">Используйте кнопки выше для добавления</div>
        </div>
        
        <!-- Подсказка о пропорциональном изменении размера -->
        <div v-if="imageLayers.some(l => ['club1', 'club2', 'competition'].includes(l.type))" class="text-xs text-blue-600 bg-blue-50 p-2 rounded mt-2">
          💡 <strong>Совет:</strong> Эмблемы команд и соревнований изменяются пропорционально для сохранения правильных пропорций.
        </div>
      </section>
                      <!-- 6. Инструменты -->
        <section>
          <div class="border-t pt-2 mt-2">
            <button class="w-full px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs" @click="renderEditorCanvas">🔄 Обновить изображение</button>
          </div>
        </section>
    </aside>
    <!-- Правая часть: поле редактора -->
    <main class="col-span-9 flex flex-col bg-white min-h-[600px]">
      <!-- Панель форматов изображения -->
      <div class="bg-gray-50 border-b p-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          
          <div class="flex gap-2">
            <button 
              v-for="format in formatSettings" 
              :key="format.id" 
              :class="['px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-medium transition-colors', selectedFormat === format.type ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200']" 
              @click="selectFormat(format)"
            >
              <Icon v-if="format.icon" :icon="format.icon" class="w-3.5 h-3.5" />
              <span>{{ format.description }}</span>
            </button>
          </div>
        </div>
        <button 
          class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
          @click="showFormatSettings = true"
          title="Настройки форматов"
        >
          <Icon icon="mdi:cog" class="w-4 h-4" />
        </button>
      </div>
      
      <!-- Область редактора -->
      <div class="flex-1 flex items-center justify-center">
        <div class="relative border rounded shadow bg-gray-100 flex items-center justify-center" :style="editorStyle">
          <!-- Canvas или preview -->
          <canvas 
            ref="editorCanvas" 
            :width="editorWidth" 
            :height="editorHeight" 
            :class="`block ${isDragging ? 'cursor-grabbing' : 'cursor-move'}`"
            :style="isDragging ? 'opacity: 0.8;' : ''"
          />
          <!-- (В будущем: draggable элементы, overlay и т.д.) -->
        </div>
      </div>
    </main>
    </div>
    <!-- Модалки (заглушки) -->
    <div v-if="showFormatSettings" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg relative">
        <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700" @click="showFormatSettings = false">✕</button>
        <h3 class="text-lg font-semibold mb-4">Настройки форматов</h3>
        <div>
          <form @submit.prevent="saveFormat" class="flex flex-col gap-2 mb-4">
            <input v-model="formatForm.description" type="text" class="border rounded px-2 py-1" placeholder="Название формата" required />
            <select v-model="formatForm.type" class="border rounded px-2 py-1" required>
              <option value="horizontal">Горизонтальный</option>
              <option value="vertical">Вертикальный</option>
              <option value="square">Квадратный</option>
            </select>
            <div class="flex gap-2">
              <input v-model.number="formatForm.width" type="number" class="border rounded px-2 py-1 w-24" placeholder="Ширина" required min="1" />
              <input v-model.number="formatForm.height" type="number" class="border rounded px-2 py-1 w-24" placeholder="Высота" required min="1" />
            </div>
            <div class="flex items-center gap-2">
              <input v-model="formatForm.icon" type="text" class="border rounded px-2 py-1 flex-1" placeholder="Иконка (например: mdi:image)" />
              <button type="button" @click="showIconPicker = true" class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs">Выбрать иконку</button>
            </div>
            <div class="flex gap-2 mt-2">
              <button type="submit" class="px-3 py-1 bg-blue-600 text-white rounded">{{ editingFormat ? 'Сохранить' : 'Добавить' }}</button>
              <button v-if="editingFormat" @click.prevent="cancelEditFormat" class="px-3 py-1 bg-gray-200 text-gray-700 rounded">Отмена</button>
            </div>
          </form>
          <div v-if="formatSettings.length === 0" class="text-xs text-gray-400 mb-2">Нет форматов.</div>
          <div v-else class="mb-2">
            <div class="grid grid-cols-1 gap-2">
              <div v-for="f in formatSettings" :key="f.id" class="border rounded p-2 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Icon v-if="f.icon" :name="f.icon" class="w-4 h-4 text-gray-600" />
                  <span class="text-xs font-medium">{{ f.description }}</span>
                  <span class="text-xs text-gray-500">({{ f.width }}x{{ f.height }})</span>
                </div>
                <div class="flex gap-1">
                  <button class="text-xs text-yellow-700" @click="editFormat(f)">Редактировать</button>
                  <button class="text-xs text-red-700" @click="askDeleteFormat(f)">Удалить</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Модалка подтверждения удаления -->
        <div v-if="showDeleteFormatModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 w-full max-w-xs relative">
            <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700" @click="showDeleteFormatModal = false">✕</button>
            <h4 class="font-semibold mb-4">Удалить формат?</h4>
            <div class="mb-4">Вы уверены, что хотите удалить формат <b>{{ formatToDelete?.description }}</b>?</div>
            <div class="flex gap-2 justify-end">
              <button @click="showDeleteFormatModal = false" class="px-3 py-1 bg-gray-200 text-gray-700 rounded">Отмена</button>
              <button @click="deleteFormat" class="px-3 py-1 bg-red-600 text-white rounded">Удалить</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showMaskModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700" @click="showMaskModal = false; activeMaskTab = 'select'">✕</button>
        
        <!-- Заголовок и вкладки -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">Управление масками</h3>
          <div class="flex border-b">
            <button 
              :class="['px-4 py-2 border-b-2 font-medium', activeMaskTab === 'select' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
              @click="activeMaskTab = 'select'"
            >
              Выбрать маску
            </button>
            <button 
              :class="['px-4 py-2 border-b-2 font-medium', activeMaskTab === 'manage' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
              @click="activeMaskTab = 'manage'"
            >
              Загрузить новую
            </button>
          </div>
        </div>
        
        <!-- Вкладка "Выбрать маску" -->
        <div v-show="activeMaskTab === 'select'">
          <!-- Фильтр по типам -->
          <div class="flex gap-2 mb-4">
            <button v-for="type in maskTypes" :key="type.value" :class="['px-4 py-2 rounded', selectedMaskType === type.value ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200']" @click="selectMaskType(type.value)">{{ type.label }}</button>
          </div>
          
          <!-- Кнопка "Без маски" -->
          <div class="mb-4">
            <button class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 w-full" @click="chooseNoMask">Без маски</button>
          </div>
          
          <!-- Список масок -->
          <div v-if="filteredMasks.length > 0" class="grid grid-cols-3 gap-4">
            <div v-for="mask in filteredMasks" :key="mask.id" class="border rounded p-3 flex flex-col items-center hover:shadow-md transition-shadow">
              <img :src="mask.preview_path || mask.path" class="h-20 object-contain mb-2" />
              <div class="text-xs mb-2 text-center font-medium">{{ mask.name }}</div>
              <div class="flex gap-1 flex-wrap justify-center">
                <button class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200" @click="chooseMask(mask)">Выбрать</button>
                <button class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200" @click="editMask(mask)">Изменить</button>
                <button class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200" @click="askDeleteMask(mask)">Удалить</button>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center text-gray-500 py-8">
            Нет масок для выбранного типа "{{ maskTypes.find(t => t.value === selectedMaskType)?.label }}"
          </div>
        </div>
        
        <!-- Вкладка "Загрузить новую" -->
        <div v-show="activeMaskTab === 'manage'" class="space-y-4">
          <div>
            <h4 class="font-semibold mb-3">Загрузить новую маску</h4>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input 
                type="file" 
                accept="image/png" 
                @change="onMaskUploadChange" 
                class="hidden" 
                ref="maskUploadInput"
              />
              
              <div v-if="!maskUploadPreview" class="space-y-3">
                <div class="text-gray-500">
                  <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
                <div>
                  <button 
                    type="button" 
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    @click="$refs.maskUploadInput.click()"
                  >
                    Выбрать PNG файл
                  </button>
                  <p class="text-xs text-gray-500 mt-2">Только PNG файлы, максимум 5MB</p>
                </div>
              </div>
              
              <div v-else class="space-y-3">
                <img :src="maskUploadPreview" class="h-24 object-contain mx-auto border rounded" />
                <div>
                  <input 
                    v-model="maskUploadName" 
                    type="text" 
                    class="w-full border rounded px-3 py-2 mb-3" 
                    placeholder="Название маски"
                  />
                  <select v-model="selectedMaskType" class="w-full border rounded px-3 py-2 mb-3">
                    <option v-for="type in maskTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
                  </select>
                  <div class="flex gap-2 justify-center">
                    <button 
                      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      @click="uploadMask"
                    >
                      Загрузить маску
                    </button>
                    <button 
                      class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      @click="cancelMaskUpload"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка сохранения шаблона -->
    <div v-if="showSaveTemplateModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700" @click="showSaveTemplateModal = false">✕</button>
        <h3 class="text-lg font-semibold mb-4">Сохранить шаблон</h3>
        
        <form @submit.prevent="saveTemplate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Название шаблона *</label>
            <input 
              v-model="saveTemplateForm.name" 
              type="text" 
              class="w-full border rounded px-3 py-2" 
              placeholder="Например: Постер матча" 
              required 
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Описание (необязательно)</label>
            <textarea 
              v-model="saveTemplateForm.description" 
              class="w-full border rounded px-3 py-2 resize-none" 
              rows="3"
              placeholder="Краткое описание шаблона..."
            ></textarea>
          </div>
          
          <div class="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              @click="showSaveTemplateModal = false" 
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Отмена
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Сохранить шаблон
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Модалка загрузки шаблона -->
    <div v-if="showTemplateListModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-4xl relative max-h-[80vh] overflow-y-auto">
        <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700" @click="showTemplateListModal = false">✕</button>
        <h3 class="text-lg font-semibold mb-4">Выберите шаблон</h3>
        
        <div v-if="templateList.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="tpl in templateList" :key="tpl.id" class="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer" @click="applyTemplate(tpl)">
            <!-- Превью шаблона -->
            <div class="aspect-[4/3] bg-gray-100 flex items-center justify-center">
              <img v-if="tpl.preview" :src="tpl.preview" :alt="tpl.name" class="max-w-full max-h-full object-contain" />
              <div v-else class="text-gray-400 text-center">
                <Icon icon="mdi:image-outline" class="w-12 h-12 mx-auto mb-2" />
                <div class="text-sm">Нет превью</div>
              </div>
            </div>
            
            <!-- Информация о шаблоне -->
            <div class="p-3">
              <h4 class="font-medium text-sm mb-1 truncate">{{ tpl.name || `Шаблон #${tpl.id}` }}</h4>
              <p v-if="tpl.description" class="text-xs text-gray-500 mb-2 template-description">{{ tpl.description }}</p>
              <div class="text-xs text-gray-500 mb-2">
                <div v-if="tpl.created_at">{{ formatDate(tpl.created_at) }}</div>
                <div>{{ getTemplateInfo(tpl) }}</div>
              </div>
              <div class="flex items-center justify-between text-xs text-gray-400">
                <span>{{ getTemplateFormat(tpl) }}</span>
                <button class="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200" @click.stop="applyTemplate(tpl)">
                  Загрузить
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-gray-400">
          <Icon icon="mdi:folder-outline" class="w-12 h-12 mx-auto mb-2" />
          <div class="text-sm">Нет сохраненных шаблонов</div>
          <div class="text-xs mt-1">Создайте и сохраните свой первый шаблон</div>
        </div>
      </div>
    </div>
    
    <!-- Модалка просмотра галереи события -->
    <div v-if="showGalleryModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-6xl relative max-h-[90vh] overflow-y-auto">
        <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700" @click="showGalleryModal = false">✕</button>
        <h3 class="text-lg font-semibold mb-4">Галерея события</h3>
        
        <div v-if="loadingGallery" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-2 text-gray-600">Загрузка галереи...</span>
        </div>
        
        <div v-else-if="eventGallery.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div v-for="image in eventGallery" :key="image.id" class="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <!-- Превью изображения -->
            <div class="aspect-[4/3] bg-gray-100 flex items-center justify-center">
              <img 
                v-if="image.preview_path || image.path" 
                :src="getImageUrl(image.preview_path || image.path)" 
                :alt="`Изображение ${image.id}`" 
                class="max-w-full max-h-full object-contain cursor-pointer"
                @click="openImageFullscreen(image)"
              />
              <div v-else class="text-gray-400 text-center">
                <Icon icon="mdi:image-outline" class="w-12 h-12 mx-auto mb-2" />
                <div class="text-sm">Нет изображения</div>
              </div>
            </div>
            
            <!-- Информация об изображении -->
            <div class="p-3">
              <div class="text-xs text-gray-500 mb-2">
                <div v-if="image.created_at">{{ formatDate(image.created_at) }}</div>
                <div v-if="image.type" class="capitalize">{{ image.type }}</div>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-400">ID: {{ image.id }}</span>
                <button 
                  class="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200" 
                  @click="deleteImageFromGallery(image)"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-gray-400">
          <Icon icon="mdi:image-multiple-outline" class="w-12 h-12 mx-auto mb-2" />
          <div class="text-sm">Галерея пуста</div>
          <div class="text-xs mt-1">Сохраните изображения из редактора в галерею</div>
        </div>
      </div>
    </div>
    
    <!-- Модалка редактирования маски -->
    <div v-if="showEditMaskModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700" @click="cancelMaskEdit">✕</button>
        <h3 class="text-lg font-semibold mb-4">Редактировать маску</h3>
        
        <!-- Превью маски -->
        <div v-if="editingMask" class="mb-4 flex justify-center">
          <img :src="editingMask.preview_path || editingMask.path" class="h-24 object-contain border rounded" />
        </div>
        
        <form @submit.prevent="saveMaskEdit" class="flex flex-col gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Название</label>
            <input 
              v-model="maskEditForm.name" 
              type="text" 
              class="w-full border rounded px-3 py-2" 
              placeholder="Название маски" 
              required 
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Тип</label>
            <select v-model="maskEditForm.type" class="w-full border rounded px-3 py-2" required>
              <option value="horizontal">Горизонтальный</option>
              <option value="vertical">Вертикальный</option>
              <option value="square">Квадратный</option>
            </select>
          </div>
          
          <div class="flex gap-2 justify-end mt-4">
            <button type="button" @click="cancelMaskEdit" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              Отмена
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Модалка подтверждения удаления маски -->
    <div v-if="showDeleteMaskModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-sm relative">
        <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700" @click="cancelMaskDelete">✕</button>
        <h3 class="text-lg font-semibold mb-4">Удалить маску?</h3>
        
        <!-- Превью удаляемой маски -->
        <div v-if="maskToDelete" class="mb-4 flex flex-col items-center">
          <img :src="maskToDelete.preview_path || maskToDelete.path" class="h-16 object-contain border rounded mb-2" />
          <div class="text-sm text-gray-600">{{ maskToDelete.name }}</div>
        </div>
        
        <p class="text-gray-700 mb-6">Вы уверены, что хотите удалить эту маску? Это действие нельзя отменить.</p>
        
        <div class="flex gap-2 justify-end">
          <button @click="cancelMaskDelete" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
            Отмена
          </button>
          <button @click="deleteMask" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Удалить
          </button>
        </div>
      </div>
    </div>
    
    <!-- Модалка выбора иконки -->
    <div v-if="showIconPicker" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl relative max-h-[80vh] overflow-y-auto">
        <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700" @click="showIconPicker = false">✕</button>
        <h3 class="text-lg font-semibold mb-4">Выберите иконку</h3>
        <div class="grid grid-cols-6 gap-2">
          <button 
            v-for="icon in popularIcons" 
            :key="icon" 
            class="p-2 border rounded hover:bg-gray-100 flex items-center justify-center"
            @click="selectIcon(icon)"
          >
            <Icon :icon="icon" class="w-6 h-6" />
          </button>
        </div>
        <div class="mt-4">
          <input 
            v-model="iconSearch" 
            type="text" 
            class="border rounded px-2 py-1 w-full" 
            placeholder="Поиск иконки..."
            @input="searchIcons"
          />
        </div>
      </div>
    </div>
    
    <!-- Модалка выбора диаграммы -->
    <div v-if="showDiagramModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg relative max-h-[80vh] overflow-y-auto">
        <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700" @click="showDiagramModal = false">✕</button>
        <h3 class="text-lg font-semibold mb-4">Выберите событие для диаграммы</h3>
        
        <div v-if="availableTeamActions.length > 0" class="mb-4">
          <button 
            class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
            @click="createAllDiagrams"
          >
            <Icon icon="mdi:chart-multiple" class="w-5 h-5" />
            Добавить все диаграммы ({{ availableTeamActions.length }})
          </button>
        </div>
        
        <div v-if="availableTeamActions.length > 0" class="space-y-3">
          <div v-for="action in availableTeamActions" :key="action.id" class="border rounded p-3 hover:bg-gray-50 cursor-pointer" @click="createDiagramFromAction(action)">
            <div class="flex items-center gap-2 mb-2">
              <Icon v-if="action.team_action_type?.icon" :icon="action.team_action_type.icon" class="w-5 h-5" />
              <span class="font-medium">{{ action.team_action_type?.name || 'Событие' }}</span>
            </div>
            
            <!-- Превью диаграммы -->
            <div class="flex items-center gap-2">
              <span class="text-sm font-mono text-blue-600 w-8">{{ action.value_home }}</span>
              <div class="flex-1 relative h-4 rounded overflow-hidden bg-gray-200" style="min-width: 100px;">
                <div v-if="action.value_home + action.value_away > 0" 
                     :style="{ width: ((action.value_home / (action.value_home + action.value_away)) * 100) + '%', background: '#2563eb', height: '100%', position: 'absolute', left: 0, top: 0 }"></div>
                <div v-if="action.value_home + action.value_away > 0" 
                     :style="{ width: ((action.value_away / (action.value_home + action.value_away)) * 100) + '%', background: '#059669', height: '100%', position: 'absolute', left: ((action.value_home / (action.value_home + action.value_away)) * 100) + '%' }"></div>
                <div v-if="action.value_home + action.value_away === 0" class="absolute inset-0 flex items-center justify-center text-xs text-gray-400">0%</div>
              </div>
              <span class="text-sm font-mono text-green-600 w-8">{{ action.value_away }}</span>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-gray-400">
          <Icon icon="mdi:chart-bar" class="w-12 h-12 mx-auto mb-2" />
          <div class="text-sm">Нет событий команд для создания диаграмм</div>
          <div class="text-xs mt-1">Добавьте события команд на странице редактирования</div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Модальное окно подтверждения -->
  <div v-if="showConfirmModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[60]">
    <div class="bg-white rounded-lg p-6 w-full max-w-md relative shadow-xl">
      <!-- Иконка и заголовок -->
      <div class="flex items-center gap-3 mb-4">
        <div class="flex-shrink-0">
          <Icon icon="mdi:help-circle" class="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">
            {{ confirmTitle }}
          </h3>
        </div>
      </div>
      
      <!-- Сообщение -->
      <div class="mb-6">
        <p class="text-gray-700">{{ confirmMessage }}</p>
      </div>
      
      <!-- Кнопки -->
      <div class="flex gap-3 justify-end">
        <button 
          @click="cancelAction"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium transition-colors"
        >
          Отмена
        </button>
        <button 
          @click="confirmAction"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium transition-colors"
        >
          Подтвердить
        </button>
      </div>
    </div>
  </div>
  
  <!-- Модальное окно уведомлений -->
  <div v-if="showNotification" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[60]">
    <div class="bg-white rounded-lg p-6 w-full max-w-md relative shadow-xl">
      <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700" @click="showNotification = false">✕</button>
      
      <!-- Иконка и заголовок -->
      <div class="flex items-center gap-3 mb-4">
        <div class="flex-shrink-0">
          <Icon 
            v-if="notificationType === 'success'" 
            icon="mdi:check-circle" 
            class="w-8 h-8 text-green-500" 
          />
          <Icon 
            v-else-if="notificationType === 'error'" 
            icon="mdi:alert-circle" 
            class="w-8 h-8 text-red-500" 
          />
          <Icon 
            v-else-if="notificationType === 'warning'" 
            icon="mdi:alert" 
            class="w-8 h-8 text-yellow-500" 
          />
          <Icon 
            v-else 
            icon="mdi:information" 
            class="w-8 h-8 text-blue-500" 
          />
        </div>
        <div>
          <h3 class="text-lg font-semibold" :class="{
            'text-green-700': notificationType === 'success',
            'text-red-700': notificationType === 'error',
            'text-yellow-700': notificationType === 'warning',
            'text-blue-700': notificationType === 'info'
          }">
            {{ notificationTitle }}
          </h3>
        </div>
      </div>
      
      <!-- Сообщение -->
      <div class="mb-6">
        <p class="text-gray-700 whitespace-pre-line">{{ notificationMessage }}</p>
      </div>
      
      <!-- Кнопка закрытия -->
      <div class="flex justify-end">
        <button 
          @click="showNotification = false"
          class="px-4 py-2 rounded text-sm font-medium transition-colors"
          :class="{
            'bg-green-100 text-green-700 hover:bg-green-200': notificationType === 'success',
            'bg-red-100 text-red-700 hover:bg-red-200': notificationType === 'error',
            'bg-yellow-100 text-yellow-700 hover:bg-yellow-200': notificationType === 'warning',
            'bg-blue-100 text-blue-700 hover:bg-blue-200': notificationType === 'info'
          }"
        >
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

// Получаем runtime конфигурацию
const config = useRuntimeConfig();
const apiUrl = config.public.API_URL;

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

// Константы типов для шаблонов
const IMAGE_TYPES = {
  EVENT_IMAGE: 'event_image',
  HOME_TEAM_LOGO: 'home_team_logo', 
  AWAY_TEAM_LOGO: 'away_team_logo',
  COMPETITION_LOGO: 'competition_logo',
  VENUE_IMAGE: 'venue_image',
  CUSTOM_UPLOAD: 'custom_upload'
};

const TEXT_TYPES = {
  EVENT_TITLE: 'event_title',
  HOME_TEAM_NAME: 'home_team_name',
  AWAY_TEAM_NAME: 'away_team_name', 
  COMPETITION_NAME: 'competition_name',
  VENUE_NAME: 'venue_name',
  EVENT_DATE: 'event_date',
  EVENT_TIME: 'event_time',
  SCORE: 'score',
  ADDITIONAL_SCORE: 'additional_score',
  SPORT_NAME: 'sport_name',
  CITY_NAME: 'city_name',
  HOME_TEAM_CITY: 'home_team_city',
  AWAY_TEAM_CITY: 'away_team_city',
  CUSTOM_TEXT: 'custom_text'
};

const COMPUTED_TYPES = {
  TEAM_COMPOSITION_HOME: 'team_composition_home',
  TEAM_COMPOSITION_AWAY: 'team_composition_away', 
  TEAM_EVENTS_HOME: 'team_events_home',
  TEAM_EVENTS_AWAY: 'team_events_away',
  TEAM_DIAGRAM_HOME: 'team_diagram_home',
  TEAM_DIAGRAM_AWAY: 'team_diagram_away',
  SCORE_HOME: 'score_home',
  SCORE_AWAY: 'score_away',
  EVENT_COUNT: 'event_count'
};

// Форматы изображения
const selectedFormat = ref('horizontal');
const showFormatSettings = ref(false);
const showMaskModal = ref(false);
const showIconPicker = ref(false);
const iconSearch = ref('');
const showDiagramModal = ref(false);
const showSaveTemplateModal = ref(false);
const saveTemplateForm = ref({ name: '', description: '' });

// Переменные для галереи
const showGalleryModal = ref(false);
const eventGallery = ref([]);
const loadingGallery = ref(false);

// Переменные для уведомлений
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref('success'); // 'success', 'error', 'warning', 'info'
const notificationTitle = ref('');

// Переменные для модалки подтверждения
const showConfirmModal = ref(false);
const confirmMessage = ref('');
const confirmTitle = ref('');
const confirmCallback = ref(null);

// Переменные для сохранения в галерею
const savingToGallery = ref(false);

// --- Фоновое изображение ---
const props = defineProps({
  eventData: Object,
  teamActions: Array,
  teamActionTypeOptions: Array
});

const emit = defineEmits(['image-saved']);

const bgSource = ref('none'); // 'event' | 'upload' | 'none'
const bgPreview = ref('');
const bgFile = ref(null);

// Переменные для загрузки фонового изображения
const bgFileInputRef = ref(null);
const isBgImageLoading = ref(false);
const bgCurrentError = ref('');
const showBgUrlInput = ref(false);
const bgUrlInput = ref('');

watch(bgSource, async () => {
  bgCurrentError.value = '';
  showBgUrlInput.value = false;
  bgUrlInput.value = '';
  
  if (bgSource.value === 'event') {
    const eventImagePath = props.eventData?.event_image_path || '';
    if (eventImagePath) {
      // Проверяем, нужно ли использовать прокси для изображения события
      if (!eventImagePath.startsWith(window.location.origin) && !eventImagePath.startsWith('/') && !eventImagePath.startsWith('data:')) {
        // Используем прокси для внешних изображений (CORS)
        isBgImageLoading.value = true;
        try {
          const response = await fetch(`${apiUrl}/api/image-proxy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ url: eventImagePath })
          });
          
          if (response.ok) {
            const blob = await response.blob();
            bgPreview.value = URL.createObjectURL(blob);
            bgFile.value = new File([blob], 'event-image.jpg', { type: blob.type });
          } else {
            throw new Error('Proxy response not ok');
          }
        } catch (error) {
          console.error('Error loading event image through proxy:', error);
          bgCurrentError.value = 'Ошибка загрузки изображения события';
          // Fallback: пробуем оригинальный URL (может работать если CORS настроен)
          bgPreview.value = eventImagePath;
          bgFile.value = null;
        } finally {
          isBgImageLoading.value = false;
        }
      } else {
        // Локальное изображение - используем напрямую
        bgPreview.value = eventImagePath;
        bgFile.value = null;
      }
    } else {
      bgPreview.value = '';
      bgFile.value = null;
    }
  } else if (bgSource.value === 'upload') {
    // Ждём загрузки файла - очищаем предыдущие данные
    bgPreview.value = '';
    bgFile.value = null;
  } else {
    // none
    bgPreview.value = '';
    bgFile.value = null;
  }
  
  // Принудительно перерисовываем canvas после изменения источника фона
  setTimeout(() => {
    renderEditorCanvas();
  }, 100);
});

// Функция масштабирования изображения под нужный формат
async function resizeImageToFormat(file, width, height) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // Заливаем белым фоном
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);
      
      // Вычисляем пропорции для cover (заполнение с обрезкой и центрированием)
      const ratio = Math.max(width / img.width, height / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;
      const offsetX = (width - newWidth) / 2;
      const offsetY = (height - newHeight) / 2;
      
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

// Функция масштабирования изображения по URL
async function resizeImageFromUrl(imageUrl, width, height) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // Заливаем белым фоном
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);
      
      // Вычисляем пропорции для cover (заполнение с обрезкой и центрированием)
      const ratio = Math.max(width / img.width, height / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;
      const offsetX = (width - newWidth) / 2;
      const offsetY = (height - newHeight) / 2;
      
      ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);
      
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Ошибка масштабирования'));
        const scaledFile = new File([blob], 'resized-bg-image.jpg', { type: 'image/jpeg', lastModified: Date.now() });
        resolve(scaledFile);
      }, 'image/jpeg', 0.92);
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}

// Обработка загрузки файла фонового изображения
async function handleBgFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!file.type.match('image.*')) {
    bgCurrentError.value = 'Пожалуйста, выберите файл изображения';
    return;
  }
  
  if (file.size > 10 * 1024 * 1024) {
    bgCurrentError.value = 'Размер файла не должен превышать 10MB';
    return;
  }
  
  isBgImageLoading.value = true;
  bgCurrentError.value = '';
  
  try {
    // Масштабируем под размер выбранного формата
    const scaledFile = await resizeImageToFormat(file, editorWidth.value, editorHeight.value);
    bgPreview.value = URL.createObjectURL(scaledFile);
    bgFile.value = scaledFile;
  } catch (err) {
    bgCurrentError.value = 'Ошибка масштабирования изображения';
    console.error('Background image resize error:', err);
  } finally {
    isBgImageLoading.value = false;
  }
}

// Обработка загрузки фонового изображения по URL
async function handleBgUrlSubmit() {
  if (!bgUrlInput.value) {
    bgCurrentError.value = 'Введите URL';
    return;
  }
  
  isBgImageLoading.value = true;
  bgCurrentError.value = '';
  
  try {
    let imageUrl = bgUrlInput.value;
    
    // YouTube превью
    if (/youtube\.com|youtu\.be/.test(imageUrl)) {
      const videoId = imageUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
      if (!videoId) throw new Error('Неверный формат URL YouTube');
      imageUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    
    // Прокси для CORS
    let fetchUrl = imageUrl;
    if (!/^data:/.test(imageUrl) && !imageUrl.startsWith(window.location.origin)) {
      fetchUrl = `${apiUrl}/api/image-proxy`;
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
    const file = new File([blob], 'bg-image.jpg', { type: blob.type, lastModified: Date.now() });
    
    // Масштабируем под размер выбранного формата
    const scaledFile = await resizeImageToFormat(file, editorWidth.value, editorHeight.value);
    bgPreview.value = URL.createObjectURL(scaledFile);
    bgFile.value = scaledFile;
    
    showBgUrlInput.value = false;
    bgUrlInput.value = '';
    
  } catch (err) {
    bgCurrentError.value = err.message || 'Ошибка загрузки изображения';
    console.error('Background URL loading error:', err);
  } finally {
    isBgImageLoading.value = false;
  }
}

// --- Маски (image-templates) ---
const maskTypes = [
  { value: 'horizontal', label: 'Горизонтальный' },
  { value: 'vertical', label: 'Вертикальный' },
  { value: 'square', label: 'Квадратный' },
];
const selectedMaskType = ref('horizontal');
const masks = ref([]);
const selectedMask = ref(null);
const maskPreview = ref('');
const maskUploadFile = ref(null);
const maskUploadPreview = ref('');
const maskUploadName = ref('');

// Кеш для загруженных через прокси изображений
const imageProxyCache = ref(new Map());

// Функция для загрузки изображения через прокси (для решения CORS)
async function loadImageThroughProxy(imageUrl) {
  try {
    // Проверяем кеш
    if (imageProxyCache.value.has(imageUrl)) {
      return imageProxyCache.value.get(imageUrl);
    }
    
    // Проверяем, нужно ли использовать прокси
    if (imageUrl.startsWith('/storage/') || imageUrl.startsWith(window.location.origin) || imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
      // Локальное изображение - используем напрямую
      imageProxyCache.value.set(imageUrl, imageUrl);
      return imageUrl;
    }

    // Загружаем через прокси
    const response = await fetch(`${apiUrl}/api/image-proxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ url: imageUrl })
    });

    if (response.ok) {
      const blob = await response.blob();
      const proxyUrl = URL.createObjectURL(blob);
      
      // Кешируем результат
      imageProxyCache.value.set(imageUrl, proxyUrl);
      
      return proxyUrl;
    } else {
      throw new Error('Proxy response not ok');
    }
  } catch (error) {
    console.error('Error loading image through proxy:', imageUrl, error);
    // Возвращаем оригинальный URL как fallback
    return imageUrl;
  }
}

// Функция для загрузки маски через прокси (для решения CORS) - использует общую функцию
async function loadMaskThroughProxy(maskUrl) {
  return loadImageThroughProxy(maskUrl);
}

// Переменные для вкладок в модалке масок
const activeMaskTab = ref('select'); // 'select' | 'manage'

// Переменные для редактирования масок
const showEditMaskModal = ref(false);
const showDeleteMaskModal = ref(false);
const editingMask = ref(null);
const maskToDelete = ref(null);
const maskEditForm = ref({
  name: '',
  type: 'horizontal'
});

async function loadMasks() {
  try {
    const res = await $fetch('/api/image-templates', {
      baseURL: apiUrl
    });
    masks.value = Array.isArray(res) ? res : (res?.data || []);
  } catch (e) {
    console.error('Error loading masks:', e);
    masks.value = [];
  }
}

function selectMaskType(type) {
  selectedMaskType.value = type;
}
const filteredMasks = computed(() => masks.value.filter(m => m.type === selectedMaskType.value));

function chooseMask(mask) {
  selectedMask.value = mask;
  maskPreview.value = mask?.preview_path || mask?.path || '';
  showMaskModal.value = false;
  
  // Принудительно обновляем UI через nextTick
  nextTick(() => {
    // Перерисовываем canvas
    renderEditorCanvas();
  });
}
function chooseNoMask() {
  selectedMask.value = null;
  maskPreview.value = '';
  showMaskModal.value = false;
}

function onMaskUploadChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // Валидация файла
  if (!file.type.match('image/png')) {
    showNotificationMessage('Ошибка', 'Пожалуйста, выберите файл PNG', 'error');
    e.target.value = '';
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB
    showNotificationMessage('Ошибка', 'Размер файла не должен превышать 5MB', 'error');
    e.target.value = '';
    return;
  }
  
  maskUploadFile.value = file;
  maskUploadName.value = file.name.replace('.png', '');
  
  const reader = new FileReader();
  reader.onload = (ev) => {
    maskUploadPreview.value = ev.target.result;
  };
  reader.readAsDataURL(file);
}

async function uploadMask() {
  if (!maskUploadFile.value) return;
  // resize на фронте до нужного размера типа
  const setting = formatSettings.value.find(f => f.type === selectedMaskType.value);
  if (!setting) return;
  const img = new window.Image();
  img.onload = async function () {
    const canvas = document.createElement('canvas');
    canvas.width = setting.width;
    canvas.height = setting.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('name', maskUploadName.value || 'Маска');
      formData.append('type', selectedMaskType.value);
      formData.append('width', setting.width);
      formData.append('height', setting.height);
      formData.append('image', new File([blob], maskUploadName.value, { type: blob.type }));
      const response = await $fetch('/api/image-templates', { 
        method: 'POST', 
        body: formData,
        baseURL: apiUrl
      });
      
      // Обновляем список масок
      await loadMasks();
      
      // Находим и выбираем загруженную маску
      const uploadedMask = masks.value.find(mask => mask.id === response.id);
      
      if (uploadedMask) {
        chooseMask(uploadedMask);
      } else {
        // Если маска не найдена по ID, попробуем найти по имени и типу
        const maskByName = masks.value.find(mask => 
          mask.name === response.name && mask.type === response.type
        );
        if (maskByName) {
          chooseMask(maskByName);
        }
      }
      
      // Очищаем форму загрузки и переключаемся на вкладку выбора
      cancelMaskUpload();
      activeMaskTab.value = 'select';
    }, 'image/png');
  };
  img.src = URL.createObjectURL(maskUploadFile.value);
}

// Функции для редактирования масок
function editMask(mask) {
  editingMask.value = mask;
  maskEditForm.value = {
    name: mask.name,
    type: mask.type
  };
  showEditMaskModal.value = true;
}

async function saveMaskEdit() {
  if (!editingMask.value) return;
  
  try {
    await $fetch(`/api/image-templates/${editingMask.value.id}`, {
      method: 'PATCH',
      body: maskEditForm.value,
      baseURL: apiUrl
    });
    
    // Обновляем список масок
    await loadMasks();
    
    // Если редактируемая маска была выбрана, обновляем её данные
    if (selectedMask.value && selectedMask.value.id === editingMask.value.id) {
      const updatedMask = masks.value.find(m => m.id === editingMask.value.id);
      if (updatedMask) {
        selectedMask.value = updatedMask;
      }
    }
    
    cancelMaskEdit();
  } catch (error) {
    console.error('Error updating mask:', error);
    showNotificationMessage('Ошибка', 'Ошибка при обновлении маски', 'error');
  }
}

function cancelMaskEdit() {
  editingMask.value = null;
  maskEditForm.value = { name: '', type: 'horizontal' };
  showEditMaskModal.value = false;
}

// Функции для удаления масок
function askDeleteMask(mask) {
  maskToDelete.value = mask;
  showDeleteMaskModal.value = true;
}

async function deleteMask() {
  if (!maskToDelete.value) return;
  
  try {
    await $fetch(`/api/image-templates/${maskToDelete.value.id}`, {
      method: 'DELETE',
      baseURL: apiUrl
    });
    
    // Если удаляемая маска была выбрана, сбрасываем выбор
    if (selectedMask.value && selectedMask.value.id === maskToDelete.value.id) {
      chooseNoMask();
    }
    
    // Обновляем список масок
    await loadMasks();
    
    cancelMaskDelete();
  } catch (error) {
    console.error('Error deleting mask:', error);
    showNotificationMessage('Ошибка', 'Ошибка при удалении маски', 'error');
  }
}

function cancelMaskDelete() {
  maskToDelete.value = null;
  showDeleteMaskModal.value = false;
}

// Функция для отмены загрузки маски
function cancelMaskUpload() {
  maskUploadFile.value = null;
  maskUploadPreview.value = '';
  maskUploadName.value = '';
  // Сбрасываем input file
  const fileInput = document.querySelector('input[type="file"][accept="image/png"]');
  if (fileInput) {
    fileInput.value = '';
  }
}

watch(selectedMask, (val) => {
  const newMaskPreview = val ? (val.preview_path || val.path || '') : '';
  maskPreview.value = newMaskPreview;
  
  // Перерисовываем canvas после изменения маски
  nextTick(() => {
    renderEditorCanvas();
  });
});

// Текстовые слои
let layerId = 1;
const textLayers = ref([]);
const activeTextTab = ref(0); // Активная вкладка текста
function addTextLayer() {
  // Смещаем позицию для новых слоев чтобы они не накладывались
  const layerOffset = textLayers.value.length * 30;
  const startX = 20 + layerOffset;
  const startY = 40 + layerOffset;
  
  const newLayer = {
    id: ++layerId,
    text: '',
    color: '#222222',
    size: 32,
    font: 'Arial',
    shadow: false,
    x: startX,
    y: startY,
    bold: false,
    italic: false,
    stroke: false,
    strokeColor: '#ffffff',
    strokeWidth: 2,
    visible: true,
    align: 'left', // 'left', 'center', 'right'
  };
  
  textLayers.value.push(newLayer);
  
  // Автоматически выбираем новый слой и переключаемся на его вкладку
  selectedTextLayerIdx.value = textLayers.value.length - 1;
  activeTextTab.value = textLayers.value.length - 1;
}
// --- Выделение и управление текстовыми слоями ---
const selectedTextLayerIdx = ref(null);
function selectTextLayer(idx) {
  selectedTextLayerIdx.value = idx;
}
function removeTextLayer(idx) {
  textLayers.value.splice(idx, 1);
  
  // Обновляем выбранный слой и активную вкладку
  if (selectedTextLayerIdx.value === idx) {
    // Если удаляем выбранный слой, выбираем предыдущий или следующий
    if (textLayers.value.length > 0) {
      const newIdx = Math.min(idx, textLayers.value.length - 1);
      selectedTextLayerIdx.value = newIdx;
      activeTextTab.value = newIdx;
    } else {
      selectedTextLayerIdx.value = null;
      activeTextTab.value = 0;
    }
  } else if (selectedTextLayerIdx.value !== null && selectedTextLayerIdx.value > idx) {
    // Если удаляем слой перед выбранным, сдвигаем индекс
    selectedTextLayerIdx.value--;
    activeTextTab.value--;
  } else if (activeTextTab.value > idx) {
    // Обновляем активную вкладку
    activeTextTab.value--;
  }
}
function moveTextLayerUp(idx) {
  if (idx <= 0) return;
  const arr = textLayers.value;
  [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
  selectedTextLayerIdx.value = idx - 1;
  activeTextTab.value = idx - 1;
}
function moveTextLayerDown(idx) {
  if (idx >= textLayers.value.length - 1) return;
  const arr = textLayers.value;
  [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
  selectedTextLayerIdx.value = idx + 1;
  activeTextTab.value = idx + 1;
}

// Дублирование текстового слоя
function duplicateTextLayer(idx) {
  const originalLayer = textLayers.value[idx];
  const layerOffset = 15; // Небольшое смещение для копии
  
  const duplicatedLayer = {
    ...originalLayer,
    id: ++layerId,
    text: originalLayer.text + (originalLayer.text ? ' (копия)' : ''),
    x: (originalLayer.x || 20) + layerOffset,
    y: (originalLayer.y || 20) + layerOffset,
    align: originalLayer.align || 'left',
  };
  
  // Вставляем копию сразу после оригинала
  textLayers.value.splice(idx + 1, 0, duplicatedLayer);
  
  // Выбираем дублированный слой и переключаемся на его вкладку
  selectedTextLayerIdx.value = idx + 1;
  activeTextTab.value = idx + 1;
}

// Переключение видимости слоя
function toggleLayerVisibility(idx) {
  const layer = textLayers.value[idx];
  layer.visible = layer.visible !== false ? false : true;
}

// Очистка всех текстовых слоев
function clearAllTextLayers() {
  showConfirmDialog(
    'Очистка слоев', 
    'Удалить все текстовые слои?', 
    () => {
      textLayers.value = [];
      selectedTextLayerIdx.value = null;
    }
  );
}

// --- Слои изображений (эмблемы, диаграммы) ---
const imageLayers = ref([]);
const selectedImageLayerIdx = ref(null);
const isLoadingEmblem = ref(false);

async function addEmblemLayer(type) {
  // type: 'club1', 'club2', 'competition'
  let src = '';
  if (type === 'club1') src = props.eventData?.club1?.full_image_path || '';
  if (type === 'club2') src = props.eventData?.club2?.full_image_path || '';
  if (type === 'competition') src = props.eventData?.competition?.full_image_path || '';
  if (!src) return;
  
  if (isLoadingEmblem.value) return; // Предотвращаем двойное нажатие
  
  isLoadingEmblem.value = true;
  
  try {
    // Загружаем изображение через прокси для решения CORS
    const proxySrc = await loadImageThroughProxy(src);
    
    // Создаем временное изображение для получения оригинальных размеров
    const tempImg = new window.Image();
    tempImg.onload = () => {
      const aspectRatio = tempImg.width / tempImg.height;
      
      imageLayers.value.push({
        src: proxySrc,
        originalSrc: src, // Сохраняем оригинальный URL для отладки
        x: 40 + imageLayers.value.length * 30,
        y: 40 + imageLayers.value.length * 30,
        width: 80,
        height: 80 / aspectRatio, // Сохраняем пропорции
        type,
        aspectRatio, // Сохраняем пропорции для resize
        originalWidth: tempImg.width,
        originalHeight: tempImg.height,
      });
      
      // Перерисовываем canvas после добавления эмблемы
      setTimeout(renderEditorCanvas, 50);
    };
    tempImg.onerror = () => {
      // Fallback: добавляем с квадратными размерами
      imageLayers.value.push({
        src: proxySrc,
        originalSrc: src,
        x: 40 + imageLayers.value.length * 30,
        y: 40 + imageLayers.value.length * 30,
        width: 80,
        height: 80,
        type,
        aspectRatio: 1, // Квадрат по умолчанию
      });
      
      setTimeout(renderEditorCanvas, 50);
    };
    tempImg.src = proxySrc;
  } catch (error) {
    console.error('Error adding emblem layer:', error);
    showNotificationMessage('Ошибка', `Ошибка загрузки эмблемы: ${error.message || 'Неизвестная ошибка'}`, 'error');
  } finally {
    isLoadingEmblem.value = false;
  }
}
// Функция для создания диаграммы из события команды
function createDiagramFromAction(action) {
  const diagramCanvas = generateDiagramCanvas(action);
  const src = diagramCanvas.toDataURL('image/png');
  
  imageLayers.value.push({
    src,
    x: 50 + imageLayers.value.length * 20,
    y: 50 + imageLayers.value.length * 20,
    width: 300,
    height: 120,
    type: 'diagram',
    aspectRatio: 300 / 120,
    actionData: action, // Сохраняем данные для возможного редактирования
  });
  
  showDiagramModal.value = false;
  
  // Перерисовываем canvas
  setTimeout(renderEditorCanvas, 50);
}

// Функция для создания всех доступных диаграмм сразу
function createAllDiagrams() {
  availableTeamActions.value.forEach((action, index) => {
    const diagramCanvas = generateDiagramCanvas(action);
    const src = diagramCanvas.toDataURL('image/png');
    
    // Располагаем диаграммы в сетке (2 в ряд)
    const col = index % 2;
    const row = Math.floor(index / 2);
    const offsetX = col * 320; // 300 ширина + 20 отступ
    const offsetY = row * 140; // 120 высота + 20 отступ
    
    imageLayers.value.push({
      src,
      x: 50 + offsetX,
      y: 50 + offsetY,
      width: 300,
      height: 120,
      type: 'diagram',
      aspectRatio: 300 / 120,
      actionData: action,
    });
  });
  
  showDiagramModal.value = false;
  
  // Перерисовываем canvas
  setTimeout(renderEditorCanvas, 50);
}

// Функция для генерации canvas с диаграммой
function generateDiagramCanvas(action) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Размеры диаграммы
  const width = 300;
  const height = 120;
  canvas.width = width;
  canvas.height = height;
  
  // Заливаем белым фоном
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  
  // Параметры диаграммы
  const padding = 20;
  const barHeight = 30;
  const barY = (height - barHeight) / 2;
  const barWidth = width - padding * 2;
  
  // Вычисляем пропорции
  const total = action.value_home + action.value_away;
  const homePercent = total > 0 ? (action.value_home / total) * 100 : 50;
  const awayPercent = total > 0 ? (action.value_away / total) * 100 : 50;
  
  // Рисуем фон диаграммы
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(padding, barY, barWidth, barHeight);
  
  // Рисуем сегмент домашней команды (синий)
  if (homePercent > 0) {
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(padding, barY, (barWidth * homePercent / 100), barHeight);
  }
  
  // Рисуем сегмент гостевой команды (зеленый)
  if (awayPercent > 0) {
    ctx.fillStyle = '#059669';
    ctx.fillRect(padding + (barWidth * homePercent / 100), barY, (barWidth * awayPercent / 100), barHeight);
  }
  
  // Настройки текста
  ctx.fillStyle = '#374151';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  
  // Заголовок диаграммы
  const title = action.team_action_type?.name || 'Событие';
  ctx.fillText(title, width / 2, 25);
  
  // Значения команд
  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = '#2563eb';
  ctx.textAlign = 'left';
  ctx.fillText(action.value_home.toString(), padding, barY - 5);
  
  ctx.fillStyle = '#059669';
  ctx.textAlign = 'right';
  ctx.fillText(action.value_away.toString(), width - padding, barY - 5);
  
  // Проценты (если есть значения)
  if (total > 0) {
    ctx.font = '12px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    
    // Процент для домашней команды
    if (homePercent > 15) { // Показываем только если достаточно места
      ctx.fillText(Math.round(homePercent) + '%', padding + (barWidth * homePercent / 200), barY + barHeight / 2 + 4);
    }
    
    // Процент для гостевой команды
    if (awayPercent > 15) { // Показываем только если достаточно места
      ctx.fillText(Math.round(awayPercent) + '%', padding + (barWidth * homePercent / 100) + (barWidth * awayPercent / 200), barY + barHeight / 2 + 4);
    }
  }
  

  
  return canvas;
}
function removeImageLayer(idx) {
  imageLayers.value.splice(idx, 1);
  if (selectedImageLayerIdx.value === idx) selectedImageLayerIdx.value = null;
}

// Функции для улучшения отображения слоев изображений
async function handleImageLayerError(layer, index) {
  console.error('Error loading image layer preview:', layer.src);
  
  // Если есть оригинальный URL, пробуем загрузить через прокси
  if (layer.originalSrc && layer.src === layer.originalSrc) {
    try {
      const proxySrc = await loadImageThroughProxy(layer.originalSrc);
      if (proxySrc !== layer.originalSrc) {
        // Обновляем src на прокси URL
        imageLayers.value[index].src = proxySrc;
      }
    } catch (error) {
      console.error('Failed to load image through proxy:', error);
    }
  }
}

function getImageLayerAlt(layer) {
  const typeNames = {
    'club1': props.eventData?.club1?.title || 'Эмблема 1-й команды',
    'club2': props.eventData?.club2?.title || 'Эмблема 2-й команды', 
    'competition': props.eventData?.competition?.title || 'Эмблема соревнования',
    'diagram': 'Диаграмма'
  };
  return typeNames[layer.type] || layer.type || 'Изображение';
}

function getImageLayerDisplayName(layer) {
  const typeNames = {
    'club1': props.eventData?.club1?.title || 'Команда 1',
    'club2': props.eventData?.club2?.title || 'Команда 2',
    'competition': props.eventData?.competition?.title || 'Соревнование',
    'diagram': 'Диаграмма'
  };
  return typeNames[layer.type] || layer.type || 'Изображение';
}

// Drag&drop и resize для imageLayers
let draggingImageIdx = null;
let dragImageOffset = { x: 0, y: 0 };
let resizingImageIdx = null;
let resizeStart = { x: 0, y: 0, width: 0, height: 0 };
let hoverImageIdx = null;

// Drag&drop для textLayers
let draggingTextIdx = null;
let dragOffset = { x: 0, y: 0 };

function onCanvasMouseDown(e) {
  const rect = editorCanvas.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  // Проверка клика по крестику удаления
  for (let i = imageLayers.value.length - 1; i >= 0; i--) {
    const layer = imageLayers.value[i];
    const cx = layer.x + layer.width;
    const cy = layer.y;
    if (Math.hypot(x - cx, y - cy) <= 12) {
      removeImageLayer(i);
      renderEditorCanvas();
      return;
    }
  }
  // Проверка resize-хэндлов
  for (let i = imageLayers.value.length - 1; i >= 0; i--) {
    const layer = imageLayers.value[i];
    if (
      x >= layer.x + layer.width - 12 && x <= layer.x + layer.width + 12 &&
      y >= layer.y + layer.height - 12 && y <= layer.y + layer.height + 12
    ) {
      resizingImageIdx = i;
      isDragging = true;
      resizeStart = { x, y, width: layer.width, height: layer.height };
      window.addEventListener('mousemove', onCanvasImageResize);
      window.addEventListener('mouseup', onCanvasImageUp);
      selectedImageLayerIdx.value = i;
      return;
    }
  }
  // Проверка drag по изображению
  for (let i = imageLayers.value.length - 1; i >= 0; i--) {
    const layer = imageLayers.value[i];
    if (
      x >= layer.x && x <= layer.x + layer.width &&
      y >= layer.y && y <= layer.y + layer.height
    ) {
      draggingImageIdx = i;
      isDragging = true;
      dragImageOffset = { x: x - layer.x, y: y - layer.y };
      window.addEventListener('mousemove', onCanvasImageMove);
      window.addEventListener('mouseup', onCanvasImageUp);
      selectedImageLayerIdx.value = i;
      return;
    }
  }
  selectedImageLayerIdx.value = null;
  onCanvasTextMouseDown(e);
}
// Throttling для drag операций с изображениями
let imageDragTimeout = null;

function onCanvasImageMove(e) {
  if (draggingImageIdx === null) return;
  
  // Throttling для плавного drag
  if (imageDragTimeout) {
    return;
  }
  
  imageDragTimeout = requestAnimationFrame(() => {
    imageDragTimeout = null;
    
    const rect = editorCanvas.value.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const layer = imageLayers.value[draggingImageIdx];
    // Защита от выхода за границы
    let newX = x - dragImageOffset.x;
    let newY = y - dragImageOffset.y;
    newX = Math.max(0, Math.min(newX, editorWidth.value - layer.width));
    newY = Math.max(0, Math.min(newY, editorHeight.value - layer.height));
    layer.x = newX;
    layer.y = newY;
    // Не перерисовываем во время drag - только обновляем позицию
  });
}
// Throttling для resize операций с изображениями
let imageResizeTimeout = null;

// Throttling для drag операций с текстом
let textDragTimeout = null;

function onCanvasImageResize(e) {
  if (resizingImageIdx === null) return;
  
  // Throttling для плавного resize
  if (imageResizeTimeout) {
    return;
  }
  
  imageResizeTimeout = requestAnimationFrame(() => {
    imageResizeTimeout = null;
    
    const rect = editorCanvas.value.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const layer = imageLayers.value[resizingImageIdx];
    
    // Проверяем, нужно ли сохранять пропорции (для эмблем)
    const shouldKeepAspectRatio = ['club1', 'club2', 'competition'].includes(layer.type);
    
    if (shouldKeepAspectRatio && layer.aspectRatio) {
      // Пропорциональное изменение размера
      const deltaX = x - resizeStart.x;
      const deltaY = y - resizeStart.y;
      
      // Используем большее изменение для определения нового размера
      const deltaMax = Math.max(Math.abs(deltaX), Math.abs(deltaY));
      const sign = deltaX >= 0 ? 1 : -1; // Направление изменения
      
      let newWidth = Math.max(30, resizeStart.width + deltaMax * sign);
      let newHeight = newWidth / layer.aspectRatio;
      
      // Защита от выхода за границы
      const maxWidth = editorWidth.value - layer.x;
      const maxHeight = editorHeight.value - layer.y;
      
      if (newWidth > maxWidth) {
        newWidth = maxWidth;
        newHeight = newWidth / layer.aspectRatio;
      }
      
      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = newHeight * layer.aspectRatio;
      }
      
      // Минимальные размеры
      if (newWidth < 30) {
        newWidth = 30;
        newHeight = newWidth / layer.aspectRatio;
      }
      
      layer.width = newWidth;
      layer.height = newHeight;
    } else {
      // Свободное изменение размера для диаграмм и других объектов
      let newWidth = Math.max(30, resizeStart.width + (x - resizeStart.x));
      let newHeight = Math.max(30, resizeStart.height + (y - resizeStart.y));
      
      // Защита от выхода за границы
      newWidth = Math.min(newWidth, editorWidth.value - layer.x);
      newHeight = Math.min(newHeight, editorHeight.value - layer.y);
      
      layer.width = newWidth;
      layer.height = newHeight;
    }
    
    // Не перерисовываем во время resize - только обновляем размеры
  });
}
function onCanvasImageUp() {
  draggingImageIdx = null;
  resizingImageIdx = null;
  isDragging = false;
  
  // Небольшая задержка перед перерисовкой для устранения мерцания
  setTimeout(() => {
    renderEditorCanvas();
  }, 10);
  
  // Очищаем таймауты
  if (imageDragTimeout) {
    cancelAnimationFrame(imageDragTimeout);
    imageDragTimeout = null;
  }
  if (imageResizeTimeout) {
    cancelAnimationFrame(imageResizeTimeout);
    imageResizeTimeout = null;
  }
  
  window.removeEventListener('mousemove', onCanvasImageMove);
  window.removeEventListener('mousemove', onCanvasImageResize);
  window.removeEventListener('mouseup', onCanvasImageUp);
}
// Throttling для оптимизации производительности
let mouseMoveTimeout = null;

// Подсветка рамки и resize-хэндла при наведении + drag текста
function onCanvasMouseMove(e) {
  const rect = editorCanvas.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Обработка перетаскивания текста
  if (draggingTextIdx !== null) {
    // Throttling для плавного drag текста
    if (textDragTimeout) {
      return;
    }
    
    textDragTimeout = requestAnimationFrame(() => {
      textDragTimeout = null;
      
      const layer = textLayers.value[draggingTextIdx];
      // Защита от выхода за границы
      let newX = x - dragOffset.x;
      let newY = y - dragOffset.y;
      newX = Math.max(0, Math.min(newX, editorWidth.value - 100)); // примерная ширина текста
      newY = Math.max(0, Math.min(newY, editorHeight.value - (layer.size || 32)));
      layer.x = newX;
      layer.y = newY;
      // Не перерисовываем во время drag текста - только обновляем позицию
    });
    return;
  }
  
  // Throttling для hover эффектов (не для drag)
  if (mouseMoveTimeout) {
    return;
  }
  
  mouseMoveTimeout = setTimeout(() => {
    mouseMoveTimeout = null;
  }, 16); // ~60fps
  
  // Подсветка hover для изображений
  let newHoverImageIdx = null;
  for (let i = imageLayers.value.length - 1; i >= 0; i--) {
    const layer = imageLayers.value[i];
    if (
      x >= layer.x && x <= layer.x + layer.width &&
      y >= layer.y && y <= layer.y + layer.height
    ) {
      newHoverImageIdx = i;
      break;
    }
  }
  
  // Перерисовываем только если изменился hover индекс и нет активного drag
  if (hoverImageIdx !== newHoverImageIdx && !isDragging) {
    hoverImageIdx = newHoverImageIdx;
    debouncedRenderEditorCanvas();
  }
}
// Для drag текста — вызывается если не попали по изображению
function onCanvasTextMouseDown(e) {
  const rect = editorCanvas.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  for (let i = textLayers.value.length - 1; i >= 0; i--) {
    const layer = textLayers.value[i];
    
    // Пропускаем скрытые слои
    if (layer.visible === false) continue;
    
    // Вычисляем размеры и позицию текста с учетом выравнивания
    const lines = (layer.text || '').split(/\r?\n/);
    const textHeight = lines.length * (layer.size || 32) * 1.2;
    
    // Используем временный контекст для измерения ширины текста
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    let fontStr = '';
    if (layer.italic) fontStr += 'italic ';
    if (layer.bold) fontStr += 'bold ';
    fontStr += `${layer.size || 32}px ${layer.font || 'Arial'}`;
    tempCtx.font = fontStr;
    
    const textWidths = lines.filter(line => line.trim()).map(line => tempCtx.measureText(line).width);
    const maxTextWidth = textWidths.length > 0 ? Math.max(...textWidths) : 100; // минимальная ширина для пустого текста
    const textBlockWidth = Math.min(maxTextWidth, 400); // та же логика что в рендеринге - точная ширина текста
    
    // Область клика - это ограниченный блок текста
    const textX = layer.x ?? 20;
    const textY = layer.y ?? 20;
    
    // Проверка попадания в ограниченную область текста (с небольшими отступами для удобства клика)
    const clickPadding = 10;
    if (x >= textX - clickPadding && x <= textX + textBlockWidth + clickPadding && y >= textY - clickPadding && y <= textY + textHeight + clickPadding) {
      draggingTextIdx = i;
      isDragging = true;
      dragOffset = { x: x - (layer.x ?? 20), y: y - (layer.y ?? 20) };
      selectedTextLayerIdx.value = i; // Выбираем текстовый слой
      window.addEventListener('mousemove', onCanvasMouseMove);
      window.addEventListener('mouseup', onCanvasMouseUp);
      break;
    }
  }
}
function onCanvasMouseUp() {
  draggingTextIdx = null;
  isDragging = false;
  
  // Небольшая задержка перед перерисовкой для устранения мерцания
  setTimeout(() => {
    renderEditorCanvas();
  }, 10);
  
  // Очищаем таймаут для drag текста
  if (textDragTimeout) {
    cancelAnimationFrame(textDragTimeout);
    textDragTimeout = null;
  }
  
  window.removeEventListener('mousemove', onCanvasMouseMove);
  window.removeEventListener('mouseup', onCanvasMouseUp);
}

// --- Функция для получения красивых названий кнопок ---
function getButtonLabel(type) {
  const labels = {
    'title': 'название',
    'date': 'дата',
    'time': 'время',
    'score': 'счёт',
    'result_dop': 'доп.счёт',
    'clubs': 'команды',
    'arena': 'арена',
    'sport': 'спорт',
    'city': 'город'
  };
  return labels[type] || type;
}

// --- Быстрые вставки значений из события ---
function insertEventValueToLayer(idx, type) {
  if (idx === null || idx === undefined) return;
  const d = props.eventData || {};
  let value = '';
  if (type === 'title') value = d.title || '[Название]';
  if (type === 'date') value = d.date_formatted ? formatEventDate(d.date_formatted) : '[Дата]';
  if (type === 'time') value = d.time_formatted || '[Время]';
  if (type === 'score') value = d.result || '[Счёт]';
  if (type === 'result_dop') value = d.result_dop || '[Доп.счёт]';
  if (type === 'clubs') {
    const c1 = d.club1?.title || '';
    const c2 = d.club2?.title || '';
    value = c1 && c2 ? `${c1} — ${c2}` : '[Команды]';
  }
  if (type === 'club1_title') value = d.club1_title || '[Команда 1]';
  if (type === 'club2_title') value = d.club2_title || '[Команда 2]';
  if (type === 'club1_city') value = d.club1_city || '[Город 1]';
  if (type === 'club2_city') value = d.club2_city || '[Город 2]';
  if (type === 'arena') value = d.arena?.title || '[Арена]';
  if (type === 'sport') value = d.competition?.sport?.title || '[Вид спорта]';
  if (type === 'city') value = d.arena?.city?.title || d.club1?.city?.title || d.club2?.city?.title || '[Город]';
  if (type === 'about') value = d.about || '[Анонс]';
  if (type === 'tickets') value = d.tickets || '[Билеты]';
  if (type === 'report') value = d.report || '[Отчёт]';
  if (type === 'link') value = d.link || (d.id ? `/events/${d.id}` : '[Ссылка]');
  textLayers.value[idx].text += (textLayers.value[idx].text ? ' ' : '') + value;
}

// --- Получение составов и событий ---
function getTeamLineup(teamNum) {
  const d = props.eventData || {};
  
  // Определяем клуб по номеру команды
  const club = teamNum === 1 ? d.club1 : d.club2;
  if (!club) return '[Состав команды]';
  
  // Получаем составы из lineupsByClub если есть
  const lineupsByClub = d.lineupsByClub || {};
  const lineup = lineupsByClub[club.id] || [];
  
  if (!lineup.length) return '[Состав команды]';
  
  // Определяем режим отображения (по умолчанию - в столбец)
  const displayMode = d.display_lineups_mode || 'column';
  
  // Получаем настройки показа номеров
  const showNumbers = teamNum === 1 
    ? (d.show_numbers_club1 !== false) 
    : (d.show_numbers_club2 !== false);
  
  // Функция для форматирования игрока
  const formatPlayer = (player) => {
    let name = player.person ? player.person.full_name : player.player_name;
    if (showNumbers && player.number !== null && player.number !== undefined) {
      name = `${player.number}. ${name}`;
    }
    if (player.is_captain) {
      name += ' (к)';
    }
    return name;
  };
  
  // Функция для обработки замен
  const formatSubstitutions = (substitutions) => {
    if (!substitutions || !substitutions.length) return '';
    
    const subsText = substitutions.map(sub => {
      let subName = formatPlayer(sub);
      if (sub.minute_in) {
        subName += `, ${sub.minute_in}'`;
      }
      return subName;
    }).join(', ');
    
    return ` (${subsText})`;
  };
  
  // Форматируем состав в зависимости от режима отображения
  const formattedPlayers = lineup.map(player => {
    const playerText = formatPlayer(player);
    const subsText = formatSubstitutions(player.substitutions);
    return playerText + subsText;
  });
  
  // Возвращаем в зависимости от режима отображения
  if (displayMode === 'comma') {
    return formattedPlayers.join(', ');
  } else {
    // По умолчанию - в столбец (через переносы строк)
    return formattedPlayers.join('\n');
  }
}
function getTeamEvents(teamNum) {
  const d = props.eventData || {};
  
  // Определяем клуб по номеру команды
  const club = teamNum === 1 ? d.club1 : d.club2;
  if (!club) return '[События команды]';
  
  // Получаем события игроков из actions
  const actions = d.actions || [];
  const actionTypes = d.actionTypes || [];
  
  // Фильтруем только голы (события с group === 1 или group === "1")
  const goalActions = actions.filter(action => {
    const actionType = actionTypes.find(type => type.id === action.action_type_id);
    const isGoal = actionType && (actionType.group === 1 || actionType.group === "1");
    const isFromTeam = action.club_id === club.id;
    
    return isFromTeam && isGoal;
  });
  
  if (!goalActions.length) return '[Голы команды]';
  
  // Функция для форматирования гола в формате: минута' (счет) краткое название события Игрок
  const formatGoal = (action) => {
    let result = '';
    
    // Добавляем минуту если есть
    if (action.minute !== null && action.minute !== undefined && action.minute !== '') {
      result += `${action.minute}' `;
    }
    
    // Добавляем счет в скобках
    if (action.score) {
      result += `(${action.score}) `;
    }
    
    // Получаем тип события из переданного массива actionTypes
    const actionType = actionTypes.find(type => type.id === action.action_type_id);
    if (actionType && actionType.short_name) {
      result += `${actionType.short_name} `;
    }
    
    // Добавляем имя игрока в конце
    const playerName = action.person ? action.person.full_name : action.player_name;
    if (playerName) {
      result += playerName;
    }
    
    return result.trim();
  };
  
  // Сортируем голы по порядку (sort_order или minute)
  const sortedGoals = [...goalActions].sort((a, b) => {
    if (a.sort_order !== null && b.sort_order !== null) {
      return a.sort_order - b.sort_order;
    }
    if (a.minute !== null && b.minute !== null) {
      return a.minute - b.minute;
    }
    return a.id - b.id;
  });
  
  // Форматируем голы
  const formattedGoals = sortedGoals.map(formatGoal).filter(goal => goal);
  
  return formattedGoals.length > 0 ? formattedGoals.join('\n') : '[Голы команды]';
}
// --- Быстрая вставка составов и голов ---
function insertLineupToLayer(idx, teamNum) {
  if (idx === null || idx === undefined) return;
  const text = getTeamLineup(teamNum);
  textLayers.value[idx].text += (textLayers.value[idx].text ? '\n' : '') + text;
}
function insertEventsToLayer(idx, teamNum) {
  if (idx === null || idx === undefined) return;
  const text = getTeamEvents(teamNum); // getTeamEvents теперь возвращает только голы
  textLayers.value[idx].text += (textLayers.value[idx].text ? '\n' : '') + text;
}

// --- Размеры редактора по выбранному формату ---
const selectedFormatObj = computed(() => formatSettings.value.find(f => f.type === selectedFormat.value) || null);
const editorWidth = computed(() => selectedFormatObj.value ? selectedFormatObj.value.width : 800);
const editorHeight = computed(() => selectedFormatObj.value ? selectedFormatObj.value.height : 500);
const editorStyle = computed(() => `width:${editorWidth.value}px;height:${editorHeight.value}px;`);

// --- Проверка наличия эмблем ---
const hasClub1Emblem = computed(() => {
  return !!(props.eventData?.club1?.full_image_path);
});

const hasClub2Emblem = computed(() => {
  return !!(props.eventData?.club2?.full_image_path);
});

const hasCompetitionEmblem = computed(() => {
  return !!(props.eventData?.competition?.full_image_path);
});

// --- Доступные события команд для диаграмм ---
const availableTeamActions = computed(() => {
  const teamActions = props.teamActions || [];
  // Фильтруем события, у которых есть значения для создания диаграммы
  return teamActions.filter(action => 
    (action.value_home > 0 || action.value_away > 0) && action.team_action_type
  );
});

function selectFormat(format) {
  selectedFormat.value = format.type;
  // Очищаем содержимое редактора при смене формата
  textLayers.value = [];
  imageLayers.value = [];
  // Не сбрасываем фоновое изображение - оно пересчитается автоматически через watch
  // bgSource.value = 'none';
  // bgPreview.value = '';
  selectedMask.value = null;
  maskPreview.value = '';
  // Перерисовываем canvas
  setTimeout(renderEditorCanvas, 100);
}

// --- CRUD форматов (image_template_settings) ---
const formatSettings = ref([]);
const formatForm = ref({ description: '', type: 'horizontal', width: '', height: '', icon: '' });
const editingFormat = ref(null);
const showDeleteFormatModal = ref(false);
const formatToDelete = ref(null);

// Популярные иконки для выбора
const popularIcons = ref([
  'mdi:image', 'mdi:image-multiple', 'mdi:image-size-select-large',
  'mdi:image-size-select-small', 'mdi:image-size-select-actual',
  'mdi:rectangle', 'mdi:square', 'mdi:square-outline',
  'mdi:aspect-ratio', 'mdi:crop', 'mdi:crop-free', 'mdi:crop-square',
  'mdi:format-landscape', 'mdi:format-portrait', 'mdi:format-square',
  'mdi:view-grid', 'mdi:view-grid-outline', 'mdi:view-module',
  'mdi:palette', 'mdi:palette-outline', 'mdi:brush', 'mdi:brush-outline'
]);

async function loadFormatSettings() {
  try {
    const res = await $fetch('/api/image-template-settings', {
      baseURL: apiUrl
    });
    formatSettings.value = Array.isArray(res) ? res : (res?.data || []);
  } catch (e) {
    console.error('Error loading format settings:', e);
    formatSettings.value = [];
  }
}

function editFormat(f) {
  editingFormat.value = f;
  formatForm.value = { description: f.description, type: f.type, width: f.width, height: f.height, icon: f.icon || '' };
}
function cancelEditFormat() {
  editingFormat.value = null;
  formatForm.value = { description: '', type: 'horizontal', width: '', height: '', icon: '' };
}
async function saveFormat() {
  if (editingFormat.value) {
    // update
    await $fetch(`/api/image-template-settings/${editingFormat.value.id}`, {
      method: 'PATCH',
      body: formatForm.value,
      baseURL: apiUrl
    });
  } else {
    // create
    await $fetch('/api/image-template-settings', {
      method: 'POST',
      body: formatForm.value,
      baseURL: apiUrl
    });
  }
  await loadFormatSettings();
  cancelEditFormat();
}
function askDeleteFormat(f) {
  formatToDelete.value = f;
  showDeleteFormatModal.value = true;
}
async function deleteFormat() {
  if (!formatToDelete.value) return;
  await $fetch(`/api/image-template-settings/${formatToDelete.value.id}`, { 
    method: 'DELETE',
    baseURL: apiUrl
  });
  await loadFormatSettings();
  showDeleteFormatModal.value = false;
  formatToDelete.value = null;
}

const editorCanvas = ref(null);

// Флаг для предотвращения множественных перерисовок
let isRendering = false;
let renderTimeout = null;

// Debounced версия renderEditorCanvas для hover эффектов
function debouncedRenderEditorCanvas() {
  if (renderTimeout) {
    clearTimeout(renderTimeout);
  }
  renderTimeout = setTimeout(() => {
    renderEditorCanvas();
  }, 16); // ~60fps
}

// Флаг для отслеживания drag операций
let isDragging = false;

async function renderEditorCanvas() {
  const canvas = editorCanvas.value;
  if (!canvas) return;
  
  // Предотвращаем множественные перерисовки
  if (isRendering) return;
  isRendering = true;
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Заливаем белым фоном по умолчанию
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Фоновое изображение
  if (bgPreview.value && bgSource.value !== 'none') {
    const bgImg = new window.Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.src = bgPreview.value;
    bgImg.onload = async () => {
      // Если есть bgFile (загруженное или прокси изображение), может потребоваться обрезка
      if (bgFile.value && bgSource.value === 'upload') {
        // Загруженные изображения уже обрезаны под формат - отображаем как есть
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      } else {
        // Для всех остальных случаев - масштабируем с сохранением пропорций (cover)
        const ratio = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
        const newWidth = bgImg.width * ratio;
        const newHeight = bgImg.height * ratio;
        const offsetX = (canvas.width - newWidth) / 2;
        const offsetY = (canvas.height - newHeight) / 2;
        ctx.drawImage(bgImg, offsetX, offsetY, newWidth, newHeight);
      }
      await drawMask();
    };
    bgImg.onerror = async (error) => {
      console.error('Error loading background image:', bgPreview.value, error);
      await drawMask();
    };
  } else {
    await drawMask();
  }
  async function drawMask() {
    if (maskPreview.value) {
      try {
        // Загружаем маску через прокси для решения CORS
        const maskUrl = await loadMaskThroughProxy(maskPreview.value);
        
        const maskImg = new window.Image();
        
        // Убираем crossOrigin для blob URLs и локальных изображений
        if (maskUrl.startsWith('blob:') || maskUrl.startsWith('/storage/') || maskUrl.startsWith(window.location.origin)) {
          // Blob URL или локальное изображение - не нужен crossOrigin
        } else {
          maskImg.crossOrigin = 'anonymous';
        }
        
        maskImg.src = maskUrl;
        maskImg.onload = async () => {
          ctx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
          await drawImageLayers();
        };
        maskImg.onerror = async (error) => {
          console.error('Error loading mask image:', maskUrl, error);
          await drawImageLayers();
        };
              } catch (error) {
          console.error('Error in drawMask:', error);
          await drawImageLayers();
        }
    } else {
      await drawImageLayers();
    }
  }
  async function drawImageLayers() {
    for (let i = 0; i < imageLayers.value.length; i++) {
      const layer = imageLayers.value[i];
      ctx.save();
      
      try {
        // Если src уже загружен через прокси (blob URL), используем напрямую
        // Иначе загружаем через прокси
        let imageSrc = layer.src;
        if (!imageSrc.startsWith('blob:') && !imageSrc.startsWith('/storage/') && !imageSrc.startsWith(window.location.origin) && !imageSrc.startsWith('data:')) {
          imageSrc = await loadImageThroughProxy(layer.src);
        }
        
        const img = new window.Image();
        
        // Убираем crossOrigin для blob URLs и локальных изображений
        if (imageSrc.startsWith('blob:') || imageSrc.startsWith('/storage/') || imageSrc.startsWith(window.location.origin)) {
          // Blob URL или локальное изображение - не нужен crossOrigin
        } else {
          img.crossOrigin = 'anonymous';
        }
        
        img.src = imageSrc;
        img.onload = () => {
          ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
          // Рамка и resize-хэндл для активного или hover слоя
          if (selectedImageLayerIdx.value === i || hoverImageIdx === i) {
            const isEmblem = ['club1', 'club2', 'competition'].includes(layer.type);
            
            // Рамка
            ctx.strokeStyle = isEmblem ? '#7c3aed' : '#2563eb'; // Фиолетовый для эмблем, синий для остальных
            ctx.lineWidth = 2;
            ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
            
            // resize-хэндл с разными индикаторами
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = isEmblem ? '#7c3aed' : '#2563eb';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(layer.x + layer.width, layer.y + layer.height, 10, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            
            // Индикатор типа изменения размера
            if (isEmblem) {
              // Стрелка для пропорционального resize (⤧)
              ctx.strokeStyle = '#7c3aed';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(layer.x + layer.width - 4, layer.y + layer.height - 4);
              ctx.lineTo(layer.x + layer.width + 4, layer.y + layer.height + 4);
              ctx.moveTo(layer.x + layer.width + 1, layer.y + layer.height + 1);
              ctx.lineTo(layer.x + layer.width + 4, layer.y + layer.height - 2);
              ctx.moveTo(layer.x + layer.width + 1, layer.y + layer.height + 1);
              ctx.lineTo(layer.x + layer.width - 2, layer.y + layer.height + 4);
              ctx.stroke();
            } else {
              // Квадратик для свободного resize
              ctx.fillStyle = '#2563eb';
              ctx.fillRect(layer.x + layer.width - 3, layer.y + layer.height - 3, 6, 6);
            }
            
            // иконка удаления (крестик)
            ctx.beginPath();
            ctx.arc(layer.x + layer.width, layer.y, 10, 0, 2 * Math.PI);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.strokeStyle = '#b91c1c';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(layer.x + layer.width - 5, layer.y - 5);
            ctx.lineTo(layer.x + layer.width + 5, layer.y + 5);
            ctx.moveTo(layer.x + layer.width + 5, layer.y - 5);
            ctx.lineTo(layer.x + layer.width - 5, layer.y + 5);
            ctx.strokeStyle = '#b91c1c';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          ctx.restore();
        };
        img.onerror = (error) => {
          console.error('Error loading image layer:', imageSrc, error);
          ctx.restore();
        };
      } catch (error) {
        console.error('Error in drawImageLayers:', error);
        ctx.restore();
      }
    }
    drawTextLayers();
  }
  function drawTextLayers() {
    for (let layerIndex = 0; layerIndex < textLayers.value.length; layerIndex++) {
      const layer = textLayers.value[layerIndex];
      // Пропускаем скрытые слои
      if (layer.visible === false) continue;
      
      ctx.save();
      let fontStr = '';
      if (layer.italic) fontStr += 'italic ';
      if (layer.bold) fontStr += 'bold ';
      fontStr += `${layer.size || 32}px ${layer.font || 'Arial'}`;
      ctx.font = fontStr;
      ctx.fillStyle = layer.color || '#222';
      
      // Настройка выравнивания
      const align = layer.align || 'left';
      ctx.textAlign = 'left'; // всегда используем left, позицию вычисляем вручную
      ctx.textBaseline = 'top';
      
      if (layer.shadow) {
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }
      
      // Многострочный текст
      const lines = (layer.text || '').split(/\r?\n/);
      
      // Определяем максимальную ширину текста для расчета выравнивания
      const textWidths = lines.filter(line => line.trim()).map(line => ctx.measureText(line).width);
      const maxTextWidth = textWidths.length > 0 ? Math.max(...textWidths) : 100; // минимальная ширина для пустого текста
      const textBlockWidth = Math.min(maxTextWidth, 400); // используем точную ширину текста без дополнительных отступов
      
      for (let i = 0; i < lines.length; i++) {
        const y = (layer.y ?? 20) + i * (layer.size || 32) * 1.2;
        
        // Вычисляем X позицию в зависимости от выравнивания внутри ограниченной области
        const baseX = layer.x ?? 20;
        let x = baseX;
        
        if (align === 'center') {
          const lineWidth = ctx.measureText(lines[i]).width;
          x = baseX + (textBlockWidth - lineWidth) / 2;
        } else if (align === 'right') {
          const lineWidth = ctx.measureText(lines[i]).width;
          x = baseX + (textBlockWidth - lineWidth);
        }
        // для 'left' используем baseX как есть
        
        if (layer.stroke) {
          ctx.lineWidth = layer.strokeWidth || 2;
          ctx.strokeStyle = layer.strokeColor || '#fff';
          ctx.strokeText(lines[i], x, y);
        }
        ctx.fillText(lines[i], x, y);
      }
      
      // Рисуем рамку для выделенного слоя
      if (selectedTextLayerIdx.value === layerIndex) {
        const baseX = layer.x ?? 20;
        const baseY = layer.y ?? 20;
        const framePadding = 5;
        
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(
          baseX - framePadding, 
          baseY - framePadding, 
          textBlockWidth + framePadding * 2, 
          lines.length * (layer.size || 32) * 1.2 + framePadding * 2
        );
        ctx.setLineDash([]); // сбрасываем пунктирную линию
      }
      
      ctx.restore();
    }
  }
  
  // Сбрасываем флаг перерисовки
  isRendering = false;
}

// Watch для автоматического пересчета фонового изображения при смене формата
watch([editorWidth, editorHeight], async () => {
  // Для изображения события пересчет не нужен - масштабирование происходит в canvas
  // Пересчитываем только загруженные изображения
  if (bgSource.value === 'upload' && bgFile.value) {
    try {
      const resizedImage = await resizeImageToFormat(bgFile.value, editorWidth.value, editorHeight.value);
      bgPreview.value = URL.createObjectURL(resizedImage);
      bgFile.value = resizedImage;
    } catch (error) {
      console.error('Error resizing uploaded background image for new format:', error);
    }
  }
});

// Watch на изменение данных события
watch(() => props.eventData, async (newEventData) => {
  // Если сейчас выбрано изображение события, обновляем bgPreview
  if (bgSource.value === 'event') {
    const eventImagePath = newEventData?.event_image_path || '';
    if (eventImagePath) {
      
      // Используем ту же логику загрузки через прокси
      if (!eventImagePath.startsWith(window.location.origin) && !eventImagePath.startsWith('/') && !eventImagePath.startsWith('data:')) {
        isBgImageLoading.value = true;
        try {
          const response = await fetch(`${apiUrl}/api/image-proxy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ url: eventImagePath })
          });
          
          if (response.ok) {
            const blob = await response.blob();
            bgPreview.value = URL.createObjectURL(blob);
            bgFile.value = new File([blob], 'event-image.jpg', { type: blob.type });
          } else {
            bgPreview.value = eventImagePath;
            bgFile.value = null;
          }
        } catch (error) {
          console.error('Error loading updated event image through proxy:', error);
          bgCurrentError.value = 'Ошибка загрузки изображения события';
          bgPreview.value = eventImagePath;
          bgFile.value = null;
        } finally {
          isBgImageLoading.value = false;
        }
      } else {
        bgPreview.value = eventImagePath;
        bgFile.value = null;
      }
      
      setTimeout(renderEditorCanvas, 50);
    }
  }
}, { deep: true });

watch([bgPreview, maskPreview, editorWidth, editorHeight, textLayers, imageLayers], () => {
  setTimeout(renderEditorCanvas, 50);
}, { deep: true });

onMounted(() => {
  loadFormatSettings();
  loadMasks();
  setTimeout(renderEditorCanvas, 100);
  if (editorCanvas.value) {
    editorCanvas.value.addEventListener('mousedown', onCanvasMouseDown);
    editorCanvas.value.addEventListener('mousemove', onCanvasMouseMove);
  }
});

// Очищаем кеш blob URLs при размонтировании компонента
onUnmounted(() => {
  for (const [originalUrl, blobUrl] of imageProxyCache.value) {
    if (blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrl);
    }
  }
  imageProxyCache.value.clear();
});

// --- Экспорт изображения ---
async function exportEditorImage(format = 'png') {
  try {
    // Рендерим canvas без UI элементов
    const canvas = await renderCanvasWithoutUI();
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
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `event-image.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting image:', error);
    showNotificationMessage('Ошибка', 'Ошибка экспорта изображения: ' + (error.message || 'Неизвестная ошибка'), 'error');
  }
}
// --- Сохранение/загрузка шаблона ---
const templateList = ref([]);
const showTemplateListModal = ref(false);

// Функция для создания превью шаблона
async function generateTemplatePreview() {
  try {
    const canvas = await renderCanvasWithoutUI();
    if (!canvas) return null;
    
    // Создаем миниатюру 120x80 (уменьшенный размер)
    const previewCanvas = document.createElement('canvas');
    const previewCtx = previewCanvas.getContext('2d');
    previewCanvas.width = 120;
    previewCanvas.height = 80;
    
    // Заливаем белым фоном
    previewCtx.fillStyle = '#ffffff';
    previewCtx.fillRect(0, 0, 120, 80);
    
    // Рисуем уменьшенную версию основного canvas
    const scaleX = 120 / canvas.width;
    const scaleY = 80 / canvas.height;
    const scale = Math.min(scaleX, scaleY);
    
    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;
    const offsetX = (120 - scaledWidth) / 2;
    const offsetY = (80 - scaledHeight) / 2;
    
    previewCtx.drawImage(canvas, offsetX, offsetY, scaledWidth, scaledHeight);
    
    return previewCanvas.toDataURL('image/jpeg', 0.3);
  } catch (error) {
    console.error('Error generating template preview:', error);
    return null;
  }
}

// Функции анализа типов для шаблонов
function analyzeImageType(imageSrc, eventData) {
  if (!imageSrc || !eventData) return null;
  
  // Проверяем, совпадает ли изображение с данными события
  if (imageSrc === eventData.event_image_path) {
    return IMAGE_TYPES.EVENT_IMAGE;
  }
  
  // Проверяем эмблемы клубов (используем разные возможные пути)
  const club1Paths = [
    eventData.club1?.full_image_path,
    eventData.club1?.logo_path,
    eventData.club1?.emblem_path,
    eventData.home_team?.logo_path,
    eventData.home_team?.emblem_path
  ].filter(Boolean);
  
  const club2Paths = [
    eventData.club2?.full_image_path,
    eventData.club2?.logo_path,
    eventData.club2?.emblem_path,
    eventData.away_team?.logo_path,
    eventData.away_team?.emblem_path
  ].filter(Boolean);
  
  if (club1Paths.includes(imageSrc)) {
    return IMAGE_TYPES.HOME_TEAM_LOGO;
  }
  
  if (club2Paths.includes(imageSrc)) {
    return IMAGE_TYPES.AWAY_TEAM_LOGO;
  }
  
  // Проверяем эмблему соревнования
  const competitionPaths = [
    eventData.competition?.full_image_path,
    eventData.competition?.logo_path,
    eventData.competition?.emblem_path
  ].filter(Boolean);
  
  if (competitionPaths.includes(imageSrc)) {
    return IMAGE_TYPES.COMPETITION_LOGO;
  }
  
  // Проверяем изображение арены
  if (imageSrc === eventData.venue?.image_path) {
    return IMAGE_TYPES.VENUE_IMAGE;
  }
  
  return null; // Не удалось определить тип
}

function analyzeTextType(text, eventData) {
  if (!text || !eventData) return null;
  
  // Проверяем, совпадает ли текст с данными события
  if (text === eventData.title || text === eventData.event_name) {
    return TEXT_TYPES.EVENT_TITLE;
  }
  
  // Проверяем названия команд в разных полях
  const homeTeamNames = [
    eventData.home_team?.name,
    eventData.club1?.name,
    eventData.team1?.name,
    eventData.club1_title
  ].filter(Boolean);
  
  const awayTeamNames = [
    eventData.away_team?.name,
    eventData.club2?.name,
    eventData.team2?.name,
    eventData.club2_title
  ].filter(Boolean);
  
  if (homeTeamNames.includes(text)) {
    return TEXT_TYPES.HOME_TEAM_NAME;
  }
  
  if (awayTeamNames.includes(text)) {
    return TEXT_TYPES.AWAY_TEAM_NAME;
  }
  
  // Проверяем составное название команд (например, "Зенит — ЦСКА")
  const combinedTeamNames = [
    `${eventData.club1_title || eventData.club1?.name} — ${eventData.club2_title || eventData.club2?.name}`,
    `${eventData.club2_title || eventData.club2?.name} — ${eventData.club1_title || eventData.club1?.name}`,
    `${eventData.club1?.name} — ${eventData.club2?.name}`,
    `${eventData.club2?.name} — ${eventData.club1?.name}`
  ].filter(Boolean);
  
  if (combinedTeamNames.includes(text)) {
    // Возвращаем специальный тип для составного названия
    return TEXT_TYPES.EVENT_TITLE; // Используем EVENT_TITLE как fallback
  }
  
  // Проверяем название соревнования
  if (text === eventData.competition?.name) {
    return TEXT_TYPES.COMPETITION_NAME;
  }
  
  // Проверяем название арены
  if (text === eventData.venue?.name) {
    return TEXT_TYPES.VENUE_NAME;
  }
  
  // Проверяем дату
  const formattedDate = formatDateForMapping(eventData.date);
  if (text === formattedDate) {
    return TEXT_TYPES.EVENT_DATE;
  }
  
  // Проверяем время
  const formattedTime = formatTimeForMapping(eventData.time);
  if (text === formattedTime) {
    return TEXT_TYPES.EVENT_TIME;
  }
  
  // Проверяем счет
  const scoreText = `${eventData.home_score || '0'} - ${eventData.away_score || '0'}`;
  if (text === scoreText || text === eventData.result) {
    return TEXT_TYPES.SCORE;
  }
  
  // Проверяем дополнительный счет
  const additionalScoreText = `${eventData.additional_home_score || '0'} - ${eventData.additional_away_score || '0'}`;
  if (text === additionalScoreText) {
    return TEXT_TYPES.ADDITIONAL_SCORE;
  }
  
  // Проверяем спорт
  if (text === eventData.sport?.name) {
    return TEXT_TYPES.SPORT_NAME;
  }
  
  // Проверяем город события
  if (text === eventData.city?.name) {
    return TEXT_TYPES.CITY_NAME;
  }
  
  // Проверяем города команд
  if (text === eventData.home_team?.city?.name || text === eventData.club1?.city?.name) {
    return TEXT_TYPES.HOME_TEAM_CITY;
  }
  
  if (text === eventData.away_team?.city?.name || text === eventData.club2?.city?.name) {
    return TEXT_TYPES.AWAY_TEAM_CITY;
  }
  
  // Проверяем вычисляемые значения
  const computedType = analyzeComputedTextType(text, eventData);
  if (computedType) {
    return computedType;
  }
  
  return null; // Не удалось определить тип
}

function analyzeComputedTextType(text, eventData) {
  if (!text || !eventData) return null;
  
  // Проверяем, является ли текст составом команды
  const team1Lineup = getTeamLineup(1);
  const team2Lineup = getTeamLineup(2);
  
  if (text === team1Lineup || text.includes(team1Lineup.substring(0, 50))) {
    return COMPUTED_TYPES.TEAM_COMPOSITION_HOME;
  }
  
  if (text === team2Lineup || text.includes(team2Lineup.substring(0, 50))) {
    return COMPUTED_TYPES.TEAM_COMPOSITION_AWAY;
  }
  
  // Проверяем, является ли текст событиями команды
  const team1Events = getTeamEvents(1);
  const team2Events = getTeamEvents(2);
  
  if (text === team1Events || text.includes(team1Events.substring(0, 50))) {
    return COMPUTED_TYPES.TEAM_EVENTS_HOME;
  }
  
  if (text === team2Events || text.includes(team2Events.substring(0, 50))) {
    return COMPUTED_TYPES.TEAM_EVENTS_AWAY;
  }
  
  return null;
}

// Функции маппинга для шаблонов
function mapImageTypeToEventData(imageType, eventData) {
  switch(imageType) {
    case IMAGE_TYPES.EVENT_IMAGE: 
      return eventData?.event_image_path || '';
    case IMAGE_TYPES.HOME_TEAM_LOGO: 
      return eventData?.club1?.full_image_path || 
             eventData?.club1?.logo_path || 
             eventData?.club1?.emblem_path ||
             eventData?.home_team?.logo_path || 
             eventData?.home_team?.emblem_path || '';
    case IMAGE_TYPES.AWAY_TEAM_LOGO: 
      return eventData?.club2?.full_image_path || 
             eventData?.club2?.logo_path || 
             eventData?.club2?.emblem_path ||
             eventData?.away_team?.logo_path || 
             eventData?.away_team?.emblem_path || '';
    case IMAGE_TYPES.COMPETITION_LOGO: 
      return eventData?.competition?.full_image_path || 
             eventData?.competition?.logo_path || 
             eventData?.competition?.emblem_path || '';
    case IMAGE_TYPES.VENUE_IMAGE: 
      return eventData?.venue?.image_path || '';
    default: 
      return '';
  }
}

function mapTextTypeToEventData(textType, eventData) {
  // Сначала проверяем обычные текстовые типы
  switch(textType) {
    case TEXT_TYPES.EVENT_TITLE: 
      return eventData?.title || eventData?.event_name || '';
    case TEXT_TYPES.HOME_TEAM_NAME: 
      return eventData?.home_team?.name || eventData?.club1?.name || eventData?.team1?.name || eventData?.club1_title || '';
    case TEXT_TYPES.AWAY_TEAM_NAME: 
      return eventData?.away_team?.name || eventData?.club2?.name || eventData?.team2?.name || eventData?.club2_title || '';
    case TEXT_TYPES.COMPETITION_NAME: 
      return eventData?.competition?.name || '';
    case TEXT_TYPES.VENUE_NAME: 
      return eventData?.venue?.name || '';
    case TEXT_TYPES.EVENT_DATE: 
      return eventData?.date ? formatDateForMapping(eventData.date) : '';
    case TEXT_TYPES.EVENT_TIME: 
      return eventData?.time ? formatTimeForMapping(eventData.time) : '';
    case TEXT_TYPES.SCORE: 
      return eventData?.result || `${eventData?.home_score || '0'} - ${eventData?.away_score || '0'}`;
    case TEXT_TYPES.ADDITIONAL_SCORE: 
      return `${eventData?.additional_home_score || '0'} - ${eventData?.additional_away_score || '0'}`;
    case TEXT_TYPES.SPORT_NAME: 
      return eventData?.sport?.name || '';
    case TEXT_TYPES.CITY_NAME: 
      return eventData?.city?.name || '';
    case TEXT_TYPES.HOME_TEAM_CITY: 
      return eventData?.home_team?.city?.name || eventData?.club1?.city?.name || '';
    case TEXT_TYPES.AWAY_TEAM_CITY: 
      return eventData?.away_team?.city?.name || eventData?.club2?.city?.name || '';
  }
  
  // Если это не обычный текстовый тип, проверяем вычисляемые типы
  if (Object.values(COMPUTED_TYPES).includes(textType)) {
    return mapComputedTypeToEventData(textType, eventData, props.teamActions || []);
  }
  
  return '';
}

function mapComputedTypeToEventData(computedType, eventData, actions) {
  switch(computedType) {
    case COMPUTED_TYPES.TEAM_COMPOSITION_HOME: 
      return getTeamLineupByTeamNum(1, eventData);
    case COMPUTED_TYPES.TEAM_COMPOSITION_AWAY: 
      return getTeamLineupByTeamNum(2, eventData);
    case COMPUTED_TYPES.TEAM_EVENTS_HOME: 
      return getTeamEventsByTeamNum(1, eventData);
    case COMPUTED_TYPES.TEAM_EVENTS_AWAY: 
      return getTeamEventsByTeamNum(2, eventData);
    case COMPUTED_TYPES.TEAM_DIAGRAM_HOME: 
      return generateTeamDiagram(eventData?.home_team_id, actions);
    case COMPUTED_TYPES.TEAM_DIAGRAM_AWAY: 
      return generateTeamDiagram(eventData?.away_team_id, actions);
    case COMPUTED_TYPES.SCORE_HOME: 
      return eventData?.home_score || '0';
    case COMPUTED_TYPES.SCORE_AWAY: 
      return eventData?.away_score || '0';
    case COMPUTED_TYPES.EVENT_COUNT: 
      return countTeamEvents(actions);
    default: 
      return '';
  }
}

// Вспомогательные функции для работы с данными команд
function getTeamComposition(teamId, actions) {
  if (!teamId || !actions) return '';
  
  // Получаем уникальных игроков из действий команды
  const teamActions = actions.filter(action => action.team_id === teamId);
  const uniquePlayers = new Map();
  
  teamActions.forEach(action => {
    if (action.player?.name) {
      uniquePlayers.set(action.player.id, action.player.name);
    }
  });
  
  return Array.from(uniquePlayers.values()).join(', ');
}

function getTeamEventsByTeamId(teamId, actions) {
  if (!teamId || !actions) return '';
  
  const filteredActions = actions.filter(action => action.team_id === teamId);
  const events = filteredActions.map(action => action.action_type?.name).filter(Boolean);
  
  return events.join(', ');
}

// Функции для получения составов и событий по номеру команды (для совместимости)
function getTeamLineupByTeamNum(teamNum, eventData) {
  if (!eventData) return '[Состав команды]';
  
  // Определяем клуб по номеру команды
  const club = teamNum === 1 ? eventData.club1 : eventData.club2;
  if (!club) return '[Состав команды]';
  
  // Получаем составы из lineupsByClub если есть
  const lineupsByClub = eventData.lineupsByClub || {};
  const lineup = lineupsByClub[club.id] || [];
  
  if (!lineup.length) return '[Состав команды]';
  
  // Определяем режим отображения (по умолчанию - в столбец)
  const displayMode = eventData.display_lineups_mode || 'column';
  
  // Получаем настройки показа номеров
  const showNumbers = teamNum === 1 
    ? (eventData.show_numbers_club1 !== false) 
    : (eventData.show_numbers_club2 !== false);
  
  // Функция для форматирования игрока
  const formatPlayer = (player) => {
    let name = player.person ? player.person.full_name : player.player_name;
    if (showNumbers && player.number !== null && player.number !== undefined) {
      name = `${player.number}. ${name}`;
    }
    if (player.is_captain) {
      name += ' (к)';
    }
    return name;
  };
  
  // Функция для обработки замен
  const formatSubstitutions = (substitutions) => {
    if (!substitutions || !substitutions.length) return '';
    
    const subsText = substitutions.map(sub => {
      let subName = formatPlayer(sub);
      if (sub.minute_in) {
        subName += `, ${sub.minute_in}'`;
      }
      return subName;
    }).join(', ');
    
    return ` (${subsText})`;
  };
  
  // Форматируем состав в зависимости от режима отображения
  const formattedPlayers = lineup.map(player => {
    const playerText = formatPlayer(player);
    const subsText = formatSubstitutions(player.substitutions);
    return playerText + subsText;
  });
  
  // Возвращаем в зависимости от режима отображения
  if (displayMode === 'comma') {
    return formattedPlayers.join(', ');
  } else {
    // По умолчанию - в столбец (через переносы строк)
    return formattedPlayers.join('\n');
  }
}

function getTeamEventsByTeamNum(teamNum, eventData) {
  if (!eventData) return '[События команды]';
  
  // Определяем клуб по номеру команды
  const club = teamNum === 1 ? eventData.club1 : eventData.club2;
  if (!club) return '[События команды]';
  
  // Получаем события игроков из actions
  const actions = eventData.actions || [];
  const actionTypes = eventData.actionTypes || [];
  
  // Фильтруем только голы (события с group === 1 или group === "1")
  const goalActions = actions.filter(action => {
    const actionType = actionTypes.find(type => type.id === action.action_type_id);
    const isGoal = actionType && (actionType.group === 1 || actionType.group === "1");
    const isFromTeam = action.club_id === club.id;
    
    return isFromTeam && isGoal;
  });
  
  if (!goalActions.length) return '[Голы команды]';
  
  // Функция для форматирования гола в формате: минута' (счет) краткое название события Игрок
  const formatGoal = (action) => {
    let result = '';
    
    // Добавляем минуту если есть
    if (action.minute !== null && action.minute !== undefined && action.minute !== '') {
      result += `${action.minute}' `;
    }
    
    // Добавляем счет в скобках
    if (action.score) {
      result += `(${action.score}) `;
    }
    
    // Получаем тип события из переданного массива actionTypes
    const actionType = actionTypes.find(type => type.id === action.action_type_id);
    if (actionType && actionType.short_name) {
      result += `${actionType.short_name} `;
    }
    
    // Добавляем имя игрока в конце
    const playerName = action.person ? action.person.full_name : action.player_name;
    if (playerName) {
      result += playerName;
    }
    
    return result.trim();
  };
  
  // Сортируем голы по порядку (sort_order или minute)
  const sortedGoals = [...goalActions].sort((a, b) => {
    if (a.sort_order !== null && b.sort_order !== null) {
      return a.sort_order - b.sort_order;
    }
    if (a.minute !== null && b.minute !== null) {
      return a.minute - b.minute;
    }
    return a.id - b.id;
  });
  
  // Форматируем голы
  const formattedGoals = sortedGoals.map(formatGoal).filter(goal => goal);
  
  return formattedGoals.length > 0 ? formattedGoals.join('\n') : '[Голы команды]';
}

function generateTeamDiagram(teamId, teamActions) {
  if (!teamId || !teamActions) return '';
  
  // Здесь должна быть логика генерации диаграммы
  // Пока возвращаем placeholder
  return 'team_diagram_placeholder';
}

function countTeamEvents(teamActions) {
  if (!teamActions) return '0';
  
  return teamActions.length.toString();
}

// Функции форматирования для маппинга
function formatDateForMapping(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU');
}

function formatTimeForMapping(timeString) {
  if (!timeString) return '';
  
  return timeString;
}

// Функция для фактического сохранения шаблона
async function saveTemplate() {
  if (!saveTemplateForm.value.name.trim()) {
    showNotificationMessage('Ошибка', 'Введите название шаблона', 'error');
    return;
  }
  
  // Генерируем превью
  const previewDataUrl = await generateTemplatePreview();
  
  // Временно: попробуем сохранить без превью если оно слишком большое
  const usePreview = previewDataUrl && previewDataUrl.length < 100000; // 100KB лимит
  
  // Подготавливаем слои для отправки с анализом типов
  const preparedTextLayers = textLayers.value && Array.isArray(textLayers.value) 
    ? textLayers.value.map(layer => {
        const layerCopy = JSON.parse(JSON.stringify(layer));
        
        // Анализируем текст и определяем тип
        const textType = analyzeTextType(layerCopy.text, props.eventData);
        
        if (textType) {
          layerCopy.textType = textType;
          layerCopy.originalText = layerCopy.text;
          layerCopy.text = textType; // Заменяем на тип
        }
        
        return layerCopy;
      })
    : [];
    
  const preparedImageLayers = imageLayers.value && Array.isArray(imageLayers.value)
    ? imageLayers.value.map(layer => {
        const layerCopy = { ...layer };
        
        // Анализируем изображение и определяем тип
        let imageType = analyzeImageType(layerCopy.src || layerCopy.originalSrc, props.eventData);
        
        // Если не удалось определить по URL, пробуем по типу слоя
        if (!imageType && layerCopy.type) {
          switch(layerCopy.type) {
            case 'club1':
              imageType = IMAGE_TYPES.HOME_TEAM_LOGO;
              break;
            case 'club2':
              imageType = IMAGE_TYPES.AWAY_TEAM_LOGO;
              break;
            case 'competition':
              imageType = IMAGE_TYPES.COMPETITION_LOGO;
              break;
          }
        }
        
        if (imageType) {
          layerCopy.imageType = imageType;
          layerCopy.originalSrc = layerCopy.src || layerCopy.originalSrc;
          layerCopy.src = imageType; // Заменяем на тип
        } else {
          // Очищаем blob URL перед отправкой, оставляем только originalSrc
          layerCopy.src = layerCopy.originalSrc || layerCopy.src;
        }
        
        return layerCopy;
      })
    : [];
    
  // Обеспечиваем, что массивы всегда существуют
  const finalTextLayers = Array.isArray(preparedTextLayers) ? preparedTextLayers : [];
  const finalImageLayers = Array.isArray(preparedImageLayers) ? preparedImageLayers : [];

  // Payload в соответствии с ожиданиями контроллера
  const payload = {
    format: selectedFormat.value || 'horizontal',
    bgSource: bgSource.value === 'none' ? 'event' : (bgSource.value || 'event'), // Исправляем 'none' на 'event'
    bgPreview: (bgPreview.value?.startsWith('blob:') || !bgPreview.value) ? '' : bgPreview.value,
    maskId: selectedMask.value?.id || null,
    maskType: selectedMaskType.value || 'horizontal',
    textLayers: finalTextLayers,
    imageLayers: finalImageLayers,
    // Дополнительные поля для нашего использования (сервер их просто проигнорирует)
    name: saveTemplateForm.value.name,
    description: saveTemplateForm.value.description || '',
    preview: usePreview ? previewDataUrl : null,
    formatSettings: selectedFormatObj.value,
    bgFileData: bgFile.value ? {
      name: bgFile.value.name,
      type: bgFile.value.type,
      size: bgFile.value.size
    } : null,
  };
  
  try {
    const response = await $fetch('/api/image-editor-templates', { 
      method: 'POST', 
      body: payload,
      baseURL: apiUrl
    });

    
    // Закрываем модалку и очищаем форму
    showSaveTemplateModal.value = false;
    saveTemplateForm.value = { name: '', description: '' };
    
    // Обновляем список шаблонов
    await loadTemplateList();
    
    showNotificationMessage('Успех', 'Шаблон успешно сохранён!', 'success');
  } catch (error) {
    console.error('Error saving template:', error);
    
    // Попробуем получить детали ошибки
    if (error.data) {
      console.error('Full error data:', error.data);
      console.error('Error details:', JSON.stringify(error.data, null, 2));
      
      // Показываем конкретные ошибки валидации
      if (error.data.errors) {
        const errorMessages = [];
        for (const [field, messages] of Object.entries(error.data.errors)) {
          errorMessages.push(`${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`);
        }
        showNotificationMessage('Ошибка валидации', errorMessages.join('\n'), 'error');
      } else {
        showNotificationMessage('Ошибка', `Ошибка сохранения шаблона: ${JSON.stringify(error.data)}`, 'error');
      }
    } else if (error.message) {
      showNotificationMessage('Ошибка', `Ошибка сохранения шаблона: ${error.message}`, 'error');
    } else {
      showNotificationMessage('Ошибка', 'Ошибка сохранения шаблона', 'error');
    }
  }
}

// Функция рендеринга canvas без UI элементов (рамок, хэндлов)
async function renderCanvasWithoutUI() {
  const canvas = editorCanvas.value;
  if (!canvas) return null;
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Заливаем белым фоном по умолчанию
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Фоновое изображение
  if (bgPreview.value && bgSource.value !== 'none') {
    const bgImg = new window.Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.src = bgPreview.value;
    await new Promise((resolve, reject) => {
      bgImg.onload = resolve;
      bgImg.onerror = reject;
    });
    
    // Если есть bgFile (загруженное или прокси изображение), может потребоваться обрезка
    if (bgFile.value && bgSource.value === 'upload') {
      // Загруженные изображения уже обрезаны под формат - отображаем как есть
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } else {
      // Для всех остальных случаев - масштабируем с сохранением пропорций (cover)
      const ratio = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
      const newWidth = bgImg.width * ratio;
      const newHeight = bgImg.height * ratio;
      const offsetX = (canvas.width - newWidth) / 2;
      const offsetY = (canvas.height - newHeight) / 2;
      ctx.drawImage(bgImg, offsetX, offsetY, newWidth, newHeight);
    }
  }
  
  // Маска
  if (maskPreview.value) {
    try {
      const maskUrl = await loadMaskThroughProxy(maskPreview.value);
      const maskImg = new window.Image();
      
      if (!maskUrl.startsWith('blob:') && !maskUrl.startsWith('/storage/') && !maskUrl.startsWith(window.location.origin)) {
        maskImg.crossOrigin = 'anonymous';
      }
      
      maskImg.src = maskUrl;
      await new Promise((resolve, reject) => {
        maskImg.onload = resolve;
        maskImg.onerror = reject;
      });
      
      ctx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
    } catch (error) {
      console.error('Error loading mask image:', error);
    }
  }
  
  // Изображения без рамок
  for (let i = 0; i < imageLayers.value.length; i++) {
    const layer = imageLayers.value[i];
    ctx.save();
    
    try {
      let imageSrc = layer.src;
      if (!imageSrc.startsWith('blob:') && !imageSrc.startsWith('/storage/') && !imageSrc.startsWith(window.location.origin) && !imageSrc.startsWith('data:')) {
        imageSrc = await loadImageThroughProxy(layer.src);
      }
      
      const img = new window.Image();
      
      if (!imageSrc.startsWith('blob:') && !imageSrc.startsWith('/storage/') && !imageSrc.startsWith(window.location.origin)) {
        img.crossOrigin = 'anonymous';
      }
      
      img.src = imageSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
      ctx.restore();
    } catch (error) {
      console.error('Error loading image layer:', error);
      ctx.restore();
    }
  }
  
  // Текст без рамок
  for (let layerIndex = 0; layerIndex < textLayers.value.length; layerIndex++) {
    const layer = textLayers.value[layerIndex];
    if (layer.visible === false) continue;
    
    ctx.save();
    let fontStr = '';
    if (layer.italic) fontStr += 'italic ';
    if (layer.bold) fontStr += 'bold ';
    fontStr += `${layer.size || 32}px ${layer.font || 'Arial'}`;
    ctx.font = fontStr;
    ctx.fillStyle = layer.color || '#222';
    
    const align = layer.align || 'left';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    if (layer.shadow) {
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }
    
    const lines = (layer.text || '').split(/\r?\n/);
    const textWidths = lines.filter(line => line.trim()).map(line => ctx.measureText(line).width);
    const maxTextWidth = textWidths.length > 0 ? Math.max(...textWidths) : 100;
    const textBlockWidth = Math.min(maxTextWidth, 400);
    
    for (let i = 0; i < lines.length; i++) {
      const y = (layer.y ?? 20) + i * (layer.size || 32) * 1.2;
      const baseX = layer.x ?? 20;
      let x = baseX;
      
      if (align === 'center') {
        const lineWidth = ctx.measureText(lines[i]).width;
        x = baseX + (textBlockWidth - lineWidth) / 2;
      } else if (align === 'right') {
        const lineWidth = ctx.measureText(lines[i]).width;
        x = baseX + (textBlockWidth - lineWidth);
      }
      
      if (layer.stroke) {
        ctx.lineWidth = layer.strokeWidth || 2;
        ctx.strokeStyle = layer.strokeColor || '#fff';
        ctx.strokeText(lines[i], x, y);
      }
      ctx.fillText(lines[i], x, y);
    }
    
    ctx.restore();
  }
  
  return canvas;
}

// Функция сохранения изображения в галерею события
async function saveToGallery() {
  if (!props.eventData?.id) {
    showNotificationMessage('Ошибка', 'ID события не найден', 'error');
    return;
  }
  
  savingToGallery.value = true;
  
  try {
    // Рендерим canvas без UI элементов
    const canvas = await renderCanvasWithoutUI();
    if (!canvas) {
      throw new Error('Canvas не найден');
    }
    
    // Конвертируем canvas в blob
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png', 0.9);
    });
    
    if (!blob) {
      throw new Error('Не удалось создать изображение');
    }
    
    // Создаем FormData для отправки
    const formData = new FormData();
    formData.append('image', blob, `event-${props.eventData.id}-${Date.now()}.png`);
    formData.append('event_id', props.eventData.id);
    formData.append('type', 'editor');
    
    // Отправляем на сервер
    const response = await $fetch('/api/event-images', {
      method: 'POST',
      body: formData,
      baseURL: apiUrl
    });
    
    if (response) {
      showNotificationMessage('Успех', 'Изображение успешно сохранено в галерею события!', 'success');
      // Уведомляем родительский компонент о сохранении изображения
      emit('image-saved');
    }
    
  } catch (error) {
    console.error('Error saving to gallery:', error);
    showNotificationMessage('Ошибка', 'Ошибка сохранения в галерею: ' + (error.message || 'Неизвестная ошибка'), 'error');
  } finally {
    savingToGallery.value = false;
  }
}

async function loadTemplateList() {
  try {
    const res = await $fetch('/api/image-editor-templates', {
      baseURL: apiUrl
    });
    // Обрабатываем ответ от бэкенда
    if (res && res.templates && Array.isArray(res.templates)) {
      templateList.value = res.templates;
    } else if (Array.isArray(res)) {
      templateList.value = res;
    } else {
      templateList.value = [];
    }
  } catch (error) {
    console.error('Error loading templates:', error);
    templateList.value = [];
  }
}

async function loadEventGallery() {
  if (!props.eventData?.id) {
    console.error('Event ID not found');
    return;
  }

  loadingGallery.value = true;
  try {
    const res = await $fetch(`/api/event-images?event_id=${props.eventData.id}`, {
      baseURL: apiUrl
    });
    
    if (Array.isArray(res)) {
      eventGallery.value = res;
    } else if (res && res.data && Array.isArray(res.data)) {
      eventGallery.value = res.data;
    } else {
      eventGallery.value = [];
    }
  } catch (error) {
    console.error('Error loading event gallery:', error);
    eventGallery.value = [];
  } finally {
    loadingGallery.value = false;
  }
}

async function applyTemplate(tpl) {
  try {
    // Применяем настройки формата
    if (tpl.formatSettings) {
      // Проверяем, есть ли такой формат в текущих настройках
      const existingFormat = formatSettings.value.find(f => 
        f.width === tpl.formatSettings.width && 
        f.height === tpl.formatSettings.height &&
        f.type === tpl.formatSettings.type
      );
      
      if (existingFormat) {
        selectedFormat.value = existingFormat.type;
      } else {
        // Добавляем формат из шаблона
        formatSettings.value.push(tpl.formatSettings);
        selectedFormat.value = tpl.formatSettings.type;
      }
    } else {
      // Fallback для шаблонов без formatSettings
      selectedFormat.value = tpl.format || 'horizontal';
      
      // Проверяем, есть ли такой формат в текущих настройках
      const existingFormat = formatSettings.value.find(f => f.type === selectedFormat.value);
      if (!existingFormat) {
        // Создаем стандартные размеры для известных форматов
        const defaultSizes = {
          'horizontal': { width: 800, height: 500, description: 'Горизонтальный' },
          'vertical': { width: 500, height: 800, description: 'Вертикальный' },
          'square': { width: 600, height: 600, description: 'Квадратный' }
        };
        
        const defaultSize = defaultSizes[selectedFormat.value];
        if (defaultSize) {
          formatSettings.value.push({
            id: Date.now(),
            type: selectedFormat.value,
            ...defaultSize
          });
        }
      }
    }
    
    // Применяем фоновое изображение
    bgSource.value = tpl.bgSource || 'none';
    if (tpl.bgPreview && tpl.bgSource === 'upload') {
      try {
        bgPreview.value = tpl.bgPreview;
        const response = await fetch(tpl.bgPreview);
        const blob = await response.blob();
        bgFile.value = new File([blob], 'template-bg.jpg', { type: blob.type });
      } catch (error) {
        console.error('Error loading template background image:', error);
        bgPreview.value = '';
        bgFile.value = null;
      }
    } else {
      bgPreview.value = tpl.bgPreview || '';
      bgFile.value = null;
    }
    
    // Применяем маску
    selectedMask.value = tpl.maskId ? masks.value.find(m => m.id === tpl.maskId) : null;
    selectedMaskType.value = tpl.maskType || 'horizontal';
    
    // Применяем текстовые слои с заменой типов на реальные данные
    const processedTextLayers = (tpl.textLayers || []).map(layer => {
      const layerCopy = JSON.parse(JSON.stringify(layer));
      
      // Если слой имеет тип текста, заменяем на реальные данные
      if (layerCopy.textType) {
        // Проверяем обычные текстовые типы
        if (Object.values(TEXT_TYPES).includes(layerCopy.textType)) {
          const realText = mapTextTypeToEventData(layerCopy.textType, props.eventData);
          if (realText) {
            layerCopy.text = realText;
          }
        }
        // Проверяем вычисляемые типы
        else if (Object.values(COMPUTED_TYPES).includes(layerCopy.textType)) {
          const realText = mapComputedTypeToEventData(layerCopy.textType, props.eventData, props.teamActions || []);
          if (realText) {
            layerCopy.text = realText;
          }
        }
      }
      
      return layerCopy;
    });
    textLayers.value = processedTextLayers;
    
    // Применяем слои изображений с заменой типов на реальные данные
    const processedImageLayers = (tpl.imageLayers || []).map(layer => {
      const layerCopy = JSON.parse(JSON.stringify(layer));
      
      // Если слой имеет тип изображения, заменяем на реальные данные
      if (layerCopy.imageType && Object.values(IMAGE_TYPES).includes(layerCopy.imageType)) {
        const realImageSrc = mapImageTypeToEventData(layerCopy.imageType, props.eventData);
        if (realImageSrc) {
          layerCopy.src = realImageSrc;
          layerCopy.originalSrc = realImageSrc;
        }
      }
      
      return layerCopy;
    });
    imageLayers.value = processedImageLayers;
    
    // Закрываем модалку и обновляем canvas
    showTemplateListModal.value = false;
    
    // Ждем немного для применения всех изменений
    await nextTick();
    setTimeout(renderEditorCanvas, 100);
    
    showNotificationMessage('Успех', 'Шаблон успешно загружен!', 'success');
  } catch (error) {
    console.error('Error applying template:', error);
    showNotificationMessage('Ошибка', 'Ошибка при загрузке шаблона', 'error');
  }
}

// Функции для работы с иконками
function selectIcon(icon) {
  formatForm.value.icon = icon;
  showIconPicker.value = false;
}

function searchIcons() {
  // Здесь можно добавить логику поиска иконок
  // Пока что просто закрываем поиск
  if (iconSearch.value.length > 2) {
    // Можно добавить API для поиска иконок
  }
}

// Функции для отображения информации о шаблонах
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Неизвестная дата';
  }
}

function getTemplateInfo(tpl) {
  const textLayersCount = tpl.textLayers?.length || 0;
  const imageLayersCount = tpl.imageLayers?.length || 0;
  const parts = [];
  
  if (textLayersCount > 0) parts.push(`${textLayersCount} текст`);
  if (imageLayersCount > 0) parts.push(`${imageLayersCount} изобр`);
  if (tpl.maskId) parts.push('маска');
  
  return parts.length > 0 ? parts.join(', ') : 'Пустой шаблон';
}

function getTemplateFormat(tpl) {
  if (tpl.formatSettings) {
    return `${tpl.formatSettings.width}×${tpl.formatSettings.height}`;
  }
  
  // Определяем формат по типу
  const formatMap = {
    'horizontal': '800×500',
    'vertical': '500×800', 
    'square': '600×600'
  };
  
  return formatMap[tpl.format] || `${tpl.format || 'Неизвестный'}`;
}

// Функции для уведомлений
function showNotificationMessage(title, message, type = 'success') {
  notificationTitle.value = title;
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  
  // Автоматически скрываем через 5 секунд
  setTimeout(() => {
    showNotification.value = false;
  }, 5000);
}

// Функция для показа модалки подтверждения
function showConfirmDialog(title, message, callback) {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmCallback.value = callback;
  showConfirmModal.value = true;
}

// Функции для работы с модалкой подтверждения
function confirmAction() {
  if (confirmCallback.value) {
    confirmCallback.value();
  }
  showConfirmModal.value = false;
}

function cancelAction() {
  showConfirmModal.value = false;
}

// Функции для работы с галереей
function getImageUrl(path) {
  if (!path) return '';
  
  // Если путь уже полный URL, возвращаем как есть
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Если путь начинается с /storage/, добавляем базовый URL API
  if (path.startsWith('/storage/')) {
    return apiUrl + path;
  }
  
  // Для других относительных путей также добавляем базовый URL
  return apiUrl + (path.startsWith('/') ? path : '/' + path);
}

function openImageFullscreen(image) {
  // Открываем изображение в полном размере в новом окне
  const imageUrl = getImageUrl(image.path || image.preview_path);
  if (imageUrl) {
    window.open(imageUrl, '_blank');
  }
}

async function deleteImageFromGallery(image) {
  showConfirmDialog(
    'Удаление изображения', 
    `Удалить изображение ID: ${image.id}?`, 
    () => performDeleteImage(image)
  );
}

async function performDeleteImage(image) {

  try {
    await $fetch(`/api/event-images/${image.id}`, {
      method: 'DELETE',
      baseURL: apiUrl
    });
    
    // Удаляем изображение из списка
    const index = eventGallery.value.findIndex(img => img.id === image.id);
    if (index !== -1) {
      eventGallery.value.splice(index, 1);
    }
    
    showNotificationMessage('Успех', 'Изображение успешно удалено из галереи', 'success');
  } catch (error) {
    console.error('Error deleting image:', error);
    showNotificationMessage('Ошибка', 'Ошибка при удалении изображения: ' + (error.message || 'Неизвестная ошибка'), 'error');
  }
}





/*
ИНСТРУКЦИЯ ПО ИСПОЛЬЗОВАНИЮ КОМПОНЕНТА:
- Для интеграции подключите <EventImageAdvancedEditor ... /> в нужное место и передайте eventData, teamActions, teamActionTypeOptions.
- Все параметры (фон, маска, текст, эмблемы, диаграммы) настраиваются через UI.
- Для экспорта изображения используйте кнопки Экспорт PNG/JPG.
- Для сохранения шаблона — кнопка 'Сохранить как шаблон'.
- Для загрузки шаблона — кнопка 'Загрузить шаблон'.
- Все действия с изображением происходят на canvas, поддерживается drag&drop, resize, удаление слоёв.
- НОВОЕ: Эмблемы клубов и соревнований изменяются пропорционально (фиолетовая рамка и стрелка ⤧), диаграммы - свободно (синяя рамка и квадратик).
- Для расширения добавьте новые типы слоёв или параметры в imageLayers/textLayers.
*/
</script>

<style scoped>
.event-image-advanced-editor {
  min-height: 600px;
}

.template-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  max-height: calc(1.4em * 2);
}
</style> 