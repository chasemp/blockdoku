/**
 * Manages difficulty-specific settings with defaults and user overrides
 */
export class DifficultySettingsManager {
    constructor(storage) {
        this.storage = storage;
        this.difficultyDefaults = this.initializeDifficultyDefaults();
    }

    /**
     * Define default settings for each difficulty level
     * 
     * IMPORTANT: Game modes (like enableMagicBlocks, enablePetrification, etc.) 
     * should NOT be coupled with difficulty defaults. They should remain false
     * for all difficulties to allow users to enable them independently.
     */
    initializeDifficultyDefaults() {
        return {
            easy: {
                enableHints: true,
                showPoints: true,
                enableTimer: false,
                enablePetrification: false,
                enableDeadPixels: false,
                showPersonalBests: true,
                showSpeedTimer: false,
                speedMode: 'bonus',
                animationsEnabled: true,
                soundEnabled: false,
                pieceTimeoutEnabled: false,
                enablePrizeRecognition: true,
                enableMagicBlocks: false
            },
            normal: {
                enableHints: false,
                showPoints: false,
                enableTimer: false,
                enablePetrification: false,
                enableDeadPixels: false,
                showPersonalBests: false,
                showSpeedTimer: false,
                speedMode: 'ignored',
                animationsEnabled: true,
                soundEnabled: false,
                pieceTimeoutEnabled: false,
                enablePrizeRecognition: false,
                enableMagicBlocks: false
            },
            hard: {
                enableHints: false,
                showPoints: false,
                enableTimer: true,
                enablePetrification: false,
                enableDeadPixels: false,
                showPersonalBests: true,
                showSpeedTimer: true,
                speedMode: 'ignored',
                animationsEnabled: true,
                soundEnabled: false,
                pieceTimeoutEnabled: false,
                enablePrizeRecognition: false,
                enableMagicBlocks: false
            },
            expert: {
                enableHints: false,
                showPoints: false,
                enableTimer: true,
                enablePetrification: false,
                enableDeadPixels: false,
                showPersonalBests: true,
                showSpeedTimer: true,
                speedMode: 'punishment',
                animationsEnabled: true,
                soundEnabled: false,
                pieceTimeoutEnabled: false,
                enablePrizeRecognition: false,
                enableMagicBlocks: false  // Game modes should not be coupled with difficulty defaults
            }
        };
    }

    /**
     * Get settings for a specific difficulty (defaults + user overrides)
     */
    getSettingsForDifficulty(difficulty) {
        const defaults = this.difficultyDefaults[difficulty] || {};
        const userOverrides = this.getUserOverrides(difficulty);
        
        // Debug logging for hints issue
        if (difficulty === 'hard') {
            console.log('🔍 Hard Difficulty Settings Debug:', {
                difficulty,
                defaultHints: defaults.enableHints,
                userOverrides,
                userHintsOverride: userOverrides.enableHints,
                finalHints: { ...defaults, ...userOverrides }.enableHints
            });
        }
        
        // Merge defaults with user overrides
        return { ...defaults, ...userOverrides };
    }

    /**
     * Get user overrides for a specific difficulty
     */
    getUserOverrides(difficulty) {
        const allOverrides = this.storage.loadDifficultyOverrides();
        return allOverrides[difficulty] || {};
    }

    /**
     * Save a setting override for a specific difficulty
     */
    saveSettingOverride(difficulty, settingKey, value) {
        const allOverrides = this.storage.loadDifficultyOverrides();
        if (!allOverrides[difficulty]) {
            allOverrides[difficulty] = {};
        }
        
        const defaults = this.difficultyDefaults[difficulty] || {};
        
        // If the value matches the default, remove the override
        if (value === defaults[settingKey]) {
            delete allOverrides[difficulty][settingKey];
            // Clean up empty difficulty objects
            if (Object.keys(allOverrides[difficulty]).length === 0) {
                delete allOverrides[difficulty];
            }
        } else {
            // Save the override
            allOverrides[difficulty][settingKey] = value;
        }
        
        this.storage.saveDifficultyOverrides(allOverrides);
    }

    /**
     * Reset settings to defaults for a specific difficulty
     */
    resetToDefaults(difficulty) {
        const allOverrides = this.storage.loadDifficultyOverrides();
        delete allOverrides[difficulty];
        this.storage.saveDifficultyOverrides(allOverrides);
    }

    /**
     * Reset all settings to defaults across all difficulties
     */
    resetAllToDefaults() {
        this.storage.saveDifficultyOverrides({});
    }

    /**
     * Get difficulty-specific note for a setting
     */
    getSettingNote(settingKey) {
        const notes = {
            enableHints: {
                easy: "ON for easy",
                normal: "OFF for normal",
                hard: "OFF for hard",
                expert: "OFF for expert"
            },
            showPoints: {
                easy: "ON for easy",
                normal: "OFF for normal (clean interface)",
                hard: "OFF for hard (clean interface)",
                expert: "OFF for expert (clean interface)"
            },
            enableTimer: {
                easy: "OFF for easy",
                normal: "OFF for normal",
                hard: "ON for hard",
                expert: "ON for expert"
            },
            showPersonalBests: {
                easy: "ON for easy",
                normal: "OFF for normal",
                hard: "ON for hard",
                expert: "ON for expert"
            },
            showSpeedTimer: {
                easy: "OFF for easy",
                normal: "OFF for normal",
                hard: "ON for hard",
                expert: "ON for expert"
            },
            speedMode: {
                easy: "BONUS for easy",
                normal: "IGNORED for normal",
                hard: "IGNORED for hard",
                expert: "PUNISHMENT for expert"
            }
        };
        
        return notes[settingKey] || {};
    }

    /**
     * Check if a setting is at its default value for a difficulty
     */
    isAtDefault(difficulty, settingKey) {
        const defaults = this.difficultyDefaults[difficulty] || {};
        const userOverrides = this.getUserOverrides(difficulty);
        const currentValue = userOverrides[settingKey] !== undefined ? 
            userOverrides[settingKey] : defaults[settingKey];
        
        return currentValue === defaults[settingKey];
    }

    /**
     * Get all difficulties that have user overrides
     */
    getDifficultiesWithOverrides() {
        const allOverrides = this.storage.loadDifficultyOverrides();
        return Object.keys(allOverrides).filter(difficulty => 
            Object.keys(allOverrides[difficulty]).length > 0
        );
    }
}
