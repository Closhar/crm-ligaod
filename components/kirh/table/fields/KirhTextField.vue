<template>
  <input
      :readonly="readonly"
      :value="value"
      type="text"
      @input="$emit('input', $event.target.value)"
  />
</template>

<script>
export default {
  name: 'TextField',
  props: {
    value: [String, Number],
    readonly: Boolean,
    options: Object
  }
};
</script>