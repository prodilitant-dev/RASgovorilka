// src/utils/speech.js
import { logger } from './logger';
import { getState } from '@state/store';

let currentUtterance = null;

// Кэш голосов и выбранного голоса
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

/**
 * Инициализация модуля синтеза речи.
 * Вызывается один раз при старте приложения.
 * Слушает voiceschanged, чтобы обновлять кэш при появлении/изменении голосов.
 */
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

/**
 * Ждёт загрузку голосов. Не блокирует UI — можно вызывать в фоне.
 */
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

/**
 * Прогрев движка синтеза. Делает тихий короткий speak, чтобы движок
 * загрузил сэмплы в память. Без прогрева первый реальный speak тормозит
 * (особенно на Android).
 *
 * ВАЖНО: вызывать только из user gesture (первый touch/click).
 * На Android Chrome speech без user gesture игнорируется.
 */
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
      }
    }, 50);
    logger.debug('Speech warm-up triggered');
  } catch (err) {
    logger.warn('Speech warm-up failed', err);
  }
}

export function stopSpeech() {
  if (currentUtterance) {
    logger.debug('Stopping speech');
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

function resolveVoice(voiceURI) {
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
  utterance.lang = 'ru-RU';
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;

  const voice = resolveVoice(voiceURI);
  if (voice) utterance.voice = voice;

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

export function speakFromState(text) {
  const state = getState();
  const vs = state.globalSettings?.voiceSettings || {};
  return speak(text, vs.rate ?? 1, vs.pitch ?? 1, vs.volume ?? 1, vs.voiceURI ?? '');
}
