// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vite-pwa/nuxt'
  ],

  build: {
    transpile: ['reka-ui', 'pdfjs-dist']
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],



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
      theme_color: '#000000',
      description: 'Zero-overhead browser-based EPUB and PDF reader.',
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
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module'
    }
  }
})
