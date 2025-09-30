# Testing the Piece Timeout System

## Quick Test Instructions

### Normal Testing (30-second timeout)
1. Start the game
2. Don't place any pieces for 15 seconds
   - Observe: Pieces should start "struggling" (shaking animation)
3. Continue waiting until 30 seconds
   - Observe: Pieces should become locked with 🔒 icon
   - Observe: "Piece Lodged in Place!" notification should appear
4. Wait for all pieces to timeout
   - Observe: Game over should trigger after ~1 second

### Fast Testing (for development)
To test quickly, temporarily modify the timeout values in `block-palette.js`:

```javascript
// In constructor, change these lines:
this.WARNING_TIME = 3000;  // 3 seconds instead of 15
this.TIMEOUT_TIME = 6000;  // 6 seconds instead of 30
```

Then:
1. Start the game
2. Wait 3 seconds - pieces should start struggling
3. Wait 6 seconds - pieces should lock
4. Game over should trigger shortly after

**Remember to change the values back to 15000 and 30000 after testing!**

## What to Look For

### Visual States
✅ **0-15s**: Normal state
- Pieces are fully colored and interactive
- No special animations

✅ **15s**: Warning state
- Pieces shake/wobble (pieceStruggle animation)
- Slightly brighter and more saturated
- Still interactive

✅ **30s**: Locked state
- Pieces become grayscale
- 🔒 icon appears centered
- Opacity reduced to 50%
- Cursor changes to "not-allowed"
- Cannot interact with pieces

✅ **Floating notification**
- Appears centered over block palette
- Red text: "Piece Lodged in Place!"
- Dark background with red border
- Floats upward and fades out over 3 seconds

### Game Logic
✅ **Piece placement resets timeout**
- Place a piece before timeout
- Timeout tracking should reset for that piece

✅ **New blocks reset all timeouts**
- Place all 3 pieces
- New blocks should have fresh 30-second timer

✅ **Game over detection**
- When all pieces timeout, game over triggers
- Game over modal appears
- Pieces remain visible in locked state

✅ **New game clears timeouts**
- Start new game after timeout-based game over
- All pieces should be in normal state
- Fresh 30-second timers begin

## Edge Cases to Test

1. **Partial timeout**: 
   - Let 1-2 pieces timeout, but place the others
   - New blocks should all start fresh

2. **Quick placement**:
   - Place all pieces within 5 seconds
   - No struggling or timeout should occur

3. **Mixed timing**:
   - Place one piece at 10s, another at 20s, another at 25s
   - Timeouts should be independent per piece

4. **Game over from no moves**:
   - Fill board so no moves are possible
   - Traditional game over should still work
   - Timeout system shouldn't interfere

## Browser Compatibility
Test in multiple browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari (if available)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Checks
- Timeout checking runs every 500ms
- Should not cause lag or performance issues
- Animations should be smooth
- No memory leaks from intervals

## Cleanup Verification
✅ Interval is cleared on:
- New game
- Game over
- Navigation away from game

✅ Visual states are cleared on:
- New game
- New blocks generated

## Common Issues and Solutions

### Issue: Pieces don't lock at 30s
**Check**: Is the interval running? Console should show logs when pieces timeout.

### Issue: Animation is choppy
**Check**: Is the browser throttling intervals? Try in a different browser.

### Issue: Game doesn't end when all pieces timeout
**Check**: `areAllPiecesTimedOut()` logic. Verify all pieces are tracked.

### Issue: Floating notification doesn't appear
**Check**: DOM positioning. Notification should be added to document.body.

### Issue: Timeout continues after game over
**Check**: `pauseTimeoutChecking()` is called in `gameOver()`.