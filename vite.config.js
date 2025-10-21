import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

/**
 * BUILD SYSTEM (DEPLOYMENT MODEL):
 *
 * Source → Build → Deploy
 * /src   → /docs → GitHub Pages
 *
 * Development:
 * - root: 'src'                      → dev server serves from /src
 * - publicDir: '../public'           → static assets from /public
 * - Run: npm run dev → http://localhost:3456
 *
 * Production Build:
 * - build.outDir: '../docs'          → builds to /docs directory
 * - build.emptyOutDir: true          → safe to clear /docs (only contains built files)
 * - base: './'                       → enables relative paths for GitHub Pages
 * - Run: npm run build → generates /docs
 *
 * Deployment:
 * - GitHub Pages serves from /docs directory on main branch
 * - /docs contains ONLY generated files (never edit directly!)
 * - See DEPLOYMENT.md for complete workflow
 *
 * ⚠️  CRITICAL: Never edit files in /docs manually - they are auto-generated!
 */

export default defineConfig({
  // Serve app files from `src/` during development
  root: 'src',
  // Static assets outside the root live in `public/`
  publicDir: '../public',
  // Use relative base to support file:// previews and root-level hosting
  base: './',
  build: {
    // Output into /docs directory for GitHub Pages deployment
    // /docs is gitignored on main but committed builds go here
    outDir: '../docs',
    // Safe to empty /docs since it only contains built files
    emptyOutDir: true,
    assetsDir: 'assets',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/index.html'),
          splash: resolve(__dirname, 'src/splash.html'),
          settings: resolve(__dirname, 'src/settings.html'),
          gamesettings: resolve(__dirname, 'src/gamesettings.html'),
          lastgame: resolve(__dirname, 'src/lastgame.html'),
          progress: resolve(__dirname, 'src/progress.html')
        }
      }
  },
  server: {
    port: 3456, // Unique port for Blockdoku PWA to avoid conflicts
    host: '0.0.0.0',
    strictPort: true // Fail if port is in use instead of trying another port
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'Blockdoku',
        short_name: 'Blockdoku',
        description: 'A Progressive Web App for playing Blockudoku with multiple themes and offline support',
        start_url: '/splash.html',
        display: 'standalone',
        background_color: '#2c1810',
        theme_color: '#8d6e63',
        orientation: 'portrait-primary',
        scope: '/',
        lang: 'en',
        dir: 'ltr',
        categories: ['games', 'entertainment', 'puzzle'],
        icons: [
          {
            src: 'icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'New Game',
            short_name: 'New Game',
            description: 'Start a new Blockdoku game',
            url: '/?action=new-game',
            icons: [
              {
                src: 'icons/icon-96x96.png',
                sizes: '96x96',
                type: 'image/png'
              }
            ]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
})
