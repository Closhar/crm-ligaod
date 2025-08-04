<template>
  <ClientOnly>
    <Teleport to="body">
      <div class="notification-container">
        <TransitionGroup 
          name="notification" 
          tag="div" 
          class="fixed top-4 right-4 z-50 space-y-2"
        >
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-toast bg-green-800 bg-opacity-90 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm border border-green-700"
            @click="removeNotification(notification.id)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="font-semibold text-sm mb-1">{{ notification.title }}</h4>
                <p class="text-sm opacity-90">{{ notification.message }}</p>
              </div>
              <button 
                @click.stop="removeNotification(notification.id)"
                class="ml-3 text-white opacity-70 hover:opacity-100 transition-opacity"
              >
                <Icon name="material-symbols:close" size="1.2em" />
              </button>
            </div>
            
            <!-- Прогресс-бар для автоскрытия -->
            <div class="mt-2 h-1 bg-green-600 rounded-full overflow-hidden">
              <div 
                class="h-full bg-white transition-all duration-300 ease-linear"
                :style="{ width: `${notification.progress}%` }"
              ></div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script setup>
import { useNotifications } from '~/composables/useNotifications';

const { notifications, removeNotification } = useNotifications();
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style> 