#!/usr/bin/env node

/**
 * Characterization Test Runner
 * 
 * Runs characterization tests to capture current behavior before refactoring.
 * These tests ensure that architectural changes don't break existing functionality.
 */

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class CharacterizationTestRunner {
    constructor() {
        this.testFiles = [
            'simple-characterization.test.js',
            'state-management-characterization.test.js'
        ];
        this.passedTests = 0;
        this.failedTests = 0;
        this.totalTests = 0;
        this.startTime = Date.now();
    }

    async runTests() {
        console.log('🧪 Blockdoku PWA - Characterization Tests');
        console.log('==========================================\n');
        console.log('📋 Purpose: Capture current behavior before refactoring');
        console.log('🎯 Goal: Ensure architectural changes preserve functionality\n');

        let allTestsPassed = true;

        for (const testFile of this.testFiles) {
            console.log(`📝 Running ${testFile}...`);
            const success = await this.runTestFile(testFile);
            
            if (!success) {
                allTestsPassed = false;
            }
            
            console.log(''); // Add spacing between test files
        }

        this.printSummary(allTestsPassed);
        return allTestsPassed;
    }

    async runTestFile(testFile) {
        const testPath = join(__dirname, testFile);
        
        try {
            // Import and run the test file
            const testModule = await import(testPath);
            
            // Run tests using a simple test runner
            return await this.executeTests(testModule, testFile);
            
        } catch (error) {
            console.error(`❌ Failed to load ${testFile}: ${error.message}`);
            this.failedTests++;
            return false;
        }
    }

    async executeTests(testModule, fileName) {
        try {
            console.log(`✅ ${fileName} loaded successfully`);
            
            // For simple-characterization.test.js, run the actual tests
            if (fileName === 'simple-characterization.test.js' && testModule.CharacterizationTestSuite) {
                const testSuite = new testModule.CharacterizationTestSuite();
                const success = await testSuite.runAllTests();
                testSuite.printSummary();
                
                if (success) {
                    this.passedTests += testSuite.passedTests;
                    this.totalTests += testSuite.passedTests + testSuite.failedTests;
                } else {
                    this.failedTests += testSuite.failedTests;
                    this.passedTests += testSuite.passedTests;
                    this.totalTests += testSuite.passedTests + testSuite.failedTests;
                }
                
                return success;
            } else if (fileName === 'state-management-characterization.test.js' && testModule.StateManagementCharacterizationTest) {
                const testSuite = new testModule.StateManagementCharacterizationTest();
                const success = await testSuite.runAllTests();
                testSuite.printSummary();
                
                if (success) {
                    this.passedTests += testSuite.passedTests;
                    this.totalTests += testSuite.passedTests + testSuite.failedTests;
                } else {
                    this.failedTests += testSuite.failedTests;
                    this.passedTests += testSuite.passedTests;
                    this.totalTests += testSuite.passedTests + testSuite.failedTests;
                }
                
                return success;
            } else {
                // For other test files, just verify they load
                if (testModule.testScenarios) {
                    console.log(`✅ Test scenarios loaded`);
                    this.passedTests++;
                }
                this.totalTests += 1;
                return true;
            }
            
        } catch (error) {
            console.error(`❌ Error executing ${fileName}: ${error.message}`);
            this.failedTests++;
            this.totalTests++;
            return false;
        }
    }

    printSummary(allPassed) {
        const duration = Date.now() - this.startTime;
        
        console.log('📊 Characterization Test Summary');
        console.log('================================');
        console.log(`⏱️  Duration: ${duration}ms`);
        console.log(`📁 Test Files: ${this.testFiles.length}`);
        console.log(`✅ Passed: ${this.passedTests}`);
        console.log(`❌ Failed: ${this.failedTests}`);
        console.log(`📊 Total Checks: ${this.totalTests}`);
        
        if (allPassed) {
            console.log('\n🎉 All characterization tests passed!');
            console.log('✅ Ready to begin safe refactoring');
            console.log('💡 Run these tests after each refactoring step to ensure behavior preservation');
        } else {
            console.log('\n⚠️  Some characterization tests failed');
            console.log('🔧 Fix these issues before starting refactoring');
            console.log('📝 These tests capture the CURRENT behavior - they should all pass');
        }
        
        console.log('\n📖 Next Steps:');
        console.log('1. Ensure all characterization tests pass');
        console.log('2. Begin refactoring (extract GameEngine, UIManager, StateManager)');
        console.log('3. Run characterization tests after each extraction');
        console.log('4. Add unit tests for new components');
        console.log('5. Add integration tests for new architecture');
    }
}

// Check if running with Node.js directly
async function main() {
    const runner = new CharacterizationTestRunner();
    
    try {
        const success = await runner.runTests();
        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('💥 Fatal error running characterization tests:', error);
        process.exit(1);
    }
}

// Handle watch mode
if (process.argv.includes('--watch')) {
    console.log('👀 Watch mode not implemented yet');
    console.log('💡 Suggestion: Use nodemon to watch test files');
    console.log('   npx nodemon --exec "npm run test:characterization"');
    process.exit(0);
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
