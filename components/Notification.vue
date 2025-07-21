<!-- components/Notification.vue -->
<template>
  <transition name="fade">
    <div v-if="message" 
         :class="[
           'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md',
           type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 
           type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
           type === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
           'bg-blue-50 border border-blue-200 text-blue-800'
         ]"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <Icon 
            :name="iconName" 
            :class="[
              'h-5 w-5',
              type === 'success' ? 'text-green-400' : 
              type === 'error' ? 'text-red-400' :
              type === 'warning' ? 'text-yellow-400' :
              'text-blue-400'
            ]"
          />
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium">{{ message }}</p>
        </div>
        <div class="ml-4 flex-shrink-0">
          <button
            @click="closeNotification"
            :class="[
              'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
              type === 'success' ? 'text-green-400 hover:text-green-600 focus:ring-green-500' : 
              type === 'error' ? 'text-red-400 hover:text-red-600 focus:ring-red-500' :
              type === 'warning' ? 'text-yellow-400 hover:text-yellow-600 focus:ring-yellow-500' :
              'text-blue-400 hover:text-blue-600 focus:ring-blue-500'
            ]"
          >
            <Icon name="heroicons:x-mark" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'

const props = defineProps({
  message: String,
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 5
  },
  persistent: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const message = ref(props.message)
const timeoutId = ref(null)

const iconName = computed(() => {
  switch (props.type) {
    case 'success': return 'heroicons:check-circle'
    case 'error': return 'heroicons:x-circle'
    case 'warning': return 'heroicons:exclamation-triangle'
    case 'info': return 'heroicons:information-circle'
    default: return 'heroicons:check-circle'
  }
})

const closeNotification = () => {
  message.value = ''
  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
    timeoutId.value = null
  }
  emit('close')
}

const startTimer = () => {
  if (!props.persistent && props.duration > 0) {
    timeoutId.value = setTimeout(() => {
      closeNotification()
    }, props.duration * 1000)
  }
}

watch(() => props.message, (newMessage) => {
  if (newMessage) {
    message.value = newMessage
    startTimer()
  }
})

onMounted(() => {
  if (props.message) {
    startTimer()
  }
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style> 