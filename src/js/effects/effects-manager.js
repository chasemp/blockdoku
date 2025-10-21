/**
 * Blockdoku PWA - Effects Manager
 * Coordinates particle effects, sound, and haptic feedback
 */

import { ParticleSystem } from './particle-system.js';
import { SoundManager } from './sound-manager.js';
import { HapticFeedback } from './haptic-feedback.js';

export class EffectsManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        
        // Initialize effect systems
        this.particles = new ParticleSystem(canvas, ctx);
        this.sound = new SoundManager();
        this.haptic = new HapticFeedback();
        
        // Settings
        this.settings = {
            particles: true,
            sound: false,
            haptic: true,
            blockPlacementAnimations: true
        };
    }
    
    // Update settings
    updateSettings(settings) {
        this.settings = { ...this.settings, ...settings };
        
        this.particles.setEnabled(this.settings.particles);
        this.sound.setEnabled(this.settings.sound);
        this.haptic.setEnabled(this.settings.haptic);
    }
    
    // Set volume
    setVolume(volume) {
        this.sound.setVolume(volume);
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
    
    // Block placement effects
    onBlockPlace(x, y) {
        if (this.settings.blockPlacementAnimations) {
            this.particles.createSparkles(x, y, 6);
        }
        if (this.settings.sound) this.sound.play('blockPlace');
        this.haptic.onBlockPlace();
    }
    
    // Line clear effects
    onLineClear(x, y, clearedLines) {
        const totalClears = clearedLines.rows.length + clearedLines.columns.length + clearedLines.squares.length;
        
        this.particles.createConfetti(x, y, totalClears * 5);
        if (this.settings.sound) this.sound.play('lineClear');
        this.haptic.onLineClear();
    }
    
    // Level up effects
    onLevelUp(x, y) {
        this.particles.createLevelUpEffect(x, y);
        if (this.settings.sound) this.sound.play('levelUp');
        this.haptic.onLevelUp();
    }
    
    // Combo effects
    onCombo(x, y, combo) {
        this.particles.createComboEffect(x, y, combo);
        if (this.settings.sound) this.sound.play('combo');
        this.haptic.onCombo(combo);
    }
    
    // Score gain effects
    onScoreGain(x, y, score) {
        const themeColor = this.getThemeColorWithFallback('--clear-glow-color');
        this.particles.createScoreNumber(x, y, score, themeColor);
        if (this.settings.sound) this.sound.play('scoreGain');
    }
    
    // Speed bonus effects
    onSpeedBonus(x, y, bonus) {
        // Create special speed bonus particles
        this.particles.createSpeedBonusEffect(x, y, bonus);
        if (this.settings.sound) this.sound.play('speedBonus');
        this.haptic.onSpeedBonus();
    }
    
    // Error effects
    onError() {
        if (this.settings.sound) this.sound.play('error');
        this.haptic.onError();
    }
    
    // Button click effects
    onButtonClick() {
        if (this.settings.sound) this.sound.play('buttonClick');
        // Enable haptic feedback after first user interaction
        this.haptic.enableAfterInteraction();
        // Small delay to ensure user interaction is registered
        setTimeout(() => {
            this.haptic.onButtonClick();
        }, 10);
    }
    
    // Block rotation effects
    onBlockRotate() {
        if (this.settings.sound) this.sound.play('blockRotate');
    }
    
    // Glow trail for block movement
    onBlockMove(x, y, color = null) {
        const themeColor = color || this.getThemeColorWithFallback('--clear-glow-color');
        this.particles.createGlowTrail(x, y, themeColor);
    }
    
    // Update all effects
    update() {
        this.particles.update();
    }
    
    // Render all effects
    render() {
        this.particles.render();
    }
    
    // Clear all effects
    clear() {
        this.particles.clear();
    }
    
    // Resume audio context
    resume() {
        this.sound.resume();
    }
    
    // Stop all effects
    stop() {
        this.particles.clear();
        this.sound.stop();
        this.haptic.stop();
    }
}
