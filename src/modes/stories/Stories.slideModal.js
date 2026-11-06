// src/modes/stories/Stories.slideModal.js
import { createElement, on, clear } from '@utils/dom';
import { Modal } from '@components/common/Modal/Modal';
import { searchCardBank } from '@utils/cardBank';
import { getImageUrl } from '@services/imageService';
import { uploadImage } from '@services/image';
import { openImageCropper } from '@components/common/ImageCropper';
import { openCardEditor } from '@modes/say/Say.editor';
import { uid } from '@utils/id';
import { toast } from '@utils/toast';

export function openSlideModal({ slide, onSave, onCancel }) {
  const workingSlide = JSON.parse(JSON.stringify(slide || { id: uid(), imageId: null, imagePath: null, cards: [] }));

  const modal = new Modal({
    title: 'Редактирование слайда',
    body: () => {
      const wrap = createElement('div', { className: 'slide-modal-wrap' });

      // 1. Картинка ситуации
      const imageSection = createElement('div', { className: 'slide-modal-section' });
      imageSection.appendChild(createElement('label', { className: 'slide-modal-label' }, 'Картинка ситуации:'));
      
      const imagePreview = createElement('div', { className: 'slide-image-preview' });
      const img = createElement('img', { alt: '' });
      const updateImagePreview = () => {
        img.src = '';
        if (workingSlide.imageId) {
          getImageUrl(workingSlide.imageId).then(url => { if (url) img.src = url; });
        } else if (workingSlide.imagePath) {
          const base = import.meta.env.BASE_URL || '/';
          img.src = base.endsWith('/') ? `${base}${workingSlide.imagePath}` : `${base}/${workingSlide.imagePath}`;
        }
      };
      updateImagePreview();
      imagePreview.appendChild(img);

      const btnUpload = createElement('button', { type: 'button', className: 'btn btn-secondary btn-sm' }, 'Загрузить фото');
      on(btnUpload, 'click', async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          try {
            const croppedBlob = await openImageCropper(file, { size: 512 });
            if (!croppedBlob) return;
            const imageId = await uploadImage(croppedBlob, { size: 512, showToast: true });
            workingSlide.imageId = imageId;
            workingSlide.imagePath = null;
            updateImagePreview();
          } catch (err) {
            toast('Ошибка загрузки фото', 'error');
          }
        };
        input.click();
      });

      imageSection.appendChild(imagePreview);
      imageSection.appendChild(btnUpload);
      wrap.appendChild(imageSection);

      // 2. Карточки
      const cardsSection = createElement('div', { className: 'slide-modal-section' });
      cardsSection.appendChild(createElement('label', { className: 'slide-modal-label' }, 'Карточки (кликните, чтобы озвучить):'));
      
      const cardsList = createElement('div', { className: 'slide-cards-list' });
      const renderCardsList = () => {
        clear(cardsList);
        workingSlide.cards.forEach((c, idx) => {
          const cardEl = createElement('div', { className: 'slide-card-item' });
          const cardText = createElement('span', { className: 'slide-card-text' }, c.text);
          const btnRemove = createElement('button', { className: 'slide-card-remove', type: 'button' }, '✕');
          on(btnRemove, 'click', () => {
            workingSlide.cards.splice(idx, 1);
            renderCardsList();
          });
          cardEl.appendChild(cardText);
          cardEl.appendChild(btnRemove);
          cardsList.appendChild(cardEl);
        });
        if (workingSlide.cards.length === 0) {
          cardsList.appendChild(createElement('div', { className: 'slide-empty-text' }, 'Карточек пока нет'));
        }
      };
      renderCardsList();
      cardsSection.appendChild(cardsList);

      // Поиск карточек
      const searchWrap = createElement('div', { className: 'slide-search-wrap' });
      const inputSearch = createElement('input', { type: 'text', placeholder: 'Поиск карточки...', className: 'slide-search-input' });
      const resultsEl = createElement('div', { className: 'slide-search-results' });
      resultsEl.style.display = 'none';

      on(inputSearch, 'input', (e) => {
        const query = e.target.value.trim();
        clear(resultsEl);
        if (!query) { resultsEl.style.display = 'none'; return; }
        
        const results = searchCardBank(query);
        if (results.length > 0) {
          resultsEl.style.display = 'block';
          results.forEach(r => {
            const item = createElement('div', { className: 'slide-search-item' }, r.text);
            on(item, 'click', () => {
              workingSlide.cards.push({ id: uid(), text: r.text, imagePath: r.imagePath, imageId: null });
              renderCardsList();
              inputSearch.value = '';
              resultsEl.style.display = 'none';
            });
            resultsEl.appendChild(item);
          });
        } else {
          resultsEl.style.display = 'block';
          const createBtn = createElement('div', { className: 'slide-search-item slide-search-create' }, `Создать "${query}"`);
          on(createBtn, 'click', () => {
            const newCard = { id: uid(), text: query, emoji: '', wordType: 'noun', forms: {} };
            openCardEditor(newCard, (savedCard, done) => {
              workingSlide.cards.push({ 
                id: savedCard.id, 
                text: savedCard.text, 
                imageId: savedCard.imageId, 
                imagePath: savedCard.imagePath 
              });
              renderCardsList();
              inputSearch.value = '';
              resultsEl.style.display = 'none';
              done();
            }, null);
          });
          resultsEl.appendChild(createBtn);
        }
      });

      searchWrap.appendChild(inputSearch);
      searchWrap.appendChild(resultsEl);
      cardsSection.appendChild(searchWrap);
      
      wrap.appendChild(cardsSection);
      return wrap;
    },
    buttons: [
      { label: 'Отмена', action: () => { modal.close(); if (onCancel) onCancel(); } },
      { 
        label: 'Готово', 
        primary: true, 
        action: () => { 
          if (!workingSlide.imageId && !workingSlide.imagePath) {
            toast('Добавьте картинку для ситуации', 'error');
            return;
          }
          modal.close(); 
          if (onSave) onSave(workingSlide); 
        } 
      }
    ]
  });
  modal.open();
}