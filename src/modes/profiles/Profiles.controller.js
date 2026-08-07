import { renderProfiles } from './Profiles.view';
import { getState, setState } from '@state/store';
import { getActiveProfile } from '@state/actions';
import { toast } from '@utils/toast';

export function renderProfilesMode(container) {
  const state = getState();
  const profiles = state.profiles || [];
  const activeId = state.currentProfileId;

  renderProfiles(container, profiles, activeId, 
    // onSelect – переключение профиля
    (id) => {
      const profile = profiles.find(p => p.id === id);
      if (profile) {
        setState({ currentProfileId: id });
        toast('Профиль переключён');
        // Перерендерим только эту область (можно вызвать renderProfilesMode)
        renderProfilesMode(container);
      }
    },
    // onAdd – создание нового профиля
    () => {
      // Заглушка: пока просто alert
      alert('Создание профиля (будет реализовано)');
    },
    // onLongPress – редактирование/удаление/копирование
    (id) => {
      alert(`Долгий тап по профилю ${id} (редактирование)`);
    }
  );
}