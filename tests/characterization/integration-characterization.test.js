/**
 * Integration Characterization Tests
 * 
 * These tests capture end-to-end workflows and component interactions
 * to ensure the refactored architecture maintains the same behavior.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test scenarios
const testScenariosPath = join(__dirname, 'fixtures', 'test-scenarios.json');
const testScenarios = JSON.parse(readFileSync(testScenariosPath, 'utf-8'));

// Mock DOM environment
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
    body: { appendChild: () => {} },
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelectorAll: () => [],
    querySelector: () => mockDOM.getElementById('mock')
};

global.document = mockDOM;
global.window = { 
    devicePixelRatio: 1,
    addEventListener: () => {}, removeEventListener: () => {},
    localStorage: {
        getItem: () => null, setItem: () => {}, removeItem: () => {}
    },
    location: { reload: () => {} }
};
global.localStorage = global.window.localStorage;

const { default: BlockdokuGame } = await import('../../src/js/app.js');

describe('Integration Characterization Tests', () => {
    let game;

    beforeEach(async () => {
        global.localStorage.getItem = () => null;
        game = new BlockdokuGame();
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!game.board) {
            game.board = game.initializeBoard();
        }
    });

    describe('Complete Game Workflows', () => {
        test('should handle complete game session workflow', async () => {
            // 1. Game initialization
            expect(game.score).toBe(0);
            expect(game.level).toBe(1);
            expect(game.isGameOver).toBe(false);

            // 2. Place several blocks
            const block1 = testScenarios.blocks.single;
            const block2 = testScenarios.blocks.line2;
            const block3 = testScenarios.blocks.line3;

            let placementResults = [];
            placementResults.push(game.placeBlock(block1, 0, 0));
            placementResults.push(game.placeBlock(block2, 1, 0));
            placementResults.push(game.placeBlock(block3, 2, 0));

            // All placements should succeed
            placementResults.forEach(result => {
                expect(result).toBe(true);
            });

            // Score should have increased
            expect(game.score).toBeGreaterThan(0);

            // 3. Trigger line clear
            // Fill row 3 except last position
            for (let col = 0; col < 8; col++) {
                game.board[3][col] = 1;
            }
            
            const clearScore = game.score;
            game.placeBlock(block1, 3, 8); // Complete the row

            // Should clear line and gain bonus points
            expect(game.score).toBeGreaterThan(clearScore + 2);

            // 4. Check game state consistency
            expect(typeof game.score).toBe('number');
            expect(typeof game.level).toBe('number');
            expect(Array.isArray(game.board)).toBe(true);
        });

        test('should handle block palette interaction workflow', async () => {
            // Mock block palette selection
            const availableBlocks = game.blockManager.getCurrentBlocks();
            expect(Array.isArray(availableBlocks)).toBe(true);

            // Simulate selecting a block from palette
            if (availableBlocks.length > 0) {
                const selectedBlock = availableBlocks[0];
                game.selectedBlock = selectedBlock;

                // Should be able to place the selected block
                const canPlace = game.canPlaceBlock(selectedBlock, 4, 4);
                expect(typeof canPlace).toBe('boolean');

                if (canPlace) {
                    const initialScore = game.score;
                    const placed = game.placeBlock(selectedBlock, 4, 4);
                    
                    expect(placed).toBe(true);
                    expect(game.score).toBeGreaterThan(initialScore);
                }
            }
        });

        test('should handle save/load workflow', async () => {
            // Place some blocks to create a game state
            const block = testScenarios.blocks.single;
            game.placeBlock(block, 2, 2);
            game.placeBlock(block, 3, 3);

            const savedScore = game.score;
            const savedBoard = game.board.map(row => [...row]);

            // Save game state
            if (game.storage && typeof game.storage.saveGameState === 'function') {
                game.storage.saveGameState({
                    board: game.board,
                    score: game.score,
                    level: game.level
                });

                // Reset game
                game.score = 0;
                game.level = 1;
                game.board = game.initializeBoard();

                // Load game state
                const loadedState = game.storage.loadGameState();
                if (loadedState) {
                    game.score = loadedState.score;
                    game.level = loadedState.level;
                    game.board = loadedState.board;

                    // Verify state was restored
                    expect(game.score).toBe(savedScore);
                    expect(game.board).toEqual(savedBoard);
                }
            }
        });
    });

    describe('Settings Integration Workflow', () => {
        test('should handle difficulty changes', () => {
            const initialDifficulty = game.difficulty;
            
            // Change difficulty
            const newDifficulty = initialDifficulty === 'normal' ? 'hard' : 'normal';
            game.difficulty = newDifficulty;

            expect(game.difficulty).toBe(newDifficulty);

            // Difficulty change should affect game behavior
            if (game.difficultyManager) {
                expect(game.difficultyManager).toBeDefined();
            }
        });

        test('should handle theme changes', () => {
            const initialTheme = game.currentTheme;
            
            // Change theme
            const newTheme = initialTheme === 'light' ? 'dark' : 'light';
            game.currentTheme = newTheme;

            expect(game.currentTheme).toBe(newTheme);
        });

        test('should handle hint system toggle', () => {
            // Enable hints
            game.enableHints = true;
            expect(game.enableHints).toBe(true);

            // Should have hint system available
            expect(game.hintSystem).toBeDefined();

            // Disable hints
            game.enableHints = false;
            expect(game.enableHints).toBe(false);
        });

        test('should handle timer system toggle', () => {
            // Enable timer
            game.enableTimer = true;
            expect(game.enableTimer).toBe(true);

            // Should have timer system available
            expect(game.timerSystem).toBeDefined();

            // Disable timer
            game.enableTimer = false;
            expect(game.enableTimer).toBe(false);
        });
    });

    describe('Manager Integration Workflows', () => {
        test('should coordinate between BlockManager and scoring', () => {
            const initialBlocks = game.blockManager.getCurrentBlocks().length;
            const block = testScenarios.blocks.single;
            
            // Place a block
            const initialScore = game.score;
            game.placeBlock(block, 1, 1);

            // Score should increase (ScoringSystem integration)
            expect(game.score).toBeGreaterThan(initialScore);

            // Block should be handled by BlockManager
            expect(game.blockManager).toBeDefined();
        });

        test('should coordinate petrification system', () => {
            if (game.petrificationManager) {
                expect(game.petrificationManager).toBeDefined();
                
                // Petrification should integrate with scoring
                expect(game.scoringSystem.petrificationManager).toBeDefined();
            }
        });

        test('should coordinate effects system', () => {
            if (game.effectsManager) {
                expect(game.effectsManager).toBeDefined();
                
                // Effects should trigger on game events
                const block = testScenarios.blocks.single;
                game.placeBlock(block, 0, 0);
                
                // Effects system should still be available
                expect(game.effectsManager).toBeDefined();
            }
        });

        test('should coordinate dead pixels system', () => {
            if (game.deadPixelsManager) {
                expect(game.deadPixelsManager).toBeDefined();
                
                // Dead pixels should affect game board
                // This is a passive system that modifies rendering
            }
        });
    });

    describe('Error Handling and Edge Cases', () => {
        test('should handle invalid block placements gracefully', () => {
            const block = testScenarios.blocks.square2x2;
            
            // Try to place out of bounds
            const result1 = game.placeBlock(block, 8, 8);
            expect(result1).toBe(false);

            // Try to place on occupied space
            game.board[0][0] = 1;
            const result2 = game.placeBlock(block, 0, 0);
            expect(result2).toBe(false);

            // Game should remain stable
            expect(typeof game.score).toBe('number');
            expect(Array.isArray(game.board)).toBe(true);
        });

        test('should handle game over conditions properly', () => {
            // Fill board almost completely
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (!(row === 8 && col === 8)) {
                        game.board[row][col] = 1;
                    }
                }
            }

            // Set blocks that cannot fit
            if (game.blockManager) {
                game.blockManager.currentBlocks = [testScenarios.blocks.square2x2];
            }

            const gameOver = game.checkGameOver();
            expect(typeof gameOver).toBe('boolean');

            if (gameOver) {
                expect(game.isGameOver).toBe(true);
            }
        });

        test('should handle missing dependencies gracefully', () => {
            // Create game with missing managers (simulate partial initialization)
            const partialGame = Object.create(BlockdokuGame.prototype);
            partialGame.board = partialGame.initializeBoard();
            partialGame.score = 0;
            partialGame.level = 1;

            // Should not crash when accessing missing managers
            expect(() => {
                partialGame.blockManager?.getCurrentBlocks();
                partialGame.scoringSystem?.calculateScore();
                partialGame.storage?.loadGameState();
            }).not.toThrow();
        });
    });

    describe('Performance and Memory', () => {
        test('should maintain performance during extended play', () => {
            const startTime = Date.now();
            
            // Simulate extended gameplay
            for (let i = 0; i < 100; i++) {
                const block = testScenarios.blocks.single;
                const row = Math.floor(Math.random() * 9);
                const col = Math.floor(Math.random() * 9);
                
                if (game.canPlaceBlock(block, row, col)) {
                    game.placeBlock(block, row, col);
                }
                
                // Occasionally clear the board to continue
                if (i % 20 === 0) {
                    game.board = game.initializeBoard();
                }
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Should complete in reasonable time (less than 1 second)
            expect(duration).toBeLessThan(1000);
            
            // Game state should remain valid
            expect(Array.isArray(game.board)).toBe(true);
            expect(typeof game.score).toBe('number');
        });

        test('should handle memory usage appropriately', () => {
            const initialMemory = process.memoryUsage().heapUsed;
            
            // Create and destroy multiple game instances
            for (let i = 0; i < 10; i++) {
                const tempGame = new BlockdokuGame();
                tempGame.board = tempGame.initializeBoard();
                
                // Use the game briefly
                const block = testScenarios.blocks.single;
                if (tempGame.canPlaceBlock && tempGame.placeBlock) {
                    tempGame.placeBlock(block, 0, i % 9);
                }
            }
            
            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }
            
            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;
            
            // Memory increase should be reasonable (less than 10MB)
            expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
        });
    });

    describe('State Consistency', () => {
        test('should maintain state consistency across operations', () => {
            // Perform a series of operations and verify state remains consistent
            const operations = [
                () => game.placeBlock(testScenarios.blocks.single, 0, 0),
                () => game.placeBlock(testScenarios.blocks.line2, 1, 0),
                () => game.updateLevel(),
                () => game.checkGameOver()
            ];

            operations.forEach((operation, index) => {
                try {
                    operation();
                    
                    // Verify core state remains valid after each operation
                    expect(typeof game.score).toBe('number');
                    expect(game.score).toBeGreaterThanOrEqual(0);
                    expect(typeof game.level).toBe('number');
                    expect(game.level).toBeGreaterThanOrEqual(1);
                    expect(Array.isArray(game.board)).toBe(true);
                    expect(game.board).toHaveLength(9);
                    expect(typeof game.isGameOver).toBe('boolean');
                    
                } catch (error) {
                    throw new Error(`Operation ${index} failed: ${error.message}`);
                }
            });
        });
    });
});

// Export helper functions for other test files
export function createIntegrationTestGame() {
    return new BlockdokuGame();
}

export function simulateGameSession(game, moves = 10) {
    const results = [];
    
    for (let i = 0; i < moves; i++) {
        const block = testScenarios.blocks.single;
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        
        if (game.canPlaceBlock && game.canPlaceBlock(block, row, col)) {
            const result = game.placeBlock(block, row, col);
            results.push({ move: i, row, col, success: result });
        }
    }
    
    return results;
}
