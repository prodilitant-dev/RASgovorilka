let state = {
  currentProfileId: null,
  currentMode: 'say',
  previousMode: null,
  editingMode: false,
  currentCategoryId: null,
  sentenceWords: [],
  profiles: [],
  globalSettings: {
    autoInflect: true,
    voiceSettings: { rate: 1, pitch: 1, voiceURI: '' },
  },
  activityState: null,
};

const subscribers = [];

export function getState() {
  return state;
}

export function setState(updates) {
  const changed = {};
  for (const key in updates) {
    if (state[key] !== updates[key]) {
      state[key] = updates[key];
      changed[key] = updates[key];
    }
  }
  if (Object.keys(changed).length) {
    subscribers.forEach((cb) => cb(changed, state));
  }
  return changed;
}

export function subscribe(callback) {
  subscribers.push(callback);
  return () => {
    const idx = subscribers.indexOf(callback);
    if (idx !== -1) subscribers.splice(idx, 1);
  };
}