// src/components/common/Universal/UniversalList.js
import { createElement, clear } from '@utils/dom';
import { createCard } from '../Card/Card';
import { attachGridEvents } from '../Grid/Grid.events';
import { makeSortable } from '@utils/dragdrop';
import { logger } from '@utils/logger';

export function renderUniversalList(container, config) {
  logger.debug('🔄 Rendering UniversalList', { itemsCount: config.items?.length, allowAdd: config.allowAdd });
  clear(container);

  const {
    items = [],
    renderItem = null,
    onClick = null,
    onLongPress = null,
    onReorder = null,
    allowAdd = false,
    onAdd = null,
    emptyText = 'Нет элементов',
    cardOptions = {},
    layout = 'grid',
  } = config;

  if (items.length === 0 && !allowAdd) {
    const empty = createElement('div', { className: 'text-muted text-center p-4' }, emptyText);
    container.appendChild(empty);
    logger.debug('✅ UniversalList rendered (empty)');
    return { element: container, cleanup: () => {} };
  }

  const listContainer = createElement('div', { 
    className: layout === 'grid' ? 'tiles-grid' : 'universal-list' 
  });

  items.forEach(item => {
    let el;
    if (renderItem) {
      el = renderItem(item);
    } else {
      el = createCard({
        id: item.id,
        text: item.text || '',
        emoji: item.emoji || '',
        isActive: item.active || false,
        isAdd: item.isAdd || false,
        draggable: !!onReorder,
        className: item.className || '',
        ...cardOptions,
      });
    }
    listContainer.appendChild(el);
  });

  // Кнопка добавления — только если allowAdd и onAdd
  if (allowAdd && onAdd) {
    const addCard = createCard({
      id: 'add',
      text: 'Добавить',
      emoji: '➕',
      isAdd: true,
    });
    // НЕ ДОБАВЛЯЕМ ПРЯМОЙ ОБРАБОТЧИК, ПОЛАГАЕМСЯ НА attachGridEvents
    listContainer.appendChild(addCard);
  }

  container.appendChild(listContainer);

  // Подключаем события через делегирование (обрабатывает все карточки, включая add)
  const eventsCleanup = attachGridEvents(listContainer, {
    onClick: (id) => {
      // Если клик по add — вызываем onAdd, если передан
      if (id === 'add' && onAdd) {
        onAdd();
        return;
      }
      // Иначе вызываем общий onClick
      if (onClick) onClick(id);
    },
    onLongPress: (id) => {
      if (id !== 'add' && onLongPress) onLongPress(id);
    },
  });

  let sortableCleanup = () => {};
  if (onReorder) {
    sortableCleanup = makeSortable(listContainer, {
      itemSelector: '.card:not(.card--add)',
      onReorder: (ids) => {
        onReorder(ids);
      },
    });
  }

  const cleanup = () => {
    eventsCleanup();
    sortableCleanup();
  };

  logger.debug(`✅ UniversalList rendered (${items.length} items)`);
  return { element: listContainer, cleanup };
}