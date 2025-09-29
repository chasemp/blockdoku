# Blockdoku PWA

A Progressive Web App for playing Blockudoku with multiple themes, local storage, and social sharing capabilities.

## Features

- 🎮 **Classic Blockudoku Gameplay**: Combine Sudoku and block placement mechanics
- 🎨 **Multiple Themes**: Light, Dark, and Wood (soft wood tones) modes
- 🔊 **Sound Customization**: Choose from 8 presets for each of 16 sound effects
- 💾 **Local Storage**: Game history and high scores saved locally
- 📱 **PWA Support**: Installable on mobile and desktop devices
- 🎯 **Difficulty Levels**: Adjustable game difficulty
- 📤 **Score Sharing**: Share achievements on social media
- 🌐 **Offline Play**: Full functionality without internet connection

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5 Canvas, CSS3
- **PWA**: Service Worker, Web App Manifest
- **Storage**: LocalStorage API
- **Sharing**: Web Share API + Social Media APIs
- **Build**: Vite for optimization and bundling

> Build system note: This project intentionally uses a non-standard Vite output layout to deploy from the repository root. See the build section below before changing any build settings.

## Development Status

This project is currently in **Phase 1: Foundation**. See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for detailed development milestones and progress.

### Current Milestones
- [x] Project setup and repository initialization
- [x] Technology stack validation planning
- [x] Basic project structure creation
- [ ] Minimal Viable Test (MVT) implementation
- [ ] Core game engine development

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd blockdoku_pwa
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

Important:
- The current Vite config outputs production files into the repository root (not `dist/`).
- This is by design to support simple/static hosting where the site is served from the repo root.
- Build metadata is generated before and after the build by `scripts/generate-build-info.js`, which writes `build-info.json` (used by the UI) and a plain-text `build` file for CI/support.

If you prefer a conventional `dist/` output:
- In `vite.config.js`, set `build.outDir` to `dist` and adjust `base` as needed (e.g., `/your-subpath/` for GitHub Pages).
- Remove or update `build-and-deploy.js`, which currently assumes root-level output and performs additional copying/creation of PWA assets.
- Ensure `build-info.json` and the `build` file are published with the site (either via copying them into `dist/` during build or by serving from the same directory).
- Update your hosting/CI to deploy the `dist/` directory instead of the repo root.

Dev/Preview notes:
- Dev server runs at `http://localhost:3456` (see `vite.config.js`).
- `base` is set to `./` to allow `file://` previews and root-level hosting. If you change hosting to a sub-path, update both `base` and the PWA manifest `start_url`/`scope` accordingly (configured via `vite-plugin-pwa`).

## Project Structure

```
blockdoku_pwa/
├── src/                    # Source code
│   ├── js/                # JavaScript modules
│   │   ├── game/          # Game logic
│   │   ├── ui/            # User interface
│   │   ├── storage/       # Data persistence
│   │   └── sharing/       # Social sharing
│   ├── css/               # Stylesheets
│   │   └── themes/        # Theme definitions
│   ├── assets/            # Game assets
│   └── index.html         # Main HTML file
├── public/                # Static assets
├── docs/                  # Documentation
├── tests/                 # Test files
└── PROJECT_PLAN.md        # Detailed development plan
```

## Sound Customization

The app features a comprehensive sound customization system that allows users to personalize each of the 16 game sound effects. 

### Available Presets
- **Default** - Original game sounds
- **Chime** - Gentle bell-like tones
- **Beep** - Electronic beeps
- **Pop** - Quick pop sounds
- **Swoosh** - Whoosh effects
- **Ding** - High-pitched dings
- **Thud** - Low bass thumps
- **Click** - Sharp click sounds

### Customizable Effects
All 16 sound effects can be customized including block placement, line clears, combos, level ups, timer warnings, and UI interactions.

**Documentation:**
- [Sound Customization Overview](./SOUND_CUSTOMIZATION.md)
- [User Guide](./USER_GUIDE_SOUND_CUSTOMIZATION.md)
- [Implementation Notes](./IMPLEMENTATION_NOTES.md)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## References

- [Blokie - AI Blockudoku Engine](https://github.com/gary-z/blokie)
- [Blockudoku++ - C++ Implementation](https://github.com/CosminPerRam/Blockudokuplusplus)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
