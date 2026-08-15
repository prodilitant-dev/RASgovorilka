import { renderSettingsModal } from '@components/common/SettingsModal/SettingsModal';

export function openGuessSettings(profile, onSave) {
  const currentSettings = profile.learningSettings?.guess || {
    categoryIds: profile.categories.map(c => c.id),
    numQuestions: 5,
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
        key: 'numQuestions',
        type: 'range',
        label: 'Вопросов:',
        min: 3,
        max: 20,
        step: 1,
        default: 5,
      },
    ],
    onSave,
    title: 'Настройки угадайки',
  });
}