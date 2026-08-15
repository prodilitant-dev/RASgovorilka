// src/modes/learning/settings/QuizSettings.controller.js
import { renderSettingsModal } from '@components/common/SettingsModal/SettingsModal';

export function openQuizSettings(profile, onSave) {
  const currentSettings = profile.learningSettings?.quiz || {
    categoryIds: profile.categories.map(c => c.id),
    numQuestions: 5,
    numOptions: 4,
    mode: 'image_to_word'
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
      {
        key: 'numOptions',
        type: 'range',
        label: 'Вариантов:',
        min: 2,
        max: 6,
        step: 1,
        default: 4,
      },
      {
        key: 'mode',
        type: 'select',
        label: 'Режим:',
        options: [
          { value: 'image_to_word', label: 'Картинка → Слово' },
          { value: 'word_to_image', label: 'Слово → Картинка' },
        ],
      },
    ],
    onSave,
    title: 'Настройки викторины',
  });
}