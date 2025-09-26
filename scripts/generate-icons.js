#!/usr/bin/env node
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC_ICO = path.resolve('assets/images/favicon.ico');
const OUT_DIR = path.resolve('assets/images');
const TARGETS = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'favicon-64x64.png', size: 64 },
  { name: 'favicon-128.png', size: 128 },
  { name: 'favicon-192.png', size: 192 },
  { name: 'favicon-256.png', size: 256 },
  { name: 'favicon-384.png', size: 384 },
  { name: 'favicon-512.png', size: 512 }
];

async function ensure(){
  if(!fs.existsSync(SRC_ICO)){
    console.error('Source favicon.ico not found at', SRC_ICO);
    process.exit(1);
  }
  for(const t of TARGETS){
    const outPath = path.join(OUT_DIR, t.name);
    try {
      await sharp(SRC_ICO, { limitInputPixels: false })
        .resize(t.size, t.size)
        .png({ compressionLevel: 9 })
        .toFile(outPath);
      console.log('Generated', t.name);
    } catch(e){
      console.error('Error generating', t.name, e);
    }
  }
}
ensure();
