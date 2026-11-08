// src/components/ModeBar/ModeBar.js
import { createElement, clear } from '@utils/dom';
import { createIcon } from '@utils/icon';
import { MODES } from '@config/modes';
import { logger } from '@utils/logger';

export function renderModeBar(
  container,
  activeModeId,
  onModeSelect,
  editingMode = false,
  hiddenModes = [],
  modeOrder = []
) {
  logger.debug('🔄 Rendering ModeBar', { activeModeId, editingMode, hiddenModes, modeOrder });
  clear(container);

  const modes = [];

  if (editingMode) {
    modes.push({ id: 'profiles', label: 'Профили', icon: 'profiles', emoji: '👤' });
  }

  const visibleModes = MODES.filter((m) => !hiddenModes.includes(m.id));
  const sortedVisible = visibleModes.sort((a, b) => {
    const ia = modeOrder.indexOf(a.id);
    const ib = modeOrder.indexOf(b.id);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });
  modes.push(...sortedVisible);

  if (editingMode) {
    modes.push({ id: 'general', label: 'Общие', icon: 'general', emoji: '⚙️' });
  }

  modes.forEach((mode) => {
    const btn = createElement('button', {
      className: `mode-btn ${mode.id === activeModeId ? 'active' : ''}`,
      'data-mode-id': mode.id,
      'data-log': `mode-switch:${mode.id}`,
    });

    // Иконка WebP с fallback на эмодзи
    btn.appendChild(
      createIcon(mode.icon, { fallback: mode.emoji || '', size: 45, className: 'mode-btn__icon' })
    );

    // Текст кнопки
    const labelEl = createElement('span', { className: 'mode-btn__label' }, mode.label);
    btn.appendChild(labelEl);

    btn.addEventListener('click', () => onModeSelect(mode.id));
    container.appendChild(btn);
  });

  logger.debug('✅ ModeBar rendered');
}
