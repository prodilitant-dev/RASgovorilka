// src/modes/common/activities/ActivityController.js
import { getState, setState } from '@state/store';
import { logger } from '@utils/logger';
import { speak, stopSpeech } from '@utils/speech';
import { showResultsModal } from './ResultsModal';

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

  let items = [];
  let answeredCount = 0;      // сколько вопросов уже отвечено
  let correctCount = 0;
  let wrongCount = 0;
  let details = [];
  let isProcessing = false;
  let advanceTimer = null;

  if (savedState && savedState.type === activityType) {
    items = savedState.items || [];
    answeredCount = savedState.currentIndex || 0; // читаем старое поле
    correctCount = savedState.correctCount || 0;
    wrongCount = savedState.wrongCount || 0;
    details = savedState.details || [];
    logger.debug(`Restored state: ${items.length} items, answered ${answeredCount}`);
  } else {
    items = generateData(profile, settings);
    if (!items || items.length === 0) {
      container.innerHTML = '<div style="padding:20px;text-align:center;">Нет данных для активности</div>';
      logger.warn('No items generated');
      return null;
    }
    saveState();
  }

  function saveState() {
    setState({
      activityState: {
        type: activityType,
        items,
        currentIndex: answeredCount, // пишем под старым именем для совместимости
        correctCount,
        wrongCount,
        details,
        settings,
      },
    });
  }

  function clearState() {
    setState({ activityState: null });
  }

  function clearAdvanceTimer() {
    if (advanceTimer) {
      clearTimeout(advanceTimer);
      advanceTimer = null;
    }
  }

  async function speakFeedback(message) {
    const state = getState();
    const voiceSettings = state.voiceSettings || { rate: 1, pitch: 1, voiceURI: '' };
    await speak(message, voiceSettings.rate, voiceSettings.pitch, voiceSettings.voiceURI);
  }

  function renderCurrentItem() {
    if (answeredCount >= items.length) {
      clearState();
      showResults();
      return;
    }

    const item = items[answeredCount];
    const onAnswer = (answer) => {
      if (isProcessing) return;
      isProcessing = true;
      processAnswer(answer, item);
    };

    renderItem(container, item, answeredCount + 1, items.length, onAnswer);
  }

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

    details.push({ ...detail, correct: isCorrect });

    // ⚠️ Увеличиваем счётчик СРАЗУ, до saveState.
    // Если пользователь уйдёт в течение 1200 мс — состояние сохранится корректно.
    answeredCount++;
    saveState();

    // Показываем feedback. Номер вопроса = answeredCount
    // (тот, на который только что ответили).
    renderItem(
      container,
      item,
      answeredCount,
      items.length,
      null,
      feedback,
      isCorrect,
      detail.userAnswer
    );

    await speakFeedback(feedback);

    clearAdvanceTimer();
    advanceTimer = setTimeout(() => {
      advanceTimer = null;
      isProcessing = false;
      renderCurrentItem();
    }, 1200);
  }

  function showResults() {
    const stats = {
      correct: correctCount,
      wrong: wrongCount,
      total: items.length,
      details,
    };

    if (renderResults) {
      renderResults(container, stats, {
        onRetry: () => {
          clearState();
          startActivity({
            container, profile, settings, activityType,
            generateData, renderItem, handleAnswer, renderResults,
            savedState: null, onBack,
          });
        },
        onBack: () => {
          clearState();
          if (onBack) onBack();
        },
      });
    } else {
      showResultsModal({
        correct: stats.correct,
        wrong: stats.wrong,
        total: stats.total,
        details: stats.details,
        onRetry: () => {
          clearState();
          startActivity({
            container, profile, settings, activityType,
            generateData, renderItem, handleAnswer, renderResults,
            savedState: null, onBack,
          });
        },
        onBack: () => {
          clearState();
          if (onBack) onBack();
        },
      });
    }
  }

  renderCurrentItem();

  return {
    stop: () => {
      clearAdvanceTimer();
      stopSpeech();
      clearState();
    },
    pause: () => {
      clearAdvanceTimer();
      stopSpeech();
    },
    restart: () => {
      clearAdvanceTimer();
      stopSpeech();
      clearState();
      startActivity({
        container, profile, settings, activityType,
        generateData, renderItem, handleAnswer, renderResults,
        savedState: null, onBack,
      });
    },
  };
}