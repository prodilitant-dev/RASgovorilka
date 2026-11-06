// src/modes/common/quickButtons.js
import { createElement, clear } from '@utils/dom';
import { makeSortable } from '@utils/dragdrop';
import { getState } from '@state/store';
import { uid, toast } from '@utils';
import { saveProfile } from '@storage/appStorage';
import { openCardEditor } from '@modes/say/Say.editor';
import { getImageUrl } from '@services/imageService';
import { iconUrl } from '@utils/icon';

export function renderQuickButtons(container, profile, { onQuickClick, onReorder }) {
  if (typeof container._quickCleanup === 'function') {
    container._quickCleanup();
    container._quickCleanup = null;
  }

  const state = getState();
  const editing = state.editingMode || false;
  const buttons = profile.quickButtons || [];
  const base = import.meta.env.BASE_URL || '/';

  clear(container);
  const wrap = createElement('div', { className: 'quick-buttons' });

  buttons.forEach((btn) => {
    const el = createElement('div', {
      className: 'quick-btn',
      'data-id': btn.id,
      draggable: editing ? 'true' : undefined,
    });

    // Применяем акцентный цвет к самой кнопке (фон и внешняя рамка)
    if (btn.styleColor) {
      el.style.borderColor = btn.styleColor;
      el.style.backgroundColor = `${btn.styleColor}33`; 
    }

    // === АВАТАРКА (с акцентной обводкой) ===
    const avatarWrap = createElement('div', { className: 'quick-btn__avatar' });
    
    if (btn.styleColor) {
      avatarWrap.style.borderColor = btn.styleColor;
      avatarWrap.style.borderWidth = '2px';
      avatarWrap.style.borderStyle = 'solid';
    }

    if (btn.imageId) {
      getImageUrl(btn.imageId).then((url) => {
        if (url) {
          const img = createElement('img', { src: url, alt: '' });
          avatarWrap.appendChild(img);
        } else {
          prependEmoji(avatarWrap, btn);
        }
      });
    } else if (btn.imagePath) {
      const url = base.endsWith('/') ? `${base}${btn.imagePath}` : `${base}/${btn.imagePath}`;
      const img = createElement('img', { src: url, alt: '' });
      img.onerror = () => {
        img.remove();
        prependEmoji(avatarWrap, btn);
      };
      avatarWrap.appendChild(img);
    } else {
      prependEmoji(avatarWrap, btn);
    }

    el.appendChild(avatarWrap);
    el.appendChild(document.createTextNode(btn.text || ''));

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (editing) {
        openCardEditor(
          btn,
          (updated, done) => {
            Object.assign(btn, updated);
            saveProfile(profile);
            renderQuickButtons(container, profile, { onQuickClick, onReorder });
            toast('Кнопка обновлена');
            done();
          },
          (id, close) => {
            profile.quickButtons = profile.quickButtons.filter((b) => b.id !== id);
            saveProfile(profile);
            renderQuickButtons(container, profile, { onQuickClick, onReorder });
            toast('Кнопка удалена');
            close();
          },
          { skipDuplicateCheck: true }
        );
        return;
      }
      if (onQuickClick) onQuickClick(btn);
    });

    wrap.appendChild(el);
  });

  let sortableCleanup = null;

  if (editing) {
    const addBtn = createElement('div', { className: 'quick-btn quick-btn--add' });
    const addImg = createElement('img', {
      src: iconUrl('add'),
      alt: '',
      className: 'quick-btn__icon',
      draggable: 'false',
    });
    addImg.addEventListener('error', () => {
      addImg.replaceWith(document.createTextNode('➕'));
    });
    addBtn.appendChild(addImg);
    
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newBtn = { id: uid(), text: '', emoji: '', imagePath: null, imageId: null };
      
      openCardEditor(
        newBtn,
        (updated, done) => {
          if (!updated.text.trim()) {
            toast('Введите текст', 'error');
            done();
            return;
          }
          profile.quickButtons.push(updated);
          saveProfile(profile);
          renderQuickButtons(container, profile, { onQuickClick, onReorder });
          toast('Кнопка добавлена');
          done();
        },
        null,
        { skipDuplicateCheck: true }
      );
    });
    wrap.appendChild(addBtn);

    sortableCleanup = makeSortable(wrap, {
      itemSelector: '.quick-btn:not(.quick-btn--add)',
      onReorder: (ids) => {
        const newOrder = ids.map((id) => buttons.find((b) => b.id === id)).filter(Boolean);
        profile.quickButtons = newOrder;
        saveProfile(profile);
        if (onReorder) onReorder(newOrder.map((b) => b.id));
        renderQuickButtons(container, profile, { onQuickClick, onReorder });
      },
    });
  }

  container.appendChild(wrap);

  container._quickCleanup = () => {
    if (sortableCleanup) sortableCleanup();
  };
}

function prependEmoji(containerEl, btn) {
  if (btn.emoji) {
    containerEl.textContent = btn.emoji;
  }
}