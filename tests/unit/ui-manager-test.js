#!/usr/bin/env node

/**
 * UIManager Test
 * 
 * Tests the extracted UIManager class to ensure it handles UI rendering
 * and DOM manipulation correctly without game logic dependencies.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock DOM environment for testing
const mockDOM = {
    getElementById: (id) => ({
        getContext: () => ({
            clearRect: () => {}, fillRect: () => {}, strokeRect: () => {},
            fillText: () => {}, measureText: () => ({ width: 50 }),
            save: () => {}, restore: () => {}, translate: () => {}, scale: () => {},
            beginPath: () => {}, moveTo: () => {}, lineTo: () => {},
            closePath: () => {}, fill: () => {}, stroke: () => {}
        }),
        width: 400, height: 400, style: {},
        addEventListener: () => {}, removeEventListener: () => {},
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 400 }),
        textContent: '', innerHTML: '',
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        parentElement: { clientWidth: 400, clientHeight: 400 }
    }),
    createElement: () => mockDOM.getElementById('mock'),
    body: { 
        appendChild: () => {},
        className: ''
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelectorAll: () => [],
    querySelector: () => mockDOM.getElementById('mock'),
    dispatchEvent: () => {}
};

global.document = mockDOM;
global.window = { 
    devicePixelRatio: 1,
    addEventListener: () => {}, removeEventListener: () => {},
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    location: { reload: () => {} },
    Date: Date
};
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);
global.setTimeout = setTimeout;
global.localStorage = global.window.localStorage;
global.getComputedStyle = () => ({
    getPropertyValue: (prop) => {
        const values = {
            '--grid-color': '#ddd',
            '--block-color': '#333',
            '--grid-separator-color': '#999'
        };
        return values[prop] || '';
    }
});

// Import UIManager after setting up mocks
const { UIManager } = await import('../../src/js/core/ui-manager.js');

// Simple assertion framework
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`Assertion failed: ${message}. Expected: ${expected}, Actual: ${actual}`);
    }
}

class UIManagerTest {
    constructor() {
        this.passedTests = 0;
        this.failedTests = 0;
    }

    runTest(testName, testFunction) {
        try {
            testFunction();
            this.passedTests++;
            console.log(`✅ ${testName}`);
        } catch (error) {
            this.failedTests++;
            console.log(`❌ ${testName}: ${error.message}`);
        }
    }

    async runAllTests() {
        console.log('🎨 Running UIManager Tests\n');

        // Test 1: UIManager initialization
        this.runTest('UIManager initialization', () => {
            const uiManager = new UIManager();
            
            assert(uiManager !== null, 'UIManager should be created');
            assert(typeof uiManager.render === 'function', 'Should have render method');
            assert(typeof uiManager.resizeCanvas === 'function', 'Should have resizeCanvas method');
            assert(typeof uiManager.drawBoard === 'function', 'Should have drawBoard method');
        });

        // Test 2: Canvas resize functionality
        this.runTest('Canvas resize functionality', () => {
            const uiManager = new UIManager();
            
            // Mock canvas element
            uiManager.canvas = {
                parentElement: { clientWidth: 500, clientHeight: 500 },
                style: {},
                width: 0,
                height: 0
            };
            uiManager.ctx = mockDOM.getElementById('mock').getContext();
            
            uiManager.resizeCanvas();
            
            // Should calculate cell size
            assert(uiManager.cellSize > 0, 'Cell size should be calculated');
            assertEqual(uiManager.boardSize, 9, 'Board size should be 9');
        });

        // Test 3: Theme application
        this.runTest('Theme application', () => {
            const uiManager = new UIManager();
            
            uiManager.applyTheme('dark');
            
            assertEqual(uiManager.currentTheme, 'dark', 'Should store current theme');
            assertEqual(document.body.className, 'theme-dark', 'Should apply theme class to body');
        });

        // Test 4: Animation settings
        this.runTest('Animation settings', () => {
            const uiManager = new UIManager();
            
            uiManager.setAnimationsEnabled(false);
            assertEqual(uiManager.animationsEnabled, false, 'Should disable animations');
            
            uiManager.setAnimationsEnabled(true);
            assertEqual(uiManager.animationsEnabled, true, 'Should enable animations');
        });

        // Test 5: Coordinate conversion
        this.runTest('Coordinate conversion', () => {
            const uiManager = new UIManager();
            uiManager.cellSize = 50; // Mock cell size
            
            const boardPos = uiManager.getBoardPosition(125, 75);
            
            assertEqual(boardPos.row, 1, 'Should calculate correct row');
            assertEqual(boardPos.col, 2, 'Should calculate correct column');
        });

        // Test 6: Score display update
        this.runTest('Score display update', () => {
            const uiManager = new UIManager();
            
            // Mock score element
            const scoreElement = { textContent: '0' };
            document.getElementById = (id) => {
                if (id === 'score') return scoreElement;
                if (id === 'level') return { textContent: '1' };
                return mockDOM.getElementById(id);
            };
            
            uiManager.updateScoreDisplay(1500, 2);
            
            // Should update display (may be animated)
            assert(uiManager.previousScore === 1500, 'Should track previous score');
            assert(uiManager.previousLevel === 2, 'Should track previous level');
        });

        // Test 7: Preview functionality
        this.runTest('Preview functionality', () => {
            const uiManager = new UIManager();
            
            const testBlock = {
                shape: [[1, 1], [1, 0]]
            };
            
            uiManager.setPreview({ row: 2, col: 3 }, testBlock);
            
            assert(uiManager.previewPosition !== null, 'Should set preview position');
            assert(uiManager.selectedBlock === testBlock, 'Should store selected block');
            
            uiManager.clearPreview();
            
            assert(uiManager.previewPosition === null, 'Should clear preview position');
            assert(uiManager.selectedBlock === null, 'Should clear selected block');
        });

        // Test 8: Event emission
        this.runTest('Event emission', () => {
            const uiManager = new UIManager();
            
            let eventFired = false;
            document.addEventListener('ui-test', () => {
                eventFired = true;
            });
            
            uiManager.emit('test', { data: 'test' });
            
            assert(eventFired, 'Should emit custom events');
        });

        // Test 9: Board drawing with valid state
        this.runTest('Board drawing with valid state', () => {
            const uiManager = new UIManager();
            uiManager.cellSize = 40; // Set cell size
            uiManager.ctx = mockDOM.getElementById('mock').getContext();
            uiManager.canvas = { width: 360, height: 360 };
            
            const gameState = {
                board: [
                    [1, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 1, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 1, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0]
                ]
            };
            
            // Should not throw error
            uiManager.drawBoard(gameState);
            
            assert(true, 'Should draw board without errors');
        });

        // Test 10: Clear feedback functionality
        this.runTest('Clear feedback functionality', () => {
            const uiManager = new UIManager();
            
            const clearedLines = {
                rows: [0],
                columns: [1],
                squares: [{ row: 0, col: 0 }]
            };
            
            uiManager.showClearFeedback(clearedLines);
            
            assert(uiManager.pendingClears === clearedLines, 'Should set pending clears');
            
            // Should clear after timeout (we'll just test the immediate state)
            setTimeout(() => {
                assert(uiManager.pendingClears === null, 'Should clear pending clears after timeout');
            }, 500);
        });

        return this.passedTests > 0 && this.failedTests === 0;
    }

    printSummary() {
        console.log('\n📊 UIManager Test Summary');
        console.log('=========================');
        console.log(`✅ Passed: ${this.passedTests}`);
        console.log(`❌ Failed: ${this.failedTests}`);
        console.log(`📊 Total: ${this.passedTests + this.failedTests}`);
        
        if (this.failedTests === 0) {
            console.log('\n🎉 All UIManager tests passed!');
            console.log('✅ UIManager handles UI rendering correctly');
            console.log('🚀 Safe to integrate with game logic');
        } else {
            console.log('\n⚠️  Some tests failed - UIManager needs adjustment');
        }
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const testRunner = new UIManagerTest();
    testRunner.runAllTests().then(success => {
        testRunner.printSummary();
        process.exit(success ? 0 : 1);
    });
}

export { UIManagerTest };
