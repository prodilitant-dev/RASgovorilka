import { toast } from '../toast';
import { saveProfile } from '@storage/appStorage';
import { logger } from '../logger';

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
        // Обновляем состояние, если нужно
        import('@state/store').then(({ setState }) => {
          setState({ profiles: [profile] }); // или более корректно обновить профиль в store
        });
        renderMenuFn(container, onComplete);
      } else {
        toast('Ошибка сохранения настроек', 'error');
        logger.error('saveProfile returned false');
      }
    });
  });
}