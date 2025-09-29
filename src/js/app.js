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
import { HintSystem } from './difficulty/hint-system.js';
import { TimerSystem } from './difficulty/timer-system.js';
import { DifficultySelector } from './ui/difficulty-selector.js';
import { EffectsManager } from './effects/effects-manager.js';
import { ConfirmationDialog } from './ui/confirmation-dialog.js';


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
        this.pendingClears = null; // Track blocks that are about to be cleared
        
        // Difficulty settings
        this.difficulty = 'normal';
        this.enableHints = false;
        this.enableTimer = false;
        this.moveLimit = null;
        this.timeLimit = null;
        
        // Re-enable features incrementally
        this.blockManager = new BlockManager();
        this.blockPalette = new BlockPalette('block-palette', this.blockManager);
        this.scoringSystem = new ScoringSystem();
        this.storage = new GameStorage();
        // this.effectsSystem = new EffectsSystem(this.canvas, this.ctx);
        this.pwaInstallManager = new PWAInstallManager();
        this.offlineManager = new OfflineManager();
        
        // Difficulty system
        this.difficultyManager = new DifficultyManager();
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
        this.comboModeActive = 'streak';
        this.comboModesUsed = new Set();
        
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
                console.log('Focus event: reloading game state from settings');
                this.loadGameState();
                this.render();
            }
        });
        
        // Listen for storage changes to detect difficulty changes from settings page
        window.addEventListener('storage', (e) => {
            if (e.key === 'blockdoku-settings' || e.key === 'blockdoku_settings') {
                this.loadSettings();
                this.updateDifficultyButton();
                this.renderPersonalBests();
                
                // Always reload game state when settings change (if not game over)
                if (!this.isGameOver) {
                    console.log('Storage change: reloading game state after settings change');
                    this.loadGameState();
                    this.render();
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
        this.loadGameState();
        this.generateNewBlocks();
        
        // Initialize timer system for current difficulty
        this.timerSystem.initialize();
        
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
        this.updatePlaceabilityIndicators();
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
        if (hintBtn) {
            const handleHintClick = () => {
                this.effectsManager.onButtonClick();
                this.hintSystem.showHint();
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
            console.error(`Failed to get theme color '${varName}':`, e);
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
        const { block, touch } = e.detail;
        this.selectedBlock = block;
        
        // Start drag operation
        this.isDragging = true;
        this.dragStartPosition = { x: touch.clientX, y: touch.clientY };
        this.dragCurrentPosition = { x: touch.clientX, y: touch.clientY };
        
        // Create drag element
        this.createDragElement();
        
        // Update preview position with preview offset (1.5 grid boxes above finger)
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
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
        
        return this.blockManager.canPlaceBlock(this.selectedBlock, row, col, this.board);
    }
    
    generateNewBlocks() {
        const newBlocks = this.blockManager.generateRandomBlocks(3, 'all', this.difficultyManager);
        this.blockPalette.updateBlocks(newBlocks);
        // Auto-select the first block when new blocks are generated
        this.autoSelectNextBlock();
    }
    
    autoSelectNextBlock() {
        if (this.blockManager.currentBlocks.length > 0) {
            const firstBlock = this.blockManager.currentBlocks[0];
            this.selectedBlock = firstBlock;
            this.blockPalette.selectBlockById(firstBlock.id);
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
        
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--block-color');
        for (let row = 0; row < this.boardSize; row++) {
            if (!this.board[row] || !Array.isArray(this.board[row])) {
                console.warn(`drawBoard: Board row ${row} is not initialized properly`);
                continue;
            }
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 1) {
                    const x = Math.round(col * drawCellSize) + 1;
                    const y = Math.round(row * drawCellSize) + 1;
                    const size = Math.round(drawCellSize) - 2;
                    
                    ctx.fillRect(x, y, size, size);
                    
                    // Add border to filled cells
                    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--block-border');
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, size, size);
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
        }
    }
    
    // Calculate score for clears and update immediately
    updateScoreForClears(clearedLines) {
        console.log('updateScoreForClears called with:', clearedLines);
        
        // Get difficulty multiplier and calculate score with it
        const difficultyMultiplier = this.difficultyManager.getScoreMultiplier();
        const scoreInfo = this.scoringSystem.calculateScoreForClears(clearedLines, difficultyMultiplier);
        console.log('Score calculation result:', scoreInfo);
        
        // Update app score (score is already adjusted for difficulty in calculateScoreForClears)
        this.score = this.score + scoreInfo.scoreGained;
        
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
            
            // Update combo
            if (scoreInfo.isComboEvent) {
                this.scoringSystem.combo++;
                this.scoringSystem.maxCombo = Math.max(this.scoringSystem.maxCombo, this.scoringSystem.combo);
                this.scoringSystem.comboActivations++;
            } else {
                this.scoringSystem.combo = 0;
            }
            
            // Update points breakdown
            const linePointsAdded = (clearedLines.rows.length + clearedLines.columns.length) * this.scoringSystem.basePoints.line;
            const squarePointsAdded = clearedLines.squares.length * this.scoringSystem.basePoints.square;
            this.scoringSystem.pointsBreakdown.linePoints += linePointsAdded;
            this.scoringSystem.pointsBreakdown.squarePoints += squarePointsAdded;
            if (scoreInfo.isComboEvent) {
                const comboBonus = 20 * (totalClears - 1);
                this.scoringSystem.pointsBreakdown.comboBonusPoints += comboBonus;
            }
        }
        
        // Store the result for later use in completeLineClear
        this.pendingClearResult = {
            clearedLines: clearedLines,
            scoreGained: scoreInfo.scoreGained,
            isCombo: scoreInfo.isComboEvent,
            combo: this.scoringSystem.getCombo()
        };
        
        // Store score info for enhanced display
        this.lastScoreInfo = scoreInfo;
        
        // Show immediate point breakdown display
        this.showPointBreakdown(scoreInfo, clearedLines);
        
        console.log('Score updated immediately. New score:', this.score, 'New level:', this.level);
    }
    
    startLineClearAnimation(clearedLines) {
        console.log('Starting line clear animation for:', clearedLines);
        // Start glow effect immediately
        this.highlightClearingBlocks(clearedLines);
        
        // After 0.75 seconds, actually clear the lines and show effects
        setTimeout(() => {
            console.log('Timeout reached, calling completeLineClear');
            this.completeLineClear(clearedLines);
        }, 750);
    }
    
    showImmediateClearFeedback(clearedLines) {
        // Set pending clears for persistent glow effect
        this.pendingClears = clearedLines;
        
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
        
        // Redraw board to show glow effect
        this.drawBoard();
        
        // Show immediate score popup
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.showQuickClearNotification(centerX, centerY, clearedLines);
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
    
    showQuickClearNotification(x, y, clearedLines) {
        // Show immediate notification of what was cleared
        this.ctx.save();
        
        const totalClears = clearedLines.rows.length + clearedLines.columns.length + clearedLines.squares.length;
        let message = '';
        
        if (totalClears === 1) {
            if (clearedLines.rows.length > 0) message = 'ROW!';
            else if (clearedLines.columns.length > 0) message = 'COLUMN!';
            else if (clearedLines.squares.length > 0) message = 'SQUARE!';
        } else {
            message = `${totalClears} CLEARS!`;
        }
        
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
        this.ctx.fillText(message, x, y + 8);
        
        this.ctx.restore();
        
        // Fade out quickly
        setTimeout(() => {
            this.drawBoard();
        }, 400);
    }
    
    highlightClearingBlocks(clearedLines) {
        // Draw the board with highlighted clearing blocks
        this.drawBoard();
        
        const ctx = this.ctx;
        const drawCellSize = this.actualCellSize || this.cellSize;
        const glowColor = this.getClearGlowColor();
        
        ctx.save();
        ctx.globalAlpha = 0.7;
        
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
        
        try {
            // Clear pending clears state
            this.pendingClears = null;
            
            // Actually clear the lines from the board (without updating score)
            console.log('Clearing lines from board...');
            result = this.scoringSystem.clearLinesFromBoard(this.board, clearedLines);
            console.log('Lines cleared from board, result:', result);
            this.board = result.board;
            
            // Retrieve the score info that was already calculated and applied
            const storedResult = this.pendingClearResult;
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
            // Reset pending clears state even if there was an error
            this.pendingClears = null;
            this.pendingClearResult = null;
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
            (this.storage.loadSettings()?.comboDisplayMode) || 'streak'
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
    
    newGame() {
        // Check for high score before starting new game
        if (this.score > 0) {
            this.checkHighScore();
        }
        
        this.board = this.initializeBoard();
        this.scoringSystem.reset();
        this.score = 0;
        this.level = 1;
        this.selectedBlock = null;
        this.previewPosition = null;
        this.isGameOver = false;
        this.isInitialized = true;
        this.comboModeActive = 'streak';
        this.comboModesUsed = new Set();
        
        // Update placeability indicators for new game
        this.updatePlaceabilityIndicators();
        
        // Reset animation tracking
        this.previousScore = 0;
        this.previousLevel = 1;
        this.previousCombo = 0;
        // this.effectsSystem.clear();
        this.generateNewBlocks();
        this.drawBoard();
        this.updateUI();
        
        // Clear saved game state for new game
        this.storage.clearGameState();
    }
    
    restartWithDifficulty(difficulty) {
        console.log(`Restarting game with difficulty: ${difficulty}`);
        
        // Set difficulty
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
        
        const currentCombo = this.scoringSystem.getCombo();
        const totalCombos = this.scoringSystem.getTotalCombos();
        
        // Track both combo modes as used
        this.comboModesUsed.add('streak');
        this.comboModesUsed.add('cumulative');
        
        // Check for first score gain
        if (this.previousScore === 0 && this.score > 0) {
            this.animateFirstScore(scoreElement);
        } else if (this.score > this.previousScore) {
            this.animateScoreIncrease(scoreElement);
        }
        
        // Check for level change
        if (this.level > this.previousLevel) {
            this.animateLevelUp(levelElement);
        }
        
        // Check for combo hit
        if (currentCombo > this.previousCombo && currentCombo >= 1) {
            this.animateComboHit(comboElement);
        }
        
        // Update the text content
        scoreElement.textContent = this.score;
        levelElement.textContent = this.level;
        
        // Display both combo types: "Streak: X | Total: Y"
        if (comboLabelElement) comboLabelElement.textContent = 'Combos';
        comboElement.textContent = `Streak: ${currentCombo} | Total: ${totalCombos}`;
        
        // Update previous values
        this.previousScore = this.score;
        this.previousLevel = this.level;
        this.previousCombo = currentCombo;
        
        // Update hint controls visibility
        this.updateHintControls();
        // Keep personal bests fresh if score changed
        this.renderPersonalBests();
    }

    renderPersonalBests() {
        try {
            const container = document.getElementById('personal-bests');
            if (!container) return;
            const settings = this.storage.loadSettings();
            const show = settings.showHighScore === true;
            if (!show) {
                container.style.display = 'none';
                return;
            }
            const best = this.storage.getBestScoresByDifficulty();
            container.innerHTML = `
                <span class="pb-item"><span class="pb-label">Easy</span><span class="pb-value">${(best.easy||0).toLocaleString()}</span></span>
                <span class="pb-item"><span class="pb-label">Normal</span><span class="pb-value">${(best.normal||0).toLocaleString()}</span></span>
                <span class="pb-item"><span class="pb-label">Hard</span><span class="pb-value">${(best.hard||0).toLocaleString()}</span></span>
                <span class="pb-item"><span class="pb-label">Expert</span><span class="pb-value">${(best.expert||0).toLocaleString()}</span></span>
            `;
            container.style.display = 'inline-flex';
        } catch (e) {
            console.warn('renderPersonalBests failed:', e);
        }
    }
    
    // Show detailed point breakdown for immediate feedback
    showPointBreakdown(scoreInfo, clearedLines) {
        if (!scoreInfo || scoreInfo.scoreGained === 0) return;
        
        // Create or update point breakdown display
        let breakdownElement = document.getElementById('point-breakdown');
        if (!breakdownElement) {
            breakdownElement = document.createElement('div');
            breakdownElement.id = 'point-breakdown';
            breakdownElement.className = 'point-breakdown';
            document.querySelector('.game-info').appendChild(breakdownElement);
        }
        
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
            
            // Animate the breakdown
            breakdownElement.style.transition = 'all 0.3s ease-out';
            breakdownElement.style.transform = 'scale(1.1)';
            breakdownElement.style.color = this.getClearGlowColor();
            
            // Hide after 3 seconds
            setTimeout(() => {
                breakdownElement.style.opacity = '0';
                breakdownElement.style.transform = 'scale(1)';
                setTimeout(() => {
                    breakdownElement.style.display = 'none';
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
    
    updateHintControls() {
        const hintControls = document.getElementById('hint-controls');
        const hintBtn = document.getElementById('hint-btn');
        
        if (hintControls && hintBtn) {
            const hintsEnabled = this.difficultyManager.isHintsEnabled();
            hintControls.style.display = hintsEnabled ? 'block' : 'none';
            
            if (hintsEnabled) {
                const hintStatus = this.hintSystem.getHintStatus();
                hintBtn.disabled = !hintStatus.available;
                hintBtn.textContent = hintStatus.available ? '💡 Hint' : `💡 Hint (${Math.ceil(hintStatus.cooldownRemaining / 1000)}s)`;
            }
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
                timerElement.textContent = this.timerSystem.formatTime(timeRemaining);
                
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
    loadSettings() {
        const settings = this.storage.loadSettings();
        this.currentTheme = settings.theme;
        this.applyTheme(settings.theme);
    }

    loadGameState() {
        const savedState = this.storage.loadGameState();
        if (savedState) {
            console.log('Loading saved game state:', savedState);
            this.board = savedState.board || this.initializeBoard();
            this.score = savedState.score || 0;
            this.level = savedState.level || 1;
            
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
            
            // Update placeability indicators after loading game state
            this.updatePlaceabilityIndicators();
            
            console.log('Game state loaded successfully');
        } else {
            console.log('No saved game state found - preserving current board state');
            // If no saved state, ensure we have a valid board (don't overwrite existing state)
            if (!this.board || !Array.isArray(this.board)) {
                this.board = this.initializeBoard();
            }
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
            }
        };
        console.log('Saving game state:', gameState);
        this.storage.saveGameState(gameState);
        console.log('Game state saved successfully');
    }

    loadSettings() {
        if (this.storage) {
            const settings = this.storage.loadSettings();
            this.currentTheme = settings.theme || 'light';
            this.soundEnabled = settings.soundEnabled === true;
            this.animationsEnabled = settings.animationsEnabled !== false;
            this.difficulty = settings.difficulty || 'normal';
            this.autoSave = settings.autoSave !== false;
            this.enableHints = settings.enableHints || false;
            this.enableTimer = settings.enableTimer || false;
            this.showPoints = settings.showPoints || false;
            this.particlesEnabled = settings.particlesEnabled !== false;
            this.hapticEnabled = settings.hapticEnabled !== false;
            
            // Check for pending difficulty changes from settings page
            const pendingDifficulty = localStorage.getItem('blockdoku_pending_difficulty');
            if (pendingDifficulty) {
                this.difficulty = pendingDifficulty;
                localStorage.removeItem('blockdoku_pending_difficulty');
            }
            
            // Apply loaded theme
            this.applyTheme(this.currentTheme);
            
            // Apply loaded difficulty to difficulty manager
            if (this.difficultyManager) {
                this.difficultyManager.setDifficulty(this.difficulty);
            }
            
            // Apply effects settings
            this.applyEffectsSettings();
            
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
        this.currentTheme = theme;
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
        } catch {}
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
        
        // Clear any pending clearing effects when switching themes
        // Only clear if we're not in the middle of a critical clearing operation
        if (this.pendingClears) {
            console.log('Clearing pending clears due to theme switch');
            this.pendingClears = null;
        }
        
        // Redraw the board with new theme colors after a small delay to ensure CSS is loaded
        setTimeout(() => {
            this.render();
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
        
        console.log('Game Over! Final Score:', this.score);
        
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

    showGameOverModal(stats) {
        // Remove any existing game over modal
        const existingModal = document.getElementById('game-over-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create a simple game over notification
        const modal = document.createElement('div');
        modal.id = 'game-over-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: var(--card-bg, #2c3e50);
            color: var(--text-color, white);
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            border: 2px solid var(--primary-color, #3498db);
        `;
        
        const isHighScore = this.storage.isHighScore(stats.score);
        
		// Build detailed stats and breakdown
		const difficultyLabel = (stats.difficulty?.toUpperCase?.() || this.difficulty.toUpperCase());
		const multiplier = stats.difficultyMultiplier || (this.difficultyManager?.getScoreMultiplier?.() || 1);
		const breakdown = stats.breakdown || { linePoints: 0, squarePoints: 0, comboBonusPoints: 0 };
		const clears = {
			rows: stats.rowClears || 0,
			columns: stats.columnClears || 0,
			squares: stats.squareClears || 0
		};

        // Build combo summary based on which modes were used
        const modesUsedSet = new Set(stats.comboModesUsed || []);
        const usedStreak = modesUsedSet.has('streak') || modesUsedSet.size === 0; // default to streak if unknown
        const usedCumulative = modesUsedSet.has('cumulative');
        const comboSummary = usedStreak && usedCumulative
            ? `<p style=\"margin: 5px 0;\">Max Streak: ${stats.maxCombo}</p><p style=\"margin: 5px 0;\">Total Combos: ${stats.comboActivations || 0}</p>`
            : (usedCumulative
                ? `<p style=\"margin: 5px 0;\">Total Combos: ${stats.comboActivations || 0}</p>`
                : `<p style=\"margin: 5px 0;\">Max Streak: ${stats.maxCombo}</p>`);

        modalContent.innerHTML = `
			<h2 style="margin: 0 0 20px 0; color: var(--primary-color, #3498db);">Game Over!</h2>
			<div style="margin: 15px 0;">
				<p style=\"margin: 5px 0; font-size: 1.2em;\"><strong>Final Score: ${stats.score}</strong></p>
				<p style=\"margin: 5px 0;\">Level: ${stats.level}</p>
				<p style=\"margin: 5px 0;\">Lines Cleared: ${stats.linesCleared}</p>
                ${comboSummary}
				<p style=\"margin: 5px 0;\">Difficulty: ${difficultyLabel} (x${multiplier})</p>
				${isHighScore ? '<p style="color: #ffd700; font-weight: bold; margin: 10px 0;">🎉 New High Score! 🎉</p>' : ''}
			</div>
			<div style=\"text-align: left; background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);\">
				<div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 10px;\">
					<div>
						<h3 style=\"margin: 0 0 6px 0; color: var(--primary-color, #3498db); font-size: 1em;\">Clears</h3>
						<p style=\"margin: 4px 0;\">Rows: <strong>${clears.rows}</strong></p>
						<p style=\"margin: 4px 0;\">Columns: <strong>${clears.columns}</strong></p>
						<p style=\"margin: 4px 0;\">3x3 Squares: <strong>${clears.squares}</strong></p>
					</div>
					<div>
						<h3 style=\"margin: 0 0 6px 0; color: var(--primary-color, #3498db); font-size: 1em;\">Score Breakdown</h3>
						<p style=\"margin: 4px 0;\">Lines: <strong>${breakdown.linePoints.toLocaleString()}</strong></p>
						<p style=\"margin: 4px 0;\">Squares: <strong>${breakdown.squarePoints.toLocaleString()}</strong></p>
						<p style=\"margin: 4px 0;\">Combo Bonus: <strong>${breakdown.comboBonusPoints.toLocaleString()}</strong></p>
					</div>
				</div>
			</div>
			<div style="margin-top: 18px; display: flex; justify-content: center; flex-wrap: wrap;">
				<button id="new-game-btn" style="margin: 5px; padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1em; font-weight: bold;">
					New Game
				</button>
				<button id="share-score-btn" style="margin: 5px; padding: 12px 24px; background: var(--primary-color, #3498db); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1em; font-weight: bold;">
					Share
				</button>
				<button id="close-modal-btn" style="margin: 5px; padding: 12px 24px; background: #f44336; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1em; font-weight: bold;">
					Close
				</button>
			</div>
		`;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Add proper event listeners
		const newGameBtn = document.getElementById('new-game-btn');
		const closeBtn = document.getElementById('close-modal-btn');
		const shareBtn = document.getElementById('share-score-btn');
        
        const handleNewGame = () => {
            modal.remove();
            this.isGameOver = false;
            this.newGame();
        };
        
        const handleClose = () => {
            modal.remove();
        };
        
        newGameBtn.addEventListener('click', handleNewGame);
        newGameBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleNewGame();
        }, { passive: false });
        
        closeBtn.addEventListener('click', handleClose);
        closeBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleClose();
        }, { passive: false });

		// Share handler
		const shareHandler = async () => {
			try {
				const difficultyText = (stats.difficulty?.toUpperCase?.() || this.difficulty.toUpperCase());
				const shareUrl = (window.location && window.location.origin) ? (window.location.origin + window.location.pathname) : (window.location.href || '');
                const shareComboText = (usedStreak && usedCumulative)
                    ? `Max Streak ${stats.maxCombo}, Total Combos ${stats.comboActivations || 0}`
                    : (usedCumulative ? `Total Combos ${stats.comboActivations || 0}` : `Max Streak ${stats.maxCombo}`);
                const text = `I scored ${stats.score} in Blockdoku (${difficultyText}) — Level ${stats.level}, ${stats.linesCleared} lines, ${shareComboText}!`;
				if (navigator.share) {
					await navigator.share({ title: 'My Blockdoku Score', text, url: shareUrl });
				} else if (navigator.clipboard && navigator.clipboard.writeText) {
					await navigator.clipboard.writeText(`${text} ${shareUrl}`);
					alert('Share link copied to clipboard!');
				} else {
					// Fallback prompt
					window.prompt('Copy this to share:', `${text} ${shareUrl}`);
				}
			} catch (err) {
				console.error('Share failed:', err);
			}
		};
		if (shareBtn) {
			shareBtn.addEventListener('click', shareHandler);
			shareBtn.addEventListener('touchstart', (e) => { e.preventDefault(); shareHandler(); }, { passive: false });
		}
        
        // Prevent touch events from going through the modal
        modal.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        modal.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        modal.addEventListener('touchend', (e) => {
            e.preventDefault();
        }, { passive: false });
    }

    getStats() {
		const s = this.scoringSystem.getStats();
		const difficultyMultiplier = this.difficultyManager?.getScoreMultiplier?.() || 1;
		return {
			score: this.score,
			level: this.level,
			linesCleared: s.linesCleared,
			combo: s.combo,
			maxCombo: s.maxCombo,
			rowClears: s.rowClears,
			columnClears: s.columnClears,
			squareClears: s.squareClears,
			comboActivations: s.comboActivations,
			comboModesUsed: Array.from(this.comboModesUsed || []),
			breakdown: s.breakdownBase,
			difficulty: this.difficulty,
			difficultyMultiplier
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
                    <span class="score-details">Level ${score.level} • ${score.linesCleared} lines • ${score.date}</span>
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
        // Check if game is in progress (has blocks placed or score > 0)
        const gameInProgress = this.score > 0 || (this.board && this.board.some(row => row.some(cell => cell === 1)));
        
        if (gameInProgress) {
            // Show confirmation dialog
            const confirmed = await this.confirmationDialog.show(
                `Changing difficulty to ${difficulty.toUpperCase()} will reset your current game and you'll lose your progress. Are you sure you want to continue?`
            );
            
            if (!confirmed) {
                return; // User cancelled
            }
        }
        
        this.difficulty = difficulty;
        
        // Update difficulty manager
        if (this.difficultyManager) {
            this.difficultyManager.setDifficulty(difficulty);
        }
        
        this.applyDifficultySettings();
        this.updateDifficultyUI();
        this.updateDifficultyButton();
        this.saveSettings();
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
        // Apply difficulty-specific settings
        switch (this.difficulty) {
            case 'easy':
                this.enableHints = true;
                this.enableTimer = false;
                this.moveLimit = null;
                this.timeLimit = null;
                break;
            case 'normal':
                this.enableHints = false;
                this.enableTimer = false;
                this.moveLimit = null;
                this.timeLimit = null;
                break;
            case 'hard':
                this.enableHints = false;
                this.enableTimer = false;
                this.moveLimit = 50; // Limited moves
                this.timeLimit = null;
                break;
            case 'expert':
                this.enableHints = false;
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
        
        // Adjust block generation based on difficulty
        switch (this.difficulty) {
            case 'easy':
                blockCount = 3;
                blockTypes = 'large'; // Prefer larger, simpler blocks
                break;
            case 'normal':
                blockCount = 3;
                blockTypes = 'all';
                break;
            case 'hard':
                blockCount = 4;
                blockTypes = 'small'; // Prefer smaller, more complex blocks
                break;
            case 'expert':
                blockCount = 5;
                blockTypes = 'complex'; // Complex irregular shapes
                break;
        }
        
        const newBlocks = this.blockManager.generateRandomBlocks(blockCount, blockTypes, this.difficultyManager);
        this.blockPalette.updateBlocks(newBlocks);
        this.updateBlockPointsDisplay();
        this.autoSelectNextBlock();
    }

    // Enhanced block placement with hints
    placeBlock(row, col) {
        if (!this.canPlaceBlock(row, col)) return;
        
        
        // Place the block on the board
        this.board = this.blockManager.placeBlock(this.selectedBlock, row, col, this.board);
        
        // Award 1 point for block placement (as documented in scoring.md)
        this.scoringSystem.addPlacementPoints(this.scoringSystem.basePoints.single, this.difficultyManager.getScoreMultiplier());
        
        // Add placement effects
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.effectsManager.onBlockPlace(centerX, centerY);
        
        // Remove the used block
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

    // Compute per-block placeability and update palette highlighting for 1.25s when only one playable remains
    updatePlaceabilityIndicators() {
        if (!this.blockManager || !this.blockPalette) return;
        if (!this.blockManager.currentBlocks || this.blockManager.currentBlocks.length === 0) return;
        
        const placeableById = this.computePlaceabilityMap();
        const placeableIds = Object.keys(placeableById).filter(id => placeableById[id]);
        
        // If exactly one block is playable, briefly highlight it and dim others
        if (placeableIds.length === 1) {
            if (this.blockPalette.setPlaceability) {
                this.blockPalette.setPlaceability(placeableById, { highlightLast: true, durationMs: 1250 });
            }
        } else if (placeableIds.length === 0) {
            // nothing playable - handled by pre-game over indicator when detected in checkGameOver
        } else {
            // Do not persist classes during normal play; clear any existing state
            if (this.blockPalette.clearPlaceability) {
                this.blockPalette.clearPlaceability();
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
}

// Initialize game when DOM is loaded
function initializeGame() {
    window.game = new BlockdokuGame();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    // DOM is already loaded
    initializeGame();
}
