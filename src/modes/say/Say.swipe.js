// src/modes/say/Say.swipe.js
/**
 * Свайп влево/вправо по контейнеру → переключение категорий.
 *
 * Возвращает cleanup-функцию.
 *
 * @param {HTMLElement} container - элемент, на котором слушаем свайп
 * @param {Object} options
 * @param {Function} options.onNext - свайп влево (dx < 0)
 * @param {Function} options.onPrev - свайп вправо (dx > 0)
 * @param {number} [options.threshold=60] - минимальная длина горизонтального жеста в px
 */
export function setupSwipeNavigation(container, { onNext, onPrev, threshold = 60 }) {
  let startX = 0;
  let startY = 0;
  let tracking = false;
  let suppressClickUntil = 0;

  const onStart = (e) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    tracking = true;
  };

  const onEnd = (e) => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    // Игнорируем вертикальные скроллы и слишком короткие жесты
    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dx) < threshold) return;

    // Подавляем click, который браузер сгенерирует после touchend
    suppressClickUntil = Date.now() + 300;

    if (dx < 0) {
      if (onNext) onNext();
    } else {
      if (onPrev) onPrev();
    }
  };

  const onCancel = () => {
    tracking = false;
  };

  // Ловим click в capture-фазе, чтобы остановить его до обработчиков карточек
  const onClickCapture = (e) => {
    if (Date.now() < suppressClickUntil) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  container.addEventListener('touchstart', onStart, { passive: true });
  container.addEventListener('touchend', onEnd, { passive: true });
  container.addEventListener('touchcancel', onCancel, { passive: true });
  container.addEventListener('click', onClickCapture, true); // capture

  return () => {
    container.removeEventListener('touchstart', onStart);
    container.removeEventListener('touchend', onEnd);
    container.removeEventListener('touchcancel', onCancel);
    container.removeEventListener('click', onClickCapture, true);
  };
}