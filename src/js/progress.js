export function computePercent(items, progress) {
  let completedCount = 0;
  let totalCount = items.length;
  let completedWeight = 0;
  let totalWeight = 0;
  for (const it of items) {
    const w = typeof it.weight === 'number' && it.weight > 0 ? it.weight : 1; // default weight 1
    totalWeight += w;
    if (progress[it.id]) {
      completedCount++;
      completedWeight += w;
    }
  }
  // Guard against floating point tiny errors (e.g., 99.999 -> 100)
  const rawPercent = (completedWeight / (totalWeight || 1)) * 100;
  const percent = Math.min(100, Math.floor(rawPercent + 1e-6));
  return {
    completed: completedCount,
    total: totalCount,
    completedCount,
    totalCount,
    completedWeight,
    totalWeight,
    percent
  };
}

export function toggle(id, progress) {
  // Initialize missing IDs as false (happens when new items are added)
  if (!(id in progress)) {
    progress[id] = false;
  }
  progress[id] = !progress[id];
  return true;
}
