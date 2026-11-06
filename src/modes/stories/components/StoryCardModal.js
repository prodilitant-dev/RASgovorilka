// src/modes/stories/components/StoryCardModal.js
import { Modal } from '@components/common/Modal/Modal';
import { createElement, on, clear } from '@utils/dom';
import { findBankItem } from '@utils/cardBank';
import { showCardImage } from '@utils/image/showCardImage';
import { openStoryImagePicker } from '../utils/StoryImagePicker';
import { uid } from '@utils/id';

let isModalOpen = false; // <-- ЗАЩИТА ОТ ДУБЛЕЙ

export function openStoryCardModal(existingCard, onSave) {
  if (isModalOpen) return; // Если модалка уже открыта, игнорируем клик
  isModalOpen = true;

  const isEditing = !!existingCard;
  
  const createEmptyCard = () => ({ 
    id: uid(), 
    text: '', 
    imageId: null, 
    imagePath: null, 
    emoji: '' 
  });

  let workingCard = JSON.parse(JSON.stringify(existingCard || createEmptyCard()));

  let modalInstance = null;
  let contentWrap = null;
  let textInput = null;
  let previewBox = null;

  function render() {
    if (!contentWrap) return;
    clear(contentWrap);

    previewBox = createElement('div', { className: 'story-card-edit-preview' });
    showCardImage(previewBox, workingCard, { fontSize: '2.5em' });
    previewBox.title = 'Нажмите, чтобы изменить картинку';
    
    on(previewBox, 'click', () => {
      openStoryImagePicker(previewBox, workingCard, (updatedMedia) => {
        Object.assign(workingCard, updatedMedia);
        render();
      });
    });

    textInput = createElement('input', {
      type: 'text',
      className: 'slide-search-input',
      placeholder: 'Текст карточки...',
      value: workingCard.text || ''
    });

    on(textInput, 'input', (e) => {
      const val = e.target.value;
      workingCard.text = val;

      if (!workingCard.imageId) {
        if (val.trim()) {
          const bankItem = findBankItem(val);
          if (bankItem) {
            const newPath = `cards/${bankItem.category}/${bankItem.filename || bankItem.word + '.webp'}`;
            if (workingCard.imagePath !== newPath) {
              workingCard.imagePath = newPath;
              showCardImage(previewBox, workingCard, { fontSize: '2.5em' });
            }
          } else {
            if (workingCard.imagePath !== null) {
              workingCard.imagePath = null;
              showCardImage(previewBox, workingCard, { fontSize: '2.5em' });
            }
          }
        } else {
           if (workingCard.imagePath !== null) {
             workingCard.imagePath = null;
             showCardImage(previewBox, workingCard, { fontSize: '2.5em' });
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

    contentWrap.appendChild(previewBox);
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
      isModalOpen = false; // <-- СНИМАЕМ БЛОКИРОВКУ ПРИ ЗАКРЫТИИ
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
      }
    },
    body: () => {
      contentWrap = createElement('div', { className: 'story-card-modal-wrap' });
      render();
      return contentWrap;
    },
    buttons: []
  });

  modalInstance.open();
}