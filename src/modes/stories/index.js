// src/modes/stories/index.js
import { createElement, clear } from '@utils/dom';
import { getState } from '@state/store';
import { saveProfile } from '@storage/appStorage';
import { createCard } from '@components/common/Card/Card';
import { openStoriesReader } from './reader/Stories.reader';
import { openStoriesEditor } from './Stories.editor';
import { createEmptyState } from '@components/common/EmptyState/EmptyState';
import { openStoryManageModal } from './components/StoryManageModal';

export function renderStories(container, profile) {
  clear(container);

  const state = getState();
  const editing = state.editingMode || false;

  if (!profile.stories) {
    profile.stories = [];
  }
  const stories = profile.stories;

  const wrapper = createElement('div', { className: 'grid-container full-height' });

  if (stories.length === 0 && !editing) {
    wrapper.appendChild(
      createEmptyState(
        'Историй пока нет. Включите режим редактирования, чтобы создать первую.',
        '📖'
      )
    );
    container.appendChild(wrapper);
    return;
  }

  const grid = createElement('div', { className: 'tiles-grid' });

  stories.forEach((story) => {
    let coverId = story.coverImageId;
    let coverPath = story.coverImagePath;
    if (!coverId && !coverPath && story.slides && story.slides.length > 0) {
      coverId = story.slides[0].imageId;
      coverPath = story.slides[0].imagePath;
    }

    const cardEl = createCard({
      id: story.id,
      text: story.title || 'Без названия',
      imageId: coverId,
      imagePath: coverPath,
      emoji: '📖',
      className: 'story-main-card',
      styleColor: story.styleColor || null,
    });

    cardEl.addEventListener('click', () => {
      if (editing) {
        openStoryManageModal(
          story,
          // 1. On Edit (открыть редактор)
          () => {
            openStoriesEditor(
              container,
              story,
              (updatedStory) => {
                const idx = profile.stories.findIndex((s) => s.id === updatedStory.id);
                if (idx !== -1) profile.stories[idx] = updatedStory;
                saveProfile(profile);
                renderStories(container, profile);
              },
              () => renderStories(container, profile)
            );
          },
          // 2. On Delete (удалить)
          () => {
            profile.stories = profile.stories.filter((s) => s.id !== story.id);
            saveProfile(profile);
            renderStories(container, profile);
          },
          // 3. On Save Color/Title (мгновенное сохранение при выборе цвета/картинки)
          (updatedStory) => {
            const idx = profile.stories.findIndex((s) => s.id === updatedStory.id);
            if (idx !== -1) profile.stories[idx] = updatedStory;
            saveProfile(profile);
            
            // ВОТ ЭТОЙ СТРОКИ НЕ ХВАТАЛО:
            renderStories(container, profile); 
          }
        );
      } else {
        openStoriesReader(story);
      }
    });

    grid.appendChild(cardEl);
  });

  if (editing) {
    const addCardEl = createCard({
      id: 'add',
      text: 'Создать',
      emoji: '➕',
      isAdd: true,
    });

    addCardEl.addEventListener('click', () => {
      openStoriesEditor(
        container,
        null,
        (newStory) => {
          if (!profile.stories) profile.stories = [];
          profile.stories.push(newStory);
          saveProfile(profile);
          renderStories(container, profile);
        },
        () => renderStories(container, profile)
      );
    });

    grid.appendChild(addCardEl);
  }

  wrapper.appendChild(grid);
  container.appendChild(wrapper);
}