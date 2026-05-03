<template>
  <div v-if="props.column?.options?.relationField" class="kirh-belongs-to-many-field">
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
      <div class="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
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

        <!-- Быстрое создание нового элемента -->
        <div
          v-if="canCreateItem"
          class="mb-4 rounded-xl border border-orange-200 bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white shadow-sm"
        >
          <div class="flex flex-col gap-3 md:flex-row md:items-end">
            <div class="flex-1">
              <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-orange-300">
                Новая метка
              </label>
              <input
                v-model="newItemTitle"
                type="text"
                class="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-orange-300 focus:bg-white/15"
                :placeholder="createPlaceholder"
                @keyup.enter.stop="createItem"
              >
              <p v-if="createError" class="mt-2 text-xs text-red-200">{{ createError }}</p>
            </div>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="creatingItem || !newItemTitle.trim()"
              @click.stop="createItem"
            >
              <Icon name="mdi:tag-plus-outline" class="h-4 w-4" />
              {{ creatingItem ? 'Создание...' : createButtonLabel }}
            </button>
          </div>
        </div>

        <!-- Список всех доступных элементов с чекбоксами -->
        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">
            Все доступные {{ relationLabel }}:
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
            <div 
              v-for="item in allAvailableItems" 
              :key="item.id" 
              class="flex items-center p-2 rounded border hover:bg-gray-50 transition-colors cursor-pointer"
              :class="{
                'border-blue-200 bg-blue-50': selectedItems.includes(item.id),
                'border-gray-200': !selectedItems.includes(item.id)
              }"
              @mousedown.prevent.stop="toggleItem(item)"
            >
              <div class="flex items-center w-full">
                <div class="flex-shrink-0 mr-3">
                  <div 
                    :class="{
                      'w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center': true,
                      'bg-blue-500 border-blue-500 shadow-sm': selectedItems.includes(item.id),
                      'border-gray-300 hover:border-blue-400': !selectedItems.includes(item.id)
                    }"
                  >
                    <Icon 
                      v-if="selectedItems.includes(item.id)"
                      name="heroicons:check" 
                      class="w-3 h-3 text-white" 
                    />
                  </div>
                </div>
                <span class="text-sm text-gray-700 flex-1">{{ getItemTitle(item) }}</span>
              </div>
            </div>
          </div>
          
          <div v-if="allAvailableItems.length === 0" class="text-sm text-gray-500 text-center py-4">
            Нет доступных {{ relationLabel }}
          </div>
        </div>

        <!-- Статистика выбора -->
        <div class="mb-4 p-3 bg-gray-50 rounded-lg">
          <div class="text-sm text-gray-600">
            Выбрано: <span class="font-medium text-blue-600">{{ selectedItems.length }}</span> из <span class="font-medium">{{ allAvailableItems.length }}</span> {{ relationLabel }}
          </div>
        </div>

        <!-- Кнопки управления -->
        <div class="flex gap-3 justify-end">
          <button
            @click.stop="selectAll"
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
          >
            Выбрать все
          </button>
          <button
            @click.stop="deselectAll"
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
          >
            Снять выбор
          </button>
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

const props = defineProps<Props & {
  value?: any
}>();

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>();

// Состояние компонента
const showModal = ref(false);
const saving = ref(false);
const selectedItems = ref<number[]>([]);
const allAvailableItems = ref<any[]>([]);
const showTooltip = ref(false);
const tooltipContent = ref('');
const newItemTitle = ref('');
const creatingItem = ref(false);
const createError = ref('');

// Вычисляемые свойства
const count = computed(() => {
  if (!props.column?.options?.relationField) return 0;
  const countField = `${props.column.options.relationField}_count`;
  return props.row[countField] || 0;
});

const relationField = computed(() => props.column?.options?.relationField || '');
const relationLabel = computed(() => props.column?.options?.relationLabel || 'элементов');
const canCreateItem = computed(() => Boolean(props.column?.options?.createEndpoint));
const createButtonLabel = computed(() => props.column?.options?.createButtonLabel || 'Создать и добавить');
const createPlaceholder = computed(() => props.column?.options?.createPlaceholder || 'Название метки');
const modalTitle = computed(() => {
  const mainField = props.column?.options?.mainField || 'title';
  let title = props.row[mainField] || props.row.title || 'элемент';
  
  // Если title является объектом, попробуем получить строковое представление
  if (typeof title === 'object' && title !== null) {
    if (title.title) {
      title = title.title;
    } else if (title.name) {
      title = title.name;
    } else if (title.id) {
      title = `Элемент #${title.id}`;
    } else {
      title = 'элемент';
    }
  }
  
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
      // Сначала ищем в allAvailableItems
      let element = allAvailableItems.value.find(i => i.id === item.id);
      
      // Если не найдено в allAvailableItems, используем данные из строки
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

// Загрузка всех доступных элементов
const loadAllAvailableItems = async () => {
  try {
    const searchEndpoint = props.column?.options?.searchEndpoint;
    if (!searchEndpoint) {
      return;
    }

    const response = await fetch(`${searchEndpoint}?per_page=1000`);
    if (response.ok) {
      const data = await response.json();
      const items = Array.isArray(data) ? data : (data.data || []);
      
      allAvailableItems.value = items;
      
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
    
    // Проверяем, есть ли уже данные в строке
    if (props.row[relationField.value] && Array.isArray(props.row[relationField.value])) {
      const existingData = props.row[relationField.value];
      selectedItems.value = existingData.map((item: any) => item.id);
      return;
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
          
          // Обновляем данные в строке
          props.row[relationField.value] = relations;
          
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

// Переключение элемента
const toggleItem = async (item: any) => {
  const index = selectedItems.value.indexOf(item.id);
  
  if (index > -1) {
    selectedItems.value.splice(index, 1);
  } else {
    selectedItems.value.push(item.id);
  }
  
  // Обновляем данные в строке
  const countField = `${relationField.value}_count`;
  props.row[countField] = selectedItems.value.length;
  
  // Обновляем связанные данные в строке
  const relatedItems = selectedItems.value.map(itemId => {
    const element = allAvailableItems.value.find(i => i.id === itemId);
    return element || { id: itemId };
  });
  
  props.row[relationField.value] = relatedItems;
  
  emit('update:modelValue', selectedItems.value);
  
  // Обновляем подсказку
  tooltipContent.value = generateTooltipContent();
  
  // Сохраняем изменения
  await saveRelations();
};

// Выбрать все
const selectAll = async () => {
  selectedItems.value = allAvailableItems.value.map(item => item.id);
  await updateRowData();
  await saveRelations();
};

// Снять выбор со всех
const deselectAll = async () => {
  selectedItems.value = [];
  await updateRowData();
  await saveRelations();
};

const createItem = async () => {
  const endpoint = props.column?.options?.createEndpoint;
  const title = newItemTitle.value.trim();

  if (!endpoint || !title) {
    return;
  }

  try {
    creatingItem.value = true;
    createError.value = '';

    const titleField = props.column?.options?.titleField || 'title';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      body: JSON.stringify({ [titleField]: title, title }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || 'Не удалось создать метку');
    }

    const createdItem = data?.data || data;

    if (!createdItem?.id) {
      throw new Error('Сервер не вернул созданную метку');
    }

    if (!allAvailableItems.value.some(item => item.id === createdItem.id)) {
      allAvailableItems.value.unshift(createdItem);
    }

    newItemTitle.value = '';

    if (!selectedItems.value.includes(createdItem.id)) {
      await toggleItem(createdItem);
    }
  } catch (err) {
    createError.value = err instanceof Error ? err.message : 'Ошибка создания метки';
  } finally {
    creatingItem.value = false;
  }
};

// Обновление данных в строке
const updateRowData = async () => {
  const countField = `${relationField.value}_count`;
  props.row[countField] = selectedItems.value.length;
  
  const relatedItems = selectedItems.value.map(itemId => {
    const element = allAvailableItems.value.find(i => i.id === itemId);
    return element || { id: itemId };
  });
  
  props.row[relationField.value] = relatedItems;
  
  emit('update:modelValue', selectedItems.value);
  
  tooltipContent.value = generateTooltipContent();
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
  if (!item) return 'Неизвестный элемент';
  
  const tooltipField = props.column?.options?.tooltipField || 'title';
  const searchField = props.column?.options?.searchField || 'title';
  const titleField = props.column?.options?.titleField || 'title';
  
  // Пытаемся получить значение из разных полей
  let title = item[tooltipField] || item[searchField] || item[titleField] || item.title || item.name;
  
  // Если title является объектом, попробуем получить строковое представление
  if (typeof title === 'object' && title !== null) {
    if (title.title) {
      title = title.title;
    } else if (title.name) {
      title = title.name;
    } else if (title.id) {
      title = `Элемент #${title.id}`;
    } else {
      title = `Элемент #${item.id}`;
    }
  }
  
  // Если все еще нет строкового значения, возвращаем fallback
  return title || `Элемент #${item.id}`;
};

// Открытие модального окна
const openModal = async () => {
  showModal.value = true;
  await loadAllAvailableItems();
  await loadCurrentRelations();
  
  // Обновляем тултип после загрузки всех данных
  tooltipContent.value = generateTooltipContent();
  
  document.addEventListener('click', handleClickOutside);
};

// Закрытие модального окна
const closeModal = () => {
  showModal.value = false;
  createError.value = '';
  newItemTitle.value = '';
  document.removeEventListener('click', handleClickOutside);
};

// Обработчик клика вне модального окна
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  const modal = target.closest('.bg-white.rounded-lg');
  const fieldContainer = target.closest('.kirh-belongs-to-many-field');
  
  // Закрываем только если клик был вне модального окна и вне поля
  if (!modal && !fieldContainer) {
    closeModal();
  }
};

onMounted(() => {
  // Загружаем правильные данные при инициализации
  if (relationField.value && props.row[`${relationField.value}_count`] > 0) {
    loadCurrentRelations();
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
.kirh-belongs-to-many-field {
  position: relative;
}

/* Стили для чекбоксов */
input[type="checkbox"]:checked + div {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* Анимация для чекбоксов */
.w-5.h-5 {
  transition: all 0.2s ease-in-out;
}

.w-5.h-5:hover {
  transform: scale(1.05);
}
</style>
