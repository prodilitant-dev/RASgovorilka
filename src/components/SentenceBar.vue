<template>
  <div class="sentence-bar" v-if="store.currentMode === 'say'">
    <div
      v-for="(word, index) in store.sentence"
      :key="index"
      class="sentence-word"
      @click="store.removeFromSentence(index)"
    >
      <span v-if="word.imageBase64"><img :src="word.imageBase64" style="width:24px;height:24px;object-fit:contain;"> </span>
      <span v-else>{{ word.emoji }} </span>
      {{ word.text }}
      <span class="remove-icon">✖</span>
    </div>
    <div class="sentence-actions">
      <button class="btn" @click="speakSentence">🗣️</button>
      <button class="btn-outline" @click="store.clearSentence">❌</button>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '@/stores/app';
import { useSpeech } from '@/composables/useSpeech';

const store = useAppStore();
const { speakWord } = useSpeech();

async function speakSentence() {
  for (const word of store.sentence) {
    await speakWord(word);
  }
}
</script>

<style scoped>
.sentence-bar {
  background: var(--sentence-bar-bg, #fff);
  border: 2px solid var(--accent, #4caf50);
  border-radius: 24px;
  padding: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  min-height: 70px;
}
.sentence-word {
  background: var(--accent, #4caf50);
  color: #000;
  padding: 6px 14px;
  border-radius: 40px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.remove-icon { font-size: 12px; opacity: 0.7; }
.sentence-actions {
  margin-left: auto;
  display: flex;
  gap: 10px;
}
.btn {
  border: none;
  padding: 8px 18px;
  border-radius: 40px;
  font-weight: bold;
  cursor: pointer;
  background: var(--accent, #4caf50);
  color: #000;
}
.btn-outline {
  background: transparent;
  border: 1px solid var(--accent, #4caf50);
  color: var(--accent, #4caf50);
  padding: 8px 18px;
  border-radius: 40px;
  font-weight: bold;
  cursor: pointer;
}
</style>
