// src/components/Profile/ProfileList.js
import { renderUniversalList } from '../common/Universal/UniversalList';

export function renderProfileList(
  container,
  profiles,
  activeId,
  onProfileClick,
  onProfileLongPress
) {
  const items = profiles.map((p) => {
    const isActive = p.id === activeId;
    return {
      id: p.id,
      text: p.name,
      emoji: p.icon || '',
      imageId: p.imageId || null,
      imagePath: p.imagePath || null,
      active: isActive,
      // Цвет передаем ТОЛЬКО для активного профиля
      styleColor: isActive ? (p.styleColor || null) : null,
      className: 'profile-card',
    };
  });

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