// src/modes/common/activities/ResultsModal.js
import { Modal } from '@components/common/Modal/Modal';
import { createElement } from '@utils/dom';
import { logger } from '@utils/logger';

/**
 * Показывает модалку с результатами активности
 * @param {Object} params
 * @param {number} params.correct - количество правильных ответов
 * @param {number} params.wrong - количество неправильных ответов
 * @param {number} params.total - всего вопросов/ходов
 * @param {Array} params.details - массив деталей (объекты с question, userAnswer, correctAnswer, correct)
 * @param {Function} params.onRetry - колбэк для повторного прохождения
 * @param {Function} params.onBack - колбэк для возврата в меню
 * @param {string} params.resultMessage - (опционально) специальное сообщение (для игр, например "Умничка, пройдено за X ходов")
 * @param {boolean} params.showDetails - показывать ли детали (по умолчанию true, для игр можно false)
 */
export function showResultsModal({
  correct,
  wrong,
  total,
  details = [],
  onRetry,
  onBack,
  resultMessage = null,
  showDetails = true,
}) {
  logger.debug('📊 Showing Results Modal', { correct, wrong, total });

  const modal = new Modal({
    title: resultMessage ? '' : 'Результаты',
    body: () => {
      const wrap = createElement('div', { className: 'results-container' });

      if (resultMessage) {
        const title = createElement('div', { className: 'results-title' }, resultMessage);
        wrap.appendChild(title);
      } else {
        const title = createElement('div', { className: 'results-title' }, 'Результаты');
        wrap.appendChild(title);

        // Статистика
        const stats = createElement('div', { className: 'results-stats-grid' });
        const correctStat = createElement('div', { className: 'results-stat-item correct' });
        correctStat.innerHTML = `<div class="stat-number">${correct}</div><div class="stat-label">Правильно</div>`;
        const wrongStat = createElement('div', { className: 'results-stat-item wrong' });
        wrongStat.innerHTML = `<div class="stat-number">${wrong}</div><div class="stat-label">Неправильно</div>`;
        stats.appendChild(correctStat);
        stats.appendChild(wrongStat);
        wrap.appendChild(stats);

        const summary = createElement('div', { className: 'results-summary' }, `Всего: ${total}`);
        wrap.appendChild(summary);
      }

      // Детали (только если есть details и showDetails)
      if (showDetails && details.length > 0) {
        const detailsList = createElement('div', { className: 'results-details' });
        details.forEach((detail, idx) => {
          const item = createElement('div', { className: 'results-detail-item' });
          const index = createElement('span', { className: 'detail-index' }, `${idx + 1}.`);
          const question = createElement('span', { className: 'detail-question' }, detail.question);
          const answer = createElement('span', {
            className: `detail-answer ${detail.correct ? 'correct' : 'wrong'}`,
          }, detail.userAnswer || '—');
          item.appendChild(index);
          item.appendChild(question);
          item.appendChild(answer);
          if (!detail.correct && detail.correctAnswer) {
            const correctAns = createElement('span', { className: 'detail-correct-answer' }, ` (${detail.correctAnswer})`);
            item.appendChild(correctAns);
          }
          detailsList.appendChild(item);
        });
        wrap.appendChild(detailsList);
      }

      // Кнопки управления
      const controls = createElement('div', { className: 'results-controls' });
      const retryBtn = createElement('div', { className: 'category active' }, 'Сыграть ещё');
      retryBtn.addEventListener('click', () => {
        modal.close();
        if (onRetry) onRetry();
      });
      const backBtn = createElement('div', { className: 'category' }, 'Назад');
      backBtn.addEventListener('click', () => {
        modal.close();
        if (onBack) onBack();
      });
      controls.appendChild(retryBtn);
      controls.appendChild(backBtn);
      wrap.appendChild(controls);

      return wrap;
    },
    buttons: [], // кнопки уже в теле модалки, чтобы было гибче
    onClose: () => {
      logger.debug('Results modal closed');
    },
  });

  modal.open();

  // Возвращаем экземпляр модалки для возможности программного закрытия
  return modal;
}