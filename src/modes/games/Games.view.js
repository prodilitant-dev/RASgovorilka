// src/modes/games/Games.view.js
import { createElement, clear } from '@utils/dom';
import { createCard } from '@components/common/Card/Card';
import { createIcon } from '@utils/icon';
import { attachGridEvents } from '@components/common/Grid/Grid.events';

const GAMES = [
  { id: 'memory',  label: 'Мемори',    icon: 'memory',  emoji: '🃏' },
  { id: 'fifteen', label: 'Пятнашки',  icon: 'fifteen', emoji: '🧩' },
];

export function renderGames(container, onSelectGame) {
  clear(container);

  const gridContainer = createElement('div', { className: 'grid-container no-panel' });
  const grid = createElement('div', { className: 'tiles-grid' });

  GAMES.forEach((game) => {
    const card = createCard({ id: game.id, text: game.label, emoji: '' });
    const bg = card.querySelector('.card__bg');
    if (bg) {
      bg.textContent = '';
      bg.appendChild(createIcon(game.icon, { fallback: game.emoji, size: 96 }));
    }
    grid.appendChild(card);
  });

  gridContainer.appendChild(grid);
  container.appendChild(gridContainer);

  if (container._gamesCleanup) {
    container._gamesCleanup();
    container._gamesCleanup = null;
  }
  container._gamesCleanup = attachGridEvents(grid, {
    onClick: (id) => onSelectGame(id),
    onLongPress: null,
  });
}