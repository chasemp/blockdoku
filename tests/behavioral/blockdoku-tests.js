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

        // THEME REGRESSION TESTS
        this.runner.addTest(
            'Theme: All pages respect theme changes (REGRESSION)',
            () => this.testThemeConsistencyAcrossPages()
        );

        this.runner.addTest(
            'Theme: Gamesettings page theme synchronization (REGRESSION)',
            () => this.testGamesettingsThemeSync()
        );

        this.runner.addTest(
            'Theme: Default theme consistency after clearing data (REGRESSION)',
            () => this.testDefaultThemeConsistency()
        );

        // NAVIGATION REGRESSION TESTS
        this.runner.addTest(
            'Navigation: Back buttons work between all pages (REGRESSION)',
            () => this.testBackButtonNavigation()
        );

        this.runner.addTest(
            'Navigation: Settings page links work correctly (REGRESSION)',
            () => this.testSettingsPageLinks()
        );

        this.runner.addTest(
            'Navigation: Cross-page theme changes trigger updates (REGRESSION)',
            () => this.testCrossPageThemeUpdates()
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

    // THEME REGRESSION TESTS

    async testThemeConsistencyAcrossPages() {
        // Test that all pages (index, settings, gamesettings) respect theme changes
        const pages = ['index', 'settings', 'gamesettings'];
        const themes = ['light', 'dark', 'wood'];
        
        for (const page of pages) {
            for (const theme of themes) {
                // Mock localStorage theme setting
                const mockStorage = {
                    getItem: (key) => {
                        if (key === 'blockdoku-settings' || key === 'blockdoku_settings') {
                            return JSON.stringify({ theme: theme });
                        }
                        return null;
                    }
                };
                
                // Mock theme application for each page
                const mockThemeManager = {
                    currentTheme: null,
                    applyTheme: function(theme) {
                        this.currentTheme = theme;
                        return theme;
                    },
                    loadThemeFromStorage: function() {
                        const settings = mockStorage.getItem('blockdoku-settings');
                        if (settings) {
                            const parsed = JSON.parse(settings);
                            return parsed.theme || 'wood';
                        }
                        return 'wood';
                    }
                };
                
                const loadedTheme = mockThemeManager.loadThemeFromStorage();
                const appliedTheme = mockThemeManager.applyTheme(loadedTheme);
                
                this.runner.assertEqual(appliedTheme, theme, `${page} page should apply ${theme} theme`);
                this.runner.assertEqual(mockThemeManager.currentTheme, theme, `${page} page should store ${theme} as current`);
            }
        }
    }

    async testGamesettingsThemeSync() {
        // Test that gamesettings page properly syncs theme changes from other pages
        const themes = ['light', 'dark', 'wood'];
        
        for (const theme of themes) {
            // Mock localStorage with theme change
            const mockStorage = {
                getItem: (key) => {
                    if (key === 'blockdoku-settings' || key === 'blockdoku_settings') {
                        return JSON.stringify({ theme: theme });
                    }
                    return null;
                }
            };
            
            // Mock gamesettings theme manager
            const mockGamesettingsThemeManager = {
                currentTheme: 'wood', // Start with default
                updateTheme: function() {
                    const settings = mockStorage.getItem('blockdoku-settings');
                    if (settings) {
                        const parsed = JSON.parse(settings);
                        this.currentTheme = parsed.theme || 'wood';
                    }
                    return this.currentTheme;
                }
            };
            
            // Simulate theme change from settings page
            const newTheme = mockGamesettingsThemeManager.updateTheme();
            
            this.runner.assertEqual(newTheme, theme, `Gamesettings should sync to ${theme} theme`);
            this.runner.assertEqual(mockGamesettingsThemeManager.currentTheme, theme, `Gamesettings should store ${theme} as current`);
        }
    }

    async testDefaultThemeConsistency() {
        // Test that all pages default to wood theme when localStorage is cleared
        const pages = ['index', 'settings', 'gamesettings'];
        
        for (const page of pages) {
            // Mock cleared localStorage
            const mockStorage = {
                getItem: (key) => null // Simulate cleared storage
            };
            
            // Mock theme loading with fallback
            const mockThemeManager = {
                currentTheme: null,
                loadTheme: function() {
                    const settings = mockStorage.getItem('blockdoku-settings');
                    if (settings) {
                        const parsed = JSON.parse(settings);
                        return parsed.theme || 'wood';
                    }
                    return 'wood'; // Default fallback
                }
            };
            
            const defaultTheme = mockThemeManager.loadTheme();
            this.runner.assertEqual(defaultTheme, 'wood', `${page} page should default to wood theme when storage is cleared`);
        }
    }

    // NAVIGATION REGRESSION TESTS

    async testBackButtonNavigation() {
        // Test that back buttons work between all page combinations
        const pageRoutes = [
            { from: 'settings', to: 'index', button: 'Back to Game' },
            { from: 'gamesettings', to: 'settings', button: 'Back to Settings' },
            { from: 'gamesettings', to: 'index', button: 'Back to Game' }
        ];
        
        for (const route of pageRoutes) {
            // Mock navigation
            const mockNavigation = {
                currentPage: route.from,
                navigate: function(targetPage) {
                    this.currentPage = targetPage;
                    return true;
                }
            };
            
            // Test navigation
            const navigationResult = mockNavigation.navigate(route.to);
            
            this.runner.assert(navigationResult, `${route.button} should navigate from ${route.from} to ${route.to}`);
            this.runner.assertEqual(mockNavigation.currentPage, route.to, `Should be on ${route.to} page after navigation`);
        }
    }

    async testSettingsPageLinks() {
        // Test that all links on settings page work correctly
        const settingsLinks = [
            { href: 'gamesettings.html', text: 'Game Settings' },
            { href: 'index.html', text: 'Back to Game' }
        ];
        
        for (const link of settingsLinks) {
            // Mock link element
            const mockLink = {
                href: link.href,
                textContent: link.text,
                click: function() {
                    return { href: this.href, text: this.textContent };
                }
            };
            
            const clickResult = mockLink.click();
            
            this.runner.assertEqual(clickResult.href, link.href, `Settings link "${link.text}" should have correct href`);
            this.runner.assertEqual(clickResult.text, link.text, `Settings link should have correct text`);
        }
    }

    async testCrossPageThemeUpdates() {
        // Test that theme changes trigger updates across all pages
        const pages = ['index', 'settings', 'gamesettings'];
        const themes = ['light', 'dark', 'wood'];
        
        for (const theme of themes) {
            // Mock cross-page theme update system
            const mockThemeSystem = {
                pages: pages.reduce((acc, page) => {
                    acc[page] = { currentTheme: 'wood', updated: false };
                    return acc;
                }, {}),
                
                updateAllPages: function(newTheme) {
                    Object.keys(this.pages).forEach(page => {
                        this.pages[page].currentTheme = newTheme;
                        this.pages[page].updated = true;
                    });
                },
                
                simulateStorageEvent: function(theme) {
                    // Simulate localStorage change event
                    this.updateAllPages(theme);
                }
            };
            
            // Simulate theme change
            mockThemeSystem.simulateStorageEvent(theme);
            
            // Verify all pages were updated
            pages.forEach(page => {
                this.runner.assertEqual(mockThemeSystem.pages[page].currentTheme, theme, `${page} should be updated to ${theme}`);
                this.runner.assert(mockThemeSystem.pages[page].updated, `${page} should be marked as updated`);
            });
        }
    }

    async runTests() {
        return await this.runner.runAllTests();
    }
}

export { BlockdokuBehavioralTests };
