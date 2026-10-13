// src/modes/common/sentence.js
import { getState, setState } from '@state/store';
import { renderSentenceBar } from '@components/common/SentenceBar';
import { speakFromState } from '@utils/speech';
import { toast } from '@utils/toast';
import { getInflectedWords, getInflectedSentence } from '@utils/inflect';

const lastCallbacks = {};

export function getWords() {
  return getState().sentenceWords || [];
}

export function addWord(text, sourceItem = null) {
  const state = getState();
  const words = state.sentenceWords || [];
  const newWord = {
    text,
    display: text,
    original: text,
    wordType: sourceItem?.wordType || 'noun',
    forms: sourceItem?.forms || null,
    animate: sourceItem?.animate,
  };
  setState({ sentenceWords: [...words, newWord] });
}

export function removeWord(index) {
  const state = getState();
  const words = state.sentenceWords || [];
  if (index >= 0 && index < words.length) {
    words.splice(index, 1);
    setState({ sentenceWords: words });
  }
}

export function clearSentence() {
  setState({ sentenceWords: [] });
}

export async function speakSentence() {
  const state = getState();
  const words = state.sentenceWords || [];
  if (words.length === 0) {
    toast('Нет слов для озвучивания', 'info');
    return;
  }
  const autoInflect = state.globalSettings?.autoInflect === true;
  const phrase = getInflectedSentence(words, autoInflect);
  if (!phrase) return;
  await speakFromState(phrase);
}

export function renderSentence(container, options = {}) {
  const state = getState();
  const words = state.sentenceWords || [];
  const autoInflect = state.globalSettings?.autoInflect === true;
  const displayWords = autoInflect ? getInflectedWords(words, true) : words.map((w) => w.text);

  if (options.onRemove) lastCallbacks.onRemove = options.onRemove;
  if (options.onClear) lastCallbacks.onClear = options.onClear;
  if (options.onSpeak) lastCallbacks.onSpeak = options.onSpeak;

  const callbacks = {
    onRemove: lastCallbacks.onRemove || removeWord,
    onClear: lastCallbacks.onClear || clearSentence,
    onSpeak: lastCallbacks.onSpeak || speakSentence,
  };

  renderSentenceBar(
    container,
    words.map((w, idx) => ({ ...w, display: displayWords[idx] || w.text })),
    callbacks.onRemove,
    callbacks.onSpeak,
    callbacks.onClear
  );
}
