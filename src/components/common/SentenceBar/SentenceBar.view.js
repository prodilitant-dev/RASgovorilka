// src/components/common/SentenceBar/SentenceBar.view.js
import { createElement, clear, on } from '@utils/dom';
import { logger } from '@utils/logger';

/**
 * Рендерит панель предложения
 * @param {HTMLElement} container - контейнер, куда рендерить
 * @param {Array} words - массив объектов { text, display?, original?, type? }
 * @param {Function} onRemove - (index) => void, вызывается при клике на слово
 * @param {Function} onSpeak - () => void, вызывается при клике на кнопку озвучивания
 * @param {Function} onClear - () => void, вызывается при клике на кнопку очистки
 */
export function renderSentenceBar(container, words, onRemove, onSpeak, onClear) {
  logger.debug('🔄 Rendering SentenceBar', { wordCount: words.length });
  clear(container);

  const bar = createElement('div', { className: 'sentence-bar' });

  // Кнопка очистки
  const clearBtn = createElement('button', {
    className: 'sentence-btn sentence-btn-clear',
    'aria-label': 'Очистить предложение',
    'data-log': 'sentence-clear',
  }, '❌');
  on(clearBtn, 'click', onClear);
  bar.appendChild(clearBtn);

  // Контейнер для слов
  const wrapper = createElement('div', { className: 'sentence-words-wrapper' });

  words.forEach((wordObj, index) => {
    const displayText = wordObj.display || wordObj.text || '';
    const wordEl = createElement('span', {
      className: 'sentence-word',
      'data-index': index,
      'data-log': `sentence-word:${index}`,
    }, displayText);

    // Клик по слову – удаляем
    on(wordEl, 'click', (e) => {
      e.stopPropagation();
      if (onRemove) onRemove(index);
    });

    wrapper.appendChild(wordEl);
  });

  bar.appendChild(wrapper);

  // Кнопка озвучивания
  const speakBtn = createElement('button', {
    className: 'sentence-btn sentence-btn-speak',
    'aria-label': 'Озвучить предложение',
    'data-log': 'sentence-speak',
  }, '🗣️');
  on(speakBtn, 'click', onSpeak);
  bar.appendChild(speakBtn);

  container.appendChild(bar);
  logger.debug('✅ SentenceBar rendered');
}