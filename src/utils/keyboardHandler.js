import { setState } from '@state/store';

let previousOffset = 0;

export function initKeyboardHandler() {
  // Обработка изменения размеров окна (включая скрытие адресной строки)
  const handleResize = () => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    
    const heightDiff = window.innerHeight - viewport.height;
    const offset = Math.max(0, heightDiff);
    
    if (offset !== previousOffset) {
      previousOffset = offset;
      document.documentElement.style.setProperty('--keyboard-offset', offset + 'px');
      document.body.classList.toggle('keyboard-open', offset > 50);
      setState({ keyboardHeight: offset });
    }
  };

  // Добавляем обработчик на visualViewport (для клавиатуры)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize);
  }

  // Также добавляем обработчик на обычный resize для случаев, когда меняется размер окна (поворот, скрытие панелей)
  window.addEventListener('resize', handleResize);

  // Первоначальная настройка
  handleResize();

  return () => {
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', handleResize);
    }
    window.removeEventListener('resize', handleResize);
  };
}