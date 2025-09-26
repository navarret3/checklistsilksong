#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Clean dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy static files
const filesToCopy = [
  'index.html',
  'package.json'
];

const dirsToCopy = [
  'src',
  'data', 
  'assets'
];

console.log('🏗️  Building Silksong Checklist...');

// Copy files
filesToCopy.forEach(file => {
  const src = path.join(rootDir, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ Copied ${file}`);
  }
});

// Copy directories recursively
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

dirsToCopy.forEach(dir => {
  const src = path.join(rootDir, dir);
  const dest = path.join(distDir, dir);
  copyDirRecursive(src, dest);
  console.log(`✅ Copied ${dir}/ directory`);
});

// Create a simple README for the dist
const readmeContent = `# Silksong Checklist - Production Build

This is the production build of the Silksong Checklist.

## Deployment

Upload all files to your web server. The app is fully static and doesn't require any server-side processing.

## Features

- Interactive checklist for Hollow Knight: Silksong
- Progress tracking with localStorage
- Responsive design
- Search functionality
- Multiple language support (EN/ES)

Built on: ${new Date().toISOString()}
`;

fs.writeFileSync(path.join(distDir, 'README.md'), readmeContent);

console.log('🎉 Build completed! Files are in the /dist directory');
console.log(`📁 Total files: ${getAllFiles(distDir).length}`);

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