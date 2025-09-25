# Blockdoku PWA

A Progressive Web App for playing Blockudoku with multiple themes, local storage, and social sharing capabilities.

## Features

- 🎮 **Classic Blockudoku Gameplay**: Combine Sudoku and block placement mechanics
- 🎨 **Multiple Themes**: Light, Dark, and Wood (soft wood tones) modes
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

The built files will be in the `dist/` directory.

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
