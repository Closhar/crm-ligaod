<template>
  <div class="kirh-body">
    <KirhTableRow
        v-for="(row, rowIndex) in data"
        :key="row.id || rowIndex"
        :columns="columns"
        :editable="editable"
        :row="row"
        :row-index="rowIndex"
        @edit-row="$emit('edit-row', row)"
        @delete-row="$emit('delete-row', row)"
        @update-value="$emit('update-value', ...arguments)"
    />
  </div>
</template>

<script>
import KirhTableRow from './KirhTableRow.vue';

export default {
  name: 'KirhTableBody',
  components: {KirhTableRow},
  props: {
    data: Array,
    columns: Array,
    editable: Boolean,
    loading: Boolean
  },
  emits: ['edit-row', 'delete-row', 'update-value']
};
</script>

<style scoped>
.kirh-row:nth-child(even) {
  background-color: #f8fafc;
}

.kirh-row:hover {
  background-color: #f0f4f8;
}
</style>