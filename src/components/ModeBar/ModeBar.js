// src/components/ModeBar/ModeBar.js
import { createElement, clear } from '@utils/dom';
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

  let modes = [];

  if (editingMode) {
    modes.push({ id: 'profiles', label: 'Профили', icon: '👤' });
  }

  const visibleModes = MODES.filter((m) => !hiddenModes.includes(m.id));
  const sortedVisible = visibleModes.sort((a, b) => {
    const ia = modeOrder.indexOf(a.id);
    const ib = modeOrder.indexOf(b.id);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });
  modes.push(...sortedVisible);

  if (editingMode) {
    modes.push({ id: 'general', label: 'Общие', icon: '⚙️' });
  }

  modes.forEach((mode) => {
    const btn = createElement('button', {
      className: `mode-btn ${mode.id === activeModeId ? 'active' : ''}`,
      'data-mode-id': mode.id,
      'data-log': `mode-switch:${mode.id}`,
    }, `${mode.icon} ${mode.label}`);
    btn.addEventListener('click', () => onModeSelect(mode.id));
    container.appendChild(btn);
  });

  logger.debug('✅ ModeBar rendered');
}