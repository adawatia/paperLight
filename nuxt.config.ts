// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vite-pwa/nuxt'
  ],

  build: {
    transpile: ['reka-ui']
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
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
      theme_color: '#000000',
      description: 'Zero-overhead browser-based EPUB and PDF reader.',
      icons: [
        {
          src: 'favicon.ico',
          sizes: '64x64',
          type: 'image/x-icon'
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
      enabled: false,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module'
    }
  }
})
