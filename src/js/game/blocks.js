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
            }
        };
    }
    
    generateRandomBlocks(count = 3) {
        const shapeKeys = Object.keys(this.blockShapes);
        this.currentBlocks = [];
        
        for (let i = 0; i < count; i++) {
            const randomKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
            const block = {
                ...this.blockShapes[randomKey],
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
        const shape = block.shape;
        const boardSize = board.length;
        
        // Validate inputs
        if (!block || !shape || !board || !Array.isArray(board)) {
            return false;
        }
        
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
