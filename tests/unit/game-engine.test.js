/**
 * GameEngine Unit Tests
 * 
 * These tests verify that the extracted GameEngine class maintains
 * the same behavior as the characterization tests captured.
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

// Test functions (removing Jest-style describe/test blocks)
function testBoardInitialization() {
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

        test('should maintain board state correctly', () => {
            const initialBoard = gameEngine.getGameState().board;
            
            // Verify initial state
            assert(Array.isArray(initialBoard), 'Board should be an array');
            assertEqual(initialBoard.length, 9, 'Board should have 9 rows');
        });
    });

    describe('Block Placement Validation', () => {
        test('should validate block placement correctly', () => {
            const block = testScenarios.blocks.single;
            
            // Valid placement
            const validResult = gameEngine.canPlaceBlock(block, 4, 4);
            assert(validResult, 'Should allow placement in empty area');
            
            // Invalid placement (out of bounds)
            const invalidResult = gameEngine.canPlaceBlock(block, 10, 10);
            assert(!invalidResult, 'Should reject out of bounds placement');
        });

        test('should detect collisions correctly', () => {
            const block = testScenarios.blocks.single;
            
            // Place a block on the board
            gameEngine.board[0][0] = 1;
            
            // Try to place another block in the same position
            const collisionResult = gameEngine.canPlaceBlock(block, 0, 0);
            assert(!collisionResult, 'Should detect collision');
        });

        test('should validate complex block shapes', () => {
            const lBlock = testScenarios.blocks.lShape;
            
            // Valid placement
            assert(gameEngine.canPlaceBlock(lBlock, 0, 0), 'Should allow valid L-block placement');
            
            // Invalid placement (out of bounds)
            assert(!gameEngine.canPlaceBlock(lBlock, 7, 8), 'Should reject out of bounds L-block placement');
        });
    });

    describe('Block Placement', () => {
        test('should place single block correctly', () => {
            const block = testScenarios.blocks.single;
            const initialScore = gameEngine.score;
            
            // Place block using the full interface
            const result = gameEngine.placeBlock(block, { row: 4, col: 4 });
            
            assert(result.success, 'Placement should succeed');
            assertEqual(gameEngine.board[4][4], 1, 'Block should be placed at correct position');
            assert(gameEngine.score > initialScore, 'Score should increase');
        });

        test('should calculate placement points correctly', () => {
            const singlePoints = gameEngine.calculatePlacementPoints(testScenarios.blocks.single);
            const line2Points = gameEngine.calculatePlacementPoints(testScenarios.blocks.line2);
            const line3Points = gameEngine.calculatePlacementPoints(testScenarios.blocks.line3);
            
            assertEqual(singlePoints, 2, 'Single block should give 2 points');
            assertEqual(line2Points, 4, 'Line2 block should give 4 points');
            assertEqual(line3Points, 6, 'Line3 block should give 6 points');
        });

        test('should handle multi-cell block placement', () => {
            const block = testScenarios.blocks.line2;
            
            const result = gameEngine.placeBlock(block, { row: 2, col: 2 });
            
            assert(result.success, 'Placement should succeed');
            assertEqual(gameEngine.board[2][2], 1, 'First cell should be filled');
            assertEqual(gameEngine.board[2][3], 1, 'Second cell should be filled');
        });
    });

    describe('Line Clearing Logic', () => {
        test('should detect complete rows', () => {
            // Fill first row
            for (let col = 0; col < 9; col++) {
                gameEngine.board[0][col] = 1;
            }
            
            assert(gameEngine.checkRowComplete(gameEngine.board, 0), 'Should detect completed row');
            assert(!gameEngine.checkRowComplete(gameEngine.board, 1), 'Should not detect incomplete row');
        });

        test('should detect complete columns', () => {
            // Fill first column
            for (let row = 0; row < 9; row++) {
                gameEngine.board[row][0] = 1;
            }
            
            assert(gameEngine.checkColumnComplete(gameEngine.board, 0), 'Should detect completed column');
            assert(!gameEngine.checkColumnComplete(gameEngine.board, 1), 'Should not detect incomplete column');
        });

        test('should detect complete 3x3 squares', () => {
            // Fill top-left 3x3 square
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    gameEngine.board[row][col] = 1;
                }
            }
            
            assert(gameEngine.isSquareComplete(0, 0), 'Should detect completed square');
            assert(!gameEngine.isSquareComplete(0, 1), 'Should not detect incomplete square');
        });

        test('should clear completed lines', () => {
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

        test('should calculate clear scores correctly', () => {
            const singleRowClear = {
                rows: [0],
                columns: [],
                squares: []
            };
            
            const score = gameEngine.calculateClearScore(singleRowClear);
            assertEqual(score, 18, 'Single row clear should give 18 points');
        });

        test('should calculate combo bonuses', () => {
            const doubleRowClear = {
                rows: [0, 1],
                columns: [],
                squares: []
            };
            
            const score = gameEngine.calculateClearScore(doubleRowClear);
            assertEqual(score, 61, 'Double row clear should give 36 + 25 combo bonus = 61 points');
        });
    });

    describe('Game State Management', () => {
        test('should track score correctly', () => {
            const initialScore = gameEngine.score;
            const block = testScenarios.blocks.single;
            
            gameEngine.placeBlock(block, { row: 1, col: 1 });
            
            assert(gameEngine.score > initialScore, 'Score should increase after block placement');
        });

        test('should update level based on score', () => {
            gameEngine.score = 1500; // Should trigger level 2
            gameEngine.updateLevel();
            
            assert(gameEngine.level >= 2, 'Level should increase with high score');
        });

        test('should maintain consistent game state', () => {
            const gameState = gameEngine.getGameState();
            
            assert(typeof gameState.score === 'number', 'Score should be a number');
            assert(typeof gameState.level === 'number', 'Level should be a number');
            assert(Array.isArray(gameState.board), 'Board should be an array');
            assert(typeof gameState.isGameOver === 'boolean', 'isGameOver should be a boolean');
        });
    });

    describe('Integration with Characterization Tests', () => {
        test('should maintain exact same behavior as characterization tests', () => {
            // This test runs the same scenarios as the characterization tests
            // to ensure the extracted GameEngine behaves identically
            
            // Test 1: Complete placement workflow
            const board = gameEngine.initializeBoard();
            gameEngine.board = board;
            
            // Fill row except last position
            for (let col = 0; col < 8; col++) {
                gameEngine.board[0][col] = 1;
            }
            
            const block = testScenarios.blocks.single;
            const initialScore = gameEngine.score;
            
            const result = gameEngine.placeBlock(block, { row: 0, col: 8 });
            
            assert(result.success, 'Placement should succeed');
            
            // Check for line completion and clearing
            const clearResult = result.clearResult;
            assertEqual(clearResult.clearedLines.rows.length, 1, 'Should complete one row');
            
            // Calculate expected total score
            const expectedPlacementScore = 2; // Single block = 2 points
            const expectedClearScore = 18; // Row clear = 18 points
            const expectedTotal = expectedPlacementScore + expectedClearScore;
            
            assertEqual(result.scoreGained, expectedTotal, `Total score should be ${expectedTotal}`);
            assertEqual(gameEngine.score - initialScore, expectedTotal, 'Game score should increase by expected amount');
        });
    });
});

// Export test runner for command line usage
export class GameEngineTestRunner {
    constructor() {
        this.passedTests = 0;
        this.failedTests = 0;
        this.testResults = [];
    }

    runTest(testName, testFunction) {
        try {
            testFunction();
            this.passedTests++;
            this.testResults.push({ name: testName, status: 'PASSED' });
            console.log(`✅ ${testName}`);
        } catch (error) {
            this.failedTests++;
            this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
            console.log(`❌ ${testName}: ${error.message}`);
        }
    }

    async runAllTests() {
        console.log('🧪 Running GameEngine Unit Tests\n');

        const gameEngine = new GameEngine();

        // Run all the tests manually (since we don't have a full test framework)
        this.runTest('Board initialization', () => {
            const board = gameEngine.initializeBoard();
            assertEqual(board.length, 9, 'Board should have 9 rows');
            assertEqual(board[0].length, 9, 'Board should have 9 columns');
        });

        this.runTest('Block placement validation', () => {
            const block = testScenarios.blocks.single;
            assert(gameEngine.canPlaceBlock(block, 4, 4), 'Should allow valid placement');
            assert(!gameEngine.canPlaceBlock(block, 10, 10), 'Should reject invalid placement');
        });

        this.runTest('Placement points calculation', () => {
            const points = gameEngine.calculatePlacementPoints(testScenarios.blocks.single);
            assertEqual(points, 2, 'Single block should give 2 points');
        });

        this.runTest('Line clearing', () => {
            // Fill first row
            for (let col = 0; col < 9; col++) {
                gameEngine.board[0][col] = 1;
            }
            
            const clearResult = gameEngine.checkAndClearLines();
            assertEqual(clearResult.clearedLines.rows.length, 1, 'Should clear one row');
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
        } else {
            console.log('\n⚠️  Some tests failed - refactoring needs adjustment');
        }
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const testRunner = new GameEngineTestRunner();
    testRunner.runAllTests().then(success => {
        testRunner.printSummary();
        process.exit(success ? 0 : 1);
    });
}
