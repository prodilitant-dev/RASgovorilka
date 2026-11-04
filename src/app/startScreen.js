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

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Шапка в стиле печатных листов (PrintPage.js):
 * «РАСговорилка» в брендовых цветах + декоративная дуга.
 * Классы свои (.start-brand-*), чтобы не зависеть от print.css.
 */
function buildBrand() {
  const brand = createElement('div', { className: 'start-brand' });

  const logo = createElement('div', { className: 'start-brand-logo' });
  logo.innerHTML = '<span class="brand-ras">РАС</span><span class="brand-talk">говорилка</span>';
  brand.appendChild(logo);

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 10');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.classList.add('start-brand-arch');
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', 'M 0 10 Q 50 -5 100 10');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#888');
  path.setAttribute('stroke-width', '2');
  svg.appendChild(path);
  brand.appendChild(svg);

  return brand;
}

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

  const brand = buildBrand();

  const icon = createElement('img', {
    className: 'start-icon',
    src: `${import.meta.env.BASE_URL}icon-512.png`, // было icon-192.png
    alt: '',
    'aria-hidden': 'true',
  });

  startBtn = createElement(
    'button',
    { type: 'button', className: 'start-btn', 'aria-label': 'Начать работу' },
    'Начать'
  );
  on(startBtn, 'click', handleStartClick);

  const inner = createElement('div', { className: 'start-inner' }, [brand, icon, startBtn]);

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
