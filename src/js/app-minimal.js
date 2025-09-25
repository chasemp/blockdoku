/**
 * Blockdoku PWA - Minimal Test Version
 */

console.log('Minimal app.js loaded');

class BlockdokuGame {
    constructor() {
        console.log('BlockdokuGame constructor called');
        this.canvas = document.getElementById('game-board');
        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.boardSize = 9;
        this.cellSize = 50;
        this.board = this.initializeBoard();
        this.score = 0;
        this.level = 1;
        this.currentTheme = 'light';
        
        this.init();
    }
    
    initializeBoard() {
        const board = [];
        for (let row = 0; row < this.boardSize; row++) {
            board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                board[row][col] = 0;
            }
        }
        return board;
    }
    
    init() {
        console.log('BlockdokuGame init called');
        this.setupEventListeners();
        this.drawBoard();
        this.updateUI();
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners');
        // Canvas click events
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // Button events
        const themeToggle = document.getElementById('theme-toggle');
        const newGame = document.getElementById('new-game');
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        if (newGame) {
            newGame.addEventListener('click', () => this.newGame());
        }
    }
    
    handleCanvasClick(e) {
        console.log('Canvas clicked');
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize) {
            this.toggleCell(row, col);
            this.drawBoard();
            this.updateUI();
        }
    }
    
    toggleCell(row, col) {
        this.board[row][col] = this.board[row][col] === 0 ? 1 : 0;
    }
    
    drawBoard() {
        console.log('Drawing board');
        const ctx = this.ctx;
        const cellSize = this.cellSize;
        
        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid lines
        ctx.strokeStyle = '#ccc';
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
        
        // Draw 3x3 square borders
        ctx.lineWidth = 2;
        for (let i = 0; i <= 3; i++) {
            const x = i * 3 * cellSize;
            const y = i * 3 * cellSize;
            
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
        
        // Draw filled cells
        ctx.fillStyle = '#007bff';
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 1) {
                    const x = col * cellSize + 1;
                    const y = row * cellSize + 1;
                    const size = cellSize - 2;
                    
                    ctx.fillRect(x, y, size, size);
                    
                    ctx.strokeStyle = '#0056b3';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, size, size);
                }
            }
        }
    }
    
    toggleTheme() {
        console.log('Theme toggled');
        const themes = ['light', 'dark', 'wood'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.currentTheme = themes[nextIndex];
        
        const themeLink = document.getElementById('theme-css');
        if (themeLink) {
            themeLink.href = `css/themes/${this.currentTheme}.css`;
        }
        
        this.drawBoard();
    }
    
    newGame() {
        console.log('New game started');
        this.board = this.initializeBoard();
        this.score = 0;
        this.level = 1;
        this.drawBoard();
        this.updateUI();
    }
    
    updateUI() {
        const scoreElement = document.getElementById('score');
        const levelElement = document.getElementById('level');
        const comboElement = document.getElementById('combo');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (levelElement) levelElement.textContent = this.level;
        if (comboElement) comboElement.textContent = 0;
    }
}

// Initialize game when DOM is loaded
console.log('DOM loaded, initializing game');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    try {
        window.gameInstance = new BlockdokuGame();
        console.log('Game initialized successfully');
    } catch (e) {
        console.error('Error initializing game:', e);
    }
});
