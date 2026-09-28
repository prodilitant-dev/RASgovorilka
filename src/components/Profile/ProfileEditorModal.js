// src/components/Profile/ProfileEditorModal.js
import { openVerticalEditor } from '@components/common/VerticalEditor';
import { toast } from '@utils/toast';
import { confirm } from '@utils/dialog';
import { uid } from '@utils/id';

export function openProfileEditor(profile, { onSave, onDelete, onCopy, onCancel }) {
  const isNew = !profile?.id;
  const entity = profile || { id: uid(), name: '', icon: '🧑' };
  const workingEntity = { ...entity };

  const config = {
    title: isNew ? 'Новый профиль' : 'Редактировать профиль',
    entity: workingEntity,
    onSave: (updated, done) => {
      if (!updated.name || !updated.name.trim()) {
        toast('Введите имя профиля', 'error');
        done();
        return;
      }
      onSave(updated, done);
    },
    onDelete: (entity, close) => {
      if (!isNew && onDelete) {
        onDelete(entity.id, close);
      }
    },
    onClose: (entity, close) => {
      if (onCancel) onCancel();
      close();
    },
    fields: [
      {
        id: 'name',
        label: 'Имя',
        type: 'text',
        required: true,
        placeholder: 'Введите имя профиля...',
      },
      {
        id: 'icon',
        label: 'Иконка (эмодзи)',
        type: 'text',
        placeholder: '🧑',
        visible: () => true,
      },
    ],
    extraActions: [],
    buttons: (() => {
      const btns = [];
      if (!isNew && onCopy) {
        btns.push({
          id: 'copy',
          label: '📋 Копировать',
          variant: 'secondary',
          action: (entity, close) => {
            onCopy(entity);
            close();
          },
        });
      }
      if (!isNew && onDelete) {
        btns.push({
          id: 'delete',
          label: '🗑 Удалить',
          variant: 'danger',
        });
      }
      btns.push({
        id: 'save',
        label: '💾 Сохранить',
        variant: 'primary',
      });
      return btns;
    })(),
    preview: true,
  };

  return openVerticalEditor(config);
}