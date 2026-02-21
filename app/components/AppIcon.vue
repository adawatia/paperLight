<script setup lang="ts">
const colorMode = useColorMode()
</script>

<template>
  <svg viewBox="45 20 130 130" xmlns="http://www.w3.org/2000/svg" v-bind="$attrs">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="4" stdDeviation="4" flood-opacity="0.1" />
      </filter>
    </defs>

    <!-- Document Base with shadow -->
    <path d="M70 45 H115 L140 70 V125 C140 127.76 137.76 130 135 130 H75 C72.24 130 70 127.76 70 125 V45Z" fill="white" stroke="#334155" stroke-width="5" stroke-linejoin="round" filter="url(#shadow)"/>
    
    <!-- Folded Corner -->
    <path d="M115 45 V65 C115 67.76 117.24 70 120 70 H140 L115 45Z" fill="#F8FAFC" stroke="#334155" stroke-width="5" stroke-linejoin="round"/>
    
    <!-- Text Lines -->
    <path d="M85 85 H125" stroke="#94A3B8" stroke-width="5" stroke-linecap="round"/>
    <path d="M85 105 H110" stroke="#94A3B8" stroke-width="5" stroke-linecap="round"/>
    
    <!-- Dark Mode: Moon -->
    <g v-if="colorMode.value === 'dark'">
      <path d="M152 26 A 14 14 0 1 0 160 52 A 16 16 0 0 1 152 26 Z" fill="#93C5FD"/>
      <!-- Add some subtle stars for the moon -->
      <circle cx="132" cy="22" r="1.5" fill="#DBEAFE" />
      <circle cx="168" cy="28" r="1" fill="#DBEAFE" />
      <circle cx="140" cy="58" r="2" fill="#DBEAFE" />
    </g>

    <!-- Light Mode: Sun -->
    <g v-else>
      <circle cx="150" cy="40" r="11" fill="#FBBF24"/>
      <path d="M150 24 v-4 M150 56 v4 M134 40 h-4 M166 40 h4 M139 29 l-3 -3 M161 51 l3 3 M161 29 l3 -3 M139 51 l-3 3" stroke="#FBBF24" stroke-width="3" stroke-linecap="round"/>
    </g>
  </svg>
</template>
