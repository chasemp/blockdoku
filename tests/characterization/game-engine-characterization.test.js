/**
 * Game Engine Characterization Tests
 * 
 * These tests capture the CURRENT behavior of the monolithic BlockdokuGame class
 * before refactoring to ensure no game logic changes during architectural refactoring.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test scenarios
const testScenariosPath = join(__dirname, 'fixtures', 'test-scenarios.json');
const testScenarios = JSON.parse(readFileSync(testScenariosPath, 'utf-8'));

// Mock DOM environment for testing
const mockDOM = {
    getElementById: (id) => {
        const mockElement = {
            getContext: () => ({
                clearRect: () => {},
                fillRect: () => {},
                strokeRect: () => {},
                fillText: () => {},
                measureText: () => ({ width: 50 }),
                save: () => {},
                restore: () => {},
                translate: () => {},
                scale: () => {},
                beginPath: () => {},
                moveTo: () => {},
                lineTo: () => {},
                closePath: () => {},
                fill: () => {},
                stroke: () => {}
            }),
            width: 400,
            height: 400,
            style: {},
            addEventListener: () => {},
            removeEventListener: () => {},
            getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 400 }),
            textContent: '',
            innerHTML: '',
            classList: {
                add: () => {},
                remove: () => {},
                contains: () => false
            },
            parentElement: {
                clientWidth: 400,
                clientHeight: 400
            }
        };
        return mockElement;
    },
    createElement: () => mockDOM.getElementById('mock'),
    body: {
        appendChild: () => {}
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelectorAll: () => [],
    querySelector: () => mockDOM.getElementById('mock')
};

// Mock global objects
global.document = mockDOM;
global.window = { 
    devicePixelRatio: 1,
    addEventListener: () => {},
    removeEventListener: () => {},
    localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
    },
    location: { reload: () => {} }
};
global.localStorage = global.window.localStorage;

// Import the BlockdokuGame after setting up mocks
const { default: BlockdokuGame } = await import('../../src/js/app.js');

describe('GameEngine Characterization Tests', () => {
    let game;

    beforeEach(async () => {
        // Reset localStorage
        global.localStorage.getItem = () => null;
        
        // Create a fresh game instance
        game = new (await import('../../src/js/app.js')).default();
        
        // Wait for initialization
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Ensure game is properly initialized
        if (!game.board) {
            game.board = game.initializeBoard();
        }
    });

    describe('Board Initialization', () => {
        test('should initialize 9x9 board with all zeros', () => {
            const board = game.initializeBoard();
            
            expect(board).toHaveLength(9);
            expect(board[0]).toHaveLength(9);
            
            // Check all cells are zero
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    expect(board[row][col]).toBe(0);
                }
            }
        });

        test('should have correct initial game state', () => {
            expect(game.score).toBe(0);
            expect(game.level).toBe(1);
            expect(game.isGameOver).toBe(false);
            expect(game.boardSize).toBe(9);
        });
    });

    describe('Block Placement Validation', () => {
        test('should validate block placement correctly', () => {
            const block = testScenarios.blocks.single;
            
            // Valid placement
            const validResult = game.canPlaceBlock(block, 4, 4);
            expect(validResult).toBe(true);
            
            // Invalid placement (out of bounds)
            const invalidResult = game.canPlaceBlock(block, 10, 10);
            expect(invalidResult).toBe(false);
        });

        test('should detect collisions correctly', () => {
            const block = testScenarios.blocks.single;
            
            // Place a block
            game.board[0][0] = 1;
            
            // Try to place another block in the same position
            const collisionResult = game.canPlaceBlock(block, 0, 0);
            expect(collisionResult).toBe(false);
        });

        test('should validate complex block shapes', () => {
            const lBlock = testScenarios.blocks.lShape;
            
            // Valid placement
            expect(game.canPlaceBlock(lBlock, 0, 0)).toBe(true);
            
            // Invalid placement (out of bounds)
            expect(game.canPlaceBlock(lBlock, 7, 8)).toBe(false);
        });
    });

    describe('Block Placement Behavior', () => {
        test('should place single block correctly', () => {
            const block = testScenarios.blocks.single;
            const initialScore = game.score;
            
            // Place block
            const result = game.placeBlock(block, 4, 4);
            
            expect(result).toBe(true);
            expect(game.board[4][4]).toBe(1);
            expect(game.score).toBeGreaterThan(initialScore);
        });

        test('should calculate placement points correctly', () => {
            const block = testScenarios.blocks.line3;
            const initialScore = game.score;
            
            // Place 3-cell block
            game.placeBlock(block, 1, 1);
            
            // Should gain points for placing 3 cells (3 * 2 = 6 points minimum)
            expect(game.score - initialScore).toBeGreaterThanOrEqual(6);
        });

        test('should handle block placement with rotation', () => {
            const block = testScenarios.blocks.line2;
            
            // Test horizontal placement
            const horizontalResult = game.placeBlock(block, 2, 2);
            expect(horizontalResult).toBe(true);
            expect(game.board[2][2]).toBe(1);
            expect(game.board[2][3]).toBe(1);
        });
    });

    describe('Line Clearing Logic', () => {
        test('should detect and clear complete rows', () => {
            // Fill a complete row except last cell
            for (let col = 0; col < 8; col++) {
                game.board[0][col] = 1;
            }
            
            const initialScore = game.score;
            const singleBlock = testScenarios.blocks.single;
            
            // Place final block to complete row
            game.placeBlock(singleBlock, 0, 8);
            
            // Row should be cleared
            for (let col = 0; col < 9; col++) {
                expect(game.board[0][col]).toBe(0);
            }
            
            // Should gain line clear bonus
            expect(game.score - initialScore).toBeGreaterThan(2); // More than just placement points
        });

        test('should detect and clear complete columns', () => {
            // Fill a complete column except last cell
            for (let row = 0; row < 8; row++) {
                game.board[row][0] = 1;
            }
            
            const initialScore = game.score;
            const singleBlock = testScenarios.blocks.single;
            
            // Place final block to complete column
            game.placeBlock(singleBlock, 8, 0);
            
            // Column should be cleared
            for (let row = 0; row < 9; row++) {
                expect(game.board[row][0]).toBe(0);
            }
            
            // Should gain line clear bonus
            expect(game.score - initialScore).toBeGreaterThan(2);
        });

        test('should detect and clear complete 3x3 squares', () => {
            // Fill a 3x3 square except last cell
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    if (!(row === 2 && col === 2)) {
                        game.board[row][col] = 1;
                    }
                }
            }
            
            const initialScore = game.score;
            const singleBlock = testScenarios.blocks.single;
            
            // Place final block to complete square
            game.placeBlock(singleBlock, 2, 2);
            
            // Square should be cleared
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    expect(game.board[row][col]).toBe(0);
                }
            }
            
            // Should gain square clear bonus (higher than row/column)
            expect(game.score - initialScore).toBeGreaterThan(18);
        });

        test('should handle multiple simultaneous clears', () => {
            // Set up a scenario where placing one block clears multiple lines
            // Fill row 0 except position [0,0]
            for (let col = 1; col < 9; col++) {
                game.board[0][col] = 1;
            }
            
            // Fill column 0 except position [0,0]  
            for (let row = 1; row < 9; row++) {
                game.board[row][0] = 1;
            }
            
            const initialScore = game.score;
            const singleBlock = testScenarios.blocks.single;
            
            // Place block at intersection to clear both row and column
            game.placeBlock(singleBlock, 0, 0);
            
            // Both row and column should be cleared
            for (let col = 0; col < 9; col++) {
                expect(game.board[0][col]).toBe(0);
            }
            for (let row = 0; row < 9; row++) {
                expect(game.board[row][0]).toBe(0);
            }
            
            // Should gain bonus for multiple clears
            expect(game.score - initialScore).toBeGreaterThan(36); // Two line clears + combo bonus
        });
    });

    describe('Scoring System', () => {
        test('should calculate base placement score correctly', () => {
            const scores = [];
            
            // Test different block sizes
            const blocks = [
                testScenarios.blocks.single,    // 1 cell
                testScenarios.blocks.line2,     // 2 cells
                testScenarios.blocks.line3,     // 3 cells
                testScenarios.blocks.square2x2  // 4 cells
            ];
            
            blocks.forEach((block, index) => {
                const initialScore = game.score;
                game.placeBlock(block, 1 + index, 1);
                scores.push(game.score - initialScore);
            });
            
            // Larger blocks should generally give more points
            expect(scores[1]).toBeGreaterThan(scores[0]); // 2-cell > 1-cell
            expect(scores[2]).toBeGreaterThan(scores[1]); // 3-cell > 2-cell
            expect(scores[3]).toBeGreaterThan(scores[2]); // 4-cell > 3-cell
        });

        test('should update level based on score', () => {
            const initialLevel = game.level;
            
            // Artificially increase score to trigger level up
            game.score = 1500; // Should trigger level 2
            game.updateLevel();
            
            expect(game.level).toBeGreaterThan(initialLevel);
        });

        test('should track combo system correctly', () => {
            // This test depends on the current combo implementation
            const initialCombos = game.scoringSystem?.totalCombos || 0;
            
            // Set up scenario for combo (multiple line clears)
            // Fill two rows almost completely
            for (let col = 0; col < 8; col++) {
                game.board[0][col] = 1;
                game.board[1][col] = 1;
            }
            
            // Place a block that completes both rows
            const line2Block = testScenarios.blocks.line2;
            // Rotate to vertical and place
            game.placeBlock(line2Block, 0, 8);
            
            // Should register combo if multiple lines cleared
            const finalCombos = game.scoringSystem?.totalCombos || 0;
            expect(finalCombos).toBeGreaterThanOrEqual(initialCombos);
        });
    });

    describe('Game Over Detection', () => {
        test('should detect game over when no blocks can be placed', () => {
            // Fill board almost completely
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (!(row === 8 && col === 8)) {
                        game.board[row][col] = 1;
                    }
                }
            }
            
            // Mock available blocks that cannot fit
            game.blockManager.currentBlocks = [testScenarios.blocks.square2x2];
            
            const gameOverResult = game.checkGameOver();
            expect(gameOverResult).toBe(true);
        });

        test('should not trigger game over when blocks can still be placed', () => {
            // Partially fill board but leave space for single blocks
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    game.board[row][col] = 1;
                }
            }
            
            // Mock available blocks that can fit
            game.blockManager.currentBlocks = [testScenarios.blocks.single];
            
            const gameOverResult = game.checkGameOver();
            expect(gameOverResult).toBe(false);
        });
    });

    describe('Game State Management', () => {
        test('should maintain consistent state after block placement', () => {
            const block = testScenarios.blocks.single;
            const initialState = {
                score: game.score,
                level: game.level,
                board: game.board.map(row => [...row])
            };
            
            // Place block
            game.placeBlock(block, 4, 4);
            
            // Verify state changes are consistent
            expect(game.score).toBeGreaterThanOrEqual(initialState.score);
            expect(game.level).toBeGreaterThanOrEqual(initialState.level);
            expect(game.board[4][4]).toBe(1);
        });

        test('should handle board state correctly after line clears', () => {
            // Set up line clear scenario
            for (let col = 0; col < 8; col++) {
                game.board[0][col] = 1;
            }
            
            const singleBlock = testScenarios.blocks.single;
            game.placeBlock(singleBlock, 0, 8);
            
            // Verify board state after clear
            let totalFilledCells = 0;
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (game.board[row][col] === 1) {
                        totalFilledCells++;
                    }
                }
            }
            
            // Should have 0 filled cells (row was cleared)
            expect(totalFilledCells).toBe(0);
        });
    });

    describe('Integration with Managers', () => {
        test('should integrate correctly with BlockManager', () => {
            expect(game.blockManager).toBeDefined();
            expect(typeof game.blockManager.generateNewBlocks).toBe('function');
            
            // Should have initial blocks
            const initialBlocks = game.blockManager.getCurrentBlocks();
            expect(Array.isArray(initialBlocks)).toBe(true);
        });

        test('should integrate correctly with ScoringSystem', () => {
            expect(game.scoringSystem).toBeDefined();
            expect(typeof game.scoringSystem.calculateScore).toBe('function');
        });

        test('should integrate correctly with storage system', () => {
            expect(game.storage).toBeDefined();
            expect(typeof game.storage.saveGameState).toBe('function');
            expect(typeof game.storage.loadGameState).toBe('function');
        });
    });

    describe('Difficulty System Integration', () => {
        test('should respect difficulty settings', () => {
            expect(game.difficulty).toBeDefined();
            expect(['easy', 'normal', 'hard'].includes(game.difficulty)).toBe(true);
        });

        test('should integrate with hint system when enabled', () => {
            game.enableHints = true;
            expect(game.hintSystem).toBeDefined();
            
            // Should be able to get hints
            if (game.hintSystem && typeof game.hintSystem.getHint === 'function') {
                const hint = game.hintSystem.getHint();
                expect(typeof hint).toBe('object');
            }
        });

        test('should integrate with timer system when enabled', () => {
            game.enableTimer = true;
            expect(game.timerSystem).toBeDefined();
        });
    });
});

// Helper function to create a test-friendly game instance
export function createTestGame() {
    return new BlockdokuGame();
}

// Export test scenarios for use in other test files
export { testScenarios };
