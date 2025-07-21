<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal-window" tabindex="-1" @keydown.esc="close">
        <header v-if="$slots.header" class="modal-header">
          <slot name="header" />
          <button class="modal-close" @click="close" title="Закрыть">✕</button>
        </header>
        <section class="modal-body">
          <slot />
        </section>
        <footer v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
const props = defineProps({
  modelValue: { type: Boolean, required: true }
});
const emit = defineEmits(['update:modelValue']);

function close() {
  emit('update:modelValue', false);
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close();
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-window {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.18);
  min-width: 320px;
  max-width: 95vw;
  min-height: 80px;
  max-height: 90vh;
  padding: 24px 20px;
  position: relative;
  outline: none;
  display: flex;
  flex-direction: column;
}
.modal-header {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}
.modal-close {
  background: none;
  border: none;
  font-size: 1.3em;
  color: #888;
  cursor: pointer;
  margin-left: 12px;
  transition: color 0.2s;
}
.modal-close:hover {
  color: #d00;
}
.modal-body {
  flex: 1 1 auto;
}
.modal-footer {
  margin-top: 16px;
  text-align: right;
}
</style> 