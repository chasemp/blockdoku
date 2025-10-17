/**
 * Blockdoku PWA - Block Definitions and Management
 * MVT Milestone 2: Basic Block Placement System
 */

export class BlockManager {
    constructor() {
        this.blockShapes = this.defineBlockShapes();
        this.currentBlocks = [];
        this.selectedBlock = null;
        this.selectedBlockPosition = null;

    // Accumulators to smooth frequencies across sets
    // Ensures 1-in-10 (10%) actually averages out over multiple generations
    this.magicAccumulator = 0;
    this.wildAccumulator = 0;

    // Toggle used to alternate which type yields in overlap situations
    this.overlapRotationToggle = false;
    }
    
    defineBlockShapes() {
        return {
            // Single cell
            single: {
                name: 'Single',
                shape: [[1]],
                color: '#007bff',
                points: 1
            },
            
            // Line shapes
            line2: {
                name: 'Line 2',
                shape: [[1, 1]],
                color: '#28a745',
                points: 2
            },
            line3: {
                name: 'Line 3',
                shape: [[1, 1, 1]],
                color: '#28a745',
                points: 3
            },
            
            // L shapes
            l2x2: {
                name: 'L 2x2',
                shape: [
                    [1, 0],
                    [1, 1]
                ],
                color: '#dc3545',
                points: 3
            },
            l3x2: {
                name: 'L 3x2',
                shape: [
                    [1, 0],
                    [1, 0],
                    [1, 1]
                ],
                color: '#dc3545',
                points: 4
            },
            
            // T shapes
            t3x2: {
                name: 'T 3x2',
                shape: [
                    [1, 1, 1],
                    [0, 1, 0]
                ],
                color: '#ffc107',
                points: 4
            },
            
            // Square shapes
            square2x2: {
                name: 'Square 2x2',
                shape: [
                    [1, 1],
                    [1, 1]
                ],
                color: '#6f42c1',
                points: 4
            },
            
            // Z shapes
            z3x2: {
                name: 'Z 3x2',
                shape: [
                    [1, 1, 0],
                    [0, 1, 1]
                ],
                color: '#fd7e14',
                points: 4
            },
            
            // Wild blocks - special power-up blocks
            wildSingle: {
                name: 'Wild Single',
                shape: [[1]],
                color: '#ff6b6b',
                points: 3,
                isMagic: true,
                magicType: 'lineClear',
                description: 'Clears any line it completes'
            },
            wildLine2: {
                name: 'Wild Line 2',
                shape: [[1, 1]],
                color: '#ff6b6b',
                points: 5,
                isMagic: true,
                magicType: 'lineClear',
                description: 'Clears any line it completes'
            },
            wildL: {
                name: 'Wild L',
                shape: [
                    [1, 0],
                    [1, 1]
                ],
                color: '#ff6b6b',
                points: 6,
                isMagic: true,
                magicType: 'lineClear',
                description: 'Clears any line it completes'
            },
            
            // === ADDITIONAL MAGIC BLOCK TYPES ===
            
            // Bomb magic blocks - clear surrounding area
            bombSingle: {
                name: 'Bomb Single',
                shape: [[1]],
                color: '#ff4444',
                points: 8,
                isMagic: true,
                magicType: 'bomb',
                description: 'Explodes to clear 3x3 area around it'
            },
            bombLine2: {
                name: 'Bomb Line',
                shape: [[1, 1]],
                color: '#ff4444',
                points: 12,
                isMagic: true,
                magicType: 'bomb',
                description: 'Explodes to clear 3x3 area around each cell'
            },
            
            // Lightning magic blocks - clear entire row and column
            lightningSingle: {
                name: 'Lightning Single',
                shape: [[1]],
                color: '#ffeb3b',
                points: 15,
                isMagic: true,
                magicType: 'lightning',
                description: 'Clears entire row and column'
            },
            
            // Ghost magic blocks - can overlap once per game
            ghostSingle: {
                name: 'Ghost Single',
                shape: [[1]],
                color: '#9c27b0',
                points: 6,
                isMagic: true,
                magicType: 'ghost',
                description: 'Can overlap existing pieces (once per game)'
            },
            
            // === WILD BLOCK SHAPES (Creative Geometries) ===
            
            // Pentominos (5-cell shapes)
            pentominoF: {
                name: 'F-Pentomino',
                shape: [
                    [1, 1, 0],
                    [0, 1, 0],
                    [0, 1, 1]
                ],
                color: '#ff6b6b',
                points: 5,
                isWild: true
            },
            pentominoP: {
                name: 'P-Pentomino',
                shape: [
                    [1, 1],
                    [1, 1],
                    [1, 0]
                ],
                color: '#4ecdc4',
                points: 5,
                isWild: true
            },
            pentominoY: {
                name: 'Y-Pentomino',
                shape: [
                    [0, 1, 0, 0],
                    [1, 1, 1, 1]
                ],
                color: '#45b7d1',
                points: 5,
                isWild: true
            },
            
            // Cross shapes
            crossSmall: {
                name: 'Small Cross',
                shape: [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 1, 0]
                ],
                color: '#96ceb4',
                points: 5,
                isWild: true
            },
            crossLarge: {
                name: 'Large Cross',
                shape: [
                    [0, 0, 1, 0, 0],
                    [0, 0, 1, 0, 0],
                    [1, 1, 1, 1, 1],
                    [0, 0, 1, 0, 0],
                    [0, 0, 1, 0, 0]
                ],
                color: '#feca57',
                points: 9,
                isWild: true
            },
            
            // Hollow shapes
            hollowSquare: {
                name: 'Hollow Square',
                shape: [
                    [1, 1, 1],
                    [1, 0, 1],
                    [1, 1, 1]
                ],
                color: '#ff9ff3',
                points: 8,
                isWild: true
            },
            hollowRect: {
                name: 'Hollow Rectangle',
                shape: [
                    [1, 1, 1, 1],
                    [1, 0, 0, 1],
                    [1, 1, 1, 1]
                ],
                color: '#54a0ff',
                points: 10,
                isWild: true
            },
            
            // Zigzag patterns
            zigzagSmall: {
                name: 'Small Zigzag',
                shape: [
                    [1, 0, 0],
                    [1, 1, 0],
                    [0, 1, 1]
                ],
                color: '#5f27cd',
                points: 5,
                isWild: true
            },
            zigzagLarge: {
                name: 'Large Zigzag',
                shape: [
                    [1, 0, 0, 0],
                    [1, 1, 0, 0],
                    [0, 1, 1, 0],
                    [0, 0, 1, 1]
                ],
                color: '#00d2d3',
                points: 7,
                isWild: true
            },
            
            // Diagonal patterns
            diagonal: {
                name: 'Diagonal Line',
                shape: [
                    [1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, 1, 0],
                    [0, 0, 0, 1]
                ],
                color: '#ff7675',
                points: 4,
                isWild: true
            },
            
            // Spiral pattern
            spiral: {
                name: 'Spiral',
                shape: [
                    [1, 1, 1],
                    [0, 0, 1],
                    [1, 1, 1]
                ],
                color: '#fd79a8',
                points: 7,
                isWild: true
            },
            
            // More Pentominos (completing the classic set)
            pentominoI: {
                name: 'I-Pentomino',
                shape: [
                    [1],
                    [1],
                    [1],
                    [1],
                    [1]
                ],
                color: '#e17055',
                points: 5,
                isWild: true
            },
            pentominoL: {
                name: 'L-Pentomino',
                shape: [
                    [1, 0],
                    [1, 0],
                    [1, 0],
                    [1, 1]
                ],
                color: '#a29bfe',
                points: 5,
                isWild: true
            },
            pentominoN: {
                name: 'N-Pentomino',
                shape: [
                    [0, 1],
                    [1, 1],
                    [1, 0],
                    [1, 0]
                ],
                color: '#fd63c7',
                points: 5,
                isWild: true
            },
            pentominoT: {
                name: 'T-Pentomino',
                shape: [
                    [1, 1, 1],
                    [0, 1, 0],
                    [0, 1, 0]
                ],
                color: '#6c5ce7',
                points: 5,
                isWild: true
            },
            pentominoU: {
                name: 'U-Pentomino',
                shape: [
                    [1, 0, 1],
                    [1, 1, 1]
                ],
                color: '#fd79a8',
                points: 5,
                isWild: true
            },
            pentominoV: {
                name: 'V-Pentomino',
                shape: [
                    [1, 0, 0],
                    [1, 0, 0],
                    [1, 1, 1]
                ],
                color: '#fdcb6e',
                points: 5,
                isWild: true
            },
            pentominoW: {
                name: 'W-Pentomino',
                shape: [
                    [1, 0, 0],
                    [1, 1, 0],
                    [0, 1, 1]
                ],
                color: '#e84393',
                points: 5,
                isWild: true
            },
            pentominoX: {
                name: 'X-Pentomino',
                shape: [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 1, 0]
                ],
                color: '#00b894',
                points: 5,
                isWild: true
            },
            pentominoZ: {
                name: 'Z-Pentomino',
                shape: [
                    [1, 1, 0],
                    [0, 1, 0],
                    [0, 1, 1]
                ],
                color: '#0984e3',
                points: 5,
                isWild: true
            },
            
            // Hexominos (6-cell shapes) - More challenging
            hexominoBar: {
                name: 'Hexomino Bar',
                shape: [
                    [1, 1, 1, 1, 1, 1]
                ],
                color: '#2d3436',
                points: 6,
                isWild: true
            },
            hexominoSnake: {
                name: 'Hexomino Snake',
                shape: [
                    [1, 1, 0, 0],
                    [0, 1, 1, 0],
                    [0, 0, 1, 1]
                ],
                color: '#636e72',
                points: 6,
                isWild: true
            },
            hexominoArch: {
                name: 'Hexomino Arch',
                shape: [
                    [1, 0, 0, 1],
                    [1, 1, 1, 1]
                ],
                color: '#74b9ff',
                points: 6,
                isWild: true
            },
            hexominoStairs: {
                name: 'Hexomino Stairs',
                shape: [
                    [1, 0, 0],
                    [1, 1, 0],
                    [0, 1, 1],
                    [0, 0, 1]
                ],
                color: '#55a3ff',
                points: 6,
                isWild: true
            },
            
            // Irregular asymmetric shapes
            asymmetricClaw: {
                name: 'Asymmetric Claw',
                shape: [
                    [1, 0, 1],
                    [1, 1, 0],
                    [1, 0, 0]
                ],
                color: '#ff7675',
                points: 5,
                isWild: true
            },
            asymmetricWing: {
                name: 'Asymmetric Wing',
                shape: [
                    [0, 0, 1, 1],
                    [1, 1, 1, 0]
                ],
                color: '#fd79a8',
                points: 5,
                isWild: true
            },
            asymmetricTail: {
                name: 'Asymmetric Tail',
                shape: [
                    [1, 1, 1, 0],
                    [0, 0, 1, 1],
                    [0, 0, 0, 1]
                ],
                color: '#fdcb6e',
                points: 6,
                isWild: true
            },
            
            // More hollow/frame shapes
            hollowL: {
                name: 'Hollow L',
                shape: [
                    [1, 0, 0],
                    [1, 0, 0],
                    [1, 1, 1]
                ],
                color: '#00cec9',
                points: 5,
                isWild: true
            },
            hollowT: {
                name: 'Hollow T',
                shape: [
                    [1, 1, 1],
                    [0, 1, 0]
                ],
                color: '#6c5ce7',
                points: 4,
                isWild: true
            },
            frameCorner: {
                name: 'Frame Corner',
                shape: [
                    [1, 1, 1, 1],
                    [1, 0, 0, 0],
                    [1, 0, 0, 0],
                    [1, 1, 1, 1]
                ],
                color: '#a29bfe',
                points: 10,
                isWild: true
            },
            
            // Complex patterns
            checkerboard: {
                name: 'Checkerboard',
                shape: [
                    [1, 0, 1],
                    [0, 1, 0],
                    [1, 0, 1]
                ],
                color: '#2d3436',
                points: 5,
                isWild: true
            },
            butterfly: {
                name: 'Butterfly',
                shape: [
                    [1, 0, 1],
                    [1, 1, 1],
                    [1, 0, 1]
                ],
                color: '#fd79a8',
                points: 7,
                isWild: true
            },
            hourglass: {
                name: 'Hourglass',
                shape: [
                    [1, 1, 1],
                    [0, 1, 0],
                    [1, 1, 1]
                ],
                color: '#fdcb6e',
                points: 7,
                isWild: true
            },
            arrow: {
                name: 'Arrow',
                shape: [
                    [0, 0, 1, 0, 0],
                    [0, 1, 1, 1, 0],
                    [1, 1, 1, 1, 1],
                    [0, 0, 1, 0, 0],
                    [0, 0, 1, 0, 0]
                ],
                color: '#00b894',
                points: 11,
                isWild: true
            },
            diamond: {
                name: 'Diamond',
                shape: [
                    [0, 1, 0],
                    [1, 0, 1],
                    [0, 1, 0]
                ],
                color: '#e17055',
                points: 4,
                isWild: true
            },
            
            // Advanced irregular shapes
            lightning: {
                name: 'Lightning Bolt',
                shape: [
                    [0, 1, 0],
                    [1, 1, 0],
                    [0, 1, 1],
                    [0, 0, 1]
                ],
                color: '#fdcb6e',
                points: 6,
                isWild: true
            },
            maze: {
                name: 'Maze Pattern',
                shape: [
                    [1, 1, 0, 1],
                    [0, 1, 0, 1],
                    [0, 1, 1, 1]
                ],
                color: '#636e72',
                points: 7,
                isWild: true
            },
            crown: {
                name: 'Crown',
                shape: [
                    [1, 0, 1, 0, 1],
                    [1, 1, 1, 1, 1]
                ],
                color: '#feca57',
                points: 8,
                isWild: true
            }
        };
    }
    
  generateRandomBlocks(count = 3, difficulty = 'all', difficultyManager = null, enableMagicBlocks = false, enableWildShapes = false, magicBlocksFrequency = 1, wildShapesFrequency = 1) {
        // Build base pools
        const allKeys = Object.keys(this.blockShapes);
        let magicBlocks = allKeys.filter(key => this.blockShapes[key].isMagic);
        let wildShapesAll = allKeys.filter(key => this.blockShapes[key].isWild);
        let standardShapesAll = allKeys.filter(key => !this.blockShapes[key].isMagic && !this.blockShapes[key].isWild);

        // Apply difficulty filters
        const applySizeRangeFilter = (keys, sizeRange) => {
            return keys.filter(key => {
                const shape = this.blockShapes[key].shape;
                const maxDimension = Math.max(shape.length, shape[0].length);
                return maxDimension >= sizeRange[0] && maxDimension <= sizeRange[1];
            });
        };

        if (difficultyManager) {
            const allowedShapes = difficultyManager.getAllowedShapes();
            const sizeRange = difficultyManager.getBlockSizeRange();

            if (allowedShapes !== 'all') {
                // Only filter standard and wild by explicit allowed lists; keep magic always available
                standardShapesAll = standardShapesAll.filter(key => allowedShapes.includes(key));
                wildShapesAll = wildShapesAll.filter(key => allowedShapes.includes(key));
            }

            // Filter all groups by size range for consistency
            standardShapesAll = applySizeRangeFilter(standardShapesAll, sizeRange);
            wildShapesAll = applySizeRangeFilter(wildShapesAll, sizeRange);
            magicBlocks = applySizeRangeFilter(magicBlocks, sizeRange);
        } else {
            // Legacy difficulty filtering (applies mainly to standard shapes)
            if (difficulty === 'large') {
                standardShapesAll = standardShapesAll.filter(key => {
                    const shape = this.blockShapes[key].shape;
                    const maxDimension = Math.max(shape.length, shape[0].length);
                    return maxDimension >= 3; // 3x3 or larger
                });
                // Apply same filter to wild shapes for consistency
                wildShapesAll = wildShapesAll.filter(key => {
                    const shape = this.blockShapes[key].shape;
                    const maxDimension = Math.max(shape.length, shape[0].length);
                    return maxDimension >= 3;
                });
            } else if (difficulty === 'small') {
                standardShapesAll = standardShapesAll.filter(key => {
                    const shape = this.blockShapes[key].shape;
                    const maxDimension = Math.max(shape.length, shape[0].length);
                    return maxDimension <= 3; // 3x3 or smaller
                });
                wildShapesAll = wildShapesAll.filter(key => {
                    const shape = this.blockShapes[key].shape;
                    const maxDimension = Math.max(shape.length, shape[0].length);
                    return maxDimension <= 3;
                });
            } else if (difficulty === 'complex') {
                // Prefer complex irregular shapes for expert mode (standard only)
                standardShapesAll = standardShapesAll.filter(key => {
                    return key.includes('L') || key.includes('T') || key.includes('Z') ||
                           key.includes('U') || key.includes('Cross') || key.includes('Plus');
                });
            }
        }

        // Fallbacks if any pool ends up empty
        if (standardShapesAll.length === 0) {
            standardShapesAll = allKeys.filter(key => !this.blockShapes[key].isMagic && !this.blockShapes[key].isWild);
        }
        if (enableWildShapes && wildShapesAll.length === 0) {
            wildShapesAll = allKeys.filter(key => this.blockShapes[key].isWild);
        }
        if (enableMagicBlocks && magicBlocks.length === 0) {
            magicBlocks = allKeys.filter(key => this.blockShapes[key].isMagic);
        }

        // Determine desired counts per set using accumulators for fairness over time
        const pm = enableMagicBlocks ? Math.max(0, Math.min(1, magicBlocksFrequency / 10)) : 0;
        
        // For wild shapes, use different logic based on frequency
        // Low frequencies (1-4): At most 1 wild block per set, probability based on frequency
        // High frequencies (5-10): Allow multiple wild blocks, probability per block
        let pw;
        if (enableWildShapes) {
            if (wildShapesFrequency < 5) {
                // Low frequency: 10%-40% chance of 1 wild block per set
                pw = Math.max(0, Math.min(1, wildShapesFrequency / 10));
            } else {
                // High frequency: 50%-100% chance per block (can result in multiple)
                pw = Math.max(0, Math.min(1, wildShapesFrequency / 10));
            }
        } else {
            pw = 0;
        }

        const magicFloat = pm * count;
        const wildFloat = pw * count;

        let magicCount = Math.floor(magicFloat + this.magicAccumulator);
        let wildCount = Math.floor(wildFloat + this.wildAccumulator);

        // Update accumulators with the fractional remainders
        this.magicAccumulator = (magicFloat + this.magicAccumulator) - magicCount;
        this.wildAccumulator = (wildFloat + this.wildAccumulator) - wildCount;

        // For low frequencies, cap wild blocks at 1 per set
        if (enableWildShapes && wildShapesFrequency < 5) {
            wildCount = Math.min(1, wildCount);
        }

        // Clamp counts by availability and settings
        if (!enableMagicBlocks || magicBlocks.length === 0) magicCount = 0;
        if (!enableWildShapes || wildShapesAll.length === 0) wildCount = 0;

        // If totals exceed available slots, alternate which type yields the excess (round-robin)
        let totalSpecial = magicCount + wildCount;
        if (totalSpecial > count) {
            let excess = totalSpecial - count;
            if (this.overlapRotationToggle) {
                // Reduce magic first this time
                const reduceMagic = Math.min(excess, magicCount);
                magicCount -= reduceMagic;
                excess -= reduceMagic;
                if (excess > 0) {
                    const reduceWild = Math.min(excess, wildCount);
                    wildCount -= reduceWild;
                    excess -= reduceWild;
                }
            } else {
                // Reduce wild first this time
                const reduceWild = Math.min(excess, wildCount);
                wildCount -= reduceWild;
                excess -= reduceWild;
                if (excess > 0) {
                    const reduceMagic = Math.min(excess, magicCount);
                    magicCount -= reduceMagic;
                    excess -= reduceMagic;
                }
            }
            this.overlapRotationToggle = !this.overlapRotationToggle;
        }

        // Ensure non-negative
        magicCount = Math.max(0, Math.min(count, magicCount));
        wildCount = Math.max(0, Math.min(count - magicCount, wildCount));

        // Compose the set
        const selectedKeys = [];
        const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

        // Add magic blocks
        for (let m = 0; m < magicCount; m++) {
            if (magicBlocks.length > 0) selectedKeys.push(getRandom(magicBlocks));
        }

        // Add wild shapes
        for (let w = 0; w < wildCount; w++) {
            if (wildShapesAll.length > 0) selectedKeys.push(getRandom(wildShapesAll));
        }

        // Fill the rest with standard shapes, avoiding duplicates when possible
        let remainingStandard = [...standardShapesAll];
        const needStandard = count - selectedKeys.length;
        for (let s = 0; s < needStandard; s++) {
            if (remainingStandard.length === 0) {
                remainingStandard = [...standardShapesAll];
            }
            const pickIndex = Math.floor(Math.random() * remainingStandard.length);
            const chosen = remainingStandard[pickIndex];
            selectedKeys.push(chosen);
            remainingStandard.splice(pickIndex, 1);
        }

        // Shuffle final order to avoid grouping by type
        for (let i = selectedKeys.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [selectedKeys[i], selectedKeys[j]] = [selectedKeys[j], selectedKeys[i]];
        }

        // Build block objects
        this.currentBlocks = selectedKeys.map((key, idx) => ({
            ...this.blockShapes[key],
            id: `block_${idx}_${Date.now()}`,
            rotation: 0
        }));

        return this.currentBlocks;
    }
    
    rotateBlock(block) {
        if (!block) return null;
        
        const rotated = {
            ...block,
            shape: this.rotateMatrix(block.shape),
            rotation: (block.rotation + 90) % 360
        };
        
        return rotated;
    }
    
    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = [];
        
        for (let i = 0; i < cols; i++) {
            rotated[i] = [];
            for (let j = 0; j < rows; j++) {
                rotated[i][j] = matrix[rows - 1 - j][i];
            }
        }
        
        return rotated;
    }
    
    canPlaceBlock(block, row, col, board) {
        // Validate inputs first
        if (!block || !board || !Array.isArray(board) || board.length === 0) {
            console.warn('canPlaceBlock: Invalid inputs', { block, board });
            return false;
        }
        
        const shape = block.shape;
        if (!shape || !Array.isArray(shape) || shape.length === 0) {
            console.warn('canPlaceBlock: Invalid block shape', { block, shape });
            return false;
        }
        
        const boardSize = board.length;
        
        // Check if block fits within board boundaries
        if (row < 0 || col < 0 || 
            row + shape.length > boardSize || 
            col + shape[0].length > boardSize) {
            return false;
        }
        
        // Check if all cells are empty
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c] === 1) {
                    // Additional bounds checking
                    if (row + r >= boardSize || col + c >= boardSize) {
                        return false;
                    }
                    if (!board[row + r] || board[row + r][col + c] === 1) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    // Check if block is within board boundaries (for ghost blocks)
    // This doesn't check for collisions, only boundaries
    isWithinBounds(block, row, col, board) {
        // Validate inputs first
        if (!block || !board || !Array.isArray(board) || board.length === 0) {
            console.warn('isWithinBounds: Invalid inputs', { block, board });
            return false;
        }
        
        const shape = block.shape;
        if (!shape || !Array.isArray(shape) || shape.length === 0) {
            console.warn('isWithinBounds: Invalid block shape', { block, shape });
            return false;
        }
        
        const boardSize = board.length;
        
        // Check if block fits within board boundaries
        if (row < 0 || col < 0 || 
            row + shape.length > boardSize || 
            col + shape[0].length > boardSize) {
            return false;
        }
        
        // Additional bounds checking for each cell
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c] === 1) {
                    if (row + r >= boardSize || col + c >= boardSize || row + r < 0 || col + c < 0) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    placeBlock(block, row, col, board) {
        const shape = block.shape;
        const newBoard = board.map(row => [...row]); // Deep copy
        
        // Place the block
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c] === 1) {
                    newBoard[row + r][col + c] = 1;
                }
            }
        }
        
        return newBoard;
    }
    
    removeBlock(blockId) {
        this.currentBlocks = this.currentBlocks.filter(block => block.id !== blockId);
    }
    
    getBlockById(blockId) {
        return this.currentBlocks.find(block => block.id === blockId);
    }
    
    clearSelection() {
        this.selectedBlock = null;
        this.selectedBlockPosition = null;
    }
}
