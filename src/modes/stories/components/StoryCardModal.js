// src/modes/stories/components/StoryCardModal.js
import { Modal } from '@components/common/Modal/Modal';
import { createElement, on, clear } from '@utils/dom';
import { searchCardBank } from '@utils/cardBank';
import { showCardImage } from '@utils/image/showCardImage';
import { openStoryImagePicker } from '../utils/StoryImagePicker';
import { uid } from '@utils/id';

export function openStoryCardModal(existingCard, onSave) {
  const isEditing = !!existingCard;
  const workingCard = JSON.parse(JSON.stringify(existingCard || { id: uid(), text: '', imageId: null, imagePath: null, emoji: '' }));

  let step = isEditing ? 'edit' : 'search'; // 'search' или 'edit'
  let modalInstance = null;
  let contentWrap = null;

  function render() {
    if (!contentWrap) return;
    clear(contentWrap);

    if (step === 'search') {
      // --- ШАГ 1: ПОИСК ---
      const searchInput = createElement('input', {
        type: 'text',
        className: 'slide-search-input',
        placeholder: 'Введите слово для поиска...',
        value: workingCard.text || ''
      });
      const resultsWrap = createElement('div', { className: 'slide-search-results-inline' });
      
      const performSearch = (q) => {
        clear(resultsWrap);
        if (!q.trim()) return;

        const found = searchCardBank(q);
        if (found.length > 0) {
          found.forEach(r => {
            const item = createElement('div', { className: 'search-item' }, r.text);
            on(item, 'click', () => {
              Object.assign(workingCard, { text: r.text, imagePath: r.imagePath, imageId: null, emoji: '' });
              step = 'edit';
              render();
            });
            resultsWrap.appendChild(item);
          });
        } else {
          const createBtn = createElement('div', { className: 'search-item search-create' }, `➕ Создать "${q}"`);
          on(createBtn, 'click', () => {
            Object.assign(workingCard, { text: q, imagePath: null, imageId: null, emoji: '' });
            step = 'edit';
            render();
          });
          resultsWrap.appendChild(createBtn);
        }
      };

      on(searchInput, 'input', (e) => performSearch(e.target.value));
      if (workingCard.text) performSearch(workingCard.text);

      const container = createElement('div', { className: 'story-card-modal-step' }, [
        searchInput,
        resultsWrap
      ]);
      contentWrap.appendChild(container);
      
      setTimeout(() => searchInput.focus(), 100);
    } else {
      // --- ШАГ 2: РЕДАКТИРОВАНИЕ ---
      const editWrap = createElement('div', { className: 'story-card-modal-step' });
      
      // Превью карточки
      const previewBox = createElement('div', { className: 'story-card-edit-preview' });
      showCardImage(previewBox, workingCard, { fontSize: '2em' });
      previewBox.title = 'Нажмите, чтобы изменить картинку';
      on(previewBox, 'click', () => {
        openStoryImagePicker(previewBox, workingCard, (updatedMedia) => {
          Object.assign(workingCard, updatedMedia);
          render();
        });
      });

      // Поле текста
      const textInput = createElement('input', {
        type: 'text',
        className: 'slide-search-input',
        placeholder: 'Текст карточки...',
        value: workingCard.text || ''
      });
      on(textInput, 'input', (e) => {
        workingCard.text = e.target.value;
      });

      // Кнопки шага
      const actions = createElement('div', { className: 'story-card-edit-actions' });
      
      const btnBack = createElement('button', { className: 'btn btn-secondary', type: 'button' }, isEditing ? 'Отмена' : 'Назад');
      on(btnBack, 'click', () => {
        if (isEditing) {
          modalInstance.close();
        } else {
          step = 'search';
          render();
        }
      });

      const btnAdd = createElement('button', { className: 'btn btn-primary', type: 'button' }, isEditing ? 'Сохранить' : 'Добавить');
      on(btnAdd, 'click', () => {
        if (!workingCard.text.trim()) {
          workingCard.text = 'Без названия';
        }
        onSave(workingCard);
        modalInstance.close();
      });

      actions.appendChild(btnBack);
      actions.appendChild(btnAdd);

      editWrap.appendChild(previewBox);
      editWrap.appendChild(textInput);
      editWrap.appendChild(actions);
      contentWrap.appendChild(editWrap);
    }
  }

  modalInstance = new Modal({
    title: isEditing ? 'Редактировать карточку' : 'Добавить карточку',
    showCloseButton: true,
    body: () => {
      contentWrap = createElement('div', { className: 'story-card-modal-wrap' });
      render();
      return contentWrap;
    },
    buttons: [] // Используем свои кнопки внутри контента
  });

  modalInstance.open();
}