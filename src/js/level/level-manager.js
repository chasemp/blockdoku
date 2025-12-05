/**
 * Blockdoku PWA - Challenge Mode Level Management System
 * Handles level progression, requirements, and rewards for Challenge Mode
 */

export class LevelManager {
    constructor(game = null, storage = null) {
        this.game = game;
        this.storage = storage;
        this.currentLevel = 1;
        this.currentTier = 'foundation';
        this.completedLevels = new Set();
        this.unlockedRewards = new Set();
        this.achievements = new Map();
        
        // Load progress from storage
        this.loadProgress();
        
        // Initialize level definitions
        this.levelDefinitions = this.initializeLevelDefinitions();
    }
    
    /**
     * Initialize level definitions for all difficulty tiers
     */
    initializeLevelDefinitions() {
        return {
            easy: this.createLevelDefinitions('easy'),
            normal: this.createLevelDefinitions('normal'),
            hard: this.createLevelDefinitions('hard'),
            expert: this.createLevelDefinitions('expert')
        };
    }
    
    /**
     * Create level definitions for a specific difficulty tier
     */
    createLevelDefinitions(difficulty) {
        const levels = {};
        
        // Foundation Levels (1-8)
        for (let i = 1; i <= 8; i++) {
            levels[i] = this.createFoundationLevel(i, difficulty);
        }
        
        // Core Gameplay Levels (9-16)
        for (let i = 9; i <= 16; i++) {
            levels[i] = this.createCoreLevel(i, difficulty);
        }
        
        // Advanced Challenge Levels (17-24)
        for (let i = 17; i <= 24; i++) {
            levels[i] = this.createAdvancedLevel(i, difficulty);
        }
        
        // Expert Levels (25-30)
        for (let i = 25; i <= 30; i++) {
            levels[i] = this.createExpertLevel(i, difficulty);
        }
        
        return levels;
    }
    
    /**
     * Create foundation level definition (1-8)
     */
    createFoundationLevel(levelNum, difficulty) {
        const baseScore = this.getBaseScoreForLevel(levelNum, difficulty);
        const tier = this.getTierForLevel(levelNum);
        
        return {
            id: levelNum,
            name: `Foundation ${levelNum}`,
            tier: tier,
            difficulty: difficulty,
            
            // Primary objectives
            objectives: {
                scoreTarget: baseScore,
                maxMoves: this.getMaxMovesForLevel(levelNum, difficulty),
                timeLimit: this.getTimeLimitForLevel(levelNum, difficulty),
                comboRequirement: this.getComboRequirementForLevel(levelNum, difficulty)
            },
            
            // Secondary objectives (bonus rewards)
            bonusObjectives: {
                perfectScore: Math.floor(baseScore * 1.2),
                speedBonus: Math.floor(baseScore * 0.8),
                efficiencyBonus: Math.floor(this.getMaxMovesForLevel(levelNum, difficulty) * 0.7)
            },
            
            // Level mechanics
            mechanics: {
                blockComplexity: this.getBlockComplexityForLevel(levelNum),
                timePressure: this.getTimePressureForLevel(levelNum),
                boardConstraints: this.getBoardConstraintsForLevel(levelNum),
                specialMechanics: this.getSpecialMechanicsForLevel(levelNum)
            },
            
            // Rewards
            rewards: {
                primary: this.getPrimaryRewardForLevel(levelNum),
                secondary: this.getSecondaryRewardForLevel(levelNum)
            },
            
            // Description and hints
            description: this.getDescriptionForLevel(levelNum, tier),
            hints: this.getHintsForLevel(levelNum, difficulty)
        };
    }
    
    /**
     * Create core gameplay level definition (9-16)
     */
    createCoreLevel(levelNum, difficulty) {
        const baseScore = this.getBaseScoreForLevel(levelNum, difficulty);
        const tier = this.getTierForLevel(levelNum);
        
        return {
            id: levelNum,
            name: `Core ${levelNum}`,
            tier: tier,
            difficulty: difficulty,
            
            objectives: {
                scoreTarget: baseScore,
                maxMoves: this.getMaxMovesForLevel(levelNum, difficulty),
                timeLimit: this.getTimeLimitForLevel(levelNum, difficulty),
                comboRequirement: this.getComboRequirementForLevel(levelNum, difficulty)
            },
            
            bonusObjectives: {
                perfectScore: Math.floor(baseScore * 1.3),
                speedBonus: Math.floor(baseScore * 0.7),
                efficiencyBonus: Math.floor(this.getMaxMovesForLevel(levelNum, difficulty) * 0.6)
            },
            
            mechanics: {
                blockComplexity: this.getBlockComplexityForLevel(levelNum),
                timePressure: this.getTimePressureForLevel(levelNum),
                boardConstraints: this.getBoardConstraintsForLevel(levelNum),
                specialMechanics: this.getSpecialMechanicsForLevel(levelNum)
            },
            
            rewards: {
                primary: this.getPrimaryRewardForLevel(levelNum),
                secondary: this.getSecondaryRewardForLevel(levelNum)
            },
            
            description: this.getDescriptionForLevel(levelNum, tier),
            hints: this.getHintsForLevel(levelNum, difficulty)
        };
    }
    
    /**
     * Create advanced challenge level definition (17-24)
     */
    createAdvancedLevel(levelNum, difficulty) {
        const baseScore = this.getBaseScoreForLevel(levelNum, difficulty);
        const tier = this.getTierForLevel(levelNum);
        
        return {
            id: levelNum,
            name: `Advanced ${levelNum}`,
            tier: tier,
            difficulty: difficulty,
            
            objectives: {
                scoreTarget: baseScore,
                maxMoves: this.getMaxMovesForLevel(levelNum, difficulty),
                timeLimit: this.getTimeLimitForLevel(levelNum, difficulty),
                comboRequirement: this.getComboRequirementForLevel(levelNum, difficulty)
            },
            
            bonusObjectives: {
                perfectScore: Math.floor(baseScore * 1.4),
                speedBonus: Math.floor(baseScore * 0.6),
                efficiencyBonus: Math.floor(this.getMaxMovesForLevel(levelNum, difficulty) * 0.5)
            },
            
            mechanics: {
                blockComplexity: this.getBlockComplexityForLevel(levelNum),
                timePressure: this.getTimePressureForLevel(levelNum),
                boardConstraints: this.getBoardConstraintsForLevel(levelNum),
                specialMechanics: this.getSpecialMechanicsForLevel(levelNum)
            },
            
            rewards: {
                primary: this.getPrimaryRewardForLevel(levelNum),
                secondary: this.getSecondaryRewardForLevel(levelNum)
            },
            
            description: this.getDescriptionForLevel(levelNum, tier),
            hints: this.getHintsForLevel(levelNum, difficulty)
        };
    }
    
    /**
     * Create expert level definition (25-30)
     */
    createExpertLevel(levelNum, difficulty) {
        const baseScore = this.getBaseScoreForLevel(levelNum, difficulty);
        const tier = this.getTierForLevel(levelNum);
        
        return {
            id: levelNum,
            name: `Expert ${levelNum}`,
            tier: tier,
            difficulty: difficulty,
            
            objectives: {
                scoreTarget: baseScore,
                maxMoves: this.getMaxMovesForLevel(levelNum, difficulty),
                timeLimit: this.getTimeLimitForLevel(levelNum, difficulty),
                comboRequirement: this.getComboRequirementForLevel(levelNum, difficulty)
            },
            
            bonusObjectives: {
                perfectScore: Math.floor(baseScore * 1.5),
                speedBonus: Math.floor(baseScore * 0.5),
                efficiencyBonus: Math.floor(this.getMaxMovesForLevel(levelNum, difficulty) * 0.4)
            },
            
            mechanics: {
                blockComplexity: this.getBlockComplexityForLevel(levelNum),
                timePressure: this.getTimePressureForLevel(levelNum),
                boardConstraints: this.getBoardConstraintsForLevel(levelNum),
                specialMechanics: this.getSpecialMechanicsForLevel(levelNum)
            },
            
            rewards: {
                primary: this.getPrimaryRewardForLevel(levelNum),
                secondary: this.getSecondaryRewardForLevel(levelNum)
            },
            
            description: this.getDescriptionForLevel(levelNum, tier),
            hints: this.getHintsForLevel(levelNum, difficulty)
        };
    }
    
    // Helper methods for level configuration
    
    getTierForLevel(levelNum) {
        if (levelNum <= 8) return 'foundation';
        if (levelNum <= 16) return 'core';
        if (levelNum <= 24) return 'advanced';
        return 'expert';
    }
    
    getBaseScoreForLevel(levelNum, difficulty) {
        const baseScores = {
            easy: 100,
            normal: 80,
            hard: 60,
            expert: 40
        };
        
        const base = baseScores[difficulty] || 80;
        return Math.floor(base * Math.pow(1.15, levelNum - 1));
    }
    
    getMaxMovesForLevel(levelNum, difficulty) {
        const baseMoves = {
            easy: 50,
            normal: 40,
            hard: 30,
            expert: 25
        };
        
        const base = baseMoves[difficulty] || 40;
        return Math.max(10, Math.floor(base - (levelNum - 1) * 1.5));
    }
    
    getTimeLimitForLevel(levelNum, difficulty) {
        if (levelNum <= 8) return null; // No time pressure in foundation levels
        
        const baseTime = {
            easy: 300, // 5 minutes
            normal: 240, // 4 minutes
            hard: 180, // 3 minutes
            expert: 120 // 2 minutes
        };
        
        const base = baseTime[difficulty] || 240;
        return Math.max(60, Math.floor(base - (levelNum - 9) * 10));
    }
    
    getComboRequirementForLevel(levelNum, difficulty) {
        if (levelNum <= 5) return 0; // No combo requirement in early levels
        
        const baseCombos = {
            easy: 2,
            normal: 3,
            hard: 4,
            expert: 5
        };
        
        const base = baseCombos[difficulty] || 3;
        return Math.min(10, base + Math.floor((levelNum - 6) / 3));
    }
    
    getBlockComplexityForLevel(levelNum) {
        if (levelNum <= 5) return 'simple';
        if (levelNum <= 10) return 'medium';
        if (levelNum <= 15) return 'complex';
        if (levelNum <= 20) return 'expert';
        return 'master';
    }
    
    getTimePressureForLevel(levelNum) {
        if (levelNum <= 8) return 'none';
        if (levelNum <= 12) return 'gentle';
        if (levelNum <= 16) return 'moderate';
        if (levelNum <= 20) return 'high';
        return 'extreme';
    }
    
    getBoardConstraintsForLevel(levelNum) {
        if (levelNum <= 6) return 'none';
        if (levelNum <= 10) return 'light';
        if (levelNum <= 15) return 'moderate';
        if (levelNum <= 20) return 'heavy';
        return 'maximum';
    }
    
    getSpecialMechanicsForLevel(levelNum) {
        const mechanics = [];
        
        if (levelNum >= 7) mechanics.push('deadPixels');
        if (levelNum >= 10) mechanics.push('petrification');
        if (levelNum >= 15) mechanics.push('magicBlocks');
        if (levelNum >= 18) mechanics.push('wildShapes');
        if (levelNum >= 22) mechanics.push('rotationRestriction');
        
        return mechanics;
    }
    
    getPrimaryRewardForLevel(levelNum) {
        if (levelNum % 5 === 0) return 'theme';
        if (levelNum % 3 === 0) return 'blockType';
        if (levelNum % 10 === 0) return 'gameMode';
        return 'scoreMultiplier';
    }
    
    getSecondaryRewardForLevel(levelNum) {
        return 'achievement';
    }
    
    getDescriptionForLevel(levelNum, tier) {
        const descriptions = {
            foundation: `Learn the basics of Blockdoku. Focus on placing blocks and clearing lines.`,
            core: `Master the core gameplay mechanics. Work on efficiency and combos.`,
            advanced: `Face advanced challenges with special mechanics and constraints.`,
            expert: `Test your mastery with expert-level challenges and maximum difficulty.`
        };
        
        return descriptions[tier] || descriptions.foundation;
    }
    
    getHintsForLevel(levelNum, difficulty) {
        const hintLevels = {
            easy: 3,
            normal: 2,
            hard: 1,
            expert: 0
        };
        
        const baseHints = hintLevels[difficulty] || 2;
        return Math.max(0, baseHints - Math.floor((levelNum - 1) / 5));
    }
    
    // Progress management methods
    
    loadProgress() {
        if (!this.storage) return;
        
        try {
            const progress = this.storage.loadChallengeModeData();
            if (progress) {
                this.currentLevel = progress.currentLevel || 1;
                this.currentTier = progress.currentTier || 'foundation';
                this.completedLevels = new Set(progress.completedLevels || []);
                this.unlockedRewards = new Set(progress.unlockedRewards || []);
                this.achievements = new Map(progress.achievements || []);
            }
        } catch (error) {
            console.error('Error loading challenge mode data:', error);
        }
    }
    
    saveProgress() {
        if (!this.storage) return;
        
        try {
            const progress = {
                currentLevel: this.currentLevel,
                currentTier: this.currentTier,
                completedLevels: Array.from(this.completedLevels),
                unlockedRewards: Array.from(this.unlockedRewards),
                achievements: Array.from(this.achievements.entries())
            };
            
            this.storage.saveChallengeModeData(progress);
        } catch (error) {
            console.error('Error saving challenge mode data:', error);
        }
    }
    
    // Level management methods
    
    getCurrentLevel() {
        return this.currentLevel;
    }
    
    getCurrentLevelDefinition(difficulty = 'normal') {
        return this.levelDefinitions[difficulty][this.currentLevel];
    }
    
    getLevelDefinition(levelNum, difficulty = 'normal') {
        return this.levelDefinitions[difficulty][levelNum];
    }
    
    canAccessLevel(levelNum) {
        return levelNum === 1 || this.completedLevels.has(levelNum - 1);
    }
    
    completeLevel(levelNum, results) {
        if (!this.canAccessLevel(levelNum)) {
            throw new Error(`Cannot complete level ${levelNum} - previous level not completed`);
        }
        
        this.completedLevels.add(levelNum);
        
        // Check for achievements
        this.checkAchievements(levelNum, results);
        
        // Unlock rewards
        this.unlockRewards(levelNum);
        
        // Advance to next level
        if (levelNum === this.currentLevel) {
            this.currentLevel = levelNum + 1;
            this.currentTier = this.getTierForLevel(this.currentLevel);
        }
        
        this.saveProgress();
    }
    
    checkAchievements(levelNum, results) {
        const levelDef = this.getLevelDefinition(levelNum);
        
        // Perfect completion achievement
        if (results.score >= levelDef.bonusObjectives.perfectScore) {
            this.achievements.set(`perfect_${levelNum}`, {
                type: 'perfect',
                level: levelNum,
                timestamp: Date.now()
            });
        }
        
        // Speed completion achievement
        if (results.timeUsed <= levelDef.bonusObjectives.speedBonus) {
            this.achievements.set(`speed_${levelNum}`, {
                type: 'speed',
                level: levelNum,
                timestamp: Date.now()
            });
        }
        
        // Efficiency achievement
        if (results.movesUsed <= levelDef.bonusObjectives.efficiencyBonus) {
            this.achievements.set(`efficiency_${levelNum}`, {
                type: 'efficiency',
                level: levelNum,
                timestamp: Date.now()
            });
        }
    }
    
    unlockRewards(levelNum) {
        const levelDef = this.getLevelDefinition(levelNum);
        
        // Unlock primary reward
        if (levelDef.rewards.primary) {
            this.unlockedRewards.add(`${levelDef.rewards.primary}_${levelNum}`);
        }
        
        // Unlock secondary reward
        if (levelDef.rewards.secondary) {
            this.unlockedRewards.add(`${levelDef.rewards.secondary}_${levelNum}`);
        }
    }
    
    // Utility methods
    
    getCompletedLevels() {
        return Array.from(this.completedLevels);
    }
    
    getUnlockedRewards() {
        return Array.from(this.unlockedRewards);
    }
    
    getAchievements() {
        return Array.from(this.achievements.values());
    }
    
    getProgressStats() {
        const totalLevels = 30;
        const completedCount = this.completedLevels.size;
        const completionRate = (completedCount / totalLevels) * 100;
        
        return {
            currentLevel: this.currentLevel,
            completedLevels: completedCount,
            totalLevels: totalLevels,
            completionRate: completionRate,
            achievements: this.achievements.size,
            unlockedRewards: this.unlockedRewards.size
        };
    }
}
