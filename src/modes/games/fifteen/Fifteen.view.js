// src/modes/games/fifteen/Fifteen.view.js
import { createElement, clear, on } from '@utils/dom';
import { logger } from '@utils/logger';

/**
 * Рендерит игровое поле "Пятнашки"
 * @param {HTMLElement} container
 * @param {Object} state - { board, emptyIdx, moves, size }
 * @param {Function} onCellClick - (index) => void
 */
export function renderFifteenBoard(container, state, onCellClick) {
  logger.debug(`🔄 Rendering Fifteen Board, size ${state.size}x${state.size}, moves ${state.moves}`);
  clear(container);

  const wrap = createElement('div', { className: 'game-wrapper' });

  const info = createElement('div', { className: 'game-info' });
  info.textContent = `Ходы: ${state.moves || 0}`;
  wrap.appendChild(info);

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
      cell.textContent = value;
    }

    if (!isEmpty) {
      on(cell, 'click', () => onCellClick(index));
    }

    board.appendChild(cell);
  });

  wrap.appendChild(board);
  container.appendChild(wrap);
}