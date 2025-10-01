import { GameStorage } from './storage/game-storage.js';
import { PWAInstallManager } from './pwa/install.js';
import { ConfirmationDialog } from './ui/confirmation-dialog.js';
import { SoundManager } from './effects/sound-manager.js';
// Build info is generated during build by scripts/generate-build-info.js.
// If that generator is skipped, the About section will show fallback values.
import { buildInfo } from './utils/build-info.js';

export class SettingsManager {
    constructor() {
        this.storage = new GameStorage();
        this.settings = this.storage.loadSettings();
        
        // Load current values from storage FIRST, don't default them
        this.currentTheme = this.settings.theme || 'wood';
        this.currentDifficulty = this.settings.difficulty || 'normal';
        
        this.pwaInstallManager = null;
        this.confirmationDialog = new ConfirmationDialog();
        this.soundManager = new SoundManager();
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.updateUI();
        this.updateBuildInfo();
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
        
        // Load theme settings
        this.loadThemeSettings();
        
        // Load difficulty settings
        this.loadDifficultySettings();
        
        // Load high scores and statistics
        this.loadHighScores();
        this.loadStatistics();
        
        // Load sound settings (only for sounds section)
        this.loadSoundSettings();
    }
    
    loadThemeSettings() {
        // Theme options are handled by the theme buttons in the HTML
        // No additional loading needed here
    }
    
    loadDifficultySettings() {
        // Difficulty options are handled by the difficulty buttons in the HTML
        // No additional loading needed here
    }
    
    loadHighScores() {
        const highScoresList = document.getElementById('high-scores-list');
        if (!highScoresList) return;
        
        const statistics = this.storage.loadStatistics();
        const highScores = statistics.highScores || {};
        
        highScoresList.innerHTML = '';
        
        if (Object.keys(highScores).length === 0) {
            highScoresList.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No high scores yet. Start playing to set your first record!</p>';
            return;
        }
        
        // Sort difficulties by a logical order
        const difficultyOrder = ['easy', 'normal', 'hard', 'expert'];
        const sortedDifficulties = Object.keys(highScores).sort((a, b) => {
            return difficultyOrder.indexOf(a) - difficultyOrder.indexOf(b);
        });
        
        sortedDifficulties.forEach(difficulty => {
            const score = highScores[difficulty];
            const difficultyDiv = document.createElement('div');
            difficultyDiv.className = 'high-score-item';
            difficultyDiv.innerHTML = `
                <div class="difficulty-name">${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</div>
                <div class="score-value">${score.toLocaleString()}</div>
            `;
            highScoresList.appendChild(difficultyDiv);
        });
    }
    
    loadStatistics() {
        const statisticsDisplay = document.getElementById('statistics-display');
        if (!statisticsDisplay) return;
        
        const statistics = this.storage.loadStatistics();
        
        const stats = [
            { label: 'Total Games Played', value: statistics.totalGamesPlayed || 0 },
            { label: 'Total Score', value: (statistics.totalScore || 0).toLocaleString() },
            { label: 'Total Lines Cleared', value: (statistics.totalLinesCleared || 0).toLocaleString() },
            { label: 'Total Combos', value: (statistics.totalCombos || 0).toLocaleString() },
            { label: 'Max Combo Streak', value: (statistics.maxComboStreak || 0).toLocaleString() },
            { label: 'Total Play Time', value: this.formatPlayTime(statistics.totalPlayTime || 0) }
        ];
        
        statisticsDisplay.innerHTML = stats.map(stat => `
            <div class="stat-item">
                <span class="stat-label">${stat.label}:</span>
                <span class="stat-value">${stat.value}</span>
            </div>
        `).join('');
    }
    
    loadSoundSettings() {
        // Only handle the sound toggle in the sounds section
        const soundEnabledSounds = document.getElementById('sound-enabled-sounds-section');
        if (soundEnabledSounds) {
            soundEnabledSounds.checked = this.settings.soundEnabled === true;
        }
    }
    
    setupEventListeners() {
        this.setupThemeListeners();
        this.setupDifficultyListeners();
        this.setupNavigationListeners();
        this.setupSoundListeners();
        this.setupShareListeners();
        this.setupViewLastGameListener();
    }
    
    setupThemeListeners() {
        const themeButtons = document.querySelectorAll('.theme-option');
        themeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const theme = button.dataset.theme;
                this.selectTheme(theme);
            });
        });
    }
    
    setupDifficultyListeners() {
        const difficultyButtons = document.querySelectorAll('.difficulty-option');
        difficultyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const difficulty = button.dataset.difficulty;
                this.selectDifficulty(difficulty);
            });
        });
    }
    
    setupNavigationListeners() {
        const navItems = document.querySelectorAll('.nav-item[data-section]');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
            });
        });
    }
    
    setupSoundListeners() {
        // Sound toggle in sounds section
        const soundEnabledSounds = document.getElementById('sound-enabled-sounds-section');
        if (soundEnabledSounds) {
            soundEnabledSounds.addEventListener('change', (e) => {
                this.updateSetting('soundEnabled', e.target.checked);
            });
        }
    }
    
    setupShareListeners() {
        const shareButton = document.getElementById('share-button');
        if (shareButton) {
            shareButton.addEventListener('click', () => {
                this.shareApp();
            });
        }
        
        const shareScoresButton = document.getElementById('share-scores-button');
        if (shareScoresButton) {
            shareScoresButton.addEventListener('click', () => {
                this.shareScores();
            });
        }
    }
    
    setupViewLastGameListener() {
        const viewLastGameBtn = document.getElementById('view-last-game-btn');
        if (viewLastGameBtn) {
            viewLastGameBtn.addEventListener('click', () => {
                window.location.href = 'lastgame.html';
            });
        }
    }
    
    selectTheme(theme) {
        this.currentTheme = theme;
        this.updateSetting('theme', theme);
        this.applyTheme(theme);
        this.updateThemeUI();
    }
    
    selectDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.updateSetting('difficulty', difficulty);
        this.updateDifficultyUI();
    }
    
    applyTheme(theme) {
        const themeLink = document.getElementById('theme-css');
        if (themeLink) {
            themeLink.href = `css/themes/${theme}.css`;
        }
        
        // Update body class for theme-specific styling
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${theme}`);
    }
    
    updateThemeUI() {
        const themeButtons = document.querySelectorAll('.theme-option');
        themeButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.theme === this.currentTheme) {
                button.classList.add('active');
            }
        });
    }
    
    updateDifficultyUI() {
        const difficultyButtons = document.querySelectorAll('.difficulty-option');
        difficultyButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.difficulty === this.currentDifficulty) {
                button.classList.add('active');
            }
        });
    }
    
    showSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.settings-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update navigation
        const navItems = document.querySelectorAll('.nav-item[data-section]');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === sectionName) {
                item.classList.add('active');
            }
        });
    }
    
    updateSetting(key, value) {
        this.settings[key] = value;
        this.storage.saveSettings(this.settings);
        console.log(`Setting saved: ${key} = ${value}`);
    }
    
    shareApp() {
        if (navigator.share) {
            navigator.share({
                title: 'Blockdoku',
                text: 'Check out this awesome block puzzle game!',
                url: window.location.origin
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.origin).then(() => {
                alert('Game URL copied to clipboard!');
            });
        }
    }
    
    shareScores() {
        const statistics = this.storage.loadStatistics();
        const highScores = statistics.highScores || {};
        
        let shareText = 'My Blockdoku High Scores:\n\n';
        
        Object.entries(highScores).forEach(([difficulty, score]) => {
            shareText += `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}: ${score.toLocaleString()}\n`;
        });
        
        shareText += '\nPlay Blockdoku: ' + window.location.origin;
        
        if (navigator.share) {
            navigator.share({
                title: 'My Blockdoku Scores',
                text: shareText
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Scores copied to clipboard!');
            });
        }
    }
    
    formatPlayTime(milliseconds) {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }
    
    updateBuildInfo() {
        const versionDisplay = document.getElementById('version-display');
        const buildInfoDisplay = document.getElementById('build-info');
        
        if (versionDisplay) {
            versionDisplay.textContent = buildInfo.version || '1.5.0';
        }
        
        if (buildInfoDisplay) {
            const buildDate = buildInfo.buildDate ? new Date(buildInfo.buildDate).toLocaleDateString() : 'Unknown';
            buildInfoDisplay.textContent = `Build: ${buildDate}`;
        }
    }
    
    updateUI() {
        this.updateThemeUI();
        this.updateDifficultyUI();
        this.loadHighScores();
        this.loadStatistics();
    }
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.settingsManager = new SettingsManager();
    });
} else {
    // DOM is already ready, instantiate immediately
    window.settingsManager = new SettingsManager();
}
