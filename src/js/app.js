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
        this.selectedBlock = null;
        this.previewPosition = null;
        
        this.loadSettings();
        this.init();
        this.setupResizeHandler();
    }


    resizeCanvas() {
        // Get the container dimensions
        const container = this.canvas.parentElement;
        if (!container) return;
        
        const containerRect = container.getBoundingClientRect();
        const containerSize = Math.min(containerRect.width, containerRect.height);
        
        // Calculate cell size to perfectly fill the container
        this.cellSize = Math.floor(containerSize / this.boardSize);
        
        // Set canvas internal resolution to match container size exactly
        this.canvas.width = containerSize;
        this.canvas.height = containerSize;
        
        // Set canvas display size to match container size
        this.canvas.style.width = containerSize + 'px';
        this.canvas.style.height = containerSize + 'px';
        
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
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/public/sw.js');
                console.log('PWA: Service Worker registered successfully', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    console.log('PWA: Service Worker update found');
                });
            } catch (error) {
                console.error('PWA: Service Worker registration failed', error);
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
        // this.effectsSystem.update();
    }
    
    draw() {
        this.drawBoard();
        // this.effectsSystem.render();
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Canvas click events
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.handleCanvasMouseLeave());
        
        // Button events
        const settingsToggle = document.getElementById('settings-toggle');
        if (settingsToggle) {
            settingsToggle.addEventListener('click', () => {
                console.log('Settings button clicked - navigating to settings page');
                // NOTE: Settings is a separate PAGE (settings.html), not a modal!
                // The settings page contains: theme selection, difficulty settings, 
                // high scores, game settings, and the PWA install button.
                window.location.href = '/settings.html';
            });
        } else {
            console.error('Settings toggle button not found!');
        }
        
        const newGameBtn = document.getElementById('new-game');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.newGame());
        } else {
            console.error('New game button not found!');
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
            option.addEventListener('click', (e) => this.selectDifficulty(e.currentTarget.dataset.difficulty));
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
    }
    
    handleCanvasClick(e) {
        if (!this.selectedBlock) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (this.canPlaceBlock(row, col)) {
            this.placeBlock(row, col);
        }
    }
    
    handleCanvasMouseMove(e) {
        if (!this.selectedBlock) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        this.previewPosition = { row, col };
        this.drawBoard();
    }
    
    handleCanvasMouseLeave() {
        this.previewPosition = null;
        this.drawBoard();
    }
    
    handleBlockSelected(e) {
        this.selectedBlock = e.detail.block;
        this.previewPosition = null;
        this.drawBoard();
    }
    
    canPlaceBlock(row, col) {
        if (!this.selectedBlock) return false;
        return this.blockManager.canPlaceBlock(this.selectedBlock, row, col, this.board);
    }
    
    generateNewBlocks() {
        const newBlocks = this.blockManager.generateRandomBlocks(3);
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
        const cellSize = this.cellSize;
        
        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--board-bg');
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid lines with precise pixel alignment
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--grid-line');
        ctx.lineWidth = 1;
        
        // Use the full canvas dimensions for grid
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // Vertical lines - fill entire canvas height
        for (let i = 0; i <= this.boardSize; i++) {
            const x = Math.floor(i * cellSize);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight);
            ctx.stroke();
        }
        
        // Horizontal lines - fill entire canvas width
        for (let i = 0; i <= this.boardSize; i++) {
            const y = Math.floor(i * cellSize);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasWidth, y);
            ctx.stroke();
        }
        
        // Draw 3x3 square borders (thicker lines) with precise alignment
        ctx.lineWidth = 2;
        for (let i = 0; i <= 3; i++) {
            const x = Math.floor(i * 3 * cellSize);
            const y = Math.floor(i * 3 * cellSize);
            
            // Vertical 3x3 borders
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight);
            ctx.stroke();
            
            // Horizontal 3x3 borders
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasWidth, y);
            ctx.stroke();
        }
        
        // Draw filled cells
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--block-color');
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 1) {
                    const x = col * cellSize + 1;
                    const y = row * cellSize + 1;
                    const size = cellSize - 2;
                    
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
        const cellSize = this.cellSize;
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
        
        // Draw preview block
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c] === 1) {
                    const blockCol = col + c;
                    const blockRow = row + r;
                    
                    // Check if block cell is within bounds
                    if (blockCol >= 0 && blockCol < this.boardSize && 
                        blockRow >= 0 && blockRow < this.boardSize) {
                        const x = blockCol * cellSize + 1;
                        const y = blockRow * cellSize + 1;
                        const size = cellSize - 2;
                        
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
        
        // If any lines were cleared, process them
        if (clearedLines.rows.length > 0 || clearedLines.columns.length > 0 || clearedLines.squares.length > 0) {
            const result = this.scoringSystem.clearLines(this.board, clearedLines);
            this.board = result.board;
            
            // Update score and level
            this.score = this.scoringSystem.getScore();
            this.level = this.scoringSystem.getLevel();
            
            // Create visual effects (simplified without effects system for now)
            this.createLineClearEffect(clearedLines);
            
            // Create score popup (simplified)
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            this.createScorePopup(centerX, centerY, result.scoreGained);
            
            // Create combo effect if applicable
            const combo = this.scoringSystem.getCombo();
            if (combo > 1) {
                this.createComboEffect(combo, centerX, centerY + 50);
            }
            
            // Update UI
            this.updateUI();
        }
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
        // this.effectsSystem.clear();
        this.generateNewBlocks();
        this.drawBoard();
        this.updateUI();
        
        // Clear saved game state for new game
        this.storage.clearGameState();
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('combo').textContent = this.scoringSystem.getCombo();
    }
    
    // Simplified visual effects for line clearing
    createLineClearEffect(clearedLines) {
        // Simple visual feedback - redraw the board with a flash effect
        this.ctx.fillStyle = '#ffff00';
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1.0;
        
        // Redraw the board after a short delay
        setTimeout(() => {
            this.drawBoard();
        }, 100);
    }
    
    createScorePopup(x, y, scoreGained) {
        // Simple score popup using canvas text
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`+${scoreGained}`, x, y);
        
        // Clear the popup after a delay
        setTimeout(() => {
            this.drawBoard();
        }, 1000);
    }
    
    createComboEffect(combo, x, y) {
        // Simple combo effect using canvas text
        this.ctx.fillStyle = '#ff6600';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${combo}x COMBO!`, x, y);
        
        // Clear the combo effect after a delay
        setTimeout(() => {
            this.drawBoard();
        }, 1500);
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
            this.soundEnabled = settings.soundEnabled !== false;
            this.animationsEnabled = settings.animationsEnabled !== false;
            this.difficulty = settings.difficulty || 'normal';
            this.autoSave = settings.autoSave !== false;
            this.enableHints = settings.enableHints || false;
            this.enableTimer = settings.enableTimer || false;
            this.enableUndo = settings.enableUndo || false;
            this.showPoints = settings.showPoints || false;
            
            // Apply loaded theme
            this.applyTheme(this.currentTheme);
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
            showPoints: this.showPoints
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

    applyTheme(theme) {
        this.currentTheme = theme;
        const themeLink = document.getElementById('theme-css');
        themeLink.href = `css/themes/${theme}.css`;
        this.saveSettings();
    }

    // High Score Management
    checkHighScore() {
        const stats = this.getStats();
        if (this.storage.isHighScore(stats.score)) {
            this.storage.saveHighScore(stats);
            this.storage.saveStatistics(stats);
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
            linesCleared: this.scoringSystem.getTotalLinesCleared(),
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

    selectDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.applyDifficultySettings();
        this.updateDifficultyUI();
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
        
        const newBlocks = this.blockManager.generateRandomBlocks(blockCount, blockTypes);
        this.blockPalette.updateBlocks(newBlocks);
        this.updateBlockPointsDisplay();
        this.autoSelectNextBlock();
    }

    // Enhanced block placement with hints
    placeBlock(row, col) {
        if (!this.canPlaceBlock(row, col)) return;
        
        // Place the block on the board
        this.board = this.blockManager.placeBlock(this.selectedBlock, row, col, this.board);
        
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
