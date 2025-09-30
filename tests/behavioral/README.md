# Blockdoku PWA - Behavioral Tests

High-level user workflow and regression testing suite designed to catch breaking changes without getting bogged down in unit test details.

## 🎯 Purpose

This test suite focuses on:
- **Critical user workflows** (game play, settings, storage)
- **Regression scenarios** (bugs that have occurred before)
- **Cross-component integration** (settings sync, state management)
- **PWA functionality** (offline storage, service workers)

## 🧪 Test Categories

### Critical Regression Tests
- ✅ **Theme Change Preserves Difficulty** - Prevents the bug where changing themes reset difficulty to normal
- ✅ **Settings Sync Between Pages** - Ensures main game and settings page stay synchronized

### Core Functionality
- ✅ **Settings Persistence** - Theme, difficulty, sound preferences save/load correctly
- ✅ **Game State Persistence** - Score, board state, current blocks save/load correctly
- ✅ **Difficulty Manager** - All difficulty modes work correctly
- ✅ **Hints System** - Hints only available in Easy mode

### Game Mechanics
- ✅ **Block Generation** - New blocks generate correctly
- ✅ **Block Rotation** - Block shapes rotate properly
- ✅ **Basic Scoring** - Points calculated correctly
- ✅ **Line Clear Detection** - Full rows/columns/squares detected

### PWA Features
- ✅ **Service Worker Setup** - PWA registration works
- ✅ **Offline Storage** - Game works without network

### UI State Management
- ✅ **Game Initialization** - Game starts in correct state
- ✅ **Theme Application** - Visual themes apply correctly

## 🚀 Running Tests

### Command Line (Node.js)
```bash
npm run test:behavioral
```

### Browser (Visual)
```bash
npm run dev
# Then open: http://localhost:3456/tests/behavioral/test-runner.html
```

## 📊 Test Output

```
🧪 Running 14 behavioral tests...

🔍 Testing: Settings: Theme change preserves difficulty (REGRESSION)
✅ PASS: Settings: Theme change preserves difficulty (REGRESSION)

🔍 Testing: Settings: Difficulty sync between pages
✅ PASS: Settings: Difficulty sync between pages

...

📊 TEST RESULTS:
✅ Passed: 14
❌ Failed: 0
📈 Success Rate: 100%
```

## 🔧 Adding New Tests

1. **Add test to `blockdoku-tests.js`:**
```javascript
this.runner.addTest(
    'Your Test Name',
    () => this.testYourFeature()
);
```

2. **Implement test method:**
```javascript
async testYourFeature() {
    // Setup
    const component = new YourComponent();
    
    // Action
    component.doSomething();
    
    // Assert
    this.runner.assertEqual(
        component.result, 
        expectedValue, 
        'Should do something correctly'
    );
}
```

## 🎯 When to Add Tests

**Always add tests for:**
- 🐛 **Bugs you fix** - Prevent regressions
- 🔄 **Cross-component workflows** - Settings sync, state management
- 💾 **Data persistence** - Storage, save/load functionality
- 🎮 **Core game mechanics** - Scoring, block placement, line clearing

**Don't add tests for:**
- 🎨 **Pure UI styling** - Visual appearance changes
- 📝 **Simple getters/setters** - Trivial property access
- 🔧 **Internal implementation details** - Private methods, helpers

## 🏗️ Architecture

- **`test-runner.js`** - Test framework with assertions and mocking
- **`blockdoku-tests.js`** - All behavioral tests for the game
- **`run-tests.js`** - Command-line test runner
- **`test-runner.html`** - Browser-based test runner with UI

## 🚨 Regression Prevention

This suite specifically tests for these past issues:
1. **Theme changes resetting difficulty** - Fixed in commit 85316ba
2. **Settings not syncing between pages** - Ongoing prevention
3. **Game state not persisting** - Storage reliability
4. **PWA features breaking** - Service worker and offline functionality

The tests run quickly (~5 seconds) and provide high confidence in core functionality.
