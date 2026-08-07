// src/utils/logger.js

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

// Определяем уровень по умолчанию: в разработке debug, в production warn
const defaultLevel = import.meta.env.DEV ? 'debug' : 'warn';
let currentLevel = defaultLevel;

// Функция логирования
function log(level, ...args) {
  if (LEVELS[level] >= LEVELS[currentLevel]) {
    const consoleMethod = level === 'debug' ? 'log' : level;
    const prefix = `[${level.toUpperCase()}]`;
    console[consoleMethod](prefix, ...args);
  }
}

// Публичный API
export const logger = {
  debug: (...args) => log('debug', ...args),
  info: (...args) => log('info', ...args),
  warn: (...args) => log('warn', ...args),
  error: (...args) => log('error', ...args),
  setLevel: (level) => {
    if (LEVELS[level] !== undefined) {
      currentLevel = level;
      logger.info(`Log level set to ${level}`);
    }
  },
  getLevel: () => currentLevel,
};

// ----- Автоматическое логирование действий -----

// 1. Логирование всех кликов по элементам с атрибутом data-log
export function initClickLogger() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-log]');
    if (target) {
      const logData = target.dataset.log || 'click';
      const extra = {
        tag: target.tagName,
        id: target.id || null,
        className: target.className || null,
        text: target.textContent?.trim()?.slice(0, 50) || null,
      };
      logger.debug(`User action: ${logData}`, extra);
    }
  });
  logger.debug('Click logger initialized');
}

// 2. Логирование изменений состояния (подписка на store)
export function initStateLogger(store) {
  if (typeof store.subscribe !== 'function') {
    logger.warn('State logger: store does not have subscribe method');
    return;
  }
  store.subscribe((changed, state) => {
    logger.debug('State changed', { changed, state });
  });
  logger.debug('State logger initialized');
}

// 3. Обёртка для функции toast (чтобы логировать уведомления)
export function wrapToast(toastFn) {
  return (message, type = 'info', duration = 2500) => {
    logger.info(`Toast: ${message} (${type})`);
    return toastFn(message, type, duration);
  };
}

// 4. Обёртка для speak (логирование озвучивания)
export function wrapSpeak(speakFn) {
  return (text, ...args) => {
    logger.debug(`Speak: "${text}"`);
    return speakFn(text, ...args);
  };
}

// 5. Утилита для логирования рендеринга (ручной вызов)
export function logRender(componentName, ...details) {
  logger.debug(`🔄 Rendering ${componentName}`, ...details);
}

// 6. Декоратор для автоматического логирования рендеринга (опционально)
export function withRenderLogging(fn, name) {
  return function (...args) {
    const start = performance.now();
    // Преобразуем аргументы для читаемости
    const logArgs = args.map(arg => {
      if (arg instanceof HTMLElement) {
        return `<${arg.tagName.toLowerCase()} id="${arg.id || ''}" class="${arg.className || ''}">`;
      }
      if (typeof arg === 'object' && arg !== null) {
        // Ограничиваем глубину для объектов
        try {
          return JSON.stringify(arg, (key, value) => {
            if (key === 'cards' || key === 'profiles' || key === 'data') return `[${Array.isArray(value) ? value.length : 'object'}]`;
            return value;
          }, 2);
        } catch {
          return '[complex object]';
        }
      }
      return arg;
    });
    logger.debug(`🔄 Rendering ${name}`, ...logArgs);
    const result = fn.apply(this, args);
    const duration = (performance.now() - start).toFixed(2);
    logger.debug(`✅ ${name} rendered in ${duration}ms`);
    return result;
  };
}

// Функция инициализации (вызывается в main.js)
export function initLogger(store, options = {}) {
  const { level = null } = options;
  if (level) logger.setLevel(level);

  if (store) initStateLogger(store);
  initClickLogger();

  logger.info(`Logger initialized with level: ${logger.getLevel()}`);
}