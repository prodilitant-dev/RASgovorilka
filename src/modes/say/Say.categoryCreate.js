// src/modes/say/Say.categoryCreate.js
import { Modal } from '@components/common/Modal/Modal';
import { createElement, on } from '@utils/dom';
import { toast } from '@utils/toast';
import { uid } from '@utils/id';
import { saveProfile } from '@storage/appStorage';
import { setState } from '@state/store';
import { openImageCropper } from '@components/common/ImageCropper';
import { uploadImage, getImageUrl, deleteImage } from '@services/image';
import { logger } from '@utils/logger';

/**
 * Открывает модалку создания новой категории.
 * @param {Object} profile - текущий профиль
 * @param {Function} onCreated - (newCategoryId) => void, вызывается после создания
 */
export function openCategoryCreateModal(profile, onCreated) {
  let nameInput = null;
  let wordTypeSelect = null;
  let imageId = null; // локально, пока не создана категория
  let previewAvatar = null;
  let removeBtn = null;

  const wordTypeOptions = [
    { value: 'noun', label: 'Существительное' },
    { value: 'verb', label: 'Глагол' },
    { value: 'adjective', label: 'Прилагательное' },
    { value: 'pronoun', label: 'Местоимение' },
    { value: 'preposition', label: 'Предлог' },
    { value: 'other', label: 'Другое' },
  ];

  /**
   * Обновляет кружок-превью в соответствии с текущим imageId и name.
   * Также управляет видимостью кнопки удаления.
   */
  async function updatePreviewAvatar() {
    if (!previewAvatar) return;

    const name = nameInput?.value?.trim() || '';
    const letter = name.charAt(0).toUpperCase() || '?';

    // Сброс содержимого
    previewAvatar.innerHTML = '';
    previewAvatar.classList.remove('cat-avatar--fallback');

    if (imageId) {
      try {
        const url = await getImageUrl(imageId);
        if (url) {
          const img = createElement('img', {
            src: url,
            alt: '',
            className: 'cat-avatar__img',
            draggable: 'false',
          });
          previewAvatar.appendChild(img);
          if (removeBtn) removeBtn.style.display = 'inline-flex';
          return;
        }
      } catch (err) {
        logger.warn('categoryCreate: getImageUrl failed', err);
      }
    }

    // Фолбек: буква или камера-иконка, если имени ещё нет
    previewAvatar.classList.add('cat-avatar--fallback');
    previewAvatar.textContent = name ? letter : '📷';
    if (removeBtn) removeBtn.style.display = 'none';
  }

  /**
   * Обрабатывает выбор файла: кроппер → uploadImage → сохранение imageId.
   */
  async function handleFileSelected(file) {
    try {
      const croppedBlob = await openImageCropper(file, { size: 256 });
      if (!croppedBlob) return;

      // Если уже была картинка — удалим прежнюю, чтобы не оставлять мусор
      if (imageId) {
        try {
          await deleteImage(imageId);
        } catch {
          /* игнорируем */
        }
      }

      imageId = await uploadImage(croppedBlob, { size: 256, showToast: false });
      await updatePreviewAvatar();
    } catch (err) {
      logger.error('categoryCreate: upload failed', err);
      toast('Не удалось загрузить изображение', 'error');
    }
  }

  const modal = new Modal({
    title: 'Новая категория',
    body: () => {
      const wrap = createElement('div', { className: 've-fields' });

      // === Превью-аватарка с загрузкой ===
      const avatarRow = createElement('div', {
        className: 've-field',
        style: 'align-items: center;',
      });
      const avatarLabel = createElement('label', { className: 've-field-label' }, 'Изображение');

      previewAvatar = createElement('div', {
        className: 'cat-avatar cat-avatar--upload',
        style: 'width: 72px; height: 72px; cursor: pointer; font-size: 24px;',
        title: 'Нажмите, чтобы выбрать изображение',
      });
      previewAvatar.textContent = '📷';

      const fileInput = createElement('input', {
        type: 'file',
        accept: 'image/*',
        style: 'display: none;',
      });
      on(fileInput, 'change', async (e) => {
        const file = e.target.files?.[0];
        if (file) await handleFileSelected(file);
        fileInput.value = '';
      });

      on(previewAvatar, 'click', () => fileInput.click());

      // Удаление картинки (появляется после загрузки)
      removeBtn = createElement(
        'button',
        {
          type: 'button',
          className: 'cat-action-btn',
          style: 'margin-left: 8px; display: none;',
          'aria-label': 'Удалить изображение',
          title: 'Удалить',
        },
        '✕'
      );
      on(removeBtn, 'click', async (e) => {
        e.stopPropagation();
        if (imageId) {
          try {
            await deleteImage(imageId);
          } catch {
            /* игнорируем */
          }
          imageId = null;
        }
        await updatePreviewAvatar();
      });

      const avatarRowInner = createElement('div', {
        style: 'display: flex; align-items: center;',
      });
      avatarRowInner.appendChild(previewAvatar);
      avatarRowInner.appendChild(removeBtn);
      avatarRowInner.appendChild(fileInput);

      avatarRow.appendChild(avatarLabel);
      avatarRow.appendChild(avatarRowInner);
      wrap.appendChild(avatarRow);

      // === Название ===
      const nameRow = createElement('div', { className: 've-field' });
      const nameLabel = createElement('label', { className: 've-field-label' }, 'Название');
      nameInput = createElement('input', {
        type: 'text',
        placeholder: 'Например: Одежда',
        autofocus: true,
      });
      on(nameInput, 'input', () => updatePreviewAvatar());
      nameRow.appendChild(nameLabel);
      nameRow.appendChild(nameInput);
      wrap.appendChild(nameRow);

      // === Тип слова ===
      const typeRow = createElement('div', { className: 've-field' });
      const typeLabel = createElement('label', { className: 've-field-label' }, 'Тип слова');
      wordTypeSelect = createElement('select', {});
      wordTypeOptions.forEach(({ value, label }) => {
        const option = createElement('option', { value }, label);
        wordTypeSelect.appendChild(option);
      });
      typeRow.appendChild(typeLabel);
      typeRow.appendChild(wordTypeSelect);
      wrap.appendChild(typeRow);

      setTimeout(() => nameInput && nameInput.focus(), 100);

      on(nameInput, 'keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleCreate();
        }
      });

      return wrap;
    },
    buttons: [
      {
        label: 'Отмена',
        action: () => modal.close(),
      },
      {
        label: 'Создать',
        primary: true,
        action: () => handleCreate(),
      },
    ],
    onClose: async () => {
      // Если пользователь отменил, а картинка уже загружена — удаляем её,
      // чтобы не оставлять мусор в IndexedDB.
      if (imageId) {
        try {
          await deleteImage(imageId);
        } catch {
          /* игнорируем */
        }
      }
    },
  });

  async function handleCreate() {
    if (!nameInput || !wordTypeSelect) return;

    const name = nameInput.value.trim();
    if (!name) {
      toast('Введите название категории', 'error');
      nameInput.focus();
      return;
    }

    const exists = profile.categories.some(
      (c) => c.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      toast('Категория с таким названием уже есть', 'error');
      nameInput.focus();
      nameInput.select();
      return;
    }

    const newCategory = {
      id: uid(),
      name,
      wordType: wordTypeSelect.value,
      hidden: false,
      imageId: imageId || null,
    };

    profile.categories.push(newCategory);
    profile.cards[newCategory.id] = [];
    saveProfile(profile);
    setState({ currentCategoryId: newCategory.id });

    toast('Категория создана');

    // Защищаем imageId от удаления в onClose
    imageId = null;

    modal.close();
    if (onCreated) onCreated(newCategory.id);
  }

  modal.open();
  return modal;
}
