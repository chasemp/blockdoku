# Timer Systems in Blockdoku PWA

## Overview

Blockdoku has **TWO SEPARATE TIMER SYSTEMS** that serve different purposes. This document clarifies the distinction to avoid confusion.

---

## 1. COUNTDOWN TIMER ⏳

**Purpose:** Adds time pressure to the game - counts DOWN and ends the game when time runs out.

### Configuration
- **Setting:** `enableTimer` (checkbox in game settings)
- **Duration:** `countdownDuration` (slider: 3-10 minutes)
- **HTML Element:** `timer-display` (ID: `timer`)
- **Label:** "COUNTDOWN"
- **Display Format:** `M:SS` (e.g., "5:00", "4:59", "0:30")

### Behavior
- Counts **DOWN**: `5:00 → 4:59 → 4:58 → ... → 0:00`
- **Game ends** when timer reaches `0:00`
- Controlled by `TimerSystem` class (`/src/js/difficulty/timer-system.js`)
- Can be enabled/disabled per game
- Shows warnings at 30 seconds (yellow) and 10 seconds (red)
- Resetting the score reinitializes the timer from the configured duration

### Code Components
- Class: `TimerSystem`
- Methods: `initialize()`, `start()`, `reset()`, `update()`, `getTimeRemaining()`
- Update function: `updateTimerDisplay()` in `app.js`
- Location: Utility bar center slot (`timer-slot`)

---

## 2. SPEED TIMER ⚡

**Purpose:** Measures how fast you place pieces - counts UP to track elapsed time for speed bonuses.

### Configuration
- **Setting:** `showSpeedTimer` (checkbox in game settings)
- **Mode:** `speedDisplayMode` ('timer' or 'points')
- **HTML Element:** `speed-timer` (ID: `speed-timer-value`)
- **Label:** "SPEED"
- **Display Format:** 
  - Timer mode: `S.Ss` (e.g., "0.0s", "2.5s", "15.3s")
  - Points mode: Integer (e.g., "0", "125", "450")

### Behavior
- Counts **UP**: `0.0s → 1.2s → 2.5s → 10.8s → ...`
- Measures elapsed time since last piece placement
- **Does NOT end the game** - purely informational
- Used for speed bonus scoring (faster placement = more points)
- Resets to `0.0s` when a new piece is placed

### Code Components
- Variables: `speedTimerStartTime`, `speedTimerInterval`, `speedDisplayMode`
- Methods: `startSpeedTimerCountdown()`, `stopSpeedTimerCountdown()`, `updateSpeedTimerDisplay()`
  - **Note:** Despite method name "Countdown", this timer counts **UP**
- Update logic: In `updateUI()` method in `app.js`
- Location: Utility bar right slot (`speed-timer-slot`)

---

## Key Differences

| Feature | Countdown Timer ⏳ | Speed Timer ⚡ |
|---------|-------------------|----------------|
| **Direction** | Counts DOWN | Counts UP |
| **Purpose** | Time pressure, game ending | Speed tracking, bonus scoring |
| **Format** | M:SS (minutes:seconds) | S.Ss (seconds.tenths) or points |
| **Game Impact** | Ends game at 0:00 | No direct impact |
| **Setting** | `enableTimer` | `showSpeedTimer` |
| **HTML ID** | `timer-display` | `speed-timer` |
| **Class** | `TimerSystem` | Part of main game logic |
| **Display** | "5:00" → "0:00" | "0.0s" → "15.3s" |

---

## Historical Context

Originally, there were two timers simply called "timer" and "speed timer". To reduce confusion, the first timer was **renamed to "countdown timer"** to make its purpose clearer (it counts down and ends the game). However, some code comments and method names still reference "countdown" in the speed timer code, which is misleading since it actually counts UP.

### Misleading Legacy Names
- `startSpeedTimerCountdown()` - Despite the name, this starts an **UP counter**, not a countdown
- `stopSpeedTimerCountdown()` - Stops the speed timer that counts UP
- Comments referring to "countdown" in speed timer code

These names are preserved for backward compatibility but have been clarified with comments in the code.

---

## For Developers

When working with timers in this codebase:

1. **Countdown Timer (⏳):** Use `timerSystem` class and `updateTimerDisplay()`
2. **Speed Timer (⚡):** Use `speedTimerStartTime` and `updateSpeedTimerDisplay()`
3. Always check which timer you're working with - they have different purposes and behaviors
4. The countdown timer is in `timer-system.js`, the speed timer is in `app.js`
5. When you see "countdown" in method names related to speed timer, remember it actually counts UP

---

## Bug Fix Summary (2025-10-04)

Fixed issues where the countdown timer (⏳) was not:
1. Displaying in the utility bar when enabled
2. Resetting points when toggled on/off

**Root Cause:** Timer system's `reset()` method was using stale `timeLimit` values instead of re-fetching from settings.

**Solution:** 
- Modified `reset()` to re-fetch `timeLimit` from `difficultyManager`
- Added explicit `disable()` call when countdown timer is toggled OFF
- Improved `initialize()` to explicitly disable when no time limit is set

See commits for detailed changes to:
- `/src/js/difficulty/timer-system.js`
- `/src/js/game-settings.js`
- `/src/js/app.js` (clarified comments)
