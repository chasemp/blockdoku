# Sound Customization Feature

## Overview

The Blockdoku PWA now supports customizable sound effects for different game actions. Users can select from multiple sound presets for each individual sound effect, allowing for a personalized audio experience.

## Features

### Available Sound Presets

Users can choose from the following sound presets:

1. **Default** - The original game sound for each effect
2. **Chime** - Gentle bell-like tone with harmonics
3. **Beep** - Electronic beep sound
4. **Pop** - Quick pop/click sound
5. **Swoosh** - Whoosh/sweep effect
6. **Ding** - High-pitched ding sound
7. **Thud** - Low bass thump
8. **Click** - Sharp click sound

### Customizable Sound Effects

The following game sound effects can be customized:

- **Block Placement** - When placing a block on the board
- **Line Clear** - When clearing lines
- **Level Up** - When advancing to the next level
- **Combo** - When achieving a combo
- **Error** - When an invalid action occurs
- **Button Click** - Button press feedback
- **Block Rotate** - When rotating a block
- **Score Gain** - When earning points
- **Time Warning** - Low time warning
- **Time Critical** - Very low time alert
- **Time Bonus** - Bonus time awarded
- **Hint** - When using a hint
- **Undo** - Undo action
- **Redo** - Redo action
- **Perfect Clear** - Perfect board clear
- **Chain** - Chain combo effect

## How to Use

1. Navigate to **Settings** → **🔊 Sound Effects**
2. For each sound effect, select your preferred preset from the dropdown
3. Click the **🔊 Preview** button to hear how the sound will play
4. Changes are saved automatically
5. Use **Reset All to Default** to restore all sounds to their original state

## Technical Implementation

### Storage

Custom sound mappings are stored in `localStorage` under the key `blockdoku_sound_mappings`. The format is:

```json
{
  "blockPlace": "chime",
  "lineClear": "ding",
  "levelUp": "swoosh",
  ...
}
```

### API

The `SoundManager` class provides the following methods for customization:

- `setCustomSound(soundName, presetId)` - Set a custom sound for an effect
- `getSoundEffects()` - Get list of all customizable sound effects
- `getAvailablePresets()` - Get available sound presets
- `previewSound(presetId)` - Preview a sound preset
- `loadCustomSoundMappings()` - Load saved mappings from storage
- `saveSoundMappings()` - Save mappings to storage

### Mobile/Android Support

This feature works seamlessly on Android devices through:

- Web Audio API support in mobile browsers
- PWA installation support
- Touch-optimized UI for sound selection
- Responsive design for mobile screens

## Browser Compatibility

The sound customization feature uses the Web Audio API and is supported in:

- Chrome/Edge (desktop & Android)
- Firefox (desktop & Android)
- Safari (desktop & iOS)
- Samsung Internet (Android)

## Benefits for Users

1. **Personalization** - Customize the game audio to your preference
2. **Accessibility** - Choose sounds that are easier to distinguish
3. **Variety** - Mix and match different presets for unique combinations
4. **Non-intrusive** - Easy to reset to defaults at any time
5. **Preview** - Test sounds before applying them

## Future Enhancements

Potential future improvements could include:

- Upload custom audio files
- Volume controls per sound effect
- Sound packs/themes
- Community-shared sound configurations
- More preset options