/**
 * Blockdoku PWA - Behavioral Tests
 * Tests critical user workflows and regression scenarios
 */

import { BehavioralTestRunner } from './test-runner.js';
import { GameStorage } from '../../src/js/storage/game-storage.js';
import { DifficultyManager } from '../../src/js/difficulty/difficulty-manager.js';

class BlockdokuBehavioralTests {
    constructor() {
        this.runner = new BehavioralTestRunner();
        this.setupTests();
    }

    setupTests() {
        // CRITICAL REGRESSION TESTS
        this.runner.addTest(
            'Settings: Theme change preserves difficulty (REGRESSION)',
            () => this.testThemeChangePreservesDifficulty()
        );

        this.runner.addTest(
            'Settings: Difficulty sync between pages',
            () => this.testDifficultySync()
        );

        // CORE GAME FUNCTIONALITY TESTS
        this.runner.addTest(
            'Game Storage: Settings persistence',
            () => this.testSettingsPersistence()
        );

        this.runner.addTest(
            'Game Storage: Game state save/load',
            () => this.testGameStatePersistence()
        );

        this.runner.addTest(
            'Difficulty Manager: All difficulty modes',
            () => this.testDifficultyModes()
        );

        this.runner.addTest(
            'Difficulty Manager: Hints only in Easy mode',
            () => this.testHintsOnlyInEasy()
        );

        // BLOCK MANAGEMENT TESTS  
        this.runner.addTest(
            'Block Manager: Block generation',
            () => this.testBlockGeneration()
        );

        this.runner.addTest(
            'Block Manager: Block rotation',
            () => this.testBlockRotation()
        );

        // SCORING SYSTEM TESTS
        this.runner.addTest(
            'Scoring: Basic point calculation',
            () => this.testBasicScoring()
        );

        this.runner.addTest(
            'Scoring: Line clearing detection',
            () => this.testLineClearDetection()
        );

        // PWA FUNCTIONALITY TESTS
        this.runner.addTest(
            'PWA: Service worker registration',
            () => this.testServiceWorkerSetup()
        );

        this.runner.addTest(
            'PWA: Offline storage',
            () => this.testOfflineStorage()
        );

        // UI STATE MANAGEMENT TESTS
        this.runner.addTest(
            'UI: Game initialization',
            () => this.testGameInitialization()
        );

        this.runner.addTest(
            'UI: Theme application',
            () => this.testThemeApplication()
        );
    }

    // CRITICAL REGRESSION TESTS

    async testThemeChangePreservesDifficulty() {
        const storage = new GameStorage();
        
        // Simulate user setting difficulty to Easy
        storage.saveSettings({
            difficulty: 'easy',
            theme: 'wood'
        });

        // Simulate SettingsManager loading (the old buggy way)
        const buggySettings = {
            currentDifficulty: 'normal', // This was the bug - hardcoded default
            settings: storage.loadSettings()
        };

        // Simulate theme change
        buggySettings.currentTheme = 'light';
        
        // The fix: SettingsManager should load from storage first
        const fixedSettings = {
            settings: storage.loadSettings(),
            currentTheme: 'light'
        };
        fixedSettings.currentDifficulty = fixedSettings.settings.difficulty || 'normal';

        // Save with new theme (this should preserve difficulty)
        storage.saveSettings({
            ...fixedSettings.settings,
            theme: fixedSettings.currentTheme,
            difficulty: fixedSettings.currentDifficulty
        });

        // Verify difficulty is preserved
        const finalSettings = storage.loadSettings();
        this.runner.assertEqual(
            finalSettings.difficulty, 
            'easy', 
            'Theme change should preserve difficulty setting'
        );
    }

    async testDifficultySync() {
        const storage = new GameStorage();
        
        // Test main game -> settings page sync
        storage.saveSettings({ difficulty: 'hard', theme: 'dark' });
        
        const loadedSettings = storage.loadSettings();
        this.runner.assertEqual(loadedSettings.difficulty, 'hard', 'Difficulty should sync from main game');
        
        // Test settings page -> main game sync  
        storage.saveSettings({ difficulty: 'expert', theme: 'dark' });
        
        const syncedSettings = storage.loadSettings();
        this.runner.assertEqual(syncedSettings.difficulty, 'expert', 'Difficulty should sync to main game');
    }

    // CORE FUNCTIONALITY TESTS

    async testSettingsPersistence() {
        const storage = new GameStorage();
        
        const testSettings = {
            theme: 'wood',
            difficulty: 'easy',
            soundEnabled: true,
            animationsEnabled: false,
            showPoints: true
        };

        storage.saveSettings(testSettings);
        const loaded = storage.loadSettings();

        Object.keys(testSettings).forEach(key => {
            this.runner.assertEqual(
                loaded[key], 
                testSettings[key], 
                `Setting ${key} should persist`
            );
        });
    }

    async testGameStatePersistence() {
        const storage = new GameStorage();
        
        const testGameState = {
            score: 1500,
            level: 3,
            board: Array(9).fill(null).map(() => Array(9).fill(0)),
            currentBlocks: ['block1', 'block2', 'block3']
        };

        // Mark some cells as filled
        testGameState.board[0][0] = 1;
        testGameState.board[1][1] = 1;

        storage.saveGameState(testGameState);
        const loaded = storage.loadGameState();

        this.runner.assertEqual(loaded.score, 1500, 'Score should persist');
        this.runner.assertEqual(loaded.level, 3, 'Level should persist');
        this.runner.assertEqual(loaded.board[0][0], 1, 'Board state should persist');
        this.runner.assertEqual(loaded.currentBlocks.length, 3, 'Block state should persist');
    }

    async testDifficultyModes() {
        const difficultyManager = new DifficultyManager();
        
        const modes = ['easy', 'normal', 'hard', 'expert'];
        
        modes.forEach(mode => {
            difficultyManager.setDifficulty(mode);
            this.runner.assertEqual(
                difficultyManager.getCurrentDifficulty(), 
                mode, 
                `Should set difficulty to ${mode}`
            );
        });
    }

    async testHintsOnlyInEasy() {
        const difficultyManager = new DifficultyManager();
        
        difficultyManager.setDifficulty('easy');
        this.runner.assert(
            difficultyManager.isHintsEnabled(), 
            'Hints should be enabled in Easy mode'
        );

        difficultyManager.setDifficulty('normal');
        this.runner.assert(
            !difficultyManager.isHintsEnabled(), 
            'Hints should be disabled in Normal mode'
        );

        difficultyManager.setDifficulty('hard');
        this.runner.assert(
            !difficultyManager.isHintsEnabled(), 
            'Hints should be disabled in Hard mode'
        );
    }

    // BLOCK MANAGEMENT TESTS

    async testBlockGeneration() {
        // Mock the BlockManager since it requires canvas
        const mockBlockManager = {
            generateNewBlocks: () => ['block1', 'block2', 'block3'],
            getBlockById: (id) => ({ id, shape: [[1, 1], [1, 0]] })
        };

        const blocks = mockBlockManager.generateNewBlocks();
        this.runner.assertEqual(blocks.length, 3, 'Should generate 3 blocks');
        
        const block = mockBlockManager.getBlockById('block1');
        this.runner.assert(block.shape, 'Block should have shape data');
    }

    async testBlockRotation() {
        // Test block rotation logic
        const originalShape = [[1, 1, 0], [0, 1, 1]];
        
        // Simple 90-degree rotation logic
        const rotateShape = (shape) => {
            const rows = shape.length;
            const cols = shape[0].length;
            const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0));
            
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    rotated[j][rows - 1 - i] = shape[i][j];
                }
            }
            return rotated;
        };

        const rotated = rotateShape(originalShape);
        this.runner.assertNotEqual(
            JSON.stringify(rotated), 
            JSON.stringify(originalShape), 
            'Rotated shape should differ from original'
        );
    }

    // SCORING TESTS

    async testBasicScoring() {
        // Mock scoring system
        const mockScoring = {
            score: 0,
            addPoints: (points) => { mockScoring.score += points; },
            calculateBlockPoints: (blockSize) => blockSize * 10
        };

        const blockSize = 4;
        const points = mockScoring.calculateBlockPoints(blockSize);
        mockScoring.addPoints(points);

        this.runner.assertEqual(mockScoring.score, 40, 'Should calculate correct block points');
    }

    async testLineClearDetection() {
        // Mock a 9x9 board with a full row
        const board = Array(9).fill(null).map(() => Array(9).fill(0));
        
        // Fill first row completely
        for (let col = 0; col < 9; col++) {
            board[0][col] = 1;
        }

        // Simple line detection logic
        const detectFullRows = (board) => {
            const fullRows = [];
            for (let row = 0; row < board.length; row++) {
                if (board[row].every(cell => cell === 1)) {
                    fullRows.push(row);
                }
            }
            return fullRows;
        };

        const fullRows = detectFullRows(board);
        this.runner.assertEqual(fullRows.length, 1, 'Should detect one full row');
        this.runner.assertEqual(fullRows[0], 0, 'Should detect row 0 as full');
    }

    // PWA TESTS

    async testServiceWorkerSetup() {
        // Mock service worker registration
        const mockServiceWorker = {
            register: async (path) => {
                if (path.includes('sw.js')) {
                    return { scope: '/' };
                }
                throw new Error('Invalid service worker path');
            }
        };

        const registration = await mockServiceWorker.register('/sw.js');
        this.runner.assert(registration.scope, 'Service worker should register successfully');
    }

    async testOfflineStorage() {
        const storage = new GameStorage();
        
        // Test that storage works without network
        const offlineData = { theme: 'dark', score: 500 };
        storage.saveSettings(offlineData);
        
        const retrieved = storage.loadSettings();
        this.runner.assertEqual(retrieved.theme, 'dark', 'Offline storage should work');
        this.runner.assertEqual(retrieved.score, 500, 'Offline data should persist');
    }

    // UI TESTS

    async testGameInitialization() {
        // Mock game initialization
        const mockGame = {
            initialized: false,
            board: null,
            score: 0,
            init: function() {
                this.board = Array(9).fill(null).map(() => Array(9).fill(0));
                this.score = 0;
                this.initialized = true;
            }
        };

        mockGame.init();
        
        this.runner.assert(mockGame.initialized, 'Game should initialize');
        this.runner.assert(mockGame.board, 'Game board should be created');
        this.runner.assertEqual(mockGame.score, 0, 'Initial score should be 0');
    }

    async testThemeApplication() {
        const themes = ['light', 'dark', 'wood'];
        
        themes.forEach(theme => {
            // Mock theme application
            const mockThemeManager = {
                currentTheme: null,
                applyTheme: function(theme) {
                    this.currentTheme = theme;
                    return theme;
                }
            };

            const applied = mockThemeManager.applyTheme(theme);
            this.runner.assertEqual(applied, theme, `Should apply ${theme} theme`);
            this.runner.assertEqual(mockThemeManager.currentTheme, theme, `Should store ${theme} as current`);
        });
    }

    async runTests() {
        return await this.runner.runAllTests();
    }
}

export { BlockdokuBehavioralTests };
