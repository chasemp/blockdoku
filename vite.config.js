import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  base: './',
  build: {
    outDir: '../',
    emptyOutDir: false,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        splash: resolve(__dirname, 'src/splash.html'),
        settings: resolve(__dirname, 'src/settings.html')
      }
    }
  },
  server: {
    port: 8080,
    host: '0.0.0.0'
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
