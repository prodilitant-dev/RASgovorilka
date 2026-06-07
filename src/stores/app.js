import { defineStore } from 'pinia';
import { useStorage } from '@/composables/useStorage';
import { useData } from '@/composables/useData';

export const useAppStore = defineStore('app', {
  state: () => ({
    data: {
      categories: [],
      cards: {},
      quickButtons: [],
      yesnoAnswers: [],
      visibleModes: { say: true, yesno: true, text: true, timer: true, whatisthis: false, math: false },
      highContrast: false,
      maxSentenceLength: 15,
      greetingText: "Привет",
      greetingEnabled: true,
      timerMinutes: 1,
      timerPhrase: "Время вышло",
      fullscreenEnabled: false,
      whatIsThisCategoryIds: [],
      whatIsThisShowLabels: false,
      math: {
        maxNumber: 10,
        operations: ['+', '-']
      }
    },
    currentMode: 'say',
    currentCategoryId: null,
    sentence: [],
    isSettingsOpen: false,
    _loaded: false
  }),
  getters: {
    currentCards: (state) => state.data.cards[state.currentCategoryId] || [],
    activeCategories: (state) => state.data.categories,
    isLoaded: (state) => state._loaded,
    whatIsThisCategories: (state) => {
      const ids = state.data.whatIsThisCategoryIds;
      if (!ids || ids.length === 0) return state.data.categories;
      return state.data.categories.filter(c => ids.includes(c.id));
    },
    allWhatIsThisCards: (state) => {
      const cats = state.whatIsThisCategories;
      let cards = [];
      cats.forEach(cat => {
        if (state.data.cards[cat.id]) {
          cards = cards.concat(state.data.cards[cat.id]);
        }
      });
      return cards;
    }
  },
  actions: {
    async init() {
      if (this._loaded) return;
      const { load } = useStorage();
      const saved = await load();
      if (saved && saved.categories && saved.categories.length > 0) {
        this.data = { ...this.data, ...saved };
        if (!this.data.visibleModes) this.data.visibleModes = { say: true, yesno: true, text: true, timer: true, whatisthis: false, math: false };
        if (!this.data.whatIsThisCategoryIds) this.data.whatIsThisCategoryIds = [];
        if (!this.data.whatIsThisShowLabels) this.data.whatIsThisShowLabels = false;
        if (!this.data.math) this.data.math = { maxNumber: 10, operations: ['+', '-'] };
      } else {
        const { getDefaultData } = useData();
        this.data = getDefaultData();
        this.data.whatIsThisCategoryIds = [];
        this.data.whatIsThisShowLabels = false;
        this.data.math = { maxNumber: 10, operations: ['+', '-'] };
        await this.save();
      }
      if (!this.currentCategoryId && this.data.categories.length > 0) {
        this.currentCategoryId = this.data.categories[0].id;
      }
      this._loaded = true;
    },
    async save() {
      const { save } = useStorage();
      await save(JSON.parse(JSON.stringify(this.data)));
    },
    setMode(mode) {
      this.currentMode = mode;
      this.sentence = [];
    },
    setCategory(catId) {
      this.currentCategoryId = catId;
    },
    addToSentence(card) {
      if (this.sentence.length < this.data.maxSentenceLength) {
        this.sentence.push({ ...card });
      }
    },
    removeFromSentence(index) {
      this.sentence.splice(index, 1);
    },
    clearSentence() {
      this.sentence = [];
    },
    toggleFullscreen(enable) {
      this.data.fullscreenEnabled = enable;
      this.save();
    }
  }
});
