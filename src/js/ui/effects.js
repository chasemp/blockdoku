/**
 * Blockdoku PWA - Visual Effects System
 * MVT Milestone 3: Add line clearing logic (rows, columns, 3x3 squares)
 */

export class EffectsSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.animations = [];
        this.cellSize = 50;
    }
    
    // Get theme color from CSS custom properties
    getThemeColor(varName) {
        try {
            const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
            if (!value) {
                throw new Error(`Theme color variable '${varName}' not found`);
            }
            return value;
        } catch (e) {
            console.error(`Failed to get theme color '${varName}':`, e);
            throw new Error(`Theme color '${varName}' is required but not available`);
        }
    }
    
    // Get theme color with fallback for common variables
    getThemeColorWithFallback(varName) {
        try {
            return this.getThemeColor(varName);
        } catch (error) {
            console.warn(`CSS variable ${varName} not available, using fallback color`);
            // Fallback colors for common theme variables
            const fallbackColors = {
                '--clear-glow-color': '#00aaff', // Default blue
                '--primary-color': '#007bff',
                '--text-color': '#333333',
                '--bg-color': '#ffffff'
            };
            return fallbackColors[varName] || '#00aaff';
        }
    }
    
    // Create line clear animation
    createLineClearEffect(clearedLines, duration = 500) {
        const animation = {
            type: 'lineClear',
            clearedLines: clearedLines,
            startTime: Date.now(),
            duration: duration,
            progress: 0
        };
        
        this.animations.push(animation);
        return animation;
    }
    
    // Create score popup animation
    createScorePopup(x, y, score, duration = 1000) {
        const animation = {
            type: 'scorePopup',
            x: x,
            y: y,
            score: score,
            startTime: Date.now(),
            duration: duration,
            progress: 0,
            alpha: 1
        };
        
        this.animations.push(animation);
        return animation;
    }
    
    // Create combo effect
    createComboEffect(combo, x, y, duration = 800) {
        const animation = {
            type: 'combo',
            x: x,
            y: y,
            combo: combo,
            startTime: Date.now(),
            duration: duration,
            progress: 0,
            alpha: 1
        };
        
        this.animations.push(animation);
        return animation;
    }
    
    // Update all animations
    update() {
        const currentTime = Date.now();
        
        for (let i = this.animations.length - 1; i >= 0; i--) {
            const animation = this.animations[i];
            const elapsed = currentTime - animation.startTime;
            animation.progress = Math.min(elapsed / animation.duration, 1);
            
            if (animation.progress >= 1) {
                this.animations.splice(i, 1);
            }
        }
    }
    
    // Render all animations
    render() {
        this.animations.forEach(animation => {
            switch (animation.type) {
                case 'lineClear':
                    this.renderLineClearEffect(animation);
                    break;
                case 'scorePopup':
                    this.renderScorePopup(animation);
                    break;
                case 'combo':
                    this.renderComboEffect(animation);
                    break;
            }
        });
    }
    
    renderLineClearEffect(animation) {
        const ctx = this.ctx;
        const progress = animation.progress;
        const alpha = 1 - progress;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.getThemeColorWithFallback('--clear-glow-color'); // Theme-based flash
        
        // Flash cleared rows
        animation.clearedLines.rows.forEach(row => {
            const y = row * this.cellSize;
            ctx.fillRect(0, y, this.canvas.width, this.cellSize);
        });
        
        // Flash cleared columns
        animation.clearedLines.columns.forEach(col => {
            const x = col * this.cellSize;
            ctx.fillRect(x, 0, this.cellSize, this.canvas.height);
        });
        
        // Flash cleared 3x3 squares
        animation.clearedLines.squares.forEach(square => {
            const x = square.col * 3 * this.cellSize;
            const y = square.row * 3 * this.cellSize;
            ctx.fillRect(x, y, 3 * this.cellSize, 3 * this.cellSize);
        });
        
        ctx.restore();
    }
    
    renderScorePopup(animation) {
        const ctx = this.ctx;
        const progress = animation.progress;
        const alpha = 1 - progress;
        const y = animation.y - (progress * 50); // Move up
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.getThemeColorWithFallback('--clear-glow-color');
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`+${animation.score}`, animation.x, y);
        ctx.restore();
    }
    
    renderComboEffect(animation) {
        const ctx = this.ctx;
        const progress = animation.progress;
        const alpha = 1 - progress;
        const scale = 1 + (progress * 0.5); // Grow slightly
        const y = animation.y - (progress * 30);
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ff6b35';
        ctx.font = `bold ${24 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(`COMBO x${animation.combo}!`, animation.x, y);
        ctx.restore();
    }
    
    // Clear all animations
    clear() {
        this.animations = [];
    }
    
    // Check if any animations are running
    hasActiveAnimations() {
        return this.animations.length > 0;
    }
}
