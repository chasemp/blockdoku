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
        let availableShapes = Object.keys(this.blockShapes);
        
        // Filter out wild shapes unless wild shapes are enabled
        // Wild shapes will be selected probabilistically based on wildShapesFrequency during block selection
        const wildShapes = availableShapes.filter(key => this.blockShapes[key].isWild);
        const standardShapes = availableShapes.filter(key => !this.blockShapes[key].isWild);
        
        if (!enableWildShapes) {
            availableShapes = standardShapes;
        }
        
        // Use difficulty manager if provided
        if (difficultyManager) {
            const allowedShapes = difficultyManager.getAllowedShapes();
            const sizeRange = difficultyManager.getBlockSizeRange();
            
            if (allowedShapes !== 'all') {
                availableShapes = availableShapes.filter(key => allowedShapes.includes(key));
            }
            
            // Filter by size range
            availableShapes = availableShapes.filter(key => {
                const shape = this.blockShapes[key].shape;
                const maxDimension = Math.max(shape.length, shape[0].length);
                return maxDimension >= sizeRange[0] && maxDimension <= sizeRange[1];
            });
        } else {
            // Legacy difficulty filtering
            if (difficulty === 'large') {
                // Prefer larger, simpler blocks for easy mode
                availableShapes = availableShapes.filter(key => {
                    const shape = this.blockShapes[key].shape;
                    const maxDimension = Math.max(shape.length, shape[0].length);
                    return maxDimension >= 3; // 3x3 or larger
                });
            } else if (difficulty === 'small') {
                // Prefer smaller blocks for hard mode
                availableShapes = availableShapes.filter(key => {
                    const shape = this.blockShapes[key].shape;
                    const maxDimension = Math.max(shape.length, shape[0].length);
                    return maxDimension <= 3; // 3x3 or smaller
                });
            } else if (difficulty === 'complex') {
                // Prefer complex irregular shapes for expert mode
                availableShapes = availableShapes.filter(key => {
                    const shape = this.blockShapes[key].shape;
                    // Look for L-shapes, T-shapes, and other complex patterns
                    return key.includes('L') || key.includes('T') || key.includes('Z') || 
                           key.includes('U') || key.includes('Cross') || key.includes('Plus');
                });
            }
        }
        
        // Fallback to all shapes if filtering results in empty array
        if (availableShapes.length === 0) {
            availableShapes = Object.keys(this.blockShapes);
        }
        
        // Separate magic blocks from regular blocks
        const magicBlocks = Object.keys(this.blockShapes).filter(key => this.blockShapes[key].isMagic);
        const regularBlocks = availableShapes.filter(key => !this.blockShapes[key].isMagic);
        
        this.currentBlocks = [];
        
        // Create a copy of available shapes to avoid modifying the original
        let remainingShapes = [...regularBlocks];
        
        for (let i = 0; i < count; i++) {
            let selectedKey;
            
            // Only generate magic blocks if the setting is enabled
            // Chance based on magicBlocksFrequency (1-10, where 1 = 10%, 10 = 100%)
            const hasMagicBlock = this.currentBlocks.some(block => block.isMagic);
            const magicChance = magicBlocksFrequency / 10; // Convert to probability
            
            // At lower frequencies (< 5), limit to 1 magic block per set
            // At higher frequencies (>= 5), allow multiple magic blocks based on probability
            const allowMultipleMagic = magicBlocksFrequency >= 5;
            const shouldGenerateMagic = enableMagicBlocks && 
                                       (allowMultipleMagic || !hasMagicBlock) && 
                                       Math.random() < magicChance && 
                                       magicBlocks.length > 0;
            
            if (shouldGenerateMagic) {
                // Select a random magic block
                const magicIndex = Math.floor(Math.random() * magicBlocks.length);
                selectedKey = magicBlocks[magicIndex];
            } else {
                // Determine if we should select a wild shape based on wildShapesFrequency
                const wildShapeChance = wildShapesFrequency / 10; // Convert to probability
                const shouldUseWildShape = enableWildShapes && 
                                          wildShapes.length > 0 && 
                                          Math.random() < wildShapeChance;
                
                // Select from appropriate pool
                let selectionPool;
                if (shouldUseWildShape) {
                    // Use wild shapes pool
                    selectionPool = wildShapes.filter(key => remainingShapes.includes(key) || remainingShapes.length === 0);
                    if (selectionPool.length === 0) {
                        selectionPool = wildShapes;
                    }
                } else {
                    // Use standard shapes pool
                    // If we've used all available shapes, reset the pool
                    if (remainingShapes.length === 0) {
                        remainingShapes = [...regularBlocks];
                    }
                    selectionPool = remainingShapes;
                }
                
                const randomIndex = Math.floor(Math.random() * selectionPool.length);
                selectedKey = selectionPool[randomIndex];
                
                // Remove the selected shape to avoid duplicates (only for standard shapes)
                if (!shouldUseWildShape && remainingShapes.includes(selectedKey)) {
                    const removeIndex = remainingShapes.indexOf(selectedKey);
                    remainingShapes.splice(removeIndex, 1);
                }
            }
            
            const block = {
                ...this.blockShapes[selectedKey],
                id: `block_${i}_${Date.now()}`,
                rotation: 0
            };
            this.currentBlocks.push(block);
        }
        
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
