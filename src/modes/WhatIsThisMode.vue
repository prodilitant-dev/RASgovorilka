<template>
  <div class="what-is-this" v-if="store.isLoaded">
    <div v-if="quiz.totalCards === 0" class="empty">
      Нет карточек для викторины. Добавьте карточки в выбранные категории.
    </div>

    <template v-else-if="!quiz.isFinished">
      <div class="card-display">
        <div class="card-image">
          <img v-if="quiz.currentCard?.imageBase64" :src="quiz.currentCard.imageBase64" alt="карточка" />
          <span v-else class="big-emoji">{{ quiz.currentCard?.emoji || '❓' }}</span>
        </div>
        <div v-if="store.data.whatIsThisShowLabels" class="card-text-hint">
          {{ quiz.currentCard?.text }}
        </div>
      </div>

      <div class="input-area">
        <input
          v-model="quiz.userAnswer"
          type="text"
          placeholder="Что это?"
          :disabled="!!quiz.result"
          @keyup.enter="handleAnswer"
          ref="inputEl"
        />
        <button class="btn" @click="handleAnswer" :disabled="!!quiz.result">Ответить</button>
        <button class="btn-outline" @click="quiz.skip()" :disabled="!!quiz.result">Пропустить</button>
      </div>

      <div v-if="quiz.result" class="feedback">
        <div v-if="quiz.result === 'correct'" class="correct">✅ Правильно!</div>
        <div v-else class="wrong">
          ❌ Неправильно. Правильный ответ: <strong>{{ quiz.currentCard?.text }}</strong>
        </div>
        <button class="btn" @click="quiz.nextCard()">Далее</button>
      </div>
    </template>

    <div v-else class="finished">
      <h3>Викторина завершена!</h3>
      <button class="btn" @click="quiz.initRound()">Начать заново</button>
    </div>
  </div>
  <div v-else class="loading">Загрузка...</div>
</template>

<script setup>
import { watch, nextTick, ref } from 'vue';
import { useAppStore } from '@/stores/app';
import { useWhatIsThis } from '@/composables/useWhatIsThis';
import { useSpeech } from '@/composables/useSpeech';

const store = useAppStore();
const quiz = useWhatIsThis();
const { speak } = useSpeech();
const inputEl = ref(null);

watch(() => store.isLoaded, (loaded) => {
  if (loaded) {
    quiz.initRound();
    nextTick(() => inputEl.value?.focus());
  }
}, { immediate: true });

watch(() => quiz.currentCard, () => {
  nextTick(() => inputEl.value?.focus());
});

function handleAnswer() {
  if (!quiz.userAnswer.trim()) return;
  quiz.checkAnswer();
  if (quiz.result === 'correct') {
    speak('Правильно!');
  } else if (quiz.result === 'wrong') {
    speak('Попробуй ещё раз');
  }
}
</script>

<style scoped>
.what-is-this {
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
.empty, .finished {
  text-align: center;
  font-size: 24px;
}
.card-display {
  text-align: center;
}
.card-image img {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
}
.big-emoji {
  font-size: 128px;
}
.card-text-hint {
  font-size: 24px;
  margin-top: 10px;
  color: var(--accent, #4caf50);
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
  border: 2px solid var(--accent, #4caf50);
  width: 200px;
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
  background: var(--accent, #4caf50);
  color: #000;
}
.btn-outline {
  background: transparent;
  border: 1px solid var(--accent, #4caf50);
  color: var(--accent, #4caf50);
  padding: 10px 20px;
  border-radius: 40px;
  font-weight: bold;
  cursor: pointer;
}
</style>
