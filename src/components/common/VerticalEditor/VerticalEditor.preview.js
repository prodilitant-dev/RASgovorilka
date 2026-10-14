// src/components/common/VerticalEditor/VerticalEditor.preview.js
import { createElement, on } from '@utils/dom';
import { getImageUrl } from '@services/image';
import { iconUrl, isIconName } from '@utils/icon';

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

    box.style.backgroundImage = 'none';
    box.style.background = 'var(--bg)';

    // Удаляем прошлый контент
    const existingImg = box.querySelector('.ve-preview-img');
    if (existingImg) existingImg.remove();

    let textEl = box.querySelector('.ve-preview-text');
    if (!textEl) {
      textEl = createElement('div', { className: 've-preview-text' });
      box.appendChild(textEl);
    }

    // Имя иконки — рендерим картинку
    if (emoji && isIconName(emoji)) {
      textEl.textContent = '';
      const img = createElement('img', {
        src: iconUrl(emoji),
        alt: '',
        className: 've-preview-img',
        draggable: 'false',
      });
      img.style.maxWidth = '70%';
      img.style.maxHeight = '70%';
      img.style.objectFit = 'contain';
      img.addEventListener('error', () => {
        img.remove();
        textEl.textContent = text ? text.charAt(0).toUpperCase() : '➕';
      });
      box.appendChild(img);
      return;
    }

    // Обычный эмодзи или буква
    const isLetterFallback = !emoji && !!text;
    const fallbackText = emoji || (text ? text.charAt(0).toUpperCase() : '➕');
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
    const existingImg = box.querySelector('.ve-preview-img');
    if (existingImg) existingImg.remove();
  };

  // Приоритет: imageId → imagePath → fallback (эмодзи / иконка)
  if (entity.imageId) {
    box.classList.add('loading');
    getImageUrl(entity.imageId).then((url) => {
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

  // === Скрытые input'ы: галерея и камера ===
  const cleanupPopup = () => {
    document.querySelector('.ve-image-source-popup')?.remove();
  };

  const fileInputId = generateId();
  const fileInput = createElement('input', {
    type: 'file',
    accept: 'image/*',
    id: fileInputId,
    name: fileInputId,
    style: 'display:none;',
  });
  on(fileInput, 'change', async (e) => {
    cleanupPopup();
    const file = e.target.files[0];
    if (file) {
      await callbacks.onUploadImage(file);
    }
    fileInput.value = '';
  });
  box.appendChild(fileInput);

  const cameraInputId = generateId();
  const cameraInput = createElement('input', {
    type: 'file',
    accept: 'image/*',
    capture: 'environment',
    id: cameraInputId,
    name: cameraInputId,
    style: 'display:none;',
  });
  on(cameraInput, 'change', async (e) => {
    cleanupPopup();
    const file = e.target.files[0];
    if (file) {
      await callbacks.onUploadImage(file);
    }
    cameraInput.value = '';
  });
  box.appendChild(cameraInput);

  // На десктопе камеры нет — открываем файловый диалог сразу.
  // На мобильных — показываем мини-меню «Камера / Галерея».
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  on(box, 'click', (e) => {
    if (e.target.closest('.ve-preview-remove')) return;
    if (e.target.closest('.ve-image-source-popup')) return;

    if (!isMobile) {
      fileInput.click();
      return;
    }
    openImageSourcePopup(box, { fileInput, cameraInput });
  });

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

/** Мини-меню «Камера / Галерея», всплывающее под превью-боксом. */
function openImageSourcePopup(anchor, { fileInput, cameraInput }) {
  // Удаляем возможный «зависший» попап от прошлого вызова
  document.querySelector('.ve-image-source-popup')?.remove();

  const popup = createElement('div', { className: 've-image-source-popup' });
  const cameraBtn = createElement(
    'button',
    { type: 'button', className: 've-image-source-popup__btn' },
    '📷 Сделать фото'
  );
  const galleryBtn = createElement(
    'button',
    { type: 'button', className: 've-image-source-popup__btn' },
    '🖼 Выбрать из галереи'
  );

  const close = () => {
    popup.remove();
    document.removeEventListener('click', onDocClick, true);
    document.removeEventListener('keydown', onKey, true);
  };
  const onDocClick = (e) => {
    if (!popup.contains(e.target) && !anchor.contains(e.target)) close();
  };
  const onKey = (e) => {
    if (e.key === 'Escape') close();
  };

  cameraBtn.addEventListener('click', () => {
    // Сначала прячем попап, потом открываем системную камеру
    close();
    cameraInput.click();
  });
  galleryBtn.addEventListener('click', () => {
    close();
    fileInput.click();
  });

  popup.appendChild(cameraBtn);
  popup.appendChild(galleryBtn);
  document.body.appendChild(popup);

  const rect = anchor.getBoundingClientRect();
  popup.style.position = 'fixed';
  popup.style.top = `${rect.bottom + 8}px`;
  popup.style.left = `${rect.left + rect.width / 2}px`;
  popup.style.transform = 'translateX(-50%)';

  // Подписываемся на «клик вне» и Escape чуть позже, чтобы текущий клик не закрыл сразу
  setTimeout(() => {
    document.addEventListener('click', onDocClick, true);
    document.addEventListener('keydown', onKey, true);
  }, 0);
}

/** Загружает стандартное изображение из /public (cards, icons и т.п.). */
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
