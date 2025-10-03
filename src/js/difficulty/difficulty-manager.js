/**
 * Blockdoku PWA - Difficulty Management System
 * Handles difficulty levels, rules, and game mechanics
 */

export class DifficultyManager {
    constructor(game = null) {
        this.currentDifficulty = 'normal';
        this.difficultySettings = this.initializeDifficultySettings();
        this.gameRules = this.initializeGameRules();
        this.game = game; // Reference to game for checking user settings
    }
    
    initializeDifficultySettings() {
        return {
            easy: {
                name: 'Easy',
                shortDescription: 'Larger blocks, slower pace',
                description: 'Larger blocks, slower pace, hints available',
                blockSizeRange: [2, 4], // Only 2x2 to 4x4 blocks
                allowedShapes: ['square2x2', 'square3x3', 'l2x2', 'line2', 'line3'],
                scoreMultiplier: 1.5,
                timeLimit: null,
                hintsEnabled: true,
                blockGenerationDelay: 2000, // 2 seconds between new blocks
                visualHints: true
            },
            normal: {
                name: 'Normal',
                shortDescription: 'Standard block variety, moderate pace',
                description: 'Standard block variety, moderate pace',
                blockSizeRange: [1, 5], // 1x1 to 5x5 blocks
                allowedShapes: 'all', // All available shapes
                scoreMultiplier: 1.0,
                timeLimit: null,
                hintsEnabled: false,
                blockGenerationDelay: 1500, // 1.5 seconds between new blocks
                visualHints: false
            },
            hard: {
                name: 'Hard',
                shortDescription: 'Smaller blocks, faster pace',
                description: 'Smaller blocks, faster pace, no hints',
                blockSizeRange: [1, 3], // 1x1 to 3x3 blocks
                allowedShapes: ['single', 'line2', 'line3', 'l2x2', 't3x2', 'z3x2'],
                scoreMultiplier: 0.8,
                timeLimit: null, // User configurable via countdown duration setting
                hintsEnabled: false,
                blockGenerationDelay: 1000, // 1 second between new blocks
                visualHints: false
            },
            expert: {
                name: 'Expert',
                shortDescription: 'Complex shapes, time pressure',
                description: 'Complex shapes, time pressure, limited moves',
                blockSizeRange: [1, 4], // 1x1 to 4x4 blocks
                allowedShapes: 'all', // All available shapes
                scoreMultiplier: 0.5,
                timeLimit: null, // User configurable via countdown duration setting
                hintsEnabled: false,
                blockGenerationDelay: 800, // 0.8 seconds between new blocks
                visualHints: false,
                moveLimit: 50 // Limited moves
            }
        };
    }
    
    /**
     * Generate detailed description with dynamic defaults for game settings page
     */
    getDetailedDescription(difficulty, difficultySettingsManager) {
        const difficultyInfo = this.difficultySettings[difficulty];
        if (!difficultyInfo) return '';
        
        const shortDesc = difficultyInfo.shortDescription;
        
        // Get the actual defaults for this difficulty from the settings manager
        if (!difficultySettingsManager || !difficultySettingsManager.difficultyDefaults) {
            return shortDesc;
        }
        
        const defaults = difficultySettingsManager.difficultyDefaults[difficulty];
        if (!defaults) return shortDesc;
        
        // Build list of enabled features
        const enabledFeatures = [];
        
        if (defaults.enableHints) enabledFeatures.push('Enable Hints');
        if (defaults.showPoints) enabledFeatures.push('Show Block Points');
        if (defaults.enableTimer) enabledFeatures.push('Enable Timer');
        if (defaults.enablePetrification) enabledFeatures.push('Enable Petrification');
        if (defaults.enableDeadPixels) enabledFeatures.push('Enable Dead Pixels');
        if (defaults.showPersonalBests) enabledFeatures.push('Enable Personal Best');
        if (defaults.showSpeedTimer) enabledFeatures.push('Show Speed Timer');
        if (defaults.enablePrizeRecognition) enabledFeatures.push('Enable Prize Recognition');
        if (defaults.pieceTimeoutEnabled) enabledFeatures.push('Enable Piece Timeout');
        
        // Add speed mode if not ignored
        if (defaults.speedMode && defaults.speedMode !== 'ignored') {
            const speedModeLabel = defaults.speedMode.charAt(0).toUpperCase() + defaults.speedMode.slice(1);
            enabledFeatures.push(`Speed Tracking: ${speedModeLabel}`);
        }
        
        // Combine short description with defaults
        if (enabledFeatures.length > 0) {
            return `${shortDesc}\nDefaults: ${enabledFeatures.join(', ')}`;
        } else {
            return `${shortDesc}\nDefaults: None`;
        }
    }
    
    /**
     * Generate comparison bubbles showing differences from Normal difficulty
     * Uses actual effective settings (defaults + user overrides)
     */
    getComparisonBubbles(difficulty, difficultySettingsManager) {
        if (!difficultySettingsManager || !difficultySettingsManager.difficultyDefaults) {
            return [];
        }
        
        // Get PURE difficulty defaults (without user overrides) for comparison
        const normalDefaults = difficultySettingsManager.difficultyDefaults['normal'] || {};
        const currentDefaults = difficultySettingsManager.difficultyDefaults[difficulty] || {};
        
        // Debug logging for difficulty comparison
        if (difficulty === 'hard') {
            console.log('🔍 Difficulty Defaults Comparison (Pure):', {
                difficulty,
                normalDefaults: { 
                    enableHints: normalDefaults.enableHints,
                    showPersonalBests: normalDefaults.showPersonalBests,
                    showSpeedTimer: normalDefaults.showSpeedTimer,
                    enableTimer: normalDefaults.enableTimer
                },
                currentDefaults: { 
                    enableHints: currentDefaults.enableHints,
                    showPersonalBests: currentDefaults.showPersonalBests,
                    showSpeedTimer: currentDefaults.showSpeedTimer,
                    enableTimer: currentDefaults.enableTimer
                }
            });
        }
        
        if (!normalDefaults || !currentDefaults || difficulty === 'normal') {
            return [];
        }
        
        const bubbles = [];
        
        // Define the settings we want to show bubbles for (short labels)
        const settingsToCompare = [
            { key: 'enableHints', label: 'Hints', emoji: '💡' },
            { key: 'showPoints', label: 'Points', emoji: '🔢' },
            { key: 'enableTimer', label: 'Countdown', emoji: '⏳' },
            { key: 'showPersonalBests', label: 'Best', emoji: '🏆' },
            { key: 'showSpeedTimer', label: 'Speed', emoji: '⚡' },
            { key: 'enablePrizeRecognition', label: 'Prizes', emoji: '🎉' },
            { key: 'pieceTimeoutEnabled', label: 'Timeout', emoji: '⏰' },
            { key: 'enableWildBlocks', label: 'Wild', emoji: '🔥' }
        ];
        
        // Special handling for speed mode - compare pure defaults
        if (currentDefaults.speedMode !== normalDefaults.speedMode) {
            const speedModeLabel = currentDefaults.speedMode === 'bonus' ? 'Bonus' : 
                                   currentDefaults.speedMode === 'punishment' ? 'Punish' : 'Speed';
            bubbles.push({
                type: currentDefaults.speedMode === 'ignored' ? 'disabled' : 'enabled',
                label: speedModeLabel,
                emoji: '🏃'
            });
        }
        
        // Compare each setting with normal defaults (pure comparison)
        settingsToCompare.forEach(setting => {
            const normalValue = normalDefaults[setting.key];
            const currentValue = currentDefaults[setting.key];
            
            // Debug logging for difficulty comparison
            if (difficulty === 'hard' && setting.key === 'enableHints') {
                console.log('🔍 Difficulty Comparison Debug (Pure Defaults):', {
                    difficulty,
                    settingKey: setting.key,
                    normalValue,
                    currentValue,
                    different: normalValue !== currentValue
                });
            }
            
            if (normalValue !== currentValue) {
                bubbles.push({
                    type: currentValue ? 'enabled' : 'disabled',
                    label: setting.label,
                    emoji: setting.emoji
                });
            }
        });
        
        return bubbles;
    }
    
    initializeGameRules() {
        return {
            // Base scoring values
            basePoints: {
                single: 10,
                line: 100,
                combo: 50
            },
            
            // Level progression
            levelThresholds: {
                easy: [100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200, 6600],
                normal: [200, 500, 900, 1400, 2000, 2700, 3500, 4400, 5400, 6500],
                hard: [150, 400, 700, 1100, 1600, 2200, 2900, 3700, 4600, 5600],
                expert: [100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250]
            },
            
            // Combo requirements
            comboThresholds: {
                easy: 2, // Easier to get combos
                normal: 3,
                hard: 4,
                expert: 5 // Harder to get combos
            }
        };
    }
    
    setDifficulty(difficulty) {
        if (this.difficultySettings[difficulty]) {
            this.currentDifficulty = difficulty;
            return true;
        }
        return false;
    }
    
    getCurrentDifficulty() {
        return this.currentDifficulty;
    }
    
    getDifficultySettings() {
        return this.difficultySettings[this.currentDifficulty];
    }
    
    getScoreMultiplier() {
        return this.difficultySettings[this.currentDifficulty].scoreMultiplier;
    }
    
    getTimeLimit() {
        // Check if user has enabled countdown timer with custom duration
        if (this.game && this.game.storage) {
            const settings = this.game.storage.loadSettings();
            if (settings.enableTimer && settings.countdownDuration) {
                return settings.countdownDuration * 60; // Convert minutes to seconds
            }
        }
        
        // Fall back to difficulty-specific time limit
        return this.difficultySettings[this.currentDifficulty].timeLimit;
    }
    
    isHintsEnabled() {
        // User setting takes precedence over difficulty setting
        // If user has explicitly enabled hints, allow them regardless of difficulty
        if (this.game && this.game.enableHints) {
            return true;
        }
        
        // Otherwise, use difficulty-specific setting
        return this.difficultySettings[this.currentDifficulty].hintsEnabled;
    }
    
    
    getBlockGenerationDelay() {
        return this.difficultySettings[this.currentDifficulty].blockGenerationDelay;
    }
    
    hasVisualHints() {
        return this.difficultySettings[this.currentDifficulty].visualHints;
    }
    
    getMoveLimit() {
        return this.difficultySettings[this.currentDifficulty].moveLimit || null;
    }
    
    getAllowedShapes() {
        return this.difficultySettings[this.currentDifficulty].allowedShapes;
    }
    
    getBlockSizeRange() {
        return this.difficultySettings[this.currentDifficulty].blockSizeRange;
    }
    
    getLevelThresholds() {
        return this.gameRules.levelThresholds[this.currentDifficulty];
    }
    
    getComboThreshold() {
        return this.gameRules.comboThresholds[this.currentDifficulty];
    }
    
    calculateScore(baseScore, combo = 1) {
        // Combo bonus is handled within ScoringSystem now; only apply difficulty multiplier
        const multiplier = this.getScoreMultiplier();
        return Math.floor(baseScore * multiplier);
    }
    
    shouldGenerateNewBlocks(score, level) {
        const thresholds = this.getLevelThresholds();
        return level <= thresholds.length && score >= thresholds[level - 1];
    }
    
    getDifficultyInfo() {
        const settings = this.getDifficultySettings();
        return {
            name: settings.name,
            description: settings.description,
            features: {
                hints: settings.hintsEnabled,
                timer: settings.timeLimit !== null,
                moveLimit: settings.moveLimit !== null
            }
        };
    }
    
    // Get available difficulties for UI
    getAvailableDifficulties() {
        return Object.keys(this.difficultySettings).map(key => ({
            key,
            ...this.difficultySettings[key]
        }));
    }
    
    // Reset difficulty to default
    reset() {
        this.currentDifficulty = 'normal';
    }
}
