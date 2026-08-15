// src/modes/games/memory/Memory.view.js
import { createElement, clear, on } from '@utils/dom';
import { getImageUrl } from '@services/imageService';
import { logger } from '@utils/logger';

/**
 * Рендерит игровое поле Мемори
 * @param {HTMLElement} container - контейнер
 * @param {Object} state - состояние игры
 * @param {Function} onCardClick - (cardId) => void
 */
export function renderMemoryBoard(container, state, onCardClick) {
  logger.debug(`🔄 Rendering Memory Board, ${state.cards.filter(c => c.isMatched).length / 2} pairs found`);
  clear(container);

  const wrap = createElement('div', { className: 'game-wrapper' });

  // Информация о ходе
  const info = createElement('div', { className: 'game-info' });
  const matched = state.cards.filter(c => c.isMatched).length / 2;
  const total = state.cards.length / 2;
  info.textContent = `Ходы: ${state.moves || 0}  |  Найдено пар: ${matched} / ${total}`;
  wrap.appendChild(info);

  // Игровое поле
  const board = createElement('div', {
    className: 'game-board',
    style: `grid-template-columns: repeat(${state.gridSize}, 1fr);`,
    'data-size': state.gridSize,
  });

  state.cards.forEach(card => {
    const cell = createElement('div', {
      className: `game-cell ${card.isMatched ? 'matched' : (card.isFlipped ? 'revealed' : 'hidden')}`,
      'data-card-id': card.id,
    });

    if (card.isFlipped || card.isMatched) {
      if (card.imageId) {
        cell.textContent = '🔄';
        getImageUrl(card.imageId).then(url => {
          if (url) {
            cell.style.backgroundImage = `url(${url})`;
            cell.style.backgroundSize = 'cover';
            cell.style.backgroundPosition = 'center';
            cell.textContent = '';
          } else {
            cell.textContent = card.emoji || '❓';
          }
        });
      } else {
        cell.textContent = card.emoji || '❓';
      }
    } else {
      cell.textContent = '❓';
      cell.style.backgroundImage = 'none';
    }

    // Клик только если карточка не сопоставлена и не открыта
    if (!card.isMatched && !card.isFlipped) {
      on(cell, 'click', () => onCardClick(card.id));
    }

    board.appendChild(cell);
  });

  wrap.appendChild(board);
  container.appendChild(wrap);
}