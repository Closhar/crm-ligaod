<template>
  <select
      :disabled="readonly"
      :value="value"
      @change="$emit('input', $event.target.value)"
  >
    <option v-for="(option, index) in options.options" :key="index" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<script>
export default {
  name: 'SelectField',
  props: {
    value: [String, Number],
    readonly: Boolean,
    options: {
      type: Object,
      default: () => ({
        options: []
      })
    }
  }
};
</script>