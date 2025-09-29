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
        // Each level has a range of points, with ranges increasing by 5% each level
        // Level 1: 0-100, Level 2: 101-206, Level 3: 207-317, etc.
        this.levelProgression = {
            baseRange: 100,        // Points range for level 1
            stepIncrease: 0.05,    // 5% increase in range per level
            roundingMode: 'round'  // Round ranges to nearest integer
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

    checkAndClearLines(board, difficultyMultiplier = 1.0) {
        const clearedLines = this.checkForCompletedLines(board);
        
        // Now process the clears and return the full result
        return this.applyClears(board, clearedLines, difficultyMultiplier);
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
    
    applyClears(board, clearedLines, difficultyMultiplier = 1.0) {
        console.log('ScoringSystem.applyClears called with:', { board, clearedLines });
        let newBoard = board.map(row => [...row]); // Deep copy
        let totalCleared = 0;
        
        // Clear rows
        clearedLines.rows.forEach(row => {
            console.log(`Clearing row ${row}`);
            newBoard[row] = new Array(board[0].length).fill(0);
            totalCleared++;
        });
        
        // Clear columns
        clearedLines.columns.forEach(col => {
            console.log(`Clearing column ${col}`);
            for (let row = 0; row < board.length; row++) {
                newBoard[row][col] = 0;
            }
            totalCleared++;
        });
        
        // Clear 3x3 squares
        clearedLines.squares.forEach(square => {
            console.log(`Clearing square at row ${square.row}, col ${square.col}`);
            const startRow = square.row * 3;
            const startCol = square.col * 3;
            
            for (let r = startRow; r < startRow + 3; r++) {
                for (let c = startCol; c < startCol + 3; c++) {
                    newBoard[r][c] = 0;
                }
            }
            totalCleared++;
        });
        
        console.log(`Total cleared: ${totalCleared}`);
        
        // Check for combo
		// Combo occurs when:
		// 1. Multiple different types clear simultaneously (row + column, row + square, etc.)
		// 2. OR 2+ lines of the same orientation (2 rows or 2 columns)
		// 3. OR 2+ squares clear simultaneously
		const clearTypes = [];
		if (clearedLines.rows.length > 0) clearTypes.push('row');
		if (clearedLines.columns.length > 0) clearTypes.push('column');
		if (clearedLines.squares.length > 0) clearTypes.push('square');
		const totalClearsThisEvent = clearedLines.rows.length + clearedLines.columns.length + clearedLines.squares.length;
		
		// A combo occurs when:
		// - Different types clear simultaneously (2+ different types)
		// - OR 2+ of the same type clear simultaneously
		const isComboEvent = clearTypes.length >= 2 || totalClearsThisEvent >= 2;
        
        // Calculate score and combo
        if (totalCleared > 0) {
            // Update per-type clear counters
            this.rowsClearedCount += clearedLines.rows.length;
            this.columnsClearedCount += clearedLines.columns.length;
            this.squaresClearedCount += clearedLines.squares.length;

            this.calculateScore(clearedLines, isComboEvent, difficultyMultiplier);
            this.linesCleared += totalCleared;
            
			// A combo occurs when 2+ total clears happen in the same clear event
			if (isComboEvent) {
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
			isCombo: isComboEvent,
            comboTypes: clearTypes,
            clearedLines: clearedLines // Include original clear information
        };
    }
    
    calculateScore(clearedLines, isComboEvent = false, difficultyMultiplier = 1.0) {
        let scoreGained = 0;
        
        // Base score for each type of clear
        const linePointsAdded = (clearedLines.rows.length + clearedLines.columns.length) * this.basePoints.line;
        const squarePointsAdded = clearedLines.squares.length * this.basePoints.square;
        scoreGained += linePointsAdded;
        scoreGained += squarePointsAdded;
        this.pointsBreakdown.linePoints += linePointsAdded;
        this.pointsBreakdown.squarePoints += squarePointsAdded;
        
		// Combo bonus scaling by total simultaneous clears (rows + columns + squares)
		// 2 clears => +20, 3 clears => +40, 4 clears => +60, +20 per additional
		const totalClears = clearedLines.rows.length + clearedLines.columns.length + clearedLines.squares.length;
		if (isComboEvent) {
			const comboBonus = 20 * (totalClears - 1);
			scoreGained += comboBonus;
			this.pointsBreakdown.comboBonusPoints += comboBonus;
		}
        
        // Apply level multiplier and difficulty multiplier
        scoreGained *= this.level;
        scoreGained = Math.floor(scoreGained * difficultyMultiplier);
        
        this.score += scoreGained;
        this.lastScoreGained = scoreGained;

        // Update level using compounding thresholds
        this.updateLevelFromScore();
    }
    
    // Add points for placing a block (no line clears required)
    addPlacementPoints(points, difficultyMultiplier = 1.0) {
        const gained = Math.max(0, points | 0);
        if (gained === 0) return;
        
        // Placement points are not level-multiplied but can be difficulty-multiplied
        const adjustedPoints = Math.floor(gained * difficultyMultiplier);
        this.score += adjustedPoints;
        this.lastScoreGained = adjustedPoints;

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

    // Compute threshold to reach a given level using compounding ranges
    // Level 1: 0-100, Level 2: 101-205, Level 3: 206-315, etc.
    getLevelThreshold(level) {
        if (level <= 1) return 0; // Level 1 starts at 0
        
        const baseRange = this.levelProgression.baseRange; // 100
        const stepIncrease = this.levelProgression.stepIncrease; // 0.05
        const rounding = this.levelProgression.roundingMode;
        
        let threshold = 101; // Level 2 starts at 101
        let currentRange = baseRange; // 100
        
        // Calculate threshold for each level by accumulating ranges
        for (let lvl = 2; lvl < level; lvl++) {
            currentRange = this.applyRounding(currentRange * (1 + stepIncrease), rounding);
            threshold += currentRange; // Add range for next level start
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
