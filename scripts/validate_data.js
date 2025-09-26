#!/usr/bin/env node
import { readFileSync } from 'fs';
import path from 'path';

const ROOT = process.cwd();
const FILE = path.join(ROOT, 'data', 'silksong_items.json');

function fail(msg){
  console.error('[VALIDATE] FAIL:', msg);
  process.exitCode = 1;
}

function main(){
  const raw = readFileSync(FILE,'utf8');
  const data = JSON.parse(raw);
  const seen = new Set();
  const seenNum = new Set();
  let sum = 0;
  for(const it of data.items){
    if(seen.has(it.id)) fail('Duplicate id '+it.id);
    seen.add(it.id);
    if(typeof it.numId === 'number'){
      if(seenNum.has(it.numId)) fail('Duplicate numId '+it.numId);
      seenNum.add(it.numId);
    } else {
      fail('Missing numId for '+it.id);
    }
    const w = typeof it.weight==='number' && it.weight>0 ? it.weight : 1;
    sum += w;
  }
  console.log(`[VALIDATE] Items=${data.items.length} UniqueIDs=${seen.size} UniqueNumIDs=${seenNum.size} TotalWeight=${sum}`);
  // Allow small float noise tolerance
  if(Math.abs(sum - 100) > 0.0001) fail('Total weight expected 100 but got '+sum);
  if(!process.exitCode) console.log('[VALIDATE] OK');
}

main();
