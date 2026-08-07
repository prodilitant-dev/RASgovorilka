import { onLongPress } from '@utils/interaction';

export function attachGridEvents(gridElement, { onClick, onLongPress: longPressHandler }) {
  const cleanups = [];

  // Клик через делегирование
  const clickHandler = (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    const id = card.dataset.id;
    if (id && onClick) onClick(id);
  };
  gridElement.addEventListener('click', clickHandler);
  cleanups.push(() => gridElement.removeEventListener('click', clickHandler));

  // Долгий тап
  if (longPressHandler) {
    const cleanupLongPress = onLongPress(gridElement, (e) => {
      const card = e.target.closest('.card');
      if (!card) return;
      const id = card.dataset.id;
      if (id && id !== 'add') {
        longPressHandler(id);
      }
    });
    cleanups.push(cleanupLongPress);
  }

  return () => cleanups.forEach(fn => fn());
}