<template>
  <div class="kirh-form mt-2 p-3 border border-gray-200 rounded-sm bg-gray-50 text-xs">
    <h3 class="font-bold mb-2">
      {{ editingRow ? 'Редактирование' : 'Новая запись' }}
    </h3>
    <div class="grid gap-2">
      <div
          v-for="(column, index) in fields"
          :key="'form-field-'+index"
          class="kirh-form-field"
      >
        <label class="block mb-1">
          {{ column.label }}
        </label>
        <template v-if="column.type === 'select'">
          <KirhSelectField
              v-model="formData[column.name]"
              :api-params="column.options?.apiParams"
              :api-url="column.options?.apiUrl"
              :enable-search="column.options?.enableSearch"
              :icon-field="column.options?.iconField"
              :image-field="column.options?.imageField"
              :key-field="column.options?.keyField || 'id'"
              :label-field="column.options?.labelField || 'name'"
              :options="column.options?.options || []"
              :placeholder="column.options?.placeholder || 'Выберите'"
              class="w-full"
          />
        </template>
        <template v-else>
          <component
              :is="getFieldComponent(column.type)"
              v-model="formData[column.name]"
              :options="{ ...column.options, compact: true }"
              class="w-full p-1 border border-gray-300 rounded-sm text-xs"
          />
        </template>
      </div>
    </div>
    <div class="kirh-form-actions mt-3 flex gap-2 justify-end">
      <button
          :disabled="loading"
          class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-sm disabled:opacity-50 transition-colors text-xs"
          @click="$emit('submit')"
      >
        Сохранить
      </button>
      <button
          :disabled="loading"
          class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-2 py-1 rounded-sm disabled:opacity-50 transition-colors text-xs"
          @click="$emit('cancel')"
      >
        Отмена
      </button>
    </div>
  </div>
</template>

<script>
import KirhSelectField from '../fields/KirhSelectField.vue';
import KirhTextField from '../fields/KirhTextField.vue';
import KirhTextEditorField from '../fields/KirhTextEditorField.vue';
import KirhDateField from '../fields/KirhDateField.vue';
import KirhTimeField from '../fields/KirhTimeField.vue';
import KirhDateTimeField from '../fields/KirhDateTimeField.vue';
import KirhToggleField from '../fields/KirhToggleField.vue';

export default {
  name: 'KirhTableForm',
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
    fields: Array,
    formData: Object,
    loading: Boolean,
    editingRow: Object
  },
  emits: ['submit', 'cancel'],
  methods: {
    getFieldComponent(type) {
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
    }
  }
};
</script>