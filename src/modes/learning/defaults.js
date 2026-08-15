// src/modes/learning/defaults.js
export function getDefaultQuizSettings(profile) {
  return {
    categoryIds: profile.categories.map(c => c.id),
    numQuestions: 5,
    numOptions: 4,
    mode: 'image_to_word'
  };
}

export function getDefaultGuessSettings(profile) {
  return {
    categoryIds: profile.categories.map(c => c.id),
    numQuestions: 5
  };
}

export function getDefaultSortingSettings(profile) {
  const categoryIds = profile.categories.map(c => c.id);
  return {
    categoryIds: categoryIds.slice(0, Math.min(categoryIds.length, 4)),
    numCards: 8
  };
}

export function getDefaultMathSettings(profile) {
  return {
    operations: ['add', 'sub'],
    maxNumber: 20,
    numQuestions: 5,
    numOptions: 4,
    inputMethod: 'drag'
  };
}