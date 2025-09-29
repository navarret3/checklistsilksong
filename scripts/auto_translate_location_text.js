#!/usr/bin/env node
/**
 * auto_translate_location_text.js
 *
 * Heuristic rule-based translation of `location_text` for languages fr,de,it,ru
 * for entries still pending (translationTodo.location_text contains the lang
 * or value equals English). This is a lightweight placeholder until official
 * translations are sourced. Proper nouns and unknown fragments are left as-is.
 */
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'silksong_items.json');

// Ordered list of phrase patterns (longest/more specific first).
// Each pattern uses simple string match (case sensitive) before token fallbacks.
const PHRASES = [
  {
    en: 'Obtained as a reward for beating the',
    fr: 'Obtenu en récompense pour avoir vaincu le/la',
    de: 'Als Belohnung erhalten für den Sieg über',
    it: 'Ottenuto come ricompensa per aver sconfitto',
    ru: 'Получается в награду за победу над'
  },
  {
    en: 'Obtained as a reward for completing the',
    fr: 'Obtenu en récompense pour avoir terminé le/la',
    de: 'Als Belohnung erhalten für den Abschluss von',
    it: 'Ottenuto come ricompensa per aver completato',
    ru: 'Получается в награду за выполнение'
  },
  {
    en: 'Obtained after sprinting across the chamber in the',
    fr: 'Obtenu après avoir traversé en sprint la salle dans le/la',
    de: 'Erhalten nachdem man die Kammer im/ in der',
    it: 'Ottenuto dopo aver corso attraverso la camera nel',
    ru: 'Получается после стремительного забега через зал в области'
  },
  {
    en: 'Crafted by Forge Daughter in the Deep Docks area. Requires one Craftmetal and',
    fr: 'Forgé par la Fille de la Forge dans la zone Docks Profonds. Nécessite un Métal d\'Artisanat et',
    de: 'Geschmiedet von der Schmiedetochter im Gebiet Tiefe Docks. Benötigt ein Handwerksmetall und',
    it: 'For giato dalla Figlia della Forgia nell\'area Darsene Profonde. Richiede un Metallo da Forgiare e',
    ru: 'Создано Дочерью Кузни в районе Глубоких Доков. Требует один Крафтметалл и'
  },
  {
    en: 'Crafted by Twelfth Architect in the Underworks area. Requires one Craftmetal and',
    fr: 'Forgé par le Douzième Architecte dans la zone Souterrang. Nécessite un Métal d\'Artisanat et',
    de: 'Geschmiedet vom Zwölften Architekten im Gebiet Unterwerke. Benötigt ein Handwerksmetall und',
    it: 'Forgiato dal Dodicesimo Architetto nell\'area Sotto-Officine. Richiede un Metallo da Forgiare e',
    ru: 'Создано Двенадцатым Архитектором в области Подмастерских. Требует один Крафтметалл и'
  },
  {
    en: 'Crafted by Forge Daughter in the Deep Docks area. Requires one Craftmetal and 110 Rosaries.',
    fr: 'Forgé par la Fille de la Forge dans la zone Docks Profonds. Nécessite un Métal d\'Artisanat et 110 Chapelets.',
    de: 'Geschmiedet von der Schmiedetochter im Gebiet Tiefe Docks. Benötigt ein Handwerksmetall und 110 Rosenkränze.',
    it: 'Forgiato dalla Figlia della Forgia nell\'area Darsene Profonde. Richiede un Metallo da Forgiare e 110 Rosari.',
    ru: 'Создано Дочерью Кузни в районе Глубоких Доков. Требует один Крафтметалл и 110 Розариев.'
  },
  {
    en: 'Crafted by Forge Daughter in the Deep Docks area. Requires one Craftmetal and 140 Rosaries.',
    fr: 'Forgé par la Fille de la Forge dans la zone Docks Profonds. Nécessite un Métal d\'Artisanat et 140 Chapelets.',
    de: 'Geschmiedet von der Schmiedetochter im Gebiet Tiefe Docks. Benötigt ein Handwerksmetall und 140 Rosenkränze.',
    it: 'Forgiato dalla Figlia della Forgia nell\'area Darsene Profonde. Richiede un Metallo da Forgiare e 140 Rosari.',
    ru: 'Создано Дочерью Кузни в районе Глубоких Доков. Требует один Крафтметалл и 140 Розариев.'
  },
  {
    en: 'Crafted at a table in the',
    fr: 'Forgé sur une table dans la zone',
    de: 'Gefertigt an einem Tisch im Gebiet',
    it: 'For giato su un tavolo nell\'area',
    ru: 'Создано на столе в области'
  },
  {
    en: 'Purchase from',
    fr: 'Acheter auprès de',
    de: 'Kaufen bei',
    it: 'Acquistare da',
    ru: 'Купить у'
  },
  {
    en: 'Found on a table in the',
    fr: 'Trouvé sur une table dans le/la',
    de: 'Gefunden auf einem Tisch im/in der',
    it: 'Trovato su un tavolo nel/nella',
    ru: 'Найдено на столе в'
  },
  {
    en: 'Found on a platform in the',
    fr: 'Trouvé sur une plateforme dans le/la',
    de: 'Gefunden auf einer Plattform im/in der',
    it: 'Trovato su una piattaforma nel/nella',
    ru: 'Найдено на платформе в'
  },
  {
    en: 'Found behind a wall of ice in the',
    fr: 'Trouvé derrière un mur de glace dans le/la',
    de: 'Hinter einer Eiswand gefunden im/in der',
    it: 'Trovato dietro un muro di ghiaccio nel/nella',
    ru: 'Найдено за ледяной стеной в'
  },
  {
    en: 'Found by breaking through a false ceiling in the',
    fr: 'Trouvé en brisant un faux plafond dans le/la',
    de: 'Gefunden durch Durchbrechen einer falschen Decke im/in der',
    it: 'Trovato rompendo un soffitto falso nel/nella',
    ru: 'Найдено, пробив ложный потолок в'
  },
  {
    en: 'Found in the',
    fr: 'Trouvé dans le/la',
    de: 'Gefunden im/in der',
    it: 'Trovato nel/nella',
    ru: 'Найдено в'
  },
  {
    en: 'Found behind the',
    fr: 'Trouvé derrière le/la',
    de: 'Gefunden hinter',
    it: 'Trovato dietro il/la',
    ru: 'Найдено позади'
  },
  {
    en: 'Bind the statue in the',
    fr: 'Lier la statue dans le/la',
    de: 'Binde die Statue im/in der',
    it: 'Lega la statua nel/nella',
    ru: 'Свяжите статую в'
  },
  {
    en: 'Bind Grand Mother Silk\'s arm at the top of The Cradle during Act 3.',
    fr: 'Lier le bras de Grand-Mère Soie au sommet du Berceau pendant l\'Acte 3.',
    de: 'Binde den Arm der Großmutter Seide an der Spitze der Wiege während Akt 3.',
    it: 'Lega il braccio della Nonna Seta in cima alla Culla durante l\'Atto 3.',
    ru: 'Свяжите руку Великой Матери Шёлк на вершине Колыбели во время Акта 3.'
  },
  {
    en: 'Effect:',
    fr: 'Effet :',
    de: 'Effekt:',
    it: 'Effetto:',
    ru: 'Эффект:'
  },
  {
    en: 'Required:',
    fr: 'Requis :',
    de: 'Erfordert:',
    it: 'Richiesto:',
    ru: 'Требуется:'
  },
  {
    en: 'Tip:',
    fr: 'Astuce :',
    de: 'Tipp:',
    it: 'Suggerimento:',
    ru: 'Подсказка:'
  },
  {
    en: 'Can be bought from',
    fr: 'Peut être acheté auprès de',
    de: 'Kann gekauft werden bei',
    it: 'Può essere acquistato da',
    ru: 'Можно купить у'
  }
];

function translateText(enText, lang) {
  if (!enText) return enText;
  let out = enText; // Work on copy
  // Apply phrase replacements in order.
  PHRASES.forEach(p => {
    if (out.includes(p.en) && p[lang]) {
      out = out.split(p.en).join(p[lang]);
    }
  });
  return out;
}

function main() {
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  const json = JSON.parse(raw);
  const targetLangs = ['fr','de','it','ru'];
  let changed = 0;

  json.items.forEach(item => {
    const lt = item.location_text;
    if (!lt || !lt.en) return;
    targetLangs.forEach(lang => {
      if (!lt[lang] || lt[lang] === lt.en) {
        const newVal = translateText(lt.en, lang);
        if (newVal !== lt[lang]) {
          lt[lang] = newVal;
          changed++;
        }
      }
    });
    // Clean translationTodo if fully resolved for location_text
    if (item.translationTodo && item.translationTodo.location_text) {
      const pending = item.translationTodo.location_text.filter(l => {
        return !lt[l] || lt[l] === lt.en; // still identical or missing
      });
      if (pending.length === 0) {
        delete item.translationTodo.location_text;
        if (Object.keys(item.translationTodo).length === 0) delete item.translationTodo;
      } else {
        item.translationTodo.location_text = pending;
      }
    }
  });

  if (changed) {
    json.dataVersion = (json.dataVersion || 0) + 1;
    json.generatedAt = new Date().toISOString();
    json.autoTranslationNote = 'Heuristic auto-translation applied for location_text fr,de,it,ru. Review recommended.';
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(json, null, 2) + '\n');
  console.log('Auto-translation updates:', changed, 'dataVersion:', json.dataVersion);
}

main();
