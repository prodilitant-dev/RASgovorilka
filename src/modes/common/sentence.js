// src/modes/common/sentence.js
import { getState, setState } from '@state/store';
import { renderSentenceBar } from '@components/common/SentenceBar';
import { speak } from '@utils/speech';
import { toast } from '@utils/toast';

// Хранилище для запомненных колбэков
let lastCallbacks = {};

/**
 * Возвращает текущий массив слов из глобального состояния
 */
export function getWords() {
  return getState().sentenceWords || [];
}

/**
 * Добавляет слово в предложение
 * @param {string} text – текст слова
 * @param {Object} sourceItem – исходный объект (карточка или кнопка) с полями wordType, forms и т.д.
 */
export function addWord(text, sourceItem = null) {
  const state = getState();
  const words = state.sentenceWords || [];
  const newWord = {
    text,
    display: text,
    original: text,
    type: sourceItem?.wordType || 'noun',
    forms: sourceItem?.forms || {},
  };
  setState({ sentenceWords: [...words, newWord] });
}

/**
 * Удаляет слово по индексу
 */
export function removeWord(index) {
  const state = getState();
  const words = state.sentenceWords || [];
  if (index >= 0 && index < words.length) {
    words.splice(index, 1);
    setState({ sentenceWords: words });
  }
}

/**
 * Очищает всё предложение
 */
export function clearSentence() {
  setState({ sentenceWords: [] });
}

/**
 * Озвучивает текущее предложение
 * @returns {Promise<void>}
 */
export async function speakSentence() {
  const words = getWords();
  if (words.length === 0) {
    toast('Нет слов для озвучивания', 'info');
    return;
  }
  const text = words.map(w => w.text).join(' ');
  const voiceSettings = getState().voiceSettings || { rate: 1, pitch: 1, voiceURI: '' };
  await speak(text, voiceSettings.rate, voiceSettings.pitch, voiceSettings.voiceURI);
}

/**
 * Рендерит строку предложения в указанный контейнер
 * @param {HTMLElement} container – контейнер для рендеринга
 * @param {Object} options – дополнительные колбэки (можно переопределить)
 * @param {Function} options.onRemove – (index) => void
 * @param {Function} options.onClear – () => void
 * @param {Function} options.onSpeak – () => void
 */
export function renderSentence(container, options = {}) {
  const words = getWords();

  // Запоминаем переданные колбэки
  if (options.onRemove) lastCallbacks.onRemove = options.onRemove;
  if (options.onClear) lastCallbacks.onClear = options.onClear;
  if (options.onSpeak) lastCallbacks.onSpeak = options.onSpeak;

  // Используем запомненные или стандартные
  const callbacks = {
    onRemove: lastCallbacks.onRemove || removeWord,
    onClear: lastCallbacks.onClear || clearSentence,
    onSpeak: lastCallbacks.onSpeak || speakSentence,
  };

  renderSentenceBar(container, words, callbacks.onRemove, callbacks.onSpeak, callbacks.onClear);
}