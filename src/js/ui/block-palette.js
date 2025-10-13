/**
 * Blockdoku PWA - Block Palette UI
 * MVT Milestone 2: Basic Block Placement System
 */

export class BlockPalette {
    constructor(containerId, blockManager, game = null) {
        this.container = document.getElementById(containerId);
        this.blockManager = blockManager;
        this.game = game;
        this.petrificationManager = game?.petrificationManager || null;
        this.selectedBlock = null;
        this.blockElements = new Map();
        this._placeabilityTimeout = null;
        this.lastTapTime = null; // For double-tap detection on mobile
        this._petrificationUpdateInterval = null;
        
        // Mouse drag state for desktop
        this.mouseStart = null;
        this.mouseStartTime = null;
        this.mouseStartBlockId = null;
        
        // Piece timeout tracking
        this.pieceTimeouts = new Map(); // blockId -> { startTime, warningShown, timedOut }
        this.timeoutCheckInterval = null;
        this.WARNING_TIME = 15000; // 15 seconds
        this.TIMEOUT_TIME = 30000; // 30 seconds
        this.onPieceTimeout = null; // Callback for when a piece times out
        this.timeoutPaused = false; // Pause timeout when game is over or not active
        this.pieceTimeoutEnabled = false; // Whether piece timeout is enabled
        
        // Rotation settings (default: true for backwards compatibility)
        this.rotationEnabled = true; // Whether block rotation is enabled
        
        // Animation settings
        this.animationSettings = {
            blockHoverEffects: true,
            blockSelectionGlow: true,
            blockEntranceAnimations: true,
            particleEffects: true,
            animationSpeed: 'normal'
        };
        
        // Load settings if available
        this.loadAnimationSettings();
        
        this.init();
    }
    
    init() {
        this.render();
        this.setupEventListeners();
        this.setupAnimationControls();
    }
    
    loadAnimationSettings() {
        if (this.game && this.game.settings) {
            const settings = this.game.settings;
            this.animationSettings = {
                blockHoverEffects: settings.blockHoverEffects !== false,
                blockSelectionGlow: settings.blockSelectionGlow !== false,
                blockEntranceAnimations: settings.blockEntranceAnimations !== false,
                particleEffects: settings.particleEffects !== false,
                animationSpeed: settings.animationSpeed || 'normal'
            };
        }
    }
    
    setupAnimationControls() {
        // Apply animation speed CSS custom property
        const speedMultiplier = this.getSpeedMultiplier();
        document.documentElement.style.setProperty('--animation-speed-multiplier', speedMultiplier);
        
        // Apply animation preferences as CSS classes
        const body = document.body;
        body.classList.toggle('no-hover-effects', !this.animationSettings.blockHoverEffects);
        body.classList.toggle('no-selection-glow', !this.animationSettings.blockSelectionGlow);
        body.classList.toggle('no-entrance-animations', !this.animationSettings.blockEntranceAnimations);
        body.classList.toggle('no-particle-effects', !this.animationSettings.particleEffects);
    }
    
    getSpeedMultiplier() {
        switch (this.animationSettings.animationSpeed) {
            case 'slow': return '1.5';
            case 'fast': return '0.5';
            default: return '1.0';
        }
    }
    
    render() {
        if (!this.container) return;
        
        // Check settings (defaults: rotation enabled = true, button shown = false)
        const settings = this.game?.storage?.loadSettings() || {};
        const rotationEnabled = settings.enableBlockRotation !== false;
        const showRotateButton = rotationEnabled && settings.showRotateButton === true;
        
        // Update internal state
        this.rotationEnabled = rotationEnabled;
        
        this.container.innerHTML = `
            <div class="block-palette">
                <h3>Available Blocks</h3>
                <div class="blocks-container" id="blocks-container">
                    <!-- Blocks will be rendered here -->
                </div>
            </div>
            <button id="rotate-selected" class="rotate-selected-btn ${showRotateButton ? '' : 'hidden'}" title="Rotate selected block">
                <span>↻</span>
            </button>
        `;
    }
    
    updateRotationEnabled(enabled) {
        this.rotationEnabled = enabled;
        
        // Also update button visibility - hide if rotation is disabled
        if (!enabled) {
            this.updateRotateButtonVisibility(false);
        }
    }
    
    updateRotateButtonVisibility(show) {
        const rotateBtn = document.getElementById('rotate-selected');
        if (rotateBtn) {
            if (show && this.rotationEnabled) {
                rotateBtn.classList.remove('hidden');
            } else {
                rotateBtn.classList.add('hidden');
            }
        }
    }
    
    updateBlocks(blocks, retryCount = 0) {
        console.log('🎨 BlockPalette.updateBlocks called with blocks:', blocks?.length || 0, 'blocks');
        console.log('Block details:', blocks);
        const container = document.getElementById('blocks-container');
        console.log('blocks-container found:', !!container);
        if (!container) {
            if (retryCount < 5) {
                console.warn(`blocks-container not found! BlockPalette may not be rendered yet. Retrying in 50ms... (attempt ${retryCount + 1}/5)`);
                // Retry after a short delay to allow DOM to be ready
                setTimeout(() => {
                    this.updateBlocks(blocks, retryCount + 1);
                }, 50);
                return;
            } else {
                console.error('blocks-container not found after 5 retries! BlockPalette may not be properly initialized.');
                return;
            }
        }
        
        container.innerHTML = '';
        this.blockElements.clear();
        
        blocks.forEach((block, index) => {
            const blockElement = this.createBlockElement(block);
            
            // Add entrance animation if enabled
            if (this.animationSettings.blockEntranceAnimations) {
                blockElement.classList.add('entering');
                // Stagger the entrance animations
                setTimeout(() => {
                    blockElement.classList.remove('entering');
                }, index * 100 + 50);
            }
            
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
        
        console.log('✅ BlockPalette.updateBlocks completed. Rendered', blocks?.length || 0, 'blocks');
    }
    
    createBlockElement(block) {
        const blockDiv = document.createElement('div');
        blockDiv.className = 'block-item';
        blockDiv.dataset.blockId = block.id;
        
        // Add special styling for wild blocks
        if (block.isWild) {
            blockDiv.classList.add('magic-block');
            blockDiv.title = `🔮 MAGIC BLOCK: ${block.name} (${block.points} pts) - ${block.description}`;
        } else {
            blockDiv.title = `Click to select, double-click to rotate: ${block.name} (${block.points} pts)`;
        }
        
        // Create block info container
        const blockInfo = document.createElement('div');
        blockInfo.className = 'block-info';
        
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
        
        // Draw block with special effects for wild blocks
        if (block.isWild) {
            // Create gradient effect for wild blocks
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#ff6b6b');
            gradient.addColorStop(0.5, '#ff8e8e');
            gradient.addColorStop(1, '#ff6b6b');
            ctx.fillStyle = gradient;
            ctx.strokeStyle = '#cc0000';
            ctx.lineWidth = 3; // Thicker border for wild blocks
        } else {
            ctx.fillStyle = block.color;
            ctx.strokeStyle = this.darkenColor(block.color);
            ctx.lineWidth = 2; // Increased line width for better visibility
        }
        
        for (let r = 0; r < block.shape.length; r++) {
            for (let c = 0; c < block.shape[r].length; c++) {
                if (block.shape[r][c] === 1) {
                    const x = c * cellSize;
                    const y = r * cellSize;
                    ctx.fillRect(x, y, cellSize, cellSize);
                    ctx.strokeRect(x, y, cellSize, cellSize);
                    
                    // Add sparkle effect for wild blocks
                    if (block.isWild) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        ctx.fillRect(x + cellSize/2 - 2, y + 4, 4, 2);
                        ctx.fillRect(x + cellSize - 6, y + cellSize/2 - 1, 2, 2);
                        ctx.fillRect(x + 4, y + cellSize - 6, 2, 2);
                        // Reset fill style for next cell
                        if (block.isWild) {
                            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                            gradient.addColorStop(0, '#ff6b6b');
                            gradient.addColorStop(0.5, '#ff8e8e');
                            gradient.addColorStop(1, '#ff6b6b');
                            ctx.fillStyle = gradient;
                        }
                    }
                }
            }
        }
        
        preview.appendChild(canvas);
        shapeContainer.appendChild(preview);
        blockInfo.appendChild(shapeContainer);
        
        // Create points display (circular badge only)
        const pointsBadge = document.createElement('div');
        pointsBadge.className = 'block-points';
        pointsBadge.textContent = block.points;
        blockInfo.appendChild(pointsBadge);
        
        blockDiv.appendChild(blockInfo);
        
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
                if (this.selectedBlock && this.rotationEnabled) {
                    this.rotateBlock(this.selectedBlock.id);
                }
            }
        });
        
        document.addEventListener('dblclick', (e) => {
            if (e.target.closest('.block-item')) {
                e.preventDefault();
                const blockItem = e.target.closest('.block-item');
                const blockId = blockItem.dataset.blockId;
                if (this.rotationEnabled) {
                    this.rotateBlock(blockId);
                }
            }
        });
        
        // Mouse events for desktop drag and drop
        document.addEventListener('mousedown', (e) => {
            if (e.target.closest('.block-item')) {
                const blockItem = e.target.closest('.block-item');
                const blockId = blockItem.dataset.blockId;
                
                // Store the mouse for potential drag
                this.mouseStart = { clientX: e.clientX, clientY: e.clientY };
                this.mouseStartTime = Date.now();
                this.mouseStartBlockId = blockId;
                
                // Add subtle visual feedback for mouse start
                blockItem.style.transform = 'scale(0.95)';
                blockItem.style.transition = 'transform 0.1s ease';
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.mouseStart && this.mouseStartBlockId) {
                // Verify the block still exists before processing drag
                const blockExists = this.blockManager.getBlockById(this.mouseStartBlockId);
                if (!blockExists) {
                    // Block was removed (likely placed), reset drag state
                    this.resetMouseDragState();
                    return;
                }
                
                const deltaX = Math.abs(e.clientX - this.mouseStart.clientX);
                const deltaY = Math.abs(e.clientY - this.mouseStart.clientY);
                const deltaTime = Date.now() - this.mouseStartTime;
                
                // If moved more than 5px or 100ms has passed, consider it a drag
                if (deltaX > 5 || deltaY > 5 || deltaTime > 100) {
                    e.preventDefault();
                    
                    // Start drag operation
                    if (!this.isDragging) {
                        this.isDragging = true;
                        this.startDragFromPalette({ clientX: e.clientX, clientY: e.clientY });
                        
                        // Add dragging visual feedback - this is the primary selection indication
                        const blockItem = document.querySelector(`[data-block-id="${this.mouseStartBlockId}"]`);
                        if (blockItem) {
                            blockItem.classList.add('dragging');
                        }
                    }
                }
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (this.mouseStart) {
                // Verify the block still exists before processing
                const blockExists = this.blockManager.getBlockById(this.mouseStartBlockId);
                
                const deltaTime = Date.now() - this.mouseStartTime;
                const deltaX = Math.abs(e.clientX - this.mouseStart.clientX);
                const deltaY = Math.abs(e.clientY - this.mouseStart.clientY);
                
                if (this.isDragging) {
                    // End drag operation
                    this.endDragFromPalette();
                } else if (blockExists && deltaTime < 200 && deltaX < 5 && deltaY < 5) {
                    // Single click - select the block (but no visual highlighting)
                    this.selectBlock(this.mouseStartBlockId);
                }
                
                // Reset drag state completely
                this.resetMouseDragState();
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
                // Verify the block still exists before processing drag
                const blockExists = this.blockManager.getBlockById(this.touchStartBlockId);
                if (!blockExists) {
                    // Block was removed (likely placed), reset drag state
                    this.resetDragState();
                    return;
                }
                
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
                // Verify the block still exists before processing
                const blockExists = this.blockManager.getBlockById(this.touchStartBlockId);
                
                const touch = e.changedTouches[0];
                const deltaTime = Date.now() - this.touchStartTime;
                const deltaX = Math.abs(touch.clientX - this.touchStart.clientX);
                const deltaY = Math.abs(touch.clientY - this.touchStart.clientY);
                
                if (this.isDragging) {
                    // End drag operation
                    this.endDragFromPalette();
                } else if (blockExists && deltaX < 5 && deltaY < 5 && deltaTime < 200) {
                    // Only handle tap events (not drags) and only if block still exists
                    // Handle double-tap detection for rotation
                    if (this.lastTapTime && (Date.now() - this.lastTapTime) < 300) {
                        // Double tap detected - rotate the block (if rotation enabled)
                        if (this.rotationEnabled) {
                            e.preventDefault();
                            this.rotateBlock(this.touchStartBlockId);
                        }
                        this.lastTapTime = null; // Reset to prevent triple-tap
                    } else {
                        // Single tap - select the block (but no visual highlighting)
                        this.selectBlock(this.touchStartBlockId);
                        this.lastTapTime = Date.now();
                    }
                }
                
                // Reset drag state completely
                this.resetDragState();
            }
        }, { passive: false });
        
        document.addEventListener('touchcancel', (e) => {
            if (this.touchStart) {
                this.resetDragState();
                this.lastTapTime = null; // Reset double-tap detection
            }
        }, { passive: true });
    }
    
    /**
     * Reset all drag-related state and visual feedback
     * This is called internally by event handlers and can also be called
     * externally (e.g., by app.js when a block is placed)
     */
    resetDragState() {
        // Clean up visual feedback for the dragged block (if it still exists in DOM)
        if (this.touchStartBlockId) {
            const blockItem = document.querySelector(`[data-block-id="${this.touchStartBlockId}"]`);
            if (blockItem) {
                blockItem.classList.remove('dragging');
                blockItem.style.transform = '';
                blockItem.style.transition = '';
            }
        }
        
        // Reset all drag state variables
        this.touchStart = null;
        this.touchStartTime = null;
        this.touchStartBlockId = null;
        this.isDragging = false;
    }
    
    /**
     * Reset all mouse drag-related state and visual feedback
     */
    resetMouseDragState() {
        // Clean up visual feedback for the dragged block (if it still exists in DOM)
        if (this.mouseStartBlockId) {
            const blockItem = document.querySelector(`[data-block-id="${this.mouseStartBlockId}"]`);
            if (blockItem) {
                blockItem.classList.remove('dragging');
                blockItem.style.transform = '';
                blockItem.style.transition = '';
            }
        }
        
        // Reset all mouse drag state variables
        this.mouseStart = null;
        this.mouseStartTime = null;
        this.mouseStartBlockId = null;
        this.isDragging = false;
    }
    
    startDragFromPalette(input) {
        // Get the block that's actually being dragged (works for both touch and mouse)
        const blockId = this.touchStartBlockId || this.mouseStartBlockId;
        const draggedBlock = this.blockManager.getBlockById(blockId);
        if (!draggedBlock) {
            // Block doesn't exist, reset drag state
            this.resetDragState();
            this.resetMouseDragState();
            return;
        }
        
        // Auto-select the block being dragged
        this.selectBlock(blockId);
        
        // Notify the game that we're starting a drag from the palette
        const dragEvent = new CustomEvent('blockDragStart', {
            detail: {
                block: draggedBlock,
                input: input // Works for both touch and mouse
            }
        });
        document.dispatchEvent(dragEvent);
    }
    
    endDragFromPalette() {
        // Notify the game that we're ending a drag from the palette
        const dragEvent = new CustomEvent('blockDragEnd', {
            detail: {
                block: this.selectedBlock
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
                
                // Add selection effects
                this.addSelectionEffects(blockElement);
            }
        }
        
        // Update rotate button state
        this.updateRotateButton();
        
        // Dispatch selection event
        this.dispatchSelectionEvent();
    }
    
    addSelectionEffects(blockElement) {
        // Play selection sound if available
        if (this.game && this.game.soundManager) {
            this.game.soundManager.playBlockSelect();
        }
        
        // Add particle effects if enabled
        if (this.animationSettings.particleEffects) {
            this.createSelectionParticles(blockElement);
        }
        
        // Add haptic feedback on mobile
        if (this.game && this.game.hapticFeedback) {
            this.game.hapticFeedback.light();
        }
    }
    
    createSelectionParticles(blockElement) {
        if (!this.animationSettings.particleEffects) return;
        
        const rect = blockElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create subtle sparkle particles
        for (let i = 0; i < 3; i++) {
            const particle = document.createElement('div');
            particle.className = 'selection-particle';
            particle.style.cssText = `
                position: fixed;
                left: ${centerX}px;
                top: ${centerY}px;
                width: 4px;
                height: 4px;
                background: var(--primary-color);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                animation: particle-burst ${0.6 * this.getSpeedMultiplier()}s ease-out forwards;
                animation-delay: ${i * 0.05}s;
                transform-origin: center;
            `;
            
            // Random direction for each particle
            const angle = (360 / 3) * i;
            particle.style.setProperty('--particle-angle', `${angle}deg`);
            
            document.body.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 800);
        }
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
        // Remove 'selected' class from all blocks
        this.blockElements.forEach((element) => {
            element.classList.remove('selected');
        });
        
        this.selectedBlock = null;
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
        
        // Start timeout checking if not already running and piece timeout is enabled
        if (!this.timeoutCheckInterval && this.pieceTimeoutEnabled) {
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
        // Don't check if paused or if piece timeout is disabled
        if (this.timeoutPaused || !this.pieceTimeoutEnabled) return;
        
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
    
    /**
     * Set whether piece timeout is enabled
     */
    setPieceTimeoutEnabled(enabled) {
        this.pieceTimeoutEnabled = enabled;
        
        if (!enabled) {
            // Stop timeout checking if disabled
            this.stopTimeoutChecking();
        } else if (this.pieceTimeouts.size > 0) {
            // Start timeout checking if enabled and we have pieces
            this.startTimeoutChecking();
        }
    }
}
