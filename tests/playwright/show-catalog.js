#!/usr/bin/env node

/**
 * Blockdoku PWA - MCP Playwright Test Catalog Display
 * 
 * This script displays the test catalog with all available tests and groups.
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class TestCatalogDisplay {
    constructor() {
        this.catalogFile = join(__dirname, 'test-catalog.md');
    }

    /**
     * Display the test catalog
     */
    displayCatalog() {
        console.log('🎯 Blockdoku PWA - MCP Playwright Test Catalog');
        console.log('==============================================\n');

        try {
            const catalog = fs.readFileSync(this.catalogFile, 'utf8');
            console.log(catalog);
        } catch (error) {
            console.error('❌ Error reading catalog file:', error.message);
            process.exit(1);
        }

        console.log('\n🚀 QUICK START:');
        console.log('===============');
        console.log('1. Start your development server: npm run dev');
        console.log('2. Ask me to run a specific test: "Run the theme-basic test"');
        console.log('3. Or run a group of tests: "Run all theme testing tests"');
        console.log('4. Or run comprehensive tests: "Run the comprehensive-full test suite"');
        console.log('\n💡 TIP: You can reference any test ID from the catalog above!');
    }

    /**
     * Display a specific test category
     */
    displayCategory(category) {
        console.log(`🎯 Blockdoku PWA - ${category} Tests`);
        console.log('=====================================\n');

        const categories = {
            'theme': '🎨 Theme Testing',
            'nav': '🗺️ Navigation Testing', 
            'game': '🎮 Game Functionality',
            'settings': '🔧 Settings Functionality',
            'performance': '🚀 Performance Testing',
            'comprehensive': '🧪 Comprehensive Testing'
        };

        if (categories[category]) {
            console.log(`${categories[category]}`);
            console.log('Tests for this category are available in the full catalog.');
            console.log('\nTo see all tests, run: npm run test:catalog');
        } else {
            console.log('❌ Unknown category. Available categories:');
            Object.keys(categories).forEach(cat => {
                console.log(`   • ${cat}`);
            });
        }
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const category = args[0];

const display = new TestCatalogDisplay();

if (category) {
    display.displayCategory(category);
} else {
    display.displayCatalog();
}
