/**
 * Blockdoku PWA - Challenge Mode UI Manager
 * Handles UI for level selection, progress tracking, and level completion
 */

export class ChallengeModeUI {
    constructor(game, levelManager) {
        this.game = game;
        this.levelManager = levelManager;
        this.currentDifficulty = 'normal';
        this.selectedLevel = 1;
        
        this.initializeUI();
    }
    
    initializeUI() {
        this.createLevelSelectionModal();
        this.createLevelCompletionModal();
        this.createProgressDisplay();
    }
    
    createLevelSelectionModal() {
        // Create modal container
        const modal = document.createElement('div');
        modal.id = 'challenge-mode-modal';
        modal.className = 'modal';
        modal.style.display = 'none';
        
        modal.innerHTML = `
            <div class="modal-content challenge-mode-content">
                <div class="modal-header">
                    <h2>Challenge Mode</h2>
                    <span class="close" id="close-challenge-modal">&times;</span>
                </div>
                
                <div class="challenge-mode-body">
                    <div class="difficulty-selector">
                        <h3>Select Difficulty</h3>
                        <div class="difficulty-options">
                            <button class="difficulty-option" data-difficulty="easy">Easy</button>
                            <button class="difficulty-option" data-difficulty="normal">Normal</button>
                            <button class="difficulty-option" data-difficulty="hard">Hard</button>
                            <button class="difficulty-option" data-difficulty="expert">Expert</button>
                        </div>
                    </div>
                    
                    <div class="level-grid">
                        <h3>Select Level</h3>
                        <div class="levels-container" id="levels-container">
                            <!-- Levels will be populated dynamically -->
                        </div>
                    </div>
                    
                    <div class="level-info" id="level-info">
                        <h4 id="level-name">Select a level</h4>
                        <p id="level-description">Choose a level to see details</p>
                        <div class="level-objectives">
                            <h5>Objectives:</h5>
                            <ul id="level-objectives-list"></ul>
                        </div>
                        <div class="level-rewards">
                            <h5>Rewards:</h5>
                            <ul id="level-rewards-list"></ul>
                        </div>
                    </div>
                    
                    <div class="progress-stats">
                        <h4>Progress Statistics</h4>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-label">Completed:</span>
                                <span class="stat-value" id="completed-count">0/30</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Achievements:</span>
                                <span class="stat-value" id="achievements-count">0</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Rewards:</span>
                                <span class="stat-value" id="rewards-count">0</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button id="start-level-btn" class="btn btn-primary" disabled>Start Level</button>
                        <button id="cancel-challenge-btn" class="btn btn-secondary">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.setupLevelSelectionEvents();
    }
    
    createLevelCompletionModal() {
        const modal = document.createElement('div');
        modal.id = 'level-completion-modal';
        modal.className = 'modal';
        modal.style.display = 'none';
        
        modal.innerHTML = `
            <div class="modal-content level-completion-content">
                <div class="modal-header">
                    <h2>Level Complete!</h2>
                </div>
                
                <div class="completion-body">
                    <div class="completion-stats">
                        <div class="stat-row">
                            <span class="stat-label">Score:</span>
                            <span class="stat-value" id="completion-score">0</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Moves Used:</span>
                            <span class="stat-value" id="completion-moves">0</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Time:</span>
                            <span class="stat-value" id="completion-time">0s</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Combos:</span>
                            <span class="stat-value" id="completion-combos">0</span>
                        </div>
                    </div>
                    
                    <div class="achievements-earned" id="achievements-earned">
                        <h4>Achievements Earned:</h4>
                        <ul id="achievements-list"></ul>
                    </div>
                    
                    <div class="rewards-earned" id="rewards-earned">
                        <h4>Rewards Unlocked:</h4>
                        <ul id="rewards-list"></ul>
                    </div>
                    
                    <div class="next-level-info" id="next-level-info">
                        <h4>Next Level:</h4>
                        <p id="next-level-description"></p>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button id="next-level-btn" class="btn btn-primary">Next Level</button>
                    <button id="level-select-btn" class="btn btn-secondary">Level Select</button>
                    <button id="close-completion-btn" class="btn btn-secondary">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.setupLevelCompletionEvents();
    }
    
    createProgressDisplay() {
        // Create progress display for in-game UI
        const progressDisplay = document.createElement('div');
        progressDisplay.id = 'challenge-mode-display';
        progressDisplay.className = 'challenge-mode-display';
        progressDisplay.style.display = 'none';
        
        progressDisplay.innerHTML = `
            <div class="progress-info">
                <div class="level-info">
                    <span class="level-label">Level:</span>
                    <span class="level-value" id="current-level-display">1</span>
                </div>
                <div class="objectives-info">
                    <div class="objective-item">
                        <span class="objective-label">Score:</span>
                        <span class="objective-value" id="score-progress">0/100</span>
                    </div>
                    <div class="objective-item">
                        <span class="objective-label">Moves:</span>
                        <span class="objective-value" id="moves-progress">0/40</span>
                    </div>
                    <div class="objective-item">
                        <span class="objective-label">Combos:</span>
                        <span class="objective-value" id="combos-progress">0/3</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add to game UI (assuming there's a utility bar or similar)
        const utilityBar = document.querySelector('.utility-bar') || document.querySelector('.game-ui');
        if (utilityBar) {
            utilityBar.appendChild(progressDisplay);
        } else {
            document.body.appendChild(progressDisplay);
        }
    }
    
    setupLevelSelectionEvents() {
        const modal = document.getElementById('challenge-mode-modal');
        const closeBtn = document.getElementById('close-challenge-modal');
        const cancelBtn = document.getElementById('cancel-challenge-btn');
        const startBtn = document.getElementById('start-level-btn');
        
        // Close modal events
        closeBtn.addEventListener('click', () => this.hideLevelSelection());
        cancelBtn.addEventListener('click', () => this.hideLevelSelection());
        
        // Difficulty selection
        const difficultyOptions = document.querySelectorAll('.difficulty-option');
        difficultyOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectDifficulty(e.target.dataset.difficulty);
            });
        });
        
        // Start level
        startBtn.addEventListener('click', () => {
            this.startSelectedLevel();
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideLevelSelection();
            }
        });
    }
    
    setupLevelCompletionEvents() {
        const modal = document.getElementById('level-completion-modal');
        const nextBtn = document.getElementById('next-level-btn');
        const selectBtn = document.getElementById('level-select-btn');
        const closeBtn = document.getElementById('close-completion-btn');
        
        nextBtn.addEventListener('click', () => {
            this.startNextLevel();
        });
        
        selectBtn.addEventListener('click', () => {
            this.hideLevelCompletion();
            this.showLevelSelection();
        });
        
        closeBtn.addEventListener('click', () => {
            this.hideLevelCompletion();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideLevelCompletion();
            }
        });
    }
    
    showLevelSelection() {
        const modal = document.getElementById('challenge-mode-modal');
        modal.style.display = 'block';
        this.updateLevelGrid();
        this.updateProgressStats();
    }
    
    hideLevelSelection() {
        const modal = document.getElementById('challenge-mode-modal');
        modal.style.display = 'none';
    }
    
    showLevelCompletion(results) {
        const modal = document.getElementById('level-completion-modal');
        modal.style.display = 'block';
        this.updateCompletionDisplay(results);
    }
    
    hideLevelCompletion() {
        const modal = document.getElementById('level-completion-modal');
        modal.style.display = 'none';
    }
    
    selectDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        
        // Update UI
        document.querySelectorAll('.difficulty-option').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');
        
        // Update level grid
        this.updateLevelGrid();
    }
    
    selectLevel(levelNum) {
        this.selectedLevel = levelNum;
        this.updateLevelInfo();
        this.updateStartButton();
    }
    
    updateLevelGrid() {
        const container = document.getElementById('levels-container');
        container.innerHTML = '';
        
        for (let i = 1; i <= 30; i++) {
            const levelDef = this.levelManager.getLevelDefinition(i, this.currentDifficulty);
            const canAccess = this.levelManager.canAccessLevel(i);
            const isCompleted = this.levelManager.completedLevels.has(i);
            
            const levelElement = document.createElement('div');
            levelElement.className = `level-item ${canAccess ? 'accessible' : 'locked'} ${isCompleted ? 'completed' : ''}`;
            levelElement.dataset.level = i;
            
            levelElement.innerHTML = `
                <div class="level-number">${i}</div>
                <div class="level-status">
                    ${isCompleted ? '✓' : canAccess ? '○' : '🔒'}
                </div>
            `;
            
            if (canAccess) {
                levelElement.addEventListener('click', () => this.selectLevel(i));
            }
            
            container.appendChild(levelElement);
        }
    }
    
    updateLevelInfo() {
        const levelDef = this.levelManager.getLevelDefinition(this.selectedLevel, this.currentDifficulty);
        
        document.getElementById('level-name').textContent = levelDef.name;
        document.getElementById('level-description').textContent = levelDef.description;
        
        // Update objectives
        const objectivesList = document.getElementById('level-objectives-list');
        objectivesList.innerHTML = `
            <li>Score: ${levelDef.objectives.scoreTarget} points</li>
            <li>Max moves: ${levelDef.objectives.maxMoves}</li>
            ${levelDef.objectives.timeLimit ? `<li>Time limit: ${Math.floor(levelDef.objectives.timeLimit / 60)}:${(levelDef.objectives.timeLimit % 60).toString().padStart(2, '0')}</li>` : ''}
            ${levelDef.objectives.comboRequirement > 0 ? `<li>Combos: ${levelDef.objectives.comboRequirement}</li>` : ''}
        `;
        
        // Update rewards
        const rewardsList = document.getElementById('level-rewards-list');
        rewardsList.innerHTML = `
            <li>Primary: ${levelDef.rewards.primary}</li>
            <li>Secondary: ${levelDef.rewards.secondary}</li>
        `;
    }
    
    updateStartButton() {
        const startBtn = document.getElementById('start-level-btn');
        const canAccess = this.levelManager.canAccessLevel(this.selectedLevel);
        startBtn.disabled = !canAccess;
        startBtn.textContent = canAccess ? 'Start Level' : 'Locked';
    }
    
    updateProgressStats() {
        const stats = this.levelManager.getProgressStats();
        
        document.getElementById('completed-count').textContent = `${stats.completedLevels}/${stats.totalLevels}`;
        document.getElementById('achievements-count').textContent = stats.achievements;
        document.getElementById('rewards-count').textContent = stats.unlockedRewards;
    }
    
    updateCompletionDisplay(results) {
        document.getElementById('completion-score').textContent = results.score;
        document.getElementById('completion-moves').textContent = results.movesUsed;
        document.getElementById('completion-time').textContent = `${Math.floor(results.timeUsed / 60)}:${(results.timeUsed % 60).toString().padStart(2, '0')}`;
        document.getElementById('completion-combos').textContent = results.combos;
        
        // Update achievements
        const achievementsList = document.getElementById('achievements-list');
        achievementsList.innerHTML = '';
        
        if (results.achievements && results.achievements.length > 0) {
            results.achievements.forEach(achievement => {
                const li = document.createElement('li');
                li.textContent = achievement.type;
                achievementsList.appendChild(li);
            });
        } else {
            achievementsList.innerHTML = '<li>No new achievements</li>';
        }
        
        // Update rewards
        const rewardsList = document.getElementById('rewards-list');
        rewardsList.innerHTML = '';
        
        if (results.rewards && results.rewards.length > 0) {
            results.rewards.forEach(reward => {
                const li = document.createElement('li');
                li.textContent = reward;
                rewardsList.appendChild(li);
            });
        } else {
            rewardsList.innerHTML = '<li>No new rewards</li>';
        }
        
        // Update next level info
        const nextLevel = this.selectedLevel + 1;
        if (nextLevel <= 30) {
            const nextLevelDef = this.levelManager.getLevelDefinition(nextLevel, this.currentDifficulty);
            document.getElementById('next-level-description').textContent = nextLevelDef.description;
        } else {
            document.getElementById('next-level-info').style.display = 'none';
        }
    }
    
    startSelectedLevel() {
        this.hideLevelSelection();
        this.showProgressDisplay();
        this.game.startChallengeModeLevel(this.selectedLevel, this.currentDifficulty);
    }
    
    startNextLevel() {
        const nextLevel = this.selectedLevel + 1;
        if (nextLevel <= 30) {
            this.selectedLevel = nextLevel;
            this.hideLevelCompletion();
            this.showProgressDisplay();
            this.game.startProgressModeLevel(nextLevel, this.currentDifficulty);
        } else {
            this.hideLevelCompletion();
        }
    }
    
    showProgressDisplay() {
        const display = document.getElementById('challenge-mode-display');
        display.style.display = 'block';
        this.updateProgressDisplay();
    }
    
    hideProgressDisplay() {
        const display = document.getElementById('challenge-mode-display');
        display.style.display = 'none';
    }
    
    updateProgressDisplay() {
        const levelDef = this.levelManager.getLevelDefinition(this.selectedLevel, this.currentDifficulty);
        
        document.getElementById('current-level-display').textContent = this.selectedLevel;
        document.getElementById('score-progress').textContent = `${this.game.score}/${levelDef.objectives.scoreTarget}`;
        const moveCount = this.game.gameEngine?.moveCount || 0;
        document.getElementById('moves-progress').textContent = `${moveCount}/${levelDef.objectives.maxMoves}`;
        document.getElementById('combos-progress').textContent = `${this.game.scoringSystem?.totalCombos || 0}/${levelDef.objectives.comboRequirement}`;
    }
    
    // Method to be called by the game when level is completed
    onLevelCompleted(results) {
        this.hideProgressDisplay();
        this.showLevelCompletion(results);
    }
}
