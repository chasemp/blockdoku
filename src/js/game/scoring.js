/**
 * Blockdoku PWA - Scoring and Line Clearing System
 * MVT Milestone 3: Add line clearing logic (rows, columns, 3x3 squares)
 */

export class ScoringSystem {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        
        // Dual combo tracking system
        this.combo = 0;                    // Current streak combo
        this.maxCombo = 0;                 // Maximum streak combo achieved
        this.totalCombos = 0;              // Total cumulative combos (never resets)
        this.maxTotalCombos = 0;           // Maximum total combos in a single game
        
        // Streak bonus tracking system
        this.streakCount = 0;              // Current consecutive combo streak (resets on non-clearing placement)
        this.maxStreakCount = 0;           // Maximum streak achieved
        this.totalStreakBonus = 0;         // Total streak bonus points earned
        
        // Speed tracking system
        this.placementTimes = [];          // Array of timestamps for each block placement
        this.speedBonuses = [];            // Array of speed bonuses earned
        this.totalSpeedBonus = 0;          // Cumulative speed bonus points
        this.fastestPlacement = null;      // Fastest placement interval (in ms)
        this.averagePlacementSpeed = 0;    // Average placement speed
        
        // Detailed tracking for clears and scoring breakdown
        this.rowsClearedCount = 0;
        this.columnsClearedCount = 0;
        this.squaresClearedCount = 0;
        this.comboActivations = 0; // Number of clear events that qualified as a combo (>=2 types)
        this.pointsBreakdown = {
            linePoints: 0,       // Points from row/column clears (base, before difficulty multiplier)
            squarePoints: 0,     // Points from 3x3 square clears (base)
            comboBonusPoints: 0, // Points from combo bonuses added in the moment of clear (base)
            placementPoints: 0,  // Points from block placements (base)
            streakBonusPoints: 0 // Points from streak bonuses (base)
        };
        
        // Scoring multipliers
        this.basePoints = {
            single: 1,
            line: 15,
            square: 20,
            combo: 5
        };
        
        // Speed bonus configuration
        this.speedBonusConfig = {
            enabled: true,
            thresholds: [
                { maxTime: 500, bonus: 10, label: 'Lightning Fast' },    // < 0.5s
                { maxTime: 1000, bonus: 5, label: 'Very Fast' },         // < 1.0s
                { maxTime: 2000, bonus: 2, label: 'Fast' },              // < 2.0s
                { maxTime: 3000, bonus: 1, label: 'Quick' }               // < 3.0s
            ],
            maxBonus: 50,           // Maximum speed bonus per placement
            streakMultiplier: 1.5   // Multiplier for consecutive fast placements
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
    
    // Calculate score for clears without modifying state
    // Returns the score that would be gained, including all bonuses
    calculateScoreForClears(clearedLines, difficultyMultiplier = 1.0) {
        // Pre-calculate clear counts for efficiency
        const rowCount = clearedLines.rows.length;
        const colCount = clearedLines.columns.length;
        const squareCount = clearedLines.squares.length;
        const totalClears = rowCount + colCount + squareCount;
        
        // Early return if no clears
        if (totalClears === 0) {
            return {
                scoreGained: 0,
                isComboEvent: false,
                clearTypes: [],
                totalClears: 0,
                breakdown: { linePoints: 0, squarePoints: 0, comboBonus: 0 }
            };
        }
        
        // Calculate base points efficiently
        const linePoints = (rowCount + colCount) * this.basePoints.line;
        const squarePoints = squareCount * this.basePoints.square;
        let scoreGained = linePoints + squarePoints;
        
        // Determine combo status efficiently
        const clearTypes = [];
        if (rowCount > 0) clearTypes.push('row');
        if (colCount > 0) clearTypes.push('column');
        if (squareCount > 0) clearTypes.push('square');
        const isComboEvent = clearTypes.length >= 2 || totalClears >= 2;
        
        // Calculate combo bonus if applicable
        let comboBonus = 0;
        if (isComboEvent) {
            comboBonus = this.calculateComboBonus(totalClears);
            scoreGained += comboBonus;
        }
        
        // Apply difficulty multiplier only (no level multiplier)
        const baseScoreGained = linePoints + squarePoints;
        const multipliedBaseScore = Math.floor(baseScoreGained * difficultyMultiplier);
        const multipliedComboBonus = Math.floor(comboBonus * difficultyMultiplier);
        scoreGained = multipliedBaseScore + multipliedComboBonus;
        
        return {
            scoreGained,
            isComboEvent,
            clearTypes,
            totalClears,
            breakdown: {
                linePoints: Math.floor(linePoints * difficultyMultiplier),
                squarePoints: Math.floor(squarePoints * difficultyMultiplier),
                comboBonus: multipliedComboBonus
            }
        };
    }
    
    // Clear lines from board without updating score
    // Returns the new board state and clear information
    clearLinesFromBoard(board, clearedLines) {
        console.log('ScoringSystem.clearLinesFromBoard called with:', { board, clearedLines });
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
        
        return {
            board: newBoard,
            clearedCount: totalCleared,
            clearedLines: clearedLines
        };
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
                // Update streak combo (resets when no combo)
                this.combo++;
                this.maxCombo = Math.max(this.maxCombo, this.combo);
                
                // Update streak count for consecutive combos
                this.streakCount++;
                this.maxStreakCount = Math.max(this.maxStreakCount, this.streakCount);
                
                // Update total combos (never resets, cumulative)
                this.totalCombos++;
                this.maxTotalCombos = Math.max(this.maxTotalCombos, this.totalCombos);
                
                this.comboActivations++;
            } else {
                this.combo = 0; // Reset streak combo if no simultaneous different types
                // Note: totalCombos is never reset - it's cumulative
            }
        } else {
            this.combo = 0;
            // Reset streak when no clears occur
            this.streakCount = 0;
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
        // Pre-calculate clear counts for efficiency
        const rowCount = clearedLines.rows.length;
        const colCount = clearedLines.columns.length;
        const squareCount = clearedLines.squares.length;
        const totalClears = rowCount + colCount + squareCount;
        
        // Early return if no clears
        if (totalClears === 0) return;
        
        // Calculate base points efficiently
        const linePointsAdded = (rowCount + colCount) * this.basePoints.line;
        const squarePointsAdded = squareCount * this.basePoints.square;
        let scoreGained = linePointsAdded + squarePointsAdded;
        
        // Calculate combo bonus if applicable
        let comboBonus = 0;
        let streakBonus = 0;
        if (isComboEvent) {
            comboBonus = this.calculateComboBonus(totalClears);
            scoreGained += comboBonus;
            
            // Calculate streak bonus for consecutive combos
            streakBonus = this.calculateStreakBonus(this.streakCount);
            scoreGained += streakBonus;
        }
        
        // Apply difficulty multiplier only (no level multiplier)
        const baseScoreGained = linePointsAdded + squarePointsAdded;
        const multipliedBaseScore = Math.floor(baseScoreGained * difficultyMultiplier);
        const multipliedComboBonus = Math.floor(comboBonus * difficultyMultiplier);
        const multipliedStreakBonus = Math.floor(streakBonus * difficultyMultiplier);
        scoreGained = multipliedBaseScore + multipliedComboBonus + multipliedStreakBonus;
        
        // Update tracking variables
        this.pointsBreakdown.linePoints += Math.floor(linePointsAdded * difficultyMultiplier);
        this.pointsBreakdown.squarePoints += Math.floor(squarePointsAdded * difficultyMultiplier);
        this.pointsBreakdown.comboBonusPoints += multipliedComboBonus;
        this.pointsBreakdown.streakBonusPoints += multipliedStreakBonus;
        
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
        
        // Track placement points in breakdown
        this.pointsBreakdown.placementPoints += adjustedPoints;

        // Update level using compounding thresholds
        this.updateLevelFromScore();
    }
    
    // Record block placement time and calculate speed bonus
    recordPlacementTime() {
        const currentTime = Date.now();
        this.placementTimes.push(currentTime);
        
        // Only calculate speed bonus if enabled
        if (!this.speedBonusConfig.enabled) {
            return;
        }
        
        // Calculate speed bonus if we have at least 2 placements
        if (this.placementTimes.length >= 2) {
            const timeSinceLastPlacement = currentTime - this.placementTimes[this.placementTimes.length - 2];
            const speedBonus = this.calculateSpeedBonus(timeSinceLastPlacement);
            
            if (speedBonus > 0) {
                this.speedBonuses.push({
                    time: timeSinceLastPlacement,
                    bonus: speedBonus,
                    timestamp: currentTime
                });
                this.totalSpeedBonus += speedBonus;
                this.score += speedBonus;
                this.lastScoreGained += speedBonus;
                
                // Update fastest placement
                if (!this.fastestPlacement || timeSinceLastPlacement < this.fastestPlacement) {
                    this.fastestPlacement = timeSinceLastPlacement;
                }
                
                // Update average placement speed
                this.updateAveragePlacementSpeed();
            }
        }
    }
    
    // Calculate speed bonus based on placement interval
    calculateSpeedBonus(intervalMs) {
        if (!this.speedBonusConfig.enabled || intervalMs <= 0) return 0;
        
        // Find the appropriate threshold
        for (const threshold of this.speedBonusConfig.thresholds) {
            if (intervalMs <= threshold.maxTime) {
                let bonus = threshold.bonus;
                
                // Apply streak multiplier for consecutive fast placements
                const recentFastPlacements = this.getRecentFastPlacements();
                if (recentFastPlacements >= 2) {
                    bonus = Math.floor(bonus * this.speedBonusConfig.streakMultiplier);
                }
                
                // Cap the bonus
                return Math.min(bonus, this.speedBonusConfig.maxBonus);
            }
        }
        
        return 0;
    }
    
    // Get count of recent fast placements (within last 5 placements)
    getRecentFastPlacements() {
        if (this.speedBonuses.length === 0) return 0;
        
        const recentCount = Math.min(5, this.speedBonuses.length);
        const recentBonuses = this.speedBonuses.slice(-recentCount);
        
        return recentBonuses.filter(bonus => bonus.bonus > 0).length;
    }
    
    // Update average placement speed
    updateAveragePlacementSpeed() {
        if (this.placementTimes.length < 2) {
            this.averagePlacementSpeed = 0;
            return;
        }
        
        let totalInterval = 0;
        for (let i = 1; i < this.placementTimes.length; i++) {
            totalInterval += this.placementTimes[i] - this.placementTimes[i - 1];
        }
        
        this.averagePlacementSpeed = totalInterval / (this.placementTimes.length - 1);
    }
    
    // Get speed statistics
    getSpeedStats() {
        return {
            totalSpeedBonus: this.totalSpeedBonus,
            fastestPlacement: this.fastestPlacement,
            averagePlacementSpeed: this.averagePlacementSpeed,
            speedBonuses: this.speedBonuses,
            recentFastPlacements: this.getRecentFastPlacements(),
            totalPlacements: this.placementTimes.length
        };
    }
    
    // Enable or disable speed bonus system
    setSpeedBonusEnabled(enabled) {
        this.speedBonusConfig.enabled = enabled;
    }
    
    // Check if speed bonus is enabled
    isSpeedBonusEnabled() {
        return this.speedBonusConfig.enabled;
    }
    
    // Reset streak count (called when a non-clearing block is placed)
    resetStreak() {
        this.streakCount = 0;
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
    
    getTotalCombos() {
        return this.totalCombos;
    }
    
    getMaxTotalCombos() {
        return this.maxTotalCombos;
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
        
        // Reset dual combo tracking
        this.combo = 0;
        this.maxCombo = 0;
        this.totalCombos = 0;
        this.maxTotalCombos = 0;
        
        // Reset streak tracking
        this.streakCount = 0;
        this.maxStreakCount = 0;
        this.totalStreakBonus = 0;
        
        // Reset speed tracking
        this.placementTimes = [];
        this.speedBonuses = [];
        this.totalSpeedBonus = 0;
        this.fastestPlacement = null;
        this.averagePlacementSpeed = 0;
        
        this.lastScoreGained = 0;
        this.rowsClearedCount = 0;
        this.columnsClearedCount = 0;
        this.squaresClearedCount = 0;
        this.comboActivations = 0;
        this.pointsBreakdown = { linePoints: 0, squarePoints: 0, comboBonusPoints: 0, placementPoints: 0, streakBonusPoints: 0 };
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
    // Calculate progressive combo bonus based on total clears
    // 2 lines: +10 points (first combo piece)
    // 3 lines: +10 + 15 = +25 points (first + second combo piece)
    // 4 lines: +10 + 15 + 15 = +40 points (first + second + third combo piece)
    // 5 lines: +10 + 15 + 15 + 50 = +90 points (first + second + third + fourth combo piece)
    // 6 lines: +10 + 15 + 15 + 50 + 100 = +190 points (first + second + third + fourth + fifth combo piece)
    calculateComboBonus(totalClears) {
        if (totalClears < 2) return 0;
        
        let bonus = 0;
        
        // For each line cleared beyond the first, add the appropriate bonus
        for (let i = 2; i <= totalClears; i++) {
            if (i === 2) {
                // 2nd line gets 10 points
                bonus += 10;
            } else if (i === 3 || i === 4) {
                // 3rd and 4th lines get 15 points each
                bonus += 15;
            } else if (i === 5) {
                // 5th line gets 50 points
                bonus += 50;
            } else if (i === 6) {
                // 6th line gets 100 points
                bonus += 100;
            } else {
                // 7th+ lines get 100 points each (same as 6th)
                bonus += 100;
            }
        }
        
        return bonus;
    }
    
    // Calculate streak bonus based on consecutive combo streak
    // 2nd combo in streak: +20 points
    // 3rd combo in streak: +30 points
    // 4th combo in streak: +40 points
    // 5th combo in streak: +50 points
    // 6th combo in streak: +60 points
    // 7th combo in streak: +70 points
    // 8th combo in streak: +80 points
    // 9th combo in streak: +90 points
    // 10th combo in streak: +100 points
    // 11th+ combo in streak: +100 points each
    calculateStreakBonus(streakCount) {
        if (streakCount < 2) return 0;
        
        // For streak count 2-10, use progressive bonus
        if (streakCount <= 10) {
            return streakCount * 10; // 20, 30, 40, 50, 60, 70, 80, 90, 100
        }
        
        // For streak count 11+, use 100 + (streakCount - 10) * 100
        return 100 + (streakCount - 10) * 100;
    }

    getStats() {
        return {
            score: this.score,
            level: this.level,
            linesCleared: this.linesCleared,
            combo: this.combo,
            maxCombo: this.maxCombo,
            totalCombos: this.totalCombos,
            maxTotalCombos: this.maxTotalCombos,
            streakCount: this.streakCount,
            maxStreakCount: this.maxStreakCount,
            totalStreakBonus: this.totalStreakBonus,
            rowClears: this.rowsClearedCount,
            columnClears: this.columnsClearedCount,
            squareClears: this.squaresClearedCount,
            comboActivations: this.comboActivations,
            breakdownBase: {
                linePoints: this.pointsBreakdown.linePoints,
                squarePoints: this.pointsBreakdown.squarePoints,
                comboBonusPoints: this.pointsBreakdown.comboBonusPoints,
                placementPoints: this.pointsBreakdown.placementPoints,
                streakBonusPoints: this.pointsBreakdown.streakBonusPoints
            },
            speedStats: this.getSpeedStats()
        };
    }
}
