import { ref, computed, reactive } from 'vue';
import { useAppStore } from '@/stores/app';

export function useWhatIsThis() {
  const store = useAppStore();
  const shuffledCards = ref([]);
  const currentIndex = ref(0);
  const userAnswer = ref('');
  const result = ref(null);

  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function initRound() {
    const cards = store.allWhatIsThisCards;
    if (cards.length === 0) {
      shuffledCards.value = [];
      return;
    }
    shuffledCards.value = shuffleArray(cards);
    currentIndex.value = 0;
    result.value = null;
    userAnswer.value = '';
  }

  const state = reactive({
    shuffledCards,
    currentIndex,
    userAnswer,
    result,
    currentCard: computed(() => {
      if (shuffledCards.value.length === 0) return null;
      return shuffledCards.value[currentIndex.value] || null;
    }),
    isFinished: computed(() => {
      if (shuffledCards.value.length === 0) return true;
      return currentIndex.value >= shuffledCards.value.length;
    }),
    totalCards: computed(() => shuffledCards.value.length),
    remaining: computed(() => Math.max(0, shuffledCards.value.length - currentIndex.value)),
    initRound,
    checkAnswer() {
      if (!state.currentCard) return;
      const correctText = state.currentCard.text.trim().toLowerCase();
      const answer = userAnswer.value.trim().toLowerCase();
      result.value = (answer === correctText) ? 'correct' : 'wrong';
    },
    nextCard() {
      result.value = null;
      userAnswer.value = '';
      currentIndex.value++;
    },
    skip() {
      result.value = null;
      userAnswer.value = '';
      currentIndex.value++;
    }
  });

  return state;
}
