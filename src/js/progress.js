export function computePercent(items, progress) {
  // Ahora ignoramos ítems opcionales (flag optional=true) y peso 0 para el porcentaje oficial
  let completedCount = 0;      // cuenta de ítems (solo core) completados
  let totalCount = 0;          // total de ítems core
  let completedWeight = 0;     // peso completado core
  let totalWeight = 0;         // peso total core
  let optionalCompleted = 0;   // ítems opcionales marcados
  let optionalTotal = 0;       // total ítems opcionales

  for (const it of items) {
    const isOptional = !!it.optional || (it.weight === 0); // criterio de opcionalidad
    const w = (typeof it.weight === 'number' && it.weight > 0) ? it.weight : 1; // default peso 1 para core
    if (isOptional) {
      optionalTotal++;
      if (progress[it.id]) optionalCompleted++;
      continue; // no suma al core
    }
    totalCount++;
    totalWeight += w;
    if (progress[it.id]) {
      completedCount++;
      completedWeight += w;
    }
  }
  const rawPercent = (completedWeight / (totalWeight || 1)) * 100;
  const percent = Math.min(100, Math.floor(rawPercent + 1e-6));
  return {
    completed: completedCount,
    total: totalCount,
    completedCount,
    totalCount,
    completedWeight,
    totalWeight,
    percent,
    optionalCompleted,
    optionalTotal
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
