// src/modes/stories/reader/reader.dom.js
import { createElement, clear } from '@utils/dom';
import { createIcon } from '@utils/icon';

/**
 * Собирает DOM читалки истории: overlay, шапку, контент, футер.
 * Чистая фабрика — без состояния и обработчиков.
 *
 * @param {Object} story - объект истории (используется только title)
 * @returns {Object} refs - ссылки на ключевые узлы
 */
export function createReaderDOM(story) {
  const overlay = createElement('div', { className: 'story-reader-overlay' });

  // Шапка
  const header = createElement('div', { className: 'story-reader-header' });

  const btnPlay = createElement('button', {
    className: 'story-reader-play',
    'aria-label': 'Воспроизвести',
  });
  btnPlay.appendChild(
    createIcon('play', { fallback: '▶️', size: 36, className: 'story-reader-icon' })
  );

  const btnClose = createElement('button', {
    className: 'story-reader-close',
    'aria-label': 'Закрыть',
  });
  btnClose.appendChild(
    createIcon('close', { fallback: '✕', size: 36, className: 'story-reader-icon' })
  );

  const titleEl = createElement(
    'div',
    { className: 'story-reader-title' },
    story.title || 'История'
  );
  const dotsWrap = createElement('div', { className: 'story-reader-dots' });

  const headerLeft = createElement('div', { className: 'story-reader-header-left' }, [btnPlay]);
  const headerCenter = createElement('div', { className: 'story-reader-header-center' }, [
    titleEl,
    dotsWrap,
  ]);
  const headerRight = createElement('div', { className: 'story-reader-header-right' }, [btnClose]);

  header.appendChild(headerLeft);
  header.appendChild(headerCenter);
  header.appendChild(headerRight);

  // Контент
  const contentArea = createElement('div', { className: 'story-reader-content' });
  const imageWrap = createElement('div', { className: 'story-reader-image-wrap' });
  const imageEl = createElement('img', { className: 'story-reader-image', alt: '' });
  imageWrap.appendChild(imageEl);

  const cardsTray = createElement('div', { className: 'story-reader-cards-tray' });

  contentArea.appendChild(imageWrap);
  contentArea.appendChild(cardsTray);

  // Футер
  const footer = createElement('div', { className: 'story-reader-footer' });
  const btnPrev = createElement(
    'button',
    { className: 'btn btn-secondary story-nav-btn' },
    '< Назад'
  );
  const btnNext = createElement(
    'button',
    { className: 'btn btn-primary story-nav-btn' },
    'Далее >'
  );
  footer.appendChild(btnPrev);
  footer.appendChild(btnNext);

  // Сборка
  overlay.appendChild(header);
  overlay.appendChild(contentArea);
  overlay.appendChild(footer);

  return {
    overlay,
    header,
    contentArea,
    footer,
    btnPlay,
    btnClose,
    btnPrev,
    btnNext,
    titleEl,
    dotsWrap,
    imageEl,
    imageWrap,
    cardsTray,
  };
}

/**
 * Обновляет состояние кнопки Play/Pause (иконка + aria-label + класс active).
 *
 * @param {HTMLButtonElement} btnPlay
 * @param {'stopped'|'playing'|'paused'} state
 */
export function updatePlayButton(btnPlay, state) {
  clear(btnPlay);

  if (state === 'playing') {
    btnPlay.appendChild(
      createIcon('pause', { fallback: '⏸', size: 36, className: 'story-reader-icon' })
    );
    btnPlay.classList.add('active');
    btnPlay.setAttribute('aria-label', 'Пауза');
  } else {
    btnPlay.appendChild(
      createIcon('play', { fallback: '▶️', size: 36, className: 'story-reader-icon' })
    );
    btnPlay.classList.remove('active');
    btnPlay.setAttribute('aria-label', 'Воспроизвести');
  }
}
