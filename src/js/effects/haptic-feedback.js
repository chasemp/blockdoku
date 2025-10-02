/**
 * Blockdoku PWA - Haptic Feedback System
 * Handles vibration feedback for mobile devices
 */

export class HapticFeedback {
    constructor() {
        this.isEnabled = true;
        this.isSupported = this.checkSupport();
        this.userHasInteracted = false;
        this.lastVibrationTime = 0;
        this.vibrationThrottle = 100; // Minimum ms between vibrations
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
            speedBonus: [20, 5, 20],
            buttonClick: [5],
            emptyGridBonus: [40, 15, 40, 15, 40]
        };
        
        // Listen for user interaction to enable haptic feedback
        this.setupUserInteractionListener();
    }
    
    // Check if vibration is supported
    checkSupport() {
        return 'vibrate' in navigator;
    }
    
    // Setup user interaction listener
    setupUserInteractionListener() {
        const enableHaptic = () => {
            this.userHasInteracted = true;
            // Remove listeners after first interaction
            document.removeEventListener('click', enableHaptic);
            document.removeEventListener('touchstart', enableHaptic);
            document.removeEventListener('keydown', enableHaptic);
            document.removeEventListener('pointerdown', enableHaptic);
        };
        
        // Use multiple event types to catch user interaction
        document.addEventListener('click', enableHaptic, { once: true, passive: true });
        document.addEventListener('touchstart', enableHaptic, { once: true, passive: true });
        document.addEventListener('keydown', enableHaptic, { once: true, passive: true });
        document.addEventListener('pointerdown', enableHaptic, { once: true, passive: true });
        
        // Also check if user has already interacted (for late initialization)
        if (document.visibilityState === 'visible' && document.hasFocus && document.hasFocus()) {
            // If document has focus, user likely already interacted
            // But we'll still wait for explicit interaction to be safe
        }
    }
    
    // Enable/disable haptic feedback
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }
    
    // Manually enable haptic feedback (call after user interaction)
    enableAfterInteraction() {
        this.userHasInteracted = true;
    }
    
    // Trigger haptic feedback
    vibrate(pattern) {
        // Early return if not enabled, supported, or user hasn't interacted
        if (!this.isEnabled || !this.isSupported || !this.userHasInteracted) {
            return;
        }
        
        // Throttle vibrations to prevent loops
        const now = Date.now();
        if (now - this.lastVibrationTime < this.vibrationThrottle) {
            return;
        }
        
        try {
            if (typeof pattern === 'string') {
                pattern = this.vibrationPatterns[pattern] || [10];
            }
            
            // Additional check before calling navigator.vibrate to prevent browser warnings
            if (navigator.vibrate && typeof navigator.vibrate === 'function') {
                navigator.vibrate(pattern);
                this.lastVibrationTime = now;
            }
        } catch (error) {
            // Silently handle errors to prevent console spam
            // Only log if it's not the common user interaction error
            if (!error.message.includes('user hasn\'t tapped') && !error.message.includes('user activation')) {
                console.warn('Haptic feedback error:', error);
            }
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
        if (combo >= 1) {
            this.vibrate('combo');
        }
    }
    
    // Speed bonus feedback
    onSpeedBonus() {
        this.vibrate('speedBonus');
    }
    
    // Empty grid bonus feedback
    onEmptyGridBonus() {
        this.vibrate('emptyGridBonus');
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
    
    // Debug method to check haptic feedback status
    getStatus() {
        return {
            isEnabled: this.isEnabled,
            isSupported: this.isSupported,
            userHasInteracted: this.userHasInteracted,
            lastVibrationTime: this.lastVibrationTime,
            vibrationThrottle: this.vibrationThrottle
        };
    }
}
