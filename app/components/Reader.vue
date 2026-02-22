<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, shallowRef } from 'vue'
import ePub from 'epubjs'
import * as pdfjsLib from 'pdfjs-dist'
import PdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker'

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker()
}

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
const isPdf = ref(false)
const pdfDoc = shallowRef<any>(null)
const pdfCurrentPage = ref(1)
let wakeLock: any = null

// --- Chrome Auto-Hide Timer ---
let chromeHideTimer: ReturnType<typeof setTimeout> | null = null

watch([showChrome, isSettingsOpen, isSidebarOpen], ([chromeOpen, settingsOpen, sidebarOpen]) => {
  if (chromeHideTimer) clearTimeout(chromeHideTimer)
  if (chromeOpen && !settingsOpen && !sidebarOpen) {
    chromeHideTimer = setTimeout(() => {
      showChrome.value = false
    }, 4000)
  }
}, { immediate: true })

const hideChromePreventing = () => {
  if (showChrome.value && !isSettingsOpen.value && !isSidebarOpen.value) {
    showChrome.value = false
  }
}

const clearChromeTimer = () => {
  if (chromeHideTimer) clearTimeout(chromeHideTimer)
}

const startChromeTimer = () => {
  if (showChrome.value && !isSettingsOpen.value && !isSidebarOpen.value) {
    if (chromeHideTimer) clearTimeout(chromeHideTimer)
    chromeHideTimer = setTimeout(() => {
      showChrome.value = false
    }, 4000)
  }
}

// --- Wake Lock ---

const requestWakeLock = async () => {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await (navigator as any).wakeLock.request('screen')
      // Re-acquire the wake lock if the browser releases it on visibility change
      wakeLock.addEventListener('release', () => {
        wakeLock = null
      })
    }
  } catch (err) {
    // Wake Lock may be denied in some situations (battery saver etc.) — not critical
    console.warn('WakeLock request failed:', err)
  }
}

const releaseWakeLock = () => {
  if (wakeLock !== null) {
    try {
      wakeLock.release()
    } catch (_) {
      // Already released by browser
    }
    wakeLock = null
  }
}

// Re-request wake lock when the tab becomes visible again
const handleVisibilityChange = async () => {
  if (document.visibilityState === 'visible' && wakeLock === null && !isLoading.value) {
    await requestWakeLock()
  }
}

// --- Fullscreen ---

const toggleFullscreen = async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      isFullscreen.value = true
    } else {
      await document.exitFullscreen()
      isFullscreen.value = false
    }
  } catch (err) {
    console.warn('Fullscreen toggle failed:', err)
  }
}

// Sync isFullscreen if user exits via Escape key or browser control
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// --- Font Size ---

// Debounce PDF re-render on font size change to avoid rapid redundant renders
let fontSizeDebounceTimer: ReturnType<typeof setTimeout> | null = null

const increaseFontSize = () => {
  fontSize.value = Math.min(250, Number(fontSize.value) + 10)
}

const decreaseFontSize = () => {
  fontSize.value = Math.max(50, Number(fontSize.value) - 10)
}

watch(fontSize, (newVal) => {
  if (isLoading.value) return // Don't re-render while loading

  if (isPdf.value) {
    if (fontSizeDebounceTimer) clearTimeout(fontSizeDebounceTimer)
    fontSizeDebounceTimer = setTimeout(() => {
      renderPdfPage(pdfCurrentPage.value)
    }, 200)
  } else if (rendition.value) {
    rendition.value.themes.fontSize(`${newVal}%`)
  }
})

// --- Storage helpers (SSR-safe) ---

const getStorageKey = (fileName: string) => `paperlight-${fileName}-progress`

const savedProgressGet = (fileName: string): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(getStorageKey(fileName))
  } catch {
    return null
  }
}

const savedProgressSet = (fileName: string, value: string) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(getStorageKey(fileName), value)
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded, etc.)
    console.warn('Could not save reading progress to localStorage.')
  }
}

// --- Load Book ---

let relocatedListener: ((location: any) => void) | null = null

const loadFile = async () => {
  try {
    isLoading.value = true
    showChrome.value = true

    // --- Cleanup previous state ---
    if (rendition.value) {
      // Remove the previously attached relocated listener to avoid leaks
      if (relocatedListener) {
        try { rendition.value.off('relocated', relocatedListener) } catch (_) {}
        relocatedListener = null
      }
    }
    if (book.value) {
      try { book.value.destroy() } catch (_) {}
      book.value = null
      rendition.value = null
    }
    if (pdfDoc.value) {
      try { pdfDoc.value.destroy() } catch (_) {}
      pdfDoc.value = null
    }
    // Clear the reader container DOM (e.g. old PDF canvas or epub iframe)
    if (readerContainer.value) {
      readerContainer.value.innerHTML = ''
    }
    toc.value = []
    currentUrl.value = ''
    isPdf.value = false

    const arrayBuffer = await props.file.arrayBuffer()

    await requestWakeLock()

    if (props.file.type === 'application/pdf' || props.file.name.endsWith('.pdf')) {
      isPdf.value = true

      const typedArray = new Uint8Array(arrayBuffer)

      const cMapUrl = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`
      const standardFontDataUrl = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`

      const loadingTask = pdfjsLib.getDocument({
        data: typedArray,
        cMapUrl,
        cMapPacked: true,
        standardFontDataUrl
      })

      try {
        pdfDoc.value = await loadingTask.promise
      } catch (err) {
        console.error('Failed to parse PDF document.', err)
        isLoading.value = false
        return
      }

      const savedPage = savedProgressGet(props.file.name)
      const parsedPage = savedPage ? parseInt(savedPage, 10) : NaN
      // Clamp to valid page range
      pdfCurrentPage.value = (!isNaN(parsedPage) && parsedPage >= 1 && parsedPage <= pdfDoc.value.numPages)
        ? parsedPage
        : 1

      await renderPdfPage(pdfCurrentPage.value)
      isLoading.value = false
    } else if (props.file.type === 'application/epub+zip' || props.file.name.endsWith('.epub')) {
      isPdf.value = false
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
          'padding': '0 2rem !important',
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

      const savedProgress = savedProgressGet(props.file.name)
      await rendition.value.display(savedProgress || undefined)

      // Register touch/click hook on internal iframe to toggle chrome
      rendition.value.hooks.content.register((contents: any) => {
        contents.document.addEventListener('scroll', () => {
          hideChromePreventing()
        }, { passive: true })

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
        toc.value = nav.toc ?? []
      }).catch((err: any) => {
        console.warn('Could not load table of contents:', err)
        toc.value = []
      })

      // Store listener ref so we can remove it if the file changes
      relocatedListener = (location: any) => {
        if (location?.start?.href) {
          currentUrl.value = location.start.href
        }
        if (location?.start?.cfi) {
          savedProgressSet(props.file.name, location.start.cfi)
        }
      }
      rendition.value.on('relocated', relocatedListener)

      isLoading.value = false
    } else {
      console.warn('Unsupported file format.')
      isLoading.value = false
    }
  } catch (error) {
    console.error('Error loading file:', error)
    isLoading.value = false
  }
}

watch(() => props.file, loadFile, { immediate: true })

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeyDown)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('visibilitychange', handleVisibilityChange)

  if (fontSizeDebounceTimer) clearTimeout(fontSizeDebounceTimer)
  if (chromeHideTimer) clearTimeout(chromeHideTimer)

  releaseWakeLock()

  if (rendition.value && relocatedListener) {
    try { rendition.value.off('relocated', relocatedListener) } catch (_) {}
  }
  if (book.value) {
    try { book.value.destroy() } catch (_) {}
  }
  if (pdfDoc.value) {
    try { pdfDoc.value.destroy() } catch (_) {}
  }
})

// --- Keyboard Navigation ---

const handleKeyDown = (e: KeyboardEvent) => {
  // Don't hijack keyboard shortcuts if the user is typing in an input
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
  // Also ignore if a contenteditable element is focused
  if ((e.target as HTMLElement)?.isContentEditable) return

  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    nextPage()
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    prevPage()
  } else if (e.key === 'Escape' && isSidebarOpen.value) {
    isSidebarOpen.value = false
  }
}

// --- Touch / Swipe ---

const touchStartX = ref(0)
const touchStartY = ref(0)
const touchEndX = ref(0)
const touchEndY = ref(0)

const handleTouchStart = (e: TouchEvent) => {
  if (e.changedTouches && e.changedTouches[0]) {
    touchStartX.value = e.changedTouches[0].screenX
    touchStartY.value = e.changedTouches[0].screenY
  }
}

const handleTouchEnd = (e: TouchEvent) => {
  if (e.changedTouches && e.changedTouches[0]) {
    touchEndX.value = e.changedTouches[0].screenX
    touchEndY.value = e.changedTouches[0].screenY
    handleSwipe()
  }
}

const handleSwipe = () => {
  const swipeThresholdX = 50
  const dx = touchEndX.value - touchStartX.value
  const dy = touchEndY.value - touchStartY.value

  // Only treat gesture as horizontal swipe if it's more horizontal than vertical
  if (Math.abs(dx) < swipeThresholdX || Math.abs(dx) < Math.abs(dy)) return

  if (dx < 0) {
    nextPage()
  } else {
    prevPage()
  }
}

// --- Resize ---

const handleResize = () => {
  if (rendition.value && readerContainer.value) {
    try {
      rendition.value.resize()
    } catch (_) {}
  } else if (isPdf.value && pdfDoc.value && !isLoading.value) {
    // Re-render current PDF page at new size
    if (fontSizeDebounceTimer) clearTimeout(fontSizeDebounceTimer)
    fontSizeDebounceTimer = setTimeout(() => {
      renderPdfPage(pdfCurrentPage.value)
    }, 150)
  }
}

// --- PDF Rendering ---

const renderPdfPage = async (pageNumber: number) => {
  if (!pdfDoc.value || !readerContainer.value) return

  // Clamp pageNumber to valid range
  const clampedPage = Math.max(1, Math.min(pageNumber, pdfDoc.value.numPages))
  if (clampedPage !== pageNumber) {
    pdfCurrentPage.value = clampedPage
    pageNumber = clampedPage
  }

  let page: any
  try {
    page = await pdfDoc.value.getPage(pageNumber)
  } catch (err) {
    console.error(`Failed to get PDF page ${pageNumber}:`, err)
    return
  }

  let canvas = readerContainer.value.querySelector<HTMLCanvasElement>('canvas')
  if (!canvas) {
    readerContainer.value.innerHTML = ''
    canvas = document.createElement('canvas')
    canvas.className = 'w-full h-auto bg-white m-auto shadow-sm transition-all pdf-canvas'
    readerContainer.value.appendChild(canvas)
    readerContainer.value.style.overflowY = 'auto'
  }

  const containerWidth = readerContainer.value.clientWidth > 0 ? readerContainer.value.clientWidth : 800
  const unscaledViewport = page.getViewport({ scale: 1 })

  // Fix: calculate scale correctly — multiply by fontSize ratio, don't floor at 2
  const scale = Math.max(0.5, (containerWidth / unscaledViewport.width) * (fontSize.value / 100))

  const viewport = page.getViewport({ scale })
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    console.error('Failed to get 2D canvas context for PDF rendering.')
    return
  }

  // Handle high-DPI (retina) screens for crispness
  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.floor(viewport.width * dpr)
  canvas.height = Math.floor(viewport.height * dpr)
  canvas.style.width = `${Math.floor(viewport.width)}px`
  canvas.style.height = `${Math.floor(viewport.height)}px`
  ctx.scale(dpr, dpr)

  try {
    await page.render({ canvasContext: ctx, viewport }).promise
  } catch (err) {
    console.error('PDF page render failed:', err)
    return
  }

  currentUrl.value = `Page ${pageNumber} of ${pdfDoc.value.numPages}`
  readerContainer.value.scrollTo(0, 0)
}

// --- Navigation ---

const prevPage = async () => {
  if (isPdf.value) {
    if (pdfCurrentPage.value > 1) {
      pdfCurrentPage.value--
      await renderPdfPage(pdfCurrentPage.value)
      savedProgressSet(props.file.name, pdfCurrentPage.value.toString())
    }
  } else {
    rendition.value?.prev()
  }
}

const nextPage = async () => {
  if (isPdf.value) {
    if (pdfDoc.value && pdfCurrentPage.value < pdfDoc.value.numPages) {
      pdfCurrentPage.value++
      await renderPdfPage(pdfCurrentPage.value)
      savedProgressSet(props.file.name, pdfCurrentPage.value.toString())
    }
  } else {
    rendition.value?.next()
  }
}

const goTo = async (href: string) => {
  if (!href) return
  if (!isPdf.value && rendition.value) {
    try {
      await rendition.value.display(href)
      // Hide the chrome and sidebar on smaller screens after jumping to a chapter
      if (window.innerWidth < 1024) {
        showChrome.value = false
        isSidebarOpen.value = false
        isSettingsOpen.value = false
      }
    } catch (err) {
      console.warn('Could not navigate to toc href:', err)
    }
  }
}

// Stable key generator for TOC items (avoids Math.random() churn)
const tocItemKey = (item: any, index: number) => item.id || item.href || `toc-${index}`
const subItemKey = (sub: any, index: number) => sub.id || sub.href || `sub-${index}`
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex bg-white dark:bg-neutral-900 text-foreground overflow-hidden"
    @touchstart.passive="handleTouchStart"
    @touchend.passive="handleTouchEnd"
  >
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
        v-if="isSidebarOpen"
        class="fixed left-0 top-0 bottom-0 w-72 border-r border-border bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shrink-0 flex flex-col z-[100] shadow-2xl"
      >
        <div class="h-16 border-b border-border flex items-center justify-between px-4 shrink-0">
          <h3 class="font-semibold truncate pr-2 text-sm">{{ props.file.name }}</h3>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="sm" aria-label="Close sidebar" @click="isSidebarOpen = false" />
        </div>
        <div class="p-4 overflow-y-auto flex-1 custom-scrollbar">
          <h4 class="text-xs font-semibold text-muted mb-4 uppercase tracking-wider">Contents</h4>

          <ul v-if="toc && toc.length" class="space-y-1">
            <li v-for="(item, idx) in toc" :key="tocItemKey(item, idx)">
              <button
                class="w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-primary/10 transition-colors truncate"
                :class="{ 'bg-primary/15 text-primary font-medium': currentUrl && item.href && currentUrl.includes(item.href) }"
                @click="goTo(item.href)"
              >
                {{ item.label }}
              </button>
              <ul v-if="item.subitems && item.subitems.length" class="pl-4 mt-1 space-y-1">
                <li v-for="(sub, subIdx) in item.subitems" :key="subItemKey(sub, subIdx)">
                  <button
                    class="w-full text-left px-2 py-1 rounded-md text-xs hover:bg-primary/10 text-muted transition-colors truncate"
                    :class="{ 'bg-primary/15 text-primary font-medium': currentUrl && sub.href && currentUrl.includes(sub.href) }"
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
      <!-- Unified Bottom Floating Nav -->
      <Transition name="slide-responsive">
        <div
          v-if="showChrome"
          class="absolute z-50 bottom-6 left-1/2 -translate-x-1/2 w-max max-w-[calc(100%-2rem)] h-14 border border-border rounded-full flex items-center justify-center px-3 sm:px-6 gap-1 sm:gap-2 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-2xl transition-all duration-300 ring-1 ring-black/5 dark:ring-white/10"
          @mouseenter="clearChromeTimer"
          @mouseleave="startChromeTimer"
        >
          <UButton
            icon="i-lucide-panel-left"
            color="neutral"
            variant="ghost"
            aria-label="Table of Contents"
            @click="isSidebarOpen = !isSidebarOpen"
          />

          <div class="h-6 w-px bg-border mx-1"></div>

          <!-- Prev/Next Navigation -->
          <UButton icon="i-lucide-chevron-left" color="neutral" variant="ghost" aria-label="Previous Page" @click="prevPage" />
          <UButton icon="i-lucide-chevron-right" color="neutral" variant="ghost" aria-label="Next Page" @click="nextPage" />

          <div class="h-6 w-px bg-border mx-1 hidden sm:block"></div>

          <!-- Desktop Title (Hidden on mobile to save space) -->
          <h1 class="text-sm font-medium truncate max-w-[150px] opacity-70 hidden sm:block mx-2">
            {{ props.file.name }}
          </h1>

          <div class="h-6 w-px bg-border mx-1"></div>

          <!-- Settings Popover -->
          <UPopover v-model:open="isSettingsOpen">
            <UButton icon="i-lucide-settings" color="neutral" variant="ghost" aria-label="Reading Settings" />
            <template #content>
              <div class="p-5 w-72 space-y-6">
                <!-- Font Size -->
                <div>
                  <div class="text-xs font-semibold text-muted mb-3 uppercase tracking-wider flex justify-between">
                    <span>Font Size</span>
                    <span class="text-primary">{{ fontSize }}%</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <UButton icon="i-lucide-minus" size="sm" color="neutral" variant="soft" :disabled="fontSize <= 50" class="rounded-full" @click="decreaseFontSize" />
                    <div class="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden relative">
                      <div class="absolute left-0 top-0 bottom-0 bg-primary transition-all duration-300" :style="`width: ${(Number(fontSize) - 50) / 2}%`"></div>
                    </div>
                    <UButton icon="i-lucide-plus" size="sm" color="neutral" variant="soft" :disabled="fontSize >= 250" class="rounded-full" @click="increaseFontSize" />
                  </div>
                </div>

                <!-- Theme Toggle -->
                <div>
                  <div class="text-xs font-semibold text-muted mb-3 uppercase tracking-wider">Theme</div>
                  <div class="flex justify-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                    <UColorModeButton class="w-full flex justify-center" />
                  </div>
                </div>
              </div>
            </template>
          </UPopover>

          <UButton
            :icon="isFullscreen ? 'i-lucide-minimize' : 'i-lucide-maximize'"
            color="neutral"
            variant="ghost"
            aria-label="Toggle Fullscreen"
            class="hidden sm:flex"
            @click="toggleFullscreen"
          />

          <div class="h-6 w-px bg-border mx-1"></div>

          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            aria-label="Close Book"
            @click="emit('close')"
          />
        </div>
      </Transition>

      <!-- Book Container -->
      <div
        class="flex-1 w-full flex justify-center overflow-hidden transition-opacity duration-1000 ease-in-out"
        :class="{ 'opacity-0': isLoading, 'opacity-100': !isLoading }"
      >
        <div
          ref="readerContainer"
          class="w-full max-w-[800px] h-full overflow-y-auto relative reader-view pb-24"
          @click="isPdf ? (showChrome = !showChrome) : undefined"
          @scroll="hideChromePreventing"
        >
          <!-- For PDFs, clicking the canvas toggles chrome. EPUBs use the iframe click hook. -->
        </div>
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

/* Enable simple dark mode for PDFs if wrapped in a pdf-canvas */
html.dark .pdf-canvas {
  filter: invert(1) hue-rotate(180deg);
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

/* Responsive Slide Transition for Chrome Navigation */
.slide-responsive-enter-active,
.slide-responsive-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-responsive-enter-from,
.slide-responsive-leave-to {
  transform: translateY(150%);
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
