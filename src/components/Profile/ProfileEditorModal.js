// src/components/Profile/ProfileEditorModal.js
import { openVerticalEditor } from '@components/common/VerticalEditor';
import { createColorPalette } from '@components/common/VerticalEditor/preview/colorPalette';
import { toast } from '@utils/toast';
import { uid } from '@utils/id';

export function openProfileEditor(profile, { onSave, onDelete, onCopy, onCancel }) {
  const isNew = !profile?.id;

  // Создаем сущность с дефолтной иконкой, если нет своей картинки
  const entity = profile || {
    id: uid(),
    name: '',
    icon: 'profile-default',
    imageId: null,
    imagePath: 'icons/profiles.webp', // <-- ДЕФОЛТНАЯ ИКОНКА
    styleColor: null,
  };

  const workingEntity = { ...entity };

  // Если у профиля нет картинки, но есть imageId (старый формат) - оставляем как есть
  if (!workingEntity.imageId && !workingEntity.imagePath) {
    workingEntity.imagePath = 'icons/profiles.webp';
  }

  const config = {
    title: isNew ? 'Новый профиль' : 'Редактировать профиль',
    entity: workingEntity,
    preview: true,
    previewSides: createColorPalette, // <-- ДОБАВЛЕНА ПАЛИТРА
    onSave: (updated, done) => {
      if (!updated.name || !updated.name.trim()) {
        toast('Введите имя профиля', 'error');
        return done(new Error('Validation'));
      }
      onSave(updated, done);
    },
    onDelete: (ent, close) => {
      if (!isNew && onDelete) {
        onDelete(ent.id, close);
      }
    },
    onClose: (ent, close) => {
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
    ],
    extraActions: [],
    buttons: (() => {
      const btns = [];
      if (!isNew && onCopy) {
        btns.push({
          id: 'copy',
          label: '📋 Копировать',
          variant: 'secondary',
          action: (ent, close) => {
            onCopy(ent);
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
  };

  return openVerticalEditor(config);
}
