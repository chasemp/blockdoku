/**
 * Blockdoku PWA - Difficulty Selector UI
 * Handles difficulty selection and display
 */

import { ConfirmationDialog } from './confirmation-dialog.js';

export class DifficultySelector {
    constructor(game, difficultyManager) {
        this.game = game;
        this.difficultyManager = difficultyManager;
        this.container = null;
        this.isVisible = false;
        this.confirmationDialog = new ConfirmationDialog();
    }
    
    create() {
        // Create difficulty selector container
        this.container = document.createElement('div');
        this.container.id = 'difficulty-selector';
        this.container.className = 'difficulty-selector';
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'difficulty-overlay';
        const handleOverlayClick = () => this.hide();
        overlay.addEventListener('click', handleOverlayClick);
        overlay.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleOverlayClick();
        }, { passive: false });
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'difficulty-modal';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'difficulty-header';
        header.innerHTML = '<h2>Select Difficulty</h2>';
        
        // Create difficulty options
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'difficulty-options';
        
        const difficulties = this.difficultyManager.getAvailableDifficulties();
        
        difficulties.forEach(difficulty => {
            const option = this.createDifficultyOption(difficulty);
            optionsContainer.appendChild(option);
        });
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'difficulty-close';
        closeButton.innerHTML = '×';
        const handleCloseClick = () => this.hide();
        closeButton.addEventListener('click', handleCloseClick);
        closeButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleCloseClick();
        }, { passive: false });
        
        // Assemble modal
        modal.appendChild(header);
        modal.appendChild(optionsContainer);
        modal.appendChild(closeButton);
        
        // Assemble container
        this.container.appendChild(overlay);
        this.container.appendChild(modal);
        
        // Add to page
        document.body.appendChild(this.container);
        
        // Add styles
        this.addStyles();
    }
    
    createDifficultyOption(difficulty) {
        const option = document.createElement('div');
        option.className = 'difficulty-option';
        option.dataset.difficulty = difficulty.key;
        
        // Check if this is the current difficulty
        if (difficulty.key === this.difficultyManager.getCurrentDifficulty()) {
            option.classList.add('selected');
        }
        
        // Create icon
        const icon = document.createElement('div');
        icon.className = 'difficulty-icon';
        icon.innerHTML = this.getDifficultyIcon(difficulty.key);
        
        // Create content
        const content = document.createElement('div');
        content.className = 'difficulty-content';
        
        const name = document.createElement('h3');
        name.textContent = difficulty.name;
        
        const description = document.createElement('p');
        description.textContent = difficulty.description;
        
        const features = document.createElement('div');
        features.className = 'difficulty-features';
        
        if (difficulty.hintsEnabled) {
            const hintFeature = document.createElement('span');
            hintFeature.className = 'feature hint';
            hintFeature.textContent = 'Hints';
            features.appendChild(hintFeature);
        }
        
        if (difficulty.undoEnabled) {
            const undoFeature = document.createElement('span');
            undoFeature.className = 'feature undo';
            undoFeature.textContent = 'Undo';
            features.appendChild(undoFeature);
        }
        
        if (difficulty.timeLimit) {
            const timerFeature = document.createElement('span');
            timerFeature.className = 'feature timer';
            timerFeature.textContent = 'Timer';
            features.appendChild(timerFeature);
        }
        
        if (difficulty.moveLimit) {
            const movesFeature = document.createElement('span');
            movesFeature.className = 'feature moves';
            movesFeature.textContent = 'Limited Moves';
            features.appendChild(movesFeature);
        }
        
        content.appendChild(name);
        content.appendChild(description);
        content.appendChild(features);
        
        option.appendChild(icon);
        option.appendChild(content);
        
        // Add press-and-hold handlers (3ms hold time, same as settings page)
        let pressStartTime = null;
        let pressTimeout = null;
        let isPressed = false;
        
        const handleDifficultyActivation = async (e) => {
            e.preventDefault();
            await this.selectDifficulty(difficulty.key);
        };
        
        const startPress = (e) => {
            e.preventDefault();
            if (isPressed) return; // Already pressing
            
            isPressed = true;
            pressStartTime = Date.now();
            
            // Add visual feedback
            option.classList.add('pressing');
            
            // Set timeout for 3ms (same as settings page)
            pressTimeout = setTimeout(() => {
                if (isPressed) {
                    handleDifficultyActivation(e);
                    this.resetPressState(option, pressTimeout, isPressed);
                }
            }, 3);
        };
        
        const cancelPress = (e) => {
            if (!isPressed) return;
            
            e.preventDefault();
            this.resetPressState(option, pressTimeout, isPressed);
        };
        
        // Mouse events
        option.addEventListener('mousedown', startPress);
        option.addEventListener('mouseup', cancelPress);
        option.addEventListener('mouseleave', cancelPress);
        
        // Touch events
        option.addEventListener('touchstart', startPress, { passive: false });
        option.addEventListener('touchend', cancelPress, { passive: false });
        option.addEventListener('touchcancel', cancelPress, { passive: false });
        
        // Fallback click handler for accessibility
        option.addEventListener('click', async (e) => {
            e.preventDefault();
            // Only allow click if it's a quick press (accessibility)
            if (!isPressed && (!pressStartTime || (Date.now() - pressStartTime) < 200)) {
                await handleDifficultyActivation(e);
            }
        });
        
        return option;
    }
    
    getDifficultyIcon(difficulty) {
        const icons = {
            easy: '😊',
            normal: '😐',
            hard: '😤',
            expert: '🔥'
        };
        return icons[difficulty] || '🎮';
    }
    
    async selectDifficulty(difficulty) {
        // Update difficulty manager
        this.difficultyManager.setDifficulty(difficulty);
        
        // Update UI
        this.updateSelection(difficulty);
        
        // Apply difficulty settings to current game (no reset needed)
        this.game.selectDifficulty(difficulty);
        
        // Hide selector
        this.hide();
    }
    
    updateSelection(selectedDifficulty) {
        const options = this.container.querySelectorAll('.difficulty-option');
        options.forEach(option => {
            if (option.dataset.difficulty === selectedDifficulty) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }
    
    resetPressState(item, pressTimeout, isPressed) {
        // Clear timeout
        if (pressTimeout) {
            clearTimeout(pressTimeout);
        }
        
        // Remove visual feedback
        item.classList.remove('pressing');
    }
    
    show() {
        if (!this.container) {
            this.create();
        }
        
        this.container.style.display = 'flex';
        this.container.style.pointerEvents = 'auto';
        this.isVisible = true;
        
        // Animate in
        requestAnimationFrame(() => {
            this.container.classList.add('show');
        });
    }
    
    hide() {
        if (!this.container) return;
        
        this.container.classList.remove('show');
        this.isVisible = false;
        
        // Immediately disable interaction
        this.container.style.pointerEvents = 'none';
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
                this.container = null;
            }
        }, 300);
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .difficulty-selector {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
                display: none;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            }
            
            .difficulty-selector.show {
                opacity: 1;
                pointer-events: auto;
            }
            
            .difficulty-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
                pointer-events: auto;
            }
            
            .difficulty-modal {
                position: relative;
                background: var(--card-bg, var(--header-bg, white));
                border: 2px solid var(--border-color, #e0e0e0);
                border-radius: 12px;
                padding: 24px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .difficulty-selector.show .difficulty-modal {
                transform: scale(1);
            }
            
            .difficulty-header {
                text-align: center;
                margin-bottom: 24px;
            }
            
            .difficulty-header h2 {
                margin: 0;
                color: var(--text-color, #333);
                font-size: 1.5rem;
            }
            
            .difficulty-options {
                display: grid;
                gap: 12px;
            }
            
            .difficulty-option {
                display: flex;
                align-items: center;
                padding: 16px;
                border: 2px solid var(--border-color, #e0e0e0);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                background: var(--card-bg, var(--header-bg, white));
            }
            
            .difficulty-option:hover {
                border-color: var(--primary-color, #007bff);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
            }
            
            .difficulty-option.selected {
                border-color: var(--primary-color, #007bff);
                background: var(--primary-color, #007bff);
                color: white !important;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7) !important;
            }
            
            .difficulty-option.pressing {
                transform: scale(0.98);
                opacity: 0.8;
                border-color: var(--primary-color, #007bff);
                background: var(--primary-color, #007bff);
                color: white !important;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7) !important;
            }
            
            .difficulty-option.pressing .difficulty-content h3 {
                color: white !important;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7) !important;
            }
            
            .difficulty-option.pressing .difficulty-content p {
                color: rgba(255, 255, 255, 0.9);
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }
            
            .difficulty-icon {
                font-size: 2rem;
                margin-right: 16px;
                min-width: 40px;
                text-align: center;
            }
            
            .difficulty-content {
                flex: 1;
            }
            
            .difficulty-content h3 {
                margin: 0 0 8px 0;
                color: var(--text-color, #333);
                font-size: 1.1rem;
            }
            
            .difficulty-option.selected .difficulty-content h3 {
                color: white !important;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7) !important;
            }
            
            .difficulty-content p {
                margin: 0 0 8px 0;
                color: var(--text-muted, #666);
                font-size: 0.9rem;
                line-height: 1.4;
            }
            
            .difficulty-option.selected .difficulty-content p {
                color: rgba(255, 255, 255, 0.9);
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }
            
            .difficulty-features {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }
            
            .feature {
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .feature.hint {
                background: #e8f5e8;
                color: #2d5a2d;
            }
            
            .feature.undo {
                background: #fff3cd;
                color: #856404;
            }
            
            .feature.timer {
                background: #f8d7da;
                color: #721c24;
            }
            
            .feature.moves {
                background: #d1ecf1;
                color: #0c5460;
            }
            
            .difficulty-close {
                position: absolute;
                top: 12px;
                right: 12px;
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--text-muted, #999);
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
            }
            
            .difficulty-close:hover {
                background: var(--cell-hover, #f0f0f0);
                color: var(--text-color, #333);
            }
            
            @media (max-width: 480px) {
                .difficulty-modal {
                    padding: 16px;
                    margin: 16px;
                }
                
                .difficulty-option {
                    padding: 12px;
                }
                
                .difficulty-icon {
                    font-size: 1.5rem;
                    margin-right: 12px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}
