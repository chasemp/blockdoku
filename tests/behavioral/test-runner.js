/**
 * Blockdoku PWA - Behavioral Test Runner
 * High-level user workflow and regression tests
 */

class BehavioralTestRunner {
    constructor() {
        this.tests = [];
        this.results = [];
        this.mockDOM = this.createMockDOM();
        this.setupTestEnvironment();
    }

    createMockDOM() {
        // Create minimal DOM elements needed for testing
        if (typeof document === 'undefined') {
            global.document = {
                getElementById: (id) => ({
                    id,
                    style: {},
                    classList: { add: () => {}, remove: () => {}, contains: () => false },
                    addEventListener: () => {},
                    textContent: '',
                    checked: false,
                    value: ''
                }),
                addEventListener: () => {},
                readyState: 'complete',
                createElement: () => ({ style: {}, classList: { add: () => {} } }),
                head: { appendChild: () => {} },
                body: { classList: { add: () => {} } }
            };
            
            global.window = {
                localStorage: {
                    getItem: (key) => this.mockStorage[key] || null,
                    setItem: (key, value) => { this.mockStorage[key] = value; },
                    removeItem: (key) => { delete this.mockStorage[key]; }
                },
                addEventListener: () => {}
            };
            
            global.localStorage = global.window.localStorage;
        }
        
        this.mockStorage = {};
        return true;
    }

    setupTestEnvironment() {
        // Clear localStorage before each test run
        this.mockStorage = {};
        
        // Mock canvas context
        global.HTMLCanvasElement = class {
            getContext() {
                return {
                    fillStyle: '',
                    strokeStyle: '',
                    lineWidth: 1,
                    globalAlpha: 1,
                    fillRect: () => {},
                    strokeRect: () => {},
                    clearRect: () => {},
                    beginPath: () => {},
                    moveTo: () => {},
                    lineTo: () => {},
                    arc: () => {},
                    fill: () => {},
                    stroke: () => {},
                    save: () => {},
                    restore: () => {},
                    translate: () => {},
                    scale: () => {},
                    rotate: () => {}
                };
            }
        };
    }

    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    async runAllTests() {
        console.log(`🧪 Running ${this.tests.length} behavioral tests...\n`);
        
        for (const test of this.tests) {
            await this.runTest(test);
        }
        
        this.printResults();
        return this.results.every(r => r.passed);
    }

    async runTest(test) {
        try {
            // Reset environment for each test
            this.setupTestEnvironment();
            
            console.log(`🔍 Testing: ${test.name}`);
            await test.testFunction();
            
            this.results.push({ name: test.name, passed: true, error: null });
            console.log(`✅ PASS: ${test.name}\n`);
        } catch (error) {
            this.results.push({ name: test.name, passed: false, error: error.message });
            console.log(`❌ FAIL: ${test.name}`);
            console.log(`   Error: ${error.message}\n`);
        }
    }

    printResults() {
        const passed = this.results.filter(r => r.passed).length;
        const failed = this.results.filter(r => !r.passed).length;
        
        console.log('📊 TEST RESULTS:');
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Success Rate: ${Math.round((passed / this.results.length) * 100)}%`);
        
        if (failed > 0) {
            console.log('\n🚨 FAILED TESTS:');
            this.results.filter(r => !r.passed).forEach(result => {
                console.log(`   • ${result.name}: ${result.error}`);
            });
        }
    }

    // Test assertion helpers
    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, got ${actual}`);
        }
    }

    assertNotEqual(actual, unexpected, message) {
        if (actual === unexpected) {
            throw new Error(message || `Expected not ${unexpected}, got ${actual}`);
        }
    }

    assertThrows(fn, message) {
        try {
            fn();
            throw new Error(message || 'Expected function to throw');
        } catch (error) {
            if (error.message === (message || 'Expected function to throw')) {
                throw error;
            }
            // Expected error was thrown
        }
    }
}

export { BehavioralTestRunner };
