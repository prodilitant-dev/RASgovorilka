// src/modes/learning/math/Math.logic.js
import { shuffle } from '@utils/array';

export function generateMathQuestions(settings) {
  const { operations, maxNumber, numQuestions, numOptions } = settings;
  if (operations.length === 0) return [];

  const questions = [];
  for (let i = 0; i < numQuestions; i++) {
    const op = operations[Math.floor(Math.random() * operations.length)];
    let a, b, answer;
    switch (op) {
      case 'add':
        a = randInt(1, maxNumber);
        b = randInt(1, maxNumber - a);
        answer = a + b;
        break;
      case 'sub':
        a = randInt(1, maxNumber);
        b = randInt(1, a);
        answer = a - b;
        break;
      case 'mul':
        a = randInt(1, Math.floor(maxNumber / 2));
        b = randInt(1, Math.floor(maxNumber / a));
        answer = a * b;
        break;
      case 'div':
        b = randInt(1, Math.floor(maxNumber / 2));
        answer = randInt(1, Math.floor(maxNumber / b));
        a = b * answer;
        break;
      default: continue;
    }

    let options = [answer];
    let attempts = 0;
    while (options.length < numOptions && attempts < 100) {
      const offset = randInt(1, Math.max(3, Math.floor(maxNumber / 2)));
      const candidate = answer + (Math.random() > 0.5 ? offset : -offset);
      if (candidate >= 0 && !options.includes(candidate)) {
        options.push(candidate);
      }
      attempts++;
    }
    while (options.length < numOptions) {
      const candidate = randInt(0, maxNumber * 2);
      if (!options.includes(candidate)) options.push(candidate);
    }
    options = shuffle(options);

    const opSymbol = op === 'add' ? '+' : op === 'sub' ? '-' : op === 'mul' ? '×' : '÷';
    questions.push({ a, b, operator: opSymbol, answer, options });
  }
  return questions;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}