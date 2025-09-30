/**
 * Petrification Manager
 * Tracks and manages the petrification state of grid cells and available blocks
 */

export class PetrificationManager {
    constructor() {
        this.enabled = false;
        
        // Grid cell petrification tracking
        // Structure: { "row,col": { timestamp: Date.now(), warned7s: false, warned3s: false } }
        this.gridCellTimestamps = {};
        
        // Available block petrification tracking
        // Structure: { blockId: { timestamp: Date.now(), warned7s: false, warned3s: false } }
        this.blockTimestamps = {};
        
        // Timing constants (in milliseconds)
        this.GRID_CELL_PETRIFY_TIME = 10000; // 10 seconds
        this.BLOCK_PETRIFY_TIME = 30000; // 30 seconds
        this.WARNING_7S_TIME = 7000; // 7 seconds before petrification
        this.WARNING_3S_TIME = 3000; // 3 seconds before petrification
        
        // Statistics
        this.stats = {
            gridCellsPetrified: 0,
            blocksPetrified: 0,
            gridCellsThawed: 0,
            blocksThawed: 0,
            totalPetrificationTime: 0 // Total time cells/blocks spent petrified
        };
    }
    
    /**
     * Enable or disable the petrification system
     */
    setEnabled(enabled) {
        const wasEnabled = this.enabled;
        this.enabled = enabled;
        
        // If disabling, clear all petrification state and reset times
        if (wasEnabled && !enabled) {
            this.resetAll();
        }
    }
    
    /**
     * Check if petrification is enabled
     */
    isEnabled() {
        return this.enabled;
    }
    
    /**
     * Reset all petrification tracking (called when toggling off)
     */
    resetAll() {
        this.gridCellTimestamps = {};
        this.blockTimestamps = {};
    }
    
    /**
     * Track a grid cell that was just filled
     */
    trackGridCell(row, col) {
        if (!this.enabled) return;
        
        const key = `${row},${col}`;
        this.gridCellTimestamps[key] = {
            timestamp: Date.now(),
            warned7s: false,
            warned3s: false,
            petrified: false
        };
    }
    
    /**
     * Untrack a grid cell (when it's cleared)
     */
    untrackGridCell(row, col) {
        const key = `${row},${col}`;
        delete this.gridCellTimestamps[key];
    }
    
    /**
     * Track an available block
     */
    trackBlock(blockId) {
        if (!this.enabled) return;
        
        this.blockTimestamps[blockId] = {
            timestamp: Date.now(),
            warned7s: false,
            warned3s: false,
            petrified: false
        };
    }
    
    /**
     * Untrack a block (when it's placed)
     */
    untrackBlock(blockId) {
        delete this.blockTimestamps[blockId];
    }
    
    /**
     * Update tracking for current board state
     * Called after block placement to track new cells
     */
    updateBoardTracking(board) {
        if (!this.enabled) return;
        
        // Track all filled cells
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[row].length; col++) {
                const key = `${row},${col}`;
                if (board[row][col] === 1) {
                    // Only track if not already tracked
                    if (!this.gridCellTimestamps[key]) {
                        this.trackGridCell(row, col);
                    }
                } else {
                    // Remove tracking for empty cells
                    if (this.gridCellTimestamps[key]) {
                        this.untrackGridCell(row, col);
                    }
                }
            }
        }
    }
    
    /**
     * Update tracking for available blocks
     */
    updateBlockTracking(blocks) {
        if (!this.enabled) return;
        
        const currentBlockIds = new Set(blocks.map(b => b.id));
        
        // Track new blocks
        blocks.forEach(block => {
            if (!this.blockTimestamps[block.id]) {
                this.trackBlock(block.id);
            }
        });
        
        // Remove tracking for blocks that no longer exist
        Object.keys(this.blockTimestamps).forEach(blockId => {
            if (!currentBlockIds.has(blockId)) {
                this.untrackBlock(blockId);
            }
        });
    }
    
    /**
     * Get petrification state for a grid cell
     * Returns: { petrified: boolean, warning: '7s' | '3s' | null, timeRemaining: number }
     */
    getGridCellState(row, col) {
        if (!this.enabled) {
            return { petrified: false, warning: null, timeRemaining: Infinity };
        }
        
        const key = `${row},${col}`;
        const data = this.gridCellTimestamps[key];
        
        if (!data) {
            return { petrified: false, warning: null, timeRemaining: Infinity };
        }
        
        const elapsed = Date.now() - data.timestamp;
        const timeRemaining = this.GRID_CELL_PETRIFY_TIME - elapsed;
        
        if (elapsed >= this.GRID_CELL_PETRIFY_TIME) {
            if (!data.petrified) {
                data.petrified = true;
                this.stats.gridCellsPetrified++;
            }
            return { petrified: true, warning: null, timeRemaining: 0 };
        }
        
        if (timeRemaining <= this.WARNING_3S_TIME) {
            return { petrified: false, warning: '3s', timeRemaining };
        }
        
        if (timeRemaining <= this.WARNING_7S_TIME) {
            return { petrified: false, warning: '7s', timeRemaining };
        }
        
        return { petrified: false, warning: null, timeRemaining };
    }
    
    /**
     * Get petrification state for a block
     * Returns: { petrified: boolean, warning: '7s' | '3s' | null, timeRemaining: number }
     */
    getBlockState(blockId) {
        if (!this.enabled) {
            return { petrified: false, warning: null, timeRemaining: Infinity };
        }
        
        const data = this.blockTimestamps[blockId];
        
        if (!data) {
            return { petrified: false, warning: null, timeRemaining: Infinity };
        }
        
        const elapsed = Date.now() - data.timestamp;
        const timeRemaining = this.BLOCK_PETRIFY_TIME - elapsed;
        
        if (elapsed >= this.BLOCK_PETRIFY_TIME) {
            if (!data.petrified) {
                data.petrified = true;
                this.stats.blocksPetrified++;
            }
            return { petrified: true, warning: null, timeRemaining: 0 };
        }
        
        if (timeRemaining <= this.WARNING_3S_TIME) {
            return { petrified: false, warning: '3s', timeRemaining };
        }
        
        if (timeRemaining <= this.WARNING_7S_TIME) {
            return { petrified: false, warning: '7s', timeRemaining };
        }
        
        return { petrified: false, warning: null, timeRemaining };
    }
    
    /**
     * Check if a grid cell is petrified
     */
    isGridCellPetrified(row, col) {
        return this.getGridCellState(row, col).petrified;
    }
    
    /**
     * Check if a block is petrified
     */
    isBlockPetrified(blockId) {
        return this.getBlockState(blockId).petrified;
    }
    
    /**
     * Check if a line can be cleared (no petrified cells)
     * Returns true if the line can be cleared (no petrified cells)
     */
    canClearRow(board, row) {
        if (!this.enabled) return true;
        
        for (let col = 0; col < board[row].length; col++) {
            if (board[row][col] === 1 && this.isGridCellPetrified(row, col)) {
                return false;
            }
        }
        return true;
    }
    
    canClearColumn(board, col) {
        if (!this.enabled) return true;
        
        for (let row = 0; row < board.length; row++) {
            if (board[row][col] === 1 && this.isGridCellPetrified(row, col)) {
                return false;
            }
        }
        return true;
    }
    
    canClearSquare(board, squareRow, squareCol) {
        if (!this.enabled) return true;
        
        const startRow = squareRow * 3;
        const startCol = squareCol * 3;
        
        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if (board[r][c] === 1 && this.isGridCellPetrified(r, c)) {
                    return false;
                }
            }
        }
        return true;
    }
    
    /**
     * Thaw (unpetrify) all grid cells and blocks after a clear event
     */
    thawAll() {
        if (!this.enabled) return;
        
        // Thaw grid cells
        Object.keys(this.gridCellTimestamps).forEach(key => {
            const data = this.gridCellTimestamps[key];
            if (data.petrified) {
                this.stats.gridCellsThawed++;
            }
            data.petrified = false;
            data.timestamp = Date.now();
            data.warned7s = false;
            data.warned3s = false;
        });
        
        // Thaw blocks
        Object.keys(this.blockTimestamps).forEach(blockId => {
            const data = this.blockTimestamps[blockId];
            if (data.petrified) {
                this.stats.blocksThawed++;
            }
            data.petrified = false;
            data.timestamp = Date.now();
            data.warned7s = false;
            data.warned3s = false;
        });
    }
    
    /**
     * Get all petrified grid cells
     * Returns: Array of { row, col }
     */
    getPetrifiedGridCells() {
        const petrified = [];
        
        Object.keys(this.gridCellTimestamps).forEach(key => {
            const [row, col] = key.split(',').map(Number);
            if (this.isGridCellPetrified(row, col)) {
                petrified.push({ row, col });
            }
        });
        
        return petrified;
    }
    
    /**
     * Get all petrified blocks
     * Returns: Array of block IDs
     */
    getPetrifiedBlocks() {
        return Object.keys(this.blockTimestamps).filter(blockId => 
            this.isBlockPetrified(blockId)
        );
    }
    
    /**
     * Get statistics
     */
    getStats() {
        return {
            ...this.stats,
            currentPetrifiedCells: this.getPetrifiedGridCells().length,
            currentPetrifiedBlocks: this.getPetrifiedBlocks().length
        };
    }
    
    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            gridCellsPetrified: 0,
            blocksPetrified: 0,
            gridCellsThawed: 0,
            blocksThawed: 0,
            totalPetrificationTime: 0
        };
    }
    
    /**
     * Serialize state for saving
     */
    serialize() {
        return {
            enabled: this.enabled,
            gridCellTimestamps: this.gridCellTimestamps,
            blockTimestamps: this.blockTimestamps,
            stats: this.stats
        };
    }
    
    /**
     * Deserialize state from saved data
     */
    deserialize(data) {
        if (!data) return;
        
        this.enabled = data.enabled || false;
        this.gridCellTimestamps = data.gridCellTimestamps || {};
        this.blockTimestamps = data.blockTimestamps || {};
        this.stats = data.stats || {
            gridCellsPetrified: 0,
            blocksPetrified: 0,
            gridCellsThawed: 0,
            blocksThawed: 0,
            totalPetrificationTime: 0
        };
    }
}