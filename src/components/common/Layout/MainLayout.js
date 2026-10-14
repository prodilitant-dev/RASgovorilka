// src/components/common/Layout/MainLayout.js
import { createElement, clear } from '@utils/dom';

/**
 * Основной каркас экрана: опциональная верхняя панель, контент, опциональная нижняя панель.
 * Порядок в DOM: [topPanel] → content → [bottomPanel].
 *
 * @param {HTMLElement} container
 * @param {Object} opts
 * @param {HTMLElement} opts.content - основной контент (обязателен)
 * @param {HTMLElement|null} opts.topPanel - верхняя панель
 * @param {HTMLElement|null} opts.bottomPanel - нижняя панель
 */
export function renderMainLayout(container, { content, topPanel = null, bottomPanel = null }) {
  clear(container);
  container.classList.add('main-area');

  // === Верхняя панель ===
  if (topPanel) {
    const topWrap = createElement('div', { className: 'top-panel' });
    topWrap.appendChild(topPanel);
    container.appendChild(topWrap);
    container.classList.add('has-top-panel');
  } else {
    container.classList.remove('has-top-panel');
  }

  // === Контент ===
  const contentWrap = createElement('div', { className: 'main-content' });
  contentWrap.appendChild(content);
  container.appendChild(contentWrap);

  // === Нижняя панель ===
  if (bottomPanel) {
    const panelWrap = createElement('div', { className: 'bottom-panel' });
    panelWrap.appendChild(bottomPanel);
    container.appendChild(panelWrap);
    container.classList.add('has-panel');
  } else {
    container.classList.remove('has-panel');
  }

  return container;
}
