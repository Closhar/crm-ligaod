<template>
  <div>
    <!-- Кнопка открытия/закрытия формы -->
    <div class="flex justify-between items-center mb-2 px-4" v-if="!formOptions.autoOpen">
      <button
          @click="toggleForm"
          class="kirh-form-toggle-btn bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
          v-if="!formOptions.autoOpen"
      >
        {{ isFormOpen ? 'Скрыть форму' : formOptions.toggleButtonText || 'Показать форму' }}
      </button>
    </div>

    <div :class="formOptions.containerClass" >

      <!-- Сама форма -->
      <div v-if="isFormOpen" class="m-2 rounded-md shadow-sm border-2 border-gray-400">

        <div class="bg-gray-400 text-gray-50 font-bold rounded-t-md p-2">
          {{ formOptions.formTitle }}
        </div>

        <form @submit.prevent="submitForm" class="kirh-dynamic-form">
          <!-- Динамические поля в строку -->
          <div class="flex flex-wrap gap-1 px-4 pt-4 ">
            <div
                v-for="(column, index) in visibleColumns"
                :key="index"
                :class="column.options?.cellClass"
                :style="{ width: column.width }"
            >
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ column.label }}
                <span v-if="column.required" class="text-red-500">*</span>
                <span v-if="column.options?.hint" class="ml-1 text-gray-400 cursor-help" :title="column.options.hint">
                <svg class="h-4 w-4 inline" fill="currentColor" viewBox="0 0 20 20">
                  <path clip-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" fill-rule="evenodd"></path>
                </svg>
              </span>
              </label>

              <!-- Текстовое поле -->
              <input
                  v-if="column.type === 'text'"
                  v-model="formData[column.name]"
                  type="text"
                  :required="column.required"
                  :readonly="column.options?.readonly || formOptions.readonly"
                  :class="column.options?.inputClass"
                  :placeholder="column.options?.placeholder"
              />

              <!-- Поле datetime-local -->
              <input
                  v-else-if="column.type === 'datetime'"
                  v-model="formData[column.name]"
                  type="datetime-local"
                  :required="column.required"
                  :readonly="column.options?.readonly || formOptions.readonly"
                  :class="column.options?.inputClass"
                  :placeholder="column.options?.placeholder"
              />

              <!-- Textarea поле -->
              <textarea
                  v-else-if="column.type === 'textarea'"
                  v-model="formData[column.name]"
                  :required="column.required"
                  :readonly="column.options?.readonly || formOptions.readonly"
                  :class="['w-full p-1 border border-gray-300 rounded text-sm', column.options?.inputClass]"
                  :placeholder="column.options?.placeholder"
                  :rows="column.options?.rows || 3"
              />

              <!-- Select поле (компонент KirhSelectField) -->
              <KirhSelectField
                  v-else-if="column.type === 'select'"
                  v-model="formData[column.name]"
                  :options="column.options?.options"
                  :api-url="column.options?.apiUrl"
                  :api-params="column.options?.apiParams"
                  :required="column.required"
                  :readonly="column.options?.readonly || formOptions.readonly"
                  :enable-search="column.options?.enableSearch"
                  :icon-field="column.options?.iconField"
                  :image-field="column.options?.imageField"
                  :key-field="column.options?.keyField || 'id'"
                  :label-field="column.options?.labelField || 'name'"
                  :limit="column.options?.limit"
                  :placeholder="column.options?.placeholder || column.label"
                  :class="['w-full', column.options?.inputClass]"
                  :empty-option="column.options?.empty_option"
                  :list-item="column.options?.list_item"
                  :options-list="column.options?.options_list"
                  :sel_class="column.options.sel_class || null"
              />

              <!-- Переключатель -->
              <label v-else-if="column.type === 'toggle'" class="inline-flex items-center mt-2">
                <input
                    type="checkbox"
                    v-model="formData[column.name]"
                    :disabled="column.options?.readonly || formOptions.readonly"
                    class="sr-only peer"
                >
                <div
                    class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                    :class="[
                  column.options?.inputClass,
                  formData[column.name] ?
                    (column.options?.activeClass || 'bg-blue-500') :
                    (column.options?.inactiveClass || 'bg-gray-200')
                ]"
                ></div>
                <span class="ml-2 text-sm text-gray-600" v-if="column.options?.toggleLabel">
                {{ formData[column.name] ? column.options.toggleLabel.on : column.options.toggleLabel.off }}
              </span>
              </label>
            </div>
          </div>

          <!-- Кнопки формы -->
          <div class="flex justify-start gap-2 mt-3 px-4 pb-4" v-if="!formOptions.hideButtons">
            <button
                type="button"
                @click="resetForm"
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
                v-if="!formOptions.hideCancelButton"
            >
              {{ formOptions.cancelButtonText || 'Сбросить' }}
            </button>
            <button
                type="submit"
                class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm"
                v-if="!formOptions.hideSubmitButton"
            >
              {{ formOptions.submitButtonText || 'Сохранить' }}
            </button>
            <label class="inline-flex items-center cursor-pointer mx-6">
              <input
                  type="checkbox"
                  v-model="keepFormAfterSubmit"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 cursor-pointer"
              >
              <span class="ml-2 text-sm text-gray-700">Не обнулять форму после добавления</span>
            </label>
          </div>
        </form>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import KirhSelectField from './../fields/KirhSelectField.vue';

const props = defineProps({
  apiUrl: {
    type: String,
    required: true
  },
  formOptions: {
    type: Object,
    required: true,
    default: () => ({
      columns: [],
      formTitle: 'Форма',
      autoOpen: false,
      readonly: false,
      containerClass: '',
      initialData: null,
      hideOptions: false,
      hideButtons: false,
      hideSubmitButton: false,
      hideCancelButton: false,
      submitButtonText: 'Сохранить',
      cancelButtonText: 'Сбросить',
      toggleButtonText: 'Показать форму'
    })
  },
  showForm: {
    type: Boolean,
    default: false
  },
  editingRow: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:showForm', 'refresh', 'cancel']);

const isFormOpen = ref(props.showForm);
const formData = ref({});
const keepFormAfterSubmit = ref(true);
const loading = ref(false);
const error = ref(null);

// Вычисляемые свойства
const formTitle = computed(() => {
  return props.editingRow ?
      'Редактирование записи' :
      props.formOptions.formTitle || 'Добавить запись';
});

const visibleColumns = computed(() => {
  return props.formOptions.columns.filter(column =>
      !column.options?.hidden || !column.options.hidden(formData.value))
});

// Инициализация формы
const initForm = () => {
  formData.value = {};
  props.formOptions.columns.forEach(column => {
    formData.value[column.name] = column.defaultValue ??
        (column.type === 'toggle' ? (column.options?.defaultChecked || false) : '');
  });

  if (props.editingRow) {
    formData.value = {...props.editingRow};
    // Конвертация даты для datetime-local
    props.formOptions.columns.forEach(column => {
      if (column.type === 'datetime' && formData.value[column.name]) {
        formData.value[column.name] = convertToDatetimeLocal(formData.value[column.name]);
      }
    });
  }
};

// Конвертация даты в формат datetime-local
const convertToDatetimeLocal = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Переключение формы
const toggleForm = () => {
  isFormOpen.value = !isFormOpen.value;
  emit('update:showForm', isFormOpen.value);
  if (isFormOpen.value && !Object.keys(formData.value).length) {
    initForm();
  }
};

// Сброс формы
const resetForm = () => {
  initForm();
  emit('cancel');
};

// Отправка формы
const submitForm = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Конвертация datetime-local обратно в стандартный формат
    const submitData = {...formData.value};
    props.formOptions.columns.forEach(column => {
      if (column.type === 'datetime' && submitData[column.name]) {
        submitData[column.name] = new Date(submitData[column.name]).toISOString();
      }
    });

    const url = props.editingRow ?
        `${props.apiUrl}/${props.editingRow.id}` :
        props.apiUrl;
    const method = props.editingRow ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submitData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка сохранения');
    }

    emit('refresh');

    // Всегда оставляем форму открытой
    isFormOpen.value = true;

    if (props.editingRow) {
      // Если редактирование - закрываем форму
      emit('update:showForm', false);
    } else if (!keepFormAfterSubmit.value) {
      // Если не редактирование и галочка не активна - сбрасываем форму
      initForm(); // Используем initForm вместо resetForm чтобы не закрывать форму
    }
    // Если галочка активна - ничего не делаем, форма остается с данными
  } catch (err) {
    error.value = err.message;
    console.error('Ошибка при сохранении:', err);
  } finally {
    loading.value = false;
  }
};

// Реакция на изменение showForm из родителя
watch(() => props.showForm, (newVal) => {
  isFormOpen.value = newVal;
  if (isFormOpen.value) {
    initForm();
  }
});

// Реакция на изменение редактируемой строки
watch(() => props.editingRow, (newVal) => {
  if (newVal) {
    formData.value = {...newVal};
    props.formOptions.columns.forEach(column => {
      if (column.type === 'datetime' && formData.value[column.name]) {
        formData.value[column.name] = convertToDatetimeLocal(formData.value[column.name]);
      }
    });
  }
}, { deep: true });

// Инициализация при монтировании
initForm();
</script>

<style scoped>
.kirh-form-container {
  margin-bottom: 1.5rem;
}

.kirh-form-wrapper {
  transition: all 0.3s ease;
}

.kirh-form-toggle-btn {
  transition: background-color 0.2s;
}

.kirh-dynamic-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>