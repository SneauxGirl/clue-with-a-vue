<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), {
  label: 'Loading',
})
</script>

<template>
  <div role="status" class="flex items-center gap-3 py-8 text-text-secondary">
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      class="size-6 motion-safe:animate-spin motion-reduce:animate-pulse"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
    </svg>
    <span class="text-lg">{{ label }}</span>
    <span class="sr-only">{{ label }}, please wait.</span>
  </div>
</template>
