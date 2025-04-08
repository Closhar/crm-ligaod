<template>
  <div v-if="isLoading" class="loader bg-gray-800">
    <div class="emblem">
      <img class="emblem" src="/ldr.png">
    </div>
  </div>
</template>

<script setup>
defineProps({
  isLoading: Boolean
});
</script>

<style scoped>
.loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.emblem {
  width: 100px;
  height: 100px;
  background-color: #0074D9; /* Цвет эмблемы */
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.7;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.7;
  }
}
</style>