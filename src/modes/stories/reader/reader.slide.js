// src/modes/stories/reader/reader.slide.js
import { createElement, on, clear } from '@utils/dom';
import { getImageUrl } from '@services/imageService';
import { createCard } from '@components/common/Card/Card';

/**
 * Рендерит текущий слайд в refs читалки:
 * точки-индикаторы, картинку слайда, карточки, состояние кнопок навигации.
 *
 * @param {Object} params
 * @param {Object} params.story
 * @param {number} params.slideIndex
 * @param {Object} params.refs - из createReaderDOM
 * @param {(cardData: Object, cardEl: HTMLElement) => void} params.onCardClick
 */
export async function renderSlide({ story, slideIndex, refs, onCardClick }) {
  const slide = story.slides[slideIndex];
  const { dotsWrap, imageEl, cardsTray, btnPrev, btnNext } = refs;

  // Точки-индикаторы
  clear(dotsWrap);
  if (story.slides.length > 1) {
    story.slides.forEach((_, idx) => {
      const dot = createElement('div', {
        className: `story-reader-dot ${idx === slideIndex ? 'active' : ''}`,
      });
      dotsWrap.appendChild(dot);
    });
  }

  // Картинка слайда
  imageEl.src = '';
  imageEl.style.display = 'none';
  if (slide.imageId) {
    const url = await getImageUrl(slide.imageId);
    if (url) {
      imageEl.src = url;
      imageEl.style.display = 'block';
    }
  } else if (slide.imagePath) {
    const base = import.meta.env.BASE_URL || '/';
    imageEl.src = base.endsWith('/') ? `${base}${slide.imagePath}` : `${base}/${slide.imagePath}`;
    imageEl.style.display = 'block';
  }

  // Карточки
  clear(cardsTray);
  if (slide.cards && slide.cards.length > 0) {
    slide.cards.forEach((cardData) => {
      const cardEl = createCard({
        id: cardData.id,
        text: cardData.text,
        imageId: cardData.imageId,
        imagePath: cardData.imagePath,
        emoji: cardData.emoji,
        className: 'card--mini',
      });
      on(cardEl, 'click', () => onCardClick(cardData, cardEl));
      cardsTray.appendChild(cardEl);
    });
  }

  // Кнопки навигации
  btnPrev.disabled = slideIndex === 0;
  btnNext.textContent = slideIndex === story.slides.length - 1 ? 'Готово' : 'Далее >';
}
