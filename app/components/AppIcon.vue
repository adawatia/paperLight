<script setup lang="ts">
const colorMode = useColorMode()
</script>

<template>
  <svg
    viewBox="45 20 130 130"
    xmlns="http://www.w3.org/2000/svg"
    v-bind="$attrs"
    class="app-icon"
  >
    <defs>
      <filter
        id="shadow"
        x="-20%"
        y="-20%"
        width="140%"
        height="140%"
      >
        <feDropShadow
          dx="2"
          dy="4"
          stdDeviation="4"
          flood-opacity="0.1"
        />
      </filter>
    </defs>

    <!-- Document Base with shadow -->
    <path
      d="M70 45 H115 L140 70 V125 C140 127.76 137.76 130 135 130 H75 C72.24 130 70 127.76 70 125 V45Z"
      fill="white"
      stroke="#334155"
      stroke-width="5"
      stroke-linejoin="round"
      filter="url(#shadow)"
    />

    <!-- Folded Corner -->
    <path
      d="M115 45 V65 C115 67.76 117.24 70 120 70 H140 L115 45Z"
      fill="#F8FAFC"
      stroke="#334155"
      stroke-width="5"
      stroke-linejoin="round"
    />

    <!-- Text Lines -->
    <path
      d="M85 85 H125"
      stroke="#94A3B8"
      stroke-width="5"
      stroke-linecap="round"
    />
    <path
      d="M85 105 H110"
      stroke="#94A3B8"
      stroke-width="5"
      stroke-linecap="round"
    />

    <!-- ClientOnly prevents SSR hydration edge cases with useColorMode -->
    <ClientOnly fallback-tag="g">
      <!-- Dark Mode: Moon -->
      <g
        v-if="colorMode.value === 'dark'"
        class="moon-group"
      >
        <path
          d="M152 26 A 14 14 0 1 0 160 52 A 16 16 0 0 1 152 26 Z"
          fill="#93C5FD"
          class="moon-shape"
        />
        <circle
          cx="132"
          cy="22"
          r="1.5"
          fill="#DBEAFE"
          class="star star-1"
        />
        <circle
          cx="168"
          cy="28"
          r="1"
          fill="#DBEAFE"
          class="star star-2"
        />
        <circle
          cx="140"
          cy="58"
          r="2"
          fill="#DBEAFE"
          class="star star-3"
        />
      </g>

      <!-- Light Mode: Sun -->
      <g
        v-else
        class="sun-group"
      >
        <circle
          cx="150"
          cy="40"
          r="11"
          fill="#FBBF24"
        />
        <path
          d="M150 24 v-4 M150 56 v4 M134 40 h-4 M166 40 h4 M139 29 l-3 -3 M161 51 l3 3 M161 29 l3 -3 M139 51 l-3 3"
          stroke="#FBBF24"
          stroke-width="3"
          stroke-linecap="round"
          class="sun-rays"
        />
      </g>

      <!-- SSR Fallback -->
      <template #fallback>
        <circle
          cx="150"
          cy="40"
          r="11"
          fill="transparent"
        />
      </template>
    </ClientOnly>
  </svg>
</template>

<style scoped>
/* Sun animations */
.sun-rays {
  transform-origin: 150px 40px;
  animation: spin-slow 15s linear infinite;
}

/* Moon animations */
.moon-shape {
  transform-origin: 156px 39px;
  animation: rocking 6s ease-in-out infinite;
}

/* Star twinkling animations */
.star-1 { animation: twinkle 3s ease-in-out infinite; transform-origin: 132px 22px; }
.star-2 { animation: twinkle 4s ease-in-out infinite 1s; transform-origin: 168px 28px; }
.star-3 { animation: twinkle 5s ease-in-out infinite 2s; transform-origin: 140px 58px; }

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes rocking {
  0% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
  100% { transform: rotate(-5deg); }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.6); }
  50% { opacity: 1; transform: scale(1.3); }
}
</style>
