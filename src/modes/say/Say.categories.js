// src/modes/say/Say.categories.js
import { createElement, clear } from '@utils/dom';
import { makeSortable } from '@utils/dragdrop';
import { openCategoryCreateModal } from './Say.categoryCreate';
import { getState } from '@state/store';
import { getImageUrl } from '@services/image';
import { logger } from '@utils/logger';
import { iconUrl } from '@utils/icon';

export function renderCategories(
  container,
  profile,
  activeId,
  onSelect,
  onEdit,
  onReorder,
  onCreated
) {
  logger.debug('🔄 Rendering Categories');

  if (typeof container._categoriesCleanup === 'function') {
    container._categoriesCleanup();
    container._categoriesCleanup = null;
  }

  clear(container);
  const state = getState();
  const editing = state.editingMode || false;
  const showImages = getState().globalSettings?.categoriesShowImages !== false;

  const categories = editing ? profile.categories : profile.categories.filter((c) => !c.hidden);

  categories.forEach((cat) => {
    const isActive = cat.id === activeId;
    const classes = ['category'];
    if (isActive) classes.push('active');
    if (cat.hidden && editing) classes.push('category-hidden');
    if (editing) classes.push('edit-mode');

    const el = createElement('div', {
      className: classes.join(' '),
      'data-id': cat.id,
      'data-category-id': cat.id,
    });

    // === ПРИМЕНЯЕМ АКЦЕНТНЫЙ ЦВЕТ И ОБВОДКИ ===
    if (cat.styleColor) {
      // Если есть акцент, заливаем фон (50% для активной, 25% для неактивной)
      el.style.backgroundColor = isActive ? `${cat.styleColor}80` : `${cat.styleColor}40`;
    } else if (isActive) {
      // Если акцента нет, убираем стандартную зеленую заливку для активной вкладки
      el.style.backgroundColor = 'var(--surface)'; 
    }

    if (isActive) {
      // Черная обводка для активной вкладки
      el.style.border = '1px solid #000000';
    } else if (cat.styleColor) {
      // Убираем цветную обводку с самой вкладки, если она неактивна
      el.style.borderColor = 'transparent';
    }

    // === Аватарка категории ===
    if (showImages) {
      el.classList.add('category--has-avatar');
      el.appendChild(createCategoryAvatar(cat, isActive)); // <-- Передаем isActive
    }

    const nameEl = createElement('span', { className: 'cat-name' }, cat.name);
    // Текст всегда черный, чтобы читался на цветном фоне и при активном состоянии
    if (cat.styleColor || isActive) {
      nameEl.style.color = '#000000';
    }
    el.appendChild(nameEl);

    if (editing && onEdit) {
      const actionsEl = createElement('span', { className: 'cat-actions' });
      const editBtn = createElement('button', {
        type: 'button',
        className: 'cat-action-btn',
        'aria-label': 'Редактировать категорию',
        title: 'Редактировать',
      });
      const editImg = createElement('img', {
        src: iconUrl('edit'),
        alt: '',
        className: 'cat-action-btn__icon',
        draggable: 'false',
      });
      editImg.addEventListener('error', () => {
        editImg.replaceWith(document.createTextNode('✏️'));
      });
      editBtn.appendChild(editImg);

      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        logger.debug(`Category edit clicked: ${cat.id}`);
        onEdit(cat);
      });
      actionsEl.appendChild(editBtn);
      el.appendChild(actionsEl);
    }

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      logger.debug(`Category clicked: ${cat.id}`);
      onSelect(cat.id);
    });

    container.appendChild(el);
  });

  if (editing) {
    const addBtn = createElement('div', { className: 'category category-add' });
    const addImg = createElement('img', {
      src: iconUrl('add'),
      alt: '',
      className: 'cat-action-btn__icon',
      draggable: 'false',
    });
    addImg.addEventListener('error', () => {
      addImg.replaceWith(document.createTextNode('+'));
    });
    addBtn.appendChild(addImg);
    addBtn.addEventListener('click', () => {
      openCategoryCreateModal(profile, (newCategoryId) => {
        if (onCreated) {
          onCreated(newCategoryId);
        } else {
          renderCategories(
            container,
            profile,
            newCategoryId,
            onSelect,
            onEdit,
            onReorder,
            onCreated
          );
        }
      });
    });
    container.appendChild(addBtn);
  }

  let dragCleanup = null;
  if (editing && onReorder) {
    dragCleanup = makeSortable(container, {
      itemSelector: '.category:not(.category-add)',
      longPressDelay: 200,
      onReorder: (ids) => onReorder(ids),
    });
  }

  container._categoriesCleanup = () => {
    if (dragCleanup) dragCleanup();
  };
}

function createCategoryAvatar(cat, isActive) {
  const avatar = createElement('div', { className: 'cat-avatar' });
  const letter = (cat.name || '?').trim().charAt(0).toUpperCase();

  // Применяем обводку к аватарке
  if (isActive) {
    // Если вкладка активна, обводка черная
    avatar.style.borderColor = '#000000';
    avatar.style.borderWidth = '2px';
    avatar.style.borderStyle = 'solid';
  } else if (cat.styleColor) {
    // Если неактивна, но есть цвет, используем его
    avatar.style.borderColor = cat.styleColor;
    avatar.style.borderWidth = '2px';
    avatar.style.borderStyle = 'solid';
  }

  if (cat.imageId) {
    avatar.classList.add('cat-avatar--fallback');
    avatar.textContent = letter;

    getImageUrl(cat.imageId)
      .then((url) => {
        if (!url) return;
        const img = createElement('img', {
          src: url,
          alt: '',
          className: 'cat-avatar__img',
          draggable: 'false',
        });
        avatar.textContent = '';
        avatar.classList.remove('cat-avatar--fallback');
        avatar.appendChild(img);
      })
      .catch(() => {
        /* остаётся fallback */
      });
  } else if (cat.imagePath) {
    const base = import.meta.env.BASE_URL || '/';
    const url = base.endsWith('/') ? `${base}${cat.imagePath}` : `${base}/${cat.imagePath}`;
    const img = createElement('img', {
      src: url,
      alt: '',
      className: 'cat-avatar__img',
      draggable: 'false',
    });
    avatar.appendChild(img);
  } else {
    avatar.classList.add('cat-avatar--fallback');
    avatar.textContent = letter;
  }

  return avatar;
}