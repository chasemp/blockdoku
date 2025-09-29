/**
 * Blockdoku PWA - Game Storage System
 * M4.1: Local storage integration for game state, high scores, and settings
 */

export class GameStorage {
    constructor() {
        this.storageKey = 'blockdoku_game_data';
        this.settingsKey = 'blockdoku_settings';
        this.highScoresKey = 'blockdoku_high_scores';
        this.maxHighScores = 10;
    }

    // Game State Management
    saveGameState(gameState) {
        try {
            const data = {
                board: gameState.board,
                score: gameState.score,
                level: gameState.level,
                currentBlocks: gameState.currentBlocks,
                selectedBlock: gameState.selectedBlock,
                timestamp: Date.now()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save game state:', error);
            return false;
        }
    }

    loadGameState() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const parsed = JSON.parse(data);
                // Check if save is not too old (24 hours)
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                if (Date.now() - parsed.timestamp < maxAge) {
                    return parsed;
                } else {
                    this.clearGameState();
                }
            }
            return null;
        } catch (error) {
            console.error('Failed to load game state:', error);
            return null;
        }
    }

    clearGameState() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Failed to clear game state:', error);
            return false;
        }
    }

    // High Scores Management
    saveHighScore(scoreData) {
        try {
            const scores = this.getHighScores();
            const newScore = {
                score: scoreData.score,
                level: scoreData.level,
                linesCleared: scoreData.linesCleared,
                combo: scoreData.combo,
                maxCombo: scoreData.maxCombo,
                difficulty: scoreData.difficulty || 'normal',
                timestamp: Date.now(),
                date: new Date().toLocaleDateString()
            };

            scores.push(newScore);
            scores.sort((a, b) => b.score - a.score);
            scores.splice(this.maxHighScores); // Keep only top scores

            localStorage.setItem(this.highScoresKey, JSON.stringify(scores));
            return true;
        } catch (error) {
            console.error('Failed to save high score:', error);
            return false;
        }
    }

    getHighScores() {
        try {
            const data = localStorage.getItem(this.highScoresKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load high scores:', error);
            return [];
        }
    }

    // Compute best score per difficulty
    getBestScoresByDifficulty() {
        const scores = this.getHighScores();
        const best = { easy: 0, normal: 0, hard: 0, expert: 0 };
        for (const s of scores) {
            const diff = (s.difficulty || 'normal');
            if (best[diff] === undefined) continue;
            if (s.score > best[diff]) best[diff] = s.score;
        }
        return best;
    }

    isHighScore(score) {
        const scores = this.getHighScores();
        return scores.length < this.maxHighScores || score > scores[scores.length - 1]?.score;
    }

    // Settings Management
    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }

    loadSettings() {
        try {
            const data = localStorage.getItem(this.settingsKey);
            return data ? JSON.parse(data) : this.getDefaultSettings();
        } catch (error) {
            console.error('Failed to load settings:', error);
            return this.getDefaultSettings();
        }
    }

    getDefaultSettings() {
        return {
            theme: 'wood',
            soundEnabled: false,
            animationsEnabled: true,
            difficulty: 'normal',
            autoSave: true,
            enableHints: false,
            enableTimer: false,
            enableUndo: false,
            showPoints: false,
            showHighScore: false
        };
    }

    // Statistics Management
    saveStatistics(stats) {
        try {
            const key = 'blockdoku_statistics';
            const existingStats = this.loadStatistics();
            const updatedStats = {
                gamesPlayed: (existingStats.gamesPlayed || 0) + 1,
                totalScore: (existingStats.totalScore || 0) + stats.score,
                totalLinesCleared: (existingStats.totalLinesCleared || 0) + stats.linesCleared,
                maxCombo: Math.max(existingStats.maxCombo || 0, stats.maxCombo),
                bestScore: Math.max(existingStats.bestScore || 0, stats.score),
                lastPlayed: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(updatedStats));
            return true;
        } catch (error) {
            console.error('Failed to save statistics:', error);
            return false;
        }
    }

    loadStatistics() {
        try {
            const data = localStorage.getItem('blockdoku_statistics');
            return data ? JSON.parse(data) : {
                gamesPlayed: 0,
                totalScore: 0,
                totalLinesCleared: 0,
                maxCombo: 0,
                bestScore: 0,
                lastPlayed: null
            };
        } catch (error) {
            console.error('Failed to load statistics:', error);
            return {
                gamesPlayed: 0,
                totalScore: 0,
                totalLinesCleared: 0,
                maxCombo: 0,
                bestScore: 0,
                lastPlayed: null
            };
        }
    }

    // Utility Methods
    clearAllData() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.settingsKey);
            localStorage.removeItem(this.highScoresKey);
            localStorage.removeItem('blockdoku_statistics');
            return true;
        } catch (error) {
            console.error('Failed to clear all data:', error);
            return false;
        }
    }

    getStorageSize() {
        try {
            let totalSize = 0;
            for (let key in localStorage) {
                if (key.startsWith('blockdoku_')) {
                    totalSize += localStorage[key].length;
                }
            }
            return totalSize;
        } catch (error) {
            console.error('Failed to calculate storage size:', error);
            return 0;
        }
    }

    // Export/Import functionality
    exportData() {
        try {
            const data = {
                gameState: this.loadGameState(),
                settings: this.loadSettings(),
                highScores: this.getHighScores(),
                statistics: this.loadStatistics(),
                exportDate: new Date().toISOString(),
                version: '1.4.0'
            };
            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Failed to export data:', error);
            return null;
        }
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.gameState) this.saveGameState(data.gameState);
            if (data.settings) this.saveSettings(data.settings);
            if (data.highScores) localStorage.setItem(this.highScoresKey, JSON.stringify(data.highScores));
            if (data.statistics) localStorage.setItem('blockdoku_statistics', JSON.stringify(data.statistics));
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
}
