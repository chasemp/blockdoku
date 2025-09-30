/**
 * StateManager - Centralized State Management
 * 
 * This class manages all application state, settings persistence, and state synchronization.
 * It provides a single source of truth for all state changes and ensures consistency
 * across the application.
 */

export class StateManager {
    constructor(dependencies = {}) {
        // Injected dependencies
        this.storage = dependencies.storage || null;
        
        // State containers
        this.gameState = {
            board: null,
            score: 0,
            level: 1,
            isGameOver: false,
            moveCount: 0,
            gameStartTime: Date.now(),
            currentBlocks: [],
            selectedBlock: null
        };
        
        this.settings = {
            theme: 'light',
            difficulty: 'normal',
            soundEnabled: true,
            animationsEnabled: true,
            enableHints: false,
            enableTimer: false,
            enablePetrification: false,
            showPoints: false,
            autoSave: true
        };
        
        this.uiState = {
            previewPosition: null,
            pendingClears: null,
            isDragging: false,
            dragStartPosition: null
        };
        
        // State change observers
        this.observers = new Map();
        
        // Initialize from storage
        this.loadFromStorage();
    }

    /**
     * Load state from storage
     */
    loadFromStorage() {
        if (!this.storage) return;
        
        // Load settings
        const savedSettings = this.storage.loadSettings();
        if (savedSettings) {
            this.settings = { ...this.settings, ...savedSettings };
        }
        
        // Load game state
        const savedGameState = this.storage.loadGameState();
        if (savedGameState) {
            this.gameState = { ...this.gameState, ...savedGameState };
        }
    }

    /**
     * Save state to storage
     */
    saveToStorage() {
        if (!this.storage) return;
        
        this.storage.saveSettings(this.settings);
        this.storage.saveGameState(this.gameState);
    }

    /**
     * Get current game state
     * @returns {Object} Current game state
     */
    getGameState() {
        return { ...this.gameState };
    }

    /**
     * Get current settings
     * @returns {Object} Current settings
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * Get current UI state
     * @returns {Object} Current UI state
     */
    getUIState() {
        return { ...this.uiState };
    }

    /**
     * Update game state
     * @param {Object} updates - State updates
     * @param {boolean} save - Whether to save to storage
     */
    updateGameState(updates, save = true) {
        const oldState = { ...this.gameState };
        this.gameState = { ...this.gameState, ...updates };
        
        if (save && this.settings.autoSave) {
            this.saveToStorage();
        }
        
        this.notifyObservers('gameState', this.gameState, oldState);
    }

    /**
     * Update settings
     * @param {Object} updates - Settings updates
     * @param {boolean} save - Whether to save to storage
     */
    updateSettings(updates, save = true) {
        const oldSettings = { ...this.settings };
        this.settings = { ...this.settings, ...updates };
        
        if (save) {
            this.saveToStorage();
        }
        
        this.notifyObservers('settings', this.settings, oldSettings);
    }

    /**
     * Update UI state
     * @param {Object} updates - UI state updates
     */
    updateUIState(updates) {
        const oldUIState = { ...this.uiState };
        this.uiState = { ...this.uiState, ...updates };
        
        this.notifyObservers('uiState', this.uiState, oldUIState);
    }

    /**
     * Reset game state to initial values
     */
    resetGameState() {
        const oldState = { ...this.gameState };
        this.gameState = {
            board: null,
            score: 0,
            level: 1,
            isGameOver: false,
            moveCount: 0,
            gameStartTime: Date.now(),
            currentBlocks: [],
            selectedBlock: null
        };
        
        this.saveToStorage();
        this.notifyObservers('gameState', this.gameState, oldState);
    }

    /**
     * Reset settings to defaults
     */
    resetSettings() {
        const oldSettings = { ...this.settings };
        this.settings = {
            theme: 'light',
            difficulty: 'normal',
            soundEnabled: true,
            animationsEnabled: true,
            enableHints: false,
            enableTimer: false,
            enablePetrification: false,
            showPoints: false,
            autoSave: true
        };
        
        this.saveToStorage();
        this.notifyObservers('settings', this.settings, oldSettings);
    }

    /**
     * Subscribe to state changes
     * @param {string} stateType - Type of state to observe
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(stateType, callback) {
        if (!this.observers.has(stateType)) {
            this.observers.set(stateType, new Set());
        }
        
        this.observers.get(stateType).add(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.observers.get(stateType);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }

    /**
     * Notify observers of state changes
     * @param {string} stateType - Type of state that changed
     * @param {Object} newState - New state
     * @param {Object} oldState - Previous state
     */
    notifyObservers(stateType, newState, oldState) {
        const callbacks = this.observers.get(stateType);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(newState, oldState);
                } catch (error) {
                    console.error(`Error in state observer for ${stateType}:`, error);
                }
            });
        }
    }

    /**
     * Get high scores
     * @returns {Array} High scores
     */
    getHighScores() {
        if (!this.storage) return [];
        return this.storage.getHighScores();
    }

    /**
     * Save high score
     * @param {Object} scoreData - Score data
     */
    saveHighScore(scoreData) {
        if (!this.storage) return;
        this.storage.saveHighScore(scoreData);
    }

    /**
     * Export all data
     * @returns {string} Exported data as JSON
     */
    exportData() {
        if (!this.storage) return null;
        return this.storage.exportData();
    }

    /**
     * Import data
     * @param {string} jsonData - JSON data to import
     * @returns {boolean} Success status
     */
    importData(jsonData) {
        if (!this.storage) return false;
        
        const result = this.storage.importData(jsonData);
        if (result) {
            // Reload state from storage after import
            this.loadFromStorage();
        }
        return result;
    }

    /**
     * Clear all data
     */
    clearAllData() {
        if (this.storage) {
            this.storage.clearGameState();
            this.storage.clearSettings();
        }
        
        this.resetGameState();
        this.resetSettings();
    }

    /**
     * Get state statistics
     * @returns {Object} State statistics
     */
    getStateStats() {
        return {
            gameStateKeys: Object.keys(this.gameState).length,
            settingsKeys: Object.keys(this.settings).length,
            uiStateKeys: Object.keys(this.uiState).length,
            observerCount: Array.from(this.observers.values()).reduce((total, set) => total + set.size, 0),
            hasStorage: !!this.storage
        };
    }

    /**
     * Validate state integrity
     * @returns {Object} Validation result
     */
    validateState() {
        const issues = [];
        
        // Validate game state
        if (typeof this.gameState.score !== 'number' || this.gameState.score < 0) {
            issues.push('Invalid game score');
        }
        
        if (typeof this.gameState.level !== 'number' || this.gameState.level < 1) {
            issues.push('Invalid game level');
        }
        
        if (this.gameState.board && !Array.isArray(this.gameState.board)) {
            issues.push('Invalid game board');
        }
        
        // Validate settings
        if (!['light', 'dark', 'wood'].includes(this.settings.theme)) {
            issues.push('Invalid theme setting');
        }
        
        if (!['easy', 'normal', 'hard'].includes(this.settings.difficulty)) {
            issues.push('Invalid difficulty setting');
        }
        
        return {
            isValid: issues.length === 0,
            issues
        };
    }

    /**
     * Create a snapshot of current state
     * @returns {Object} State snapshot
     */
    createSnapshot() {
        return {
            gameState: this.getGameState(),
            settings: this.getSettings(),
            uiState: this.getUIState(),
            timestamp: Date.now()
        };
    }

    /**
     * Restore state from snapshot
     * @param {Object} snapshot - State snapshot
     */
    restoreSnapshot(snapshot) {
        if (snapshot.gameState) {
            this.updateGameState(snapshot.gameState, false);
        }
        
        if (snapshot.settings) {
            this.updateSettings(snapshot.settings, false);
        }
        
        if (snapshot.uiState) {
            this.updateUIState(snapshot.uiState);
        }
        
        this.saveToStorage();
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.observers.clear();
        this.storage = null;
    }
}

