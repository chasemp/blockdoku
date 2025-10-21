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
        console.log('Settings.js loading settings:', this.settings);
        this.currentTheme = this.settings.theme || 'wood';
        console.log('Settings.js current theme:', this.currentTheme);
        
        // Check if theme has already been applied by client-side script
        const currentDataTheme = document.documentElement.getAttribute('data-theme');
        console.log('Current data-theme attribute:', currentDataTheme);
        if (!currentDataTheme || currentDataTheme !== this.currentTheme) {
            console.log('Applying theme from settings.js:', this.currentTheme);
            // Apply the loaded theme immediately
            this.applyTheme(this.currentTheme);
        } else {
            console.log('Theme already applied, skipping');
        }
        
        // Fix section placement (ensure About and Sound sections are outside game-section)
        this.fixSectionPlacement();
        
        // Load effects settings
        this.loadEffectsSettings();
        
    }
    
    loadEffectsSettings() {
        // Sound effects
        const soundEnabled = document.getElementById('sound-enabled');
        if (soundEnabled) {
            soundEnabled.checked = this.settings.soundEnabled === true; // Default to false
        }
        
        // Sound effects in sounds section
        const soundEnabledSounds = document.getElementById('sound-enabled-sounds-section');
        if (soundEnabledSounds) {
            soundEnabledSounds.checked = this.settings.soundEnabled === true; // Default to false
        }
        
        // Animations
        const animationsEnabled = document.getElementById('animations-enabled');
        if (animationsEnabled) {
            animationsEnabled.checked = this.settings.animationsEnabled !== false; // Default to true
        }
        
        // Enhanced animation settings
        const blockHoverEffects = document.getElementById('block-hover-effects');
        if (blockHoverEffects) {
            blockHoverEffects.checked = this.settings.blockHoverEffects !== false;
        }
        
        const blockSelectionGlow = document.getElementById('block-selection-glow');
        if (blockSelectionGlow) {
            blockSelectionGlow.checked = this.settings.blockSelectionGlow !== false;
        }
        
        const blockEntranceAnimations = document.getElementById('block-entrance-animations');
        if (blockEntranceAnimations) {
            blockEntranceAnimations.checked = this.settings.blockEntranceAnimations !== false;
        }
        
        const particleEffects = document.getElementById('particle-effects');
        if (particleEffects) {
            particleEffects.checked = this.settings.particleEffects !== false;
        }
        
        const patternDetection = document.getElementById('pattern-detection');
        if (patternDetection) {
            patternDetection.checked = this.settings.enablePatternDetection === true;
        }
        
        const blockPlacementAnimations = document.getElementById('block-placement-animations');
        if (blockPlacementAnimations) {
            blockPlacementAnimations.checked = this.settings.blockPlacementAnimations === true;
        }
        
        const lineClearAnimations = document.getElementById('line-clear-animations');
        if (lineClearAnimations) {
            lineClearAnimations.checked = this.settings.lineClearAnimations !== false;
        }
        
        const scoreAnimations = document.getElementById('score-animations');
        if (scoreAnimations) {
            scoreAnimations.checked = this.settings.scoreAnimations !== false;
        }
        
        const comboAnimations = document.getElementById('combo-animations');
        if (comboAnimations) {
            comboAnimations.checked = this.settings.comboAnimations !== false;
        }
        
        // Animation speed radio buttons
        const animationSpeedSlow = document.getElementById('animation-speed-slow');
        const animationSpeedNormal = document.getElementById('animation-speed-normal');
        const animationSpeedFast = document.getElementById('animation-speed-fast');
        const currentSpeed = this.settings.animationSpeed || 'normal';
        if (animationSpeedSlow) animationSpeedSlow.checked = currentSpeed === 'slow';
        if (animationSpeedNormal) animationSpeedNormal.checked = currentSpeed === 'normal';
        if (animationSpeedFast) animationSpeedFast.checked = currentSpeed === 'fast';
        
        // Haptic feedback (already handled below, don't duplicate)
        
        // Game settings
        const enableHints = document.getElementById('enable-hints');
        if (enableHints) {
            enableHints.checked = this.settings.enableHints === true; // Default to false
        }
        
        const enableTimer = document.getElementById('enable-timer');
        if (enableTimer) {
            enableTimer.checked = this.settings.enableTimer === true; // Default to false
        }
        
        const enablePetrification = document.getElementById('enable-petrification');
        if (enablePetrification) {
            enablePetrification.checked = this.settings.enablePetrification === true; // Default to false
        }
        
        // Dead pixels
        const enableDeadPixels = document.getElementById('enable-dead-pixels');
        if (enableDeadPixels) {
            enableDeadPixels.checked = this.settings.enableDeadPixels === true; // Default to false
        }
        
        const deadPixelsIntensity = document.getElementById('dead-pixels-intensity');
        const deadPixelsIntensityValue = document.getElementById('dead-pixels-intensity-value');
        const deadPixelsIntensityContainer = document.getElementById('dead-pixels-intensity-container');
        
        if (deadPixelsIntensity && deadPixelsIntensityValue) {
            const intensity = this.settings.deadPixelsIntensity || 0;
            deadPixelsIntensity.value = intensity;
            deadPixelsIntensityValue.textContent = intensity;
            
            // Show/hide intensity slider based on toggle
            if (deadPixelsIntensityContainer) {
                deadPixelsIntensityContainer.style.display = 
                    this.settings.enableDeadPixels === true ? 'block' : 'none';
            }
        }
        
        const autoSave = document.getElementById('auto-save');
        if (autoSave) {
            autoSave.checked = this.settings.autoSave !== false; // Default to true
        }
        
        const showPoints = document.getElementById('show-points');
        if (showPoints) {
            showPoints.checked = this.settings.showPoints === true; // Default to false
        }

        const showPlacementPoints = document.getElementById('show-placement-points');
        if (showPlacementPoints) {
            showPlacementPoints.checked = this.settings.showPlacementPoints === true; // Default to false
        }

        
        // Speed mode - handle cycling button
        this.speedModeOrder = ['ignored', 'bonus', 'punishment'];
        this.currentSpeedModeIndex = 0;
        
        const speedModeToggle = document.getElementById('speed-mode-toggle');
        if (speedModeToggle) {
            const mode = this.settings.speedMode || 'ignored'; // Default to 'ignored'
            this.currentSpeedModeIndex = this.speedModeOrder.indexOf(mode);
            if (this.currentSpeedModeIndex === -1) {
                this.currentSpeedModeIndex = 0; // Fallback to ignored
            }
            this.updateSpeedModeDisplay();
        }
        

        // Success mode
        const successModeEnabled = document.getElementById('success-mode-enabled');
        if (successModeEnabled) {
            successModeEnabled.checked = this.settings.successModeEnabled !== false; // Default to true
        }

        const showSpeedTimer = document.getElementById('show-speed-timer');
        if (showSpeedTimer) {
            showSpeedTimer.checked = this.settings.showSpeedTimer === true; // Default to false
        }

        // Prize recognition
        const enablePrizeRecognition = document.getElementById('enable-prize-recognition');
        if (enablePrizeRecognition) {
            enablePrizeRecognition.checked = this.settings.enablePrizeRecognition !== false; // Default to true
        }

        // Combo display mode - handle radio buttons
        const comboStreak = document.getElementById('combo-streak');
        const comboCumulative = document.getElementById('combo-cumulative');
        if (comboStreak && comboCumulative) {
            const mode = this.settings.comboDisplayMode || 'cumulative';
            if (mode === 'cumulative') {
                comboCumulative.checked = true;
            } else {
                comboStreak.checked = true;
            }
        }
        
        // Show/hide enhanced animation settings based on master setting
        this.updateAnimationSettingsVisibility();
    }
    
    updateAnimationSettingsVisibility() {
        const animationsEnabled = document.getElementById('animations-enabled');
        const animationSettings = document.getElementById('animation-settings');
        
        if (animationsEnabled && animationSettings) {
            if (animationsEnabled.checked) {
                animationSettings.style.display = 'block';
                animationSettings.style.opacity = '1';
            } else {
                animationSettings.style.display = 'none';
                animationSettings.style.opacity = '0.5';
            }
        }
    }
    
    setupEventListeners() {
        // Navigation with press duration requirement (only for internal navigation)
        document.querySelectorAll('.nav-item[data-section]').forEach(item => {
            let pressStartTime = null;
            let pressTimeout = null;
            let isPressed = false;
            
            const handleNavActivation = (e) => {
                e.preventDefault();
                this.showSection(item.dataset.section);
            };
            
            const resetPressState = () => {
                // Clear timeout
                if (pressTimeout) {
                    clearTimeout(pressTimeout);
                    pressTimeout = null;
                }
                
                // Reset state
                isPressed = false;
                pressStartTime = null;
                
                // Remove visual feedback
                item.classList.remove('pressing');
            };
            
            const startPress = (e) => {
                e.preventDefault();
                if (isPressed) return; // Already pressing
                
                isPressed = true;
                pressStartTime = Date.now();
                
                // Add visual feedback
                item.classList.add('pressing');
                
                // Set timeout for 0.75 seconds
                pressTimeout = setTimeout(() => {
                    if (isPressed) {
                        handleNavActivation(e);
                        resetPressState();
                    }
                }, 10);
            };
            
            const cancelPress = (e) => {
                if (!isPressed) return;
                
                e.preventDefault();
                resetPressState();
            };
            
            // Mouse events
            item.addEventListener('mousedown', startPress);
            item.addEventListener('mouseup', cancelPress);
            item.addEventListener('mouseleave', cancelPress);
            
            // Touch events
            item.addEventListener('touchstart', startPress, { passive: false });
            item.addEventListener('touchend', cancelPress, { passive: false });
            item.addEventListener('touchcancel', cancelPress, { passive: false });
            
            // Fallback click handler for accessibility
            item.addEventListener('click', (e) => {
                e.preventDefault();
                // Only allow click if it's a quick press (accessibility)
                if (!isPressed && (!pressStartTime || (Date.now() - pressStartTime) < 200)) {
                    handleNavActivation(e);
                }
            });
        });
        
        // Theme selection with press duration requirement
        document.querySelectorAll('.theme-option').forEach(option => {
            let pressStartTime = null;
            let pressTimeout = null;
            let isPressed = false;
            let themeValue = null; // Store theme value to avoid null currentTarget issues
            
            const handleThemeActivation = (theme) => {
                this.selectTheme(theme);
            };
            
            const resetPressState = () => {
                // Clear timeout
                if (pressTimeout) {
                    clearTimeout(pressTimeout);
                    pressTimeout = null;
                }
                
                // Reset state
                isPressed = false;
                pressStartTime = null;
                
                // Remove visual feedback
                option.classList.remove('pressing');
            };
            
            const startPress = (e) => {
                e.preventDefault();
                if (isPressed) return;
                
                isPressed = true;
                pressStartTime = Date.now();
                themeValue = e.currentTarget.dataset.theme; // Store theme value
                option.classList.add('pressing');
                
                pressTimeout = setTimeout(() => {
                    if (isPressed && themeValue) {
                        handleThemeActivation(themeValue);
                        resetPressState();
                    }
                }, 10);
            };
            
            const cancelPress = (e) => {
                if (!isPressed) return;
                e.preventDefault();
                resetPressState();
            };
            
            option.addEventListener('mousedown', startPress);
            option.addEventListener('mouseup', cancelPress);
            option.addEventListener('mouseleave', cancelPress);
            option.addEventListener('touchstart', startPress, { passive: false });
            option.addEventListener('touchend', cancelPress, { passive: false });
            option.addEventListener('touchcancel', cancelPress, { passive: false });
            
            option.addEventListener('click', (e) => {
                e.preventDefault();
                if (!isPressed && (!pressStartTime || (Date.now() - pressStartTime) < 200)) {
                    handleThemeActivation(e.currentTarget.dataset.theme);
                }
            });
        });
        
        
        // Game settings (only if elements exist)
        const enableHints = document.getElementById('enable-hints');
        if (enableHints) {
            enableHints.addEventListener('change', (e) => {
                this.updateSetting('enableHints', e.target.checked);
            });
        }
        
        const enableTimer = document.getElementById('enable-timer');
        if (enableTimer) {
            enableTimer.addEventListener('change', (e) => {
                this.updateSetting('enableTimer', e.target.checked);
            });
        }
        
        const enablePetrification = document.getElementById('enable-petrification');
        if (enablePetrification) {
            enablePetrification.addEventListener('change', (e) => {
                this.updateSetting('enablePetrification', e.target.checked);
            });
        }
        
        // Dead pixels toggle
        const enableDeadPixels = document.getElementById('enable-dead-pixels');
        if (enableDeadPixels) {
            enableDeadPixels.addEventListener('change', (e) => {
                this.updateSetting('enableDeadPixels', e.target.checked);
                
                // Show/hide intensity slider
                const container = document.getElementById('dead-pixels-intensity-container');
                if (container) {
                    container.style.display = e.target.checked ? 'block' : 'none';
                }
            });
        }
        
        // Dead pixels intensity slider
        const deadPixelsIntensity = document.getElementById('dead-pixels-intensity');
        const deadPixelsIntensityValue = document.getElementById('dead-pixels-intensity-value');
        if (deadPixelsIntensity && deadPixelsIntensityValue) {
            deadPixelsIntensity.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                deadPixelsIntensityValue.textContent = value;
                this.updateSetting('deadPixelsIntensity', value);
            });
        }
        
        const soundEnabled = document.getElementById('sound-enabled');
        if (soundEnabled) {
            soundEnabled.addEventListener('change', (e) => {
                this.updateSetting('soundEnabled', e.target.checked);
                // Also update the sound toggle in sounds section to keep them in sync
                const soundsSectionToggle = document.getElementById('sound-enabled-sounds-section');
                if (soundsSectionToggle) {
                    soundsSectionToggle.checked = e.target.checked;
                }
            });
        }
        
        // Sound toggle in sounds section
        const soundEnabledSounds = document.getElementById('sound-enabled-sounds-section');
        if (soundEnabledSounds) {
            soundEnabledSounds.addEventListener('change', (e) => {
                this.updateSetting('soundEnabled', e.target.checked);
                // Also update the other sound toggle to keep them in sync
                const otherSoundToggle = document.getElementById('sound-enabled');
                if (otherSoundToggle) {
                    otherSoundToggle.checked = e.target.checked;
                }
            });
        }
        
        const animationsEnabled = document.getElementById('animations-enabled');
        if (animationsEnabled) {
            animationsEnabled.addEventListener('change', (e) => {
                this.updateSetting('animationsEnabled', e.target.checked);
                this.updateAnimationSettingsVisibility();
            });
        }
        
        // Enhanced animation settings
        const blockHoverEffects = document.getElementById('block-hover-effects');
        if (blockHoverEffects) {
            blockHoverEffects.addEventListener('change', (e) => {
                this.updateSetting('blockHoverEffects', e.target.checked);
            });
        }
        
        const blockSelectionGlow = document.getElementById('block-selection-glow');
        if (blockSelectionGlow) {
            blockSelectionGlow.addEventListener('change', (e) => {
                this.updateSetting('blockSelectionGlow', e.target.checked);
            });
        }
        
        const blockEntranceAnimations = document.getElementById('block-entrance-animations');
        if (blockEntranceAnimations) {
            blockEntranceAnimations.addEventListener('change', (e) => {
                this.updateSetting('blockEntranceAnimations', e.target.checked);
            });
        }
        
        const particleEffects = document.getElementById('particle-effects');
        if (particleEffects) {
            particleEffects.addEventListener('change', (e) => {
                this.updateSetting('particleEffects', e.target.checked);
            });
        }
        
        const patternDetection = document.getElementById('pattern-detection');
        if (patternDetection) {
            patternDetection.addEventListener('change', (e) => {
                this.updateSetting('enablePatternDetection', e.target.checked);
            });
        }
        
        const blockPlacementAnimations = document.getElementById('block-placement-animations');
        if (blockPlacementAnimations) {
            blockPlacementAnimations.addEventListener('change', (e) => {
                this.updateSetting('blockPlacementAnimations', e.target.checked);
            });
        }
        
        const lineClearAnimations = document.getElementById('line-clear-animations');
        if (lineClearAnimations) {
            lineClearAnimations.addEventListener('change', (e) => {
                this.updateSetting('lineClearAnimations', e.target.checked);
            });
        }
        
        const scoreAnimations = document.getElementById('score-animations');
        if (scoreAnimations) {
            scoreAnimations.addEventListener('change', (e) => {
                this.updateSetting('scoreAnimations', e.target.checked);
            });
        }
        
        const comboAnimations = document.getElementById('combo-animations');
        if (comboAnimations) {
            comboAnimations.addEventListener('change', (e) => {
                this.updateSetting('comboAnimations', e.target.checked);
            });
        }
        
        // Animation speed radio buttons
        const animationSpeedInputs = document.querySelectorAll('input[name="animation-speed"]');
        animationSpeedInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.updateSetting('animationSpeed', e.target.value);
                }
            });
        });
        
        const animationSpeed = document.getElementById('animation-speed');
        if (animationSpeed) {
            animationSpeed.addEventListener('change', (e) => {
                this.updateSetting('animationSpeed', e.target.value);
            });
        }
        
        const hapticEnabled = document.getElementById('haptic-enabled');
        if (hapticEnabled) {
            hapticEnabled.addEventListener('change', (e) => {
                this.updateSetting('hapticEnabled', e.target.checked);
            });
        }
        
        const autoSave = document.getElementById('auto-save');
        if (autoSave) {
            autoSave.addEventListener('change', (e) => {
                this.updateSetting('autoSave', e.target.checked);
            });
        }
        
        const showPoints = document.getElementById('show-points');
        if (showPoints) {
            showPoints.addEventListener('change', (e) => {
                this.updateSetting('showPoints', e.target.checked);
                this.updateBlockPointsDisplay();
            });
        }

        const showPlacementPoints = document.getElementById('show-placement-points');
        if (showPlacementPoints) {
            showPlacementPoints.addEventListener('change', (e) => {
                this.updateSetting('showPlacementPoints', e.target.checked);
            });
        }

        
        // Speed mode cycling button
        const speedModeToggle = document.getElementById('speed-mode-toggle');
        if (speedModeToggle) {
            speedModeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.cycleSpeedMode();
            });
        }
        

        // Success mode toggle
        const successModeEnabled = document.getElementById('success-mode-enabled');
        if (successModeEnabled) {
            successModeEnabled.addEventListener('change', (e) => {
                this.updateSetting('successModeEnabled', e.target.checked);
            });
        }

        const showSpeedTimer = document.getElementById('show-speed-timer');
        if (showSpeedTimer) {
            showSpeedTimer.addEventListener('change', (e) => {
                this.updateSetting('showSpeedTimer', e.target.checked);
            });
        }

        // Prize recognition toggle
        const enablePrizeRecognition = document.getElementById('enable-prize-recognition');
        if (enablePrizeRecognition) {
            enablePrizeRecognition.addEventListener('change', (e) => {
                this.updateSetting('enablePrizeRecognition', e.target.checked);
            });
        }

        // Combo display mode - handle radio buttons
        const comboStreak = document.getElementById('combo-streak');
        const comboCumulative = document.getElementById('combo-cumulative');
        if (comboStreak && comboCumulative) {
            comboStreak.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.updateSetting('comboDisplayMode', 'streak');
                }
            });
            comboCumulative.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.updateSetting('comboDisplayMode', 'cumulative');
                }
            });
        }
        
        // Effects settings (haptic handled above)
        
        // Share button
        const shareButton = document.getElementById('share-button');
        if (shareButton) {
            shareButton.addEventListener('click', () => {
                this.shareGame();
            });
        }

        // Share scores button
        const shareScoresButton = document.getElementById('share-scores-button');
        if (shareScoresButton) {
            shareScoresButton.addEventListener('click', () => {
                this.shareHighScores();
            });
        }

        // View last game button
        const viewLastGameBtn = document.getElementById('view-last-game-btn');
        if (viewLastGameBtn) {
            viewLastGameBtn.addEventListener('click', () => {
                this.viewLastGame();
            });
        }

        // Reset statistics button
        const resetStatsBtn = document.getElementById('reset-stats');
        if (resetStatsBtn) {
            resetStatsBtn.addEventListener('click', async () => {
                const confirmed = await this.confirmationDialog.show(
                    '⚠️ PERMANENT DATA LOSS WARNING ⚠️\n\nThis will permanently delete ALL your game data:\n• All high scores for all difficulty levels\n• All game statistics (games played, totals, combos)\n• All personal best records\n• All play time data\n\nYour game settings and preferences will NOT be affected.\n\nThis action CANNOT be undone. Are you absolutely sure you want to continue?'
                );
                if (!confirmed) return;
                
                // Clear all statistics and high scores
                this.storage.clearStatistics();
                this.storage.clearHighScores();
                
                // Refresh stats section if visible
                try {
                    this.loadHighScores();
                } catch {}
                
                this.showNotification('All statistics and high scores have been permanently deleted');
            });
        }
        
        // Check for Upgrade button
        const checkUpgradeBtn = document.getElementById('check-upgrade-button');
        if (checkUpgradeBtn) {
            checkUpgradeBtn.addEventListener('click', async () => {
                try {
                    this.showNotification('Checking for updates...');
                    
                    // Check if service worker is supported
                    if ('serviceWorker' in navigator) {
                        // Get the current service worker registration
                        const registration = await navigator.serviceWorker.getRegistration();
                        
                        if (registration) {
                            // Check for updates
                            await registration.update();
                            
                            // Check if there's a waiting service worker
                            if (registration.waiting) {
                                // There's an update available
                                this.showNotification('Update available! Installing...');
                                
                                // Tell the waiting service worker to skip waiting and activate
                                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                                
                                // Listen for the controlling service worker to change
                                navigator.serviceWorker.addEventListener('controllerchange', () => {
                                    this.showNotification('Update installed! Reloading...');
                                    setTimeout(() => {
                                        window.location.reload(true);
                                    }, 1000);
                                });
                                
                                // Fallback: reload after 3 seconds if controllerchange doesn't fire
                                setTimeout(() => {
                                    this.showNotification('Update installed! Reloading...');
                                    window.location.reload(true);
                                }, 3000);
                                
                            } else {
                                // No update available
                                this.showNotification('App is up to date!');
                            }
                        } else {
                            this.showNotification('No service worker found. App may not be installed.');
                        }
                    } else {
                        this.showNotification('Service workers not supported in this browser.');
                    }
                    
                } catch (error) {
                    console.error('Error checking for updates:', error);
                    this.showNotification('Error checking for updates. Check console for details.');
                }
            });
        }
        
        // Clear Cache & Reset Service Worker button
        const clearCacheBtn = document.getElementById('clear-cache-button');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', async () => {
                const confirmed = await this.confirmationDialog.show(
                    'Reset Factory Defaults\n\nThis will:\n• Clear ALL game data (saved games, high scores, settings, statistics)\n• Unregister all service workers\n• Clear all service worker caches\n• Force a fresh reload of all files\n\n⚠️ ALL GAME DATA WILL BE PERMANENTLY DELETED!\n\nThis action cannot be undone. Continue?'
                );
                if (!confirmed) return;
                
                try {
                    // Unregister all service workers
                    if ('serviceWorker' in navigator) {
                        const registrations = await navigator.serviceWorker.getRegistrations();
                        for (const registration of registrations) {
                            await registration.unregister();
                            console.log('Service worker unregistered:', registration);
                        }
                    }
                    
                    // Clear all caches
                    if ('caches' in window) {
                        const cacheNames = await caches.keys();
                        for (const cacheName of cacheNames) {
                            await caches.delete(cacheName);
                            console.log('Cache deleted:', cacheName);
                        }
                    }
                    
                    // Clear all game data
                    this.storage.clearAllData();
                    console.log('All game data cleared from localStorage');
                    
                    this.showNotification('Factory defaults restored! Reloading page...');
                    
                    // Reload the page after a short delay
                    setTimeout(() => {
                        window.location.reload(true);
                    }, 1500);
                    
                } catch (error) {
                    console.error('Error clearing cache:', error);
                    this.showNotification('Error clearing cache. Check console for details.');
                }
            });
        }
    }
    
    
    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const navItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }
        
        // Update content
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.remove('active');
        });
        const sectionElement = document.getElementById(`${sectionName}-section`);
        if (sectionElement) {
            sectionElement.classList.add('active');
        }
        
        // Load section-specific data
        if (sectionName === 'scores') {
            this.loadHighScores();
        } else if (sectionName === 'sounds') {
            this.loadSoundCustomization();
        }
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
        
        // Enable sound for previews
        this.soundManager.setEnabled(true);
        
        const soundEffects = this.soundManager.getSoundEffects();
        const presets = this.soundManager.getAvailablePresets();
        const currentMappings = this.soundManager.customSoundMappings || {};
        
        let html = '';
        
        // Create UI for each sound effect
        for (const [soundKey, soundInfo] of Object.entries(soundEffects)) {
            const currentPreset = currentMappings[soundKey] || 'default';
            
            const isMuted = currentPreset === 'none';
            html += `
                <div class="sound-effect-item">
                    <div class="sound-effect-info">
                        <h4>${soundInfo.name}</h4>
                        <p>${soundInfo.description}</p>
                    </div>
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
        
        // Add event listeners for individual sound effects (reuse existing logic)
        this.setupIndividualSoundEventListeners(container);
    }
    
    setupIndividualSoundEventListeners(container) {
        // Add event listeners for preset changes
        container.querySelectorAll('.sound-preset-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const soundKey = e.target.dataset.sound;
                const presetId = e.target.value;
                this.soundManager.setCustomSound(soundKey, presetId);
                
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
        
        // Add event listeners for preview buttons
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
                    this.soundManager.play(soundKey);
                }
            });
        });
        
        // Add event listeners for mute buttons
        container.querySelectorAll('.sound-mute-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const soundKey = e.currentTarget.dataset.sound;
                const select = e.currentTarget.parentElement.querySelector('.sound-preset-select');
                const currentPreset = select.value;
                
                if (currentPreset === 'none') {
                    // Unmute: set to default
                    select.value = 'default';
                    this.soundManager.setCustomSound(soundKey, 'default');
                    btn.classList.remove('muted');
                    btn.textContent = '🔊';
                    btn.title = 'Mute';
                } else {
                    // Mute: set to none
                    select.value = 'none';
                    this.soundManager.setCustomSound(soundKey, 'none');
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
        
        // Add event listener for back to grouped button
        const backBtn = document.getElementById('show-advanced-sounds');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.toggleAdvancedSoundSettings();
            });
        }
    }
    
    selectTheme(theme) {
        this.currentTheme = theme;
        this.applyTheme(theme);
        this.updateThemeUI();
        this.saveSettings();
    }
    
    applyTheme(theme) {
        let themeLink = document.getElementById('theme-css');
        if (!themeLink) {
            // Create a resilient theme link if missing (e.g., after build transforms)
            themeLink = document.createElement('link');
            themeLink.rel = 'stylesheet';
            themeLink.id = 'theme-css';
            document.head.appendChild(themeLink);
        }
        themeLink.href = `css/themes/${theme}.css`;

		// If Vite injected a wood stylesheet into built HTML, disable it when switching away
		try {
			const builtWoodLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
				.filter(l => (l.getAttribute('href') || '').includes('/assets/wood-') || (l.href || '').includes('/assets/wood-'));
			builtWoodLinks.forEach(l => {
				l.disabled = theme !== 'wood';
			});
		} catch (e) {
			// no-op
		}
        // Warm up other theme links (helps after build)
        const light = document.getElementById('theme-css-light');
        const dark = document.getElementById('theme-css-dark');
        if (light) light.media = 'all';
        if (dark) dark.media = 'all';
        
        // Set data-theme attribute for CSS selectors
        document.documentElement.setAttribute('data-theme', theme);
        
        // Also add class to body as fallback
        document.body.className = document.body.className.replace(/light-theme|dark-theme|wood-theme/g, '');
        document.body.classList.add(`${theme}-theme`);
    }
    
    
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }
    
    updateUI() {
        this.updateThemeUI();
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
    
    
    updateGameSettingsUI() {
        const enableHints = document.getElementById('enable-hints');
        if (enableHints) {
            enableHints.checked = this.settings.enableHints || false;
        }
        
        const enableTimer = document.getElementById('enable-timer');
        if (enableTimer) {
            enableTimer.checked = this.settings.enableTimer || false;
        }
        
        const autoSave = document.getElementById('auto-save');
        if (autoSave) {
            autoSave.checked = this.settings.autoSave !== false;
        }
        
        const showPoints = document.getElementById('show-points');
        if (showPoints) {
            showPoints.checked = this.settings.showPoints || false;
        }
        
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
    
    cycleSpeedMode() {
        // Cycle to next mode
        this.currentSpeedModeIndex = (this.currentSpeedModeIndex + 1) % this.speedModeOrder.length;
        const newMode = this.speedModeOrder[this.currentSpeedModeIndex];
        
        // Update setting
        this.updateSetting('speedMode', newMode);
        
        // Update display
        this.updateSpeedModeDisplay();
    }
    
    updateSpeedModeDisplay() {
        const speedModeToggle = document.getElementById('speed-mode-toggle');
        const speedModeTitle = document.getElementById('speed-mode-title');
        const speedModeDescription = document.getElementById('speed-mode-description');
        
        if (!speedModeToggle || !speedModeTitle || !speedModeDescription) return;
        
        const mode = this.speedModeOrder[this.currentSpeedModeIndex];
        
        const modeData = {
            bonus: {
                title: 'Bonus',
                description: 'Faster = more points'
            },
            punishment: {
                title: 'Punishment',
                description: 'Faster = less points (scales with level)'
            },
            ignored: {
                title: 'Ignored',
                description: 'Speed doesn\'t affect score'
            }
        };
        
        const data = modeData[mode];
        speedModeTitle.textContent = data.title;
        speedModeDescription.textContent = data.description;
    }
    
    updateBuildInfo() {
        // NOTE: This UI depends on build-info.json being generated during build.
        // Ensure the generate-build-info script runs (npm prebuild/postbuild).
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
        
        if (!scoresList || !statsDisplay) {
            console.error('High scores elements not found');
            return;
        }
        
        const highScores = this.storage.getHighScores();
        const stats = this.storage.loadStatistics();
        
        console.log('Loading statistics:', stats); // Debug log
        
        // Display high scores
        if (highScores.length === 0) {
            scoresList.innerHTML = '<p>No high scores yet. Play a game to set your first record!</p>';
        } else {
            scoresList.innerHTML = highScores.map((score, index) => `
                <div class="score-item clickable-score" data-score-index="${index}">
                    <div class="rank">#${index + 1}</div>
                    <div class="score-value">${score.score.toLocaleString()}</div>
                    <div class="score-details">${(score.difficulty||'normal').toUpperCase()} • Level ${score.level} • ${new Date(score.date).toLocaleDateString()}</div>
                    <div class="score-click-hint">Click to view details</div>
                </div>
            `).join('');
            
            // Add click event listeners to high scores
            this.setupHighScoreClickListeners();
        }
        
        // Display statistics
        statsDisplay.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Games Played:</span>
                <span class="stat-value">${stats.gamesPlayed || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Score:</span>
                <span class="stat-value">${stats.totalScore || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Best Score:</span>
                <span class="stat-value">${stats.bestScore || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Lines:</span>
                <span class="stat-value">${stats.totalLinesCleared || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Max Streak:</span>
                <span class="stat-value">${stats.maxCombo || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Combos:</span>
                <span class="stat-value">${stats.totalCombos || 0}</span>
            </div>
        `;
    }
    
    // Add method to refresh statistics display
    refreshStatistics() {
        console.log('Refreshing statistics display...');
        this.loadHighScores();
    }
    
    saveSettings() {
        const settings = {
            ...this.settings,
            theme: this.currentTheme
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

    shareHighScores() {
        const highScores = this.storage.getHighScores();
        const stats = this.storage.loadStatistics();
        
        if (highScores.length === 0) {
            this.showNotification('No high scores to share yet!');
            return;
        }

        // Format high scores for sharing
        let scoresText = '🏆 Blockdoku High Scores\n\n';
        
        highScores.slice(0, 5).forEach((score, index) => {
            const difficulty = (score.difficulty || 'normal').toUpperCase();
            const date = new Date(score.date).toLocaleDateString();
            scoresText += `#${index + 1} ${score.score.toLocaleString()} (${difficulty}) - Level ${score.level} - ${date}\n`;
        });
        
        // Add statistics
        scoresText += `\n📊 Statistics:\n`;
        scoresText += `Games Played: ${stats.gamesPlayed}\n`;
        scoresText += `Total Score: ${stats.totalScore.toLocaleString()}\n`;
        scoresText += `Best Score: ${stats.bestScore.toLocaleString()}\n`;
        scoresText += `Max Combo: ${stats.maxCombo}\n`;
        
        const url = 'https://blockdoku.523.life';
        const title = 'My Blockdoku High Scores';
        
        if (navigator.share) {
            // Use native Web Share API if available
            navigator.share({
                title: title,
                text: scoresText,
                url: url
            }).catch(err => {
                console.log('Error sharing scores:', err);
                this.fallbackShareScores(scoresText, url, title);
            });
        } else {
            // Fallback to clipboard and notification
            this.fallbackShareScores(scoresText, url, title);
        }
    }

    fallbackShareScores(scoresText, url, title) {
        // Copy to clipboard
        navigator.clipboard.writeText(`${scoresText}\n\nPlay Blockdoku: ${url}`).then(() => {
            // Show a temporary notification
            this.showNotification('High scores copied to clipboard!');
        }).catch(() => {
            // If clipboard fails, show scores in alert
            alert(`${scoresText}\n\nPlay Blockdoku: ${url}`);
        });
    }
    
    showNotification(message) {
        // Remove any existing notification
        const existingNotification = document.querySelector('.settings-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'settings-notification';
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
        
        // Add animation keyframes (only if not already added)
        if (!document.querySelector('#settings-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'settings-notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
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
    
    fixSectionPlacement() {
        // Ensure About and Sound Effects sections are outside the game-section
        const aboutSection = document.getElementById('about-section');
        const soundSection = document.getElementById('sounds-section');
        const gameSection = document.getElementById('game-section');
        
        if (aboutSection && gameSection && aboutSection.parentElement === gameSection) {
            // Move About section outside game-section
            aboutSection.remove();
            gameSection.insertAdjacentElement('afterend', aboutSection);
        }
        
        if (soundSection && gameSection && soundSection.parentElement === gameSection) {
            // Move Sound Effects section outside game-section
            soundSection.remove();
            gameSection.insertAdjacentElement('afterend', soundSection);
        }
    }
    
    setupHighScoreClickListeners() {
        const clickableScores = document.querySelectorAll('.clickable-score');
        clickableScores.forEach(scoreElement => {
            scoreElement.addEventListener('click', (e) => {
                const scoreIndex = parseInt(scoreElement.dataset.scoreIndex);
                this.showHighScoreDetails(scoreIndex);
            });
        });
    }
    
    showHighScoreDetails(scoreIndex) {
        const highScores = this.storage.getHighScores();
        if (scoreIndex < 0 || scoreIndex >= highScores.length) {
            console.error('Invalid score index:', scoreIndex);
            return;
        }
        
        const scoreData = highScores[scoreIndex];
        
        // Save the score data to localStorage for the lastgame page
        try {
            localStorage.setItem('blockdoku_lastgame', JSON.stringify(scoreData));
            
            // Navigate to lastgame.html to show the detailed stats
            window.location.href = 'lastgame.html';
        } catch (error) {
            console.error('Failed to save score data for display:', error);
            alert('Failed to load score details. Please try again.');
        }
    }
}

// Initialize settings when page loads
// For ES modules, we can instantiate immediately since the script loads after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.settingsManager = new SettingsManager();
    });
} else {
    // DOM is already ready, instantiate immediately
    window.settingsManager = new SettingsManager();
}
