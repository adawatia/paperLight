<template>
  <div class="relative flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-var(--ui-header-height)-var(--ui-footer-height))] py-12">
    <!-- Beautiful subtle radial background gradient -->
    <div class="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,var(--ui-primary)/15%,transparent_50%)] pointer-events-none" />

    <UPageHero
      title="PaperLight"
      description="A distraction-free, browser-based reader designed for those who value speed and simplicity. Built to handle EPUBs and PDFs with zero overhead."
      :ui="{ title: 'text-6xl lg:text-8xl font-extrabold tracking-tight drop-shadow-lg dark:drop-shadow-[0_4px_24px_rgba(255,255,255,0.1)] mb-4', description: 'text-lg lg:text-xl max-w-2xl mx-auto drop-shadow-sm', wrapper: 'flex flex-col items-center text-center' }"
    >
      <template #headline>
        <AppIcon class="w-32 h-32 sm:w-40 sm:h-40 mx-auto drop-shadow-2xl mb-8 transform hover:rotate-3 hover:scale-105 transition-transform duration-500 ease-out" />
      </template>
      <template #links>
        <div class="flex flex-col sm:flex-row justify-center w-full mt-8 gap-5">
          <UButton
            to="https://github.com/adawatia/paperLight"
            target="_blank"
            icon="i-simple-icons-github"
            color="neutral"
            variant="solid"
            size="xl"
            class="rounded-full px-8 py-3 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 justify-center font-medium"
          >
            Follow on GitHub
          </UButton>
        </div>
      </template>
    </UPageHero>
  </div>
</template>
