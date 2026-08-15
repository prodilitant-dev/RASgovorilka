// src/components/Profile/ProfileSwitchModal.js
import { Modal } from '@components/common/Modal/Modal';
import { renderUniversalList } from '@components/common/Universal/UniversalList';
import { getState, setState } from '@state/store';
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

      // Загружаем данные
      loadAppData().then(appData => {
        data = appData;
        if (!data || !data.profiles) {
          listContainer.innerHTML = '<div class="text-muted p-4 text-center">Нет данных</div>';
          return;
        }

        const activeId = data.activeProfileId;
        const items = data.profiles.map(prof => ({
          id: prof.id,
          text: prof.name,
          emoji: prof.icon || '🧑',
          active: prof.id === activeId,
        }));

        const { element, cleanup: listCleanup } = renderUniversalList(listContainer, {
          items,
          onClick: (id) => {
            // Переключение профиля
            const profile = data.profiles.find(p => p.id === id);
            if (!profile) return;
            data.activeProfileId = id;
            saveAppData(data).then(() => {
              setState({ 
                currentProfileId: id,
                profiles: data.profiles, // ✅ добавить
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

        cleanup = listCleanup;
      });

      return wrap;
    },
    buttons: [
      { label: 'Закрыть', action: () => modal.close() }
    ],
    onClose: () => {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    }
  });

  modal.open();
}