<template>
  <button
      :class="buttonClass"
      :disabled="disabled"
      class="kirh-toggle-filter text-xs px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      @click="toggleFilter"
  >
    {{ buttonLabel }}
  </button>
</template>

<script>
export default {
  name: 'ToggleFilter',
  props: {
    filter: {
      type: Object,
      required: true,
      validator: (filter) => {
        return !!filter.field && Array.isArray(filter.options)
      }
    },
    modelValue: {
      type: [String, Number, Boolean],
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    activeClass: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      currentIndex: -1
    }
  },
  computed: {
    buttonLabel() {
      if (this.currentIndex === -1) {
        return this.filter.initialLabel || this.filter.label || 'Все'
      }
      const option = this.filter.options[this.currentIndex]
      return this.filter.label
          ? `${this.filter.label}: ${option.label}`
          : option.label
    },
    buttonClass() {
      if (this.currentIndex === -1) {
        return this.filter.initialClass || 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }
      const option = this.filter.options[this.currentIndex]
      return option.activeClass ||
          this.filter.activeClass ||
          this.activeClass ||
          'bg-blue-500 text-white'
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        if (newVal === '') {
          this.currentIndex = -1
        } else {
          this.currentIndex = this.filter.options.findIndex(
              opt => opt.value === newVal
          )
        }
      }
    }
  },
  methods: {
    toggleFilter() {
      if (!this.filter.options?.length || this.disabled) return

      let newIndex = this.currentIndex + 1
      if (newIndex >= this.filter.options.length) {
        newIndex = -1
      }

      this.currentIndex = newIndex
      const newValue = newIndex === -1
          ? ''
          : this.filter.options[newIndex].value

      this.$emit('update:modelValue', newValue)
    }
  }
}
</script>