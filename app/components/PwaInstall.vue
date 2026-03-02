<script setup lang="ts">
const { $pwa } = useNuxtApp()
</script>

<template>
  <!-- PWA Install Prompt (shown when installPrompt is available) -->
  <Transition name="pwa-slide">
    <div
      v-if="$pwa?.showInstallPrompt && !$pwa?.isPWAInstalled"
      class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-700 shadow-2xl backdrop-blur-md max-w-sm w-[calc(100%-2rem)] text-sm"
      role="banner"
      aria-label="Install PaperLight app"
    >
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <img
          src="/pwa-192x192.png"
          alt="PaperLight Icon"
          class="w-10 h-10 rounded-xl shrink-0"
        >
        <div class="min-w-0">
          <p class="font-semibold text-sm truncate">
            Install PaperLight
          </p>
          <p class="text-xs text-muted truncate">
            Read books offline, anytime.
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          aria-label="Dismiss install prompt"
          @click="$pwa?.cancelInstall()"
        />
        <UButton
          size="sm"
          color="primary"
          variant="solid"
          @click="$pwa?.install()"
        >
          Install
        </UButton>
      </div>
    </div>
  </Transition>

  <!-- PWA Update available notification -->
  <Transition name="pwa-slide">
    <div
      v-if="$pwa?.needRefresh"
      class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-700 shadow-2xl backdrop-blur-md max-w-sm w-[calc(100%-2rem)] text-sm"
      role="status"
      aria-live="polite"
      aria-label="App update available"
    >
      <UIcon
        name="i-lucide-refresh-cw"
        class="w-5 h-5 text-primary shrink-0"
      />
      <p class="flex-1 font-medium">
        Update available!
      </p>
      <div class="flex items-center gap-2 shrink-0">
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          aria-label="Dismiss update"
          @click="$pwa?.cancelPrompt()"
        />
        <UButton
          size="sm"
          color="primary"
          variant="solid"
          @click="$pwa?.updateServiceWorker()"
        >
          Update
        </UButton>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.pwa-slide-enter-active,
.pwa-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pwa-slide-enter-from,
.pwa-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 16px);
}
</style>
