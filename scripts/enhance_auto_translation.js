#!/usr/bin/env node
/**
 * Enhance auto translation for location_text fields to produce non-English full-line outputs
 * for fr,de,it,ru based on English source. This is a heuristic lexical replacement approach.
 * It only modifies entries where the entire target string is either identical to the English
 * or still contains obvious English keywords (Effect, Required, Purchase, Found, Crafted, Tip, ACT).
 *
 * After processing it bumps dataVersion by 1.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'silksong_items.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const LANGS = ['fr','de','it','ru'];

// Ordered phrase replacements (multi-word first) per language
const replacements = {
  fr: [
    [/ACT\s*(\d+)/gi, 'ACTE $1'],
    [/Effect:?/gi, 'Effet :'],
    [/Required:?/gi, 'Requis :'],
    [/Purchase:?/gi, 'Achat :'],
    [/Purchased:?/gi, 'Acheté :'],
    [/Obtained:?/gi, 'Obtenu :'],
    [/Found:?/gi, 'Trouvé :'],
    [/Crafted:?/gi, 'Assemblé :'],
    [/Crafted \/ Found:?/gi, 'Assemblé / Trouvé :'],
    [/Found \/ Purchased:?/gi, 'Trouvé / Acheté :'],
    [/Fragment/gi, 'Fragment'],
    [/Shard/gi, 'Éclat'],
    [/Shards/gi, 'Éclats'],
    [/Tip:?/gi, 'Astuce :'],
    [/Required/gi, 'Requis'],
    [/Defeat/gi, 'Vaincre'],
    [/Defeated/gi, 'Vaincu'],
    [/Door(s)?/gi, 'Porte$1'],
    [/Doors/gi, 'Portes'],
  ],
  de: [
    [/ACT\s*(\d+)/gi, 'AKT $1'],
    [/Effect:?/gi, 'Effekt:'],
    [/Required:?/gi, 'Erfordert:'],
    [/Purchase:?/gi, 'Kauf:'],
    [/Purchased:?/gi, 'Gekauft:'],
    [/Obtained:?/gi, 'Erhalten:'],
    [/Found:?/gi, 'Gefunden:'],
    [/Crafted:?/gi, 'Gefertigt:'],
    [/Crafted \/ Found:?/gi, 'Gefertigt / Gefunden:'],
    [/Found \/ Purchased:?/gi, 'Gefunden / Gekauft:'],
    [/Fragment/gi, 'Fragment'],
    [/Shard/gi, 'Splitter'],
    [/Shards/gi, 'Splitter'],
    [/Tip:?/gi, 'Tipp:'],
    [/Defeat/gi, 'Besiege'],
    [/Defeated/gi, 'Besiegt'],
    [/Doors/gi, 'Türen'],
  ],
  it: [
    [/ACT\s*(\d+)/gi, 'ATTO $1'],
    [/Effect:?/gi, 'Effetto:'],
    [/Required:?/gi, 'Richiesto:'],
    [/Purchase:?/gi, 'Acquisto:'],
    [/Purchased:?/gi, 'Acquistato:'],
    [/Obtained:?/gi, 'Ottenuto:'],
    [/Found:?/gi, 'Trovato:'],
    [/Crafted:?/gi, 'Creato:'],
    [/Crafted \/ Found:?/gi, 'Creato / Trovato:'],
    [/Found \/ Purchased:?/gi, 'Trovato / Acquistato:'],
    [/Fragment/gi, 'Frammento'],
    [/Shard/gi, 'Scheggia'],
    [/Shards/gi, 'Schegge'],
    [/Tip:?/gi, 'Suggerimento:'],
    [/Defeat/gi, 'Sconfiggi'],
    [/Defeated/gi, 'Sconfitto'],
    [/Doors/gi, 'Porte'],
  ],
  ru: [
    [/ACT\s*(\d+)/gi, 'АКТ $1'],
    [/Effect:?/gi, 'Эффект:'],
    [/Required:?/gi, 'Требуется:'],
    [/Purchase:?/gi, 'Покупка:'],
    [/Purchased:?/gi, 'Куплено:'],
    [/Obtained:?/gi, 'Получено:'],
    [/Found:?/gi, 'Найдено:'],
    [/Crafted:?/gi, 'Создано:'],
    [/Crafted \/ Found:?/gi, 'Создано / Найдено:'],
    [/Found \/ Purchased:?/gi, 'Найдено / Куплено:'],
    [/Fragment/gi, 'Фрагмент'],
    [/Shard/gi, 'Осколок'],
    [/Shards/gi, 'Осколки'],
    [/Tip:?/gi, 'Совет:'],
    [/Defeat/gi, 'Победи'],
    [/Defeated/gi, 'Повержен'],
    [/Doors/gi, 'Двери'],
  ]
};

function needsEnhance(en, tgt) {
  if (!tgt) return true;
  if (tgt.trim() === en.trim()) return true;
  // If still contains English structural keywords, treat as needing enhancement
  const keywords = /(Effect|Required|Purchase|Found|Crafted|Tip|ACT\s*\d)/;
  return keywords.test(tgt);
}

let changeCount = 0;

for (const item of data.items) {
  if (!item.location_text) continue;
  const en = item.location_text.en || '';
  for (const lang of LANGS) {
    const current = item.location_text[lang];
    if (!needsEnhance(en, current)) continue;
    let draft = en; // base English string
    for (const [re, rep] of replacements[lang]) {
      draft = draft.replace(re, rep);
    }
    // If after replacement  still identical OR mostly english, add a marker prefix to show auto.
    if (draft === en) {
      draft = draft.replace(/^(.*)$/,'[auto] $1');
    }
    item.location_text[lang] = draft;
    changeCount++;
  }
}

if (!data.autoTranslationEnhance) data.autoTranslationEnhance = [];
const timestamp = new Date().toISOString();

data.autoTranslationEnhance.push({
  timestamp,
  changeCount,
  method: 'lexical-replace-v1',
  langs: LANGS
});

// bump version
data.dataVersion = (data.dataVersion || 0) + 1;

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
console.log(`Enhancement complete. Changes: ${changeCount} dataVersion: ${data.dataVersion}`);
