import { ref, computed } from 'vue';
import { useAppStore } from '@/stores/app';

export function useMath() {
  const store = useAppStore();
  const currentProblem = ref(null);
  const userAnswer = ref('');
  const result = ref(null); // 'correct', 'wrong', null

  function generateProblem() {
    const ops = store.data.math.operations;
    if (ops.length === 0) {
      currentProblem.value = null;
      return;
    }
    const maxNum = store.data.math.maxNumber || 10;
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer, expression;

    if (op === '+') {
      a = Math.floor(Math.random() * maxNum);
      b = Math.floor(Math.random() * maxNum);
      answer = a + b;
      expression = `${a} + ${b}`;
    } else if (op === '-') {
      a = Math.floor(Math.random() * maxNum);
      b = Math.floor(Math.random() * (a + 1)); // чтобы a >= b, результат >= 0
      answer = a - b;
      expression = `${a} - ${b}`;
    } else if (op === '*') {
      a = Math.floor(Math.random() * maxNum) + 1;
      b = Math.floor(Math.random() * maxNum) + 1;
      answer = a * b;
      expression = `${a} × ${b}`;
    } else if (op === '/') {
      b = Math.floor(Math.random() * (maxNum - 1)) + 1;
      answer = Math.floor(Math.random() * maxNum) + 1;
      a = b * answer;
      expression = `${a} ÷ ${b}`;
    } else {
      a = Math.floor(Math.random() * maxNum);
      b = Math.floor(Math.random() * maxNum);
      answer = a + b;
      expression = `${a} + ${b}`;
    }

    currentProblem.value = { expression, answer };
    result.value = null;
    userAnswer.value = '';
  }

  function checkAnswer() {
    if (!currentProblem.value) return;
    const user = parseInt(userAnswer.value, 10);
    if (isNaN(user)) {
      result.value = null; // игнорируем
      return;
    }
    if (user === currentProblem.value.answer) {
      result.value = 'correct';
    } else {
      result.value = 'wrong';
    }
  }

  function nextProblem() {
    generateProblem();
  }

  return {
    currentProblem,
    userAnswer,
    result,
    generateProblem,
    checkAnswer,
    nextProblem
  };
}
