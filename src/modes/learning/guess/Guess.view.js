// src/modes/learning/guess/Guess.view.js
import { createElement, clear, on } from '@utils/dom';
import { renderProgressBar } from '@components/common/ProgressBar';
import { getImageUrl } from '@services/imageService';
import { logger } from '@utils/logger';

export function renderGuessQuestion(container, {
  question,
  current,
  total,
  onAnswer,
  feedback = null,
  isCorrect = false,
  userAnswer = null,
}) {
  logger.debug(`🔄 Rendering Guess Question ${current}/${total}`);
  clear(container);

  const wrap = createElement('div', { className: 'grid-container flex-mode' });
  const card = createElement('div', { className: 'learning-card' });

  // Прогресс
  const progressWrap = createElement('div', { className: 'w-full' });
  renderProgressBar(progressWrap, current, total);
  card.appendChild(progressWrap);

  // Изображение (эмодзи или фото) — берём из question.card
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

  // Подпись (вопрос) — оставляем "Что это?"
  const promptText = createElement('div', { className: 'card-text' }, 'Что это?');
  card.appendChild(promptText);

  // Поле ввода
  const inputGroup = createElement('div', { className: 'input-group' });
  const input = createElement('input', {
    type: 'text',
    placeholder: 'Введите ответ...',
    autofocus: true,
  });
  const submitBtn = createElement('div', { className: 'category active' }, 'Проверить');

  if (feedback) {
    input.disabled = true;
    submitBtn.disabled = true;
    if (userAnswer) input.value = userAnswer;
    const fb = createElement('div', {
      className: `feedback ${isCorrect ? 'correct' : 'wrong'}`,
    }, feedback);
    card.appendChild(fb);
  } else {
    on(submitBtn, 'click', () => {
      const answer = input.value.trim();
      if (answer && onAnswer) onAnswer(answer);
    });
    on(input, 'keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const answer = input.value.trim();
        if (answer && onAnswer) onAnswer(answer);
      }
    });
  }

  inputGroup.appendChild(input);
  inputGroup.appendChild(submitBtn);
  card.appendChild(inputGroup);

  wrap.appendChild(card);
  container.appendChild(wrap);

  if (!feedback) setTimeout(() => input.focus(), 100);
}