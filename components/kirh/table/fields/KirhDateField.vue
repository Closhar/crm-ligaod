<template>
  <input
      :readonly="readonly"
      :value="formattedValue"
      type="date"
      @input="$emit('input', $event.target.value)"
  />
</template>

<script>
export default {
  name: 'DateField',
  props: {
    value: [String, Date],
    readonly: Boolean,
    options: Object
  },
  computed: {
    formattedValue() {
      if (!this.value) return '';
      if (this.value instanceof Date) {
        return this.value.toISOString().split('T')[0];
      }
      return this.value;
    }
  }
};
</script>