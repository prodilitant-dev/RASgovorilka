// src/app/sync.js
import { subscribe, setState } from '@state/store';
import { renderModeBar } from '@components/ModeBar/ModeBar';
import { renderContent } from './render';
import { logger } from '@utils/logger';

let modeBarSlot = null;
let mainArea = null;

export function setContainers(mbs, ma) {
  modeBarSlot = mbs;
  mainArea = ma;
}

export function subscribeToStore() {
  subscribe((changed, newState) => {
    // ✅ Если modeBarSlot стал невалидным – ищем новый
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

    // ✅ Аналогично для mainArea
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

    // --- Основная логика обновления ---
    if (changed.editingMode !== undefined) {
      document.body.classList.toggle('editing-mode', newState.editingMode);
      const profileBtn = document.querySelector('.profile-fab');
      if (profileBtn) {
        profileBtn.textContent = newState.editingMode ? '✕' : '👤';
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
          (modeId) => {
            setState({ currentMode: modeId });
          },
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