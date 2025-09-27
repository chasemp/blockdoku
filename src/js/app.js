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
        this.board = this.initializeBoard();
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
        this.enableUndo = false;
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
        this.selectedBlock = null;
        this.previewPosition = null;
        
        // Drag and drop state
        this.isDragging = false;
        this.dragStartPosition = null;
        this.dragCurrentPosition = null;
        this.dragBlockElement = null;
        
        this.loadSettings();
        this.init();
        this.setupResizeHandler();
        
        // Listen for focus events to reload settings when returning from settings page
        window.addEventListener('focus', () => {
            this.loadSettings();
            this.updateDifficultyButton();
        });
        
        // Listen for storage changes to detect difficulty changes from settings page
        window.addEventListener('storage', (e) => {
            if (e.key === 'blockdoku-settings') {
                this.loadSettings();
                this.updateDifficultyButton();
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

    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            // Redraw after resize to ensure proper alignment
            requestAnimationFrame(() => {
                this.drawBoard();
            });
        });
    }
    
    initializeBoard() {
        // Create 9x9 board with empty cells
        const board = [];
        for (let row = 0; row < this.boardSize; row++) {
            board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                board[row][col] = 0; // 0 = empty, 1 = filled
            }
        }
        return board;
    }
    
    init() {
        console.log('Game init() called');
        this.setupEventListeners();
        this.registerServiceWorker();
        // this.loadSettings();
        // this.loadGameState();
        this.generateNewBlocks();
        
        // Wait for DOM to be fully ready before sizing and drawing
        setTimeout(() => {
            this.resizeCanvas();
            
            // Wait for next frame to ensure canvas is fully rendered
            requestAnimationFrame(() => {
                this.drawBoard();
                this.updateUI();
            });
        }, 100); // Increased delay to ensure DOM is fully ready
        
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
        this.effectsManager.update();
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
        document.getElementById('enable-undo').addEventListener('change', (e) => this.toggleSetting('undo', e.target.checked));
        
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
            if (e.key === 'blockdoku-settings') {
                this.loadSettings();
                this.updateHintControls();
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
        if (!this.selectedBlock) return false;
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
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--block-color');
        for (let row = 0; row < this.boardSize; row++) {
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
        // Check for completed lines
        const clearedLines = this.scoringSystem.checkAndClearLines(this.board);
        
        // If any lines were cleared, process them with animation
        if (clearedLines.rows.length > 0 || clearedLines.columns.length > 0 || clearedLines.squares.length > 0) {
            // Show immediate visual feedback first
            this.showImmediateClearFeedback(clearedLines);
            
            // Start the line clear animation sequence
            this.startLineClearAnimation(clearedLines);
        }
    }
    
    startLineClearAnimation(clearedLines) {
        // Start glow effect immediately
        this.highlightClearingBlocks(clearedLines);
        
        // After 1 second, actually clear the lines and show effects
        setTimeout(() => {
            this.completeLineClear(clearedLines);
        }, 1000);
    }
    
    showImmediateClearFeedback(clearedLines) {
        // Set pending clears for persistent glow effect
        this.pendingClears = clearedLines;
        
        // Create immediate visual feedback - very subtle flash
        this.ctx.save();
        this.ctx.fillStyle = '#00ff00'; // Green flash
        this.ctx.globalAlpha = 0.2;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1.0;
        this.ctx.restore();
        
        // Add a brief visual cue (very subtle border)
        this.canvas.style.border = '1px solid #00ff00';
        this.canvas.style.boxShadow = '0 0 5px #00ff00';
        
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
    
    drawClearingBlockGlow(clearedLines) {
        // Draw enhanced glow outline around blocks that will be cleared
        this.ctx.save();
        const drawCellSize = this.actualCellSize || this.cellSize;
        
        // Set up enhanced glow effect
        this.ctx.shadowColor = '#00ff00';
        this.ctx.shadowBlur = 8;
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        
        // Draw outer glow - more visible
        this.ctx.globalAlpha = 0.8;
        clearedLines.rows.forEach(row => {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 1) {
                    const x = col * drawCellSize;
                    const y = row * drawCellSize;
                    this.ctx.strokeRect(x + 2, y + 2, drawCellSize - 4, drawCellSize - 4);
                }
            }
        });
        
        clearedLines.columns.forEach(col => {
            for (let row = 0; row < this.boardSize; row++) {
                if (this.board[row][col] === 1) {
                    const x = col * drawCellSize;
                    const y = row * drawCellSize;
                    this.ctx.strokeRect(x + 2, y + 2, drawCellSize - 4, drawCellSize - 4);
                }
            }
        });
        
        clearedLines.squares.forEach(square => {
            const startRow = square.row;
            const startCol = square.col;
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    const row = startRow + r;
                    const col = startCol + c;
                    if (this.board[row][col] === 1) {
                        const x = col * drawCellSize;
                        const y = row * drawCellSize;
                        this.ctx.strokeRect(x + 2, y + 2, drawCellSize - 4, drawCellSize - 4);
                    }
                }
            }
        });
        
        // Draw inner bright outline
        this.ctx.shadowBlur = 0;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1.5;
        this.ctx.globalAlpha = 1.0;
        
        clearedLines.rows.forEach(row => {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 1) {
                    const x = col * drawCellSize;
                    const y = row * drawCellSize;
                    this.ctx.strokeRect(x + 4, y + 4, drawCellSize - 8, drawCellSize - 8);
                }
            }
        });
        
        clearedLines.columns.forEach(col => {
            for (let row = 0; row < this.boardSize; row++) {
                if (this.board[row][col] === 1) {
                    const x = col * drawCellSize;
                    const y = row * drawCellSize;
                    this.ctx.strokeRect(x + 4, y + 4, drawCellSize - 8, drawCellSize - 8);
                }
            }
        });
        
        clearedLines.squares.forEach(square => {
            const startRow = square.row;
            const startCol = square.col;
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    const row = startRow + r;
                    const col = startCol + c;
                    if (this.board[row][col] === 1) {
                        const x = col * drawCellSize;
                        const y = row * drawCellSize;
                        this.ctx.strokeRect(x + 4, y + 4, drawCellSize - 8, drawCellSize - 8);
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
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x - 80, y - 20, 160, 40);
        
        // Draw text
        this.ctx.fillStyle = '#00ff00';
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
        
        ctx.save();
        ctx.globalAlpha = 0.7;
        
        // Highlight clearing rows
        clearedLines.rows.forEach(row => {
            ctx.fillStyle = '#ffff00'; // Yellow highlight
            ctx.fillRect(0, row * drawCellSize, this.canvas.width, drawCellSize);
        });
        
        // Highlight clearing columns
        clearedLines.columns.forEach(col => {
            ctx.fillStyle = '#ffff00'; // Yellow highlight
            ctx.fillRect(col * drawCellSize, 0, drawCellSize, this.canvas.height);
        });
        
        // Highlight clearing 3x3 squares
        clearedLines.squares.forEach(square => {
            ctx.fillStyle = '#ffff00'; // Yellow highlight
            const x = square.col * 3 * drawCellSize;
            const y = square.row * 3 * drawCellSize;
            ctx.fillRect(x, y, 3 * drawCellSize, 3 * drawCellSize);
        });
        
        ctx.restore();
        
        // Glow effect is now handled by drawBoard() when pendingClears is set
    }
    
    completeLineClear(clearedLines) {
        // Clear pending clears state
        this.pendingClears = null;
        
        // Actually clear the lines
        const result = this.scoringSystem.clearLines(this.board, clearedLines);
        this.board = result.board;
        
        // Update score and level with difficulty multiplier
        const baseScore = this.scoringSystem.getScore();
        const combo = this.scoringSystem.getCombo();
        this.score = this.difficultyManager.calculateScore(baseScore, combo);
        this.level = this.scoringSystem.getLevel();
        
        // Create visual effects
        this.createLineClearEffect(clearedLines);
        
        // Add line clear effects
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.effectsManager.onLineClear(centerX, centerY, clearedLines);
        
        // Create score popup
        this.createScorePopup(centerX, centerY, result.scoreGained);
        
        // Create combo effect if applicable
        if (combo > 1) {
            this.createComboEffect(combo, centerX, centerY + 50);
            this.effectsManager.onCombo(centerX, centerY + 50, combo);
        }
        
        // Update UI
        this.updateUI();
        
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
        this.hintSystem.reset();
        
        // Start new game with new difficulty
        this.newGame();
    }
    
    updateUI() {
        const scoreElement = document.getElementById('score');
        const levelElement = document.getElementById('level');
        const comboElement = document.getElementById('combo');
        
        const currentCombo = this.scoringSystem.getCombo();
        
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
        if (currentCombo > this.previousCombo && currentCombo > 1) {
            this.animateComboHit(comboElement);
        }
        
        // Update the text content
        scoreElement.textContent = this.score;
        levelElement.textContent = this.level;
        comboElement.textContent = currentCombo;
        
        // Update previous values
        this.previousScore = this.score;
        this.previousLevel = this.level;
        this.previousCombo = currentCombo;
        
        // Update hint controls visibility
        this.updateHintControls();
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
        this.ctx.fillStyle = '#ffff00';
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
    
    createScorePopup(x, y, scoreGained) {
        // Enhanced score popup with better visibility
        this.ctx.save();
        
        // Add background for better visibility
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x - 60, y - 20, 120, 40);
        
        // Add border
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x - 60, y - 20, 120, 40);
        
        // Draw score text
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`+${scoreGained}`, x, y + 8);
        
        this.ctx.restore();
        
        // Animate the popup (fade out and move up)
        let animationFrame = 0;
        const animate = () => {
            if (animationFrame < 45) { // 45 frames = ~0.75 seconds at 60fps
                this.ctx.save();
                this.ctx.globalAlpha = 1 - (animationFrame / 45);
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(x - 60, y - 20 - animationFrame * 2, 120, 40);
                this.ctx.strokeStyle = '#00ff00';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x - 60, y - 20 - animationFrame * 2, 120, 40);
                this.ctx.fillStyle = '#00ff00';
                this.ctx.font = 'bold 28px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`+${scoreGained}`, x, y + 8 - animationFrame * 2);
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
        element.style.transition = 'all 0.6s ease-out';
        element.style.transform = 'scale(1.5)';
        element.style.color = '#00ff00';
        element.style.textShadow = '0 0 10px #00ff00';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = '';
            element.style.textShadow = '';
        }, 600);
    }
    
    animateScoreIncrease(element) {
        element.style.transition = 'all 0.3s ease-out';
        element.style.transform = 'scale(1.2)';
        element.style.color = '#ffff00';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = '';
        }, 300);
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
        
        setTimeout(() => {
            element.style.transform = 'scale(1) rotate(0deg)';
            element.style.color = '';
            element.style.textShadow = '';
        }, 800);
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
            this.board = savedState.board || this.initializeBoard();
            this.score = savedState.score || 0;
            this.level = savedState.level || 1;
            this.scoringSystem.score = this.score;
            this.scoringSystem.level = this.level;
            
            if (savedState.currentBlocks) {
                this.blockManager.currentBlocks = savedState.currentBlocks;
                this.blockPalette.updateBlocks(savedState.currentBlocks);
            }
            
            if (savedState.selectedBlock) {
                this.selectedBlock = savedState.selectedBlock;
            }
        }
    }

    saveGameState() {
        const gameState = {
            board: this.board,
            score: this.score,
            level: this.level,
            currentBlocks: this.blockManager.currentBlocks,
            selectedBlock: this.selectedBlock
        };
        this.storage.saveGameState(gameState);
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
            this.enableUndo = settings.enableUndo || false;
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
            enableUndo: this.enableUndo,
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
        const themeLink = document.getElementById('theme-css');
        if (themeLink) {
            themeLink.href = `css/themes/${theme}.css`;
        }
        
        // Set data-theme attribute for CSS selectors
        document.documentElement.setAttribute('data-theme', theme);
        
        // Also add class to body as fallback
        document.body.className = document.body.className.replace(/light-theme|dark-theme|wood-theme/g, '');
        document.body.classList.add(`${theme}-theme`);
        
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

    // Game Over Detection
    checkGameOver() {
        if (this.blockManager.currentBlocks.length === 0) {
            return; // No blocks to check
        }
        
        // Check if any block can be placed anywhere on the board
        for (let block of this.blockManager.currentBlocks) {
            for (let row = 0; row < this.boardSize; row++) {
                for (let col = 0; col < this.boardSize; col++) {
                    if (this.blockManager.canPlaceBlock(block, row, col, this.board)) {
                        return; // Game can continue
                    }
                }
            }
        }
        
        // No blocks can be placed - game over
        this.gameOver();
    }

    gameOver() {
        console.log('Game Over! Final Score:', this.score);
        
        // Save high score and statistics
        const stats = this.getStats();
        this.checkHighScore();
        
        // Show game over modal or notification
        this.showGameOverModal(stats);
        
        // Save final game state
        this.saveGameState();
    }

    showGameOverModal(stats) {
        // Create a simple game over notification
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 1000;
            font-family: Arial, sans-serif;
        `;
        
        const isHighScore = this.storage.isHighScore(stats.score);
        
        modal.innerHTML = `
            <h2>Game Over!</h2>
            <p>Final Score: ${stats.score}</p>
            <p>Lines Cleared: ${stats.linesCleared}</p>
            <p>Max Combo: ${stats.maxCombo}</p>
            ${isHighScore ? '<p style="color: #ffd700;">🎉 New High Score! 🎉</p>' : ''}
            <button onclick="this.parentElement.remove(); game.newGame();" 
                    style="margin: 10px; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
                New Game
            </button>
            <button onclick="this.parentElement.remove();" 
                    style="margin: 10px; padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Close
            </button>
        `;
        
        document.body.appendChild(modal);
    }

    getStats() {
        return {
            score: this.score,
            level: this.level,
            linesCleared: this.scoringSystem.getLinesCleared(),
            combo: this.scoringSystem.getCombo(),
            maxCombo: this.scoringSystem.getMaxCombo()
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
                <span class="stat-value">${stats.totalLines}</span>
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
        document.getElementById('enable-undo').checked = this.enableUndo;
    }

    async selectDifficulty(difficulty) {
        // Check if game is in progress (has blocks placed or score > 0)
        const gameInProgress = this.score > 0 || this.board.some(row => row.some(cell => cell === 1));
        
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
        this.currentTheme = theme;
        this.applyTheme(theme);
        this.updateThemeUI();
        this.saveSettings();
    }

    applyTheme(theme) {
        const themeLink = document.getElementById('theme-css');
        if (themeLink) {
            themeLink.href = `css/themes/${theme}.css`;
        }
        
        // Set data-theme attribute for CSS selectors
        document.documentElement.setAttribute('data-theme', theme);
        
        // Also add class to body as fallback
        document.body.className = document.body.className.replace(/light-theme|dark-theme|wood-theme/g, '');
        document.body.classList.add(`${theme}-theme`);
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
            case 'undo':
                this.enableUndo = value;
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
                this.enableUndo = true;
                this.moveLimit = null;
                this.timeLimit = null;
                break;
            case 'normal':
                this.enableHints = false;
                this.enableTimer = false;
                this.enableUndo = false;
                this.moveLimit = null;
                this.timeLimit = null;
                break;
            case 'hard':
                this.enableHints = false;
                this.enableTimer = false;
                this.enableUndo = false;
                this.moveLimit = 50; // Limited moves
                this.timeLimit = null;
                break;
            case 'expert':
                this.enableHints = false;
                this.enableTimer = true;
                this.enableUndo = false;
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
        
        // Add placement effects
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.effectsManager.onBlockPlace(centerX, centerY);
        
        // Remove the used block
        this.blockManager.removeBlock(this.selectedBlock.id);
        this.selectedBlock = null;
        this.previewPosition = null;
        
        // Update UI
        this.blockPalette.updateBlocks(this.blockManager.currentBlocks);
        this.drawBoard();
        this.updateUI();
        
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
        
        // Check for game over
        this.checkGameOver();
        
        // Auto-select the first available block
        this.autoSelectNextBlock();
    }

    // Enhanced game over detection with difficulty considerations
    checkGameOver() {
        if (this.blockManager.currentBlocks.length === 0) {
            return; // No blocks to check
        }
        
        // Check if any block can be placed anywhere on the board
        for (let block of this.blockManager.currentBlocks) {
            for (let row = 0; row < this.boardSize; row++) {
                for (let col = 0; col < this.boardSize; col++) {
                    if (this.blockManager.canPlaceBlock(block, row, col, this.board)) {
                        return; // Game can continue
                    }
                }
            }
        }
        
        // No blocks can be placed - game over
        this.gameOver();
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
