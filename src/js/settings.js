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
        this.setupCrossPageCommunication();
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
        console.log('Loading settings from storage:', this.settings);
        console.log('Theme from storage:', this.settings.theme);
        this.currentTheme = this.settings.theme || 'wood';
        console.log('Current theme set to:', this.currentTheme);
        
        // Force difficulty to 'normal' if it's not set or is invalid
        const validDifficulties = ['easy', 'normal', 'hard', 'expert'];
        if (!this.settings.difficulty || !validDifficulties.includes(this.settings.difficulty)) {
            console.log('Invalid or missing difficulty setting, forcing to normal');
            this.currentDifficulty = 'normal';
            this.updateSetting('difficulty', 'normal');
        } else {
            this.currentDifficulty = this.settings.difficulty;
        }
        console.log('Set currentDifficulty to:', this.currentDifficulty);
        
        // Apply the loaded theme immediately
        this.applyTheme(this.currentTheme);
        
        // Ensure theme is applied after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.applyTheme(this.currentTheme);
            });
        }
        
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
        // Update the theme UI to show the current selection
        this.updateThemeUI();
    }
    
    loadDifficultySettings() {
        // Update the difficulty UI to show the current selection
        console.log('Loading difficulty settings, current difficulty:', this.currentDifficulty);
        this.updateDifficultyUI();
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
        // Handle the sound toggle in the sounds section
        const soundEnabledSounds = document.getElementById('sound-enabled-sounds-section');
        if (soundEnabledSounds) {
            soundEnabledSounds.checked = this.settings.soundEnabled === true;
        }
        
        // Load sound customization with grouped effects
            this.loadSoundCustomization();
    }
    
    loadSoundCustomization() {
        const container = document.getElementById('sound-customization-container');
        if (!container) return;
        
        // Enable sound for previews
        this.soundManager.setEnabled(true);
        
        const groupedEffects = this.soundManager.getGroupedSoundEffects();
        const presets = this.soundManager.getAvailablePresets();
        const groupedSettings = this.soundManager.getGroupedSoundSettings();
        
        let html = '';
        
        // Create UI for each sound group
        for (const [groupKey, groupInfo] of Object.entries(groupedEffects)) {
            const currentPreset = groupedSettings[groupKey] || 'default';
            const isMixed = currentPreset === 'mixed';
            const isMuted = currentPreset === 'none';
            
            html += `
                <div class="sound-group-item">
                    <div class="sound-group-info">
                        <h4>${groupInfo.name}</h4>
                        <p>${groupInfo.description}</p>
                        <div class="sound-group-details">
                            <small>Includes: ${groupInfo.sounds.length} sound${groupInfo.sounds.length !== 1 ? 's' : ''}</small>
                            ${isMixed ? '<small class="mixed-indicator">⚠️ Mixed presets</small>' : ''}
                        </div>
                    </div>
                    <div class="sound-group-controls">
                        <select class="sound-group-preset-select" data-group="${groupKey}">
                            <option value="default" ${currentPreset === 'default' ? 'selected' : ''}>Default</option>
                            <option value="none" ${currentPreset === 'none' ? 'selected' : ''}>None</option>
                            ${Object.entries(presets).map(([presetKey, presetInfo]) => 
                                presetKey !== 'default' ? 
                                `<option value="${presetKey}" ${currentPreset === presetKey ? 'selected' : ''}>${presetInfo.name}</option>` 
                                : ''
                            ).join('')}
                        </select>
                        <button class="sound-group-preview-btn" data-group="${groupKey}">
                            🔊 Preview
                        </button>
                        <button class="sound-group-mute-btn ${isMuted ? 'muted' : ''}" data-group="${groupKey}" title="${isMuted ? 'Unmute' : 'Mute'}">
                            ${isMuted ? '🔇' : '🔊'}
                        </button>
                    </div>
                </div>
            `;
        }
        
        html += `
            <div class="sound-group-actions">
                <button class="sound-reset-all-btn" id="reset-all-sounds">
                    Reset All to Default
                </button>
                <button class="sound-advanced-btn" id="show-advanced-sounds">
                    Advanced Individual Settings
                </button>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Add event listeners for grouped preset changes
        container.querySelectorAll('.sound-group-preset-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const groupKey = e.target.dataset.group;
                const presetId = e.target.value;
                this.soundManager.setGroupedSoundSettings(groupKey, presetId);
                
                // Update mute button state
                const muteBtn = e.target.parentElement.querySelector('.sound-group-mute-btn');
                if (muteBtn) {
                    if (presetId === 'none') {
                        muteBtn.classList.add('muted');
                        muteBtn.textContent = '🔇';
                        muteBtn.title = 'Unmute';
                    } else {
                        muteBtn.classList.remove('muted');
                        muteBtn.textContent = '🔊';
                        muteBtn.title = 'Mute';
                    }
                }
                
                // Update mixed indicator
                const groupItem = e.target.closest('.sound-group-item');
                const mixedIndicator = groupItem.querySelector('.mixed-indicator');
                if (presetId === 'mixed') {
                    if (!mixedIndicator) {
                        const details = groupItem.querySelector('.sound-group-details');
                        details.innerHTML += '<small class="mixed-indicator">⚠️ Mixed presets</small>';
                    }
                } else if (mixedIndicator) {
                    mixedIndicator.remove();
                }
            });
        });
        
        // Add event listeners for grouped preview buttons
        container.querySelectorAll('.sound-group-preview-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const groupKey = e.currentTarget.dataset.group;
                const select = e.currentTarget.parentElement.querySelector('.sound-group-preset-select');
                const selectedPreset = select.value;
                
                if (selectedPreset === 'none') {
                    // Show a brief visual feedback for "none" option
                    const originalText = btn.textContent;
                    btn.textContent = '🔇 Silent';
                    btn.style.opacity = '0.6';
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.opacity = '1';
                    }, 500);
                } else {
                    this.soundManager.previewGroupedSound(groupKey);
                }
            });
        });
        
        // Add event listeners for grouped mute buttons
        container.querySelectorAll('.sound-group-mute-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const groupKey = e.currentTarget.dataset.group;
                const select = e.currentTarget.parentElement.querySelector('.sound-group-preset-select');
                const currentPreset = select.value;
                
                if (currentPreset === 'none') {
                    // Unmute: set to default
                    select.value = 'default';
                    this.soundManager.setGroupedSoundSettings(groupKey, 'default');
                    btn.classList.remove('muted');
                    btn.textContent = '🔊';
                    btn.title = 'Mute';
                } else {
                    // Mute: set to none
                    select.value = 'none';
                    this.soundManager.setGroupedSoundSettings(groupKey, 'none');
                    btn.classList.add('muted');
                    btn.textContent = '🔇';
                    btn.title = 'Unmute';
                }
            });
        });
        
        // Add event listener for reset all button
        const resetAllBtn = document.getElementById('reset-all-sounds');
        if (resetAllBtn) {
            resetAllBtn.addEventListener('click', async () => {
                const confirmed = await this.confirmationDialog.show(
                    'Reset all sound effects to their default sounds?'
                );
                if (confirmed) {
                    this.resetAllSounds();
                }
            });
        }
        
        // Add event listener for advanced settings button
        const advancedBtn = document.getElementById('show-advanced-sounds');
        if (advancedBtn) {
            advancedBtn.addEventListener('click', () => {
                this.toggleAdvancedSoundSettings();
            });
        }
    }
    
    resetAllSounds() {
        // Clear all custom sound mappings
        this.soundManager.customSoundMappings = {};
        this.soundManager.saveSoundMappings();
        this.soundManager.createSounds();
        
        // Reload the UI
        this.loadSoundCustomization();
        
        // Show notification
        this.showNotification('All sounds reset to default');
    }
    
    toggleAdvancedSoundSettings() {
        const container = document.getElementById('sound-customization-container');
        if (!container) return;
        
        // Check if we're currently showing advanced settings
        const isAdvanced = container.querySelector('.sound-effect-item');
        
        if (isAdvanced) {
            // Switch back to grouped view
            this.loadSoundCustomization();
        } else {
            // Switch to advanced individual settings
            this.loadAdvancedSoundCustomization();
        }
    }
    
    loadAdvancedSoundCustomization() {
        const container = document.getElementById('sound-customization-container');
        if (!container) return;
        
        const soundEffects = this.soundManager.getSoundEffects();
        const presets = this.soundManager.getAvailablePresets();
        const customMappings = this.soundManager.customSoundMappings;
        
        let html = '';
        
        // Create UI for each individual sound effect
        for (const [soundKey, soundInfo] of Object.entries(soundEffects)) {
            const currentPreset = customMappings[soundKey] || 'default';
            const isMuted = currentPreset === 'none';
            
            html += `
                <div class="sound-effect-item">
                    <div class="sound-effect-info">
                        <h4>${soundInfo.name}</h4>
                        <p>${soundInfo.description}</p>
                    </div>
                    <div class="sound-effect-controls">
                    <select class="sound-preset-select" data-sound="${soundKey}">
                        <option value="default" ${currentPreset === 'default' ? 'selected' : ''}>Default</option>
                        <option value="none" ${currentPreset === 'none' ? 'selected' : ''}>None</option>
                        ${Object.entries(presets).map(([presetKey, presetInfo]) => 
                            presetKey !== 'default' ? 
                            `<option value="${presetKey}" ${currentPreset === presetKey ? 'selected' : ''}>${presetInfo.name}</option>` 
                            : ''
                        ).join('')}
                    </select>
                    <button class="sound-preview-btn" data-sound="${soundKey}">
                        🔊 Preview
                    </button>
                    <button class="sound-mute-btn ${isMuted ? 'muted' : ''}" data-sound="${soundKey}" title="${isMuted ? 'Unmute' : 'Mute'}">
                        ${isMuted ? '🔇' : '🔊'}
                    </button>
                    </div>
                </div>
            `;
        }
        
        html += `
            <div class="sound-group-actions">
                <button class="sound-reset-all-btn" id="reset-all-sounds">
                    Reset All to Default
                </button>
                <button class="sound-advanced-btn" id="show-advanced-sounds">
                    Back to Grouped Settings
                </button>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Add event listeners for individual sound preset changes
        container.querySelectorAll('.sound-preset-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const soundKey = e.target.dataset.sound;
                const presetId = e.target.value;
                this.soundManager.setCustomSoundMapping(soundKey, presetId);
                
                // Update mute button state
                const muteBtn = e.target.parentElement.querySelector('.sound-mute-btn');
                if (muteBtn) {
                    if (presetId === 'none') {
                        muteBtn.classList.add('muted');
                        muteBtn.textContent = '🔇';
                        muteBtn.title = 'Unmute';
                    } else {
                        muteBtn.classList.remove('muted');
                        muteBtn.textContent = '🔊';
                        muteBtn.title = 'Mute';
                    }
                }
            });
        });
        
        // Add event listeners for individual sound preview buttons
        container.querySelectorAll('.sound-preview-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const soundKey = e.currentTarget.dataset.sound;
                const select = e.currentTarget.parentElement.querySelector('.sound-preset-select');
                const selectedPreset = select.value;
                
                if (selectedPreset === 'none') {
                    // Show a brief visual feedback for "none" option
                    const originalText = btn.textContent;
                    btn.textContent = '🔇 Silent';
                    btn.style.opacity = '0.6';
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.opacity = '1';
                    }, 500);
                } else {
                    this.soundManager.previewSound(selectedPreset);
                }
            });
        });
        
        // Add event listeners for individual sound mute buttons
        container.querySelectorAll('.sound-mute-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const soundKey = e.currentTarget.dataset.sound;
                const select = e.currentTarget.parentElement.querySelector('.sound-preset-select');
                const currentPreset = select.value;
                
                if (currentPreset === 'none') {
                    // Unmute: set to default
                    select.value = 'default';
                    this.soundManager.setCustomSoundMapping(soundKey, 'default');
                    btn.classList.remove('muted');
                    btn.textContent = '🔊';
                    btn.title = 'Mute';
                } else {
                    // Mute: set to none
                    select.value = 'none';
                    this.soundManager.setCustomSoundMapping(soundKey, 'none');
                    btn.classList.add('muted');
                    btn.textContent = '🔇';
                    btn.title = 'Unmute';
                }
            });
        });
        
        // Add event listener for reset all button
        const resetAllBtn = document.getElementById('reset-all-sounds');
        if (resetAllBtn) {
            resetAllBtn.addEventListener('click', async () => {
                const confirmed = await this.confirmationDialog.show(
                    'Reset all sound effects to their default sounds?'
                );
                if (confirmed) {
                    this.resetAllSounds();
                }
            });
        }
        
        // Add event listener for advanced settings button
        const advancedBtn = document.getElementById('show-advanced-sounds');
        if (advancedBtn) {
            advancedBtn.addEventListener('click', () => {
                this.toggleAdvancedSoundSettings();
            });
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
        console.log('Setting up difficulty listeners for', difficultyButtons.length, 'buttons');
        difficultyButtons.forEach((button, index) => {
            console.log(`Setting up listener for button ${index}:`, button.dataset.difficulty);
            button.addEventListener('click', async (e) => {
                console.log('Difficulty button clicked:', button.dataset.difficulty);
                e.preventDefault();
                const difficulty = button.dataset.difficulty;
                await this.selectDifficulty(difficulty);
            });
            
            // Also add mousedown and touchstart for debugging
            button.addEventListener('mousedown', (e) => {
                console.log('Difficulty button mousedown:', button.dataset.difficulty);
            });
            
            button.addEventListener('touchstart', (e) => {
                console.log('Difficulty button touchstart:', button.dataset.difficulty);
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
                this.viewLastGame();
            });
        }
    }
    
    viewLastGame() {
        // Check if there's last game data
        const lastGameData = localStorage.getItem('blockdoku_lastgame');
        
        if (!lastGameData) {
            // No last game data available
            this.showNotification('No last game data available. Play a game first!');
            return;
        }
        
        try {
            // Verify the data is valid JSON
            const parsedData = JSON.parse(lastGameData);
            if (!parsedData || !parsedData.score) {
                throw new Error('Invalid last game data');
            }
            
            // Navigate to last game page
            window.location.href = 'lastgame.html';
        } catch (error) {
            console.error('Error checking last game data:', error);
            this.showNotification('Error loading last game data. Please try again.');
        }
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
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-weight: 500;
            max-width: 300px;
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
    
    // Method to reset difficulty to normal (for debugging)
    resetDifficultyToNormal() {
        console.log('Resetting difficulty to normal');
        this.currentDifficulty = 'normal';
        this.updateSetting('difficulty', 'normal');
        this.updateDifficultyUI();
        this.showNotification('Difficulty reset to Normal');
    }
    
    setupCrossPageCommunication() {
        // Listen for storage changes from other pages (like game-settings.html)
        window.addEventListener('storage', (e) => {
            if (e.key === 'blockdoku-settings' || e.key === 'blockdoku_settings') {
                console.log('Settings changed in another page, reloading...');
                this.settings = this.storage.loadSettings();
                this.loadSettings();
                this.updateUI();
            }
        });
        
        // Listen for custom events from the same page
        window.addEventListener('settingsChanged', (e) => {
            console.log('Settings changed in same page, updating...');
            this.settings = this.storage.loadSettings();
            this.loadSettings();
            this.updateUI();
        });
    }
    
    selectTheme(theme) {
        this.currentTheme = theme;
        this.updateSetting('theme', theme);
        this.applyTheme(theme);
        this.updateThemeUI();
    }
    
    async selectDifficulty(difficulty) {
        console.log('selectDifficulty called with:', difficulty);
        
        // Check if there's a game in progress by looking at localStorage
        const gameState = this.storage.loadGameState();
        let gameInProgress = false;
        
        if (gameState) {
            gameInProgress = gameState.score > 0 || (gameState.board && gameState.board.some(row => row.some(cell => cell === 1)));
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
        this.updateSetting('difficulty', difficulty);
        this.updateDifficultyUI();
        console.log('Difficulty selection completed');
    }
    
    applyTheme(theme) {
        console.log('Settings applyTheme called with:', theme);
        const themeLink = document.getElementById('theme-css');
        if (themeLink) {
            themeLink.href = `css/themes/${theme}.css`;
            console.log('Theme link updated to:', themeLink.href);
            } else {
            console.log('Theme link not found!');
        }
        
        // Update body class for theme-specific styling
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${theme}`);
    }
    
    updateThemeUI() {
        const themeButtons = document.querySelectorAll('.theme-option');
        console.log('Updating theme UI, found', themeButtons.length, 'theme buttons, current theme:', this.currentTheme);
        themeButtons.forEach(button => {
            button.classList.remove('selected');
            if (button.dataset.theme === this.currentTheme) {
                button.classList.add('selected');
                console.log('Selected theme button:', button.dataset.theme);
            }
        });
    }
    
    updateDifficultyUI() {
        const difficultyButtons = document.querySelectorAll('.difficulty-option');
        console.log('Updating difficulty UI, found', difficultyButtons.length, 'buttons, current difficulty:', this.currentDifficulty);
        difficultyButtons.forEach(button => {
            button.classList.remove('selected');
            if (button.dataset.difficulty === this.currentDifficulty) {
                button.classList.add('selected');
                console.log('Selected difficulty button:', button.dataset.difficulty);
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
        
        // Dispatch custom event to notify other components on the same page
        window.dispatchEvent(new CustomEvent('settingsChanged', {
            detail: { key, value }
        }));
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
