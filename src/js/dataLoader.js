export async function loadData() {
  const t0 = performance.now();
  // Switched to real (partial) Silksong dataset. Placeholder file retained for reference.
  const res = await fetch('./data/silksong_items.json');
  if (!res.ok) throw new Error('Failed to load dataset');
  const data = await res.json();
  const ids = new Set();
  let weightSum = 0;
  for (const it of data.items) {
    if (ids.has(it.id)) {
      console.error('[DATA] Duplicate id', it.id);
      throw new Error('Duplicate id ' + it.id);
    }
    ids.add(it.id);
    const w = typeof it.weight === 'number' && it.weight > 0 ? it.weight : 1;
    weightSum += w;
  }
  if (data.items.length === 0) throw new Error('Empty dataset');
  console.log(`[DATA] Loaded ${data.items.length} items (total weight=${weightSum}) in ${(performance.now()-t0).toFixed(1)}ms`);
  return data;
}
