#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('🚀 Deploying to server...');

// Aquí puedes añadir tu lógica de deploy:
// - FTP upload
// - rsync
// - API calls a tu hosting
// - etc.

console.log(`
📋 Manual deployment steps:
1. Build completed - files ready in /dist
2. Upload contents of /dist to your domain root
3. Files to upload: ${getAllFiles(distDir).length}

🔧 To automate this, you can:
- Use FTP scripts
- Configure rsync
- Use your hosting provider's API
- Set up GitHub Actions
`);

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}