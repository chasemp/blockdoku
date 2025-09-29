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
    
    toggleHints() {
        if (this.hintsActive) {
            this.hideHints();
        } else {
            this.showHint();
        }
        
        // Update the hint button text
        if (this.game.updateHintControls) {
            this.game.updateHintControls();
        }
    }
    
    showHint() {
        if (!this.isHintAvailable()) return false;
        
        this.hintsActive = true;
        this.lastHintTime = Date.now();
        this.hintCooldown = this.cooldownDuration;
        
        // Find valid positions for the selected block
        this.findValidPositions();
        
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
        ctx.globalAlpha = 0.8;
        
        // Draw hints for top 3 positions
        const topPositions = this.validPositions.slice(0, 3);
        
        topPositions.forEach((pos, index) => {
            const x = pos.col * drawCellSize;
            const y = pos.row * drawCellSize;
            
            // Use subtle outline effect with consistent color
            const color = '#4CAF50'; // Subtle green
            const lineWidth = index === 0 ? 3 : 2; // Thicker line for best position
            
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.setLineDash(index === 0 ? [] : [5, 5]); // Solid line for best, dashed for others
            
            // Draw outline
            ctx.strokeRect(x + 1, y + 1, drawCellSize - 2, drawCellSize - 2);
            
            // Add subtle glow effect
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
            ctx.strokeRect(x + 1, y + 1, drawCellSize - 2, drawCellSize - 2);
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
