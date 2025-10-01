const KEY = 'silksongChecklistProgress_v1';
const KEY_UI = 'silksongChecklistUI_v1'; // UI state (collapsed categories)

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

// UI STATE: Collapsed categories
export function loadCollapsedCategories(){
  try{
    const raw = JSON.parse(localStorage.getItem(KEY_UI) || 'null');
    if(!raw || !Array.isArray(raw.collapsed)) return [];
    return raw.collapsed.filter(v=> typeof v === 'string');
  }catch{ return []; }
}

export function saveCollapsedCategories(list){
  try { 
    const unique = Array.from(new Set(list));
    localStorage.setItem(KEY_UI, JSON.stringify({ collapsed: unique }));
    // Debug (can be removed later)
  if(typeof console!=='undefined') console.log('[UI STATE] Saved collapsed categories', unique);
  } catch {}
}

export function clearUIState(){
  localStorage.removeItem(KEY_UI);
}
