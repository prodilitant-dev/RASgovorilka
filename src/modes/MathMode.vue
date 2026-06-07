<template>
  <div class="math-mode" v-if="store.isLoaded">
    <div v-if="noOperations" class="empty">
      <p>Выберите хотя бы одну операцию в настройках.</p>
    </div>
    <div v-else-if="!currentProblem" class="empty">
      <p>Нажмите «Начать», чтобы сгенерировать пример.</p>
      <button class="btn" @click="generateProblem">Начать</button>
    </div>
    <template v-else>
      <div class="problem-display">
        <span class="big-expression">{{ currentProblem.expression }}</span>
        <span class="equals">= ?</span>
      </div>
      <div class="input-area">
        <input
          v-model="userAnswer"
          type="number"
          placeholder="Ответ"
          :disabled="result !== null"
          @keyup.enter="handleAnswer"
          ref="inputEl"
        />
        <button class="btn" @click="handleAnswer" :disabled="result !== null">Проверить</button>
        <button class="btn-outline" @click="nextProblem" :disabled="result !== null">Пропустить</button>
      </div>
      <div v-if="result !== null" class="feedback">
        <div v-if="result === 'correct'" class="correct">✅ Правильно!</div>
        <div v-else class="wrong">
          ❌ Неправильно. Правильный ответ: <strong>{{ currentProblem.answer }}</strong>
        </div>
        <button class="btn" @click="nextProblem">Далее</button>
      </div>
    </template>
  </div>
  <div v-else class="loading">Загрузка...</div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useAppStore } from '@/stores/app';
import { useSpeech } from '@/composables/useSpeech';

const store = useAppStore();
const { speak } = useSpeech();
const inputEl = ref(null);

const currentProblem = ref(null);
const userAnswer = ref('');
const result = ref(null);

const noOperations = computed(() => store.data.math.operations.length === 0);

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
    b = Math.floor(Math.random() * (a + 1));
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

function handleAnswer() {
  if (userAnswer.value === '') return;
  const user = parseInt(userAnswer.value, 10);
  if (isNaN(user)) {
    result.value = null;
    return;
  }
  if (user === currentProblem.value.answer) {
    result.value = 'correct';
    speak('Правильно!');
  } else {
    result.value = 'wrong';
    speak('Попробуй ещё раз');
  }
}

function nextProblem() {
  generateProblem();
}

watch([() => store.currentMode, () => store.isLoaded], ([mode, loaded]) => {
  if (loaded && mode === 'math' && !noOperations.value && !currentProblem.value) {
    generateProblem();
    nextTick(() => inputEl.value?.focus());
  }
}, { immediate: true });

watch(currentProblem, () => {
  nextTick(() => inputEl.value?.focus());
});
</script>

<style scoped>
.math-mode {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  height: 100%;
  justify-content: center;
  color: var(--text-main, #1a1a1a);
}
.loading {
  text-align: center;
  font-size: 24px;
  padding-top: 40px;
}
.empty {
  text-align: center;
  font-size: 24px;
}
.problem-display {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 64px;
  font-weight: bold;
}
.big-expression {
  color: var(--text-main);
}
.equals {
  color: var(--accent);
}
.input-area {
  display: flex;
  gap: 10px;
  align-items: center;
}
.input-area input {
  padding: 10px;
  font-size: 20px;
  border-radius: 10px;
  border: 2px solid var(--accent);
  width: 150px;
  outline: none;
  background: var(--bg-card, #fff);
  color: var(--text-main, #1a1a1a);
}
.feedback {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 24px;
}
.correct { color: green; }
.wrong { color: red; }
.btn {
  border: none;
  padding: 10px 20px;
  border-radius: 40px;
  font-weight: bold;
  cursor: pointer;
  background: var(--accent);
  color: #000;
}
.btn-outline {
  background: transparent;
  border: 1px solid var(--accent);
  color: var(--accent);
  padding: 10px 20px;
  border-radius: 40px;
  font-weight: bold;
  cursor: pointer;
}
</style>
