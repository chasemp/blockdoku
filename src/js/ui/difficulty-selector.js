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
        
        // Create difficulty options (exclude Challenge Mode - it goes in the toggle)
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'difficulty-options';
        
        const difficulties = this.difficultyManager.getAvailableDifficulties();
        
        difficulties.forEach(difficulty => {
            // Skip Challenge Mode - it's shown as a toggle below
            if (difficulty.key === 'challenge') return;
            
            const option = this.createDifficultyOption(difficulty);
            optionsContainer.appendChild(option);
        });
        
        // Create game mode toggle (Classic vs Challenge)
        const modeToggle = this.createGameModeToggle();
        
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
        modal.appendChild(modeToggle);
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
        
        // Special handling for Challenge Mode
        if (difficulty.key === 'challenge') {
            option.classList.add('challenge-mode-option');
        }
        
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
        description.textContent = difficulty.shortDescription || difficulty.description;
        
        const features = document.createElement('div');
        features.className = 'difficulty-features';
        
        // Only show hints bubble for Easy difficulty in modal
        if (difficulty.key === 'easy' && difficulty.hintsEnabled) {
            const hintFeature = document.createElement('span');
            hintFeature.className = 'feature hint';
            hintFeature.textContent = '💡 Hints';
            features.appendChild(hintFeature);
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
        
        const resetPressState = () => {
            if (pressTimeout) {
                clearTimeout(pressTimeout);
                pressTimeout = null;
            }
            isPressed = false;
            pressStartTime = null;
            option.classList.remove('pressing');
        };
        
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
            
            // Set timeout for 10ms (increased from 3ms for better reliability)
            pressTimeout = setTimeout(() => {
                if (isPressed) {
                    handleDifficultyActivation(e);
                    resetPressState();
                }
            }, 10);
        };
        
        const cancelPress = (e) => {
            if (!isPressed) return;
            
            e.preventDefault();
            resetPressState();
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
            expert: '🔥',
            challenge: '📈'
        };
        return icons[difficulty] || '🎮';
    }
    
    createGameModeToggle() {
        const container = document.createElement('div');
        container.className = 'game-mode-toggle-container';
        
        const label = document.createElement('div');
        label.className = 'game-mode-label';
        label.textContent = 'Game Mode';
        
        const toggleWrapper = document.createElement('div');
        toggleWrapper.className = 'game-mode-toggle-wrapper';
        
        // Classic option
        const classicOption = document.createElement('button');
        classicOption.className = 'game-mode-toggle-option active';
        classicOption.dataset.mode = 'classic';
        classicOption.innerHTML = '♾️ Classic';
        
        // Challenge option
        const challengeOption = document.createElement('button');
        challengeOption.className = 'game-mode-toggle-option';
        challengeOption.dataset.mode = 'challenge';
        challengeOption.innerHTML = '🏆 Challenge';
        
        // Handle classic click
        const handleClassicClick = (e) => {
            e.preventDefault();
            classicOption.classList.add('active');
            challengeOption.classList.remove('active');
            // Already in classic mode, just close
            this.hide();
        };
        
        // Handle challenge click - show info popup then start challenge mode
        const handleChallengeClick = (e) => {
            e.preventDefault();
            challengeOption.classList.add('active');
            classicOption.classList.remove('active');
            this.hide();
            
            // Get the current challenge level from storage or default to 1
            const currentLevel = this.game.levelManager?.getCurrentLevel() || 1;
            const currentDifficulty = this.difficultyManager.getCurrentDifficulty();
            
            // Check if user wants to skip the popup
            const skipPopup = localStorage.getItem('blockdoku_skip_challenge_popup') === 'true';
            
            if (skipPopup) {
                // Start challenge mode directly
                this.game.startChallengeModeLevel(currentLevel, currentDifficulty);
            } else {
                // Show the challenge mode info popup
                this.showChallengeModePopup(currentLevel, currentDifficulty);
            }
        };
        
        classicOption.addEventListener('click', handleClassicClick);
        classicOption.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleClassicClick(e);
        }, { passive: false });
        
        challengeOption.addEventListener('click', handleChallengeClick);
        challengeOption.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleChallengeClick(e);
        }, { passive: false });
        
        toggleWrapper.appendChild(classicOption);
        toggleWrapper.appendChild(challengeOption);
        
        container.appendChild(label);
        container.appendChild(toggleWrapper);
        
        return container;
    }
    
    showChallengeModePopup(currentLevel, currentDifficulty) {
        // Create popup overlay
        const overlay = document.createElement('div');
        overlay.className = 'challenge-popup-overlay';
        overlay.id = 'challenge-popup-overlay';
        
        const popup = document.createElement('div');
        popup.className = 'challenge-popup';
        
        popup.innerHTML = `
            <div class="challenge-popup-header">
                <h2>🏆 Challenge Mode</h2>
            </div>
            <div class="challenge-popup-body">
                <p>You have switched to Challenge Mode.</p>
                <p class="challenge-level-info">You are on <strong>Level ${currentLevel}</strong></p>
                <p class="challenge-popup-links">
                    See details on <a href="challenge.html" class="challenge-link">Leveling</a>
                </p>
            </div>
            <div class="challenge-popup-footer">
                <label class="challenge-popup-checkbox">
                    <input type="checkbox" id="skip-challenge-popup">
                    <span>Never show this again</span>
                </label>
                <button class="btn btn-primary challenge-play-btn" id="challenge-play-btn">Play</button>
            </div>
        `;
        
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        // Add styles if not already added
        this.addChallengeModePopupStyles();
        
        // Show with animation
        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });
        
        // Handle Play button
        const playBtn = document.getElementById('challenge-play-btn');
        const checkbox = document.getElementById('skip-challenge-popup');
        
        const handlePlay = () => {
            // Save preference if checkbox is checked
            if (checkbox.checked) {
                localStorage.setItem('blockdoku_skip_challenge_popup', 'true');
            }
            
            // Close popup
            overlay.classList.remove('show');
            setTimeout(() => {
                overlay.remove();
            }, 300);
            
            // Start challenge mode
            this.game.startChallengeModeLevel(currentLevel, currentDifficulty);
        };
        
        playBtn.addEventListener('click', handlePlay);
        playBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handlePlay();
        }, { passive: false });
        
        // Close on overlay click (outside popup)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                handlePlay();
            }
        });
    }
    
    addChallengeModePopupStyles() {
        if (document.getElementById('challenge-popup-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'challenge-popup-styles';
        style.textContent = `
            .challenge-popup-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
                z-index: 2000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .challenge-popup-overlay.show {
                opacity: 1;
            }
            
            .challenge-popup {
                background: var(--card-bg, var(--header-bg, #fff));
                border: 2px solid var(--border-color, #e0e0e0);
                border-radius: 16px;
                padding: 24px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .challenge-popup-overlay.show .challenge-popup {
                transform: scale(1);
            }
            
            .challenge-popup-header {
                text-align: center;
                margin-bottom: 16px;
            }
            
            .challenge-popup-header h2 {
                margin: 0;
                color: var(--text-color, #333);
                font-size: 1.5rem;
            }
            
            .challenge-popup-body {
                text-align: center;
                margin-bottom: 20px;
            }
            
            .challenge-popup-body p {
                margin: 8px 0;
                color: var(--text-color, #333);
                font-size: 1rem;
                line-height: 1.5;
            }
            
            .challenge-level-info {
                font-size: 1.2rem !important;
                color: var(--primary-color, #007bff) !important;
                margin: 16px 0 !important;
            }
            
            .challenge-level-info strong {
                color: var(--primary-color, #007bff);
            }
            
            .challenge-popup-links {
                margin-top: 12px !important;
            }
            
            .challenge-link {
                color: var(--primary-color, #007bff);
                text-decoration: underline;
                font-weight: 600;
                cursor: pointer;
            }
            
            .challenge-link:hover {
                color: var(--primary-hover, #0056b3);
            }
            
            .challenge-popup-footer {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
            }
            
            .challenge-popup-checkbox {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                color: var(--text-muted, #666);
                font-size: 0.9rem;
            }
            
            .challenge-popup-checkbox input[type="checkbox"] {
                width: 18px;
                height: 18px;
                cursor: pointer;
                accent-color: var(--primary-color, #007bff);
            }
            
            .challenge-play-btn {
                padding: 12px 48px;
                font-size: 1.1rem;
                font-weight: 600;
                border-radius: 8px;
                min-width: 150px;
            }
            
            @media (max-width: 480px) {
                .challenge-popup {
                    padding: 20px;
                    margin: 16px;
                }
                
                .challenge-popup-header h2 {
                    font-size: 1.3rem;
                }
                
                .challenge-play-btn {
                    width: 100%;
                    padding: 14px 24px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    async selectDifficulty(difficulty) {
        console.log(`🎯 DifficultySelector: selectDifficulty called with difficulty: ${difficulty}`);
        
        // Special handling for Challenge Mode - show popup then start
        if (difficulty === 'challenge') {
            this.hide();
            const currentLevel = this.game.levelManager?.getCurrentLevel() || 1;
            const currentDifficulty = this.difficultyManager.getCurrentDifficulty();
            
            const skipPopup = localStorage.getItem('blockdoku_skip_challenge_popup') === 'true';
            if (skipPopup) {
                this.game.startChallengeModeLevel(currentLevel, currentDifficulty);
            } else {
                this.showChallengeModePopup(currentLevel, currentDifficulty);
            }
            return;
        }
        
        // Update difficulty manager
        const success = this.difficultyManager.setDifficulty(difficulty);
        console.log(`🎯 DifficultySelector: difficultyManager.setDifficulty(${difficulty}) returned: ${success}`);
        
        // Update UI
        this.updateSelection(difficulty);
        
        // Apply difficulty settings to current game (no reset needed)
        console.log(`🎯 DifficultySelector: calling game.selectDifficulty(${difficulty})`);
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
            
            /* Game Mode Toggle */
            .game-mode-toggle-container {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid var(--border-color, #e0e0e0);
            }
            
            .game-mode-label {
                text-align: center;
                font-size: 0.9rem;
                font-weight: 600;
                color: var(--text-muted, #666);
                margin-bottom: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .game-mode-toggle-wrapper {
                display: flex;
                gap: 0;
                border-radius: 8px;
                overflow: hidden;
                border: 2px solid var(--border-color, #e0e0e0);
            }
            
            .game-mode-toggle-option {
                flex: 1;
                padding: 14px 16px;
                border: none;
                background: var(--card-bg, var(--header-bg, white));
                color: var(--text-color, #333);
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            .game-mode-toggle-option:first-child {
                border-right: 1px solid var(--border-color, #e0e0e0);
            }
            
            .game-mode-toggle-option:hover:not(.active) {
                background: var(--cell-hover, #f5f5f5);
            }
            
            .game-mode-toggle-option.active {
                background: var(--primary-color, #007bff);
                color: white;
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
                
                .game-mode-toggle-option {
                    padding: 12px 10px;
                    font-size: 0.9rem;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}
