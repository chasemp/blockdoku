/**
 * Blockdoku PWA - Confirmation Dialog
 * A themed confirmation dialog for important actions
 */

export class ConfirmationDialog {
    constructor() {
        this.container = null;
        this.resolve = null;
        this.reject = null;
        this.initialized = false;
    }
    
    init() {
        if (!this.initialized) {
            this.createDialog();
            this.setupEventListeners();
            this.initialized = true;
        }
    }
    
    createDialog() {
        // Create dialog container
        this.container = document.createElement('div');
        this.container.className = 'confirmation-dialog-overlay';
        this.container.innerHTML = `
            <div class="confirmation-dialog">
                <div class="confirmation-header">
                    <h3 class="confirmation-title">⚠️ Confirm Action</h3>
                </div>
                <div class="confirmation-content">
                    <p class="confirmation-message">This action will reset your current game. Are you sure you want to continue?</p>
                </div>
                <div class="confirmation-actions">
                    <button class="confirmation-btn confirmation-cancel">Cancel</button>
                    <button class="confirmation-btn confirmation-confirm">Confirm</button>
                </div>
            </div>
        `;
        
        // Add styles
        this.addStyles();
        
        // Add to document
        document.body.appendChild(this.container);
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .confirmation-dialog-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 2000;
                backdrop-filter: blur(5px);
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .confirmation-dialog-overlay.show {
                opacity: 1;
            }
            
            .confirmation-dialog {
                background: var(--card-bg, #ffffff);
                border: 2px solid var(--border-color, #e0e0e0);
                border-radius: 15px;
                padding: 0;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                transform: scale(0.9);
                transition: transform 0.3s ease;
                overflow: hidden;
            }
            
            .confirmation-dialog-overlay.show .confirmation-dialog {
                transform: scale(1);
            }
            
            .confirmation-header {
                background: var(--primary-color, #007bff);
                color: white;
                padding: 1.5rem;
                text-align: center;
            }
            
            .confirmation-title {
                margin: 0;
                font-size: 1.3rem;
                font-weight: 600;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }
            
            .confirmation-content {
                padding: 2rem 1.5rem;
                text-align: center;
            }
            
            .confirmation-message {
                margin: 0;
                font-size: 1rem;
                color: var(--text-color, #333);
                line-height: 1.5;
            }
            
            .confirmation-actions {
                display: flex;
                gap: 1rem;
                padding: 1.5rem;
                background: var(--header-bg, #f8f9fa);
                border-top: 1px solid var(--border-color, #e0e0e0);
            }
            
            .confirmation-btn {
                flex: 1;
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .confirmation-cancel {
                background: var(--secondary-color, #6c757d);
                color: white;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }
            
            .confirmation-cancel:hover {
                background: var(--secondary-hover, #545b62);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            .confirmation-confirm {
                background: var(--primary-color, #007bff);
                color: white;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }
            
            .confirmation-confirm:hover {
                background: var(--primary-hover, #0056b3);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
            }
            
            @media (max-width: 480px) {
                .confirmation-dialog {
                    margin: 1rem;
                    width: calc(100% - 2rem);
                }
                
                .confirmation-header {
                    padding: 1rem;
                }
                
                .confirmation-title {
                    font-size: 1.1rem;
                }
                
                .confirmation-content {
                    padding: 1.5rem 1rem;
                }
                
                .confirmation-actions {
                    padding: 1rem;
                    flex-direction: column;
                }
                
                .confirmation-btn {
                    padding: 0.875rem 1rem;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    setupEventListeners() {
        // Cancel button
        this.container.querySelector('.confirmation-cancel').addEventListener('click', () => {
            this.hide(false);
        });
        
        // Confirm button
        this.container.querySelector('.confirmation-confirm').addEventListener('click', () => {
            this.hide(true);
        });
        
        // Click outside to cancel
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.hide(false);
            }
        });
        
        // Escape key to cancel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.container.classList.contains('show')) {
                this.hide(false);
            }
        });
    }
    
    show(message = 'This action will reset your current game. Are you sure you want to continue?') {
        // Initialize if not already done
        this.init();
        
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            
            // Update message
            this.container.querySelector('.confirmation-message').textContent = message;
            
            // Show dialog
            this.container.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
    }
    
    hide(confirmed) {
        this.container.classList.remove('show');
        document.body.style.overflow = '';
        
        // Resolve promise
        if (this.resolve) {
            this.resolve(confirmed);
            this.resolve = null;
            this.reject = null;
        }
    }
    
    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}
