// src/modes/stories/Stories.editor.js
import { createElement, clear } from '@utils/dom';
import { uid } from '@utils/id';
import { openStoriesReader } from './reader/Stories.reader';
import { createEditorHeader } from './components/editor/EditorHeader';
import { createSlideNavigation } from './components/editor/SlideNavigation';
import { createSlideContent } from './components/editor/SlideContent';
import { createCardTray } from './components/editor/CardTray';
import { createEditorFooter } from './components/editor/EditorFooter';
import '@styles/modes/stories-editor.css';

export function openStoriesEditor(container, story, onSave, onCancel) {
  const workingStory = JSON.parse(
    JSON.stringify(
      story || { id: uid(), title: '', coverImageId: null, coverImagePath: null, slides: [] }
    )
  );

  let currentSlideIndex = workingStory.slides.length > 0 ? 0 : -1;
  const root = createElement('div', { className: 'story-editor-root' });

  const renderEditor = () => {
    clear(root);

    // 1. Шапка
    root.appendChild(createEditorHeader(workingStory, renderEditor));

    // 2. Основная часть
    const main = createElement('div', { className: 'story-editor-main' });

    if (workingStory.slides.length === 0) {
      const emptyBtn = createElement(
        'button',
        { className: 'story-add-first-slide', type: 'button' },
        'Добавить первый слайд'
      );
      emptyBtn.addEventListener('click', () => {
        workingStory.slides.push({
          id: uid(),
          imageId: null,
          imagePath: null,
          cards: [],
          pauseAfter: 1500,
        });
        currentSlideIndex = 0;
        renderEditor();
      });
      main.appendChild(emptyBtn);
    } else {
      const slide = workingStory.slides[currentSlideIndex];
      const isFirst = currentSlideIndex === 0;
      const isLast = currentSlideIndex === workingStory.slides.length - 1;

      main.appendChild(
        createSlideNavigation(
          workingStory,
          currentSlideIndex,
          (idx) => { currentSlideIndex = idx; renderEditor(); },
          () => {
            workingStory.slides.splice(currentSlideIndex, 1);
            currentSlideIndex = Math.max(0, currentSlideIndex - 1);
            if (workingStory.slides.length === 0) currentSlideIndex = -1;
            renderEditor();
          }
        )
      );

      main.appendChild(
        createSlideContent(
          slide,
          isFirst,
          isLast,
          () => { currentSlideIndex--; renderEditor(); },
          () => {
            if (isLast) {
              workingStory.slides.push({
                id: uid(),
                imageId: null,
                imagePath: null,
                cards: [],
                pauseAfter: 1500,
              });
              currentSlideIndex++;
            } else {
              currentSlideIndex++;
            }
            renderEditor();
          },
          renderEditor
        )
      );

      main.appendChild(createCardTray(slide, renderEditor));
    }

    root.appendChild(main);

    // 3. Футер
    root.appendChild(
      createEditorFooter(
        workingStory,
        onCancel,
        () => openStoriesReader(workingStory),
        () => onSave(workingStory)
      )
    );
  };

  renderEditor();
  clear(container);
  container.appendChild(root);
}