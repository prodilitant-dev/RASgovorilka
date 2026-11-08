// src/modes/stories/reader/reader.playback.js
import { getState } from '@state/store';
import {
  speakSequence,
  stopSequence,
  pauseSequence,
  resumeSequence,
} from '@services/speech/speechSequence';
import { updatePlayButton } from './reader.dom';
import { renderSlide } from './reader.slide';

/**
 * Управляет воспроизведением истории: state-machine (stopped/playing/paused),
 * озвучка слайдов, подсветка активной карточки.
 *
 * @param {Object} params
 * @param {Object} params.story
 * @param {Object} params.refs - из createReaderDOM
 * @param {() => number} params.getSlideIndex
 * @param {(index: number) => void} params.setSlideIndex
 */
export function createPlayback({ story, refs, getSlideIndex, setSlideIndex }) {
  const { cardsTray, btnPlay } = refs;

  let state = 'stopped'; // 'stopped' | 'playing' | 'paused'
  let waitTimeout = null;

  function getVoiceSettings() {
    const appState = getState();
    return appState.globalSettings?.voiceSettings || {};
  }

  function setState_(newState) {
    state = newState;
    updatePlayButton(btnPlay, state);
  }

  function stop() {
    stopSequence();
    if (waitTimeout) clearTimeout(waitTimeout);
    waitTimeout = null;
    setState_('stopped');
    cardsTray.querySelectorAll('.card--active').forEach((c) => c.classList.remove('card--active'));
  }

  function speakSingle(text, cardEl) {
    if (cardEl) {
      cardEl.classList.add('card--active');
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    speakSequence(text, {
      voiceSettings: getVoiceSettings(),
      onEnd: () => {
        if (cardEl) cardEl.classList.remove('card--active');
      },
      onError: () => {
        if (cardEl) cardEl.classList.remove('card--active');
      },
    });
  }

  function playCurrentSlideAudio(onComplete) {
    const slide = story.slides[getSlideIndex()];
    if (!slide.cards || slide.cards.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    const vs = getVoiceSettings();
    let fullText = '';
    const mapping = [];
    slide.cards.forEach((card, index) => {
      const start = fullText.length;
      fullText += card.text;
      const end = fullText.length;
      mapping.push({ start, end, index });
      if (index < slide.cards.length - 1) fullText += ' ';
    });

    const cardElements = Array.from(cardsTray.querySelectorAll('.card--mini'));

    speakSequence(fullText, {
      voiceSettings: vs,
      onWord: (charIndex) => {
        const activeMapping = mapping.find((m) => charIndex >= m.start && charIndex <= m.end);
        if (activeMapping) {
          const cardEl = cardElements[activeMapping.index];
          if (cardEl && !cardEl.classList.contains('card--active')) {
            cardElements.forEach((c) => c.classList.remove('card--active'));
            cardEl.classList.add('card--active');
            cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      },
      onEnd: () => {
        cardElements.forEach((c) => c.classList.remove('card--active'));
        if (onComplete) onComplete();
      },
      onError: () => {
        cardElements.forEach((c) => c.classList.remove('card--active'));
        if (onComplete) onComplete();
      },
    });
  }

  const onCardClick = (cardData, cardEl) => {
    stop();
    speakSingle(cardData.text, cardEl);
  };

  const renderCurrent = () =>
    renderSlide({ story, slideIndex: getSlideIndex(), refs, onCardClick });

  function playFrom(startIndex) {
    stop();
    setState_('playing');
    setSlideIndex(startIndex);

    const playNextSlide = async () => {
      if (state !== 'playing') return;
      await renderCurrent();

      waitTimeout = setTimeout(() => {
        if (state !== 'playing') return;
        playCurrentSlideAudio(() => {
          if (state !== 'playing') return;
          const idx = getSlideIndex();
          if (idx < story.slides.length - 1) {
            const currentSlide = story.slides[idx];
            const delayMs = currentSlide.pauseAfter !== undefined ? currentSlide.pauseAfter : 1500;
            waitTimeout = setTimeout(() => {
              setSlideIndex(idx + 1);
              playNextSlide();
            }, delayMs);
          } else {
            stop();
          }
        });
      }, 300);
    };
    playNextSlide();
  }

  function toggle() {
    if (state === 'stopped') {
      playFrom(getSlideIndex());
    } else if (state === 'playing') {
      state = 'paused';
      pauseSequence();
      if (waitTimeout) clearTimeout(waitTimeout);
      updatePlayButton(btnPlay, state);
    } else if (state === 'paused') {
      state = 'playing';
      if (window.speechSynthesis.paused) {
        resumeSequence();
      } else {
        playFrom(getSlideIndex());
      }
      updatePlayButton(btnPlay, state);
    }
  }

  return {
    stop,
    toggle,
    speakSingle,
    renderCurrent,
    getState: () => state,
  };
}
