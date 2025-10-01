# MCP Playwright Test Instructions for Blockdoku PWA

## 🎯 Test Overview
This document provides step-by-step instructions for testing Blockdoku PWA using MCP Playwright. The tests cover theme switching and navigation functionality.

## 🚀 Prerequisites
- Development server running at `http://localhost:3456`
- MCP Playwright tools available
- Browser ready for testing

---

## 📋 THEME TESTING INSTRUCTIONS

### Test 1: Basic Theme Switching
1. **Navigate to game page**: `http://localhost:3456`
2. **Verify wood theme**: Page should show dark wood background
3. **Click Settings button** (⚙️)
4. **Verify settings page**: Should load with wood theme maintained
5. **Click Light theme button**
6. **Verify light theme**: Page should show light background
7. **Click Game Settings link**
8. **Verify theme sync**: Game settings page should show light theme
9. **Click Back to Settings**
10. **Verify theme maintained**: Settings page should still show light theme

### Test 2: Theme Synchronization
1. **Click Dark theme button**
2. **Verify dark theme**: Page should show dark background
3. **Click Game Settings link**
4. **Verify theme sync**: Game settings page should show dark theme
5. **Click Back to Settings**
6. **Verify theme maintained**: Settings page should still show dark theme
7. **Click Wood theme button**
8. **Verify wood theme**: Page should show wood background
9. **Click Game Settings link**
10. **Verify theme sync**: Game settings page should show wood theme

---

## 🗺️ NAVIGATION TESTING INSTRUCTIONS

### Test 3: Basic Navigation Flow
1. **Start at game page**: `http://localhost:3456`
2. **Click Settings button** (⚙️)
3. **Verify settings page loads**: Should show settings interface
4. **Click Game Settings link**
5. **Verify game settings page loads**: Should show game settings interface
6. **Click Back to Settings**
7. **Verify settings page loads**: Should return to settings
8. **Click Back to Game** (top button)
9. **Verify game page loads**: Should return to game

### Test 4: Alternative Navigation Paths
1. **Start at game page**
2. **Click Settings button** (⚙️)
3. **Click Game Settings link**
4. **Click Back to Game** (top button)
5. **Verify game page loads**: Should return to game
6. **Click Settings button** (⚙️)
7. **Click Game Settings link**
8. **Click Back to Game** (bottom button)
9. **Verify game page loads**: Should return to game

### Test 5: Complete Navigation Cycle
1. **Start at game page**
2. **Navigate to Settings**: Click Settings button
3. **Navigate to Game Settings**: Click Game Settings link
4. **Navigate back to Settings**: Click Back to Settings
5. **Navigate back to Game**: Click Back to Game
6. **Verify complete cycle**: Should end up at game page

---

## 🔍 VALIDATION CHECKLIST

### Theme Testing Validation
- [ ] Wood theme displays correctly on all pages
- [ ] Light theme displays correctly on all pages
- [ ] Dark theme displays correctly on all pages
- [ ] Theme changes propagate immediately between pages
- [ ] No theme flashing or inconsistent styling
- [ ] Theme persists during navigation

### Navigation Testing Validation
- [ ] Game → Settings navigation works
- [ ] Settings → Game Settings navigation works
- [ ] Game Settings → Settings back navigation works
- [ ] Settings → Game back navigation works
- [ ] Game Settings → Game back navigation works (both buttons)
- [ ] All navigation completes within 2 seconds
- [ ] No broken links or navigation errors
- [ ] Game state preserved during navigation

### Performance Validation
- [ ] All pages load within 2 seconds
- [ ] No JavaScript console errors
- [ ] Smooth transitions between pages
- [ ] Stable performance during rapid navigation
- [ ] Consistent behavior across all navigation paths

---

## 🚨 EXPECTED RESULTS

### Success Criteria
- ✅ All theme changes should be visible and consistent across pages
- ✅ All navigation links should work without errors
- ✅ No console errors should appear during testing
- ✅ All pages should load within 2 seconds
- ✅ Theme should remain consistent during navigation
- ✅ Game state should be preserved during navigation

### Failure Indicators
- ❌ Theme inconsistencies between pages
- ❌ Navigation links that don't work
- ❌ Console errors during testing
- ❌ Pages that take longer than 2 seconds to load
- ❌ Theme flashing or inconsistent styling
- ❌ Lost game state during navigation

---

## 📊 TEST EXECUTION NOTES

### Console Messages to Look For
- `[LOG] Client-side theme update: [theme]`
- `[LOG] Loading theme from storage: [theme]`
- `[LOG] App.js applying theme: [theme]`
- `[LOG] Settings button clicked - navigating to settings page`
- `[LOG] Game state saved successfully`

### Visual Indicators
- **Wood Theme**: Dark wood background with brown tones
- **Light Theme**: Light background with clean, bright appearance
- **Dark Theme**: Dark background with dark theme styling
- **Navigation**: Smooth transitions between pages
- **Loading**: Fast page loads without delays

### Error Indicators
- Console errors or warnings
- Broken navigation links
- Theme inconsistencies
- Slow page loading
- Lost game state

---

## 🔄 REPEAT TESTING

### For Regression Testing
1. Run all theme tests after any theme-related changes
2. Run all navigation tests after any navigation-related changes
3. Run complete test suite before major releases
4. Run focused tests after specific bug fixes

### For Performance Testing
1. Test with different themes active
2. Test rapid navigation between pages
3. Test theme changes during navigation
4. Test with game state active

---

## 📝 TEST REPORTING

### Document Results
- Note any failures or issues
- Record performance metrics
- Document console errors
- Note visual inconsistencies
- Record navigation problems

### Report Format
```
Test Date: [DATE]
Test Duration: [DURATION]
Overall Status: [PASS/FAIL]
Tests Passed: [X/Y]
Issues Found: [LIST]
Recommendations: [LIST]
```
