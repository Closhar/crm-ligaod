import { ref, readonly } from 'vue';

// Глобальное состояние для принудительного обновления данных
const refreshTrigger = ref(0);

// Глобальное состояние для обновления конкретного события
const eventUpdateTrigger = ref<{ eventId: number; result?: string; additionalResult?: string } | null>(null);

export const useDataRefresh = () => {
  // Функция для принудительного обновления данных
  const triggerRefresh = () => {
    refreshTrigger.value++;
  };

  // Функция для обновления конкретного события
  const triggerEventUpdate = (eventId: number, result?: string, additionalResult?: string) => {
    eventUpdateTrigger.value = { eventId, result, additionalResult };
  };

  return {
    refreshTrigger: readonly(refreshTrigger),
    eventUpdateTrigger: readonly(eventUpdateTrigger),
    triggerRefresh,
    triggerEventUpdate
  };
}; 