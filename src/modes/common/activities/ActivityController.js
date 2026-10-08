// src/modes/common/activities/ActivityController.js
import { getState, setState } from '@state/store';
import { logger } from '@utils/logger';
import { toast } from '@utils/toast';
import { speak, stopSpeech } from '@utils/speech';
import { showResultsModal } from './ResultsModal';

/**
 * Универсальный контроллер для активностей (обучение и игры)
 * Управляет последовательностью, состоянием, обработкой ответов и результатами.
 *
 * @param {Object} params
 * @param {HTMLElement} params.container - контейнер для рендеринга
 * @param {Object} params.profile - текущий профиль (передаётся для доступа к настройкам)
 * @param {Object} params.settings - настройки активности (категории, кол-во вопросов и т.д.)
 * @param {string} params.activityType - уникальный идентификатор типа активности (например, 'quiz', 'memory')
 *
 * @param {Function} params.generateData - (profile, settings) => массив элементов (вопросов/карточек)
 * @param {Function} params.renderItem - (container, item, index, total, onAnswer) => void
 *    - container: контейнер для рендеринга
 *    - item: текущий элемент
 *    - index: 0-based индекс
 *    - total: общее количество элементов
 *    - onAnswer: (answer, item) => void – колбэк, который вызывается при ответе
 * @param {Function} params.handleAnswer - (answer, item) => { correct: boolean, feedback: string, details: Object }
 *    - details: { question, userAnswer, correctAnswer }
 * @param {Function} params.renderResults - (container, stats, callbacks) => void (опционально)
 *    - Если не передан, используется стандартный showResultsModal
 *
 * @param {Object} params.savedState - (опционально) сохранённое состояние из activityState
 * @param {Function} params.onBack - (() => void) колбэк для возврата в меню
 */
export function startActivity({
  container,
  profile,
  settings,
  activityType,
  generateData,
  renderItem,
  handleAnswer,
  renderResults = null,
  savedState = null,
  onBack,
}) {
  logger.debug(`🚀 Starting activity: ${activityType}`);

  // --- Инициализация ---
  let items = [];
  let currentIndex = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let details = [];
  let isProcessing = false;

  // Если есть сохранённое состояние – восстанавливаем
  if (savedState && savedState.type === activityType) {
    items = savedState.items || [];
    currentIndex = savedState.currentIndex || 0;
    correctCount = savedState.correctCount || 0;
    wrongCount = savedState.wrongCount || 0;
    details = savedState.details || [];
    logger.debug(`Restored state: ${items.length} items, index ${currentIndex}`);
  } else {
    items = generateData(profile, settings);
    if (!items || items.length === 0) {
      container.innerHTML =
        '<div style="padding:20px;text-align:center;">Нет данных для активности</div>';
      logger.warn('No items generated');
      return;
    }
    // Сохраняем начальное состояние
    saveState();
  }

  // --- Вспомогательные функции ---
  function saveState() {
    setState({
      activityState: {
        type: activityType,
        items,
        currentIndex,
        correctCount,
        wrongCount,
        details,
        settings,
      },
    });
    logger.debug(`State saved: index ${currentIndex}/${items.length}`);
  }

  function clearState() {
    setState({ activityState: null });
  }

  async function speakFeedback(message) {
    const state = getState();
    const voiceSettings = state.voiceSettings || {
      rate: 1,
      pitch: 1,
      voiceURI: '',
    };
    await speak(message, voiceSettings.rate, voiceSettings.pitch, voiceSettings.voiceURI);
  }

  // --- Отображение текущего вопроса ---
  function renderCurrentItem() {
    if (currentIndex >= items.length) {
      // Завершение
      clearState();
      showResults();
      return;
    }

    const item = items[currentIndex];
    // Передаём колбэк onAnswer, который будет обрабатывать ответ
    const onAnswer = (answer) => {
      if (isProcessing) return;
      isProcessing = true;
      processAnswer(answer, item);
    };

    // Рендерим текущий элемент, передавая колбэк
    renderItem(container, item, currentIndex + 1, items.length, onAnswer);
  }

  // --- Обработка ответа ---
  async function processAnswer(answer, item) {
    const result = handleAnswer(answer, item);
    const isCorrect = result.correct;
    const feedback = result.feedback || (isCorrect ? 'Верно!' : 'Не верно');
    const detail = result.details || {
      question: item.question || item.text || 'Вопрос',
      userAnswer: String(answer),
      correctAnswer: item.correctAnswer || item.answer || '—',
    };

    if (isCorrect) correctCount++;
    else wrongCount++;

    details.push({
      ...detail,
      correct: isCorrect,
    });

    saveState();

    // Показываем обратную связь (рендерим с заблокированными кнопками)
    // Передаём null вместо onAnswer, чтобы заблокировать ввод
    renderItem(
      container,
      item,
      currentIndex + 1,
      items.length,
      null,
      feedback,
      isCorrect,
      detail.userAnswer
    );

    // Озвучиваем обратную связь
    await speakFeedback(feedback);

    // Ждём небольшую паузу перед переходом к следующему
    setTimeout(() => {
      currentIndex++;
      isProcessing = false;
      renderCurrentItem();
    }, 1200);
  }

  // --- Показ результатов ---
  function showResults() {
    const stats = {
      correct: correctCount,
      wrong: wrongCount,
      total: items.length,
      details,
    };

    if (renderResults) {
      // Если передан кастомный рендеринг результатов – используем его
      renderResults(container, stats, {
        onRetry: () => {
          // Перезапуск с теми же настройками, но сброс состояния
          clearState();
          startActivity({
            container,
            profile,
            settings,
            activityType,
            generateData,
            renderItem,
            handleAnswer,
            renderResults,
            savedState: null,
            onBack,
          });
        },
        onBack: () => {
          clearState();
          if (onBack) onBack();
        },
      });
    } else {
      // Иначе используем стандартную модалку результатов
      showResultsModal({
        correct: stats.correct,
        wrong: stats.wrong,
        total: stats.total,
        details: stats.details,
        onRetry: () => {
          clearState();
          startActivity({
            container,
            profile,
            settings,
            activityType,
            generateData,
            renderItem,
            handleAnswer,
            renderResults,
            savedState: null,
            onBack,
          });
        },
        onBack: () => {
          clearState();
          if (onBack) onBack();
        },
      });
    }
  }

  // --- Старт ---
  renderCurrentItem();

  // Возвращаем функции для внешнего управления (например, для принудительного завершения)
  return {
    stop: () => {
      stopSpeech();
      clearState();
    },
    restart: () => {
      stopSpeech();
      clearState();
      startActivity({
        container,
        profile,
        settings,
        activityType,
        generateData,
        renderItem,
        handleAnswer,
        renderResults,
        savedState: null,
        onBack,
      });
    },
  };
}