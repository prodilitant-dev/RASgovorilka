// src/modes/games/memory/Memory.view.js
import { createElement, clear, on } from '@utils/dom';
import { showCardImage } from '@utils/image/showCardImage';
import { logger } from '@utils/logger';

/**
 * Рендерит игровое поле Мемори
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
      showCardImage(cell, card, { cover: true, fontSize: '1.5em' });
    } else {
      cell.textContent = '❓';
      cell.style.backgroundImage = 'none';
      cell.style.backgroundSize = '';
      cell.style.backgroundPosition = '';
    }

    if (!card.isMatched && !card.isFlipped) {
      on(cell, 'click', () => onCardClick(card.id));
    }

    board.appendChild(cell);
  });

  wrap.appendChild(board);
  container.appendChild(wrap);
}