<template>
  <div class="app" v-if="store.isLoaded">
    <button class="settings-fab" @pointerdown="startPress" @pointerup="cancelPress" @pointerleave="cancelPress" @pointercancel="cancelPress">⚙️</button>
    <div class="mode-buttons">
      <button
        v-for="(label, mode) in modeLabels"
        :key="mode"
        v-show="store.data.visibleModes[mode]"
        class="mode-btn"
        :class="{ active: store.currentMode === mode }"
        @click="store.setMode(mode)"
      >
        {{ label }}
      </button>
    </div>
    <CategoryTabs />
    <div class="main-area">
      <SentenceBar />
      <div class="grid-container">
        <component :is="currentModeComponent" />
      </div>
      <QuickButtons />
    </div>
    <SettingsModal />
    <ToastNotification />
  </div>
  <div v-else class="app-loading">Загрузка...</div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useAppStore } from '@/stores/app';
import { useSpeech } from '@/composables/useSpeech';
import { useFullscreen } from '@/composables/useFullscreen';
import CategoryTabs from '@/components/CategoryTabs.vue';
import SentenceBar from '@/components/SentenceBar.vue';
import QuickButtons from '@/components/QuickButtons.vue';
import SettingsModal from '@/components/SettingsModal.vue';
import ToastNotification from '@/components/ToastNotification.vue';
import SayMode from '@/modes/SayMode.vue';
import YesNoMode from '@/modes/YesNoMode.vue';
import TextMode from '@/modes/TextMode.vue';
import TimerMode from '@/modes/TimerMode.vue';
import WhatIsThisMode from '@/modes/WhatIsThisMode.vue';
import MathMode from '@/modes/MathMode.vue';

const store = useAppStore();
const { speak } = useSpeech();
const { setFullscreen } = useFullscreen();

const modeComponents = {
  say: SayMode,
  yesno: YesNoMode,
  text: TextMode,
  timer: TimerMode,
  whatisthis: WhatIsThisMode,
  math: MathMode
};
const currentModeComponent = computed(() => modeComponents[store.currentMode] || SayMode);

const modeLabels = {
  say: '🗣 Сказать',
  yesno: '🙂 Быстрые',
  text: '📝 Текст',
  timer: '⏱ Таймер',
  whatisthis: '❓ Что это',
  math: '🔢 Математика'
};

let pressTimer = null;
function startPress(e) {
  pressTimer = setTimeout(() => {
    store.isSettingsOpen = true;
  }, 5000);
  e.preventDefault();
}
function cancelPress() {
  clearTimeout(pressTimer);
}

// Применяем контраст немедленно при загрузке и при изменении
function applyContrast(enabled) {
  document.body.classList.toggle('high-contrast', enabled);
}

onMounted(async () => {
  await store.init();
  applyContrast(store.data.highContrast);
  if (store.data.fullscreenEnabled) {
    setFullscreen(true);
  }
  if (store.data.greetingEnabled && store.data.greetingText) {
    setTimeout(() => speak(store.data.greetingText), 300);
  }
});

watch(() => store.data.highContrast, (newVal) => {
  applyContrast(newVal);
});

watch(() => store.data.fullscreenEnabled, (enabled) => {
  setFullscreen(enabled);
});
</script>

<style scoped>
.app-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 24px;
}
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
}
.settings-fab {
  position: fixed;
  top: 5px;
  right: 10px;
  z-index: 500;
  background: var(--tab-bg, #e9ecef);
  border: 1px solid var(--border);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.7;
}
.mode-buttons {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  justify-content: center;
}
.mode-btn {
  padding: 6px 16px;
  border-radius: 10px;
  background: var(--tab-bg, #e9ecef);
  color: var(--text-main, #1a1a1a);
  font-weight: bold;
  border: none;
  cursor: pointer;
}
.mode-btn.active {
  background: var(--accent, #4caf50);
  color: #000;
}
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 12px;
  overflow: hidden;
}
.grid-container {
  flex: 1;
  overflow-y: auto;
}
</style>
