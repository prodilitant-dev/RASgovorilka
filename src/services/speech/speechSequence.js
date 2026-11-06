// src/services/speech/speechSequence.js
import { logger } from '@utils/logger';

let currentUtterance = null;

/**
 * Глобальный сервис для воспроизведения длинных текстов с подсветкой слов.
 * 
 * @param {string} text - Полный текст для озвучки.
 * @param {Object} options - Настройки.
 * @param {Object} options.voiceSettings - Настройки голоса (rate, pitch, volume, voiceURI).
 * @param {Function} options.onWord - Коллбэк при произнесении слова (charIndex, wordLength).
 * @param {Function} options.onEnd - Коллбэк по завершении.
 * @param {Function} options.onError - Коллбэк при ошибке.
 * @returns {SpeechSynthesisUtterance} - Объект utterance (для возможности pause/resume).
 */
export function speakSequence(text, { voiceSettings = {}, onWord, onEnd, onError } = {}) {
  if (!window.speechSynthesis) {
    logger.warn('Speech synthesis not supported');
    if (onError) onError(new Error('Not supported'));
    return null;
  }

  stopSequence(); // Останавливаем предыдущее, если было

  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'ru-RU';
  utt.rate = voiceSettings.rate ?? 1;
  utt.pitch = voiceSettings.pitch ?? 1;
  utt.volume = voiceSettings.volume ?? 1;

  if (voiceSettings.voiceURI) {
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.voiceURI === voiceSettings.voiceURI);
    if (voice) utt.voice = voice;
  }

  utt.onboundary = (event) => {
    if ((event.name === 'word' || event.name === 'sentence') && onWord) {
      onWord(event.charIndex, event.charLength || 0);
    }
  };

  utt.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  utt.onerror = (e) => {
    currentUtterance = null;
    if (e.error !== 'interrupted' && onError) {
      logger.error('Speech Sequence error:', e);
      onError(e);
    }
  };

  currentUtterance = utt;
  window.speechSynthesis.speak(utt);
  return utt;
}

export function stopSequence() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}

export function pauseSequence() {
  if (window.speechSynthesis && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
  }
}

export function resumeSequence() {
  if (window.speechSynthesis && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}