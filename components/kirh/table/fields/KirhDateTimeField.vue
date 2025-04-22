<template>
  <div
      v-click-outside="handleClickOutside"
      :class="['kirh-date-time-field', { 'max-w-full': !options.maxWidth }]"
      :style="{ maxWidth: options.maxWidth || '100%' }"
  >
    <div class="field-container">
      <!-- Readonly режим -->
      <div
          v-if="readonly"
          :class="dynamicInputClass"
      >
        <Icon v-if="type === 'icon'" :name="effectiveIconName" :size="options.iconSize || 16" class="mr-1 text-gray-600"/>
        <span class="align-top mt-1">{{ displayValue || '&nbsp;' }}</span>
      </div>

      <!-- Режим редактирования -->
      <template v-else>
        <div v-if="type === 'icon'" class="w-18">
          <Icon :name="effectiveIconName" :size="options.iconSize || 16" class="mx-2 text-gray-600"/>
        </div>

        <input
            ref="inputField"
            :class="[dynamicInputClass]"
            :placeholder="options.placeholder || ''"
            :type="inputType"
            :value="displayValue"
            v-bind="inputAttrs"
            @blur="handleBlur"
            @focus="handleFocus"
            @input="handleInput"
            @keydown.enter="handleEnter"
            @keydown.esc="cancelEdit"
        />

        <!-- Иконка редактирования -->
        <Icon
            v-if="showEditIcon"
            class="edit-icon"
            name="mingcute:pencil-fill"
            size="16"
            @click="startEdit"
        />
      </template>
    </div>

    <!-- Подсказка редактирования -->
    <div
        v-if="showEditHint"
        class="edit-hint"
    >
      <span>Enter - сохранить, Esc - отмена</span>
      <button
          v-if="showCancelButton"
          class="cancel-btn"
          @click="cancelEdit"
      >
        ×
      </button>
    </div>

    <!-- Сообщение об ошибке -->
    <div
        v-if="hasError"
        class="error-message"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'KirhDateTimeField',
  directives: {
    'click-outside': {
      beforeMount(el, binding) {
        el.clickOutsideEvent = (event) => {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value(event);
          }
        };
        document.addEventListener('click', el.clickOutsideEvent);
      },
      unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
      }
    }
  },
  props: {
    value: [String, Number, Date],
    modelValue: [String, Number, Date],
    readonly: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'date',
      validator: (value) => ['date', 'time', 'datetime'].includes(value)
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['input', 'change', 'cancel', 'start-edit', 'update:modelValue'],
  data() {
    return {
      localValue: '',
      isEditing: false,
      originalValue: '',
      hasError: false,
      errorMessage: '',
      pendingValue: null
    };
  },
  computed: {
    inputType() {
      const types = {
        date: 'date',
        time: 'time',
        datetime: 'datetime-local'
      };
      return types[this.type] || 'date';
    },
    showCancelButton() {
      return this.options.showCancelButton !== false;
    },
    displayValue() {
      if (this.isEditing) {
        return this.pendingValue !== null ? this.pendingValue : this.localValue;
      }
      if ([null, undefined].includes(this.value) && [null, undefined].includes(this.modelValue)) return '';
      return this.formatForDisplay(this.value || this.modelValue);
    },
    dynamicInputClass() {
      if (!this.options.ev || !Array.isArray(this.options.ev)) {
        return this.options.cellClass || '';
      }

      const currentValue = this.displayValue || '';
      const matchedCondition = this.options.ev.find(condition =>
          String(condition.warn_ev || '') === String(currentValue)
      );

      if (this.options.check_empty) {
        const strippedValue = currentValue.replace(/<[^>]*>/g, '').trim();
        if (!strippedValue) {
          return this.options.empty_class || 'bg-red-100';
        }
      }

      return matchedCondition?.class_warn_ev || this.options.cellClass || '';
    },
    showEditIcon() {
      return !this.readonly && !this.isEditing && this.options.show !== false;
    },
    showEditHint() {
      return !this.readonly && this.isEditing && this.options.show !== false;
    },
    inputAttrs() {
      return {
        readonly: !this.isEditing || this.options.show === false
      };
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        const val = newVal == null ? '' : this.formatForDisplay(newVal);
        this.localValue = val;
        this.originalValue = val;
        this.pendingValue = null;
      }
    },
    modelValue: {
      immediate: true,
      handler(newVal) {
        const val = newVal == null ? '' : this.formatForDisplay(newVal);
        this.localValue = val;
        this.originalValue = val;
        this.pendingValue = null;
      }
    }
  },
  methods: {
    handleInput(event) {
      const value = event.target.value;
      this.pendingValue = value;
      this.validateInput(value);
    },

    handleBlur() {
      if (this.readonly || !this.isEditing || this.options.show === false) return;
      this.finalizeChanges();
    },

    handleEnter() {
      if (this.readonly || !this.isEditing || this.options.show === false) return;
      this.finalizeChanges();
    },

    finalizeChanges() {
      if (this.hasError) return;

      const value = this.pendingValue;
      if (value === null || value === undefined) {
        this.$emit('input', null);
        this.$emit('update:modelValue', null);
        this.isEditing = false;
        return;
      }

      let result;
      const pad = num => String(num).padStart(2, '0');

      switch (this.type) {
        case 'date':
          // Проверяем формат YYYY-MM-DD
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(value)) {
            this.hasError = true;
            this.errorMessage = 'Некорректный формат даты. Используйте YYYY-MM-DD';
            return;
          }
          result = value;
          break;
        case 'time':
          // Проверяем формат HH:ii
          const timeRegex = /^\d{2}:\d{2}$/;
          if (!timeRegex.test(value)) {
            this.hasError = true;
            this.errorMessage = 'Некорректный формат времени. Используйте HH:ii';
            return;
          }
          result = value;
          break;
        case 'datetime':
          const dt = new Date(value);
          if (isNaN(dt.getTime())) {
            this.hasError = true;
            this.errorMessage = 'Некорректный формат даты и времени';
            return;
          }
          result = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
          break;
      }

      // Обновляем локальные значения
      this.localValue = value;
      this.originalValue = value;
      this.pendingValue = null;
      this.isEditing = false;
      
      // Отправляем события
      this.$emit('input', result);
      this.$emit('update:modelValue', result);
      this.$emit('change', result);
    },

    validateInput(value) {
      if (!value) {
        this.hasError = false;
        this.errorMessage = '';
        return true;
      }

      let isValid = true;
      let errorMessage = '';

      switch (this.type) {
        case 'date':
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(value)) {
            isValid = false;
            errorMessage = 'Некорректный формат даты. Используйте YYYY-MM-DD';
          }
          break;
        case 'time':
          const timeRegex = /^\d{2}:\d{2}$/;
          if (!timeRegex.test(value)) {
            isValid = false;
            errorMessage = 'Некорректный формат времени. Используйте HH:ii';
          }
          break;
        case 'datetime':
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            isValid = false;
            errorMessage = 'Некорректный формат даты и времени';
          }
          break;
      }

      this.hasError = !isValid;
      this.errorMessage = errorMessage;
      return isValid;
    },

    formatForDisplay(value) {
      if (!value) return '';
      
      // Если значение уже в нужном формате, возвращаем его
      if (typeof value === 'string') {
        switch (this.type) {
          case 'date':
            if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
            break;
          case 'time':
            if (/^\d{2}:\d{2}$/.test(value)) return value;
            break;
          case 'datetime':
            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
            break;
        }
      }

      const date = new Date(value);
      if (isNaN(date.getTime())) return String(value);

      const pad = num => String(num).padStart(2, '0');

      switch (this.type) {
        case 'date':
          return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
        case 'time':
          return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
        case 'datetime':
          return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
      }
    },

    handleFocus() {
      if (this.readonly || this.options.show === false) return;
      this.$emit('start-edit');
      this.isEditing = true;
      this.pendingValue = this.localValue;
    },

    startEdit() {
      if (this.readonly || this.options.show === false) return;
      this.$emit('start-edit');
      this.isEditing = true;
      this.pendingValue = this.localValue;
      this.$nextTick(() => {
        this.$refs.inputField?.focus();
        this.moveCursorToEnd();
      });
    },

    moveCursorToEnd() {
      const input = this.$refs.inputField;
      if (input) {
        input.setSelectionRange(input.value.length, input.value.length);
      }
    },

    handleClickOutside() {
      if (this.isEditing) {
        this.finalizeChanges();
      }
    },

    cancelEdit() {
      this.localValue = this.originalValue;
      this.pendingValue = null;
      this.isEditing = false;
      this.hasError = false;
      this.$emit('cancel');
    }
  }
};
</script>

<style scoped>
.kirh-date-time-field {
  position: relative;
  width: 100%;
}

.field-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 32px;
}

.field-display {
  padding: 8px 12px 0;
  min-height: 36px;
  line-height: 1.5;
}

.field-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
}

.edit-icon {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #9ca3af;
  opacity: 0.7;
}

.edit-icon:hover {
  opacity: 1;
  color: #4b5563;
}

.edit-hint {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  margin-top: 4px;
  padding: 8px 12px;
  font-size: 12px;
  color: white;
  background-color: #1f2937;
  border-radius: 4px;
}

.cancel-btn {
  margin-left: 8px;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.cancel-btn:hover {
  color: #d1d5db;
}

.error-message {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  font-size: 12px;
  color: #ef4444;
}
</style> 