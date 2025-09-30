import { GameStorage } from './storage/game-storage.js';
import { ConfirmationDialog } from './ui/confirmation-dialog.js';

export class GameSettingsManager {
    constructor() {
        this.storage = new GameStorage();
        this.settings = this.storage.loadSettings();
        this.confirmationDialog = new ConfirmationDialog();
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.updateUI();
    }
    
    loadSettings() {
        // Load all settings from storage
        this.settings = this.storage.loadSettings();
        
        // Load combo display settings
        this.loadComboDisplaySettings();
        
        // Load game modes settings
        this.loadGameModesSettings();
        
        // Load basic settings
        this.loadBasicSettings();
        
        // Load animation settings
        this.loadAnimationSettings();
        
        // Load additional settings
        this.loadAdditionalSettings();
        
        // Load utility bar settings
        this.loadUtilityBarSettings();
    }
    
    loadComboDisplaySettings() {
        const comboDisplayMode = this.settings.comboDisplayMode || 'cumulative';
        const streakRadio = document.getElementById('combo-streak');
        const cumulativeRadio = document.getElementById('combo-cumulative');
        
        if (streakRadio && cumulativeRadio) {
            if (comboDisplayMode === 'streak') {
                streakRadio.checked = true;
            } else {
                cumulativeRadio.checked = true;
            }
        }
    }
    
    loadGameModesSettings() {
        // Petrification
        const petrificationCheckbox = document.getElementById('enable-petrification');
        if (petrificationCheckbox) {
            petrificationCheckbox.checked = this.settings.enablePetrification === true;
        }
        
        // Dead pixels
        const deadPixelsCheckbox = document.getElementById('enable-dead-pixels');
        const deadPixelsIntensity = document.getElementById('dead-pixels-intensity');
        const deadPixelsIntensityValue = document.getElementById('dead-pixels-intensity-value');
        const deadPixelsContainer = document.getElementById('dead-pixels-intensity-container');
        
        if (deadPixelsCheckbox) {
            deadPixelsCheckbox.checked = this.settings.enableDeadPixels === true;
            
            // Show/hide intensity slider
            if (deadPixelsContainer) {
                deadPixelsContainer.style.display = this.settings.enableDeadPixels ? 'block' : 'none';
            }
        }
        
        if (deadPixelsIntensity && deadPixelsIntensityValue) {
            const intensity = this.settings.deadPixelsIntensity || 0;
            deadPixelsIntensity.value = intensity;
            deadPixelsIntensityValue.textContent = intensity;
        }
        
        // Speed mode
        const speedMode = this.settings.speedMode || 'bonus';
        const bonusRadio = document.getElementById('speed-mode-bonus');
        const punishmentRadio = document.getElementById('speed-mode-punishment');
        const ignoredRadio = document.getElementById('speed-mode-ignored');
        
        if (bonusRadio && punishmentRadio && ignoredRadio) {
            if (speedMode === 'punishment') {
                punishmentRadio.checked = true;
            } else if (speedMode === 'ignored') {
                ignoredRadio.checked = true;
            } else {
                bonusRadio.checked = true;
            }
        }
    }
    
    loadBasicSettings() {
        // High score in header
        const showHighScoreCheckbox = document.getElementById('show-high-score');
        if (showHighScoreCheckbox) {
            showHighScoreCheckbox.checked = this.settings.showHighScore === true;
        }
        
        // Sound effects
        const soundCheckbox = document.getElementById('sound-enabled');
        if (soundCheckbox) {
            soundCheckbox.checked = this.settings.soundEnabled === true;
        }
        
        // Master animations
        const animationsCheckbox = document.getElementById('animations-enabled');
        if (animationsCheckbox) {
            animationsCheckbox.checked = this.settings.animationsEnabled !== false; // Default to true
        }
    }
    
    loadAnimationSettings() {
        // Individual animation settings
        const animationSettings = [
            'block-hover-effects',
            'block-selection-glow',
            'block-entrance-animations',
            'block-placement-animations',
            'line-clear-animations',
            'score-animations',
            'combo-animations',
            'particle-effects'
        ];
        
        animationSettings.forEach(settingId => {
            const checkbox = document.getElementById(settingId);
            if (checkbox) {
                checkbox.checked = this.settings[settingId] !== false; // Default to true for most
            }
        });
        
        // Animation speed
        const animationSpeedSelect = document.getElementById('animation-speed');
        if (animationSpeedSelect) {
            animationSpeedSelect.value = this.settings.animationSpeed || 'normal';
        }
    }
    
    loadAdditionalSettings() {
        const additionalSettings = [
            'haptic-enabled',
            'auto-save',
            'show-points',
            'show-placement-points',
            'enable-prize-recognition',
            'success-mode-enabled'
        ];
        
        additionalSettings.forEach(settingId => {
            const checkbox = document.getElementById(settingId);
            if (checkbox) {
                checkbox.checked = this.settings[settingId] !== false; // Default to true for most
            }
        });
    }
    
    loadUtilityBarSettings() {
        // Utility bar settings - map kebab-case IDs to camelCase settings keys
        const utilityBarSettings = [
            { id: 'enable-hints', key: 'enableHints' },
            { id: 'enable-timer', key: 'enableTimer' },
            { id: 'show-personal-bests', key: 'showPersonalBests' },
            { id: 'show-speed-timer', key: 'showSpeedTimer' }
        ];
        
        utilityBarSettings.forEach(({ id, key }) => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = this.settings[key] === true;
            }
        });
    }
    
    setupEventListeners() {
        // Combo display settings
        this.setupComboDisplayListeners();
        
        // Game modes settings
        this.setupGameModesListeners();
        
        // Basic settings
        this.setupBasicSettingsListeners();
        
        // Animation settings
        this.setupAnimationListeners();
        
        // Additional settings
        this.setupAdditionalSettingsListeners();
        
        // Utility bar settings
        this.setupUtilityBarListeners();
        
        // Reset statistics button
        this.setupResetStatisticsListener();
    }
    
    setupComboDisplayListeners() {
        const streakRadio = document.getElementById('combo-streak');
        const cumulativeRadio = document.getElementById('combo-cumulative');
        
        if (streakRadio) {
            streakRadio.addEventListener('change', () => {
                if (streakRadio.checked) {
                    this.saveSetting('comboDisplayMode', 'streak');
                }
            });
        }
        
        if (cumulativeRadio) {
            cumulativeRadio.addEventListener('change', () => {
                if (cumulativeRadio.checked) {
                    this.saveSetting('comboDisplayMode', 'cumulative');
                }
            });
        }
    }
    
    setupGameModesListeners() {
        // Petrification
        const petrificationCheckbox = document.getElementById('enable-petrification');
        if (petrificationCheckbox) {
            petrificationCheckbox.addEventListener('change', () => {
                this.saveSetting('enablePetrification', petrificationCheckbox.checked);
            });
        }
        
        // Dead pixels
        const deadPixelsCheckbox = document.getElementById('enable-dead-pixels');
        const deadPixelsIntensity = document.getElementById('dead-pixels-intensity');
        const deadPixelsContainer = document.getElementById('dead-pixels-intensity-container');
        
        if (deadPixelsCheckbox) {
            deadPixelsCheckbox.addEventListener('change', () => {
                this.saveSetting('enableDeadPixels', deadPixelsCheckbox.checked);
                
                // Show/hide intensity slider
                if (deadPixelsContainer) {
                    deadPixelsContainer.style.display = deadPixelsCheckbox.checked ? 'block' : 'none';
                }
            });
        }
        
        if (deadPixelsIntensity) {
            deadPixelsIntensity.addEventListener('input', () => {
                const intensity = parseInt(deadPixelsIntensity.value);
                this.saveSetting('deadPixelsIntensity', intensity);
                
                // Update display value
                const intensityValue = document.getElementById('dead-pixels-intensity-value');
                if (intensityValue) {
                    intensityValue.textContent = intensity;
                }
            });
        }
        
        // Speed mode
        const bonusRadio = document.getElementById('speed-mode-bonus');
        const punishmentRadio = document.getElementById('speed-mode-punishment');
        const ignoredRadio = document.getElementById('speed-mode-ignored');
        
        if (bonusRadio) {
            bonusRadio.addEventListener('change', () => {
                if (bonusRadio.checked) {
                    this.saveSetting('speedMode', 'bonus');
                }
            });
        }
        
        if (punishmentRadio) {
            punishmentRadio.addEventListener('change', () => {
                if (punishmentRadio.checked) {
                    this.saveSetting('speedMode', 'punishment');
                }
            });
        }
        
        if (ignoredRadio) {
            ignoredRadio.addEventListener('change', () => {
                if (ignoredRadio.checked) {
                    this.saveSetting('speedMode', 'ignored');
                }
            });
        }
    }
    
    setupBasicSettingsListeners() {
        // High score in header
        const showHighScoreCheckbox = document.getElementById('show-high-score');
        if (showHighScoreCheckbox) {
            showHighScoreCheckbox.addEventListener('change', () => {
                this.saveSetting('showHighScore', showHighScoreCheckbox.checked);
            });
        }
        
        // Sound effects
        const soundCheckbox = document.getElementById('sound-enabled');
        if (soundCheckbox) {
            soundCheckbox.addEventListener('change', () => {
                this.saveSetting('soundEnabled', soundCheckbox.checked);
            });
        }
        
        // Master animations
        const animationsCheckbox = document.getElementById('animations-enabled');
        if (animationsCheckbox) {
            animationsCheckbox.addEventListener('change', () => {
                this.saveSetting('animationsEnabled', animationsCheckbox.checked);
            });
        }
    }
    
    setupAnimationListeners() {
        // Individual animation settings
        const animationSettings = [
            'block-hover-effects',
            'block-selection-glow',
            'block-entrance-animations',
            'block-placement-animations',
            'line-clear-animations',
            'score-animations',
            'combo-animations',
            'particle-effects'
        ];
        
        animationSettings.forEach(settingId => {
            const checkbox = document.getElementById(settingId);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.saveSetting(settingId, checkbox.checked);
                });
            }
        });
        
        // Animation speed
        const animationSpeedSelect = document.getElementById('animation-speed');
        if (animationSpeedSelect) {
            animationSpeedSelect.addEventListener('change', () => {
                this.saveSetting('animationSpeed', animationSpeedSelect.value);
            });
        }
    }
    
    setupAdditionalSettingsListeners() {
        const additionalSettings = [
            'haptic-enabled',
            'auto-save',
            'show-points',
            'show-placement-points',
            'enable-prize-recognition',
            'success-mode-enabled'
        ];
        
        additionalSettings.forEach(settingId => {
            const checkbox = document.getElementById(settingId);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.saveSetting(settingId, checkbox.checked);
                });
            }
        });
    }
    
    setupUtilityBarListeners() {
        const utilityBarSettings = [
            { id: 'enable-hints', key: 'enableHints' },
            { id: 'enable-timer', key: 'enableTimer' },
            { id: 'show-personal-bests', key: 'showPersonalBests' },
            { id: 'show-speed-timer', key: 'showSpeedTimer' }
        ];
        
        utilityBarSettings.forEach(({ id, key }) => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.saveSetting(key, checkbox.checked);
                });
            }
        });
    }
    
    setupResetStatisticsListener() {
        const resetStatsButton = document.getElementById('reset-stats');
        if (resetStatsButton) {
            resetStatsButton.addEventListener('click', () => {
                this.confirmationDialog.show(
                    'Reset Statistics',
                    'Are you sure you want to reset all your game statistics? This action cannot be undone.',
                    () => {
                        this.resetStatistics();
                    }
                );
            });
        }
    }
    
    saveSetting(key, value) {
        this.settings[key] = value;
        this.storage.saveSettings(this.settings);
        console.log(`Setting saved: ${key} = ${value}`);
    }
    
    resetStatistics() {
        // Reset all statistics
        const resetData = {
            highScores: {},
            personalBests: {},
            totalGamesPlayed: 0,
            totalScore: 0,
            totalLinesCleared: 0,
            totalCombos: 0,
            maxComboStreak: 0,
            totalPlayTime: 0
        };
        
        // Save reset statistics
        this.storage.saveStatistics(resetData);
        
        // Show success message
        this.showNotification('Statistics reset successfully!');
    }
    
    showNotification(message) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 1000;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    updateUI() {
        // Update any UI elements that need refreshing
        this.loadSettings();
    }
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.gameSettingsManager = new GameSettingsManager();
    });
} else {
    // DOM is already ready, instantiate immediately
    window.gameSettingsManager = new GameSettingsManager();
}
