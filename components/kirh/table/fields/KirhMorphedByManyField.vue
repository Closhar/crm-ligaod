<template>
  <div v-if="props.column?.options?.relationField" class="kirh-morphed-by-many-field">
    <!-- Ячейка таблицы с количеством записей -->
    <div 
      :class="{
        'text-xs font-bold h-8 border rounded w-full text-center cursor-pointer transition-colors flex items-center justify-center relative': true,
        'bg-gray-100 text-blue-800 hover:bg-blue-50': count > 0,
        [props.column?.options?.empty_class || 'bg-red-400 hover:bg-red-300 text-gray-50']: count === 0
      }"
      @click="openModal"
      @mouseenter="handleMouseEnter"
      @mouseleave="showTooltip = false"
      :title="''"
    >
      <span>
        {{ count === 0 ? 'нет' : count }}
      </span>
      
      <!-- Всплывающая подсказка -->
      <div 
        v-if="showTooltip && count > 0 && tooltipContent"
        class="absolute z-[9999] px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-xs"
        style="top: 100%; left: 50%; transform: translateX(-50%); margin-top: 10px;"
      >
        <div class="whitespace-normal">{{ tooltipContent }}</div>
        <!-- Стрелка подсказки -->
        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
      </div>
    </div>

    <!-- Модальное окно для управления связями -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <!-- Заголовок модального окна -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ modalTitle }}
            <span v-if="saving" class="ml-2 text-sm text-blue-600">
              (Сохранение...)
            </span>
          </h3>
          <button
            @click.stop="closeModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>

        <!-- Поле поиска -->
        <div class="mb-4 relative">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="`Начните вводить название ${relationLabel}...`"
            class="w-full p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="(event) => { const target = event.target as HTMLInputElement; searchItems(); }"
            @focus="(event) => { showDropdown = true; }"
          />
          
          <!-- Выпадающий список результатов поиска -->
          <div v-if="showDropdown && filteredItems.length > 0" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
            <div
              v-for="item in filteredItems"
              :key="item.id"
              class="p-2 hover:bg-gray-100 cursor-pointer text-sm"
              @click="addItem(item)"
            >
              {{ getItemTitle(item) }}
            </div>
          </div>
        </div>

        <!-- Список выбранных элементов -->
        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">
            Выбранные {{ relationLabel }}:
          </h4>
          <div class="space-y-2 max-h-40 overflow-y-auto">
            <div v-for="itemId in selectedItems" :key="itemId" class="flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-200">
              <span class="text-sm text-gray-700">
                {{ getSelectedItemTitle(itemId) }}
              </span>
              <button
                @click.stop="removeItem(itemId)"
                class="text-red-500 hover:text-red-700 text-sm"
              >
                <Icon name="heroicons:x-mark" class="w-4 h-4" />
              </button>
            </div>
            <div v-if="selectedItems.length === 0" class="text-sm text-gray-500 text-center py-2">
              {{ relationLabel }} не выбраны
            </div>
          </div>
        </div>

        <!-- Кнопки управления -->
        <div class="flex gap-3 justify-end">
          <button
            @click.stop="closeModal"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-gray-400 text-center p-1">
    -
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';

interface Props {
  value?: any;
  row: any;
  column: any;
  apiUrl: string;
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined
});

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>();

// Состояние компонента
const showModal = ref(false);
const searchQuery = ref('');
const showDropdown = ref(false);
const saving = ref(false);
const selectedItems = ref<number[]>([]);
const availableItems = ref<any[]>([]);
const filteredItems = ref<any[]>([]);
const showTooltip = ref(false);
const tooltipContent = ref('');

// Вычисляемые свойства
const count = computed(() => {
  if (!props.column?.options?.relationField) return 0;
  const countField = `${props.column.options.relationField}_count`;
  return props.row[countField] || 0;
});

const relationField = computed(() => props.column?.options?.relationField || '');
const relationLabel = computed(() => props.column?.options?.relationLabel || 'элементов');
const modalTitle = computed(() => {
  const mainField = props.column?.options?.mainField || 'title';
  const title = props.row[mainField] || props.row.title || 'элемент';
  return `Управление ${relationLabel.value} для "${title}"`;
});

// Генерация содержимого подсказки
const generateTooltipContent = () => {
  if (!props.row[relationField.value] || props.row[relationField.value].length === 0) {
    return '';
  }
  
  const tooltipField = props.column?.options?.tooltipField || 'title';
  const searchField = props.column?.options?.searchField || 'title';
  const titleField = props.column?.options?.titleField || 'title';
  
  return props.row[relationField.value]
    .map((item: any) => {
      // Сначала ищем в availableItems
      let element = availableItems.value.find(i => i.id === item.id);
      
      // Если не найдено в availableItems, используем данные из строки
      if (!element) {
        element = item;
      }
      
      // Пытаемся получить значение из tooltipField
      let displayValue = element[tooltipField];
      
      // Если tooltipField не найден, пробуем другие поля
      if (!displayValue) {
        displayValue = element[searchField] || element[titleField] || element.title || element.name;
      }
      
      // Если все еще нет значения, возвращаем fallback
      return displayValue || `Элемент #${element.id}`;
    })
    .join(', ');
};

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

// Загрузка доступных элементов
const loadAvailableItems = async () => {
  try {
    const searchEndpoint = props.column?.options?.searchEndpoint;
    if (!searchEndpoint) {
      return;
    }

    const response = await fetch(searchEndpoint);
    if (response.ok) {
      const data = await response.json();
      const newItems = Array.isArray(data) ? data : (data.data || []);
      
      // Объединяем новые элементы с уже существующими, избегая дублирования
      newItems.forEach((newItem: any) => {
        if (!availableItems.value.find(existingItem => existingItem.id === newItem.id)) {
          availableItems.value.push(newItem);
        }
      });
      
      filteredItems.value = availableItems.value.slice(0, 10);
      
      // Обновляем подсказку после загрузки доступных элементов
      tooltipContent.value = generateTooltipContent();
    } else {
      console.error('Ошибка загрузки элементов:', response.status, response.statusText);
    }
  } catch (err) {
    console.error('Ошибка загрузки элементов:', err);
  }
};

// Загрузка текущих связей
const loadCurrentRelations = async () => {
  try {
    if (!relationField.value) {
      return;
    }
    
    if (props.value && Array.isArray(props.value)) {
      selectedItems.value = props.value;
      return;
    }
    
    // Проверяем, есть ли уже данные, но проверяем, содержат ли они нужные поля
    if (props.row[relationField.value] && Array.isArray(props.row[relationField.value])) {
      const existingData = props.row[relationField.value];
      const tooltipField = props.column?.options?.tooltipField || 'title';
      
      // Проверяем, есть ли в данных нужное поле
      const hasRequiredField = existingData.some((item: any) => item[tooltipField]);
      
      if (hasRequiredField) {
        selectedItems.value = existingData.map((item: any) => item.id);
        return;
      }
    }
    
    const countField = `${relationField.value}_count`;
    
    if (props.row[countField] && props.row[countField] > 0) {
      const urlParts = props.apiUrl.split('/');
      let modelType = urlParts[urlParts.length - 1];
      if (modelType.endsWith('s')) {
        modelType = modelType.slice(0, -1);
      }
      
      const baseUrl = props.apiUrl.replace('/api/' + urlParts[urlParts.length - 1], '');
      
      const response = await fetch(`${baseUrl}/api/relations/get?model_type=${modelType}&model_id=${props.row.id}&relation_name=${relationField.value}`);
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          const relations = data.data;
          
          selectedItems.value = relations.map((item: any) => item.id);
          
          // Всегда загружаем полные данные из правильного API
          const searchEndpoint = props.column?.options?.searchEndpoint;
          
          if (searchEndpoint && relations.length > 0) {
            try {
              // Загружаем все данные или используем поиск по конкретным ID
              const relationIds = relations.map((item: any) => item.id);
              const searchUrl = `${searchEndpoint}?per_page=1000`; // Загружаем больше данных
              
              const competitionsResponse = await fetch(searchUrl);
              if (competitionsResponse.ok) {
                const competitionsData = await competitionsResponse.json();
                const competitions = Array.isArray(competitionsData) ? competitionsData : (competitionsData.data || []);
                
                // Создаем маппинг ID -> полные данные
                const competitionsMap = new Map();
                competitions.forEach((comp: any) => {
                  competitionsMap.set(comp.id, comp);
                });
                
                // Обновляем данные в строке с полной информацией
                const fullRelations = relations.map((item: any) => {
                  const fullData = competitionsMap.get(item.id);
                  return fullData || item;
                });
                
                props.row[relationField.value] = fullRelations;
                
                // Добавляем элементы в availableItems
                fullRelations.forEach((item: any) => {
                  if (!availableItems.value.find(i => i.id === item.id)) {
                    availableItems.value.push(item);
                  }
                });
              }
            } catch (err) {
              console.error('Ошибка загрузки полных данных:', err);
              // Если не удалось загрузить полные данные, используем базовые
              props.row[relationField.value] = relations;
              relations.forEach((item: any) => {
                if (!availableItems.value.find(i => i.id === item.id)) {
                  availableItems.value.push(item);
                }
              });
            }
          } else {
            // Если нет searchEndpoint, используем базовые данные
            props.row[relationField.value] = relations;
            relations.forEach((item: any) => {
              if (!availableItems.value.find(i => i.id === item.id)) {
                availableItems.value.push(item);
              }
            });
          }
          
          // Обновляем подсказку после загрузки связей
          tooltipContent.value = generateTooltipContent();
        }
      } else {
        console.error('Ошибка загрузки с сервера:', response.status, response.statusText);
      }
    } else {
      selectedItems.value = [];
    }
  } catch (err) {
    console.error('Ошибка загрузки связей:', err);
  }
};

// Поиск элементов
const searchItems = debounce(async () => {
  const query = searchQuery.value.toLowerCase().trim();
  const minSearchLength = props.column?.options?.minSearchLength || 2;
  
  if (query.length >= minSearchLength) {
    try {
      const searchEndpoint = props.column?.options?.searchEndpoint;
      const searchParam = props.column?.options?.searchParam || 'q';
      
      if (!searchEndpoint) {
        return;
      }
      
      const searchUrl = `${searchEndpoint}?${searchParam}=${encodeURIComponent(query)}`;
      
      const response = await fetch(searchUrl);
      
      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : (data.data || []);
        
        filteredItems.value = items.filter((item: any) => 
          !selectedItems.value.includes(item.id)
        );
      } else {
        console.error('Ошибка поиска:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Ошибка поиска элементов:', err);
    }
  } else {
    filteredItems.value = availableItems.value.filter(item => 
      !selectedItems.value.includes(item.id)
    ).slice(0, 10);
  }
}, 300);

// Добавление элемента
const addItem = async (item: any) => {
  if (!selectedItems.value.includes(item.id)) {
    selectedItems.value.push(item.id);
    
    // Добавляем элемент в availableItems, если его там нет
    if (!availableItems.value.find(i => i.id === item.id)) {
      availableItems.value.push(item);
    }
    
    // Обновляем данные в строке сразу после добавления
    const countField = `${relationField.value}_count`;
    props.row[countField] = selectedItems.value.length;
    
    // Обновляем связанные данные в строке, сохраняя все существующие элементы
    const relatedItems = selectedItems.value.map(itemId => {
      // Сначала ищем в availableItems
      let element = availableItems.value.find(i => i.id === itemId);
      
      // Если не найдено в availableItems, ищем в данных строки
      if (!element && props.row[relationField.value]) {
        element = props.row[relationField.value].find((r: any) => r.id === itemId);
      }
      
      // Если все еще не найдено, создаем базовый объект
      if (!element) {
        element = { id: itemId };
      }
      
      return element;
    });
    
    props.row[relationField.value] = relatedItems;
    
    emit('update:modelValue', selectedItems.value);
    
    // Обновляем подсказку сразу после добавления
    tooltipContent.value = generateTooltipContent();
    
    await saveRelations();
  }
  searchQuery.value = '';
  showDropdown.value = false;
  searchItems();
};

// Удаление элемента
const removeItem = async (itemId: number) => {
  const index = selectedItems.value.indexOf(itemId);
  if (index > -1) {
    selectedItems.value.splice(index, 1);
    
    // Обновляем данные в строке сразу после удаления
    const countField = `${relationField.value}_count`;
    props.row[countField] = selectedItems.value.length;
    
    // Обновляем связанные данные в строке, сохраняя все существующие элементы
    const relatedItems = selectedItems.value.map(id => {
      // Сначала ищем в availableItems
      let element = availableItems.value.find(i => i.id === id);
      
      // Если не найдено в availableItems, ищем в данных строки
      if (!element && props.row[relationField.value]) {
        element = props.row[relationField.value].find((r: any) => r.id === id);
      }
      
      // Если все еще не найдено, создаем базовый объект
      if (!element) {
        element = { id };
      }
      
      return element;
    });
    
    props.row[relationField.value] = relatedItems;
    
    emit('update:modelValue', selectedItems.value);
    
    // Обновляем подсказку сразу после удаления
    tooltipContent.value = generateTooltipContent();
    
    await saveRelations();
  }
};

// Сохранение связей
const saveRelations = async () => {
  try {
    if (!relationField.value) {
      return;
    }
    
    saving.value = true;
    
    const urlParts = props.apiUrl.split('/');
    let modelType = urlParts[urlParts.length - 1];
    
    if (modelType.endsWith('s')) {
      modelType = modelType.slice(0, -1);
    }
    
    const baseUrl = props.apiUrl.replace('/api/' + urlParts[urlParts.length - 1], '');
    
    const requestData = {
      model_type: modelType,
      model_id: props.row.id,
      relation_name: relationField.value,
      related_ids: selectedItems.value
    };
    
    const response = await fetch(`${baseUrl}/api/relations/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Ошибка сервера:', errorData);
      
      if (errorData.errors) {
        const validationErrors = Object.entries(errorData.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        throw new Error(`Ошибка валидации: ${validationErrors}`);
      }
      
      throw new Error(errorData.message || 'Ошибка сохранения связей');
    }
    
    const result = await response.json();
    
    if (result.success) {
      // Данные уже обновлены в addItem/removeItem, здесь только эмитим
      emit('update:modelValue', selectedItems.value);
    } else {
      throw new Error(result.message || 'Ошибка сохранения связей');
    }
  } catch (err) {
    console.error('Ошибка сохранения связей:', err);
    const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
    alert('Ошибка сохранения связей: ' + errorMessage);
  } finally {
    saving.value = false;
  }
};

// Получение названия элемента
const getItemTitle = (item: any) => {
  const tooltipField = props.column?.options?.tooltipField || 'title';
  const searchField = props.column?.options?.searchField || 'title';
  const titleField = props.column?.options?.titleField || 'title';
  
  return item[tooltipField] || item[searchField] || item[titleField] || item.title || item.name || `Элемент #${item.id}`;
};

// Получение названия выбранного элемента
const getSelectedItemTitle = (itemId: number) => {
  // Сначала ищем в availableItems (основной источник данных)
  const item = availableItems.value.find(i => i.id === itemId);
  if (item) {
    return getItemTitle(item);
  }
  
  // Если не найдено в availableItems, ищем в данных строки
  if (relationField.value) {
    const relations = props.row[relationField.value] || [];
    const relationItem = relations.find((r: any) => r.id === itemId);
    if (relationItem) {
      return getItemTitle(relationItem);
    }
  }
  
  // Если все еще не найдено, попробуем загрузить данные элемента
  // Это может произойти, если элемент был удален из availableItems
  const tooltipField = props.column?.options?.tooltipField || 'title';
  const searchField = props.column?.options?.searchField || 'title';
  
  // Возвращаем ID как fallback
  return `Элемент #${itemId}`;
};

// Открытие модального окна
const openModal = async () => {
  showModal.value = true;
  await loadAvailableItems();
  await loadCurrentRelations();
  
  // Обновляем тултип после загрузки всех данных
  tooltipContent.value = generateTooltipContent();
  
  document.addEventListener('click', handleClickOutside);
};

// Закрытие модального окна
const closeModal = () => {
  showModal.value = false;
  searchQuery.value = '';
  showDropdown.value = false;
  document.removeEventListener('click', handleClickOutside);
};

// Обработчик клика вне модального окна
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  const modal = target.closest('.bg-white.rounded-lg');
  const fieldContainer = target.closest('.kirh-morphed-by-many-field');
  
  // Закрываем только если клик был вне модального окна и вне поля
  if (!modal && !fieldContainer) {
    closeModal();
  }
};

// Обработчик клика вне выпадающего списка
const handleDropdownClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  const searchContainer = target.closest('.relative');
  const dropdown = target.closest('.absolute.z-10');
  
  // Скрываем dropdown только если клик был вне контейнера поиска и вне dropdown
  if (!searchContainer && !dropdown) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleDropdownClickOutside);
  
  // Загружаем правильные данные при инициализации
  if (relationField.value && props.row[`${relationField.value}_count`] > 0) {
    loadCurrentRelations();
  }
});

// Следим за изменениями в поиске
watch(searchQuery, (newValue, oldValue) => {
  const minSearchLength = props.column?.options?.minSearchLength || 2;
  if (newValue.length >= minSearchLength) {
    showDropdown.value = true;
  } else {
    showDropdown.value = false;
  }
});

// Следим за изменениями props.value
watch(() => props.value, (newValue) => {
  if (newValue && Array.isArray(newValue)) {
    selectedItems.value = newValue;
  }
  // Обновляем подсказку
  tooltipContent.value = generateTooltipContent();
}, { immediate: true });

// Следим за изменениями в строке данных
watch(() => props.row, () => {
  // Обновляем подсказку при изменении данных строки
  tooltipContent.value = generateTooltipContent();
}, { deep: true });

// Обработчик мыши
const handleMouseEnter = (event: MouseEvent) => {
  showTooltip.value = true;
};
</script>

<style scoped>
.kirh-morphed-by-many-field {
  position: relative;
}
</style> 