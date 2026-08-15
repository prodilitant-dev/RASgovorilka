// src/modes/learning/Learning.view.js
import { createElement, clear } from '@utils/dom';
import { renderGrid, attachGridEvents } from '@components/common/Grid';

const ACTIVITIES = [
  { id: 'quiz', label: 'Викторина', icon: '🧠' },
  { id: 'guess', label: 'Угадайка', icon: '🔍' },
  { id: 'sorting', label: 'Сортировка', icon: '📊' },
  { id: 'math', label: 'Математика', icon: '🔢' }
];

export function renderLearning(container, onSelectActivity) {
  clear(container);
  const gridContainer = createElement('div', { className: 'grid-container no-panel' });
  const items = ACTIVITIES.map(act => ({
    id: act.id,
    text: act.label,
    emoji: act.icon
  }));

  const grid = renderGrid(gridContainer, items, {});
  container.appendChild(gridContainer);

  if (container._learningCleanup) {
    container._learningCleanup();
    container._learningCleanup = null;
  }
  container._learningCleanup = attachGridEvents(grid, {
    onClick: (id) => onSelectActivity(id),
    onLongPress: null
  });
}