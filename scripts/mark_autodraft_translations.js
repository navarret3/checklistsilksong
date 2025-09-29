#!/usr/bin/env node
/**
 * mark_autodraft_translations.js
 *
 * Adds a per-item field `translationTodo` listing languages (fr,de,it,ru) whose
 * `location_text` value is still identical to English or missing, so they can be
 * targeted for official translation later. Bumps dataVersion. Generates a summary
 * markdown file at docs/TRANSLATION_STATUS.md.
 */
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'silksong_items.json');
const STATUS_MD_PATH = path.join(__dirname, '..', 'docs', 'TRANSLATION_STATUS.md');

function main() {
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  const json = JSON.parse(raw);

  const targetLangs = ['fr','de','it','ru'];
  const field = 'location_text';

  let itemsNeedingAny = 0;
  let perLangMissing = Object.fromEntries(targetLangs.map(l => [l, 0]));
  let perLangTotal = Object.fromEntries(targetLangs.map(l => [l, 0]));

  json.items.forEach(item => {
    if (!item[field]) return; // null location_text (skip)
    const en = item[field].en;
    const missing = [];
    targetLangs.forEach(l => {
      const v = item[field][l];
      if (v != null) perLangTotal[l] += 1; // counts only entries where key exists
      if (v == null || v === en) {
        missing.push(l);
        perLangMissing[l] += 1;
      }
    });
    if (missing.length) {
      item.translationTodo = item.translationTodo || {};
      item.translationTodo[field] = missing;
      itemsNeedingAny += 1;
    } else if (item.translationTodo && item.translationTodo[field]) {
      delete item.translationTodo[field];
      if (Object.keys(item.translationTodo).length === 0) delete item.translationTodo;
    }
  });

  // Bump dataVersion
  json.dataVersion = (json.dataVersion || 0) + 1;
  json.generatedAt = new Date().toISOString();
  json.translationStatus = {
    field,
    targetLangs,
    items: json.items.length,
    itemsNeedingAny,
    perLangMissing,
    perLangTotal,
    generatedAt: json.generatedAt,
    note: 'Entries listed in per-item translationTodo need official translation for the given languages.'
  };

  fs.writeFileSync(DATA_PATH, JSON.stringify(json, null, 2) + '\n');

  const md = `# Translation Status\n\nUpdated: ${json.generatedAt}\n\nField: ${field}\n\n| Lang | Entries With Key | Missing/Identical to EN | Percent Pending |\n|------|------------------|-------------------------|-----------------|\n${targetLangs.map(l => {
    const tot = perLangTotal[l];
    const miss = perLangMissing[l];
    const pct = tot ? ((miss / tot) * 100).toFixed(1) + '%' : '—';
    return `| ${l} | ${tot} | ${miss} | ${pct} |`;
  }).join('\n')}\n\nItems needing at least one language: ${itemsNeedingAny} / ${json.items.length}\n\n## How to Proceed\n1. Provide official translations for each language listed in \`translationTodo.location_text\` arrays.\n2. After filling a translation, remove that language code from the array.\n3. When an item has no remaining pending languages, remove the whole \`translationTodo\` field if empty.\n4. Re-run this script to refresh counts.\n\n## Automation Notes\n- Identical-to-English strings are treated as pending (assumed placeholder).\n- Null/absent keys are also pending.\n- dataVersion was bumped to ${json.dataVersion}.\n`;
  fs.writeFileSync(STATUS_MD_PATH, md, 'utf8');
  console.log('translation status updated. dataVersion', json.dataVersion);
}

main();
