<template>
  <div
      v-click-outside="handleClickOutside"
      :class="['kirh-text-field', { 'max-w-full': !options.maxWidth }]"
      :style="{ maxWidth: options.maxWidth || '100%' }"
  >
    <div class="field-container">
      <!-- Режим только иконки -->
      <div
          v-if="showOnlyIcon"
          :class="['icon-only-wrapper', dynamicInputClass]"
      >
        <Icon :name="effectiveIconName" :size="options.iconSize || 16" class="text-gray-600"/>
      </div>

      <!-- Readonly режим (не только иконка) -->
      <div
          v-else-if="readonly"
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
  name: 'KirhTextField',
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
      default: 'text',
      validator: (value) => ['text', 'icon', 'date', 'time', 'datetime', 'email', 'number'].includes(value)
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
      pendingDateValue: null
    };
  },
  computed: {
    isDateType() {
      return ['date', 'time', 'datetime'].includes(this.type);
    },
    inputType() {
      const types = {
        date: 'date',
        time: 'time',
        datetime: 'datetime-local',
        icon: 'text'
      };
      return types[this.type] || 'text';
    },
    showCancelButton() {
      return this.options.showCancelButton !== false;
    },
    displayValue() {
      if (this.isEditing) {
        return this.isDateType
            ? (this.pendingDateValue !== null ? this.pendingDateValue : this.localValue)
            : this.localValue;
      }
      if ([null, undefined].includes(this.value) && [null, undefined].includes(this.modelValue)) return '';
      if (!this.isDateType) return String(this.value || this.modelValue || '');
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

      // Check for empty value if check_empty is enabled
      if (this.options.check_empty) {
        const strippedValue = currentValue.replace(/<[^>]*>/g, '').trim();
        if (!strippedValue) {
          return this.options.empty_class || 'bg-red-100';
        }
      }

      return matchedCondition?.class_warn_ev || this.options.cellClass || '';
    },
    showOnlyIcon() {
      return this.type === 'icon' && this.options.only_icon;
    },
    effectiveIconName() {
      return this.displayValue || this.options.defaultIcon || 'question';
    },
    showEditIcon() {
      return !this.readonly && !this.isEditing && !this.isDateType && !this.showOnlyIcon;
    },
    showEditHint() {
      return !this.readonly && this.isEditing && !this.isDateType;
    },
    inputAttrs() {
      return {
        readonly: this.isDateType ? false : !this.isEditing
      };
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        const val = newVal == null ? '' :
            this.isDateType ? this.formatForDisplay(newVal) : String(newVal);
        this.localValue = val;
        this.originalValue = val;
        this.pendingDateValue = null;
      }
    },
    modelValue: {
      immediate: true,
      handler(newVal) {
        const val = newVal == null ? '' :
            this.isDateType ? this.formatForDisplay(newVal) : String(newVal);
        this.localValue = val;
        this.originalValue = val;
        this.pendingDateValue = null;
      }
    }
  },
  methods: {
    handleInput(event) {
      const value = event.target.value;
      this.localValue = value;

      if (this.isDateType) {
        this.pendingDateValue = value;
      } else {
        this.validateInput();
      }
    },

    handleBlur() {
      if (this.readonly || !this.isEditing) return;

      if (this.isDateType && this.pendingDateValue !== null) {
        this.processDateValue(this.pendingDateValue);
      } else {
        this.validateInput();
        if (!this.hasError && this.localValue !== this.originalValue) {
          this.$emit('input', this.localValue);
          this.$emit('update:modelValue', this.localValue);
          this.originalValue = this.localValue;
        }
      }

      this.isEditing = false;
    },

    handleEnter() {
      if (this.isDateType && this.pendingDateValue !== null) {
        this.processDateValue(this.pendingDateValue);
      } else {
        this.validateInput();
        if (!this.hasError && this.localValue !== this.originalValue) {
          this.$emit('input', this.localValue);
          this.$emit('update:modelValue', this.localValue);
          this.originalValue = this.localValue;
        }
      }

      this.isEditing = false;
    },

    processDateValue(value) {
      this.localValue = value;
      this.pendingDateValue = null;

      if (!value) {
        this.$emit('input', null);
        this.$emit('update:modelValue', null);
        return;
      }

      let result;
      const pad = num => String(num).padStart(2, '0');

      switch (this.type) {
        case 'date':
          result = `${value} 00:00:00`;
          break;
        case 'time':
          result = `1970-01-01 ${value}:00`;
          break;
        case 'datetime':
          const dt = new Date(value);
          if (isNaN(dt.getTime())) {
            this.hasError = true;
            this.errorMessage = 'Некорректный формат даты и времени';
            return;
          }
          result = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:00`;
          break;
      }

      if (result !== (this.value || this.modelValue)) {
        this.$emit('input', result);
        this.$emit('update:modelValue', result);
        this.originalValue = result;
      }
    },

    finalizeChanges() {
      this.validateInput();
      if (this.hasError) return;

      this.isEditing = false;
      
      // Проверяем, изменилось ли значение
      const hasChanged = this.isDateType 
        ? this.pendingDateValue !== null && this.pendingDateValue !== this.originalValue
        : this.localValue !== this.originalValue;

      if (hasChanged) {
        if (this.isDateType && this.pendingDateValue !== null) {
          this.processDateValue(this.pendingDateValue);
        } else {
          this.$emit('input', this.localValue);
          this.$emit('update:modelValue', this.localValue);
          this.originalValue = this.localValue;
        }
      }
    },

    parseDateTime(value) {
      if (!value) return null;
      if (value instanceof Date) return value;

      if (typeof value === 'string') {
        const [datePart, timePart] = value.split(' ');
        if (datePart && timePart) {
          const [year, month, day] = datePart.split('-');
          const [hours, minutes] = timePart.split(':');
          return new Date(year, month - 1, day, hours, minutes, 0);
        }
      }

      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    },

    formatForDisplay(value) {
      if (!value) return '';
      const date = this.parseDateTime(value);
      if (!date || isNaN(date.getTime())) return String(value);

      const pad = num => String(num).padStart(2, '0');

      if (this.readonly) {
        // Форматирование для readonly режима
        switch (this.type) {
          case 'date':
            return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
          case 'time':
            return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
          case 'datetime':
            return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
          default:
            return String(value);
        }
      } else {
        // Форматирование для редактируемого режима
        switch (this.type) {
          case 'date':
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
          case 'time':
            return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
          case 'datetime':
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
          default:
            return String(value);
        }
      }
    },

    formatTimeForInput(date) {
      const pad = num => String(num).padStart(2, '0');
      return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    },

    handleDateInput(event) {
      const value = event.target.value;
      this.localValue = value;
      this.pendingDateValue = null; // Сбрасываем pending значение после обработки

      if (!value) {
        this.$emit('input', null);
        return;
      }

      let result;
      const pad = num => String(num).padStart(2, '0');

      switch (this.type) {
        case 'date':
          result = `${value} 00:00:00`;
          break;
        case 'time':
          result = `1970-01-01 ${value}:00`;
          break;
        case 'datetime':
          const dt = new Date(value);
          result = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:00`;
          break;
      }

      this.$emit('input', result);
    },

    handleFocus() {
      if (this.readonly) return;
      
      this.$emit('start-edit');
      this.isEditing = true;
      
      if (this.isDateType) {
        this.pendingDateValue = this.localValue;
      }
    },

    submitChanges() {
      this.validateInput();
      if (this.hasError) return;

      this.isEditing = false;
      if (this.localValue !== this.originalValue) {
        this.$emit('input', this.localValue);
        this.$emit('update:modelValue', this.localValue);
      }
    },

    startEdit() {
      if (this.readonly || this.showOnlyIcon) return;
      
      this.$emit('start-edit');
      this.isEditing = true;
      
      if (this.isDateType) {
        this.pendingDateValue = this.localValue;
      }
      
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
        this.submitChanges();
      }
    },

    cancelEdit() {
      this.localValue = this.originalValue;
      this.pendingDateValue = null;
      this.isEditing = false;
      this.hasError = false;
      this.$emit('cancel');
    },

    validateInput() {
      if (!this.options.validate) {
        this.hasError = false;
        return true;
      }

      const result = this.options.validate(this.localValue);
      if (typeof result === 'string') {
        this.hasError = true;
        this.errorMessage = result;
        return false;
      }

      this.hasError = !result;
      this.errorMessage = this.hasError ? 'Недопустимое значение' : '';
      return !this.hasError;
    }
  }
};
</script>

<style scoped>
.kirh-text-field {
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

.icon-only-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  min-height: 32px;
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