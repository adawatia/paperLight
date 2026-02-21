<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'PaperLight'
const description = 'Paperlight is a distraction-free, browser-based reader designed for those who value speed and simplicity. Built to handle EPUBs and PDFs with zero overhead.'
import pkg from '../package.json'
const version = pkg.version

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
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
