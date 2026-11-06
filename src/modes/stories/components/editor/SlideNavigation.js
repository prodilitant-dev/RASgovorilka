// src/modes/stories/components/editor/SlideNavigation.js
import { createElement, on } from '@utils/dom';
import { iconUrl } from '@utils/icon';
import { confirm } from '@utils/dialog';

export function createSlideNavigation(workingStory, currentSlideIndex, onUpdate, onDeleteSlide) {
  const topBar = createElement('div', { className: 'story-slide-top-bar' });
  
  // Точки
  const dotsWrap = createElement('div', { className: 'story-slide-dots' });
  workingStory.slides.forEach((_, idx) => {
    const dot = createElement('div', { 
      className: `story-slide-dot ${idx === currentSlideIndex ? 'active' : ''}` 
    });
    on(dot, 'click', () => onUpdate(idx));
    dotsWrap.appendChild(dot);
  });
  topBar.appendChild(dotsWrap);

  // Удалить
  const btnDel = createElement('button', { className: 'story-slide-del-btn', type: 'button', 'aria-label': 'Удалить слайд' });
  const delImg = createElement('img', { src: iconUrl('trash'), alt: '🗑' });
  delImg.onerror = () => { delImg.replaceWith(document.createTextNode('🗑')); };
  btnDel.appendChild(delImg);
  
  on(btnDel, 'click', () => {
    confirm('Удалить этот слайд?', 'Подтверждение').then((ok) => {
      if (ok) onDeleteSlide();
    });
  });
  topBar.appendChild(btnDel);

  return topBar;
}