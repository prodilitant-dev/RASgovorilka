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
    'data-has-image': !!(entity.imageId || entity.imagePath),
  });

  function showFallback(box, ent) {
    const emoji = ent.emoji || ent.icon || '';
    const text = ent.text || ent.name || '';
    const isLetterFallback = !emoji && !!text;
    const fallbackText = emoji || (text ? text.charAt(0).toUpperCase() : '➕');

    box.style.backgroundImage = 'none';
    box.style.background = 'var(--bg)';

    let textEl = box.querySelector('.ve-preview-text');
    if (!textEl) {
      textEl = createElement('div', { className: 've-preview-text' });
      box.appendChild(textEl);
    }
    textEl.textContent = fallbackText;

    if (isLetterFallback) {
      textEl.style.color = 'var(--text-muted)';
      textEl.style.opacity = '0.4';
      textEl.style.fontSize = '3em';
    } else {
      textEl.style.color = '';
      textEl.style.opacity = '';
      textEl.style.fontSize = '';
    }
  }

  const applyImageUrl = (url) => {
    box.style.backgroundImage = `url(${url})`;
    box.style.backgroundSize = 'contain';
    box.style.backgroundPosition = 'center';
    box.style.backgroundRepeat = 'no-repeat';
    const textEl = box.querySelector('.ve-preview-text');
    if (textEl) textEl.textContent = '';
  };

  // Приоритет: imageId → imagePath → fallback
  if (entity.imageId) {
    box.classList.add('loading');
    getImageUrl(entity.imageId).then(url => {
      box.classList.remove('loading');
      if (url) {
        applyImageUrl(url);
      } else if (entity.imagePath) {
        loadStockImage(entity.imagePath, box, applyImageUrl, () => showFallback(box, entity));
      } else {
        showFallback(box, entity);
      }
    });
  } else if (entity.imagePath) {
    box.classList.add('loading');
    loadStockImage(entity.imagePath, box, applyImageUrl, () => showFallback(box, entity));
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

function loadStockImage(imagePath, box, onLoad, onError) {
  const base = import.meta.env.BASE_URL || '/';
  const url = base.endsWith('/') ? `${base}${imagePath}` : `${base}/${imagePath}`;
  const probe = new Image();
  probe.onload = () => {
    box.classList.remove('loading');
    onLoad(url);
  };
  probe.onerror = () => {
    box.classList.remove('loading');
    onError();
  };
  probe.src = url;
}