// src/modes/stories/components/StoryCardModal.js
import { Modal } from '@components/common/Modal/Modal';
import { createElement, on, clear } from '@utils/dom';
import { findBankItem } from '@utils/cardBank';
import { createImagePicker } from '@components/common/ImagePicker/ImagePicker';
import { uid } from '@utils/id';

let isModalOpen = false;

export function openStoryCardModal(existingCard, onSave) {
  if (isModalOpen) return;
  isModalOpen = true;

  const isEditing = !!existingCard;

  const createEmptyCard = () => ({
    id: uid(),
    text: '',
    imageId: null,
    imagePath: null,
    emoji: '',
    variants: [],
    category: null,
    filename: null,
  });

  let workingCard = JSON.parse(JSON.stringify(existingCard || createEmptyCard()));

  let modalInstance = null;
  let contentWrap = null;
  let textInput = null;
  let pickerContainer = null;

  function render() {
    if (!contentWrap) return;
    clear(contentWrap);

    // Контейнер для картинки
    pickerContainer = createElement('div', { className: 'story-card-picker-wrap' });

    // Используем новый глобальный ImagePicker
    const picker = createImagePicker(
      workingCard,
      { showVariants: true, size: 512 },
      (updatedSource) => {
        Object.assign(workingCard, updatedSource);
        // Перерисовываем превью, чтобы обновить фолбеки/картинки
        render();
      },
      () => {
        workingCard.imageId = null;
        workingCard.imagePath = null;
        workingCard.emoji = '';
        workingCard.variants = [];
        render();
      }
    );
    pickerContainer.appendChild(picker);

    // Поле ввода
    textInput = createElement('input', {
      type: 'text',
      className: 'slide-search-input',
      placeholder: 'Текст карточки...',
      value: workingCard.text || '',
    });

    on(textInput, 'input', (e) => {
      const val = e.target.value;
      workingCard.text = val;

      // Автопоиск в банке
      if (!workingCard.imageId) {
        if (val.trim()) {
          const bankItem = findBankItem(val);
          if (bankItem) {
            const newPath = `cards/${bankItem.category}/${bankItem.filename || bankItem.word + '.webp'}`;
            if (workingCard.imagePath !== newPath) {
              workingCard.imagePath = newPath;
              workingCard.variants = bankItem.variants || [];
              workingCard.category = bankItem.category;
              workingCard.filename = bankItem.filename;
              // Обновляем только пикер, чтобы не сбивать фокус
              clear(pickerContainer);
              const newPicker = createImagePicker(
                workingCard,
                { showVariants: true, size: 512 },
                (updated) => {
                  Object.assign(workingCard, updated);
                  render();
                },
                () => {
                  workingCard.imagePath = null;
                  render();
                }
              );
              pickerContainer.appendChild(newPicker);
            }
          } else {
            if (workingCard.imagePath !== null && !workingCard.imageId) {
              workingCard.imagePath = null;
              workingCard.variants = [];
              workingCard.category = null;
              workingCard.filename = null;
              clear(pickerContainer);
              const newPicker = createImagePicker(
                workingCard,
                { showVariants: true, size: 512 },
                (updated) => {
                  Object.assign(workingCard, updated);
                  render();
                },
                () => {
                  workingCard.imagePath = null;
                  render();
                }
              );
              pickerContainer.appendChild(newPicker);
            }
          }
        }
      }
    });

    on(textInput, 'keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!isEditing) {
          handleAddAndContinue();
        }
      }
    });

    contentWrap.appendChild(pickerContainer);
    contentWrap.appendChild(textInput);

    setTimeout(() => textInput.focus(), 50);
  }

  function handleAddAndContinue() {
    if (!workingCard.text.trim()) return;
    onSave({ ...workingCard });
    workingCard = createEmptyCard();
    render();
  }

  modalInstance = new Modal({
    title: isEditing ? 'Редактировать' : 'Добавить',
    showCloseButton: true,
    onClose: () => {
      isModalOpen = false;
    },
    headerAction: {
      label: isEditing ? 'Сохранить' : 'Добавить',
      action: () => {
        if (isEditing) {
          if (!workingCard.text.trim()) workingCard.text = 'Без названия';
          onSave(workingCard);
          modalInstance.close();
        } else {
          handleAddAndContinue();
        }
      },
    },
    body: () => {
      contentWrap = createElement('div', { className: 'story-card-modal-wrap' });
      render();
      return contentWrap;
    },
    buttons: [],
  });

  modalInstance.open();
}
