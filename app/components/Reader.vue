<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, shallowRef } from 'vue'
import ePub from 'epubjs'

const props = defineProps<{
  file: File
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const readerContainer = ref<HTMLElement | null>(null)
const book = shallowRef<any>(null)
const rendition = shallowRef<any>(null)

const isSidebarOpen = ref(false) // hidden by default for distraction-free
const isSettingsOpen = ref(false)
const isLoading = ref(true)
const showChrome = ref(true)
const fontSize = ref(100)

const toc = ref<any[]>([])
const currentUrl = ref<string>('')
const isFullscreen = ref(false)
let wakeLock: any = null

const requestWakeLock = async () => {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await (navigator as any).wakeLock.request('screen')
    }
  } catch (err) {
    console.error('WakeLock API not supported/failed', err)
  }
}

const releaseWakeLock = () => {
  if (wakeLock !== null) {
    wakeLock.release()
    wakeLock = null
  }
}

const toggleFullscreen = async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    if (document.exitFullscreen) {
      await document.exitFullscreen()
      isFullscreen.value = false
    }
  }
}

watch(fontSize, (newVal) => {
  if (rendition.value) {
    rendition.value.themes.fontSize(`${newVal}%`)
  }
})

// Load Book
const loadFile = async () => {
  try {
    isLoading.value = true
    showChrome.value = true
    
    const arrayBuffer = await props.file.arrayBuffer()
    
    // Cleanup previous completely if any
    if (book.value) {
      book.value.destroy()
    }
    
    await requestWakeLock()
    
    if (props.file.type === 'application/epub+zip' || props.file.name.endsWith('.epub')) {
      book.value = ePub(arrayBuffer)
      
      rendition.value = book.value.renderTo(readerContainer.value, {
        width: '100%',
        height: '100%',
        spread: 'none',
        manager: 'continuous',
        flow: 'scrolled'
      })
      
      // Inject paper-like typography and constraints
      rendition.value.themes.default({
        'body': {
          'max-width': '75ch', // Optimal reading width
          'margin': '0 auto !important',
          'padding': '3rem 1.5rem !important', // Give breathing room
          'font-family': 'Georgia, "Times New Roman", serif !important',
          'line-height': '1.6 !important',
          'color': 'currentColor'
        },
        'p': {
          'font-size': '1.1rem',
          'line-height': '1.6 !important'
        },
        'h1, h2, h3, h4, h5, h6': {
          'font-family': 'Inter, Roboto, sans-serif !important',
          'margin-top': '2rem',
          'margin-bottom': '1rem',
          'line-height': '1.3 !important'
        }
      })
      
      const savedProgress = window.localStorage.getItem(`paperlight-${props.file.name}-progress`)
      await rendition.value.display(savedProgress || undefined)
      
      // Register touch/click hook on internal iframe to toggle chrome
      rendition.value.hooks.content.register((contents: any) => {
        contents.document.onclick = (e: MouseEvent) => {
          const rect = contents.document.body.getBoundingClientRect()
          const x = e.clientX - rect.left
          const width = rect.width
          
          // Tap in the middle 60% of screen toggles UI
          if (x > width * 0.2 && x < width * 0.8) {
            showChrome.value = !showChrome.value
            if (!showChrome.value) {
              isSidebarOpen.value = false
              isSettingsOpen.value = false
            }
          }
        }
      })
      
      book.value.loaded.navigation.then((nav: any) => {
        toc.value = nav.toc
      })
      
      rendition.value.on('relocated', (location: any) => {
        currentUrl.value = location.start.href
        // Save progress using Canonical Fragment Identifier
        window.localStorage.setItem(`paperlight-${props.file.name}-progress`, location.start.cfi)
      })
      
      isLoading.value = false
    } else {
      console.log('PDF loading to be implemented using pdfjs-dist / iframe')
      // PDF fallback: Create object URL
      if (readerContainer.value) {
        const url = URL.createObjectURL(props.file)
        readerContainer.value.innerHTML = `<iframe src="${url}#toolbar=0" class="w-full h-full border-none"></iframe>`
        isLoading.value = false
      }
    }
  } catch (error) {
    console.error('Error loading file:', error)
    isLoading.value = false
  }
}

watch(() => props.file, loadFile, { immediate: true })

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  releaseWakeLock()
  if (book.value) {
    book.value.destroy()
  }
})

const handleResize = () => {
  if (rendition.value && readerContainer.value) {
    try {
      rendition.value.resize()
    } catch (e) { }
  }
}

const prevPage = () => rendition.value?.prev()
const nextPage = () => rendition.value?.next()
const goTo = (href: string) => rendition.value?.display(href)

</script>

<template>
  <div class="fixed inset-0 z-50 flex bg-white dark:bg-neutral-900 text-foreground overflow-hidden">
    <!-- Calm Loading State -->
    <Transition name="fade">
      <div v-if="isLoading" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-neutral-900 pointer-events-none">
        <AppIcon class="w-20 h-20 animate-pulse text-primary mb-6 drop-shadow-sm" />
        <div class="w-48 h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div class="h-full bg-primary/50 rounded-full animate-progress origin-left"></div>
        </div>
      </div>
    </Transition>

    <!-- Sidebar for Book Tree (Off-canvas) -->
    <Transition name="slide-right">
      <aside 
        v-if="isSidebarOpen && showChrome"
        class="absolute left-0 top-0 bottom-0 w-72 border-r border-border bg-background/95 backdrop-blur-xl shrink-0 flex flex-col z-40 shadow-2xl"
      >
        <div class="h-16 border-b border-border flex items-center justify-between px-4 shrink-0">
          <h3 class="font-semibold truncate pr-2 text-sm">{{ props.file.name }}</h3>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="sm" @click="isSidebarOpen = false" />
        </div>
        <div class="p-4 overflow-y-auto flex-1 custom-scrollbar">
          <h4 class="text-xs font-semibold text-muted mb-4 uppercase tracking-wider">Contents</h4>
          
          <ul class="space-y-1" v-if="toc && toc.length">
            <li v-for="item in toc" :key="item.id">
              <button 
                class="w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-primary/10 transition-colors truncate"
                :class="{ 'bg-primary/15 text-primary font-medium': currentUrl.includes(item.href) }"
                @click="goTo(item.href)"
              >
                {{ item.label }}
              </button>
              <ul v-if="item.subitems && item.subitems.length" class="pl-4 mt-1 space-y-1">
                <li v-for="sub in item.subitems" :key="sub.id">
                  <button 
                    class="w-full text-left px-2 py-1 rounded-md text-xs hover:bg-primary/10 text-muted transition-colors truncate"
                    @click="goTo(sub.href)"
                  >
                    {{ sub.label }}
                  </button>
                </li>
              </ul>
            </li>
          </ul>
          <div v-else class="text-center text-muted text-sm mt-8">
            No table of contents available.
          </div>
        </div>
      </aside>
    </Transition>

    <!-- Main Reader Area -->
    <main class="flex-1 flex flex-col min-w-0 relative">
      <!-- Hidden Chrome Top Bar -->
      <Transition name="slide-down">
        <div 
          v-if="showChrome"
          class="absolute top-0 left-0 right-0 h-16 border-b border-border flex items-center justify-between px-4 sm:px-6 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md z-30 shadow-sm transition-all duration-300"
        >
          <div class="flex items-center gap-3">
            <UButton 
              icon="i-lucide-panel-left" 
              color="neutral" 
              variant="ghost" 
              @click="isSidebarOpen = !isSidebarOpen" 
              aria-label="Toggle Table of Contents"
            />
            <h1 class="text-sm font-medium truncate max-w-[150px] sm:max-w-xs opacity-70 hidden sm:block">
              {{ props.file.name }}
            </h1>
          </div>

          <div class="flex items-center gap-1 sm:gap-2">
            <!-- Fullscreen Toggle -->
            <UButton 
              :icon="isFullscreen ? 'i-lucide-minimize' : 'i-lucide-maximize'" 
              color="neutral" 
              variant="ghost" 
              @click="toggleFullscreen" 
              aria-label="Toggle Fullscreen"
              class="hidden sm:flex"
            />
            
            <!-- Settings Popover -->
            <UPopover v-model:open="isSettingsOpen">
              <UButton icon="i-lucide-settings-2" color="neutral" variant="ghost" aria-label="Reading Settings" />
              <template #content>
                <div class="p-5 w-72 space-y-6">
                  <!-- Font Size -->
                  <div>
                    <div class="text-xs font-semibold text-muted mb-3 uppercase tracking-wider flex justify-between">
                      <span>Font Size</span>
                      <span class="text-primary">{{ fontSize }}%</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <UButton icon="i-lucide-minus" size="sm" color="neutral" variant="soft" :disabled="fontSize <= 50" @click="fontSize -= 10" class="rounded-full" />
                      <div class="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden relative">
                        <div class="absolute left-0 top-0 bottom-0 bg-primary transition-all duration-300" :style="`width: ${(fontSize - 50) / 2}%`"></div>
                      </div>
                      <UButton icon="i-lucide-plus" size="sm" color="neutral" variant="soft" :disabled="fontSize >= 250" @click="fontSize += 10" class="rounded-full" />
                    </div>
                  </div>
                  
                  <!-- Theme Toggle (Uses Nuxt UI's built-in ColorMode) -->
                  <div>
                    <div class="text-xs font-semibold text-muted mb-3 uppercase tracking-wider">Theme</div>
                    <div class="flex justify-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                      <UColorModeButton class="w-full flex justify-center" />
                    </div>
                  </div>
                </div>
              </template>
            </UPopover>

            <UButton icon="i-lucide-chevron-left" color="neutral" variant="ghost" @click="prevPage" aria-label="Previous Page" />
            <UButton icon="i-lucide-chevron-right" color="neutral" variant="ghost" @click="nextPage" aria-label="Next Page" />
            
            <div class="w-px h-6 bg-border mx-2"></div>
            
            <UButton 
              icon="i-lucide-x" 
              color="neutral" 
              variant="ghost" 
              @click="emit('close')" 
              aria-label="Close Book"
            />
          </div>
        </div>
      </Transition>

      <!-- Book Container -->
      <div 
        ref="readerContainer" 
        class="flex-1 w-full overflow-hidden relative reader-view transition-opacity duration-1000 ease-in-out"
        :class="{ 'opacity-0': isLoading, 'opacity-100': !isLoading }"
        @click="showChrome = !showChrome" 
      >
        <!-- Clicking the outer canvas also toggles chrome for safety (PDFs etc) -->
      </div>
    </main>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--ui-border);
  border-radius: 4px;
}
.reader-view :deep(iframe) {
  width: 100% !important;
  height: 100% !important;
  border: none;
  background: transparent;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

@keyframes progress {
  0% { transform: scaleX(0); }
  50% { transform: scaleX(0.7); }
  100% { transform: scaleX(1); }
}
.animate-progress {
  animation: progress 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
</style>
