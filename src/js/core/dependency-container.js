/**
 * Dependency Injection Container
 * Manages the 15+ manager dependencies in a testable, maintainable way
 */

export class DependencyContainer {
    constructor() {
        this.dependencies = new Map();
        this.singletons = new Map();
        this.instances = new Map();
    }

    /**
     * Register a dependency with its factory function
     * @param {string} name - Dependency name
     * @param {Function} factory - Factory function that creates the dependency
     * @param {boolean} singleton - Whether to create only one instance
     * @param {Array<string>} deps - Dependencies this factory needs
     */
    register(name, factory, singleton = false, deps = []) {
        this.dependencies.set(name, { 
            factory, 
            singleton, 
            deps,
            resolved: false
        });
    }

    /**
     * Resolve a dependency by name
     * @param {string} name - Dependency name
     * @returns {*} The resolved dependency instance
     */
    resolve(name) {
        // Return singleton if already created
        if (this.singletons.has(name)) {
            return this.singletons.get(name);
        }

        // Check if dependency is registered
        const dep = this.dependencies.get(name);
        if (!dep) {
            throw new Error(`Dependency '${name}' not registered`);
        }

        // Prevent circular dependencies
        if (this.instances.has(name)) {
            throw new Error(`Circular dependency detected: ${name}`);
        }

        // Mark as being resolved
        this.instances.set(name, true);

        try {
            // Resolve dependencies first
            const resolvedDeps = dep.deps.map(depName => this.resolve(depName));
            
            // Create instance
            const instance = dep.factory(this, ...resolvedDeps);
            
            // Store singleton if needed
            if (dep.singleton) {
                this.singletons.set(name, instance);
            }

            // Mark as resolved
            dep.resolved = true;
            
            return instance;
        } finally {
            // Remove from resolution stack
            this.instances.delete(name);
        }
    }

    /**
     * Check if a dependency is registered
     * @param {string} name - Dependency name
     * @returns {boolean}
     */
    has(name) {
        return this.dependencies.has(name);
    }

    /**
     * Get all registered dependency names
     * @returns {Array<string>}
     */
    getRegisteredNames() {
        return Array.from(this.dependencies.keys());
    }

    /**
     * Clear all dependencies (useful for testing)
     */
    clear() {
        this.dependencies.clear();
        this.singletons.clear();
        this.instances.clear();
    }

    /**
     * Create a child container that inherits from this one
     * @returns {DependencyContainer}
     */
    createChild() {
        const child = new DependencyContainer();
        
        // Copy dependencies but not instances
        this.dependencies.forEach((dep, name) => {
            child.dependencies.set(name, { ...dep });
        });
        
        return child;
    }

    /**
     * Register all the current Blockdoku managers
     * This provides a migration path from the current monolithic structure
     */
    registerBlockdokuDependencies() {
        // Core dependencies (no deps)
        this.register('canvas', () => document.getElementById('game-board'), true);
        this.register('canvasContext', (container) => {
            const canvas = container.resolve('canvas');
            return canvas?.getContext('2d') || null;
        }, true, ['canvas']);

        // Storage (no deps)
        this.register('gameStorage', () => {
            const { GameStorage } = require('../storage/game-storage.js');
            return new GameStorage();
        }, true);

        // Block system (no deps)
        this.register('blockManager', () => {
            const { BlockManager } = require('../game/blocks.js');
            return new BlockManager();
        }, true);

        // Game feature managers (no deps)
        this.register('petrificationManager', () => {
            const { PetrificationManager } = require('../game/petrification-manager.js');
            return new PetrificationManager();
        }, true);

        this.register('deadPixelsManager', () => {
            const { DeadPixelsManager } = require('../game/dead-pixels-manager.js');
            return new DeadPixelsManager();
        }, true);

        // Difficulty system (no deps)
        this.register('difficultyManager', () => {
            const { DifficultyManager } = require('../difficulty/difficulty-manager.js');
            return new DifficultyManager();
        }, true);

        // Scoring system (depends on petrification and difficulty)
        this.register('scoringSystem', (container) => {
            const { ScoringSystem } = require('../game/scoring.js');
            const petrificationManager = container.resolve('petrificationManager');
            const difficultyManager = container.resolve('difficultyManager');
            return new ScoringSystem(petrificationManager, difficultyManager);
        }, true, ['petrificationManager', 'difficultyManager']);

        // Effects system (depends on canvas)
        this.register('effectsManager', (container) => {
            const { EffectsManager } = require('../effects/effects-manager.js');
            const canvas = container.resolve('canvas');
            const ctx = container.resolve('canvasContext');
            return new EffectsManager(canvas, ctx);
        }, true, ['canvas', 'canvasContext']);

        // UI components (depend on managers and game)
        this.register('confirmationDialog', () => {
            const { ConfirmationDialog } = require('../ui/confirmation-dialog.js');
            return new ConfirmationDialog();
        }, true);

        // Difficulty-dependent systems
        this.register('timerSystem', (container) => {
            const { TimerSystem } = require('../difficulty/timer-system.js');
            const difficultyManager = container.resolve('difficultyManager');
            return new TimerSystem(difficultyManager);
        }, true, ['difficultyManager']);

        // PWA managers (no deps)
        this.register('pwaInstallManager', () => {
            const { PWAInstallManager } = require('../pwa/install.js');
            return new PWAInstallManager();
        }, true);

        this.register('offlineManager', () => {
            const { OfflineManager } = require('../pwa/offline.js');
            return new OfflineManager();
        }, true);
    }
}

/**
 * Create a test container with mock dependencies
 * @returns {DependencyContainer}
 */
export function createTestContainer() {
    const container = new DependencyContainer();
    
    // Register mock dependencies for testing
    container.register('canvas', () => ({
        getContext: () => ({
            fillRect: () => {},
            strokeRect: () => {},
            clearRect: () => {},
            save: () => {},
            restore: () => {}
        }),
        width: 400,
        height: 400
    }), true);
    
    container.register('gameStorage', () => ({
        loadSettings: () => ({ theme: 'wood', difficulty: 'normal' }),
        saveSettings: () => {},
        loadGameState: () => null,
        saveGameState: () => {}
    }), true);
    
    return container;
}

/**
 * Global container instance for the application
 * This provides a migration path while refactoring
 */
export const globalContainer = new DependencyContainer();
