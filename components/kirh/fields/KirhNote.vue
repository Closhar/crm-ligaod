<!-- components/Notification.vue -->
<template>
  <transition name="fade">
    <div v-if="message"
         :class="['p-4 rounded-md mb-4', type === 'success' ? 'bg-green-600 text-gray-50' : 'bg-red-600 text-gray-50']">
      {{ message }}
    </div>
  </transition>
</template>

<script setup>
import {ref, watch, onMounted} from 'vue';

const props = defineProps({
  message: String, // Текст сообщения
  type: {
    type: String,
    default: 'success', // Тип сообщения: success или error
  },
  duration: {
    type: Number,
    default: 5, // Длительность отображения сообщения в секундах
  },
});

const message = ref(props.message);

// Автоматическое скрытие сообщения через заданное время
watch(() => props.message, (newMessage) => {
  if (newMessage) {
    message.value = newMessage;
    setTimeout(() => {
      message.value = '';
    }, props.duration * 1000);
  }
});

// Инициализация при монтировании
onMounted(() => {
  if (props.message) {
    if (props.duration > 0) {
      setTimeout(() => {
        message.value = '';
      }, props.duration * 1000);
    }
  }

});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>