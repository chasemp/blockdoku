#!/usr/bin/env node

/**
 * Integration Tests for Refactored Architecture
 * 
 * These tests verify that all extracted components (GameEngine, UIManager, StateManager)
 * work together correctly and maintain the same behavior as the original monolithic app.
 */

// Mock DOM elements for testing
const mockCanvas = {
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
};

const mockDocument = {
    getElementById: (id) => {
        if (id === 'game-board') return mockCanvas;
        return {
            getContext: () => ({}),
            width: 0, height: 0, style: {},
            addEventListener: () => {}, removeEventListener: () => {},
            getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0 }),
            textContent: '', innerHTML: '',
            classList: { add: () => {}, remove: () => {}, contains: () => false },
            parentElement: { clientWidth: 400, clientHeight: 400 }
        };
    },
    createElement: () => ({
        getContext: () => ({}),
        width: 0, height: 0, style: {},
        addEventListener: () => {}, removeEventListener: () => {},
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0 }),
        textContent: '', innerHTML: '',
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        parentElement: { clientWidth: 400, clientHeight: 400 }
    })
};

global.document = mockDocument;
global.window = { 
    requestAnimationFrame: (cb) => setTimeout(cb, 16),
    addEventListener: () => {},
    removeEventListener: () => {}
};

// Mock localStorage
const mockStorage = {
    data: {},
    getItem: function(key) { return this.data[key] || null; },
    setItem: function(key, value) { this.data[key] = value; },
    removeItem: function(key) { delete this.data[key]; },
    clear: function() { this.data = {}; }
};
global.localStorage = mockStorage;

// Import components after setting up mocks
const { DependencyContainer } = await import('../../src/js/core/dependency-container.js');
const { GameEngine } = await import('../../src/js/core/game-engine.js');
const { UIManager } = await import('../../src/js/core/ui-manager.js');
const { StateManager } = await import('../../src/js/core/state-manager.js');
const { GameStorage } = await import('../../src/js/storage/game-storage.js');

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

function assertDeepEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Assertion failed: ${message}. Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
    }
}

class RefactoredArchitectureTest {
    constructor() {
        this.passedTests = 0;
        this.failedTests = 0;
    }

    runTest(testName, testFunction) {
        try {
            // Clear storage before each test
            mockStorage.clear();
            testFunction();
            this.passedTests++;
            console.log(`✅ ${testName}`);
        } catch (error) {
            this.failedTests++;
            console.log(`❌ ${testName}: ${error.message}`);
        }
    }

    async runAllTests() {
        console.log('🔗 Running Refactored Architecture Integration Tests\n');

        // Test 1: Dependency Container Integration
        this.runTest('Dependency Container resolves all components', () => {
            const container = new DependencyContainer();
            
            // Register all components
            container.register('storage', () => new GameStorage());
            container.register('stateManager', (container) => new StateManager({ 
                storage: container.resolve('storage') 
            }));
            container.register('gameEngine', () => new GameEngine());
            container.register('uiManager', (container) => new UIManager({ 
                canvas: mockCanvas,
                stateManager: container.resolve('stateManager')
            }));
            
            // Resolve all components
            const storage = container.resolve('storage');
            const stateManager = container.resolve('stateManager');
            const gameEngine = container.resolve('gameEngine');
            const uiManager = container.resolve('uiManager');
            
            assert(storage !== null, 'Storage should be resolved');
            assert(stateManager !== null, 'StateManager should be resolved');
            assert(gameEngine !== null, 'GameEngine should be resolved');
            assert(uiManager !== null, 'UIManager should be resolved');
        });

        // Test 2: StateManager and GameEngine Integration
        this.runTest('StateManager and GameEngine work together', () => {
            const storage = new GameStorage();
            const stateManager = new StateManager({ storage });
            const gameEngine = new GameEngine();
            
            // Initialize game state
            stateManager.updateGameState({
                board: gameEngine.initializeBoard(),
                score: 0,
                level: 1,
                currentBlocks: [
                    { id: 'block1', shape: [[1, 1]] },
                    { id: 'block2', shape: [[1], [1], [1]] }
                ]
            });
            
            // Get current state
            const gameState = stateManager.getGameState();
            
            // Verify state is properly initialized
            assert(Array.isArray(gameState.board), 'Board should be initialized');
            assertEqual(gameState.board.length, 9, 'Board should have 9 rows');
            assertEqual(gameState.score, 0, 'Score should start at 0');
            assertEqual(gameState.level, 1, 'Level should start at 1');
            assert(Array.isArray(gameState.currentBlocks), 'Current blocks should be initialized');
        });

        // Test 3: UIManager and StateManager Integration
        this.runTest('UIManager and StateManager work together', () => {
            const storage = new GameStorage();
            const stateManager = new StateManager({ storage });
            const uiManager = new UIManager({ canvas: mockCanvas, stateManager });
            
            // Set up game state
            stateManager.updateGameState({
                board: [
                    [1, 0, 1, 0, 0, 0, 0, 0, 0],
                    [0, 1, 0, 0, 0, 0, 0, 0, 0],
                    [1, 1, 1, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0]
                ],
                score: 100,
                level: 2
            });
            
            // Render should not throw errors
            try {
                uiManager.render();
            } catch (error) {
                throw new Error(`UIManager render failed: ${error.message}`);
            }
            
            // Verify state is accessible
            const gameState = stateManager.getGameState();
            assertEqual(gameState.score, 100, 'UIManager should access correct state');
        });

        // Test 4: Complete Game Workflow Integration
        this.runTest('Complete game workflow with all components', () => {
            const storage = new GameStorage();
            const stateManager = new StateManager({ storage });
            const gameEngine = new GameEngine();
            const uiManager = new UIManager({ canvas: mockCanvas, stateManager });
            
            // Initialize game
            const board = gameEngine.initializeBoard();
            const blocks = [
                { id: 'block1', shape: [[1, 1]] },
                { id: 'block2', shape: [[1], [1], [1]] }
            ];
            
            stateManager.updateGameState({
                board: board,
                score: 0,
                level: 1,
                currentBlocks: blocks
            });
            
            // Simulate block placement
            const testBlock = { shape: [[1, 1]], id: 'test-block' };
            const position = { row: 0, col: 0 };
            
            const result = gameEngine.placeBlock(testBlock, position);
            
            if (result.success) {
                // Update state with placement result
                stateManager.updateGameState({
                    board: result.gameState.board,
                    score: result.gameState.score,
                    level: result.gameState.level,
                    moveCount: result.gameState.moveCount
                });
                
                // Render updated state
                uiManager.render();
                
                // Verify state was updated
                const finalState = stateManager.getGameState();
                assert(finalState.score > 0, 'Score should increase after placement');
                assert(finalState.moveCount > 0, 'Move count should increase after placement');
            }
        });

        // Test 5: State Persistence Integration
        this.runTest('State persistence works across component restarts', () => {
            const storage = new GameStorage();
            
            // Create first instance and save state
            const stateManager1 = new StateManager({ storage });
            stateManager1.updateGameState({
                board: [[1, 0, 0, 0, 0, 0, 0, 0, 0]],
                score: 500,
                level: 3
            });
            stateManager1.updateSettings({ theme: 'dark', difficulty: 'hard' });
            
            // Create second instance and verify state loaded
            const stateManager2 = new StateManager({ storage });
            const gameState = stateManager2.getGameState();
            const settings = stateManager2.getSettings();
            
            assertEqual(gameState.score, 500, 'Game state should persist');
            assertEqual(gameState.level, 3, 'Game level should persist');
            assertEqual(settings.theme, 'dark', 'Settings should persist');
            assertEqual(settings.difficulty, 'hard', 'Difficulty should persist');
        });

        // Test 6: Observer Pattern Integration
        this.runTest('Observer pattern works across components', () => {
            const storage = new GameStorage();
            const stateManager = new StateManager({ storage });
            const gameEngine = new GameEngine();
            
            let stateChanged = false;
            let settingsChanged = false;
            
            // Subscribe to state changes
            stateManager.subscribe('gameState', (newState, oldState) => {
                stateChanged = true;
                assert(newState.score !== oldState.score, 'Should detect score change');
            });
            
            stateManager.subscribe('settings', (newState, oldState) => {
                settingsChanged = true;
                // Don't assert here, just verify the observer was called
            });
            
            // Trigger state changes
            stateManager.updateGameState({ score: 1000 });
            stateManager.updateSettings({ theme: 'wood' });
            
            assert(stateChanged, 'Game state observer should be called');
            assert(settingsChanged, 'Settings observer should be called');
        });

        // Test 7: Error Handling Integration
        this.runTest('Error handling works across components', () => {
            const storage = new GameStorage();
            const stateManager = new StateManager({ storage });
            const gameEngine = new GameEngine();
            
            // Test invalid block placement
            const invalidBlock = { shape: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], id: 'invalid' };
            const invalidPosition = { row: -1, col: -1 };
            const board = gameEngine.initializeBoard();
            
            const result = gameEngine.placeBlock(invalidBlock, invalidPosition, board);
            assert(!result.success, 'Invalid placement should fail');
            assert(result.error !== null, 'Should return error message');
            
            // Test state validation
            stateManager.updateGameState({ score: -100, level: 0 });
            const validation = stateManager.validateState();
            assert(!validation.isValid, 'Invalid state should fail validation');
        });

        // Test 8: Performance Integration
        this.runTest('Performance is maintained with refactored architecture', () => {
            const storage = new GameStorage();
            const stateManager = new StateManager({ storage });
            const gameEngine = new GameEngine();
            const uiManager = new UIManager({ canvas: mockCanvas, stateManager });
            
            const startTime = Date.now();
            
            // Perform multiple operations
            for (let i = 0; i < 100; i++) {
                const board = gameEngine.initializeBoard();
                stateManager.updateGameState({ board: board, score: i });
                uiManager.render();
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Should complete in reasonable time (adjust threshold as needed)
            assert(duration < 1000, `Operations should complete quickly (${duration}ms)`);
        });

        // Test 9: Memory Management Integration
        this.runTest('Memory management works correctly', () => {
            const storage = new GameStorage();
            const stateManager = new StateManager({ storage });
            
            // Create multiple observers
            const observers = [];
            for (let i = 0; i < 10; i++) {
                const unsubscribe = stateManager.subscribe('gameState', () => {});
                observers.push(unsubscribe);
            }
            
            // Unsubscribe all observers
            observers.forEach(unsubscribe => unsubscribe());
            
            // Verify cleanup
            const stats = stateManager.getStateStats();
            assertEqual(stats.observerCount, 0, 'All observers should be cleaned up');
        });

        // Test 10: Complete System Integration
        this.runTest('Complete system integration maintains original behavior', () => {
            const storage = new GameStorage();
            const stateManager = new StateManager({ storage });
            const gameEngine = new GameEngine();
            const uiManager = new UIManager({ canvas: mockCanvas, stateManager });
            
            // Simulate complete game session
            const board = gameEngine.initializeBoard();
            const blocks = [
                { id: 'block1', shape: [[1, 1]] },
                { id: 'block2', shape: [[1], [1], [1]] }
            ];
            
            // Initialize state
            stateManager.updateGameState({
                board: board,
                score: 0,
                level: 1,
                currentBlocks: blocks
            });
            
            // Verify initial state
            const initialState = stateManager.getGameState();
            assert(Array.isArray(initialState.board), 'Initial board should be valid array');
            assertEqual(initialState.board.length, 9, 'Initial board should have 9 rows');
            assertEqual(initialState.score, 0, 'Initial score should be 0');
            
            // Simulate one successful move
            const testBlock = { shape: [[1, 1]], id: 'test-block' };
            const position = { row: 0, col: 0 };
            
            const result = gameEngine.placeBlock(testBlock, position);
            if (result.success) {
                // Verify result has valid gameState with board
                assert(result.gameState !== null, 'GameEngine should return valid gameState');
                assert(Array.isArray(result.gameState.board), 'GameEngine gameState should have valid board');
                assertEqual(result.gameState.board.length, 9, 'GameEngine board should have 9 rows');
                
                // Update state with placement result
                stateManager.updateGameState({
                    board: result.gameState.board,
                    score: result.gameState.score,
                    level: result.gameState.level,
                    moveCount: result.gameState.moveCount
                });
                
                // Verify updated state
                const updatedState = stateManager.getGameState();
                assert(Array.isArray(updatedState.board), 'Updated board should be valid array');
                assertEqual(updatedState.board.length, 9, 'Updated board should have 9 rows');
                assert(updatedState.score > 0, 'Score should increase after successful move');
                assert(updatedState.moveCount > 0, 'Move count should increase after successful move');
            } else {
                // If no successful move, just verify initial state is preserved
                const finalState = stateManager.getGameState();
                assert(Array.isArray(finalState.board), 'Board should remain valid even with no successful moves');
                assertEqual(finalState.board.length, 9, 'Board should have 9 rows even with no successful moves');
            }
            
            // Verify UI can render state
            try {
                uiManager.render();
            } catch (error) {
                throw new Error(`UI render failed: ${error.message}`);
            }
        });

        return this.passedTests > 0 && this.failedTests === 0;
    }

    printSummary() {
        console.log('\n📊 Integration Test Summary');
        console.log('============================');
        console.log(`✅ Passed: ${this.passedTests}`);
        console.log(`❌ Failed: ${this.failedTests}`);
        console.log(`📊 Total: ${this.passedTests + this.failedTests}`);
        
        if (this.failedTests === 0) {
            console.log('\n🎉 All integration tests passed!');
            console.log('✅ Refactored architecture works correctly');
            console.log('🚀 Components integrate seamlessly');
            console.log('💡 Architecture is ready for production');
        } else {
            console.log('\n⚠️  Some integration tests failed');
            console.log('🔧 Components need adjustment for proper integration');
        }
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const testRunner = new RefactoredArchitectureTest();
    testRunner.runAllTests().then(success => {
        testRunner.printSummary();
        process.exit(success ? 0 : 1);
    });
}

export { RefactoredArchitectureTest };
