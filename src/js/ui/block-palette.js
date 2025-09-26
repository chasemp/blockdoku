/**
 * Blockdoku PWA - Block Palette UI
 * MVT Milestone 2: Basic Block Placement System
 */

export class BlockPalette {
    constructor(containerId, blockManager) {
        this.container = document.getElementById(containerId);
        this.blockManager = blockManager;
        this.selectedBlock = null;
        this.blockElements = new Map();
        
        this.init();
    }
    
    init() {
        this.render();
        this.setupEventListeners();
    }
    
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="block-palette">
                <h3>Available Blocks</h3>
                <div class="blocks-container" id="blocks-container">
                    <!-- Blocks will be rendered here -->
                </div>
            </div>
            <button id="rotate-selected" class="rotate-selected-btn" title="Rotate selected block">
                <span>↻</span>
            </button>
        `;
    }
    
    updateBlocks(blocks) {
        const container = document.getElementById('blocks-container');
        if (!container) return;
        
        container.innerHTML = '';
        this.blockElements.clear();
        
        blocks.forEach(block => {
            const blockElement = this.createBlockElement(block);
            container.appendChild(blockElement);
            this.blockElements.set(block.id, blockElement);
        });
    }
    
    createBlockElement(block) {
        const blockDiv = document.createElement('div');
        blockDiv.className = 'block-item';
        blockDiv.dataset.blockId = block.id;
        blockDiv.title = `Click to select, double-click to rotate: ${block.name} (${block.points} pts)`;
        
        // Create block shape container
        const shapeContainer = document.createElement('div');
        shapeContainer.className = 'block-shape';
        
        // Create block preview
        const preview = document.createElement('div');
        preview.className = 'block-preview';
        preview.style.width = `${block.shape[0].length * 20}px`;
        preview.style.height = `${block.shape.length * 20}px`;
        
        // Draw block shape
        const canvas = document.createElement('canvas');
        canvas.width = block.shape[0].length * 20;
        canvas.height = block.shape.length * 20;
        const ctx = canvas.getContext('2d');
        
        // Draw block
        ctx.fillStyle = block.color;
        ctx.strokeStyle = this.darkenColor(block.color);
        ctx.lineWidth = 1;
        
        for (let r = 0; r < block.shape.length; r++) {
            for (let c = 0; c < block.shape[r].length; c++) {
                if (block.shape[r][c] === 1) {
                    const x = c * 20;
                    const y = r * 20;
                    ctx.fillRect(x, y, 20, 20);
                    ctx.strokeRect(x, y, 20, 20);
                }
            }
        }
        
        preview.appendChild(canvas);
        shapeContainer.appendChild(preview);
        blockDiv.appendChild(shapeContainer);
        
        return blockDiv;
    }
    
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.block-item')) {
                const blockItem = e.target.closest('.block-item');
                const blockId = blockItem.dataset.blockId;
                this.selectBlock(blockId);
            }
            
            if (e.target.closest('#rotate-selected')) {
                e.preventDefault();
                if (this.selectedBlock) {
                    this.rotateBlock(this.selectedBlock.id);
                }
            }
        });
        
        document.addEventListener('dblclick', (e) => {
            if (e.target.closest('.block-item')) {
                e.preventDefault();
                const blockItem = e.target.closest('.block-item');
                const blockId = blockItem.dataset.blockId;
                this.rotateBlock(blockId);
            }
        });
        
        // Touch events for mobile drag and drop
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('.block-item')) {
                const blockItem = e.target.closest('.block-item');
                const blockId = blockItem.dataset.blockId;
                this.selectBlock(blockId);
                
                // Store the touch for potential drag
                this.touchStart = e.touches[0];
                this.touchStartTime = Date.now();
                this.touchStartBlockId = blockId;
                
                // Add visual feedback
                blockItem.style.transform = 'scale(0.95)';
                blockItem.style.transition = 'transform 0.1s ease';
            }
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (this.touchStart && this.touchStartBlockId) {
                const touch = e.touches[0];
                const deltaX = Math.abs(touch.clientX - this.touchStart.clientX);
                const deltaY = Math.abs(touch.clientY - this.touchStart.clientY);
                const deltaTime = Date.now() - this.touchStartTime;
                
                // If moved more than 5px or 100ms has passed, consider it a drag
                if (deltaX > 5 || deltaY > 5 || deltaTime > 100) {
                    e.preventDefault();
                    
                    // Start drag operation
                    if (!this.isDragging) {
                        this.isDragging = true;
                        this.startDragFromPalette(touch);
                        
                        // Add dragging visual feedback
                        const blockItem = document.querySelector(`[data-block-id="${this.touchStartBlockId}"]`);
                        if (blockItem) {
                            blockItem.style.opacity = '0.7';
                            blockItem.style.transform = 'scale(1.1)';
                        }
                    }
                }
            }
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            if (this.touchStart) {
                // Reset visual feedback
                const blockItem = document.querySelector(`[data-block-id="${this.touchStartBlockId}"]`);
                if (blockItem) {
                    blockItem.style.transform = '';
                    blockItem.style.transition = '';
                    blockItem.style.opacity = '';
                }
                
                this.touchStart = null;
                this.touchStartTime = null;
                this.touchStartBlockId = null;
                this.isDragging = false;
            }
        }, { passive: true });
        
        document.addEventListener('touchcancel', (e) => {
            if (this.touchStart) {
                // Reset visual feedback
                const blockItem = document.querySelector(`[data-block-id="${this.touchStartBlockId}"]`);
                if (blockItem) {
                    blockItem.style.transform = '';
                    blockItem.style.transition = '';
                    blockItem.style.opacity = '';
                }
                
                this.touchStart = null;
                this.touchStartTime = null;
                this.touchStartBlockId = null;
                this.isDragging = false;
            }
        }, { passive: true });
    }
    
    startDragFromPalette(touch) {
        // Notify the game that we're starting a drag from the palette
        const dragEvent = new CustomEvent('blockDragStart', {
            detail: {
                block: this.selectedBlock,
                touch: touch
            }
        });
        document.dispatchEvent(dragEvent);
    }
    
    selectBlock(blockId) {
        // Clear previous selection
        this.clearSelection();
        
        // Select new block
        this.selectedBlock = this.blockManager.getBlockById(blockId);
        if (this.selectedBlock) {
            const blockElement = this.blockElements.get(blockId);
            if (blockElement) {
                blockElement.classList.add('selected');
            }
        }
        
        // Update rotate button state
        this.updateRotateButton();
        
        // Dispatch selection event
        this.dispatchSelectionEvent();
    }
    
    selectBlockById(blockId) {
        // Public method to select a block by ID (for auto-selection)
        this.selectBlock(blockId);
    }
    
    rotateBlock(blockId) {
        const block = this.blockManager.getBlockById(blockId);
        if (!block) return;
        
        const rotatedBlock = this.blockManager.rotateBlock(block);
        if (rotatedBlock) {
            // Update the block in the manager
            const blockIndex = this.blockManager.currentBlocks.findIndex(b => b.id === blockId);
            if (blockIndex !== -1) {
                this.blockManager.currentBlocks[blockIndex] = rotatedBlock;
                
                // Update UI
                this.updateBlocks(this.blockManager.currentBlocks);
                
                // Re-select if this was the selected block
                if (this.selectedBlock && this.selectedBlock.id === blockId) {
                    this.selectedBlock = rotatedBlock;
                    this.dispatchSelectionEvent();
                }
                
                // Add rotation effects
                if (this.game && this.game.effectsManager) {
                    this.game.effectsManager.onBlockRotate();
                }
            }
        }
    }
    
    clearSelection() {
        this.selectedBlock = null;
        this.blockElements.forEach(element => {
            element.classList.remove('selected');
        });
        this.updateRotateButton();
    }
    
    dispatchSelectionEvent() {
        const event = new CustomEvent('blockSelected', {
            detail: { block: this.selectedBlock }
        });
        document.dispatchEvent(event);
    }
    
    darkenColor(color) {
        // Simple color darkening for borders
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const newR = Math.max(0, r - 30);
        const newG = Math.max(0, g - 30);
        const newB = Math.max(0, b - 30);
        
        return `rgb(${newR}, ${newG}, ${newB})`;
    }
    
    updateRotateButton() {
        const rotateBtn = document.getElementById('rotate-selected');
        if (rotateBtn) {
            if (this.selectedBlock) {
                rotateBtn.disabled = false;
                rotateBtn.classList.remove('disabled');
            } else {
                rotateBtn.disabled = true;
                rotateBtn.classList.add('disabled');
            }
        }
    }
    
    getSelectedBlock() {
        return this.selectedBlock;
    }
}
