import { GameStorage } from './storage/game-storage.js';
import { PWAInstallManager } from './pwa/install.js';

class SettingsManager {
    constructor() {
        this.storage = new GameStorage();
        this.currentTheme = 'wood';
        this.currentDifficulty = 'normal';
        this.settings = this.storage.loadSettings();
        this.pwaInstallManager = null;
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.updateUI();
        this.initializePWA();
    }
    
    initializePWA() {
        try {
            this.pwaInstallManager = new PWAInstallManager();
            console.log('PWA Install Manager initialized in settings');
        } catch (error) {
            console.error('Failed to initialize PWA Install Manager:', error);
        }
    }
    
    loadSettings() {
        this.currentTheme = this.settings.theme || 'wood';
        this.currentDifficulty = this.settings.difficulty || 'normal';
        
        // Apply the loaded theme immediately
        this.applyTheme(this.currentTheme);
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(item.dataset.section);
            });
        });
        
        // Theme selection
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectTheme(e.currentTarget.dataset.theme);
            });
        });
        
        // Difficulty selection
        document.querySelectorAll('.difficulty-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectDifficulty(e.currentTarget.dataset.difficulty);
            });
        });
        
        // Game settings
        document.getElementById('enable-hints').addEventListener('change', (e) => {
            this.updateSetting('enableHints', e.target.checked);
        });
        
        document.getElementById('enable-timer').addEventListener('change', (e) => {
            this.updateSetting('enableTimer', e.target.checked);
        });
        
        document.getElementById('enable-undo').addEventListener('change', (e) => {
            this.updateSetting('enableUndo', e.target.checked);
        });
        
        document.getElementById('sound-enabled').addEventListener('change', (e) => {
            this.updateSetting('soundEnabled', e.target.checked);
        });
        
        document.getElementById('animations-enabled').addEventListener('change', (e) => {
            this.updateSetting('animationsEnabled', e.target.checked);
        });
        
        document.getElementById('auto-save').addEventListener('change', (e) => {
            this.updateSetting('autoSave', e.target.checked);
        });
        
        document.getElementById('show-points').addEventListener('change', (e) => {
            this.updateSetting('showPoints', e.target.checked);
            this.updateBlockPointsDisplay();
        });
    }
    
    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');
        
        // Load section-specific data
        if (sectionName === 'scores') {
            this.loadHighScores();
        }
    }
    
    selectTheme(theme) {
        this.currentTheme = theme;
        this.applyTheme(theme);
        this.updateThemeUI();
        this.saveSettings();
    }
    
    applyTheme(theme) {
        const themeLink = document.getElementById('theme-css');
        themeLink.href = `css/themes/${theme}.css`;
    }
    
    selectDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.updateDifficultyUI();
        this.saveSettings();
    }
    
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }
    
    updateUI() {
        this.updateThemeUI();
        this.updateDifficultyUI();
        this.updateGameSettingsUI();
    }
    
    updateThemeUI() {
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.theme === this.currentTheme) {
                option.classList.add('selected');
            }
        });
    }
    
    updateDifficultyUI() {
        document.querySelectorAll('.difficulty-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.difficulty === this.currentDifficulty) {
                option.classList.add('selected');
            }
        });
    }
    
    updateGameSettingsUI() {
        document.getElementById('enable-hints').checked = this.settings.enableHints || false;
        document.getElementById('enable-timer').checked = this.settings.enableTimer || false;
        document.getElementById('enable-undo').checked = this.settings.enableUndo || false;
        document.getElementById('sound-enabled').checked = this.settings.soundEnabled !== false;
        document.getElementById('animations-enabled').checked = this.settings.animationsEnabled !== false;
        document.getElementById('auto-save').checked = this.settings.autoSave !== false;
        document.getElementById('show-points').checked = this.settings.showPoints || false;
    }
    
    updateBlockPointsDisplay() {
        const showPoints = this.settings.showPoints || false;
        const blockInfos = document.querySelectorAll('.block-info');
        
        blockInfos.forEach(info => {
            if (showPoints) {
                info.classList.add('show-points');
            } else {
                info.classList.remove('show-points');
            }
        });
    }
    
    loadHighScores() {
        const scoresList = document.getElementById('high-scores-list');
        const statsDisplay = document.getElementById('statistics-display');
        
        const highScores = this.storage.getHighScores();
        const stats = this.storage.loadStatistics();
        
        // Display high scores
        if (highScores.length === 0) {
            scoresList.innerHTML = '<p>No high scores yet. Play a game to set your first record!</p>';
        } else {
            scoresList.innerHTML = highScores.map((score, index) => `
                <div class="score-item">
                    <div class="rank">#${index + 1}</div>
                    <div class="score-value">${score.score}</div>
                    <div class="score-details">Level ${score.level} • ${new Date(score.date).toLocaleDateString()}</div>
                </div>
            `).join('');
        }
        
        // Display statistics
        statsDisplay.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Games Played:</span>
                <span class="stat-value">${stats.gamesPlayed}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Score:</span>
                <span class="stat-value">${stats.totalScore}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Best Score:</span>
                <span class="stat-value">${stats.bestScore}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Lines:</span>
                <span class="stat-value">${stats.totalLines}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Max Combo:</span>
                <span class="stat-value">${stats.maxCombo}</span>
            </div>
        `;
    }
    
    saveSettings() {
        const settings = {
            ...this.settings,
            theme: this.currentTheme,
            difficulty: this.currentDifficulty
        };
        this.storage.saveSettings(settings);
    }
}

// Initialize settings when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});
