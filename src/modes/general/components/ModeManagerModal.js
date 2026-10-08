// src/modes/general/components/ModeManagerModal.js
import { Modal } from '@components/common/Modal/Modal';
import { createElement, clear } from '@utils/dom';
import { ModeOrderList } from '@components/common/Settings/ModeOrderList';
import { getState, setState } from '@state/store';
import { savePersistentState } from '@state/actions';
import { saveProfile } from '@storage/appStorage';
import { MODES } from '@config/modes';
import { toast } from '@utils/toast';
import { logger } from '@utils/logger';
import { renderModeBar } from '@components/ModeBar/ModeBar';

export function openModeManager(onClose) {
  let listContainer = null;
  let currentCleanup = null;
  let isUpdating = false;

  const modal = new Modal({
    title: 'Управление режимами',
    body: () => {
      const wrap = createElement('div', {});
      listContainer = createElement('div', {});
      wrap.appendChild(listContainer);
      renderModeList();
      return wrap;
    },
    buttons: [
      {
        label: 'Закрыть',
        action: () => {
          modal.close();
          if (onClose) onClose();
        },
      },
    ],
    onClose: () => {
      if (currentCleanup) {
        currentCleanup();
        currentCleanup = null;
      }
      if (onClose) onClose();
    },
  });

  // Функция для принудительного обновления панели режимов за модалкой
  function updateMainModeBar() {
    const container = document.querySelector('.mode-bar');
    if (!container) {
      logger.warn('updateMainModeBar: .mode-bar not found');
      return;
    }
    const state = getState();
    renderModeBar(
      container,
      state.currentMode,
      (modeId) => {
        setState({ currentMode: modeId });
      },
      state.editingMode,
      state.hiddenModes || [],
      state.modeOrder || []
    );
    logger.debug('✅ Main mode bar updated from modal');
  }

  function renderModeList() {
    if (isUpdating) return;
    isUpdating = true;
    try {
      if (currentCleanup) {
        currentCleanup();
        currentCleanup = null;
      }
      clear(listContainer);

      const state = getState();
      const hiddenModes = state.hiddenModes || [];
      const modeOrder = state.modeOrder || MODES.map((m) => m.id);

      const allModes = MODES.map((m) => ({
        ...m,
        visible: !hiddenModes.includes(m.id),
      }));

      const sortedModes = [...allModes].sort((a, b) => {
        const ia = modeOrder.indexOf(a.id);
        const ib = modeOrder.indexOf(b.id);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      });

      const { element, cleanup } = ModeOrderList({
        modes: sortedModes,
        onReorder: (newOrder) => {
          const newModeOrder = newOrder.map((m) => m.id);
          setState({ modeOrder: newModeOrder });
          savePersistentState();
          toast('Порядок режимов обновлён');
          updateMainModeBar();
          renderModeList();
        },
        onToggleVisibility: async (id, visible) => {
          logger.debug(`🔁 Toggle: id="${id}", visible=${visible}`);
          const currentState = getState();
          const oldHidden = currentState.hiddenModes || [];
          logger.debug(`   old hiddenModes:`, oldHidden);

          let newHidden;
          if (visible) {
            newHidden = oldHidden.filter((h) => h !== id);
          } else {
            if (!oldHidden.includes(id)) {
              newHidden = [...oldHidden, id];
            } else {
              newHidden = oldHidden;
            }
          }

          logger.debug(`   new hiddenModes:`, newHidden);

          setState({ hiddenModes: newHidden });

          // Сохраняем в профиль
          const profile = currentState.profiles.find(
            (p) => p.id === currentState.currentProfileId
          );
          if (profile) {
            profile.hiddenModes = newHidden;
            await saveProfile(profile);
            logger.debug(
              `✅ Profile updated: hiddenModes = ${newHidden.join(', ')}`
            );
          }

          await savePersistentState();
          toast('Видимость режима обновлена');
          updateMainModeBar();
          renderModeList();
        },
      });

      currentCleanup = cleanup;
      listContainer.appendChild(element);
    } finally {
      isUpdating = false;
    }
  }

  modal.open();
}