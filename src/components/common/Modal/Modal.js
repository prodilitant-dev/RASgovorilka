// src/components/common/Modal/Modal.js
import { createElement } from '@utils/dom';
import { logger } from '@utils/logger';

export class Modal {
  constructor({ title, body, buttons = [], onClose = null }) {
    this.title = title;
    this.body = body;
    this.buttons = buttons;
    this.onClose = onClose;
    this.element = null;
    this.isOpen = false;
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
        const b = createElement('button', {
          className: `btn ${btn.primary ? 'btn-primary' : 'btn-secondary'}`,
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

    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) this.close();
    });

    document.body.appendChild(this.element);
    requestAnimationFrame(() => {
      this.element.classList.add('visible');
    });
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    logger.debug(`Modal closed: "${this.title}"`);
    if (this.element) {
      this.element.classList.remove('visible');
      setTimeout(() => {
        if (this.element && this.element.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        if (this.onClose) this.onClose();
      }, 300);
    }
  }
}