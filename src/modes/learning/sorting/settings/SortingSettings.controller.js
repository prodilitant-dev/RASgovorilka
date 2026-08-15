import { renderSettingsModal } from '@components/common/SettingsModal/SettingsModal';

export function openSortingSettings(profile, onSave) {
  const currentSettings = profile.learningSettings?.sorting || {
    categoryIds: profile.categories.slice(0, Math.min(profile.categories.length, 4)).map(c => c.id),
    numCards: 8,
  };

  renderSettingsModal({
    profile,
    currentSettings,
    fields: [
      {
        key: 'categoryIds',
        type: 'checkbox',
        label: 'Категории (выберите минимум 2):',
        options: (profile) => profile.categories.map(c => ({ value: c.id, label: c.name })),
      },
      {
        key: 'numCards',
        type: 'range',
        label: 'Карточек за раунд:',
        min: 4,
        max: 16,
        step: 2,
        default: 8,
      },
    ],
    onSave,
    title: 'Настройки сортировки',
  });
}