<script setup lang="ts"></script>

<template>
  <div class="min-h-screen bg-surface">
    <header class="border-b border-surface-border">
      <div class="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <h1 class="text-lg font-semibold text-white">Clue-With-A-Vue</h1>
        <p class="text-xs text-slate-400">IP fraud analysis and abuse event explorer</p>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <slot />
    </main>
  </div>
</template>
