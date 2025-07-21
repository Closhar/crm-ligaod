<template>
  <div ref="selectContainer" class="custom-select">
    <!-- Поле для отображения выбранного значения -->
    <div 
      class="selected-option" 
      :class="[sel_class, {'opacity-50 cursor-not-allowed': disabled}]" 
      @click="toggleDropdown()"
    >
      <div class="flex items-center space-x-2 text-sm">
        <!-- Изображение или иконка выбранной опции -->
        <img
            v-if="selectedOption?.[props.imageField]"
            :src="selectedOption[props.imageField]"
            alt=""
            :class="props.options?.img_size || 'w-6 h-6 rounded'"
        />
        <Icon
            v-else-if="selectedOption?.[props.iconField]"
            :icon="selectedOption[props.iconField]"
            class="w-6 h-6"
        />
        <span>{{ getDisplayValue }}</span>
      </div>
      <!-- Стрелочка вниз -->
      <Icon
          :class="[{ 'rotate-180': isOpen }, disabled ? 'text-gray-300' : 'text-gray-500']"
          class="w-6 h-6 ml-2 transition-transform"
          icon="ic:round-arrow-drop-down"
      />
    </div>

    <!-- Выпадающий список -->
    <div v-if="isOpen && !disabled" :class="options_list" class="options-list">
      <!-- Поле поиска (если enableSearch=true) -->
      <input
          v-if="enableSearch"
          v-model="searchQuery"
          class="search-input"
          placeholder="Поиск..."
          type="text"
          @input="handleSearch"
      />

      <!-- Список опций -->
      <div v-if="isLoading" class="option">Загрузка...</div>
      <div v-else-if="filteredOptions.length === 0" class="option">Нет данных</div>
      <div
          v-for="option in filteredOptions"
          v-else
          :key="option[props.keyField]"
          :class="list_item"
          class="option"
          @click="selectOption(option)"
      >
        <div class="flex items-center space-x-2 text-xs">
          <!-- Изображение или иконка опции -->
          <img
              v-if="option[props.imageField]"
              :src="option[props.imageField]"
              alt=""
              :class="props.options?.img_size || 'w-6 h-6'"
          />
          <Icon
              v-else-if="option[props.iconField]"
              :icon="option[props.iconField]"
              class="w-6 h-6"
          />
          <span>{{ getNestedValue(option, props.labelField) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * KirhSelectField - компонент селекта с возможностью асинхронной загрузки данных
 * @version 1.2 - исправлен вывод пустого объекта в поле выбора
 */
import { useRuntimeConfig } from '#app';
import { Icon } from '@iconify/vue';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps({
  options: {
    type: [Array, Object],
    default: () => [],
  },
  modelValue: {
    type: [Object, String, Number, Boolean],
    default: null,
  },
  placeholder: {
    type: String,
    default: 'Выберите значение',
  },
  enableSearch: {
    type: Boolean,
    default: false,
  },
  apiUrl: {
    type: String,
    default: '',
  },
  apiParams: {
    type: Object,
    default: () => ({}),
  },
  keyField: {
    type: String,
    default: 'id',
  },
  labelField: {
    type: String,
    default: 'title',
  },
  iconField: {
    type: String,
    default: '',
  },
  imageField: {
    type: String,
    default: '',
  },
  limit: {
    type: Number,
    default: 5,
  },
  defaultValue: {
    type: [Object, String, Number],
    default: null,
  },
  sel_class: {
    type: String,
    default: 'text-gray-900'
  },
  options_list: {
    type: String,
    default: 'option-list-default'
  },
  list_item: {
    type: String,
    default: 'option'
  },
  emptyOption: {
    type: Object,
    default: () => ({
      value: null,
      label: 'Не выбрано',
      icon: '',
      image: '',
    }),
  },
  emptyable: {
    type: Boolean,
    default: true,
  },
  label: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  field: {
    type: String,
    default: '',
  }
});

const emit = defineEmits(['update:modelValue']);

// Реактивные переменные
const isOpen = ref(false);
const searchQuery = ref('');
const selectContainer = ref(null);
const apiOptions = ref([]);
const isLoading = ref(false);
const selectedOption = ref(props.emptyOption);

// Вспомогательная функция для получения вложенных значений
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// Добавляем вычисляемое свойство для отображения опций
const filteredOptions = computed(() => {
  let options = [];

  // Безопасно проверяем props.options
  if (Array.isArray(props.options) && props.options.length > 0) {
    options = [...props.options];
  } else {
    options = [...apiOptions.value];
  }

  // Добавляем пустую опцию только если emptyable=true и её нет в списке
  if (props.emptyable && props.emptyOption && !options.some(opt => opt[props.keyField] === props.emptyOption.value)) {
    options.unshift({
      [props.keyField]: props.emptyOption.value,
      [props.labelField]: props.emptyOption.label,
      [props.iconField]: props.emptyOption.icon,
    });
  }

  // Фильтрация по поисковому запросу
  if (searchQuery.value && props.enableSearch) {
    const query = searchQuery.value.toLowerCase();
    return options.filter(option =>
        String(getNestedValue(option, props.labelField)).toLowerCase().includes(query)
    );
  }

  return options;
});

// Добавляем вычисляемое свойство для отображения значения
const getDisplayValue = computed(() => {
  if (!selectedOption.value) {
    return props.placeholder;
  }

  // Сначала пытаемся получить значение из selectedOption (данные из API)
  const value = getNestedValue(selectedOption.value, props.labelField);
  if (value) {
    return value;
  }

  // Если значение не найдено, пробуем получить title_short
  if (selectedOption.value.title_short) {
    return selectedOption.value.title_short;
  }

  // Если значение не найдено, возвращаем placeholder
  return props.placeholder || props.label;
});

// Инициализация значения по умолчанию
const initializeDefaultValue = () => {
  // Безопасно получаем массив опций
  const optionsArray = Array.isArray(props.options) ? props.options : [];
  const apiOptionsArray = Array.isArray(apiOptions.value) ? apiOptions.value : [];
  const allOptions = [...optionsArray, ...apiOptionsArray];
  
  // Если есть modelValue, используем его
  if (props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== '') {
    const defaultOption = allOptions.find(
        option => option[props.keyField] == props.modelValue // Используем нестрогое сравнение
    );

    if (defaultOption) {
      selectedOption.value = defaultOption;
      return;
    }
  }
  
  // Если есть defaultValue и нет modelValue, используем defaultValue
  if (props.defaultValue !== null && props.defaultValue !== undefined && props.defaultValue !== '') {
    const defaultOption = allOptions.find(
        option => option[props.keyField] == props.defaultValue // Используем нестрогое сравнение
    );

    if (defaultOption) {
      selectedOption.value = defaultOption;
      emit('update:modelValue', props.defaultValue);
    }
  }
};

// Обработка выбора опции
const selectOption = (option) => {
  // Если селект отключен, не обрабатываем выбор
  if (props.disabled) return;

  const selectedValue = option[props.keyField];
  emit('update:modelValue', selectedValue);
  
  // Создаем новый объект с нужными полями
  const newSelectedOption = {
    [props.keyField]: option[props.keyField],
    [props.labelField]: option[props.labelField],
    title: option.title,
    title_short: option.title_short,
    icon: option.icon,
    image: option.image
  };
  
  selectedOption.value = newSelectedOption;
  
  isOpen.value = false;
  searchQuery.value = '';
};

// Обработка клика вне компонента
const handleClickOutside = (event) => {
  if (selectContainer.value && !selectContainer.value.contains(event.target)) {
    isOpen.value = false;
  }
};

// Асинхронный поиск через API
const fetchOptions = async (query = '') => {
  if (!props.apiUrl || props.disabled) return;

  isLoading.value = true;
  try {
    // Получаем конфигурацию API
    const config = useRuntimeConfig();
    const api = config.public.API_URL;
    
    // Формируем полный URL
    let apiUrl;
    if (props.apiUrl.startsWith('http')) {
      // Если это полный URL, используем как есть
      apiUrl = props.apiUrl;
    } else if (props.apiUrl.startsWith('/')) {
      // Если начинается с /, добавляем к базовому URL
      apiUrl = `${api}${props.apiUrl}`;
    } else {
      // Иначе добавляем /api/ к базовому URL
      apiUrl = `${api}/api/${props.apiUrl}`;
    }
    
    // Используем $fetch для правильной работы с API
    const params = { ...props.apiParams, q: query, limit: props.limit };
    
    // Удаляем пустые параметры
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === null || params[key] === '') {
        delete params[key];
      }
    });

    const data = await $fetch(apiUrl, {
      method: 'GET',
      params: params
    });

    // Проверяем, что данные в правильном формате
    let optionsData = data;
    
    // Если API возвращает объект с полем data, извлекаем массив
    if (data && typeof data === 'object' && data.data && Array.isArray(data.data)) {
      optionsData = data.data;
    } else if (!Array.isArray(data)) {
      apiOptions.value = [];
      return;
    }

    // Проверяем, что у всех элементов есть нужные поля
    const validData = optionsData.filter(item => {
      const hasRequiredFields = item[props.keyField] !== undefined && item[props.labelField] !== undefined;
      return hasRequiredFields;
    });

    apiOptions.value = validData;

    // После загрузки данных инициализируем значение по умолчанию
    initializeDefaultValue();
  } catch (error) {
    apiOptions.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Обработка ввода в поле поиска
const handleSearch = () => {
  if (props.apiUrl && props.enableSearch && !props.disabled) {
    fetchOptions(searchQuery.value);
  }
};

// Инициализация при монтировании компонента
onMounted(() => {
  document.addEventListener('click', handleClickOutside);

  // Если есть статические опции - инициализируем сразу
  if (Array.isArray(props.options) && props.options.length > 0) {
    initializeDefaultValue();
  }
  // Если есть API URL - загружаем данные
  else if (props.apiUrl && !props.disabled) {
    fetchOptions().then(() => {
      initializeDefaultValue();
    });
  }
});

// Очистка при размонтировании компонента
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Следим за изменением modelValue
watch(
    () => props.modelValue,
    (newValue) => {
      if (newValue || newValue === 0) {
        // Получаем реальные значения из Proxy
        const optionsArray = Array.isArray(props.options) ? props.options : [];
        const apiOptionsArray = Array.isArray(apiOptions.value) ? apiOptions.value : [];
        const allOptions = [...optionsArray, ...apiOptionsArray];
        
        // Ищем опцию, учитывая возможные типы данных
        const foundOption = allOptions.find(
            option => {
              const optionId = option[props.keyField];
              return optionId == newValue; // Используем нестрогое сравнение
            }
        );
        
        if (foundOption) {
          // Создаем новый объект с нужными полями
          const newSelectedOption = {
            [props.keyField]: foundOption[props.keyField],
            [props.labelField]: foundOption[props.labelField],
            title: foundOption.title,
            title_short: foundOption.title_short,
            icon: foundOption.icon,
            image: foundOption.image
          };
          selectedOption.value = newSelectedOption;
        } else if (props.emptyable) {
          selectedOption.value = props.emptyOption;
        }
      } else if (props.emptyable) {
        selectedOption.value = props.emptyOption;
      }
    },
    {immediate: true}
);

// Следим за изменением options
watch(
    () => props.options,
    () => {
      initializeDefaultValue();
    },
    {deep: true}
);

// Переключение выпадающего списка
const toggleDropdown = () => {
  if (props.disabled) return;
  
  isOpen.value = !isOpen.value;
  if (isOpen.value && props.apiUrl) {
    fetchOptions();
  }
};

// Добавим наблюдатель за изменением disabled
watch(
    () => props.disabled,
    (newValue) => {
      // Если компонент становится disabled, закрываем выпадающий список
      if (newValue === true) {
        isOpen.value = false;
      }
    }
);
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 100%;
}

.selected-option {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
}

.options-list {
  position: absolute;
  width: 100%;
  overflow-y: auto;
  z-index: 1000;
}

.option-list-default {
  background: #fff;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 4px;
  max-height: 200px;
}

.search-input {
  width: 100%;
  padding: 8px;
  border-bottom: 1px solid #ccc;
  background: #fff;
  color: #333;
}

.option {
  padding: 8px;
  cursor: pointer;
}

.option:hover {
  background: #f0f0f0;
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>