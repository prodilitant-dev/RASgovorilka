// src/components/common/SentenceBar/SentenceBar.view.js
import { createElement, clear, on } from '@utils/dom';
import { iconUrl } from '@utils/icon';
import { logger } from '@utils/logger';

export function renderSentenceBar(container, words, onRemove, onSpeak, onClear) {
  logger.debug('🔄 Rendering SentenceBar', { wordCount: words.length });
  clear(container);

  const bar = createElement('div', { className: 'sentence-bar' });

  // --- Кнопка очистки ---
  const clearBtn = createElement('button', {
    className: 'sentence-btn sentence-btn-clear',
    'aria-label': 'Очистить предложение',
    'data-log': 'sentence-clear',
  });
  const clearImg = createElement('img', {
    src: iconUrl('delete'),
    alt: '',
    className: 'sentence-btn__icon',
    draggable: 'false',
  });
  clearImg.addEventListener('error', () => {
    clearImg.replaceWith(document.createTextNode('❌'));
  });
  clearBtn.appendChild(clearImg);
  on(clearBtn, 'click', onClear);
  bar.appendChild(clearBtn);

  // --- Контейнер для слов ---
  const wrapper = createElement('div', { className: 'sentence-words-wrapper' });

  words.forEach((wordObj, index) => {
    const displayText = wordObj.display || wordObj.text || '';
    const wordEl = createElement('span', {
      className: 'sentence-word',
      'data-index': index,
      'data-log': `sentence-word:${index}`,
    }, displayText);

    on(wordEl, 'click', (e) => {
      e.stopPropagation();
      if (onRemove) onRemove(index);
    });

    wrapper.appendChild(wordEl);
  });

  bar.appendChild(wrapper);

  // --- Кнопка озвучивания ---
  const speakBtn = createElement('button', {
    className: 'sentence-btn sentence-btn-speak',
    'aria-label': 'Озвучить предложение',
    'data-log': 'sentence-speak',
  });
  const speakImg = createElement('img', {
    src: iconUrl('say-small'),
    alt: '',
    className: 'sentence-btn__icon',
    draggable: 'false',
  });
  speakImg.addEventListener('error', () => {
    speakImg.replaceWith(document.createTextNode('🗣️'));
  });
  speakBtn.appendChild(speakImg);
  on(speakBtn, 'click', onSpeak);
  bar.appendChild(speakBtn);

  container.appendChild(bar);
  logger.debug('✅ SentenceBar rendered');
}