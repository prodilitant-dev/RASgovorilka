import { uid } from '@utils/id';

export function createDefaultProfile(name = 'Новый профиль', icon = '🧑') {
  return {
    id: uid(),
    name,
    icon,
    categories: [],
    cards: {},
    quickButtons: [],
    yesnoButtons: [],
    scheduleTemplates: [],
    scheduleDayMapping: {},
    scheduleDailyState: {},
    modeOrder: ['say', 'write', 'learning', 'games', 'yesno', 'schedule'],
    hiddenModes: [],
    learningSettings: {},
    gamesSettings: {},
  };
}