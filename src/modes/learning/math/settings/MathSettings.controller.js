import { renderSettingsModal } from '@components/common/SettingsModal/SettingsModal';

export function openMathSettings(profile, onSave) {
  const currentSettings = profile.learningSettings?.math || {
    operations: ['add', 'sub'],
    maxNumber: 20,
    numQuestions: 5,
    numOptions: 4,
    inputMethod: 'drag',
  };

  renderSettingsModal({
    profile,
    currentSettings,
    fields: [
      {
        key: 'operations',
        type: 'checkbox',
        label: 'Операции:',
        options: [
          { value: 'add', label: 'Сложение (+)' },
          { value: 'sub', label: 'Вычитание (-)' },
          { value: 'mul', label: 'Умножение (×)' },
          { value: 'div', label: 'Деление (÷)' },
        ],
      },
      {
        key: 'maxNumber',
        type: 'range',
        label: 'Максимальное число:',
        min: 5,
        max: 50,
        step: 1,
        default: 20,
      },
      {
        key: 'numQuestions',
        type: 'range',
        label: 'Количество примеров:',
        min: 3,
        max: 20,
        step: 1,
        default: 5,
      },
      {
        key: 'numOptions',
        type: 'range',
        label: 'Количество вариантов:',
        min: 2,
        max: 6,
        step: 1,
        default: 4,
      },
      {
        key: 'inputMethod',
        type: 'select',
        label: 'Метод ввода:',
        options: [
          { value: 'drag', label: 'Перетаскивание' },
          { value: 'type', label: 'Ручной ввод' },
        ],
      },
    ],
    onSave,
    title: 'Настройки математики',
  });
}