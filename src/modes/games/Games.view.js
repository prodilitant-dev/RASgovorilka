// src/modes/games/Games.view.js
import { createElement, clear } from '@utils/dom';
import { renderGrid, attachGridEvents } from '@components/common/Grid';

const GAMES = [
  { id: 'memory', label: 'Мемори', icon: '🃏' },
  { id: 'fifteen', label: 'Пятнашки', icon: '🧩' }
];

export function renderGames(container, onSelectGame) {
  clear(container);
  const gridContainer = createElement('div', { className: 'grid-container no-panel' });
  const items = GAMES.map(game => ({
    id: game.id,
    text: game.label,
    emoji: game.icon
  }));

  const grid = renderGrid(gridContainer, items, {});
  container.appendChild(gridContainer);

  if (container._gamesCleanup) {
    container._gamesCleanup();
    container._gamesCleanup = null;
  }
  container._gamesCleanup = attachGridEvents(grid, {
    onClick: (id) => onSelectGame(id),
    onLongPress: null
  });
}