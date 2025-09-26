/**
 * Blockdoku PWA - Haptic Feedback System
 * Handles vibration feedback for mobile devices
 */

export class HapticFeedback {
    constructor() {
        this.isEnabled = true;
        this.isSupported = this.checkSupport();
        this.vibrationPatterns = {
            light: [10],
            medium: [20],
            heavy: [50],
            success: [20, 10, 20],
            error: [100],
            blockPlace: [15],
            lineClear: [30, 10, 30],
            levelUp: [50, 20, 50],
            combo: [25, 10, 25, 10, 25],
            buttonClick: [5]
        };
    }
    
    // Check if vibration is supported
    checkSupport() {
        return 'vibrate' in navigator;
    }
    
    // Enable/disable haptic feedback
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }
    
    // Trigger haptic feedback
    vibrate(pattern) {
        if (!this.isEnabled || !this.isSupported) return;
        
        try {
            if (typeof pattern === 'string') {
                pattern = this.vibrationPatterns[pattern] || [10];
            }
            
            navigator.vibrate(pattern);
        } catch (error) {
            console.warn('Haptic feedback error:', error);
        }
    }
    
    // Block placement feedback
    onBlockPlace() {
        this.vibrate('blockPlace');
    }
    
    // Line clear feedback
    onLineClear() {
        this.vibrate('lineClear');
    }
    
    // Level up feedback
    onLevelUp() {
        this.vibrate('levelUp');
    }
    
    // Combo feedback
    onCombo(combo) {
        if (combo > 1) {
            this.vibrate('combo');
        }
    }
    
    // Error feedback
    onError() {
        this.vibrate('error');
    }
    
    // Button click feedback
    onButtonClick() {
        this.vibrate('buttonClick');
    }
    
    // Success feedback
    onSuccess() {
        this.vibrate('success');
    }
    
    // Custom pattern feedback
    onCustom(pattern) {
        this.vibrate(pattern);
    }
    
    // Stop all vibrations
    stop() {
        if (this.isSupported) {
            navigator.vibrate(0);
        }
    }
}
