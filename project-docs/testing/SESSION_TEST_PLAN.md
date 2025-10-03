# Testing & Balance Session - October 3, 2025

## 🎯 Today's Features to Test

1. ✅ **Combo Counter Fix** - Now increments properly
2. ✅ **Wild Block Shapes** - 39 creative shapes added
3. ✅ **Magic Block Types** - 4 types with unique behaviors
4. ✅ **Auto-Rotate Smart Placement** - Blocks rotate to optimal orientation
5. ✅ **Efficiency Metrics** - Points per piece tracking
6. ✅ **Cascade Effect** - Sequential line clear animations
7. ✅ **UI Fixes** - LEVEL display z-index issues
8. ✅ **Clear Cache Button** - PWA cache management

---

## 📋 Test Plan

### 🎮 **1. Combo System Testing**

**Test Case 1.1: Basic Combo**
- [ ] Start a new game in Normal mode
- [ ] Clear 2 horizontal lines simultaneously
- [ ] **Expected:** Combo counter increments from 0 → 1
- [ ] **Expected:** Console shows "🎯 Combo Event Detected!"
- [ ] **Expected:** Combo animation plays

**Test Case 1.2: Streak Combo**
- [ ] Clear 2 lines (combo = 1)
- [ ] Immediately clear 2 more lines (combo = 2)
- [ ] **Expected:** Combo counter continues incrementing
- [ ] **Expected:** Each clear shows proper combo bonus

**Test Case 1.3: Combo Reset**
- [ ] Have an active combo (e.g., combo = 2)
- [ ] Place a block that doesn't clear anything
- [ ] **Expected:** Combo resets to 0
- [ ] **Notes:** This is correct behavior for "streak" mode

**Test Case 1.4: Cumulative Mode**
- [ ] Check settings - should be in "cumulative" mode by default
- [ ] Combo should never reset, only increment
- [ ] **Expected:** Total combos keeps growing throughout game

---

### 🔥 **2. Wild Block Shapes Testing**

**Test Case 2.1: Enable Wild Shapes**
- [ ] Go to Game Settings → Game Modes
- [ ] Enable "Wild block shapes" (🔥 shapes bubble)
- [ ] Start a new game
- [ ] **Expected:** See creative shapes in block palette (pentominos, crosses, etc.)

**Test Case 2.2: Shape Variety**
Play several games and note which shapes appear:
- [ ] Pentominos (F, P, Y, I, L, N, T, U, V, W, X, Z)
- [ ] Hexominos (Bar, Snake, Arch, Stairs)
- [ ] Crosses (Small, Large)
- [ ] Hollow shapes (Square, Rectangle, L, T)
- [ ] Zigzags (Small, Large)
- [ ] Complex patterns (Butterfly, Arrow, Crown, etc.)
- [ ] **Expected:** Good variety, not just 1-2 types

**Test Case 2.3: Wild Shapes Disabled**
- [ ] Disable "Wild block shapes" setting
- [ ] Start a new game
- [ ] **Expected:** Only standard Blockdoku shapes appear
- [ ] **Expected:** No creative shapes in palette

**Test Case 2.4: Difficulty Integration**
- [ ] Try wild shapes in Easy mode
- [ ] Try wild shapes in Expert mode
- [ ] **Expected:** Works with all difficulties
- [ ] **Notes:** Should wild shapes be harder in higher difficulties?

**Balance Questions:**
- Are wild shapes too hard or too easy?
- Do they make the game more fun or more frustrating?
- Should spawn rates be adjusted?

---

### 🔮 **3. Magic Blocks Testing**

**Test Case 3.1: Enable Magic Blocks**
- [ ] Go to Game Settings → Game Modes
- [ ] Enable "Magic blocks" (🔮 magic bubble)
- [ ] Start a new game
- [ ] **Expected:** Occasionally see blocks with special colors/indicators

**Test Case 3.2: Line-Clear Magic (Red/Pink)**
- [ ] Place a Line-Clear magic block
- [ ] Complete a line with it
- [ ] **Expected:** "🔮 MAGIC ACTIVATED!" message
- [ ] **Expected:** "✨ MAGIC CLEAR! ✨" with details
- [ ] **Expected:** Line clears automatically
- [ ] **Expected:** Magic bonus points awarded

**Test Case 3.3: Bomb Magic (Dark Red) 💣**
- [ ] Place a Bomb magic block
- [ ] **Expected:** "💥 BOMB EXPLOSION!" message
- [ ] **Expected:** 3x3 area around each cell clears
- [ ] **Expected:** Explosion animation
- [ ] **Expected:** Bomb bonus points (+10 per cell)

**Test Case 3.4: Lightning Magic (Yellow) ⚡**
- [ ] Place a Lightning magic block
- [ ] **Expected:** "⚡ LIGHTNING STRIKE!" message
- [ ] **Expected:** Entire row AND column clear
- [ ] **Expected:** Lightning effect animation
- [ ] **Expected:** Lightning bonus points (+25 per line)

**Test Case 3.5: Ghost Magic (Purple) 👻**
- [ ] Place a Ghost magic block
- [ ] Try to place it overlapping existing blocks
- [ ] **Expected:** "👻 GHOST PHASE!" message
- [ ] **Expected:** Block can overlap (once per game?)
- [ ] **Expected:** Ghost effect animation
- [ ] **Notes:** Verify overlap functionality

**Test Case 3.6: Magic Block Spawn Rate**
- [ ] Play 5-10 games with magic blocks enabled
- [ ] Count how many magic blocks appear per game
- [ ] **Expected:** ~10% spawn rate (roughly 1 per 10 blocks)
- [ ] **Expected:** Max 1 magic block per 3-block set

**Test Case 3.7: Magic Blocks Disabled**
- [ ] Disable "Magic blocks" setting
- [ ] Start a new game
- [ ] **Expected:** No magic blocks appear
- [ ] **Expected:** Only regular blocks

**Test Case 3.8: Magic + Wild Shapes Combined**
- [ ] Enable BOTH magic blocks AND wild shapes
- [ ] Play a game
- [ ] **Expected:** Both features work together
- [ ] **Expected:** No conflicts or bugs
- [ ] **Notes:** Can a wild shape also be a magic block?

**Balance Questions:**
- Are magic blocks too powerful?
- Is the spawn rate (10%) appropriate?
- Do the different magic types feel distinct?
- Are point bonuses balanced?

---

### 🔄 **4. Auto-Rotate Smart Placement Testing**

**Test Case 4.1: Enable Auto-Rotate**
- [ ] Go to Game Settings → Quality of Life
- [ ] Enable "Auto-rotate blocks" (🔄 smart bubble)
- [ ] Start a new game
- [ ] **Expected:** Blocks in palette auto-rotate to best orientation

**Test Case 4.2: Optimal Orientation Detection**
- [ ] Observe blocks in palette
- [ ] Check if they're showing the orientation with most valid placements
- [ ] **Expected:** Console shows "🔄 Optimizing block orientations"
- [ ] **Expected:** Blocks rotate to optimal position automatically

**Test Case 4.3: Updates After Placement**
- [ ] Place a block on the board
- [ ] Watch remaining blocks in palette
- [ ] **Expected:** Blocks re-optimize based on new board state
- [ ] **Expected:** Orientations may change if board changed

**Test Case 4.4: Auto-Rotate Disabled**
- [ ] Disable "Auto-rotate blocks" setting
- [ ] Start a new game
- [ ] **Expected:** Blocks stay in their original orientation
- [ ] **Expected:** No auto-rotation happens

**Balance Questions:**
- Does auto-rotate make the game too easy?
- Is it helpful or confusing?
- Should it be on by default?

---

### 📊 **5. Efficiency Metrics Testing**

**Test Case 5.1: Points Per Piece Tracking**
- [ ] Play a complete game
- [ ] Game over
- [ ] Go to Last Game page
- [ ] **Expected:** See "📊 Efficiency: X.X pts/piece (Y pieces placed)"
- [ ] **Expected:** Math is correct: total score ÷ pieces placed

**Test Case 5.2: High Efficiency Game**
- [ ] Play strategically, clear many lines
- [ ] Check efficiency metric
- [ ] **Expected:** High pts/piece ratio (e.g., >50)

**Test Case 5.3: Low Efficiency Game**
- [ ] Play poorly, clear few lines
- [ ] Check efficiency metric
- [ ] **Expected:** Low pts/piece ratio (e.g., <20)

**Balance Questions:**
- What's a "good" efficiency score?
- Should we show efficiency ranks/grades?

---

### 🎆 **6. Cascade Effect Testing**

**Test Case 6.1: Multiple Line Types**
- [ ] Set up board to clear row + column + square simultaneously
- [ ] Place the completing block
- [ ] **Expected:** Lines clear sequentially, not all at once
- [ ] **Expected:** Rows → Columns → Squares (in order)
- [ ] **Expected:** Enhanced particle effects
- [ ] **Expected:** Delay between each clear type

**Test Case 6.2: Multiple Rows**
- [ ] Clear 2+ rows simultaneously
- [ ] **Expected:** Cascade animation shows them clearing in sequence
- [ ] **Expected:** Visual feedback is satisfying

**Test Case 6.3: Animation Timing**
- [ ] Test cascade with different combinations
- [ ] **Expected:** Not too fast (you can see each clear)
- [ ] **Expected:** Not too slow (doesn't feel sluggish)
- [ ] **Notes:** Check if timing feels good

---

### 🎨 **7. UI/UX Testing**

**Test Case 7.1: LEVEL Display Visibility**
- [ ] Play several games
- [ ] Watch the LEVEL display in score bar
- [ ] **Expected:** Never gets covered by other elements
- [ ] **Expected:** Always readable
- [ ] **Notes:** This was a bug we fixed - test thoroughly!

**Test Case 7.2: Combo Display Movement**
- [ ] Get a combo
- [ ] Watch score/level/combo bar
- [ ] **Expected:** Elements don't shift left/right
- [ ] **Expected:** Text stays centered
- [ ] **Expected:** Animations don't clip content

**Test Case 7.3: Wild Shapes in Game Modes**
- [ ] Go to Game Settings → Game Modes
- [ ] **Expected:** See "🔥 Enable wild block shapes" option
- [ ] **Expected:** NOT in "Quality of Life" section
- [ ] **Notes:** We moved it - verify it's in the right place

---

### 🧹 **8. Clear Cache Button Testing**

**Test Case 8.1: Button Location**
- [ ] Go to Settings (⚙️)
- [ ] Click "📱 App Management"
- [ ] **Expected:** See "🧹 Clear Cache & Reset SW" button
- [ ] **Expected:** Button is purple with hover effect

**Test Case 8.2: Clear Cache Functionality**
- [ ] Click "Clear Cache & Reset SW"
- [ ] Read confirmation dialog
- [ ] Click "OK"
- [ ] **Expected:** "Cache cleared! Reloading page..." notification
- [ ] **Expected:** Page reloads after ~1.5 seconds
- [ ] **Expected:** Fresh version of site loads

**Test Case 8.3: Service Worker Unregistration**
- [ ] Open DevTools → Application → Service Workers
- [ ] Note any registered service workers
- [ ] Click "Clear Cache & Reset SW" and confirm
- [ ] After reload, check Application tab again
- [ ] **Expected:** Service workers are unregistered (or re-registered fresh)

**Test Case 8.4: Data Preservation**
- [ ] Note your current high score
- [ ] Note your settings (theme, difficulty, etc.)
- [ ] Click "Clear Cache & Reset SW" and confirm
- [ ] After reload, check data
- [ ] **Expected:** Game data PRESERVED (scores, settings intact)
- [ ] **Expected:** Only cache/SW cleared, not game data

---

## 🐛 Known Issues to Watch For

1. **Combo Counter** - Previously wasn't incrementing
   - ✅ Fixed, but verify thoroughly

2. **LEVEL Display** - Was getting covered by elements
   - ✅ Fixed with z-index, but test in different scenarios

3. **Magic Block Types** - All new code
   - 🆕 Untested in real gameplay
   - Watch for: incorrect behaviors, missing animations, wrong bonuses

4. **Wild Shapes** - Large shape library
   - 🆕 Some shapes might be too hard/easy
   - Watch for: shapes that break game balance

5. **Auto-Rotate** - Complex board analysis
   - 🆕 Could be slow with many blocks
   - Watch for: performance issues, incorrect rotations

---

## 📝 Balance Feedback Template

For each feature, note:

### Feature: [Name]
**Fun Factor:** ⭐⭐⭐⭐⭐ (1-5 stars)
**Difficulty Balance:** Too Easy / Just Right / Too Hard
**Performance:** Fast / OK / Slow
**Bugs Found:** [List any issues]
**Suggestions:** [Improvements or changes]

---

## ✅ Testing Complete Checklist

- [ ] All combo system tests passed
- [ ] Wild block shapes tested and balanced
- [ ] All 4 magic block types tested
- [ ] Auto-rotate functionality verified
- [ ] Efficiency metrics displaying correctly
- [ ] Cascade effects working and satisfying
- [ ] UI/UX issues resolved (LEVEL display, etc.)
- [ ] Clear cache button functioning
- [ ] No new bugs introduced
- [ ] Performance is good (no lag/stuttering)

---

## 🎯 Next Steps After Testing

1. **Document any bugs found**
2. **Note balance issues** (too hard/easy/powerful)
3. **Suggest tweaks** (spawn rates, point values, etc.)
4. **Decide if features are ready** to commit and push
5. **Plan fixes** for any issues discovered

---

## 📊 Test Results Summary

### Critical Issues (Must Fix):
- [ ] None yet

### Minor Issues (Should Fix):
- [ ] None yet

### Balance Adjustments Needed:
- [ ] None yet

### Features Ready to Ship:
- [ ] Combo Counter Fix
- [ ] Wild Block Shapes
- [ ] Magic Block Types
- [ ] Auto-Rotate Smart Placement
- [ ] Efficiency Metrics
- [ ] Cascade Effect
- [ ] UI Fixes
- [ ] Clear Cache Button

---

**Tester:** Chase Pettet  
**Date:** October 3, 2025  
**Session:** Evening Development Session  
**Build:** 1.6.1+20251003-1716

