#!/usr/bin/env node

/**
 * StateManager Unit Tests
 * 
 * These tests verify that the extracted StateManager class maintains
 * the same behavior as captured in our characterization tests.
 */

// Mock localStorage for testing
const mockStorage = {
    data: {},
    getItem: function(key) {
        return this.data[key] || null;
    },
    setItem: function(key, value) {
        this.data[key] = value;
    },
    removeItem: function(key) {
        delete this.data[key];
    },
    clear: function() {
        this.data = {};
    }
};

global.localStorage = mockStorage;

// Import after setting up mocks
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

class StateManagerTest {
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
        console.log('💾 Running StateManager Unit Tests\n');

        // Test 1: StateManager initialization
        this.runTest('StateManager initialization with storage', () => {
            const storage = new GameStorage();
            const stateManager = new StateManager({ storage });
            
            assert(stateManager !== null, 'StateManager should be created');
            assert(typeof stateManager.getGameState === 'function', 'Should have getGameState method');
            assert(typeof stateManager.getSettings === 'function', 'Should have getSettings method');
            assert(typeof stateManager.updateGameState === 'function', 'Should have updateGameState method');
            assert(typeof stateManager.updateSettings === 'function', 'Should have updateSettings method');
        });

        // Test 2: Game state management
        this.runTest('Game state management preserves data structure', () => {
            const storage = new GameStorage();
            const stateManager = new StateManager({ storage });
            
            const testGameState = {
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
                score: 1250,
                level: 2,
                currentBlocks: [
                    { id: 'block1', shape: [[1, 1]] },
                    { id: 'block2', shape: [[1], [1], [1]] }
                ],
                selectedBlock: null
            };
            
            // Update game state
            stateManager.updateGameState(testGameState);
            
            // Verify state preserved
            const loaded = stateManager.getGameState();
            assertEqual(loaded.score, 1250, 'Score should be preserved');
            assertEqual(loaded.level, 2, 'Level should be preserved');
            assert(Array.isArray(loaded.board), 'Board should be an array');
            assertEqual(loaded.board.length, 9, 'Board should have 9 rows');
            assertEqual(loaded.board[0][0], 1, 'Board cell values should be preserved');
        });

        // Test 3: Settings management
        this.runTest('Settings management preserves data structure', () => {
            const storage = new GameStorage();
            const stateManager = new StateManager({ storage });
            
            const testSettings = {
                theme: 'dark',
                difficulty: 'hard',
                soundEnabled: true,
                animationsEnabled: false,
                enableHints: true,
                enableTimer: false
            };
            
            // Update settings
            stateManager.updateSettings(testSettings);
            
            // Verify settings preserved
            const loaded = stateManager.getSettings();
            assertEqual(loaded.theme, 'dark', 'Theme should be preserved');
            assertEqual(loaded.difficulty, 'hard', 'Difficulty should be preserved');
            assertEqual(loaded.soundEnabled, true, 'Sound setting should be preserved');
            assertEqual(loaded.animationsEnabled, false, 'Animation setting should be preserved');
            assertEqual(loaded.enableHints, true, 'Hints setting should be preserved');
            assertEqual(loaded.enableTimer, false, 'Timer setting should be preserved');
        });

        // Test 4: State persistence
        this.runTest('State persistence across instances', () => {
            const storage = new GameStorage();
            
            // Create first instance and save state
            const stateManager1 = new StateManager({ storage });
            stateManager1.updateGameState({ score: 500, level: 2 });
            stateManager1.updateSettings({ theme: 'wood', difficulty: 'easy' });
            
            // Create second instance and verify state loaded
            const stateManager2 = new StateManager({ storage });
            const gameState = stateManager2.getGameState();
            const settings = stateManager2.getSettings();
            
            assertEqual(gameState.score, 500, 'Game state should persist across instances');
            assertEqual(gameState.level, 2, 'Game level should persist across instances');
            assertEqual(settings.theme, 'wood', 'Settings should persist across instances');
            assertEqual(settings.difficulty, 'easy', 'Difficulty should persist across instances');
        });

        // Test 5: Observer pattern
        this.runTest('Observer pattern notifies state changes', () => {
            const storage = new GameStorage();
            const stateManager = new StateManager({ storage });
            
            let gameStateChanged = false;
            let settingsChanged = false;
            
            // Subscribe to state changes
            stateManager.subscribe('gameState', (newState, oldState) => {
                gameStateChanged = true;
                assert(newState.score !== oldState.score, 'Should detect score change');
            });
            
            stateManager.subscribe('settings', (newState, oldState) => {
                settingsChanged = true;
                assert(newState.theme !== oldState.theme, 'Should detect theme change');
            });
            
            // Trigger state changes
            stateManager.updateGameState({ score: 1000 });
            stateManager.updateSettings({ theme: 'dark' });
            
            assert(gameStateChanged, 'Game state observer should be called');
            assert(settingsChanged, 'Settings observer should be called');
        });

        // Test 6: State validation
        this.runTest('State validation detects invalid data', () => {
            const storage = new GameStorage();
            const stateManager = new StateManager({ storage });
            
            // Test with valid state
            const validResult = stateManager.validateState();
            assert(validResult.isValid, 'Valid state should pass validation');
            assertEqual(validResult.issues.length, 0, 'Valid state should have no issues');
            
            // Test with invalid state
            stateManager.updateGameState({ score: -100, level: 0 });
            const invalidResult = stateManager.validateState();
            assert(!invalidResult.isValid, 'Invalid state should fail validation');
            assert(invalidResult.issues.length > 0, 'Invalid state should have issues');
        });

        // Test 7: State snapshots
        this.runTest('State snapshots preserve complete state', () => {
            const storage = new GameStorage();
            const stateManager = new StateManager({ storage });
            
            // Set up test state
            stateManager.updateGameState({ score: 750, level: 3 });
            stateManager.updateSettings({ theme: 'dark', difficulty: 'hard' });
            stateManager.updateUIState({ previewPosition: { row: 2, col: 3 } });
            
            // Create snapshot
            const snapshot = stateManager.createSnapshot();
            
            // Verify snapshot structure
            assert(snapshot.gameState !== null, 'Snapshot should include game state');
            assert(snapshot.settings !== null, 'Snapshot should include settings');
            assert(snapshot.uiState !== null, 'Snapshot should include UI state');
            assert(typeof snapshot.timestamp === 'number', 'Snapshot should include timestamp');
            
            // Verify snapshot data
            assertEqual(snapshot.gameState.score, 750, 'Snapshot should preserve game score');
            assertEqual(snapshot.settings.theme, 'dark', 'Snapshot should preserve theme');
            assertEqual(snapshot.uiState.previewPosition.row, 2, 'Snapshot should preserve UI state');
        });

        // Test 8: State restoration
        this.runTest('State restoration from snapshot', () => {
            const storage = new GameStorage();
            const stateManager = new StateManager({ storage });
            
            // Create initial state
            stateManager.updateGameState({ score: 100, level: 1 });
            stateManager.updateSettings({ theme: 'light' });
            
            // Create snapshot
            const snapshot = stateManager.createSnapshot();
            
            // Modify state
            stateManager.updateGameState({ score: 500, level: 3 });
            stateManager.updateSettings({ theme: 'dark' });
            
            // Restore from snapshot
            stateManager.restoreSnapshot(snapshot);
            
            // Verify restoration
            const gameState = stateManager.getGameState();
            const settings = stateManager.getSettings();
            
            assertEqual(gameState.score, 100, 'Should restore original score');
            assertEqual(gameState.level, 1, 'Should restore original level');
            assertEqual(settings.theme, 'light', 'Should restore original theme');
        });

        // Test 9: High scores integration
        this.runTest('High scores integration', () => {
            const storage = new GameStorage();
            const stateManager = new StateManager({ storage });
            
            // Save high score
            const scoreData = { score: 2000, level: 4, date: '2023-01-01' };
            stateManager.saveHighScore(scoreData);
            
            // Get high scores
            const highScores = stateManager.getHighScores();
            
            assert(Array.isArray(highScores), 'High scores should be an array');
            assert(highScores.length >= 1, 'Should have at least one high score');
            assertEqual(highScores[0].score, 2000, 'Should preserve high score');
        });

        // Test 10: Data export/import
        this.runTest('Data export/import functionality', () => {
            const storage = new GameStorage();
            const stateManager = new StateManager({ storage });
            
            // Set up test data
            stateManager.updateGameState({ score: 3000, level: 5 });
            stateManager.updateSettings({ theme: 'wood', difficulty: 'hard' });
            
            // Export data
            const exported = stateManager.exportData();
            assert(typeof exported === 'string', 'Export should return string');
            
            // Clear state
            stateManager.resetGameState();
            stateManager.resetSettings();
            
            // Import data
            const importResult = stateManager.importData(exported);
            assert(importResult === true, 'Import should succeed');
            
            // Verify imported data
            const gameState = stateManager.getGameState();
            const settings = stateManager.getSettings();
            
            assertEqual(gameState.score, 3000, 'Should restore game score');
            assertEqual(settings.theme, 'wood', 'Should restore theme');
        });

        return this.passedTests > 0 && this.failedTests === 0;
    }

    printSummary() {
        console.log('\n📊 StateManager Test Summary');
        console.log('============================');
        console.log(`✅ Passed: ${this.passedTests}`);
        console.log(`❌ Failed: ${this.failedTests}`);
        console.log(`📊 Total: ${this.passedTests + this.failedTests}`);
        
        if (this.failedTests === 0) {
            console.log('\n🎉 All StateManager tests passed!');
            console.log('✅ Extracted StateManager maintains original behavior');
            console.log('🚀 Safe to integrate into main application');
        } else {
            console.log('\n⚠️  Some tests failed - StateManager needs adjustment');
        }
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const testRunner = new StateManagerTest();
    testRunner.runAllTests().then(success => {
        testRunner.printSummary();
        process.exit(success ? 0 : 1);
    });
}

export { StateManagerTest };

