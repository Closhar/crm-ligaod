<template>
  <div v-if="isLoading" class="loader bg-gray-800">
    <div class="emblem">
      <img :src="logo" alt="Logo" class="emblem-img">
    </div>
  </div>
</template>

<script setup>
defineProps({
  isLoading: Boolean,
  logo: {
    type: String,
    default: '/images/logo.png',
  },
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
}

.emblem-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
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
