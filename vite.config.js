import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      injectRegister: 'auto',

      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'icon-192.png',
        'icon-512.png',
      ],

      manifest: {
        name: 'Inventario Cuba',
        short_name: 'Inventario',

        description:
          'Gestión de inventario para negocios cubanos al por mayor',

        theme_color: '#2563eb',
        background_color: '#f1f5f9',

        display: 'standalone',

        orientation: 'portrait',

        start_url: '/',

        scope: '/',

        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },

          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },

          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,

            handler: 'CacheFirst',

            options: {
              cacheName: 'google-fonts-cache',

              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,

            handler: 'CacheFirst',

            options: {
              cacheName: 'gstatic-fonts-cache',

              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },

      devOptions: {
        enabled: true,
      },
    }),
  ],
})