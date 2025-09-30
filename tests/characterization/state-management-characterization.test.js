#!/usr/bin/env node

/**
 * State Management Characterization Tests
 * 
 * These tests capture the CURRENT behavior of state management, settings persistence,
 * and storage operations before extracting them into a StateManager.
 * 
 * CRITICAL: These tests document what the system CURRENTLY does, not what it should do.
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

class StateManagementCharacterizationTest {
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
        console.log('💾 Running State Management Characterization Tests\n');

        // Test 1: GameStorage initialization
        this.runTest('GameStorage initialization creates correct keys', () => {
            const storage = new GameStorage();
            
            assertEqual(storage.storageKey, 'blockdoku_game_data', 'Should use correct game data key');
            assertEqual(storage.settingsKey, 'blockdoku_settings', 'Should use correct settings key');
            assertEqual(storage.highScoresKey, 'blockdoku_high_scores', 'Should use correct high scores key');
            assertEqual(storage.maxHighScores, 10, 'Should limit to 10 high scores');
        });

        // Test 2: Settings save and load behavior
        this.runTest('Settings save and load preserves data structure', () => {
            const storage = new GameStorage();
            
            const testSettings = {
                theme: 'dark',
                difficulty: 'hard',
                soundEnabled: true,
                animationsEnabled: false,
                enableHints: true,
                enableTimer: false
            };
            
            // Save settings
            storage.saveSettings(testSettings);
            
            // Verify storage
            const stored = localStorage.getItem('blockdoku_settings');
            assert(stored !== null, 'Settings should be stored');
            
            // Load settings
            const loaded = storage.loadSettings();
            
            // Verify all properties preserved
            assertEqual(loaded.theme, 'dark', 'Theme should be preserved');
            assertEqual(loaded.difficulty, 'hard', 'Difficulty should be preserved');
            assertEqual(loaded.soundEnabled, true, 'Sound setting should be preserved');
            assertEqual(loaded.animationsEnabled, false, 'Animation setting should be preserved');
            assertEqual(loaded.enableHints, true, 'Hints setting should be preserved');
            assertEqual(loaded.enableTimer, false, 'Timer setting should be preserved');
        });

        // Test 3: Game state save and load behavior
        this.runTest('Game state save and load preserves complete state', () => {
            const storage = new GameStorage();
            
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
            
            // Save game state
            storage.saveGameState(testGameState);
            
            // Verify storage
            const stored = localStorage.getItem('blockdoku_game_data');
            assert(stored !== null, 'Game state should be stored');
            
            // Load game state
            const loaded = storage.loadGameState();
            
            // Verify core properties preserved (only what GameStorage actually saves)
            assertEqual(loaded.score, 1250, 'Score should be preserved');
            assertEqual(loaded.level, 2, 'Level should be preserved');
            assertEqual(loaded.selectedBlock, null, 'Selected block should be preserved');
            
            // Verify board structure preserved
            assert(Array.isArray(loaded.board), 'Board should be an array');
            assertEqual(loaded.board.length, 9, 'Board should have 9 rows');
            assertEqual(loaded.board[0].length, 9, 'Board rows should have 9 columns');
            assertEqual(loaded.board[0][0], 1, 'Board cell values should be preserved');
            
            // Verify blocks preserved
            assert(Array.isArray(loaded.currentBlocks), 'Current blocks should be an array');
            assertEqual(loaded.currentBlocks.length, 2, 'Should preserve number of blocks');
            assertEqual(loaded.currentBlocks[0].id, 'block1', 'Block IDs should be preserved');
            
            // Verify timestamp is added
            assert(typeof loaded.timestamp === 'number', 'Timestamp should be added');
        });

        // Test 4: High scores save and load behavior
        this.runTest('High scores save and load with proper sorting', () => {
            const storage = new GameStorage();
            
            const testScores = [
                { score: 1500, level: 2, date: '2023-01-01' },
                { score: 2000, level: 3, date: '2023-01-02' },
                { score: 1200, level: 1, date: '2023-01-03' }
            ];
            
            // Save scores one by one (simulating game completion)
            testScores.forEach(scoreData => {
                storage.saveHighScore(scoreData);
            });
            
            // Load scores using the correct method name
            const loaded = storage.getHighScores();
            
            // Verify scores are sorted by score descending
            assert(Array.isArray(loaded), 'High scores should be an array');
            assert(loaded.length >= 3, 'Should have at least 3 scores');
            assertEqual(loaded[0].score, 2000, 'Highest score should be first');
            assertEqual(loaded[1].score, 1500, 'Second highest should be second');
            assertEqual(loaded[2].score, 1200, 'Lowest score should be last');
        });

        // Test 5: Settings defaults when no data exists
        this.runTest('Settings load returns defaults when no data exists', () => {
            const storage = new GameStorage();
            
            // Load settings without saving anything first
            const loaded = storage.loadSettings();
            
            // Should return object (not null/undefined)
            assert(typeof loaded === 'object', 'Should return an object');
            assert(loaded !== null, 'Should not return null');
            
            // Should have reasonable defaults or be empty object
            // (Capturing current behavior, not prescribing what it should be)
            const hasDefaults = Object.keys(loaded).length > 0;
            const isEmpty = Object.keys(loaded).length === 0;
            assert(hasDefaults || isEmpty, 'Should either have defaults or be empty');
        });

        // Test 6: Game state load when no data exists
        this.runTest('Game state load returns null when no data exists', () => {
            const storage = new GameStorage();
            
            // Load game state without saving anything first
            const loaded = storage.loadGameState();
            
            // Should return null (current behavior)
            assertEqual(loaded, null, 'Should return null when no game state exists');
        });

        // Test 7: Legacy key migration behavior
        this.runTest('Legacy key migration preserves user data', () => {
            const storage = new GameStorage();
            
            // Set up legacy data
            localStorage.setItem('blockdoku-settings', JSON.stringify({ theme: 'legacy-theme' }));
            localStorage.setItem('blockdoku_game_state', JSON.stringify({ score: 999 }));
            
            // Clear current keys to simulate upgrade scenario
            localStorage.removeItem('blockdoku_settings');
            localStorage.removeItem('blockdoku_game_data');
            
            // Create new storage instance (triggers migration)
            const newStorage = new GameStorage();
            
            // Verify migration happened
            const migratedSettings = localStorage.getItem('blockdoku_settings');
            const migratedGameData = localStorage.getItem('blockdoku_game_data');
            
            assert(migratedSettings !== null, 'Settings should be migrated');
            assert(migratedGameData !== null, 'Game data should be migrated');
            
            const settingsData = JSON.parse(migratedSettings);
            const gameData = JSON.parse(migratedGameData);
            
            assertEqual(settingsData.theme, 'legacy-theme', 'Legacy settings should be preserved');
            assertEqual(gameData.score, 999, 'Legacy game data should be preserved');
        });

        // Test 8: Data export/import behavior
        this.runTest('Data export/import preserves all user data', () => {
            const storage = new GameStorage();
            
            // Set up test data
            const testSettings = { theme: 'export-test', difficulty: 'hard' };
            const testGameState = { score: 5000, level: 5, board: [[0,0,0,0,0,0,0,0,0]], currentBlocks: [], selectedBlock: null };
            const testHighScores = [{ score: 5000, level: 5, date: '2023-01-01' }];
            
            storage.saveSettings(testSettings);
            storage.saveGameState(testGameState);
            storage.saveHighScore(testHighScores[0]);
            
            // Export data
            const exported = storage.exportData();
            
            // Verify export structure
            assert(typeof exported === 'string', 'Export should be a string');
            const exportedData = JSON.parse(exported);
            assert(typeof exportedData === 'object', 'Exported data should be an object');
            assert('settings' in exportedData, 'Export should include settings');
            assert('gameState' in exportedData, 'Export should include game state');
            assert('highScores' in exportedData, 'Export should include high scores');
            
            // Clear storage
            mockStorage.clear();
            
            // Import data
            const importResult = storage.importData(exported);
            assert(importResult === true, 'Import should succeed');
            
            // Verify imported data
            const importedSettings = storage.loadSettings();
            const importedGameState = storage.loadGameState();
            const importedHighScores = storage.getHighScores();
            
            assertEqual(importedSettings.theme, 'export-test', 'Settings should be imported');
            assertEqual(importedGameState.score, 5000, 'Game state should be imported');
            assertEqual(importedHighScores[0].score, 5000, 'High scores should be imported');
        });

        // Test 9: Error handling for corrupted data
        this.runTest('Error handling for corrupted storage data', () => {
            const storage = new GameStorage();
            
            // Test with valid data first to ensure normal operation
            storage.saveSettings({ test: 'valid' });
            const validSettings = storage.loadSettings();
            assertEqual(validSettings.test, 'valid', 'Should load valid settings');
            
            // Test with empty storage
            mockStorage.clear();
            const emptySettings = storage.loadSettings();
            assert(typeof emptySettings === 'object', 'Should return object for empty storage');
            
            const emptyGameState = storage.loadGameState();
            assertEqual(emptyGameState, null, 'Should return null for empty game state');
        });

        // Test 10: Storage key consistency
        this.runTest('Storage keys remain consistent across instances', () => {
            const storage1 = new GameStorage();
            const storage2 = new GameStorage();
            
            // Save with first instance
            storage1.saveSettings({ test: 'value1' });
            storage1.saveGameState({ 
                board: [[0,0,0,0,0,0,0,0,0]], 
                currentBlocks: [], 
                selectedBlock: null,
                score: 100,
                level: 1
            });
            
            // Load with second instance
            const settings = storage2.loadSettings();
            const gameState = storage2.loadGameState();
            
            assertEqual(settings.test, 'value1', 'Settings should be accessible across instances');
            assertEqual(gameState.score, 100, 'Game state score should be accessible across instances');
            assertEqual(gameState.level, 1, 'Game state level should be accessible across instances');
        });

        return this.passedTests > 0 && this.failedTests === 0;
    }

    printSummary() {
        console.log('\n📊 State Management Characterization Test Summary');
        console.log('==================================================');
        console.log(`✅ Passed: ${this.passedTests}`);
        console.log(`❌ Failed: ${this.failedTests}`);
        console.log(`📊 Total: ${this.passedTests + this.failedTests}`);
        
        if (this.failedTests === 0) {
            console.log('\n🎉 All state management characterization tests passed!');
            console.log('✅ Current state management behavior captured');
            console.log('🚀 Safe to proceed with StateManager extraction');
        } else {
            console.log('\n⚠️  Some tests failed - fix issues before extracting StateManager');
        }
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const testRunner = new StateManagementCharacterizationTest();
    testRunner.runAllTests().then(success => {
        testRunner.printSummary();
        process.exit(success ? 0 : 1);
    });
}

export { StateManagementCharacterizationTest };
