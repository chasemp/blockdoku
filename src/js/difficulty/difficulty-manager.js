/**
 * Blockdoku PWA - Difficulty Management System
 * Handles difficulty levels, rules, and game mechanics
 */

export class DifficultyManager {
    constructor() {
        this.currentDifficulty = 'normal';
        this.difficultySettings = this.initializeDifficultySettings();
        this.gameRules = this.initializeGameRules();
    }
    
    initializeDifficultySettings() {
        return {
            easy: {
                name: 'Easy',
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
                description: 'Smaller blocks, faster pace, no hints',
                blockSizeRange: [1, 3], // 1x1 to 3x3 blocks
                allowedShapes: ['single', 'line2', 'line3', 'l2x2', 't3x2', 'z3x2'],
                scoreMultiplier: 0.8,
                timeLimit: null,
                hintsEnabled: false,
                blockGenerationDelay: 1000, // 1 second between new blocks
                visualHints: false
            },
            expert: {
                name: 'Expert',
                description: 'Complex shapes, time pressure, limited moves',
                blockSizeRange: [1, 4], // 1x1 to 4x4 blocks
                allowedShapes: 'all', // All available shapes
                scoreMultiplier: 0.5,
                timeLimit: 300, // 5 minutes
                hintsEnabled: false,
                blockGenerationDelay: 800, // 0.8 seconds between new blocks
                visualHints: false,
                moveLimit: 50 // Limited moves
            }
        };
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
        return this.difficultySettings[this.currentDifficulty].timeLimit;
    }
    
    isHintsEnabled() {
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
        const multiplier = this.getScoreMultiplier();
        const comboBonus = combo > 1 ? (combo - 1) * this.gameRules.basePoints.combo : 0;
        return Math.floor((baseScore + comboBonus) * multiplier);
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
