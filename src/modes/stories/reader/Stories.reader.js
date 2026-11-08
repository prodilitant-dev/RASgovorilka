// src/modes/stories/reader/Stories.reader.js
import { on } from '@utils/dom';
import { logger } from '@utils/logger';
import { createReaderDOM } from './reader.dom';
import { createPlayback } from './reader.playback';
import '@styles/modes/stories.css';

export function openStoriesReader(story) {
  if (!story || !story.slides || story.slides.length === 0) {
    logger.warn('История пуста или не содержит слайдов');
    return;
  }

  let currentSlideIndex = 0;
  const refs = createReaderDOM(story);

  document.body.appendChild(refs.overlay);
  document.body.style.overflow = 'hidden';

  const playback = createPlayback({
    story,
    refs,
    getSlideIndex: () => currentSlideIndex,
    setSlideIndex: (idx) => {
      currentSlideIndex = idx;
    },
  });

  function handleVisibilityChange() {
    if (document.hidden && playback.getState() === 'playing') {
      playback.stop();
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange);

  function closeReader() {
    playback.stop();
    document.body.style.overflow = '';
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    refs.overlay.remove();
  }

  on(refs.btnClose, 'click', closeReader);

  on(refs.btnPlay, 'click', () => playback.toggle());

  on(refs.btnPrev, 'click', () => {
    playback.stop();
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      playback.renderCurrent();
    }
  });

  on(refs.btnNext, 'click', () => {
    playback.stop();
    if (currentSlideIndex < story.slides.length - 1) {
      currentSlideIndex++;
      playback.renderCurrent();
    } else {
      closeReader();
    }
  });

  playback.renderCurrent();
}
