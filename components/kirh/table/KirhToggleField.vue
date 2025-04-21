<template>
  <label class="final-toggle">
    <input
        ref="input"
        :checked="internalValue"
        class="toggle-input mx-auto"
        type="checkbox"
        @input="handleSingleChange"
    />
    <span class="toggle-track"></span>
    <span class="toggle-label">{{ labelText }}</span>
  </label>
</template>

<script>
export default {
  name: 'KirbFinalToggle',
  props: {
    value: {
      type: [Number, String, Boolean],
      default: 0
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      lastEmittedValue: null
    }
  },
  computed: {
    internalValue() {
      return this.value == 1 || this.value === '1' || this.value === true;
    },
    labelText() {
      if (!this.options.labels) return '';
      return this.internalValue
          ? this.options.labels.on || 'Да'
          : this.options.labels.off || 'Нет';
    }
  },
  methods: {
    handleSingleChange(e) {
      const newValue = e.target.checked ? 1 : 0;

      // Защита от дублирования
      if (this.lastEmittedValue === newValue) return;

      this.lastEmittedValue = newValue;
      this.$emit('update:modelValue', newValue);
    }
  }
}
</script>

<style scoped>
.final-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-track {
  display: inline-block;
  width: 40px;
  height: 22px;
  background-color: #e0e0e0;
  border-radius: 12px;
  border-color: #c3c3c3;
  border-width: 1px;
  position: relative;
  transition: background-color 0.3s;
  margin-top: 6px;
}

.toggle-input:checked + .toggle-track {
  background-color: #59c66a;
}

.toggle-track:after {
  content: '';
  position: absolute;
  width: 15px;
  height: 15px;
  left: 2px;
  top: 2px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-input:checked + .toggle-track:after {
  transform: translateX(20px);
}

.toggle-label {
  font-size: 12px;
  user-select: none;
}
</style> 