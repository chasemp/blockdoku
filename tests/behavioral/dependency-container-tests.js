/**
 * Dependency Container Tests
 * Tests for the new dependency injection system
 */

import { BehavioralTestRunner } from './test-runner.js';
import { DependencyContainer, createTestContainer } from '../../src/js/core/dependency-container.js';

class DependencyContainerTests {
    constructor() {
        this.runner = new BehavioralTestRunner();
        this.setupTests();
    }

    setupTests() {
        this.runner.addTest(
            'DI Container: Basic registration and resolution',
            () => this.testBasicRegistrationAndResolution()
        );

        this.runner.addTest(
            'DI Container: Singleton behavior',
            () => this.testSingletonBehavior()
        );

        this.runner.addTest(
            'DI Container: Dependency resolution with deps',
            () => this.testDependencyResolution()
        );

        this.runner.addTest(
            'DI Container: Circular dependency detection',
            () => this.testCircularDependencyDetection()
        );

        this.runner.addTest(
            'DI Container: Test container creation',
            () => this.testTestContainerCreation()
        );

        this.runner.addTest(
            'DI Container: Child container inheritance',
            () => this.testChildContainerInheritance()
        );
    }

    async testBasicRegistrationAndResolution() {
        const container = new DependencyContainer();
        
        // Register a simple dependency
        container.register('testService', () => ({ name: 'TestService', value: 42 }));
        
        // Resolve it
        const service = container.resolve('testService');
        
        this.runner.assertEqual(service.name, 'TestService', 'Service should have correct name');
        this.runner.assertEqual(service.value, 42, 'Service should have correct value');
    }

    async testSingletonBehavior() {
        const container = new DependencyContainer();
        
        // Register as singleton
        container.register('singleton', () => ({ id: Math.random() }), true);
        
        // Resolve twice
        const instance1 = container.resolve('singleton');
        const instance2 = container.resolve('singleton');
        
        this.runner.assertEqual(instance1.id, instance2.id, 'Singleton should return same instance');
        this.runner.assert(instance1 === instance2, 'Singleton should be same object reference');
    }

    async testDependencyResolution() {
        const container = new DependencyContainer();
        
        // Register dependencies
        container.register('database', () => ({ connected: true }), true);
        container.register('userService', (container) => {
            const db = container.resolve('database');
            return { database: db, users: [] };
        }, false, ['database']);
        
        // Resolve service with dependency
        const userService = container.resolve('userService');
        
        this.runner.assert(userService.database.connected, 'Dependency should be injected');
        this.runner.assert(Array.isArray(userService.users), 'Service should be properly initialized');
    }

    async testCircularDependencyDetection() {
        const container = new DependencyContainer();
        
        // Register circular dependencies
        container.register('serviceA', (container) => {
            const serviceB = container.resolve('serviceB');
            return { name: 'A', serviceB };
        }, false, ['serviceB']);
        
        container.register('serviceB', (container) => {
            const serviceA = container.resolve('serviceA');
            return { name: 'B', serviceA };
        }, false, ['serviceA']);
        
        // Should throw circular dependency error
        this.runner.assertThrows(() => {
            container.resolve('serviceA');
        }, 'Should detect circular dependency');
    }

    async testTestContainerCreation() {
        const testContainer = createTestContainer();
        
        // Should have mock dependencies
        this.runner.assert(testContainer.has('canvas'), 'Test container should have canvas mock');
        this.runner.assert(testContainer.has('gameStorage'), 'Test container should have storage mock');
        
        // Should resolve mocks correctly
        const canvas = testContainer.resolve('canvas');
        const storage = testContainer.resolve('gameStorage');
        
        this.runner.assert(canvas.getContext, 'Canvas mock should have getContext method');
        this.runner.assert(storage.loadSettings, 'Storage mock should have loadSettings method');
    }

    async testChildContainerInheritance() {
        const parent = new DependencyContainer();
        parent.register('parentService', () => ({ name: 'Parent' }), true);
        
        const child = parent.createChild();
        child.register('childService', (container) => {
            const parent = container.resolve('parentService');
            return { name: 'Child', parent };
        }, false, ['parentService']);
        
        // Child should resolve both parent and child services
        const childService = child.resolve('childService');
        
        this.runner.assertEqual(childService.name, 'Child', 'Child service should be resolved');
        this.runner.assertEqual(childService.parent.name, 'Parent', 'Parent service should be inherited');
    }

    async runTests() {
        return await this.runner.runAllTests();
    }
}

export { DependencyContainerTests };
