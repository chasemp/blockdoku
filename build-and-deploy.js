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

// Static files that need to be copied from src/assets to root
const staticFilesToCopy = [
  { src: 'src/assets/images/logo_transparent_bg.png', dest: 'assets/logo_transparent_bg.png' },
  { src: 'src/assets/images/logo.png', dest: 'assets/logo.png' }
];

// Create essential files that Vite doesn't generate
const essentialFiles = [
  { content: JSON.stringify({
    "name": "Blockdoku",
    "short_name": "Blockdoku",
    "start_url": "/splash.html",
    "display": "standalone",
    "background_color": "#2c1810",
    "theme_color": "#8d6e63",
    "orientation": "portrait-primary",
    "scope": "/",
    "lang": "en",
    "dir": "ltr",
    "categories": ["games", "entertainment", "puzzle"],
    "icons": [
      { "src": "icons/icon-72x72.png", "sizes": "72x72", "type": "image/png", "purpose": "any" },
      { "src": "icons/icon-96x96.png", "sizes": "96x96", "type": "image/png", "purpose": "any" },
      { "src": "icons/icon-128x128.png", "sizes": "128x128", "type": "image/png", "purpose": "any" },
      { "src": "icons/icon-144x144.png", "sizes": "144x144", "type": "image/png", "purpose": "any" },
      { "src": "icons/icon-152x152.png", "sizes": "152x152", "type": "image/png", "purpose": "any" },
      { "src": "icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
      { "src": "icons/icon-384x384.png", "sizes": "384x384", "type": "image/png", "purpose": "any" },
      { "src": "icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
      { "src": "icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
    ],
    "shortcuts": [
      { "name": "New Game", "short_name": "New Game", "description": "Start a new Blockdoku game", "url": "/?action=new-game", "icons": [{ "src": "icons/icon-96x96.png", "sizes": "96x96", "type": "image/png" }] }
    ]
  }, null, 2), dest: 'manifest.json' }
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

// Copy static files from src/assets
staticFilesToCopy.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    // Ensure destination directory exists
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log(`Copied static file ${src} -> ${dest}`);
  } else {
    console.warn(`Static file not found: ${src}`);
  }
});

// Create essential files
essentialFiles.forEach(({ content, dest }) => {
  fs.writeFileSync(dest, content);
  console.log(`Created essential file ${dest}`);
});

console.log('Build and deploy preparation complete!');
