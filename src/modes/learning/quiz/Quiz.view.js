// src/modes/learning/quiz/Quiz.view.js
import { createElement, clear } from '@utils/dom';
import { renderProgressBar } from '@components/common/ProgressBar';
import { getImageUrl } from '@services/imageService';
import { logger } from '@utils/logger';

export function renderQuizQuestion(container, {
  question,
  current,
  total,
  onAnswer,
  feedback = null,
  isCorrect = false,
  userAnswer = null,
}) {
  logger.debug(`🔄 Rendering Quiz Question ${current}/${total}`);
  clear(container);

  const wrap = createElement('div', { className: 'grid-container flex-mode' });
  const card = createElement('div', { className: 'learning-card' });

  // Прогресс
  const progressWrap = createElement('div', { className: 'w-full' });
  renderProgressBar(progressWrap, current, total);
  card.appendChild(progressWrap);

  // Изображение (эмодзи или фото)
  const cardData = question.card || question;
  const image = createElement('div', { className: 'card-image' });
  if (cardData.imageId) {
    image.textContent = '🔄';
    getImageUrl(cardData.imageId).then(url => {
      if (url) {
        image.style.backgroundImage = `url(${url})`;
        image.textContent = '';
      } else {
        image.textContent = cardData.emoji || '❓';
      }
    });
  } else {
    image.textContent = cardData.emoji || '❓';
  }
  card.appendChild(image);

  // Варианты ответов (только текст, без эмодзи)
  const optionsGrid = createElement('div', { className: 'options-grid' });
  if (question.options && question.options.length > 0) {
    question.options.forEach(opt => {
      const btn = createElement('div', {
        className: `category ${feedback && opt.id === userAnswer ? (isCorrect ? 'active' : 'category-danger') : ''}`,
      }, opt.text);
      if (onAnswer) {
        btn.addEventListener('click', () => onAnswer(opt.id));
      } else {
        btn.disabled = true;
        btn.style.opacity = '0.6';
      }
      optionsGrid.appendChild(btn);
    });
  } else {
    const emptyMsg = createElement('div', { className: 'text-muted' }, 'Нет вариантов ответа');
    optionsGrid.appendChild(emptyMsg);
  }
  card.appendChild(optionsGrid);

  // Обратная связь (если есть)
  if (feedback) {
    const fb = createElement('div', {
      className: `feedback ${isCorrect ? 'correct' : 'wrong'}`,
    }, feedback);
    card.appendChild(fb);
  }

  wrap.appendChild(card);
  container.appendChild(wrap);
}