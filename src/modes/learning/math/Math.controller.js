// src/modes/learning/math/Math.controller.js
import { startActivity } from '@modes/common/activities';
import { generateMathQuestions } from './Math.logic';
import { renderMathGame } from './Math.view';

export function startMath(container, profile, settings, onBack, savedState) {
  startActivity({
    container,
    profile,
    settings,
    activityType: 'math',
    generateData: (prof, set) => generateMathQuestions(set),
    renderItem: (container, question, current, total, onAnswer, feedback, isCorrect, userAnswer) => {
      renderMathGame(container, {
        question,
        current,
        total,
        onAnswer,
        feedback,
        isCorrect,
        userAnswer,
        inputMethod: settings.inputMethod || 'drag',
      });
    },
    handleAnswer: (answer, question) => {
      const correct = answer === question.answer;
      return {
        correct,
        feedback: correct ? 'Верно!' : `Не верно, ответ: ${question.answer}`,
        details: {
          question: `${question.a} ${question.operator} ${question.b} = ?`,
          userAnswer: String(answer),
          correctAnswer: String(question.answer),
        },
      };
    },
    savedState,
    onBack,
  });
}