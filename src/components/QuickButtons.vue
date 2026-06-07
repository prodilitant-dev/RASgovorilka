<template>
  <div class="quick-buttons" v-if="store.currentMode === 'say'">
    <div
      v-for="btn in store.data.quickButtons"
      :key="btn.id"
      class="quick-btn"
      @click="handleQuickClick(btn)"
    >
      <span v-if="btn.imageBase64"><img :src="btn.imageBase64" style="width:24px;height:24px;object-fit:contain;"> </span>
      <span v-else>{{ btn.emoji || '🔘' }} </span>
      {{ btn.text }}
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '@/stores/app';
import { useSpeech } from '@/composables/useSpeech';

const store = useAppStore();
const { speakWord } = useSpeech();

function handleQuickClick(btn) {
  if (store.currentMode === 'say') {
    store.addToSentence(btn);
  } else {
    speakWord(btn);
  }
}
</script>

<style scoped>
.quick-buttons {
  display: flex;
  gap: 8px;
  padding: 8px 0;
  overflow-x: auto;
}
.quick-btn {
  background: var(--tab-bg, #e9ecef);
  border: 1px solid var(--border, #d0d7de);
  border-radius: 10px;
  padding: 8px 20px;
  white-space: nowrap;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-main, #1a1a1a);
}
</style>
