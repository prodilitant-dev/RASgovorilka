// src/modes/stories/components/editor/SlideContent.js
import { createElement, on } from '@utils/dom';
import { createImagePicker } from '@components/common/ImagePicker/ImagePicker';
import { iconUrl } from '@utils/icon';

export function createSlideContent(slide, isFirst, isLast, onPrev, onNext, onUpdate) {
  const fragment = document.createDocumentFragment();

  const centerRow = createElement('div', { className: 'story-slide-center-row' });

  const prevBtn = createElement('button', { className: 'story-nav-arrow', type: 'button', disabled: isFirst });
  const prevImg = createElement('img', { src: iconUrl('arrow-left'), alt: '⬅️' });
  prevImg.onerror = () => prevImg.replaceWith(document.createTextNode('⬅️'));
  prevBtn.appendChild(prevImg);
  on(prevBtn, 'click', onPrev);

  const slidePicker = createImagePicker(
    slide,
    { showVariants: false, size: 512, className: 'story-slide-picker' },
    (updatedSource) => {
      Object.assign(slide, updatedSource);
      onUpdate();
    }
  );

  const nextBtn = createElement('button', { className: `story-nav-arrow ${isLast ? 'is-add' : ''}`, type: 'button' });
  const nextImg = createElement('img', { 
    src: iconUrl(isLast ? 'add' : 'arrow-right'), 
    alt: isLast ? '➕' : '➡️',
    style: isLast ? 'width: 32px; height: 32px;' : '' // Увеличиваем плюс
  });
  nextImg.onerror = () => nextImg.replaceWith(document.createTextNode(isLast ? '➕' : '➡️'));
  nextBtn.appendChild(nextImg);
  on(nextBtn, 'click', onNext);

  centerRow.appendChild(prevBtn);
  centerRow.appendChild(slidePicker);
  centerRow.appendChild(nextBtn);
  fragment.appendChild(centerRow);

  // Пауза
  const pauseRow = createElement('div', { className: 'story-slide-pause-row' });
  pauseRow.appendChild(createElement('span', { className: 'story-pause-label' }, '⏱ Пауза:'));
  
  if (slide.pauseAfter === undefined) slide.pauseAfter = 1500;
  
  const pauseInput = createElement('input', {
    type: 'range', min: '0', max: '5', step: '0.5',
    value: String(slide.pauseAfter / 1000),
    className: 'story-pause-range'
  });
  
  const pauseValue = createElement('span', { className: 'story-pause-value' }, `${(slide.pauseAfter / 1000).toFixed(1)} с`);

  on(pauseInput, 'input', (e) => {
    const valSec = parseFloat(e.target.value);
    slide.pauseAfter = valSec * 1000;
    pauseValue.textContent = `${valSec.toFixed(1)} с`;
  });

  pauseRow.appendChild(pauseInput);
  pauseRow.appendChild(pauseValue);
  fragment.appendChild(pauseRow);

  return fragment;
}