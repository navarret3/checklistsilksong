#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'data', 'silksong_items.json');
const INDEXED = path.join(ROOT, 'data', 'indexed.json');
const PLACEHOLDER_ICON = 'assets/images/placeholder-item.png';

function loadJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

function normalizeName(n) {
  return n.toLowerCase().replace(/\s+/g, ' ').trim();
}

function main() {
  const base = loadJson(SRC);
  const indexed = loadJson(INDEXED);

  // Build map from indexed names
  const map = new Map();
  for (const entry of indexed) {
    map.set(normalizeName(entry.name), entry);
  }

  // Helper to locate a match for aggregated names
  function findMatch(itemName) {
    const original = itemName;
    let candidates = [original];

    // Remove parenthetical content
    const noParens = original.replace(/\([^)]*\)/g, '').trim();
    if (noParens !== original) candidates.push(noParens);

    // Split on slashes
    if (original.includes('/')) {
      candidates.push(...original.split('/').map(s => s.trim()));
    }
    if (noParens.includes('/')) {
      candidates.push(...noParens.split('/').map(s => s.trim()));
    }

    // Split on ' / '
    if (original.includes(' / ')) {
      candidates.push(...original.split(' / ').map(s => s.trim()));
    }

    // Add roman numeral stripping for Silkshot variants (I, II, III)
    candidates = candidates.flatMap(c => {
      if (/silkshot/i.test(c)) {
        return [c.replace(/\bI+\b/g, '').trim(), 'Silkshot I'];
      }
      return [c];
    });

    for (const c of candidates) {
      const match = map.get(normalizeName(c));
      if (match) return match;
    }
    return null;
  }

  let counter = 1;
  for (const item of base.items) {
    // Numeric id field (non-breaking: keep original id string)
    if (typeof item.numId !== 'number') item.numId = counter++;
    // Remove legacy idNum if present (we standardize on numId)
    if ('idNum' in item) delete item.idNum;
    // Ensure weight present
    if (typeof item.weight !== 'number') item.weight = 1;
    // Name object
    if (!item.name) item.name = {};
    if (!item.name.en) item.name.en = 'UNKNOWN';
    if (!item.name.es) item.name.es = item.name.en; // placeholder Spanish = English

    // Tool enrichment
    const match = findMatch(item.name.en);
    if (match) {
      if (!item.icon) item.icon = match.icon || PLACEHOLDER_ICON;
      item.location_text = match.location_text || null;
      item.location_img = match.location_image || null;
    } else {
      if (!item.icon && (item.category === 'tool' || item.category === 'silk_skill' || item.category === 'ability')) {
        item.icon = PLACEHOLDER_ICON;
      }
      if (!('location_text' in item)) item.location_text = null;
      if (!('location_img' in item)) item.location_img = null;
    }

    // Provide aliases expected by UI (image/mapImage) if absent
    if (item.icon && !item.image) item.image = item.icon;
    if (item.location_img && !item.mapImage) item.mapImage = item.location_img;
  }

  base.dataVersion = (base.dataVersion || 0) + 1; // bump version
  base.generatedAt = new Date().toISOString();

  const enrichedOut = path.join(ROOT, 'data', 'silksong_items_enriched.json');
  writeFileSync(enrichedOut, JSON.stringify(base, null, 2), 'utf8');
  // (Non-destructive) keep original source intact unless explicitly confirmed; only write enriched output.
  console.log('Enriched', base.items.length, 'items. dataVersion=', base.dataVersion, '->', enrichedOut, '(original left unchanged)');
}

main();
