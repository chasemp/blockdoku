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
        overlay.addEventListener('click', () => this.hide());
        
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
        closeButton.addEventListener('click', () => this.hide());
        
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
        
        // Add click handler
        option.addEventListener('click', async () => {
            await this.selectDifficulty(difficulty.key);
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
        // Check if game is in progress (has blocks placed or score > 0)
        const gameInProgress = this.game.score > 0 || this.game.board.some(row => row.some(cell => cell === 1));
        
        if (gameInProgress) {
            // Show confirmation dialog
            const confirmed = await this.confirmationDialog.show(
                `Changing difficulty to ${difficulty.toUpperCase()} will reset your current game and you'll lose your progress. Are you sure you want to continue?`
            );
            
            if (!confirmed) {
                return; // User cancelled
            }
        }
        
        // Update difficulty manager
        this.difficultyManager.setDifficulty(difficulty);
        
        // Update UI
        this.updateSelection(difficulty);
        
        // Restart game with new difficulty
        this.game.restartWithDifficulty(difficulty);
        
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
    
    show() {
        if (!this.container) {
            this.create();
        }
        
        this.container.style.display = 'flex';
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
            }
            
            .difficulty-selector.show {
                opacity: 1;
            }
            
            .difficulty-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
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
