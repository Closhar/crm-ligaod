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
            class="w-6 h-6 rounded"
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
        <div class="flex items-center space-x-2 text-sm">
          <!-- Изображение или иконка опции -->
          <img
              v-if="option[props.imageField]"
              :src="option[props.imageField]"
              alt=""
              class="w-6 h-6 rounded"
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
import {ref, watch, onMounted, onUnmounted, computed} from 'vue';
import {Icon} from '@iconify/vue';

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
    default: 'text-white'
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

  if (props.options.length > 0) {
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
      [props.imageField]: props.emptyOption.image,
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
  if (selectedOption.value && selectedOption.value[props.labelField]) {
    return selectedOption.value[props.labelField];
  }
  if (props.modelValue && typeof props.modelValue === 'object') {
    return props.modelValue[props.labelField] || props.modelValue.title_short || props.modelValue.label || props.modelValue;
  }
  if (props.modelValue) {
    return props.modelValue;
  }
  return props.label;
});

// Инициализация значения по умолчанию
const initializeDefaultValue = () => {
  if (props.defaultValue !== null && props.defaultValue !== undefined) {
    const allOptions = [...props.options, ...apiOptions.value];
    const defaultOption = allOptions.find(
        option => option[props.keyField] === props.defaultValue
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
  selectedOption.value = option;
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
    const url = new URL(props.apiUrl);
    Object.entries({...props.apiParams, q: query, limit: props.limit}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);

    const data = await response.json();
    apiOptions.value = Array.isArray(data) ? data : [];

    // После загрузки данных инициализируем значение по умолчанию
    initializeDefaultValue();
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
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
  if (props.options.length > 0) {
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
        // Преобразуем options в массив, если это объект
        const optionsArray = Array.isArray(props.options) ? props.options : 
                           (typeof props.options === 'object' && props.options !== null) ? Object.values(props.options) : [];
        const allOptions = [...optionsArray, ...apiOptions.value];
        const foundOption = allOptions.find(
            option => option[props.keyField] === newValue
        );
        
        if (foundOption) {
          selectedOption.value = foundOption;
        } else if (props.emptyable) {
          selectedOption.value = props.emptyOption;
        } else {
          // Если emptyable=false и значение не найдено, берем первую доступную опцию
          selectedOption.value = allOptions[0] || null;
        }
      } else if (props.emptyable) {
        selectedOption.value = props.emptyOption;
      } else {
        // Если emptyable=false и нет значения, берем первую доступную опцию
        const optionsArray = Array.isArray(props.options) ? props.options : 
                           (typeof props.options === 'object' && props.options !== null) ? Object.values(props.options) : [];
        const allOptions = [...optionsArray, ...apiOptions.value];
        selectedOption.value = allOptions[0] || null;
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