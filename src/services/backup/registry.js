// src/services/backup/registry.js
import { uid } from '@utils/id';

export const EXPORT_COMPONENTS = {
  categories: {
    label: 'Категории и карточки',
    export: async (profile) => {
      const categories = profile.categories || [];
      const cards = profile.cards || {};
      const imageIds = new Set();
      Object.values(cards).forEach(arr => arr.forEach(c => c.imageId && imageIds.add(c.imageId)));
      return { data: { categories, cards }, imageIds };
    },
    import: async (profile, data, strategy) => {
      const importedCats = data.categories || [];
      const importedCards = data.cards || {};
      if (strategy === 'overwrite') {
        profile.categories = importedCats.map(c => ({ ...c, id: uid() }));
        profile.cards = {};
        importedCats.forEach(cat => {
          const oldId = cat.id;
          const newCat = profile.categories.find(c => c.name === cat.name);
          if (newCat) {
            profile.cards[newCat.id] = (importedCards[oldId] || []).map(c => ({ ...c, id: uid() }));
          }
        });
      } else if (strategy === 'add') {
        importedCats.forEach(impCat => {
          const existing = profile.categories.find(c => c.name === impCat.name);
          if (!existing) {
            const newCat = { ...impCat, id: uid() };
            profile.categories.push(newCat);
            profile.cards[newCat.id] = (importedCards[impCat.id] || []).map(c => ({ ...c, id: uid() }));
          }
        });
      } else if (strategy === 'update') {
        importedCats.forEach(impCat => {
          const existing = profile.categories.find(c => c.name === impCat.name);
          if (existing) {
            profile.cards[existing.id] = (importedCards[impCat.id] || []).map(c => ({ ...c, id: uid() }));
          } else {
            const newCat = { ...impCat, id: uid() };
            profile.categories.push(newCat);
            profile.cards[newCat.id] = (importedCards[impCat.id] || []).map(c => ({ ...c, id: uid() }));
          }
        });
      }
    }
  },

  quick: {
    label: 'Быстрые кнопки',
    export: async (profile) => {
      const data = profile.quickButtons || [];
      const imageIds = new Set(data.filter(b => b.imageId).map(b => b.imageId));
      return { data, imageIds };
    },
    import: async (profile, data, strategy) => {
      const imported = data || [];
      if (strategy === 'overwrite' || strategy === 'update') {
        profile.quickButtons = imported.map(b => ({ ...b, id: uid() }));
      } else if (strategy === 'add') {
        profile.quickButtons.push(...imported.map(b => ({ ...b, id: uid() })));
      }
    }
  },

  yesno: {
    label: 'Да / Нет',
    export: async (profile) => {
      const data = profile.yesnoButtons || [];
      const imageIds = new Set(data.filter(b => b.imageId).map(b => b.imageId));
      return { data, imageIds };
    },
    import: async (profile, data, strategy) => {
      const imported = data || [];
      if (strategy === 'overwrite' || strategy === 'update') {
        profile.yesnoButtons = imported.map(b => ({ ...b, id: uid() }));
      } else if (strategy === 'add') {
        profile.yesnoButtons.push(...imported.map(b => ({ ...b, id: uid() })));
      }
    }
  },

  schedule: {
    label: 'Расписание',
    export: async (profile) => {
      const data = {
        templates: profile.scheduleTemplates || [],
        dayMapping: profile.scheduleDayMapping || {},
        dailyState: profile.scheduleDailyState || {}
      };
      const imageIds = new Set();
      data.templates.forEach(t => t.events.forEach(e => e.imageId && imageIds.add(e.imageId)));
      return { data, imageIds };
    },
    import: async (profile, data, strategy) => {
      const { templates, dayMapping, dailyState } = data;
      if (strategy === 'overwrite') {
        profile.scheduleTemplates = templates.map(t => ({
          ...t,
          id: uid(),
          events: t.events.map(e => ({ ...e, id: uid() }))
        }));
        profile.scheduleDayMapping = dayMapping;
        profile.scheduleDailyState = dailyState;
      } else if (strategy === 'add') {
        templates.forEach(t => {
          const exists = profile.scheduleTemplates.some(ex => ex.name === t.name);
          if (!exists) {
            profile.scheduleTemplates.push({
              ...t,
              id: uid(),
              events: t.events.map(e => ({ ...e, id: uid() }))
            });
          }
        });
        for (const day in dayMapping) {
          if (!profile.scheduleDayMapping[day]) {
            profile.scheduleDayMapping[day] = dayMapping[day];
          }
        }
        for (const date in dailyState) {
          if (!profile.scheduleDailyState[date]) {
            profile.scheduleDailyState[date] = dailyState[date];
          }
        }
      } else if (strategy === 'update') {
        templates.forEach(t => {
          const existing = profile.scheduleTemplates.find(ex => ex.name === t.name);
          if (existing) {
            existing.events = t.events.map(e => ({ ...e, id: uid() }));
          } else {
            profile.scheduleTemplates.push({
              ...t,
              id: uid(),
              events: t.events.map(e => ({ ...e, id: uid() }))
            });
          }
        });
        profile.scheduleDayMapping = dayMapping;
        profile.scheduleDailyState = dailyState;
      }
    }
  },

  settings: {
    label: 'Настройки (полноэкран, автосклонение, скрытые режимы)',
    export: async (profile, globalData) => {
      return {
        data: {
          fullscreen: globalData.fullscreen || false,
          autoInflect: globalData.autoInflect !== undefined ? globalData.autoInflect : true,
          hiddenModes: profile.hiddenModes || []   // ← теперь берём из профиля
        },
        imageIds: new Set()
      };
    },
    import: async (profile, data, strategy, globalData) => {
      if (data.fullscreen !== undefined) globalData.fullscreen = data.fullscreen;
      if (data.autoInflect !== undefined) globalData.autoInflect = data.autoInflect;
      if (data.hiddenModes !== undefined) profile.hiddenModes = data.hiddenModes;
    }
  },

  gameSettings: {
    label: 'Настройки игр',
    export: async (profile) => {
      const data = profile.gamesSettings || {};
      return { data, imageIds: new Set() };
    },
    import: async (profile, data, strategy) => {
      if (strategy === 'overwrite' || strategy === 'update') {
        profile.gamesSettings = data;
      } else if (strategy === 'add') {
        const current = profile.gamesSettings || {};
        for (const key in data) {
          if (!(key in current)) current[key] = data[key];
        }
        profile.gamesSettings = current;
      }
    }
  },

  learningSettings: {
    label: 'Настройки обучения',
    export: async (profile) => {
      const data = profile.learningSettings || {};
      return { data, imageIds: new Set() };
    },
    import: async (profile, data, strategy) => {
      if (strategy === 'overwrite' || strategy === 'update') {
        profile.learningSettings = data;
      } else if (strategy === 'add') {
        const current = profile.learningSettings || {};
        for (const key in data) {
          if (!(key in current)) current[key] = data[key];
        }
        profile.learningSettings = current;
      }
    }
  }
};