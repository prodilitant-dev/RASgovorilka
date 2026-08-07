// src/utils/toast.js
import { createElement } from './dom';
import { logger } from './logger';

let container = null;

function getContainer() {
  if (!container) {
    container = createElement('div', { className: 'toast-container' });
    document.body.appendChild(container);
  }
  return container;
}

export function toast(message, type = 'info', duration = 2500) {
  logger.info(`Toast: ${message} (${type})`);
  const el = createElement('div', { className: `toast ${type}` }, message);
  const c = getContainer();
  c.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, duration);
}