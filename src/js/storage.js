const KEY = 'silksongChecklistProgress_v1';

export function loadProgress(currentIds) {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!raw || typeof raw !== 'object' || !raw.items) throw new Error('invalid stored');
    const progress = {};
    for (const id of currentIds) progress[id] = !!raw.items[id];
    return progress;
  } catch (e) {
    console.warn('[STORAGE] Reset progress due to', e.message);
    const progress = {}; 
    currentIds.forEach(id => progress[id] = false); 
    return progress;
  }
}

export function saveProgress(progress) {
  localStorage.setItem(KEY, JSON.stringify({ items: progress }));
}

export function clearProgress() {
  localStorage.removeItem(KEY);
}
