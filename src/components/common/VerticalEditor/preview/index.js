// src/components/common/VerticalEditor/preview/index.js
import { createElement } from '@utils/dom';
import { createImagePicker } from '@components/common/ImagePicker/ImagePicker';

export function renderPreview(entity, callbacks, previewSides) {
  const block = createElement('div', { className: 've-preview-block' });
  const row = createElement('div', { className: 've-preview-row' });

  if (previewSides && previewSides.left) {
    row.appendChild(previewSides.left);
  }

  const picker = createImagePicker(
    entity,
    { showVariants: true, className: 've-preview-picker' },
    (updatedSource) => {
      Object.assign(entity, updatedSource);
      if (callbacks.onFieldChange) {
        callbacks.onFieldChange('imagePath', updatedSource.imagePath);
        callbacks.onFieldChange('imageId', updatedSource.imageId);
        callbacks.onFieldChange('variants', updatedSource.variants);
      }
    },
    () => {
      if (callbacks.onRemoveImage) callbacks.onRemoveImage();
    }
  );

  if (entity.styleColor) {
    const box = picker.querySelector('.image-picker-box');
    if (box) {
      box.style.borderColor = entity.styleColor;
      box.style.borderStyle = 'solid';
      box.style.borderWidth = '3px';
    }
  }

  row.appendChild(picker);

  if (previewSides && previewSides.right) {
    row.appendChild(previewSides.right);
  }

  block.appendChild(row);
  return block;
}

export function updatePreviewText() {}