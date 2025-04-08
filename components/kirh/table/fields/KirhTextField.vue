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
        <Icon :name="effectiveIconName" :size="options.iconSize || 24"/>
      </div>

      <!-- Readonly режим (не только иконка) -->
      <div
          v-else-if="readonly"
          :class="dynamicInputClass"
      >
        <Icon v-if="type === 'icon'" :name="effectiveIconName" :size="options.iconSize || 24" class="mr-1"/>
        <span class="align-top mt-1">{{ displayValue || '&nbsp;' }}</span>
      </div>

      <!-- Режим редактирования -->
      <template v-else>
        <Icon v-if="type === 'icon'" :name="effectiveIconName" :size="options.iconSize || 24" class="mx-2"/>
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
    readonly: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'text',
      validator: (value) => ['text', 'icon', 'date', 'time', 'datetime'].includes(value)
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['input', 'change', 'cancel'],
  data() {
    return {
      localValue: '',
      isEditing: false,
      originalValue: '',
      hasError: false,
      errorMessage: '',
      pendingDateValue: null // Новое поле для хранения временного значения даты/времени
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
        // Для типов даты/времени во время редактирования показываем pendingDateValue или localValue
        return this.isDateType
            ? (this.pendingDateValue !== null ? this.pendingDateValue : this.localValue)
            : this.localValue;
      }
      if ([null, undefined].includes(this.value)) return '';
      if (!this.isDateType) return String(this.value);
      return this.formatForDisplay(this.value);
    },
    dynamicInputClass() {
      if (!this.options.ev || !Array.isArray(this.options.ev)) {
        return this.options.cellClass || '';
      }

      const currentValue = this.displayValue || '';
      const matchedCondition = this.options.ev.find(condition =>
          String(condition.warn_ev || '') === String(currentValue)
      );

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
        this.pendingDateValue = null; // Сбрасываем pending значение при изменении props
      }
    }
  },
  methods: {
    handleInput(event) {
      const value = event.target.value;
      this.localValue = value;

      if (this.isDateType) {
        // Для типов даты/времени сохраняем временное значение, но не эмитируем событие
        this.pendingDateValue = value;
      } else {
        this.validateInput();
        this.$emit('input', value);
      }
    },

    handleBlur() {
      if (this.readonly || !this.isEditing) return;

      if (this.isDateType && this.pendingDateValue !== null) {
        // При потере фокуса для типов даты/времени - обрабатываем и отправляем значение
        this.processDateValue(this.pendingDateValue);
      }

      this.finalizeChanges();
    },

    handleEnter() {
      if (this.isDateType && this.pendingDateValue !== null) {
        // При нажатии Enter для типов даты/времени - обрабатываем и отправляем значение
        this.processDateValue(this.pendingDateValue);
      }

      this.finalizeChanges();
    },

    processDateValue(value) {
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
          result = `${value}`; // Только дата, без времени
          break;
        case 'time':
          result = `${value}`; // Только время, без даты
          break;
        case 'datetime':
          const dt = new Date(value);
          result = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:00`;
          break;
      }

      this.originalValue = result; // Обновляем originalValue чтобы submitChanges не эмитил лишний запрос
      this.$emit('input', result);
      this.$emit('change', result);
    },

    finalizeChanges() {
      this.validateInput();
      if (this.hasError) return;

      this.isEditing = false;
      // Для date/time типов изменения уже отправлены в processDateValue
      if (!this.isDateType && this.localValue !== this.originalValue) {
        this.$emit('input', this.localValue);
        this.$emit('change', this.localValue);
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
      this.isEditing = true;
      // При фокусе сохраняем текущее значение как pending
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
        this.$emit('change', this.localValue);
      }
    },

    startEdit() {
      if (this.readonly || this.showOnlyIcon) return;
      this.isEditing = true;
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
  padding: 8px;
}

.edit-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #9ca3af;
}

.edit-icon:hover {
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