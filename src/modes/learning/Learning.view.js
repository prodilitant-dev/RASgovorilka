// src/modes/learning/Learning.view.js
import { createElement, clear } from '@utils/dom';
import { createCard } from '@components/common/Card/Card';
import { createIcon } from '@utils/icon';
import { attachGridEvents } from '@components/common/Grid/Grid.events';

const ACTIVITIES = [
  { id: 'quiz',    label: 'Викторина',   icon: 'quiz',    emoji: '🧠' },
  { id: 'guess',   label: 'Угадайка',    icon: 'guess',   emoji: '🔍' },
  { id: 'sorting', label: 'Сортировка',  icon: 'sorting', emoji: '📊' },
  { id: 'math',    label: 'Математика',  icon: 'math',    emoji: '🔢' },
];

export function renderLearning(container, onSelectActivity) {
  clear(container);

  const gridContainer = createElement('div', { className: 'grid-container no-panel' });
  const grid = createElement('div', { className: 'tiles-grid' });

  ACTIVITIES.forEach((act) => {
    const card = createCard({ id: act.id, text: act.label, emoji: '' });
    // Вставляем иконку вместо эмодзи
    const bg = card.querySelector('.card__bg');
    if (bg) {
      bg.textContent = '';
      bg.appendChild(createIcon(act.icon, { fallback: act.emoji, size: 48 }));
    }
    grid.appendChild(card);
  });

  gridContainer.appendChild(grid);
  container.appendChild(gridContainer);

  if (container._learningCleanup) {
    container._learningCleanup();
    container._learningCleanup = null;
  }
  container._learningCleanup = attachGridEvents(grid, {
    onClick: (id) => onSelectActivity(id),
    onLongPress: null,
  });
}