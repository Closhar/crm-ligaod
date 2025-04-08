<template>
  <div ref="selectContainer" :class="sel_class" class="custom-select">
    <!-- Поле для отображения выбранного значения -->
    <div class="selected-option" @click="isOpen = !isOpen">
      <div class="flex items-center space-x-2">
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
        <span>{{ selectedOption?.[props.labelField] || placeholder }}</span>
      </div>
      <!-- Стрелочка вниз -->
      <Icon
          :class="{ 'rotate-180': isOpen }"
          class="w-6 h-6 ml-2 transition-transform"
          icon="ic:round-arrow-drop-down"
      />
    </div>

    <!-- Выпадающий список -->
    <div v-if="isOpen" :class="options_list" class="options-list">
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
        <div class="flex items-center space-x-2">
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

// Вычисляемое свойство для отображения опций
const filteredOptions = computed(() => {
  let options = [];

  if (props.options.length > 0) {
    options = [...props.options];
  } else {
    options = [...apiOptions.value];
  }

  // Добавляем пустую опцию только если её нет
  if (props.emptyOption && !options.some(opt => opt[props.keyField] === props.emptyOption.value)) {
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
  if (!props.apiUrl) return;

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
  if (props.apiUrl && props.enableSearch) {
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
  else if (props.apiUrl) {
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
        const allOptions = [...props.options, ...apiOptions.value];
        selectedOption.value = allOptions.find(
            option => option[props.keyField] === newValue
        ) || props.emptyOption;
      } else {
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
  margin-top: 4px;
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