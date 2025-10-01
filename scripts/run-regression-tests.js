#!/usr/bin/env node

/**
 * Comprehensive Regression Test Runner
 * 
 * Runs all critical regression tests for theme and navigation issues.
 * Can be used for pre-commit, CI/CD, or manual testing.
 */

import { BlockdokuBehavioralTests } from '../tests/behavioral/blockdoku-tests.js';

class RegressionTestRunner {
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
        
        this.allTests = [
            ...this.criticalTests,
            'Game Storage: Settings persistence',
            'Game Storage: Game state save/load',
            'Difficulty Manager: All difficulty modes',
            'Difficulty Manager: Hints only in Easy mode',
            'Block Manager: Block generation',
            'Block Manager: Block rotation',
            'Scoring: Basic scoring',
            'Scoring: Line clear detection',
            'PWA: Service Worker setup',
            'PWA: Offline storage',
            'UI: Game initialization',
            'UI: Theme application'
        ];
    }

    async runCriticalTests() {
        console.log('🔍 Running CRITICAL regression tests...\n');
        
        const testSuite = new BlockdokuBehavioralTests();
        const results = await testSuite.runTests();
        
        // Filter to only critical tests
        const criticalResults = results.tests.filter(test => 
            this.criticalTests.includes(test.name)
        );
        
        this.printResults('CRITICAL', criticalResults);
        return criticalResults.every(test => test.passed);
    }

    async runAllTests() {
        console.log('🔍 Running ALL regression tests...\n');
        
        const testSuite = new BlockdokuBehavioralTests();
        const results = await testSuite.runTests();
        
        this.printResults('ALL', results.tests);
        return results.tests.every(test => test.passed);
    }

    printResults(type, tests) {
        const passed = tests.filter(test => test.passed).length;
        const failed = tests.filter(test => !test.passed).length;
        const total = tests.length;
        
        console.log(`\n📊 ${type} REGRESSION TEST RESULTS:`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Success Rate: ${Math.round((passed / total) * 100)}%\n`);
        
        // Show failed tests
        if (failed > 0) {
            console.log('❌ FAILED TESTS:');
            tests
                .filter(test => !test.passed)
                .forEach(test => {
                    console.log(`   • ${test.name}`);
                    if (test.error) {
                        console.log(`     Error: ${test.error}`);
                    }
                });
            console.log('');
        }
        
        // Show passed critical tests
        if (type === 'CRITICAL') {
            const criticalPassed = tests.filter(test => test.passed);
            if (criticalPassed.length > 0) {
                console.log('✅ PASSED CRITICAL TESTS:');
                criticalPassed.forEach(test => {
                    console.log(`   • ${test.name}`);
                });
                console.log('');
            }
        }
    }

    async run() {
        const args = process.argv.slice(2);
        const runAll = args.includes('--all') || args.includes('-a');
        const runCritical = args.includes('--critical') || args.includes('-c') || !runAll;
        
        try {
            let success = false;
            
            if (runAll) {
                success = await this.runAllTests();
            } else if (runCritical) {
                success = await this.runCriticalTests();
            }
            
            if (success) {
                console.log('✅ All tests passed!');
                process.exit(0);
            } else {
                console.log('❌ Some tests failed!');
                process.exit(1);
            }
        } catch (error) {
            console.error('❌ Test runner error:', error.message);
            console.log('\n💡 Debug information:');
            console.log('   Error:', error.stack);
            process.exit(1);
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const runner = new RegressionTestRunner();
    runner.run();
}

export { RegressionTestRunner };
