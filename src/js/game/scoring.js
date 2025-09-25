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
        
        // Scoring multipliers
        this.basePoints = {
            single: 10,
            line: 100,
            square: 500,
            combo: 50
        };
    }
    
    checkAndClearLines(board) {
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
    
    clearLines(board, clearedLines) {
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
        
        // Calculate score
        if (totalCleared > 0) {
            this.calculateScore(clearedLines);
            this.linesCleared += totalCleared;
            this.combo++;
            this.maxCombo = Math.max(this.maxCombo, this.combo);
        } else {
            this.combo = 0;
        }
        
        return {
            board: newBoard,
            clearedCount: totalCleared,
            scoreGained: this.getLastScoreGained()
        };
    }
    
    calculateScore(clearedLines) {
        let scoreGained = 0;
        
        // Base score for each type of clear
        scoreGained += clearedLines.rows.length * this.basePoints.line;
        scoreGained += clearedLines.columns.length * this.basePoints.line;
        scoreGained += clearedLines.squares.length * this.basePoints.square;
        
        // Combo bonus
        if (this.combo > 1) {
            scoreGained += (this.combo - 1) * this.basePoints.combo;
        }
        
        // Level multiplier
        scoreGained *= this.level;
        
        this.score += scoreGained;
        this.lastScoreGained = scoreGained;
        
        // Level up every 1000 points
        const newLevel = Math.floor(this.score / 1000) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
        }
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
    }
    
    // Get detailed statistics
    getStats() {
        return {
            score: this.score,
            level: this.level,
            linesCleared: this.linesCleared,
            combo: this.combo,
            maxCombo: this.maxCombo
        };
    }
}
