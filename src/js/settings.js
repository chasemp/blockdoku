import { GameStorage } from './storage/game-storage.js';
import { PWAInstallManager } from './pwa/install.js';
import { ConfirmationDialog } from './ui/confirmation-dialog.js';
import { buildInfo } from './utils/build-info.js';

class SettingsManager {
    constructor() {
        this.storage = new GameStorage();
        this.currentTheme = 'wood';
        this.currentDifficulty = 'normal';
        this.settings = this.storage.loadSettings();
        this.pwaInstallManager = null;
        this.confirmationDialog = new ConfirmationDialog();
        
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
        
        // Load effects settings
        this.loadEffectsSettings();
        
        // Update difficulty UI to apply theme-specific styling
        this.updateDifficultyUI();
    }
    
    loadEffectsSettings() {
        // Sound effects
        const soundEnabled = document.getElementById('sound-enabled');
        if (soundEnabled) {
            soundEnabled.checked = this.settings.soundEnabled === true; // Default to false
        }
        
        // Animations
        const animationsEnabled = document.getElementById('animations-enabled');
        if (animationsEnabled) {
            animationsEnabled.checked = this.settings.animationsEnabled !== false; // Default to true
        }
        
        // Particle effects
        const particlesEnabled = document.getElementById('particles-enabled');
        if (particlesEnabled) {
            particlesEnabled.checked = this.settings.particlesEnabled !== false; // Default to true
        }
        
        // Haptic feedback
        const hapticEnabled = document.getElementById('haptic-enabled');
        if (hapticEnabled) {
            hapticEnabled.checked = this.settings.hapticEnabled !== false; // Default to true
        }
        
        // Game settings
        const enableHints = document.getElementById('enable-hints');
        if (enableHints) {
            enableHints.checked = this.settings.enableHints === true; // Default to false
        }
        
        const enableTimer = document.getElementById('enable-timer');
        if (enableTimer) {
            enableTimer.checked = this.settings.enableTimer === true; // Default to false
        }
        
        
        const autoSave = document.getElementById('auto-save');
        if (autoSave) {
            autoSave.checked = this.settings.autoSave !== false; // Default to true
        }
        
        const showPoints = document.getElementById('show-points');
        if (showPoints) {
            showPoints.checked = this.settings.showPoints === true; // Default to false
        }
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            const handleNavClick = (e) => {
                e.preventDefault();
                this.showSection(item.dataset.section);
            };
            
            item.addEventListener('click', handleNavClick);
            item.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleNavClick(e);
            }, { passive: false });
        });
        
        // Theme selection
        document.querySelectorAll('.theme-option').forEach(option => {
            const handleThemeClick = (e) => {
                this.selectTheme(e.currentTarget.dataset.theme);
            };
            
            option.addEventListener('click', handleThemeClick);
            option.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleThemeClick(e);
            }, { passive: false });
        });
        
        // Difficulty selection
        document.querySelectorAll('.difficulty-option').forEach(option => {
            const handleDifficultyClick = async (e) => {
                await this.selectDifficulty(e.currentTarget.dataset.difficulty);
            };
            
            option.addEventListener('click', handleDifficultyClick);
            option.addEventListener('touchstart', async (e) => {
                e.preventDefault();
                await handleDifficultyClick(e);
            }, { passive: false });
        });
        
        // Game settings
        document.getElementById('enable-hints').addEventListener('change', (e) => {
            this.updateSetting('enableHints', e.target.checked);
        });
        
        document.getElementById('enable-timer').addEventListener('change', (e) => {
            this.updateSetting('enableTimer', e.target.checked);
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
        
        // Effects settings
        document.getElementById('particles-enabled').addEventListener('change', (e) => {
            this.updateSetting('particlesEnabled', e.target.checked);
        });
        
        document.getElementById('haptic-enabled').addEventListener('change', (e) => {
            this.updateSetting('hapticEnabled', e.target.checked);
        });
        
        // Share button
        const shareButton = document.getElementById('share-button');
        if (shareButton) {
            shareButton.addEventListener('click', () => {
                this.shareGame();
            });
        }
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
        this.updateDifficultyUI(); // Update difficulty UI to apply theme-specific styling
        this.saveSettings();
    }
    
    applyTheme(theme) {
        const themeLink = document.getElementById('theme-css');
        themeLink.href = `css/themes/${theme}.css`;
        
        // Set data-theme attribute for CSS selectors
        document.documentElement.setAttribute('data-theme', theme);
        
        // Also add class to body as fallback
        document.body.className = document.body.className.replace(/light-theme|dark-theme|wood-theme/g, '');
        document.body.classList.add(`${theme}-theme`);
    }
    
    async selectDifficulty(difficulty) {
        // Check if there's a game in progress by looking at localStorage
        const gameState = localStorage.getItem('blockdoku_game_state');
        let gameInProgress = false;
        
        if (gameState) {
            try {
                const state = JSON.parse(gameState);
                gameInProgress = state.score > 0 || state.board.some(row => row.some(cell => cell === 1));
            } catch (e) {
                // If we can't parse the game state, assume no game in progress
                gameInProgress = false;
            }
        }
        
        if (gameInProgress) {
            // Show confirmation dialog
            const confirmed = await this.confirmationDialog.show(
                `Changing difficulty to ${difficulty.toUpperCase()} will reset your current game and you'll lose your progress. Are you sure you want to continue?`
            );
            
            if (!confirmed) {
                // User cancelled, revert the UI selection
                this.updateDifficultyUI();
                return;
            }
        }
        
        this.currentDifficulty = difficulty;
        this.updateDifficultyUI();
        this.saveSettings();
        
        // Also update the main game's difficulty if we're on the settings page
        // This ensures the difficulty change takes effect immediately
        if (window.parent && window.parent !== window) {
            // If we're in an iframe, communicate with parent
            window.parent.postMessage({
                type: 'difficultyChanged',
                difficulty: difficulty
            }, '*');
        } else {
            // If we're on the settings page directly, store the change for the main game to pick up
            localStorage.setItem('blockdoku_pending_difficulty', difficulty);
        }
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
                
                // Force white text for light theme
                if (this.currentTheme === 'light') {
                    option.style.color = 'white';
                    option.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.7)';
                    
                    // Also style child elements
                    const h4 = option.querySelector('h4');
                    if (h4) {
                        h4.style.color = 'white';
                        h4.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.7)';
                    }
                    
                    const p = option.querySelector('p');
                    if (p) {
                        p.style.color = 'white';
                        p.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.7)';
                    }
                } else {
                    // Reset styles for other themes
                    option.style.color = '';
                    option.style.textShadow = '';
                    const h4 = option.querySelector('h4');
                    if (h4) {
                        h4.style.color = '';
                        h4.style.textShadow = '';
                    }
                    const p = option.querySelector('p');
                    if (p) {
                        p.style.color = '';
                        p.style.textShadow = '';
                    }
                }
            }
        });
    }
    
    updateGameSettingsUI() {
        document.getElementById('enable-hints').checked = this.settings.enableHints || false;
        document.getElementById('enable-timer').checked = this.settings.enableTimer || false;
        document.getElementById('auto-save').checked = this.settings.autoSave !== false;
        document.getElementById('show-points').checked = this.settings.showPoints || false;
        
        // Effects settings are handled by loadEffectsSettings()
        this.loadEffectsSettings();
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
    
    updateBuildInfo() {
        // Wait for build info to load, then update display
        const checkBuildInfo = () => {
            if (buildInfo.isLoaded()) {
                const versionDisplay = document.getElementById('version-display');
                const buildInfoDisplay = document.getElementById('build-info');
                
                if (versionDisplay) {
                    versionDisplay.textContent = buildInfo.getDisplayVersion();
                }
                
                if (buildInfoDisplay) {
                    buildInfoDisplay.textContent = `Build: ${buildInfo.getBuildId()} (${buildInfo.getFormattedBuildDate()})`;
                }
            } else {
                // Check again in 100ms
                setTimeout(checkBuildInfo, 100);
            }
        };
        
        checkBuildInfo();
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
                    <div class="score-details">${(score.difficulty||'normal').toUpperCase()} • Level ${score.level} • ${new Date(score.date).toLocaleDateString()}</div>
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
                <span class="stat-value">${stats.totalLinesCleared}</span>
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
    
    shareGame() {
        const url = 'https://blockdoku.523.life';
        const title = 'Blockdoku - A Progressive Web App Puzzle Game';
        const text = 'Check out this awesome Blockdoku puzzle game!';
        
        if (navigator.share) {
            // Use native Web Share API if available
            navigator.share({
                title: title,
                text: text,
                url: url
            }).catch(err => {
                console.log('Error sharing:', err);
                this.fallbackShare(url, title);
            });
        } else {
            // Fallback to clipboard and notification
            this.fallbackShare(url, title);
        }
    }
    
    fallbackShare(url, title) {
        // Copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            // Show a temporary notification
            this.showNotification('Game URL copied to clipboard!');
        }).catch(() => {
            // If clipboard fails, show URL in alert
            alert(`Share this game: ${url}`);
        });
    }
    
    showNotification(message) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color, #007bff);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 3000);
    }
}

// Initialize settings when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});
