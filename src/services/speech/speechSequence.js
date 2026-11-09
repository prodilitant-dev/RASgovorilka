// src/services/speech/speechSequence.js
import { logger } from '@utils/logger';
import { applyVoiceSettings } from '@utils/speech';

export function speakSequence(text, { voiceSettings = {}, onWord, onEnd, onError } = {}) {
  if (!window.speechSynthesis) {
    logger.warn('Speech synthesis not supported');
    if (onError) onError(new Error('Not supported'));
    return null;
  }

  stopSequence();

  const utt = new SpeechSynthesisUtterance(text);
  applyVoiceSettings(utt, voiceSettings);

  utt.onboundary = (event) => {
    if ((event.name === 'word' || event.name === 'sentence') && onWord) {
      onWord(event.charIndex, event.charLength || 0);
    }
  };

  utt.onend = () => {
    if (onEnd) onEnd();
  };

  utt.onerror = (e) => {
    if (e.error !== 'interrupted' && onError) {
      logger.error('Speech Sequence error:', e);
      onError(e);
    }
  };

  window.speechSynthesis.speak(utt);
  return utt;
}

export function stopSequence() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
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
