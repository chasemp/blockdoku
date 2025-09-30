/**
 * Blockdoku PWA - Block Palette UI
 * MVT Milestone 2: Basic Block Placement System
 */

export class BlockPalette {
    constructor(containerId, blockManager, petrificationManager = null) {
        this.container = document.getElementById(containerId);
        this.blockManager = blockManager;
        this.petrificationManager = petrificationManager;
        this.selectedBlock = null;
        this.blockElements = new Map();
        this._placeabilityTimeout = null;
        this.lastTapTime = null; // For double-tap detection on mobile
        this._petrificationUpdateInterval = null;
        
        // Piece timeout tracking
        this.pieceTimeouts = new Map(); // blockId -> { startTime, warningShown, timedOut }
        this.timeoutCheckInterval = null;
        this.WARNING_TIME = 15000; // 15 seconds
        this.TIMEOUT_TIME = 30000; // 30 seconds
        this.onPieceTimeout = null; // Callback for when a piece times out
        this.timeoutPaused = false; // Pause timeout when game is over or not active
        
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
        
        // Start petrification visual updates if enabled
        if (this.petrificationManager && this.petrificationManager.isEnabled()) {
            this.startPetrificationUpdates();
        } else {
            this.stopPetrificationUpdates();
        }
        
        // Reset piece timeouts for new blocks
        this.resetPieceTimeouts(blocks);
    }
    
    createBlockElement(block) {
        const blockDiv = document.createElement('div');
        blockDiv.className = 'block-item';
        blockDiv.dataset.blockId = block.id;
        blockDiv.title = `Click to select, double-click to rotate: ${block.name} (${block.points} pts)`;
        
        // Create block shape container
        const shapeContainer = document.createElement('div');
        shapeContainer.className = 'block-shape';
        
        // Create block preview - increased size for better mobile experience
        const cellSize = 30; // Increased from 20 to 30 pixels
        const preview = document.createElement('div');
        preview.className = 'block-preview';
        preview.style.width = `${block.shape[0].length * cellSize}px`;
        preview.style.height = `${block.shape.length * cellSize}px`;
        
        // Draw block shape
        const canvas = document.createElement('canvas');
        canvas.width = block.shape[0].length * cellSize;
        canvas.height = block.shape.length * cellSize;
        const ctx = canvas.getContext('2d');
        
        // Draw block
        ctx.fillStyle = block.color;
        ctx.strokeStyle = this.darkenColor(block.color);
        ctx.lineWidth = 2; // Increased line width for better visibility
        
        for (let r = 0; r < block.shape.length; r++) {
            for (let c = 0; c < block.shape[r].length; c++) {
                if (block.shape[r][c] === 1) {
                    const x = c * cellSize;
                    const y = r * cellSize;
                    ctx.fillRect(x, y, cellSize, cellSize);
                    ctx.strokeRect(x, y, cellSize, cellSize);
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
                // Select block but no visual highlighting - dragging is primary selection mechanism
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
                
                // Store the touch for potential drag
                this.touchStart = e.touches[0];
                this.touchStartTime = Date.now();
                this.touchStartBlockId = blockId;
                
                // Add subtle visual feedback for touch start
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
                        
                        // Add dragging visual feedback - this is the primary selection indication
                        const blockItem = document.querySelector(`[data-block-id="${this.touchStartBlockId}"]`);
                        if (blockItem) {
                            blockItem.classList.add('dragging');
                        }
                    }
                }
            }
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            if (this.touchStart) {
                const blockItem = document.querySelector(`[data-block-id="${this.touchStartBlockId}"]`);
                const touch = e.changedTouches[0];
                const deltaTime = Date.now() - this.touchStartTime;
                const deltaX = Math.abs(touch.clientX - this.touchStart.clientX);
                const deltaY = Math.abs(touch.clientY - this.touchStart.clientY);
                
                // Check if this was a tap (not a drag)
                if (deltaX < 5 && deltaY < 5 && deltaTime < 200) {
                    // Handle double-tap detection for rotation
                    if (this.lastTapTime && (Date.now() - this.lastTapTime) < 300) {
                        // Double tap detected - rotate the block
                        e.preventDefault();
                        this.rotateBlock(this.touchStartBlockId);
                        this.lastTapTime = null; // Reset to prevent triple-tap
                    } else {
                        // Single tap - select the block (but no visual highlighting)
                        this.selectBlock(this.touchStartBlockId);
                        this.lastTapTime = Date.now();
                    }
                }
                
                // Reset visual feedback
                if (blockItem) {
                    blockItem.classList.remove('dragging');
                    blockItem.style.transform = '';
                    blockItem.style.transition = '';
                }
                
                this.touchStart = null;
                this.touchStartTime = null;
                this.touchStartBlockId = null;
                this.isDragging = false;
            }
        }, { passive: false });
        
        document.addEventListener('touchcancel', (e) => {
            if (this.touchStart) {
                // Reset visual feedback
                const blockItem = document.querySelector(`[data-block-id="${this.touchStartBlockId}"]`);
                if (blockItem) {
                    blockItem.classList.remove('dragging');
                    blockItem.style.transform = '';
                    blockItem.style.transition = '';
                }
                
                this.touchStart = null;
                this.touchStartTime = null;
                this.touchStartBlockId = null;
                this.isDragging = false;
                this.lastTapTime = null; // Reset double-tap detection
            }
        }, { passive: true });
    }
    
    startDragFromPalette(touch) {
        // Get the block that's actually being dragged
        const draggedBlock = this.blockManager.getBlockById(this.touchStartBlockId);
        if (!draggedBlock) return;
        
        // Auto-select the block being dragged
        this.selectBlock(this.touchStartBlockId);
        
        // Notify the game that we're starting a drag from the palette
        const dragEvent = new CustomEvent('blockDragStart', {
            detail: {
                block: draggedBlock,
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
            // Don't add visual selection highlighting - dragging is the primary selection mechanism
            // Visual feedback will be provided through dragging state only
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
        // No need to remove 'selected' class since we're not using passive selection highlighting
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

    // --- Placeability and pre-game-over indicators ---
    /**
     * Apply placeability classes to palette items.
     * @param {{[blockId:string]: boolean}} placeableById
     * @param {{highlightLast:boolean, durationMs?:number}} options
     */
    setPlaceability(placeableById, options = {}) {
        const { highlightLast = false, durationMs = 1250 } = options;

        // Clear any prior timeout
        if (this._placeabilityTimeout) {
            clearTimeout(this._placeabilityTimeout);
            this._placeabilityTimeout = null;
        }

        // Count placeable blocks and find last playable id if any
        let placeableIds = [];
        Object.keys(placeableById || {}).forEach(id => {
            if (placeableById[id]) placeableIds.push(id);
        });

        // Apply classes
        this.blockElements.forEach((el, id) => {
            const isPlaceable = !!placeableById[id];
            el.classList.toggle('unplaceable', !isPlaceable);
            el.classList.toggle('placeable', isPlaceable);
            el.classList.remove('last-playable');
        });

        if (highlightLast && placeableIds.length === 1) {
            const lastId = placeableIds[0];
            const el = this.blockElements.get(lastId);
            if (el) {
                el.classList.add('last-playable');
            }
        }

        // Auto clear after duration (only if durationMs > 0)
        if (durationMs > 0) {
            this._placeabilityTimeout = setTimeout(() => {
                this.clearPlaceability();
            }, durationMs);
        }
    }

    /**
     * Dim entire palette to indicate imminent game over.
     * Automatically clears after duration (if durationMs > 0).
     */
    showPreGameOverIndicator(durationMs = 1250) {
        if (!this.container) return;
        const palette = this.container.querySelector('.block-palette');
        if (palette) {
            palette.classList.add('pre-game-over');
        }
        this.blockElements.forEach((el) => {
            el.classList.add('unplaceable');
            el.classList.remove('last-playable');
        });
        if (this._placeabilityTimeout) {
            clearTimeout(this._placeabilityTimeout);
        }
        // Only set timeout if durationMs > 0
        if (durationMs > 0) {
            this._placeabilityTimeout = setTimeout(() => {
                this.clearPlaceability();
            }, durationMs);
        }
    }

    clearPlaceability() {
        const palette = this.container ? this.container.querySelector('.block-palette') : null;
        if (palette) {
            palette.classList.remove('pre-game-over');
        }
        this.blockElements.forEach((el) => {
            el.classList.remove('unplaceable');
            el.classList.remove('placeable');
            el.classList.remove('last-playable');
        });
        if (this._placeabilityTimeout) {
            clearTimeout(this._placeabilityTimeout);
            this._placeabilityTimeout = null;
        }
    }
    
    // Petrification visual updates
    startPetrificationUpdates() {
        // Stop any existing interval
        this.stopPetrificationUpdates();
        
        // Update every 100ms for smooth animations
        this._petrificationUpdateInterval = setInterval(() => {
            this.updatePetrificationVisuals();
        }, 100);
    }
    
    stopPetrificationUpdates() {
        if (this._petrificationUpdateInterval) {
            clearInterval(this._petrificationUpdateInterval);
            this._petrificationUpdateInterval = null;
        }
        
        // Clear all petrification classes
        this.blockElements.forEach((el) => {
            el.classList.remove('petrified', 'warning-7s', 'warning-3s');
        });
    }
    
    updatePetrificationVisuals() {
        if (!this.petrificationManager || !this.petrificationManager.isEnabled()) {
            return;
        }
        
        this.blockElements.forEach((el, blockId) => {
            const state = this.petrificationManager.getBlockState(blockId);
            
            // Remove all petrification classes
            el.classList.remove('petrified', 'warning-7s', 'warning-3s');
            
            // Add appropriate class based on state
            if (state.petrified) {
                el.classList.add('petrified');
            } else if (state.warning === '3s') {
                el.classList.add('warning-3s');
            } else if (state.warning === '7s') {
                el.classList.add('warning-7s');
            }
        });
    }

    // --- Piece Timeout System ---
    
    /**
     * Reset piece timeout tracking for new blocks
     */
    resetPieceTimeouts(blocks) {
        // Clear old timeouts
        this.pieceTimeouts.clear();
        
        // Start tracking new blocks
        const now = Date.now();
        blocks.forEach(block => {
            this.pieceTimeouts.set(block.id, {
                startTime: now,
                warningShown: false,
                timedOut: false
            });
        });
        
        // Start timeout checking if not already running
        if (!this.timeoutCheckInterval) {
            this.startTimeoutChecking();
        }
    }
    
    /**
     * Reset timeout for a specific piece (when it's placed)
     */
    resetPieceTimeout(blockId) {
        if (this.pieceTimeouts.has(blockId)) {
            this.pieceTimeouts.delete(blockId);
            
            // Remove any visual states
            const el = this.blockElements.get(blockId);
            if (el) {
                el.classList.remove('piece-struggling', 'piece-timed-out');
            }
        }
    }
    
    /**
     * Start the timeout checking interval
     */
    startTimeoutChecking() {
        // Clear existing interval
        if (this.timeoutCheckInterval) {
            clearInterval(this.timeoutCheckInterval);
        }
        
        // Check every 500ms for smooth animations
        this.timeoutCheckInterval = setInterval(() => {
            this.checkPieceTimeouts();
        }, 500);
    }
    
    /**
     * Stop timeout checking
     */
    stopTimeoutChecking() {
        if (this.timeoutCheckInterval) {
            clearInterval(this.timeoutCheckInterval);
            this.timeoutCheckInterval = null;
        }
        
        // Clear all visual states
        this.blockElements.forEach((el) => {
            el.classList.remove('piece-struggling', 'piece-timed-out');
        });
        
        // Clear timeout data
        this.pieceTimeouts.clear();
    }
    
    /**
     * Pause timeout checking (e.g., when game is paused or over)
     */
    pauseTimeoutChecking() {
        this.timeoutPaused = true;
        // Store pause time for each piece
        const now = Date.now();
        this.pieceTimeouts.forEach((timeoutData) => {
            if (!timeoutData.pauseTime) {
                timeoutData.pauseTime = now;
            }
        });
    }
    
    /**
     * Resume timeout checking
     */
    resumeTimeoutChecking() {
        this.timeoutPaused = false;
        // Adjust start times based on pause duration
        const now = Date.now();
        this.pieceTimeouts.forEach((timeoutData) => {
            if (timeoutData.pauseTime) {
                const pauseDuration = now - timeoutData.pauseTime;
                timeoutData.startTime += pauseDuration;
                delete timeoutData.pauseTime;
            }
        });
    }
    
    /**
     * Check all pieces for timeouts
     */
    checkPieceTimeouts() {
        // Don't check if paused
        if (this.timeoutPaused) return;
        
        const now = Date.now();
        let anyTimedOut = false;
        
        this.pieceTimeouts.forEach((timeoutData, blockId) => {
            const elapsed = now - timeoutData.startTime;
            const el = this.blockElements.get(blockId);
            
            if (!el) return;
            
            // Check for timeout (30 seconds)
            if (elapsed >= this.TIMEOUT_TIME && !timeoutData.timedOut) {
                timeoutData.timedOut = true;
                el.classList.remove('piece-struggling');
                el.classList.add('piece-timed-out');
                anyTimedOut = true;
                
                // Show floating notification
                this.showPieceTimeoutNotification();
                
                // Notify game of timeout
                if (this.onPieceTimeout) {
                    this.onPieceTimeout(blockId);
                }
            }
            // Check for warning (15 seconds)
            else if (elapsed >= this.WARNING_TIME && !timeoutData.warningShown) {
                timeoutData.warningShown = true;
                el.classList.add('piece-struggling');
            }
        });
    }
    
    /**
     * Show floating notification when a piece times out
     */
    showPieceTimeoutNotification() {
        // Get the blocks container position
        const blocksContainer = document.getElementById('blocks-container');
        if (!blocksContainer) return;
        
        const rect = blocksContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create floating notification element
        const notification = document.createElement('div');
        notification.className = 'floating-piece-timeout';
        notification.textContent = 'Piece Lodged in Place!';
        notification.style.position = 'fixed';
        notification.style.left = `${centerX}px`;
        notification.style.top = `${centerY}px`;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Remove after animation completes
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 3000);
    }
    
    /**
     * Set the callback for when a piece times out
     */
    setPieceTimeoutCallback(callback) {
        this.onPieceTimeout = callback;
    }
    
    /**
     * Check if all available pieces have timed out
     */
    areAllPiecesTimedOut() {
        if (this.pieceTimeouts.size === 0) return false;
        
        let allTimedOut = true;
        this.pieceTimeouts.forEach((timeoutData) => {
            if (!timeoutData.timedOut) {
                allTimedOut = false;
            }
        });
        
        return allTimedOut;
    }
}
