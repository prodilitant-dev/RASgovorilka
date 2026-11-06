// src/modes/stories/index.js
import { createElement, clear } from '@utils/dom';
import { getState } from '@state/store';
import { getImageUrl } from '@services/imageService';
import { logger } from '@utils/logger';
import { saveProfile } from '@storage/appStorage';
import { openStoriesReader } from './Stories.reader';
import { openStoriesEditor } from './Stories.editor';

export function renderStories(container, profile) {
  clear(container);

  const state = getState();
  const editing = state.editingMode || false;
  
  if (!profile.stories) {
    profile.stories = [];
  }
  const stories = profile.stories;

  // Используем стандартные классы обертки, как в других режимах
  const wrapper = createElement('div', { className: 'grid-container full-height' });

  // Если историй нет и мы не в режиме редактирования — показываем заглушку
  if (stories.length === 0 && !editing) {
    wrapper.appendChild(
      createElement(
        'div',
        {
          style:
            'text-align:center; padding: 40px; color: var(--text-muted); font-size: 1.1rem; width: 100%;',
        },
        'Историй пока нет. Включите режим редактирования, чтобы создать первую.'
      )
    );
    container.appendChild(wrapper);
    return;
  }

  const grid = createElement('div', { className: 'tiles-grid' });

  // --- Рендерим существующие истории ---
  stories.forEach((story) => {
    const card = createElement('div', { className: 'card', style: 'cursor: pointer;' });
    const bg = createElement('div', { className: 'card__bg' });

    let coverId = story.coverImageId;
    let coverPath = story.coverImagePath;
    
    if (!coverId && !coverPath && story.slides && story.slides.length > 0) {
      coverId = story.slides[0].imageId;
      coverPath = story.slides[0].imagePath;
    }

    if (coverId) {
      getImageUrl(coverId).then((url) => {
        if (url) {
          bg.style.backgroundImage = `url(${url})`;
          bg.style.backgroundSize = 'cover';
          bg.style.backgroundPosition = 'center';
        }
      });
    } else if (coverPath) {
      const base = import.meta.env.BASE_URL || '/';
      const url = base.endsWith('/') ? `${base}${coverPath}` : `${base}/${coverPath}`;
      bg.style.backgroundImage = `url(${url})`;
      bg.style.backgroundSize = 'cover';
      bg.style.backgroundPosition = 'center';
    } else {
      bg.textContent = '📖';
      bg.style.fontSize = '3rem';
    }

    const label = createElement(
      'div',
      { className: 'card__label' },
      story.title || 'Без названия'
    );

    card.appendChild(bg);
    card.appendChild(label);

    card.addEventListener('click', () => {
      if (editing) {
        // Открываем редактор, передавая container
        openStoriesEditor(
          container,
          story,
          (updatedStory) => {
            const idx = profile.stories.findIndex((s) => s.id === updatedStory.id);
            if (idx !== -1) profile.stories[idx] = updatedStory;
            saveProfile(profile);
            renderStories(container, profile);
          },
          () => {
            // Отмена — просто возвращаем сетку
            renderStories(container, profile);
          }
        );
      } else {
        openStoriesReader(story);
      }
    });

    grid.appendChild(card);
  });

  // --- Кнопка добавления (только в режиме редактирования) ---
  if (editing) {
    const addCard = createElement('div', {
      className: 'card card--add',
      style: 'cursor: pointer;',
    });
    const bg = createElement('div', { className: 'card__bg' }, '➕');
    bg.style.fontSize = '2rem';
    const label = createElement('div', { className: 'card__label' }, 'Создать');

    addCard.appendChild(bg);
    addCard.appendChild(label);

    addCard.addEventListener('click', () => {
      openStoriesEditor(
        container,
        null,
        (newStory) => {
          if (!profile.stories) profile.stories = [];
          profile.stories.push(newStory);
          saveProfile(profile);
          renderStories(container, profile);
        },
        () => {
          renderStories(container, profile);
        }
      );
    });

    grid.appendChild(addCard);
  }

  wrapper.appendChild(grid);
  container.appendChild(wrapper);
}