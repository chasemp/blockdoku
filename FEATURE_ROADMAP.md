# Blockdoku Feature Roadmap

## 🎯 Phase 1: Core UX Improvements (Foundation)
*Priority: High | Timeline: 2-3 weeks*

### 1.1 Visual Enhancements
- [ ] **Block Preview on Board**
  - Ghost outline of selected block when hovering over valid positions
  - Theme-appropriate colors for preview
- [ ] **Theme-Appropriate Placement Hints**
  - Green = good fit (plenty of space)
  - Yellow = tight fit (limited future options)
  - Red = invalid placement
  - Respect current theme colors

### 1.2 Quality of Life
- [ ] **Auto-Rotate Smart Placement**
  - Automatically rotate blocks when there's only one valid orientation
  - Setting to enable/disable this feature
- [ ] **Efficiency Metrics**
  - Add "Points per Piece" to lastgame.html stats
  - Track and display efficiency trends

### 1.3 Animation Improvements
- [ ] **Cascade Effect for Multiple Line Clears**
  - Satisfying sequential clearing animation
  - Enhanced particle effects for combos
  - Sound effects to match

---

## 🎮 Phase 2: Game Modes & Special Mechanics
*Priority: High | Timeline: 3-4 weeks*

### 2.1 Zen Mode (Standalone Game Mode)
- [ ] **Core Zen Features**
  - No scoring pressure (optional score display)
  - Infinite undo functionality
  - Relaxing ambient background sounds/music
  - Slower, more meditative pace
- [ ] **Zen Mode Integration**
  - Separate game mode selection (conflicts with other modes)
  - Special Zen-themed UI elements
  - Save/load Zen game state separately

### 2.2 Wild Block Shapes System
- [ ] **Novel Block Shapes**
  - Create library of unusual/creative block shapes
  - Pentominos, hexominos, irregular shapes
  - Cross shapes, hollow shapes, zigzag patterns
- [ ] **Wild Shapes Setting**
  - Toggle in game settings
  - Default enabled for Expert difficulty
  - Difficulty-based shape complexity

### 2.3 Block Customization
- [ ] **Visual Block Styles**
  - Rounded corners option
  - Different border styles (sharp, soft, neon)
  - Block texture options (solid, gradient, pattern)

---

## ⚡ Phase 3: Power-ups & Special Blocks
*Priority: Medium | Timeline: 4-5 weeks*

### 3.1 Special Block Types
- [ ] **Wild Blocks**
  - Rare blocks that clear entire line when placed
  - Visual indicator (sparkle effect, special color)
  - Spawn rate based on difficulty/performance
- [ ] **Bomb Blocks**
  - Clear surrounding 3x3 area when placed
  - Dramatic explosion animation
  - Strategic placement considerations
- [ ] **Ghost Blocks**
  - Can overlap existing pieces once per game
  - Translucent appearance
  - Limited use adds strategic depth

### 3.2 Power-up Integration
- [ ] **Power-up Game Mode**
  - Optional mode that enables special blocks
  - Can combine with other modes (except Zen)
  - Separate scoring/stats tracking
- [ ] **Power-up Settings**
  - Frequency controls (rare, normal, frequent)
  - Individual power-up enable/disable
  - Difficulty-based availability

---

## 🌐 Phase 4: Sharing & Social Features
*Priority: Medium | Timeline: 3-4 weeks*

### 4.1 Board State Sharing
- [ ] **Puzzle Sharing System**
  - Generate shareable codes for interesting board states
  - "Try to beat my score from this position" challenges
  - URL-based sharing (blockdoku.523.life/puzzle/ABC123)
- [ ] **Share Implementation**
  - Compress board state + available blocks into short code
  - Decode and load shared puzzles
  - Challenge completion tracking

### 4.2 Enhanced Sharing
- [ ] **Screenshot Integration**
  - Auto-generate beautiful game state screenshots
  - Include stats overlay on shared images
  - Social media optimized formats

---

## 📊 Phase 5: Advanced Features & Polish
*Priority: Low | Timeline: 2-3 weeks*

### 5.1 Advanced Analytics
- [ ] **Heat Map Visualization**
  - Show where blocks are placed most often
  - Identify playing patterns and preferences
  - Help players improve strategy

### 5.2 Accessibility & Customization
- [ ] **Enhanced Accessibility**
  - High contrast mode
  - Colorblind-friendly palettes
  - Sound cues for important events
- [ ] **Advanced Customization**
  - Custom color theme creator
  - Grid line opacity controls
  - Animation speed fine-tuning

---

## 🔧 Technical Considerations

### Architecture Changes Needed
1. **Game Mode System Refactor**
   - Abstract game modes into separate classes
   - Mode-specific settings and rules
   - Prevent conflicting mode combinations

2. **Special Blocks Framework**
   - Extend BlockManager for special block types
   - New block behavior system
   - Animation and effect integration

3. **Sharing Infrastructure**
   - Board state serialization/compression
   - URL routing for shared puzzles
   - Challenge validation system

### Settings Integration
- New "Game Modes" section in settings
- Power-ups subsection under Game Modes
- Visual customization in existing themes section
- Quality of life features in utility bar section

### Backward Compatibility
- All new features optional/toggleable
- Existing save games remain functional
- Progressive enhancement approach

---

## 🚀 Implementation Priority

**Phase 1** should be implemented first as it provides immediate UX improvements that benefit all users.

**Phase 2** builds the foundation for more complex features and introduces the most requested gameplay enhancements.

**Phase 3** adds the exciting special mechanics that will differentiate the game.

**Phase 4** focuses on community and sharing features.

**Phase 5** adds polish and advanced features for power users.

Each phase can be developed and released independently, allowing for user feedback and iteration.
