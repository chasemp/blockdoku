# Blockdoku Scoring and Leveling System

## Overview

The Blockdoku game features a comprehensive scoring system that rewards strategic play through line clearing, combo bonuses, and level progression. The system includes difficulty-based multipliers and detailed tracking of various scoring components.

## Base Scoring System

### Point Values

| Action | Base Points | Description |
|--------|-------------|-------------|
| Single block placement | 1 | Points for placing any block |
| Line clear (row or column) | 15 | Points for completing a full row or column |
| 3x3 square clear | 20 | Points for completing a 3x3 square |
| Combo bonus | 5 | Additional points per extra clear in a combo |

### Scoring Formula

```
Final Score = (Base Points × Current Level × Difficulty Multiplier) + Combo Bonus
```

## Combo System

### Combo Triggers

Combos are activated when **either** of these conditions are met:

1. **Multiple different types** clear simultaneously:
   - Row + Column
   - Row + Square
   - Column + Square
   - Row + Column + Square

2. **Multiple lines of the same type** clear simultaneously:
   - 2+ rows
   - 2+ columns  
   - 2+ squares

### Combo Bonus Calculation

```
Combo Bonus = 5 × (Total Clears - 1)
```

**Example:**
- Clear 2 rows + 1 column + 1 square = 4 total clears
- Combo bonus = 5 × (4-1) = 15 points

## Level Progression System

### Compounding Level Thresholds

The game uses a compounding progression where each level's point range increases by 5%:

| Level | Point Range | Range Size |
|-------|-------------|------------|
| 1 | 0-100 | 100 |
| 2 | 101-206 | 105 |
| 3 | 207-317 | 110 |
| 4 | 318-433 | 116 |
| 5 | 434-554 | 121 |
| 6 | 555-680 | 127 |

**Formula:**
- Level 1 range: 100 points
- Each subsequent level: Previous range × 1.05 (rounded)

### Level Multiplier

Your current level acts as a multiplier for all base points:
- Level 1: 1x multiplier
- Level 2: 2x multiplier
- Level 3: 3x multiplier
- And so on...

## Difficulty System

### Difficulty Levels

| Difficulty | Score Multiplier | Block Sizes | Hints | Block Generation | Special Features |
|------------|------------------|-------------|-------|------------------|------------------|
| **Easy** | 1.5x | 2x2 to 4x4 | ✅ Enabled | 2.0s delay | Visual hints |
| **Normal** | 1.0x | 1x1 to 5x5 | ❌ Disabled | 1.5s delay | Standard gameplay |
| **Hard** | 0.8x | 1x1 to 3x3 | ❌ Disabled | 1.0s delay | Smaller blocks only |
| **Expert** | 0.5x | 1x1 to 4x4 | ❌ Disabled | 0.8s delay | 5min timer, 50 moves |

### Difficulty Impact on Scoring

- **Easy**: 50% bonus points (easier gameplay, more rewards)
- **Normal**: Standard scoring
- **Hard**: 20% penalty (harder gameplay, fewer rewards)
- **Expert**: 50% penalty (expert gameplay, significantly fewer rewards)

## Scoring Examples

### Example 1: Normal Difficulty, Level 3

**Clear:** 2 rows + 1 column + 1 square (combo triggered)

**Calculation:**
- Base line points: (2 + 1) × 15 = 45 points
- Base square points: 1 × 20 = 20 points
- Combo bonus: 5 × (4-1) = 15 points
- **Subtotal:** 80 points
- **Level multiplier:** 80 × 3 = 240 points
- **Difficulty multiplier:** 240 × 1.0 = **240 final points**

### Example 2: Expert Difficulty, Level 5

**Clear:** 1 row + 1 column (combo triggered)

**Calculation:**
- Base line points: (1 + 1) × 15 = 30 points
- Combo bonus: 5 × (2-1) = 5 points
- **Subtotal:** 35 points
- **Level multiplier:** 35 × 5 = 175 points
- **Difficulty multiplier:** 175 × 0.5 = **87 final points**

### Example 3: Easy Difficulty, Level 2

**Clear:** 3 rows (combo triggered)

**Calculation:**
- Base line points: 3 × 15 = 45 points
- Combo bonus: 5 × (3-1) = 10 points
- **Subtotal:** 55 points
- **Level multiplier:** 55 × 2 = 110 points
- **Difficulty multiplier:** 110 × 1.5 = **165 final points**

## Detailed Tracking

The scoring system tracks comprehensive statistics:

### Clear Counters
- Total rows cleared
- Total columns cleared
- Total squares cleared
- Total lines cleared

### Combo Statistics
- Current combo streak
- Maximum combo achieved
- Total combo activations
- Combo modes used

### Points Breakdown
- Points from line clears
- Points from square clears
- Points from combo bonuses

## Strategic Considerations

### Maximizing Score

1. **Aim for combos**: Clear multiple line types simultaneously
2. **Higher levels = more points**: Focus on leveling up through consistent play
3. **Difficulty choice matters**: Easy gives more points but may feel less challenging
4. **Square clears are valuable**: 20 base points vs 15 for lines

### Combo Strategies

1. **Plan multi-type clears**: Set up rows, columns, and squares to clear together
2. **Chain clears**: Use cleared spaces to set up the next combo
3. **Block placement matters**: Position blocks to maximize clear opportunities

## Technical Implementation

### Key Classes

- **ScoringSystem**: Main scoring logic and state management
- **DifficultyManager**: Handles difficulty settings and multipliers
- **BlockManager**: Manages block generation based on difficulty

### Key Methods

- `calculateScoreForClears()`: Pre-calculates score without modifying state
- `applyClears()`: Applies clears and updates scoring state
- `updateLevelFromScore()`: Updates level based on current score
- `getStats()`: Returns comprehensive scoring statistics

## Settings and Customization

The scoring system integrates with the game's settings system, allowing players to:

- Choose difficulty level
- View detailed statistics
- Track high scores per difficulty
- Share score achievements

## Future Considerations

Potential enhancements could include:

- Dynamic difficulty adjustment based on performance
- Additional combo types (e.g., "Perfect Clear" bonuses)
- Achievement system with scoring milestones
- Leaderboards with difficulty-specific rankings