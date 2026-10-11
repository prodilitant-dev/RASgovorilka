// src/components/common/Modal/Modal.js
import { createElement } from '@utils/dom';
import { iconUrl } from '@utils/icon';
import { logger } from '@utils/logger';

const openModals = new Set();

export function closeAllModals() {
  const snapshot = [...openModals];
  for (const modal of snapshot) {
    try { modal.close(); } catch (err) { logger.error('closeAllModals error:', err); }
  }
  openModals.clear();
}

export class Modal {
  constructor({ title, body, buttons = [], onClose = null, showCloseButton = true }) {
    this.title = title;
    this.body = body;
    this.buttons = buttons;
    this.onClose = onClose;
    this.showCloseButton = showCloseButton;
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

        // === Шапка ===
    const showHeader = !!this.title || this.showCloseButton;
    if (showHeader) {
      const header = createElement('div', { className: 'modal-header' });
      if (this.title) {
        header.appendChild(createElement('h3', {}, this.title));
      } else {
        header.appendChild(createElement('span', {}));
      }

      if (this.showCloseButton) {
        const closeBtn = createElement('button', {
          type: 'button',
          className: 'modal-close-btn',
          'aria-label': 'Закрыть',
          'data-log': 'modal-close',
        });
        const closeImg = createElement('img', {
          src: iconUrl('close'),
          alt: '',
          className: 'modal-close-btn__icon',
          draggable: 'false',
        });
        closeImg.addEventListener('error', () => {
          closeImg.replaceWith(document.createTextNode('✕'));
        });
        closeBtn.appendChild(closeImg);
        closeBtn.addEventListener('click', () => this.close());
        header.appendChild(closeBtn);
      }

      content.appendChild(header);
    }

    // === Тело ===
    const bodyEl = createElement('div', { className: 'modal-body' });
    if (typeof this.body === 'function') {
      bodyEl.appendChild(this.body());
    } else if (typeof this.body === 'string') {
      bodyEl.innerHTML = this.body;
    } else if (this.body instanceof Node) {
      bodyEl.appendChild(this.body);
    }
    content.appendChild(bodyEl);

    // === Футер ===
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