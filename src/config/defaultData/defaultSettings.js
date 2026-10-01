// src/config/defaultData/defaultSettings.js

export const DEFAULT_LEARNING_SETTINGS = {
  quiz: {
    visible: true,
    categoryIds: [],
    numQuestions: 10,
    numOptions: 4,
    mode: 'image_to_word',
  },
  guess: {
    visible: true,
    categoryIds: [],
    numQuestions: 10,
  },
  sorting: {
    visible: true,
    categoryIds: [],
    numCards: 8,
  },
  math: {
    visible: true,
    operations: ['add', 'sub'],
    maxNumber: 20,
    numQuestions: 5,
    numOptions: 4,
    inputMethod: 'drag',
  },
};

export const DEFAULT_GAMES_SETTINGS = {
  memory: {
    visible: true,
    gridSize: 4,
    categoryIds: [],
  },
  fifteen: {
    visible: true,
    gridSize: 4,
  },
};