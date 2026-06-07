<template>
  <Teleport to="body">
    <div v-if="visible" class="toast" :class="{ 'toast-visible': visible }">
      {{ message }}
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const visible = ref(false);
const message = ref('');
let timer = null;

function show(msg) {
  message.value = msg;
  visible.value = true;
  clearTimeout(timer);
  timer = setTimeout(() => {
    visible.value = false;
  }, 4000);
}

onMounted(() => {
  // Экспортируем метод глобально через provide/inject или event bus
  // Проще всего – через window
  window.__showToast = show;
});
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent, #4caf50);
  color: #000;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: bold;
  z-index: 9999;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}
.toast-visible {
  opacity: 1;
}
</style>
