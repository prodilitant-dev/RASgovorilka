// src/modes/say/Say.categoryCreate.js
import { Modal } from '@components/common/Modal/Modal';
import { createElement, on } from '@utils/dom';
import { toast } from '@utils/toast';
import { uid } from '@utils/id';
import { saveProfile } from '@storage/appStorage';
import { setState } from '@state/store';
import { deleteImage } from '@services/image';
import { findCardImage } from '@utils/cardBank';
import { createImagePicker } from '@components/common/ImagePicker/ImagePicker';
import { applyStandardCards } from './utils/CategoryPresets';

export function openCategoryCreateModal(profile, onCreated) {
  let nameInput = null;
  let wordTypeSelect = null;
  const currentImage = { imageId: null, imagePath: null };
  let isUserSelectedImage = false;

  const wordTypeOptions = [
    { value: 'noun', label: 'Существительное' },
    { value: 'verb', label: 'Глагол' },
    { value: 'adjective', label: 'Прилагательное' },
    { value: 'pronoun', label: 'Местоимение' },
    { value: 'preposition', label: 'Предлог' },
    { value: 'other', label: 'Другое' },
  ];

  const modal = new Modal({
    title: 'Новая категория',
    body: () => {
      const wrap = createElement('div', { className: 've-fields' });

      // --- 1. Аватарка ---
      const avatarRow = createElement('div', {
        className: 've-field',
        style: 'align-items: center;',
      });
      avatarRow.appendChild(createElement('label', { className: 've-field-label' }, 'Изображение'));

      const renderPicker = () => {
        const picker = createImagePicker(
          { imageId: currentImage.imageId, imagePath: currentImage.imagePath, text: 'Категория' },
          { size: 256, showVariants: false, className: 'category-avatar-picker' },
          (updated) => {
            if (updated.imageId || updated.imagePath) {
              isUserSelectedImage = true;
            }
            currentImage.imageId = updated.imageId;
            currentImage.imagePath = updated.imagePath;
          },
          async () => {
            isUserSelectedImage = false;
            if (currentImage.imageId) {
              try {
                await deleteImage(currentImage.imageId);
              } catch {
                /* ignore */
              }
              currentImage.imageId = null;
            }
            currentImage.imagePath = null;
          }
        );

        const oldPicker = avatarRow.querySelector('.image-picker-wrap');
        if (oldPicker) {
          avatarRow.replaceChild(picker, oldPicker);
        } else {
          avatarRow.appendChild(picker);
        }
      };

      renderPicker();
      wrap.appendChild(avatarRow);

      // --- 2. Название ---
      const nameRow = createElement('div', { className: 've-field' });
      nameRow.appendChild(createElement('label', { className: 've-field-label' }, 'Название'));
      nameInput = createElement('input', {
        type: 'text',
        placeholder: 'Например: Одежда',
        autofocus: true,
      });

      on(nameInput, 'input', (e) => {
        if (isUserSelectedImage) return;

        const val = e.target.value;
        const foundPath = findCardImage(val);

        if (foundPath !== currentImage.imagePath) {
          currentImage.imagePath = foundPath;
          currentImage.imageId = null;
          renderPicker();
        }
      });

      on(nameInput, 'keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleCreate();
        }
      });
      nameRow.appendChild(nameInput);
      wrap.appendChild(nameRow);

      // --- 3. Тип слова ---
      const typeRow = createElement('div', { className: 've-field' });
      typeRow.appendChild(createElement('label', { className: 've-field-label' }, 'Тип слова'));
      wordTypeSelect = createElement('select', {});
      wordTypeOptions.forEach(({ value, label }) => {
        wordTypeSelect.appendChild(createElement('option', { value }, label));
      });
      typeRow.appendChild(wordTypeSelect);
      wrap.appendChild(typeRow);

      setTimeout(() => nameInput && nameInput.focus(), 100);
      return wrap;
    },
    buttons: [
      { label: 'Отмена', action: () => modal.close() },
      { label: 'Создать', primary: true, action: () => handleCreate() },
    ],
    onClose: async () => {
      if (
        currentImage.imageId &&
        !profile.categories.some((c) => c.imageId === currentImage.imageId)
      ) {
        try {
          await deleteImage(currentImage.imageId);
        } catch {
          /* ignore */
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

    if (profile.categories.some((c) => c.name.trim().toLowerCase() === name.toLowerCase())) {
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
      imageId: currentImage.imageId,
      imagePath: currentImage.imagePath,
    };

    const { cards, added } = await applyStandardCards(name, newCategory.wordType);
    profile.cards[newCategory.id] = cards;

    profile.categories.push(newCategory);
    saveProfile(profile);
    setState({ currentCategoryId: newCategory.id });

    toast(added ? 'Категория создана с карточками' : 'Категория создана');

    currentImage.imageId = null;
    modal.close();
    if (onCreated) onCreated(newCategory.id);
  }

  modal.open();
  return modal;
}
