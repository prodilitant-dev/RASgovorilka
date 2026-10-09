// src/utils/lifecycle.js
import { logger } from './logger';

/**
 * Коллектор cleanup-функций.
 *
 * Пример использования:
 *
 *   const cleanup = createCleanupCollector();
 *   cleanup.add(() => {});          // добавить функцию
 *   cleanup.add(otherCleanup);      // или результат другой функции
 *   cleanup.run();                  // вызвать все (в обратном порядке)
 *
 * Функции вызываются в LIFO (Last In, First Out) — как в React:
 * то, что добавлено последним, очищается первым.
 * Это правильно, потому что дочерние компоненты зависят от родительских.
 */
export function createCleanupCollector() {
  const stack = [];
  let isRunning = false;

  return {
    /**
     * Добавить cleanup-функцию (или массив).
     * Молча игнорирует null/undefined.
     */
    add(fn) {
      if (!fn) return;
      if (Array.isArray(fn)) {
        fn.forEach((f) => this.add(f));
        return;
      }
      if (typeof fn !== 'function') {
        logger.warn('createCleanupCollector: попытка добавить не-функцию:', fn);
        return;
      }
      stack.push(fn);
    },

    /**
     * Вызвать все добавленные cleanup-функции в обратном порядке.
     * Защита от повторного вызова.
     */
    run() {
      if (isRunning) return;
      isRunning = true;
      while (stack.length) {
        const fn = stack.pop();
        try {
          fn();
        } catch (err) {
          logger.error('Cleanup error:', err);
        }
      }
      isRunning = false;
    },

    /**
     * Сколько функций ещё не вызвано (для отладки).
     */
    get size() {
      return stack.length;
    },
  };
}