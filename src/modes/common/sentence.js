// src/modes/common/sentence.js
import { getState, setState } from '@state/store';
import { renderSentenceBar } from '@components/common/SentenceBar';
import { speakSequence } from '@services/speech/speechSequence';
import { toast } from '@utils/toast';
import { getInflectedWords } from '@utils/inflect';

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
    styleColor: sourceItem?.styleColor || null, // <-- ДОБАВЛЕНО
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

export async function speakSentence(container) {
  const state = getState();
  const words = state.sentenceWords || [];
  if (words.length === 0) {
    toast('Нет слов для озвучивания', 'info');
    return;
  }

  const autoInflect = state.globalSettings?.autoInflect === true;
  const displayWords = autoInflect ? getInflectedWords(words, true) : words.map((w) => w.text);

  let fullText = '';
  const mapping = [];
  displayWords.forEach((wordText, index) => {
    const start = fullText.length;
    fullText += wordText;
    const end = fullText.length;
    mapping.push({ start, end, index });
    if (index < displayWords.length - 1) fullText += ' ';
  });

  // ИЩЕМ ТОЛЬКО СЛОВА (убрали .sentence-btn)
  const wordEls = container ? Array.from(container.querySelectorAll('.sentence-word')) : [];

  const vs = state.globalSettings?.voiceSettings || {};

  speakSequence(fullText, {
    voiceSettings: vs,
    onWord: (charIndex) => {
      const activeMapping = mapping.find(m => charIndex >= m.start && charIndex <= m.end);
      if (activeMapping) {
        const el = wordEls[activeMapping.index];
        if (el && !el.classList.contains('sentence-word--active')) {
          wordEls.forEach(w => {
            w.classList.remove('sentence-word--active');
            w.style.borderColor = ''; // Сбрасываем кастомный бордюр
          });
          
          el.classList.add('sentence-word--active');
          
          // Если у слова есть свой цвет, применяем его к бордюру
          const wordData = words[activeMapping.index];
          if (wordData && wordData.styleColor) {
            el.style.borderColor = wordData.styleColor;
          }
          
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    },
    onEnd: () => {
      wordEls.forEach(w => {
        w.classList.remove('sentence-word--active');
        w.style.borderColor = '';
      });
    },
  });
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
    // Передаем container в speakSentence
    onSpeak: lastCallbacks.onSpeak || (() => speakSentence(container)),
  };

  renderSentenceBar(
    container,
    words.map((w, idx) => ({ ...w, display: displayWords[idx] || w.text })),
    callbacks.onRemove,
    callbacks.onSpeak,
    callbacks.onClear
  );
}
