// src/components/common/EmptyState/EmptyState.js
import { createElement } from '@utils/dom';
import '@styles/common/empty-state.css';

/**
 * Единый компонент для пустых состояний (нет карточек, нет игр, нет историй).
 *
 * @param {string} text - Текст сообщения
 * @param {string} icon - Эмодзи (по умолчанию 📭)
 * @param {string} className - Дополнительные классы (опционально)
 * @returns {HTMLElement}
 */
export function createEmptyState(text, icon = '📭', className = '') {
  const wrapper = createElement('div', { className: `empty-state ${className}`.trim() });

  if (icon) {
    wrapper.appendChild(createElement('div', { className: 'empty-state__icon' }, icon));
  }

  wrapper.appendChild(createElement('div', { className: 'empty-state__text' }, text));

  return wrapper;
}
