// src/modes/schedule/Schedule.editor.js
import { openVerticalEditor } from '@components/common/VerticalEditor';
import { toast } from '@utils/toast';

export function openEventEditor(eventData, onSave, onDelete) {
  const isNew = !eventData || !eventData.id;
  const entity = isNew ? { time: '12:00', text: '', icon: '📌', imageId: null } : { ...eventData };

  openVerticalEditor({
    title: isNew ? 'Новое событие' : 'Редактировать событие',
    entity,
    onSave: (updated, close) => {
      if (!updated.time) { toast('Введите время', 'error'); return; }
      if (!updated.text || !updated.text.trim()) { toast('Введите описание', 'error'); return; }
      onSave(updated);
      close();
    },
    onDelete: isNew ? null : (entity, close) => {
      if (confirm('Удалить событие?')) {
        onDelete(entity.id);
        close();
      }
    },
    fields: [
      {
        id: 'time',
        label: 'Время',
        type: 'time',
        required: true,
      },
      {
        id: 'text',
        label: 'Описание',
        type: 'text',
        required: true,
        placeholder: 'Например: Завтрак',
      },
      {
        id: 'icon',
        label: 'Иконка (эмодзи)',
        type: 'text',
        placeholder: '📌',
        visible: (entity) => !entity.imageId,
      },
    ],
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