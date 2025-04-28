<template>
  <div class="kirh-swap-field" :class='options.cell_class'>
    <button
      class=" px-2 py-1 flex items-center gap-1 transition-colors shadow-sm"
      @click="handleSwap"
      :disabled="loading"
    >
      <Icon :name="options.icon || 'material-symbols:swap-horiz'" size="2em" />
      {{ options.button_text || '' }}
    </button>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'KirhSwapField',
  props: {
    value: {
      type: [String, Number, Object],
      default: null
    },
    rowData: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    },
    apiUrl: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const loading = ref(false);

    const handleSwap = async () => {
      try {
        loading.value = true;
        
        // Получаем имена полей для обмена из опций
        const { field1, field2 } = props.options;
        
        if (!field1 || !field2) {
          throw new Error('Не указаны поля для обмена');
        }

        // Используем основной API-адрес
        const response = await fetch(`${props.apiUrl}/${props.rowData.id}/swap-fields`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            field1,
            field2
          })
        });

        if (!response.ok) {
          throw new Error('Ошибка при обмене значений');
        }

        // Эмитим событие обновления данных
        emit('update:modelValue', props.value);
        emit('change', props.value);
        
      } catch (error) {
        console.error('Ошибка при обмене значений:', error);
        emit('error', error.message);
      } finally {
        loading.value = false;
      }
    };

    return {
      loading,
      handleSwap
    };
  }
};
</script>

<style scoped>
.kirh-swap-field {
  display: flex;
  align-items: center;
  justify-content: center;
}

.kirh-swap-field button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 