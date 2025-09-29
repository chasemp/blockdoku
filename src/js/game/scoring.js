/**
 * Blockdoku PWA - Scoring and Line Clearing System
 * MVT Milestone 3: Add line clearing logic (rows, columns, 3x3 squares)
 */

export class ScoringSystem {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.combo = 0;
        this.maxCombo = 0;
        // Detailed tracking for clears and scoring breakdown
        this.rowsClearedCount = 0;
        this.columnsClearedCount = 0;
        this.squaresClearedCount = 0;
        this.comboActivations = 0; // Number of clear events that qualified as a combo (>=2 types)
        this.pointsBreakdown = {
            linePoints: 0,       // Points from row/column clears (base, before difficulty multiplier)
            squarePoints: 0,     // Points from 3x3 square clears (base)
            comboBonusPoints: 0  // Points from combo bonuses added in the moment of clear (base)
        };
        
        // Scoring multipliers
        this.basePoints = {
            single: 1,
            line: 15,
            square: 20,
            combo: 5
        };

        // Compounding level progression settings
        // baseThreshold: points required to reach level 2 from level 1
        // stepIncrease: incremental step per level in percent (e.g., 0.05 = 5%)
        // Example: L2 = ceil(L1 * (1 + 1*step)), L3 = ceil(L2 * (1 + 2*step)), ...
        this.levelProgression = {
            baseThreshold: 195,
            stepIncrease: 0.05,
            roundingMode: 'ceil'
        };
    }
    
    // Check for completed lines without clearing them
    checkForCompletedLines(board) {
        const clearedLines = {
            rows: [],
            columns: [],
            squares: []
        };
        
        // Check rows
        for (let row = 0; row < board.length; row++) {
            if (this.isRowComplete(board, row)) {
                clearedLines.rows.push(row);
            }
        }
        
        // Check columns
        for (let col = 0; col < board[0].length; col++) {
            if (this.isColumnComplete(board, col)) {
                clearedLines.columns.push(col);
            }
        }
        
        // Check 3x3 squares
        for (let squareRow = 0; squareRow < 3; squareRow++) {
            for (let squareCol = 0; squareCol < 3; squareCol++) {
                if (this.isSquareComplete(board, squareRow, squareCol)) {
                    clearedLines.squares.push({ row: squareRow, col: squareCol });
                }
            }
        }
        
        return clearedLines;
    }

    checkAndClearLines(board) {
        const clearedLines = this.checkForCompletedLines(board);
        
        // Now process the clears and return the full result
        return this.applyClears(board, clearedLines);
    }
    
    isRowComplete(board, row) {
        return board[row].every(cell => cell === 1);
    }
    
    isColumnComplete(board, col) {
        return board.every(row => row[col] === 1);
    }
    
    isSquareComplete(board, squareRow, squareCol) {
        const startRow = squareRow * 3;
        const startCol = squareCol * 3;
        
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if (board[r][c] !== 1) {
                    return false;
                }
            }
        }
        return true;
    }
    
    applyClears(board, clearedLines) {
        let newBoard = board.map(row => [...row]); // Deep copy
        let totalCleared = 0;
        
        // Clear rows
        clearedLines.rows.forEach(row => {
            newBoard[row] = new Array(board[0].length).fill(0);
            totalCleared++;
        });
        
        // Clear columns
        clearedLines.columns.forEach(col => {
            for (let row = 0; row < board.length; row++) {
                newBoard[row][col] = 0;
            }
            totalCleared++;
        });
        
        // Clear 3x3 squares
        clearedLines.squares.forEach(square => {
            const startRow = square.row * 3;
            const startCol = square.col * 3;
            
            for (let r = startRow; r < startRow + 3; r++) {
                for (let c = startCol; c < startCol + 3; c++) {
                    newBoard[r][c] = 0;
                }
            }
            totalCleared++;
        });
        
        // Check for combo
        // Previously: combo only when multiple different types clear simultaneously
        // Now also treat 2+ lines of the same orientation (2 rows or 2 columns) as a combo
        const clearTypes = [];
        if (clearedLines.rows.length > 0) clearTypes.push('row');
        if (clearedLines.columns.length > 0) clearTypes.push('column');
        if (clearedLines.squares.length > 0) clearTypes.push('square');
        const sameOrientationLineCombo = (clearedLines.rows.length >= 2) || (clearedLines.columns.length >= 2);
        
        // Calculate score and combo
        if (totalCleared > 0) {
            // Update per-type clear counters
            this.rowsClearedCount += clearedLines.rows.length;
            this.columnsClearedCount += clearedLines.columns.length;
            this.squaresClearedCount += clearedLines.squares.length;

            this.calculateScore(clearedLines);
            this.linesCleared += totalCleared;
            
            // A combo occurs when either:
            // - 2+ different types clear simultaneously, or
            // - 2+ rows clear, or 2+ columns clear in the same clear event
            if (clearTypes.length >= 2 || sameOrientationLineCombo) {
                this.combo++;
                this.maxCombo = Math.max(this.maxCombo, this.combo);
                this.comboActivations++;
            } else {
                this.combo = 0; // Reset combo if no simultaneous different types
            }
        } else {
            this.combo = 0;
        }
        
        return {
            board: newBoard,
            clearedCount: totalCleared,
            scoreGained: this.getLastScoreGained(),
            isCombo: (clearTypes.length >= 2) || sameOrientationLineCombo,
            comboTypes: clearTypes,
            clearedLines: clearedLines // Include original clear information
        };
    }
    
    calculateScore(clearedLines) {
        let scoreGained = 0;
        
        // Base score for each type of clear
        const linePointsAdded = (clearedLines.rows.length + clearedLines.columns.length) * this.basePoints.line;
        const squarePointsAdded = clearedLines.squares.length * this.basePoints.square;
        scoreGained += linePointsAdded;
        scoreGained += squarePointsAdded;
        this.pointsBreakdown.linePoints += linePointsAdded;
        this.pointsBreakdown.squarePoints += squarePointsAdded;
        
        // Combo bonus: apply +20 when the CURRENT clear qualifies as a combo
        // Combo if: 2+ different types OR at least two rows OR at least two columns
        const currentClearTypesCount = (clearedLines.rows.length > 0 ? 1 : 0)
            + (clearedLines.columns.length > 0 ? 1 : 0)
            + (clearedLines.squares.length > 0 ? 1 : 0);
        const sameOrientationLineCombo = (clearedLines.rows.length >= 2) || (clearedLines.columns.length >= 2);
        if (currentClearTypesCount >= 2 || sameOrientationLineCombo) {
            scoreGained += 20;
            this.pointsBreakdown.comboBonusPoints += 20;
        }
        
        // Level multiplier
        scoreGained *= this.level;
        
        this.score += scoreGained;
        this.lastScoreGained = scoreGained;

        // Update level using compounding thresholds
        this.updateLevelFromScore();
    }
    
    // Add points for placing a block (no line clears required)
    addPlacementPoints(points) {
        const gained = Math.max(0, points | 0);
        if (gained === 0) return;
        
        // Placement points are not level-multiplied
        this.score += gained;
        this.lastScoreGained = gained;

        // Update level using compounding thresholds
        this.updateLevelFromScore();
    }
    
    getLastScoreGained() {
        return this.lastScoreGained || 0;
    }
    
    getScore() {
        return this.score;
    }
    
    getLevel() {
        return this.level;
    }
    
    getCombo() {
        return this.combo;
    }
    
    getMaxCombo() {
        return this.maxCombo;
    }
    
    // Total number of times a combo has been activated during the current game
    getComboTotal() {
        return this.comboActivations;
    }
    
    getLinesCleared() {
        return this.linesCleared;
    }
    
    reset() {
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.lastScoreGained = 0;
        this.rowsClearedCount = 0;
        this.columnsClearedCount = 0;
        this.squaresClearedCount = 0;
        this.comboActivations = 0;
        this.pointsBreakdown = { linePoints: 0, squarePoints: 0, comboBonusPoints: 0 };
    }

    // ---------- Level Progression Helpers ----------
    applyRounding(value, mode) {
        switch (mode) {
            case 'ceil': return Math.ceil(value);
            case 'floor': return Math.floor(value);
            case 'round': return Math.round(value);
            default: return value;
        }
    }

    // Compute threshold to reach a given level (level 2 is first threshold)
    getLevelThreshold(level) {
        const base = this.levelProgression.baseThreshold;
        const step = this.levelProgression.stepIncrease;
        const rounding = this.levelProgression.roundingMode;
        if (level <= 1) return 0; // already at or below level 1
        let threshold = base;
        // For level n, apply multipliers for i = 1..(n-2) on successive thresholds
        for (let i = 2; i <= level; i++) {
            const incrementFactor = 1 + (i - 1) * step;
            threshold = this.applyRounding(threshold * incrementFactor, rounding);
        }
        return threshold;
    }

    // Derive level from total score using compounding thresholds
    updateLevelFromScore() {
        let newLevel = 1;
        // Prevent infinite loops by capping to a reasonable max level
        const maxLevels = 200;
        for (let lvl = 2; lvl <= maxLevels; lvl++) {
            const th = this.getLevelThreshold(lvl);
            if (this.score >= th) {
                newLevel = lvl;
                continue;
            }
            break;
        }
        if (newLevel > this.level) {
            this.level = newLevel;
        }
    }
    
    // Get detailed statistics
    getStats() {
        return {
            score: this.score,
            level: this.level,
            linesCleared: this.linesCleared,
            combo: this.combo,
            maxCombo: this.maxCombo,
            rowClears: this.rowsClearedCount,
            columnClears: this.columnsClearedCount,
            squareClears: this.squaresClearedCount,
            comboActivations: this.comboActivations,
            breakdownBase: {
                linePoints: this.pointsBreakdown.linePoints,
                squarePoints: this.pointsBreakdown.squarePoints,
                comboBonusPoints: this.pointsBreakdown.comboBonusPoints
            }
        };
    }
}
