import { renderSettingsModal } from '@components/common/SettingsModal/SettingsModal';

export function openFifteenSettings(profile, onSave) {
  const currentSettings = profile.gamesSettings?.fifteen || {
    size: 4,
    mode: 'numbers',
    categoryIds: [],
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
      {
        key: 'mode',
        type: 'select',
        label: 'Режим:',
        options: [
          { value: 'numbers', label: 'Числа' },
          { value: 'images', label: 'Изображения' },
        ],
      },
      {
        key: 'categoryIds',
        type: 'checkbox',
        label: 'Категории (для режима изображений):',
        options: (profile) => profile.categories.map(c => ({ value: c.id, label: c.name })),
      },
    ],
    onSave,
    title: 'Настройки Пятнашек',
  });
}