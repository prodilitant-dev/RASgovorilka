// src/utils/speech.js
import { logger } from './logger';

export function getVoices() {
  return window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
}

/**
 * Гарантирует, что список голосов загружен.
 * Если голоса ещё не доступны, ждём события voiceschanged.
 * @returns {Promise<SpeechSynthesisVoice[]>}
 */
export function ensureVoicesLoaded() {
  return new Promise((resolve) => {
    const voices = getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    // Если голосов нет, подписываемся на событие
    const onVoicesChanged = () => {
      const newVoices = getVoices();
      if (newVoices.length > 0) {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        resolve(newVoices);
      }
    };
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    // Таймаут на случай, если событие не произойдёт (например, в некоторых браузерах)
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(getVoices());
    }, 1000);
  });
}

export function speak(text, rate = 1, pitch = 1, voiceURI = '') {
  if (!window.speechSynthesis) {
    logger.warn('Speech synthesis not supported');
    return;
  }
  logger.debug(`Speak: "${text}"`, { rate, pitch, voiceURI });
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ru-RU';
  utterance.rate = rate;
  utterance.pitch = pitch;
  if (voiceURI) {
    const voices = getVoices();
    const found = voices.find(v => v.voiceURI === voiceURI);
    if (found) utterance.voice = found;
  }
  window.speechSynthesis.speak(utterance);
}