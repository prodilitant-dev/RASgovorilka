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
  if (container._cleanup) {
    container._cleanup();
    container._cleanup = null;
  }

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

  const content = createElement('div', { className: 'grid-container full-height' });

  const { cleanup } = renderProfileList(
    content,
    profiles,
    activeId,
    async (id) => {
      if (id === null) {
        logger.info('Creating new profile');
        openProfileEditor(null, {
          onSave: async ({ name, icon }, done) => {
            const newProfile = createDefaultProfile(name, icon);
            data.profiles.push(newProfile);
            data.activeProfileId = newProfile.id;
            await saveAppData(data);
            setState({
              currentProfileId: newProfile.id,
              profiles: data.profiles,
              modeOrder: newProfile.modeOrder || [],
              hiddenModes: newProfile.hiddenModes || [],
            });
            toast('Профиль создан');
            renderProfiles(container);
            done();
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
            profiles: data.profiles,
            modeOrder: profile.modeOrder || [],
            hiddenModes: profile.hiddenModes || [],
          });
          toast('Профиль переключён');
          renderProfiles(container);
        }
      }
    },
    (id) => {
      const profile = profiles.find(p => p.id === id);
      if (!profile) return;
      logger.info(`Editing profile: ${id}`);
      openProfileEditor(profile, {
        onSave: async ({ name, icon }, done) => {
          profile.name = name;
          profile.icon = icon;
          await saveProfile(profile);
          if (profile.id === getState().currentProfileId) {
            setState({
              modeOrder: profile.modeOrder || [],
              hiddenModes: profile.hiddenModes || [],
            });
          }
          toast('Профиль обновлён');
          renderProfiles(container);
          done();
        },
        onDelete: async (idToDelete, done) => {
          if (profiles.length <= 1) {
            toast('Нельзя удалить единственный профиль', 'error');
            done();
            return;
          }
          await deleteProfile(idToDelete);
          const updatedData = await loadAppData();
          if (updatedData.activeProfileId === idToDelete) {
            const newActive = updatedData.profiles.find(p => p.id !== idToDelete);
            if (newActive) {
              updatedData.activeProfileId = newActive.id;
              setState({
                currentProfileId: newActive.id,
                profiles: updatedData.profiles,
                modeOrder: newActive.modeOrder || [],
                hiddenModes: newActive.hiddenModes || [],
              });
              logger.info(`Active profile changed to ${newActive.id}`);
            }
          }
          await saveAppData(updatedData);
          toast('Профиль удалён');
          renderProfiles(container);
          done();
        },
        onCopy: async (sourceProfile, done) => {
          const newProfile = JSON.parse(JSON.stringify(sourceProfile));
          newProfile.id = uid();
          newProfile.name = sourceProfile.name + ' (копия)';
          data.profiles.push(newProfile);
          await saveAppData(data);
          toast('Профиль скопирован');
          renderProfiles(container);
          done();
        },
        onCancel: () => {}
      });
    }
  );

  container._cleanup = cleanup;
  renderMainLayout(container, { content, bottomPanel: null });
  logger.debug('✅ Profiles rendered');
}