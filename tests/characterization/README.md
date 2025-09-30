# Characterization Tests

These tests capture the **current behavior** of the system before refactoring to ensure no functionality is lost during architectural changes.

## Purpose

1. **Behavior Preservation**: Ensure refactoring doesn't change game logic
2. **Regression Detection**: Catch unintended changes immediately  
3. **Refactoring Safety**: Provide confidence when moving code
4. **Documentation**: Tests serve as living documentation of expected behavior

## Test Strategy

### 1. Golden Master Tests
- Capture complex interactions with known inputs/outputs
- Test entire game flows end-to-end
- Preserve exact behavior during refactoring

### 2. Component Characterization
- Test each component's current behavior before extraction
- Ensure extracted components behave identically
- Validate integration points remain unchanged

### 3. State Transition Tests
- Capture how game state changes in response to actions
- Ensure state management refactoring preserves transitions
- Test edge cases and error conditions

## Running Tests

```bash
# Run all characterization tests
npm run test:characterization

# Run specific test suite
npm run test:characterization -- --testNamePattern="GameEngine"

# Run with coverage
npm run test:characterization -- --coverage
```

## Test Organization

```
tests/characterization/
├── game-engine-characterization.test.js    # Core game logic behavior
├── ui-behavior-characterization.test.js    # UI interaction behavior  
├── state-management-characterization.test.js # State transitions
├── integration-characterization.test.js    # End-to-end workflows
└── fixtures/                              # Test data and scenarios
    ├── game-states.json
    ├── block-shapes.json
    └── test-scenarios.json
```

## Writing Characterization Tests

### Before Refactoring:
1. Identify the behavior to preserve
2. Create tests that capture current outputs for known inputs
3. Run tests to establish baseline
4. Commit tests before starting refactor

### During Refactoring:
1. Run tests frequently to catch regressions
2. Only change tests if behavior intentionally changes
3. Add new tests for new functionality
4. Keep old tests until refactor is complete

### After Refactoring:
1. All characterization tests should still pass
2. Add unit tests for new component boundaries
3. Add integration tests for new architecture
4. Archive characterization tests or convert to regression tests

