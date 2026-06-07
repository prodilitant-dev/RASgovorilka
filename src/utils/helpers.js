export function uid() {
  return Date.now() + '-' + Math.random().toString(36).substr(2, 6);
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
