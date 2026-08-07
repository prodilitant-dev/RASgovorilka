import { createElement, clear } from '@utils/dom';
import { renderGrid } from '@components/common/Grid/Grid';
import { attachGridEvents } from '@components/common/Grid/Grid.events'; // создадим

export function renderProfiles(container, profiles, activeId, onSelect, onAdd, onLongPress) {
  clear(container);
  const gridContainer = createElement('div', { className: 'grid-container full-height' });
  container.appendChild(gridContainer);

  const items = profiles.map(p => ({
    id: p.id,
    text: p.name,
    emoji: p.icon || '🧑',
    active: p.id === activeId,
  }));

  // Добавляем кнопку "Новый профиль"
  items.push({ id: 'add', text: 'Новый профиль', emoji: '➕', isAdd: true });

  const grid = renderGrid(gridContainer, items, { draggable: false });

  // Обработчики
  attachGridEvents(grid, {
    onClick: (id) => {
      if (id === 'add') {
        if (onAdd) onAdd();
      } else {
        if (onSelect) onSelect(id);
      }
    },
    onLongPress: (id) => {
      if (id !== 'add' && onLongPress) {
        onLongPress(id);
      }
    },
  });
}