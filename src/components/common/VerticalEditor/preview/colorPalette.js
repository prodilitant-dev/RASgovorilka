// src/components/common/VerticalEditor/preview/colorPalette.js
import { createElement } from '@utils/dom';

export function createColorPalette(ent, callbacks) {
  const createColorColumn = (colors) => {
    const col = createElement('div', { className: 've-color-col' });
    colors.forEach((c) => {
      const btn = createElement('button', {
        type: 'button',
        className: `ve-color-btn ${ent.styleColor === c.value ? 'active' : ''}`,
        title: c.name,
      });
      btn.style.backgroundColor = c.bg;
      if (c.border) btn.style.border = c.border;
      
      btn.addEventListener('click', () => {
        callbacks.onFieldChange('styleColor', c.value);
        col.querySelectorAll('.ve-color-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
      col.appendChild(btn);
    });
    return col;
  };

  const leftColors = [
    { value: null, name: 'Без цвета', bg: 'transparent', border: '2px dashed var(--border)' },
    { value: '#f44336', name: 'Красный', bg: '#f44336' },
    { value: '#ff9800', name: 'Оранжевый', bg: '#ff9800' },
    { value: '#ffeb3b', name: 'Жёлтый', bg: '#ffeb3b' },
    { value: '#4caf50', name: 'Зелёный', bg: '#4caf50' },
  ];

  const rightColors = [
    { value: '#2196f3', name: 'Голубой', bg: '#2196f3' },
    { value: '#3f51b5', name: 'Синий', bg: '#3f51b5' },
    { value: '#9c27b0', name: 'Фиолетовый', bg: '#9c27b0' },
    { value: '#8d6e63', name: 'Коричневый', bg: '#8d6e63' },
    { value: '#333333', name: 'Чёрный', bg: '#333333' },
  ];

  return {
    left: createColorColumn(leftColors),
    right: createColorColumn(rightColors),
  };
}