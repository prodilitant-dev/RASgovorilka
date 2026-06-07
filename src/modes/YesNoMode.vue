<template>
  <div class="yesno-grid">
    <div
      v-for="ans in store.data.yesnoAnswers"
      :key="ans.id"
      class="yesno-card"
      @click="speakWord(ans)"
    >
      <img v-if="ans.imageBase64" :src="ans.imageBase64" class="yesno-image" />
      <span v-else class="yesno-emoji">{{ ans.emoji || '❓' }}</span>
      <div class="yesno-text">{{ ans.text }}</div>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '@/stores/app';
import { useSpeech } from '@/composables/useSpeech';

const store = useAppStore();
const { speakWord } = useSpeech();
</script>

<style scoped>
.yesno-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px;
}
.yesno-card {
  background: var(--bg-card, #fff);
  border: 2px solid var(--border, #d0d7de);
  border-radius: 10px;
  box-shadow: var(--shadow, 0 2px 8px rgba(0,0,0,0.08));
  padding: 20px;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  color: var(--text-main, #1a1a1a);
}
.yesno-image { width: 80px; height: 80px; object-fit: contain; }
.yesno-emoji { font-size: 64px; }
.yesno-text { font-size: 24px; }
</style>
