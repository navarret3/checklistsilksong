/**
 * Adds placeholder translations (fr,de,it,ru) for each item's location_text
 * by copying the English string when those keys are missing.
 * Increments dataVersion.
 */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'data', 'silksong_items.json');

if(!fs.existsSync(file)){
  console.error('File not found:', file);
  process.exit(1);
}

const json = JSON.parse(fs.readFileSync(file, 'utf8'));
let added = 0;
for(const it of json.items || []){
  if(it && it.location_text && typeof it.location_text === 'object'){
    const base = it.location_text.en || '';
    for(const lang of ['fr','de','it','ru']){
      if(!it.location_text[lang]){ it.location_text[lang] = base; added++; }
    }
  }
  if(it && it.name && typeof it.name === 'object'){
    const baseName = it.name.en || '';
    for(const lang of ['fr','de','it','ru']){
      if(!it.name[lang]){ it.name[lang] = baseName; added++; }
    }
  }
}
json.dataVersion = (json.dataVersion || 0) + 1;
fs.writeFileSync(file, JSON.stringify(json, null, 2));
console.log('Placeholders added:', added, 'New dataVersion:', json.dataVersion);
