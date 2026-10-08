import { createElement, clear, on } from '@utils/dom';
import { makeSortable } from '@utils/dragdrop';
import { getState } from '@state/store';
import { uid, toast } from '@utils';
import { saveProfile } from '@storage/appStorage';
import { openSimpleEditor } from '@modes/common/editorHelpers';
import { getImageUrl } from '@services/imageService';

export function renderQuickButtons(container, profile, {
  onQuickClick,
  onReorder,
}) {
  const state = getState();
  const editing = state.editingMode || false;
  const buttons = profile.quickButtons || [];
  const base = import.meta.env.BASE_URL || '/';

  clear(container);
  const wrap = createElement('div', { className: 'quick-buttons' });

  buttons.forEach(btn => {
    const el = createElement('div', {
      className: 'quick-btn',
      'data-id': btn.id,
      draggable: editing ? 'true' : undefined,
    });

    // Иконка: пользовательская (IndexedDB) → стоковая (WebP) → эмодзи
    if (btn.imageId) {
      getImageUrl(btn.imageId).then(url => {
        if (url) {
          const img = createElement('img', { src: url, alt: '' });
          el.insertBefore(img, el.firstChild);
        } else {
          prependEmoji(el, btn);
        }
      });
    } else if (btn.imagePath) {
      const url = base.endsWith('/') ? `${base}${btn.imagePath}` : `${base}/${btn.imagePath}`;
      const img = createElement('img', { src: url, alt: '' });
      img.onerror = () => {
        img.remove();
        prependEmoji(el, btn);
      };
      el.appendChild(img);
    } else {
      prependEmoji(el, btn);
    }

    el.appendChild(document.createTextNode(btn.text || ''));

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (editing) {
        openSimpleEditor({
          entity: btn,
          title: 'Редактировать кнопку',
          onSave: (updated, done) => {
            Object.assign(btn, updated);
            saveProfile(profile);
            renderQuickButtons(container, profile, { onQuickClick, onReorder });
            toast('Кнопка обновлена');
            done();
          },
          onDelete: (id, close) => {
            profile.quickButtons = profile.quickButtons.filter(b => b.id !== id);
            saveProfile(profile);
            renderQuickButtons(container, profile, { onQuickClick, onReorder });
            toast('Кнопка удалена');
            close();
          },
        });
        return;
      }
      if (onQuickClick) onQuickClick(btn);
    });

    wrap.appendChild(el);
  });

  if (editing) {
    const addBtn = createElement('div', { className: 'quick-btn' }, '➕');
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newBtn = { id: uid(), text: '', emoji: '', imagePath: null };
      openSimpleEditor({
        entity: newBtn,
        title: 'Новая быстрая кнопка',
        onSave: (updated, done) => {
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
        onDelete: null,
      });
    });
    wrap.appendChild(addBtn);

    const sortableCleanup = makeSortable(wrap, {
      itemSelector: '.quick-btn:not(:last-child)',
      onReorder: (ids) => {
        const newOrder = ids.map(id => buttons.find(b => b.id === id)).filter(Boolean);
        profile.quickButtons = newOrder;
        saveProfile(profile);
        if (onReorder) onReorder(newOrder.map(b => b.id));
        renderQuickButtons(container, profile, { onQuickClick, onReorder });
      }
    });

    container._quickSortableCleanup = sortableCleanup;
  } else {
    if (container._quickSortableCleanup) {
      container._quickSortableCleanup();
      container._quickSortableCleanup = null;
    }
  }

  container.appendChild(wrap);
}

function prependEmoji(el, btn) {
  if (btn.emoji) {
    el.insertBefore(document.createTextNode(`${btn.emoji} `), el.firstChild);
  }
}