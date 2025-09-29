# PWA Development Lessons Learned

## 🚀 Key Insights from Blockdoku PWA Development

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
- **Pages beat modals for complex content** - especially on mobile
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


*This document was created during the development of Blockdoku PWA and should be updated with new lessons learned from future projects.*
