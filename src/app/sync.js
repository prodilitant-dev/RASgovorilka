// src/app/sync.js
import { subscribe, setState } from '@state/store';
import { renderModeBar } from '@components/ModeBar/ModeBar';
import { renderContent } from './render';
import { createElement } from '@utils/dom';
import { iconUrl, isIconName } from '@utils/icon';
import { getActiveProfile } from '@state/actions';
import { logger } from '@utils/logger';

let modeBarSlot = null;
let mainArea = null;

export function setContainers(mbs, ma) {
  modeBarSlot = mbs;
  mainArea = ma;
}

function updateProfileIcon(profileBtn, state) {
  profileBtn.innerHTML = '';

  const iconValue = state.editingMode
    ? 'close'
    : (getActiveProfile()?.icon || '👤');

  if (isIconName(iconValue)) {
    const img = createElement('img', {
      src: iconUrl(iconValue),
      alt: '',
      className: 'profile-fab__icon',
      draggable: 'false',
    });
    img.addEventListener('error', () => {
      img.replaceWith(document.createTextNode(state.editingMode ? '✕' : '👤'));
    });
    profileBtn.appendChild(img);
  } else {
    profileBtn.textContent = iconValue;
  }
}

export function subscribeToStore() {
  subscribe((changed, newState) => {
    if (modeBarSlot && !document.contains(modeBarSlot)) {
      const newModeBar = document.querySelector('.mode-bar');
      if (newModeBar) {
        modeBarSlot = newModeBar;
        logger.debug('modeBarSlot обновлён');
      } else {
        logger.warn('modeBarSlot не найден в DOM');
        return;
      }
    }

    if (mainArea && !document.contains(mainArea)) {
      const newMainArea = document.querySelector('.main-area');
      if (newMainArea) {
        mainArea = newMainArea;
        logger.debug('mainArea обновлён');
      } else {
        logger.warn('mainArea не найден в DOM');
        return;
      }
    }

    if (changed.editingMode !== undefined) {
      document.body.classList.toggle('editing-mode', newState.editingMode);
      const profileBtn = document.querySelector('.profile-fab');
      if (profileBtn) {
        updateProfileIcon(profileBtn, newState);
      }
    }

    if (
      changed.currentMode !== undefined ||
      changed.editingMode !== undefined ||
      changed.modeOrder !== undefined ||
      changed.hiddenModes !== undefined
    ) {
      if (modeBarSlot && document.contains(modeBarSlot)) {
        renderModeBar(
          modeBarSlot,
          newState.currentMode,
          (modeId) => setState({ currentMode: modeId }),
          newState.editingMode,
          newState.hiddenModes || [],
          newState.modeOrder || []
        );
      }

      if (changed.currentMode !== undefined) {
        if (mainArea && document.contains(mainArea)) {
          renderContent(mainArea, newState.currentMode);
        }
      }
    }
  });
}