// src/modes/stories/Stories.editor.js
import { createElement, on, clear } from '@utils/dom';
import { uid } from '@utils/id';
import { toast } from '@utils/toast';
import { showCardImage } from '@utils/image/showCardImage';
import { openStoryImagePicker } from './utils/StoryImagePicker';
import { openStoryCardModal } from './components/StoryCardModal';
import '@styles/modes/stories-editor.css';

export function openStoriesEditor(container, story, onSave, onCancel) {
  const isNew = !story;
  const workingStory = JSON.parse(
    JSON.stringify(story || { id: uid(), title: '', coverImageId: null, coverImagePath: null, slides: [] })
  );
  
  let currentSlideIndex = workingStory.slides.length > 0 ? 0 : -1;

  const root = createElement('div', { className: 'story-editor-root' });

  const renderEditor = () => {
    clear(root);

    // 1. ШАПКА (Название и Обложка)
    const header = createElement('div', { className: 'story-editor-header' });
    
    const titleInput = createElement('input', {
      type: 'text',
      className: 'story-title-input',
      placeholder: 'Название истории...',
      value: workingStory.title || ''
    });
    on(titleInput, 'input', (e) => workingStory.title = e.target.value);
    
    // Кнопка обложки
    const coverBtn = createElement('div', { className: 'story-cover-btn' });
    showCardImage(coverBtn, {
      imageId: workingStory.coverImageId,
      imagePath: workingStory.coverImagePath,
      text: 'Обложка'
    }, { cover: true, fontSize: '1rem' });
    
    on(coverBtn, 'click', () => {
      openStoryImagePicker(coverBtn, workingStory, (updatedMedia) => {
        Object.assign(workingStory, {
          coverImageId: updatedMedia.imageId,
          coverImagePath: updatedMedia.imagePath
        });
        renderEditor();
      });
    });

    header.appendChild(titleInput);
    header.appendChild(coverBtn);
    root.appendChild(header);

    // 2. ЦЕНТР (Слайды и Карточки)
    const main = createElement('div', { className: 'story-editor-main' });

    if (workingStory.slides.length === 0) {
      const empty = createElement('div', { className: 'story-editor-empty' }, 'Добавьте первый слайд');
      main.appendChild(empty);
      
      const addBtn = createElement('button', { className: 'btn btn-primary', type: 'button' }, '+ Создать слайд');
      on(addBtn, 'click', () => {
        workingStory.slides.push({ id: uid(), imageId: null, imagePath: null, cards: [] });
        currentSlideIndex = 0;
        renderEditor();
      });
      main.appendChild(addBtn);
    } else {
      const slide = workingStory.slides[currentSlideIndex];

      // Навигация по слайдам
      const nav = createElement('div', { className: 'story-editor-nav' });
      const prevBtn = createElement('button', { className: 'btn btn-secondary btn-sm', type: 'button' }, '<');
      const nextBtn = createElement('button', { className: 'btn btn-secondary btn-sm', type: 'button' }, '>');
      const slideNum = createElement('span', { className: 'slide-num' }, `Слайд ${currentSlideIndex + 1} из ${workingStory.slides.length}`);
      
      prevBtn.disabled = currentSlideIndex === 0;
      nextBtn.disabled = currentSlideIndex === workingStory.slides.length - 1;
      
      on(prevBtn, 'click', () => { currentSlideIndex--; renderEditor(); });
      on(nextBtn, 'click', () => { currentSlideIndex++; renderEditor(); });

      const addSlideBtn = createElement('button', { className: 'btn btn-secondary btn-sm', type: 'button' }, '+ Слайд');
      on(addSlideBtn, 'click', () => {
        workingStory.slides.push({ id: uid(), imageId: null, imagePath: null, cards: [] });
        currentSlideIndex++;
        renderEditor();
      });

      const delSlideBtn = createElement('button', { className: 'btn btn-danger btn-sm', type: 'button' }, 'Удалить слайд');
      on(delSlideBtn, 'click', () => {
        if (confirm('Удалить этот слайд?')) {
          workingStory.slides.splice(currentSlideIndex, 1);
          currentSlideIndex = Math.max(0, currentSlideIndex - 1);
          renderEditor();
        }
      });

      nav.appendChild(prevBtn);
      nav.appendChild(slideNum);
      nav.appendChild(nextBtn);
      nav.appendChild(addSlideBtn);
      nav.appendChild(delSlideBtn);
      main.appendChild(nav);

      // Картинка слайда (Ситуация)
      const imgWrap = createElement('div', { className: 'story-editor-image-wrap' });
      showCardImage(imgWrap, slide, { fontSize: '3em' });
      imgWrap.title = 'Нажмите, чтобы изменить картинку';
      
      on(imgWrap, 'click', () => {
        openStoryImagePicker(imgWrap, slide, (updatedMedia) => {
          Object.assign(slide, updatedMedia);
          renderEditor();
        });
      });
      
      main.appendChild(imgWrap);

      // Лента карточек
      const cardsTray = createElement('div', { className: 'story-editor-cards-tray' });
      
      slide.cards.forEach((card, idx) => {
        const cardEl = createElement('div', { className: 'editor-mini-card' });
        
        const imgWrap = createElement('div', { className: 'editor-mini-card-img' });
        showCardImage(imgWrap, card, { fontSize: '1.5em' });
        
        const label = createElement('div', { className: 'editor-mini-card-label' }, card.text);
        const removeBtn = createElement('button', { className: 'editor-mini-card-remove', type: 'button' }, '✕');
        
        on(removeBtn, 'click', (e) => {
          e.stopPropagation();
          slide.cards.splice(idx, 1);
          renderEditor();
        });

        // Клик по карточке открывает редактор
        on(cardEl, 'click', () => {
          openStoryCardModal(card, (updatedCard) => {
            slide.cards[idx] = updatedCard;
            renderEditor();
          });
        });

        cardEl.appendChild(imgWrap);
        cardEl.appendChild(label);
        cardEl.appendChild(removeBtn);
        cardsTray.appendChild(cardEl);
      });

      // Кнопка добавления карточки
      const addCardBtn = createElement('button', { className: 'editor-add-card-btn', type: 'button' }, '➕');
      on(addCardBtn, 'click', () => {
        openStoryCardModal(null, (newCard) => {
          slide.cards.push(newCard);
          renderEditor();
        });
      });
      cardsTray.appendChild(addCardBtn);

      main.appendChild(cardsTray);
    }

    root.appendChild(main);

    // 3. ФУТЕР (Кнопки Сохранить/Отмена)
    const footer = createElement('div', { className: 'story-editor-footer' });
    const btnCancel = createElement('button', { className: 'btn btn-secondary', type: 'button' }, 'Отмена');
    const btnSave = createElement('button', { className: 'btn btn-primary', type: 'button' }, 'Сохранить');

    on(btnCancel, 'click', () => { if(onCancel) onCancel(); });
    on(btnSave, 'click', () => {
      if (!workingStory.title.trim()) { toast('Введите название', 'error'); return; }
      if (workingStory.slides.length === 0) { toast('Добавьте слайд', 'error'); return; }
      if(onSave) onSave(workingStory);
    });

    footer.appendChild(btnCancel);
    footer.appendChild(btnSave);
    root.appendChild(footer);
  };

  renderEditor();
  clear(container);
  container.appendChild(root);
}