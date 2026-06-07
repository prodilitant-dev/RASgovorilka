import { invoke } from '@tauri-apps/api/core';

export function useSpeech() {
  async function speak(text) {
    if (!text) return;
    try {
      // Пробуем Tauri-команду (spd-say), она не отменяет предыдущие
      await invoke('speak_native', { text });
    } catch (e) {
      // Если Tauri-команда недоступна (браузер / Android), используем Web Speech API БЕЗ cancel
      if ('speechSynthesis' in window) {
        return new Promise(resolve => {
          const utter = new SpeechSynthesisUtterance(text);
          utter.lang = 'ru-RU';
          utter.rate = 0.9;
          utter.onend = resolve;
          utter.onerror = resolve;
          window.speechSynthesis.speak(utter);  // очередь, не отменяем предыдущее
        });
      }
    }
  }

  async function speakWord(word) {
    if (word && word.text) await speak(word.text);
  }

  return { speak, speakWord };
}
