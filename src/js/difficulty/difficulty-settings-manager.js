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
                enablePrizeRecognition: true
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
                enablePrizeRecognition: false
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
                enablePrizeRecognition: false
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
                enablePrizeRecognition: false
            }
        };
    }

    /**
     * Get settings for a specific difficulty (defaults + user overrides)
     */
    getSettingsForDifficulty(difficulty) {
        const defaults = this.difficultyDefaults[difficulty] || {};
        const userOverrides = this.getUserOverrides(difficulty);
        
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
                easy: "ON for easy (helps beginners learn)",
                normal: "OFF for normal (no assistance)",
                hard: "OFF for hard (no assistance)",
                expert: "OFF for expert (no assistance)"
            },
            showPoints: {
                easy: "ON for easy (helps with strategy)",
                normal: "OFF for normal (clean interface)",
                hard: "OFF for hard (clean interface)",
                expert: "OFF for expert (clean interface)"
            },
            enableTimer: {
                easy: "OFF for easy (no time pressure)",
                normal: "OFF for normal (no time pressure)",
                hard: "ON for hard (adds time challenge)",
                expert: "ON for expert (adds time challenge)"
            },
            enablePetrification: {
                easy: "OFF for easy (simpler gameplay)",
                normal: "OFF for normal",
                hard: "OFF for hard (optional challenge)",
                expert: "OFF for expert (optional challenge)"
            },
            enableDeadPixels: {
                easy: "OFF for easy (simpler gameplay)",
                normal: "OFF for normal",
                hard: "OFF for hard (optional challenge)",
                expert: "OFF for expert (optional challenge)"
            },
            showPersonalBests: {
                easy: "ON for easy (shows progress)",
                normal: "ON for normal (shows progress)",
                hard: "ON for hard (shows progress)",
                expert: "ON for expert (shows progress)"
            },
            showSpeedTimer: {
                easy: "OFF for easy (no speed tracking)",
                normal: "OFF for normal (no speed tracking)",
                hard: "ON for hard (tracks placement speed)",
                expert: "ON for expert (tracks placement speed)"
            },
            speedMode: {
                easy: "BONUS for easy (rewards fast play)",
                normal: "IGNORED for normal (no speed effects)",
                hard: "IGNORED for hard (no speed effects)",
                expert: "PUNISHMENT for expert (penalizes slow play)"
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
