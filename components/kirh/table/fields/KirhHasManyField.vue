<template>
  <div class="kirh-hasmany-field ">
    <!-- Display count with clickable icon -->
    <button 
      class="hasmany-trigger flex items-center space-x-1 rounded transition w-full justify-center"
      :class="[
        count === 0 ? effectiveOptions.noDataClass : (hasValidId() ? effectiveOptions.hasDataClass : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'),
        readonly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      ]"
      @click="openModal" 
      :disabled="readonly"
      :title="(!hasValidId()) ? 'Предупреждение: ID записи не определен.' : (effectiveOptions?.tooltipText || 'Ссвязанные записи')"
    >
      <Icon 
        :name="hasValidId() ? (effectiveOptions.iconName || effectiveOptions.icon || 'material-symbols:list') : 'solar:danger-triangle-bold-duotone'" 
        :class="count === 0 ? effectiveOptions.noDataIconClass : (hasValidId() ? effectiveOptions.hasDataIconClass : 'text-yellow-600')" 
        :style="count === 0 ? effectiveOptions.iconStyle : {}"
        :size="effectiveOptions.iconSize" 
      />
      <span v-if="count !== undefined && count !== null" >
        {{ count }}
      </span>
      <span class="text-xs text-gray-500" v-else>—</span>
    </button>

    <!-- Modal dialog -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          <!-- Modal header -->
          <div class="px-6 py-4 border-b flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900 flex items-center">
              <Icon 
                :name="effectiveOptions.iconName || effectiveOptions.icon || 'material-symbols:list'"
                class="mr-2 text-blue-600"
                :size="effectiveOptions.iconSize"
              />
              <span v-html="modalTitle"></span>
            </h3>
            <div class="flex items-center space-x-2">
              <button 
                v-if="relatedItems.length > 0" 
                @click="refreshData" 
                class="text-gray-400 hover:text-gray-600"
                title="Обновить данные"
              >
                <Icon name="solar:refresh-bold-duotone" size="1.3em" :class="{ 'animate-spin': loading }" />
              </button>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
                <Icon name="solar:close-circle-bold-duotone" size="1.5em" />
              </button>
            </div>
          </div>
          
          <!-- Modal body with list of related items -->
          <div class="p-6 overflow-y-auto overflow-x-hidden flex-grow">
            <!-- Loading indicator -->
            <div v-if="loading" class="flex justify-center items-center h-32">
              <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            
            <!-- Error message -->
            <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-md mb-4">
              <div class="font-medium">Ошибка:</div>
              <div>{{ error }}</div>
              
              <div class="flex flex-wrap gap-2 mt-2">
                <button 
                  @click="fetchRelatedItems" 
                  class="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Повторить загрузку
                </button>
                
                <!-- Кнопка режима отладки -->
                <button 
                  v-if="error.includes('ID')"
                  @click="toggleDebugMode" 
                  class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {{ debugMode ? 'Выключить режим отладки' : 'Включить режим отладки' }}
                </button>
              </div>
            </div>
            
            <!-- Content when data is loaded -->
            <div v-else>
              <!-- Check if fields are configured -->
              <div v-if="effectiveOptions?.fields?.length === 0" class="bg-yellow-50 text-yellow-700 p-4 rounded-md mb-4">
                Не настроены поля для отображения. Добавьте параметр fields в options.
              </div>
              
              <div v-else>
                <!-- Related items table -->
                <div class="mb-4 overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200 table-fixed">
                    <thead class="bg-gray-50">
                      <tr>
                        <th v-for="field in effectiveOptions?.fields || []" :key="field.name"
                            class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div class="flex items-center">
                            <Icon 
                              v-if="field.icon" 
                              :name="field.icon" 
                              class="mr-2 text-gray-600" 
                              :size="field.iconSize || '1em'" 
                            />
                            {{ field.label }}
                          </div>
                        </th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="(item, index) in relatedItems" :key="item.id" class="hover:bg-gray-50">
                        <td v-for="field in effectiveOptions?.fields || []" :key="`${item.id}-${field.name}`" class="px-3 py-2 text-sm break-words">
                          <div v-if="isEditingItem === item.id">
                            <div class="relative w-full">
                            <input 
                              v-if="field.type === 'text'" 
                              type="text" 
                              v-model="item[field.name]"
                                :class="[field.options?.inputClass || effectiveOptions?.defaultInputClass || 'w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500', field.options?.pasteFromClipboard ? 'pr-8' : '']"
                            />
                              <!-- Кнопка вставки из буфера -->
                              <button 
                                v-if="field.type === 'text' && field.options?.pasteFromClipboard" 
                                type="button" 
                                @click="pasteFromClipboard(field.name, item)"
                                class="absolute right-0 top-1/2 -translate-y-1/2 px-2 flex items-center text-gray-500 hover:text-gray-700"
                                :title="field.options?.pasteFromClipboard?.title || 'Вставить из буфера обмена'"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </button>
                            </div>
                            
                            <template v-if="field.type === 'date'">
                            <input 
                              type="date" 
                              v-model="item[field.name]"
                              :class="field.options?.inputClass || effectiveOptions?.defaultInputClass || 'w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'"
                            />
                            </template>
                            
                            <template v-if="field.type === 'datetime'">
                            <input 
                              type="datetime-local" 
                              v-model="item[field.name]"
                              :class="field.options?.inputClass || effectiveOptions?.defaultInputClass || 'w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'"
                            />
                            </template>
                            
                            <template v-if="field.type === 'time'">
                            <input 
                              type="time" 
                              v-model="item[field.name]"
                              :class="field.options?.inputClass || effectiveOptions?.defaultInputClass || 'w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'"
                            />
                            </template>
                            
                            <template v-if="field.type === 'textarea'">
                            <textarea 
                              v-model="item[field.name]"
                              :class="field.options?.inputClass || effectiveOptions?.defaultTextareaClass || 'w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'"
                              rows="2"
                            ></textarea>
                            </template>
                            
                            <template v-if="field.type === 'select'">
                            <select 
                              v-model="item[field.name]"
                              :class="field.options?.inputClass || effectiveOptions?.defaultSelectClass || 'w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'"
                            >
                              <option v-if="field.options?.emptyable" value="">Не выбрано</option>
                              <option 
                                v-for="option in field.options?.options" 
                                :key="option[field.options?.keyField || 'id']" 
                                :value="option[field.options?.keyField || 'id']"
                              >
                                {{ option[field.options?.labelField || 'name'] }}
                              </option>
                            </select>
                            </template>
                            
                            <template v-if="field.type === 'toggle'">
                            <div 
                              :class="field.options?.toggleWrapperClass || effectiveOptions?.defaultToggleWrapperClass || 'flex items-center'"
                            >
                              <input 
                                type="checkbox" 
                                v-model="item[field.name]"
                                :class="field.options?.toggleClass || effectiveOptions?.defaultToggleClass || 'h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'"
                              />
                              <span :class="field.options?.toggleLabelClass || 'ml-2 text-sm text-gray-700'" v-if="field.options?.toggleLabel">
                                {{ field.options.toggleLabel }}
                              </span>
                            </div>
                            </template>
                          </div>
                          
                          <div v-else>
                            <div v-if="field.type === 'toggle'" class="flex items-center">
                              <input 
                                type="checkbox" 
                                :checked="item[field.name]"
                                disabled
                                :class="field.options?.toggleClass || effectiveOptions?.defaultToggleClass || 'h-4 w-4 text-gray-400 rounded border-gray-300 cursor-not-allowed'"
                              />
                            </div>
                            
                            <div v-else-if="field.type === 'select'" class="text-sm text-gray-700">
                              {{ getSelectLabel(item, field) || 'Не выбрано' }}
                            </div>
                            
                            <div v-else-if="field.type === 'date'" class="text-sm text-gray-700">
                              {{ formatDate(item[field.name]) || '—' }}
                            </div>
                            
                            <div v-else-if="field.type === 'datetime'" class="text-sm text-gray-700">
                              {{ formatDateTime(item[field.name]) || '—' }}
                            </div>
                            
                            <div v-else-if="field.type === 'time'" class="text-sm text-gray-700">
                              {{ formatTime(item[field.name]) || '—' }}
                            </div>
                            
                            <div v-else class="text-sm text-gray-700">
                              {{ item[field.name] || '—' }}
                            </div>
                          </div>
                        </td>
                        <td class="px-3 py-2 text-sm text-right w-24">
                          <div class="flex space-x-2 justify-end">
                            <button v-if="isEditingItem === item.id"
                                    @click="saveItem(item)"
                                    class="text-green-600 hover:text-green-900"
                                    :disabled="item._updating">
                              <Icon v-if="item._updating" name="svg-spinners:270-ring" class="animate-spin" size="1.2em" />
                              <Icon v-else :name="effectiveOptions?.icons?.save || 'ph:check-circle-duotone'" size="1.2em" />
                            </button>
                            <button v-if="isEditingItem === item.id"
                                    @click="cancelEdit()" 
                                    class="text-gray-600 hover:text-gray-900"
                                    :disabled="item._updating">
                              <Icon :name="effectiveOptions?.icons?.cancel || 'ph:x-circle-duotone'" size="1.2em" />
                            </button>
                            <button v-if="isEditingItem !== item.id"
                                    @click="editItem(item)" 
                                    class="text-blue-600 hover:text-blue-900"
                                    :disabled="item._deleting">
                              <Icon :name="effectiveOptions?.icons?.edit || 'ph:pencil-simple-duotone'" size="1.2em" />
                            </button>
                            <button @click="deleteItem(item)"
                                    class="text-red-600 hover:text-red-900"
                                    :disabled="item._deleting || isEditingItem === item.id"
                                    title="Отвязать запись">
                              <Icon v-if="item._deleting" name="svg-spinners:270-ring" class="animate-spin" size="1.2em" />
                              <Icon v-else :name="effectiveOptions?.icons?.delete || 'ph:link-break-duotone'" size="1.2em" />
                            </button>
                            <button @click="permanentDeleteItem(item)"
                                    class="text-red-600 hover:text-red-900"
                                    :disabled="item._permanentDeleting || isEditingItem === item.id"
                                    title="Удалить запись полностью">
                              <Icon v-if="item._permanentDeleting" name="svg-spinners:270-ring" class="animate-spin" size="1.2em" />
                              <Icon v-else :name="effectiveOptions?.icons?.permanentDelete || 'ph:trash-duotone'" size="1.2em" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      <!-- Empty row message -->
                      <tr v-if="relatedItems.length === 0">
                        <td :colspan="(effectiveOptions?.fields?.length || 0) + 1" class="px-3 py-4 text-center text-sm text-gray-500">
                          Нет связанных записей
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <!-- Add new item form -->
                <div v-if="showAddForm" class="border rounded-md p-4 bg-gray-50 overflow-x-auto">
                  <h4 class="text-sm font-medium mb-3">Добавить запись</h4>
                  <!-- Заменяем сетку, добавляем 12-колоночную систему -->
                  <div class="grid grid-cols-12 gap-4 mb-4">
                    <div 
                      v-for="field in effectiveOptions?.fields || []" 
                      :key="`new-${field.name}`"
                      :class="[
                        field.options?.formColumnClass || 
                        effectiveOptions?.defaultFieldColumnClass || 
                        'col-span-12 md:col-span-6'
                      ]"
                    >
                      <label class="block text-xs font-medium text-gray-700 mb-1">
                        {{ field.label }}
                      </label>
                      
                      <div class="relative w-full">
                      <input 
                        v-if="field.type === 'text'" 
                        type="text" 
                        v-model="newItem[field.name]"
                          :class="[field.options?.inputClass || effectiveOptions?.defaultInputClass || 'w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500', field.options?.pasteFromClipboard ? 'pr-8' : '']"
                      />
                        <!-- Кнопка вставки из буфера -->
                        <button 
                          v-if="field.type === 'text' && field.options?.pasteFromClipboard" 
                          type="button" 
                          @click="pasteFromClipboard(field.name, newItem)"
                          class="absolute right-0 top-1/2 -translate-y-1/2 px-2 flex items-center text-gray-500 hover:text-gray-700"
                          :title="field.options?.pasteFromClipboard?.title || 'Вставить из буфера обмена'"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </button>
                      </div>
                      
                      <template v-if="field.type === 'date'">
                      <input 
                        type="date" 
                        v-model="newItem[field.name]"
                        :class="field.options?.inputClass || effectiveOptions?.defaultInputClass || 'w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'"
                      />
                      </template>
                      
                      <template v-if="field.type === 'datetime'">
                      <input 
                        type="datetime-local" 
                        v-model="newItem[field.name]"
                        :class="field.options?.inputClass || effectiveOptions?.defaultInputClass || 'w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'"
                      />
                      </template>
                      
                      <template v-if="field.type === 'time'">
                      <input 
                        type="time" 
                        v-model="newItem[field.name]"
                        :class="field.options?.inputClass || effectiveOptions?.defaultInputClass || 'w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'"
                      />
                      </template>
                      
                      <template v-if="field.type === 'textarea'">
                      <textarea 
                        v-model="newItem[field.name]"
                        :class="field.options?.inputClass || effectiveOptions?.defaultTextareaClass || 'w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'"
                        rows="2"
                      ></textarea>
                      </template>
                      
                      <template v-if="field.type === 'select'">
                      <select 
                        v-model="newItem[field.name]"
                        :class="field.options?.inputClass || effectiveOptions?.defaultSelectClass || 'w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'"
                      >
                        <option v-if="field.options?.emptyable" value="">Не выбрано</option>
                        <option 
                          v-for="option in field.options?.options" 
                          :key="option[field.options?.keyField || 'id']" 
                          :value="option[field.options?.keyField || 'id']"
                        >
                          {{ option[field.options?.labelField || 'name'] }}
                        </option>
                      </select>
                      </template>
                      
                      <template v-if="field.type === 'toggle'">
                      <div 
                        :class="field.options?.toggleWrapperClass || effectiveOptions?.defaultToggleWrapperClass || 'flex items-center'"
                      >
                        <input 
                          type="checkbox" 
                          v-model="newItem[field.name]"
                          :class="field.options?.toggleClass || effectiveOptions?.defaultToggleClass || 'h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'"
                        />
                        <span :class="field.options?.toggleLabelClass || 'ml-2 text-sm text-gray-700'" v-if="field.options?.toggleLabel">
                          {{ field.options.toggleLabel }}
                        </span>
                      </div>
                      </template>
                    </div>
                  </div>
                  <div class="flex justify-end space-x-2">
                    <button @click="cancelAddItem" class="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Отмена
                    </button>
                    <button 
                      @click="saveNewItem" 
                      class="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                      :disabled="loading">
                      <Icon v-if="loading" name="svg-spinners:270-ring" class="animate-spin mr-1" size="1em" />
                      <Icon v-else :name="effectiveOptions?.icons?.saveNew || 'ph:floppy-disk-duotone'" class="mr-1" />
                      <span>Сохранить</span>
                    </button>
                  </div>
                </div>
                
                <!-- "Add new" button -->
                <button v-if="!showAddForm"
                        @click="showAddForm = true"
                        class="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Icon :name="effectiveOptions?.icons?.add || 'ph:plus-circle-duotone'" class="mr-1" />
                  Добавить запись
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { Icon } from '@iconify/vue';
import KirhTextField from './KirhTextField.vue';
import KirhSelectField from './KirhSelectField.vue';
import KirhTextareaField from './KirhTextareaField.vue';
import KirhToggleField from './KirhToggleField.vue';
import KirhImageField from './KirhImageField.vue';
import KirhDateTimeField from './KirhDateTimeField.vue';

/**
 * Компонент для управления связями HasMany (один ко многим)
 * 
 * Предоставляет интерфейс для просмотра и редактирования дочерних записей в отношении один-ко-многим
 * 
 * @example
 * Пример использования в tableOptions.columns:
 * 
 * {
 *   name: 'streams_count',
 *   label: 'Стримы',
 *   type: 'hasmany',
 *   options: {
 *     // Основные настройки
 *     parentModel: 'events',
 *     relationship: 'streams',
 *     relationshipLabel: 'Стримы события',
 *     foreignKey: 'event_id',
 *     
 *     // Передача значения полей из родительской записи в форму добавления
 *     // Вариант 1: Одиночное поле
 *     defaultValueField: 'date_from',      // Поле в родительской записи (rowData)
 *     defaultValueTargetField: 'date',     // Поле в форме добавления новой записи
 *     
 *     // Вариант 2: Массив пар полей
 *     defaultValues: [
 *       { sourceField: 'date_from', targetField: 'date' },
 *       { sourceField: 'title', targetField: 'name' },
 *       { sourceField: 'location', targetField: 'venue' }
 *     ],
 *     
 *     // Настройка сетки формы (12-колоночная система)
 *     defaultFieldColumnClass: 'col-span-12 md:col-span-6', // Ширина поля по умолчанию
 *     
 *     // Индивидуальная настройка ширины для конкретных полей
 *     fields: [
 *       { 
 *         name: 'title', 
 *         type: 'text', 
 *         label: 'Название',
 *         options: {
 *           formColumnClass: 'col-span-12 md:col-span-12' // На всю ширину
 *         }
 *       },
 *       { 
 *         name: 'date', 
 *         type: 'date', 
 *         label: 'Дата',
 *         options: {
 *           formColumnClass: 'col-span-6 md:col-span-4' // Треть ширины на средних экранах
 *         }
 *       },
 *       { 
 *         name: 'time', 
 *         type: 'time', 
 *         label: 'Время',
 *         options: {
 *           formColumnClass: 'col-span-6 md:col-span-4' // Треть ширины на средних экранах
 *         }
 *       },
 *       { 
 *         name: 'duration', 
 *         type: 'text', 
 *         label: 'Длительность',
 *         options: {
 *           formColumnClass: 'col-span-12 md:col-span-4' // Треть ширины на средних экранах
 *         }
 *       }
 *     ],
 *     
 *     // Остальные настройки...
 *     iconName: 'solar:list-bold-duotone',
 *     // ... существующий код ...
 *   }
 * }
 */
export default {
  name: 'KirhHasManyField',
  components: {
    Icon,
    KirhTextField,
    KirhSelectField,
    KirhTextareaField,
    KirhToggleField,
    KirhImageField,
    KirhDateTimeField
  },
  props: {
    modelValue: [Array, Object],
    label: String,
    field: String,
    parentId: [String, Number],
    parentModel: String,
    relatedModel: String,
    filterCallback: Function,
    sortCallback: Function,
    format: String,
    options: Object,
    readonly: Boolean,
    icon: String,
    iconSize: String,
    iconName: String,
    rowData: Object,
    
    // Параметры для передачи значения из родительской записи
    defaultValueField: String,        // Поле в родительской записи (rowData)
    defaultValueTargetField: String,  // Поле в форме добавления новой записи
    
    // Параметр для массива пар полей
    defaultValues: {
      type: Array,
      default: () => []
    },
    
    // Параметр для настройки сетки формы
    defaultFieldColumnClass: String,  // Класс для колонок формы по умолчанию
    
    style: {
      type: Object,
      default: () => ({})
    },
    iconStyle: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    // Отслеживаем изменения rowData для быстрой реакции на изменения
    watch(() => props.rowData, () => {
      // При изменении родительской записи сбрасываем и переинициализируем newItem
      if (showAddForm.value) {
        resetNewItem();
      }
    }, { deep: true });
    
    // Получение базового URL API из различных источников
    const getBaseApiUrl = () => {
      try {
        // Приоритетный способ - через useRuntimeConfig()
        if (typeof useRuntimeConfig === 'function') {
          const config = useRuntimeConfig();
          if (config.public?.API_URL) {
            return config.public.API_URL;
          }
          if (config.public?.apiUrl) {
            return config.public.apiUrl;
          }
        }
        
        // Проверяем Vite/импорт переменных окружения
        if (import.meta?.env) {
          if (import.meta.env.VITE_API_URL) {
            return import.meta.env.VITE_API_URL;
          }
          if (import.meta.env.NUXT_PUBLIC_API_URL) {
            return import.meta.env.NUXT_PUBLIC_API_URL;
          }
        }
        
        // Проверяем переменные process.env
        if (typeof process !== 'undefined' && process.env) {
          if (process.env.NUXT_PUBLIC_API_URL) {
            return process.env.NUXT_PUBLIC_API_URL;
          }
          if (process.env.API_URL) {
            return process.env.API_URL;
          }
        }
        
        // Если это статичная среда
        if (window?.$nuxt?.$config?.apiUrl) {
          return window.$nuxt.$config.apiUrl;
        }
        
        // Дефолтное значение (просто доменное имя без /api)
        return '';
      } catch (error) {
        return '';
      }
    };
    
    // Вспомогательная функция для корректного соединения базового URL и пути
    const joinUrl = (base, path) => {
      // Если путь уже содержит полный URL (начинается с http:// или https://), возвращаем его как есть
      if (path.startsWith('http')) {
        return path;
      }
      
      // Если база не указана или пустая
      if (!base) {
        return path.startsWith('/') ? path : `/${path}`;
      }
      
      // Удаляем завершающий слеш из базового URL, если он есть
      base = base.replace(/\/+$/, '');
      
      // Убираем начальный слеш из пути, если он есть и база не пустая
      if (path.startsWith('/')) {
        path = path.substring(1);
      }
      
      // Проверяем, не содержится ли уже /api в обоих частях URL
      if (base.endsWith('/api') && path.startsWith('api/')) {
        path = path.substring(4); // Убираем 'api/'
      }
      
      // Соединяем базовый URL и путь
      return `${base}/${path}`;
    };
    
    // Функция для создания полного API URL на основе путей и шаблонов
    const buildApiUrl = (urlTemplate, params = {}) => {
      // Если URL-шаблон не указан, возвращаем null
      if (!urlTemplate) return null;
      
      // Заменяем все плейсхолдеры в шаблоне
      let url = urlTemplate;
      Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, value);
      });
      
      // Если URL является абсолютным, возвращаем его как есть
      if (url.startsWith('http')) {
        return url;
      }
      
      // Получаем базовый URL API
      const baseApiUrl = effectiveOptions.value.baseApiUrl || getBaseApiUrl();
      
      // Иначе добавляем базовый URL
      return joinUrl(baseApiUrl, url);
    };
    
    // State variables
    const showModal = ref(false);
    const loading = ref(false);
    const error = ref(null);
    const relatedItems = ref([]);
    const originalItems = ref([]);
    const showAddForm = ref(false);
    const newItem = ref({});
    const isEditingItem = ref(null);
    const editingItemOriginal = ref(null);
    
    // DEBUG MODE - когда включен, используем заглушку для ID
    const debugMode = ref(false);  // Всегда выключено по умолчанию
    const debugFakeId = ref(null); // Нет заглушки по умолчанию
    
    // Функция для получения эффективного ID с учетом режима отладки
    const getEffectiveId = () => {
      const thisId = props.rowData?.id || props.parentId;
      
      // Если включен режим отладки и ID не определен, используем фейковый ID
      if (debugMode.value && !thisId) {
        return debugFakeId.value;
      }
      
      return thisId; // Возвращаем ID (даже если он null/undefined)
    };
    
    // Улучшаем проверку валидности ID
    const hasValidId = () => {
      const id = getEffectiveId();
      const isValid = id !== null && id !== undefined && id !== '';
      return isValid;
    };
    
    // Признак того, что данные были загружены хотя бы раз
    const relatedItemsLoaded = ref(false);
    
    // Computed properties
    const count = computed(() => {
      // Если ID не валиден и это не режим отладки, возвращаем знак тире
      if (!hasValidId() && !debugMode.value) {
        return null;
      }
      
      // Если значение передано напрямую и это число
      if (typeof props.value === 'number') {
        return props.value;
      }
      
      // Иначе используем countField из rowData, но только если rowData существует
      if (props.rowData) {
        const countField = props.options?.countField || `${props.options?.relationship}_count`;
        // Добавим защиту от undefined для countField
        if (countField && props.rowData[countField] !== undefined) {
          // Преобразуем к числу, чтобы гарантировать правильное сравнение с 0
          return Number(props.rowData[countField]);
        }
      }
      
      // Если relatedItems загружены, используем их длину
      if (relatedItems.value && Array.isArray(relatedItems.value)) {
        return relatedItems.value.length;
      }
      
      // Если ничего не найдено, и это первичная загрузка возвращаем null
      // чтобы знак тире показался
      if (!relatedItemsLoaded.value) {
        return null;
      }
      
      // Если данные были загружены, но их нет, возвращаем 0
      return 0;
    });
    
    const parentName = computed(() => {
      if (!props.rowData) return '';
      
      const nameField = props.options?.parentLabelField || 'name' || 'title';
      return props.rowData[nameField] || props.rowData.id || '';
    });
    
    // Добавим новое computed свойство для заголовка модального окна
    const modalTitle = computed(() => {
      // Используем modalTitle из опций, если он указан
      if (props.options?.modalTitle) {
        // Базовый заголовок без дополнительных полей
        let title = props.options.modalTitle;
        
        // Если указано поле для добавления к заголовку
        const addFieldName = props.options?.modalTitleAddField;
        if (addFieldName && props.rowData) {
          const addFieldValue = props.rowData[addFieldName];
          if (addFieldValue) {
            title += ` <span class="font-normal text-sm text-gray-500">${addFieldValue}</span>`;
          }
        }
        
        return title;
      }
      
      // Базовый заголовок без явного modalTitle
      let title = `${props.options?.relationshipLabel || 'Связанные записи'} для ${parentName.value || ''}`;
      
      // Если указано поле для добавления к заголовку
      const addFieldName = props.options?.modalTitleAddField;
      if (addFieldName && props.rowData) {
        const addFieldValue = props.rowData[addFieldName];
        if (addFieldValue) {
          title += ` <span class="font-normal text-sm text-gray-500">${addFieldValue}</span>`;
        }
      }
      
      return title;
    });
    
    // Добавим computed-свойство с дефолтными настройками
    const effectiveOptions = computed(() => {
      // Получаем опции как из прямых пропсов, так и из объекта options
      const result = {
        // Определяем отношения и модели
        parentModel: props.parentModel || props.options?.parentModel || 'item',
        relationship: props.options?.relationship || 'items',
        relationshipLabel: props.options?.relationshipLabel || 'Элементы',
        parentField: props.parentField || props.options?.parentField || props.name || 'id',
        foreignKey: props.options?.foreignKey || `${props.options?.parentModel || 'item'}_id`.toLowerCase(),
        relatedField: props.relatedField || props.options?.relatedField || null,
        relatedModel: props.relatedModel || props.options?.relatedModel || null,
        
        // Параметры для передачи значения из родительской записи
        defaultValueField: props.defaultValueField || props.options?.defaultValueField || null,
        defaultValueTargetField: props.defaultValueTargetField || props.options?.defaultValueTargetField || null,
        
        // Массив пар полей для копирования значений - восстанавливаем подробную обработку
        defaultValues: (() => {
          // Если defaultValues передан напрямую как prop
          if (props.defaultValues && Array.isArray(props.defaultValues) && props.defaultValues.length > 0) {
            return props.defaultValues;
          }
          
          // Если defaultValues передан через options
          if (props.options?.defaultValues && Array.isArray(props.options.defaultValues) && props.options.defaultValues.length > 0) {
            return props.options.defaultValues;
          }
          
          // Если передана одиночная пара полей, создаем массив с одним элементом
          if (props.defaultValueField && props.defaultValueTargetField) {
            return [{ 
              sourceField: props.defaultValueField, 
              targetField: props.defaultValueTargetField 
            }];
          }
          
          // Если передана одиночная пара полей через options
          if (props.options?.defaultValueField && props.options?.defaultValueTargetField) {
            return [{ 
              sourceField: props.options.defaultValueField, 
              targetField: props.options.defaultValueTargetField 
            }];
          }
          
          // Пустой массив, если ничего не передано
          return [];
        })(),
        
        // Настройки отображения
        modalTitle: props.modalTitle || props.options?.modalTitle || null,
        modalTitleAddField: props.modalTitleAddField || props.options?.modalTitleAddField || null,
        
        // Настройки иконок и стилей
        icon: props.icon || props.options?.icon || 'material-symbols:list',
        iconName: props.iconName || props.options?.iconName || props.options?.icon || props.icon || 'material-symbols:list',
        iconSize: props.iconSize || props.options?.iconSize || '1.2em',
        
        // Классы для различных состояний данных
        hasDataClass: props.hasDataClass || props.options?.hasDataClass || 'bg-blue-100 text-blue-600 hover:bg-blue-200',
        noDataClass: props.noDataClass || props.options?.noDataClass || 'bg-gray-100 text-gray-500 hover:bg-gray-200',
        hasDataIconClass: props.hasDataIconClass || props.options?.hasDataIconClass || 'text-blue-600',
        noDataIconClass: props.noDataIconClass || props.options?.noDataIconClass || 'text-gray-400',
        
        // Инлайн стили
        style: props.style || props.options?.style || {},
        iconStyle: props.iconStyle || props.options?.iconStyle || {},
        
        // Текст подсказки
        tooltipText: props.tooltipText || props.options?.tooltipText || 'Показать связанные записи',
        
        // URL для API
        baseUrl: props.baseUrl || props.options?.baseUrl || '/api',
        apiUrl: props.options?.apiUrl || null,
        createApiUrl: props.options?.createApiUrl || null,
        updateApiUrl: props.options?.updateApiUrl || null,
        deleteApiUrl: props.options?.deleteApiUrl || null,
        
        // Стили полей ввода
        defaultInputClass: props.options?.defaultInputClass || 'w-full px-2 py-1 text-sm border border-gray-300 rounded',
        defaultSelectClass: props.options?.defaultSelectClass || 'w-full px-2 py-1 text-sm border border-gray-300 rounded',
        defaultTextareaClass: props.options?.defaultTextareaClass || 'w-full px-2 py-1 text-sm border border-gray-300 rounded',
        defaultToggleClass: props.options?.defaultToggleClass || 'h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500',
        defaultToggleWrapperClass: props.options?.defaultToggleWrapperClass || 'flex items-center',
        
        // Настройка размеров полей в сетке формы (новый параметр)
        defaultFieldColumnClass: props.defaultFieldColumnClass || props.options?.defaultFieldColumnClass || 'col-span-12 md:col-span-6',
        
        // Поля для связанных записей
        fields: Array.isArray(props.options?.fields) 
          ? props.options.fields.map(field => ({
              ...field,
              // Добавляем дефолтные значения для иконок полей
              icon: field.icon || null,
              iconSize: field.iconSize || '1em'
            })) 
          : [],
        
        // Иконки для кнопок действий
        icons: props.options?.icons || {
          add: 'ph:plus-circle-duotone',
          edit: 'ph:pencil-simple-duotone',
          save: 'ph:check-circle-duotone',
          cancel: 'ph:x-circle-duotone',
          saveNew: 'ph:floppy-disk-duotone',
          delete: 'ph:link-break-duotone',
          permanentDelete: 'ph:trash-duotone',
          refresh: 'solar:refresh-bold-duotone'
        },
      };

      return result;
    });
    
    // Reset the new item form
    const resetNewItem = () => {
      newItem.value = {};
      // Initialize with default values from options if provided
      if (effectiveOptions.value.fields) {
        effectiveOptions.value.fields.forEach(field => {
          if (field.default !== undefined) {
            newItem.value[field.name] = field.default;
          } else {
            newItem.value[field.name] = null;
          }
        });
      }
      
      // Установим внешний ключ только если ID определен
      if (props.rowData && props.rowData.id) {
        const foreignKey = effectiveOptions.value.foreignKey;
        newItem.value[foreignKey] = props.rowData.id;
      }
      
      // Проверяем наличие родительской записи
      if (props.rowData) {
        // Получаем массив пар полей для копирования значений
        const defaultValues = effectiveOptions.value.defaultValues;
        
        // Обработка для поддержки обратной совместимости с одиночными полями
        const sourceField = effectiveOptions.value.defaultValueField;
        const targetField = effectiveOptions.value.defaultValueTargetField;
        
        // Проверяем, что оба поля указаны и значение в родительской записи существует
        if (sourceField && targetField && props.rowData[sourceField] !== undefined) {
          newItem.value[targetField] = props.rowData[sourceField];
        }
        
        // Проверяем наличие и валидность массива defaultValues
        if (Array.isArray(defaultValues) && defaultValues.length > 0) {
          // Обрабатываем каждую пару полей
          defaultValues.forEach((pair) => {
            if (pair && typeof pair === 'object' && pair.sourceField && pair.targetField && 
                props.rowData[pair.sourceField] !== undefined) {
              newItem.value[pair.targetField] = props.rowData[pair.sourceField];
            }
          });
        }
      }
    };
    
    // Methods
    const openModal = async () => {
      // Сбрасываем ошибку при каждом открытии
      error.value = null;
      
      // Проверка на валидность ID
      const isValid = hasValidId();
      
      // Показываем модальное окно в любом случае
      showModal.value = true;
      
      // Если ID невалидный и режим отладки выключен
      if (!isValid && !debugMode.value) {
        error.value = `
          <div class="flex flex-col gap-2">
            <p><strong>Внимание:</strong> ID родительской записи не определен или некорректен.</p>
            <p>Для работы с связанными записями необходимо сначала сохранить основную запись.</p>
            <p class="text-xs text-gray-500">После сохранения основной записи, у неё появится уникальный ID, который будет использоваться для связывания с зависимыми записями.</p>
          </div>
        `;
        return; // Прекращаем выполнение метода, не пытаясь загрузить данные
      } else if (!isValid && debugMode.value) {
        // Проверяем, установлен ли ID-заглушка в режиме отладки
        if (debugFakeId.value === null) {
          error.value = 'РЕЖИМ ОТЛАДКИ: ID-заглушка не установлена. Нажмите "Включить режим отладки" для установки тестового ID.';
          return;
        }
        error.value = `
          <div class="flex flex-col gap-2">
            <p><strong>РЕЖИМ ОТЛАДКИ:</strong> Используется ID-заглушка ${debugFakeId.value}.</p>
            <p>Для нормальной работы необходимо сохранить основную запись.</p>
            <p class="text-xs text-gray-500">В режиме отладки вы можете делать изменения, но они привязаны к тестовому ID и могут не отображаться в обычном режиме.</p>
          </div>
        `;
      }
      
      // Загружаем данные только если ID валиден или включен режим отладки с ID
      try {
        await fetchRelatedItems();
      } catch (err) {
        // Обрабатываем ошибку без вывода в консоль
      }
    };
    
    const closeModal = () => {
      showModal.value = false;
      showAddForm.value = false;
      error.value = null;
      isEditingItem.value = null;
    };
    
    const fetchRelatedItems = async () => {
      // Проверка на валидность ID
      if (!hasValidId() && !debugMode.value) {
        error.value = `
          <div class="flex flex-col gap-2">
            <p><strong>Ошибка:</strong> Невозможно загрузить связанные записи.</p>
            <p>ID не определен или некорректен. Сохраните основную запись перед работой с зависимыми.</p>
          </div>
        `;
        loading.value = false;
        return;
      }
      
      try {
        // Устанавливаем состояние загрузки до конструирования URL
        loading.value = true;
        error.value = null;
        
        // Получаем и форматируем ID с учетом режима отладки
        const effectiveId = getEffectiveId();
        const formattedId = typeof effectiveId === 'string' 
                           ? effectiveId.trim() 
                           : String(effectiveId);
        
        // Формируем URL для запроса
        let finalFetchApiUrl;
        
        if (effectiveOptions.value.apiUrl) {
          // Используем функцию для обработки URL
          finalFetchApiUrl = buildApiUrl(effectiveOptions.value.apiUrl, { id: formattedId });
        } else {
          // Создаем URL из компонентов
          const path = `${effectiveOptions.value.parentModel}/${formattedId}/${effectiveOptions.value.relationship}`;
          finalFetchApiUrl = joinUrl(effectiveOptions.value.baseApiUrl, path);
        }
        
        // Получаем заголовки авторизации
        const headers = getAuthHeaders();
        
        // Выполняем запрос с заголовками
        const response = await fetch(finalFetchApiUrl, {
          method: 'GET',
          headers: headers
        });
        
        // Если получаем 404, просто показываем пустой список
        if (response.status === 404) {
          console.log('API-эндпоинт не найден, показываем пустой список:', finalFetchApiUrl);
          relatedItems.value = [];
          relatedItemsLoaded.value = true;
          loading.value = false;
          return;
        }
        
        if (!response.ok) {
          await handleApiError(response, 'загрузке связанных записей');
          return;
        }
        
        const data = await response.json();
        
        // Проверка на пустой ответ
        if (!data) {
          relatedItems.value = []; // Пустой массив вместо ошибки
          relatedItemsLoaded.value = true;
          return;
        }
        
        relatedItems.value = data.data || data;
        originalItems.value = JSON.parse(JSON.stringify(relatedItems.value));
        
        // Отмечаем, что данные были загружены
        relatedItemsLoaded.value = true;
        
      } catch (err) {
        console.error('Ошибка при загрузке связанных записей:', err);
        // Вместо отображения ошибки просто показываем пустой список
        relatedItems.value = []; 
        // Отмечаем, что данные загружены (хоть и с ошибкой)
        relatedItemsLoaded.value = true;
        error.value = null; // Убираем сообщение об ошибке
      } finally {
        loading.value = false;
      }
    };
    
    // Функция для получения заголовков авторизации
    const getAuthHeaders = () => {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // Пытаемся получить токен аутентификации
      try {
        // Проверяем наличие хранилища токенов в $auth или localStorage
        if (window.$nuxt && window.$nuxt.$auth) {
          const token = window.$nuxt.$auth.strategy.token.get();
          if (token) {
            headers['Authorization'] = token;
          }
        } else if (localStorage.getItem('auth._token.local')) {
          headers['Authorization'] = localStorage.getItem('auth._token.local');
        }
      } catch (e) {
        // Не удалось получить токен
      }
      
      return headers;
    };
    
    // Обработчик ошибок API
    const handleApiError = async (response, actionName = 'выполнении запроса') => {
      const status = response.status;
      let errorText;
      
      // Обработка типовых ошибок HTTP
      if (status === 401) {
        errorText = 'Необходима авторизация. Пожалуйста, войдите в систему снова.';
        // Можно добавить перенаправление на страницу логина
      } else if (status === 403) {
        errorText = 'Доступ запрещен. У вас недостаточно прав для выполнения этого действия.';
      } else if (status === 404) {
        // Для ошибки 404 не выводим сообщение и возвращаем пустые данные
        relatedItems.value = [];
        relatedItemsLoaded.value = true;
        loading.value = false;
        return;
      } else if (status === 422) {
        // Обработка ошибок валидации
        try {
          const errorData = await response.json();
          if (errorData.errors) {
            const errors = Object.entries(errorData.errors)
              .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
              .join('; ');
            errorText = `Ошибка валидации данных: ${errors}`;
          } else {
            errorText = errorData.message || `Ошибка при ${actionName}`;
          }
        } catch (e) {
          errorText = `Ошибка валидации данных при ${actionName}`;
        }
      } else if (status >= 500) {
        errorText = `Ошибка сервера (${status}). Пожалуйста, попробуйте позже или обратитесь к администратору.`;
      } else {
        // Пытаемся получить описание ошибки из тела ответа
        try {
          const errorData = await response.json();
          errorText = errorData.message || errorData.error || `Ошибка ${status} при ${actionName}`;
        } catch (e) {
          errorText = `Ошибка ${status} при ${actionName}: ${response.statusText}`;
        }
      }
      
      // Устанавливаем текст ошибки
      error.value = errorText;
      throw new Error(errorText);
    };
    
    const getFieldComponent = (type) => {
      const componentMap = {
        text: KirhTextField,
        date: KirhDateTimeField,
        time: KirhDateTimeField,
        datetime: KirhDateTimeField,
        textarea: KirhTextareaField,
        select: KirhSelectField,
        toggle: KirhToggleField,
        image: KirhImageField
      };
      return componentMap[type] || KirhTextField;
    };
    
    const updateItemField = (item, fieldName, value) => {
      item[fieldName] = value;
    };
    
    const editItem = (item) => {
      isEditingItem.value = item.id;
      editingItemOriginal.value = JSON.parse(JSON.stringify(item));
    };
    
    const cancelEdit = () => {
      // Restore the original values
      const index = relatedItems.value.findIndex(item => item.id === isEditingItem.value);
      if (index !== -1 && editingItemOriginal.value) {
        relatedItems.value[index] = JSON.parse(JSON.stringify(editingItemOriginal.value));
      }
      isEditingItem.value = null;
      editingItemOriginal.value = null;
    };
    
    const saveItem = async (item) => {
      // Проверка на валидность ID перед сохранением записи
      if (!hasValidId() && !debugMode.value) {
        error.value = `
          <div class="flex flex-col gap-2">
            <p><strong>Ошибка:</strong> Невозможно сохранить запись.</p>
            <p>ID родительской записи не определен или некорректен. Сохраните основную запись перед редактированием зависимых.</p>
          </div>
        `;
        return;
      }
      
      // Установка флага обновления
      item._updating = true;
      
      try {
        // Получаем URL для обновления записи
        const updateUrl = buildApiUrl(effectiveOptions.value.updateApiUrl, { id: item.id });
        
        if (!updateUrl) {
          error.value = 'Ошибка: URL для обновления не настроен. Проверьте опцию updateApiUrl.';
          item._updating = false;
          return;
        }
        
        // Выполняем API-запрос для обновления записи
        const response = await fetch(updateUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(item)
        });
        
        // Проверка успешности ответа
        if (!response.ok) {
          let errorMessage = `Ошибка при обновлении записи: ${response.status} ${response.statusText}`;
          
          // Дополнительная информация в зависимости от статуса
          if (response.status === 404) {
            errorMessage = 'Ошибка 404: Запись не найдена. Возможно, она была удалена.';
          } else if (response.status === 403) {
            errorMessage = 'Ошибка 403: У вас нет прав на обновление этой записи.';
          } else if (response.status === 422) {
            // Пытаемся получить детальные ошибки валидации
            try {
              const errorData = await response.json();
              if (errorData.errors) {
                const errors = Object.entries(errorData.errors)
                  .map(([field, messages]) => `<li>${field}: ${messages.join(', ')}</li>`)
                  .join('');
                errorMessage = `<div>Ошибка валидации данных:</div><ul>${errors}</ul>`;
              }
            } catch (e) {
              // Если не удалось распарсить ответ, оставляем стандартное сообщение
            }
          }
          
          error.value = errorMessage;
          item._updating = false;
          return;
        }
        
        // Обработка успешного ответа
        const updatedItem = await response.json();
        
        // Обновляем объект в списке relatedItems
        const index = relatedItems.value.findIndex(i => i.id === item.id);
        if (index !== -1) {
          Object.assign(relatedItems.value[index], updatedItem);
        }
        
        // Очищаем режим редактирования
        isEditingItem.value = null;
        editingItemOriginal.value = null;
        
        item._updating = false;
      } catch (err) {
        error.value = `Произошла ошибка при обновлении записи: ${err.message}`;
        item._updating = false;
      }
    };
    
    const addItem = () => {
      // Проверка на валидность ID перед добавлением новой записи
      if (!hasValidId() && !debugMode.value) {
        error.value = `
          <div class="flex flex-col gap-2">
            <p><strong>Ошибка:</strong> Невозможно добавить новую запись.</p>
            <p>ID родительской записи не определен или некорректен. Сохраните основную запись перед добавлением зависимых.</p>
          </div>
        `;
        return;
      }
      
      // Reset form and set mode to add
      editMode.value = false;
      
      // ... existing code ...
    };
    
    const cancelAddItem = () => {
      showAddForm.value = false;
      resetNewItem();
    };
    
    // Упрощенный метод для сохранения новой записи
    const saveNewItem = async () => {
      // Проверка на валидность ID перед сохранением новой записи
      if (!hasValidId() && !debugMode.value) {
        error.value = `
          <div class="flex flex-col gap-2">
            <p><strong>Ошибка:</strong> Невозможно сохранить новую запись.</p>
            <p>ID родительской записи не определен или некорректен. Сохраните основную запись перед добавлением зависимых.</p>
          </div>
        `;
        return;
      }
      
      // Проверяем, что есть новые данные для сохранения
      if (!newItem.value || Object.keys(newItem.value).filter(key => newItem.value[key] !== null && newItem.value[key] !== '').length === 0) {
        error.value = `
          <div class="flex flex-col gap-2">
            <p><strong>Ошибка:</strong> Нет данных для сохранения.</p>
            <p>Пожалуйста, заполните хотя бы одно поле.</p>
          </div>
        `;
        return;
      }
      
      loading.value = true;
      error.value = null;
      
      try {
        // Получаем и форматируем ID с учетом режима отладки
        const effectiveId = getEffectiveId();
        const formattedId = typeof effectiveId === 'string' 
                           ? effectiveId.trim() 
                           : String(effectiveId);
        
        // Формируем URL для создания записи
        const createUrl = buildApiUrl(effectiveOptions.value.createApiUrl, { id: formattedId });
        
        if (!createUrl) {
          error.value = 'Ошибка: URL для создания не настроен. Проверьте опцию createApiUrl.';
          loading.value = false;
          return;
        }
        
        // Проверим, что внешний ключ установлен правильно
        const foreignKey = effectiveOptions.value.foreignKey;
        if (foreignKey && !newItem.value[foreignKey]) {
          newItem.value[foreignKey] = formattedId;
        }
        
        // Выполняем API-запрос для создания записи
        const response = await fetch(createUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(newItem.value)
        });
        
        // Проверка успешности ответа
        if (!response.ok) {
          let errorMessage = `Ошибка при создании записи: ${response.status} ${response.statusText}`;
          
          // Дополнительная информация в зависимости от статуса
          if (response.status === 404) {
            errorMessage = 'Ошибка 404: Ресурс не найден. Возможно, указан неверный URL.';
          } else if (response.status === 403) {
            errorMessage = 'Ошибка 403: У вас нет прав на создание записи.';
          } else if (response.status === 422) {
            // Пытаемся получить детальные ошибки валидации
            try {
              const errorData = await response.json();
              if (errorData.errors) {
                const errors = Object.entries(errorData.errors)
                  .map(([field, messages]) => `<li>${field}: ${messages.join(', ')}</li>`)
                  .join('');
                errorMessage = `<div>Ошибка валидации данных:</div><ul>${errors}</ul>`;
              }
            } catch (e) {
              // Если не удалось распарсить ответ, оставляем стандартное сообщение
            }
          }
          
          error.value = errorMessage;
          loading.value = false;
          return;
        }
        
        // Обработка успешного ответа
        const data = await response.json();
        
        // Добавляем новую запись в список
        const newRecord = data.data || data;
        relatedItems.value.push(newRecord);
        
        // Обновляем счетчик связанных записей
        emit('update:modelValue', relatedItems.value.length);
        
        // Сохраняем оригинальную копию обновленного списка
        originalItems.value = JSON.parse(JSON.stringify(relatedItems.value));
        
        // Очищаем форму
        showAddForm.value = false;
        resetNewItem();
        
      } catch (err) {
        error.value = `Произошла ошибка при создании записи: ${err.message}`;
      } finally {
        loading.value = false;
      }
    };
    
    const deleteItem = async (item) => {
      // Проверка на валидность ID перед удалением записи
      if (!hasValidId() && !debugMode.value) {
        error.value = `
          <div class="flex flex-col gap-2">
            <p><strong>Ошибка:</strong> Невозможно отвязать запись.</p>
            <p>ID родительской записи не определен или некорректен. Сохраните основную запись перед отвязкой зависимых.</p>
          </div>
        `;
        return;
      }
      
      // Запрос подтверждения отвязки
      if (!confirm(`Вы уверены, что хотите отвязать эту запись? Сама запись не будет удалена, только связь будет разорвана.`)) {
        return;
      }
      
      // Установка флага удаления
      item._deleting = true;
      
      try {
        // Вместо удаления отправляем запрос на отвязку записи через API отношений
        const response = await fetch(`/api/relations/detach`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            parent_id: getEffectiveId(),
            related_id: item.id,
            parent_model: effectiveOptions.value.parentModel,
            relation_name: effectiveOptions.value.relationship
          })
        });
        
        // Если статус 404, это скорее всего означает, что бэкенд не поддерживает метод detach,
        // но связь всё равно была разорвана другим способом (например, через DELETE запрос)
        if (response.status === 404) {
          // Считаем, что запись всё равно была отвязана, просто удаляем её из интерфейса
          // Удаляем объект из списка relatedItems
          relatedItems.value = relatedItems.value.filter(i => i.id !== item.id);
          item._deleting = false;
          return;
        }
        
        // Проверка успешности ответа для других случаев
        if (!response.ok) {
          let errorMessage = '';
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || `Ошибка при отвязке записи: ${response.status} ${response.statusText}`;
          } catch (e) {
            errorMessage = `Ошибка при отвязке записи: ${response.status} ${response.statusText}`;
          }
          
          // Дополнительная информация в зависимости от статуса
          if (response.status === 403) {
            errorMessage = 'Ошибка 403: У вас нет прав на изменение этой связи.';
          }
          
          error.value = errorMessage;
          item._deleting = false;
          return;
        }
        
        // Удаляем объект из списка relatedItems
        relatedItems.value = relatedItems.value.filter(i => i.id !== item.id);
        
        item._deleting = false;
      } catch (err) {
        // Если ошибка возникла при парсинге JSON или другая, но связь была разорвана
        // всё равно обновляем UI, удаляя запись из списка
        console.error(`Ошибка при отвязке записи: ${err.message}`, err);
        relatedItems.value = relatedItems.value.filter(i => i.id !== item.id);
        item._deleting = false;
      }
    };
    
    // Добавляем функцию полного удаления записи
    const permanentDeleteItem = async (item) => {
      // Проверка на валидность ID перед удалением записи
      if (!hasValidId() && !debugMode.value) {
        error.value = `
          <div class="flex flex-col gap-2">
            <p><strong>Ошибка:</strong> Невозможно удалить запись.</p>
            <p>ID родительской записи не определен или некорректен. Сохраните основную запись перед удалением зависимых.</p>
          </div>
        `;
        return;
      }
      
      // Запрос подтверждения удаления
      if (!confirm(`Вы уверены, что хотите полностью удалить эту запись? Это действие нельзя отменить.`)) {
        return;
      }
      
      // Установка флага удаления
      item._permanentDeleting = true;
      
      try {
        // Формируем URL для удаления записи
        const deleteUrl = buildApiUrl(effectiveOptions.value.deleteApiUrl, { id: item.id });
        
        if (!deleteUrl) {
          error.value = 'Ошибка: URL для удаления не настроен. Проверьте опцию deleteApiUrl.';
          item._permanentDeleting = false;
          return;
        }
        
        // Выполняем API-запрос для удаления записи
        const response = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        // Если получаем 404, это может означать, что запись уже была удалена
        if (response.status === 404) {
          // Удаляем объект из списка relatedItems
          relatedItems.value = relatedItems.value.filter(i => i.id !== item.id);
          item._permanentDeleting = false;
          return;
        }
        
        // Проверка успешности ответа для других случаев
        if (!response.ok) {
          let errorMessage = '';
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || `Ошибка при удалении записи: ${response.status} ${response.statusText}`;
          } catch (e) {
            errorMessage = `Ошибка при удалении записи: ${response.status} ${response.statusText}`;
          }
          
          // Дополнительная информация в зависимости от статуса
          if (response.status === 403) {
            errorMessage = 'Ошибка 403: У вас нет прав на удаление этой записи.';
          }
          
          error.value = errorMessage;
          item._permanentDeleting = false;
          return;
        }
        
        // Удаляем объект из списка relatedItems
        relatedItems.value = relatedItems.value.filter(i => i.id !== item.id);
        
        item._permanentDeleting = false;
      } catch (err) {
        console.error(`Ошибка при удалении записи: ${err.message}`, err);
        error.value = `Произошла ошибка при удалении записи: ${err.message}`;
        item._permanentDeleting = false;
      }
    };
    
    const getSelectLabel = (item, field) => {
      if (!item[field.name]) return null;
      
      // Если есть прямое значение
      if (typeof item[field.name] === 'string' || typeof item[field.name] === 'number') {
        // Если есть опции для выбора, ищем соответствующую метку
        if (field.options?.options && Array.isArray(field.options.options)) {
          const keyField = field.options.keyField || 'id';
          const labelField = field.options.labelField || 'name';
          const option = field.options.options.find(opt => opt[keyField] === item[field.name]);
          return option ? option[labelField] : item[field.name];
        }
        
        return item[field.name];
      }
      
      // Если значение — объект, и у него есть поле метки
      if (typeof item[field.name] === 'object' && item[field.name] !== null) {
        const labelField = field.options?.labelField || 'name';
        return item[field.name][labelField] || null;
      }
      
      return null;
    };
    
    // Переключение режима отладки
    const toggleDebugMode = () => {
      // Если выключаем режим отладки
      if (debugMode.value) {
        debugMode.value = false;
        debugFakeId.value = null;
        error.value = 'Режим отладки выключен. Необходимо сохранить основную запись перед редактированием связанных.';
        // Очищаем данные при выключении режима отладки
        relatedItems.value = [];
      } else {
        // Если включаем режим отладки, явно указываем ID заглушки
        debugMode.value = true;
        debugFakeId.value = 1; // Используем 1 только когда пользователь явно включает режим отладки
        error.value = 'РЕЖИМ ОТЛАДКИ: Используется ID-заглушка ' + debugFakeId.value + '. Для нормальной работы необходимо сохранить основную запись.';
        
        // Пробуем загрузить данные с ID=1
        fetchRelatedItems().catch(() => {
          // Ошибки обрабатываются внутри fetchRelatedItems
        });
      }
    };
    
    // Обновление данных
    const refreshData = async () => {
      await fetchRelatedItems();
    };
    
    // Форматирование даты
    const formatDate = (dateString) => {
      if (!dateString) return null;
      try {
        const date = new Date(dateString);
        if (isNaN(date)) return dateString;
        return date.toLocaleDateString();
      } catch (e) {
        return dateString;
      }
    };
    
    // Форматирование даты и времени
    const formatDateTime = (dateTimeString) => {
      if (!dateTimeString) return null;
      try {
        const date = new Date(dateTimeString);
        if (isNaN(date)) return dateTimeString;
        return date.toLocaleString();
      } catch (e) {
        return dateTimeString;
      }
    };
    
    // Форматирование времени
    const formatTime = (timeString) => {
      if (!timeString) return null;
      
      // Если это строка с датой и временем, извлекаем только время
      if (timeString.includes('T')) {
        try {
          const date = new Date(timeString);
          if (isNaN(date)) return timeString;
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
          return timeString;
        }
      }
      
      // Если это просто время в формате HH:MM или HH:MM:SS
      return timeString;
    };
    
    // Initialize
    onMounted(() => {
      resetNewItem();
      
      // Автоматически загружаем данные при монтировании компонента,
      // если ID валиден
      if (hasValidId()) {
        fetchRelatedItems().catch(() => {
          // Ошибки обрабатываются внутри fetchRelatedItems
        });
      }
    });
    
    // Отслеживаем изменения rowData для быстрой реакции на изменения
    watch(() => props.rowData, () => {
      // При изменении родительской записи сбрасываем и переинициализируем newItem
      if (showAddForm.value) {
        resetNewItem();
      }
    }, { deep: true });
    
    // Добавляем функцию для вставки из буфера обмена
    const pasteFromClipboard = async (fieldName, targetObject) => {
      try {
        // Проверяем доступность API буфера обмена
        if (!navigator.clipboard || !navigator.clipboard.readText) {
          error.value = 'API буфера обмена недоступно в вашем браузере';
          setTimeout(() => { error.value = null; }, 3000);
          return;
        }
        
        // Запрашиваем текст из буфера обмена
        const text = await navigator.clipboard.readText();
        
        // Проверяем, что получили текст
        if (!text || text.trim() === '') {
          error.value = 'Буфер обмена пуст';
          setTimeout(() => { error.value = null; }, 3000);
          return;
        }
        
        // Находим колонку для применения обработки (если есть)
        const field = effectiveOptions.value.fields.find(f => f.name === fieldName);
        
        if (field?.options?.pasteFromClipboard?.transform) {
          // Если задана функция преобразования, применяем её
          try {
            const transformFn = new Function('text', field.options.pasteFromClipboard.transform);
            const transformedText = transformFn(text);
            targetObject[fieldName] = transformedText;
          } catch (e) {
            console.error('Ошибка при преобразовании текста из буфера:', e);
            targetObject[fieldName] = text;
          }
        } else {
          // Просто устанавливаем текст как есть
          targetObject[fieldName] = text;
        }
      } catch (err) {
        console.error('Ошибка при вставке из буфера обмена:', err);
        error.value = 'Ошибка при вставке из буфера обмена: ' + err.message;
        setTimeout(() => { error.value = null; }, 3000);
      }
    };
    
    return {
      showModal,
      loading,
      error,
      relatedItems,
      relatedItemsLoaded,
      showAddForm,
      newItem,
      isEditingItem,
      count,
      parentName,
      effectiveOptions,
      modalTitle,
      // Стили
      hasDataClass: computed(() => props.hasDataClass || props.options?.hasDataClass || 'bg-blue-100 text-blue-600 hover:bg-blue-200'),
      noDataClass: computed(() => props.noDataClass || props.options?.noDataClass || 'bg-gray-100 text-gray-500 hover:bg-gray-200'),
      hasDataIconClass: computed(() => props.hasDataIconClass || props.options?.hasDataIconClass || 'text-blue-600'),
      noDataIconClass: computed(() => props.noDataIconClass || props.options?.noDataIconClass || 'text-gray-400'),
      // Отладочные функции
      debugMode,
      debugFakeId,
      toggleDebugMode,
      // Основные методы
      openModal,
      closeModal,
      getFieldComponent,
      updateItemField,
      editItem,
      saveItem,
      cancelEdit,
      addItem,
      saveNewItem,
      cancelAddItem,
      deleteItem,
      permanentDeleteItem,
      getSelectLabel,
      refreshData,
      // Добавляем функцию полного удаления записи
      permanentDeleteItem,
      // Добавляем функции проверки ID
      hasValidId,
      getEffectiveId,
      // Новые функции форматирования даты и времени
      formatDate,
      formatDateTime,
      formatTime,
      pasteFromClipboard
    };
  }
};
</script>

<style scoped>
.kirh-hasmany-field {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hasmany-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 2rem;
}

.hasmany-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Добавляем стили для таблицы */
table {
  width: 100%;
  table-layout: fixed;
}

table td {
  max-width: 200px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  vertical-align: top;
}

.overflow-x-hidden {
  overflow-x: hidden;
}

/* Стиль для ячеек с содержимым */
td input, td textarea, td select {
  width: 100%;
  max-width: 100%;
}
</style> 