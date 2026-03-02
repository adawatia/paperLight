// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vite-pwa/nuxt'
  ],
  ssr: false,

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  build: {
    transpile: ['reka-ui', 'pdfjs-dist']
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  pwa: {
    manifest: {
      name: 'PaperLight Reader',
      short_name: 'PaperLight',
      // Match theme_color to app background for a seamless splash screen on mobile.
      // Use a neutral dark value so it works in both light and dark OS modes.
      theme_color: '#0a0a0a',
      background_color: '#0a0a0a',
      description: 'Zero-overhead browser-based EPUB and PDF reader.',
      // Prefer portrait, but allow any orientation
      orientation: 'any',
      // display_override: prefer window-controls-overlay on desktop, standalone elsewhere
      display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
      display: 'standalone',
      start_url: '/',
      scope: '/',
      icons: [
        {
          src: 'pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png'
        },
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: 'maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ],
      // File Handling API (Desktop Native)
      file_handlers: [
        {
          action: '/',
          accept: {
            'application/epub+zip': ['.epub'],
            'application/pdf': ['.pdf']
          }
        }
      ],
      // Share Target API (Mobile Native)
      share_target: {
        action: '/',
        method: 'POST',
        enctype: 'multipart/form-data',
        params: {
          files: [
            {
              name: 'book',
              accept: ['application/epub+zip', 'application/pdf', '.epub', '.pdf']
            }
          ]
        }
      }
    },
    workbox: {
      navigateFallback: '/',
      // Cache all app shell assets including woff2 fonts
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'],
      // Cache Google Fonts stylesheets (stale-while-revalidate)
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    },
    client: {
      installPrompt: true,
      // Check for updates every hour (3600 seconds), not every 20 seconds
      periodicSyncForUpdates: 3600
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module'
    }
  }
})
