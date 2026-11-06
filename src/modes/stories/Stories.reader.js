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
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (waitTimeout) clearTimeout(waitTimeout);
    playbackState = 'stopped';
    updatePlayBtnState();
    cardsTray.querySelectorAll('.card--active').forEach(c => c.classList.remove('card--active'));
  }

  function getVoiceSettings() {
    const state = getState();
    return state.globalSettings?.voiceSettings || {};
  }

  // Обновление интерфейса (без сброса состояния воспроизведения)
  async function renderSlideUI() {
    const slide = story.slides[currentSlideIndex];
    
    if (story.slides.length > 1) {
      progressEl.textContent = `${currentSlideIndex + 1} / ${story.slides.length}`;
    } else {
      progressEl.textContent = '';
    }

    // Картинка
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

    // Лента карточек
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
          stopPlayback();
          speakSingle(cardData.text, cardEl);
        });
        cardsTray.appendChild(cardEl);
      });
    }

    // Кнопки навигации
    btnPrev.disabled = currentSlideIndex === 0;
    if (currentSlideIndex === story.slides.length - 1) {
      btnNext.textContent = 'Готово';
    } else {
      btnNext.textContent = 'Далее >';
    }
  }

  // Воспроизведение текущего слайда с коллбэком на завершение
  function playCurrentSlideAudio(onComplete) {
    const slide = story.slides[currentSlideIndex];
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

    utt.onboundary = (event) => {
      if (event.name === 'word' || event.name === 'sentence') {
        const charIndex = event.charIndex;
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
      if (onComplete) onComplete();
    };

    utt.onerror = (e) => {
      if (e.error !== 'interrupted') {
        cardElements.forEach(c => c.classList.remove('card--active'));
        if (onComplete) onComplete();
      }
    };

    window.speechSynthesis.speak(utt);
  }

  // Запуск всей истории (с задержками)
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
            // БЕРЕМ ПАУЗУ ИЗ ТЕКУЩЕГО СЛАЙДА
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

  function speakSingle(text, cardEl) {
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

  on(btnPlay, 'click', () => {
    if (playbackState === 'stopped') {
      playEntireStory(currentSlideIndex);
    } else if (playbackState === 'playing') {
      playbackState = 'paused';
      window.speechSynthesis.pause();
      if (waitTimeout) clearTimeout(waitTimeout); // Останавливаем таймер ожидания
      updatePlayBtnState();
    } else if (playbackState === 'paused') {
      playbackState = 'playing';
      
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        // Если мы были в паузе между слайдами (речь не играла), нужно запустить таймер заново
        const vs = getVoiceSettings();
        const delayMs = vs.slideDelay ?? 1500;
        
        // Продолжаем с того же слайда, где остановились
        // Если пауза была во время речи, speechSynthesis.resume() поднимет её.
        // Если пауза была во время задержки, нам нужно понять, чей это был таймер.
        // Для простоты: если речь на паузе - resume, иначе просто запускаем playNextSlide
        if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
           // Если мы стояли на паузе, но ничего не говорили (т.е. это была пауза во время waitTimeout)
           // Просто перезапускаем воспроизведение текущего слайда (или продолжаем ожидание)
           // Самый простой и надежный путь - перезапустить playEntireStory с текущего индекса, но с флагом, 
           // что это продолжение, чтобы не сбрасывать UI.
           playEntireStory(currentSlideIndex);
        }
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

  // Инициализация
  renderSlideUI();
}