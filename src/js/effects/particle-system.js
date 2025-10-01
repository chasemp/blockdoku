/**
 * Blockdoku PWA - Particle Effects System
 * Handles all particle effects for visual polish
 */

export class ParticleSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.isEnabled = true;
        this.maxParticles = 200;
        
        // Start animation loop
        this.animate();
    }
    
    // Enable/disable particle effects
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.particles = [];
        }
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
    
    // Create sparkle effect for block placement
    createSparkles(x, y, count = 8) {
        if (!this.isEnabled) return;
        
        for (let i = 0; i < count; i++) {
            this.particles.push(new SparkleParticle(x, y));
        }
    }
    
    // Create confetti burst for line clears
    createConfetti(x, y, count = 20) {
        if (!this.isEnabled) return;
        
        for (let i = 0; i < count; i++) {
            this.particles.push(new ConfettiParticle(x, y));
        }
    }
    
    // Create glow trail for block movement
    createGlowTrail(x, y, color = null) {
        if (!this.isEnabled) return;
        
        // Use theme color if no color specified
        const themeColor = color || this.getThemeColorWithFallback('--clear-glow-color');
        this.particles.push(new GlowTrailParticle(x, y, themeColor));
    }
    
    // Create score number animation
    createScoreNumber(x, y, score, color = null) {
        if (!this.isEnabled) return;
        
        // Use theme color if no color specified
        const themeColor = color || this.getThemeColorWithFallback('--clear-glow-color');
        
        this.particles.push(new ScoreNumberParticle(x, y, score, themeColor));
    }
    
    // Create level up celebration
    createLevelUpEffect(x, y) {
        if (!this.isEnabled) return;
        
        // Create multiple effects
        this.createConfetti(x, y, 30);
        this.createSparkles(x, y, 15);
        
        // Create level up text
        this.particles.push(new LevelUpParticle(x, y));
    }
    
    // Create empty grid bonus celebration
    createEmptyGridBonusEffect(x, y) {
        if (!this.isEnabled) return;
        
        // Create special green sparkles for empty grid bonus
        for (let i = 0; i < 20; i++) {
            this.particles.push(new EmptyGridBonusParticle(x, y));
        }
        
        // Create some confetti with green theme
        for (let i = 0; i < 15; i++) {
            this.particles.push(new EmptyGridConfettiParticle(x, y));
        }
        
        // Create floating text
        this.particles.push(new EmptyGridBonusTextParticle(x, y));
    }
    
    // Create combo effect
    createComboEffect(x, y, combo) {
        if (!this.isEnabled) return;
        
        this.createSparkles(x, y, combo * 3);
        this.particles.push(new ComboParticle(x, y, combo));
    }
    
    // Update all particles
    update() {
        if (!this.isEnabled) return;
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            
            // Remove dead particles
            if (particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }
        
        // Limit particle count
        if (this.particles.length > this.maxParticles) {
            this.particles = this.particles.slice(-this.maxParticles);
        }
    }
    
    // Render all particles
    render() {
        if (!this.isEnabled) return;
        
        this.ctx.save();
        
        for (const particle of this.particles) {
            particle.render(this.ctx);
        }
        
        this.ctx.restore();
    }
    
    // Animation loop
    animate() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.animate());
    }
    
    // Clear all particles
    clear() {
        this.particles = [];
    }
}

// Base particle class
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.life = 1.0;
        this.maxLife = 1.0;
        this.size = 1;
        this.color = '#ffffff';
        this.alpha = 1.0;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.016; // ~60fps
        this.alpha = this.life;
    }
    
    isDead() {
        return this.life <= 0;
    }
    
    render(ctx) {
        // Override in subclasses
    }
}

// Sparkle particle for block placement
class SparkleParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.maxLife = 0.8;
        this.life = this.maxLife;
        this.size = Math.random() * 3 + 1;
        this.color = `hsl(${Math.random() * 60 + 40}, 100%, 70%)`; // Yellow to orange
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }
    
    update() {
        super.update();
        this.rotation += this.rotationSpeed;
        this.vy += 0.1; // Gravity
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.restore();
    }
}

// Confetti particle for line clears
class ConfettiParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = Math.random() * -6 - 2; // Upward velocity
        this.maxLife = 2.0;
        this.life = this.maxLife;
        this.size = Math.random() * 4 + 2;
        this.colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.3;
    }
    
    update() {
        super.update();
        this.rotation += this.rotationSpeed;
        this.vy += 0.3; // Gravity
        this.vx *= 0.98; // Air resistance
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.restore();
    }
}

// Glow trail particle for block movement
class GlowTrailParticle extends Particle {
    constructor(x, y, color) {
        super(x, y);
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.maxLife = 0.5;
        this.life = this.maxLife;
        this.size = Math.random() * 6 + 3;
        this.color = color;
    }
    
    update() {
        super.update();
        this.size *= 0.98; // Shrink over time
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha * 0.6;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Score number particle
class ScoreNumberParticle extends Particle {
    constructor(x, y, score, color) {
        super(x, y);
        this.vx = 0;
        this.vy = -2;
        this.maxLife = 1.5;
        this.life = this.maxLife;
        this.score = score;
        this.color = color;
        this.fontSize = 20;
    }
    
    update() {
        super.update();
        this.fontSize += 0.5; // Grow over time
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 2;
        ctx.fillText(`+${this.score}`, this.x, this.y);
        ctx.restore();
    }
}

// Level up particle
class LevelUpParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.vx = 0;
        this.vy = -1;
        this.maxLife = 2.0;
        this.life = this.maxLife;
        this.text = 'LEVEL UP!';
        this.color = '#ffd700';
        this.fontSize = 24;
    }
    
    update() {
        super.update();
        this.fontSize += 0.3;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

// Combo particle
class ComboParticle extends Particle {
    constructor(x, y, combo) {
        super(x, y);
        this.vx = 0;
        this.vy = -1.5;
        this.maxLife = 1.5;
        this.life = this.maxLife;
        this.text = `${combo}x COMBO!`;
        this.color = '#ff6b6b';
        this.fontSize = 18;
    }
    
    update() {
        super.update();
        this.fontSize += 0.2;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 3;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

// Empty grid bonus sparkle particle
class EmptyGridBonusParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.maxLife = 1.2;
        this.life = this.maxLife;
        this.size = Math.random() * 4 + 2;
        this.color = `hsl(${Math.random() * 40 + 120}, 100%, 60%)`; // Green to cyan
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.3;
    }
    
    update() {
        super.update();
        this.rotation += this.rotationSpeed;
        this.vy += 0.05; // Light gravity
        this.size *= 0.99; // Shrink slightly
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.restore();
    }
}

// Empty grid bonus confetti particle
class EmptyGridConfettiParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = Math.random() * -8 - 3; // Upward velocity
        this.maxLife = 2.5;
        this.life = this.maxLife;
        this.size = Math.random() * 5 + 3;
        this.colors = ['#00ff88', '#00cc66', '#00ffaa', '#66ff99', '#00ff77', '#33ff88'];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.4;
    }
    
    update() {
        super.update();
        this.rotation += this.rotationSpeed;
        this.vy += 0.2; // Gravity
        this.vx *= 0.98; // Air resistance
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.restore();
    }
}

// Empty grid bonus text particle
class EmptyGridBonusTextParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        this.vx = 0;
        this.vy = -1.5;
        this.maxLife = 2.0;
        this.life = this.maxLife;
        this.text = 'EMPTY GRID BONUS!';
        this.color = '#00ff88';
        this.fontSize = 22;
    }
    
    update() {
        super.update();
        this.fontSize += 0.4;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 255, 136, 0.8)';
        ctx.shadowBlur = 6;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}
