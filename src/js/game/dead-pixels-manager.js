/**
 * Dead Pixels Manager
 * Manages "dead" pixels on the board that cannot be used for block placement
 * Provides a visual and gameplay challenge similar to broken LCD pixels
 */

export class DeadPixelsManager {
    constructor() {
        this.enabled = false;
        this.intensity = 0; // 0-5, number of dead pixels to create
        
        // Dead pixels tracking
        // Structure: Set of "row,col" strings for dead pixel positions
        this.deadPixels = new Set();
        
        // Statistics
        this.stats = {
            deadPixelsGenerated: 0,
            gamesPlayedWithDeadPixels: 0
        };
    }
    
    /**
     * Enable or disable the dead pixels system
     */
    setEnabled(enabled) {
        const wasEnabled = this.enabled;
        this.enabled = enabled;
        
        // If disabling, clear all dead pixels
        if (wasEnabled && !enabled) {
            this.clearDeadPixels();
        }
    }
    
    /**
     * Check if dead pixels is enabled
     */
    isEnabled() {
        return this.enabled;
    }
    
    /**
     * Set the intensity (number of dead pixels)
     * @param {number} intensity - Value from 0 to 5
     */
    setIntensity(intensity) {
        this.intensity = Math.max(0, Math.min(5, intensity));
    }
    
    /**
     * Get current intensity
     */
    getIntensity() {
        return this.intensity;
    }
    
    /**
     * Generate dead pixels on the board
     * Called when starting a new game with dead pixels enabled
     * @param {number} boardSize - Size of the board (usually 9)
     */
    generateDeadPixels(boardSize) {
        if (!this.enabled || this.intensity === 0) {
            this.deadPixels.clear();
            return;
        }
        
        this.deadPixels.clear();
        
        // Calculate number of dead pixels based on intensity
        // Intensity 1 = ~3-5 pixels, up to Intensity 5 = ~15-20 pixels
        const basePixels = this.intensity * 3;
        const randomExtra = Math.floor(Math.random() * (this.intensity + 1));
        const numDeadPixels = basePixels + randomExtra;
        
        // Generate random positions for dead pixels
        const totalCells = boardSize * boardSize;
        const availablePositions = [];
        
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                availablePositions.push({ row, col });
            }
        }
        
        // Shuffle and pick random positions
        for (let i = availablePositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
        }
        
        // Take the first N positions as dead pixels
        const count = Math.min(numDeadPixels, totalCells);
        for (let i = 0; i < count; i++) {
            const { row, col } = availablePositions[i];
            const key = `${row},${col}`;
            this.deadPixels.add(key);
        }
        
        this.stats.deadPixelsGenerated += count;
        if (count > 0) {
            this.stats.gamesPlayedWithDeadPixels++;
        }
    }
    
    /**
     * Clear all dead pixels
     */
    clearDeadPixels() {
        this.deadPixels.clear();
    }
    
    /**
     * Check if a cell is a dead pixel
     */
    isDeadPixel(row, col) {
        if (!this.enabled) return false;
        const key = `${row},${col}`;
        return this.deadPixels.has(key);
    }
    
    /**
     * Get all dead pixel positions
     * Returns: Array of { row, col }
     */
    getDeadPixels() {
        const pixels = [];
        this.deadPixels.forEach(key => {
            const [row, col] = key.split(',').map(Number);
            pixels.push({ row, col });
        });
        return pixels;
    }
    
    /**
     * Check if a block can be placed given dead pixels
     * Returns false if any part of the block would overlap with a dead pixel
     */
    canPlaceBlockWithDeadPixels(block, startRow, startCol, board) {
        if (!this.enabled) return true;
        
        for (let r = 0; r < block.shape.length; r++) {
            for (let c = 0; c < block.shape[r].length; c++) {
                if (block.shape[r][c] === 1) {
                    const boardRow = startRow + r;
                    const boardCol = startCol + c;
                    
                    // Check if this position is a dead pixel
                    if (this.isDeadPixel(boardRow, boardCol)) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    /**
     * Get statistics
     */
    getStats() {
        return {
            ...this.stats,
            currentDeadPixels: this.deadPixels.size
        };
    }
    
    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            deadPixelsGenerated: 0,
            gamesPlayedWithDeadPixels: 0
        };
    }
    
    /**
     * Serialize state for saving
     */
    serialize() {
        return {
            enabled: this.enabled,
            intensity: this.intensity,
            deadPixels: Array.from(this.deadPixels),
            stats: this.stats
        };
    }
    
    /**
     * Deserialize state from saved data
     */
    deserialize(data) {
        if (!data) return;
        
        this.enabled = data.enabled || false;
        this.intensity = data.intensity || 0;
        this.deadPixels = new Set(data.deadPixels || []);
        this.stats = data.stats || {
            deadPixelsGenerated: 0,
            gamesPlayedWithDeadPixels: 0
        };
    }
}