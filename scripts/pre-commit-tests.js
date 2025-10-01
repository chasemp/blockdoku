#!/usr/bin/env node

/**
 * Pre-commit Regression Tests
 * 
 * Runs critical regression tests before allowing commits to prevent
 * theme and navigation issues from being introduced.
 */

import { BlockdokuBehavioralTests } from '../tests/behavioral/blockdoku-tests.js';

class PreCommitTestRunner {
    constructor() {
        this.criticalTests = [
            'Settings: Theme change preserves difficulty (REGRESSION)',
            'Settings: Difficulty sync between pages',
            'Theme: All pages respect theme changes (REGRESSION)',
            'Theme: Gamesettings page theme synchronization (REGRESSION)',
            'Theme: Default theme consistency after clearing data (REGRESSION)',
            'Navigation: Back buttons work between all pages (REGRESSION)',
            'Navigation: Settings page links work correctly (REGRESSION)',
            'Navigation: Cross-page theme changes trigger updates (REGRESSION)'
        ];
    }

    async runCriticalTests() {
        console.log('🔍 Running critical regression tests before commit...\n');
        
        const testSuite = new BlockdokuBehavioralTests();
        const allTestsPassed = await testSuite.runTests();
        
        console.log('\n📊 CRITICAL REGRESSION TEST RESULTS:');
        if (allTestsPassed) {
            console.log('✅ All critical regression tests passed!');
            console.log('📈 Success Rate: 100%\n');
        } else {
            console.log('❌ Some critical regression tests failed!');
            console.log('📈 Success Rate: < 100%\n');
        }
        
        return allTestsPassed;
    }

    async run() {
        try {
            const success = await this.runCriticalTests();
            
            if (success) {
                console.log('✅ All critical regression tests passed! Commit allowed.');
                process.exit(0);
            } else {
                console.log('❌ Critical regression tests failed! Commit blocked.');
                console.log('\n💡 Fix the failing tests before committing:');
                console.log('   npm run test:behavioral');
                console.log('   # or');
                console.log('   npm run test:critical');
                process.exit(1);
            }
        } catch (error) {
            console.error('❌ Test runner error:', error.message);
            console.log('\n💡 Run tests manually to debug:');
            console.log('   npm run test:behavioral');
            process.exit(1);
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const runner = new PreCommitTestRunner();
    runner.run();
}

export { PreCommitTestRunner };
