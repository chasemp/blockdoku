/**
 * Blockdoku PWA - Main Application
 * MVT Milestone 2: Basic Block Placement System
 */

import { BlockManager } from './game/blocks.js';
import { BlockPalette } from './ui/block-palette.js';
import { ScoringSystem } from './game/scoring.js';
import { EffectsSystem } from './ui/effects.js';

class BlockdokuGame {
    constructor() {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.boardSize = 9;
        this.cellSize = 50; // 450px / 9 cells = 50px per cell
        this.board = this.initializeBoard();
        this.score = 0;
        this.level = 1;
        this.currentTheme = 'light';
        
        // Initialize block management
        this.blockManager = new BlockManager();
        this.blockPalette = new BlockPalette('block-palette', this.blockManager);
        this.scoringSystem = new ScoringSystem();
        this.effectsSystem = new EffectsSystem(this.canvas, this.ctx);
        this.selectedBlock = null;
        this.previewPosition = null;
        
        this.init();
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
        this.setupEventListeners();
        this.generateNewBlocks();
        this.drawBoard();
        this.updateUI();
        this.startGameLoop();
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
        this.effectsSystem.update();
    }
    
    draw() {
        this.drawBoard();
        this.effectsSystem.render();
    }
    
    setupEventListeners() {
        // Canvas click events
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.handleCanvasMouseLeave());
        
        // Button events
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('new-game').addEventListener('click', () => this.newGame());
        
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
        
        // Generate new blocks if needed
        if (this.blockManager.currentBlocks.length === 0) {
            this.generateNewBlocks();
        }
        
        // Auto-select the first available block
        this.autoSelectNextBlock();
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
    
    drawBoard() {
        const ctx = this.ctx;
        const cellSize = this.cellSize;
        
        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--board-bg');
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid lines
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--grid-line');
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let i = 0; i <= this.boardSize; i++) {
            const x = i * cellSize;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let i = 0; i <= this.boardSize; i++) {
            const y = i * cellSize;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
        
        // Draw 3x3 square borders (thicker lines)
        ctx.lineWidth = 2;
        for (let i = 0; i <= 3; i++) {
            const x = i * 3 * cellSize;
            const y = i * 3 * cellSize;
            
            // Vertical 3x3 borders
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
            
            // Horizontal 3x3 borders
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
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
        this.currentTheme = themes[nextIndex];
        
        // Update theme CSS
        const themeLink = document.getElementById('theme-css');
        themeLink.href = `css/themes/${this.currentTheme}.css`;
        
        // Redraw board with new colors
        this.drawBoard();
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
                    const x = (col + c) * cellSize + 1;
                    const y = (row + r) * cellSize + 1;
                    const size = cellSize - 2;
                    
                    ctx.fillRect(x, y, size, size);
                    ctx.strokeRect(x, y, size, size);
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
            
            // Create visual effects
            this.effectsSystem.createLineClearEffect(clearedLines);
            
            // Create score popup
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            this.effectsSystem.createScorePopup(centerX, centerY, result.scoreGained);
            
            // Create combo effect if applicable
            const combo = this.scoringSystem.getCombo();
            if (combo > 1) {
                this.effectsSystem.createComboEffect(combo, centerX, centerY + 50);
            }
            
            // Update UI
            this.updateUI();
        }
    }
    
    newGame() {
        this.board = this.initializeBoard();
        this.scoringSystem.reset();
        this.score = 0;
        this.level = 1;
        this.selectedBlock = null;
        this.previewPosition = null;
        this.effectsSystem.clear();
        this.generateNewBlocks();
        this.drawBoard();
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('combo').textContent = this.scoringSystem.getCombo();
    }
    
    // Get game statistics
    getStats() {
        return {
            score: this.score,
            level: this.level,
            linesCleared: this.scoringSystem.getLinesCleared(),
            combo: this.scoringSystem.getCombo(),
            maxCombo: this.scoringSystem.getMaxCombo()
        };
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BlockdokuGame();
});
