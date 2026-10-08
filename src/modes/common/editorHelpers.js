// src/modes/common/editorHelpers.js
import { openVerticalEditor } from '@components/common/VerticalEditor';
import { toast } from '@utils/toast';

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
    onSave: (updated, done) => {
      if (!updated.text || !updated.text.trim()) {
        toast('Введите текст', 'error');
        done();
        return;
      }
      onSave(updated, done);
    },
    onDelete: (entity, close) => {
      if (onDelete) {
        onDelete(entity.id, close);
      }
    },
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
        // placeholder убран — серый «😊» путал пользователя
        visible: (entity) => !entity.imageId,
      },
    ],
    extraActions: [],
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