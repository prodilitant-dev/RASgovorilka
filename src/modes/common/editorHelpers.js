// src/modes/common/editorHelpers.js
import { openVerticalEditor } from '@components/common/VerticalEditor';
import { toast } from '@utils/toast';

/**
 * Универсальный редактор для простых сущностей (кнопки, да/нет)
 */
export function openSimpleEditor({
  entity,
  title,
  onSave,
  onDelete,
}) {
  const isNew = !entity.id;

  openVerticalEditor({
    title,
    entity,
    onSave: (updated) => {
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
        placeholder: 'Введите текст...',
      },
      {
        id: 'emoji',
        label: 'Эмодзи',
        type: 'text',
        placeholder: '😊',
        visible: (entity) => !entity.imageId,
      },
    ],
    extraActions: [], // Нет падежей
    buttons: [
      {
        id: 'delete',
        label: '🗑 Удалить',
        variant: 'danger',
        visible: () => !isNew,
      },
      {
        id: 'save',
        label: '💾 Сохранить',
        variant: 'primary',
      },
    ],
  });
}