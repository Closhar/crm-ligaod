<template>
  <div
      :class="{'bg-gray-50': rowIndex % 2 === 0}"
      class="kirh-row flex hover:bg-gray-50 text-xs"
  >
    <div
        v-for="column in columns"
        :key="'cell-'+rowIndex+'-'+column.name"
        :style="getColumnStyle(column)"
        class="kirh-cell border-b border-gray-100 p-2"
    >
      <!-- Select-поле -->
      <template v-if="column.type === 'select'">
        <!-- Локальный селект -->
        <KirhSelectField
            v-if="column.options?.options"
            v-model="row[column.name]"
            :icon-field="column.options.iconField"
            :image-field="column.options.imageField"
            :key-field="column.options.keyField || 'id'"
            :label-field="column.options.labelField || 'name'"
            :options="column.options.options"
            @update:modelValue="(val) => $emit('update-value', row, column.name, val)"
        />

        <!-- API селект -->
        <div v-else class="border border-gray-200 h-8 rounded">
          <!-- Статическое отображение -->
          <div
              v-if="!isActiveSelect(row.id, column.name)"
              class="flex items-center justify-between cursor-pointer hover:bg-gray-200 rounded h-8 p-1"
              @click="openInlineSelect(row, column)"
          >
            <div class="flex items-center min-w-0">
              <!-- Изображение -->
              <img
                  v-if="getSelectImage(row, column)"
                  :src="getSelectImage(row, column)"
                  class="h-5 w-5 rounded-full mr-2 object-cover flex-shrink-0"
              />
              <!-- Иконка -->
              <Icon
                  v-else-if="getSelectIcon(row, column)"
                  :name="getSelectIcon(row, column)"
                  class="h-5 w-5 mr-2 text-gray-600 flex-shrink-0"
              />
              <!-- Текст -->
              <span class="truncate">
                {{ getSelectLabel(row, column) || 'Не выбрано' }}
              </span>
            </div>
            <Icon class="text-gray-400" name="mingcute:pencil-fill" size="16"/>
          </div>

          <!-- Редактируемый селект -->
          <KirhSelectField
              v-else
              ref="inlineSelectRef"
              v-model="selectValues[row.id][column.name]"
              :api-params="getSelectApiParams(column, row)"
              :api-url="column.options.apiUrl"
              :class="column.options.sel_class || 'w-full'"
              :enable-search="true"
              :icon-field="column.options.iconField"
              :image-field="column.options.imageField"
              :key-field="column.options.keyField || 'id'"
              :label-field="column.options.labelField || 'name'"
              :list_item="column.options.list_item || null"
              :options="column.options.options"
              :options_list="column.options.options_list || null"
              :placeholder="column.options.placeholder || column.label"
              :sel_class="column.options.sel_class || null"
              auto-focus
              @blur="handleSelectBlur(row, column)"
              @update:modelValue="(val) => handleInlineSelectChange(row, column.name, val)"
          />
        </div>
      </template>

      <!-- Другие типы полей -->
      <template v-else>
        <component
            :is="getFieldComponent(column.type)"
            :options="column.options"
            :readonly="!editable || column.options.readonly"
            :type="column.type"
            :value="row[column.name]"
            @input="$emit('update-value', row, column.name, $event)"
        />
      </template>
    </div>
    <div
        v-if="editable"
        class="kirh-actions-cell p-1.5 border-b border-gray-100 flex gap-1 items-center justify-center"
        style="flex: 0 0 80px;"
    >
      <button
          class="kirh-edit-btn text-blue-500 hover:text-blue-700 transition-colors p-0.5"
          title="Редактировать"
          @click="$emit('edit-row', row)"
      >
        <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path
              d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
        </svg>
      </button>
      <button
          class="kirh-delete-btn text-red-500 hover:text-red-700 transition-colors p-0.5"
          title="Удалить"
          @click="$emit('delete-row', row)"
      >
        <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path clip-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                fill-rule="evenodd"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import {ref} from 'vue';
import KirhSelectField from '../fields/KirhSelectField.vue';
import KirhTextField from '../fields/KirhTextField.vue';
import KirhTextEditorField from '../fields/KirhTextEditorField.vue';
import KirhDateField from '../fields/KirhDateField.vue';
import KirhTimeField from '../fields/KirhTimeField.vue';
import KirhDateTimeField from '../fields/KirhDateTimeField.vue';
import KirhToggleField from '../fields/KirhToggleField.vue';

export default {
  name: 'KirhTableRow',
  components: {
    KirhSelectField,
    KirhTextField,
    KirhTextEditorField,
    KirhDateField,
    KirhTimeField,
    KirhDateTimeField,
    KirhToggleField
  },
  props: {
    row: Object,
    rowIndex: Number,
    columns: Array,
    editable: Boolean
  },
  emits: ['edit-row', 'delete-row', 'update-value'],
  setup() {
    const activeSelect = ref(null);
    const inlineSelectRef = ref(null);
    const selectValues = ref({});
    const clickInProgress = ref(false);

    const getFieldComponent = (type) => {
      const componentMap = {
        text: KirhTextField,
        textEditor: KirhTextEditorField,
        date: KirhDateField,
        time: KirhTimeField,
        datetime: KirhDateTimeField,
        select: KirhSelectField,
        toggle: KirhToggleField
      };
      return componentMap[type] || KirhTextField;
    };

    const getColumnStyle = (column) => {
      const width = column.width || column.options?.width;
      if (!width) return {flex: '1 1 0%'};

      if (typeof width === 'number') return {flex: `0 0 ${width}px`};
      if (typeof width === 'string') {
        if (width.endsWith('%')) return {flex: `0 0 ${width}`, maxWidth: width};
        if (width.endsWith('px')) return {flex: `0 0 ${width}`};
        return {flex: `0 0 ${width}px`};
      }

      return {flex: '1 1 0%'};
    };

    const getNestedValue = (obj, path) => {
      if (!path || !obj) return null;
      if (!path.includes('.')) return obj[path] ?? null;
      return path.split('.').reduce((acc, part) => {
        if (acc === null || acc === undefined) return null;
        return acc[part] ?? null;
      }, obj);
    };

    const getSelectLabel = (row, column) => {
      if (column.options?.displayLabelField) {
        return getNestedValue(row, column.options.displayLabelField);
      }
      const labelField = column.options?.labelField || 'name';
      if (row[labelField]) return row[labelField];
      if (row[column.name] && typeof row[column.name] === 'object') {
        return row[column.name][labelField];
      }
      return row[column.name]?.toString() || null;
    };

    const getSelectImage = (row, column) => {
      if (!column.options?.displayImageField) return null;
      return getNestedValue(row, column.options.displayImageField);
    };

    const getSelectIcon = (row, column) => {
      if (!column.options?.displayIconField) return null;
      return getNestedValue(row, column.options.displayIconField);
    };

    const isActiveSelect = (rowId, fieldName) => {
      return activeSelect.value?.rowId === rowId && activeSelect.value?.field === fieldName;
    };

    const getSelectApiParams = (column, row) => {
      const params = {...column.options?.apiParams};
      if (column.options?.polymorphic) {
        const {idField, typeField} = column.options.polymorphic;
        params[typeField] = row[typeField];
        params[idField] = row[idField];
      }
      if (typeof column.options?.dynamicParams === 'function') {
        Object.assign(params, column.options.dynamicParams(row));
      }
      return params;
    };

    const openInlineSelect = async (row, column) => {
      if (!selectValues.value[row.id]) {
        selectValues.value[row.id] = {};
      }

      selectValues.value[row.id][column.name] = {
        [column.options.keyField || 'id']: row[column.name],
        [column.options.labelField || 'name']: getSelectLabel(row, column)
      };

      activeSelect.value = {rowId: row.id, field: column.name};
    };

    const handleInlineSelectChange = (row, fieldName, value) => {
      $emit('update-value', row, fieldName, value);
      activeSelect.value = null;
    };

    const handleSelectBlur = () => {
      if (clickInProgress.value) {
        clickInProgress.value = false;
        return;
      }
      activeSelect.value = null;
    };

    return {
      activeSelect,
      inlineSelectRef,
      selectValues,
      clickInProgress,
      getFieldComponent,
      getColumnStyle,
      getNestedValue,
      getSelectLabel,
      getSelectImage,
      getSelectIcon,
      isActiveSelect,
      getSelectApiParams,
      openInlineSelect,
      handleInlineSelectChange,
      handleSelectBlur
    };
  }
};
</script>

<style scoped>
.kirh-row {
  display: flex;
  width: 100%;
}

.kirh-cell, .kirh-actions-cell {
  flex-grow: 0;
  flex-shrink: 0;
  min-width: 0;
}

.kirh-edit-btn,
.kirh-delete-btn {
  padding: 0.125rem;
}

.kirh-edit-btn svg,
.kirh-delete-btn svg {
  display: block;
}
</style>