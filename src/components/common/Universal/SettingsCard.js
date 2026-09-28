// src/components/common/Universal/SettingsCard.js
import { createElement } from '@utils/dom';
import { createCard } from '../Card/Card';

export function createSettingsCard({
  id,
  emoji,
  text,
  type, // 'toggle' или 'click'
  value = false, // для toggle
  isActive = false, // для click – активное состояние
  onChange = null, // для toggle
  onClick = null, // для click
}) {
  let interactiveElement = null;

  if (type === 'toggle') {
    const toggle = createElement('label', { className: 'toggle-switch' });
    const input = createElement('input', { type: 'checkbox', checked: value });
    const slider = createElement('span', { className: 'slider' });
    toggle.appendChild(input);
    toggle.appendChild(slider);
    input.addEventListener('change', (e) => {
      e.stopPropagation();
      if (onChange) onChange(e.target.checked);
    });
    interactiveElement = toggle;
  }

  const card = createCard({
    id,
    emoji,
    text,
    isActive: type === 'click' ? isActive : false,
    children: interactiveElement ? [interactiveElement] : [],
    className: type === 'click' ? 'settings-card-clickable' : '',
  });

  if (type === 'click' && onClick) {
    card.addEventListener('click', onClick);
  }

  return card;
}