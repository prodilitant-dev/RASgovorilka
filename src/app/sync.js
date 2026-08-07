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
    // Обновляем класс editing-mode на body
    if (changed.editingMode !== undefined) {
      document.body.classList.toggle('editing-mode', newState.editingMode);
      const profileBtn = document.querySelector('.profile-fab');
      if (profileBtn) {
        profileBtn.textContent = newState.editingMode ? '✕' : '👤';
      }
    }

    // Если изменился режим, editingMode, modeOrder или hiddenModes – обновляем панель и контент
    if (
      changed.currentMode !== undefined ||
      changed.editingMode !== undefined ||
      changed.modeOrder !== undefined ||
      changed.hiddenModes !== undefined
    ) {
      // Обновляем панель
      if (modeBarSlot && document.contains(modeBarSlot)) {
        renderModeBar(
          modeBarSlot,
          newState.currentMode,
          (modeId) => {
            setState({ currentMode: modeId });
            renderContent(mainArea, modeId);
          },
          newState.editingMode,
          newState.hiddenModes || [],
          newState.modeOrder || []
        );
      }

      // Если изменился режим – обновляем контент
      if (changed.currentMode !== undefined) {
        if (mainArea && document.contains(mainArea)) {
          renderContent(mainArea, newState.currentMode);
        }
      }
    }
  });
}