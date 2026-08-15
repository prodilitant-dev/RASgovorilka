// src/modes/say/Say.editor.js
import { openVerticalEditor } from '@components/common/VerticalEditor';
import { toast } from '@utils/toast';

/**
 * Открывает редактор карточки (использует вертикальный редактор)
 */
export function openCardEditor(cardData, onSave, onDelete) {
  const isNew = !cardData.id;

  openVerticalEditor({
    title: isNew ? 'Новая карточка' : 'Редактировать карточку',
    entity: cardData,
    onSave: (updated) => {
      // Проверяем, что текст не пустой
      if (!updated.text || !updated.text.trim()) {
        toast('Введите текст', 'error');
        return;
      }
      onSave(updated);
    },
    onDelete: onDelete || null,
    fields: [
      {
        id: 'text',
        label: 'Текст',
        type: 'text',
        required: true,
        placeholder: 'Например: Молоко',
      },
      {
        id: 'wordType',
        label: 'Тип слова',
        type: 'select',
        options: [
          { value: 'noun', label: 'Существительное' },
          { value: 'verb', label: 'Глагол' },
          { value: 'adjective', label: 'Прилагательное' },
          { value: 'pronoun', label: 'Местоимение' },
          { value: 'preposition', label: 'Предлог' },
          { value: 'other', label: 'Другое' },
        ],
      },
      {
        id: 'emoji',
        label: 'Эмодзи',
        type: 'text',
        placeholder: '😊',
        // 🟢 Главное: Скрываем поле, если есть фото!
        visible: (entity) => !entity.imageId,
      },
    ],
    extraActions: [
      {
        id: 'declensions',
        label: '📖 Падежи (исключения)',
        // Показываем только для существительных и местоимений
        visible: (entity) => {
          const type = entity.wordType || 'noun';
          return type === 'noun' || type === 'pronoun';
        },
        onClick: (entity) => {
          // TODO: Открыть модалку падежей (пока заглушка)
          toast('Редактор падежей будет позже', 'info');
        },
      },
    ],
    buttons: [
      {
        id: 'delete',
        label: '🗑 Удалить',
        variant: 'danger',
        visible: () => !isNew, // только для существующих
      },
      {
        id: 'save',
        label: '💾 Сохранить',
        variant: 'primary',
      },
    ],
  });
}