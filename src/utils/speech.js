// src/utils/speech.js
import { logger } from './logger';

let currentUtterance = null;

export function getVoices() {
  return window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
}

/**
 * Гарантирует, что список голосов загружен.
 */
export function ensureVoicesLoaded() {
  return new Promise((resolve) => {
    const voices = getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    const onVoicesChanged = () => {
      const newVoices = getVoices();
      if (newVoices.length > 0) {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        resolve(newVoices);
      }
    };
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(getVoices());
    }, 1000);
  });
}

/**
 * Останавливает текущий синтез речи
 */
export function stopSpeech() {
  if (currentUtterance) {
    logger.debug('Stopping speech');
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

/**
 * Синтезирует речь. Если уже идёт речь – останавливает её и начинает новую.
 */
export function speak(text, rate = 1, pitch = 1, voiceURI = '') {
  if (!window.speechSynthesis) {
    logger.warn('Speech synthesis not supported');
    return;
  }

  // Останавливаем текущую речь, если она есть
  stopSpeech();

  if (!text || !text.trim()) {
    logger.debug('Empty text, skipping speech');
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

  utterance.onend = () => {
    currentUtterance = null;
    logger.debug('Speech ended');
  };

  utterance.onerror = (e) => {
    currentUtterance = null;
    logger.warn('Speech error:', e);
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}