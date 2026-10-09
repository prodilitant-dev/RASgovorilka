// src/components/common/Modal/Modal.js
import { createElement } from '@utils/dom';
import { logger } from '@utils/logger';

// Реестр открытых модалок
const openModals = new Set();

/**
 * Принудительно закрывает все открытые модалки.
 * Вызывается при смене режима.
 */
export function closeAllModals() {
  const snapshot = [...openModals];
  for (const modal of snapshot) {
    try {
      modal.close();
    } catch (err) {
      logger.error('closeAllModals error:', err);
    }
  }
  openModals.clear();
}

export class Modal {
  constructor({ title, body, buttons = [], onClose = null }) {
    this.title = title;
    this.body = body;
    this.buttons = buttons;
    this.onClose = onClose;
    this.element = null;
    this.isOpen = false;
    this._outsideClickHandler = null;
    this._closeTimer = null;
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    logger.debug(`Modal opened: "${this.title}"`);

    this.element = createElement('div', { className: 'modal' });

    const content = createElement('div', { className: 'modal-content' });

    if (this.title) {
      const header = createElement('div', { className: 'modal-header' });
      const titleEl = createElement('h3', {}, this.title);
      header.appendChild(titleEl);
      content.appendChild(header);
    }

    const bodyEl = createElement('div', { className: 'modal-body' });
    if (typeof this.body === 'function') {
      bodyEl.appendChild(this.body());
    } else if (typeof this.body === 'string') {
      bodyEl.innerHTML = this.body;
    } else if (this.body instanceof Node) {
      bodyEl.appendChild(this.body);
    }
    content.appendChild(bodyEl);

    if (this.buttons.length) {
      const footer = createElement('div', { className: 'modal-footer' });
      this.buttons.forEach(btn => {
        const b = createElement('div', {
          className: `category ${btn.primary ? 'active' : ''} ${btn.danger ? 'category-danger' : ''}`,
          'data-log': `modal-button:${btn.label}`,
        }, btn.label);
        b.addEventListener('click', () => {
          if (btn.action) btn.action();
        });
        footer.appendChild(b);
      });
      content.appendChild(footer);
    }

    this.element.appendChild(content);

    this._outsideClickHandler = (e) => {
      if (e.target === this.element) this.close();
    };
    this.element.addEventListener('click', this._outsideClickHandler);

    document.body.appendChild(this.element);
    openModals.add(this);

    requestAnimationFrame(() => {
      if (this.element) this.element.classList.add('visible');
    });
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    logger.debug(`Modal closed: "${this.title}"`);
    openModals.delete(this);

    if (this.element) {
      if (this._outsideClickHandler) {
        this.element.removeEventListener('click', this._outsideClickHandler);
        this._outsideClickHandler = null;
      }
      this.element.classList.remove('visible');

      this._closeTimer = setTimeout(() => {
        this._closeTimer = null;
        if (this.element && this.element.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        if (this.onClose) this.onClose();
      }, 300);
    } else if (this.onClose) {
      this.onClose();
    }
  }
}