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

    <!-- Upcoming Features Section -->
    <div class="w-full max-w-5xl mx-auto px-4 mt-24 mb-16">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold tracking-tight mb-4">Upcoming Features</h2>
        <p class="text-lg text-muted max-w-2xl mx-auto">We are constantly working to improve PaperLight. Here's what is coming next.</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UCard class="hover:border-(--ui-primary)/50 transition-colors duration-300">
          <div class="flex items-start gap-4">
            <div class="p-3 bg-(--ui-primary)/10 rounded-xl text-primary">
              <UIcon name="i-lucide-book-open" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">EPUB & PDF Support</h3>
              <p class="text-muted">Seamlessly read your favorite EPUBs and PDFs with a custom optimized rendering engine.</p>
            </div>
          </div>
        </UCard>
        
        <UCard class="hover:border-(--ui-primary)/50 transition-colors duration-300">
          <div class="flex items-start gap-4">
            <div class="p-3 bg-(--ui-primary)/10 rounded-xl text-primary">
              <UIcon name="i-lucide-panel-left" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">Book Tree Sidebar</h3>
              <p class="text-muted">Upload a book to instantly view its structure in a sidebar, complete with navigable chapters, headings, and subheadings.</p>
            </div>
          </div>
        </UCard>
        
        <UCard class="hover:border-(--ui-primary)/50 transition-colors duration-300">
          <div class="flex items-start gap-4">
            <div class="p-3 bg-(--ui-primary)/10 rounded-xl text-primary">
              <UIcon name="i-lucide-download" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">Local Install</h3>
              <p class="text-muted">Install the app fully locally using PWA technologies for offline-first capabilities.</p>
            </div>
          </div>
        </UCard>
        
        <UCard class="hover:border-(--ui-primary)/50 transition-colors duration-300">
          <div class="flex items-start gap-4">
            <div class="p-3 bg-(--ui-primary)/10 rounded-xl text-primary">
              <UIcon name="i-lucide-monitor-smartphone" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">Mobile & Desktop Ready</h3>
              <p class="text-muted">A truly responsive design that provides a native-feel experience on any device or screen size.</p>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
