// src/components/common/Layout/MainLayout.js
import { createElement, clear } from '@utils/dom';

export function renderMainLayout(container, {
  content,              // DOM-элемент с основным содержимым
  bottomPanel = null,   // DOM-элемент нижней панели (или null)
}) {
  clear(container);
  container.classList.add('main-area');

  const contentWrap = createElement('div', { className: 'main-content' });
  contentWrap.appendChild(content);
  container.appendChild(contentWrap);

  if (bottomPanel) {
    const panelWrap = createElement('div', { className: 'bottom-panel' });
    panelWrap.appendChild(bottomPanel);
    container.appendChild(panelWrap);
    container.classList.add('has-bottom-panel');
  } else {
    container.classList.remove('has-bottom-panel');
  }

  return container;
}