/**
 * Blockdoku PWA - Progress Mode Page
 * Dedicated page for Progress Mode with mobile-first design
 */

import { LevelManager } from './level/level-manager.js';
import { GameStorage } from './storage/game-storage.js';

class ProgressModePage {
    constructor() {
        this.storage = new GameStorage();
        this.levelManager = new LevelManager(null, this.storage);
        this.currentDifficulty = 'normal';
        this.selectedLevel = 1;
        this.progressData = this.storage.loadProgressModeData() || this.getDefaultProgressData();
        
        this.initializePage();
    }
    
    initializePage() {
        this.loadTheme();
        this.setupEventListeners();
        this.loadProgressData();
        
        // Show levels by default for the current difficulty
        this.showLevelSelection();
        this.renderLevelGrid();
        this.renderProgressStats();
    }
    
    setupEventListeners() {
        // Back to settings button
        document.getElementById('back-to-settings').addEventListener('click', () => {
            window.location.href = 'gamesettings.html';
        });
        
        // Back to game button
        document.getElementById('back-to-game').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        
        // Difficulty selection
        document.querySelectorAll('.difficulty-option').forEach(button => {
            button.addEventListener('click', (e) => {
                const difficulty = e.currentTarget.dataset.difficulty;
                this.selectDifficulty(difficulty);
            });
        });
        
        // Change difficulty button
        document.getElementById('change-difficulty').addEventListener('click', () => {
            this.showDifficultySelection();
        });
        
        // Back to levels button
        document.getElementById('back-to-levels').addEventListener('click', () => {
            this.showLevelSelection();
        });
        
        // Start level button
        document.getElementById('start-level-btn').addEventListener('click', () => {
            this.startSelectedLevel();
        });
    }
    
    selectDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.showLevelSelection();
        this.renderLevelGrid();
    }
    
    showDifficultySelection() {
        const difficultySection = document.getElementById('difficulty-section');
        const levelsSection = document.getElementById('levels-section');
        const levelDetails = document.getElementById('level-details');
        
        if (difficultySection) difficultySection.style.display = 'block';
        if (levelsSection) levelsSection.style.display = 'none';
        if (levelDetails) levelDetails.style.display = 'none';
    }
    
    showLevelSelection() {
        const difficultySection = document.getElementById('difficulty-section');
        const levelsSection = document.getElementById('levels-section');
        const levelDetails = document.getElementById('level-details');
        
        if (difficultySection) difficultySection.style.display = 'none';
        if (levelsSection) levelsSection.style.display = 'block';
        if (levelDetails) levelDetails.style.display = 'none';
    }
    
    showLevelDetails(levelNum) {
        this.selectedLevel = levelNum;
        const difficultySection = document.getElementById('difficulty-section');
        const levelsSection = document.getElementById('levels-section');
        const levelDetails = document.getElementById('level-details');
        
        if (difficultySection) difficultySection.style.display = 'none';
        if (levelsSection) levelsSection.style.display = 'none';
        if (levelDetails) levelDetails.style.display = 'block';
        
        this.renderLevelDetails(levelNum);
    }
    
    renderDifficultySelection() {
        // Update difficulty stats
        const difficulties = ['easy', 'normal', 'hard', 'expert'];
        difficulties.forEach(difficulty => {
            const completed = this.getCompletedLevelsCount(difficulty);
            const element = document.getElementById(`${difficulty}-completed`);
            if (element) {
                element.textContent = `${completed}/30`;
            }
        });
        
        // Update selected difficulty title
        document.getElementById('selected-difficulty-title').textContent = 
            `${this.currentDifficulty.charAt(0).toUpperCase() + this.currentDifficulty.slice(1)} Levels`;
    }
    
    renderLevelGrid() {
        const levelsGrid = document.getElementById('levels-grid');
        levelsGrid.innerHTML = '';
        
        // Create 30 level buttons
        for (let i = 1; i <= 30; i++) {
            const levelButton = this.createLevelButton(i);
            levelsGrid.appendChild(levelButton);
        }
    }
    
    createLevelButton(levelNum) {
        const button = document.createElement('button');
        button.className = 'level-button';
        button.dataset.level = levelNum;
        
        const isCompleted = this.isLevelCompleted(levelNum, this.currentDifficulty);
        const isUnlocked = this.isLevelUnlocked(levelNum, this.currentDifficulty);
        
        if (isCompleted) {
            button.classList.add('completed');
        } else if (!isUnlocked) {
            button.classList.add('locked');
        }
        
        button.innerHTML = `
            <div class="level-number">${levelNum}</div>
            <div class="level-status">
                ${isCompleted ? '✓' : isUnlocked ? '○' : '🔒'}
            </div>
        `;
        
        if (isUnlocked) {
            button.addEventListener('click', () => {
                this.showLevelDetails(levelNum);
            });
        }
        
        return button;
    }
    
    renderLevelDetails(levelNum) {
        const levelDef = this.levelManager.getLevelDefinition(levelNum, this.currentDifficulty);
        
        if (!levelDef) {
            console.error(`Level ${levelNum} not found for difficulty ${this.currentDifficulty}`);
            return;
        }
        
        // Update level name
        document.getElementById('level-name').textContent = `Level ${levelNum}`;
        
        // Update description
        document.getElementById('level-description-text').textContent = 
            `Complete the objectives to advance to the next level.`;
        
        // Update objectives
        const objectivesList = document.getElementById('level-objectives-list');
        objectivesList.innerHTML = '';
        
        if (levelDef.objectives.scoreTarget) {
            const li = document.createElement('li');
            li.textContent = `Score ${levelDef.objectives.scoreTarget} points`;
            objectivesList.appendChild(li);
        }
        
        if (levelDef.objectives.maxMoves) {
            const li = document.createElement('li');
            li.textContent = `Complete in ${levelDef.objectives.maxMoves} moves or less`;
            objectivesList.appendChild(li);
        }
        
        if (levelDef.objectives.comboRequirement > 0) {
            const li = document.createElement('li');
            li.textContent = `Achieve ${levelDef.objectives.comboRequirement} combos`;
            objectivesList.appendChild(li);
        }
        
        // Update rewards
        const rewardsList = document.getElementById('level-rewards-list');
        rewardsList.innerHTML = '';
        
        if (levelDef.rewards && levelDef.rewards.length > 0) {
            levelDef.rewards.forEach(reward => {
                const li = document.createElement('li');
                li.textContent = this.formatReward(reward);
                rewardsList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'Progress towards next level';
            rewardsList.appendChild(li);
        }
    }
    
    formatReward(reward) {
        if (reward.startsWith('theme:')) {
            return `Unlock ${reward.split(':')[1]} theme`;
        } else if (reward.startsWith('block:')) {
            return `Unlock ${reward.split(':')[1]} block type`;
        } else {
            return reward;
        }
    }
    
    startSelectedLevel() {
        // Store the selected level and difficulty
        this.storage.saveProgressModeData({
            ...this.progressData,
            selectedLevel: this.selectedLevel,
            selectedDifficulty: this.currentDifficulty
        });
        
        // Navigate to game with Progress Mode
        window.location.href = `index.html?mode=progress&level=${this.selectedLevel}&difficulty=${this.currentDifficulty}`;
    }
    
    renderProgressStats() {
        const totalCompleted = this.getTotalCompletedLevels();
        const totalAchievements = this.getTotalAchievements();
        const totalRewards = this.getTotalRewards();
        
        document.getElementById('total-completed').textContent = totalCompleted;
        document.getElementById('total-achievements').textContent = totalAchievements;
        document.getElementById('total-rewards').textContent = totalRewards;
    }
    
    getCompletedLevelsCount(difficulty) {
        if (!this.progressData.completedLevels) return 0;
        return this.progressData.completedLevels[difficulty]?.length || 0;
    }
    
    getTotalCompletedLevels() {
        const difficulties = ['easy', 'normal', 'hard', 'expert'];
        return difficulties.reduce((total, difficulty) => {
            return total + this.getCompletedLevelsCount(difficulty);
        }, 0);
    }
    
    getTotalAchievements() {
        if (!this.progressData.achievements) return 0;
        return Object.keys(this.progressData.achievements).length;
    }
    
    getTotalRewards() {
        if (!this.progressData.unlockedRewards) return 0;
        return this.progressData.unlockedRewards.length;
    }
    
    isLevelCompleted(levelNum, difficulty) {
        if (!this.progressData.completedLevels) return false;
        return this.progressData.completedLevels[difficulty]?.includes(levelNum) || false;
    }
    
    isLevelUnlocked(levelNum, difficulty) {
        if (levelNum === 1) return true;
        return this.isLevelCompleted(levelNum - 1, difficulty);
    }
    
    getDefaultProgressData() {
        return {
            completedLevels: {
                easy: [],
                normal: [],
                hard: [],
                expert: []
            },
            achievements: {},
            unlockedRewards: [],
            selectedLevel: 1,
            selectedDifficulty: 'normal'
        };
    }
    
    loadProgressData() {
        const saved = this.storage.loadProgressModeData();
        if (saved) {
            this.progressData = { ...this.getDefaultProgressData(), ...saved };
        }
    }
    
    loadTheme() {
        const settings = this.storage.loadSettings();
        const theme = settings.theme || 'wood';
        this.applyTheme(theme);
    }
    
    applyTheme(theme) {
        console.log('Progress page applying theme:', theme);
        
        // Update the theme CSS link
        const themeLink = document.getElementById('theme-css');
        if (themeLink) {
            themeLink.href = `css/themes/${theme}.css`;
        }
        
        // Set data-theme attribute for CSS custom properties
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update theme color meta tag
        const themeColors = {
            wood: '#8B4513',
            light: '#007bff',
            dark: '#343a40'
        };
        
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            themeColorMeta.setAttribute('content', themeColors[theme] || themeColors.wood);
        }
    }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProgressModePage();
});
