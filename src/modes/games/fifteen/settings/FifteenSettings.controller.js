import { renderSettingsModal } from '@components/common/SettingsModal/SettingsModal';

export function openFifteenSettings(profile, onSave) {
  const currentSettings = profile.gamesSettings?.fifteen || {
    size: 4,
  };

  renderSettingsModal({
    profile,
    currentSettings,
    fields: [
      {
        key: 'size',
        type: 'range',
        label: 'Размер сетки:',
        min: 4,
        max: 8,
        step: 1,
        default: 4,
      },
    ],
    onSave,
    title: 'Настройки Пятнашек',
  });
}