// src/modes/stories/Stories.reader.js
import { createElement, on, clear } from '@utils/dom';
import { getImageUrl } from '@services/imageService';
import { createCard } from '@components/common/Card/Card';
import { getState } from '@state/store';
import { logger } from '@utils/logger';
import '@styles/modes/stories.css';

export function openStoriesReader(story) {
  if (!story || !story.slides || story.slides.length === 0) {
    logger.warn('История пуста или не содержит слайдов');
    return;
  }

  let currentSlideIndex = 0;
  let playbackState = 'stopped'; // 'stopped' | 'playing' | 'paused'

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

  // Футер (Кнопки навигации)
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

  // --- Логика озвучки ---

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
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    playbackState = 'stopped';
    updatePlayBtnState();
    cardsTray.querySelectorAll('.card--active').forEach(c => c.classList.remove('card--active'));
  }

  function getVoiceSettings() {
    const state = getState();
    return state.globalSettings?.voiceSettings || {};
  }

  function playSlide(slide) {
    stopPlayback();
    if (!slide.cards || slide.cards.length === 0) return;

    playbackState = 'playing';
    updatePlayBtnState();

    const vs = getVoiceSettings();
    
    // 1. Собираем весь текст в одну строку и запоминаем индексы карточек
    let fullText = '';
    const mapping = [];
    slide.cards.forEach((card, index) => {
      const start = fullText.length;
      fullText += card.text;
      const end = fullText.length;
      mapping.push({ start, end, index });
      if (index < slide.cards.length - 1) {
        fullText += ' '; // Пробел между словами
      }
    });

    // 2. Создаем одно длинное высказывание
    const utt = new SpeechSynthesisUtterance(fullText);
    utt.lang = 'ru-RU';
    utt.rate = vs.rate ?? 1;
    utt.pitch = vs.pitch ?? 1;
    utt.volume = vs.volume ?? 1;

    if (vs.voiceURI) {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.voiceURI === vs.voiceURI);
      if (voice) utt.voice = voice;
    }

    const cardElements = Array.from(cardsTray.querySelectorAll('.story-card-mini'));

    // 3. Синхронная подсветка карточек
    utt.onboundary = (event) => {
      if (event.name === 'word' || event.name === 'sentence') {
        const charIndex = event.charIndex;
        // Находим, в какую карточку попадает текущий индекс символа
        const activeMapping = mapping.find(m => charIndex >= m.start && charIndex <= m.end);
        
        if (activeMapping) {
          const cardEl = cardElements[activeMapping.index];
          if (cardEl && !cardEl.classList.contains('card--active')) {
            cardElements.forEach(c => c.classList.remove('card--active'));
            cardEl.classList.add('card--active');
            cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      }
    };

    utt.onend = () => {
      cardElements.forEach(c => c.classList.remove('card--active'));
      if (playbackState === 'playing') {
        playbackState = 'stopped';
        updatePlayBtnState();
      }
    };

    utt.onerror = (e) => {
      if (e.error !== 'interrupted') {
        cardElements.forEach(c => c.classList.remove('card--active'));
        stopPlayback();
      }
    };

    window.speechSynthesis.speak(utt);
  }

  function speakSingle(text, cardEl) {
    stopPlayback();
    if (cardEl) {
      cardEl.classList.add('card--active');
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    
    const vs = getVoiceSettings();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'ru-RU';
    utt.rate = vs.rate ?? 1;
    utt.pitch = vs.pitch ?? 1;
    utt.volume = vs.volume ?? 1;

    if (vs.voiceURI) {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.voiceURI === vs.voiceURI);
      if (voice) utt.voice = voice;
    }

    utt.onend = () => {
      if (cardEl) cardEl.classList.remove('card--active');
    };

    window.speechSynthesis.speak(utt);
  }

  // --- Управление интерфейсом ---

  function closeReader() {
    stopPlayback();
    document.body.style.overflow = '';
    overlay.remove();
  }

  on(btnClose, 'click', closeReader);

  function renderSlide() {
    stopPlayback();
    const slide = story.slides[currentSlideIndex];
    
    if (story.slides.length > 1) {
      progressEl.textContent = `${currentSlideIndex + 1} / ${story.slides.length}`;
    } else {
      progressEl.textContent = '';
    }

    imageEl.src = '';
    imageEl.style.display = 'none';
    if (slide.imageId) {
      getImageUrl(slide.imageId).then((url) => {
        if (url) {
          imageEl.src = url;
          imageEl.style.display = 'block';
        }
      });
    } else if (slide.imagePath) {
      const base = import.meta.env.BASE_URL || '/';
      imageEl.src = base.endsWith('/') ? `${base}${slide.imagePath}` : `${base}/${slide.imagePath}`;
      imageEl.style.display = 'block';
    }

    clear(cardsTray);
    if (slide.cards && slide.cards.length > 0) {
      slide.cards.forEach((cardData) => {
        const cardEl = createCard({
          id: cardData.id,
          text: cardData.text,
          imageId: cardData.imageId,
          imagePath: cardData.imagePath,
          emoji: cardData.emoji
        });
        cardEl.classList.add('story-card-mini');
        
        on(cardEl, 'click', () => {
          speakSingle(cardData.text, cardEl);
        });
        
        cardsTray.appendChild(cardEl);
      });
    }

    btnPrev.disabled = currentSlideIndex === 0;
    if (currentSlideIndex === story.slides.length - 1) {
      btnNext.textContent = 'Готово';
    } else {
      btnNext.textContent = 'Далее >';
    }
  }

  on(btnPlay, 'click', () => {
    const slide = story.slides[currentSlideIndex];
    
    if (playbackState === 'stopped') {
      playSlide(slide);
    } else if (playbackState === 'playing') {
      playbackState = 'paused';
      window.speechSynthesis.pause();
      updatePlayBtnState();
    } else if (playbackState === 'paused') {
      playbackState = 'playing';
      window.speechSynthesis.resume();
      updatePlayBtnState();
    }
  });

  on(btnPrev, 'click', () => {
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      renderSlide();
    }
  });

  on(btnNext, 'click', () => {
    if (currentSlideIndex < story.slides.length - 1) {
      currentSlideIndex++;
      renderSlide();
    } else {
      closeReader();
    }
  });

  renderSlide();
}