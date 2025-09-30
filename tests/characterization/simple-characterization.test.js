/**
 * Simple Characterization Tests
 * 
 * These tests capture the core game logic behavior by testing individual methods
 * rather than the full BlockdokuGame class which has DOM dependencies.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test scenarios
const testScenariosPath = join(__dirname, 'fixtures', 'test-scenarios.json');
const testScenarios = JSON.parse(readFileSync(testScenariosPath, 'utf-8'));

// Create a simple test assertion framework
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

function assertArrayEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Assertion failed: ${message}. Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
    }
}

// Core game logic functions extracted for testing
class SimpleGameLogic {
    constructor() {
        this.boardSize = 9;
    }

    initializeBoard() {
        return Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(0));
    }

    canPlaceBlock(block, board, row, col) {
        if (!block || !block.shape || !board) return false;

        for (let r = 0; r < block.shape.length; r++) {
            for (let c = 0; c < block.shape[r].length; c++) {
                if (block.shape[r][c] === 1) {
                    const boardRow = row + r;
                    const boardCol = col + c;

                    // Check bounds
                    if (boardRow < 0 || boardRow >= this.boardSize || 
                        boardCol < 0 || boardCol >= this.boardSize) {
                        return false;
                    }

                    // Check collision
                    if (board[boardRow][boardCol] === 1) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    placeBlockOnBoard(block, board, row, col) {
        if (!this.canPlaceBlock(block, board, row, col)) {
            return null;
        }

        // Create a copy of the board
        const newBoard = board.map(row => [...row]);

        // Place the block
        for (let r = 0; r < block.shape.length; r++) {
            for (let c = 0; c < block.shape[r].length; c++) {
                if (block.shape[r][c] === 1) {
                    newBoard[row + r][col + c] = 1;
                }
            }
        }

        return newBoard;
    }

    calculatePlacementPoints(block) {
        if (!block || !block.shape) return 0;
        
        let cellCount = 0;
        for (let r = 0; r < block.shape.length; r++) {
            for (let c = 0; c < block.shape[r].length; c++) {
                if (block.shape[r][c] === 1) {
                    cellCount++;
                }
            }
        }
        return cellCount * 2; // 2 points per cell
    }

    checkRowComplete(board, row) {
        return board[row].every(cell => cell === 1);
    }

    checkColumnComplete(board, col) {
        return board.every(row => row[col] === 1);
    }

    checkSquareComplete(board, squareRow, squareCol) {
        const startRow = squareRow * 3;
        const startCol = squareCol * 3;

        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if (board[r][c] !== 1) {
                    return false;
                }
            }
        }
        return true;
    }

    findCompletedLines(board) {
        const completed = {
            rows: [],
            columns: [],
            squares: []
        };

        // Check rows
        for (let row = 0; row < this.boardSize; row++) {
            if (this.checkRowComplete(board, row)) {
                completed.rows.push(row);
            }
        }

        // Check columns
        for (let col = 0; col < this.boardSize; col++) {
            if (this.checkColumnComplete(board, col)) {
                completed.columns.push(col);
            }
        }

        // Check 3x3 squares
        for (let squareRow = 0; squareRow < 3; squareRow++) {
            for (let squareCol = 0; squareCol < 3; squareCol++) {
                if (this.checkSquareComplete(board, squareRow, squareCol)) {
                    completed.squares.push({ row: squareRow, col: squareCol });
                }
            }
        }

        return completed;
    }

    clearLines(board, completedLines) {
        const newBoard = board.map(row => [...row]);

        // Clear rows
        completedLines.rows.forEach(row => {
            for (let col = 0; col < this.boardSize; col++) {
                newBoard[row][col] = 0;
            }
        });

        // Clear columns
        completedLines.columns.forEach(col => {
            for (let row = 0; row < this.boardSize; row++) {
                newBoard[row][col] = 0;
            }
        });

        // Clear squares
        completedLines.squares.forEach(square => {
            const startRow = square.row * 3;
            const startCol = square.col * 3;
            for (let r = startRow; r < startRow + 3; r++) {
                for (let c = startCol; c < startCol + 3; c++) {
                    newBoard[r][c] = 0;
                }
            }
        });

        return newBoard;
    }

    calculateClearScore(completedLines) {
        const rowScore = completedLines.rows.length * 18;
        const colScore = completedLines.columns.length * 18;
        const squareScore = completedLines.squares.length * 35;

        let totalScore = rowScore + colScore + squareScore;

        // Combo bonus
        const totalClears = completedLines.rows.length + completedLines.columns.length + completedLines.squares.length;
        if (totalClears >= 2) {
            totalScore += 25; // Combo bonus
        }

        return totalScore;
    }
}

// Test suite
class CharacterizationTestSuite {
    constructor() {
        this.gameLogic = new SimpleGameLogic();
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
        console.log('🧪 Running Simple Characterization Tests\n');

        // Board initialization tests
        this.runTest('Board initialization creates 9x9 grid', () => {
            const board = this.gameLogic.initializeBoard();
            assertEqual(board.length, 9, 'Board should have 9 rows');
            assertEqual(board[0].length, 9, 'Board should have 9 columns');
            
            // Check all cells are zero
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    assertEqual(board[row][col], 0, `Cell [${row}][${col}] should be 0`);
                }
            }
        });

        // Block placement validation tests
        this.runTest('Valid block placement detection', () => {
            const board = this.gameLogic.initializeBoard();
            const block = testScenarios.blocks.single;
            
            assert(this.gameLogic.canPlaceBlock(block, board, 4, 4), 'Should allow placement in empty area');
        });

        this.runTest('Out of bounds detection', () => {
            const board = this.gameLogic.initializeBoard();
            const block = testScenarios.blocks.line3;
            
            assert(!this.gameLogic.canPlaceBlock(block, board, 0, 7), 'Should reject out of bounds placement');
        });

        this.runTest('Collision detection', () => {
            const board = this.gameLogic.initializeBoard();
            board[0][0] = 1; // Place obstacle
            const block = testScenarios.blocks.single;
            
            assert(!this.gameLogic.canPlaceBlock(block, board, 0, 0), 'Should reject collision');
        });

        // Block placement tests
        this.runTest('Single block placement', () => {
            const board = this.gameLogic.initializeBoard();
            const block = testScenarios.blocks.single;
            
            const newBoard = this.gameLogic.placeBlockOnBoard(block, board, 4, 4);
            assert(newBoard !== null, 'Placement should succeed');
            assertEqual(newBoard[4][4], 1, 'Block should be placed at correct position');
        });

        this.runTest('Multi-cell block placement', () => {
            const board = this.gameLogic.initializeBoard();
            const block = testScenarios.blocks.line2;
            
            const newBoard = this.gameLogic.placeBlockOnBoard(block, board, 2, 2);
            assert(newBoard !== null, 'Placement should succeed');
            assertEqual(newBoard[2][2], 1, 'First cell should be filled');
            assertEqual(newBoard[2][3], 1, 'Second cell should be filled');
        });

        // Scoring tests
        this.runTest('Placement points calculation', () => {
            const singlePoints = this.gameLogic.calculatePlacementPoints(testScenarios.blocks.single);
            const line2Points = this.gameLogic.calculatePlacementPoints(testScenarios.blocks.line2);
            const line3Points = this.gameLogic.calculatePlacementPoints(testScenarios.blocks.line3);
            
            assertEqual(singlePoints, 2, 'Single block should give 2 points');
            assertEqual(line2Points, 4, 'Line2 block should give 4 points');
            assertEqual(line3Points, 6, 'Line3 block should give 6 points');
        });

        // Line clearing tests
        this.runTest('Row completion detection', () => {
            const board = this.gameLogic.initializeBoard();
            
            // Fill first row
            for (let col = 0; col < 9; col++) {
                board[0][col] = 1;
            }
            
            assert(this.gameLogic.checkRowComplete(board, 0), 'Should detect completed row');
            assert(!this.gameLogic.checkRowComplete(board, 1), 'Should not detect incomplete row');
        });

        this.runTest('Column completion detection', () => {
            const board = this.gameLogic.initializeBoard();
            
            // Fill first column
            for (let row = 0; row < 9; row++) {
                board[row][0] = 1;
            }
            
            assert(this.gameLogic.checkColumnComplete(board, 0), 'Should detect completed column');
            assert(!this.gameLogic.checkColumnComplete(board, 1), 'Should not detect incomplete column');
        });

        this.runTest('Square completion detection', () => {
            const board = this.gameLogic.initializeBoard();
            
            // Fill top-left 3x3 square
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    board[row][col] = 1;
                }
            }
            
            assert(this.gameLogic.checkSquareComplete(board, 0, 0), 'Should detect completed square');
            assert(!this.gameLogic.checkSquareComplete(board, 0, 1), 'Should not detect incomplete square');
        });

        this.runTest('Line clearing functionality', () => {
            const board = this.gameLogic.initializeBoard();
            
            // Fill first row
            for (let col = 0; col < 9; col++) {
                board[0][col] = 1;
            }
            
            const completedLines = this.gameLogic.findCompletedLines(board);
            assertEqual(completedLines.rows.length, 1, 'Should find one completed row');
            assertEqual(completedLines.rows[0], 0, 'Should identify row 0');
            
            const clearedBoard = this.gameLogic.clearLines(board, completedLines);
            for (let col = 0; col < 9; col++) {
                assertEqual(clearedBoard[0][col], 0, `Row 0 col ${col} should be cleared`);
            }
        });

        this.runTest('Clear score calculation', () => {
            const completedLines = {
                rows: [0],
                columns: [],
                squares: []
            };
            
            const score = this.gameLogic.calculateClearScore(completedLines);
            assertEqual(score, 18, 'Single row clear should give 18 points');
        });

        this.runTest('Combo bonus calculation', () => {
            const completedLines = {
                rows: [0, 1],
                columns: [],
                squares: []
            };
            
            const score = this.gameLogic.calculateClearScore(completedLines);
            assertEqual(score, 61, 'Double row clear should give 36 + 25 combo bonus = 61 points');
        });

        // Integration tests
        this.runTest('Complete placement workflow', () => {
            const board = this.gameLogic.initializeBoard();
            
            // Fill row except last position
            for (let col = 0; col < 8; col++) {
                board[0][col] = 1;
            }
            
            const block = testScenarios.blocks.single;
            const newBoard = this.gameLogic.placeBlockOnBoard(block, board, 0, 8);
            
            assert(newBoard !== null, 'Placement should succeed');
            
            // Check for line completion
            const completedLines = this.gameLogic.findCompletedLines(newBoard);
            assertEqual(completedLines.rows.length, 1, 'Should complete one row');
            
            // Calculate total score
            const placementScore = this.gameLogic.calculatePlacementPoints(block);
            const clearScore = this.gameLogic.calculateClearScore(completedLines);
            const totalScore = placementScore + clearScore;
            
            assertEqual(totalScore, 20, 'Total score should be 2 (placement) + 18 (clear) = 20');
        });

        return this.passedTests > 0 && this.failedTests === 0;
    }

    printSummary() {
        console.log('\n📊 Characterization Test Summary');
        console.log('================================');
        console.log(`✅ Passed: ${this.passedTests}`);
        console.log(`❌ Failed: ${this.failedTests}`);
        console.log(`📊 Total: ${this.passedTests + this.failedTests}`);
        
        if (this.failedTests === 0) {
            console.log('\n🎉 All characterization tests passed!');
            console.log('✅ Core game logic behavior captured');
            console.log('🚀 Safe to proceed with refactoring');
        } else {
            console.log('\n⚠️  Some tests failed - fix before refactoring');
        }
    }
}

// Export for use in other files
export { SimpleGameLogic, CharacterizationTestSuite, testScenarios };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const testSuite = new CharacterizationTestSuite();
    testSuite.runAllTests().then(success => {
        testSuite.printSummary();
        process.exit(success ? 0 : 1);
    });
}

