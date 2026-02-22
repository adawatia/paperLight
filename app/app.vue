<script setup lang="ts">
import { onMounted } from 'vue'

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
    { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon-180x180.png' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

// Setup global state for passing files captured from PWA or Share targets
const sharedFile = useState<File | null>('shared-pwa-file', () => null)

onMounted(() => {
  // Handle PWA File Handlers (Desktop double-click)
  if ('launchQueue' in window) {
    ;(window as any).launchQueue.setConsumer(async (launchParams: any) => {
      if (!launchParams.files || !launchParams.files.length) return
      for (const handle of launchParams.files) {
        const file = await handle.getFile()
        if (file.type === 'application/pdf' || file.name.endsWith('.epub') || file.name.endsWith('.pdf')) {
          sharedFile.value = file
          break
        }
      }
    })
  }

  // Quick fallback check if a service worker dropped a file into indexedDB for share_target (mobile)
  // Usually share_target POST needs a specific route, but we'll prepare the hook state here
})

import pkg from '../package.json'

const title = 'PaperLight'
const description = 'Paperlight is a distraction-free, browser-based reader designed for those who value speed and simplicity. Built to handle EPUBs and PDFs with zero overhead.'
const version = pkg.version

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: '/social-card.png',
  twitterImage: '/social-card.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <UHeader :toggle="false">
      <template #left>
        <NuxtLink to="/">
          <AppLogo class="w-auto h-6 shrink-0" />
        </NuxtLink>
      </template>

      <template #right>
        <UColorModeButton />

        <UButton
          to="https://github.com/adawatia"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub Profile"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          PaperLight v{{ version }} • © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <p class="text-sm text-muted flex items-center gap-1">
          Made with <UIcon
            name="i-lucide-heart"
            class="w-4 h-4 text-red-500 dark:text-red-400"
          /> by adawatia and AI
        </p>
      </template>
    </UFooter>
  </UApp>
</template>
