/**
 * GameEngine - Pure Game Logic
 * 
 * This class contains ONLY the business logic for the Blockdoku game.
 * No DOM manipulation, no rendering, no UI concerns.
 * All methods return data that can be used by UI components.
 */

export class GameEngine {
    constructor(dependencies = {}) {
        // Injected dependencies
        this.blockManager = dependencies.blockManager;
        this.scoringSystem = dependencies.scoringSystem;
        this.difficultyManager = dependencies.difficultyManager;
        this.petrificationManager = dependencies.petrificationManager;
        this.deadPixelsManager = dependencies.deadPixelsManager;
        
        // Pure game state (no UI state)
        this.boardSize = 9;
        this.board = this.initializeBoard();
        this.score = 0;
        this.level = 1;
        this.isGameOver = false;
        this.moveCount = 0;
        this.gameStartTime = Date.now();
        
        // Game configuration
        this.difficulty = 'normal';
        this.enableHints = false;
        this.enableTimer = false;
        this.moveLimit = null;
        this.timeLimit = null;
    }

    /**
     * Initialize empty game board
     * @returns {Array<Array<number>>} 9x9 board filled with zeros
     */
    initializeBoard() {
        return Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(0));
    }

    /**
     * Get current game state (pure data)
     * @returns {Object} Complete game state
     */
    getGameState() {
        return {
            board: this.board.map(row => [...row]), // Deep copy
            score: this.score,
            level: this.level,
            isGameOver: this.isGameOver,
            moveCount: this.moveCount,
            difficulty: this.difficulty,
            gameStartTime: this.gameStartTime,
            availableBlocks: this.blockManager?.getCurrentBlocks() || [],
            stats: this.getGameStats()
        };
    }

    /**
     * Get game statistics
     * @returns {Object} Game statistics
     */
    getGameStats() {
        if (!this.scoringSystem) return {};
        
        return {
            linesCleared: this.scoringSystem.linesCleared,
            combo: this.scoringSystem.combo,
            maxCombo: this.scoringSystem.maxCombo,
            totalCombos: this.scoringSystem.totalCombos,
            blocksPlaced: this.moveCount,
            gameTime: Date.now() - this.gameStartTime
        };
    }

    /**
     * Validate if a block can be placed at a position
     * @param {Object} block - Block to place
     * @param {Object} position - {row, col} position
     * @returns {Object} Validation result
     */
    validateBlockPlacement(block, position) {
        if (!block || !position) {
            return { valid: false, reason: 'Invalid block or position' };
        }

        const { row, col } = position;

        // Check bounds and collisions
        for (let r = 0; r < block.shape.length; r++) {
            for (let c = 0; c < block.shape[r].length; c++) {
                if (block.shape[r][c] === 1) {
                    const boardRow = row + r;
                    const boardCol = col + c;

                    // Check bounds
                    if (boardRow < 0 || boardRow >= this.boardSize || 
                        boardCol < 0 || boardCol >= this.boardSize) {
                        return { valid: false, reason: 'Out of bounds' };
                    }

                    // Check collision
                    if (this.board[boardRow][boardCol] === 1) {
                        return { valid: false, reason: 'Collision detected' };
                    }
                }
            }
        }

        return { valid: true };
    }

    /**
     * Check if a block can be placed at a position (simplified interface)
     * @param {Object} block - Block to place
     * @param {number} row - Row position
     * @param {number} col - Column position
     * @returns {boolean} True if placement is valid
     */
    canPlaceBlock(block, row, col) {
        const validation = this.validateBlockPlacement(block, { row, col });
        return validation.valid;
    }

    /**
     * Place a block on the board
     * @param {Object} block - Block to place
     * @param {Object} position - {row, col} position
     * @returns {Object} Placement result with game state changes
     */
    placeBlock(block, position) {
        // Validate placement
        const validation = this.validateBlockPlacement(block, position);
        if (!validation.valid) {
            return {
                success: false,
                reason: validation.reason,
                gameState: this.getGameState()
            };
        }

        // Store previous state for undo
        const previousBoard = this.board.map(row => [...row]);
        const previousScore = this.score;

        // Place block on board
        const { row, col } = position;
        for (let r = 0; r < block.shape.length; r++) {
            for (let c = 0; c < block.shape[r].length; c++) {
                if (block.shape[r][c] === 1) {
                    this.board[row + r][col + c] = 1;
                }
            }
        }

        // Update move count
        this.moveCount++;

        // Calculate placement points
        const placementPoints = this.calculatePlacementPoints(block);
        
        // Check for line clears
        const clearResult = this.checkAndClearLines();
        
        // Calculate total score gained
        const totalScoreGained = placementPoints + clearResult.scoreGained;
        this.score += totalScoreGained;

        // Update level based on score
        this.updateLevel();

        // Remove the placed block from available blocks
        if (this.blockManager) {
            this.blockManager.removeBlock(block.id);
        }

        // Check if game is over
        const gameOverCheck = this.checkGameOver();

        return {
            success: true,
            scoreGained: totalScoreGained,
            placementPoints,
            clearResult,
            levelUp: this.level > previousScore / 1000 + 1,
            gameState: this.getGameState(),
            gameOver: gameOverCheck,
            previousState: {
                board: previousBoard,
                score: previousScore
            }
        };
    }

    /**
     * Place a block on the board (simplified interface for compatibility)
     * @param {Object} block - Block to place
     * @param {number} row - Row position
     * @param {number} col - Column position
     * @returns {boolean} True if placement succeeded
     */
    placeBlockSimple(block, row, col) {
        const result = this.placeBlock(block, { row, col });
        return result.success;
    }

    /**
     * Calculate points for placing a block (without line clears)
     * @param {Object} block - Placed block
     * @returns {number} Points gained from placement
     */
    calculatePlacementPoints(block) {
        if (!block || !block.shape) return 0;
        
        // Count filled cells in the block
        let cellCount = 0;
        for (let r = 0; r < block.shape.length; r++) {
            for (let c = 0; c < block.shape[r].length; c++) {
                if (block.shape[r][c] === 1) {
                    cellCount++;
                }
            }
        }

        // Base points per cell
        return cellCount * 2;
    }

    /**
     * Check for completed lines and clear them
     * @returns {Object} Clear result with score and cleared lines
     */
    checkAndClearLines() {
        const clearedLines = {
            rows: [],
            columns: [],
            squares: []
        };

        // Check rows
        for (let row = 0; row < this.boardSize; row++) {
            if (this.board[row].every(cell => cell === 1)) {
                clearedLines.rows.push(row);
            }
        }

        // Check columns
        for (let col = 0; col < this.boardSize; col++) {
            if (this.board.every(row => row[col] === 1)) {
                clearedLines.columns.push(col);
            }
        }

        // Check 3x3 squares
        for (let squareRow = 0; squareRow < 3; squareRow++) {
            for (let squareCol = 0; squareCol < 3; squareCol++) {
                if (this.isSquareComplete(squareRow, squareCol)) {
                    clearedLines.squares.push({ row: squareRow, col: squareCol });
                }
            }
        }

        // Clear the lines
        this.clearLines(clearedLines);

        // Calculate score from clearing
        const scoreGained = this.calculateClearScore(clearedLines);

        // Update scoring system if available
        if (this.scoringSystem) {
            this.scoringSystem.processLineClears(clearedLines, scoreGained);
        }

        return {
            clearedLines,
            scoreGained,
            totalLinesCleared: clearedLines.rows.length + clearedLines.columns.length + clearedLines.squares.length
        };
    }

    /**
     * Check if a row is complete
     * @param {Array} board - Board to check
     * @param {number} row - Row to check
     * @returns {boolean} True if row is complete
     */
    checkRowComplete(board, row) {
        return board[row].every(cell => cell === 1);
    }

    /**
     * Check if a column is complete
     * @param {Array} board - Board to check
     * @param {number} col - Column to check
     * @returns {boolean} True if column is complete
     */
    checkColumnComplete(board, col) {
        return board.every(row => row[col] === 1);
    }

    /**
     * Check if a 3x3 square is complete
     * @param {number} squareRow - Square row (0-2)
     * @param {number} squareCol - Square col (0-2)
     * @returns {boolean} True if square is complete
     */
    isSquareComplete(squareRow, squareCol) {
        const startRow = squareRow * 3;
        const startCol = squareCol * 3;

        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if (this.board[r][c] !== 1) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Clear completed lines from the board
     * @param {Object} clearedLines - Lines to clear
     */
    clearLines(clearedLines) {
        // Clear rows
        clearedLines.rows.forEach(row => {
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col] = 0;
            }
        });

        // Clear columns
        clearedLines.columns.forEach(col => {
            for (let row = 0; row < this.boardSize; row++) {
                this.board[row][col] = 0;
            }
        });

        // Clear squares
        clearedLines.squares.forEach(square => {
            const startRow = square.row * 3;
            const startCol = square.col * 3;
            for (let r = startRow; r < startRow + 3; r++) {
                for (let c = startCol; c < startCol + 3; c++) {
                    this.board[r][c] = 0;
                }
            }
        });
    }

    /**
     * Calculate score from clearing lines
     * @param {Object} clearedLines - Cleared lines
     * @returns {number} Score gained
     */
    calculateClearScore(clearedLines) {
        const rowScore = clearedLines.rows.length * 18;
        const colScore = clearedLines.columns.length * 18;
        const squareScore = clearedLines.squares.length * 35;

        let totalScore = rowScore + colScore + squareScore;

        // Combo bonus
        const totalClears = clearedLines.rows.length + clearedLines.columns.length + clearedLines.squares.length;
        if (totalClears >= 2) {
            totalScore += 25; // Combo bonus
        }

        return totalScore;
    }

    /**
     * Update level based on score
     */
    updateLevel() {
        const newLevel = Math.floor(this.score / 1000) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
        }
    }

    /**
     * Check if the game is over
     * @returns {Object} Game over result
     */
    checkGameOver() {
        if (!this.blockManager) {
            return { isGameOver: false };
        }

        const availableBlocks = this.blockManager.getCurrentBlocks();
        
        // If no blocks available, generate new ones
        if (availableBlocks.length === 0) {
            this.blockManager.generateNewBlocks();
            return { isGameOver: false };
        }

        // Check if any block can be placed anywhere
        for (const block of availableBlocks) {
            if (this.canPlaceBlockAnywhere(block)) {
                return { isGameOver: false };
            }
        }

        // No blocks can be placed - game over
        this.isGameOver = true;
        return {
            isGameOver: true,
            finalScore: this.score,
            finalLevel: this.level,
            stats: this.getGameStats()
        };
    }

    /**
     * Check if a block can be placed anywhere on the board
     * @param {Object} block - Block to check
     * @returns {boolean} True if block can be placed
     */
    canPlaceBlockAnywhere(block) {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const validation = this.validateBlockPlacement(block, { row, col });
                if (validation.valid) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Get valid positions for a block
     * @param {Object} block - Block to check
     * @returns {Array} Array of valid positions
     */
    getValidPositions(block) {
        const validPositions = [];
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const validation = this.validateBlockPlacement(block, { row, col });
                if (validation.valid) {
                    validPositions.push({ row, col });
                }
            }
        }
        
        return validPositions;
    }

    /**
     * Start a new game
     * @param {Object} options - Game options
     */
    newGame(options = {}) {
        this.board = this.initializeBoard();
        this.score = 0;
        this.level = 1;
        this.isGameOver = false;
        this.moveCount = 0;
        this.gameStartTime = Date.now();
        
        // Apply options
        if (options.difficulty) {
            this.difficulty = options.difficulty;
        }
        
        // Reset managers
        if (this.blockManager) {
            this.blockManager.generateNewBlocks();
        }
        
        if (this.scoringSystem) {
            this.scoringSystem.reset();
        }

        return this.getGameState();
    }

    /**
     * Load game state
     * @param {Object} state - Saved game state
     */
    loadGameState(state) {
        if (!state) return;
        
        this.board = state.board || this.initializeBoard();
        this.score = state.score || 0;
        this.level = state.level || 1;
        this.isGameOver = state.isGameOver || false;
        this.moveCount = state.moveCount || 0;
        this.gameStartTime = state.gameStartTime || Date.now();
        this.difficulty = state.difficulty || 'normal';
    }

    /**
     * Get hint for best block placement
     * @returns {Object} Hint information
     */
    getHint() {
        if (!this.enableHints || !this.blockManager) {
            return { available: false, reason: 'Hints not enabled' };
        }

        const availableBlocks = this.blockManager.getCurrentBlocks();
        if (availableBlocks.length === 0) {
            return { available: false, reason: 'No blocks available' };
        }

        // Find the best placement for any available block
        let bestPlacement = null;
        let bestScore = 0;

        for (const block of availableBlocks) {
            const validPositions = this.getValidPositions(block);
            
            for (const position of validPositions) {
                // Simulate placement to calculate potential score
                const score = this.simulatePlacement(block, position);
                if (score > bestScore) {
                    bestScore = score;
                    bestPlacement = { block, position, score };
                }
            }
        }

        if (bestPlacement) {
            return {
                available: true,
                block: bestPlacement.block,
                position: bestPlacement.position,
                expectedScore: bestPlacement.score
            };
        }

        return { available: false, reason: 'No valid placements found' };
    }

    /**
     * Simulate placing a block to calculate potential score
     * @param {Object} block - Block to simulate
     * @param {Object} position - Position to simulate
     * @returns {number} Potential score gain
     */
    simulatePlacement(block, position) {
        // Create a copy of the board
        const boardCopy = this.board.map(row => [...row]);
        
        // Place block on copy
        const { row, col } = position;
        for (let r = 0; r < block.shape.length; r++) {
            for (let c = 0; c < block.shape[r].length; c++) {
                if (block.shape[r][c] === 1) {
                    boardCopy[row + r][col + c] = 1;
                }
            }
        }

        // Check what would be cleared
        let score = this.calculatePlacementPoints(block);
        
        // Check for potential line clears
        const clearedLines = this.simulateLineClear(boardCopy);
        score += this.calculateClearScore(clearedLines);

        return score;
    }

    /**
     * Simulate line clearing on a board copy
     * @param {Array} boardCopy - Copy of the board
     * @returns {Object} Simulated clear result
     */
    simulateLineClear(boardCopy) {
        const clearedLines = {
            rows: [],
            columns: [],
            squares: []
        };

        // Check rows
        for (let row = 0; row < this.boardSize; row++) {
            if (boardCopy[row].every(cell => cell === 1)) {
                clearedLines.rows.push(row);
            }
        }

        // Check columns
        for (let col = 0; col < this.boardSize; col++) {
            if (boardCopy.every(row => row[col] === 1)) {
                clearedLines.columns.push(col);
            }
        }

        // Check 3x3 squares
        for (let squareRow = 0; squareRow < 3; squareRow++) {
            for (let squareCol = 0; squareCol < 3; squareCol++) {
                if (this.isSquareCompleteOnBoard(boardCopy, squareRow, squareCol)) {
                    clearedLines.squares.push({ row: squareRow, col: squareCol });
                }
            }
        }

        return clearedLines;
    }

    /**
     * Check if a 3x3 square is complete on a specific board
     * @param {Array} board - Board to check
     * @param {number} squareRow - Square row (0-2)
     * @param {number} squareCol - Square col (0-2)
     * @returns {boolean} True if square is complete
     */
    isSquareCompleteOnBoard(board, squareRow, squareCol) {
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
}
