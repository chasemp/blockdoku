import { GameStorage } from './storage/game-storage.js';
import { ConfirmationDialog } from './ui/confirmation-dialog.js';
import { DifficultySettingsManager } from './difficulty/difficulty-settings-manager.js';

export class GameSettingsManager {
    constructor() {
        this.storage = new GameStorage();
        this.difficultySettings = new DifficultySettingsManager(this.storage);
        this.settings = this.storage.loadSettings();
        this.currentDifficulty = this.settings.difficulty || 'normal';
        this.confirmationDialog = new ConfirmationDialog();
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.setupResetListeners();
        this.setupCrossPageCommunication();
        this.updateUI();
    }
    
    loadSettings() {
        // Load base settings from storage
        const baseSettings = this.storage.loadSettings();
        this.currentDifficulty = baseSettings.difficulty || 'normal';
        
        // Get difficulty-specific settings (defaults + overrides)
        const difficultySettings = this.difficultySettings.getSettingsForDifficulty(this.currentDifficulty);
        
        // Merge base settings with difficulty-specific settings
        this.settings = { ...baseSettings, ...difficultySettings };
        
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
        
        // Magic blocks
        const magicBlocksCheckbox = document.getElementById('enable-magic-blocks');
        if (magicBlocksCheckbox) {
            magicBlocksCheckbox.checked = this.settings.enableMagicBlocks === true;
        }
        
        // Auto-rotate blocks
        const autoRotateCheckbox = document.getElementById('auto-rotate-blocks');
        if (autoRotateCheckbox) {
            autoRotateCheckbox.checked = this.settings.autoRotateBlocks === true;
        }
        
        // Wild block shapes
        const wildShapesCheckbox = document.getElementById('enable-wild-shapes');
        if (wildShapesCheckbox) {
            wildShapesCheckbox.checked = this.settings.enableWildShapes === true;
        }
        
        // Speed mode
        const speedMode = this.settings.speedMode || 'ignored';
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
        
        // Speed display mode
        const speedDisplayMode = this.settings.speedDisplayMode || 'timer';
        const timerRadio = document.getElementById('speed-display-timer');
        const pointsRadio = document.getElementById('speed-display-points');
        
        if (timerRadio && pointsRadio) {
            if (speedDisplayMode === 'points') {
                pointsRadio.checked = true;
            } else {
                timerRadio.checked = true;
            }
        }
    }
    
    loadBasicSettings() {
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
        
        // Piece timeout
        const pieceTimeoutCheckbox = document.getElementById('piece-timeout-enabled');
        if (pieceTimeoutCheckbox) {
            pieceTimeoutCheckbox.checked = this.settings.pieceTimeoutEnabled === true;
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
        const animationSpeed = this.settings.animationSpeed || 'normal';
        const animationSpeedRadio = document.getElementById(`animation-speed-${animationSpeed}`);
        if (animationSpeedRadio) {
            animationSpeedRadio.checked = true;
        }
    }
    
    loadAdditionalSettings() {
        const additionalSettings = [
            { id: 'haptic-enabled', key: 'hapticEnabled' },
            { id: 'auto-save', key: 'autoSave' },
            { id: 'show-points', key: 'showPoints' },
            { id: 'show-placement-points', key: 'showPlacementPoints' },
            { id: 'enable-prize-recognition', key: 'enablePrizeRecognition' },
            { id: 'success-mode-enabled', key: 'successModeEnabled' }
        ];
        
        additionalSettings.forEach(({ id, key }) => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = this.settings[key] === true;
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
        
        // Handle countdown duration slider
        const timerCheckbox = document.getElementById('enable-timer');
        const countdownDuration = document.getElementById('countdown-duration');
        const countdownDurationValue = document.getElementById('countdown-duration-value');
        const countdownContainer = document.getElementById('countdown-duration-container');
        
        if (timerCheckbox && countdownContainer) {
            // Show/hide duration slider based on timer checkbox
            countdownContainer.style.display = this.settings.enableTimer ? 'block' : 'none';
        }
        
        if (countdownDuration && countdownDurationValue) {
            const duration = this.settings.countdownDuration || 3;
            countdownDuration.value = duration;
            countdownDurationValue.textContent = `${duration}:00`;
        }
    }
    
    setupEventListeners() {
        // Difficulty selection
        this.setupDifficultyListeners();
        
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
    
    setupDifficultyListeners() {
        const difficultyOptions = document.querySelectorAll('.difficulty-option');
        
        difficultyOptions.forEach(option => {
            option.addEventListener('click', async (e) => {
                e.preventDefault();
                const difficulty = option.dataset.difficulty;
                
                if (difficulty === this.currentDifficulty) {
                    return; // Already selected
                }
                
                // No confirmation needed - difficulty changes apply to current game without resetting progress
                
                console.log(`🎮 Game Settings: Changing difficulty to ${difficulty.toUpperCase()}`);
                
                // Update difficulty
                this.currentDifficulty = difficulty;
                this.settings.difficulty = difficulty;
                
                // Apply difficulty-specific settings
                const difficultySettings = this.difficultySettings.getSettingsForDifficulty(difficulty);
                Object.assign(this.settings, difficultySettings);
                
                // Save settings
                this.storage.saveSettings(this.settings);
                
                    // Update UI
                    this.updateDifficultySelection();
                    this.loadSettings(); // Reload to apply new difficulty settings
                    this.updateUI();
                    
                    // Individual setting bubbles disabled for cleaner UI
                    // setTimeout(() => {
                    //     this.updateIndividualSettingBubbles();
                    // }, 150);
                
                // Notify other pages
                window.postMessage({
                    type: 'difficultyChanged',
                    difficulty: difficulty
                }, '*');
            });
        });
    }
    
    updateDifficultySelection() {
        const difficultyOptions = document.querySelectorAll('.difficulty-option');
        
        difficultyOptions.forEach(option => {
            const difficulty = option.dataset.difficulty;
            if (difficulty === this.currentDifficulty) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
            
            // Update description with dynamic defaults
            this.updateDifficultyDescription(option, difficulty);
        });
    }
    
    updateDifficultyDescription(option, difficulty) {
        // Find the description paragraph in the option
        const descriptionP = option.querySelector('p');
        if (!descriptionP) return;
        
        // Get the difficulty manager (we need to create one if it doesn't exist)
        if (!this.difficultyManager) {
            // Import and create difficulty manager
            import('./difficulty/difficulty-manager.js').then(module => {
                const DifficultyManager = module.DifficultyManager;
                this.difficultyManager = new DifficultyManager();
                
                // Generate description with bubbles
                this.renderDifficultyWithBubbles(descriptionP, difficulty);
            }).catch(error => {
                console.warn('Could not load difficulty manager for descriptions:', error);
            });
        } else {
            // Generate description with bubbles
            this.renderDifficultyWithBubbles(descriptionP, difficulty);
        }
    }
    
    renderDifficultyWithBubbles(container, difficulty) {
        // Get short description
        const difficultyInfo = this.difficultyManager.difficultySettings[difficulty];
        const shortDesc = difficultyInfo ? difficultyInfo.shortDescription : '';
        
        // Get comparison bubbles
        const bubbles = this.difficultyManager.getComparisonBubbles(difficulty, this.difficultySettings);
        
        // Create HTML with short description and bubbles
        let html = `<span class="difficulty-short-desc">${shortDesc}</span>`;
        
        if (bubbles.length > 0) {
            html += '<div class="difficulty-bubbles">';
            bubbles.forEach(bubble => {
                const bubbleClass = bubble.type === 'enabled' ? 'bubble-enabled' : 'bubble-disabled';
                html += `<span class="difficulty-bubble ${bubbleClass}">${bubble.emoji} ${bubble.label}</span>`;
            });
            html += '</div>';
        }
        
        container.innerHTML = html;
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
        
        // Magic blocks
        const magicBlocksCheckbox = document.getElementById('enable-magic-blocks');
        if (magicBlocksCheckbox) {
            magicBlocksCheckbox.addEventListener('change', () => {
                this.saveSetting('enableMagicBlocks', magicBlocksCheckbox.checked);
            });
        }
        
        // Auto-rotate blocks
        const autoRotateCheckbox = document.getElementById('auto-rotate-blocks');
        if (autoRotateCheckbox) {
            autoRotateCheckbox.addEventListener('change', () => {
                this.saveSetting('autoRotateBlocks', autoRotateCheckbox.checked);
            });
        }
        
        // Wild block shapes
        const wildShapesCheckbox = document.getElementById('enable-wild-shapes');
        if (wildShapesCheckbox) {
            wildShapesCheckbox.addEventListener('change', () => {
                this.saveSetting('enableWildShapes', wildShapesCheckbox.checked);
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
        
        // Speed display mode
        const timerRadio = document.getElementById('speed-display-timer');
        const pointsRadio = document.getElementById('speed-display-points');
        
        if (timerRadio) {
            timerRadio.addEventListener('change', () => {
                if (timerRadio.checked) {
                    this.saveSetting('speedDisplayMode', 'timer');
                }
            });
        }
        
        if (pointsRadio) {
            pointsRadio.addEventListener('change', () => {
                if (pointsRadio.checked) {
                    this.saveSetting('speedDisplayMode', 'points');
                }
            });
        }
    }
    
    setupBasicSettingsListeners() {
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
        
        // Piece timeout
        const pieceTimeoutCheckbox = document.getElementById('piece-timeout-enabled');
        if (pieceTimeoutCheckbox) {
            pieceTimeoutCheckbox.addEventListener('change', () => {
                this.saveSetting('pieceTimeoutEnabled', pieceTimeoutCheckbox.checked);
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
        const animationSpeedRadios = document.querySelectorAll('input[name="animation-speed"]');
        animationSpeedRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    this.saveSetting('animationSpeed', radio.value);
                }
            });
        });
    }
    
    setupAdditionalSettingsListeners() {
        const additionalSettings = [
            { id: 'haptic-enabled', key: 'hapticEnabled' },
            { id: 'auto-save', key: 'autoSave' },
            { id: 'show-points', key: 'showPoints' },
            { id: 'show-placement-points', key: 'showPlacementPoints' },
            { id: 'enable-prize-recognition', key: 'enablePrizeRecognition' },
            { id: 'success-mode-enabled', key: 'successModeEnabled' }
        ];
        
        additionalSettings.forEach(({ id, key }) => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.saveSetting(key, checkbox.checked);
                    
                    // Special handling for show-points setting
                    if (id === 'show-points') {
                        this.updateBlockPointsDisplay();
                    }
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
                checkbox.addEventListener('change', async () => {
                    // Special handling for timer checkbox - show warning if enabling mid-game
                    if (id === 'enable-timer') {
                        const wasEnabled = this.settings[key] === true;
                        const willBeEnabled = checkbox.checked;
                        
                        // Show warning if enabling countdown or disabling it mid-game
                        if (wasEnabled !== willBeEnabled && this.isGameInProgress()) {
                            const action = willBeEnabled ? 'enabling' : 'disabling';
                            const confirmed = await this.confirmationDialog.show(
                                `⚠️ Countdown Timer Change\n\n${action === 'enabling' ? 'Enabling' : 'Disabling'} the countdown timer mid-game will reset your current score to 0.\n\nThis ensures fair scoring since the countdown timer affects the game's difficulty and scoring system.\n\nDo you want to continue?`
                            );
                            
                            if (!confirmed) {
                                // Revert checkbox state
                                checkbox.checked = wasEnabled;
                                return;
                            }
                            
                            // Save setting BEFORE resetting game so timer system can initialize correctly
                            this.saveSetting(key, checkbox.checked);
                            
                            // Reset the game score (this will reinitialize the timer system)
                            this.resetCurrentGameScore();
                        } else {
                            // Save setting for non-game-in-progress case
                            this.saveSetting(key, checkbox.checked);
                            
                            // Update timer display in game window if it exists
                            if (window.opener && window.opener.game) {
                                const game = window.opener.game;
                                if (game.timerSystem) {
                                    if (checkbox.checked) {
                                        game.timerSystem.initialize();
                                        game.timerSystem.start();
                                    } else {
                                        game.timerSystem.disable();
                                    }
                                }
                                if (game.updateTimerDisplay) {
                                    game.updateTimerDisplay();
                                }
                            }
                        }
                        
                        // Show/hide duration slider
                        const countdownContainer = document.getElementById('countdown-duration-container');
                        if (countdownContainer) {
                            countdownContainer.style.display = checkbox.checked ? 'block' : 'none';
                        }
                    } else {
                        this.saveSetting(key, checkbox.checked);
                    }
                });
            }
        });
        
        // Countdown duration slider
        const countdownDuration = document.getElementById('countdown-duration');
        if (countdownDuration) {
            countdownDuration.addEventListener('input', async () => {
                const newDuration = parseInt(countdownDuration.value);
                const currentDuration = this.settings.countdownDuration || 3;
                
                // Show warning if changing duration mid-game and countdown is enabled
                if (newDuration !== currentDuration && this.isGameInProgress() && this.settings.enableTimer) {
                    const confirmed = await this.confirmationDialog.show(
                        `⚠️ Countdown Duration Change\n\nChanging the countdown duration mid-game will reset your current score to 0.\n\nThis ensures fair scoring since the countdown timer affects the game's difficulty and scoring system.\n\nDo you want to continue?`
                    );
                    
                    if (!confirmed) {
                        // Revert slider value
                        countdownDuration.value = currentDuration;
                        return;
                    }
                    
                    // Save setting BEFORE resetting game so timer system can initialize with new duration
                    this.saveSetting('countdownDuration', newDuration);
                    
                    // Reset the game score (this will reinitialize the timer system)
                    this.resetCurrentGameScore();
                } else {
                    // Save setting for non-game-in-progress case
                    this.saveSetting('countdownDuration', newDuration);
                    
                    // Update timer display in game window if it exists and countdown is enabled
                    if (window.opener && window.opener.game && this.settings.enableTimer) {
                        const game = window.opener.game;
                        if (game.timerSystem) {
                            game.timerSystem.initialize();
                            game.timerSystem.start();
                        }
                        if (game.updateTimerDisplay) {
                            game.updateTimerDisplay();
                        }
                    }
                }
                
                // Update display value
                const durationValue = document.getElementById('countdown-duration-value');
                if (durationValue) {
                    durationValue.textContent = `${newDuration}:00`;
                }
            });
        }
    }
    
    setupResetStatisticsListener() {
        const resetStatsButton = document.getElementById('reset-stats');
        if (resetStatsButton) {
            resetStatsButton.addEventListener('click', async () => {
                const confirmed = await this.confirmationDialog.show(
                    '⚠️ PERMANENT DATA LOSS WARNING ⚠️\n\nThis will permanently delete ALL your game data:\n• All high scores for all difficulty levels\n• All game statistics (games played, totals, combos)\n• All personal best records\n• All play time data\n\nYour game settings and preferences will NOT be affected.\n\nThis action CANNOT be undone. Are you absolutely sure you want to continue?'
                );
                if (!confirmed) return;
                
                this.resetStatistics();
            });
        }
    }
    
    setupCrossPageCommunication() {
        // Listen for storage changes from other pages (like settings.html)
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
    
    saveSetting(key, value) {
        // Check if this is a difficulty-specific setting
        const difficultySpecificSettings = [
            'enableHints', 'showPoints', 'enableTimer', 'enablePetrification', 
            'enableDeadPixels', 'showPersonalBests', 'showSpeedTimer', 'speedMode',
            'animationsEnabled', 'soundEnabled', 'enableWildBlocks'
        ];
        
        if (difficultySpecificSettings.includes(key)) {
            // Save as difficulty-specific override
            this.difficultySettings.saveSettingOverride(this.currentDifficulty, key, value);
            console.log(`Difficulty-specific setting saved: ${key} = ${value} for ${this.currentDifficulty}`);
        } else {
            // Save as global setting
            this.settings[key] = value;
            this.storage.saveSettings(this.settings);
            console.log(`Global setting saved: ${key} = ${value}`);
        }
        
        // Update local settings
        this.settings[key] = value;
        
        // Dispatch custom event to notify other components on the same page
        window.dispatchEvent(new CustomEvent('settingsChanged', {
            detail: { key, value }
        }));
        
        // Update difficulty bubbles to reflect user changes
        this.updateDifficultyBubbles();
        
        // Update setting state bubbles to reflect on/off state
        this.updateSettingStateBubbles();
    }
    
    updateDifficultyBubbles() {
        // Refresh all difficulty option bubbles
        const difficultyOptions = document.querySelectorAll('.difficulty-option');
        difficultyOptions.forEach(option => {
            const difficulty = option.dataset.difficulty;
            this.updateDifficultyDescription(option, difficulty);
        });
        
        // Clean up any existing individual setting bubbles
        this.updateIndividualSettingBubbles(); // Now just cleans up existing bubbles
    }
    
    updateIndividualSettingBubbles() {
        // DISABLED: This feature was adding extra decorative bubbles that created visual clutter
        // and inconsistency between difficulty modes. Now we just clean up any existing ones.
        
        // Clear existing individual bubbles
        document.querySelectorAll('.individual-setting-bubble').forEach(bubble => {
            bubble.remove();
        });
        
        return; // Exit early - feature disabled
        
        // The rest of this function is kept for reference but not executed
        if (!this.difficultyManager) return;
        
        // Get comparison bubbles for current difficulty
        const bubbles = this.difficultyManager.getComparisonBubbles(this.currentDifficulty, this.difficultySettings);
        
        // Map setting keys to their HTML element IDs
        const settingElementMap = {
            'enableHints': 'enable-hints',
            'showPoints': 'show-points', 
            'enableTimer': 'enable-timer',
            'showPersonalBests': 'show-personal-bests',
            'showSpeedTimer': 'show-speed-timer',
            'enablePrizeRecognition': 'enable-prize-recognition',
            'pieceTimeoutEnabled': 'piece-timeout-enabled',
            'enableWildBlocks': 'enable-wild-blocks'
        };
        
        // Add bubbles to individual settings
        Object.entries(settingElementMap).forEach(([settingKey, elementId]) => {
            const element = document.getElementById(elementId);
            if (!element) return;
            
            // Find the bubble for this setting
            const bubble = bubbles.find(b => {
                // Match by setting key or label
                return this.getSettingKeyForBubble(b.label, b.emoji) === settingKey;
            });
            
            if (bubble) {
                this.addBubbleToSetting(element, bubble);
            }
        });
        
        // Handle speed mode separately (it's radio buttons, not checkbox)
        const speedBubble = bubbles.find(b => b.emoji === '🏃');
        if (speedBubble) {
            const speedSection = document.querySelector('#speed-tracking-settings');
            if (speedSection) {
                this.addBubbleToSection(speedSection, speedBubble);
            }
        }
    }
    
    getSettingKeyForBubble(label, emoji) {
        const labelMap = {
            'Hints': 'enableHints',
            'Points': 'showPoints',
            'Timer': 'enableTimer', 
            'Best': 'showPersonalBests',
            'Speed': 'showSpeedTimer',
            'Prizes': 'enablePrizeRecognition',
            'Timeout': 'pieceTimeoutEnabled'
        };
        return labelMap[label];
    }
    
    addBubbleToSetting(element, bubble) {
        // Find the setting item container
        const settingItem = element.closest('.setting-item');
        if (!settingItem) return;
        
        // Create bubble element
        const bubbleElement = document.createElement('div');
        bubbleElement.className = `individual-setting-bubble difficulty-bubble ${bubble.type === 'enabled' ? 'bubble-enabled' : 'bubble-disabled'}`;
        bubbleElement.innerHTML = `${bubble.emoji} ${bubble.label}`;
        bubbleElement.style.marginBottom = '0.5rem';
        bubbleElement.style.alignSelf = 'flex-start';
        
        // Insert at the beginning of the setting item
        settingItem.insertBefore(bubbleElement, settingItem.firstChild);
    }
    
    addBubbleToSection(section, bubble) {
        // Remove existing section bubble
        const existingBubble = section.querySelector('.individual-setting-bubble');
        if (existingBubble) {
            existingBubble.remove();
        }
        
        // Create bubble element
        const bubbleElement = document.createElement('div');
        bubbleElement.className = `individual-setting-bubble difficulty-bubble ${bubble.type === 'enabled' ? 'bubble-enabled' : 'bubble-disabled'}`;
        bubbleElement.innerHTML = `${bubble.emoji} ${bubble.label}`;
        bubbleElement.style.marginBottom = '1rem';
        bubbleElement.style.alignSelf = 'flex-start';
        
        // Insert after the heading
        const heading = section.querySelector('h3');
        if (heading) {
            heading.insertAdjacentElement('afterend', bubbleElement);
        }
    }
    
    resetStatistics() {
        // Clear all statistics and high scores
        this.storage.clearStatistics();
        this.storage.clearHighScores();
        
        // Show success message
        this.showNotification('All statistics and high scores have been permanently deleted');
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
        this.updateDifficultySelection();
        
        // Clean up individual setting bubbles and update state bubbles
        setTimeout(() => {
            this.updateIndividualSettingBubbles(); // Now just cleans up existing bubbles
            this.updateSettingStateBubbles();
        }, 100); // Small delay to ensure difficulty manager is loaded
    }
    
    updateSettingStateBubbles() {
        // Update all setting bubbles to reflect current on/off state
        const bubbles = document.querySelectorAll('.setting-bubble[data-setting]');
        
        // Define which settings are difficulty-specific vs global
        const difficultySpecificKeys = [
            'hints', 'timer', 'personalBest', 'speedTimer', 
            'showPoints', 'sound', 'animations', 
            'petrification', 'deadPixels', 'speedMode', 'magicBlocks', 'autoRotate', 'wildShapes'
        ];
        
        bubbles.forEach(bubble => {
            const settingKey = bubble.dataset.setting;
            let isEnabled = false;
            
            // Special handling for speed mode (radio buttons)
            if (settingKey === 'speedMode') {
                const speedMode = this.settings.speedMode || 'ignored';
                const modeEmojis = {
                    'bonus': '🏃 Bonus',
                    'punishment': '⚡ Punishment',
                    'ignored': '🚶 Ignored'
                };
                bubble.textContent = modeEmojis[speedMode] || '🚶 mode';
                
                // Apply different colors based on mode
                bubble.classList.remove('state-red', 'state-green', 'state-orange');
                if (speedMode === 'ignored') {
                    bubble.classList.add('state-red'); // Off/disabled state
                } else if (speedMode === 'punishment') {
                    bubble.classList.add('state-orange'); // Warning state
                } else {
                    bubble.classList.add('state-green'); // Bonus (positive state)
                }
                
                bubble.classList.add('difficulty-specific');
                bubble.classList.remove('global-setting');
                return;
            }
            
            // Special handling for animation speed (radio buttons)
            if (settingKey === 'animationSpeed') {
                const animSpeed = this.settings.animationSpeed || 'normal';
                const speedEmojis = {
                    'slow': '🐢 Slow',
                    'normal': '🎬 Normal',
                    'fast': '🚀 Fast'
                };
                bubble.textContent = speedEmojis[animSpeed] || '🎬 speed';
                
                // Apply different colors based on speed
                bubble.classList.remove('state-red', 'state-green', 'state-orange');
                if (animSpeed === 'normal') {
                    bubble.classList.add('state-red'); // Off/neutral state
                } else if (animSpeed === 'fast') {
                    bubble.classList.add('state-orange'); // Warning/intense state
                } else {
                    bubble.classList.add('state-green'); // Slow (relaxed state)
                }
                
                bubble.classList.add('global-setting');
                bubble.classList.remove('difficulty-specific');
                return;
            }
            
            // Map bubble data-setting to actual checkbox IDs and determine state
            const checkboxMap = {
                'hints': 'enable-hints',
                'timer': 'enable-timer',
                'personalBest': 'show-personal-bests',
                'speedTimer': 'show-speed-timer',
                'sound': 'sound-enabled',
                'animations': 'animations-enabled',
                'haptic': 'haptic-enabled',
                'autoSave': 'auto-save',
                'showPoints': 'show-points',
                'placementPoints': 'show-placement-points',
                'prizeRecognition': 'enable-prize-recognition',
                'successMode': 'success-mode-enabled',
                'petrification': 'enable-petrification',
                'deadPixels': 'enable-dead-pixels',
                'magicBlocks': 'enable-magic-blocks',
                'autoRotate': 'auto-rotate-blocks',
                'wildShapes': 'enable-wild-shapes',
                'blockHover': 'block-hover-effects',
                'selectionGlow': 'block-selection-glow',
                'blockEntrance': 'block-entrance-animations',
                'blockPlacement': 'block-placement-animations',
                'lineClear': 'line-clear-animations',
                'scoreAnim': 'score-animations',
                'combo': 'combo-animations',
                'particles': 'particle-effects'
            };
            
            const checkboxId = checkboxMap[settingKey];
            if (checkboxId) {
                const checkbox = document.getElementById(checkboxId);
                if (checkbox) {
                    isEnabled = checkbox.checked;
                }
            }
            
            // Update bubble class based on state
            bubble.classList.remove('state-red', 'state-green');
            bubble.classList.add(isEnabled ? 'state-green' : 'state-red');
            
            // Add difficulty-specific or global-setting class
            if (difficultySpecificKeys.includes(settingKey)) {
                bubble.classList.add('difficulty-specific');
                bubble.classList.remove('global-setting');
            } else {
                bubble.classList.add('global-setting');
                bubble.classList.remove('difficulty-specific');
            }
        });
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
    
    
    updateCurrentDifficultyText() {
        const currentDifficultyText = document.getElementById('current-difficulty-text');
        if (currentDifficultyText) {
            // Capitalize the first letter of the difficulty
            const capitalizedDifficulty = this.currentDifficulty.charAt(0).toUpperCase() + this.currentDifficulty.slice(1);
            currentDifficultyText.textContent = `Reset ${capitalizedDifficulty}`;
        }
    }
    
    setupResetListeners() {
        // Reset to defaults for current difficulty
        const resetCurrentDifficultyBtn = document.getElementById('reset-current-difficulty');
        if (resetCurrentDifficultyBtn) {
            resetCurrentDifficultyBtn.addEventListener('click', () => {
                const capitalizedDifficulty = this.currentDifficulty.charAt(0).toUpperCase() + this.currentDifficulty.slice(1);
                this.confirmationDialog.show(
                    `Reset ${capitalizedDifficulty} settings to defaults?`,
                    'This will reset all settings for the current difficulty level to their default values. Your customizations will be lost.',
                    () => {
                        this.difficultySettings.resetToDefaults(this.currentDifficulty);
                        this.loadSettings();
                        this.updateUI();
                        this.showNotification(`Settings reset to defaults for ${capitalizedDifficulty} difficulty`);
                    }
                );
            });
        }
        
        // Reset all difficulties to defaults
        const resetAllDifficultiesBtn = document.getElementById('reset-all-difficulties');
        if (resetAllDifficultiesBtn) {
            resetAllDifficultiesBtn.addEventListener('click', () => {
                this.confirmationDialog.show(
                    'Reset ALL difficulty settings to defaults?',
                    'This will reset all settings for ALL difficulty levels to their default values. All your customizations will be lost.',
                    () => {
                        this.difficultySettings.resetAllToDefaults();
                        this.loadSettings();
                        this.updateUI();
                        this.showNotification('All difficulty settings reset to defaults');
                    }
                );
            });
        }
        
        // Toggle difficulty defaults table
        const toggleDefaultsBtn = document.getElementById('toggle-difficulty-defaults');
        const defaultsTable = document.getElementById('difficulty-defaults-table');
        const toggleText = document.getElementById('toggle-text');
        const toggleArrow = document.getElementById('toggle-arrow');
        
        // Link from Utility Bar section to difficulty defaults
        const viewDefaultsLink = document.getElementById('view-difficulty-defaults-link');
        
        if (toggleDefaultsBtn && defaultsTable && toggleText && toggleArrow) {
            const toggleTable = () => {
                const isVisible = defaultsTable.style.display !== 'none';
                
                if (isVisible) {
                    defaultsTable.style.display = 'none';
                    toggleText.textContent = '📋 Show Defaults by Difficulty';
                    toggleArrow.style.transform = 'rotate(0deg)';
                } else {
                    defaultsTable.style.display = 'block';
                    toggleText.textContent = '📋 Hide Defaults by Difficulty';
                    toggleArrow.style.transform = 'rotate(180deg)';
                    
                    // Populate the table if it's empty
                    this.populateDifficultyDefaultsTable();
                    
                    // Scroll to the table
                    setTimeout(() => {
                        defaultsTable.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                    }, 100);
                }
            };
            
            toggleDefaultsBtn.addEventListener('click', toggleTable);
            
            // Add event listener for the utility bar link
            if (viewDefaultsLink) {
                viewDefaultsLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // If table is hidden, show it
                    if (defaultsTable.style.display === 'none') {
                        toggleTable();
                    } else {
                        // If already visible, just scroll to it
                        defaultsTable.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                    }
                });
            }
        }
    }
    
    populateDifficultyDefaultsTable() {
        const tableBody = document.getElementById('defaults-table-body');
        if (!tableBody) return;
        
        // Clear existing rows
        tableBody.innerHTML = '';
        
        // Define the settings to display
        const settingsToShow = [
            { key: 'enableHints', name: 'Enable Hints', description: 'Show placement suggestions' },
            { key: 'showPoints', name: 'Show Block Points', description: 'Display point values on blocks' },
            { key: 'enableTimer', name: 'Enable Timer', description: 'Add time pressure' },
            { key: 'enablePetrification', name: 'Enable Petrification', description: 'Blocks petrify over time' },
            { key: 'enableDeadPixels', name: 'Enable Dead Pixels', description: 'Add visual interference' },
            { key: 'showPersonalBests', name: 'Show Personal Bests', description: 'Display progress in utility bar' },
            { key: 'showSpeedTimer', name: 'Show Speed Timer', description: 'Track placement speed' },
            { key: 'speedMode', name: 'Speed Tracking Mode', description: 'How speed affects scoring' },
            { key: 'enablePrizeRecognition', name: 'Enable Prize Recognition', description: 'Recognize and celebrate achievements' },
            { key: 'pieceTimeoutEnabled', name: 'Enable Piece Timeout', description: 'Auto-end game when pieces timeout' },
            { key: 'animationsEnabled', name: 'Animations', description: 'Visual effects and transitions' },
            { key: 'soundEnabled', name: 'Sound Effects', description: 'Audio feedback' }
        ];
        
        const difficulties = ['easy', 'normal', 'hard', 'expert'];
        
        settingsToShow.forEach(setting => {
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid var(--border-color)';
            
            // Setting name and description
            const nameCell = document.createElement('td');
            nameCell.style.padding = '0.75rem';
            nameCell.style.border = '1px solid var(--border-color)';
            nameCell.innerHTML = `
                <div style="font-weight: 600; color: var(--text-color);">${setting.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">${setting.description}</div>
            `;
            row.appendChild(nameCell);
            
            // Difficulty columns
            difficulties.forEach(difficulty => {
                const cell = document.createElement('td');
                cell.style.padding = '0.75rem';
                cell.style.border = '1px solid var(--border-color)';
                cell.style.textAlign = 'center';
                
                const defaultValue = this.difficultySettings.difficultyDefaults[difficulty][setting.key];
                
                // Handle different value types
                let displayValue, backgroundColor;
                if (setting.key === 'speedMode') {
                    // Speed mode values
                    const modeColors = {
                        'bonus': 'var(--success-color, #28a745)',
                        'punishment': 'var(--warning-color, #ff6b35)',
                        'ignored': 'var(--muted-color, #6c757d)'
                    };
                    displayValue = defaultValue.toUpperCase();
                    backgroundColor = modeColors[defaultValue] || 'var(--muted-color, #6c757d)';
                } else {
                    // Boolean values
                    const isEnabled = defaultValue === true;
                    displayValue = isEnabled ? 'ON' : 'OFF';
                    backgroundColor = isEnabled ? 'var(--success-color, #28a745)' : 'var(--muted-color, #6c757d)';
                }
                
                cell.innerHTML = `
                    <div style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 4px; font-weight: 600; font-size: 0.8rem; 
                                background: ${backgroundColor}; 
                                color: white;">
                        ${displayValue}
                    </div>
                `;
                row.appendChild(cell);
            });
            
            tableBody.appendChild(row);
        });
    }
    
    setupCrossPageCommunication() {
        // Listen for difficulty changes from other pages
        window.addEventListener('storage', (e) => {
            if (e.key === 'blockdoku-settings' || e.key === 'blockdoku_settings') {
                // Reload settings when difficulty changes
                this.loadSettings();
                this.updateUI();
                this.updateCurrentDifficultyText();
            }
        });
        
        // Listen for focus events (when returning from other pages)
        window.addEventListener('focus', () => {
            this.loadSettings();
            this.updateUI();
            this.updateCurrentDifficultyText();
        });
    }
    
    // Helper method to check if a game is currently in progress
    isGameInProgress() {
        // Check if there's an active game in the main window
        if (window.opener && window.opener.game) {
            const game = window.opener.game;
            return game.score > 0 || game.blockManager?.currentBlocks?.length > 0;
        }
        return false;
    }
    
    // Helper method to reset the current game score
    resetCurrentGameScore() {
        if (window.opener && window.opener.game) {
            const game = window.opener.game;
            
            // First, reload settings in the game so it picks up the new enableTimer value
            if (game.loadSettings) {
                game.loadSettings();
            }
            
            // Reset score and level (keep blocks on board)
            game.score = 0;
            game.level = 1;
            
            // Reset first piece placement flag so timer starts on next placement
            game.firstPiecePlaced = false;
            
            if (game.scoringSystem) {
                game.scoringSystem.reset();
            }
            
            // Reinitialize the timer system with updated settings
            if (game.timerSystem) {
                game.timerSystem.reset();
                game.timerSystem.initialize();
                
                // Don't start the timer immediately - it will start on next piece placement
                if (game.timerSystem.isActive) {
                    console.log('⏱️ Countdown timer will start on next piece placement');
                } else {
                    console.log('⏱️ Countdown timer disabled');
                }
            }
            
            // Update the UI in the main game window
            if (game.updateUI) {
                game.updateUI();
            }
            
            // Update timer display to reflect the countdown timer state
            if (game.updateTimerDisplay) {
                game.updateTimerDisplay();
            }
            
            // Update utility bar layout in case timer visibility changed
            if (game.updateUtilityBarLayout) {
                game.updateUtilityBarLayout();
            }
        }
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

