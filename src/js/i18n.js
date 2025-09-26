const catalogs = {};
let current = 'en';

export async function setLocale(lc) {
  if (current === lc && catalogs[lc]) return;
  if (!catalogs[lc]) {
    const res = await fetch(`./src/i18n/${lc}.json`);
    if (!res.ok) throw new Error('i18n load failed');
    catalogs[lc] = await res.json();
  }
  current = lc;
}

export function t(key) {
  const cat = catalogs[current] || {};
  if (key in cat) return cat[key];
  if (current !== 'en' && catalogs['en'] && key in catalogs['en']) return catalogs['en'][key];
  return key;
}

export function activeLocale() { return current; }
