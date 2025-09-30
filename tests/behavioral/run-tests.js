#!/usr/bin/env node

/**
 * Blockdoku PWA - Behavioral Test Runner Script
 * Run with: node tests/behavioral/run-tests.js
 */

import { BlockdokuBehavioralTests } from './blockdoku-tests.js';

async function main() {
    console.log('🎮 Blockdoku PWA - Behavioral Tests');
    console.log('=====================================\n');
    
    try {
        const testSuite = new BlockdokuBehavioralTests();
        const success = await testSuite.runTests();
        
        if (success) {
            console.log('\n🎉 All tests passed! Codebase is healthy.');
            process.exit(0);
        } else {
            console.log('\n🚨 Some tests failed. Check output above for details.');
            process.exit(1);
        }
    } catch (error) {
        console.error('💥 Test runner crashed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
