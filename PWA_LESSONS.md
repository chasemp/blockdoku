# PWA Development Lessons Learned

## 🚀 Key Insights from Blockdoku PWA Development

> **📚 For comprehensive lessons learned including theme management, navigation, regression testing, and MCP Playwright testing strategies, see [PWA_LESSONS_LEARNED.md](./PWA_LESSONS_LEARNED.md)**

## 🎯 Quick Reference

### 🧪 **MCP Playwright Testing Strategy**

**The Problem:** Manual testing is time-consuming, error-prone, and misses subtle cross-page synchronization issues.

**The Solution:** MCP Playwright provides human-readable, executable test instructions that can be run consistently and comprehensively.

**Key Benefits:**
- **Human-Readable:** Clear, step-by-step instructions anyone can follow
- **Comprehensive:** Covers all critical functionality in one test suite
- **Reusable:** Can be run anytime to verify app functionality
- **Regression Prevention:** Catches issues before they reach production

**Quick Start:**
```bash
# Run test instructions
npm run test:e2e

# View detailed instructions
npm run test:e2e:instructions
```

**Test Coverage:**
- Theme switching and synchronization across all pages
- Navigation between all page combinations
- Performance validation (load times, console health)
- Game state preservation during navigation

> **📚 For detailed MCP Playwright implementation and best practices, see [PWA_LESSONS_LEARNED.md](./PWA_LESSONS_LEARNED.md#-mcp-playwright-testing-strategy)**

---

### 📚 **Module Loading: Static vs Dynamic Imports**

#### **The Problem**
- **Static imports** (`import { Module } from '/path'`) load immediately when the module is parsed
- **Dynamic imports** (`import('/path')`) load asynchronously when called
- **Critical Issue**: Static imports can prevent entire modules from loading if there are path errors

#### **What We Learned**
```javascript
// ❌ PROBLEMATIC - Static import fails silently, breaks entire module
import { PWAInstallManager } from '/js/pwa/install.js'; // Wrong path!

// ✅ WORKING - Dynamic import loads successfully
import('/js/pwa/install.js').then(module => {
    // Handle loaded module
});
```

#### **Best Practices**
1. **Use static imports** for core dependencies that must be available immediately
2. **Use dynamic imports** for optional features, PWA modules, or lazy-loaded content
3. **Always verify import paths** - static import failures are silent and hard to debug
4. **Test both import types** during development to catch path issues early

---

### 📱 **Mobile-First Design Principles**

#### **Pages vs Modals: When to Use Each**

##### **Use Pages When:**
- ✅ **Complex content** (settings with multiple sections)
- ✅ **Mobile-first** (better touch experience)
- ✅ **Navigation between related features** (settings, high scores, etc.)
- ✅ **Content that needs scrolling** (long lists, detailed forms)
- ✅ **User expects to "go somewhere"** (settings, help, about)

##### **Use Modals When:**
- ✅ **Simple confirmations** (delete, save, etc.)
- ✅ **Quick actions** (share, copy, etc.)
- ✅ **Overlay content** (previews, quick forms)
- ✅ **Desktop-focused** (mouse hover interactions)
- ✅ **Temporary content** (loading states, notifications)

#### **Our Experience**
- **Settings Modal**: ❌ Too complex, poor mobile UX, hard to navigate
- **Settings Page**: ✅ Clean navigation, mobile-friendly, easy to use

---

### 🎮 **Game-Specific Mobile Optimizations**

#### **Space Efficiency**
```css
/* Hide obvious text on mobile */
@media (max-width: 768px) {
    .block-palette h3 {
        display: none; /* "Available Blocks" is obvious */
    }
}
```

#### **Touch-Friendly Design**
- **Minimum 44px touch targets** (Apple HIG recommendation)
- **Adequate spacing** between interactive elements
- **Larger buttons** on mobile vs desktop
- **Grid layouts** for consistent spacing

#### **Canvas Sizing Strategy**
```css
/* Responsive canvas sizing */
@media (max-width: 768px) {
    .game-board-container {
        width: 280px;
        height: 280px;
        max-width: 90vw;
        max-height: 90vw;
        margin: 0 auto;
    }
}

@media (max-width: 480px) {
    .game-board-container {
        width: 240px;
        height: 240px;
        max-width: 85vw;
        max-height: 85vw;
    }
}
```

---

### 🔧 **PWA-Specific Issues & Solutions**

#### **Service Worker Registration**
```javascript
// ✅ Correct path resolution
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/public/sw.js')
        .then(registration => console.log('SW registered'))
        .catch(error => console.log('SW registration failed'));
}
```

#### **Manifest File Paths**
```json
{
    "icons": [
        {
            "src": "/public/icons/icon-192x192.png", // ✅ Absolute paths
            "sizes": "192x192",
            "type": "image/png"
        }
    ]
}
```

#### **Duplicate Button Prevention**
```javascript
// ✅ Check for existing elements before creating
createInstallButton() {
    if (document.getElementById('install-button')) {
        this.installButton = document.getElementById('install-button');
        return;
    }
    // Create new button...
}
```

---

### 📱 **Mobile Touch Event Handling**

#### **The Critical Problem**
- **`click` events don't work reliably on mobile** - especially for custom UI elements
- **Touch events are different from mouse events** - require different handling
- **`passive: true` prevents `preventDefault()`** - breaking touch interactions
- **Desktop functionality must be preserved** - can't break existing mouse interactions

#### **The Solution: Dual Event Handling**
```javascript
// ❌ PROBLEMATIC - Only works on desktop
button.addEventListener('click', handleClick);

// ✅ WORKING - Works on both desktop and mobile
const handleClick = () => {
    // Your click logic here
    this.effectsManager.onButtonClick();
    this.performAction();
};

button.addEventListener('click', handleClick);  // Desktop
button.addEventListener('touchstart', (e) => {  // Mobile
    e.preventDefault();
    handleClick();  // Same function!
}, { passive: false });
```

#### **Key Configuration Requirements**
```javascript
// ✅ Correct touch event setup
element.addEventListener('touchstart', (e) => {
    e.preventDefault();  // Prevent default touch behavior
    handleAction();      // Call same handler as click
}, { passive: false }); // Allow preventDefault to work
```

#### **What We Learned**
1. **Always add `touchstart` alongside `click`** - don't replace, add
2. **Use `passive: false`** - enables `preventDefault()` for custom behavior
3. **Call the same handler function** - ensures consistent behavior
4. **Test on actual mobile devices** - emulation isn't always accurate
5. **Touch targets need minimum 44px** - Apple HIG recommendation

#### **Elements That Need Touch Support**
- ✅ **Buttons** (settings, new game, difficulty, hint)
- ✅ **Interactive cards** (block palette items, difficulty options)
- ✅ **Navigation items** (settings page navigation)
- ✅ **Modal controls** (close buttons, confirmations)
- ✅ **Canvas interactions** (already handled separately)

#### **CSS Touch Optimizations**
```css
/* Ensure proper touch targets */
@media (max-width: 768px) {
    button, .nav-item, .theme-option, .difficulty-option {
        min-height: 44px;
        min-width: 44px;
        touch-action: manipulation; /* Optimize touch scrolling */
    }
    
    .block-item {
        touch-action: manipulation;
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
    }
}
```

#### **Common Mistakes to Avoid**
- ❌ **Only using `click` events** - won't work on mobile
- ❌ **Using `passive: true`** - prevents custom touch behavior
- ❌ **Different handlers for touch vs click** - creates inconsistent behavior
- ❌ **Forgetting `preventDefault()`** - causes unwanted scrolling/zooming
- ❌ **Not testing on real devices** - emulation misses touch nuances

---

### 🎨 **Theme & Styling Lessons**

#### **CSS Custom Properties for Theming**
```css
:root {
    --bg-color: #2c1810;
    --text-color: #f5f1e8;
    --primary-color: #8d6e63;
    /* ... other theme variables */
}

/* Theme-specific overrides */
.wood-theme {
    --bg-color: #2c1810;
    --text-color: #f5f1e8;
}
```

#### **Mobile-First CSS Strategy**
1. **Start with mobile styles** (base styles)
2. **Add tablet styles** (`@media (min-width: 768px)`)
3. **Add desktop styles** (`@media (min-width: 1024px)`)
4. **Use `max-width` for mobile-specific overrides**

---

### 📱 **Modal vs. Page Navigation Lessons**

#### **The Modal Problem on Mobile**
During development, we discovered a critical issue with modal dialogs that highlights why separate pages are often better for mobile PWAs:

**The Issue:**
- Confirmation dialog overlay remained in DOM after "hiding"
- Created invisible layer blocking all touch interactions
- Users could see interface but couldn't interact with it
- Difficult to debug because the overlay was visually hidden but functionally present

**Root Cause:**
```javascript
// BAD: Only hides visually, DOM element remains
hide() {
    this.container.classList.remove('show'); // Visual only
    // Overlay still blocks clicks!
}

// GOOD: Properly removes from DOM
hide() {
    this.container.classList.remove('show');
    setTimeout(() => {
        this.container.parentNode.removeChild(this.container);
        this.container = null;
    }, 300);
}
```

#### **Why Separate Pages Are Better for Mobile PWAs**

**✅ Advantages of Page Navigation:**
1. **Clean State Management** - Each page starts fresh, no leftover DOM
2. **Browser Back Button** - Users expect back button to work
3. **URL-based Navigation** - Shareable, bookmarkable states  
4. **Memory Management** - Browser handles cleanup automatically
5. **Accessibility** - Screen readers handle page transitions better
6. **Touch Gestures** - Native swipe-back gestures work
7. **No Z-index Issues** - No overlay stacking problems

**❌ Modal Problems on Mobile:**
1. **DOM Pollution** - Hidden elements can block interactions
2. **Memory Leaks** - Event listeners not properly cleaned up
3. **Focus Traps** - Difficult to implement proper focus management
4. **Gesture Conflicts** - Modals can interfere with native gestures
5. **Back Button Confusion** - Back button doesn't close modal as expected
6. **Viewport Issues** - Mobile keyboards can break modal positioning

#### **When to Use Each Approach**

**Use Separate Pages For:**
- Settings/configuration screens
- Complex forms or multi-step processes  
- Any interaction that might take >30 seconds
- Features users might want to bookmark/share
- Critical confirmations (like difficulty changes)

**Use Modals Only For:**
- Quick confirmations (<5 seconds)
- Simple alerts/notifications
- Tooltips and help text
- Image previews/lightboxes
- **AND ALWAYS** ensure proper cleanup!

#### **Best Practices for PWA Navigation**
```javascript
// Use History API for page-like navigation
function navigateToSettings() {
    history.pushState({page: 'settings'}, 'Settings', '/settings');
    showSettingsPage();
}

// Handle back button
window.addEventListener('popstate', (e) => {
    if (e.state?.page === 'settings') {
        showSettingsPage();
    } else {
        showMainGame();
    }
});
```

**Key Takeaway:** *"When in doubt, use a separate page. Mobile users expect page-based navigation, and it eliminates a whole class of interaction bugs."*

---

### 🐛 **Common Debugging Issues**

#### **Canvas Not Rendering**
- **Check canvas dimensions** (width/height attributes vs CSS)
- **Verify context is available** (`canvas.getContext('2d')`)
- **Test with simple drawing** (`ctx.fillRect(0, 0, 10, 10)`)
- **Check if canvas is in viewport** (`getBoundingClientRect()`)

#### **Module Loading Failures**
- **Check browser console** for 404 errors
- **Verify file paths** are correct
- **Test both static and dynamic imports**
- **Use network tab** to see what's actually loading

#### **Mobile Layout Issues**
- **Use browser dev tools** mobile emulation
- **Test on actual devices** when possible
- **Check touch target sizes** (minimum 44px)
- **Verify responsive breakpoints** work as expected

---

### 📋 **Development Checklist**

#### **Before Starting**
- [ ] Set up proper file structure (`/src/`, `/public/`)
- [ ] Configure build tools (Vite, Webpack, etc.)
- [ ] Plan mobile-first responsive breakpoints
- [ ] Design touch-friendly interface

#### **During Development**
- [ ] Test on multiple screen sizes
- [ ] Verify all imports work (static and dynamic)
- [ ] Check PWA manifest and service worker
- [ ] Test offline functionality
- [ ] Validate touch interactions

#### **Before Launch**
- [ ] Test on actual mobile devices
- [ ] Verify PWA installation works
- [ ] Check performance on slow connections
- [ ] Validate all features work offline
- [ ] Test theme switching and settings persistence

---

### 🚀 **Next PWA Project Recommendations**

1. **Start with mobile-first design** from day one
2. **Use pages for complex features**, modals for simple ones
3. **Test module loading early** and often
4. **Plan responsive breakpoints** before coding
5. **Design for touch** - larger targets, better spacing
6. **Keep PWA features simple** - focus on core functionality first
7. **Test offline scenarios** throughout development
8. **Use CSS custom properties** for theming from the start

---

### 💡 **Key Takeaways**

- **Mobile-first isn't just about screen size** - it's about touch, space efficiency, and user expectations
- **Touch events are NOT the same as click events** - always add both for cross-platform compatibility
- **Static imports are powerful but fragile** - use dynamic imports for optional features
- **Pages beat modals for complex content** - especially on mobile where modals can create invisible interaction blockers
- **Modal cleanup is critical** - always remove from DOM, not just hide visually
- **When in doubt, use separate pages** - eliminates entire classes of mobile interaction bugs
- **Space is precious on mobile** - remove obvious text, maximize gameplay area
- **Test early and often** - mobile issues are harder to fix later
- **PWA features should enhance, not complicate** - focus on core experience first
- **Touch targets must be 44px minimum** - Apple HIG guidelines for accessibility

---

### 🔄 Preserving Local Data Across PWA Upgrades

#### The Problem
- Upgrades changed localStorage key names (e.g., `blockdoku-settings` vs `blockdoku_settings`), risking loss of settings and stats.
- Some pages read keys directly, others via a storage module, causing mismatches.
- Service Worker and manifest upgrades can confuse users if they appear to “reset” the app (cache cleared, theme reset), even if data still exists.

#### What We Did
- Introduced a storage migration that copies legacy keys into canonical ones without deleting the legacy keys immediately.
- Updated all storage listeners to watch both old and new keys during a transition period.
- Adjusted HTML pages that read settings directly from `localStorage` to try canonical first, then legacy.
- Standardized the in-progress game key lookup to the canonical key provided by the storage module.

#### Code Patterns
```javascript
// In storage module constructor
this.migrateLegacyKeys = function () {
  try {
    const legacySettings = localStorage.getItem('blockdoku-settings');
    const currentSettings = localStorage.getItem('blockdoku_settings');
    if (legacySettings && !currentSettings) {
      localStorage.setItem('blockdoku_settings', legacySettings);
    }

    const legacyGame = localStorage.getItem('blockdoku_game_state');
    const currentGame = localStorage.getItem('blockdoku_game_data');
    if (legacyGame && !currentGame) {
      localStorage.setItem('blockdoku_game_data', legacyGame);
    }
  } catch {}
};

// Storage event listeners
window.addEventListener('storage', (e) => {
  if (e.key === 'blockdoku-settings' || e.key === 'blockdoku_settings') {
    reloadSettings();
  }
});

// Direct reads from HTML pages
const savedSettings = localStorage.getItem('blockdoku_settings')
  || localStorage.getItem('blockdoku-settings');
```

#### Best Practices
- Prefer a single canonical key per data domain with a stable prefix (e.g., `blockdoku_*`).
- When renaming keys, migrate by copying to the new key; keep the old key for one or two releases before removal.
- Don’t call `localStorage.clear()` in any update flow.
- Avoid manifest changes that move the app to a different origin or drastically alter `scope`/`start_url` in ways that might break URLs or confound caches for existing installations.
- Service Worker updates: precache new assets, clean outdated caches, but leave storage alone (SW cannot access localStorage anyway). Communicate updates quietly and don’t disrupt the session.

#### Checklist for Future Projects
- Define canonical storage keys up front (`app_settings`, `app_game_data`, `app_high_scores`, `app_statistics`).
- Ship a `migrateLegacyKeys()` in the storage layer; call it on init.
- Update listeners and direct readers to accept both canonical and legacy keys during transition.
- Keep manifest `scope` and `start_url` stable; if changing, test install/upgrade paths.
- Verify upgrade on real devices: install previous version, play, upgrade, and confirm settings/stats persist.


### 🔖 Versioning & About Page Build Info

> Critical: The site depends on the build-info generator running during builds. If it does not run, the Settings → About page will show dev fallback values and build traceability is lost.

#### Our Versioning Scheme
- **Semantic Version + Build Metadata**: `MAJOR.MINOR.PATCH+BUILD`
- **Example**: `1.4.0+20250929-0506`
  - `1.4.0`: From `package.json`.
  - `20250929-0506`: Build identifier `YYYYMMDD-HHMM` generated at build time.

#### How It’s Generated
- The script `scripts/generate-build-info.js` runs on `prebuild` and `postbuild`.
- It writes `build-info.json` to the repo root and `src/` with fields:
```json
{
  "version": "1.4.0",
  "buildId": "20250929-0506",
  "buildDate": "2025-09-29T05:06:53.188Z",
  "fullVersion": "1.4.0+20250929-0506"
}
```
- It also writes a plain-text file named `build` at the repo root containing the exact `fullVersion` (e.g., `1.4.0+20250929-0506`).

#### How It’s Displayed (Settings → About)
- **Version**: `v{fullVersion}` (e.g., `v1.4.0+20250929-0506`).
- **Build**: `{buildId} ({localized build date/time})`.
- The page elements are `#version-display` and `#build-info`, updated by the settings script after build info loads.

#### Why This Helps
- **Traceability**: Unique build ID per deployment.
- **Supportability**: Users can report exact build from Settings → About.
- **Automation**: CI/CD and release notes can reference the same build string.

---

### 🔄 **Break/Fix Cycle Prevention & Architectural Lessons**

Based on recent intensive development cycles (Dec 2024 - Jan 2025), here are critical lessons for preventing break/fix spirals:

#### **🐛 Settings Synchronization Anti-Pattern**

**The Problem:**
```javascript
// ❌ DANGEROUS: Hardcoded defaults before loading from storage
class SettingsManager {
    constructor() {
        this.currentDifficulty = 'normal'; // Hardcoded!
        this.settings = this.storage.loadSettings(); // Loaded after default
    }
}
```

**The Bug:** Theme changes reset difficulty because `saveSettings()` saved the hardcoded default instead of the user's actual setting.

**The Fix:**
```javascript
// ✅ CORRECT: Load from storage FIRST, then set defaults
class SettingsManager {
    constructor() {
        this.settings = this.storage.loadSettings();
        this.currentDifficulty = this.settings.difficulty || 'normal'; // Default only if not found
    }
}
```

**Lesson:** **Never hardcode defaults before loading user data.** Always load first, then apply defaults for missing values.

#### **🏗️ Monolithic Architecture Warning Signs**

**Red Flags We Hit:**
- 3,700+ line single class (`BlockdokuGame`)
- 15+ manager dependencies in one constructor
- Circular dependencies between components
- Settings sync issues across multiple pages

**What Happens:**
1. **Constructor Dependency Hell** - 15+ `new Manager()` calls
2. **Merge Conflict Explosion** - Every feature touches the same files
3. **Debug Complexity** - Hard to isolate issues
4. **Testing Difficulty** - Can't test components in isolation

**Solution Pattern:**
```javascript
// ❌ Monolithic
class BlockdokuGame {
    constructor() {
        this.blockManager = new BlockManager();
        this.petrificationManager = new PetrificationManager();
        this.deadPixelsManager = new DeadPixelsManager();
        this.blockPalette = new BlockPalette(/*...*/);
        // ... 15+ more managers
    }
}

// ✅ Modular with Dependency Injection
class GameEngine {
    constructor(dependencies) {
        this.managers = dependencies; // Injected, testable
    }
}
```

#### **🎯 Behavioral Testing for Rapid Development**

**The Problem:** Break/fix cycles happen because small changes break unrelated features.

**The Solution:** High-level behavioral tests that run in 5 seconds:
```javascript
// Test user workflows, not implementation details
test('Theme change preserves difficulty (REGRESSION)', () => {
    storage.saveSettings({ difficulty: 'easy', theme: 'wood' });
    settingsManager.selectTheme('light'); // This used to reset difficulty
    const settings = storage.loadSettings();
    assert.equal(settings.difficulty, 'easy'); // Should still be easy
});
```

**Key Insight:** Test **user workflows** and **known regressions**, not internal methods. This catches 80% of issues with 20% of the testing effort.

#### **📦 Build Asset Proliferation**

**What We Discovered:** 79+ build asset files accumulating in `/assets/`
- Multiple versions of same components
- Vite generating excessive artifacts
- No cleanup strategy

**Impact:**
- Repository bloat
- Confusion about which assets are current
- Deployment complexity

**Prevention:**
```javascript
// vite.config.js - Control asset generation
export default {
    build: {
        rollupOptions: {
            output: {
                // Cleaner asset naming
                assetFileNames: '[name].[hash][extname]',
                chunkFileNames: '[name].[hash].js',
            }
        }
    }
}
```

**Lesson:** Monitor build outputs regularly. Set up asset cleanup as part of the build process.

#### **🔀 Merge Conflict Architecture Patterns**

**What Causes Frequent Conflicts:**
1. **Monolithic files** (app.js) - every feature touches it
2. **Inconsistent constructor patterns** - different branches use different approaches
3. **Shared CSS classes** - multiple features modify same styles

**Conflict-Resistant Patterns:**
```javascript
// ✅ Consistent constructor patterns across team
class ComponentBase {
    constructor(containerId, dependencies = {}) {
        this.container = document.getElementById(containerId);
        this.dependencies = dependencies;
    }
}

// ✅ Feature-specific CSS classes
.petrification-warning { /* Petrification feature */ }
.piece-timeout-warning { /* Timeout feature */ }
// Instead of generic .warning that multiple features fight over
```

#### **🎮 Game State Management Lessons**

**Multi-Page State Sync Issues:**
- Main game page and settings page both modify same localStorage
- Window focus events used for sync (fragile)
- Race conditions during rapid navigation

**Better Pattern:**
```javascript
// Centralized state management
class GameStateManager {
    static instance = null;
    
    static getInstance() {
        if (!GameStateManager.instance) {
            GameStateManager.instance = new GameStateManager();
        }
        return GameStateManager.instance;
    }
    
    // Single source of truth for all pages
    updateDifficulty(difficulty) {
        this.state.difficulty = difficulty;
        this.persistToStorage();
        this.notifyAllPages('difficultyChanged', difficulty);
    }
}
```

#### **🚨 Debug Code Pollution**

**What Happened:** Extensive `console.log` statements added during debugging never removed:
```javascript
console.log('SettingsManager constructor - initial settings:', this.settings);
console.log('Loaded theme:', this.currentTheme);
console.log('Loaded difficulty:', this.currentDifficulty);
```

**Impact:**
- Performance degradation
- Console noise in production
- Sensitive data potentially logged

**Prevention:**
```javascript
// Use debug utility
const debug = process.env.NODE_ENV === 'development' ? console.log : () => {};
debug('Debug info only in development');

// Or conditional compilation
if (__DEV__) {
    console.log('Debug information');
}
```

#### **📋 Break/Fix Prevention Checklist**

**Before Adding Features:**
- [ ] Will this touch the monolithic main class?
- [ ] Are constructor patterns consistent with existing code?
- [ ] Does this create new localStorage keys or modify existing ones?
- [ ] Will this require CSS classes that might conflict?

**During Development:**
- [ ] Run behavioral tests after each major change
- [ ] Check for console.log statements before committing
- [ ] Test settings sync between pages
- [ ] Verify no hardcoded defaults override user data

**Before Merging:**
- [ ] Check for merge conflicts in main files
- [ ] Verify build asset count hasn't exploded
- [ ] Test the specific bug scenarios that have occurred before
- [ ] Run full test suite including regression tests

#### **🎯 Key Architectural Insights**

1. **Settings Management:** Load from storage FIRST, never hardcode defaults that override user data
2. **Component Architecture:** Dependency injection > constructor hell
3. **Testing Strategy:** Behavioral tests > unit tests for rapid development
4. **Build Management:** Monitor and clean assets regularly
5. **State Sync:** Centralized state management > window focus events
6. **Debug Hygiene:** Remove debug code before production

**The Meta-Lesson:** *"Break/fix cycles are usually architectural problems, not implementation bugs. Fix the architecture to prevent the cycles."*

---

*This document was created during the development of Blockdoku PWA and should be updated with new lessons learned from future projects.*
