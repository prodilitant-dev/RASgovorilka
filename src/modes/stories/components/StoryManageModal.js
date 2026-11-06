// src/modes/stories/components/StoryManageModal.js
import { openVerticalEditor } from '@components/common/VerticalEditor';
import { createColorPalette } from '@components/common/VerticalEditor/preview/colorPalette';
import { confirm } from '@utils/dialog';
import { toast } from '@utils/toast';

export function openStoryManageModal(story, onEdit, onDelete, onSaveCb) {
  const entity = { ...story };

  // Подстановка обложки (или первого слайда)
  if (!entity.imageId && !entity.imagePath) {
    if (story.coverImageId) {
      entity.imageId = story.coverImageId;
    } else if (story.coverImagePath) {
      entity.imagePath = story.coverImagePath;
    } else if (story.slides && story.slides.length > 0) {
      entity.imageId = story.slides[0].imageId;
      entity.imagePath = story.slides[0].imagePath;
    }
  }

  // Функция мгновенного сохранения
  const applyInstantSave = (workingEntity) => {
    story.title = workingEntity.title;
    story.styleColor = workingEntity.styleColor;
    story.coverImageId = workingEntity.imageId;
    story.coverImagePath = workingEntity.imagePath;
    if (onSaveCb) onSaveCb(story);
  };

  openVerticalEditor({
    title: 'Настройки истории',
    entity,
    preview: true,
    previewSides: createColorPalette,
    
    // Мгновенно применяем визуальные изменения (цвет и картинку)
    onChange: (key, value, workingEntity) => {
      if (['styleColor', 'imageId', 'imagePath'].includes(key)) {
        applyInstantSave(workingEntity);
      }
    },

    onSave: (updated, done) => {
      if (!updated.title || !updated.title.trim()) {
        toast('Введите название истории', 'error');
        done();
        return;
      }
      applyInstantSave(updated);
      done();
    },
    
    onDelete: (deletedEntity, done) => {
      confirm('Удалить эту историю?', 'Подтверждение').then((ok) => {
        if (ok) {
          onDelete();
          done();
        }
      });
    },
    
    fields: [
      {
        id: 'title',
        label: 'Название',
        type: 'text',
        required: true,
        placeholder: 'Название истории',
      },
    ],
    
    extraActions: [
      {
        id: 'edit_slides',
        label: '✏️ Редактировать слайды',
        onClick: (ent, closeModal) => {
          applyInstantSave(ent);
          closeModal();
          onEdit();
        }
      }
    ],
    
    buttons: [
      {
        id: 'delete',
        label: '🗑 Удалить',
        variant: 'danger',
      },
      {
        id: 'save',
        label: '💾 Сохранить',
        variant: 'primary',
      },
    ],
  });
}