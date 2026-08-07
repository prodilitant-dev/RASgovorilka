import { renderUniversalList } from '../common/Universal/UniversalList';

export function renderProfileList(container, profiles, activeId, onProfileClick, onProfileLongPress) {
  const items = profiles.map(p => ({
    id: p.id,
    text: p.name,
    emoji: p.icon || '🧑',
    active: p.id === activeId,
  }));

  return renderUniversalList(container, {
    items,
    onClick: (id) => {
      // Для обычных карточек (не add) вызываем onProfileClick
      if (id !== 'add') {
        onProfileClick(id);
      }
    },
    onLongPress: onProfileLongPress,
    allowAdd: true,
    onAdd: () => onProfileClick(null), // отдельно для добавления
    emptyText: 'Нет профилей. Создайте первый!',
    layout: 'grid',
    cardOptions: {},
  });
}