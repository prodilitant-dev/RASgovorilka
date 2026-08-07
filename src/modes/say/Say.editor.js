// src/modes/say/Say.editor.js
import { buildUniversalForm } from '@components/common/Universal/UniversalForm';
import { toast } from '@utils/toast';

export function openCardEditor(cardData, onSave, onDelete) {
  const isNew = !cardData.id;

  const fields = [
    {
      key: 'text',
      label: 'Текст',
      type: 'text',
      value: cardData.text || '',
    },
    {
      key: 'emoji',
      label: 'Эмодзи',
      type: 'text',
      value: cardData.emoji || '',
    },
    {
      key: 'wordType',
      label: 'Тип слова',
      type: 'select',
      value: cardData.wordType || 'noun',
      options: [
        { value: 'noun', label: 'Существительное' },
        { value: 'verb', label: 'Глагол' },
        { value: 'adjective', label: 'Прилагательное' },
        { value: 'pronoun', label: 'Местоимение' },
        { value: 'preposition', label: 'Предлог' },
        { value: 'other', label: 'Другое' },
      ],
    },
    // Позже можно добавить падежные формы
  ];

  const customButtons = [];
  if (!isNew && onDelete) {
    customButtons.push({
      label: 'Удалить',
      action: (close) => {
        if (confirm('Удалить карточку?')) {
          onDelete(cardData.id);
          close();
        }
      },
    });
  }

  const form = buildUniversalForm({
    fields,
    title: isNew ? 'Новая карточка' : 'Редактировать карточку',
    onSubmit: (data) => {
      if (!data.text.trim()) {
        toast('Введите текст', 'error');
        return;
      }
      // Объединяем с существующими данными
      const updated = { ...cardData, ...data };
      onSave(updated);
    },
    onCancel: () => {},
    customButtons,
  });

  form.open();
}