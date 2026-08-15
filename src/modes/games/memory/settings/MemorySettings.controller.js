import { renderSettingsModal } from '@components/common/SettingsModal/SettingsModal';

export function openMemorySettings(profile, onSave) {
  const currentSettings = profile.gamesSettings?.memory || {
    categoryIds: profile.categories.map(c => c.id),
    gridSize: 4,
  };

  renderSettingsModal({
    profile,
    currentSettings,
    fields: [
      {
        key: 'categoryIds',
        type: 'checkbox',
        label: 'Категории:',
        options: (profile) => profile.categories.map(c => ({ value: c.id, label: c.name })),
      },
      {
        key: 'gridSize',
        type: 'range',
        label: 'Размер сетки:',
        min: 4,
        max: 8,
        step: 2,
        default: 4,
      },
    ],
    onSave,
    title: 'Настройки Мемори',
  });
}