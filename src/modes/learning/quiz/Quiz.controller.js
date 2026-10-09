// src/modes/learning/quiz/Quiz.controller.js
import { startActivity } from '@modes/common/activities';
import { generateQuizQuestions } from './Quiz.logic';
import { renderQuizQuestion } from './Quiz.view';

export function startQuiz(container, profile, settings, onBack, savedState) {
  return startActivity({
    container,
    profile,
    settings,
    activityType: 'quiz',
    generateData: (prof, set) => generateQuizQuestions(prof, set),
    renderItem: (container, question, current, total, onAnswer, feedback, isCorrect, userAnswer) => {
      renderQuizQuestion(container, {
        question,
        current,
        total,
        onAnswer,
        feedback,
        isCorrect,
        userAnswer,
        mode: settings.mode || 'image_to_word',
      });
    },
    handleAnswer: (answer, question) => {
      const correct = answer === question.correctId;
      const userAnswerText = question.options.find(o => o.id === answer)?.text || '—';
      return {
        correct,
        feedback: correct ? 'Верно!' : `Не верно, это: ${question.correctAnswerText}`,
        details: {
          question: question.card.text,
          userAnswer: userAnswerText,
          correctAnswer: question.correctAnswerText,
        },
      };
    },
    savedState,
    onBack,
  });
}