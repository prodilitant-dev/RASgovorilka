// src/components/common/Settings/ModeOrderList.js
import { createElement } from '@utils/dom';
import { makeSortable } from '@utils/dragdrop';
import { iconUrl } from '@utils/icon';
import { logger } from '@utils/logger';

export function ModeOrderList({ modes, onReorder, onToggleVisibility }) {
  const container = createElement('div', { className: 'mode-order-list' });

  logger.debug(
    '🔧 ModeOrderList received modes:',
    modes.map((m) => ({ id: m.id, visible: m.visible }))
  );

  modes.forEach((mode) => {
    const chip = createElement('div', {
      className: `mode-order-chip ${mode.visible ? '' : 'mode-order-chip--hidden'}`,
      'data-id': mode.id,
      'data-log': `mode-chip:${mode.id}`,
    });

    // Иконка режима
    const iconImg = createElement('img', {
      src: iconUrl(mode.id),
      alt: '',
      className: 'mode-order-chip__icon',
      draggable: 'false',
    });
    iconImg.addEventListener('error', () => {
      iconImg.replaceWith(document.createTextNode(mode.icon || ''));
    });
    chip.appendChild(iconImg);

    // Название
    const name = createElement('span', { className: 'mode-name' }, mode.label);
    chip.appendChild(name);

    // Toggle
    const toggle = createElement('label', { className: 'toggle-switch' });
    const input = createElement('input', { type: 'checkbox' });
    input.checked = mode.visible;
    const slider = createElement('span', { className: 'slider' });
    toggle.appendChild(input);
    toggle.appendChild(slider);

    input.addEventListener('change', (e) => {
      e.stopPropagation();
      const newChecked = input.checked;
      logger.debug(`🔄 ModeOrderList: toggle "${mode.id}" -> ${newChecked}`);
      if (onToggleVisibility) {
        onToggleVisibility(mode.id, newChecked);
      }
    });

    chip.appendChild(toggle);
    container.appendChild(chip);
  });

  const cleanup = makeSortable(container, {
    itemSelector: '.mode-order-chip',
    ignoreSelector: 'input, button, label, .toggle-switch',
    onReorder: (ids) => {
      const newOrder = ids.map((id) => modes.find((m) => m.id === id)).filter(Boolean);
      onReorder(newOrder);
    },
  });

  return { element: container, cleanup };
}
