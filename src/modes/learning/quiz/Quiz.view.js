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
  mode = 'image_to_word',
}) {
  logger.debug(`🔄 Rendering Quiz Question ${current}/${total} (mode: ${mode})`);
  clear(container);

  const wrap = createElement('div', { className: 'grid-container flex-mode' });
  const card = createElement('div', { className: 'learning-card' });

  const progressWrap = createElement('div', { className: 'w-full' });
  renderProgressBar(progressWrap, current, total);
  card.appendChild(progressWrap);

  const cardData = question.card || question;

  // ---- Верхняя часть ----
  if (mode === 'word_to_image') {
    // Сверху — слово
    const wordEl = createElement('div', { className: 'card-text' }, cardData.text);
    card.appendChild(wordEl);
  } else {
    // Сверху — картинка или эмодзи
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
  }

  // ---- Варианты ответа ----
  const optionsGrid = createElement('div', { className: 'options-grid' });
  if (question.options && question.options.length > 0) {
    question.options.forEach(opt => {
      const isAnswerSelected = feedback && opt.id === userAnswer;
      const btnClass = `category ${isAnswerSelected ? (isCorrect ? 'active' : 'category-danger') : ''}`;

      let btn;
      if (mode === 'word_to_image') {
        btn = createElement('div', { className: btnClass });
        btn.style.minHeight = '60px';
        if (opt.imageId) {
          btn.textContent = '🔄';
          getImageUrl(opt.imageId).then(url => {
            if (url) {
              btn.textContent = '';
              btn.style.backgroundImage = `url(${url})`;
              btn.style.backgroundSize = 'contain';
              btn.style.backgroundPosition = 'center';
              btn.style.backgroundRepeat = 'no-repeat';
            } else {
              btn.textContent = opt.emoji || '❓';
              btn.style.fontSize = '32px';
            }
          });
        } else {
          btn.textContent = opt.emoji || '❓';
          btn.style.fontSize = '32px';
        }
      } else {
        btn = createElement('div', { className: btnClass }, opt.text);
      }

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

  if (feedback) {
    const fb = createElement('div', {
      className: `feedback ${isCorrect ? 'correct' : 'wrong'}`,
    }, feedback);
    card.appendChild(fb);
  }

  wrap.appendChild(card);
  container.appendChild(wrap);
}