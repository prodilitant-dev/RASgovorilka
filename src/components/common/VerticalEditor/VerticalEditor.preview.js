// src/components/common/VerticalEditor/VerticalEditor.preview.js
import { createElement, on } from '@utils/dom';
import { getImageUrl } from '@services/image';

let idCounter = 0;
function generateId() {
  return `ve-file-${++idCounter}`;
}

export function renderPreview(entity, callbacks) {
  const block = createElement('div', { className: 've-preview-block' });
  const box = createElement('div', {
    className: 've-preview-box',
    'data-has-image': !!entity.imageId,
  });

  function showFallback(box, ent) {
    const emoji = ent.emoji || ent.icon || '';
    const text = ent.text || ent.name || '';
    const fallbackText = emoji || (text ? text.charAt(0).toUpperCase() : '➕');
    box.style.backgroundImage = 'none';
    box.style.background = 'var(--bg)';
    let textEl = box.querySelector('.ve-preview-text');
    if (!textEl) {
      textEl = createElement('div', { className: 've-preview-text' });
      box.appendChild(textEl);
    }
    textEl.textContent = fallbackText;
  }

  if (entity.imageId) {
    box.classList.add('loading');
    getImageUrl(entity.imageId).then(url => {
      box.classList.remove('loading');
      if (url) {
        box.style.backgroundImage = `url(${url})`;
        box.style.backgroundSize = 'cover';
        box.style.backgroundPosition = 'center';
        const textEl = box.querySelector('.ve-preview-text');
        if (textEl) textEl.textContent = '';
      } else {
        showFallback(box, entity);
      }
    });
  } else {
    showFallback(box, entity);
  }

  // Скрытый инпут для загрузки файла
  const fileInputId = generateId();
  const fileInput = createElement('input', {
    type: 'file',
    accept: 'image/*',
    id: fileInputId,
    name: fileInputId,
    style: 'display:none;',
  });
  on(fileInput, 'change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      await callbacks.onUploadImage(file);
    }
    fileInput.value = '';
  });
  box.appendChild(fileInput);

  on(box, 'click', () => fileInput.click());

  if (entity.imageId) {
    const removeBtn = createElement('button', { className: 've-preview-remove' }, '✕');
    on(removeBtn, 'click', (e) => {
      e.stopPropagation();
      callbacks.onRemoveImage();
    });
    box.appendChild(removeBtn);
  }

  block.appendChild(box);
  return block;
}