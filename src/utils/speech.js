// src/utils/speech.js
import { logger } from './logger';
import { getState } from '@state/store';

let currentUtterance = null;
let cachedVoices = [];
let cachedVoice = null;
let cachedVoiceURI = '';
let warmUpDone = false;

export function getVoices() {
  if (!window.speechSynthesis) return [];
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices() || [];
  }
  return cachedVoices;
}

export function initSpeech() {
  if (!window.speechSynthesis) {
    logger.warn('Speech synthesis not supported');
    return;
  }
  cachedVoices = window.speechSynthesis.getVoices() || [];
  logger.debug(`Speech init: ${cachedVoices.length} голосов`);
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    cachedVoices = window.speechSynthesis.getVoices() || [];
    logger.debug(`Speech voices updated: ${cachedVoices.length}`);
    cachedVoice = null;
  });
}

export function ensureVoicesLoaded() {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) return resolve([]);
    const voices = getVoices();
    if (voices.length > 0) return resolve(voices);
    const onVoicesChanged = () => {
      const newVoices = window.speechSynthesis.getVoices() || [];
      if (newVoices.length > 0) {
        cachedVoices = newVoices;
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        resolve(newVoices);
      }
    };
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      cachedVoices = window.speechSynthesis.getVoices() || [];
      resolve(cachedVoices);
    }, 1500);
  });
}

export function warmUpSpeech() {
  if (warmUpDone || !window.speechSynthesis) return;
  warmUpDone = true;
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    u.rate = 10;
    u.lang = 'ru-RU';
    window.speechSynthesis.speak(u);
    setTimeout(() => {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      } // <-- добавили комментарий
    }, 50);
    logger.debug('Speech warm-up triggered');
  } catch (err) {
    logger.warn('Speech warm-up failed', err);
  }
}

export function stopSpeech() {
  if (currentUtterance) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

/**
 * ЭКСПОРТИРУЕМ: Поиск голоса по URI или выбор русского по умолчанию.
 * Используется в speechSequence.js, чтобы не дублировать код.
 */
export function resolveVoice(voiceURI) {
  if (cachedVoice && cachedVoiceURI === voiceURI) return cachedVoice;

  const voices = getVoices();
  if (voices.length === 0) return null;

  let found = null;
  if (voiceURI) {
    found = voices.find((v) => v.voiceURI === voiceURI) || null;
  }

  if (!found) {
    found = voices.find((v) => v.lang && v.lang.startsWith('ru')) || voices[0] || null;
  }

  cachedVoice = found;
  cachedVoiceURI = voiceURI;
  return found;
}

/**
 * Настраивает объект utterance на основе настроек голоса.
 */
export function applyVoiceSettings(utterance, vs) {
  utterance.lang = 'ru-RU';
  utterance.rate = vs.rate ?? 1;
  utterance.pitch = vs.pitch ?? 1;
  utterance.volume = vs.volume ?? 1;

  const voice = resolveVoice(vs.voiceURI ?? '');
  if (voice) utterance.voice = voice;
}

export function speak(text, rate = 1, pitch = 1, volume = 1, voiceURI = '') {
  if (!window.speechSynthesis) {
    logger.warn('Speech synthesis not supported');
    return;
  }

  stopSpeech();

  if (!text || !text.trim()) {
    logger.debug('Empty text, skipping speech');
    return;
  }

  logger.debug(`Speak: "${text}"`, { rate, pitch, volume, voiceURI });
  const utterance = new SpeechSynthesisUtterance(text);

  // Используем общую функцию настройки
  applyVoiceSettings(utterance, { rate, pitch, volume, voiceURI });

  utterance.onend = () => {
    currentUtterance = null;
  };
  utterance.onerror = (e) => {
    currentUtterance = null;
    logger.warn('Speech error:', e);
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function speakFromState(text) {
  const state = getState();
  const vs = state.globalSettings?.voiceSettings || {};
  return speak(text, vs.rate ?? 1, vs.pitch ?? 1, vs.volume ?? 1, vs.voiceURI ?? '');
}
