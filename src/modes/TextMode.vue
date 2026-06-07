<template>
  <div class="text-input-area">
    <textarea
      v-model="text"
      placeholder="Введите текст..."
      class="text-area"
    ></textarea>
    <button class="btn" @click="speakText">🗣️</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useSpeech } from '@/composables/useSpeech';

const { speak } = useSpeech();
const text = ref('');

function speakText() {
  if (text.value.trim()) speak(text.value.trim());
}
</script>

<style scoped>
.text-input-area {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0;
  padding-bottom: 70px;
}
.text-area {
  flex: 1 1 auto;
  width: 100%;
  box-sizing: border-box;
  padding: 16px;
  border-radius: 10px;
  border: 2px solid var(--accent, #4caf50);
  background: var(--bg-card, #fff);
  color: var(--text-main, #1a1a1a);
  font-size: 20px;
  line-height: 1.4;
  resize: none;
  outline: none;
  overflow-y: auto;
  min-height: 0;
  font-family: inherit;
}
.btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  padding: 10px 20px;
  font-size: 18px;
  border: none;
  border-radius: 40px;
  font-weight: bold;
  cursor: pointer;
  background: var(--accent, #4caf50);
  color: #000;
}
</style>
