/**
 * Blockdoku PWA - Multiplier Chain Manager
 * Handles consecutive line clear multipliers (2x, 3x, 4x, etc.)
 */

export class MultiplierChainManager {
    constructor() {
        this.currentMultiplier = 1;
        this.maxMultiplier = 1;
        this.consecutiveClears = 0;
        this.maxConsecutiveClears = 0;
        this.totalMultiplierBonus = 0;
        this.multiplierHistory = [];
        this.isEnabled = true;
        
        // Multiplier chain configuration
        this.config = {
            maxMultiplier: 10,        // Maximum multiplier cap
            resetOnNonClear: true,    // Reset chain on non-clearing placement
            resetOnGameOver: true,    // Reset chain on game over
            visualFeedback: true,     // Show visual feedback
            soundFeedback: true,      // Play sound effects
            particleEffects: true     // Show particle effects
        };
    }
    
    /**
     * Enable or disable multiplier chains
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.reset();
        }
    }
    
    /**
     * Process a line clear event and update multiplier chain
     * @param {Object} clearResult - Result from scoring system
     * @param {number} difficultyMultiplier - Current difficulty multiplier
     * @returns {Object} Multiplier chain result
     */
    processLineClear(clearResult, difficultyMultiplier = 1.0) {
        if (!this.isEnabled) {
            return {
                multiplier: 1,
                bonusPoints: 0,
                chainBroken: false,
                chainContinued: false
            };
        }
        
        const hasClears = clearResult.totalClears > 0;
        
        if (hasClears) {
            // Line clear occurred - continue or start chain
            this.consecutiveClears++;
            this.updateMultiplier();
            
            // Calculate bonus points from multiplier
            const baseScore = clearResult.scoreGained / difficultyMultiplier;
            const multiplierBonus = baseScore * (this.currentMultiplier - 1);
            const totalBonus = Math.floor(multiplierBonus * difficultyMultiplier);
            
            this.totalMultiplierBonus += totalBonus;
            
            // Record in history
            this.multiplierHistory.push({
                multiplier: this.currentMultiplier,
                consecutiveClears: this.consecutiveClears,
                bonusPoints: totalBonus,
                timestamp: Date.now()
            });
            
            return {
                multiplier: this.currentMultiplier,
                bonusPoints: totalBonus,
                chainBroken: false,
                chainContinued: this.consecutiveClears > 1,
                consecutiveClears: this.consecutiveClears
            };
        } else {
            // No line clear - break chain if configured
            const chainBroken = this.config.resetOnNonClear && this.consecutiveClears > 0;
            if (chainBroken) {
                this.reset();
            }
            
            return {
                multiplier: 1,
                bonusPoints: 0,
                chainBroken: chainBroken,
                chainContinued: false,
                consecutiveClears: this.consecutiveClears
            };
        }
    }
    
    /**
     * Update multiplier based on consecutive clears
     */
    updateMultiplier() {
        // Multiplier progression: 1x (no multiplier), 2x, 3x, 4x, 5x, 6x, 7x, 8x, 9x, 10x
        // Only apply multiplier for 2+ consecutive clears
        if (this.consecutiveClears >= 2) {
            this.currentMultiplier = Math.min(this.consecutiveClears, this.config.maxMultiplier);
        } else {
            this.currentMultiplier = 1; // No multiplier for single clears
        }
        this.maxMultiplier = Math.max(this.maxMultiplier, this.currentMultiplier);
        this.maxConsecutiveClears = Math.max(this.maxConsecutiveClears, this.consecutiveClears);
    }
    
    /**
     * Reset the multiplier chain
     */
    reset() {
        this.currentMultiplier = 1;
        this.consecutiveClears = 0;
    }
    
    /**
     * Reset all multiplier chain data (for new game)
     */
    resetAll() {
        this.currentMultiplier = 1;
        this.maxMultiplier = 1;
        this.consecutiveClears = 0;
        this.maxConsecutiveClears = 0;
        this.totalMultiplierBonus = 0;
        this.multiplierHistory = [];
    }
    
    /**
     * Get current multiplier chain status
     */
    getStatus() {
        return {
            currentMultiplier: this.currentMultiplier,
            maxMultiplier: this.maxMultiplier,
            consecutiveClears: this.consecutiveClears,
            maxConsecutiveClears: this.maxConsecutiveClears,
            totalMultiplierBonus: this.totalMultiplierBonus,
            isEnabled: this.isEnabled,
            nextMultiplier: this.consecutiveClears >= 1 ? Math.min(this.consecutiveClears + 1, this.config.maxMultiplier) : 2
        };
    }
    
    /**
     * Get multiplier chain statistics
     */
    getStatistics() {
        return {
            maxMultiplier: this.maxMultiplier,
            maxConsecutiveClears: this.maxConsecutiveClears,
            totalMultiplierBonus: this.totalMultiplierBonus,
            totalChainEvents: this.multiplierHistory.length,
            averageMultiplier: this.multiplierHistory.length > 0 
                ? this.multiplierHistory.reduce((sum, event) => sum + event.multiplier, 0) / this.multiplierHistory.length 
                : 0
        };
    }
    
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    
    /**
     * Check if multiplier chain is at maximum
     */
    isAtMaxMultiplier() {
        return this.currentMultiplier >= this.config.maxMultiplier;
    }
    
    /**
     * Get multiplier chain progress (0-1)
     */
    getProgress() {
        if (this.config.maxMultiplier <= 1) return 0;
        return Math.min((this.currentMultiplier - 1) / (this.config.maxMultiplier - 1), 1);
    }
    
    /**
     * Get visual feedback data for UI
     */
    getVisualFeedback() {
        if (!this.config.visualFeedback) return null;
        
        return {
            showMultiplier: this.currentMultiplier > 1,
            multiplier: this.currentMultiplier,
            progress: this.getProgress(),
            isAtMax: this.isAtMaxMultiplier(),
            consecutiveClears: this.consecutiveClears,
            nextMultiplier: Math.min(this.consecutiveClears + 2, this.config.maxMultiplier)
        };
    }
}
