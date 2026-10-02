// src/modes/learning/math/Math.view.js
import { createElement, clear, on } from '@utils/dom';
import { renderProgressBar } from '@components/common/ProgressBar';
import { logger } from '@utils/logger';

/**
 * Рендерит математический пример
 */
export function renderMathGame(container, {
  question,
  current,
  total,
  onAnswer,
  feedback = null,
  isCorrect = false,
  userAnswer = null,
  inputMethod = 'drag',
}) {
  logger.debug(`🔄 Rendering Math Question ${current}/${total}`);
  clear(container);

  const wrap = createElement('div', { className: 'grid-container flex-mode' });
  const card = createElement('div', { className: 'learning-card' });

  // Прогресс
  const progressWrap = createElement('div', { className: 'w-full' });
  renderProgressBar(progressWrap, current, total);
  card.appendChild(progressWrap);

  // Уравнение
  const equation = createElement('div', { className: 'math-equation' });
  const a = createElement('span', { className: 'math-part' }, question.a);
  const op = createElement('span', { className: 'math-part' }, question.operator);
  const b = createElement('span', { className: 'math-part' }, question.b);
  const eq = createElement('span', { className: 'math-part' }, '=');
  const resultZone = createElement('span', {
    className: `math-part math-drop-zone ${feedback ? 'filled' : ''} ${feedback && isCorrect ? 'correct' : feedback && !isCorrect ? 'wrong' : ''}`,
  });

  resultZone.textContent = (feedback && userAnswer !== undefined) ? userAnswer : '?';

  equation.appendChild(a);
  equation.appendChild(op);
  equation.appendChild(b);
  equation.appendChild(eq);
  equation.appendChild(resultZone);
  card.appendChild(equation);

  // Варианты ответов или поле ввода
  if (feedback) {
    const fb = createElement('div', {
      className: `feedback ${isCorrect ? 'correct' : 'wrong'}`,
    }, feedback);
    card.appendChild(fb);
  } else if (inputMethod === 'drag') {
    // Drag-варианты
    const optionsWrap = createElement('div', { className: 'math-options' });
    question.options.forEach(opt => {
      const optEl = createElement('div', {
        className: 'math-option',
        draggable: true,
        'data-value': opt,
      }, opt);
      optEl.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', String(opt));
        e.dataTransfer.effectAllowed = 'move';
      });
      optEl.addEventListener('touchstart', handleTouchStart, { passive: true });
      optEl.addEventListener('touchmove', handleTouchMove, { passive: false });
      optEl.addEventListener('touchend', handleTouchEnd, { passive: false });
      optionsWrap.appendChild(optEl);
    });
    card.appendChild(optionsWrap);

    // Обработка drop
    resultZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    resultZone.addEventListener('drop', (e) => {
      e.preventDefault();
      const val = e.dataTransfer.getData('text/plain');
      if (val && onAnswer) {
        onAnswer(parseInt(val, 10));
      }
    });

    // Touch drag
    let dragData = null;
    function handleTouchStart(e) {
      const el = e.target.closest('.math-option');
      if (!el) return;
      dragData = { val: el.dataset.value, element: el };
    }
    function handleTouchMove(e) {
      if (!dragData) return;
      e.preventDefault();
      const touch = e.touches[0];
      dragData.element.style.position = 'fixed';
      dragData.element.style.left = (touch.clientX - 30) + 'px';
      dragData.element.style.top = (touch.clientY - 30) + 'px';
      dragData.element.style.zIndex = 1000;
      const rect = resultZone.getBoundingClientRect();
      resultZone.classList.toggle('drag-over',
        touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom
      );
    }
    function handleTouchEnd(e) {
      if (!dragData) return;
      const touch = e.changedTouches[0];
      const rect = resultZone.getBoundingClientRect();
      dragData.element.style.position = '';
      dragData.element.style.left = '';
      dragData.element.style.top = '';
      dragData.element.style.zIndex = '';
      resultZone.classList.remove('drag-over');
      if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
          touch.clientY >= rect.top && touch.clientY <= rect.bottom &&
          onAnswer) {
        onAnswer(parseInt(dragData.val, 10));
      }
      dragData = null;
    }
  } else {
    // Ручной ввод
    const inputGroup = createElement('div', { className: 'input-group' });
    const input = createElement('input', { type: 'number', placeholder: 'Введите ответ', autofocus: true });
    const submitBtn = createElement('div', { className: 'category active' }, 'Проверить');
    on(submitBtn, 'click', () => {
      const val = parseInt(input.value, 10);
      if (!isNaN(val) && onAnswer) onAnswer(val);
    });
    on(input, 'keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = parseInt(input.value, 10);
        if (!isNaN(val) && onAnswer) onAnswer(val);
      }
    });
    inputGroup.appendChild(input);
    inputGroup.appendChild(submitBtn);
    card.appendChild(inputGroup);
    setTimeout(() => input.focus(), 100);
  }

  wrap.appendChild(card);
  container.appendChild(wrap);
}