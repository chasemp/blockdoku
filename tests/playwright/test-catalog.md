# Blockdoku PWA - MCP Playwright Test Catalog

## 🎯 Overview

This catalog contains organized MCP Playwright test prompts for the Blockdoku PWA. You can ask me to run individual tests or groups of tests by referencing their IDs.

## 📋 Test Categories

### 🎨 Theme Testing
Tests for theme switching and synchronization across all pages.

#### `theme-basic`
**Test**: Basic theme switching functionality
**Prompt**: "Test basic theme switching on the Blockdoku PWA. Navigate to http://localhost:3456, go to settings, and test switching between wood, light, and dark themes. Verify each theme is applied correctly to the settings page."

#### `theme-sync`
**Test**: Theme synchronization between pages
**Prompt**: "Test theme synchronization across pages. Navigate to http://localhost:3456, go to settings, switch to light theme, then navigate to game settings and verify the theme is synchronized. Test with all three themes (wood, light, dark)."

#### `theme-persistence`
**Test**: Theme persistence during navigation
**Prompt**: "Test theme persistence during navigation. Navigate to http://localhost:3456, go to settings, switch to dark theme, navigate to game settings, then back to settings, then back to game. Verify the dark theme persists throughout all navigation."

### 🗺️ Navigation Testing
Tests for navigation between all pages and back button functionality.

#### `nav-basic`
**Test**: Basic navigation between pages
**Prompt**: "Test basic navigation on the Blockdoku PWA. Navigate to http://localhost:3456, go to settings, then to game settings, then back to settings, then back to game. Verify all navigation links work correctly."

#### `nav-back-buttons`
**Test**: Back button functionality
**Prompt**: "Test back button functionality. Navigate to http://localhost:3456, go to settings, then to game settings. Test both 'Back to Settings' and 'Back to Game' buttons. Verify they navigate to the correct pages."

#### `nav-complete-cycle`
**Test**: Complete navigation cycle
**Prompt**: "Test complete navigation cycle. Navigate to http://localhost:3456, go to settings, then to game settings, then back to settings, then back to game, then to settings again, then to game settings again. Verify all navigation works smoothly."

### 🎮 Game Functionality
Tests for game-specific functionality and state management.

#### `game-state-preservation`
**Test**: Game state preservation during navigation
**Prompt**: "Test game state preservation. Navigate to http://localhost:3456, place a few blocks, go to settings, then back to game. Verify the game state (blocks, score, level) is preserved."

#### `game-difficulty-switching`
**Test**: Difficulty switching functionality
**Prompt**: "Test difficulty switching. Navigate to http://localhost:3456, go to game settings, switch between easy, normal, hard, and expert difficulties. Verify the difficulty changes are applied and the game responds correctly."

#### `difficulty-defaults-easy`
**Test**: Easy difficulty game setting defaults
**Prompt**: "Test easy difficulty game setting defaults. Navigate to http://localhost:3456, go to game settings, switch to easy difficulty. Verify that easy difficulty defaults are applied (hints ON, show block points ON, personal best ON, speed mode bonus, etc.)."

#### `difficulty-defaults-normal`
**Test**: Normal difficulty game setting defaults
**Prompt**: "Test normal difficulty game setting defaults. Navigate to http://localhost:3456, go to game settings, switch to normal difficulty. Verify that normal difficulty defaults are applied (hints OFF, show block points OFF, personal best OFF, speed mode ignored, etc.)."

#### `difficulty-defaults-comprehensive`
**Test**: Comprehensive difficulty defaults testing
**Prompt**: "Test comprehensive difficulty defaults. Navigate to http://localhost:3456, go to game settings, switch to easy difficulty and verify easy defaults, then switch to normal difficulty and verify normal defaults, then switch to hard difficulty and verify hard defaults, then switch to expert difficulty and verify expert defaults. Test all difficulty levels in sequence on the same page."

#### `dual-difficulty-gamesettings-page`
**Test**: Difficulty changing via gamesettings page selector
**Prompt**: "Test difficulty changing via gamesettings page selector. Navigate to http://localhost:3456, go to game settings, click on difficulty selector buttons (Easy, Normal, Hard, Expert), then test changing between easy, normal, hard, and expert difficulties. Verify each difficulty change is applied correctly and console logs show the proper settings being applied."

#### `dual-difficulty-game-modal`
**Test**: Difficulty changing via game modal selector
**Prompt**: "Test difficulty changing via game modal selector. Navigate to http://localhost:3456, click on the difficulty button (e.g., 'Normal'), then test changing between easy, normal, hard, and expert difficulties in the modal. Verify each difficulty change is applied correctly and the modal closes properly."

#### `dual-difficulty-cross-consistency`
**Test**: Cross-avenue difficulty consistency verification
**Prompt**: "Test cross-avenue difficulty consistency. Navigate to http://localhost:3456, go to game settings, change difficulty to easy via gamesettings page, then go back to game and verify the difficulty button shows 'Easy'. Then change difficulty to hard via game modal, go back to game settings, and verify hard is selected. Test with all difficulty levels to ensure both selectors stay synchronized."

#### `dual-difficulty-unified-backend`
**Test**: Unified backend verification for both difficulty selectors
**Prompt**: "Test unified backend verification. Navigate to http://localhost:3456, change difficulty via gamesettings page, then change difficulty via game modal, and verify both selectors use the same backend system by checking console logs show identical difficulty management calls and settings application. Verify both selectors produce identical results and stay synchronized."

### 🔧 Settings Functionality
Tests for settings page functionality and persistence.

#### `settings-theme-selection`
**Test**: Theme selection on settings page
**Prompt**: "Test theme selection on settings page. Navigate to http://localhost:3456, go to settings, test all three theme options (wood, light, dark). Verify the theme changes are applied immediately and the UI updates correctly."

#### `settings-game-settings`
**Test**: Game settings page functionality
**Prompt**: "Test game settings page. Navigate to http://localhost:3456, go to settings, then to game settings. Test various game setting toggles and verify they work correctly. Test the back navigation."

#### `gamesettings-difficulty-selector`
**Test**: Gamesettings page difficulty selector functionality
**Prompt**: "Test gamesettings page difficulty selector. Navigate to http://localhost:3456, go to game settings, test the difficulty selector section with Easy, Normal, Hard, and Expert buttons. Verify each difficulty selection updates the settings correctly, shows proper difficulty-specific defaults, and updates the reset button text. Test that difficulty changes are applied to the main game when navigating back."

### 🚀 Performance Testing
Tests for performance, console health, and error detection.

#### `performance-load-times`
**Test**: Page load times and performance
**Prompt**: "Test page load times and performance. Navigate to http://localhost:3456, go to settings, then to game settings. Verify all pages load within 2 seconds and there are no performance issues."

#### `console-health`
**Test**: Console health and error detection
**Prompt**: "Test console health. Navigate to http://localhost:3456, go to settings, switch themes, navigate to game settings, and back. Check for any console errors or warnings during the entire process."

### 🎮 Player Gameplay Testing
Tests for actual gameplay scenarios and user workflows.

#### `player-beginner`
**Test**: Comprehensive beginner player gameplay test
**Prompt**: "Run comprehensive beginner player gameplay test. Start in normal mode, place blocks until getting a clearance and verify points awarded, place blocks to get a combo and verify combo and points, place blocks for another combo and confirm combo count shows cumulative (should be 2), do 'New Game' and verify board clears, move to Easy difficulty and verify combo/score/level reset, verify 'hint' appears in utility bar and 'enable hints' is checked, verify speed tracking mode is set to 'bonus', place 3 blocks and verify points for each including speed points."

### 🧪 Comprehensive Testing
Full test suites that combine multiple categories.

#### `comprehensive-theme-nav`
**Test**: Comprehensive theme and navigation testing
**Prompt**: "Run comprehensive theme and navigation testing. Navigate to http://localhost:3456, test all theme combinations (wood, light, dark) with complete navigation cycles (game → settings → game settings → settings → game). Verify theme synchronization, navigation functionality, and console health throughout."

#### `comprehensive-full`
**Test**: Full comprehensive test suite
**Prompt**: "Run the full comprehensive test suite for Blockdoku PWA. Test theme switching, navigation, game state preservation, settings functionality, performance, and console health. Cover all major user workflows and verify everything works correctly."

#### `comprehensive-dual-difficulty`
**Test**: Comprehensive dual difficulty selector testing
**Prompt**: "Run comprehensive dual difficulty selector testing. Test both gamesettings page and game modal difficulty selectors independently, verify cross-avenue consistency, test unified backend functionality, and ensure both selectors stay synchronized across all difficulty levels (easy, normal, hard, expert). Verify console logs show identical difficulty management calls and settings application."

#### `comprehensive-all-tests`
**Test**: Meta comprehensive test - runs ALL catalogued tests
**Prompt**: "Run the complete comprehensive test suite that executes ALL catalogued tests. This includes: theme-basic, theme-sync, theme-persistence, nav-basic, nav-back-buttons, nav-complete-cycle, game-state-preservation, game-difficulty-switching, difficulty-defaults-easy, difficulty-defaults-normal, difficulty-defaults-comprehensive, dual-difficulty-gamesettings-page, dual-difficulty-game-modal, dual-difficulty-cross-consistency, dual-difficulty-unified-backend, settings-theme-selection, settings-game-settings, gamesettings-difficulty-selector, performance-load-times, console-health, player-beginner. Execute each test systematically and provide a comprehensive report of all results."

## 🎯 Usage Examples

### Run Individual Tests
```
"Run the theme-basic test"
"Execute the nav-back-buttons test"
"Test the game-state-preservation functionality"
"Run the difficulty-defaults-easy test"
"Execute the difficulty-defaults-normal test"
"Test the difficulty-defaults-comprehensive functionality"
"Run the dual-difficulty-gamesettings-page test"
"Execute the dual-difficulty-game-modal test"
"Test the dual-difficulty-cross-consistency functionality"
"Run the dual-difficulty-unified-backend test"
"Run the gamesettings-difficulty-selector test"
"Run the player-beginner test"
```

### Run Test Groups
```
"Run all theme testing tests"
"Execute all navigation tests"
"Test all performance tests"
"Run all player gameplay tests"
```

### Run Comprehensive Tests
```
"Run the comprehensive-theme-nav test"
"Execute the comprehensive-full test suite"
"Run the comprehensive-dual-difficulty test"
"Run the comprehensive-all-tests test"
```

## 📊 Test Results

Each test will provide:
- ✅ **Pass/Fail status** for each step
- 📊 **Performance metrics** (load times, console health)
- 🚨 **Error detection** (console errors, navigation failures)
- 📈 **Success rate** and detailed reporting

## 🚨 Error Tracking

**Important**: MCP Playwright tests may encounter errors and issues during execution. All known issues are documented in [Test Issues & Error Tracking](./test-issues.md).

### Current Test Status
- **Total Tests**: 22
- **Currently Passing**: 5 (23%)
- **Known Issues**: 6 major issues affecting test reliability
- **Critical Blockers**: Navigation, block placement (difficulty switching partially fixed)

### Before Running Tests
1. **Check [test-issues.md](./test-issues.md)** for known problems
2. **Fix critical issues** before running comprehensive tests
3. **Expect some failures** until issues are resolved
4. **Report new issues** discovered during testing

## 🔧 Customization

### Adding New Tests
1. Add new test entries to the appropriate category
2. Include a unique ID and descriptive name
3. Write a clear, actionable prompt
4. Update this documentation

### Modifying Existing Tests
1. Update the prompt text
2. Adjust the test scope as needed
3. Update the documentation

## 📚 Related Documentation

- [PWA Lessons Learned](../../PWA_LESSONS_LEARNED.md) - Comprehensive lessons and best practices
- [Behavioral Tests](../behavioral/README.md) - Unit and integration tests
- [Characterization Tests](../characterization/README.md) - Performance and behavior tests
- [Test Issues & Error Tracking](./test-issues.md) - Known issues and error tracking for MCP Playwright tests
