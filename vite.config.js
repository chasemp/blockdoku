import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

/**
 * BUILD SYSTEM NOTE (read me before changing the build):
 *
 * This Vite config intentionally uses a non-standard layout for this PWA:
 * - root: 'src'                      → development server serves from `src/`
 * - publicDir: '../public'           → public assets live at project-level `public/`
 * - base: './'                       → enables file:// preview and root-level deploys
 * - build.outDir: '../'              → writes production files to the REPO ROOT
 * - build.emptyOutDir: false         → avoids deleting non-build files (e.g., README, .git)
 *
 * Why: The deployed site expects files at the repository root (e.g., GitHub Pages/flat hosting),
 * and the `build-and-deploy.js` script copies/creates additional artifacts at the root.
 *
 * If you switch to a conventional Vite setup (output to `dist/`) or deploy under a sub-path:
 * - Change build.outDir to 'dist'
 * - Update `base` to the site sub-path, e.g., '/blockdoku/' (GitHub Pages), or keep '/' for root
 * - Align VitePWA manifest settings (`start_url`, `scope`) with the chosen base
 * - Remove or rewrite `build-and-deploy.js` which currently assumes root-level output
 * - Update CI/CD to publish the `dist/` directory instead of the repo root
 * Failing to keep these in sync will break installability, offline behavior, or routing.
 */

export default defineConfig({
  // Serve app files from `src/` during development
  root: 'src',
  // Static assets outside the root live in `public/`
  publicDir: '../public',
  // Use relative base to support file:// previews and root-level hosting
  base: './',
  build: {
    // IMPORTANT: Output into the repository root (non-standard)
    // If you change this to 'dist', also update `build-and-deploy.js` and README.
    outDir: '../',
    // Do not empty the repo root on build
    emptyOutDir: false,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        splash: resolve(__dirname, 'src/splash.html'),
        settings: resolve(__dirname, 'src/settings.html'),
        gamesettings: resolve(__dirname, 'src/gamesettings.html'),
        lastgame: resolve(__dirname, 'src/lastgame.html')
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
