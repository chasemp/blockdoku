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
        this.soundPresets = {};
        this.customSoundMappings = {}; // Maps sound names to preset IDs
        
        this.init();
    }
    
    // Initialize audio context
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSoundPresets();
            this.loadCustomSoundMappings();
            this.createSounds();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.isEnabled = false;
        }
    }
    
    // Load custom sound mappings from localStorage
    loadCustomSoundMappings() {
        try {
            const saved = localStorage.getItem('blockdoku_sound_mappings');
            if (saved) {
                this.customSoundMappings = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load sound mappings:', error);
        }
    }
    
    // Save custom sound mappings to localStorage
    saveSoundMappings() {
        try {
            localStorage.setItem('blockdoku_sound_mappings', JSON.stringify(this.customSoundMappings));
        } catch (error) {
            console.warn('Failed to save sound mappings:', error);
        }
    }
    
    // Set custom sound for a specific effect
    setCustomSound(soundName, presetId) {
        if (presetId === 'default' || presetId === null) {
            delete this.customSoundMappings[soundName];
        } else {
            this.customSoundMappings[soundName] = presetId;
        }
        this.saveSoundMappings();
        this.createSounds(); // Recreate sounds with new mappings
    }
    
    // Get available sound presets for user selection
    getAvailablePresets() {
        return {
            default: { name: 'Default', description: 'Standard game sound' },
            chime: { name: 'Chime', description: 'Gentle bell-like tone' },
            beep: { name: 'Beep', description: 'Electronic beep' },
            pop: { name: 'Pop', description: 'Quick pop sound' },
            swoosh: { name: 'Swoosh', description: 'Whoosh effect' },
            ding: { name: 'Ding', description: 'High-pitched ding' },
            thud: { name: 'Thud', description: 'Low bass thump' },
            click: { name: 'Click', description: 'Sharp click sound' }
        };
    }
    
    // Create sound presets that users can choose from
    createSoundPresets() {
        if (!this.audioContext) return;
        
        this.soundPresets = {
            chime: this.createChimePreset(),
            beep: this.createBeepPreset(),
            pop: this.createPopPreset(),
            swoosh: this.createSwooshPreset(),
            ding: this.createDingPreset(),
            thud: this.createThudPreset(),
            click: this.createClickPreset()
        };
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
        
        // Check if custom sound is mapped, otherwise use default
        const getSound = (soundName, defaultCreator) => {
            const presetId = this.customSoundMappings[soundName];
            if (presetId === 'none') {
                return null; // No sound for this effect
            }
            if (presetId && this.soundPresets[presetId]) {
                return this.soundPresets[presetId];
            }
            return defaultCreator.call(this);
        };
        
        this.sounds = {
            blockPlace: getSound('blockPlace', this.createBlockPlaceSound),
            lineClear: getSound('lineClear', this.createLineClearSound),
            levelUp: getSound('levelUp', this.createLevelUpSound),
            combo: getSound('combo', this.createComboSound),
            error: getSound('error', this.createErrorSound),
            buttonClick: getSound('buttonClick', this.createButtonClickSound),
            blockRotate: getSound('blockRotate', this.createBlockRotateSound),
            scoreGain: getSound('scoreGain', this.createScoreGainSound),
            timeWarning: getSound('timeWarning', this.createTimeWarningSound),
            timeCritical: getSound('timeCritical', this.createTimeCriticalSound),
            timeBonus: getSound('timeBonus', this.createTimeBonusSound),
            hint: getSound('hint', this.createHintSound),
            undo: getSound('undo', this.createUndoSound),
            redo: getSound('redo', this.createRedoSound),
            perfect: getSound('perfect', this.createPerfectSound),
            chain: getSound('chain', this.createChainSound)
        };
    }
    
    // Get list of all customizable sound effects
    getSoundEffects() {
        return {
            blockPlace: { name: 'Block Placement', description: 'When placing a block on the board' },
            lineClear: { name: 'Line Clear', description: 'When clearing lines' },
            levelUp: { name: 'Level Up', description: 'When advancing to next level' },
            combo: { name: 'Combo', description: 'When achieving a combo' },
            error: { name: 'Error', description: 'When an invalid action occurs' },
            buttonClick: { name: 'Button Click', description: 'Button press feedback' },
            blockRotate: { name: 'Block Rotate', description: 'When rotating a block' },
            scoreGain: { name: 'Score Gain', description: 'When earning points' },
            timeWarning: { name: 'Time Warning', description: 'Low time warning' },
            timeCritical: { name: 'Time Critical', description: 'Very low time alert' },
            timeBonus: { name: 'Time Bonus', description: 'Bonus time awarded' },
            hint: { name: 'Hint', description: 'When using a hint' },
            undo: { name: 'Undo', description: 'Undo action' },
            redo: { name: 'Redo', description: 'Redo action' },
            perfect: { name: 'Perfect Clear', description: 'Perfect board clear' },
            chain: { name: 'Chain', description: 'Chain combo effect' }
        };
    }
    
    // Get grouped sound effects for simplified settings
    getGroupedSoundEffects() {
        return {
            events: {
                name: 'Events',
                description: 'General gameplay actions like block placement and UI interactions',
                sounds: ['blockPlace', 'blockRotate', 'buttonClick', 'undo', 'redo', 'hint']
            },
            success: {
                name: 'Success', 
                description: 'Achievements, rewards, and successful actions',
                sounds: ['lineClear', 'levelUp', 'combo', 'scoreGain', 'perfect', 'chain', 'timeBonus']
            },
            warning: {
                name: 'Warning',
                description: 'Time pressure alerts and urgent notifications',
                sounds: ['timeWarning', 'timeCritical']
            },
            failure: {
                name: 'Failure',
                description: 'Mistakes and invalid actions',
                sounds: ['error']
            }
        };
    }
    
    // Preview a sound preset
    previewSound(presetId) {
        if (!this.audioContext || !this.isEnabled) return;
        
        try {
            if (presetId === 'none') return; // No sound to preview
            
            const sound = presetId === 'default' ? this.createBlockPlaceSound() : this.soundPresets[presetId];
            if (!sound) return;
            
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = sound.buffer;
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            gainNode.gain.value = this.volume * sound.volume;
            source.start();
        } catch (error) {
            console.warn('Error previewing sound:', error);
        }
    }
    
    // Play a sound effect
    play(soundName) {
        if (!this.isEnabled || !this.audioContext || !this.sounds[soundName]) return;
        
        try {
            const sound = this.sounds[soundName];
            if (sound === null) return; // No sound for this effect (none option)
            
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
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.08, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const freq = 300 - t * 200;
            data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 20) * 0.4;
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
    
    // Create time warning sound
    createTimeWarningSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.2, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const frequency = 300 + Math.sin(t * 10) * 50;
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 4) * 0.3;
        }
        
        return { buffer, volume: 0.6 };
    }
    
    // Create time critical sound
    createTimeCriticalSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const frequency = 400 + Math.sin(t * 50) * 100;
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 8) * 0.4;
        }
        
        return { buffer, volume: 0.7 };
    }
    
    // Create time bonus sound
    createTimeBonusSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.15, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const frequency = 200 + t * 600; // Rising pitch
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 3) * 0.35;
        }
        
        return { buffer, volume: 0.6 };
    }
    
    // Create hint sound
    createHintSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.25, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const frequency = 150 + Math.sin(t * 8) * 30;
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 2) * 0.2;
        }
        
        return { buffer, volume: 0.4 };
    }
    
    // Create undo sound
    createUndoSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.08, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const frequency = 400 - t * 200; // Falling pitch
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 12) * 0.25;
        }
        
        return { buffer, volume: 0.4 };
    }
    
    // Create redo sound
    createRedoSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.08, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const frequency = 200 + t * 400; // Rising pitch
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 12) * 0.25;
        }
        
        return { buffer, volume: 0.4 };
    }
    
    // Create perfect sound (for perfect clears)
    createPerfectSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.6, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const frequency = 100 + t * 800; // Rising pitch
            const harmonic = Math.sin(2 * Math.PI * frequency * t) + 
                           0.5 * Math.sin(2 * Math.PI * frequency * 2 * t) +
                           0.25 * Math.sin(2 * Math.PI * frequency * 3 * t);
            data[i] = harmonic * Math.exp(-t * 1.5) * 0.4;
        }
        
        return { buffer, volume: 0.8 };
    }
    
    // Create chain sound (for consecutive clears)
    createChainSound() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.3, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const frequency = 300 + Math.sin(t * 15) * 100;
            data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 2) * 0.3;
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
    
    // ===== SOUND PRESET CREATORS =====
    
    // Chime preset - gentle bell-like tone
    createChimePreset() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.3, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const freq = 880; // A5 note
            data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 5) * 0.3 +
                     0.5 * Math.sin(2 * Math.PI * freq * 2 * t) * Math.exp(-t * 5) * 0.3;
        }
        
        return { buffer, volume: 0.7 };
    }
    
    // Beep preset - electronic beep
    createBeepPreset() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            data[i] = Math.sin(2 * Math.PI * 1200 * t) * Math.exp(-t * 15) * 0.3;
        }
        
        return { buffer, volume: 0.6 };
    }
    
    // Pop preset - quick pop sound
    createPopPreset() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.08, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const freq = 300 - t * 200;
            data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 20) * 0.4;
        }
        
        return { buffer, volume: 0.7 };
    }
    
    // Swoosh preset - whoosh effect
    createSwooshPreset() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.2, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const freq = 100 + t * 400;
            data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 6) * 0.25;
        }
        
        return { buffer, volume: 0.5 };
    }
    
    // Ding preset - high-pitched ding
    createDingPreset() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.25, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const freq = 1760; // A6 note
            data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 6) * 0.35;
        }
        
        return { buffer, volume: 0.6 };
    }
    
    // Thud preset - low bass thump
    createThudPreset() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.12, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const freq = 100 - t * 50;
            data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 12) * 0.5;
        }
        
        return { buffer, volume: 0.8 };
    }
    
    // Click preset - sharp click sound
    createClickPreset() {
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.04, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / this.audioContext.sampleRate;
            data[i] = Math.sin(2 * Math.PI * 1500 * t) * Math.exp(-t * 30) * 0.25;
        }
        
        return { buffer, volume: 0.5 };
    }
    
    // Get grouped sound settings
    getGroupedSoundSettings() {
        const groupedSettings = {};
        const groupedEffects = this.getGroupedSoundEffects();
        const currentMappings = this.customSoundMappings || {};
        
        for (const [groupKey, groupInfo] of Object.entries(groupedEffects)) {
            // Check if all sounds in the group have the same preset
            const groupPresets = groupInfo.sounds.map(soundKey => 
                currentMappings[soundKey] || 'default'
            );
            const uniquePresets = [...new Set(groupPresets)];
            
            if (uniquePresets.length === 1) {
                groupedSettings[groupKey] = uniquePresets[0];
            } else {
                groupedSettings[groupKey] = 'mixed';
            }
        }
        
        return groupedSettings;
    }
    
    // Set grouped sound settings
    setGroupedSoundSettings(groupKey, presetId) {
        const groupedEffects = this.getGroupedSoundEffects();
        const groupInfo = groupedEffects[groupKey];
        
        if (!groupInfo) return;
        
        // Apply the preset to all sounds in the group
        for (const soundKey of groupInfo.sounds) {
            this.setCustomSound(soundKey, presetId);
        }
    }
    
    // Preview a grouped sound (plays the first sound in the group)
    previewGroupedSound(groupKey) {
        const groupedEffects = this.getGroupedSoundEffects();
        const groupInfo = groupedEffects[groupKey];
        
        if (!groupInfo || groupInfo.sounds.length === 0) return;
        
        // Preview the first sound in the group
        const firstSound = groupInfo.sounds[0];
        const currentPreset = this.customSoundMappings?.[firstSound] || 'default';
        this.previewSound(currentPreset);
    }
}
