/**
 * UIManager - UI Rendering and DOM Management
 * 
 * This class handles all DOM manipulation, canvas rendering, and UI updates.
 * It receives game state and renders the appropriate visual representation.
 * No game logic - purely presentational.
 */

export class UIManager {
    constructor(dependencies = {}) {
        // Injected dependencies
        this.gameEngine = dependencies.gameEngine;
        this.effectsManager = dependencies.effectsManager;
        this.blockPalette = dependencies.blockPalette;
        
        // DOM elements
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        
        // UI state
        this.cellSize = 0;
        this.actualCellSize = 0;
        this.boardSize = 9;
        this.previewPosition = null;
        this.pendingClears = null;
        
        // Theme and visual settings
        this.currentTheme = 'light';
        this.animationsEnabled = true;
        
        // Animation tracking
        this.previousScore = 0;
        this.previousLevel = 1;
        this.previousCombo = 0;
        
        // Initialize UI
        this.setupEventListeners();
        this.setupResizeHandler();
    }

    /**
     * Initialize the UI system
     */
    initialize() {
        this.resizeCanvas();
        this.render();
    }

    /**
     * Main render method - updates all UI elements based on game state
     * @param {Object} gameState - Current game state from GameEngine
     */
    render(gameState = null) {
        if (!gameState && this.gameEngine) {
            gameState = this.gameEngine.getGameState();
        }
        
        if (gameState) {
            this.updateScoreDisplay(gameState.score, gameState.level);
            this.updateComboDisplay(gameState.stats);
        }
        
        this.drawBoard(gameState);
        
        if (this.effectsManager) {
            this.effectsManager.render();
        }
    }

    /**
     * Resize canvas to fit container
     */
    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        if (!container) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Use the smaller dimension to maintain square aspect ratio
        const size = Math.min(containerWidth, containerHeight);
        
        // Set canvas size accounting for device pixel ratio
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = size * dpr;
        this.canvas.height = size * dpr;
        
        // Set CSS size
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';
        
        // Scale context for high DPI displays
        this.ctx.scale(dpr, dpr);
        
        // Calculate cell size
        this.cellSize = size / this.boardSize;
        this.actualCellSize = this.cellSize;
        
        console.log(`Canvas resized: ${size}x${size}, cellSize: ${this.cellSize}`);
    }

    /**
     * Draw the game board
     * @param {Object} gameState - Current game state
     */
    drawBoard(gameState = null) {
        if (!this.ctx || this.cellSize === 0 || this.canvas.width === 0) {
            return;
        }

        const ctx = this.ctx;
        const board = gameState?.board || (this.gameEngine?.board) || [];
        
        if (!Array.isArray(board) || board.length === 0) {
            console.warn('UIManager: No valid board to draw');
            return;
        }

        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width / (window.devicePixelRatio || 1), 
                     this.canvas.height / (window.devicePixelRatio || 1));

        // Draw grid lines
        this.drawGrid(ctx);
        
        // Draw filled cells
        this.drawFilledCells(ctx, board);
        
        // Draw 3x3 square separators
        this.drawSquareSeparators(ctx);
        
        // Draw preview if available
        if (this.previewPosition && this.selectedBlock) {
            this.drawBlockPreview(ctx, this.selectedBlock, this.previewPosition);
        }
        
        // Draw pending clear highlights
        if (this.pendingClears) {
            this.drawPendingClears(ctx, this.pendingClears);
        }
    }

    /**
     * Draw grid lines
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawGrid(ctx) {
        ctx.save();
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--grid-color') || '#ddd';
        ctx.lineWidth = 1;

        // Draw vertical lines
        for (let col = 0; col <= this.boardSize; col++) {
            const x = col * this.cellSize;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.boardSize * this.cellSize);
            ctx.stroke();
        }

        // Draw horizontal lines
        for (let row = 0; row <= this.boardSize; row++) {
            const y = row * this.cellSize;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.boardSize * this.cellSize, y);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Draw filled cells on the board
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Array} board - Game board state
     */
    drawFilledCells(ctx, board) {
        ctx.save();
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--block-color') || '#333';
        
        for (let row = 0; row < this.boardSize; row++) {
            if (!board[row] || !Array.isArray(board[row])) {
                continue;
            }
            
            for (let col = 0; col < this.boardSize; col++) {
                if (board[row][col] === 1) {
                    const x = col * this.cellSize;
                    const y = row * this.cellSize;
                    
                    // Add small padding for visual separation
                    const padding = 1;
                    ctx.fillRect(x + padding, y + padding, 
                               this.cellSize - 2 * padding, 
                               this.cellSize - 2 * padding);
                }
            }
        }
        
        ctx.restore();
    }

    /**
     * Draw 3x3 square separators
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawSquareSeparators(ctx) {
        ctx.save();
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--grid-separator-color') || '#999';
        ctx.lineWidth = 2;

        // Draw thicker lines every 3 cells
        for (let i = 3; i < this.boardSize; i += 3) {
            // Vertical separators
            const x = i * this.cellSize;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.boardSize * this.cellSize);
            ctx.stroke();

            // Horizontal separators
            const y = i * this.cellSize;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.boardSize * this.cellSize, y);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Draw block preview
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} block - Block to preview
     * @param {Object} position - Preview position
     */
    drawBlockPreview(ctx, block, position) {
        if (!block || !block.shape || !position) return;

        ctx.save();
        
        // Check if placement is valid
        const isValid = this.gameEngine ? 
            this.gameEngine.canPlaceBlock(block, position.row, position.col) : true;
            
        ctx.fillStyle = isValid ? 
            'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';

        // Draw preview blocks
        for (let r = 0; r < block.shape.length; r++) {
            for (let c = 0; c < block.shape[r].length; c++) {
                if (block.shape[r][c] === 1) {
                    const boardRow = position.row + r;
                    const boardCol = position.col + c;
                    
                    if (boardRow >= 0 && boardRow < this.boardSize && 
                        boardCol >= 0 && boardCol < this.boardSize) {
                        const x = boardCol * this.cellSize;
                        const y = boardRow * this.cellSize;
                        
                        const padding = 2;
                        ctx.fillRect(x + padding, y + padding, 
                                   this.cellSize - 2 * padding, 
                                   this.cellSize - 2 * padding);
                    }
                }
            }
        }
        
        ctx.restore();
    }

    /**
     * Draw pending line clear highlights
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} pendingClears - Lines about to be cleared
     */
    drawPendingClears(ctx, pendingClears) {
        if (!pendingClears) return;

        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 0, 0.4)'; // Yellow highlight

        // Highlight rows
        pendingClears.rows?.forEach(row => {
            const y = row * this.cellSize;
            ctx.fillRect(0, y, this.boardSize * this.cellSize, this.cellSize);
        });

        // Highlight columns
        pendingClears.columns?.forEach(col => {
            const x = col * this.cellSize;
            ctx.fillRect(x, 0, this.cellSize, this.boardSize * this.cellSize);
        });

        // Highlight 3x3 squares
        pendingClears.squares?.forEach(square => {
            const startX = square.col * 3 * this.cellSize;
            const startY = square.row * 3 * this.cellSize;
            ctx.fillRect(startX, startY, 3 * this.cellSize, 3 * this.cellSize);
        });

        ctx.restore();
    }

    /**
     * Update score display
     * @param {number} score - Current score
     * @param {number} level - Current level
     */
    updateScoreDisplay(score, level) {
        const scoreElement = document.getElementById('score');
        const levelElement = document.getElementById('level');
        
        if (scoreElement) {
            // Animate score change if it increased
            if (score > this.previousScore && this.animationsEnabled) {
                this.animateScoreChange(scoreElement, this.previousScore, score);
            } else {
                scoreElement.textContent = score.toLocaleString();
            }
        }
        
        if (levelElement) {
            // Animate level change if it increased
            if (level > this.previousLevel && this.animationsEnabled) {
                this.animateLevelChange(levelElement, level);
            } else {
                levelElement.textContent = level;
            }
        }
        
        this.previousScore = score;
        this.previousLevel = level;
    }

    /**
     * Update combo display
     * @param {Object} stats - Game statistics
     */
    updateComboDisplay(stats) {
        const comboElement = document.getElementById('combo');
        
        if (comboElement && stats) {
            const combo = stats.combo || 0;
            const totalCombos = stats.totalCombos || 0;
            
            if (combo > 0) {
                comboElement.textContent = `Combo: ${combo}`;
                comboElement.style.display = 'block';
            } else {
                comboElement.style.display = 'none';
            }
            
            // Animate combo changes
            if (combo > this.previousCombo && this.animationsEnabled) {
                this.animateComboChange(comboElement);
            }
            
            this.previousCombo = combo;
        }
    }

    /**
     * Animate score change
     * @param {HTMLElement} element - Score element
     * @param {number} fromScore - Starting score
     * @param {number} toScore - Target score
     */
    animateScoreChange(element, fromScore, toScore) {
        const duration = 500; // ms
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            const currentScore = Math.floor(fromScore + (toScore - fromScore) * easeOut);
            element.textContent = currentScore.toLocaleString();
            
            if (progress < 1) {
                if (typeof requestAnimationFrame !== 'undefined') {
                    requestAnimationFrame(animate);
                } else {
                    // Fallback for Node.js testing
                    setTimeout(animate, 16);
                }
            }
        };
        
        animate();
    }

    /**
     * Animate level change
     * @param {HTMLElement} element - Level element
     * @param {number} newLevel - New level
     */
    animateLevelChange(element, newLevel) {
        element.textContent = newLevel;
        element.classList.add('level-up');
        
        setTimeout(() => {
            element.classList.remove('level-up');
        }, 1000);
    }

    /**
     * Animate combo change
     * @param {HTMLElement} element - Combo element
     */
    animateComboChange(element) {
        element.classList.add('combo-pulse');
        
        setTimeout(() => {
            element.classList.remove('combo-pulse');
        }, 600);
    }

    /**
     * Show immediate visual feedback for line clears
     * @param {Object} clearedLines - Lines that were cleared
     */
    showClearFeedback(clearedLines) {
        this.pendingClears = clearedLines;
        this.render();
        
        // Clear the highlight after animation
        setTimeout(() => {
            this.pendingClears = null;
            this.render();
        }, 400);
    }

    /**
     * Set preview position for block placement
     * @param {Object} position - {row, col} position
     * @param {Object} block - Block to preview
     */
    setPreview(position, block) {
        this.previewPosition = position;
        this.selectedBlock = block;
        // Note: Caller should call render() after this
    }

    /**
     * Clear preview
     */
    clearPreview() {
        this.previewPosition = null;
        this.selectedBlock = null;
        // Note: Caller should call render() after this
    }

    /**
     * Apply theme
     * @param {string} theme - Theme name
     */
    applyTheme(theme) {
        this.currentTheme = theme;
        document.body.className = `theme-${theme}`;
        
        // Redraw with new theme colors
        this.render();
    }

    /**
     * Set animation settings
     * @param {boolean} enabled - Whether animations are enabled
     */
    setAnimationsEnabled(enabled) {
        this.animationsEnabled = enabled;
    }

    /**
     * Get canvas position from screen coordinates
     * @param {number} clientX - Screen X coordinate
     * @param {number} clientY - Screen Y coordinate
     * @returns {Object} Canvas coordinates
     */
    getCanvasPosition(clientX, clientY) {
        if (!this.canvas) return null;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        return {
            x: x * (this.canvas.width / rect.width),
            y: y * (this.canvas.height / rect.height)
        };
    }

    /**
     * Get board position from canvas coordinates
     * @param {number} canvasX - Canvas X coordinate
     * @param {number} canvasY - Canvas Y coordinate
     * @returns {Object} Board coordinates
     */
    getBoardPosition(canvasX, canvasY) {
        const dpr = window.devicePixelRatio || 1;
        const adjustedX = canvasX / dpr;
        const adjustedY = canvasY / dpr;
        
        const col = Math.floor(adjustedX / this.cellSize);
        const row = Math.floor(adjustedY / this.cellSize);
        
        return { row, col };
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (!this.canvas) return;
        
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    }

    /**
     * Setup resize handler
     */
    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            if (typeof requestAnimationFrame !== 'undefined') {
                requestAnimationFrame(() => {
                    this.render();
                });
            } else {
                // Fallback for Node.js testing
                setTimeout(() => {
                    this.render();
                }, 16);
            }
        });
    }

    /**
     * Handle mouse move events
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseMove(e) {
        // This will be implemented when integrating with game logic
        // For now, just track the position
        const canvasPos = this.getCanvasPosition(e.clientX, e.clientY);
        if (canvasPos) {
            const boardPos = this.getBoardPosition(canvasPos.x, canvasPos.y);
            this.emit('mouseMove', { boardPos, canvasPos });
        }
    }

    /**
     * Handle mouse leave events
     */
    handleMouseLeave() {
        this.previewPosition = null;
        this.selectedBlock = null;
        this.emit('mouseLeave');
    }

    /**
     * Handle click events
     * @param {MouseEvent} e - Mouse event
     */
    handleClick(e) {
        const canvasPos = this.getCanvasPosition(e.clientX, e.clientY);
        if (canvasPos) {
            const boardPos = this.getBoardPosition(canvasPos.x, canvasPos.y);
            this.emit('click', { boardPos, canvasPos });
        }
    }

    /**
     * Handle touch start events
     * @param {TouchEvent} e - Touch event
     */
    handleTouchStart(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            const canvasPos = this.getCanvasPosition(touch.clientX, touch.clientY);
            if (canvasPos) {
                const boardPos = this.getBoardPosition(canvasPos.x, canvasPos.y);
                this.emit('touchStart', { boardPos, canvasPos });
            }
        }
    }

    /**
     * Handle touch move events
     * @param {TouchEvent} e - Touch event
     */
    handleTouchMove(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            const canvasPos = this.getCanvasPosition(touch.clientX, touch.clientY);
            if (canvasPos) {
                const boardPos = this.getBoardPosition(canvasPos.x, canvasPos.y);
                this.emit('touchMove', { boardPos, canvasPos });
            }
        }
    }

    /**
     * Handle touch end events
     * @param {TouchEvent} e - Touch event
     */
    handleTouchEnd(e) {
        e.preventDefault();
        this.emit('touchEnd');
    }

    /**
     * Simple event emitter
     * @param {string} eventName - Event name
     * @param {Object} data - Event data
     */
    emit(eventName, data) {
        const event = new CustomEvent(`ui-${eventName}`, { detail: data });
        document.dispatchEvent(event);
    }

    /**
     * Cleanup resources
     */
    destroy() {
        // Remove event listeners
        if (this.canvas) {
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
            this.canvas.removeEventListener('click', this.handleClick);
            this.canvas.removeEventListener('touchstart', this.handleTouchStart);
            this.canvas.removeEventListener('touchmove', this.handleTouchMove);
            this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        }
        
        window.removeEventListener('resize', this.setupResizeHandler);
    }
}
