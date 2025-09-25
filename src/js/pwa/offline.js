/**
 * Blockdoku PWA - Offline Manager
 * MVT Milestone 4: Implement PWA infrastructure
 */

export class OfflineManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.offlineIndicator = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createOfflineIndicator();
        this.updateOfflineStatus();
    }
    
    setupEventListeners() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            console.log('PWA: Back online');
            this.isOnline = true;
            this.updateOfflineStatus();
        });
        
        window.addEventListener('offline', () => {
            console.log('PWA: Gone offline');
            this.isOnline = false;
            this.updateOfflineStatus();
        });
        
        // Listen for visibility change (app focus/blur)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handleAppBlur();
            } else {
                this.handleAppFocus();
            }
        });
    }
    
    createOfflineIndicator() {
        // Create offline indicator
        this.offlineIndicator = document.createElement('div');
        this.offlineIndicator.id = 'offline-indicator';
        this.offlineIndicator.className = 'offline-indicator';
        this.offlineIndicator.innerHTML = '📡 Offline Mode';
        this.offlineIndicator.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #ff6b35;
            color: white;
            text-align: center;
            padding: 0.5rem;
            font-size: 0.9rem;
            font-weight: 500;
            z-index: 1000;
            transform: translateY(-100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(this.offlineIndicator);
    }
    
    updateOfflineStatus() {
        if (this.offlineIndicator) {
            if (this.isOnline) {
                this.offlineIndicator.style.transform = 'translateY(-100%)';
                this.offlineIndicator.innerHTML = '📡 Offline Mode';
            } else {
                this.offlineIndicator.style.transform = 'translateY(0)';
                this.offlineIndicator.innerHTML = '📡 Offline Mode - Game works without internet!';
            }
        }
    }
    
    handleAppBlur() {
        // App is going to background
        console.log('PWA: App blurred');
        // Could pause game or save state here
    }
    
    handleAppFocus() {
        // App is coming to foreground
        console.log('PWA: App focused');
        // Could resume game or check for updates here
    }
    
    // Check if app is running in standalone mode
    isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone === true;
    }
    
    // Get offline status
    getStatus() {
        return {
            isOnline: this.isOnline,
            isStandalone: this.isStandalone(),
            supportsOffline: 'serviceWorker' in navigator
        };
    }
}
