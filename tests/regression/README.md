# Blockdoku PWA - Regression Testing Suite

Comprehensive testing system to prevent critical theme and navigation issues from being introduced during refactoring.

## 🎯 Purpose

This testing suite specifically targets the most common regression issues we've encountered:

- **Theme synchronization** between pages (index, settings, gamesettings)
- **Navigation functionality** (back buttons, page links)
- **Cross-page communication** (theme changes, settings sync)
- **Default behavior consistency** (theme defaults, difficulty defaults)

## 🚨 Critical Regression Tests

### Theme Tests
- ✅ **All pages respect theme changes** - Ensures index, settings, and gamesettings pages all apply themes correctly
- ✅ **Gamesettings page theme synchronization** - Prevents gamesettings from being stuck on default theme
- ✅ **Default theme consistency after clearing data** - Ensures all pages default to wood theme when localStorage is cleared

### Navigation Tests  
- ✅ **Back buttons work between all pages** - Tests all back button combinations
- ✅ **Settings page links work correctly** - Ensures Game Settings and Back to Game links function
- ✅ **Cross-page theme changes trigger updates** - Verifies theme changes propagate between pages

### Settings Tests
- ✅ **Theme change preserves difficulty** - Prevents theme changes from resetting difficulty
- ✅ **Difficulty sync between pages** - Ensures difficulty changes sync across all pages

## 🚀 Running Tests

### Pre-commit (Automatic)
Tests run automatically before every commit via Git pre-commit hook:
```bash
git commit -m "Your commit message"
# Tests run automatically, commit blocked if they fail
```

### Manual Testing
```bash
# Run only critical regression tests
npm run test:critical

# Run all behavioral tests (includes regression tests)
npm run test:behavioral

# Run comprehensive regression test suite
npm run test:regression

# Run all tests including characterization
npm run test:regression:all
```

### Browser Testing
```bash
npm run dev
# Open: http://localhost:3456/tests/behavioral/test-runner.html
```

## 📊 Test Output

```
🔍 Running critical regression tests before commit...

🧪 Running 20 behavioral tests...

🔍 Testing: Settings: Theme change preserves difficulty (REGRESSION)
✅ PASS: Settings: Theme change preserves difficulty (REGRESSION)

🔍 Testing: Theme: All pages respect theme changes (REGRESSION)
✅ PASS: Theme: All pages respect theme changes (REGRESSION)

...

📊 TEST RESULTS:
✅ Passed: 20
❌ Failed: 0
📈 Success Rate: 100%

📊 CRITICAL REGRESSION TEST RESULTS:
✅ All critical regression tests passed!
📈 Success Rate: 100%

✅ All critical regression tests passed! Commit allowed.
```

## 🔧 Adding New Regression Tests

When you fix a theme or navigation bug, add a test to prevent it from happening again:

1. **Add test to `tests/behavioral/blockdoku-tests.js`:**
```javascript
this.runner.addTest(
    'Your Bug: Description (REGRESSION)',
    () => this.testYourBugFix()
);
```

2. **Implement test method:**
```javascript
async testYourBugFix() {
    // Mock the scenario that caused the bug
    const mockSystem = {
        // Setup conditions that led to the bug
    };
    
    // Test the fix
    const result = mockSystem.yourFix();
    
    // Assert the fix works
    this.runner.assertEqual(result, expectedValue, 'Bug should be fixed');
}
```

3. **Add to critical tests list in `scripts/pre-commit-tests.js`:**
```javascript
this.criticalTests = [
    // ... existing tests
    'Your Bug: Description (REGRESSION)'
];
```

## 🎯 When to Add Tests

**Always add regression tests for:**
- 🐛 **Theme synchronization bugs** - Pages not respecting theme changes
- 🔗 **Navigation bugs** - Back buttons or links not working
- 🔄 **Cross-page communication bugs** - Settings not syncing between pages
- 🎨 **Default behavior bugs** - Wrong defaults after clearing data
- 📱 **PWA functionality bugs** - Service worker or offline issues

**Don't add regression tests for:**
- 🎨 **Pure visual styling** - CSS appearance changes
- 📝 **Simple refactoring** - Code reorganization without behavior change
- 🔧 **Internal implementation** - Private methods or helpers

## 🏗️ Architecture

- **`tests/behavioral/blockdoku-tests.js`** - All behavioral and regression tests
- **`scripts/pre-commit-tests.js`** - Pre-commit hook runner (critical tests only)
- **`scripts/run-regression-tests.js`** - Comprehensive regression test runner
- **`.git/hooks/pre-commit`** - Git pre-commit hook (runs critical tests)
- **`package.json`** - Test scripts and commands

## 🚨 Pre-commit Hook

The Git pre-commit hook automatically runs critical regression tests before every commit:

- **Runs:** Only the most critical tests (8 tests, ~2 seconds)
- **Blocks commits:** If any critical test fails
- **Shows output:** Clear pass/fail status with error details
- **Fast feedback:** Developers know immediately if they broke something

## 🔄 CI/CD Integration

For continuous integration, use the comprehensive test runner:

```bash
# In your CI pipeline
npm run test:regression:all
```

This runs all tests including characterization tests for maximum coverage.

## 📈 Success Metrics

- **Pre-commit tests:** Should run in < 5 seconds
- **Critical tests:** 8 tests covering most common regressions
- **All tests:** 20+ tests covering comprehensive functionality
- **Success rate:** Target 100% pass rate for all commits

## 🐛 Common Issues Prevented

This test suite specifically prevents these recurring issues:

1. **Gamesettings page stuck on wood theme** - Fixed multiple times
2. **Back buttons not working** - Navigation between pages broken
3. **Theme changes not syncing** - Pages showing different themes
4. **Settings not persisting** - User preferences lost
5. **Default themes inconsistent** - Different defaults after clearing data
6. **Cross-page communication broken** - Changes not propagating between pages

The tests use mocking to simulate these scenarios without requiring a full browser environment, making them fast and reliable.
