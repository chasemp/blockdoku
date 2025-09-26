/**
 * Blockdoku PWA - Hint System
 * Provides visual hints and suggestions for Easy mode
 */

export class HintSystem {
    constructor(game, difficultyManager) {
        this.game = game;
        this.difficultyManager = difficultyManager;
        this.hintsActive = false;
        this.validPositions = [];
        this.hintCooldown = 0;
        this.lastHintTime = 0;
        this.hintDuration = 5000; // 5 seconds
        this.cooldownDuration = 10000; // 10 seconds between hints
    }
    
    update(deltaTime) {
        if (this.hintCooldown > 0) {
            this.hintCooldown -= deltaTime;
        }
    }
    
    isHintAvailable() {
        return this.difficultyManager.isHintsEnabled() && 
               this.game.enableHints && 
               this.hintCooldown <= 0 && 
               this.game.selectedBlock !== null;
    }
    
    showHint() {
        if (!this.isHintAvailable()) return false;
        
        this.hintsActive = true;
        this.lastHintTime = Date.now();
        this.hintCooldown = this.cooldownDuration;
        
        // Find valid positions for the selected block
        this.findValidPositions();
        
        // Auto-hide hints after duration
        setTimeout(() => {
            this.hideHints();
        }, this.hintDuration);
        
        return true;
    }
    
    hideHints() {
        this.hintsActive = false;
        this.validPositions = [];
        this.game.drawBoard(); // Redraw to remove hints
    }
    
    findValidPositions() {
        if (!this.game.selectedBlock) return;
        
        this.validPositions = [];
        const block = this.game.selectedBlock;
        const board = this.game.board;
        const boardSize = this.game.boardSize;
        
        // Check all possible positions
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (this.game.canPlaceBlock(row, col)) {
                    this.validPositions.push({ row, col });
                }
            }
        }
        
        // Sort by priority (positions that create line clears first)
        this.validPositions.sort((a, b) => {
            const scoreA = this.calculatePositionScore(a.row, a.col, block);
            const scoreB = this.calculatePositionScore(b.row, b.col, block);
            return scoreB - scoreA;
        });
    }
    
    calculatePositionScore(row, col, block) {
        // Simulate placing the block and calculate potential score
        let score = 0;
        
        // Check for potential line clears
        const tempBoard = this.simulateBlockPlacement(row, col, block);
        const clearedLines = this.game.scoringSystem.checkAndClearLines(tempBoard);
        
        score += (clearedLines.rows.length + clearedLines.columns.length + clearedLines.squares.length) * 100;
        
        // Bonus for positions that create multiple clears
        if (clearedLines.rows.length > 1 || clearedLines.columns.length > 1 || clearedLines.squares.length > 1) {
            score += 200;
        }
        
        // Bonus for positions near the center
        const centerRow = this.game.boardSize / 2;
        const centerCol = this.game.boardSize / 2;
        const distanceFromCenter = Math.abs(row - centerRow) + Math.abs(col - centerCol);
        score += (this.game.boardSize - distanceFromCenter) * 10;
        
        return score;
    }
    
    simulateBlockPlacement(row, col, block) {
        // Create a copy of the board and simulate placing the block
        const tempBoard = this.game.board.map(row => [...row]);
        
        if (this.game.blockManager.canPlaceBlock(block, row, col, tempBoard)) {
            return this.game.blockManager.placeBlock(block, row, col, tempBoard);
        }
        
        return tempBoard;
    }
    
    drawHints(ctx) {
        if (!this.hintsActive || this.validPositions.length === 0) return;
        
        const drawCellSize = this.game.actualCellSize || this.game.cellSize;
        
        ctx.save();
        ctx.globalAlpha = 0.6;
        
        // Draw hints for top 3 positions
        const topPositions = this.validPositions.slice(0, 3);
        
        topPositions.forEach((pos, index) => {
            const x = pos.col * drawCellSize;
            const y = pos.row * drawCellSize;
            
            // Different colors for different priority levels
            let color;
            switch (index) {
                case 0: color = '#00ff00'; break; // Green for best
                case 1: color = '#ffff00'; break; // Yellow for second
                case 2: color = '#ff8800'; break; // Orange for third
            }
            
            ctx.fillStyle = color;
            ctx.fillRect(x + 2, y + 2, drawCellSize - 4, drawCellSize - 4);
            
            // Add glow effect
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 2, y + 2, drawCellSize - 4, drawCellSize - 4);
        });
        
        ctx.restore();
    }
    
    getHintCount() {
        return this.validPositions.length;
    }
    
    getBestPosition() {
        return this.validPositions.length > 0 ? this.validPositions[0] : null;
    }
    
    getHintStatus() {
        return {
            active: this.hintsActive,
            available: this.isHintAvailable(),
            cooldownRemaining: Math.max(0, this.hintCooldown),
            validPositions: this.validPositions.length
        };
    }
    
    // Force show hints (for tutorial or special cases)
    forceShowHints() {
        this.hintsActive = true;
        this.hintCooldown = 0;
        this.findValidPositions();
    }
    
    // Reset hint system
    reset() {
        this.hintsActive = false;
        this.validPositions = [];
        this.hintCooldown = 0;
        this.lastHintTime = 0;
    }
}
