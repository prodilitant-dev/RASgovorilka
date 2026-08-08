/**
 * Обработчик долгого нажатия (long press) с использованием Pointer Events
 * @param {HTMLElement} element - элемент, на который вешаем
 * @param {Function} handler - колбэк при долгом тапе
 * @param {number} delay - задержка в мс (по умолчанию 800)
 * @param {number} threshold - максимальное смещение пальца/курсора в px (по умолчанию 10)
 * @returns {Function} функция очистки
 */
export function onLongPress(element, handler, delay = 800, threshold = 10) {
  let timer = null;
  let isLongPressTriggered = false;
  let startX = 0, startY = 0;

  const start = (e) => {
    // Сохраняем начальные координаты
    startX = e.clientX;
    startY = e.clientY;
    isLongPressTriggered = false;

    timer = setTimeout(() => {
      isLongPressTriggered = true;
      handler(e);
      timer = null;
    }, delay);
  };

  const move = (e) => {
    if (!timer) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.sqrt(dx * dx + dy * dy) > threshold) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const end = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  element.addEventListener('pointerdown', start);
  element.addEventListener('pointermove', move);
  element.addEventListener('pointerup', end);
  element.addEventListener('pointercancel', end);

  return () => {
    element.removeEventListener('pointerdown', start);
    element.removeEventListener('pointermove', move);
    element.removeEventListener('pointerup', end);
    element.removeEventListener('pointercancel', end);
  };
}