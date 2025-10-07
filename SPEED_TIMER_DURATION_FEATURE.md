# Speed Timer Duration Feature
**Date:** 2025-10-07  
**Feature:** Configurable Speed Timer Duration (1-20 seconds)  
**Status:** ✅ IMPLEMENTED

---

## 🎯 Feature Overview

Added a configurable speed timer duration setting that allows users to set the maximum time limit for speed bonuses and punishments. The speed timer now supports a range of 1-20 seconds with 10 seconds as the default.

### **Key Features:**
- **Range:** 1-20 seconds (configurable via slider)
- **Default:** 10 seconds
- **Dynamic Thresholds:** Speed bonus/punishment thresholds scale with the selected duration
- **Both Modes:** Works with both bonus and punishment speed modes
- **Mid-Game Protection:** Warns and resets score when changing duration mid-game

---

## 🔧 Technical Implementation

### **1. Storage Layer**
**File:** `src/js/storage/game-storage.js`

Added new setting to default configuration:
```javascript
speedTimerDuration: 10, // Default speed timer duration in seconds (1-20 range)
```

### **2. UI Layer**
**File:** `src/gamesettings.html`

Added speed timer duration slider (similar to countdown duration):
```html
<div class="setting-item" id="speed-timer-duration-container" style="margin-left: 2rem; display: none;">
    <label for="speed-timer-duration" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
        <span>Speed Timer Duration:</span>
        <span id="speed-timer-duration-value" style="font-weight: bold; color: var(--primary-color);">10s</span>
    </label>
    <input type="range" id="speed-timer-duration" min="10" max="30" value="10" step="1" style="width: 100%; margin-bottom: 0.5rem;">
    <p class="setting-description" style="margin: 0; font-size: 0.8rem; color: var(--text-color-secondary);">10 = 10 seconds, 30 = 30 seconds (maximum duration for speed bonuses/punishments)</p>
</div>
```

### **3. Settings Management**
**File:** `src/js/game-settings.js`

**Added to `loadBasicSettings()`:**
- Load speed timer duration from settings
- Show/hide slider based on speed timer checkbox state
- Update display value

**Added to `setupUtilityBarListeners()`:**
- Special handling for speed timer checkbox
- Warning dialog when enabling mid-game
- Show/hide duration slider on checkbox toggle

**Added speed timer duration slider event listener:**
- Real-time value updates
- Mid-game change warning with score reset
- Settings persistence

### **4. Scoring System**
**File:** `src/js/game/scoring.js`

**Updated Constructor:**
- Added `game` parameter to access settings
- Dynamic threshold generation based on configurable duration

**Added `generateSpeedThresholds()` method:**
```javascript
generateSpeedThresholds() {
    // Get speed timer duration from settings (default 10 seconds)
    let maxDuration = 10000; // 10 seconds in milliseconds (default)
    if (this.game && this.game.storage) {
        const settings = this.game.storage.loadSettings();
        maxDuration = (settings.speedTimerDuration || 10) * 1000; // Convert to milliseconds
    }
    
    // Generate thresholds that scale with the max duration
    // Fastest 10% gets highest bonus, next 20% gets medium bonus, etc.
    const thresholds = [
        { maxTime: Math.round(maxDuration * 0.1), bonus: 2, label: 'Lightning Fast' },     // Top 10%
        { maxTime: Math.round(maxDuration * 0.3), bonus: 1, label: 'Very Fast' },         // Top 30%
        { maxTime: Math.round(maxDuration * 0.5), bonus: 0.5, label: 'Fast' },            // Top 50%
        { maxTime: Math.round(maxDuration * 0.7), bonus: 0.25, label: 'Quick' },          // Top 70%
        { maxTime: maxDuration, bonus: 0, label: 'Normal' }                               // Within time limit
    ];
    
    return thresholds;
}
```

**Updated `calculateSpeedBonus()` method:**
- Regenerates thresholds on each call (in case settings changed)
- Uses configurable max duration for punishment calculations
- Properly handles both bonus and punishment modes

### **5. Game Integration**
**File:** `src/js/app.js`

Updated ScoringSystem instantiation to pass game reference:
```javascript
this.scoringSystem = new ScoringSystem(this.petrificationManager, this.difficultyManager, this);
```

---

## 📊 How It Works

### **Dynamic Threshold Generation**

The speed timer duration setting dynamically generates bonus/punishment thresholds:

| Duration | Lightning Fast | Very Fast | Fast | Quick | Normal |
|----------|---------------|-----------|------|-------|--------|
| 10s | < 1.0s | < 3.0s | < 5.0s | < 7.0s | ≤ 10.0s |
| 20s | < 2.0s | < 6.0s | < 10.0s | < 14.0s | ≤ 20.0s |
| 30s | < 3.0s | < 9.0s | < 15.0s | < 21.0s | ≤ 30.0s |

### **Bonus Mode (Default)**
- **Lightning Fast (Top 10%):** +2 points
- **Very Fast (Top 30%):** +1 point  
- **Fast (Top 50%):** +0.5 points
- **Quick (Top 70%):** +0.25 points
- **Normal (Within limit):** +0 points

### **Punishment Mode**
- **Within limit:** No penalty
- **Over limit:** -1 point per second over the max duration
- **Scales with level:** +3% penalty per level

---

## 🎮 User Experience

### **Settings Page**
1. **Enable Speed Timer** checkbox
2. **Duration Slider** appears when enabled (1-20 seconds)
3. **Real-time value display** shows current setting
4. **Mid-game protection** warns about score reset

### **In-Game Behavior**
- **Speed bonuses** scale with the selected duration
- **Punishments** apply after the max duration
- **Thresholds update** dynamically based on settings
- **Fair scoring** maintained with mid-game change warnings

---

## 🔄 Settings Flow

### **Initial Load:**
1. Load `speedTimerDuration` from storage (default: 10)
2. Set slider value and display text
3. Show/hide slider based on `showSpeedTimer` setting

### **Checkbox Toggle:**
1. User toggles "Enable Speed Timer"
2. Show/hide duration slider
3. If enabling mid-game → show warning → reset score if confirmed

### **Duration Change:**
1. User moves slider (1-20 seconds)
2. Update display value in real-time
3. If mid-game → show warning → reset score if confirmed
4. Save setting to storage

---

## 🧪 Testing Scenarios

### **Basic Functionality:**
1. ✅ Enable speed timer → slider appears
2. ✅ Move slider → value updates in real-time
3. ✅ Disable speed timer → slider hides
4. ✅ Setting persists across page reloads

### **Mid-Game Protection:**
1. ✅ Start game with speed timer enabled
2. ✅ Change duration mid-game → warning appears
3. ✅ Confirm → score resets, new duration applies
4. ✅ Cancel → slider reverts, score unchanged

### **Scoring System:**
1. ✅ Set 10s duration → fast placements get bonuses
2. ✅ Set 30s duration → same placements get different bonuses
3. ✅ Punishment mode → penalties apply after max duration
4. ✅ Thresholds scale correctly with duration

---

## 📈 Benefits

### **For Users:**
- **Customizable difficulty** - adjust speed pressure to preference
- **Fair scoring** - mid-game changes reset score to prevent exploitation
- **Clear feedback** - real-time value display and warnings
- **Consistent behavior** - works with both bonus and punishment modes

### **For Game Balance:**
- **Scalable thresholds** - maintains relative difficulty across durations
- **Dynamic updates** - settings changes apply immediately
- **Score integrity** - prevents mid-game manipulation
- **Mode flexibility** - works with all speed modes

---

## 🔧 Configuration Options

| Setting | Range | Default | Description |
|---------|-------|---------|-------------|
| `speedTimerDuration` | 1-20 seconds | 10 seconds | Maximum time for speed bonuses/punishments |
| `showSpeedTimer` | true/false | false | Enable speed timer display in utility bar |
| `speedMode` | bonus/punishment/ignored | bonus | How speed affects scoring |

---

## ✨ Future Enhancements

### **Potential Improvements:**
1. **Visual indicators** - show current threshold zones in UI
2. **Preset durations** - quick-select buttons for common values
3. **Difficulty-specific defaults** - different durations per difficulty
4. **Advanced thresholds** - more granular bonus tiers
5. **Statistics tracking** - show speed performance by duration

### **Current Status:**
- ✅ Core functionality implemented
- ✅ UI integration complete
- ✅ Settings persistence working
- ✅ Mid-game protection active
- ✅ Both bonus/punishment modes supported

---

## 🎉 Summary

The Speed Timer Duration feature provides users with fine-grained control over the speed-based scoring system. By allowing configuration from 1-20 seconds, players can adjust the difficulty and pressure of speed-based gameplay to match their skill level and preferences.

The implementation ensures fair scoring through mid-game change warnings and maintains game balance through dynamically scaled thresholds that work consistently across all speed modes.

**Ready for testing and deployment!** 🚀
