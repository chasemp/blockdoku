/**
 * Blockdoku PWA - Pattern Detection Manager
 * Detects special patterns for bonus scoring (cross, L-shape, diamond, spiral, checkerboard)
 */

export class PatternDetectionManager {
    constructor() {
        this.patterns = this.initializePatterns();
        this.isEnabled = true;
        this.detectionHistory = [];
        
        // Pattern configuration
        this.config = {
            minPatternSize: 3,        // Minimum pattern size to detect
            maxPatternSize: 9,        // Maximum pattern size to detect
            visualFeedback: true,     // Show visual pattern highlighting
            soundFeedback: true,      // Play sound effects
            particleEffects: true     // Show particle effects
        };
    }
    
    /**
     * Initialize pattern definitions
     */
    initializePatterns() {
        return {
            cross: {
                name: 'Cross',
                description: 'Plus-shaped pattern',
                basePoints: 50,
                multiplier: 1.5,
                detect: this.detectCrossPattern.bind(this),
                minSize: 3
            },
            lShape: {
                name: 'L-Shape',
                description: 'L-shaped pattern',
                basePoints: 40,
                multiplier: 1.3,
                detect: this.detectLShapePattern.bind(this),
                minSize: 3
            },
            diamond: {
                name: 'Diamond',
                description: 'Diamond-shaped pattern',
                basePoints: 60,
                multiplier: 1.6,
                detect: this.detectDiamondPattern.bind(this),
                minSize: 3
            },
            spiral: {
                name: 'Spiral',
                description: 'Spiral pattern',
                basePoints: 80,
                multiplier: 2.0,
                detect: this.detectSpiralPattern.bind(this),
                minSize: 4
            },
            checkerboard: {
                name: 'Checkerboard',
                description: 'Alternating pattern',
                basePoints: 70,
                multiplier: 1.8,
                detect: this.detectCheckerboardPattern.bind(this),
                minSize: 4
            }
        };
    }
    
    /**
     * Detect all patterns in the board
     * @param {Array} board - The game board
     * @returns {Array} Array of detected patterns
     */
    detectPatterns(board) {
        if (!this.isEnabled) return [];
        
        const detectedPatterns = [];
        
        // Check each pattern type
        for (const [patternType, pattern] of Object.entries(this.patterns)) {
            const results = pattern.detect(board);
            if (results.length > 0) {
                detectedPatterns.push({
                    type: patternType,
                    name: pattern.name,
                    description: pattern.description,
                    basePoints: pattern.basePoints,
                    multiplier: pattern.multiplier,
                    positions: results,
                    count: results.length
                });
            }
        }
        
        // Record detection for statistics
        if (detectedPatterns.length > 0) {
            this.detectionHistory.push({
                timestamp: Date.now(),
                patterns: detectedPatterns,
                totalPatterns: detectedPatterns.reduce((sum, p) => sum + p.count, 0)
            });
        }
        
        return detectedPatterns;
    }
    
    /**
     * Detect cross patterns (plus-shaped)
     */
    detectCrossPattern(board) {
        const crosses = [];
        const rows = board.length;
        const cols = board[0].length;
        
        for (let row = 1; row < rows - 1; row++) {
            for (let col = 1; col < cols - 1; col++) {
                if (this.isCrossPattern(board, row, col)) {
                    crosses.push({
                        center: { row, col },
                        positions: this.getCrossPositions(row, col),
                        size: 3
                    });
                }
            }
        }
        
        return crosses;
    }
    
    /**
     * Check if position forms a cross pattern
     */
    isCrossPattern(board, centerRow, centerCol) {
        const center = board[centerRow][centerCol];
        if (center !== 1) return false;
        
        // Check horizontal line
        const left = board[centerRow][centerCol - 1];
        const right = board[centerRow][centerCol + 1];
        
        // Check vertical line
        const top = board[centerRow - 1][centerCol];
        const bottom = board[centerRow + 1][centerCol];
        
        return left === 1 && right === 1 && top === 1 && bottom === 1;
    }
    
    /**
     * Get all positions in a cross pattern
     */
    getCrossPositions(centerRow, centerCol) {
        return [
            { row: centerRow, col: centerCol },     // Center
            { row: centerRow, col: centerCol - 1 }, // Left
            { row: centerRow, col: centerCol + 1 }, // Right
            { row: centerRow - 1, col: centerCol }, // Top
            { row: centerRow + 1, col: centerCol }  // Bottom
        ];
    }
    
    /**
     * Detect L-shaped patterns
     */
    detectLShapePattern(board) {
        const lShapes = [];
        const rows = board.length;
        const cols = board[0].length;
        
        for (let row = 0; row < rows - 1; row++) {
            for (let col = 0; col < cols - 1; col++) {
                const lShape = this.findLShapePattern(board, row, col);
                if (lShape) {
                    lShapes.push(lShape);
                }
            }
        }
        
        return lShapes;
    }
    
    /**
     * Find L-shaped pattern starting at position
     */
    findLShapePattern(board, startRow, startCol) {
        const patterns = [
            // L-shape pointing up-right
            [
                { row: startRow, col: startCol },
                { row: startRow, col: startCol + 1 },
                { row: startRow + 1, col: startCol }
            ],
            // L-shape pointing up-left
            [
                { row: startRow, col: startCol },
                { row: startRow, col: startCol + 1 },
                { row: startRow + 1, col: startCol + 1 }
            ],
            // L-shape pointing down-right
            [
                { row: startRow, col: startCol },
                { row: startRow + 1, col: startCol },
                { row: startRow + 1, col: startCol + 1 }
            ],
            // L-shape pointing down-left
            [
                { row: startRow, col: startCol + 1 },
                { row: startRow + 1, col: startCol },
                { row: startRow + 1, col: startCol + 1 }
            ]
        ];
        
        for (const pattern of patterns) {
            if (this.isValidPattern(board, pattern)) {
                return {
                    positions: pattern,
                    size: pattern.length
                };
            }
        }
        
        return null;
    }
    
    /**
     * Detect diamond patterns
     */
    detectDiamondPattern(board) {
        const diamonds = [];
        const rows = board.length;
        const cols = board[0].length;
        
        for (let row = 1; row < rows - 1; row++) {
            for (let col = 1; col < cols - 1; col++) {
                const diamond = this.findDiamondPattern(board, row, col);
                if (diamond) {
                    diamonds.push(diamond);
                }
            }
        }
        
        return diamonds;
    }
    
    /**
     * Find diamond pattern centered at position
     */
    findDiamondPattern(board, centerRow, centerCol) {
        const diamond = [
            { row: centerRow, col: centerCol },     // Center
            { row: centerRow - 1, col: centerCol }, // Top
            { row: centerRow + 1, col: centerCol }, // Bottom
            { row: centerRow, col: centerCol - 1 }, // Left
            { row: centerRow, col: centerCol + 1 }  // Right
        ];
        
        if (this.isValidPattern(board, diamond)) {
            return {
                center: { row: centerRow, col: centerCol },
                positions: diamond,
                size: diamond.length
            };
        }
        
        return null;
    }
    
    /**
     * Detect spiral patterns
     */
    detectSpiralPattern(board) {
        const spirals = [];
        const rows = board.length;
        const cols = board[0].length;
        
        for (let row = 1; row < rows - 2; row++) {
            for (let col = 1; col < cols - 2; col++) {
                const spiral = this.findSpiralPattern(board, row, col);
                if (spiral) {
                    spirals.push(spiral);
                }
            }
        }
        
        return spirals;
    }
    
    /**
     * Find spiral pattern starting at position
     */
    findSpiralPattern(board, startRow, startCol) {
        // 3x3 spiral pattern
        const spiral = [
            { row: startRow, col: startCol },         // Center
            { row: startRow, col: startCol + 1 },     // Right
            { row: startRow, col: startCol + 2 },     // Right-right
            { row: startRow + 1, col: startCol + 2 }, // Down-right
            { row: startRow + 2, col: startCol + 2 }, // Down-down-right
            { row: startRow + 2, col: startCol + 1 }, // Down-down
            { row: startRow + 2, col: startCol },     // Down-down-left
            { row: startRow + 1, col: startCol }      // Down-left
        ];
        
        if (this.isValidPattern(board, spiral)) {
            return {
                center: { row: startRow + 1, col: startCol + 1 },
                positions: spiral,
                size: spiral.length
            };
        }
        
        return null;
    }
    
    /**
     * Detect checkerboard patterns
     */
    detectCheckerboardPattern(board) {
        const checkerboards = [];
        const rows = board.length;
        const cols = board[0].length;
        
        for (let row = 0; row < rows - 1; row++) {
            for (let col = 0; col < cols - 1; col++) {
                const checkerboard = this.findCheckerboardPattern(board, row, col);
                if (checkerboard) {
                    checkerboards.push(checkerboard);
                }
            }
        }
        
        return checkerboards;
    }
    
    /**
     * Find checkerboard pattern starting at position
     */
    findCheckerboardPattern(board, startRow, startCol) {
        // 2x2 checkerboard pattern
        const checkerboard = [
            { row: startRow, col: startCol },
            { row: startRow, col: startCol + 1 },
            { row: startRow + 1, col: startCol },
            { row: startRow + 1, col: startCol + 1 }
        ];
        
        if (this.isValidPattern(board, checkerboard)) {
            return {
                positions: checkerboard,
                size: checkerboard.length
            };
        }
        
        return null;
    }
    
    /**
     * Check if all positions in pattern are filled
     */
    isValidPattern(board, positions) {
        return positions.every(pos => 
            pos.row >= 0 && pos.row < board.length &&
            pos.col >= 0 && pos.col < board[0].length &&
            board[pos.row][pos.col] === 1
        );
    }
    
    /**
     * Calculate pattern bonus points
     */
    calculatePatternBonus(detectedPatterns, difficultyMultiplier = 1.0) {
        let totalBonus = 0;
        
        for (const pattern of detectedPatterns) {
            const patternBonus = pattern.basePoints * pattern.multiplier * pattern.count;
            totalBonus += Math.floor(patternBonus * difficultyMultiplier);
        }
        
        return totalBonus;
    }
    
    /**
     * Get pattern statistics
     */
    getStatistics() {
        const stats = {
            totalDetections: this.detectionHistory.length,
            totalPatterns: 0,
            patternCounts: {},
            totalBonusPoints: 0
        };
        
        for (const detection of this.detectionHistory) {
            stats.totalPatterns += detection.totalPatterns;
            
            for (const pattern of detection.patterns) {
                if (!stats.patternCounts[pattern.type]) {
                    stats.patternCounts[pattern.type] = 0;
                }
                stats.patternCounts[pattern.type] += pattern.count;
                stats.totalBonusPoints += pattern.basePoints * pattern.multiplier * pattern.count;
            }
        }
        
        return stats;
    }
    
    /**
     * Enable or disable pattern detection
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }
    
    /**
     * Reset detection history
     */
    reset() {
        this.detectionHistory = [];
    }
    
    /**
     * Get visual feedback data for UI
     */
    getVisualFeedback() {
        if (!this.config.visualFeedback) return null;
        
        return {
            enabled: this.isEnabled,
            patterns: this.patterns,
            statistics: this.getStatistics()
        };
    }
}
