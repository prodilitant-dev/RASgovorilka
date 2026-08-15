// src/modes/learning/guess/Guess.controller.js
import { startActivity } from '@modes/common/activities';
import { generateGuessQuestions } from './Guess.logic';
import { renderGuessQuestion } from './Guess.view';

export function startGuess(container, profile, settings, onBack, savedState) {
  startActivity({
    container,
    profile,
    settings,
    activityType: 'guess',
    generateData: (prof, set) => generateGuessQuestions(prof, set),
    renderItem: (container, question, current, total, onAnswer, feedback, isCorrect, userAnswer) => {
      renderGuessQuestion(container, {
        question,
        current,
        total,
        onAnswer,
        feedback,
        isCorrect,
        userAnswer,
      });
    },
    handleAnswer: (answer, question) => {
      const correct = answer.toLowerCase() === question.correctAnswer;
      return {
        correct,
        feedback: correct ? 'Верно!' : `Не верно, ответ: ${question.card.text}`,
        details: {
          question: question.card.text,
          userAnswer: answer || '—',
          correctAnswer: question.card.text,
        },
      };
    },
    savedState,
    onBack,
  });
}