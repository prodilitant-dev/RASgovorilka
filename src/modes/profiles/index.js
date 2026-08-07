// src/modes/profiles/index.js
import { renderMainLayout } from '@components/common/Layout/MainLayout';
import { renderProfileList } from '@components/Profile/ProfileList';
import { openProfileEditor } from '@components/Profile/ProfileEditorModal';
import { getState, setState } from '@state/store';
import { loadAppData, saveAppData, saveProfile, deleteProfile } from '@storage/appStorage';
import { createDefaultProfile } from '@config/defaultData';
import { toast } from '@utils/toast';
import { uid } from '@utils/id';
import { logger } from '@utils/logger';
import { createElement } from '@utils/dom';

export async function renderProfiles(container) {
  logger.debug('🔄 Rendering Profiles');
  const state = getState();
  const data = await loadAppData();
  if (!data) {
    logger.error('No data found in renderProfiles');
    return;
  }

  const profiles = data.profiles || [];
  const activeId = state.currentProfileId;
  logger.debug(`Profiles count: ${profiles.length}, activeId: ${activeId}`);

  // Создаём контент: контейнер для списка профилей
  const content = createElement('div', { className: 'grid-container full-height' });

  // Рендерим список профилей в content
  const { cleanup } = renderProfileList(
    content,
    profiles,
    activeId,
    // onProfileClick – создание/переключение
    async (id) => {
      if (id === null) {
        logger.info('Creating new profile');
        openProfileEditor(null, {
          onSave: async ({ name, icon }) => {
            const newProfile = createDefaultProfile(name, icon);
            data.profiles.push(newProfile);
            data.activeProfileId = newProfile.id;
            await saveAppData(data);
            setState({ currentProfileId: newProfile.id, profiles: data.profiles });
            toast('Профиль создан');
            logger.info(`Profile created: ${newProfile.id} (${name})`);
            renderProfiles(container);
          },
          onCancel: () => {}
        });
      } else {
        const profile = profiles.find(p => p.id === id);
        if (profile) {
          logger.info(`Switching to profile: ${id} (${profile.name})`);
          data.activeProfileId = id;
          await saveAppData(data);
          setState({ 
            currentProfileId: id,
            modeOrder: profile.modeOrder || [],
            hiddenModes: profile.hiddenModes || [],
          });
          toast('Профиль переключён');
          renderProfiles(container);
        }
      }
    },
    // onProfileLongPress
    (id) => {
      const profile = profiles.find(p => p.id === id);
      if (!profile) return;
      logger.info(`Editing profile: ${id}`);
      openProfileEditor(profile, {
        onSave: async ({ name, icon }) => {
          profile.name = name;
          profile.icon = icon;
          await saveProfile(profile);
          toast('Профиль обновлён');
          logger.info(`Profile updated: ${id} -> ${name}`);
          renderProfiles(container);
        },
        onDelete: async (idToDelete) => {
          if (profiles.length <= 1) {
            toast('Нельзя удалить единственный профиль', 'error');
            logger.warn('Attempted to delete last profile');
            return;
          }
          await deleteProfile(idToDelete);
          const updatedData = await loadAppData();
          if (updatedData.activeProfileId === idToDelete) {
            const newActive = updatedData.profiles.find(p => p.id !== idToDelete);
            if (newActive) {
              updatedData.activeProfileId = newActive.id;
              setState({ currentProfileId: newActive.id });
              logger.info(`Active profile changed to ${newActive.id}`);
            }
          }
          await saveAppData(updatedData);
          toast('Профиль удалён');
          logger.info(`Profile deleted: ${idToDelete}`);
          renderProfiles(container);
        },
        onCopy: async (sourceProfile) => {
          const newProfile = {
            ...sourceProfile,
            id: uid(),
            name: sourceProfile.name + ' (копия)',
          };
          data.profiles.push(newProfile);
          await saveAppData(data);
          toast('Профиль скопирован');
          logger.info(`Profile copied: ${sourceProfile.id} -> ${newProfile.id}`);
          renderProfiles(container);
        },
        onCancel: () => {}
      });
    }
  );

  // Сохраняем cleanup для возможного удаления обработчиков при перерендере
  container._cleanup = cleanup;

  // Оборачиваем контент в единую структуру main-area (без нижней панели)
  renderMainLayout(container, { content, bottomPanel: null });
  logger.debug('✅ Profiles rendered');
}