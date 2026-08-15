// src/modes/schedule/Schedule.utils.js
export function getDateByOffset(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date;
}

export function formatDateKey(date) {
  return date.toISOString().slice(0, 10);
}

export function getEventsForDate(profile, date) {
  const dayOfWeek = date.getDay();
  const dateKey = formatDateKey(date);
  const templateId = profile.scheduleDayMapping?.[dayOfWeek];
  if (!templateId) return [];
  const template = profile.scheduleTemplates.find(t => t.id === templateId);
  if (!template) return [];
  const completed = profile.scheduleDailyState?.[dateKey]?.completed || [];
  return template.events.map(event => ({
    ...event,
    done: completed.includes(event.id),
  }));
}

export function getTemplateForDay(profile, dayOfWeek) {
  const templateId = profile.scheduleDayMapping?.[dayOfWeek];
  if (!templateId) return null;
  return profile.scheduleTemplates.find(t => t.id === templateId) || null;
}