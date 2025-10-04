/**
 * Blockdoku PWA - Main Application
 * MVT Milestone 2: Basic Block Placement System
 * 
 * IMPORTANT: Settings is implemented as a separate PAGE (settings.html), not a modal!
 * - Settings button navigates to /settings.html
 * - Settings page contains: theme selection, difficulty, high scores, game settings, PWA install
 * - Do not try to create a settings modal - it's a dedicated page for better mobile UX
 */

// Re-enable imports incrementally
import { BlockManager } from './game/blocks.js';
import { BlockPalette } from './ui/block-palette.js';
import { ScoringSystem } from './game/scoring.js';
import { GameStorage } from './storage/game-storage.js';
// import { EffectsSystem } from './ui/effects.js';
import { PWAInstallManager } from './pwa/install.js';
import { OfflineManager } from './pwa/offline.js';
import { DifficultyManager } from './difficulty/difficulty-manager.js';
import { DifficultySettingsManager } from './difficulty/difficulty-settings-manager.js';
import { HintSystem } from './difficulty/hint-system.js';
import { TimerSystem } from './difficulty/timer-system.js';
import { DifficultySelector } from './ui/difficulty-selector.js';
import { EffectsManager } from './effects/effects-manager.js';
import { ConfirmationDialog } from './ui/confirmation-dialog.js';
import { PetrificationManager } from './game/petrification-manager.js';
import { DeadPixelsManager } from './game/dead-pixels-manager.js';


class BlockdokuGame {
    constructor() {
        console.log('BlockdokuGame constructor called');
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.boardSize = 9;
        this.cellSize = 0; // Will be calculated when canvas is ready
        console.log('About to initialize board...');
        try {
            this.board = this.initializeBoard();
            console.log('Board initialized in constructor:', this.board ? 'SUCCESS' : 'FAILED', 'Length:', this.board?.length);
            console.log('Board contents:', this.board);
        } catch (error) {
            console.error('ERROR during board initialization:', error);
            this.board = null;
        }
        this.score = 0;
        this.level = 1;
        this.currentTheme = 'light';
        
        // Animation tracking
        this.previousScore = 0;
        this.previousLevel = 1;
        this.previousCombo = 0;
        this.previousTotalCombos = 0;
        this.pendingClears = null; // Track blocks that are about to be cleared
        
        // Difficulty settings
        this.difficulty = 'normal';
        this.enableHints = false;
        this.enableTimer = false;
        this.moveLimit = null;
        this.timeLimit = null;
        
        // Re-enable features incrementally
        this.blockManager = new BlockManager();
        
        // Petrification system
        this.petrificationManager = new PetrificationManager();
        
        // Dead pixels system
        this.deadPixelsManager = new DeadPixelsManager();
        
        this.blockPalette = new BlockPalette('block-palette', this.blockManager, this);
        this.scoringSystem = new ScoringSystem(this.petrificationManager, this.difficultyManager);
        this.storage = new GameStorage();
        this.difficultySettings = new DifficultySettingsManager(this.storage);
        // this.effectsSystem = new EffectsSystem(this.canvas, this.ctx);
        this.pwaInstallManager = new PWAInstallManager();
        this.offlineManager = new OfflineManager();
        
        // Difficulty system
        this.difficultyManager = new DifficultyManager(this);
        this.hintSystem = new HintSystem(this, this.difficultyManager);
        this.timerSystem = new TimerSystem(this.difficultyManager);
        this.difficultySelector = new DifficultySelector(this, this.difficultyManager);
        
        // Effects system
        this.effectsManager = new EffectsManager(this.canvas, this.ctx);
        this.confirmationDialog = new ConfirmationDialog();
        this.preGameOverPending = false;
        this.selectedBlock = null;
        this.previewPosition = null;
        this.isGameOver = false;
        this.isInitialized = false;
        
        // Track combo display mode usage within a game (streak vs cumulative)
        this.comboModeActive = 'cumulative';
        this.comboModesUsed = new Set();
        
        // Speed timer countdown tracking
        this.speedTimerStartTime = null;
        this.speedTimerInterval = null;
        this.speedDisplayMode = 'timer'; // 'timer' or 'points'
        
        // Drag and drop state
        this.isDragging = false;
        this.dragStartPosition = null;
        this.dragCurrentPosition = null;
        this.dragBlockElement = null;
        
        try {
            console.log('About to load settings...');
            this.loadSettings();
            console.log('Settings loaded, setting isInitialized...');
            this.isInitialized = true; // Set early to prevent game over during init
            console.log('About to call init()...');
            this.init();
            console.log('Init completed, setting up resize handler...');
            this.setupResizeHandler();
            console.log('Constructor completed successfully');
        } catch (error) {
            console.error('ERROR in constructor after board init:', error);
        }
        
        // Listen for focus events to reload settings when returning from settings page
        window.addEventListener('focus', () => {
            this.loadSettings();
            this.updateDifficultyButton();
            this.renderPersonalBests();
            
            // Always reload game state when returning from settings (if not game over)
            if (!this.isGameOver) {
                // Small delay to ensure DOM is ready when returning from settings
                setTimeout(() => {
                    this.loadGameState();
                    this.draw();
                }, 10);
            }
        });
        
        // Listen for storage changes to detect difficulty changes from settings page
        window.addEventListener('storage', (e) => {
            if (e.key === 'blockdoku-settings' || e.key === 'blockdoku_settings') {
                this.loadSettings();
                this.updateDifficultyButton();
                this.updateHintControls();
                this.renderPersonalBests();
                
                // Always reload game state when settings change (if not game over)
                if (!this.isGameOver) {
                    // Small delay to ensure DOM is ready when settings change
                    setTimeout(() => {
                        this.loadGameState();
                        this.draw();
                    }, 10);
                }
            }
        });
    }


    resizeCanvas() {
        // Get the container dimensions
        const container = this.canvas.parentElement;
        if (!container) return;
        
        const containerRect = container.getBoundingClientRect();
        const containerSize = Math.min(containerRect.width, containerRect.height);
        
        // Calculate cell size to perfectly fill the container
        // Use Math.floor to ensure we don't exceed container bounds
        this.cellSize = Math.floor(containerSize / this.boardSize);
        
        // Calculate the actual grid size that will be drawn
        const gridSize = this.cellSize * this.boardSize;
        
        // CRITICAL FIX: Always make canvas internal resolution match display size exactly
        // This eliminates scaling mismatches between visual appearance and mouse coordinates
        this.canvas.width = containerSize;
        this.canvas.height = containerSize;
        
        // Set canvas display size to match (same as internal resolution)
        this.canvas.style.width = containerSize + 'px';
        this.canvas.style.height = containerSize + 'px';
        
        // Calculate actual cell size for the full container
        // This ensures perfect grid alignment with mouse coordinates
        this.actualCellSize = containerSize / this.boardSize;
        
        // Store both the integer cell size (for clean grid drawing) and actual cell size (for mouse events)
        this.gridCellSize = this.cellSize; // For drawing grid lines cleanly
        this.mouseCellSize = this.actualCellSize; // For mouse coordinate calculations
        
        // Ensure crisp rendering
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.lineCap = 'square';
        this.ctx.lineJoin = 'miter';
    }

    initializeBoard() {
        console.log('initializeBoard called, boardSize:', this.boardSize);
        const board = [];
        for (let row = 0; row < this.boardSize; row++) {
            board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                board[row][col] = 0; // 0 = empty, 1 = filled
            }
        }
        console.log('initializeBoard created board with length:', board.length);
        return board;
    }

    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            // Redraw after resize to ensure proper alignment
            requestAnimationFrame(() => {
                this.drawBoard();
            });
        });
    }
    
    init() {
        console.log('Game init() called');
        console.log('Board state at start of init():', this.board ? 'VALID' : 'UNDEFINED', 'Length:', this.board?.length);
        this.setupEventListeners();
        this.registerServiceWorker();
        // this.loadSettings();
        
        // Ensure BlockPalette is rendered BEFORE loading game state
        if (this.blockPalette) {
            this.blockPalette.render();
        }
        
        this.loadGameState();
        
        // Only generate new blocks if no blocks were loaded from saved state
        if (!this.blockManager.currentBlocks || this.blockManager.currentBlocks.length === 0) {
            this.generateNewBlocks();
        }
        
        // Initialize timer system for current difficulty
        this.timerSystem.initialize();
        this.timerSystem.start();
        
        // Wait for DOM to be fully ready before sizing and drawing
        setTimeout(() => {
            this.resizeCanvas();
            
            // Wait for next frame to ensure canvas is fully rendered
            requestAnimationFrame(() => {
                this.drawBoard();
                this.updateUI();
                this.renderPersonalBests();
            });
        }, 100); // Increased delay to ensure DOM is fully ready
        
        // Mark as initialized before starting game loop
        this.isInitialized = true;
        
        this.startGameLoop();
        
        // Initialize PWA managers after everything else is set up
        console.log('About to initialize PWA managers...');
        this.initializePWAManagers().then(() => {
            console.log('PWA managers initialization completed');
        }).catch(error => {
            console.error('PWA managers initialization failed:', error);
        });
        
        // Initialize difficulty button
        this.updateDifficultyButton();
        this.renderPersonalBests();
        
        // Initialize utility bar state
        this.updateUtilityBarState();
        
        // Set up piece timeout callback
        this.blockPalette.setPieceTimeoutCallback((blockId) => {
            this.handlePieceTimeout(blockId);
        });
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                // Check if we're in development mode by looking for Vite's dev server
                const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                
                if (isDev) {
                    console.log('PWA: Skipping Service Worker registration in development mode');
                    return;
                }
                
                const registration = await navigator.serviceWorker.register('./sw.js');
                console.log('PWA: Service Worker registered successfully', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    console.log('PWA: Service Worker update found');
                });
            } catch (error) {
                console.log('PWA: Service Worker registration failed (this is normal in development mode)', error.message);
            }
        }
    }

    async initializePWAManagers() {
        try {
            console.log('Initializing PWA managers...');
            
            // Dynamically import PWA modules
            const installModule = await import('./pwa/install.js');
            const offlineModule = await import('./pwa/offline.js');
            
            // Create PWA managers
            this.pwaInstallManager = new installModule.PWAInstallManager();
            this.offlineManager = new offlineModule.OfflineManager();
            
            console.log('PWA managers initialized successfully');
            console.log('PWAInstallManager:', this.pwaInstallManager);
            console.log('OfflineManager:', this.offlineManager);
            
        } catch (error) {
            console.error('Error initializing PWA managers:', error);
            this.pwaInstallManager = null;
            this.offlineManager = null;
        }
    }
    
    startGameLoop() {
        const gameLoop = () => {
            this.update();
            this.draw();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
    
    update() {
        // Don't update if game is over
        if (this.isGameOver) return;
        
        this.effectsManager.update();
        
        // Update hint system cooldown
        if (this.hintSystem) {
            this.hintSystem.update(16); // Assume 60fps, so ~16ms per frame
        }
        
        // Update timer system
        if (this.timerSystem) {
            const timerStillRunning = this.timerSystem.update(16);
            if (!timerStillRunning && this.timerSystem.isTimeUp() && this.isInitialized) {
                this.handleTimeUp();
            }
            this.updateTimerDisplay();
        }

        // Update placeability indicators each tick for responsiveness
        // Only update if game is initialized and has blocks
        if (this.isInitialized && this.blockManager && this.blockManager.currentBlocks && this.blockManager.currentBlocks.length > 0) {
            this.updatePlaceabilityIndicators();
        }
    }
    
    draw() {
        this.drawBoard();
        this.effectsManager.render();
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Canvas click events
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.handleCanvasMouseLeave());
        
        // Touch events for mobile drag and drop
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        this.canvas.addEventListener('touchcancel', (e) => this.handleTouchCancel(e), { passive: false });
        
        // Global touch events for drag operation
        document.addEventListener('touchmove', (e) => this.handleGlobalTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleGlobalTouchEnd(e), { passive: false });
        document.addEventListener('touchcancel', (e) => this.handleGlobalTouchCancel(e), { passive: false });
        
        // Button events
        const settingsToggle = document.getElementById('settings-toggle');
        if (settingsToggle) {
            const handleSettingsClick = () => {
                this.effectsManager.onButtonClick();
                console.log('Settings button clicked - navigating to settings page');
                
                // Always save game state before navigating to settings (if not game over)
                if (!this.isGameOver) {
                    console.log('Saving game state before navigating to settings');
                    this.saveGameState();
                }
                
                // NOTE: Settings is a separate PAGE (settings.html), not a modal!
                // The settings page contains: theme selection, difficulty settings, 
                // high scores, game settings, and the PWA install button.
                window.location.href = 'settings.html';
            };
            
            settingsToggle.addEventListener('click', handleSettingsClick);
            settingsToggle.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleSettingsClick();
            }, { passive: false });
        } else {
            console.error('Settings toggle button not found!');
        }
        
        // Game Settings button
        const gameSettingsToggle = document.getElementById('game-settings-toggle');
        if (gameSettingsToggle) {
            const handleGameSettingsClick = () => {
                this.effectsManager.onButtonClick();
                console.log('Game Settings button clicked - navigating to game settings page');
                
                // Navigate to game settings page
                // The game settings page contains: utility bar settings, game modes,
                // speed tracking, difficulty selector, animation controls, etc.
                window.location.href = 'gamesettings.html';
            };
            
            gameSettingsToggle.addEventListener('click', handleGameSettingsClick);
            gameSettingsToggle.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleGameSettingsClick();
            }, { passive: false });
        } else {
            console.error('Game Settings toggle button not found!');
        }
        
        const newGameBtn = document.getElementById('new-game');
        if (newGameBtn) {
            const handleNewGameClick = () => {
                this.effectsManager.onButtonClick();
                this.newGame();
            };
            
            newGameBtn.addEventListener('click', handleNewGameClick);
            newGameBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleNewGameClick();
            }, { passive: false });
        } else {
            console.error('New game button not found!');
        }
        
        // Difficulty button
        const difficultyBtn = document.getElementById('difficulty-btn');
        if (difficultyBtn) {
            const handleDifficultyClick = () => {
                this.effectsManager.onButtonClick();
                this.difficultySelector.show();
                // Ensure only one selector exists
                const existing = document.querySelectorAll('#difficulty-selector');
                if (existing.length > 1) {
                    existing.forEach((el, idx) => {
                        if (idx > 0 && el.parentNode) {
                            el.parentNode.removeChild(el);
                        }
                    });
                }
            };
            
            difficultyBtn.addEventListener('click', handleDifficultyClick);
            difficultyBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleDifficultyClick();
            }, { passive: false });
        } else {
            console.error('Difficulty button not found!');
        }
        
        // Hint button
        const hintBtn = document.getElementById('hint-btn');
        console.log('Looking for hint button:', hintBtn);
        if (hintBtn) {
            console.log('Hint button found, setting up event listeners');
            const handleHintClick = () => {
                console.log('Hint button clicked!');
                console.log('Current difficulty:', this.difficultyManager.getCurrentDifficulty());
                console.log('Hints enabled:', this.difficultyManager.isHintsEnabled());
                
                if (!this.difficultyManager.isHintsEnabled()) {
                    console.warn('Hints not enabled for current difficulty');
                    return;
                }
                
                this.effectsManager.onButtonClick();
                this.hintSystem.toggleHints();
            };
            
            hintBtn.addEventListener('click', handleHintClick);
            hintBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleHintClick();
            }, { passive: false });
        } else {
            console.error('Hint button not found!');
        }
        
        
        // Modal events (for remaining modals)
        const closeHighScores = document.getElementById('close-high-scores');
        if (closeHighScores) {
            closeHighScores.addEventListener('click', () => this.hideHighScores());
        }
        
        const closeDifficulty = document.getElementById('close-difficulty');
        if (closeDifficulty) {
            closeDifficulty.addEventListener('click', () => this.hideDifficultyModal());
        }
        
        const closeSettings = document.getElementById('close-settings');
        if (closeSettings) {
            closeSettings.addEventListener('click', () => this.hideSettingsModal());
        }
        
        // Difficulty selection events
        document.querySelectorAll('.difficulty-option').forEach(option => {
            option.addEventListener('click', async (e) => {
                await this.selectDifficulty(e.currentTarget.dataset.difficulty);
            });
        });
        
        // Additional settings events
        document.getElementById('enable-hints').addEventListener('change', (e) => this.toggleSetting('hints', e.target.checked));
        document.getElementById('enable-timer').addEventListener('change', (e) => this.toggleSetting('timer', e.target.checked));
        
        // Theme selection events
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectTheme(e.currentTarget.dataset.theme));
        });
        
        // Block selection events
        document.addEventListener('blockSelected', (e) => this.handleBlockSelected(e));
        
        // Block drag events
        document.addEventListener('blockDragStart', (e) => this.handleBlockDragStart(e));
        
        // Message events for settings page communication
        window.addEventListener('message', async (e) => {
            if (e.data.type === 'difficultyChanged') {
                await this.selectDifficulty(e.data.difficulty);
            }
        });
        
        // Listen for settings changes from settings page
        window.addEventListener('storage', (e) => {
            if (e.key === 'blockdoku-settings' || e.key === 'blockdoku_settings') {
                this.loadSettings();
                this.updateHintControls();
            }
        });
        
        // Save game state when navigating away from the page
        window.addEventListener('beforeunload', () => {
            console.log('beforeunload event triggered, autoSave:', this.autoSave, 'isGameOver:', this.isGameOver);
            if (this.autoSave && !this.isGameOver) {
                this.saveGameState();
            }
        });
        
        // Save game state when page becomes hidden (e.g., navigating to settings)
        document.addEventListener('visibilitychange', () => {
            console.log('visibilitychange event triggered, hidden:', document.hidden, 'autoSave:', this.autoSave, 'isGameOver:', this.isGameOver);
            if (document.hidden && this.autoSave && !this.isGameOver) {
                this.saveGameState();
            }
        });
    }
    
    // Calculate the center offset for a block shape
    getBlockCenterOffset(shape) {
        const rows = shape.length;
        const cols = shape[0].length;
        
        // Find the center of the shape
        let centerRow = 0;
        let centerCol = 0;
        let cellCount = 0;
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (shape[r][c] === 1) {
                    centerRow += r;
                    centerCol += c;
                    cellCount++;
                }
            }
        }
        
        if (cellCount === 0) return { row: 0, col: 0 };
        
        // Calculate average position (center of mass)
        centerRow = Math.round(centerRow / cellCount);
        centerCol = Math.round(centerCol / cellCount);
        
        return { row: centerRow, col: centerCol };
    }
    
    getBlockDragOffset(shape) {
        // Not used for mobile - we only use preview
        return { row: 0, col: 0 };
    }
    
    getBlockPlacementOffset(shape) {
        // Return offset for actual placement (center the block)
        return this.getBlockCenterOffset(shape);
    }

    handleCanvasClick(e) {
        // Don't handle clicks if game is over
        if (this.isGameOver) return;
        
        if (!this.selectedBlock) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Use the precise cell size that matches the actual canvas dimensions
        const col = Math.floor(x / this.mouseCellSize);
        const row = Math.floor(y / this.mouseCellSize);
        
        // Adjust position to center the block
        const centerOffset = this.getBlockCenterOffset(this.selectedBlock.shape);
        const adjustedRow = row - centerOffset.row;
        const adjustedCol = col - centerOffset.col;
        
        if (this.canPlaceBlock(adjustedRow, adjustedCol)) {
            this.placeBlock(adjustedRow, adjustedCol);
        }
    }
    
    handleCanvasMouseMove(e) {
        if (!this.selectedBlock) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Use the precise cell size that matches the actual canvas dimensions
        const col = Math.floor(x / this.mouseCellSize);
        const row = Math.floor(y / this.mouseCellSize);
        
        // Adjust position to center the block
        const centerOffset = this.getBlockCenterOffset(this.selectedBlock.shape);
        const adjustedRow = row - centerOffset.row;
        const adjustedCol = col - centerOffset.col;
        
        this.previewPosition = { row: adjustedRow, col: adjustedCol };
        this.drawBoard();
    }
    
    handleCanvasMouseLeave() {
        this.previewPosition = null;
        this.drawBoard();
    }
    
    // Touch event handlers for mobile drag and drop
    handleTouchStart(e) {
        e.preventDefault();
        
        // Don't handle touch events if game is over
        if (this.isGameOver) return;
        
        if (!this.selectedBlock) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.isDragging = true;
        this.dragStartPosition = { x, y };
        this.dragCurrentPosition = { x, y };
        
        // Create a visual drag element
        this.createDragElement();
        
        // Update preview position with preview offset (1.5 grid boxes above finger)
        const col = Math.floor(x / this.mouseCellSize);
        const row = Math.floor(y / this.mouseCellSize);
        const previewOffset = this.getBlockPlacementOffset(this.selectedBlock.shape);
        const adjustedRow = row - previewOffset.row;
        const adjustedCol = col - previewOffset.col;
        this.previewPosition = { row: adjustedRow, col: adjustedCol };
        this.drawBoard();
    }
    
    handleTouchMove(e) {
        // Don't handle touch events if game is over
        if (this.isGameOver) return;
        
        if (!this.isDragging || !this.selectedBlock) return;
        
        e.preventDefault();
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.dragCurrentPosition = { x: touch.clientX, y: touch.clientY };
        
        // Update drag element position
        this.updateDragElement(touch.clientX, touch.clientY);
        
        // Update preview position with preview offset (1.5 grid boxes above finger)
        const col = Math.floor(x / this.mouseCellSize);
        const row = Math.floor(y / this.mouseCellSize);
        const previewOffset = this.getBlockPlacementOffset(this.selectedBlock.shape);
        const adjustedRow = row - previewOffset.row;
        const adjustedCol = col - previewOffset.col;
        this.previewPosition = { row: adjustedRow, col: adjustedCol };
        this.drawBoard();
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        
        // Don't handle touch events if game is over
        if (this.isGameOver) return;
        
        if (!this.isDragging || !this.selectedBlock) return;
        
        const touch = e.changedTouches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        const col = Math.floor(x / this.mouseCellSize);
        const row = Math.floor(y / this.mouseCellSize);
        
        // Adjust position with placement offset (center the block)
        const placementOffset = this.getBlockPlacementOffset(this.selectedBlock.shape);
        const adjustedRow = row - placementOffset.row;
        const adjustedCol = col - placementOffset.col;
        
        // Check if we can place the block
        if (this.canPlaceBlock(adjustedRow, adjustedCol)) {
            this.placeBlock(adjustedRow, adjustedCol);
        } else {
            // Add error effects for invalid placement
            this.effectsManager.onError();
        }
        
        // Clean up drag state
        this.cleanupDrag();
    }
    
    handleTouchCancel(e) {
        // Only prevent default if the event is cancelable
        if (e.cancelable) {
            e.preventDefault();
        }
        this.cleanupDrag();
    }
    
    // Global touch event handlers for drag operation
    handleGlobalTouchMove(e) {
        // Don't handle touch events if game is over
        if (this.isGameOver) return;
        
        if (!this.isDragging || !this.selectedBlock) return;
        
        e.preventDefault();
        
        const touch = e.touches[0];
        this.dragCurrentPosition = { x: touch.clientX, y: touch.clientY };
        
        // Update drag element position
        this.updateDragElement(touch.clientX, touch.clientY);
        
        // Update preview position based on canvas position
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Calculate preview position - preview should show where block will actually be placed
        // The finger offset is just for control, but preview shows actual placement
        // Adjust touch position to account for finger offset (move touch point up by 2.5 grid boxes)
        const fingerOffset = 2.5; // Grid boxes above finger
        const adjustedY = y - (fingerOffset * this.mouseCellSize);
        
        const col = Math.floor(x / this.mouseCellSize);
        const row = Math.floor(adjustedY / this.mouseCellSize);
        const placementOffset = this.getBlockPlacementOffset(this.selectedBlock.shape);
        const adjustedRow = row - placementOffset.row;
        const adjustedCol = col - placementOffset.col;
        
        // Check if the PREVIEW (not the touch point) is within the canvas bounds
        const previewX = adjustedCol * this.mouseCellSize;
        const previewY = adjustedRow * this.mouseCellSize;
        
        if (previewX >= 0 && previewX <= rect.width && previewY >= 0 && previewY <= rect.height) {
            this.previewPosition = { row: adjustedRow, col: adjustedCol };
            this.drawBoard();
        } else {
            this.previewPosition = null;
            this.drawBoard();
        }
    }
    
    handleGlobalTouchEnd(e) {
        // Don't handle touch events if game is over
        if (this.isGameOver) return;
        
        if (!this.isDragging || !this.selectedBlock) return;
        
        e.preventDefault();
        
        const touch = e.changedTouches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Calculate placement position - adjust touch position to account for finger offset
        const fingerOffset = 2.5; // Grid boxes above finger
        const adjustedY = y - (fingerOffset * this.mouseCellSize);
        
        const col = Math.floor(x / this.mouseCellSize);
        const row = Math.floor(adjustedY / this.mouseCellSize);
        const placementOffset = this.getBlockPlacementOffset(this.selectedBlock.shape);
        const adjustedRow = row - placementOffset.row;
        const adjustedCol = col - placementOffset.col;
        
        // Check if the PLACEMENT (not the touch point) is within the canvas bounds
        const placementX = adjustedCol * this.mouseCellSize;
        const placementY = adjustedRow * this.mouseCellSize;
        
        if (placementX >= 0 && placementX <= rect.width && placementY >= 0 && placementY <= rect.height) {
            if (this.canPlaceBlock(adjustedRow, adjustedCol)) {
                this.placeBlock(adjustedRow, adjustedCol);
            } else {
                // Add error effects for invalid placement
                this.effectsManager.onError();
            }
        }
        
        // Clean up drag state
        this.cleanupDrag();
    }
    
    handleGlobalTouchCancel(e) {
        // Only prevent default if the event is cancelable
        if (e.cancelable) {
            e.preventDefault();
        }
        this.cleanupDrag();
    }
    
    createDragElement() {
        if (this.dragBlockElement) {
            this.dragBlockElement.remove();
        }
        
        // Don't create drag element for mobile - we only want the preview
        // The preview will show the green/red grid instead
        this.dragBlockElement = null;
    }
    
    updateDragElement(x, y) {
        // No drag element for mobile - we only use the preview
        // The preview is handled in the touch move handlers
    }
    
    drawBlockOnCanvas(ctx, block, size) {
        const cellSize = size / Math.max(block.shape.length, block.shape[0].length);
        
        ctx.fillStyle = block.color;
        ctx.strokeStyle = this.darkenColor(block.color);
        ctx.lineWidth = 1;
        
        for (let r = 0; r < block.shape.length; r++) {
            for (let c = 0; c < block.shape[r].length; c++) {
                if (block.shape[r][c] === 1) {
                    const x = c * cellSize;
                    const y = r * cellSize;
                    ctx.fillRect(x, y, cellSize, cellSize);
                    ctx.strokeRect(x, y, cellSize, cellSize);
                }
            }
        }
    }
    
    darkenColor(color) {
        // Simple color darkening function
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 30);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 30);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 30);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    getThemeColor(varName) {
        try {
            const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
            if (!value) {
                throw new Error(`Theme color variable '${varName}' not found`);
            }
            return value;
        } catch (e) {
            throw new Error(`Theme color '${varName}' is required but not available`);
        }
    }

    getClearGlowColor() {
        try {
            return this.getThemeColor('--clear-glow-color');
        } catch (error) {
            // Fallback colors for each theme if CSS variable is not available
            const fallbackColors = {
                'light': '#00ff00',
                'dark': '#ff4444', 
                'wood': '#00aaff'
            };
            return fallbackColors[this.currentTheme] || '#00ff00';
        }
    }
    
    verifyThemeLoaded() {
        // Check if key CSS variables are available
        const testVar = getComputedStyle(document.documentElement).getPropertyValue('--clear-glow-color').trim();
        if (!testVar) {
            console.log(`Theme CSS still loading for ${this.currentTheme}, fallback colors active`);
            // Force a small delay and retry
            setTimeout(() => {
                const retryVar = getComputedStyle(document.documentElement).getPropertyValue('--clear-glow-color').trim();
                if (retryVar) {
                    console.log(`✅ Theme CSS fully loaded for ${this.currentTheme}`);
                } else {
                    console.warn(`⚠️ Theme CSS failed to load properly for ${this.currentTheme}`);
                }
            }, 100);
        } else {
            console.log(`✅ Theme CSS ready for ${this.currentTheme}`);
        }
    }
    
    cleanupDrag() {
        this.isDragging = false;
        this.dragStartPosition = null;
        this.dragCurrentPosition = null;
        this.previewPosition = null;
        
        if (this.dragBlockElement) {
            this.dragBlockElement.remove();
            this.dragBlockElement = null;
        }
        
        this.drawBoard();
    }
    
    handleBlockSelected(e) {
        this.selectedBlock = e.detail.block;
        this.previewPosition = null;
        this.drawBoard();
    }
    
    handleBlockDragStart(e) {
        const { block, input } = e.detail;
        this.selectedBlock = block;
        
        // Start drag operation
        this.isDragging = true;
        this.dragStartPosition = { x: input.clientX, y: input.clientY };
        this.dragCurrentPosition = { x: input.clientX, y: input.clientY };
        
        // Create drag element
        this.createDragElement();
        
        // Update preview position with preview offset (1.5 grid boxes above finger)
        const rect = this.canvas.getBoundingClientRect();
        const x = input.clientX - rect.left;
        const y = input.clientY - rect.top;
        const col = Math.floor(x / this.mouseCellSize);
        const row = Math.floor(y / this.mouseCellSize);
        const previewOffset = this.getBlockPlacementOffset(block.shape);
        const adjustedRow = row - previewOffset.row;
        const adjustedCol = col - previewOffset.col;
        this.previewPosition = { row: adjustedRow, col: adjustedCol };
        this.drawBoard();
    }
    
    canPlaceBlock(row, col) {
        if (!this.selectedBlock) {
            return false;
        }
        
        if (!this.board) {
            console.error('canPlaceBlock: Board is undefined! Reinitializing...');
            this.board = this.initializeBoard();
            // Update placeability indicators after emergency board reinitialization
            this.updatePlaceabilityIndicators();
        }
        
        // Ghost blocks can overlap existing pieces (special magic power)
        const isGhostBlock = this.selectedBlock.isWild && this.selectedBlock.wildType === 'ghost';
        
        if (isGhostBlock) {
            // Ghost blocks only need to be within board boundaries
            // They can overlap with existing pieces
            return this.blockManager.isWithinBounds(this.selectedBlock, row, col, this.board);
        }
        
        // First check basic placement validity
        const canPlace = this.blockManager.canPlaceBlock(this.selectedBlock, row, col, this.board);
        if (!canPlace) {
            return false;
        }
        
        // Then check if placement would overlap with dead pixels
        if (this.deadPixelsManager && this.deadPixelsManager.isEnabled()) {
            return this.deadPixelsManager.canPlaceBlockWithDeadPixels(this.selectedBlock, row, col, this.board);
        }
        
        return true;
    }
    
    generateNewBlocks() {
        const newBlocks = this.blockManager.generateRandomBlocks(3, 'all', this.difficultyManager);
        this.blockPalette.updateBlocks(newBlocks);
        // Update placeability indicators for new blocks
        this.updatePlaceabilityIndicators();
        // Auto-select the first block when new blocks are generated
        this.autoSelectNextBlock();
    }
    
    autoSelectNextBlock() {
        if (this.blockManager.currentBlocks.length > 0) {
            const firstBlock = this.blockManager.currentBlocks[0];
            this.selectedBlock = firstBlock;
            this.blockPalette.selectBlockById(firstBlock.id);
        } else {
            this.selectedBlock = null;
        }
    }
    
    toggleCell(row, col) {
        this.board[row][col] = this.board[row][col] === 0 ? 1 : 0;
    }
    
    drawBoard() {
        // Don't draw if canvas isn't ready
        if (this.cellSize === 0 || this.canvas.width === 0) {
            return;
        }
        
        const ctx = this.ctx;
        // Use the actual cell size that fills the entire canvas perfectly
        const drawCellSize = this.actualCellSize || this.cellSize;
        
        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--board-bg');
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid lines with precise alignment to fill entire canvas
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--grid-line');
        ctx.lineWidth = 1;
        
        const gridWidth = this.canvas.width;
        const gridHeight = this.canvas.height;
        
        // Vertical lines - perfectly spaced to fill entire canvas
        for (let i = 0; i <= this.boardSize; i++) {
            const x = Math.round(i * drawCellSize);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, gridHeight);
            ctx.stroke();
        }
        
        // Horizontal lines - perfectly spaced to fill entire canvas
        for (let i = 0; i <= this.boardSize; i++) {
            const y = Math.round(i * drawCellSize);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(gridWidth, y);
            ctx.stroke();
        }
        
        // Draw 3x3 square borders (thicker lines) with perfect alignment
        ctx.lineWidth = 2;
        for (let i = 0; i <= 3; i++) {
            const x = Math.round(i * 3 * drawCellSize);
            const y = Math.round(i * 3 * drawCellSize);
            
            // Vertical 3x3 borders
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, gridHeight);
            ctx.stroke();
            
            // Horizontal 3x3 borders
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(gridWidth, y);
            ctx.stroke();
        }
        
        // Draw filled cells using the precise cell size
        if (!this.board || !Array.isArray(this.board)) {
            console.error('EMERGENCY: drawBoard - Board is not initialized properly, reinitializing...');
            this.board = this.initializeBoard();
            if (!this.board) {
                console.error('FATAL: Could not initialize board in drawBoard');
                return;
            }
            // Update placeability indicators after emergency board reinitialization
            this.updatePlaceabilityIndicators();
        }
        
        // Draw dead pixels first (before filled cells)
        if (this.deadPixelsManager && this.deadPixelsManager.isEnabled()) {
            const deadPixels = this.deadPixelsManager.getDeadPixels();
            const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--board-bg').trim();
            
            deadPixels.forEach(({ row, col }) => {
                const x = Math.round(col * drawCellSize) + 1;
                const y = Math.round(row * drawCellSize) + 1;
                const size = Math.round(drawCellSize) - 2;
                
                // Draw dead pixel with background color and subtle pattern
                ctx.fillStyle = bgColor;
                ctx.fillRect(x, y, size, size);
                
                // Add a subtle X pattern to indicate dead pixel
                ctx.save();
                ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + size, y + size);
                ctx.moveTo(x + size, y);
                ctx.lineTo(x, y + size);
                ctx.stroke();
                ctx.restore();
            });
        }
        
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--block-color');
        for (let row = 0; row < this.boardSize; row++) {
            if (!this.board[row] || !Array.isArray(this.board[row])) {
                console.warn(`drawBoard: Board row ${row} is not initialized properly`);
                continue;
            }
            for (let col = 0; col < this.boardSize; col++) {
                // Skip drawing if this is a dead pixel (they're already drawn)
                const isDeadPixel = this.deadPixelsManager && this.deadPixelsManager.isDeadPixel(row, col);
                
                if (this.board[row][col] === 1 && !isDeadPixel) {
                    const x = Math.round(col * drawCellSize) + 1;
                    const y = Math.round(row * drawCellSize) + 1;
                    const size = Math.round(drawCellSize) - 2;
                    
                    // Check petrification state
                    const petrificationState = this.petrificationManager.getGridCellState(row, col);
                    
                    // Apply different color for petrified cells
                    if (petrificationState.petrified) {
                        // Petrified cells appear frozen/hardened (darker, desaturated)
                        ctx.fillStyle = '#404040'; // Dark gray for frozen/hardened look
                    } else if (petrificationState.warning === '3s') {
                        // 3 second warning - flashing/pulsing
                        const flashIntensity = Math.sin(Date.now() / 150) * 0.5 + 0.5;
                        ctx.fillStyle = `rgba(255, 100, 100, ${0.5 + flashIntensity * 0.5})`;
                    } else if (petrificationState.warning === '7s') {
                        // 7 second warning - subtle flash
                        const flashIntensity = Math.sin(Date.now() / 1000) * 0.3 + 0.7;
                        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--block-color');
                        ctx.globalAlpha = flashIntensity;
                    } else {
                        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--block-color');
                        ctx.globalAlpha = 1.0;
                    }
                    
                    ctx.fillRect(x, y, size, size);
                    ctx.globalAlpha = 1.0; // Reset alpha
                    
                    // Add border to filled cells
                    ctx.strokeStyle = petrificationState.petrified ? '#202020' : 
                                      getComputedStyle(document.documentElement).getPropertyValue('--block-border');
                    ctx.lineWidth = petrificationState.petrified ? 2 : 1;
                    ctx.strokeRect(x, y, size, size);
                    
                    // Add ice/frost effect overlay for petrified cells
                    if (petrificationState.petrified) {
                        ctx.save();
                        ctx.strokeStyle = 'rgba(150, 200, 255, 0.3)';
                        ctx.lineWidth = 1;
                        // Draw diagonal lines for frost effect
                        for (let i = 0; i < 3; i++) {
                            ctx.beginPath();
                            ctx.moveTo(x + i * (size / 3), y);
                            ctx.lineTo(x, y + i * (size / 3));
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.moveTo(x + size, y + i * (size / 3));
                            ctx.lineTo(x + i * (size / 3), y + size);
                            ctx.stroke();
                        }
                        ctx.restore();
                    }
                }
            }
        }
        
        // Draw preview block
        if (this.selectedBlock && this.previewPosition) {
            this.drawPreviewBlock();

            // Subtle pre-clear indication in Easy/Normal when preview would clear
            if (this.difficulty === 'easy' || this.difficulty === 'normal') {
                const row = this.previewPosition.row;
                const col = this.previewPosition.col;
                if (this.canPlaceBlock(row, col)) {
                    const tempBoard = this.blockManager.placeBlock(this.selectedBlock, row, col, this.board);
                    const potentialClears = this.scoringSystem.checkForCompletedLines(tempBoard);
                    if (potentialClears.rows.length || potentialClears.columns.length || potentialClears.squares.length) {
                        this.drawClearingBlockGlow(potentialClears, { subtle: true });
                    }
                }
            }
        }
        
        // Draw hints if enabled
        if (this.difficultyManager.isHintsEnabled()) {
            this.hintSystem.drawHints(ctx);
        }
        
        // Draw glow effect for pending clears
        if (this.pendingClears) {
            this.drawClearingBlockGlow(this.pendingClears);
        }
        
        // Draw clear notification if active
        this.drawClearNotification();
    }
    
    toggleTheme() {
        const themes = ['light', 'dark', 'wood'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.applyTheme(themes[nextIndex]);
        
        // Redraw board with new colors
        this.drawBoard();
    }

    selectTheme(theme) {
        this.applyTheme(theme);
    }
    
    drawPreviewBlock() {
        if (!this.selectedBlock || !this.previewPosition) return;
        
        const ctx = this.ctx;
        // Use the actual cell size that matches canvas dimensions
        const drawCellSize = this.actualCellSize || this.cellSize;
        const shape = this.selectedBlock.shape;
        const row = this.previewPosition.row;
        const col = this.previewPosition.col;
        
        // Check if placement is valid
        const canPlace = this.canPlaceBlock(row, col);
        
        // Set preview color based on validity
        ctx.fillStyle = canPlace ? 
            this.selectedBlock.color + '80' : // Semi-transparent if valid
            '#ff000080'; // Red if invalid
        
        ctx.strokeStyle = canPlace ? 
            this.selectedBlock.color : 
            '#ff0000';
        ctx.lineWidth = 2;
        
        // Draw preview block using precise positioning
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c] === 1) {
                    const blockCol = col + c;
                    const blockRow = row + r;
                    
                    // Check if block cell is within bounds
                    if (blockCol >= 0 && blockCol < this.boardSize && 
                        blockRow >= 0 && blockRow < this.boardSize) {
                        const x = Math.round(blockCol * drawCellSize) + 1;
                        const y = Math.round(blockRow * drawCellSize) + 1;
                        const size = Math.round(drawCellSize) - 2;
                        
                        ctx.fillRect(x, y, size, size);
                        ctx.strokeRect(x, y, size, size);
                    }
                }
            }
        }
    }
    
    checkLineClears() {
        // Safety check: if pendingClears has been stuck for too long, reset it
        if (this.pendingClears && this.pendingClearsTimestamp) {
            const timeSincePending = Date.now() - this.pendingClearsTimestamp;
            if (timeSincePending > 5000) { // 5 seconds timeout
                console.warn('Pending clears stuck for too long, resetting...');
                this.pendingClears = null;
                this.pendingClearResult = null;
                this.pendingClearsTimestamp = null;
            }
        }
        
        // Don't check for clears if we're already in the middle of a clearing animation
        if (this.pendingClears) {
            console.log('Skipping line clear check - animation in progress');
            return;
        }
        
        // Ensure board is valid before checking
        if (!this.board || !Array.isArray(this.board)) {
            console.error('Invalid board state in checkLineClears, reinitializing...');
            this.board = this.initializeBoard();
            return;
        }
        
        // Check for completed lines (but don't clear yet)
        const clearedLines = this.scoringSystem.checkForCompletedLines(this.board);
        
        // If any lines were cleared, start the animation sequence
        if (clearedLines.rows.length > 0 || clearedLines.columns.length > 0 || clearedLines.squares.length > 0) {
            console.log('Lines detected for clearing:', clearedLines);
            
            // Calculate and update score immediately (before animation)
            this.updateScoreForClears(clearedLines);
            
            // Update UI immediately to show new score
            this.updateUI();
            
            // Show immediate visual feedback first (with original board intact for glow)
            this.showImmediateClearFeedback(clearedLines);
            
            // Start the clearing animation with delay
            this.startLineClearAnimation(clearedLines);
        } else {
            console.log('No lines detected for clearing');
            // Reset streak and combo when no clears occur after block placement
            this.scoringSystem.resetStreak();
            // Update UI to reflect combo reset
            this.updateUI();
        }
    }
    
    // Calculate score for clears and update immediately
    updateScoreForClears(clearedLines) {
        console.log('updateScoreForClears called with:', clearedLines);
        
        // Get difficulty multiplier
        const difficultyMultiplier = this.difficultyManager.getScoreMultiplier();
        
        // Use applyClears instead of calculateScoreForClears to update combo counters
        const result = this.scoringSystem.applyClears(this.board, clearedLines, difficultyMultiplier);
        console.log('Score calculation result:', result);
        
        // Update the board state
        this.board = result.board;
        
        // Update app score (score was already added to scoringSystem in applyClears)
        this.score = this.scoringSystem.getScore();
        
        // Update scoring system score to keep in sync
        this.scoringSystem.score = this.score;
        
        // Update level based on new score
        this.scoringSystem.updateLevelFromScore();
        this.level = this.scoringSystem.getLevel();
        
        // Update combo state in scoring system
        const totalClears = clearedLines.rows.length + clearedLines.columns.length + clearedLines.squares.length;
        if (totalClears > 0) {
            // Update per-type clear counters
            this.scoringSystem.rowsClearedCount += clearedLines.rows.length;
            this.scoringSystem.columnsClearedCount += clearedLines.columns.length;
            this.scoringSystem.squaresClearedCount += clearedLines.squares.length;
            this.scoringSystem.linesCleared += totalClears;
            
            // Combo tracking is already handled by ScoringSystem.applyClears()
            // No need to duplicate the logic here - the scoring system maintains:
            // - combo (streak counter, resets on non-combo)
            // - totalCombos (cumulative, never resets during gameplay)
            // - streakCount (consecutive combo streak)
            // - maxCombo, maxTotalCombos, maxStreakCount, comboActivations
        }
        
        // Store the result for later use in completeLineClear
        this.pendingClearResult = {
            clearedLines: clearedLines,
            scoreGained: result.scoreGained,
            isCombo: result.isCombo,
            combo: this.scoringSystem.getCombo()
        };
        
        // Store score info for enhanced display
        this.lastScoreInfo = {
            scoreGained: result.scoreGained,
            isComboEvent: result.isCombo,
            clearTypes: result.comboTypes || [],
            totalClears: totalClears,
            breakdown: {
                linePoints: 0,
                squarePoints: 0,
                comboBonus: 0
            }
        };
        
        // Show immediate point breakdown display
        this.showPointBreakdown(this.lastScoreInfo, clearedLines);
        
        console.log('Score updated immediately. New score:', this.score, 'New level:', this.level);
    }
    
    startLineClearAnimation(clearedLines) {
        console.log('Starting line clear animation for:', clearedLines);
        // Set timestamp for safety timeout
        this.pendingClearsTimestamp = Date.now();
        
        // Check if we have multiple types of clears for cascade effect
        const clearTypes = [];
        if (clearedLines.rows.length > 0) clearTypes.push({ type: 'rows', lines: clearedLines.rows });
        if (clearedLines.columns.length > 0) clearTypes.push({ type: 'columns', lines: clearedLines.columns });
        if (clearedLines.squares.length > 0) clearTypes.push({ type: 'squares', lines: clearedLines.squares });
        
        if (clearTypes.length > 1) {
            // Multiple types - use cascade effect
            this.startCascadeClearAnimation(clearTypes, clearedLines);
        } else {
            // Single type - use standard animation
            this.highlightClearingBlocks(clearedLines);
            
            // Store the timeout ID so we can cancel it if needed
            this.clearTimeoutId = setTimeout(() => {
                console.log('Timeout reached, calling completeLineClear');
                this.completeLineClear(clearedLines);
            }, 750);
            
            // Add a safety timeout to prevent permanent stuck state
            this.safetyTimeoutId = setTimeout(() => {
                if (this.pendingClears) {
                    console.warn('Safety timeout reached - forcing line clear completion');
                    this.forceCompleteLineClear(clearedLines);
                }
            }, 2000); // 2 seconds safety timeout
        }
    }
    
    // Cascade animation for multiple line types
    startCascadeClearAnimation(clearTypes, allClearedLines) {
        console.log('🌊 Starting cascade animation for:', clearTypes);
        
        let currentStep = 0;
        const cascadeDelay = 300; // Delay between each cascade step
        
        const processCascadeStep = () => {
            if (currentStep >= clearTypes.length) {
                // All cascade steps complete - finish the clearing
                console.log('🌊 Cascade complete, finishing clear');
                this.completeLineClear(allClearedLines);
                return;
            }
            
            const currentClearType = clearTypes[currentStep];
            console.log(`🌊 Cascade step ${currentStep + 1}/${clearTypes.length}: ${currentClearType.type}`);
            
            // Create partial cleared lines object for this step
            const stepClearedLines = {
                rows: currentClearType.type === 'rows' ? currentClearType.lines : [],
                columns: currentClearType.type === 'columns' ? currentClearType.lines : [],
                squares: currentClearType.type === 'squares' ? currentClearType.lines : []
            };
            
            // Highlight this step's lines
            this.highlightClearingBlocks(stepClearedLines, true); // true for cascade mode
            
            // Add enhanced particle effects for cascade
            this.addCascadeParticleEffects(stepClearedLines, currentStep);
            
            // Move to next step
            currentStep++;
            setTimeout(processCascadeStep, cascadeDelay);
        };
        
        // Start the cascade
        processCascadeStep();
        
        // Add overall safety timeout
        this.safetyTimeoutId = setTimeout(() => {
            if (this.pendingClears) {
                console.warn('🌊 Cascade safety timeout reached - forcing completion');
                this.forceCompleteLineClear(allClearedLines);
            }
        }, 3000); // Longer timeout for cascade
    }
    
    // Add enhanced particle effects for cascade steps
    addCascadeParticleEffects(clearedLines, stepIndex) {
        if (!this.effectsManager) return;
        
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']; // Different colors for each step
        const color = colors[stepIndex % colors.length];
        
        // Add particles for each cleared line
        clearedLines.rows.forEach(row => {
            const y = row * (this.canvas.height / 9) + (this.canvas.height / 18);
            for (let i = 0; i < 3; i++) {
                const x = (i + 1) * (this.canvas.width / 4);
                this.effectsManager.addParticle(x, y, color, 'cascade');
            }
        });
        
        clearedLines.columns.forEach(col => {
            const x = col * (this.canvas.width / 9) + (this.canvas.width / 18);
            for (let i = 0; i < 3; i++) {
                const y = (i + 1) * (this.canvas.height / 4);
                this.effectsManager.addParticle(x, y, color, 'cascade');
            }
        });
        
        clearedLines.squares.forEach(square => {
            const x = square.col * 3 * (this.canvas.width / 9) + (this.canvas.width / 6);
            const y = square.row * 3 * (this.canvas.height / 9) + (this.canvas.height / 6);
            this.effectsManager.addParticle(x, y, color, 'cascade');
        });
    }
    
    showImmediateClearFeedback(clearedLines) {
        // Set pending clears for persistent glow effect
        this.pendingClears = clearedLines;
        this.pendingClearsTimestamp = Date.now();
        
        // Create immediate visual feedback - very subtle flash
        this.ctx.save();
        const glowColor = this.getClearGlowColor();
        this.ctx.fillStyle = glowColor; // Theme-based flash
        this.ctx.globalAlpha = 0.2;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1.0;
        this.ctx.restore();
        
        // Add a brief visual cue (very subtle border)
        this.canvas.style.border = `1px solid ${glowColor}`;
        this.canvas.style.boxShadow = `0 0 5px ${glowColor}`;
        
        // Remove the border effect quickly
        setTimeout(() => {
            this.canvas.style.border = '';
            this.canvas.style.boxShadow = '';
        }, 300);
        
        // Store notification state so it can be redrawn each frame
        const totalClears = clearedLines.rows.length + clearedLines.columns.length + clearedLines.squares.length;
        let message = '';
        
        if (totalClears === 1) {
            if (clearedLines.rows.length > 0) message = 'ROW!';
            else if (clearedLines.columns.length > 0) message = 'COLUMN!';
            else if (clearedLines.squares.length > 0) message = 'SQUARE!';
        } else if (totalClears > 1) {
            message = `${totalClears} CLEARS!`;
        }
        
        // Only show notification if there's actually a message
        if (message) {
            this.clearNotification = {
                message: message,
                startTime: Date.now(),
                duration: 400
            };
        }
        
        // Redraw board to show glow effect (notification will be drawn in drawBoard)
        this.drawBoard();
    }
    
    drawClearingBlockGlow(clearedLines, options = {}) {
        // Draw enhanced glow outline around blocks that will be cleared
        const { subtle = false } = options;
        this.ctx.save();
        const drawCellSize = this.actualCellSize || this.cellSize;
        
        // Set up enhanced glow effect (theme-based)
        const glowColor = this.getClearGlowColor();
        this.ctx.shadowColor = glowColor;
        this.ctx.shadowBlur = subtle ? 2 : 4;
        this.ctx.strokeStyle = glowColor;
        this.ctx.lineWidth = subtle ? 0.5 : 1;
        
        // Draw outer glow
        this.ctx.globalAlpha = subtle ? 0.2 : 0.4;
        clearedLines.rows.forEach(row => {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 1) {
                    const x = col * drawCellSize;
                    const y = row * drawCellSize;
                    const inset = subtle ? 3 : 2;
                    this.ctx.strokeRect(x + inset, y + inset, drawCellSize - inset * 2, drawCellSize - inset * 2);
                }
            }
        });
        
        clearedLines.columns.forEach(col => {
            for (let row = 0; row < this.boardSize; row++) {
                if (this.board[row][col] === 1) {
                    const x = col * drawCellSize;
                    const y = row * drawCellSize;
                    const inset = subtle ? 3 : 2;
                    this.ctx.strokeRect(x + inset, y + inset, drawCellSize - inset * 2, drawCellSize - inset * 2);
                }
            }
        });
        
        clearedLines.squares.forEach(square => {
            // Convert square indices to actual board coordinates
            const startRow = square.row * 3;
            const startCol = square.col * 3;
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    const row = startRow + r;
                    const col = startCol + c;
                    if (this.board[row][col] === 1) {
                        const x = col * drawCellSize;
                        const y = row * drawCellSize;
                        const inset = subtle ? 3 : 2;
                        this.ctx.strokeRect(x + inset, y + inset, drawCellSize - inset * 2, drawCellSize - inset * 2);
                    }
                }
            }
        });
        
        // Draw inner bright outline (reduced intensity)
        this.ctx.shadowBlur = 0;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = subtle ? 0.5 : 0.75; // Reduced from 1.5
        this.ctx.globalAlpha = subtle ? 0.25 : 0.5; // Reduced from 1.0
        
        clearedLines.rows.forEach(row => {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 1) {
                    const x = col * drawCellSize;
                    const y = row * drawCellSize;
                    const insetInner = subtle ? 5 : 4;
                    this.ctx.strokeRect(x + insetInner, y + insetInner, drawCellSize - insetInner * 2, drawCellSize - insetInner * 2);
                }
            }
        });
        
        clearedLines.columns.forEach(col => {
            for (let row = 0; row < this.boardSize; row++) {
                if (this.board[row][col] === 1) {
                    const x = col * drawCellSize;
                    const y = row * drawCellSize;
                    const insetInner = subtle ? 5 : 4;
                    this.ctx.strokeRect(x + insetInner, y + insetInner, drawCellSize - insetInner * 2, drawCellSize - insetInner * 2);
                }
            }
        });
        
        clearedLines.squares.forEach(square => {
            // Convert square indices to actual board coordinates
            const startRow = square.row * 3;
            const startCol = square.col * 3;
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    const row = startRow + r;
                    const col = startCol + c;
                    if (this.board[row][col] === 1) {
                        const x = col * drawCellSize;
                        const y = row * drawCellSize;
                    const insetInner = subtle ? 5 : 4;
                    this.ctx.strokeRect(x + insetInner, y + insetInner, drawCellSize - insetInner * 2, drawCellSize - insetInner * 2);
                    }
                }
            }
        });
        
        this.ctx.restore();
    }
    
    drawClearNotification() {
        // Check if we have an active notification to draw
        if (!this.clearNotification) return;
        
        const now = Date.now();
        const elapsed = now - this.clearNotification.startTime;
        
        // If notification has expired, clear it
        if (elapsed >= this.clearNotification.duration) {
            this.clearNotification = null;
            return;
        }
        
        // Calculate fade out
        const alpha = 1 - (elapsed / this.clearNotification.duration);
        
        const x = this.canvas.width / 2;
        const y = this.canvas.height / 2;
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        
        // Draw background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(x - 80, y - 20, 160, 40);
        
        // Draw border
        const notifGlow = this.getClearGlowColor();
        this.ctx.strokeStyle = notifGlow;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x - 80, y - 20, 160, 40);
        
        // Draw text
        this.ctx.fillStyle = notifGlow;
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.clearNotification.message, x, y);
        
        this.ctx.restore();
    }
    
    highlightClearingBlocks(clearedLines, cascadeMode = false) {
        // Draw the board with highlighted clearing blocks
        this.drawBoard();
        
        const ctx = this.ctx;
        const drawCellSize = this.actualCellSize || this.cellSize;
        const glowColor = this.getClearGlowColor();
        
        ctx.save();
        ctx.globalAlpha = cascadeMode ? 0.9 : 0.7; // More intense for cascade
        
        // Enhanced glow effect for cascade mode
        if (cascadeMode) {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 20;
        }
        
        // Highlight clearing rows
        clearedLines.rows.forEach(row => {
            ctx.fillStyle = glowColor; // Theme-based highlight
            ctx.fillRect(0, row * drawCellSize, this.canvas.width, drawCellSize);
        });
        
        // Highlight clearing columns
        clearedLines.columns.forEach(col => {
            ctx.fillStyle = glowColor; // Theme-based highlight
            ctx.fillRect(col * drawCellSize, 0, drawCellSize, this.canvas.height);
        });
        
        // Highlight clearing 3x3 squares
        clearedLines.squares.forEach(square => {
            ctx.fillStyle = glowColor; // Theme-based highlight
            const x = square.col * 3 * drawCellSize;
            const y = square.row * 3 * drawCellSize;
            ctx.fillRect(x, y, 3 * drawCellSize, 3 * drawCellSize);
        });
        
        ctx.restore();
        
        // Glow effect is now handled by drawBoard() when pendingClears is set
    }
    
    completeLineClear(clearedLines) {
        console.log('completeLineClear called with:', clearedLines);
        let result;
        let combo;
        let storedResult; // Declare storedResult in the method scope
        
        try {
            // Actually clear the lines from the board FIRST (without updating score)
            console.log('Clearing lines from board...');
            result = this.scoringSystem.clearLinesFromBoard(this.board, clearedLines);
            console.log('Lines cleared from board, result:', result);
            
            // Only clear pending state AFTER successful clearing
            if (result && result.board) {
                this.board = result.board;
                // Clear pending clears state AFTER successful board update
                this.pendingClears = null;
                this.pendingClearsTimestamp = null;
                // Clear timeouts since we completed successfully
                if (this.clearTimeoutId) {
                    clearTimeout(this.clearTimeoutId);
                    this.clearTimeoutId = null;
                }
                if (this.safetyTimeoutId) {
                    clearTimeout(this.safetyTimeoutId);
                    this.safetyTimeoutId = null;
                }
            } else {
                console.error('Failed to clear lines from board, keeping pending state');
                return; // Exit early if clearing failed
            }
            
            // Thaw all petrified cells and blocks after a clear event
            this.petrificationManager.thawAll();
            this.petrificationManager.updateBoardTracking(this.board);
            
            // Retrieve the score info that was already calculated and applied
            storedResult = this.pendingClearResult;
            if (!storedResult) {
                console.warn('No pendingClearResult found - score was not pre-calculated!');
                // Fallback: shouldn't happen but handle gracefully
                combo = this.scoringSystem.getCombo();
            } else {
                combo = storedResult.combo;
            }
            
            // Clear the stored result
            this.pendingClearResult = null;
            
            console.log('Line clear completed. Score was already updated. Current score:', this.score, 'Current level:', this.level);
        } catch (error) {
            console.error('Error during line clear completion:', error);
            // Don't reset pending state on error - this causes the stuck state
            // Instead, try to recover by attempting the clear again
            console.log('Attempting recovery from line clear error...');
            
            // Try to clear the lines again as a recovery attempt
            try {
                const recoveryResult = this.scoringSystem.clearLinesFromBoard(this.board, clearedLines);
                if (recoveryResult && recoveryResult.board) {
                    this.board = recoveryResult.board;
                    this.pendingClears = null;
                    this.pendingClearsTimestamp = null;
                    this.pendingClearResult = null;
                    console.log('Recovery successful, lines cleared');
                } else {
                    console.error('Recovery failed, keeping pending state for manual intervention');
                    // Keep pending state so user can use resetStuckUIState() if needed
                }
            } catch (recoveryError) {
                console.error('Recovery attempt also failed:', recoveryError);
                // Keep pending state for manual intervention
            }
            return;
        }
        
        // Create visual effects
        this.createLineClearEffect(clearedLines);
        
        // Add line clear effects
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.effectsManager.onLineClear(centerX, centerY, clearedLines);
        
        // Create score popup with contextual details
        // Use stored result if available, otherwise fall back to defaults
        const scoreGained = storedResult ? storedResult.scoreGained : 0;
        const isCombo = storedResult ? storedResult.isCombo : false;
        
        this.createScorePopup(
            centerX,
            centerY,
            scoreGained,
            clearedLines,
            isCombo,
            combo,
            (this.storage.loadSettings()?.comboDisplayMode) || 'cumulative'
        );
        
        // Create combo effect if applicable
        if (combo >= 1) {
            this.createComboEffect(combo, centerX, centerY + 50);
            this.effectsManager.onCombo(centerX, centerY + 50, combo);
        }
        
        // Note: UI was already updated in checkLineClears, but update again in case of state changes
        this.updateUI();
        
        // Update placeability indicators immediately after line clears
        this.updatePlaceabilityIndicators();
        
        // Check for additional line clears after this one
        setTimeout(() => {
            this.checkLineClears();
        }, 200);
    }
    
    // Force complete line clear when stuck (safety mechanism)
    forceCompleteLineClear(clearedLines) {
        console.log('Force completing line clear for:', clearedLines);
        
        try {
            // Clear timeouts first
            if (this.clearTimeoutId) {
                clearTimeout(this.clearTimeoutId);
                this.clearTimeoutId = null;
            }
            if (this.safetyTimeoutId) {
                clearTimeout(this.safetyTimeoutId);
                this.safetyTimeoutId = null;
            }
            
            // Force clear the lines
            const result = this.scoringSystem.clearLinesFromBoard(this.board, clearedLines);
            if (result && result.board) {
                this.board = result.board;
                this.pendingClears = null;
                this.pendingClearsTimestamp = null;
                this.pendingClearResult = null;
                
                // Thaw petrified cells
                this.petrificationManager.thawAll();
                this.petrificationManager.updateBoardTracking(this.board);
                
                // Update UI
                this.updateUI();
                this.updatePlaceabilityIndicators();
                
                console.log('Force clear completed successfully');
            } else {
                console.error('Force clear failed - using emergency reset');
                this.resetStuckUIState();
            }
        } catch (error) {
            console.error('Force clear error:', error);
            this.resetStuckUIState();
        }
    }
    
    newGame() {
        // Check for high score before starting new game
        if (this.score > 0) {
            this.checkHighScore();
        }
        
        this.board = this.initializeBoard();
        this.scoringSystem.reset();
        this.petrificationManager.resetAll();
        this.petrificationManager.resetStats();
        
        // Generate new dead pixels if enabled
        if (this.deadPixelsManager && this.deadPixelsManager.isEnabled()) {
            this.deadPixelsManager.generateDeadPixels(this.boardSize);
        }
        
        this.score = 0;
        this.level = 1;
        this.selectedBlock = null;
        this.previewPosition = null;
        this.isGameOver = false;
        
        // Stop speed timer countdown
        this.stopSpeedTimerCountdown();
        
        // Reset and restart timer system for new game
        this.timerSystem.reset();
        this.timerSystem.start();
        
        this.isInitialized = true;
        // Load combo display mode from settings
        const settings = this.storage.loadSettings();
        this.comboModeActive = settings.comboDisplayMode || 'cumulative';
        this.comboModesUsed = new Set();
        
        // Reset piece timeouts for new game
        if (this.blockPalette && this.blockPalette.stopTimeoutChecking) {
            this.blockPalette.stopTimeoutChecking();
        }
        
        // Reset palette drag state for new game
        if (this.blockPalette && this.blockPalette.resetDragState) {
            this.blockPalette.resetDragState();
        }
        
        // Clean up any lingering UI elements
        const pointBreakdown = document.getElementById('point-breakdown');
        if (pointBreakdown && pointBreakdown.parentElement) {
            pointBreakdown.parentElement.removeChild(pointBreakdown);
        }
        
        // Clear any pending clears state
        this.pendingClears = null;
        this.pendingClearResult = null;
        this.pendingClearsTimestamp = null;
        this.clearNotification = null;
        
        // Reset animation tracking
        this.previousScore = 0;
        this.previousLevel = 1;
        this.previousCombo = 0;
        this.previousTotalCombos = 0;
        // this.effectsSystem.clear();
        this.generateNewBlocks();
        this.drawBoard();
        this.updateUI();
        
        // Clear saved game state for new game
        this.storage.clearGameState();
    }
    
    restartWithDifficulty(difficulty) {
        console.log(`Restarting game with difficulty: ${difficulty}`);
        
        // Set difficulty in both places to keep them in sync
        this.difficulty = difficulty;
        this.difficultyManager.setDifficulty(difficulty);
        
        // Update difficulty button
        this.updateDifficultyButton();
        
        // Initialize difficulty systems
        this.timerSystem.initialize();
        this.timerSystem.start();
        this.hintSystem.reset();
        
        // Start new game with new difficulty
        this.newGame();
    }
    
    updateUI() {
        const scoreElement = document.getElementById('score');
        const levelElement = document.getElementById('level');
        const comboElement = document.getElementById('combo');
        const comboLabelElement = document.getElementById('combo-label');
        const speedTimerElement = document.getElementById('speed-timer');
        const speedTimerValueElement = document.getElementById('speed-timer-value');
        
        const currentCombo = this.scoringSystem.getCombo();
        const totalCombos = this.scoringSystem.getTotalCombos();
        const speedStats = this.scoringSystem.getSpeedStats();
        
        // Determine which value to show based on settings
        const settings = this.storage.loadSettings();
        const mode = settings.comboDisplayMode || 'cumulative';
        this.comboModeActive = mode;
        this.comboModesUsed.add(mode);
        
        // Check for first score gain
        if (this.previousScore === 0 && this.score > 0) {
            if (this.successModeEnabled) {
                this.animateFirstScore(scoreElement);
            }
        } else if (this.score > this.previousScore) {
            this.animateScoreIncrease(scoreElement);
        }
        
        // Check for level change
        if (this.level > this.previousLevel) {
            this.animateLevelUp(levelElement);
            
            // Check for empty grid bonus every 5 levels
            const emptyGridBonus = this.scoringSystem.applyEmptyGridBonus(this.board);
            if (emptyGridBonus > 0) {
                this.showEmptyGridBonus(emptyGridBonus);
            }
        }
        
        // Check for combo hit based on the active display mode
        const previousTotalCombos = this.previousTotalCombos || 0;
        console.log('🎯 Combo Debug:', { 
            mode, 
            currentCombo, 
            totalCombos, 
            previousTotalCombos, 
            previousCombo: this.previousCombo 
        });
        
        if (mode === 'cumulative') {
            if (totalCombos > previousTotalCombos && totalCombos >= 1) {
                console.log('🎯 Animating cumulative combo hit:', totalCombos);
                this.animateComboHit(comboElement);
            }
        } else {
            if (currentCombo > this.previousCombo && currentCombo >= 1) {
                console.log('🎯 Animating streak combo hit:', currentCombo);
                this.animateComboHit(comboElement);
            }
        }
        
        // Update the text content
        scoreElement.textContent = this.score;
        levelElement.textContent = this.level;
        
        // Display selected combo type in scoreboard
        if (comboLabelElement) comboLabelElement.textContent = 'Combo';
        if (mode === 'cumulative') {
            comboElement.textContent = totalCombos;
        } else {
            comboElement.textContent = currentCombo;
        }
        
        // Update speed timer display in utility bar
        if (speedTimerElement && speedTimerValueElement) {
            const settings = this.storage.loadSettings();
            // Use difficulty-specific setting for speed timer
            const difficultySettings = this.difficultySettings.getSettingsForDifficulty(this.difficulty);
            const showSpeedTimer = difficultySettings.showSpeedTimer === true;
            
            if (showSpeedTimer) {
                speedTimerElement.style.display = 'flex';
                
                // Display either countdown timer or points based on speedDisplayMode
                if (this.speedDisplayMode === 'timer') {
                    // Show countdown timer - always show something even if timer hasn't started
                    if (this.speedTimerStartTime) {
                        const elapsed = Date.now() - this.speedTimerStartTime;
                        const seconds = (elapsed / 1000).toFixed(1);
                        speedTimerValueElement.textContent = `${seconds}s`;
                    } else {
                        speedTimerValueElement.textContent = 'Ready';
                    }
                } else {
                    // Show total speed bonus points
                    speedTimerValueElement.textContent = speedStats.totalSpeedBonus || 0;
                    
                    // Add pulse animation for recent speed bonuses
                    if (speedStats.speedBonuses && speedStats.speedBonuses.length > 0) {
                        const lastBonus = speedStats.speedBonuses[speedStats.speedBonuses.length - 1];
                        const timeSinceLastBonus = Date.now() - lastBonus.timestamp;
                        if (timeSinceLastBonus < 2000) { // Within last 2 seconds
                            speedTimerElement.classList.add('speed-pulse');
                            setTimeout(() => {
                                speedTimerElement.classList.remove('speed-pulse');
                            }, 600);
                        }
                    }
                }
            } else {
                speedTimerElement.style.display = 'none';
            }
        }
        
        // Update previous values
        this.previousScore = this.score;
        this.previousLevel = this.level;
        this.previousCombo = currentCombo;
        this.previousTotalCombos = totalCombos;
        
        // Update hint controls visibility
        this.updateHintControls();
        // Keep personal bests fresh if score changed
        this.renderPersonalBests();
    }

    renderPersonalBests() {
        try {
            const container = document.getElementById('personal-bests');
            if (!container) return;
            const show = this.showPersonalBests === true;
            if (!show) {
                container.style.display = 'none';
                return;
            }
            const best = this.storage.getBestScoresByDifficulty();
            const currentDifficultyBest = best[this.difficulty] || 0;
            const difficultyLabel = this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1);
            
            container.innerHTML = `
                <span class="pb-item">
                    <span class="pb-label">BEST</span>
                    <span class="pb-value">${currentDifficultyBest.toLocaleString()}</span>
                </span>
            `;
            container.style.display = 'inline-flex';
        } catch (e) {
            console.warn('renderPersonalBests failed:', e);
        }
        
        // Update utility bar collapsible state
        this.updateUtilityBarState();
    }
    
    // Show detailed point breakdown for immediate feedback
    showPointBreakdown(scoreInfo, clearedLines) {
        if (!scoreInfo || scoreInfo.scoreGained === 0) return;
        
        // Remove any existing point breakdown element first
        const existingBreakdown = document.getElementById('point-breakdown');
        if (existingBreakdown && existingBreakdown.parentElement) {
            existingBreakdown.parentElement.removeChild(existingBreakdown);
        }
        
        // Create new point breakdown display
        const breakdownElement = document.createElement('div');
        breakdownElement.id = 'point-breakdown';
        breakdownElement.className = 'point-breakdown';
        
        // Build breakdown text
        const breakdown = scoreInfo.breakdown || {};
        const parts = [];
        
        if (breakdown.linePoints > 0) {
            const lineCount = clearedLines.rows.length + clearedLines.columns.length;
            parts.push(`${lineCount} Line${lineCount > 1 ? 's' : ''}: +${breakdown.linePoints}`);
        }
        
        if (breakdown.squarePoints > 0) {
            const squareCount = clearedLines.squares.length;
            parts.push(`${squareCount} Square${squareCount > 1 ? 's' : ''}: +${breakdown.squarePoints}`);
        }
        
        if (breakdown.comboBonus > 0) {
            parts.push(`Combo Bonus: +${breakdown.comboBonus}`);
        }
        
        if (parts.length > 0) {
            breakdownElement.innerHTML = parts.join('<br>');
            breakdownElement.style.display = 'block';
            breakdownElement.style.opacity = '1';
            
            // Append to body instead of game-info to avoid layout issues
            document.body.appendChild(breakdownElement);
            
            // Animate the breakdown
            breakdownElement.style.transition = 'all 0.3s ease-out';
            breakdownElement.style.transform = 'translate(-50%, -50%) scale(1.1)';
            breakdownElement.style.color = this.getClearGlowColor();
            
            // Remove from DOM after animation completes
            setTimeout(() => {
                breakdownElement.style.opacity = '0';
                breakdownElement.style.transform = 'translate(-50%, -50%) scale(1)';
                setTimeout(() => {
                    if (breakdownElement.parentElement) {
                        breakdownElement.parentElement.removeChild(breakdownElement);
                    }
                }, 300);
            }, 3000);
        }
        
        // Also show floating score animation
        this.showFloatingScore(scoreInfo.scoreGained, scoreInfo.isComboEvent);
    }
    
    // Show floating score animation for immediate feedback
    showFloatingScore(scoreGained, isCombo = false) {
        const scoreElement = document.getElementById('score');
        const rect = scoreElement.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        // Calculate position relative to canvas
        const x = rect.left + rect.width / 2 - canvasRect.left;
        const y = rect.top + rect.height / 2 - canvasRect.top;
        
        // Create floating score element
        const floatingScore = document.createElement('div');
        floatingScore.className = 'floating-score';
        floatingScore.textContent = `+${scoreGained}`;
        floatingScore.style.position = 'absolute';
        floatingScore.style.left = `${x}px`;
        floatingScore.style.top = `${y}px`;
        floatingScore.style.color = isCombo ? '#ff6600' : this.getClearGlowColor();
        floatingScore.style.fontSize = '2rem';
        floatingScore.style.fontWeight = '900';
        floatingScore.style.textShadow = `0 0 10px ${isCombo ? '#ff6600' : this.getClearGlowColor()}`;
        floatingScore.style.pointerEvents = 'none';
        floatingScore.style.zIndex = '1000';
        floatingScore.style.transition = 'all 1.5s ease-out';
        
        // Add to canvas container
        this.canvas.parentElement.appendChild(floatingScore);
        
        // Animate the floating score
        setTimeout(() => {
            floatingScore.style.transform = 'translateY(-60px) scale(1.2)';
            floatingScore.style.opacity = '0';
        }, 100);
        
        // Remove after animation
        setTimeout(() => {
            if (floatingScore.parentElement) {
                floatingScore.parentElement.removeChild(floatingScore);
            }
        }, 1600);
    }
    
    // Show placement points feedback if enabled
    showPlacementPointsFeedback(points, row, col) {
        const settings = this.storage.loadSettings();
        const showPlacementPoints = settings.showPlacementPoints === true;
        
        if (!showPlacementPoints) return;
        
        // Calculate position on canvas for the feedback
        const drawCellSize = this.actualCellSize || this.cellSize;
        const x = col * drawCellSize + drawCellSize / 2;
        const y = row * drawCellSize + drawCellSize / 2;
        
        // Create floating placement points element
        const floatingPoints = document.createElement('div');
        floatingPoints.className = 'floating-placement-points';
        floatingPoints.textContent = `+${points}`;
        floatingPoints.style.position = 'absolute';
        floatingPoints.style.left = `${x}px`;
        floatingPoints.style.top = `${y}px`;
        floatingPoints.style.color = '#00ff88'; // Bright green for placement points
        floatingPoints.style.fontSize = '1.2rem';
        floatingPoints.style.fontWeight = '700';
        floatingPoints.style.textShadow = '0 0 8px #00ff88';
        floatingPoints.style.pointerEvents = 'none';
        floatingPoints.style.zIndex = '1000';
        floatingPoints.style.transition = 'all 1.2s ease-out';
        floatingPoints.style.transform = 'translate(-50%, -50%) scale(0.8)';
        floatingPoints.style.opacity = '0';
        
        // Add to canvas container
        this.canvas.parentElement.appendChild(floatingPoints);
        
        // Animate the floating points
        setTimeout(() => {
            floatingPoints.style.transform = 'translate(-50%, -50%) scale(1.1)';
            floatingPoints.style.opacity = '1';
        }, 50);
        
        // Move up and fade out
        setTimeout(() => {
            floatingPoints.style.transform = 'translate(-50%, -80px) scale(0.9)';
            floatingPoints.style.opacity = '0';
        }, 800);
        
        // Remove after animation
        setTimeout(() => {
            if (floatingPoints.parentElement) {
                floatingPoints.parentElement.removeChild(floatingPoints);
            }
        }, 1300);
    }
    
    // Show empty grid bonus notification with unique styling
    showEmptyGridBonus(bonus) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Create floating text element for empty grid bonus
        const floatingBonus = document.createElement('div');
        floatingBonus.className = 'floating-empty-grid-bonus';
        floatingBonus.textContent = `Empty Grid Bonus: +${bonus}`;
        floatingBonus.style.position = 'absolute';
        floatingBonus.style.left = `${centerX}px`;
        floatingBonus.style.top = `${centerY}px`;
        floatingBonus.style.color = '#00ff88'; // Bright green color
        floatingBonus.style.fontSize = '1.8rem';
        floatingBonus.style.fontWeight = '900';
        floatingBonus.style.textShadow = '0 0 15px #00ff88, 0 0 30px #00ff88';
        floatingBonus.style.pointerEvents = 'none';
        floatingBonus.style.zIndex = '1001';
        floatingBonus.style.transition = 'all 2.5s ease-out';
        floatingBonus.style.transform = 'translate(-50%, -50%) scale(0.8)';
        floatingBonus.style.opacity = '0';
        floatingBonus.style.textAlign = 'center';
        floatingBonus.style.whiteSpace = 'nowrap';
        
        // Add to canvas container
        this.canvas.parentElement.appendChild(floatingBonus);
        
        // Animate the floating bonus
        setTimeout(() => {
            floatingBonus.style.transform = 'translate(-50%, -50%) scale(1.3)';
            floatingBonus.style.opacity = '1';
        }, 100);
        
        // Move up and fade out
        setTimeout(() => {
            floatingBonus.style.transform = 'translate(-50%, -120px) scale(1.1)';
            floatingBonus.style.opacity = '0';
        }, 1500);
        
        // Remove after animation
        setTimeout(() => {
            if (floatingBonus.parentElement) {
                floatingBonus.parentElement.removeChild(floatingBonus);
            }
        }, 2600);
        
        // Create particle effects for celebration (if success mode enabled)
        if (this.successModeEnabled) {
            this.effectsManager.particles.createEmptyGridBonusEffect(centerX, centerY);
        }
        
        // Play sound and haptic feedback
        if (this.effectsManager.sound) {
            this.effectsManager.sound.play('emptyGridBonus');
        }
        if (this.effectsManager.haptic) {
            this.effectsManager.haptic.onEmptyGridBonus();
        }
    }
    
    updateHintControls() {
        const hintControls = document.getElementById('hint-controls');
        const hintBtn = document.getElementById('hint-btn');
        
        console.log('updateHintControls called');
        console.log('hintControls element:', hintControls);
        console.log('hintBtn element:', hintBtn);
        console.log('isHintsEnabled:', this.difficultyManager.isHintsEnabled());
        console.log('current difficulty:', this.difficultyManager.getCurrentDifficulty());
        
        if (hintControls && hintBtn) {
            const hintsEnabled = this.difficultyManager.isHintsEnabled();
            hintControls.style.display = hintsEnabled ? 'block' : 'none';
            console.log('Setting hint controls display to:', hintsEnabled ? 'block' : 'none');
            
            if (hintsEnabled) {
                const hintStatus = this.hintSystem.getHintStatus();
                hintBtn.disabled = !hintStatus.available;
                
                if (hintStatus.active) {
                    hintBtn.textContent = 'On';
                } else if (hintStatus.available) {
                    hintBtn.textContent = 'Off';
                } else {
                    hintBtn.textContent = `${Math.ceil(hintStatus.cooldownRemaining / 1000)}s`;
                }
                console.log('Hint button status:', hintStatus);
            }
        } else {
            console.error('Hint controls or button not found in updateHintControls');
        }
        
        // Update utility bar collapsible state
        this.updateUtilityBarState();
    }
    
    updateUtilityBarState() {
        const utilityBar = document.getElementById('utility-bar');
        if (!utilityBar) return;
        
        // Check if any utility bar content is visible
        const timerDisplay = document.getElementById('timer-display');
        const speedTimer = document.getElementById('speed-timer');
        const hintControls = document.getElementById('hint-controls');
        const personalBests = document.getElementById('personal-bests');
        
        const hasContent = (
            (timerDisplay && timerDisplay.style.display !== 'none') ||
            (speedTimer && speedTimer.style.display !== 'none') ||
            (hintControls && hintControls.style.display !== 'none') ||
            (personalBests && personalBests.style.display !== 'none')
        );
        
        // Add or remove has-content class based on visibility
        if (hasContent) {
            utilityBar.classList.add('has-content');
        } else {
            utilityBar.classList.remove('has-content');
        }
        
        // Update individual slot active states
        this.updateSlotActiveState('hint-slot', hintControls);
        this.updateSlotActiveState('timer-slot', timerDisplay);
        this.updateSlotActiveState('personal-best-slot', personalBests);
        this.updateSlotActiveState('speed-timer-slot', speedTimer);
    }
    
    updateSlotActiveState(slotId, contentElement) {
        const slot = document.getElementById(slotId);
        if (!slot) return;
        
        const isActive = contentElement && contentElement.style.display !== 'none';
        
        if (isActive) {
            slot.classList.add('active');
        } else {
            slot.classList.remove('active');
        }
    }
    
    updateTimerDisplay() {
        const timerDisplay = document.getElementById('timer-display');
        const timerElement = document.getElementById('timer');
        
        if (timerDisplay && timerElement && this.timerSystem) {
            const timerEnabled = this.difficultyManager.getTimeLimit() !== null;
            timerDisplay.style.display = timerEnabled ? 'block' : 'none';
            
            if (timerEnabled) {
                const timeRemaining = this.timerSystem.getTimeRemaining();
                const formattedTime = this.timerSystem.formatTime(timeRemaining);
                timerElement.textContent = formattedTime;
                
                // Remove all timer state classes
                timerDisplay.classList.remove('warning', 'critical');
                
                // Add appropriate state class for LED styling and play warning sounds
                if (this.timerSystem.isCriticalTime()) {
                    if (!timerDisplay.classList.contains('critical')) {
                        timerDisplay.classList.add('critical');
                        this.effectsManager.sound.play('timeCritical');
                    }
                } else if (this.timerSystem.isWarningTime()) {
                    if (!timerDisplay.classList.contains('warning')) {
                        timerDisplay.classList.add('warning');
                        this.effectsManager.sound.play('timeWarning');
                    }
                }
                
                // Reset any inline styles (let CSS handle the styling)
                timerElement.style.color = '';
                timerElement.style.textShadow = '';
                timerElement.style.animation = '';
            }
        }
        
        // Update utility bar collapsible state
        this.updateUtilityBarState();
    }
    
    handleTimeUp() {
        // Game over due to time up
        this.effectsManager.onError();
        this.gameOver();
    }
    
    showTimeBonus(bonusSeconds) {
        // Show time bonus feedback
        this.effectsManager.onScoreGain(bonusSeconds);
        
        // Create floating text for time bonus
        const canvas = this.canvas;
        const ctx = this.ctx;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Add floating text effect
        this.effectsManager.particles.createFloatingText(
            centerX, centerY - 50, 
            `+${bonusSeconds}s`, 
            this.getClearGlowColor(), 
            2000
        );
    }
    
    
    updateDifficultyButton() {
        const difficultyBtn = document.getElementById('difficulty-btn');
        if (difficultyBtn) {
            const currentDifficulty = this.difficultyManager.getCurrentDifficulty();
            const difficultyInfo = this.difficultyManager.getDifficultyInfo();
            
            // Remove all difficulty classes
            difficultyBtn.classList.remove('easy', 'normal', 'hard', 'expert');
            
            // Add the current difficulty class
            difficultyBtn.classList.add(currentDifficulty);
            
            // Update text and title
            difficultyBtn.textContent = difficultyInfo.name;
            difficultyBtn.title = `Current difficulty: ${difficultyInfo.name} - ${difficultyInfo.description}`;
        }
    }
    
    // Enhanced visual effects for line clearing
    createLineClearEffect(clearedLines) {
        // Create a more dramatic flash effect
        const glowColor = this.getClearGlowColor();
        this.ctx.fillStyle = glowColor;
        this.ctx.globalAlpha = 0.8;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1.0;
        
        // Add a second flash for more impact
        setTimeout(() => {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = 0.6;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalAlpha = 1.0;
            
            // Redraw the board after the flash
            setTimeout(() => {
                this.drawBoard();
            }, 150);
        }, 100);
    }
    
    createScorePopup(x, y, scoreGained, clearedLines = { rows: [], columns: [], squares: [] }, isCombo = false, comboValue = 0, comboMode = 'streak') {
        // Enhanced score popup with contextual visibility
        this.ctx.save();
        
        // Add background for better visibility
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x - 60, y - 20, 120, 40);
        
        // Add border
        const glowColor = this.getClearGlowColor();
        this.ctx.strokeStyle = glowColor;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x - 60, y - 20, 120, 40);
        
        // Build contextual text
        const totalLines = (clearedLines?.rows?.length || 0) + (clearedLines?.columns?.length || 0);
        const squares = (clearedLines?.squares?.length || 0);
        const parts = [];
        if (totalLines > 0) parts.push(`${totalLines} line${totalLines>1?'s':''}`);
        if (squares > 0) parts.push(`${squares} square${squares>1?'s':''}`);
        const contextText = parts.length ? parts.join(' + ') : 'Placement';

        // Primary score text
        this.ctx.fillStyle = glowColor;
        this.ctx.font = 'bold 22px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`+${scoreGained}`, x, y);

        // Secondary context line
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        const comboLabel = isCombo ? (comboMode === 'cumulative' ? ` • COMBO x${comboValue} (total)` : ` • COMBO x${comboValue}`) : '';
        this.ctx.fillText(`${contextText}${comboLabel}`, x, y + 18);
        
        this.ctx.restore();
        
        // Animate the popup (fade out and move up)
        let animationFrame = 0;
        const animate = () => {
            if (animationFrame < 60) { // 60 frames = ~1.0 seconds at 60fps (increased from 45)
                this.ctx.save();
                this.ctx.globalAlpha = 1 - (animationFrame / 60);
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(x - 70, y - 24 - animationFrame * 2, 140, 48);
                this.ctx.strokeStyle = glowColor;
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x - 70, y - 24 - animationFrame * 2, 140, 48);
                this.ctx.fillStyle = glowColor;
                this.ctx.font = 'bold 22px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`+${scoreGained}`, x, y - 4 - animationFrame * 2);

                // Draw secondary text
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 14px Arial';
                const comboLabelAnim = isCombo ? (comboMode === 'cumulative' ? ` • COMBO x${comboValue} (total)` : ` • COMBO x${comboValue}`) : '';
                this.ctx.fillText(`${contextText}${comboLabelAnim}`, x, y + 14 - animationFrame * 2);
                this.ctx.restore();
                
                animationFrame++;
                requestAnimationFrame(animate);
            } else {
                this.drawBoard();
            }
        };
        
        setTimeout(() => {
            requestAnimationFrame(animate);
        }, 200);
    }
    
    createComboEffect(combo, x, y) {
        // Only show enhanced effects if success mode is enabled
        if (!this.successModeEnabled) {
            return;
        }
        
        // Enhanced combo effect with animation
        this.ctx.save();
        
        // Add background for better visibility
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(x - 80, y - 15, 160, 30);
        
        // Add border
        this.ctx.strokeStyle = '#ff6600';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x - 80, y - 15, 160, 30);
        
        // Draw combo text
        this.ctx.fillStyle = '#ff6600';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${combo}x COMBO!`, x, y + 5);
        
        this.ctx.restore();
        
        // Animate the combo effect (pulse and fade)
        let animationFrame = 0;
        const animate = () => {
            if (animationFrame < 60) { // 60 frames = ~1 second at 60fps
                this.ctx.save();
                
                // Pulse effect
                const pulse = 1 + Math.sin(animationFrame * 0.3) * 0.2;
                this.ctx.scale(pulse, pulse);
                
                this.ctx.globalAlpha = 1 - (animationFrame / 60);
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                this.ctx.fillRect((x - 80) / pulse, (y - 15) / pulse, 160 / pulse, 30 / pulse);
                this.ctx.strokeStyle = '#ff6600';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect((x - 80) / pulse, (y - 15) / pulse, 160 / pulse, 30 / pulse);
                this.ctx.fillStyle = '#ff6600';
                this.ctx.font = 'bold 24px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`${combo}x COMBO!`, x / pulse, (y + 5) / pulse);
                
                this.ctx.restore();
                
                animationFrame++;
                requestAnimationFrame(animate);
            } else {
                this.drawBoard();
            }
        };
        
        setTimeout(() => {
            requestAnimationFrame(animate);
        }, 300);
    }
    
    // UI Animation Methods
    animateFirstScore(element) {
        // Enhanced first score animation with celebration effect
        element.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        element.style.transform = 'scale(1.6)';
        const glowColor = this.getClearGlowColor();
        element.style.color = glowColor;
        element.style.textShadow = `0 0 20px ${glowColor}`;
        
        // Add pulsing effect
        setTimeout(() => {
            element.style.transform = 'scale(1.3)';
        }, 300);
        
        setTimeout(() => {
            element.style.transform = 'scale(1.1)';
        }, 500);
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = '';
            element.style.textShadow = '';
        }, 800);
    }
    
    animateScoreIncrease(element) {
        // Enhanced score animation with better visual feedback
        element.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        element.style.transform = 'scale(1.3)';
        element.style.color = this.getClearGlowColor();
        element.style.textShadow = `0 0 15px ${this.getClearGlowColor()}`;
        
        // Add a subtle bounce effect
        setTimeout(() => {
            element.style.transform = 'scale(1.1)';
        }, 200);
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = '';
            element.style.textShadow = '';
        }, 400);
    }
    
    animateLevelUp(element) {
        element.style.transition = 'all 0.8s ease-out';
        element.style.transform = 'scale(1.4) rotate(5deg)';
        element.style.color = '#ff6600';
        element.style.textShadow = '0 0 15px #ff6600';
        
        // Add level up effects
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.effectsManager.onLevelUp(centerX, centerY);
        // Encouraging message overlay
        this.showEncouragingLevelMessage();
        
        setTimeout(() => {
            element.style.transform = 'scale(1) rotate(0deg)';
            element.style.color = '';
            element.style.textShadow = '';
        }, 800);
    }

    showEncouragingLevelMessage() {
        const ctx = this.ctx;
        const x = this.canvas.width / 2;
        const y = this.canvas.height / 2 - 60;
        const message = this.getEncouragementText();
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(x - 140, y - 24, 280, 48);
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 140, y - 24, 280, 48);
        ctx.fillStyle = '#ffcc66';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(message, x, y + 6);
        ctx.restore();
        setTimeout(() => this.drawBoard(), 1200);
    }

    getEncouragementText() {
        // Gradually encouraging messages and difficulty nudges
        const lvl = this.level;
        const diff = this.difficultyManager?.getCurrentDifficulty?.() || this.difficulty || 'normal';
        const suggestions = {
            easy: [
                'Great rhythm! Keep building streaks!',
                'Nice clears! Try planning two moves ahead.',
                'You’re cruising—consider Normal soon!'
            ],
            normal: [
                'Clean plays! Eye the 3x3 squares.',
                'Strong pace—chain those clears!',
                'Feeling comfy? Hard might be fun!'
            ],
            hard: [
                'Impressive! Combos are your friend.',
                'Great foresight—minimize leftover singles.',
                'Dominating Hard? Expert awaits.'
            ],
            expert: [
                'Elite moves! Stay calm under the clock.',
                'Precision play—keep the board breathable.',
                'Excellent focus—push that high score!'
            ]
        };
        const pool = suggestions[diff] || suggestions.normal;
        // Rotate based on level to vary messages without RNG
        return pool[(lvl - 1) % pool.length];
    }
    
    animateComboHit(element) {
        element.style.transition = 'all 0.5s ease-out';
        element.style.transform = 'scale(1.3)';
        element.style.color = '#ff0066';
        element.style.textShadow = '0 0 12px #ff0066';
        
        // Add a pulse effect
        let pulseCount = 0;
        const pulse = () => {
            if (pulseCount < 3) {
                element.style.transform = pulseCount % 2 === 0 ? 'scale(1.3)' : 'scale(1.1)';
                pulseCount++;
                setTimeout(pulse, 150);
            } else {
                element.style.transform = 'scale(1)';
                element.style.color = '';
                element.style.textShadow = '';
            }
        };
        
        setTimeout(pulse, 200);
    }

    // Storage Methods

    loadGameState() {
        const savedState = this.storage.loadGameState();
        if (savedState) {
            console.log('Loading saved game state:', savedState);
            this.board = savedState.board || this.initializeBoard();
            this.score = savedState.score || 0;
            this.level = savedState.level || 1;
            
            // Initialize previous values to match loaded state to prevent false animations
            this.previousScore = this.score;
            this.previousLevel = this.level;
            this.previousCombo = 0;
            this.previousTotalCombos = 0;
            
            // Fully synchronize scoring system state
            this.scoringSystem.score = this.score;
            this.scoringSystem.level = this.level;
            
            // Restore additional scoring system state if available
            if (savedState.scoringState) {
                this.scoringSystem.linesCleared = savedState.scoringState.linesCleared || 0;
                this.scoringSystem.combo = savedState.scoringState.combo || 0;
                this.scoringSystem.maxCombo = savedState.scoringState.maxCombo || 0;
                this.scoringSystem.rowsClearedCount = savedState.scoringState.rowsClearedCount || 0;
                this.scoringSystem.columnsClearedCount = savedState.scoringState.columnsClearedCount || 0;
                this.scoringSystem.squaresClearedCount = savedState.scoringState.squaresClearedCount || 0;
                this.scoringSystem.comboActivations = savedState.scoringState.comboActivations || 0;
                this.scoringSystem.pointsBreakdown = savedState.scoringState.pointsBreakdown || { linePoints: 0, squarePoints: 0, comboBonusPoints: 0 };
            }
            
            if (savedState.currentBlocks) {
                this.blockManager.currentBlocks = savedState.currentBlocks;
                this.blockPalette.updateBlocks(savedState.currentBlocks);
            }
            
            if (savedState.selectedBlock) {
                this.selectedBlock = savedState.selectedBlock;
            }
            
            // Restore petrification state
            if (savedState.petrificationState && this.petrificationManager) {
                this.petrificationManager.deserialize(savedState.petrificationState);
            }
            
            // Restore dead pixels state
            if (savedState.deadPixelsState && this.deadPixelsManager) {
                this.deadPixelsManager.deserialize(savedState.deadPixelsState);
            }
            
            // Update placeability indicators after loading game state
            this.updatePlaceabilityIndicators();
            
            console.log('Game state loaded successfully');
        } else {
            console.log('No saved game state found - starting fresh game');
            // If no saved state, ensure we have a valid board and generate blocks
            if (!this.board || !Array.isArray(this.board)) {
                this.board = this.initializeBoard();
            }
            
            // Ensure BlockPalette is rendered before generating blocks
            if (this.blockPalette) {
                console.log('Rendering block palette before generating blocks');
                this.blockPalette.render();
            } else {
                console.error('BlockPalette not available!');
            }
            
            // Generate initial blocks for a fresh game (with small delay to ensure DOM is ready)
            setTimeout(() => {
                console.log('Generating new blocks for fresh game');
                this.generateNewBlocks();
            }, 10);
        }
    }

    saveGameState() {
        // Only save if there's actually a game in progress
        const hasGameProgress = this.score > 0 || 
                               (this.board && this.board.some(row => row.some(cell => cell === 1))) ||
                               (this.blockManager.currentBlocks && this.blockManager.currentBlocks.length > 0);
        
        if (!hasGameProgress) {
            console.log('No game progress to save, skipping save');
            return;
        }
        
        const gameState = {
            board: this.board,
            score: this.score,
            level: this.level,
            currentBlocks: this.blockManager.currentBlocks,
            selectedBlock: this.selectedBlock,
            scoringState: {
                linesCleared: this.scoringSystem.linesCleared,
                combo: this.scoringSystem.combo,
                maxCombo: this.scoringSystem.maxCombo,
                rowsClearedCount: this.scoringSystem.rowsClearedCount,
                columnsClearedCount: this.scoringSystem.columnsClearedCount,
                squaresClearedCount: this.scoringSystem.squaresClearedCount,
                comboActivations: this.scoringSystem.comboActivations,
                pointsBreakdown: this.scoringSystem.pointsBreakdown
            },
            petrificationState: this.petrificationManager ? this.petrificationManager.serialize() : null,
            deadPixelsState: this.deadPixelsManager ? this.deadPixelsManager.serialize() : null
        };
        console.log('Saving game state:', gameState);
        this.storage.saveGameState(gameState);
        console.log('Game state saved successfully');
    }

    loadSettings() {
        if (this.storage) {
            const baseSettings = this.storage.loadSettings();
            console.log('Loading theme from storage:', baseSettings.theme);
            this.currentTheme = baseSettings.theme || 'wood';
            console.log('Current theme set to:', this.currentTheme);
            this.difficulty = baseSettings.difficulty || 'normal';
            this.autoSave = baseSettings.autoSave !== false;
            
            // Get difficulty-specific settings (defaults + overrides)
            const difficultySettings = this.difficultySettings.getSettingsForDifficulty(this.difficulty);
            
            // Apply difficulty-specific settings
            this.soundEnabled = difficultySettings.soundEnabled === true;
            this.animationsEnabled = difficultySettings.animationsEnabled !== false;
            this.enableHints = difficultySettings.enableHints || false;
            this.enableTimer = difficultySettings.enableTimer || false;
            this.enablePetrification = difficultySettings.enablePetrification || false;
            this.enableDeadPixels = difficultySettings.enableDeadPixels || false;
            this.deadPixelsIntensity = difficultySettings.deadPixelsIntensity || 0;
            this.showPoints = difficultySettings.showPoints || false;
            this.showPersonalBests = difficultySettings.showPersonalBests || false;
            this.showSpeedTimer = difficultySettings.showSpeedTimer || false;
            this.enableMagicBlocks = difficultySettings.enableMagicBlocks || false;
            this.enableWildShapes = difficultySettings.enableWildShapes || false;
            
            // Log difficulty settings application
            console.log(`🎮 Difficulty level game settings applied for: ${this.difficulty.toUpperCase()}`);
            console.log('Applied settings:', {
                soundEnabled: this.soundEnabled,
                animationsEnabled: this.animationsEnabled,
                enableHints: this.enableHints,
                enableTimer: this.enableTimer,
                enablePetrification: this.enablePetrification,
                enableDeadPixels: this.enableDeadPixels,
                showPoints: this.showPoints,
                showPersonalBests: this.showPersonalBests,
                showSpeedTimer: this.showSpeedTimer
            });
            
            // Apply non-difficulty-specific settings
            this.showPlacementPoints = baseSettings.showPlacementPoints || false;
            this.speedDisplayMode = baseSettings.speedDisplayMode || 'timer';
            this.particlesEnabled = baseSettings.particlesEnabled !== false;
            
            // Load speed mode setting (3-way: 'bonus', 'punishment', or 'ignored')
            const speedMode = baseSettings.speedMode || 'ignored';
            this.scoringSystem.setSpeedMode(speedMode);
            
            // Load piece timeout setting
            this.pieceTimeoutEnabled = baseSettings.pieceTimeoutEnabled || false;
            
            this.hapticEnabled = baseSettings.hapticEnabled !== false;
            this.enablePrizeRecognition = baseSettings.enablePrizeRecognition !== false; // Default to true
            this.successModeEnabled = baseSettings.successModeEnabled !== false; // Default to true
            
            // Apply petrification setting
            if (this.petrificationManager) {
                this.petrificationManager.setEnabled(this.enablePetrification);
            }
            
            // Enhanced animation settings
            this.blockHoverEffects = baseSettings.blockHoverEffects !== false;
            this.blockSelectionGlow = baseSettings.blockSelectionGlow !== false;
            this.blockEntranceAnimations = baseSettings.blockEntranceAnimations !== false;
            this.particleEffects = baseSettings.particleEffects !== false;
            this.animationSpeed = baseSettings.animationSpeed || 'normal';
            
            // Store all settings for easy access by components
            this.settings = baseSettings;
            
            // Check for pending difficulty changes from settings page
            const pendingDifficulty = localStorage.getItem('blockdoku_pending_difficulty');
            if (pendingDifficulty) {
                this.difficulty = pendingDifficulty;
                localStorage.removeItem('blockdoku_pending_difficulty');
            }
            
            // Apply loaded theme (verifyThemeLoaded is now called automatically within applyTheme)
            this.applyTheme(this.currentTheme);
            
            // Apply piece timeout setting to BlockPalette
            if (this.blockPalette && this.blockPalette.setPieceTimeoutEnabled) {
                this.blockPalette.setPieceTimeoutEnabled(this.pieceTimeoutEnabled);
            }
            
            // Ensure theme is applied after DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.applyTheme(this.currentTheme);
                });
            }
            
            // Apply loaded difficulty to difficulty manager
            if (this.difficultyManager) {
                this.difficultyManager.setDifficulty(this.difficulty);
            }
            
            // Apply effects settings
            this.applyEffectsSettings();
            
            // Apply dead pixels settings
            if (this.deadPixelsManager) {
                const wasEnabled = this.deadPixelsManager.isEnabled();
                const prevIntensity = this.deadPixelsManager.getIntensity();
                
                this.deadPixelsManager.setEnabled(this.enableDeadPixels);
                this.deadPixelsManager.setIntensity(this.deadPixelsIntensity);
                
                // If dead pixels was just enabled or intensity changed, regenerate for current game
                // But only if we're not loading a saved game (which would have its own dead pixels state)
                const intensityChanged = this.deadPixelsIntensity !== prevIntensity;
                if (this.enableDeadPixels && (!wasEnabled || intensityChanged)) {
                    // Only regenerate if we don't have a saved state with dead pixels
                    const hasCurrentDeadPixels = this.deadPixelsManager.getDeadPixels().length > 0;
                    if (!hasCurrentDeadPixels || intensityChanged) {
                        this.deadPixelsManager.generateDeadPixels(this.boardSize);
                    }
                }
                // If disabled, clear dead pixels
                if (!this.enableDeadPixels && wasEnabled) {
                    this.deadPixelsManager.clearDeadPixels();
                }
            }
            
            this.updateBlockPointsDisplay();
        }
    }

    saveSettings() {
        const settings = {
            theme: this.currentTheme,
            soundEnabled: this.soundEnabled,
            animationsEnabled: this.animationsEnabled,
            difficulty: this.difficulty,
            autoSave: this.autoSave,
            enableHints: this.enableHints,
            enableTimer: this.enableTimer,
            showPoints: this.showPoints,
            showPlacementPoints: this.showPlacementPoints,
            particlesEnabled: this.particlesEnabled,
            hapticEnabled: this.hapticEnabled
        };
        if (this.storage) {
            this.storage.saveSettings(settings);
        }
    }
    
    updateBlockPointsDisplay() {
        const showPoints = this.showPoints || false;
        const blockInfos = document.querySelectorAll('.block-info');
        
        blockInfos.forEach(info => {
            if (showPoints) {
                info.classList.add('show-points');
            } else {
                info.classList.remove('show-points');
            }
        });
    }
    
    applyEffectsSettings() {
        if (this.effectsManager) {
            this.effectsManager.updateSettings({
                particles: this.particlesEnabled !== false,
                sound: this.soundEnabled === true,
                haptic: this.hapticEnabled !== false
            });
        }
    }

    applyTheme(theme) {
        console.log('App.js applying theme:', theme);
        this.currentTheme = theme;
        
        // Handle Vite-injected theme links
        try {
            const builtWoodLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
                .filter(l => (l.getAttribute('href') || '').includes('/assets/wood-') || (l.href || '').includes('/assets/wood-'));
            const builtLightLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
                .filter(l => (l.getAttribute('href') || '').includes('/assets/light-') || (l.href || '').includes('/assets/light-'));
            const builtDarkLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
                .filter(l => (l.getAttribute('href') || '').includes('/assets/dark-') || (l.href || '').includes('/assets/dark-'));
            
            // Disable all built theme links first
            [...builtWoodLinks, ...builtLightLinks, ...builtDarkLinks].forEach(l => {
                l.disabled = true;
            });
            
            // Enable the correct built theme link and wait for it to load
            let activeLink = null;
            if (theme === 'wood' && builtWoodLinks.length > 0) {
                activeLink = builtWoodLinks[0];
                activeLink.disabled = false;
                console.log('App.js enabled built wood theme');
            } else if (theme === 'light' && builtLightLinks.length > 0) {
                activeLink = builtLightLinks[0];
                activeLink.disabled = false;
                console.log('App.js enabled built light theme');
            } else if (theme === 'dark' && builtDarkLinks.length > 0) {
                activeLink = builtDarkLinks[0];
                activeLink.disabled = false;
                console.log('App.js enabled built dark theme');
            }
            
            // Wait for stylesheet to load before verifying theme
            if (activeLink) {
                // Use requestAnimationFrame to ensure the stylesheet is applied
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        this.verifyThemeLoaded();
                    });
                });
            }
        } catch (e) {
            console.log('Error managing built theme links:', e);
        }
        
        // Manage preloaded theme links
        const preloadedThemes = ['light', 'dark', 'wood'];
        preloadedThemes.forEach(themeName => {
            const link = document.getElementById(`theme-css-${themeName}`);
            if (link) {
                link.disabled = themeName !== theme;
            }
        });
        
        // Set the main theme-css link as fallback
        let themeLink = document.getElementById('theme-css');
        if (!themeLink) {
            // Create a resilient theme link if missing (e.g., after build transforms)
            themeLink = document.createElement('link');
            themeLink.rel = 'stylesheet';
            themeLink.id = 'theme-css';
            document.head.appendChild(themeLink);
        }
        themeLink.href = `css/themes/${theme}.css`;
        
        // Set data-theme attribute for CSS selectors
        document.documentElement.setAttribute('data-theme', theme);
        
        // Add theme class to body
        document.body.className = document.body.className.replace(/light-theme|dark-theme|wood-theme/g, '');
        document.body.classList.add(`${theme}-theme`);
        
        // Clear any pending clearing effects when switching themes
        // Only clear if we're not in the middle of a critical clearing operation
        if (this.pendingClears) {
            console.log('Clearing pending clears due to theme switch');
            this.pendingClears = null;
            this.pendingClearsTimestamp = null;
        }
        
        // Redraw the board with new theme colors after a small delay to ensure CSS is loaded
        setTimeout(() => {
            this.draw();
        }, 50);
        
        this.saveSettings();
    }

    // High Score Management
    checkHighScore() {
        const stats = this.getStats();
        
        // Always save statistics for every game
        this.storage.saveStatistics(stats);
        
        // Only save high score if it qualifies
        if (this.storage.isHighScore(stats.score)) {
            this.storage.saveHighScore(stats);
            return true;
        }
        return false;
    }

    getHighScores() {
        return this.storage.getHighScores();
    }

    getStatistics() {
        return this.storage.loadStatistics();
    }


    gameOver() {
        // Prevent multiple game over calls
        if (this.isGameOver) return;
        this.isGameOver = true;
        
        // Stop speed timer countdown
        this.stopSpeedTimerCountdown();
        
        console.log('Game Over! Final Score:', this.score);
        
        // Pause piece timeout checking (so the visual state remains)
        if (this.blockPalette && this.blockPalette.pauseTimeoutChecking) {
            this.blockPalette.pauseTimeoutChecking();
        }
        
        // Reset palette drag state to clean up any ongoing drag operation
        if (this.blockPalette && this.blockPalette.resetDragState) {
            this.blockPalette.resetDragState();
        }
        
        // Stop the game loop
        this.stopGameLoop();
        
		// Save high score and statistics
		const stats = this.getStats();
		this.checkHighScore();
		// Proactively refresh any visible high scores UI
		this.loadHighScores();
		
		// Refresh statistics display if settings modal is open
		if (this.settingsManager && this.settingsManager.refreshStatistics) {
			this.settingsManager.refreshStatistics();
		}
        
        // Show game over modal or notification
        this.showGameOverModal(stats);
        
        // Save final game state
        this.saveGameState();
        // Clear autosave so a dead board is not restored on reload
        if (this.storage && this.storage.clearGameState) {
            this.storage.clearGameState();
        }
    }

    stopGameLoop() {
        this.gameRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    // Prize system based on score ranges
    getPrizeForScore(score) {
        const prizes = [
            { minScore: 0, maxScore: 999, emoji: '🎯', name: 'First Steps', message: 'Every journey begins with a single step!' },
            { minScore: 1000, maxScore: 2499, emoji: '🌟', name: 'Rising Star', message: 'You\'re getting the hang of it!' },
            { minScore: 2500, maxScore: 4999, emoji: '🔥', name: 'Hot Streak', message: 'You\'re on fire! Keep it up!' },
            { minScore: 5000, maxScore: 9999, emoji: '💎', name: 'Diamond Player', message: 'Shining bright like a diamond!' },
            { minScore: 10000, maxScore: 19999, emoji: '🏆', name: 'Champion', message: 'You\'re a true champion!' },
            { minScore: 20000, maxScore: 49999, emoji: '👑', name: 'Royal Master', message: 'Fit for a king or queen!' },
            { minScore: 50000, maxScore: 99999, emoji: '🚀', name: 'Rocket Master', message: 'You\'re reaching for the stars!' },
            { minScore: 100000, maxScore: 199999, emoji: '⭐', name: 'Superstar', message: 'You\'re absolutely stellar!' },
            { minScore: 200000, maxScore: 499999, emoji: '🎪', name: 'Carnival Legend', message: 'The carnival has a new legend!' },
            { minScore: 500000, maxScore: 999999, emoji: '🎭', name: 'Master Performer', message: 'A performance worthy of the grandest stage!' },
            { minScore: 1000000, maxScore: Infinity, emoji: '🏅', name: 'Ultimate Grandmaster', message: 'You\'ve achieved the impossible!' }
        ];
        
        for (const prize of prizes) {
            if (score >= prize.minScore && score <= prize.maxScore) {
                return prize;
            }
        }
        
        // Fallback (should never reach here)
        return prizes[0];
    }

    // Get next prize tier information for progress display
    getNextPrizeInfo(currentScore) {
        const prizes = [
            { minScore: 0, maxScore: 999, emoji: '🎯', name: 'First Steps' },
            { minScore: 1000, maxScore: 2499, emoji: '🌟', name: 'Rising Star' },
            { minScore: 2500, maxScore: 4999, emoji: '🔥', name: 'Hot Streak' },
            { minScore: 5000, maxScore: 9999, emoji: '💎', name: 'Diamond Player' },
            { minScore: 10000, maxScore: 19999, emoji: '🏆', name: 'Champion' },
            { minScore: 20000, maxScore: 49999, emoji: '👑', name: 'Royal Master' },
            { minScore: 50000, maxScore: 99999, emoji: '🚀', name: 'Rocket Master' },
            { minScore: 100000, maxScore: 199999, emoji: '⭐', name: 'Superstar' },
            { minScore: 200000, maxScore: 499999, emoji: '🎪', name: 'Carnival Legend' },
            { minScore: 500000, maxScore: 999999, emoji: '🎭', name: 'Master Performer' },
            { minScore: 1000000, maxScore: Infinity, emoji: '🏅', name: 'Ultimate Grandmaster' }
        ];
        
        for (let i = 0; i < prizes.length; i++) {
            if (currentScore < prizes[i].minScore) {
                return {
                    nextPrize: prizes[i],
                    progress: Math.min(100, ((currentScore / prizes[i].minScore) * 100).toFixed(1)),
                    pointsNeeded: prizes[i].minScore - currentScore
                };
            }
        }
        
        // If they've reached the highest tier
        return null;
    }

    showGameOverModal(stats) {
        // Save game stats to localStorage for lastgame.html page
        const isHighScore = this.storage.isHighScore(stats.score);
        
        // Get prize for this score (only if prize recognition is enabled)
        const prizeRecognitionEnabled = this.enablePrizeRecognition !== false;
        const prize = prizeRecognitionEnabled ? this.getPrizeForScore(stats.score) : null;
        const nextPrizeInfo = prizeRecognitionEnabled ? this.getNextPrizeInfo(stats.score) : null;
        
        // Build detailed stats and breakdown
        const lastGameData = {
            score: stats.score,
            level: stats.level,
            linesCleared: stats.linesCleared,
            maxCombo: stats.maxCombo,
            totalCombos: stats.totalCombos || 0,
            maxStreakCount: stats.maxStreakCount || 0,
            difficulty: stats.difficulty || this.difficulty,
            difficultyMultiplier: stats.difficultyMultiplier || (this.difficultyManager?.getScoreMultiplier?.() || 1),
            isHighScore: isHighScore,
            breakdown: stats.breakdown || { linePoints: 0, squarePoints: 0, comboBonusPoints: 0, placementPoints: 0, streakBonusPoints: 0 },
            rowClears: stats.rowClears || 0,
            columnClears: stats.columnClears || 0,
            squareClears: stats.squareClears || 0,
            petrificationStats: stats.petrificationStats,
            enablePetrification: this.enablePetrification,
            speedStats: this.scoringSystem.getSpeedStats ? this.scoringSystem.getSpeedStats() : null,
            speedMode: this.scoringSystem.speedConfig ? this.scoringSystem.speedConfig.mode : 'ignored',
            // Countdown timer information
            countdownEnabled: this.storage.loadSettings().enableTimer || false,
            countdownDuration: this.storage.loadSettings().countdownDuration || 3,
            timeRemaining: this.timerSystem ? this.timerSystem.getTimeRemaining() : null,
            timeLimit: this.difficultyManager ? this.difficultyManager.getTimeLimit() : null,
            // Efficiency metrics
            piecesPlaced: this.gameEngine ? this.gameEngine.moveCount : 0,
            pointsPerPiece: this.gameEngine && this.gameEngine.moveCount > 0 ? (stats.score / this.gameEngine.moveCount) : 0,
            prizeRecognitionEnabled: prizeRecognitionEnabled,
            prize: prize,
            nextPrize: nextPrizeInfo?.nextPrize || null,
            nextPrizeProgress: nextPrizeInfo?.progress || 0,
            nextPrizePointsNeeded: nextPrizeInfo?.pointsNeeded || 0,
            timestamp: Date.now()
        };
        
        // Save to localStorage
        try {
            localStorage.setItem('blockdoku_lastgame', JSON.stringify(lastGameData));
        } catch (error) {
            console.error('Failed to save last game data:', error);
        }
        
        // Navigate to lastgame.html page
        window.location.href = 'lastgame.html';
    }

    getStats() {
		const s = this.scoringSystem.getStats();
		const difficultyMultiplier = this.difficultyManager?.getScoreMultiplier?.() || 1;
		const petrificationStats = this.petrificationManager ? this.petrificationManager.getStats() : null;
		
		return {
			score: this.score,
			level: this.level,
			linesCleared: s.linesCleared,
			combo: s.combo,
			maxCombo: s.maxCombo,
			totalCombos: s.totalCombos,
			maxStreakCount: s.maxStreakCount,
			rowClears: s.rowClears,
			columnClears: s.columnClears,
			squareClears: s.squareClears,
			comboActivations: s.comboActivations,
			comboModesUsed: Array.from(this.comboModesUsed || []),
			breakdown: s.breakdownBase,
			difficulty: this.difficulty,
			difficultyMultiplier,
			petrificationStats: petrificationStats
		};
    }

    // High Scores Display
    showHighScores() {
        const modal = document.getElementById('high-scores-modal');
        const scoresList = document.getElementById('high-scores-list');
        const statsDisplay = document.getElementById('statistics-display');
        
        // Display high scores
        const scores = this.getHighScores();
        if (scores.length === 0) {
            scoresList.innerHTML = '<p>No high scores yet. Play a game to set your first record!</p>';
        } else {
            scoresList.innerHTML = scores.map((score, index) => `
                <div class="score-item">
                    <span class="rank">#${index + 1}</span>
                    <span class="score-value">${score.score.toLocaleString()}</span>
                    <span class="score-details">${(score.difficulty||'normal').toUpperCase()} • Level ${score.level} • ${score.linesCleared} lines • ${score.date}</span>
                </div>
            `).join('');
        }
        
        // Display statistics
        const stats = this.getStatistics();
        statsDisplay.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Games Played:</span>
                <span class="stat-value">${stats.gamesPlayed}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Score:</span>
                <span class="stat-value">${stats.totalScore.toLocaleString()}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Best Score:</span>
                <span class="stat-value">${stats.bestScore.toLocaleString()}</span>
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
        
        modal.style.display = 'block';
    }

    hideHighScores() {
        const modal = document.getElementById('high-scores-modal');
        modal.style.display = 'none';
    }

    loadHighScores() {
        const scoresList = document.getElementById('high-scores-list');
        const statsDisplay = document.getElementById('statistics-display');
        
        if (!scoresList || !statsDisplay) return;
        
        // Display high scores
        const scores = this.getHighScores();
        if (scores.length === 0) {
            scoresList.innerHTML = '<p>No high scores yet. Play a game to set your first record!</p>';
        } else {
            scoresList.innerHTML = scores.map((score, index) => `
                <div class="score-item">
                    <span class="rank">#${index + 1}</span>
                    <span class="score-value">${score.score.toLocaleString()}</span>
                    <span class="score-details">Level ${score.level} • ${score.linesCleared} lines • Max Streak: ${score.maxCombo || 0} • Total Combos: ${score.totalCombos || 0} • ${score.date}</span>
                </div>
            `).join('');
        }
        
        // Display statistics
        const stats = this.getStatistics();
		statsDisplay.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Games Played:</span>
                <span class="stat-value">${stats.gamesPlayed}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Score:</span>
                <span class="stat-value">${stats.totalScore.toLocaleString()}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Best Score:</span>
                <span class="stat-value">${stats.bestScore.toLocaleString()}</span>
            </div>
            <div class="stat-item">
				<span class="stat-label">Total Lines:</span>
				<span class="stat-value">${stats.totalLinesCleared}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Max Streak:</span>
                <span class="stat-value">${stats.maxCombo}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Combos:</span>
                <span class="stat-value">${stats.totalCombos || 0}</span>
            </div>
        `;
    }


    // Difficulty Management
    showDifficultyModal() {
        const modal = document.getElementById('difficulty-modal');
        
        // Update UI to reflect current settings
        this.updateDifficultyUI();
        
        modal.style.display = 'block';
    }

    hideDifficultyModal() {
        const modal = document.getElementById('difficulty-modal');
        modal.style.display = 'none';
    }

    // Settings Modal Management
    showSettingsModal() {
        console.log('showSettingsModal called');
        const modal = document.getElementById('settings-modal');
        
        if (!modal) {
            console.error('Settings modal not found!');
            return;
        }
        
        console.log('Settings modal found, showing...');
        
        // Ensure install button is created and shown
        if (this.pwaInstallManager) {
            this.pwaInstallManager.createInstallButton();
            this.pwaInstallManager.showInstallButton();
        } else {
            console.log('PWA Install Manager not available');
        }
        
        // Update UI to reflect current settings
        this.updateThemeUI();
        this.updateDifficultyUI();
        
        // Load high scores if needed
        this.loadHighScores();
        
        // Refresh statistics display to ensure latest data is shown
        if (this.settingsManager && this.settingsManager.refreshStatistics) {
            this.settingsManager.refreshStatistics();
        }
        
        modal.style.display = 'block';
        console.log('Settings modal should now be visible');
    }

    hideSettingsModal() {
        const modal = document.getElementById('settings-modal');
        modal.style.display = 'none';
    }

    updateDifficultyUI() {
        // Update selected difficulty
        document.querySelectorAll('.difficulty-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.difficulty === this.difficulty) {
                option.classList.add('selected');
            }
        });

        // Update additional settings
        document.getElementById('enable-hints').checked = this.enableHints;
        document.getElementById('enable-timer').checked = this.enableTimer;
    }

    async selectDifficulty(difficulty) {
        console.log(`🎮 App.js: selectDifficulty called with difficulty: ${difficulty}`);
        console.log(`🎮 App.js: current difficulty before change: ${this.difficulty}`);
        
        this.difficulty = difficulty;
        console.log(`🎮 App.js: difficulty set to: ${this.difficulty}`);
        
        // Update difficulty manager
        if (this.difficultyManager) {
            const success = this.difficultyManager.setDifficulty(difficulty);
            console.log(`🎮 App.js: difficultyManager.setDifficulty(${difficulty}) returned: ${success}`);
        }
        
        // Save the difficulty change FIRST before reloading settings
        console.log(`🎮 App.js: calling saveSettings()...`);
        this.saveSettings();
        
        // Reload settings to apply difficulty-specific defaults
        console.log(`🎮 App.js: calling loadSettings()...`);
        this.loadSettings();
        
        console.log(`🎮 App.js: calling updateDifficultyUI()...`);
        this.updateDifficultyUI();
        
        console.log(`🎮 App.js: calling updateDifficultyButton()...`);
        this.updateDifficultyButton();
        
        console.log(`🎮 App.js: calling updateHintControls()...`);
        this.updateHintControls();
        
        console.log(`🎮 App.js: calling renderPersonalBests()...`);
        this.renderPersonalBests();
        
        console.log(`🎮 App.js: selectDifficulty completed. Final difficulty: ${this.difficulty}`);
        
        // No game reset needed - difficulty settings apply to current game
    }

    selectTheme(theme) {
        // Save current game state before switching themes
        if (this.gameRunning) {
            this.saveGameState();
        }
        
        // Clear any active placeability indicators before theme switch
        if (this.blockPalette && this.blockPalette.clearPlaceability) {
            this.blockPalette.clearPlaceability();
        }
        
        this.currentTheme = theme;
        this.applyTheme(theme);
        this.updateThemeUI();
        this.saveSettings();
        
        // Redraw the board with new theme colors
        if (this.gameRunning) {
            this.drawBoard();
            
            // Wait for CSS variables to be available before updating placeability indicators
            setTimeout(() => {
                this.updatePlaceabilityIndicators();
            }, 100);
        }
    }

    updateThemeUI() {
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.theme === this.currentTheme) {
                option.classList.add('selected');
            }
        });
    }

    toggleSetting(setting, value) {
        switch (setting) {
            case 'hints':
                this.enableHints = value;
                break;
            case 'timer':
                this.enableTimer = value;
                break;
        }
        this.saveSettings();
    }

    applyDifficultySettings() {
        // Apply difficulty-specific settings (but preserve user's hints setting)
        switch (this.difficulty) {
            case 'easy':
                // Don't override enableHints - let user setting take precedence
                this.enableTimer = false;
                this.moveLimit = null;
                this.timeLimit = null;
                break;
            case 'normal':
                // Don't override enableHints - let user setting take precedence
                this.enableTimer = false;
                this.moveLimit = null;
                this.timeLimit = null;
                break;
            case 'hard':
                // Don't override enableHints - let user setting take precedence
                this.enableTimer = false;
                this.moveLimit = 50; // Limited moves
                this.timeLimit = null;
                break;
            case 'expert':
                // Don't override enableHints - let user setting take precedence
                this.enableTimer = true;
                this.moveLimit = 30; // Very limited moves
                this.timeLimit = 300; // 5 minutes
                break;
        }
    }

    // Enhanced block generation based on difficulty
    generateNewBlocks() {
        let blockCount = 3;
        let blockTypes = 'all';
        
        // Get current difficulty from difficulty manager (source of truth)
        const currentDifficulty = this.difficultyManager.getCurrentDifficulty();
        
        // Adjust block generation based on difficulty
        switch (currentDifficulty) {
            case 'easy':
                blockCount = 3;
                blockTypes = 'large'; // Prefer larger, simpler blocks
                break;
            case 'normal':
                blockCount = 3;
                blockTypes = 'all';
                break;
            case 'hard':
                blockCount = 3;
                blockTypes = 'small'; // Prefer smaller, more complex blocks
                break;
            case 'expert':
                blockCount = 3;
                blockTypes = 'complex'; // Complex irregular shapes
                break;
        }
        
        
        const newBlocks = this.blockManager.generateRandomBlocks(blockCount, blockTypes, this.difficultyManager, this.enableMagicBlocks, this.enableWildShapes);
        console.log('Generated new blocks:', newBlocks);
        console.log('BlockPalette exists:', !!this.blockPalette);
        this.blockPalette.updateBlocks(newBlocks);
        
        // Update petrification tracking for new blocks
        this.petrificationManager.updateBlockTracking(newBlocks);
        
        // Update placeability indicators for new blocks
        this.updatePlaceabilityIndicators();
        this.updateBlockPointsDisplay();
        this.autoSelectNextBlock();
        
        // Auto-rotate blocks to optimal orientations
        this.optimizeBlockOrientations();
    }

    // Enhanced block placement with hints
    placeBlock(row, col) {
        if (!this.canPlaceBlock(row, col)) return;
        
        // Store reference to the block before placement for magic block logic
        const placedBlock = this.selectedBlock;
        const isMagicBlock = placedBlock && placedBlock.isWild;
        
        // Place the block on the board
        this.board = this.blockManager.placeBlock(this.selectedBlock, row, col, this.board);
        
        // Update petrification tracking for newly placed cells
        this.petrificationManager.updateBoardTracking(this.board);
        
        // Handle magic block special effects
        if (isMagicBlock) {
            this.handleMagicBlockPlacement(placedBlock, row, col);
        }
        
        // Award 1 point for block placement (as documented in scoring.md)
        this.scoringSystem.addPlacementPoints(this.scoringSystem.basePoints.single, this.difficultyManager.getScoreMultiplier());
        
        // Record placement time for speed bonus calculation
        const previousSpeedBonus = this.scoringSystem.totalSpeedBonus;
        this.scoringSystem.recordPlacementTime();
        const speedBonusGained = this.scoringSystem.totalSpeedBonus - previousSpeedBonus;
        
        // Start speed timer countdown for next placement
        this.startSpeedTimerCountdown();
        
        // Sync app score with scoring system score after all calculations
        this.score = this.scoringSystem.getScore();
        
        // Show placement points feedback if enabled
        this.showPlacementPointsFeedback(this.scoringSystem.basePoints.single, row, col);
        
        // Show speed timer feedback if earned
        if (speedBonusGained > 0) {
            this.showSpeedTimerFeedback(speedBonusGained, row, col);
        }
        
        // Add placement effects
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.effectsManager.onBlockPlace(centerX, centerY);
        
        // Reset timeout for the placed block before removing it
        this.blockPalette.resetPieceTimeout(this.selectedBlock.id);
        
        // Reset palette drag state before removing the block
        // This prevents the palette from trying to interact with a removed block
        if (this.blockPalette.resetDragState) {
            this.blockPalette.resetDragState();
        }
        
        // Remove the used block and untrack it from petrification
        this.petrificationManager.untrackBlock(this.selectedBlock.id);
        this.blockManager.removeBlock(this.selectedBlock.id);
        this.selectedBlock = null;
        this.previewPosition = null;
        
        // Update UI to reflect the placement points
        this.blockPalette.updateBlocks(this.blockManager.currentBlocks);
        this.drawBoard();
        this.updateUI(); // Update score display after placement points
        
        // Update placeability indicators immediately after block placement
        this.updatePlaceabilityIndicators();
        
        // Check for line clears
        this.checkLineClears();
        
        // Auto-save game state
        if (this.autoSave) {
            this.saveGameState();
        }
        
        // Generate new blocks if needed
        if (this.blockManager.currentBlocks.length === 0) {
            this.generateNewBlocks();
        }
        
        // Check for game over (only if game is running)
        if (!this.isGameOver) {
            this.checkGameOver();
        }
        
        // Auto-select the first available block
        this.autoSelectNextBlock();
        
        // Auto-rotate remaining blocks to optimal orientations
        this.optimizeBlockOrientations();
    }
    
    // Auto-rotate blocks to optimal orientations based on board state
    optimizeBlockOrientations() {
        if (!this.storage.loadSettings().autoRotateBlocks) return;
        
        console.log('🔄 Optimizing block orientations based on board state');
        
        this.blockManager.currentBlocks.forEach((block, index) => {
            const optimalBlock = this.findOptimalOrientation(block);
            if (optimalBlock && optimalBlock.rotation !== block.rotation) {
                console.log(`🔄 Auto-rotating ${block.name} from ${block.rotation}° to ${optimalBlock.rotation}° (${optimalBlock.validPositions} valid positions)`);
                this.blockManager.currentBlocks[index] = optimalBlock;
            }
        });
        
        // Update the palette to show optimized orientations
        this.blockPalette.updateBlocks(this.blockManager.currentBlocks);
    }
    
    // Find the optimal orientation for a block based on valid placement positions
    findOptimalOrientation(block) {
        let bestBlock = block;
        let maxValidPositions = this.countValidPositions(block);
        
        // Try all 4 orientations (0°, 90°, 180°, 270°)
        let currentBlock = { ...block };
        for (let i = 0; i < 3; i++) {
            currentBlock = this.blockManager.rotateBlock(currentBlock);
            const validPositions = this.countValidPositions(currentBlock);
            
            if (validPositions > maxValidPositions) {
                maxValidPositions = validPositions;
                bestBlock = { ...currentBlock };
            }
        }
        
        return { ...bestBlock, validPositions: maxValidPositions };
    }
    
    // Count how many valid positions exist for a block on the current board
    countValidPositions(block) {
        let count = 0;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.blockManager.canPlaceBlock(block, row, col, this.board)) {
                    count++;
                }
            }
        }
        return count;
    }
    
    // Handle magic block special effects
    handleMagicBlockPlacement(magicBlock, row, col) {
        console.log('🔮 Magic block placed!', magicBlock);
        
        // Show immediate magic block activation feedback
        this.showMagicBlockActivationFeedback(row, col, magicBlock);
        
        // Handle different magic types
        switch (magicBlock.wildType) {
            case 'lineClear':
                this.handleLineClearMagic(magicBlock, row, col);
                break;
            case 'bomb':
                this.handleBombMagic(magicBlock, row, col);
                break;
            case 'lightning':
                this.handleLightningMagic(magicBlock, row, col);
                break;
            case 'ghost':
                this.handleGhostMagic(magicBlock, row, col);
                break;
            default:
                console.warn('Unknown magic type:', magicBlock.wildType);
                this.handleLineClearMagic(magicBlock, row, col); // Fallback
        }
    }
    
    // Handle line-clear magic (original behavior)
    handleLineClearMagic(magicBlock, row, col) {
        // Find all lines that the magic block is part of
        const magicLines = this.findLinesContainingMagicBlock(magicBlock, row, col);
        
        if (magicLines.rows.length > 0 || magicLines.columns.length > 0 || magicLines.squares.length > 0) {
            console.log('🔮 Line-clear magic triggered:', magicLines);
            
            // Show detailed explanation of what the magic block cleared
            this.showMagicBlockClearExplanation(magicLines, row, col);
            
            // Show special magic block effect
            this.showMagicBlockEffect(row, col);
            
            // Force clear the lines that contain the magic block
            setTimeout(() => {
                this.forceMagicBlockClears(magicLines);
            }, 1000); // Longer delay to show explanation
        } else {
            // Magic block placed but no lines to clear yet
            this.showMagicBlockStandbyMessage(row, col);
        }
    }
    
    // Handle bomb magic - clear 3x3 area around each cell
    handleBombMagic(magicBlock, row, col) {
        console.log('💣 Bomb magic triggered!', magicBlock);
        
        // Calculate all cells to clear (3x3 around each block cell)
        const cellsToClear = new Set();
        
        // For each cell in the placed block
        for (let r = 0; r < magicBlock.shape.length; r++) {
            for (let c = 0; c < magicBlock.shape[r].length; c++) {
                if (magicBlock.shape[r][c] === 1) {
                    const blockRow = row + r;
                    const blockCol = col + c;
                    
                    // Add 3x3 area around this cell
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const clearRow = blockRow + dr;
                            const clearCol = blockCol + dc;
                            
                            if (clearRow >= 0 && clearRow < this.boardSize && 
                                clearCol >= 0 && clearCol < this.boardSize) {
                                cellsToClear.add(`${clearRow},${clearCol}`);
                            }
                        }
                    }
                }
            }
        }
        
        // Show bomb explosion effect
        this.showBombExplosionEffect(row, col, cellsToClear.size);
        
        // Clear the cells after explosion animation
        setTimeout(() => {
            this.clearBombCells(cellsToClear);
        }, 1200);
    }
    
    // Handle lightning magic - clear entire row and column
    handleLightningMagic(magicBlock, row, col) {
        console.log('⚡ Lightning magic triggered!', magicBlock);
        
        const lightningLines = { rows: [], columns: [], squares: [] };
        
        // For each cell in the placed block, clear its row and column
        for (let r = 0; r < magicBlock.shape.length; r++) {
            for (let c = 0; c < magicBlock.shape[r].length; c++) {
                if (magicBlock.shape[r][c] === 1) {
                    const blockRow = row + r;
                    const blockCol = col + c;
                    
                    if (!lightningLines.rows.includes(blockRow)) {
                        lightningLines.rows.push(blockRow);
                    }
                    if (!lightningLines.columns.includes(blockCol)) {
                        lightningLines.columns.push(blockCol);
                    }
                }
            }
        }
        
        // Show lightning effect
        this.showLightningEffect(row, col, lightningLines);
        
        // Clear the lines after lightning animation
        setTimeout(() => {
            this.forceMagicBlockClears(lightningLines);
        }, 1000);
    }
    
    // Handle ghost magic - special placement rules
    handleGhostMagic(magicBlock, row, col) {
        console.log('👻 Ghost magic triggered!', magicBlock);
        
        // Ghost blocks have already been placed (they can overlap)
        // Just show the ghost effect
        this.showGhostEffect(row, col);
        
        // Check if any lines were completed after ghost placement
        const completedLines = this.scoringSystem.checkForCompletedLines(this.board);
        
        if (completedLines.rows.length > 0 || completedLines.columns.length > 0 || completedLines.squares.length > 0) {
            setTimeout(() => {
                this.forceMagicBlockClears(completedLines);
            }, 800);
        } else {
            this.showMagicBlockStandbyMessage(row, col);
        }
    }
    
    // Find all lines (rows, columns, squares) that contain the magic block
    findLinesContainingMagicBlock(magicBlock, startRow, startCol) {
        const lines = { rows: [], columns: [], squares: [] };
        
        // Check each cell of the placed magic block
        for (let r = 0; r < magicBlock.shape.length; r++) {
            for (let c = 0; c < magicBlock.shape[r].length; c++) {
                if (magicBlock.shape[r][c] === 1) {
                    const boardRow = startRow + r;
                    const boardCol = startCol + c;
                    
                    // Check if this cell completes a row
                    if (this.board[boardRow].every(cell => cell === 1)) {
                        if (!lines.rows.includes(boardRow)) {
                            lines.rows.push(boardRow);
                        }
                    }
                    
                    // Check if this cell completes a column
                    if (this.board.every(row => row[boardCol] === 1)) {
                        if (!lines.columns.includes(boardCol)) {
                            lines.columns.push(boardCol);
                        }
                    }
                    
                    // Check if this cell completes a 3x3 square
                    const squareRow = Math.floor(boardRow / 3);
                    const squareCol = Math.floor(boardCol / 3);
                    if (this.isSquareComplete(squareRow, squareCol)) {
                        const squareKey = `${squareRow}-${squareCol}`;
                        if (!lines.squares.some(sq => `${sq.row}-${sq.col}` === squareKey)) {
                            lines.squares.push({ row: squareRow, col: squareCol });
                        }
                    }
                }
            }
        }
        
        return lines;
    }
    
    // Check if a 3x3 square is complete
    isSquareComplete(squareRow, squareCol) {
        const startRow = squareRow * 3;
        const startCol = squareCol * 3;
        
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if (this.board[r][c] !== 1) {
                    return false;
                }
            }
        }
        return true;
    }
    
    // Show special visual effect for magic block activation
    showMagicBlockEffect(row, col) {
        const cellSize = this.cellSize;
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;
        
        // Create wild effect element
        const magicEffect = document.createElement('div');
        magicEffect.textContent = '🔮 MAGIC! 🔮';
        magicEffect.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            transform: translate(-50%, -50%);
            color: #ff4444;
            font-size: 1.5rem;
            font-weight: bold;
            text-shadow: 0 0 10px rgba(255, 68, 68, 0.8);
            pointer-events: none;
            z-index: 1000;
            animation: magicBlockActivation 1s ease-out forwards;
        `;
        
        // Add CSS animation for magic effect
        if (!document.querySelector('#magic-effect-styles')) {
            const style = document.createElement('style');
            style.id = 'magic-effect-styles';
            style.textContent = `
                @keyframes magicBlockActivation {
                    0% { 
                        transform: translate(-50%, -50%) scale(0.5);
                        opacity: 0;
                    }
                    50% { 
                        transform: translate(-50%, -50%) scale(1.2);
                        opacity: 1;
                    }
                    100% { 
                        transform: translate(-50%, -50%) scale(1) translateY(-20px);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        this.canvas.parentElement.appendChild(magicEffect);
        
        // Remove effect after animation
        setTimeout(() => {
            if (magicEffect.parentElement) {
                magicEffect.parentElement.removeChild(magicEffect);
            }
        }, 1000);
    }
    
    // Force clear lines triggered by magic block
    forceMagicBlockClears(magicLines) {
        // Use the existing line clearing system but mark as magic-triggered
        this.pendingClears = magicLines;
        this.pendingClearsTimestamp = Date.now();
        
        // Calculate and apply score for magic block clears
        const scoreResult = this.scoringSystem.calculateScoreForClears(magicLines, this.difficultyManager.getScoreMultiplier());
        this.scoringSystem.addScore(scoreResult.totalScore);
        this.score = this.scoringSystem.getScore();
        
        // Show the clearing animation
        this.highlightClearingBlocks(magicLines);
        
        // Complete the clear after animation
        setTimeout(() => {
            this.completeLineClear(wildLines);
        }, 800);
    }
    
    // Show immediate feedback when magic block is activated
    showMagicBlockActivationFeedback(row, col, magicBlock) {
        const cellSize = this.cellSize;
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;
        
        // Create magic activation message
        const magicMessage = document.createElement('div');
        magicMessage.className = 'magic-block-activation';
        magicMessage.innerHTML = `
            <div class="magic-icon">🔮</div>
            <div class="magic-text">MAGIC ACTIVATED!</div>
            <div class="magic-subtext">${magicBlock.name}</div>
        `;
        magicMessage.style.position = 'absolute';
        magicMessage.style.left = `${x}px`;
        magicMessage.style.top = `${y}px`;
        magicMessage.style.transform = 'translate(-50%, -50%)';
        magicMessage.style.color = '#ff6b6b';
        magicMessage.style.fontSize = '1rem';
        magicMessage.style.fontWeight = '700';
        magicMessage.style.textAlign = 'center';
        magicMessage.style.textShadow = '0 0 10px #ff6b6b';
        magicMessage.style.pointerEvents = 'none';
        magicMessage.style.zIndex = '1001';
        magicMessage.style.opacity = '0';
        magicMessage.style.animation = 'magicActivation 2s ease-out forwards';
        
        // Add to canvas container
        this.canvas.parentElement.appendChild(magicMessage);
        
        // Remove after animation
        setTimeout(() => {
            if (magicMessage.parentElement) {
                magicMessage.parentElement.removeChild(magicMessage);
            }
        }, 2000);
    }
    
    // Show detailed explanation of what magic block cleared
    showMagicBlockClearExplanation(clearedLines, row, col) {
        const cellSize = this.cellSize;
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;
        
        // Count what was cleared
        const totalCleared = clearedLines.rows.length + clearedLines.columns.length + clearedLines.squares.length;
        let clearText = '';
        
        if (clearedLines.rows.length > 0) {
            clearText += `${clearedLines.rows.length} row${clearedLines.rows.length > 1 ? 's' : ''}`;
        }
        if (clearedLines.columns.length > 0) {
            if (clearText) clearText += ', ';
            clearText += `${clearedLines.columns.length} column${clearedLines.columns.length > 1 ? 's' : ''}`;
        }
        if (clearedLines.squares.length > 0) {
            if (clearText) clearText += ', ';
            clearText += `${clearedLines.squares.length} square${clearedLines.squares.length > 1 ? 's' : ''}`;
        }
        
        // Create explanation message
        const explanation = document.createElement('div');
        explanation.className = 'magic-block-explanation';
        explanation.innerHTML = `
            <div class="magic-clear-title">✨ MAGIC CLEAR! ✨</div>
            <div class="magic-clear-details">Cleared ${clearText}</div>
            <div class="magic-clear-bonus">+${totalCleared * 50} Magic Bonus!</div>
        `;
        explanation.style.position = 'absolute';
        explanation.style.left = `${x}px`;
        explanation.style.top = `${y - 60}px`;
        explanation.style.transform = 'translate(-50%, -50%)';
        explanation.style.color = '#ffd700';
        explanation.style.fontSize = '0.9rem';
        explanation.style.fontWeight = '600';
        explanation.style.textAlign = 'center';
        explanation.style.textShadow = '0 0 8px #ffd700';
        explanation.style.pointerEvents = 'none';
        explanation.style.zIndex = '1002';
        explanation.style.opacity = '0';
        explanation.style.animation = 'magicExplanation 3s ease-out forwards';
        explanation.style.background = 'rgba(0, 0, 0, 0.8)';
        explanation.style.padding = '0.5rem';
        explanation.style.borderRadius = '8px';
        explanation.style.border = '2px solid #ffd700';
        
        // Add to canvas container
        this.canvas.parentElement.appendChild(explanation);
        
        // Remove after animation
        setTimeout(() => {
            if (explanation.parentElement) {
                explanation.parentElement.removeChild(explanation);
            }
        }, 3000);
    }
    
    // Show message when magic block is placed but not activated yet
    showMagicBlockStandbyMessage(row, col) {
        const cellSize = this.cellSize;
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;
        
        // Create standby message
        const standbyMessage = document.createElement('div');
        standbyMessage.className = 'magic-block-standby';
        standbyMessage.innerHTML = `
            <div class="magic-standby-text">🔮 Magic Ready</div>
            <div class="magic-standby-subtext">Will clear any completed line</div>
        `;
        standbyMessage.style.position = 'absolute';
        standbyMessage.style.left = `${x}px`;
        standbyMessage.style.top = `${y - 30}px`;
        standbyMessage.style.transform = 'translate(-50%, -50%)';
        standbyMessage.style.color = '#96ceb4';
        standbyMessage.style.fontSize = '0.8rem';
        standbyMessage.style.fontWeight = '600';
        standbyMessage.style.textAlign = 'center';
        standbyMessage.style.textShadow = '0 0 6px #96ceb4';
        standbyMessage.style.pointerEvents = 'none';
        standbyMessage.style.zIndex = '1000';
        standbyMessage.style.opacity = '0';
        standbyMessage.style.animation = 'magicStandby 2s ease-out forwards';
        
        // Add to canvas container
        this.canvas.parentElement.appendChild(standbyMessage);
        
        // Remove after animation
        setTimeout(() => {
            if (standbyMessage.parentElement) {
                standbyMessage.parentElement.removeChild(standbyMessage);
            }
        }, 2000);
    }
    
    // Show bomb explosion effect
    showBombExplosionEffect(row, col, cellsCleared) {
        const cellSize = this.cellSize;
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;
        
        // Create explosion message
        const explosion = document.createElement('div');
        explosion.className = 'bomb-explosion';
        explosion.innerHTML = `
            <div class="bomb-icon">💥</div>
            <div class="bomb-text">BOMB EXPLOSION!</div>
            <div class="bomb-details">Cleared ${cellsCleared} cells</div>
            <div class="bomb-bonus">+${cellsCleared * 10} Bomb Bonus!</div>
        `;
        explosion.style.position = 'absolute';
        explosion.style.left = `${x}px`;
        explosion.style.top = `${y}px`;
        explosion.style.transform = 'translate(-50%, -50%)';
        explosion.style.color = '#ff4444';
        explosion.style.fontSize = '1rem';
        explosion.style.fontWeight = '700';
        explosion.style.textAlign = 'center';
        explosion.style.textShadow = '0 0 10px #ff4444';
        explosion.style.pointerEvents = 'none';
        explosion.style.zIndex = '1003';
        explosion.style.opacity = '0';
        explosion.style.animation = 'bombExplosion 2.5s ease-out forwards';
        explosion.style.background = 'rgba(0, 0, 0, 0.9)';
        explosion.style.padding = '0.8rem';
        explosion.style.borderRadius = '12px';
        explosion.style.border = '3px solid #ff4444';
        
        this.canvas.parentElement.appendChild(explosion);
        
        setTimeout(() => {
            if (explosion.parentElement) {
                explosion.parentElement.removeChild(explosion);
            }
        }, 2500);
    }
    
    // Clear cells affected by bomb magic
    clearBombCells(cellsToClear) {
        let cellsCleared = 0;
        
        cellsToClear.forEach(cellKey => {
            const [row, col] = cellKey.split(',').map(Number);
            if (this.board[row][col] === 1) {
                this.board[row][col] = 0;
                cellsCleared++;
            }
        });
        
        // Award bonus points for bomb clearing
        const bombBonus = cellsCleared * 10;
        this.scoringSystem.addPlacementPoints(bombBonus, this.difficultyManager.getScoreMultiplier());
        this.score = this.scoringSystem.getScore();
        
        // Redraw board and update UI
        this.drawBoard();
        this.updateUI();
        
        console.log(`💣 Bomb cleared ${cellsCleared} cells for ${bombBonus} bonus points`);
    }
    
    // Show lightning effect
    showLightningEffect(row, col, lightningLines) {
        const cellSize = this.cellSize;
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;
        
        // Count what was cleared
        const totalCleared = lightningLines.rows.length + lightningLines.columns.length;
        let clearText = '';
        
        if (lightningLines.rows.length > 0) {
            clearText += `${lightningLines.rows.length} row${lightningLines.rows.length > 1 ? 's' : ''}`;
        }
        if (lightningLines.columns.length > 0) {
            if (clearText) clearText += ' + ';
            clearText += `${lightningLines.columns.length} column${lightningLines.columns.length > 1 ? 's' : ''}`;
        }
        
        // Create lightning message
        const lightning = document.createElement('div');
        lightning.className = 'lightning-strike';
        lightning.innerHTML = `
            <div class="lightning-icon">⚡</div>
            <div class="lightning-text">LIGHTNING STRIKE!</div>
            <div class="lightning-details">Cleared ${clearText}</div>
            <div class="lightning-bonus">+${totalCleared * 25} Lightning Bonus!</div>
        `;
        lightning.style.position = 'absolute';
        lightning.style.left = `${x}px`;
        lightning.style.top = `${y}px`;
        lightning.style.transform = 'translate(-50%, -50%)';
        lightning.style.color = '#ffd700';
        lightning.style.fontSize = '1rem';
        lightning.style.fontWeight = '700';
        lightning.style.textAlign = 'center';
        lightning.style.textShadow = '0 0 15px #ffd700, 0 0 30px #ffd700';
        lightning.style.pointerEvents = 'none';
        lightning.style.zIndex = '1003';
        lightning.style.opacity = '0';
        lightning.style.animation = 'lightningStrike 2s ease-out forwards';
        lightning.style.background = 'rgba(0, 0, 0, 0.9)';
        lightning.style.padding = '0.8rem';
        lightning.style.borderRadius = '12px';
        lightning.style.border = '3px solid #ffd700';
        
        this.canvas.parentElement.appendChild(lightning);
        
        setTimeout(() => {
            if (lightning.parentElement) {
                lightning.parentElement.removeChild(lightning);
            }
        }, 2000);
    }
    
    // Show ghost effect
    showGhostEffect(row, col) {
        const cellSize = this.cellSize;
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;
        
        // Create ghost message
        const ghost = document.createElement('div');
        ghost.className = 'ghost-phase';
        ghost.innerHTML = `
            <div class="ghost-icon">👻</div>
            <div class="ghost-text">GHOST PHASE!</div>
            <div class="ghost-details">Passed through obstacles</div>
        `;
        ghost.style.position = 'absolute';
        ghost.style.left = `${x}px`;
        ghost.style.top = `${y}px`;
        ghost.style.transform = 'translate(-50%, -50%)';
        ghost.style.color = '#9370db';
        ghost.style.fontSize = '1rem';
        ghost.style.fontWeight = '700';
        ghost.style.textAlign = 'center';
        ghost.style.textShadow = '0 0 10px #9370db';
        ghost.style.pointerEvents = 'none';
        ghost.style.zIndex = '1003';
        ghost.style.opacity = '0';
        ghost.style.animation = 'ghostPhase 2s ease-out forwards';
        ghost.style.background = 'rgba(0, 0, 0, 0.85)';
        ghost.style.padding = '0.8rem';
        ghost.style.borderRadius = '12px';
        ghost.style.border = '3px dashed #9370db';
        
        this.canvas.parentElement.appendChild(ghost);
        
        setTimeout(() => {
            if (ghost.parentElement) {
                ghost.parentElement.removeChild(ghost);
            }
        }, 2000);
    }
    
    // Show visual feedback for speed timer
    showSpeedTimerFeedback(bonus, row, col) {
        const settings = this.storage.loadSettings();
        const showSpeedTimer = settings.showSpeedTimer === true;
        
        if (!showSpeedTimer) return;
        
        // Calculate position on canvas
        const cellSize = this.cellSize;
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;
        
        // Determine the current speed mode
        const speedMode = this.scoringSystem.getSpeedMode();
        
        // Create speed timer text element
        const speedText = document.createElement('div');
        speedText.className = 'speed-timer-text';
        
        // Set text and color based on mode
        if (speedMode === 'punishment') {
            speedText.textContent = `-${bonus} Too Slow!`;
        } else {
            speedText.textContent = `+${bonus} Speed!`;
        }
        
        speedText.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            transform: translate(-50%, -50%);
            color: ${speedMode === 'punishment' ? '#ff3333' : '#ff6b35'};
            font-weight: 900;
            font-size: 1.2rem;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
            pointer-events: none;
            z-index: 1000;
            animation: speedTimerFloat 1.5s ease-out forwards;
        `;
        
        // Add to board overlay
        const boardOverlay = document.getElementById('board-overlay');
        if (boardOverlay) {
            boardOverlay.appendChild(speedText);
            
            // Remove after animation
            setTimeout(() => {
                if (speedText.parentNode) {
                    speedText.parentNode.removeChild(speedText);
                }
            }, 1500);
        }
        
        // Add particle effects
        this.effectsManager.onSpeedTimer(x, y, bonus);
    }

    // Reset stuck UI state - clears any pending clears and refreshes blocks
    resetStuckUIState() {
        console.log('Resetting stuck UI state...');
        
        // Clear any pending clears that might be causing red highlighting
        this.pendingClears = null;
        this.pendingClearResult = null;
        this.pendingClearsTimestamp = null;
        
        // Clear any active timeouts
        if (this.clearTimeoutId) {
            clearTimeout(this.clearTimeoutId);
            this.clearTimeoutId = null;
        }
        if (this.safetyTimeoutId) {
            clearTimeout(this.safetyTimeoutId);
            this.safetyTimeoutId = null;
        }
        
        // Force refresh the board display
        this.drawBoard();
        
        // Ensure we have blocks available
        if (!this.blockManager.currentBlocks || this.blockManager.currentBlocks.length === 0) {
            console.log('No blocks available, generating new blocks...');
            this.generateNewBlocks();
        } else {
            console.log('Refreshing existing blocks...');
            this.blockPalette.updateBlocks(this.blockManager.currentBlocks);
        }
        
        // Update placeability indicators
        this.updatePlaceabilityIndicators();
        
        // Update UI
        this.updateUI();
        
        console.log('UI state reset complete');
    }

    // Enhanced game over detection with difficulty considerations
    checkGameOver() {
        // EMERGENCY: If board is undefined, reinitialize it immediately
        if (!this.board) {
            console.error('EMERGENCY: Board is undefined in checkGameOver, reinitializing...');
            this.board = this.initializeBoard();
            // Update placeability indicators after emergency board reinitialization
            this.updatePlaceabilityIndicators();
        }
        
        // Don't check for game over during initialization or if game is already over
        if (!this.isInitialized || this.isGameOver) {
            return;
        }
        
        if (this.blockManager.currentBlocks.length === 0) {
            return; // No blocks to check
        }
        
        // First check if all pieces have timed out
        if (this.blockPalette.areAllPiecesTimedOut()) {
            console.log('Game Over: All pieces timed out');
            this.gameOver();
            return;
        }
        
        // Check if any block can be placed anywhere on the board
        const placeableMap = this.computePlaceabilityMap();
        const hasAnyPlaceable = Object.values(placeableMap).some(v => v);
        if (hasAnyPlaceable) {
            this.preGameOverPending = false;
            return; // Game can continue
        }
        
        // No blocks can be placed - show 1.25s pre-indicator and then end the game
        if (!this.preGameOverPending) {
            this.preGameOverPending = true;
            if (this.blockPalette && this.blockPalette.showPreGameOverIndicator) {
                this.blockPalette.showPreGameOverIndicator(1250);
            }
            setTimeout(() => {
                // If still no moves after delay, end game
                if (!this.isGameOver) {
                    const stillNone = !Object.values(this.computePlaceabilityMap()).some(v => v);
                    if (stillNone) {
                        this.gameOver();
                    } else {
                        this.preGameOverPending = false;
                    }
                }
            }, 1250);
        }
    }
    
    /**
     * Handle when a piece times out (30 seconds without being placed)
     */
    handlePieceTimeout(blockId) {
        console.log('Piece timed out:', blockId);
        
        // Check if all pieces have now timed out
        if (this.blockPalette.areAllPiecesTimedOut()) {
            // Trigger game over after a brief delay to show the notification
            setTimeout(() => {
                if (!this.isGameOver) {
                    console.log('All pieces timed out - Game Over');
                    this.gameOver();
                }
            }, 1000);
        }
    }

    // Compute per-block placeability and update palette highlighting
    updatePlaceabilityIndicators() {
        if (!this.blockManager || !this.blockPalette) return;
        if (!this.blockManager.currentBlocks || this.blockManager.currentBlocks.length === 0) return;
        
        const placeableById = this.computePlaceabilityMap();
        const placeableIds = Object.keys(placeableById).filter(id => placeableById[id]);
        
        // Always show placeability state - dull out unplaceable blocks
        if (this.blockPalette.setPlaceability) {
            if (placeableIds.length === 1) {
                // If exactly one block is playable, highlight it and dim others
                this.blockPalette.setPlaceability(placeableById, { highlightLast: true, durationMs: 0 }); // 0 = permanent
            } else if (placeableIds.length === 0) {
                // Nothing playable - show pre-game over indicator
                this.blockPalette.showPreGameOverIndicator(0); // 0 = permanent until cleared
            } else {
                // Multiple blocks playable - show normal placeability state
                this.blockPalette.setPlaceability(placeableById, { highlightLast: false, durationMs: 0 }); // 0 = permanent
            }
        }
    }

    computePlaceabilityMap() {
        const map = {};
        if (!this.blockManager || !this.blockManager.currentBlocks) return map;
        for (const block of this.blockManager.currentBlocks) {
            map[block.id] = this.canPlaceAnywhere(block);
        }
        return map;
    }

    canPlaceAnywhere(block) {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.blockManager.canPlaceBlock(block, row, col, this.board)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // Speed timer countdown methods
    startSpeedTimerCountdown() {
        // Clear any existing timer
        if (this.speedTimerInterval) {
            clearInterval(this.speedTimerInterval);
        }
        
        // Start the countdown timer
        this.speedTimerStartTime = Date.now();
        
        // Update the display every 100ms for smooth countdown
        this.speedTimerInterval = setInterval(() => {
            this.updateSpeedTimerDisplay();
        }, 100);
    }
    
    stopSpeedTimerCountdown() {
        if (this.speedTimerInterval) {
            clearInterval(this.speedTimerInterval);
            this.speedTimerInterval = null;
        }
        this.speedTimerStartTime = null;
    }
    
    updateSpeedTimerDisplay() {
        // Only update if speed timer is enabled and in timer mode
        const difficultySettings = this.difficultySettings.getSettingsForDifficulty(this.difficulty);
        const showSpeedTimer = difficultySettings.showSpeedTimer === true;
        
        if (!showSpeedTimer || this.speedDisplayMode !== 'timer') {
            return;
        }
        
        const speedTimerElement = document.getElementById('speed-timer');
        const speedTimerValueElement = document.getElementById('speed-timer-value');
        
        if (speedTimerElement && speedTimerValueElement && this.speedTimerStartTime) {
            const elapsed = Date.now() - this.speedTimerStartTime;
            const seconds = (elapsed / 1000).toFixed(1);
            speedTimerValueElement.textContent = `${seconds}s`;
        }
    }
}

// Initialize game when DOM is loaded
function initializeGame() {
    window.game = new BlockdokuGame();
    
    // Check if we should start a new game (from lastgame.html "New Game" button)
    const shouldStartNewGame = localStorage.getItem('blockdoku_start_new_game');
    if (shouldStartNewGame === 'true') {
        localStorage.removeItem('blockdoku_start_new_game');
        // Clear the game over flag and start a fresh game
        if (window.game) {
            window.game.isGameOver = false;
            window.game.newGame();
        }
    }
    
    // Add global function to reset stuck UI state
    window.resetStuckUI = function() {
        if (window.game && window.game.resetStuckUIState) {
            window.game.resetStuckUIState();
            console.log('Stuck UI state has been reset');
        } else {
            console.error('Game not initialized or resetStuckUIState method not available');
        }
    };
    
    console.log('Global resetStuckUI() function available for debugging');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    // DOM is already loaded
    initializeGame();
}
