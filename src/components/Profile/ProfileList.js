import { renderUniversalList } from '../common/Universal/UniversalList';

export function renderProfileList(
  container,
  profiles,
  activeId,
  onProfileClick,
  onProfileLongPress
) {
  const items = profiles.map((p) => ({
    id: p.id,
    text: p.name,
    emoji: p.icon || '',
    imageId: p.imageId || null,
    imagePath: p.imagePath || null,
    active: p.id === activeId,
  }));

  return renderUniversalList(container, {
    items,
    onClick: (id) => {
      if (id !== 'add') {
        onProfileClick(id);
      }
    },
    onLongPress: onProfileLongPress,
    allowAdd: true,
    onAdd: () => onProfileClick(null),
    emptyText: 'Нет профилей. Создайте первый!',
    layout: 'grid',
    cardOptions: {},
  });
}
