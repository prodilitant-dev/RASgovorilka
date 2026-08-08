import { loadAppData, saveAppData } from '@storage/appStorage';
import { getState, setState } from './store';
import { createDefaultProfile } from '@config/defaultData';
import { logger } from '@utils/logger';

export async function loadInitialState() {
  logger.debug('Loading initial state');
  let data = await loadAppData();
  
  if (data) {
    setState({
      currentProfileId: data.activeProfileId || null,
      globalSettings: data.globalSettings || {
        autoInflect: true,
        voiceSettings: { rate: 1, pitch: 1, voiceURI: '' },
      },
      profiles: data.profiles || [],
    });

    const state = getState();
    const profile = state.profiles.find((p) => p.id === state.currentProfileId);
    if (profile) {
      setState({
        modeOrder: profile.modeOrder || [],
        hiddenModes: profile.hiddenModes || [],
      });
      logger.debug(`Loaded profile: ${profile.id} (${profile.name})`);
    }
  } else {
    logger.info('No data found, creating default profile');
    const defaultProfile = createDefaultProfile('Мой профиль', '🧑');
    const newData = {
      profiles: [defaultProfile],
      activeProfileId: defaultProfile.id,
      globalSettings: {
        autoInflect: true,
        voiceSettings: { rate: 1, pitch: 1, voiceURI: '' },
      },
      activityStates: {},
    };
    await saveAppData(newData);
    setState({
      profiles: newData.profiles,
      currentProfileId: newData.activeProfileId,
      globalSettings: newData.globalSettings,
      modeOrder: defaultProfile.modeOrder || [],
      hiddenModes: defaultProfile.hiddenModes || [],
    });
    logger.info(`Default profile created: ${defaultProfile.id}`);
  }
  logger.debug('Initial state loaded');
  return getState();
}

export async function savePersistentState() {
  logger.debug('Saving persistent state');
  const state = getState();
  const data = (await loadAppData()) || { profiles: [] };
  data.activeProfileId = state.currentProfileId;
  data.globalSettings = state.globalSettings;
  data.profiles = state.profiles;
  await saveAppData(data);
  logger.debug('Persistent state saved');
}

export function getActiveProfile() {
  const state = getState();
  const profile = state.profiles.find((p) => p.id === state.currentProfileId) || null;
  if (profile) {
    logger.debug(`getActiveProfile: ${profile.id} (${profile.name})`);
  } else {
    logger.warn('getActiveProfile: no active profile');
  }
  return profile;
}