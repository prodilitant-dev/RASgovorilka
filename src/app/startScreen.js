// src/app/startScreen.js
import { createElement, on } from '@utils/dom';
import { logger } from '@utils/logger';
import { toast } from '@utils/toast';
import { warmUpSpeech } from '@utils/speech';
import { consumeSkipStartScreen, checkUpdateInBackground } from '@services/pwa/updateService';

let overlayEl = null;
let startBtn = null;

// idle | initializing | ready | pending-ready | starting | hidden
let state = 'idle';

export function mountStartScreen() {
  if (consumeSkipStartScreen()) {
    logger.debug('StartScreen: пропущен (после обновления)');
    state = 'hidden';
    setupFirstGestureWarmUp();
    checkForUpdates();
    return;
  }

  state = 'initializing';

  // Блокируем интерактивность приложения под оверлеем
  const app = document.getElementById('app');
  if (app) app.inert = true;

  const logo = createElement('img', {
    className: 'start-logo',
    src: `${import.meta.env.BASE_URL}icon-192.png`,
    alt: '',
    'aria-hidden': 'true',
  });

  const title = createElement('h1', { className: 'start-title' }, 'РАСговорилка');
  const subtitle = createElement(
    'p',
    { className: 'start-subtitle' },
    'Бесплатный офлайн-коммуникатор'
  );

  startBtn = createElement(
    'button',
    { type: 'button', className: 'start-btn', 'aria-label': 'Начать работу' },
    'Начать'
  );
  on(startBtn, 'click', handleStartClick);

  const inner = createElement('div', { className: 'start-inner' }, [
    logo,
    title,
    subtitle,
    startBtn,
  ]);

  overlayEl = createElement(
    'div',
    { className: 'start-overlay', role: 'region', 'aria-label': 'Экран запуска' },
    inner
  );

  document.body.appendChild(overlayEl);
  requestAnimationFrame(() => startBtn && startBtn.focus());

  checkForUpdates();
}

export function markStartScreenReady() {
  if (state === 'initializing') {
    state = 'ready';
    logger.debug('StartScreen: ready');
  } else if (state === 'pending-ready') {
    performStart();
  }
}

function handleStartClick() {
  if (state === 'starting' || state === 'hidden' || state === 'pending-ready') return;

  if (state === 'initializing') {
    state = 'pending-ready';
    startBtn.disabled = true;
    startBtn.textContent = 'Подготовка…';
    return;
  }

  if (state === 'ready') performStart();
}

function performStart() {
  state = 'starting';
  if (startBtn) startBtn.disabled = true;
  try {
    warmUpSpeech();
  } catch (e) {
    logger.warn('StartScreen: warm-up error', e);
  }
  hideOverlay();
}

function hideOverlay() {
  state = 'hidden';
  if (!overlayEl) return;
  overlayEl.classList.add('start-overlay--hiding');
  const el = overlayEl;
  overlayEl = null;
  setTimeout(() => {
    el.remove();
    const app = document.getElementById('app');
    if (app) {
      app.inert = false;
      app.setAttribute('tabindex', '-1');
      app.focus();
      app.removeAttribute('tabindex');
    }
  }, 300);
}

function checkForUpdates() {
  checkUpdateInBackground()
    .then((result) => {
      if (result.status === 'update-available') {
        toast('Доступно обновление. Обновите в Настройках → Данные', 'info', 6000);
      }
      // остальные статусы (up-to-date, offline, no-sw, error) — тишина
    })
    .catch(() => {
      /* офлайн-first: никогда не шумим ошибками */
    });
}

// Если старт-экран пропущен (после обновления) — прогреваем речь
// на первом жесте, как это делал старый setupSpeechWarmUp.
function setupFirstGestureWarmUp() {
  if (!('speechSynthesis' in window)) return;
  let done = false;
  const handler = () => {
    if (done) return;
    done = true;
    document.removeEventListener('pointerdown', handler, true);
    document.removeEventListener('touchstart', handler, true);
    document.removeEventListener('click', handler, true);
    warmUpSpeech();
  };
  document.addEventListener('pointerdown', handler, true);
  document.addEventListener('touchstart', handler, true);
  document.addEventListener('click', handler, true);
}