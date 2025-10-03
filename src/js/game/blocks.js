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
                isWild: true,
                wildType: 'lineClear',
                description: 'Clears any line it completes'
            },
            wildLine2: {
                name: 'Wild Line 2',
                shape: [[1, 1]],
                color: '#ff6b6b',
                points: 5,
                isWild: true,
                wildType: 'lineClear',
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
                isWild: true,
                wildType: 'lineClear',
                description: 'Clears any line it completes'
            },
            
            // === ADDITIONAL MAGIC BLOCK TYPES ===
            
            // Bomb magic blocks - clear surrounding area
            bombSingle: {
                name: 'Bomb Single',
                shape: [[1]],
                color: '#ff4444',
                points: 8,
                isWild: true,
                wildType: 'bomb',
                description: 'Explodes to clear 3x3 area around it'
            },
            bombLine2: {
                name: 'Bomb Line',
                shape: [[1, 1]],
                color: '#ff4444',
                points: 12,
                isWild: true,
                wildType: 'bomb',
                description: 'Explodes to clear 3x3 area around each cell'
            },
            
            // Lightning magic blocks - clear entire row and column
            lightningSingle: {
                name: 'Lightning Single',
                shape: [[1]],
                color: '#ffeb3b',
                points: 15,
                isWild: true,
                wildType: 'lightning',
                description: 'Clears entire row and column'
            },
            
            // Ghost magic blocks - can overlap once per game
            ghostSingle: {
                name: 'Ghost Single',
                shape: [[1]],
                color: '#9c27b0',
                points: 6,
                isWild: true,
                wildType: 'ghost',
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
                isWild: false,
                isCreativeShape: true
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
                isWild: false,
                isCreativeShape: true
            },
            pentominoY: {
                name: 'Y-Pentomino',
                shape: [
                    [0, 1, 0, 0],
                    [1, 1, 1, 1]
                ],
                color: '#45b7d1',
                points: 5,
                isWild: false,
                isCreativeShape: true
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
                isWild: false,
                isCreativeShape: true
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
                isWild: false,
                isCreativeShape: true
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
                isWild: false,
                isCreativeShape: true
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
                isWild: false,
                isCreativeShape: true
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
                isWild: false,
                isCreativeShape: true
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
                isWild: false,
                isCreativeShape: true
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
                isWild: false,
                isCreativeShape: true
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
                isWild: false,
                isCreativeShape: true
            }
        };
    }
    
    generateRandomBlocks(count = 3, difficulty = 'all', difficultyManager = null, enableMagicBlocks = false, enableWildShapes = false) {
        let availableShapes = Object.keys(this.blockShapes);
        
        // Filter out creative shapes unless wild shapes are enabled
        if (!enableWildShapes) {
            availableShapes = availableShapes.filter(key => !this.blockShapes[key].isCreativeShape);
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
        
        // Separate wild blocks from regular blocks
        const wildBlocks = Object.keys(this.blockShapes).filter(key => this.blockShapes[key].isWild);
        const regularBlocks = availableShapes.filter(key => !this.blockShapes[key].isWild);
        
        this.currentBlocks = [];
        
        // Create a copy of available shapes to avoid modifying the original
        let remainingShapes = [...regularBlocks];
        
        for (let i = 0; i < count; i++) {
            let selectedKey;
            
            // Only generate wild blocks if the setting is enabled
            // 10% chance to generate a wild block (but max 1 per set)
            const hasWildBlock = this.currentBlocks.some(block => block.isWild);
            const shouldGenerateWild = enableMagicBlocks && !hasWildBlock && Math.random() < 0.1 && wildBlocks.length > 0;
            
            if (shouldGenerateWild) {
                // Select a random wild block
                const wildIndex = Math.floor(Math.random() * wildBlocks.length);
                selectedKey = wildBlocks[wildIndex];
            } else {
                // Select a regular block
                // If we've used all available shapes, reset the pool
                if (remainingShapes.length === 0) {
                    remainingShapes = [...regularBlocks];
                }
                
                const randomIndex = Math.floor(Math.random() * remainingShapes.length);
                selectedKey = remainingShapes[randomIndex];
                
                // Remove the selected shape to avoid duplicates
                remainingShapes.splice(randomIndex, 1);
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
