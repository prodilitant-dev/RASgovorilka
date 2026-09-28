// src/modes/schedule/Schedule.view.js
import { createElement, clear } from '@utils/dom';
import { renderElementGrid } from '@components/common/Grid/GridSimple';
import { createCard } from '@components/common/Card/Card';
import { renderScheduleNav } from './ScheduleNav';
import { makeSortable } from '@utils/dragdrop';

export function renderScheduleView(container, {
  selectedDate,
  events,
  editingMode,
  onDaySelect,
  onEventClick,
  onManageTemplates,
  onAddEvent,
  onReorderEvents,
  onSaveTemplate,
}) {
  clear(container);

  const navWrap = createElement('div', { className: 'schedule-nav-wrap' });
  renderScheduleNav(navWrap, selectedDate, onDaySelect, onManageTemplates, editingMode);
  container.appendChild(navWrap);

  const gridContainer = createElement('div', { className: 'grid-container' });
  container.appendChild(gridContainer);

  if (events.length === 0 && !editingMode) {
    const empty = createElement('div', { className: 'text-muted text-center p-4' }, 'Нет событий на этот день');
    gridContainer.appendChild(empty);
    return;
  }

  const cards = [];
  events.forEach(event => {
    const card = createCard({
      id: event.id,
      text: `${event.time || ''} ${event.text || ''}`.trim(),
      emoji: event.icon || '📌',
      imageId: event.imageId || null,
      isActive: false,
      isAdd: false,
      draggable: editingMode,
      className: event.done ? 'done' : '',
    });
    cards.push(card);
  });

  if (editingMode) {
    const addCard = createCard({
      id: 'add',
      text: 'Добавить событие',
      emoji: '➕',
      isAdd: false,
      draggable: false,
      className: 'card--add',
    });
    cards.push(addCard);

    if (events.length > 0) {
      const saveCard = createCard({
        id: 'save-template',
        text: 'Сохранить шаблон',
        emoji: '💾',
        isAdd: false,
        draggable: false,
        className: 'card--add',
      });
      cards.push(saveCard);
    }
  }

  renderElementGrid(gridContainer, cards);

  const clickHandler = (e) => {
    const cardEl = e.target.closest('.card');
    if (!cardEl) return;
    const id = cardEl.dataset.id;
    if (!id) return;
    if (id === 'add') { if (onAddEvent) onAddEvent(); return; }
    if (id === 'save-template') { if (onSaveTemplate) onSaveTemplate(); return; }
    if (onEventClick) onEventClick(id);
  };
  gridContainer.addEventListener('click', clickHandler);

  let sortCleanup = null;
  if (editingMode && onReorderEvents) {
    sortCleanup = makeSortable(gridContainer, {
      itemSelector: '.card:not(.card--add)',
      onReorder: (ids) => {
        onReorderEvents(ids);
      },
    });
  }

  if (container._scheduleCleanup) {
    container._scheduleCleanup();
  }
  container._scheduleCleanup = () => {
    gridContainer.removeEventListener('click', clickHandler);
    if (sortCleanup) sortCleanup();
  };
}