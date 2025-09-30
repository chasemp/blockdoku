# 🐛 Blockdoku PWA - Debugging TODO List

## 🔥 **CRITICAL BUG - Theme Changes Reset Difficulty**

### **Issue Description:**
- User sets difficulty to **Easy** (UI shows "EASY")
- User goes to Settings and changes theme (any theme change)
- When returning to main game, difficulty has been reset to **Normal**
- This breaks the hint system which only works in Easy mode

### **Root Cause Investigation:**
The bug appears to be in the SettingsManager save/load cycle:

1. **Suspected Issue:** `SettingsManager.currentDifficulty` is not being updated when difficulty changes from main game
2. **When theme changes:** `selectTheme()` calls `saveSettings()` which overwrites storage with incorrect difficulty
3. **Result:** Easy difficulty gets overwritten with Normal

### **Debugging Added:**
```javascript
// In settings.js - added logging to:
- SettingsManager constructor (initial settings)
- loadSettings() (what gets loaded)  
- saveSettings() (what gets saved when theme changes)

// In app.js - added logging to:
- Window focus events (when returning from settings)
- loadSettings() (what main game loads from storage)
```

### **Test Steps to Reproduce:**
1. Set difficulty to Easy (confirm "EASY" shows in UI)
2. Go to Settings page
3. Change theme (wood → light, etc.)
4. Check console for debug messages
5. Return to main game
6. Observe difficulty has reset to Normal

### **Expected Debug Output:**
Should show where `currentDifficulty` gets out of sync between main game and SettingsManager.

### **Potential Fixes:**
- Ensure SettingsManager reloads current difficulty when initialized
- Fix communication between main game difficulty changes and SettingsManager
- Prevent theme changes from affecting difficulty settings

---

## ✅ **Completed Items:**

### **Hint System Fixed:**
- ✅ Hint button text readability on wood theme (added proper contrast)
- ✅ Hint system debugging (works correctly in Easy mode)
- ✅ Clarified that hints only work in Easy difficulty

### **Enhanced Block Palette:**
- ✅ Hover scale and glow effects implemented
- ✅ Smooth selection animations with particle effects
- ✅ Customizable animation preferences in settings
- ✅ Reduced animation intensity per user feedback

### **Modal Dialog Issues:**
- ✅ Fixed confirmation dialog cleanup (was blocking clicks after hiding)
- ✅ Added comprehensive PWA lessons about modal vs page navigation

---

## 📝 **Notes for Tomorrow:**

1. **Priority:** Fix the theme→difficulty reset bug first
2. **Test thoroughly:** Make sure difficulty persists through theme changes
3. **Clean up:** Remove debugging console.log statements once fixed
4. **Consider:** Whether other settings might have similar issues

---

*Created: December 28, 2024*  
*Status: Ready for debugging session*

