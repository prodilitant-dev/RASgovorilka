// src/components/Profile/ProfileSwitchModal.js
import { Modal } from '@components/common/Modal/Modal';
import { renderUniversalList } from '@components/common/Universal/UniversalList';
import { setState } from '@state/store';
import { loadAppData, saveAppData } from '@storage/appStorage';
import { toast } from '@utils/toast';
import { logger } from '@utils/logger';

export function openProfileSwitchModal(onProfileSwitched) {
  let data = null;
  let cleanup = null;

  const modal = new Modal({
    title: 'Выберите профиль',
    body: () => {
      const wrap = document.createElement('div');
      const listContainer = document.createElement('div');
      wrap.appendChild(listContainer);

      loadAppData().then((appData) => {
        data = appData;

        if (!data || !Array.isArray(data.profiles)) {
          logger.warn('ProfileSwitchModal: нет данных о профилях');
          const empty = document.createElement('div');
          empty.className = 'text-muted p-4 text-center';
          empty.textContent = 'Нет данных';
          listContainer.appendChild(empty);
          return;
        }

        const activeId = data.activeProfileId;

        const items = data.profiles.map((prof) => ({
          id: prof.id,
          text: prof.name,
          emoji: prof.icon || '',
          imageId: prof.imageId || null,
          active: prof.id === activeId,
        }));

        logger.debug(`ProfileSwitchModal: ${items.length} профилей`);

        const result = renderUniversalList(listContainer, {
          items,
          onClick: (id) => {
            const profile = data.profiles.find((p) => p.id === id);
            if (!profile) return;
            data.activeProfileId = id;
            saveAppData(data).then(() => {
              setState({
                currentProfileId: id,
                profiles: data.profiles,
                modeOrder: profile.modeOrder || [],
                hiddenModes: profile.hiddenModes || [],
              });
              toast('Профиль переключён');
              modal.close();
              if (onProfileSwitched) onProfileSwitched(id);
            });
          },
          allowAdd: true,
          emptyText: 'Нет профилей',
          layout: 'grid',
        });

        if (result && result.cleanup) {
          cleanup = result.cleanup;
        }
      });

      return wrap;
    },
    buttons: [],
    onClose: () => {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    },
  });

  modal.open();
}