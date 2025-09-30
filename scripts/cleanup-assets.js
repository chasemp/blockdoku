#!/usr/bin/env node

/**
 * Build Asset Cleanup Script
 * Removes old/unused build assets, keeps only current ones
 */

import fs from 'fs';
import path from 'path';

const ASSETS_DIR = './assets';
const HTML_FILES = ['index.html', 'settings.html', 'lastgame.html', 'splash.html'];

// Current assets that should be kept (from HTML analysis)
const CURRENT_ASSETS = [
    'logo_transparent_bg-sKpSAShR.png',
    'main-AQxmFUZO.js',
    'main-DquBNDUx.css', 
    'sound-manager-D85b1tFB.js',
    'wood-BFBTfjaZ.js',
    'wood-BK4Q7u72.css',
    'lastgame-cEiQBKWM.js',
    'build-info-Dwp5dZmk.js',
    'settings-CE-jLhgt.js',
    'splash-B0nEXqQq.js'
];

function cleanupAssets() {
    console.log('🧹 Starting build asset cleanup...\n');
    
    if (!fs.existsSync(ASSETS_DIR)) {
        console.log('❌ Assets directory not found');
        return;
    }
    
    const allAssets = fs.readdirSync(ASSETS_DIR);
    console.log(`📦 Found ${allAssets.length} total assets`);
    
    let removedCount = 0;
    let keptCount = 0;
    let removedSize = 0;
    
    allAssets.forEach(asset => {
        const assetPath = path.join(ASSETS_DIR, asset);
        const stat = fs.statSync(assetPath);
        
        if (stat.isFile()) {
            if (CURRENT_ASSETS.includes(asset)) {
                console.log(`✅ Keeping: ${asset} (${(stat.size / 1024).toFixed(1)} KB)`);
                keptCount++;
            } else {
                console.log(`🗑️  Removing: ${asset} (${(stat.size / 1024).toFixed(1)} KB)`);
                fs.unlinkSync(assetPath);
                removedCount++;
                removedSize += stat.size;
            }
        }
    });
    
    console.log('\n📊 Cleanup Summary:');
    console.log(`✅ Assets kept: ${keptCount}`);
    console.log(`🗑️  Assets removed: ${removedCount}`);
    console.log(`💾 Space saved: ${(removedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📈 Reduction: ${Math.round((removedCount / allAssets.length) * 100)}%`);
    
    // Verify no broken references
    console.log('\n🔍 Verifying asset references...');
    let brokenRefs = 0;
    
    HTML_FILES.forEach(htmlFile => {
        if (fs.existsSync(htmlFile)) {
            const content = fs.readFileSync(htmlFile, 'utf8');
            const assetRefs = content.match(/assets\/[^"'\s>]+/g) || [];
            
            assetRefs.forEach(ref => {
                const assetName = ref.replace('assets/', '');
                if (!CURRENT_ASSETS.includes(assetName) && !fs.existsSync(path.join(ASSETS_DIR, assetName))) {
                    console.log(`⚠️  Broken reference in ${htmlFile}: ${ref}`);
                    brokenRefs++;
                }
            });
        }
    });
    
    if (brokenRefs === 0) {
        console.log('✅ All asset references are valid');
    }
    
    console.log('\n🎉 Asset cleanup completed successfully!');
}

cleanupAssets();
