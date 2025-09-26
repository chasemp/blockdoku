/**
 * Blockdoku PWA - Installation Manager
 * MVT Milestone 4: Implement PWA infrastructure
 */

export class PWAInstallManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.installButton = null;
        this.settingsInstallButton = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkInstallStatus();
        this.createInstallButton();
        this.setupSettingsButton();
    }
    
    setupEventListeners() {
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('PWA: beforeinstallprompt event fired');
            e.preventDefault();
            this.deferredPrompt = e;
            // Create and show install button immediately
            this.createInstallButton();
            this.showInstallButton();
        });
        
        // Listen for the appinstalled event
        window.addEventListener('appinstalled', () => {
            console.log('PWA: App was installed');
            this.isInstalled = true;
            this.hideInstallButton();
            this.updateSettingsButtonStatus();
            this.deferredPrompt = null;
        });
        
        // Listen for service worker updates
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('PWA: Service worker updated');
                this.showUpdateNotification();
            });
        }
    }
    
    checkInstallStatus() {
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            console.log('PWA: App is running in standalone mode');
        }
        
        // Check if app is installed on iOS
        if (window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('PWA: App is installed on iOS');
        }
        
        // Update settings button status after checking
        this.updateSettingsButtonStatus();
    }
    
    createInstallButton() {
        // Check if install button already exists
        if (document.getElementById('install-button')) {
            this.installButton = document.getElementById('install-button');
            return;
        }
        
        // Create install button
        this.installButton = document.createElement('button');
        this.installButton.id = 'install-button';
        this.installButton.className = 'btn btn-primary install-btn';
        this.installButton.innerHTML = '📱 Install App';
        this.installButton.style.display = 'none';
        
        // Try to add to settings modal install container first
        let installContainer = document.getElementById('install-button-container');
        
        // If not on settings page, add to header controls
        if (!installContainer) {
            const headerControls = document.querySelector('.controls');
            if (headerControls) {
                installContainer = headerControls;
            }
        }
        
        if (installContainer) {
            installContainer.appendChild(this.installButton);
        }
        
        // Add click event
        this.installButton.addEventListener('click', () => {
            this.installApp();
        });
    }
    
    showInstallButton() {
        if (this.installButton && !this.isInstalled) {
            this.installButton.style.display = 'inline-block';
            this.installButton.classList.add('show');
        }
    }
    
    hideInstallButton() {
        if (this.installButton) {
            this.installButton.style.display = 'none';
            this.installButton.classList.remove('show');
        }
    }
    
    async installApp() {
        if (!this.deferredPrompt) {
            // Fallback for browsers that don't support the install prompt
            this.showManualInstallInstructions();
            return;
        }
        
        try {
            // Show the install prompt
            this.deferredPrompt.prompt();
            
            // Wait for the user to respond
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('PWA: User accepted the install prompt');
            } else {
                console.log('PWA: User dismissed the install prompt');
            }
            
            this.deferredPrompt = null;
        } catch (error) {
            console.error('PWA: Error during installation', error);
        }
    }
    
    showManualInstallInstructions() {
        const instructions = this.getManualInstallInstructions();
        alert(instructions);
    }
    
    getManualInstallInstructions() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (userAgent.includes('chrome')) {
            return 'To install this app:\n1. Click the three dots menu (⋮) in your browser\n2. Select "Install Blockdoku" or "Add to Home screen"';
        } else if (userAgent.includes('firefox')) {
            return 'To install this app:\n1. Click the three lines menu (☰) in your browser\n2. Select "Install" or "Add to Home screen"';
        } else if (userAgent.includes('safari')) {
            return 'To install this app:\n1. Tap the Share button (□↗) in Safari\n2. Select "Add to Home Screen"';
        } else if (userAgent.includes('edge')) {
            return 'To install this app:\n1. Click the three dots menu (⋯) in your browser\n2. Select "Apps" then "Install this site as an app"';
        } else {
            return 'To install this app, look for an "Install" or "Add to Home Screen" option in your browser menu.';
        }
    }
    
    showUpdateNotification() {
        // Create update notification
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <span>🔄 App Update Available</span>
                <button class="btn btn-sm" onclick="window.location.reload()">Update Now</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }
    
    // Check if PWA features are supported
    isPWASupported() {
        return 'serviceWorker' in navigator && 'PushManager' in window;
    }
    
    // Setup settings page install button
    setupSettingsButton() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeSettingsButton();
            });
        } else {
            this.initializeSettingsButton();
        }
    }
    
    initializeSettingsButton() {
        this.settingsInstallButton = document.getElementById('pwa-install-button');
        if (this.settingsInstallButton) {
            this.settingsInstallButton.addEventListener('click', () => {
                this.installApp();
            });
            this.updateSettingsButtonStatus();
        }
    }
    
    // Update settings button status
    updateSettingsButtonStatus() {
        if (!this.settingsInstallButton) return;
        
        const statusElement = document.getElementById('install-status');
        
        if (this.isInstalled) {
            this.settingsInstallButton.classList.add('installed');
            if (statusElement) {
                statusElement.textContent = 'Installed as PWA';
            }
        } else if (this.deferredPrompt) {
            this.settingsInstallButton.classList.remove('installed');
            if (statusElement) {
                statusElement.textContent = '';
            }
        } else {
            this.settingsInstallButton.classList.remove('installed');
            if (statusElement) {
                statusElement.textContent = 'Not available';
            }
        }
    }
    
    // Get PWA status
    getStatus() {
        return {
            isInstalled: this.isInstalled,
            canInstall: !!this.deferredPrompt,
            isPWASupported: this.isPWASupported(),
            isOnline: navigator.onLine
        };
    }
}
