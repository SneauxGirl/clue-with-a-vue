<script setup lang="ts">
//
</script>

<template>
  <main class="min-h-screen flex items-center justify-center">
    <div class="rounded-lg border border-surface-border bg-surface-raised p-8 text-center">
      <h1 class="text-2xl font-bold text-white">Tailwind v4 check</h1>
      <p class="mt-2 text-sm text-slate-400">
        If this card has a dark panel, rounded corners, and border, Tailwind is loading.
      </p>
      <button
        type="button"
        aria-label="Confirm Tailwind styles are loading"
        class="mt-4 rounded-md bg-risk-low px-4 py-2 text-sm font-medium text-white transition duration-150 ease-out hover:bg-blue-700 active:scale-[0.97] active:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
      >
        Test button
      </button>
    </div>
  </main>
</template>
