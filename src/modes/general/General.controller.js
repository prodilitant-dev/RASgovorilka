// src/modes/general/General.controller.js
import { getState, setState } from '@state/store';
import { savePersistentState } from '@state/actions';
import { toast } from '@utils/toast';
import { confirm } from '@utils/dialog';
import { saveProfile } from '@storage/appStorage';
import { renderModeBar } from '@components/ModeBar/ModeBar';
import { openExportDialog } from './components/ExportDialog';
import { exportToZip } from '@services/backup/export';
import { importFromZip } from '@services/backup/import';

function updateModeBar() {
  const container = document.querySelector('.mode-bar');
  if (!container) {
    console.warn('updateModeBar: контейнер .mode-bar не найден');
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
}

export function toggleFullscreen(enabled) {
  if (enabled) {
    document.documentElement.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.().catch(() => {});
  }
  saveSetting('fullscreen', enabled);
}

export function saveSetting(key, value) {
  const state = getState();
  const globalSettings = { ...state.globalSettings, [key]: value };
  setState({ globalSettings });
  savePersistentState();
  toast('Настройка сохранена');
}

export function saveVoiceSettings(voiceSettings) {
  const state = getState();
  const globalSettings = { ...state.globalSettings, voiceSettings };
  setState({ globalSettings });
  savePersistentState();
  toast('Настройки голоса сохранены');
}

export function saveModeOrder(newOrder) {
  const state = getState();
  const modeOrder = newOrder.map((m) => m.id);

  setState({ modeOrder });

  const profile = state.profiles.find((p) => p.id === state.currentProfileId);
  if (profile) {
    profile.modeOrder = modeOrder;
    saveProfile(profile);
  }

  savePersistentState();
  toast('Порядок режимов обновлён');

  // Обновляем панель после завершения текущего цикла событий
  setTimeout(updateModeBar, 0);
}

export function toggleModeVisibility(modeId, visible) {
  const state = getState();
  const hiddenModes = state.hiddenModes || [];
  let newHidden;
  if (visible) {
    newHidden = hiddenModes.filter((id) => id !== modeId);
  } else {
    newHidden = hiddenModes.includes(modeId) ? hiddenModes : [...hiddenModes, modeId];
  }

  setState({ hiddenModes: newHidden });

  const profile = state.profiles.find((p) => p.id === state.currentProfileId);
  if (profile) {
    profile.hiddenModes = newHidden;
    saveProfile(profile);
  }

  savePersistentState();
  toast('Видимость режима обновлена');

  // Обновляем панель после завершения текущего цикла событий
  setTimeout(updateModeBar, 0);
}

export async function resetAllData() {
  const ok = await confirm('Вы уверены, что хотите сбросить все данные? Это действие необратимо.', 'Сброс данных');
  if (!ok) return;
  const dbName = 'RASGovorilkaDB';
  const request = indexedDB.deleteDatabase(dbName);
  request.onsuccess = () => {
    toast('Данные сброшены. Приложение будет перезагружено.');
    setTimeout(() => location.reload(), 1000);
  };
  request.onerror = () => toast('Ошибка при сбросе данных', 'error');
}

// ✅ Обновлённые функции экспорта/импорта
export function exportData() {
  openExportDialog((selectedKeys, selectedCategoryIds) => {
    exportToZip(selectedKeys, selectedCategoryIds);
  });
}

export function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.rasbackup';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await importFromZip(file);
    }
    input.remove();
  };
  input.click();
}