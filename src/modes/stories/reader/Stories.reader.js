// src/modes/stories/Stories.reader.js
import { createElement, on, clear } from '@utils/dom';
import { getImageUrl } from '@services/imageService';
import { createCard } from '@components/common/Card/Card';
import { getState } from '@state/store';
import { speakSequence, stopSequence, pauseSequence, resumeSequence } from '@services/speech/speechSequence';
import { logger } from '@utils/logger';
import '@styles/modes/stories.css';

export function openStoriesReader(story) {
  if (!story || !story.slides || story.slides.length === 0) {
    logger.warn('История пуста или не содержит слайдов');
    return;
  }

  let currentSlideIndex = 0;
  let playbackState = 'stopped'; // 'stopped' | 'playing' | 'paused'
  let waitTimeout = null;

  // Создаем оверлей
  const overlay = createElement('div', { className: 'story-reader-overlay' });
  
  // Шапка
  const header = createElement('div', { className: 'story-reader-header' });
  const btnPlay = createElement('button', { className: 'story-reader-play', 'aria-label': 'Воспроизвести' }, '▶️');
  const btnClose = createElement('button', { className: 'story-reader-close', 'aria-label': 'Закрыть' }, '✕');
  
  const titleEl = createElement('div', { className: 'story-reader-title' }, story.title || 'История');
  const progressEl = createElement('div', { className: 'story-reader-progress' });

  const headerLeft = createElement('div', { className: 'story-reader-header-left' }, [btnPlay]);
  const headerCenter = createElement('div', { className: 'story-reader-header-center' }, [titleEl, progressEl]);
  const headerRight = createElement('div', { className: 'story-reader-header-right' }, [btnClose]);

  header.appendChild(headerLeft);
  header.appendChild(headerCenter);
  header.appendChild(headerRight);

  // Контент (Картинка + Карточки)
  const contentArea = createElement('div', { className: 'story-reader-content' });
  const imageWrap = createElement('div', { className: 'story-reader-image-wrap' });
  const imageEl = createElement('img', { className: 'story-reader-image', alt: '' });
  imageWrap.appendChild(imageEl);
  
  const cardsTray = createElement('div', { className: 'story-reader-cards-tray' });
  
  contentArea.appendChild(imageWrap);
  contentArea.appendChild(cardsTray);

  // Футер
  const footer = createElement('div', { className: 'story-reader-footer' });
  const btnPrev = createElement('button', { className: 'btn btn-secondary story-nav-btn' }, '< Назад');
  const btnNext = createElement('button', { className: 'btn btn-primary story-nav-btn' }, 'Далее >');
  footer.appendChild(btnPrev);
  footer.appendChild(btnNext);

  // Сборка
  overlay.appendChild(header);
  overlay.appendChild(contentArea);
  overlay.appendChild(footer);
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  // --- Логика ---

  function updatePlayBtnState() {
    if (playbackState === 'playing') {
      btnPlay.textContent = '⏸';
      btnPlay.classList.add('active');
      btnPlay.setAttribute('aria-label', 'Пауза');
    } else {
      btnPlay.textContent = '▶️';
      btnPlay.classList.remove('active');
      btnPlay.setAttribute('aria-label', 'Воспроизвести');
    }
  }

  function stopPlayback() {
    stopSequence();
    if (waitTimeout) clearTimeout(waitTimeout);
    playbackState = 'stopped';
    updatePlayBtnState();
    cardsTray.querySelectorAll('.card--active').forEach(c => c.classList.remove('card--active'));
  }

  function getVoiceSettings() {
    const state = getState();
    return state.globalSettings?.voiceSettings || {};
  }

  async function renderSlideUI() {
    const slide = story.slides[currentSlideIndex];
    
    if (story.slides.length > 1) {
      progressEl.textContent = `${currentSlideIndex + 1} / ${story.slides.length}`;
    } else {
      progressEl.textContent = '';
    }

    imageEl.src = '';
    imageEl.style.display = 'none';
    if (slide.imageId) {
      const url = await getImageUrl(slide.imageId);
      if (url) { imageEl.src = url; imageEl.style.display = 'block'; }
    } else if (slide.imagePath) {
      const base = import.meta.env.BASE_URL || '/';
      imageEl.src = base.endsWith('/') ? `${base}${slide.imagePath}` : `${base}/${slide.imagePath}`;
      imageEl.style.display = 'block';
    }

    clear(cardsTray);
    if (slide.cards && slide.cards.length > 0) {
      slide.cards.forEach((cardData) => {
        // Переиспользуем createCard с модификатором mini
        const cardEl = createCard({
          id: cardData.id,
          text: cardData.text,
          imageId: cardData.imageId,
          imagePath: cardData.imagePath,
          emoji: cardData.emoji,
          className: 'card--mini'
        });
        
        on(cardEl, 'click', () => {
          stopPlayback();
          speakSingle(cardData.text, cardEl);
        });
        cardsTray.appendChild(cardEl);
      });
    }

    btnPrev.disabled = currentSlideIndex === 0;
    btnNext.textContent = currentSlideIndex === story.slides.length - 1 ? 'Готово' : 'Далее >';
  }

  function playCurrentSlideAudio(onComplete) {
    const slide = story.slides[currentSlideIndex];
    if (!slide.cards || slide.cards.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    const vs = getVoiceSettings();
    
    // Собираем текст и маппинг карточек
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
        const activeMapping = mapping.find(m => charIndex >= m.start && charIndex <= m.end);
        if (activeMapping) {
          const cardEl = cardElements[activeMapping.index];
          if (cardEl && !cardEl.classList.contains('card--active')) {
            cardElements.forEach(c => c.classList.remove('card--active'));
            cardEl.classList.add('card--active');
            cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      },
      onEnd: () => {
        cardElements.forEach(c => c.classList.remove('card--active'));
        if (onComplete) onComplete();
      },
      onError: () => {
        cardElements.forEach(c => c.classList.remove('card--active'));
        if (onComplete) onComplete();
      }
    });
  }

  function speakSingle(text, cardEl) {
    if (cardEl) {
      cardEl.classList.add('card--active');
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    
    speakSequence(text, {
      voiceSettings: getVoiceSettings(),
      onEnd: () => { if (cardEl) cardEl.classList.remove('card--active'); },
      onError: () => { if (cardEl) cardEl.classList.remove('card--active'); }
    });
  }

  function playEntireStory(startIndex = 0) {
    stopPlayback();
    playbackState = 'playing';
    updatePlayBtnState();
    currentSlideIndex = startIndex;

    const playNextSlide = async () => {
      if (playbackState !== 'playing') return;
      
      await renderSlideUI();

      waitTimeout = setTimeout(() => {
        if (playbackState !== 'playing') return;
        
        playCurrentSlideAudio(() => {
          if (playbackState !== 'playing') return;
          
          if (currentSlideIndex < story.slides.length - 1) {
            const currentSlide = story.slides[currentSlideIndex];
            const delayMs = currentSlide.pauseAfter !== undefined ? currentSlide.pauseAfter : 1500;

            waitTimeout = setTimeout(() => {
              currentSlideIndex++;
              playNextSlide();
            }, delayMs);
          } else {
            stopPlayback();
            btnNext.textContent = 'Готово';
          }
        });
      }, 300);
    };

    playNextSlide();
  }

  // --- Управление интерфейсом ---

  function closeReader() {
    stopPlayback();
    document.body.style.overflow = '';
    overlay.remove();
  }

  on(btnClose, 'click', closeReader);

  on(btnPlay, 'click', () => {
    if (playbackState === 'stopped') {
      playEntireStory(currentSlideIndex);
    } else if (playbackState === 'playing') {
      playbackState = 'paused';
      pauseSequence();
      if (waitTimeout) clearTimeout(waitTimeout);
      updatePlayBtnState();
    } else if (playbackState === 'paused') {
      playbackState = 'playing';
      
      if (window.speechSynthesis.paused) {
        resumeSequence();
      } else {
        // Если пауза была во время ожидания между слайдами
        playEntireStory(currentSlideIndex);
      }
      updatePlayBtnState();
    }
  });

  on(btnPrev, 'click', () => {
    stopPlayback();
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      renderSlideUI();
    }
  });

  on(btnNext, 'click', () => {
    stopPlayback();
    if (currentSlideIndex < story.slides.length - 1) {
      currentSlideIndex++;
      renderSlideUI();
    } else {
      closeReader();
    }
  });

  renderSlideUI();
}