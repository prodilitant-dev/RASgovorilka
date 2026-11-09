// src/config/mascotPool.js
import iconList from 'virtual:icons-manifest';

export const MASCOT_POOL = iconList;

export function getRandomMascotUrl() {
  if (!MASCOT_POOL || MASCOT_POOL.length === 0) return '';

  const name = MASCOT_POOL[Math.floor(Math.random() * MASCOT_POOL.length)];
  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;

  return `${prefix}icons/${name}.webp`;
}
