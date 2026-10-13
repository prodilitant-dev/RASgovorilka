// src/utils/speech.js
import { logger } from './logger';
import { getState } from '@state/store';

let currentUtterance = null;

export function getVoices() {
  return window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
}

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

export function stopSpeech() {
  if (currentUtterance) {
    logger.debug('Stopping speech');
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

/**
 * Синтез речи.
 * @param {string} text
 * @param {number} rate   — скорость 0.5–2.0
 * @param {number} pitch  — тональность 0.5–2.0
 * @param {number} volume — громкость 0–1
 * @param {string} voiceURI — URI голоса (пусто = системный)
 */
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

  if (voiceURI) {
    const voices = getVoices();
    const found = voices.find((v) => v.voiceURI === voiceURI);
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

/**
 * Синтез речи с настройками из текущего стейта.
 * Читает `state.globalSettings.voiceSettings`.
 *
 * @param {string} text
 */
export function speakFromState(text) {
  const state = getState();
  const vs = state.globalSettings?.voiceSettings || {};
  return speak(text, vs.rate ?? 1, vs.pitch ?? 1, vs.volume ?? 1, vs.voiceURI ?? '');
}
