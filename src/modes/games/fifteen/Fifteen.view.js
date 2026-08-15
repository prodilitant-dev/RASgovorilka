// src/modes/games/fifteen/Fifteen.view.js
import { createElement, clear, on } from '@utils/dom';
import { getImageUrl } from '@services/imageService';
import { logger } from '@utils/logger';

/**
 * Рендерит игровое поле "Пятнашки"
 * @param {HTMLElement} container - контейнер
 * @param {Object} state - состояние игры { board, emptyIdx, moves, size, mode }
 * @param {Function} onCellClick - (index) => void
 */
export function renderFifteenBoard(container, state, onCellClick) {
  logger.debug(`🔄 Rendering Fifteen Board, size ${state.size}x${state.size}, moves ${state.moves}`);
  clear(container);

  const wrap = createElement('div', { className: 'game-wrapper' });

  // Информация о ходе
  const info = createElement('div', { className: 'game-info' });
  info.textContent = `Ходы: ${state.moves || 0}`;
  wrap.appendChild(info);

  // Игровое поле
  const board = createElement('div', {
    className: 'game-board',
    style: `grid-template-columns: repeat(${state.size}, 1fr);`,
    'data-size': state.size,
  });

  state.board.forEach((value, index) => {
    const isEmpty = (index === state.emptyIdx);
    const cell = createElement('div', {
      className: `game-cell ${isEmpty ? 'empty' : ''}`,
      'data-index': index,
    });

    if (isEmpty) {
      cell.textContent = '';
    } else {
      if (state.mode === 'numbers') {
        cell.textContent = value;
      } else {
        // Режим изображений
        if (value.imageId) {
          cell.textContent = '🔄';
          getImageUrl(value.imageId).then(url => {
            if (url) {
              cell.style.backgroundImage = `url(${url})`;
              cell.style.backgroundSize = 'cover';
              cell.style.backgroundPosition = 'center';
              cell.textContent = '';
            } else {
              cell.textContent = value.emoji || '❓';
            }
          });
        } else {
          cell.textContent = value.emoji || '❓';
        }
      }
    }

    if (!isEmpty) {
      on(cell, 'click', () => onCellClick(index));
    }

    board.appendChild(cell);
  });

  wrap.appendChild(board);
  container.appendChild(wrap);
}