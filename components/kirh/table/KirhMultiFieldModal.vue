<template>
  <div :class="['kirh-multi-field-modal w-full border border-gray-200', hasEmptyField ? emptyClass : '']">
    <div
      class="inline-flex items-center cursor-pointer w-full py-1 text-center border border-white"
      @click.stop="openModal"
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
    >
      <span :class="iconClass" v-if="icon" class="w-full">
        <Icon :name="icon" size="17" />
      </span>
      <slot v-else>🔗</slot>
      <div v-if="showTooltip" class="absolute z-50 bg-white border rounded shadow p-2 text-xs mt-2 ml-12 whitespace-pre-line">
        <div v-for="field in fields" :key="field">
          <span class="font-bold">{{ getFieldLabel(field) }}:</span> {{ row[field] }}
        </div>
      </div>
    </div>
    <Modal v-model="modalOpen">
      <template #header>
        <span>{{ modalTitle }}</span>
      </template>
      <div class="space-y-2">
        <div class="field-values-block mb-2 p-2 bg-gray-50 rounded border">
          <div v-for="field in fields" :key="field" class="mb-1">
            <span class="font-bold text-gray-700">{{ getFieldLabel(field) }}:</span>
            <span class="text-blue-800 ml-1">{{ row[field] ?? '—' }}</span>
          </div>
        </div>
        <textarea v-model="inputValue" class="w-full border rounded p-2 min-h-[60px]" placeholder="Введите значения через запятую или |"></textarea>
        <button class="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 mt-2" @click="addValues">Добавить в таблицу</button>
        <div v-if="error" class="text-red-500 text-xs mt-1">{{ error }}</div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Modal from './Modal.vue';

const props = defineProps({
  row: { type: Object, required: true },
  fields: { type: Array, required: false },
  icon: { type: String, default: '' },
  iconClass: { type: String, default: 'text-blue-600 hover:text-blue-800' },
  modalTitle: { type: String, default: 'Редактирование полей' },
  fieldLabels: { type: Object, default: () => ({}) },
  apiUrl: { type: String, required: false },
  options: { type: Object, required: false },
});

const emit = defineEmits(['update']);

const modalOpen = ref(false);
const showTooltip = ref(false);
const inputValue = ref('');
const error = ref('');

const fields = computed(() => props.fields || (props.options && props.options.fields) || []);

const fieldLabels = computed(() => props.fieldLabels || (props.options && props.options.fieldLabels) || {});
const icon = computed(() => props.icon || (props.options && props.options.icon) || '');
const modalTitle = computed(() => props.modalTitle || (props.options && props.options.modalTitle) || 'Редактирование полей');
const apiUrl = computed(() => props.apiUrl || (props.options && props.options.apiUrl) || '');

// Проверка на пустой массив или наличие пустых значений
const hasEmptyField = computed(() => {
  const arr = fields.value;
  if (!Array.isArray(arr) || arr.length === 0) return true;
  return arr.some(f => !props.row || props.row[f] === '' || props.row[f] === null || props.row[f] === undefined);
});

// Выбор класса для пустых значений
const emptyClass = computed(() => {
  return (props.options && props.options.empty_class) || 'bg-red-300';
});

function openModal() {
  inputValue.value = '';
  error.value = '';
  modalOpen.value = true;
}

function getFieldLabel(field: string) {
  return fieldLabels.value[field] || field;
}

async function addValues() {
  error.value = '';
  if (!inputValue.value.trim()) {
    error.value = 'Введите значения';
    return;
  }
  let values = inputValue.value.split(/,|\|/).map((v: string) => v.trim()).filter(Boolean);
  if (values.length < fields.value.length) {
    error.value = `Введите минимум ${fields.value.length} значений`;
    return;
  }
  const updateObj: Record<string, string> = {};
  (fields.value as string[]).forEach((field: string, idx: number) => {
    updateObj[field] = values[idx] || '';
  });
  if (apiUrl.value) {
    try {
      // Формируем URL с id
      const url = apiUrl.value.endsWith('/')
        ? apiUrl.value + props.row.id
        : apiUrl.value + '/' + props.row.id;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateObj)
      });
      if (!res.ok) throw new Error('Ошибка при обновлении');
      emit('update', updateObj);
      Object.assign(props.row, updateObj);
      inputValue.value = '';
      modalOpen.value = false;
    } catch (e: any) {
      error.value = e.message || 'Ошибка';
    }
  } else {
    emit('update', updateObj);
    Object.assign(props.row, updateObj);
    inputValue.value = '';
    modalOpen.value = false;
  }
}
</script>

<style scoped>
.kirh-multi-field-modal { position: relative; display: inline-block; }
.field-values-block {
  margin-bottom: 10px;
}
</style> 