/**
 * Blockdoku PWA - Timer System
 * Handles time pressure for Hard and Expert difficulty modes
 */

export class TimerSystem {
    constructor(difficultyManager) {
        this.difficultyManager = difficultyManager;
        this.timeLimit = null;
        this.timeRemaining = 0;
        this.isActive = false;
        this.isPaused = false;
        this.startTime = 0;
        this.pausedTime = 0;
        this.timeBonus = 0;
        this.warningThreshold = 30; // Show warning when 30 seconds left
        this.criticalThreshold = 10; // Show critical warning when 10 seconds left
    }
    
    initialize() {
        this.timeLimit = this.difficultyManager.getTimeLimit();
        if (this.timeLimit) {
            this.timeRemaining = this.timeLimit;
            this.isActive = true;
        }
    }
    
    start() {
        if (!this.isActive || this.timeLimit === null) return;
        
        this.startTime = Date.now();
        this.isPaused = false;
        this.pausedTime = 0;
    }
    
    pause() {
        if (!this.isActive || this.isPaused) return;
        
        this.isPaused = true;
        this.pausedTime = Date.now();
    }
    
    resume() {
        if (!this.isActive || !this.isPaused) return;
        
        const pausedDuration = Date.now() - this.pausedTime;
        this.startTime += pausedDuration;
        this.isPaused = false;
    }
    
    update() {
        if (!this.isActive || this.isPaused || this.timeLimit === null) return;
        
        const elapsed = Date.now() - this.startTime;
        this.timeRemaining = Math.max(0, this.timeLimit - Math.floor(elapsed / 1000));
        
        return this.timeRemaining > 0;
    }
    
    addTimeBonus(seconds) {
        this.timeRemaining += seconds;
        this.timeBonus += seconds;
    }
    
    getTimeRemaining() {
        return this.timeRemaining;
    }
    
    getTimeBonus() {
        return this.timeBonus;
    }
    
    isTimeUp() {
        return this.timeRemaining <= 0;
    }
    
    isWarningTime() {
        return this.timeRemaining <= this.warningThreshold && this.timeRemaining > this.criticalThreshold;
    }
    
    isCriticalTime() {
        return this.timeRemaining <= this.criticalThreshold;
    }
    
    getTimeStatus() {
        return {
            remaining: this.timeRemaining,
            limit: this.timeLimit,
            isActive: this.isActive,
            isPaused: this.isPaused,
            isWarning: this.isWarningTime(),
            isCritical: this.isCriticalTime(),
            bonus: this.timeBonus
        };
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    getFormattedTimeRemaining() {
        return this.formatTime(this.timeRemaining);
    }
    
    getFormattedTimeLimit() {
        return this.formatTime(this.timeLimit);
    }
    
    // Calculate time bonus for line clears
    calculateTimeBonus(clearedLines) {
        const totalClears = clearedLines.rows.length + clearedLines.columns.length + clearedLines.squares.length;
        
        if (totalClears === 0) return 0;
        
        // Base time bonus per clear
        let bonus = totalClears * 5; // 5 seconds per clear
        
        // Bonus for multiple clears
        if (totalClears > 1) {
            bonus += (totalClears - 1) * 3; // Extra 3 seconds per additional clear
        }
        
        // Bonus for combo clears
        const combo = this.difficultyManager.getComboThreshold();
        if (totalClears >= combo) {
            bonus += 10; // Extra 10 seconds for combo
        }
        
        return bonus;
    }
    
    // Get time pressure visual effects
    getTimePressureEffects() {
        if (!this.isActive) return null;
        
        if (this.isCriticalTime()) {
            return {
                type: 'critical',
                color: '#ff0000',
                intensity: 1.0,
                pulse: true
            };
        } else if (this.isWarningTime()) {
            return {
                type: 'warning',
                color: '#ff8800',
                intensity: 0.7,
                pulse: false
            };
        }
        
        return null;
    }
    
    // Reset timer
    reset() {
        this.timeRemaining = this.timeLimit || 0;
        this.isActive = this.timeLimit !== null;
        this.isPaused = false;
        this.startTime = 0;
        this.pausedTime = 0;
        this.timeBonus = 0;
    }
    
    // Disable timer
    disable() {
        this.isActive = false;
        this.timeLimit = null;
        this.timeRemaining = 0;
    }
}
