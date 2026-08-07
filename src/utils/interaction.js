/**
 * Обработчик долгого нажатия (long press)
 * @param {HTMLElement} element - элемент, на который вешаем
 * @param {Function} handler - колбэк при долгом тапе
 * @param {number} delay - задержка в мс (по умолчанию 800)
 * @returns {Function} функция очистки
 */
export function onLongPress(element, handler, delay = 800) {
  let timer = null;
  let isLongPressTriggered = false;

  const start = (e) => {
    isLongPressTriggered = false;
    timer = setTimeout(() => {
      isLongPressTriggered = true;
      handler(e);
      timer = null;
    }, delay);
  };

  const end = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  // touch
  element.addEventListener('touchstart', start, { passive: true });
  element.addEventListener('touchend', end);
  element.addEventListener('touchmove', cancel);

  // mouse
  element.addEventListener('mousedown', start);
  element.addEventListener('mouseup', end);
  element.addEventListener('mouseleave', cancel);

  return () => {
    element.removeEventListener('touchstart', start);
    element.removeEventListener('touchend', end);
    element.removeEventListener('touchmove', cancel);
    element.removeEventListener('mousedown', start);
    element.removeEventListener('mouseup', end);
    element.removeEventListener('mouseleave', cancel);
  };
}