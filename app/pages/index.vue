<script setup lang="ts">
import { ref, watch } from 'vue'

const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const sharedFile = useState<File | null>('shared-pwa-file')

const processFile = (file?: File | null) => {
  if (!file) return
  selectedFile.value = file
}

// Watch for file injections from the PWA manifest APIs (Desktop Double Clicks / Mobile Share)
watch(sharedFile, (newFile) => {
  if (newFile) {
    processFile(newFile)
    // Optional: consume it so it's not repeatedly opened if they navigate back
    sharedFile.value = null
  }
}, { immediate: true })

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    // Filter out non-epub/pdf drops
    if (file.type === 'application/pdf' || file.type === 'application/epub+zip' || file.name.endsWith('.epub') || file.name.endsWith('.pdf')) {
      processFile(file)
    }
  }
}
</script>

<template>
  <Reader 
    v-if="selectedFile" 
    :file="selectedFile" 
    @close="selectedFile = null" 
  />
  <div 
    v-else
    class="relative flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-var(--ui-header-height)-var(--ui-footer-height))] py-12"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop"
  >
    <!-- Drag Overlay -->
    <div 
      v-if="isDragging"
      class="absolute inset-4 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm border-2 border-primary border-dashed rounded-3xl"
    >
      <div class="flex flex-col items-center pointer-events-none text-center">
        <UIcon name="i-lucide-book-open" class="w-16 h-16 text-primary mb-4 animate-bounce" />
        <h2 class="text-3xl font-bold text-primary">Drop Book Here</h2>
        <p class="text-xl text-muted mt-2">Release your EPUB or PDF file to open</p>
      </div>
    </div>

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
        <div class="flex flex-col items-center w-full mt-12 px-4 max-w-xl mx-auto">
          <!-- Main Dropzone Container -->
          <div 
            class="relative group w-full flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-dashed transition-all duration-300 bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-lg"
            :class="isDragging ? 'border-primary bg-primary/5' : 'border-neutral-300 dark:border-neutral-700 hover:border-primary/50 hover:bg-neutral-50 dark:hover:bg-neutral-900/50'"
          >
            <!-- Native file input covers the entire dropzone -->
            <input 
              type="file" 
              accept=".epub,.pdf,application/epub+zip,application/pdf" 
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              @change="handleFileUpload"
              title="Select EPUB or PDF"
            />
            
            <UIcon 
              name="i-lucide-book-dashed" 
              class="w-12 h-12 mb-4 text-neutral-400 group-hover:text-primary transition-colors duration-300"
              :class="{ 'animate-bounce text-primary': isDragging }"
            />
            
            <h3 class="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
              Drag & Drop your book here
            </h3>
            <p class="text-muted text-center mb-6 max-w-sm">
              Supports .epub and .pdf files. Your files are processed entirely locally in your browser.
            </p>
            
            <UButton
              icon="i-lucide-plus"
              color="primary"
              variant="solid"
              size="lg"
              class="rounded-full px-6 shadow-md group-hover:shadow-xl group-hover:-translate-y-0.5 transition-all duration-300 font-medium pointer-events-none"
            >
              Browse Files
            </UButton>
          </div>
        </div>
      </template>
    </UPageHero>


  </div>
</template>
