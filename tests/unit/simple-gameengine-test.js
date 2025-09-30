#!/usr/bin/env node

/**
 * Simple GameEngine Test
 * 
 * Verifies that the extracted GameEngine class maintains the same behavior
 * as captured in our characterization tests.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GameEngine } from '../../src/js/core/game-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test scenarios
const testScenariosPath = join(__dirname, '../characterization/fixtures/test-scenarios.json');
const testScenarios = JSON.parse(readFileSync(testScenariosPath, 'utf-8'));

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

class SimpleGameEngineTest {
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
        console.log('🧪 Running Simple GameEngine Tests\n');

        // Test 1: Board initialization
        this.runTest('Board initialization creates 9x9 grid', () => {
            const gameEngine = new GameEngine();
            const board = gameEngine.initializeBoard();
            
            assertEqual(board.length, 9, 'Board should have 9 rows');
            assertEqual(board[0].length, 9, 'Board should have 9 columns');
            
            // Check all cells are zero
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    assertEqual(board[row][col], 0, `Cell [${row}][${col}] should be 0`);
                }
            }
        });

        // Test 2: Block placement validation
        this.runTest('Block placement validation', () => {
            const gameEngine = new GameEngine();
            const block = testScenarios.blocks.single;
            
            // Valid placement
            assert(gameEngine.canPlaceBlock(block, 4, 4), 'Should allow placement in empty area');
            
            // Invalid placement (out of bounds)
            assert(!gameEngine.canPlaceBlock(block, 10, 10), 'Should reject out of bounds placement');
        });

        // Test 3: Collision detection
        this.runTest('Collision detection', () => {
            const gameEngine = new GameEngine();
            const block = testScenarios.blocks.single;
            
            // Place obstacle
            gameEngine.board[0][0] = 1;
            
            // Try to place block in same position
            assert(!gameEngine.canPlaceBlock(block, 0, 0), 'Should detect collision');
        });

        // Test 4: Block placement
        this.runTest('Block placement functionality', () => {
            const gameEngine = new GameEngine();
            const block = testScenarios.blocks.single;
            const initialScore = gameEngine.score;
            
            // Place block
            const result = gameEngine.placeBlock(block, { row: 4, col: 4 });
            
            assert(result.success, 'Placement should succeed');
            assertEqual(gameEngine.board[4][4], 1, 'Block should be placed at correct position');
            assert(gameEngine.score > initialScore, 'Score should increase');
        });

        // Test 5: Placement points calculation
        this.runTest('Placement points calculation', () => {
            const gameEngine = new GameEngine();
            
            const singlePoints = gameEngine.calculatePlacementPoints(testScenarios.blocks.single);
            const line2Points = gameEngine.calculatePlacementPoints(testScenarios.blocks.line2);
            const line3Points = gameEngine.calculatePlacementPoints(testScenarios.blocks.line3);
            
            assertEqual(singlePoints, 2, 'Single block should give 2 points');
            assertEqual(line2Points, 4, 'Line2 block should give 4 points');
            assertEqual(line3Points, 6, 'Line3 block should give 6 points');
        });

        // Test 6: Row completion detection
        this.runTest('Row completion detection', () => {
            const gameEngine = new GameEngine();
            
            // Fill first row
            for (let col = 0; col < 9; col++) {
                gameEngine.board[0][col] = 1;
            }
            
            assert(gameEngine.checkRowComplete(gameEngine.board, 0), 'Should detect completed row');
            assert(!gameEngine.checkRowComplete(gameEngine.board, 1), 'Should not detect incomplete row');
        });

        // Test 7: Column completion detection
        this.runTest('Column completion detection', () => {
            const gameEngine = new GameEngine();
            
            // Fill first column
            for (let row = 0; row < 9; row++) {
                gameEngine.board[row][0] = 1;
            }
            
            assert(gameEngine.checkColumnComplete(gameEngine.board, 0), 'Should detect completed column');
            assert(!gameEngine.checkColumnComplete(gameEngine.board, 1), 'Should not detect incomplete column');
        });

        // Test 8: Square completion detection
        this.runTest('Square completion detection', () => {
            const gameEngine = new GameEngine();
            
            // Fill top-left 3x3 square
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    gameEngine.board[row][col] = 1;
                }
            }
            
            assert(gameEngine.isSquareComplete(0, 0), 'Should detect completed square');
            assert(!gameEngine.isSquareComplete(0, 1), 'Should not detect incomplete square');
        });

        // Test 9: Line clearing
        this.runTest('Line clearing functionality', () => {
            const gameEngine = new GameEngine();
            
            // Fill first row
            for (let col = 0; col < 9; col++) {
                gameEngine.board[0][col] = 1;
            }
            
            const clearResult = gameEngine.checkAndClearLines();
            
            assertEqual(clearResult.clearedLines.rows.length, 1, 'Should clear one row');
            assertEqual(clearResult.clearedLines.rows[0], 0, 'Should clear row 0');
            
            // Verify row is actually cleared
            for (let col = 0; col < 9; col++) {
                assertEqual(gameEngine.board[0][col], 0, `Row 0 col ${col} should be cleared`);
            }
        });

        // Test 10: Clear score calculation
        this.runTest('Clear score calculation', () => {
            const gameEngine = new GameEngine();
            
            const singleRowClear = {
                rows: [0],
                columns: [],
                squares: []
            };
            
            const score = gameEngine.calculateClearScore(singleRowClear);
            assertEqual(score, 18, 'Single row clear should give 18 points');
        });

        // Test 11: Combo bonus calculation
        this.runTest('Combo bonus calculation', () => {
            const gameEngine = new GameEngine();
            
            const doubleRowClear = {
                rows: [0, 1],
                columns: [],
                squares: []
            };
            
            const score = gameEngine.calculateClearScore(doubleRowClear);
            assertEqual(score, 61, 'Double row clear should give 36 + 25 combo bonus = 61 points');
        });

        // Test 12: Complete workflow (matches characterization test)
        this.runTest('Complete placement workflow', () => {
            const gameEngine = new GameEngine();
            
            // Fill row except last position
            for (let col = 0; col < 8; col++) {
                gameEngine.board[0][col] = 1;
            }
            
            const block = testScenarios.blocks.single;
            const initialScore = gameEngine.score;
            
            const result = gameEngine.placeBlock(block, { row: 0, col: 8 });
            
            assert(result.success, 'Placement should succeed');
            
            // Check for line completion
            const clearResult = result.clearResult;
            assertEqual(clearResult.clearedLines.rows.length, 1, 'Should complete one row');
            
            // Calculate expected total score
            const expectedPlacementScore = 2; // Single block = 2 points
            const expectedClearScore = 18; // Row clear = 18 points
            const expectedTotal = expectedPlacementScore + expectedClearScore;
            
            assertEqual(result.scoreGained, expectedTotal, `Total score should be ${expectedTotal}`);
            assertEqual(gameEngine.score - initialScore, expectedTotal, 'Game score should increase by expected amount');
        });

        return this.passedTests > 0 && this.failedTests === 0;
    }

    printSummary() {
        console.log('\n📊 GameEngine Test Summary');
        console.log('==========================');
        console.log(`✅ Passed: ${this.passedTests}`);
        console.log(`❌ Failed: ${this.failedTests}`);
        console.log(`📊 Total: ${this.passedTests + this.failedTests}`);
        
        if (this.failedTests === 0) {
            console.log('\n🎉 All GameEngine tests passed!');
            console.log('✅ Extracted GameEngine maintains original behavior');
            console.log('🚀 Safe to integrate into main application');
        } else {
            console.log('\n⚠️  Some tests failed - refactoring needs adjustment');
        }
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const testRunner = new SimpleGameEngineTest();
    testRunner.runAllTests().then(success => {
        testRunner.printSummary();
        process.exit(success ? 0 : 1);
    });
}

export { SimpleGameEngineTest };

