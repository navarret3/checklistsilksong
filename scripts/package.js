#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('📦 Packaging for deployment...');

if (!fs.existsSync(distDir)) {
  console.error('❌ Dist directory not found. Run npm run build first.');
  process.exit(1);
}

// Create deployment package info
const deployInfo = {
  name: 'silksong-checklist',
  version: '1.0.0',
  built: new Date().toISOString(),
  files: getAllFiles(distDir).length,
  instructions: [
    '1. Extract all files to your web server root directory',
    '2. Ensure your server serves index.html for the root path',
    '3. The app is fully static - no server configuration needed',
    '4. Supports modern browsers with ES6 modules'
  ]
};

fs.writeFileSync(
  path.join(distDir, 'deployment-info.json'), 
  JSON.stringify(deployInfo, null, 2)
);

// Create a simple deployment guide
const deployGuide = `# Deployment Guide

## Quick Start
1. Upload all files from this directory to your web server
2. Make sure your server serves \`index.html\` as the default file
3. Visit your domain - the app should work immediately

## Requirements
- Modern web browser with ES6 module support
- Web server that serves static files
- No server-side processing required

## File Structure
- \`index.html\` - Main application entry point
- \`src/\` - JavaScript modules and application logic
- \`data/\` - JSON data files for checklist items
- \`assets/\` - Images, icons, and static assets

## Features
- ✅ Offline-capable (localStorage for progress)
- ✅ Responsive design (mobile-friendly)
- ✅ Multi-language support (EN/ES)
- ✅ Search functionality
- ✅ Progress tracking

Built: ${new Date().toLocaleString()}
Total files: ${getAllFiles(distDir).length}
`;

fs.writeFileSync(path.join(distDir, 'DEPLOY.md'), deployGuide);

console.log('✅ Added deployment info and guide');
console.log('📁 Ready for deployment! Upload contents of /dist directory');
console.log(`🌐 Contains ${getAllFiles(distDir).length} files ready for hosting`);

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