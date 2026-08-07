// src/modes/say/Say.sentence.js
import { renderSentenceBar } from '@components/common/SentenceBar/SentenceBar.view';
import { createElement } from '@utils/dom';

export function renderSentence(container, words, onRemove, onSpeak, onClear) {
  // Используем готовый renderSentenceBar
  renderSentenceBar(container, words, onRemove, onSpeak, onClear);
}