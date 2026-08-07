import { createElement, clear } from '@utils/dom';

/**
 * Рендерит сетку из переданных DOM-элементов
 * @param {HTMLElement} container - контейнер
 * @param {HTMLElement[]} elements - массив готовых элементов
 */
export function renderElementGrid(container, elements) {
  clear(container);
  const grid = createElement('div', { className: 'tiles-grid' });
  elements.forEach(el => grid.appendChild(el));
  container.appendChild(grid);
}