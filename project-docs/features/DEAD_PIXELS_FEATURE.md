# Dead Pixels Game Mode Feature

## Overview
The Dead Pixels feature adds a challenging game mode that simulates broken LCD pixels on the game board. These "dead" pixels cannot be used for block placement, adding an extra layer of strategic difficulty to the game.

## Key Features

### 1. Toggle Control
- **Enable/Disable**: Users can turn dead pixels on or off at any time through the settings page
- **Instant Effect**: Changes take effect immediately when toggling
- **No Game Reset Required**: Can be enabled/disabled mid-game

### 2. Intensity Slider (0-5)
- **0**: No dead pixels (off)
- **1**: ~3-5 dead pixels
- **2**: ~6-8 dead pixels
- **3**: ~9-11 dead pixels
- **4**: ~12-14 dead pixels
- **5**: ~15-20 dead pixels (maximum difficulty)

The actual number varies slightly with randomization to add variety.

### 3. Visual Design
Dead pixels are rendered as:
- Background color cells (matching the board background)
- Subtle "X" pattern overlay (light gray, low opacity)
- Clearly distinguishable from normal empty cells

### 4. Gameplay Mechanics
- Dead pixels **block block placement** - you cannot place blocks that would overlap with dead pixels
- Dead pixels **remain in the same position** for the duration of a game
- **New game = new pattern**: Starting a new game generates a fresh random pattern of dead pixels
- **Game over conditions remain the same**: If you run out of valid moves (whether due to dead pixels or not), the game ends

## Technical Implementation

### Files Created
1. `/workspace/src/js/game/dead-pixels-manager.js` - Core logic for managing dead pixels

### Files Modified
1. `/workspace/src/settings.html` - Added UI controls (checkbox + slider)
2. `/workspace/src/js/settings.js` - Added event handlers for dead pixels settings
3. `/workspace/src/js/app.js` - Integrated dead pixels into:
   - Board rendering (drawBoard)
   - Block placement validation (canPlaceBlock)
   - New game initialization (newGame)
   - Settings loading (loadSettings)
   - Game state save/load
4. `/workspace/src/js/storage/game-storage.js` - Added default settings for dead pixels

### State Management
Dead pixels state is:
- **Persisted in game state**: Dead pixel positions are saved with the game
- **Persisted in settings**: Toggle and intensity preferences are saved
- **Restored on reload**: Exact dead pixel positions are maintained when resuming a game

## User Experience

### Settings Page
1. Navigate to Settings → Game Settings
2. Find "Enable dead pixels" checkbox
3. When enabled, an intensity slider appears below
4. Adjust slider from 0-5 to control difficulty
5. Changes apply immediately

### During Gameplay
- Dead pixels appear as slightly darker cells with an X pattern
- Blocks cannot be placed on dead pixels (placement preview shows as invalid)
- Dead pixels do not interfere with clearing lines
- They simply reduce the available board space

## Design Philosophy

### Why "Dead Pixels"?
The feature is themed around the concept of a broken screen with dead pixels, which:
- Provides a visual metaphor that's immediately understandable
- Adds a nostalgic/retro gaming feel
- Makes the challenge feel like overcoming a hardware limitation

### Cohesion Ideas Implemented
1. **Visual Consistency**: Dead pixels use the background color to blend naturally with the board
2. **Non-Intrusive**: The X pattern is subtle and doesn't distract from gameplay
3. **Toggleable**: Players can enable/disable at will without penalty
4. **Scalable Difficulty**: 6 intensity levels allow players to find their preferred challenge
5. **Persistent but Temporary**: Dead pixels stay for one game but reset with each new game

### Future Enhancement Ideas
1. **Dead Pixel Animations**: Could add subtle flicker effect to make them more "broken screen" like
2. **Achievement System**: Track games won with maximum dead pixels
3. **Dead Pixel Patterns**: Instead of random, could have preset patterns (corners, edges, center)
4. **Progressive Dead Pixels**: Dead pixels could appear or disappear during gameplay based on score/time
5. **Repair Mechanism**: Special power-ups or combos could temporarily "fix" dead pixels
6. **Color Variants**: Different themes could have different dead pixel visual styles

## Testing Checklist
- [x] Dead pixels render correctly on the board
- [x] Block placement is correctly blocked by dead pixels
- [x] Toggle enables/disables the feature
- [x] Slider controls intensity (0-5)
- [x] Settings are persisted across sessions
- [x] Game state with dead pixels is saved/restored correctly
- [x] New game generates new random dead pixels
- [x] Game over still occurs when out of moves
- [x] Dead pixels don't interfere with line clearing

## Known Limitations
- Dead pixels are purely random placement (no algorithmic guarantee of game solvability)
- High intensity levels (4-5) can make games significantly harder and shorter
- No visual warning when intensity is very high

## Accessibility Considerations
- The X pattern provides a clear visual indicator beyond just color
- Dead pixels maintain good contrast with the board
- Feature is entirely optional and defaults to off