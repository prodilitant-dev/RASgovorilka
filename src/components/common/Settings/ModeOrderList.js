// src/components/common/Settings/ModeOrderList.js
import { createElement } from '@utils/dom';
import { makeSortable } from '@utils/dragdrop';
import { logger } from '@utils/logger';

export function ModeOrderList({ modes, onReorder, onToggleVisibility }) {
  const container = createElement('div', { className: 'mode-order-list' });

  // Логируем для отладки
  logger.debug('🔧 ModeOrderList received modes:', modes.map(m => ({ id: m.id, visible: m.visible })));

  modes.forEach(mode => {
    const chip = createElement('div', {
      className: `mode-order-chip ${mode.visible ? '' : 'mode-order-chip--hidden'}`,
      draggable: true,
      'data-id': mode.id,
      'data-log': `mode-chip:${mode.id}`,
    });

    const dragHandle = createElement('span', { className: 'cursor-grab' }, '⠿');
    const name = createElement('span', { className: 'mode-name' }, `${mode.icon} ${mode.label}`);

    const toggle = createElement('label', { className: 'toggle-switch' });
    const input = createElement('input', { type: 'checkbox' });
    // ✅ ЯВНО УСТАНАВЛИВАЕМ СВОЙСТВО checked, а не атрибут
    input.checked = mode.visible;
    const slider = createElement('span', { className: 'slider' });
    toggle.appendChild(input);
    toggle.appendChild(slider);

    // Логируем состояние при создании
    logger.debug(`   mode "${mode.id}" visible: ${mode.visible}, input checked: ${input.checked}`);

    input.addEventListener('change', (e) => {
      e.stopPropagation();
      const newChecked = input.checked;
      logger.debug(`🔄 ModeOrderList: toggle "${mode.id}" -> ${newChecked}`);
      if (onToggleVisibility) {
        onToggleVisibility(mode.id, newChecked);
      }
    });

    chip.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    chip.appendChild(dragHandle);
    chip.appendChild(name);
    chip.appendChild(toggle);
    container.appendChild(chip);
  });

  const cleanup = makeSortable(container, {
    itemSelector: '.mode-order-chip',
    onReorder: (ids) => {
      const newOrder = ids.map(id => modes.find(m => m.id === id)).filter(Boolean);
      onReorder(newOrder);
    }
  });

  return { element: container, cleanup };
}