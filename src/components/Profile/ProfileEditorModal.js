// src/components/Profile/ProfileEditorModal.js
import { openVerticalEditor } from '@components/common/VerticalEditor';
import { toast } from '@utils/toast';
import { confirm } from '@utils/dialog';
import { uid } from '@utils/id';

export function openProfileEditor(profile, { onSave, onDelete, onCopy, onCancel }) {
  const isNew = !profile?.id;
  const entity = profile || { id: uid(), name: '', icon: '🧑' };

  // Рабочая копия
  const workingEntity = { ...entity };

  const config = {
    title: isNew ? 'Новый профиль' : 'Редактировать профиль',
    entity: workingEntity,
    onSave: async (updated, close) => {
      if (!updated.name || !updated.name.trim()) {
        toast('Введите имя профиля', 'error');
        return;
      }
      await onSave(updated);
      close();
    },
    onDelete: null, // удаление обрабатываем через кнопку
    onClose: (entity, close) => {
      // При закрытии по крестику ничего не сохраняем
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
        // onChange не нужен, так как сохранение по кнопке
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
          action: async (entity, close) => {
            await onCopy(entity);
            close();
          },
        });
      }
      if (!isNew && onDelete) {
        btns.push({
          id: 'delete',
          label: '🗑 Удалить',
          variant: 'danger',
          action: async (entity, close) => {
            const ok = await confirm('Удалить профиль?', 'Подтверждение');
            if (ok) {
              await onDelete(entity.id);
              close();
            }
          },
        });
      }
      // Кнопка «Сохранить» всегда есть
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