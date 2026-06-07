<template>
  <div class="timer-area">
    <div class="timer-display">{{ timer.display }}</div>
    <div class="timer-adjust">
      <button class="btn-outline" @click="adjustMinute(-1)">–</button>
      <span>{{ store.data.timerMinutes }} мин</span>
      <button class="btn-outline" @click="adjustMinute(1)">+</button>
    </div>
    <div class="timer-controls">
      <button class="btn" @click="timer.start()" :disabled="timer.isRunning">▶ Старт</button>
      <button class="btn-outline" @click="timer.reset(store.data.timerMinutes)">↺ Сброс</button>
    </div>
  </div>
</template>

<script setup>
import { watch, onUnmounted } from 'vue';
import { useAppStore } from '@/stores/app';
import { useTimer } from '@/composables/useTimer';
import { useSpeech } from '@/composables/useSpeech';

const store = useAppStore();
const { speak } = useSpeech();
const timer = useTimer(store.data.timerMinutes);

watch(() => store.data.timerMinutes, (newVal) => {
  timer.setMinutes(newVal);
});

watch(() => timer.secondsLeft, (newVal) => {
  if (newVal === 0 && timer.isRunning) {
    speak(store.data.timerPhrase);
  }
});

function adjustMinute(delta) {
  const newVal = store.data.timerMinutes + delta;
  if (newVal >= 1) {
    store.data.timerMinutes = newVal;
    store.save();
    timer.setMinutes(newVal);
  }
}

onUnmounted(() => {
  timer.cleanup();
});
</script>

<style scoped>
.timer-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-main, #1a1a1a);
}
.timer-display { font-size: 64px; font-weight: bold; }
.timer-adjust { display: flex; gap: 8px; align-items: center; }
.timer-controls { display: flex; gap: 12px; align-items: center; }
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
