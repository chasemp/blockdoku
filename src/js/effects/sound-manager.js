/**
 * Blockdoku PWA - Sound Manager
 * Handles all audio effects using Web Audio API
 */

export class SoundManager {
    constructor() {
        this.audioContext = null;
        this.isEnabled = false;
        this.volume = 0.5;
        this.sounds = {};
        
        this.init();
    }
    
    // Initialize audio context
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.isEnabled = false;
        }
    }
    
    // Enable/disable sound
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }
    
    // Set volume (0.0 to 1.0)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    
    // Create all sound effects
    createSounds() {
        if (!this.audioContext) return;
        
        this.sounds = {
            blockPlace: this.createBlockPlaceSound(),
            lineClear: this.createLineClearSound(),
            levelUp: this.createLevelUpSound(),
            combo: this.createComboSound(),
            error: this.createErrorSound(),
            buttonClick: this.createButtonClickSound(),
            blockRotate: this.createBlockRotateSound(),
            scoreGain: this.createScoreGainSound()
        };
    }
    
    // Play a sound effect
    play(soundName) {
        if (!this.isEnabled || !this.audioContext || !this.sounds[soundName]) return;
        
        try {
            const sound = this.sounds[soundName];
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = sound.buffer;
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            gainNode.gain.value = this.volume * sound.volume;
            source.start();
        } catch (error) {
            console.warn('Error playing sound:', error);
        }
    }
    
    // Create block placement sound
    createBlockPlaceSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            data[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 10) * 0.3;
        }
        
        return { buffer, volume: 0.7 };
    }
    
    // Create line clear sound
    createLineClearSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.3, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const frequency = 400 + Math.sin(t * 20) * 100;
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 3) * 0.4;
        }
        
        return { buffer, volume: 0.8 };
    }
    
    // Create level up sound
    createLevelUpSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const frequency = 200 + t * 400; // Rising pitch
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 2) * 0.5;
        }
        
        return { buffer, volume: 0.9 };
    }
    
    // Create combo sound
    createComboSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.2, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const frequency = 600 + Math.sin(t * 30) * 200;
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 5) * 0.3;
        }
        
        return { buffer, volume: 0.6 };
    }
    
    // Create error sound
    createErrorSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.15, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const frequency = 200 - t * 100; // Falling pitch
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 8) * 0.4;
        }
        
        return { buffer, volume: 0.5 };
    }
    
    // Create button click sound
    createButtonClickSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.05, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            data[i] = Math.sin(2 * Math.PI * 1000 * t) * Math.exp(-t * 20) * 0.2;
        }
        
        return { buffer, volume: 0.4 };
    }
    
    // Create block rotate sound
    createBlockRotateSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.08, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const frequency = 300 + Math.sin(t * 50) * 50;
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 15) * 0.15;
        }
        
        return { buffer, volume: 0.3 };
    }
    
    // Create score gain sound
    createScoreGainSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.12, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const frequency = 500 + t * 200; // Rising pitch
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 6) * 0.25;
        }
        
        return { buffer, volume: 0.5 };
    }
    
    // Resume audio context (required for some browsers)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    // Stop all sounds
    stop() {
        if (this.audioContext) {
            this.audioContext.close();
            this.init();
        }
    }
}
