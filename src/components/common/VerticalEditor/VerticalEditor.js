// src/components/common/VerticalEditor/VerticalEditor.js
import { Modal } from '../Modal/Modal';
import { renderVerticalEditorContent } from './VerticalEditor.view';
import { uploadImage } from '@services/image';
import { toast } from '@utils/toast';
import { logger } from '@utils/logger';
import { confirm } from '@utils/dialog';

export function openVerticalEditor(config) {
  const {
    title,
    entity,
    onSave = null,
    onDelete = null,
    onClose = null,
    fields = [],
    extraActions = [],
    buttons = [],
    preview = null,
  } = config;

  const workingEntity = JSON.parse(JSON.stringify(entity));
  let modalInstance = null;
  let contentContainer = null;
  let isSaving = false;

  function renderContent() {
    if (!contentContainer) return;

    const { element, cleanup } = renderVerticalEditorContent({
      entity: workingEntity,
      title,
      fields,
      extraActions,
      buttons,
      preview,
      callbacks: {
        onFieldChange: (key, value) => {
          workingEntity[key] = value;
          const field = fields.find(f => f.id === key);
          if (field && field.onChange) {
            field.onChange(value, workingEntity);
          }
          renderContent();
        },
        onUploadImage: async (file) => {
          try {
            const imageId = await uploadImage(file, { size: 256, showToast: true });
            workingEntity.imageId = imageId;
            workingEntity.emoji = '';
            toast('Фото загружено', 'success');
            renderContent();
          } catch (err) {
            logger.error('Upload error:', err);
          }
        },
        onRemoveImage: () => {
          workingEntity.imageId = null;
          renderContent();
        },
        onExtraActionClick: (actionId) => {
          const action = extraActions.find(a => a.id === actionId);
          if (action && action.onClick) {
            action.onClick(workingEntity, () => modalInstance.close());
          }
        },
        onSave: async () => {
          if (isSaving) return;
          isSaving = true;
          try {
            if (onSave) {
              await new Promise((resolve, reject) => {
                onSave(workingEntity, (err) => {
                  if (err) reject(err);
                  else resolve();
                });
              });
            }
            modalInstance.close();
          } catch (err) {
            logger.error('Save error:', err);
            toast('Ошибка сохранения', 'error');
          } finally {
            isSaving = false;
          }
        },
        onDelete: () => {
          if (!onDelete) return;
          confirm('Удалить этот элемент?', 'Подтверждение').then((ok) => {
            if (ok) {
              onDelete(workingEntity, () => modalInstance.close());
            }
          });
        },
        onClose: () => {
          if (onClose) {
            onClose(workingEntity, () => modalInstance.close());
          } else {
            modalInstance.close();
          }
        },
      },
    });

    contentContainer.innerHTML = '';
    contentContainer.appendChild(element);

    if (contentContainer._cleanup) {
      contentContainer._cleanup();
    }
    contentContainer._cleanup = cleanup;
  }

  modalInstance = new Modal({
    title: '',
    body: () => {
      const wrap = document.createElement('div');
      wrap.className = 'vertical-editor-wrapper';
      contentContainer = wrap;
      renderContent();
      return wrap;
    },
    buttons: [],
    onClose: () => {
      if (contentContainer && contentContainer._cleanup) {
        contentContainer._cleanup();
        contentContainer._cleanup = null;
      }
      if (onClose) {
        onClose(workingEntity, () => {});
      }
    },
  });

  modalInstance.open();

  return {
    close: () => modalInstance.close(),
    update: renderContent,
  };
}