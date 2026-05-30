import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    server: {
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/webpush': 'http://127.0.0.1:8000',
    }
  },
  preview: {
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/webpush': 'http://127.0.0.1:8000',
    }
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      includeAssets: ['icons/favicon.svg', 'icons/icon-512.png'],
      manifest: {
        name: 'My Reservation System',
        short_name: 'Reservations',
        description: 'Book and manage your reservations',
        theme_color: '#1a73e8',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        id: '/',                    // ← fixes the App ID note too
        screenshots: [
          {
            src: '/icons/screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'     // ← for desktop
          },
          {
            src: '/icons/screenshot-mobile.png',
            sizes: '720x1280',
            type: 'image/png',
            form_factor: 'narrow'   // ← for mobile
          }
        ],
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      // workbox: {
      //   globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      //   runtimeCaching: [
      //     {
      //       urlPattern: /^https?:\/\/.*\/api\/.*/i,
      //       handler: 'NetworkFirst',
      //       options: {
      //         cacheName: 'api-cache',
      //         expiration: {
      //           maxEntries: 50,
      //           maxAgeSeconds: 300
      //         }
      //       }
      //     }
      //   ]
      // }
    })
  ],
})