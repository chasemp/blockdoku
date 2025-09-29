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
            haptic: true
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
    
    // Block placement effects
    onBlockPlace(x, y) {
        this.particles.createSparkles(x, y, 6);
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
        this.particles.createScoreNumber(x, y, score, '#00ff00');
        if (this.settings.sound) this.sound.play('scoreGain');
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
        this.haptic.onButtonClick();
    }
    
    // Block rotation effects
    onBlockRotate() {
        if (this.settings.sound) this.sound.play('blockRotate');
    }
    
    // Glow trail for block movement
    onBlockMove(x, y, color = null) {
        const themeColor = color || getComputedStyle(document.documentElement).getPropertyValue('--clear-glow-color').trim() || '#00ff00';
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
