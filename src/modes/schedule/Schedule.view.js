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

  // Если нет событий и не режим редактирования — показываем сообщение
  if (events.length === 0 && !editingMode) {
    const empty = createElement('div', { className: 'text-muted text-center p-4' }, 'Нет событий на этот день');
    gridContainer.appendChild(empty);
    return;
  }

  // Создаём карточки
  const cards = [];

  // События
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

  // Управляющие карточки в режиме редактирования
  if (editingMode) {
    // Добавить событие
    const addCard = createCard({
      id: 'add',
      text: 'Добавить событие',
      emoji: '➕',
      isAdd: false,
      draggable: false,
      className: 'card--add',
    });
    cards.push(addCard);

    // Сохранить шаблон (если есть события)
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

  // Рендерим сетку
  renderElementGrid(gridContainer, cards);

  // Обработка кликов через делегирование
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

  // Drag & Drop для сортировки (только в режиме редактирования)
  let sortCleanup = null;
  if (editingMode && onReorderEvents) {
    // Исключаем управляющие карточки (.card--add)
    sortCleanup = makeSortable(gridContainer, {
      itemSelector: '.card:not(.card--add)',
      onReorder: (ids) => {
        onReorderEvents(ids);
      },
    });
  }

  // Сохраняем cleanup для удаления при следующем рендере
  if (container._scheduleCleanup) {
    container._scheduleCleanup();
  }
  container._scheduleCleanup = () => {
    gridContainer.removeEventListener('click', clickHandler);
    if (sortCleanup) sortCleanup();
  };
}