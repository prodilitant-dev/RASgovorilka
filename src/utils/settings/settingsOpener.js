// src/utils/settings/settingsOpener.js
import { toast } from '../toast';
import { saveProfile } from '@storage/appStorage';
import { logger } from '../logger';
import { setState } from '@state/store';

export function openSettings({
  profile,
  settingsKey,
  settingsType,
  openSettingsFn,
  renderMenuFn,
  container,
  onComplete,
  successMessage
}) {
  if (!profile || !profile.id) {
    logger.error('openSettings: profile is invalid', profile);
    toast('Ошибка: профиль не найден', 'error');
    return;
  }

  openSettingsFn(profile, (newSettings) => {
    logger.debug('openSettings: saving new settings', { settingsKey, settingsType, newSettings });
    if (!profile[settingsType]) profile[settingsType] = {};
    profile[settingsType][settingsKey] = newSettings;

    saveProfile(profile).then((result) => {
      if (result) {
        toast(successMessage || 'Настройки сохранены');
        logger.debug('Settings saved successfully');
        // Обновляем состояние, чтобы другие части приложения узнали об изменениях
        setState({ profiles: [profile] }); // или более точно обновить в массиве
        renderMenuFn(container, onComplete);
      } else {
        toast('Ошибка сохранения настроек', 'error');
        logger.error('saveProfile returned false');
      }
    });
  });
}