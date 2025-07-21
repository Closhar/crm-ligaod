<!-- components/ConfirmModal.vue -->
<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Иконка -->
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full" 
             :class="[
               type === 'danger' ? 'bg-red-100' : 
               type === 'warning' ? 'bg-yellow-100' : 
               'bg-blue-100'
             ]">
          <Icon 
            :name="iconName" 
            :class="[
              'h-6 w-6',
              type === 'danger' ? 'text-red-600' : 
              type === 'warning' ? 'text-yellow-600' : 
              'text-blue-600'
            ]"
          />
        </div>
        
        <!-- Заголовок -->
        <div class="mt-2 text-center">
          <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">{{ message }}</p>
          </div>
        </div>
        
        <!-- Кнопки -->
        <div class="flex justify-end gap-3 mt-4">
          <template v-if="props.alreadyMember">
            <div class="text-green-700 font-bold mb-2 w-full text-center">
              Этот игрок уже является членом клуба
            </div>
            <button
              @click="onCancel"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 w-full mt-2"
            >
              Закрыть
            </button>
          </template>
          <template v-else>
            <button
              @click="onCancel"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {{ cancelText }}
            </button>
            <button
              v-if="showConfirmButton"
              @click="onConfirm"
              :class="[
                'px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2',
                type === 'danger' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 
                type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500' : 
                'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              ]"
            >
              {{ confirmText }}
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Подтверждение'
  },
  message: {
    type: String,
    default: 'Вы уверены, что хотите выполнить это действие?'
  },
  type: {
    type: String,
    default: 'danger',
    validator: (value) => ['danger', 'warning', 'info'].includes(value)
  },
  confirmText: {
    type: String,
    default: 'Подтвердить'
  },
  cancelText: {
    type: String,
    default: 'Отмена'
  },
  alreadyMember: {
    type: Boolean,
    default: false
  },
  showConfirmButton: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const iconName = computed(() => {
  switch (props.type) {
    case 'danger': return 'heroicons:exclamation-triangle'
    case 'warning': return 'heroicons:exclamation-triangle'
    case 'info': return 'heroicons:information-circle'
    default: return 'heroicons:exclamation-triangle'
  }
})

const onConfirm = () => {
  emit('confirm')
}

const onCancel = () => {
  emit('cancel')
}
</script> 