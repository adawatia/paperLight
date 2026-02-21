<template>
  <div class="relative flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-var(--ui-header-height)-var(--ui-footer-height))] py-12">
    <!-- Beautiful subtle radial background gradient -->
    <div class="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,var(--ui-primary)/10%,transparent_50%)] pointer-events-none" />

    <UPageHero
      title="PaperLight"
      description="A distraction-free, browser-based reader designed for those who value speed and simplicity. Built to handle EPUBs and PDFs with zero overhead."
      :ui="{ title: 'text-5xl lg:text-7xl font-bold tracking-tight', wrapper: 'flex flex-col items-center text-center' }"
    >
      <template #headline>
        <UBadge variant="subtle" size="lg" class="rounded-full font-medium mb-4">
          ✨ Coming Soon
        </UBadge>
      </template>

      <template #links>
        <div class="flex justify-center w-full mt-2">
          <UButton
            to="https://github.com/adawatia/paperLight"
            target="_blank"
            icon="i-simple-icons-github"
            color="neutral"
            variant="solid"
            size="xl"
            class="rounded-full shadow-sm hover:shadow-md transition-shadow"
          >
            Follow on GitHub
          </UButton>
        </div>
      </template>
    </UPageHero>
  </div>
</template>
