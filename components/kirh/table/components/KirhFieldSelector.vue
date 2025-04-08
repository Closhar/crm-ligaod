<template>
  <div class="kirh-field-selector w-56 bg-gray-50 border-r border-gray-200 p-2 overflow-y-auto flex-shrink-0">
    <div class="text-xs font-medium text-gray-500 mb-2">Выберите поля для редактирования</div>
    <div class="flex flex-col gap-1">
      <button
          v-for="field in allFields"
          :key="field.name"
          :class="{
          'bg-blue-500 text-white': selectedFields.includes(field.name),
          'bg-gray-200 text-gray-700 hover:bg-gray-300': !selectedFields.includes(field.name),
          'opacity-50 cursor-not-allowed': field.name === fixedReadonlyField
        }"
          :disabled="field.name === fixedReadonlyField"
          class="text-xs px-2 py-1 rounded-md transition-colors text-left"
          @click="$emit('toggle-field', field.name)"
      >
        {{ field.label }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KirhFieldSelector',
  props: {
    allFields: Array,
    selectedFields: Array,
    fixedReadonlyField: String
  },
  emits: ['toggle-field']
};
</script>

<style scoped>
.kirh-field-selector {
  height: 100%;
  min-width: 14rem;
  max-height: calc(100vh - 200px);
}
</style>