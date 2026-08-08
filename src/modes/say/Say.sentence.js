// src/modes/say/Say.sentence.js
import { renderSentenceBar } from '@components/common/SentenceBar/SentenceBar.view';

export function renderSentence(container, words, onRemove, onSpeak, onClear) {
  renderSentenceBar(container, words, onRemove, onSpeak, onClear);
}