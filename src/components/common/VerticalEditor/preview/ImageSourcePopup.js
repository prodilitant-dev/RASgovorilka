// src/components/common/VerticalEditor/preview/ImageSourcePopup.js
import { createElement } from '@utils/dom';

let activePopupCleanup = null; // <-- ГЛОБАЛЬНАЯ ССЫЛКА НА ОЧИСТКУ

export function openImageSourcePopup(anchor, { fileInput, cameraInput, onSelectFromBank }) {
  // Закрываем предыдущий попап, если он был
  if (activePopupCleanup) {
    activePopupCleanup();
    activePopupCleanup = null;
  }

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
  const bankBtn = createElement(
    'button',
    { type: 'button', className: 've-image-source-popup__btn' },
    '📚 Выбрать из банка'
  );

  let timeoutId = null;

  const close = () => {
    popup.remove();
    if (timeoutId) clearTimeout(timeoutId);
    document.removeEventListener('click', onDocClick, true);
    document.removeEventListener('keydown', onKey, true);
    activePopupCleanup = null;
  };

  const onDocClick = (e) => {
    if (!document.body.contains(popup)) {
      close();
      return;
    }
    if (!popup.contains(e.target) && !anchor.contains(e.target)) {
      close();
    }
  };

  const onKey = (e) => {
    if (e.key === 'Escape') close();
  };

  cameraBtn.addEventListener('click', () => {
    close();
    cameraInput.click();
  });
  galleryBtn.addEventListener('click', () => {
    close();
    fileInput.click();
  });

  if (onSelectFromBank) {
    bankBtn.addEventListener('click', () => {
      close();
      onSelectFromBank();
    });
    popup.appendChild(cameraBtn);
    popup.appendChild(galleryBtn);
    popup.appendChild(bankBtn);
  } else {
    popup.appendChild(cameraBtn);
    popup.appendChild(galleryBtn);
  }

  document.body.appendChild(popup);

  const rect = anchor.getBoundingClientRect();
  popup.style.position = 'fixed';
  popup.style.top = `${rect.bottom + 8}px`;
  popup.style.left = `${rect.left + rect.width / 2}px`;
  popup.style.transform = 'translateX(-50%)';

  timeoutId = setTimeout(() => {
    document.addEventListener('click', onDocClick, true);
    document.addEventListener('keydown', onKey, true);
    timeoutId = null;
  }, 0);

  // Сохраняем функцию очистки
  activePopupCleanup = close;
}
