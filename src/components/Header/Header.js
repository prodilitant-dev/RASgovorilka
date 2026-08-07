// src/components/Header/Header.js
import { createElement } from '@utils/dom';
import { onLongPress } from '@utils/interaction';
import { logger } from '@utils/logger';

export function createHeader({
  profileIcon = '👤',
  onProfileClick,
  onProfileLongPress,
}) {
  const header = createElement('header', { className: 'app-header' });

  const backBtn = createElement('button', { className: 'back-btn hidden' }, '←');
  header.appendChild(backBtn);

  const modeBarSlot = createElement('div', { className: 'mode-bar' });
  header.appendChild(modeBarSlot);

  const profileBtn = createElement('button', { 
    className: 'profile-fab',
    'data-log': 'profile-button',
  }, profileIcon);

  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    logger.debug('Profile button clicked');
    if (onProfileClick) onProfileClick();
  });

  const cleanupLongPress = onLongPress(profileBtn, (e) => {
    e.stopPropagation();
    logger.debug('Profile button long-pressed');
    if (onProfileLongPress) onProfileLongPress();
  });

  header.appendChild(profileBtn);

  return { header, modeBarSlot, cleanupLongPress };
}