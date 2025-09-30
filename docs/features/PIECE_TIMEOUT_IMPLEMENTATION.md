# Piece Timeout System Implementation

## Overview
This document describes the piece timeout system that prevents the game from staying in an infinite state when pieces cannot be placed.

## Problem Solved
Previously, if no pieces could be placed on the board but they hadn't been removed yet, the game would remain in an infinite waiting state - pieces wouldn't be dimmed out and the game over screen would never appear.

## Solution: 30-Second Timeout System

### Timeline
1. **0-15 seconds**: Normal state - pieces are fully visible and interactive
2. **15 seconds**: Warning state begins - pieces show "struggling" animation
3. **30 seconds**: Timeout occurs - piece is locked/dimmed and shows as unusable
4. **All pieces timed out**: Game over is triggered

### Visual Feedback

#### 15-Second Warning ("Struggling")
- Piece shakes/wobbles with a subtle animation
- Brightness and saturation are slightly increased
- Animation: `pieceStruggle` - gentle rotation oscillation (±3 degrees)

#### 30-Second Timeout ("Lodged in Place")
- Piece becomes grayscale and dimmed (30% brightness, 50% opacity)
- Lock icon (🔒) appears centered over the piece
- Piece becomes non-interactive (cursor: not-allowed, pointer-events: none)
- Floating notification appears: "Piece Lodged in Place!"

### Floating Notification
- Styled similar to the floating score notifications
- Red color (#ff4444) with glowing text shadow
- 3-second animation that floats up from the piece palette
- Positioned at the center of the blocks container

### Game Over Logic
When all available pieces have timed out (reached 30 seconds without being placed):
1. Game waits 1 second to allow the notification to be visible
2. Game over is triggered automatically
3. Timeout checking is paused (not stopped) to preserve visual state

## Technical Implementation

### Files Modified

#### 1. `/workspace/src/js/ui/block-palette.js`
**New Properties:**
- `pieceTimeouts`: Map tracking timeout state for each block
- `timeoutCheckInterval`: Interval for checking timeout status
- `WARNING_TIME`: 15000ms (15 seconds)
- `TIMEOUT_TIME`: 30000ms (30 seconds)
- `onPieceTimeout`: Callback for timeout events
- `timeoutPaused`: Flag to pause timeout checking

**New Methods:**
- `resetPieceTimeouts(blocks)`: Initialize timeout tracking for new blocks
- `resetPieceTimeout(blockId)`: Clear timeout for a specific piece when placed
- `startTimeoutChecking()`: Begin the 500ms interval checking
- `stopTimeoutChecking()`: Stop interval and clear all timeout states
- `pauseTimeoutChecking()`: Pause timeout without losing visual state
- `resumeTimeoutChecking()`: Resume timeout with adjusted times
- `checkPieceTimeouts()`: Check all pieces and update their timeout states
- `setPieceTimeoutCallback(callback)`: Set the game's timeout handler
- `showPieceTimeoutNotification()`: Display the floating notification
- `areAllPiecesTimedOut()`: Check if all pieces have timed out

**Integration Points:**
- `updateBlocks()`: Automatically resets piece timeouts when new blocks are generated
- Timeout checking runs every 500ms for smooth animation transitions

#### 2. `/workspace/src/css/main.css`
**New CSS Classes:**
- `.block-item.piece-struggling`: Visual state for 15-second warning
- `.block-item.piece-timed-out`: Visual state for 30-second timeout
- `.floating-piece-timeout`: Floating notification styling

**New Animations:**
- `@keyframes pieceStruggle`: Rotation oscillation animation (0.8s infinite)
- `@keyframes floatUpLong`: Extended float-up animation for timeout notification (3s)

#### 3. `/workspace/src/js/app.js`
**New Method:**
- `handlePieceTimeout(blockId)`: Callback when a piece times out

**Modified Methods:**
- `init()`: Sets up piece timeout callback
- `placeBlock()`: Resets timeout for placed pieces
- `checkGameOver()`: Checks for all-pieces-timed-out condition first
- `gameOver()`: Pauses timeout checking to preserve visual state
- `newGame()`: Stops timeout checking for fresh start

## User Experience Flow

### Normal Gameplay
1. Player receives 3 new blocks
2. Timeout tracking begins immediately
3. Player places blocks within 30 seconds each
4. Timeout resets when blocks are placed or new blocks are generated

### Timeout Scenario
1. Player has blocks available for 15 seconds without placing any
2. Blocks begin to "struggle" (shake/wobble animation)
3. Player still has 15 more seconds to place the blocks
4. At 30 seconds, if still not placed:
   - Block becomes locked with 🔒 icon
   - "Piece Lodged in Place!" notification appears
   - Block is no longer interactive
5. If all blocks time out:
   - Game waits 1 second
   - Game over is triggered

### Game Over State
- Timed-out pieces remain visible with lock icons
- Player can see which pieces caused the timeout
- Starting a new game clears all timeout states

## Configuration

Current timing (can be adjusted in `BlockPalette` constructor):
```javascript
this.WARNING_TIME = 15000;  // 15 seconds - warning animation
this.TIMEOUT_TIME = 30000;  // 30 seconds - piece locked
```

## Benefits

1. **No Infinite States**: Game always progresses to game over if pieces can't be placed
2. **Clear Feedback**: Players understand why pieces are becoming unusable
3. **Fair Warning**: 15-second warning gives players time to act
4. **Visual Clarity**: Locked pieces are clearly distinguished from playable pieces
5. **Cohesive Design**: Uses existing floating notification pattern for consistency

## Future Enhancements (Optional)

1. Make timeout duration configurable per difficulty level
2. Add sound effects at warning and timeout moments
3. Add a visible countdown timer for each piece
4. Different timeout durations based on piece complexity
5. Achievement/badge for never timing out pieces