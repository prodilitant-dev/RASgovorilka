// src/modes/stories/Stories.editor.js
import { createElement, on, clear } from '@utils/dom';
import { uid } from '@utils/id';
import { toast } from '@utils/toast';
import { showCardImage } from '@utils/image/showCardImage';
import { iconUrl } from '@utils/icon';
import { openStoryImagePicker } from './utils/StoryImagePicker';
import { openStoryCardModal } from './components/StoryCardModal';
import { openStoriesReader } from './Stories.reader'; // Для кнопки "Просмотр"
import '@styles/modes/stories-editor.css';
import { confirm } from '@utils/dialog';


export function openStoriesEditor(container, story, onSave, onCancel) {
  const isNew = !story;
  const workingStory = JSON.parse(
    JSON.stringify(story || { id: uid(), title: '', coverImageId: null, coverImagePath: null, slides: [] })
  );
  
  let currentSlideIndex = workingStory.slides.length > 0 ? 0 : -1;

  const root = createElement('div', { className: 'story-editor-root' });

  const renderEditor = () => {
    clear(root);

    // ==========================================
    // 1. ШАПКА (Сначала Картинка, потом Название)
    // ==========================================
    const header = createElement('div', { className: 'story-editor-header' });
    
    // Обложка
    const coverWrap = createElement('div', { className: 'story-cover-wrap' });
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
    coverWrap.appendChild(coverBtn);
    header.appendChild(coverWrap);

    // Название
    const titleWrap = createElement('div', { className: 'story-title-wrap' });
    const titleInput = createElement('input', {
      type: 'text',
      className: 'story-title-input',
      placeholder: 'Название истории...',
      value: workingStory.title || ''
    });
    on(titleInput, 'input', (e) => workingStory.title = e.target.value);
    titleWrap.appendChild(titleInput);
    header.appendChild(titleWrap);

    root.appendChild(header);

    // ==========================================
    // 2. ЦЕНТР (Слайды)
    // ==========================================
    const main = createElement('div', { className: 'story-editor-main' });

    if (workingStory.slides.length === 0) {
      // Если слайдов нет — показываем большую кнопку по центру
      const emptyBtn = createElement('button', { className: 'story-add-first-slide', type: 'button' });
      const emptyImg = createElement('img', { src: iconUrl('add'), alt: 'Добавить' });
      emptyBtn.appendChild(emptyImg);
      emptyBtn.appendChild(createElement('span', {}, 'Добавить первый слайд'));
      
      on(emptyBtn, 'click', () => {
        workingStory.slides.push({ id: uid(), imageId: null, imagePath: null, cards: [] });
        currentSlideIndex = 0;
        renderEditor();
      });
      main.appendChild(emptyBtn);
    } else {
      const slide = workingStory.slides[currentSlideIndex];

      // --- Верхняя панель над превью (Точки и Удалить) ---
      const topBar = createElement('div', { className: 'story-slide-top-bar' });
      
      // Точки
      const dotsWrap = createElement('div', { className: 'story-slide-dots' });
      workingStory.slides.forEach((_, idx) => {
        const dot = createElement('div', { 
          className: `story-slide-dot ${idx === currentSlideIndex ? 'active' : ''}` 
        });
        on(dot, 'click', () => { currentSlideIndex = idx; renderEditor(); });
        dotsWrap.appendChild(dot);
      });
      topBar.appendChild(dotsWrap);

      // Удалить слайд
      const btnDel = createElement('button', { className: 'story-slide-del-btn', type: 'button', 'aria-label': 'Удалить слайд' });
      const delImg = createElement('img', { src: iconUrl('trash'), alt: '🗑' });
      delImg.onerror = () => { delImg.replaceWith(document.createTextNode('🗑')); };
      btnDel.appendChild(delImg);
      
      on(btnDel, 'click', () => {
        // ИСПОЛЬЗУЕМ ВАШ КАСТОМНЫЙ CONFIRM
        confirm('Удалить этот слайд?', 'Подтверждение').then((ok) => {
          if (ok) {
            workingStory.slides.splice(currentSlideIndex, 1);
            currentSlideIndex = Math.max(0, currentSlideIndex - 1);
            if (workingStory.slides.length === 0) currentSlideIndex = -1;
            renderEditor();
          }
        });
      });
      topBar.appendChild(btnDel);
      main.appendChild(topBar);

      // --- Центральная часть (Навигация + Превью) ---
      const centerRow = createElement('div', { className: 'story-slide-center-row' });

      // Кнопка Назад
      const prevBtn = createElement('button', { className: 'story-nav-arrow', type: 'button', disabled: currentSlideIndex === 0 });
      const prevImg = createElement('img', { src: iconUrl('arrow-left'), alt: '⬅️' });
      prevImg.onerror = () => { prevImg.replaceWith(document.createTextNode('⬅️')); };
      prevBtn.appendChild(prevImg);
      on(prevBtn, 'click', () => { if(currentSlideIndex > 0) { currentSlideIndex--; renderEditor(); } });

      // Превью картинки
      const imgWrap = createElement('div', { className: 'story-editor-image-wrap' });
      if (slide.imageId || slide.imagePath) {
        showCardImage(imgWrap, slide, { fontSize: '3em' });
      } else {
        // Заглушка с add.webp
        const addImg = createElement('img', { src: iconUrl('add'), alt: 'Добавить картинку', className: 'story-placeholder-img' });
        addImg.onerror = () => { addImg.replaceWith(document.createTextNode('➕')); };
        imgWrap.appendChild(addImg);
      }
      on(imgWrap, 'click', () => {
        openStoryImagePicker(imgWrap, slide, (updatedMedia) => {
          Object.assign(slide, updatedMedia);
          renderEditor();
        });
      });

      // Кнопка Вперед / Добавить
      const isLastSlide = currentSlideIndex === workingStory.slides.length - 1;
      const nextBtn = createElement('button', { className: `story-nav-arrow ${isLastSlide ? 'is-add' : ''}`, type: 'button' });
      const nextImg = createElement('img', { src: iconUrl(isLastSlide ? 'add' : 'arrow-right'), alt: isLastSlide ? '➕' : '➡️' });
      nextImg.onerror = () => { nextImg.replaceWith(document.createTextNode(isLastSlide ? '➕' : '➡️')); };
      nextBtn.appendChild(nextImg);
      
      on(nextBtn, 'click', () => {
        if (isLastSlide) {
          // Создаем новый слайд
          workingStory.slides.push({ id: uid(), imageId: null, imagePath: null, cards: [] });
          currentSlideIndex++;
        } else {
          currentSlideIndex++;
        }
        renderEditor();
      });

      centerRow.appendChild(prevBtn);
      centerRow.appendChild(imgWrap);
      centerRow.appendChild(nextBtn);
      main.appendChild(centerRow);

      // --- Нижняя панель (Лента карточек) ---
      const cardsTray = createElement('div', { className: 'story-editor-cards-tray' });
      
      slide.cards.forEach((card, idx) => {
        const cardEl = createElement('div', { className: 'editor-mini-card' });
        const cardImgWrap = createElement('div', { className: 'editor-mini-card-img' });
        showCardImage(cardImgWrap, card, { fontSize: '1.5em' });
        
        const label = createElement('div', { className: 'editor-mini-card-label' }, card.text);
        const removeBtn = createElement('button', { className: 'editor-mini-card-remove', type: 'button' }, '✕');
        
        on(removeBtn, 'click', (e) => {
          e.stopPropagation();
          slide.cards.splice(idx, 1);
          renderEditor();
        });

        on(cardEl, 'click', () => {
          openStoryCardModal(card, (updatedCard) => {
            slide.cards[idx] = updatedCard;
            renderEditor();
          });
        });

        cardEl.appendChild(cardImgWrap);
        cardEl.appendChild(label);
        cardEl.appendChild(removeBtn);
        cardsTray.appendChild(cardEl);
      });

      // Кнопка добавления карточки
      const addCardBtn = createElement('button', { className: 'editor-add-card-btn', type: 'button' }, 'Добавить');
      on(addCardBtn, 'click', () => {
        openStoryCardModal(null, (newCard) => {
          slide.cards.push(newCard);
          renderEditor();
        });
      });
      
      cardsTray.appendChild(addCardBtn);
      
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

    // ==========================================
    // 3. ФУТЕР (Отмена, Просмотр, Сохранить)
    // ==========================================
    const footer = createElement('div', { className: 'story-editor-footer' });
    
    const btnCancel = createElement('button', { className: 'btn btn-secondary', type: 'button' }, 'Отмена');
    on(btnCancel, 'click', () => { if(onCancel) onCancel(); });

    const btnPreview = createElement('button', { className: 'btn btn-secondary', type: 'button' }, 'Просмотр');
    on(btnPreview, 'click', () => {
      if (workingStory.slides.length === 0) {
        toast('Сначала добавьте слайды', 'error');
        return;
      }
      // Открываем читалку, передавая текущий (несохраненный) объект
      openStoriesReader(workingStory);
    });

    const btnSave = createElement('button', { className: 'btn btn-primary', type: 'button' }, 'Сохранить');
    on(btnSave, 'click', () => {
      if (!workingStory.title.trim()) { toast('Введите название', 'error'); return; }
      if (workingStory.slides.length === 0) { toast('Добавьте слайд', 'error'); return; }
      if(onSave) onSave(workingStory);
    });

    footer.appendChild(btnCancel);
    footer.appendChild(btnPreview);
    footer.appendChild(btnSave);
    root.appendChild(footer);
  };

  renderEditor();
  clear(container);
  container.appendChild(root);
}