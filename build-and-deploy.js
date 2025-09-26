#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building project...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Copying files to root directory...');

// Copy essential files from dist to root
const filesToCopy = [
  'index.html',
  'settings.html', 
  'splash.html',
  'manifest.json',
  'manifest.webmanifest',
  'favicon.ico',
  'registerSW.js',
  'sw.js',
  'workbox-5ffe50d4.js'
];

const dirsToCopy = [
  'assets',
  'icons'
];

// Copy files
filesToCopy.forEach(file => {
  const srcPath = path.join('dist', file);
  const destPath = file;
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file}`);
  } else {
    console.warn(`File not found: ${srcPath}`);
  }
});

// Copy directories
dirsToCopy.forEach(dir => {
  const srcPath = path.join('dist', dir);
  const destPath = dir;
  
  if (fs.existsSync(srcPath)) {
    if (fs.existsSync(destPath)) {
      fs.rmSync(destPath, { recursive: true, force: true });
    }
    fs.cpSync(srcPath, destPath, { recursive: true });
    console.log(`Copied directory ${dir}`);
  } else {
    console.warn(`Directory not found: ${srcPath}`);
  }
});

console.log('Build and deploy preparation complete!');
